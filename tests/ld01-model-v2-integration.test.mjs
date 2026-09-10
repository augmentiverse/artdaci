import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import { resolveManifestMedia } from "../scripts/artwork-media-manifest-core.mjs";

const localModel = "assets/artists/leonardo-da-vinci/artworks/mona-lisa/models/mona-lisa-main-v2.glb";
const oldModel = "assets/artists/leonardo-da-vinci/artworks/mona-lisa/models/mona-lisa.glb";
const modelUrl = new URL(`../${localModel}`, import.meta.url);
const painting = JSON.parse(await readFile(new URL("../content/paintings/mona-lisa.json", import.meta.url), "utf8"));
const manifest = JSON.parse(await readFile(new URL("../content/media-manifests/artworks/ld01/manifest.json", import.meta.url), "utf8"));
const arHtml = await readFile(new URL("../ar.html", import.meta.url), "utf8");
const spaceHtml = await readFile(new URL("../space.html", import.meta.url), "utf8");
const vrHtml = await readFile(new URL("../vr.html", import.meta.url), "utf8");
const arSource = await readFile(new URL("../scripts/ar-viewer.js", import.meta.url), "utf8");
const spaceSource = await readFile(new URL("../scripts/space-viewer.js", import.meta.url), "utf8");
const vrSource = await readFile(new URL("../scripts/vr-viewer.js", import.meta.url), "utf8");
const gallerySource = await readFile(new URL("../scripts/gallery-vr.js", import.meta.url), "utf8");
const bookSource = await readFile(new URL("../scripts/book-3d.js", import.meta.url), "utf8");

test("Mona Lisa V2 fallback GLB matches the preserved preparation", async () => {
  const bytes = await readFile(modelUrl);
  assert.equal((await stat(modelUrl)).size, 2_637_936);
  assert.equal(createHash("sha256").update(bytes).digest("hex"), "138e618385c471fe51bc71f1d4e2faed32ea1bad8a0db18245bddd27ca253733");
  assert.equal(bytes.subarray(0, 4).toString("ascii"), "glTF");
});

test("the five active Mona Lisa model references use the V2 fallback", () => {
  const activeModelValues = [
    painting.ar.primaryModel,
    painting.ar.frameModel,
    painting.ar.modelVariants[0].src,
    painting.media.model,
    painting.media.modelVariants[0].src,
  ];
  assert.deepEqual(activeModelValues, Array(5).fill(localModel));
  assert.doesNotMatch(JSON.stringify(painting), new RegExp(oldModel.replaceAll("/", "\\/")));
});

test("canonical manifest keeps every V2 resource planned and unavailable", () => {
  const entries = [manifest.media.models["main-v2"], manifest.media.images["ar-target-v2"], manifest.media.ar["target-v2"]];
  assert.equal(entries.every((entry) => entry.scope === "artwork" && entry.available === false && entry.migrationStatus === "planned"), true);
  assert.deepEqual(manifest.media.models["main-v2"], {
    scope: "artwork",
    path: "models/main-v2.glb",
    mimeType: "model/gltf-binary",
    available: false,
    migrationStatus: "planned",
    bytes: 2_637_936,
    sha256: "138e618385c471fe51bc71f1d4e2faed32ea1bad8a0db18245bddd27ca253733",
  });
});

test("resolver blocks unavailable V2 and resolves a simulated published model", () => {
  assert.equal(resolveManifestMedia(manifest, "models.main-v2", "en"), null);
  const published = structuredClone(manifest);
  published.media.models["main-v2"].available = true;
  published.media.models["main-v2"].migrationStatus = "published";
  assert.equal(resolveManifestMedia(published, "models.main-v2", "en"), "https://media.artdaci.com/artworks/ld01/models/main-v2.glb");
});

test("AR Image declares the V2 couple but retains pending hardware validation", () => {
  assert.match(arHtml, /data-artwork-media-for="mona-lisa"[\s\S]*?data-artwork-media-target-key="ar\.target-v2"[\s\S]*?data-artwork-media-image-key="images\.ar-target-v2"[\s\S]*?models\.main-v2/);
  assert.deepEqual(painting.ar.v2.modelTransform, { scale: 0.42, rotation: [0, 0, 0], position: [0, 0, 0.18] });
  assert.equal(painting.ar.v2.targetIndex, 0);
  assert.equal(painting.ar.v2.hardwareValidationStatus, "pending");
  assert.ok(arSource.indexOf("async function startAR()") < arSource.indexOf("async function loadModel(group)"));
});

test("Spatial and VR defer the Mona Lisa GLB until interaction", () => {
  assert.match(spaceHtml, /data-artwork-media-for="mona-lisa"[\s\S]*?models\.main-v2[\s\S]*?data-artwork-media-defer-model="true"/);
  assert.match(spaceSource, /if \(mediaContext\?\.config\.deferModel\)[\s\S]*?addEventListener\("pointerdown", loadInitialModel/);
  assert.match(vrHtml, /data-artwork-media-for="mona-lisa"[\s\S]*?models\.main-v2[\s\S]*?data-artwork-media-defer-model="true"/);
  assert.match(vrSource, /if \(deferInitialModel\)[\s\S]*?stage\.addEventListener\("pointerdown", \(\) => ensureInitialModel/);
  assert.match(vrSource, /if \(!initialModelLoadPromise\)/);
});

test("failed remote loads retain one controlled local fallback", () => {
  assert.match(spaceSource, /Remote spatial model unavailable[\s\S]*?model\.setAttribute\("src", activeSrc\)/);
  assert.match(spaceSource, /manifest unavailable; keeping the local spatial media[\s\S]*?return \{ config, manifest: null, resolvedMedia: new Map\(\) \}/i);
  assert.match(vrSource, /Remote GLB unavailable[\s\S]*?loadModel\(variant\.localSrc\)/);
  assert.match(vrSource, /modelCache\.delete\(src\)/);
  assert.equal((spaceSource.match(/const modelLoadRequests = new WeakMap\(\)/g) || []).length, 1);
});

test("Gallery keeps its distinct Leonardo scenes instead of repurposing models.main-v2", () => {
  assert.doesNotMatch(gallerySource, /mona-lisa-main-v2\.glb|models\.main-v2/);
  assert.match(gallerySource, /Leonardo and Mona Lisa[\s\S]*?davinci-monalisa-c\.glb/);
  assert.match(gallerySource, /Leonardo Painting Mona Lisa[\s\S]*?davinci-painting-mona\.glb/);
});

test("Living Book links to immersive routes without loading the V2 GLB", () => {
  assert.doesNotMatch(bookSource, /mona-lisa-main-v2\.glb|models\.main-v2/);
  assert.match(bookSource, /if \(type === "space"\) return `space\.html\?painting=/);
  assert.match(bookSource, /if \(type === "vr"\) return `vr\.html\?painting=/);
});
