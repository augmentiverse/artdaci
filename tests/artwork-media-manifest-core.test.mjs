import test from "node:test";
import assert from "node:assert/strict";

import {
  normalizeLanguage,
  resolveAvailableMedia,
  resolveManifestMedia,
  resolveMediaAsset,
  selectMediaAsset,
} from "../scripts/artwork-media-manifest-core.mjs";

function asset(overrides = {}) {
  return {
    scope: "artwork",
    path: "images/main.png",
    mimeType: "image/png",
    available: true,
    ...overrides,
  };
}

test("resolves artwork media against mediaBaseUrl", () => {
  const manifest = {
    mediaBaseUrl: "https://media.artdaci.com/artworks/ve01/",
    media: { images: { main: asset() } },
  };

  assert.equal(
    resolveManifestMedia(manifest, "images.main", "en"),
    "https://media.artdaci.com/artworks/ve01/images/main.png",
  );
});

test("resolves shared media inside its normal media family", () => {
  const manifest = {
    mediaBaseUrl: "https://media.artdaci.com/artworks/ve01/",
    sharedMediaBaseUrl: "https://media.artdaci.com/shared/",
    media: {
      models: {
        gallery: asset({
          scope: "shared",
          path: "models/environments/gallery/main.glb",
          mimeType: "model/gltf-binary",
        }),
      },
    },
  };

  assert.equal(
    resolveManifestMedia(manifest, "models.gallery", "en"),
    "https://media.artdaci.com/shared/models/environments/gallery/main.glb",
  );
});

test("keeps schema 1.0 compatibility by defaulting missing scope to artwork", () => {
  assert.equal(
    resolveAvailableMedia(
      "https://media.artdaci.com/artworks/ld01/",
      { path: "images/main.png", mimeType: "image/png", available: true },
    ),
    "https://media.artdaci.com/artworks/ld01/images/main.png",
  );
});

test("normalizes language tags and selects the primary language", () => {
  const manifest = {
    defaultLanguage: "en",
    media: {
      audio: {
        guide: {
          en: asset({ path: "audio/en/guide.mp3", mimeType: "audio/mpeg" }),
          fr: asset({ path: "audio/fr/guide.mp3", mimeType: "audio/mpeg" }),
        },
      },
    },
  };

  assert.equal(normalizeLanguage(" FR_ca "), "fr-ca");
  assert.equal(selectMediaAsset(manifest, "audio.guide", "fr-CA").path, "audio/fr/guide.mp3");
});

test("selects a language from the flat audio map used by schema 1.0", () => {
  const manifest = {
    mediaBaseUrl: "https://media.artdaci.com/artworks/ld01/",
    media: {
      audio: {
        en: { path: "audio/en.mp3", mimeType: "audio/mpeg", available: false },
        fr: { path: "audio/fr.mp3", mimeType: "audio/mpeg", available: true },
      },
    },
  };

  assert.equal(
    resolveManifestMedia(manifest, "audio", "fr-FR"),
    "https://media.artdaci.com/artworks/ld01/audio/fr.mp3",
  );
});

test("uses defaultLanguage only when the requested language key is absent", () => {
  const manifest = {
    defaultLanguage: "en",
    media: {
      audio: {
        guide: {
          en: asset({ path: "audio/en/guide.mp3", mimeType: "audio/mpeg" }),
        },
      },
    },
  };

  assert.equal(selectMediaAsset(manifest, "audio.guide", "de").path, "audio/en/guide.mp3");
});

test("does not fall back when the requested language exists but is unavailable", () => {
  const manifest = {
    defaultLanguage: "en",
    mediaBaseUrl: "https://media.artdaci.com/artworks/ve01/",
    media: {
      audio: {
        guide: {
          fr: asset({ path: "audio/fr/guide.mp3", available: false }),
          en: asset({ path: "audio/en/guide.mp3" }),
        },
      },
    },
  };

  assert.equal(resolveManifestMedia(manifest, "audio.guide", "fr"), null);
});

test("available false short-circuits before any base URL is read", () => {
  let baseWasRead = false;
  const manifest = {
    get sharedMediaBaseUrl() {
      baseWasRead = true;
      throw new Error("base URL must not be read");
    },
    media: { images: { main: asset({ scope: "shared", available: false }) } },
  };

  assert.equal(resolveManifestMedia(manifest, "images.main", "en"), null);
  assert.equal(baseWasRead, false);
});

test("missing media keys resolve to null", () => {
  const manifest = { mediaBaseUrl: "https://media.artdaci.com/artworks/ld01/", media: {} };
  assert.equal(resolveManifestMedia(manifest, "images.main", "en"), null);
});

test("rejects invalid availability, scope, paths and bases", () => {
  const manifest = {
    mediaBaseUrl: "https://media.artdaci.com/artworks/ld01/",
    sharedMediaBaseUrl: "https://media.artdaci.com/shared/",
  };

  assert.throws(() => resolveMediaAsset(manifest, asset({ available: "false" })), /boolean/);
  assert.throws(() => resolveMediaAsset(manifest, asset({ scope: "external" })), /scope/);
  assert.throws(() => resolveMediaAsset(manifest, asset({ path: "../secret.png" })), /segment/);
  assert.throws(
    () => resolveMediaAsset({ mediaBaseUrl: "file:///tmp/" }, asset()),
    /HTTP or HTTPS/,
  );
  assert.throws(
    () => resolveMediaAsset({ mediaBaseUrl: manifest.mediaBaseUrl }, asset({ scope: "shared" })),
    /sharedMediaBaseUrl/,
  );
});
