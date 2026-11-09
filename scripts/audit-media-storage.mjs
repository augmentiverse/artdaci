/**
 * ARTDACI — read-only inventory of Cloudflare-hosted media declared by the
 * artwork manifests. No network requests, uploads or object mutations.
 *
 * This is a manifest inventory, NOT a Cloudflare bucket listing. External
 * objects absent from the manifests and remote availability are not audited.
 */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { resolveMediaAsset } from "./artwork-media-manifest-core.mjs";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const CATALOG = new URL("../content/media-manifests/catalog.json", import.meta.url);
const FAMILIES = ["images", "audio", "videos", "models", "ar"];

function walkMedia(node, family, key = "", out = []) {
  if (!node || typeof node !== "object" || Array.isArray(node)) return out;
  if (Object.prototype.hasOwnProperty.call(node, "available")) {
    out.push({ family, key, asset: node });
    return out;
  }
  for (const [name, child] of Object.entries(node)) {
    walkMedia(child, family, key ? key + "." + name : name, out);
  }
  return out;
}

export function summarizeMediaManifests(manifests) {
  if (!Array.isArray(manifests)) throw new TypeError("Expected an array of artwork manifests");
  const records = [];
  for (const manifest of manifests) {
    if (!manifest || typeof manifest.id !== "string") throw new TypeError("Missing manifest ID");
    for (const family of FAMILIES) {
      const entries = walkMedia(manifest.media?.[family], family);
      for (const {key, asset} of entries) {
        if (typeof asset.available !== "boolean") throw new TypeError("Missing media availability");
        const record = {
          artworkId: manifest.id,
          family,
          key,
          scope: asset.scope ?? "artwork",
          migrationStatus: asset.migrationStatus,
          available: asset.available,
          bytes: Number.isSafeInteger(asset.bytes) && asset.bytes >= 0 ? asset.bytes : null,
          url: asset.available ? resolveMediaAsset(manifest, asset) : null,
        };
        records.push(record);
      }
    }
  }

  const published = records.filter((entry) => entry.available);
  const missingRecordedSizes = published.filter((entry) => entry.bytes === null);
  const uniquePublishedObjects = new Map();
  for (const entry of published) {
    if (!uniquePublishedObjects.has(entry.url)) uniquePublishedObjects.set(entry.url, entry);
  }
  const unique = [...uniquePublishedObjects.values()];
  const declaredBytes = unique.reduce((sum, entry) => sum + (entry.bytes ?? 0), 0);
  const byFamily = Object.fromEntries(FAMILIES.map((family) => [family, {
    declared: records.filter((entry) => entry.family === family).length,
    available: published.filter((entry) => entry.family === family).length,
    knownBytes: unique.filter((entry) => entry.family === family)
      .reduce((sum, entry) => sum + (entry.bytes ?? 0), 0),
  }]));

  return {
    provider: "Cloudflare R2 via media.artdaci.com (manifest declarations)",
    artworkManifestCount: manifests.length,
    assetReferenceCount: records.length,
    declaredAvailableCount: published.length,
    unavailableOrPlannedCount: records.length - published.length,
    uniqueAvailableObjectCount: unique.length,
    knownPublishedBytes: declaredBytes,
    publishedWithoutSizeCount: missingRecordedSizes.length,
    byFamily,
    declaredRemoteAvailabilityVerified: false,
    note: "The inventory reads GitHub manifest declarations only. It does not list Cloudflare buckets, test HTTP accessibility, measure transfer, or include media outside these manifests.",
    records,
  };
}

export async function inventoryDeclaredCloudflareMedia() {
  const catalog = JSON.parse(await readFile(CATALOG, "utf8"));
  const registered = catalog.artworks.filter((item) =>
    item.manifest?.status === "source-ready" && typeof item.manifest.path === "string");
  const manifests = await Promise.all(registered.map(async (entry) => {
    const path = entry.manifest.path;
    if (path.startsWith("/") || path.includes("..") || path.includes("\\"))
      throw new Error("Invalid manifest path: " + path);
    const url = new URL("../content/media-manifests/" + path, import.meta.url);
    const document = JSON.parse(await readFile(url, "utf8"));
    if (document.id !== entry.id) throw new Error("Manifest artwork ID mismatch: " + path);
    return document;
  }));
  return summarizeMediaManifests(manifests);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  inventoryDeclaredCloudflareMedia()
    .then((report) => {
      if (process.argv.includes("--json")) {
        console.log(JSON.stringify(report, null, 2));
      } else {
        console.log("Cloudflare R2 manifest inventory — declarations, not live verification");
        console.log(report.artworkManifestCount + " artwork manifests; " +
          report.declaredAvailableCount + " available media references of " +
          report.assetReferenceCount + " registered; " +
          report.uniqueAvailableObjectCount + " unique published URLs.");
        console.log("Known media bytes: " +
          (report.knownPublishedBytes / (1024 * 1024)).toFixed(2) +
          " MiB; " + report.publishedWithoutSizeCount + " published references lack a byte count.");
        for (const [family, data] of Object.entries(report.byFamily)) {
          console.log(family + ": " + data.available + "/" + data.declared +
            " available; " + (data.knownBytes / (1024 * 1024)).toFixed(2) + " MiB recorded.");
        }
        console.log(report.note);
      }
    })
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
}
