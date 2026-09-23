import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { access, readFile, stat } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const museumPath = new URL("content/museums/national-gallery-of-art-washington.json", root);
const museum = JSON.parse(await readFile(museumPath, "utf8"));
const washingtonImageRoot = "assets/environments/gallery/images/National Gallery of Art Washington";
const washingtonAssets = new Map([
  [`${washingtonImageRoot}/National Gallery of Art Washington_building_plan/National Gallery of Art Washington.webp`, 552934],
  [`${washingtonImageRoot}/National Gallery of Art Washington_building_plan/National Gallery of Art Washington_legend.webp`, 566674],
  [`${washingtonImageRoot}/National Gallery of Art Washington_building_plan/National Gallery of Art Washington_building_plan_en.webp`, 269596],
  [`${washingtonImageRoot}/National Gallery of Art Washington_building_plan/National Gallery of Art Washington_building_plan_fr.webp`, 260450],
  [`${washingtonImageRoot}/National Gallery of Art Washington_building_plan/National Gallery of Art Washington_building_plan_ar.webp`, 255250],
  [`${washingtonImageRoot}/National Gallery of Art Washington_timeline/National Gallery of Art Washington_timeline_en.webp`, 362314],
  [`${washingtonImageRoot}/National Gallery of Art Washington_timeline/National Gallery of Art Washington_timeline_fr.webp`, 365544],
  [`${washingtonImageRoot}/National Gallery of Art Washington_timeline/National Gallery of Art Washington_timeline_ar.webp`, 348346],
  ["assets/environments/gallery/models/museums/National_Gallery_of_Art_Washington.glb", 6735432],
  ["assets/targets/National_Gallery_of_Art_Washington.mind", 928508],
]);
const [arSource, spaceSource, gallerySource, bookSource, printSource] = await Promise.all([
  readFile(new URL("scripts/ar-viewer.js", root), "utf8"),
  readFile(new URL("scripts/space-viewer.js", root), "utf8"),
  readFile(new URL("scripts/gallery-vr.js", root), "utf8"),
  readFile(new URL("scripts/book-3d.js", root), "utf8"),
  readFile(new URL("scripts/print-artwork.js", root), "utf8"),
]);

test("Washington museum record exposes the supplied image, model and MindAR target", async () => {
  assert.equal(museum.slug, "national-gallery-of-art-washington");
  assert.equal(museum.media.image, "assets/environments/gallery/images/National Gallery of Art Washington/National Gallery of Art Washington_building_plan/National Gallery of Art Washington.webp");
  assert.equal(museum.media.model, "assets/environments/gallery/models/museums/National_Gallery_of_Art_Washington.glb");
  assert.equal(museum.print.imageTargetSource, museum.media.image);
  assert.equal(museum.print.compiledMindTarget, "assets/targets/National_Gallery_of_Art_Washington.mind");
  assert.equal(museum.ar.compiledTarget, museum.print.compiledMindTarget);
  assert.equal(museum.ar.primaryModel, museum.media.model);
  assert.equal(museum.localizations.fr.title, "National Gallery of Art de Washington");
  assert.equal(museum.localizations.ar.title, "المعرض الوطني للفنون في واشنطن");

  for (const [relativePath, expectedSize] of washingtonAssets) {
    const fileUrl = new URL(relativePath.replaceAll(" ", "%20"), root);
    await access(fileUrl);
    assert.equal((await stat(fileUrl)).size, expectedSize, relativePath);
  }

  const modelHash = createHash("sha256").update(await readFile(new URL(museum.media.model, root))).digest("hex");
  const targetHash = createHash("sha256").update(await readFile(new URL(museum.ar.compiledTarget, root))).digest("hex");
  assert.equal(modelHash, "b1e51bdc75633bb64d9445b1f5a098afc3fff18e9cf14ee3ad40bdf6860698fb");
  assert.equal(targetHash, "84d3a3b035e7177c15477837c8ae37d9ee82099f152ed963858634fd9a28518f");
});

test("all public museum consumers register Washington without replacing the first five", async () => {
  for (const source of [arSource, spaceSource]) {
    assert.match(source, /"national-gallery-of-art-washington": "content\/museums\/national-gallery-of-art-washington\.json\?v=1"/);
  }
  assert.match(bookSource, /"van-gogh-museum", "national-gallery-of-art-washington"/);
  assert.match(bookSource, /THE SIX MUSEUMS/);
  assert.match(bookSource, /LES SIX MUSÉES/);
  assert.match(bookSource, /المتاحف الستة/);
  assert.match(gallerySource, /id: "national-gallery-of-art-washington"/);
  assert.match(gallerySource, /National_Gallery_of_Art_Washington\.glb/);
  assert.match(gallerySource, /Six connected rooms/);
  assert.match(gallerySource, /MUSEUM_WING_LAST_BOUNDARY_Z/);

  for (const file of ["index.html", "index-fr.html", "index-ar.html"]) {
    const html = await readFile(new URL(file, root), "utf8");
    assert.match(html, /data-museums="[^"]*content\/museums\/national-gallery-of-art-washington\.json\?v=1"/);
  }
});

test("Washington museum routes are assigned to the three matching ARTDACI artworks", () => {
  for (const slug of ["ginevra-de-benci", "woman-holding-balance", "woman-with-parasol"]) {
    assert.match(printSource, new RegExp(`"${slug}": \\["national-gallery-of-art-washington", "content/museums/national-gallery-of-art-washington\\.json\\?v=1"\\]`));
  }
});

test("activation versions address every changed browser module", async () => {
  const expected = new Map([
    ["ar.html", "scripts/ar-viewer.js?v=55"],
    ["space.html", "scripts/space-viewer.js?v=36"],
    ["book-3d.html", "scripts/book-3d.js?v=36"],
    ["gallery-vr.html", "scripts/gallery-vr.js?v=174"],
    ["cinema-vr.html", "scripts/gallery-vr.js?v=148"],
    ["print-artwork.html", "scripts/print-artwork.js?v=9"],
  ]);
  for (const [file, scriptUrl] of expected) {
    assert.ok((await readFile(new URL(file, root), "utf8")).includes(scriptUrl), `${file}: ${scriptUrl}`);
  }
});
