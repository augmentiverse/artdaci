import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function text(path) {
  return readFile(new URL(path, root), "utf8");
}

async function sha256(path) {
  const bytes = await readFile(new URL(path, root));
  return createHash("sha256").update(bytes).digest("hex").toUpperCase();
}

test("Louvre and Czartoryski museum media use the approved local assets", async () => {
  const louvre = JSON.parse(await text("content/museums/louvre.json"));
  const czartoryski = JSON.parse(await text("content/museums/czartoryski.json"));

  assert.equal(louvre.media.model, "assets/environments/gallery/models/museums/Louvre-full-joint_c.glb");
  assert.equal(louvre.ar.primaryModel, louvre.media.model);
  assert.equal(czartoryski.media.image, "assets/environments/gallery/images/MNK-Czartoryski/MNK-Czartoryski_building_plan/MNK-Czartoryski_museum.webp");
  assert.equal(czartoryski.print.imageTargetSource, czartoryski.media.image);
  assert.equal(czartoryski.ar.compiledTarget, "assets/targets/MNK-Czartoryski_museum.mind");
  assert.equal(czartoryski.media.model, "assets/environments/gallery/models/museums/MNK-Czartoryski_museum_c3.glb");
});

test("approved museum binaries and WebP files retain their exact identities", async () => {
  const expected = new Map([
    ["assets/environments/gallery/models/museums/Louvre-full-joint_c.glb", [29683184, "06276E8634B6E759513BA4CEED823931DD0547FE1E6DE42B9868F3F80FB13B91"]],
    ["assets/environments/gallery/models/museums/MNK-Czartoryski_museum_c3.glb", [22248884, "2DAF5196A050FAFFC5215067D584C5BFD3C5E76E0CD554755C60F3A42BF2545E"]],
    ["assets/targets/MNK-Czartoryski_museum.mind", [895695, "016E2CC4ED6B0C923EE133626B0DFA33FDA0FA57F9541FC66420A43A459804A0"]],
    ["assets/environments/gallery/images/MNK-Czartoryski/MNK-Czartoryski_building_plan/MNK-Czartoryski_museum.webp", [303508, "9DA7D7E7B417CCA4C68B8387A73D5FCE28B58AF8DCCA9F39CD965390910BC3EA"]],
    ["assets/environments/gallery/images/MNK-Czartoryski/MNK-Czartoryski_building_plan/MNK-Czartoryski_museum_legende.webp", [316746, "20C800CD287B2EF71EE372E554C57FBB384DD63A9D9EC21668EC91E5B752740B"]],
    ["assets/environments/gallery/images/MNK-Czartoryski/MNK-Czartoryski_building_plan/MNK-Czartoryski_façade.webp", [339484, "F5C82FB4B714F03961F4412E9E6EF954ADB62FE01154019E751FEBE991DB37CF"]]
  ]);

  for (const [path, [size, hash]] of expected) {
    assert.equal((await stat(new URL(path, root))).size, size, path);
    assert.equal(await sha256(path), hash, path);
  }
});

test("the Five Museums Wing loads each architectural model as essential room content", async () => {
  const source = await text("scripts/gallery-vr.js");
  const models = [
    "Louvre-full-joint_c.glb",
    "Mauritshuis_museum_c3.glb",
    "MNK-Czartoryski_museum_c3.glb",
    "Orsay_museum_c3.glb",
    "Vangogh_museum_c3.glb"
  ];

  for (const model of models) assert.match(source, new RegExp(model.replace(".", "\\.")));
  assert.match(source, /await loadFiveMuseumsRoom\(requestedMuseumIndex\);/);
  assert.match(source, /async function loadMuseumArchitecturalModel[\s\S]*?essential: true/);
  assert.match(source, /essential = false/);
  assert.match(source, /if \(!essential && !allowDecorative3DModels\) return null;/);
  assert.match(source, /MNK-Czartoryski_museum_legende\.webp/);
  assert.match(source, /MNK-Czartoryski_façade\.webp/);
  assert.match(source, /planLabel: \{ en: "MUSEUM OVERVIEW", fr: "PRÉSENTATION DU MUSÉE", ar: "نظرة عامة على المتحف" \}/);
});

test("museum configuration and viewer cache-busters activate the new media", async () => {
  const [arSource, spaceSource, printSource, bookSource, arHtml, spaceHtml, galleryHtml, cinemaHtml, bookHtml, printHtml, ...indexes] = await Promise.all([
    "scripts/ar-viewer.js",
    "scripts/space-viewer.js",
    "scripts/print-artwork.js",
    "scripts/book-3d.js",
    "ar.html",
    "space.html",
    "gallery-vr.html",
    "cinema-vr.html",
    "book-3d.html",
    "print-artwork.html",
    "index.html",
    "index-fr.html",
    "index-ar.html"
  ].map(text));

  for (const source of [arSource, spaceSource, printSource]) assert.match(source, /content\/museums\/czartoryski\.json\?v=2/);
  assert.match(bookSource, /content\/museums\/\$\{slug\}\.json\?v=3/);
  assert.match(arHtml, /ar-viewer\.js\?v=54/);
  assert.match(arHtml, /id="target-image-link"/);
  assert.match(arSource, /CONFIG\.resourceType === "museum" && manifest\.print\?\.imageTargetSource/);
  assert.match(arSource, /document\.getElementById\("target-image-link"\)\.href = manifest\.print\.imageTargetSource/);
  assert.match(spaceHtml, /space-viewer\.js\?v=35/);
  assert.match(galleryHtml, /gallery-vr\.js\?v=150/);
  assert.match(cinemaHtml, /gallery-vr\.js\?v=124/);
  assert.match(bookHtml, /book-3d\.js\?v=35/);
  assert.match(printHtml, /print-artwork\.js\?v=7/);
  for (const source of indexes) assert.match(source, /content\/museums\/czartoryski\.json\?v=2/);
});
