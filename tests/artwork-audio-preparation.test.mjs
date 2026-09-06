import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { resolveImmersiveArtworkRoute } from "../scripts/immersive-routing.js?v=audio-preparation";
import { resolveManifestMedia } from "../scripts/artwork-media-manifest-core.mjs";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const draftPath = resolve(repositoryRoot, "docs/production/migrations/mo01-audio-manifest-draft.json");
const migrationPath = resolve(repositoryRoot, "docs/production/migrations/mo01-audio-r2.json");
const canonicalPath = resolve(repositoryRoot, "content/media-manifests/artworks/mo01/manifest.json");
const draft = JSON.parse(await readFile(draftPath, "utf8"));
const migration = JSON.parse(await readFile(migrationPath, "utf8"));
const canonical = JSON.parse(await readFile(canonicalPath, "utf8"));
const schema = JSON.parse(await readFile(
  resolve(repositoryRoot, "content/media-manifests/schema/artwork-media-manifest.schema.json"),
  "utf8",
));

const expected = Object.freeze({
  en: Object.freeze({
    source: "assets/artists/claude-monet/artworks/impression-sunrise/media/monet-s-optical-illusion-that-birthed-impressionism.mp3",
    destination: "artworks/mo01/audio/en/overview.mp3",
    bytes: 2389037,
    sha256: "859d6f54f816eb975e040c72d9046abc91f3cd8089f3c10d0e7fc69c578b4283",
  }),
  fr: Object.freeze({
    source: "assets/artists/claude-monet/artworks/impression-sunrise/media/le-hack-neurologique-du-soleil-de-monet.mp3",
    destination: "artworks/mo01/audio/fr/overview.mp3",
    bytes: 1664800,
    sha256: "1c34fb7fba02d34b325f8ae8dd213101b0c074f2857f87a0afd29256c4083b42",
  }),
  ar: Object.freeze({
    source: "assets/artists/claude-monet/artworks/impression-sunrise/media/خدعة-الشمس-النابضة-وسر-تسمية-الانطباعية.mp3",
    destination: "artworks/mo01/audio/ar/overview.mp3",
    bytes: 2214884,
    sha256: "6b9d3ad7f749cb3e2297e31c60d45df3cc3933bacb2d40a8d283ac36bc4d9199",
  }),
});

function collectMediaAssets(node, path = "media") {
  if (node && typeof node === "object" && "available" in node) return [[path, node]];
  return Object.entries(node || {}).flatMap(([key, value]) => collectMediaAssets(value, `${path}.${key}`));
}

test("mo01 documentary draft satisfies the repository Draft 2020-12 schema contract", () => {
  assert.equal(schema.$schema, "https://json-schema.org/draft/2020-12/schema");
  for (const key of schema.required) assert.ok(Object.hasOwn(draft, key), `missing ${key}`);
  for (const key of Object.keys(draft)) assert.ok(Object.hasOwn(schema.properties, key), `unexpected ${key}`);
  assert.equal(draft.schemaVersion, schema.properties.schemaVersion.const);
  assert.match(draft.id, new RegExp(schema.properties.id.pattern));
  assert.match(draft.slug, new RegExp(schema.$defs.slug.pattern));
  assert.match(draft.mediaBaseUrl, new RegExp(schema.properties.mediaBaseUrl.pattern));
  assert.equal(draft.sharedMediaBaseUrl, schema.properties.sharedMediaBaseUrl.const);
  assert.equal(draft.cachePolicy, schema.properties.cachePolicy.const);

  for (const family of schema.properties.media.required) {
    assert.ok(Object.hasOwn(draft.media, family), `missing media.${family}`);
  }
  for (const [location, asset] of collectMediaAssets(draft.media)) {
    for (const key of schema.$defs.mediaAsset.required) assert.ok(Object.hasOwn(asset, key), `${location}.${key}`);
    for (const key of Object.keys(asset)) assert.ok(Object.hasOwn(schema.$defs.mediaAsset.properties, key), `${location}.${key}`);
    assert.ok(schema.$defs.mediaAsset.properties.scope.enum.includes(asset.scope));
    assert.match(asset.path, new RegExp(schema.$defs.mediaAsset.properties.path.pattern));
    assert.match(asset.mimeType, new RegExp(schema.$defs.mediaAsset.properties.mimeType.pattern));
    assert.ok(schema.$defs.mediaAsset.properties.migrationStatus.enum.includes(asset.migrationStatus));
    assert.equal(typeof asset.available, "boolean");
    if (asset.sha256) assert.match(asset.sha256, new RegExp(schema.$defs.mediaAsset.properties.sha256.pattern));
    if (asset.available) assert.equal(asset.migrationStatus, "published");
  }
});

test("mo01 audio draft follows manifest 2.0 conventions without publishing media", () => {
  assert.equal(draft.schemaVersion, "2.0");
  assert.equal(draft.id, "mo01");
  assert.equal(draft.slug, "impression-sunrise");
  assert.equal(draft.mediaBaseUrl, "https://media.artdaci.com/artworks/mo01/");
  assert.equal(draft.sharedMediaBaseUrl, "https://media.artdaci.com/shared/");
  assert.equal(draft.cachePolicy, "no-store");
  assert.deepEqual(Object.keys(draft.media).sort(), ["ar", "audio", "images", "models", "videos"]);

  for (const [language, item] of Object.entries(expected)) {
    const asset = draft.media.audio.overview[language];
    assert.equal(asset.scope, "artwork");
    assert.equal(asset.available, false);
    assert.equal(asset.migrationStatus, "planned");
    assert.equal(asset.language, language);
    assert.equal(asset.mimeType, "audio/mpeg");
    assert.equal(asset.path, `audio/${language}/overview.mp3`);
    assert.equal(asset.bytes, item.bytes);
    assert.equal(asset.sha256, item.sha256);
    assert.equal(resolveManifestMedia(draft, `audio.overview.${language}`, language), null);
  }
});

