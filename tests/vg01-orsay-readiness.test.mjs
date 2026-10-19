import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import {
  readinessPath,
  validateOrsayReadiness,
  verifyRemoteOrsayAsset,
} from "../scripts/check-vg01-orsay-media.mjs";

const plan = JSON.parse(await readFile(readinessPath, "utf8"));
const clone = () => structuredClone(plan);

test("VG01 1889 preparation requires three immutable unpublished R2 objects", () => {
  const assets = validateOrsayReadiness(plan);
  assert.deepEqual(assets.map(a => a.role), ["images.main", "models.portrait", "ar.target"]);
  assert.deepEqual(assets.map(a => a.bytes), [267520, 3198048, 980862]);
  assert.equal(assets.reduce((sum, a) => sum + a.bytes, 0), 4446430);
  for (const asset of assets) {
    assert.equal(asset.available, false);
    assert.equal(asset.migrationStatus, "planned");
    assert.match(asset.url, /^https:\/\/media\.artdaci\.com\/artworks\/vg01\//);
    assert.match(asset.path, /orsay-1889/);
  }
});

test("publishing flags must not be enabled before remote byte-level verification", () => {
  const altered = clone();
  altered.media[0].available = true;
  altered.media[0].migrationStatus = "published";
  assert.throws(() => validateOrsayReadiness(altered), /available:false/);
});

test("reject mismatched, duplicate and unsafe R2 keys", () => {
  const duplicated = clone();
  duplicated.media[1].path = duplicated.media[0].path;
  assert.throws(() => validateOrsayReadiness(duplicated), /Duplicate|Unsafe/);
  const unsafe = clone();
  unsafe.media[2].path = "ar/../images/1887.mind";
  assert.throws(() => validateOrsayReadiness(unsafe), /Unsafe or unversioned/);
  const altered = clone();
  altered.media[1].sha256 = "bad";
  assert.throws(() => validateOrsayReadiness(altered), /SHA-256/);
});

test("remote readiness requires 200, exact MIME, browser CORS, byte count and SHA-256", async () => {
  const bytes = new TextEncoder().encode("ARTDACI Orsay test bytes");
  const hash = createHash("sha256").update(bytes).digest("hex");
  const media = {
    role: "images.main",
    url: "https://media.artdaci.com/artworks/vg01/images/test.webp",
    bytes: bytes.byteLength,
    sha256: hash,
    mimeType: "image/webp",
  };
  const response = (data = bytes, overrides = {}) => new Response(data, {
    status: overrides.status ?? 200,
    headers: {
      "content-type": overrides.mime ?? "image/webp",
      ...(overrides.cors === null ? {} : { "access-control-allow-origin": overrides.cors ?? "*" }),
    },
  });
  const ok = await verifyRemoteOrsayAsset(media, { fetchImpl: async () => response() });
  assert.equal(ok.sha256, hash);
  assert.equal(ok.bytes, bytes.byteLength);
  await assert.rejects(
    verifyRemoteOrsayAsset(media, { fetchImpl: async () => response(bytes, { status: 404 }) }),
    /HTTP 404/,
  );
  await assert.rejects(
    verifyRemoteOrsayAsset(media, { fetchImpl: async () => response(bytes, { mime: "image/jpeg" }) }),
    /MIME/,
  );
  await assert.rejects(
    verifyRemoteOrsayAsset(media, { fetchImpl: async () => response(bytes, { cors: null }) }),
    /CORS/,
  );
  await assert.rejects(
    verifyRemoteOrsayAsset(media, { fetchImpl: async () => response(new TextEncoder().encode("wrong")) }),
    /length mismatch|bytes/,
  );
  await assert.rejects(
    verifyRemoteOrsayAsset({ ...media, sha256: "f".repeat(64) }, { fetchImpl: async () => response() }),
    /SHA-256 mismatch/,
  );
});
