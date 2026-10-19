/**
 * ARTDACI VG01 Orsay 1889 publication readiness.
 * Usage:
 *   node scripts/check-vg01-orsay-media.mjs           (offline plan check)
 *   node scripts/check-vg01-orsay-media.mjs --remote  (public R2 GET, SHA-256, MIME, CORS)
 *
 * Never uploads to R2, edits a media manifest, or changes available/published flags.
 */
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const readinessPath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../docs/production/migrations/vg01-orsay-1889-readiness.json",
);

const expected = new Map([
  ["images.main", { mimeType: "image/webp", extension: ".webp", family: "images" }],
  ["models.portrait", { mimeType: "model/gltf-binary", extension: ".glb", family: "models" }],
  ["ar.target", { mimeType: "application/octet-stream", extension: ".mind", family: "ar" }],
]);

function ensure(condition, description) {
  if (!condition) throw new Error(description);
}

export function validateOrsayReadiness(plan) {
  ensure(plan?.schemaVersion === "1.0" && plan.artworkId === "vg01", "Not a VG01 1889 readiness plan");
  ensure(plan.status === "awaiting-r2-verification", "Preparation status changed; review this gate before continuing");
  ensure(plan.mediaBaseUrl === "https://media.artdaci.com/artworks/vg01/", "Unexpected R2 host or artwork path");
  ensure(Array.isArray(plan.media) && plan.media.length === 3, "Expected exactly three Orsay media");
  const usedRoles = new Set(), usedPaths = new Set(), out = [];
  for (const asset of plan.media) {
    const rule = expected.get(asset.role);
    ensure(rule && !usedRoles.has(asset.role), "Unexpected or duplicate media role: " + asset.role);
    ensure(!usedPaths.has(asset.path), "Duplicate R2 object key: " + asset.path);
    ensure(asset.available === false && asset.migrationStatus === "planned",
      "Unverified media MUST stay available:false and planned");
    ensure(typeof asset.sourceFilename === "string" && asset.sourceFilename.endsWith(rule.extension),
      "Invalid local filename for " + asset.role);
    ensure(asset.mimeType === rule.mimeType, "Wrong expected MIME for " + asset.role);
    ensure(Number.isSafeInteger(asset.bytes) && asset.bytes > 1000 && asset.bytes < 20_000_000,
      "Unexpected media length for " + asset.role);
    ensure(typeof asset.sha256 === "string" && /^[a-f0-9]{64}$/.test(asset.sha256),
      "Missing/invalid SHA-256 for " + asset.role);
    ensure(typeof asset.path === "string" &&
      new RegExp("^" + rule.family + "/[a-z0-9][a-z0-9.-]*[a-z0-9]$", "u").test(asset.path) &&
      asset.path.endsWith(rule.extension) && asset.path.includes("orsay-1889"),
      "Unsafe or unversioned R2 key for " + asset.role);
    usedRoles.add(asset.role);
    usedPaths.add(asset.path);
    out.push({ ...asset, url: new URL(asset.path, plan.mediaBaseUrl).href });
  }
  ensure(usedRoles.size === expected.size, "The 1889 media trio is incomplete");
  return out;
}

export async function verifyRemoteOrsayAsset(asset, {
  fetchImpl = fetch,
  origin = "https://artdaci.com",
  timeoutMs = 30000,
} = {}) {
  const response = await fetchImpl(asset.url, {
    method: "GET",
    headers: { Origin: origin, "Cache-Control": "no-cache" },
    redirect: "error",
    signal: AbortSignal.timeout(timeoutMs),
  });
  ensure(response.ok, asset.role + ": HTTP " + response.status + " at " + asset.url);
  const mime = (response.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
  ensure(mime === asset.mimeType, asset.role + ": wrong MIME " + mime);
  const cors = response.headers.get("access-control-allow-origin");
  ensure(cors === "*" || cors === origin, asset.role + ": CORS disallows " + origin);
  ensure(response.body, asset.role + ": missing response body");
  const sha = createHash("sha256");
  let count = 0;
  for await (const bytes of response.body) {
    count += bytes.byteLength;
    ensure(count <= asset.bytes, asset.role + ": downloaded more bytes than expected");
    sha.update(bytes);
  }
  ensure(count === asset.bytes, asset.role + ": length mismatch " + count + " !== " + asset.bytes);
  const digest = sha.digest("hex");
  ensure(digest === asset.sha256, asset.role + ": SHA-256 mismatch (" + digest + ")");
  return { role: asset.role, bytes: count, sha256: digest, mimeType: mime, cors, url: asset.url };
}

export async function runReadiness(args = process.argv.slice(2)) {
  ensure(args.every(arg => arg === "--remote"), "Only the optional --remote flag is supported");
  const plan = JSON.parse(await readFile(readinessPath, "utf8"));
  const assets = validateOrsayReadiness(plan);
  console.log("VG01 Orsay 1889: 3 proposed immutable assets; none is activated in a live manifest.");
  for (const asset of assets) console.log(asset.role + " " + asset.bytes + " B " + asset.url);
  if (args.includes("--remote")) {
    const verified = [];
    for (const asset of assets) {
      verified.push(await verifyRemoteOrsayAsset(asset));
      console.log("Verified R2: " + asset.role);
    }
    console.log("Remote verification passed: " + verified.length + "/3. Manual approval is STILL required.");
  } else {
    console.log("Offline preparation passed. Remote R2 media NOT checked.");
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runReadiness().catch(error => {
    console.error("VG01 NOT READY:", error.message);
    process.exitCode = 1;
  });
}