test("canonical mo01 manifest publishes exactly the three verified audio overviews", () => {
  assert.equal(canonical.id, "mo01");
  assert.equal(canonical.mediaBaseUrl, "https://media.artdaci.com/artworks/mo01/");
  assert.equal(canonical.cachePolicy, "no-store");
  assert.deepEqual(Object.keys(canonical.media).sort(), ["ar", "audio", "images", "models", "videos"]);
  assert.deepEqual(canonical.media.images, {});
  assert.deepEqual(canonical.media.videos, {});
  assert.deepEqual(canonical.media.models, {});
  assert.deepEqual(canonical.media.ar, {});

  for (const [language, item] of Object.entries(expected)) {
    const asset = canonical.media.audio.overview[language];
    assert.equal(asset.scope, "artwork");
    assert.equal(asset.available, true);
    assert.equal(asset.migrationStatus, "published");
    assert.equal(asset.mimeType, "audio/mpeg");
    assert.equal(asset.path, `audio/${language}/overview.mp3`);
    assert.equal(asset.bytes, item.bytes);
    assert.equal(asset.sha256, item.sha256);
    assert.equal(
      resolveManifestMedia(canonical, `audio.overview.${language}`, language),
      `https://media.artdaci.com/${item.destination}`,
    );
  }
});

test("migration card maps exactly three verified local MP3 files to mo01", async () => {
  assert.equal(migration.artworkId, "mo01");
  assert.equal(migration.status, "planned");
  assert.equal(migration.resources.length, 3);

  for (const resource of migration.resources) {
    const language = resource.language;
    const item = expected[language];
    assert.ok(item, `unexpected language: ${language}`);
    assert.equal(resource.key, `audio.overview.${language}`);
    assert.equal(resource.source, item.source);
    assert.equal(resource.destination, item.destination);
    assert.match(resource.destination, /^artworks\/mo01\/audio\/(en|fr|ar)\/overview\.mp3$/);
    assert.equal(resource.destination.includes(".."), false);
    assert.equal(resource.mimeType, "audio/mpeg");
    assert.equal(resource.bytes, item.bytes);
    assert.equal(resource.sha256, item.sha256);

    const content = await readFile(resolve(repositoryRoot, resource.source));
    assert.equal(content.length, item.bytes);
    assert.equal(createHash("sha256").update(content).digest("hex"), item.sha256);
    assert.equal(content.subarray(0, 3).toString("ascii"), "ID3");
  }
});

test("catalog and runtimes do not activate the documentary mo01 draft", async () => {
  const catalog = JSON.parse(await readFile(resolve(repositoryRoot, "content/media-manifests/catalog.json"), "utf8"));
  const mo01 = catalog.artworks.find((artwork) => artwork.id === "mo01");
  assert.deepEqual(mo01.manifest, {
    status: "source-ready",
    path: "artworks/mo01/manifest.json",
  });

  const runtimePaths = [
    "ar.html",
    "space.html",
    "vr.html",
    "gallery-vr.html",
    "book-3d.html",
    "print-artwork.html",
    "scripts/ar-viewer.js",
    "scripts/space-viewer.js",
    "scripts/vr-viewer.js",
    "scripts/gallery-vr.js",
    "scripts/book-3d.js",
    "scripts/print-artwork.js",
  ];
  const runtimeSources = await Promise.all(runtimePaths.map((path) => readFile(resolve(repositoryRoot, path), "utf8")));
  for (const source of runtimeSources) {
    assert.equal(source.includes("mo01-audio-manifest-draft.json"), false);
    assert.equal(source.includes("media.artdaci.com/artworks/mo01/audio/"), false);
  }
});

test("mo01 remains unavailable in individual AR, Spatial and VR routing", () => {
  for (const experience of ["ar", "space", "vr"]) {
    assert.equal(resolveImmersiveArtworkRoute("mo01", experience), null);
    assert.equal(resolveImmersiveArtworkRoute("impression-sunrise", experience), null);
  }
});

test("an explicitly missing language resolves to null instead of another language", () => {
  const fixture = structuredClone(canonical);
  delete fixture.media.audio.overview.ar;
  assert.equal(resolveManifestMedia(fixture, "audio.overview.ar", "ar"), null);
});

test("historical mo01 pages keep local click-only links and do not preload MP3 files", async () => {
  for (const page of ["print-monet-impression-sunrise.html", "print-monet-impression-sunrise-fr.html"]) {
    const html = await readFile(resolve(repositoryRoot, page), "utf8");
    for (const item of Object.values(expected)) assert.match(html, new RegExp(item.source.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.doesNotMatch(html, /<audio\b/i);
    assert.doesNotMatch(html, /preload\s*=\s*["'](?:auto|metadata)["']/i);
    assert.doesNotMatch(html, /media\.artdaci\.com\/artworks\/mo01\/audio\//);
  }
});

test("VG01 Chicago 1887 release and migration card remain byte-identical", async () => {
  const files = [
    ["content/media-manifests/artworks/vg01/manifest.json", "b6ea17a1dfa70c060d99cab43d573c5bd9ea7fd0a3dd3e5e8ff20e0316794abb"],
    ["docs/production/migrations/vg01-r2.json", "e972bbfa3584dd1906790e6afba0bfa8028974fceecfff945412b46462bf9343"],
  ];

  for (const [path, sha256] of files) {
    const content = await readFile(resolve(repositoryRoot, path));
    assert.equal(createHash("sha256").update(content).digest("hex"), sha256);
    assert.equal(content.includes(Buffer.from("vg02")), false);
  }
});
