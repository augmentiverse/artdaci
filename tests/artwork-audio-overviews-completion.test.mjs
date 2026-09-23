import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { resolveArtworkAudioOverview } from "../scripts/artwork-media-manifest.js?completion-test";

const root = new URL("../", import.meta.url);
const migration = JSON.parse(await readFile(
  new URL("docs/production/migrations/artwork-audio-overviews-completion-r2.json", root),
  "utf8",
));
const catalog = JSON.parse(await readFile(
  new URL("content/media-manifests/catalog.json", root),
  "utf8",
));
const [catalogueScript, printScript, galleryScript] = await Promise.all([
  readFile(new URL("scripts/catalogue.js", root), "utf8"),
  readFile(new URL("scripts/print-artwork.js", root), "utf8"),
  readFile(new URL("scripts/gallery-vr.js", root), "utf8"),
]);
const artworkIds = [...new Set(migration.resources.map(({ artworkId }) => artworkId))];
const manifests = new Map(await Promise.all(artworkIds.map(async (id) => [
  id,
  JSON.parse(await readFile(
    new URL("content/media-manifests/artworks/" + id + "/manifest.json", root),
    "utf8",
  )),
])));

test("the completion map publishes 44 unique exact-language audio overviews", () => {
  assert.equal(migration.status, "published");
  assert.equal(migration.resources.length, 44);
  assert.equal(new Set(migration.resources.map(({ destination }) => destination)).size, 44);
  assert.equal(migration.resources.filter(({ mimeType }) => mimeType === "audio/mpeg").length, 41);
  assert.equal(migration.resources.filter(({ mimeType }) => mimeType === "audio/mp4").length, 3);
  assert.equal(migration.resources.reduce((sum, { bytes }) => sum + bytes, 0), 82101991);
});

test("every migrated overview is published and resolves to its canonical R2 URL", async () => {
  for (const resource of migration.resources) {
    const manifest = manifests.get(resource.artworkId);
    const asset = manifest.media.audio.overview[resource.language];
    assert.equal(asset.available, true, resource.destination);
    assert.equal(asset.migrationStatus, "published", resource.destination);
    assert.equal(asset.scope, "artwork", resource.destination);
    assert.equal(asset.mimeType, resource.mimeType, resource.destination);
    assert.equal(asset.bytes, resource.bytes, resource.destination);
    assert.equal(asset.sha256, resource.sha256, resource.destination);
    assert.equal(
      await resolveArtworkAudioOverview({
        artworkId: resource.artworkId,
        language: resource.language,
        fetchManifest: async () => manifest,
      }),
      "https://media.artdaci.com/" + resource.destination,
    );
  }
});

test("catalog and the three audio consumers cover all 24 canonical artworks", () => {
  const active = catalog.artworks.filter(({ status }) => status === "active");
  const dedicatedPrintPages = new Set(["ld01", "ve01", "vg01", "vg02", "mo01"]);
  assert.equal(active.length, 24);
  for (const artwork of active) {
    assert.deepEqual(artwork.manifest, {
      status: "source-ready",
      path: "artworks/" + artwork.id + "/manifest.json",
    });
    const mappedId = '": "' + artwork.id + '"';
    assert.ok(catalogueScript.includes(mappedId), artwork.id);
    if (!dedicatedPrintPages.has(artwork.id)) {
      assert.ok(printScript.includes(mappedId), artwork.id);
    }
    assert.ok(galleryScript.includes('artworkId: "' + artwork.id + '"'), artwork.id);
  }
});

test("the genuinely missing Arabic Bedroom overview stays unavailable", async () => {
  const manifest = JSON.parse(await readFile(
    new URL("content/media-manifests/artworks/vg02/manifest.json", root),
    "utf8",
  ));
  assert.equal(await resolveArtworkAudioOverview({
    artworkId: "vg02",
    language: "ar",
    fetchManifest: async () => manifest,
  }), null);
});
