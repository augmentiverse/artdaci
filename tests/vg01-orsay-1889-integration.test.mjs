import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const paths = {
  image: "assets/artists/vincent-van-gogh/artworks/self-portrait/images/self-portrait-orsay-1889-v1.webp",
  model: "assets/artists/vincent-van-gogh/artworks/self-portrait/models/portrait-orsay-1889-v2.glb",
  target: "assets/artists/vincent-van-gogh/artworks/self-portrait/ar/target-orsay-1889-v1.mind",
};

async function sha256(path) {
  return createHash("sha256").update(await readFile(new URL(path, root))).digest("hex");
}

test("the three prepared Orsay 1889 media assets keep their validated identities", async () => {
  assert.equal(await sha256(paths.image), "65b10b377b341e2837768a2a1c748b53546e0e8e5ac72d2cfe994dbf486844fa");
  assert.equal(await sha256(paths.model), "1178d84ef3884c6b9585a80bb7e053cc8a359749f6816f5c2fc209e2dbb89126");
  assert.equal(await sha256(paths.target), "2cd573741ed98fab27e53bdffdfd17430a8c2dc65e3e32e210950e2f3bcabc1b");
});

test("vg01 metadata and immersive fallbacks all select the Orsay 1889 release", async () => {
  const painting = JSON.parse(await readFile(new URL("content/paintings/van-gogh.json", root), "utf8"));
  assert.equal(painting.id, "vincent-van-gogh-self-portrait-1889");
  assert.equal(painting.date, "1889");
  assert.equal(painting.currentLocation.museum, "Musée d’Orsay");
  assert.equal(painting.print.imageTargetSource, paths.image);
  assert.equal(painting.print.compiledMindTarget, paths.target);
  assert.equal(painting.ar.imageTarget, paths.image);
  assert.equal(painting.ar.compiledTarget, paths.target);
  assert.equal(painting.ar.primaryModel, paths.model);
  assert.equal(painting.media.image, paths.image);
  assert.equal(painting.media.model, paths.model);
  assert.deepEqual(painting.ar.modelVariants.map(({ id }) => id), ["portrait"]);
  assert.deepEqual(painting.media.modelVariants.map(({ id }) => id), ["portrait"]);
});

test("the manifest publishes only verified versioned Orsay media and quarantines the 1887 release", async () => {
  const manifest = JSON.parse(await readFile(new URL("content/media-manifests/artworks/vg01/manifest.json", root), "utf8"));
  assert.equal(manifest.artwork.date, "September 1889");
  assert.equal(manifest.artwork.museum, "Musée d’Orsay");
  assert.deepEqual(
    [manifest.media.images.main.path, manifest.media.models.portrait.path, manifest.media.ar.target.path],
    ["images/main-orsay-1889-v1.webp", "models/portrait-orsay-1889-v2.glb", "ar/target-orsay-1889-v1.mind"],
  );
  for (const entry of [manifest.media.images.main, manifest.media.models.portrait, manifest.media.ar.target]) {
    assert.equal(entry.available, true);
    assert.equal(entry.migrationStatus, "published");
  }
  for (const entry of [
    manifest.media.images["out-of-frame"],
    manifest.media.models.standing,
    manifest.media.models["bedroom-standing"],
    manifest.media.models["gallery-standing"],
    ...Object.values(manifest.media.audio.guide),
    ...Object.values(manifest.media.audio.overview),
    manifest.media.videos.animation,
  ]) {
    assert.equal(entry.available, false);
    assert.equal(entry.migrationStatus, "quarantined-unused");
  }
});

test("active vg01 surfaces no longer reference Chicago 1887 media", async () => {
  const activeFiles = [
    "compile-target.html",
    "index.html",
    "index-fr.html",
    "index-ar.html",
    "print-van-gogh.html",
    "print-van-gogh-fr.html",
    "scripts/book-3d.js",
    "scripts/gallery-vr.js",
    "scripts/print-ar.js",
    "content/paintings/van-gogh.json",
    "geo/data/masters-hub-notices.json",
  ];
  const sources = await Promise.all(activeFiles.map((path) => readFile(new URL(path, root), "utf8")));
  const joined = sources.join("\n");
  assert.doesNotMatch(joined, /images\/van-gogh-portrait\.jpg/);
  assert.doesNotMatch(joined, /assets\/targets\/van-gogh\.mind/);
  assert.doesNotMatch(joined, /models\/van-gogh-portrait\.glb/);
  assert.doesNotMatch(joined, /linked printed page describes the 1887|fiche liée décrit celui de 1887/);
});

test("vg01 immersive declarations expose only the Orsay portrait role", async () => {
  for (const page of ["ar.html", "space.html", "vr.html"]) {
    const source = await readFile(new URL(`../${page}`, import.meta.url), "utf8");
    const declaration = source.match(/<div\s+hidden\s+data-artwork-media-for="van-gogh"[\s\S]*?<\/div>/)?.[0] || "";
    assert.match(declaration, /data-artwork-media-model-keys='{"portrait":"models\.portrait"}'/, page);
    assert.doesNotMatch(declaration, /models\.(?:standing|bedroom-standing)/, page);
    assert.doesNotMatch(declaration, /data-artwork-media-(?:audio-keys|video-key)/, page);
  }
});

test("the integration preview reads the reviewed Git manifest without changing the public R2 manifest", async () => {
  for (const page of ["ar.html", "space.html", "vr.html", "gallery-vr.html", "print-van-gogh.html", "print-van-gogh-fr.html"]) {
    const source = await readFile(new URL(`../${page}`, import.meta.url), "utf8");
    assert.match(source, /\/content\/media-manifests\/artworks\/vg01\/manifest\.json/, page);
    assert.doesNotMatch(source, /https:\/\/media\.artdaci\.com\/artworks\/vg01\/manifest\.json/, page);
  }
});
