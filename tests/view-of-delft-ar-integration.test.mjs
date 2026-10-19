import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";

import { resolveImmersiveArtworkRoute } from "../scripts/immersive-routing.js";

const root = new URL("../", import.meta.url);
const read = (path, encoding = "utf8") => readFile(new URL(path, root), encoding);
const json = async (path) => JSON.parse(await read(path));
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

const assets = Object.freeze({
  image: {
    source: "assets/artists/johannes-vermeer/artworks/view_of_delft/images/ve02-view-of-delft-web.webp",
    path: "images/ve02-view-of-delft-web.webp",
    bytes: 98008,
    sha256: "828ddd6ee4612320978c3d485a4002f749634ab3b9951917405af2c829a46d50",
  },
  target: {
    source: "assets/targets/view-of-delft.mind",
    path: "ar/view-of-delft.mind",
    bytes: 561730,
    sha256: "112684ff6ceb17b075d51daa48e48ec21cc9d0b2a362f0da267f7b11364f6dcb",
  },
  model: {
    source: "assets/artists/johannes-vermeer/artworks/view_of_delft/models/view-of-delft.glb",
    path: "models/view-of-delft.glb",
    bytes: 3118640,
    sha256: "2a43492d2968d1371ac606714ebb17602bdb2e38a2913041c553d818b71ebe2f",
  },
});

test("View of Delft authored Image AR assets remain byte-exact", async () => {
  for (const asset of Object.values(assets)) {
    const bytes = await read(asset.source, null);
    assert.equal((await stat(new URL(asset.source, root))).size, asset.bytes, asset.source);
    assert.equal(sha256(bytes), asset.sha256, asset.source);
  }
  assert.equal((await read(assets.image.source, null)).subarray(0, 4).toString("ascii"), "RIFF");
  const glb = await read(assets.model.source, null);
  assert.equal(glb.subarray(0, 4).toString("ascii"), "glTF");
  assert.equal(glb.readUInt32LE(4), 2);
  assert.equal(glb.readUInt32LE(8), glb.length);
});

test("ve02 manifest publishes only the verified tracking image, target, model and existing audio", async () => {
  const manifest = await json("content/media-manifests/artworks/ve02/manifest.json");
  assert.equal(manifest.id, "ve02");
  assert.equal(manifest.mediaBaseUrl, "https://media.artdaci.com/artworks/ve02/");
  const entries = [
    [manifest.media.images["tracking-source"], assets.image, "image/webp"],
    [manifest.media.ar.target, assets.target, "application/octet-stream"],
    [manifest.media.models["delft-2026"], assets.model, "model/gltf-binary"],
  ];
  for (const [entry, asset, mimeType] of entries) {
    assert.equal(entry.path, asset.path);
    assert.equal(entry.bytes, asset.bytes);
    assert.equal(entry.sha256, asset.sha256);
    assert.equal(entry.mimeType, mimeType);
    assert.equal(entry.scope, "artwork");
    assert.equal(entry.available, true);
    assert.equal(entry.migrationStatus, "published");
  }
  assert.deepEqual(Object.keys(manifest.media.audio.overview).sort(), ["ar", "en", "fr"]);
});

test("View of Delft uses the matching target image and one canonical GLB in Image and Space AR", async () => {
  const artwork = await json("content/paintings/view-of-delft.json");
  assert.equal(artwork.print.imageTargetSource, assets.image.source);
  assert.equal(artwork.print.compiledMindTarget, assets.target.source);
  assert.equal(artwork.media.image, assets.image.source);
  assert.equal(artwork.media.model, assets.model.source);
  assert.equal(artwork.ar.imageTarget, assets.image.source);
  assert.equal(artwork.ar.compiledTarget, assets.target.source);
  assert.equal(artwork.ar.primaryModel, assets.model.source);
  assert.equal(artwork.ar.fallbackImage, assets.image.source);
  assert.deepEqual(artwork.media.modelVariants.map(({ id }) => id), ["delft"]);
  assert.deepEqual(artwork.ar.modelVariants.map(({ id }) => id), ["delft"]);
});

test("ve02 routing and declarative media configuration expose Image and Space AR only", async () => {
  assert.equal(resolveImmersiveArtworkRoute("ve02", "ar")?.runtimeSlug, "view-of-delft");
  assert.equal(resolveImmersiveArtworkRoute("view-of-delft", "space")?.artworkId, "ve02");
  assert.equal(resolveImmersiveArtworkRoute("ve02", "vr"), null);

  const [arHtml, spaceHtml, arViewer, spaceViewer] = await Promise.all([
    read("ar.html"),
    read("space.html"),
    read("scripts/ar-viewer.js"),
    read("scripts/space-viewer.js"),
  ]);
  for (const html of [arHtml, spaceHtml]) {
    assert.match(html, /data-artwork-media-for="view-of-delft"/);
    assert.match(html, /https:\/\/media\.artdaci\.com\/artworks\/ve02\/manifest\.json/);
    assert.match(html, /"delft":"models\.delft-2026"/);
  }
  assert.match(arHtml, /data-artwork-media-target-key="ar\.target"/);
  assert.match(arHtml, /data-artwork-media-image-key="images\.tracking-source"/);
  assert.match(arHtml, /ar-viewer\.js\?v=61/);
  assert.match(arViewer, /if \(manifest\.print\?\.imageTargetSource\)/);
  assert.match(arViewer, /target-image-link"\)\.href = manifest\.print\.imageTargetSource/);
  assert.match(spaceHtml, /space-viewer\.js\?v=38/);
  assert.match(arViewer, /"view-of-delft": "content\/paintings\/view-of-delft\.json\?v=2"/);
  assert.match(spaceViewer, /"view-of-delft": "content\/paintings\/view-of-delft\.json\?v=2"/);
  assert.doesNotMatch(arHtml + spaceHtml, /shared\//);
});
