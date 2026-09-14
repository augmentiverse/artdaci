import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { resolveArtworkAudioOverview } from "../scripts/artwork-media-manifest.js?leonardo-audio-test";

const root = new URL("../", import.meta.url);
const catalog = JSON.parse(await readFile(new URL("content/media-manifests/catalog.json", root), "utf8"));
const expected = {
  ld03: {
    slug: "the-last-supper",
    bytes: { en: 1562049, fr: 1516909, ar: 2068616 },
    sha256: {
      en: "d8aecaa18aa4e9d0044b3850d46d1276466d0172f0f9288d9b4c0d76afa29a47",
      fr: "20e46834e5d7f9b0fb9e400e5cf289bc07c39ea5c30c5e701f1c181fd08491d9",
      ar: "7af9655343434b2122d96d0926005ab13ba6f3b6de90778f755fc260527840c1",
    },
  },
  ld06: {
    slug: "la-belle-ferronniere",
    bytes: { en: 1649820, fr: 1615548, ar: 1858800 },
    sha256: {
      en: "edea15919e9e4f5423aa3357c356f2c68c020a0fd1dbdb536b14429c55e3b645",
      fr: "5cfaffe79a589a1c00259da89d92d0bab1a1d06c471a239a31c5cb049ea9d9af",
      ar: "15d9b6223b989702671972d47916f6f1177fb9143b222de5e1eca07950dbee67",
    },
  },
};

for (const [id, details] of Object.entries(expected)) {
  test(`${id} publishes its three verified audio overviews`, async () => {
    const manifest = JSON.parse(await readFile(
      new URL(`content/media-manifests/artworks/${id}/manifest.json`, root),
      "utf8",
    ));

    assert.equal(manifest.id, id);
    assert.equal(manifest.slug, details.slug);
    assert.equal(manifest.mediaBaseUrl, `https://media.artdaci.com/artworks/${id}/`);
    assert.equal(manifest.cachePolicy, "no-store");
    assert.deepEqual(Object.keys(manifest.media.audio.overview), ["en", "fr", "ar"]);

    for (const language of ["en", "fr", "ar"]) {
      const asset = manifest.media.audio.overview[language];
      assert.deepEqual(
        {
          scope: asset.scope,
          path: asset.path,
          mimeType: asset.mimeType,
          available: asset.available,
          migrationStatus: asset.migrationStatus,
          bytes: asset.bytes,
          sha256: asset.sha256,
          language: asset.language,
        },
        {
          scope: "artwork",
          path: `audio/${language}/overview.mp3`,
          mimeType: "audio/mpeg",
          available: true,
          migrationStatus: "published",
          bytes: details.bytes[language],
          sha256: details.sha256[language],
          language,
        },
      );

      assert.equal(
        await resolveArtworkAudioOverview({
          artworkId: id,
          language,
          fetchManifest: async () => manifest,
        }),
        `https://media.artdaci.com/artworks/${id}/audio/${language}/overview.mp3`,
      );
    }
  });
}

test("the catalog exposes only the canonical ld03 and ld06 manifest paths", () => {
  for (const id of Object.keys(expected)) {
    const artwork = catalog.artworks.find((entry) => entry.id === id);
    assert.deepEqual(artwork.manifest, {
      status: "source-ready",
      path: `artworks/${id}/manifest.json`,
    });
  }
});
