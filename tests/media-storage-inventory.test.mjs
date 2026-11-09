import assert from "node:assert/strict";
import test from "node:test";
import {
  inventoryDeclaredCloudflareMedia,
  summarizeMediaManifests,
} from "../scripts/audit-media-storage.mjs";

const base = (id) => ({
  id,
  mediaBaseUrl: "https://media.artdaci.com/artworks/" + id + "/",
  sharedMediaBaseUrl: "https://media.artdaci.com/shared/",
});

test("Cloudflare inventory distinguishes published, planned, size-known and distinct assets", () => {
  const first = {
    ...base("ld01"), media: {
      images: { main: { scope: "artwork", path: "images/main.webp",
        available: true, migrationStatus: "published", bytes: 1500 } },
      audio: { en: { scope: "artwork", path: "audio/en.mp3",
        available: false, migrationStatus: "planned" } },
    },
  };
  const second = {
    ...base("ld02"), media: {
      images: { cover: { scope: "shared", path: "images/cover.webp",
        available: true, migrationStatus: "published" } },
    },
  };
  const report = summarizeMediaManifests([first, second]);
  assert.equal(report.artworkManifestCount, 2);
  assert.equal(report.assetReferenceCount, 3);
  assert.equal(report.declaredAvailableCount, 2);
  assert.equal(report.unavailableOrPlannedCount, 1);
  assert.equal(report.knownPublishedBytes, 1500);
  assert.equal(report.publishedWithoutSizeCount, 1);
  assert.equal(report.byFamily.audio.available, 0);
  assert.equal(report.byFamily.images.available, 2);
  assert.equal(report.declaredRemoteAvailabilityVerified, false);
  assert.ok(report.records.some((entry) => entry.url === "https://media.artdaci.com/shared/images/cover.webp"));
  assert.ok(report.records.some((entry) => entry.family === "audio" && entry.url === null));
});

test("repository references Cloudflare-hosted media by its canonical manifest structure", async () => {
  const report = await inventoryDeclaredCloudflareMedia();
  assert.equal(report.artworkManifestCount, 24);
  assert.ok(report.assetReferenceCount >= 90);
  assert.ok(report.declaredAvailableCount >= 60);
  assert.ok(report.knownPublishedBytes > 200 * 1024 * 1024);
  assert.ok(report.byFamily.audio.available > 0);
  assert.ok(report.byFamily.models.available > 0);
  assert.ok(report.byFamily.ar.available > 0);
  assert.ok(report.records.filter((entry) => entry.available)
    .every((entry) => entry.url?.startsWith("https://media.artdaci.com/")));
});
