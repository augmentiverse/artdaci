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
    ["assets/environments/gallery/images/MNK-Czartoryski/MNK-Czartoryski_building_plan/MNK-Czartoryski_building_plan_en.webp", [284860, "DDDA80E4648E5B30953F5A72E7631F1DEB2A730681984B0AC7905134754A91BA"]],
    ["assets/environments/gallery/images/MNK-Czartoryski/MNK-Czartoryski_building_plan/MNK-Czartoryski_building_plan_fr.webp", [341816, "DF27ADB3B1249D4FBA1800CDEEE3FD56FF83498CDBB68C058898125EAF71EFD4"]],
    ["assets/environments/gallery/images/MNK-Czartoryski/MNK-Czartoryski_building_plan/MNK-Czartoryski_building_plan_ar.webp", [309108, "8394635A75EFA679D409C9ABDEF0A05C3BA317E1BB5AEC606E92FF6526558496"]],
    ["assets/environments/gallery/images/MNK-Czartoryski/MNK-Czartoryski_timeline/MNK-Czartoryski_timeline_en.webp", [385566, "E6C68457EC58191D1F4E101D8821619FF8D17738EA5B69FF34BE1CB6445B52F0"]],
    ["assets/environments/gallery/images/MNK-Czartoryski/MNK-Czartoryski_timeline/MNK-Czartoryski_timeline_fr.webp", [384452, "CF11453F3400114DA617DDF8FA230A1A662D69A66D852745185C7223A59C10BA"]],
    ["assets/environments/gallery/images/MNK-Czartoryski/MNK-Czartoryski_timeline/MNK-Czartoryski_timeline_ar.webp", [354294, "863658CEFA677E7D3DB863ACDFC94EA4A7765D5FEB602C2C743A4530999F9AB7"]],
    ["assets/environments/gallery/images/MNK-Czartoryski/MNK-Czartoryski_building_plan/MNK-Czartoryski_façade.webp", [459698, "1A9A3AF773F712C6337495D597E691443F313B95B11E09A40B07E42F0006DE77"]]
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
  assert.match(source, /name: "museum-architecture-louvre"[\s\S]*?rotationY: 0[\s\S]*?maxSize: 3\.48/);
  assert.match(source, /essential = false/);
  assert.match(source, /if \(!essential && !allowDecorative3DModels\) return null;/);
  assert.match(source, /MNK-Czartoryski_building_plan_\{lang\}\.webp/);
  assert.match(source, /MNK-Czartoryski_timeline_\{lang\}\.webp/);
  assert.match(source, /MNK-Czartoryski_façade\.webp\?v=2/);
  assert.doesNotMatch(source, /MNK-Czartoryski_museum_legende\.webp/);
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
  assert.match(galleryHtml, /gallery-vr\.js\?v=167/);
  assert.match(cinemaHtml, /gallery-vr\.js\?v=141/);
  assert.match(cinemaHtml, /<body class="screen-ui-collapsed" data-experience="cinema">/);
  assert.match(cinemaHtml, /id="gallery-ui-toggle"[\s\S]*?aria-expanded="false"[\s\S]*?>Menu<\/button>/);
  assert.match(cinemaHtml, /id="gallery-toolbar"/);
  assert.match(cinemaHtml, /id="gallery-guide"/);
  assert.match(bookHtml, /book-3d\.js\?v=35/);
  assert.match(printHtml, /print-artwork\.js\?v=7/);
  for (const source of indexes) assert.match(source, /content\/museums\/czartoryski\.json\?v=2/);
});
