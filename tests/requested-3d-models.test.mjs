import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const resources = [
  ["assets/environments/gallery/models/museums/Mauritshuis_museum_c3.glb", 8818200, "5458d044ca8624fda6879215fe180d3d1d124f90f2df3624c0fc1908c5d931a5", "https://media.artdaci.com/shared/museums/mauritshuis/models/main--sha256-5458d044ca86.glb"],
  ["assets/environments/gallery/models/museums/Santa_Maria_delle_Grazie.glb", 7575784, "41a998492e9655ad062af9bbd311c58e85dda344c0c549022c5027f614a49085", "https://media.artdaci.com/shared/museums/santa-maria-delle-grazie/models/main--sha256-41a998492e96.glb"],
  ["assets/artists/groups/models/DaVici_Monet_vanGogh_Vermeer_standing_gd_c.glb", 4297620, "d2196ae68ecf14b5602db737f9cd29e47e8e0099d9e5cd2aa8629630aa370584", "https://media.artdaci.com/shared/groups/four-masters/models/standing--sha256-d2196ae68ecf.glb"],
  ["assets/artists/johannes-vermeer/artworks/girl-with-a-pearl-earring/models/girl-pearl_standing.glb", 3032692, "e162489dc277808d2de00528bf1b0f9716c3ff65ce4361de4f92d6cafaa2a1a5", "https://media.artdaci.com/artworks/ve01/models/standing--sha256-e162489dc277.glb"],
  ["assets/artists/leonardo-da-vinci/reimagined/models/the-lady-with-an-ermine.glb", 6934764, "366667a0233d6f1f532746506a92557cddb70bd01d8a0e849d700715f3ea6707", "https://media.artdaci.com/artworks/ld02/models/lady-with-an-ermine--sha256-366667a0233d.glb"],
  ["assets/artists/leonardo-da-vinci/reimagined/models/leonardo_painting_monalisa.glb", 8517028, "20ee31394f180b711df6e2e790c7bc954d6b2e6297fd50093b225f39eda3b765", "https://media.artdaci.com/artworks/ld01/models/leonardo-painting-mona-lisa--sha256-20ee31394f18.glb"]
];

test("the six requested GLB files are valid containers with the recorded hashes", async () => {
  for (const [path, bytes, sha256] of resources) {
    const data = await readFile(path);
    assert.equal(data.length, bytes, `${path} byte length`);
    assert.equal(data.subarray(0, 4).toString("ascii"), "glTF", `${path} GLB magic`);
    assert.equal(data.readUInt32LE(4), 2, `${path} GLB version`);
    assert.equal(data.readUInt32LE(8), bytes, `${path} declared GLB length`);
    assert.equal(createHash("sha256").update(data).digest("hex"), sha256, `${path} SHA-256`);
  }
});

test("the 3D collection preserves the previous catalogue and exposes every requested Cloudflare model", async () => {
  const [html, script] = await Promise.all([
    readFile("3d/index.html", "utf8"),
    readFile("scripts/3d-collection.js", "utf8")
  ]);

  for (const [, , , url] of resources) assert.match(html, new RegExp(url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  const restoredModels = [
    "https://media.artdaci.com/artworks/ld01/models/main-v2.glb",
    "../assets/artists/johannes-vermeer/artworks/girl-with-a-pearl-earring/models/vermeer-girl-with-a-pearl-earring.glb",
    "../assets/artists/leonardo-da-vinci/reimagined/models/davinci-standing-c.glb",
    "../assets/artists/johannes-vermeer/reimagined/models/vermeer_standing.glb",
    "../assets/artists/vincent-van-gogh/profile/models/standing.glb",
    "../assets/artists/claude-monet/reimagined/models/claude-monet-standing-c.glb"
  ];
  for (const src of restoredModels) assert.ok(html.includes(src), src);
  assert.equal((html.match(/class="d3-model-choice"/g) || []).length, 17);
  assert.match(script, /counts: \["6 models", "5 models", "5 models", "1 model"\]/);
  assert.match(script, /counts: \["6 modèles", "5 modèles", "5 modèles", "1 modèle"\]/);
  assert.match(script, /counts: \["6 نماذج", "5 نماذج", "5 نماذج", "نموذج واحد"\]/);
});

test("the VR model rooms use the new Leonardo, Vermeer, and Four Masters models", async () => {
  const gallery = await readFile("scripts/gallery-vr.js", "utf8");
  assert.ok(gallery.includes("https://media.artdaci.com/artworks/ld01/models/leonardo-painting-mona-lisa--sha256-20ee31394f18.glb"));
  assert.ok(gallery.includes("https://media.artdaci.com/artworks/ld01/models/main-v2.glb"));
  assert.ok(gallery.includes("https://media.artdaci.com/artworks/ld02/models/lady-with-an-ermine--sha256-366667a0233d.glb"));
  assert.ok(gallery.includes("https://media.artdaci.com/artworks/ve01/models/standing--sha256-e162489dc277.glb"));
  assert.ok(gallery.includes("https://media.artdaci.com/shared/groups/four-masters/models/standing--sha256-d2196ae68ecf.glb"));
  assert.doesNotMatch(gallery, /assets\/shared\/groups\/dvvm_selfy\.glb/);
  assert.doesNotMatch(gallery, /assets\/artists\/leonardo-da-vinci\/artworks\/mona-lisa\/models\/davinci-painting-mona\.glb/);
  assert.match(gallery, /const multiRow = count > 4/);
});

test("the VR model rooms emphasize Leonardo and use textured museum pedestals", async () => {
  const gallery = await readFile("scripts/gallery-vr.js", "utf8");
  assert.match(gallery, /leonardo-painting-mona-lisa[^\n]+displayScale: 1\.18/);
  assert.match(gallery, /models\/main-v2\.glb[^\n]+displayScale: 0\.82/);
  assert.match(gallery, /function createPedestalTexture\(kind\)/);
  assert.match(gallery, /new THREE\.CanvasTexture\(canvas\)/);
  assert.match(gallery, /marble: new THREE\.MeshStandardMaterial/);
  assert.match(gallery, /wood: new THREE\.MeshStandardMaterial/);
  assert.match(gallery, /brass: new THREE\.MeshStandardMaterial/);
  assert.ok((gallery.match(/createMuseumPedestal\(/g) || []).length >= 4);
  assert.match(gallery, /model\.position\.y \+= pedestal\.userData\.surfaceY/);
  assert.match(gallery, /width = 1\.85, depth = width, marbleHeight = 0\.2, woodHeight = 0\.1/);
  assert.match(gallery, /width: 1\.35, depth: 1\.35, marbleHeight: 0\.18, woodHeight: 0\.09/);
  assert.match(gallery, /color: 0xd2c4b4/);
  assert.match(gallery, /color: 0x69381f/);
});

test("artwork and museum manifests point at the published versioned models", async () => {
  const paths = [
    "content/paintings/mona-lisa.json",
    "content/paintings/lady-with-an-ermine.json",
    "content/paintings/vermeer-girl-with-a-pearl-earring.json",
    "content/museums/mauritshuis.json",
    "content/media-manifests/artworks/ld01/manifest.json",
    "content/media-manifests/artworks/ld02/manifest.json",
    "content/media-manifests/artworks/ve01/manifest.json"
  ];
  const text = (await Promise.all(paths.map((path) => readFile(path, "utf8")))).join("\n");

  for (const [, , , url] of resources.slice(0, 1).concat(resources.slice(3))) {
    assert.ok(text.includes(url) || text.includes(new URL(url).pathname.slice(1)), url);
  }
});
