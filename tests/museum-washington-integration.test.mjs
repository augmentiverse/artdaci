import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { access, readFile, stat } from "node:fs/promises";
import test from "node:test";
import { resolvePaintingMuseum } from "../scripts/painting-museum-resolver.mjs";

const root = new URL("../", import.meta.url);
const museumPath = new URL("content/museums/national-gallery-of-art-washington.json", root);
const museum = JSON.parse(await readFile(museumPath, "utf8"));
const washingtonImageRoot = "assets/environments/gallery/images/National Gallery of Art Washington";
const washingtonModelUrl = "https://media.artdaci.com/shared/museums/national-gallery-of-art-washington/models/main--sha256-b1e51bdc7563.glb";
const washingtonTargetUrl = "https://media.artdaci.com/shared/museums/national-gallery-of-art-washington/ar/target--sha256-84d3a3b035e7.mind";
const washingtonModelSource = "assets/environments/gallery/models/museums/National_Gallery_of_Art_Washington.glb";
const washingtonTargetSource = "assets/targets/National_Gallery_of_Art_Washington.mind";
const washingtonAssets = new Map([
  [`${washingtonImageRoot}/National Gallery of Art Washington_building_plan/National Gallery of Art Washington.webp`, 552934],
  [`${washingtonImageRoot}/National Gallery of Art Washington_building_plan/National Gallery of Art Washington_legend.webp`, 566674],
  [`${washingtonImageRoot}/National Gallery of Art Washington_building_plan/National Gallery of Art Washington_building_plan_en.webp`, 269596],
  [`${washingtonImageRoot}/National Gallery of Art Washington_building_plan/National Gallery of Art Washington_building_plan_fr.webp`, 260450],
  [`${washingtonImageRoot}/National Gallery of Art Washington_building_plan/National Gallery of Art Washington_building_plan_ar.webp`, 255250],
  [`${washingtonImageRoot}/National Gallery of Art Washington_timeline/National Gallery of Art Washington_timeline_en.webp`, 362314],
  [`${washingtonImageRoot}/National Gallery of Art Washington_timeline/National Gallery of Art Washington_timeline_fr.webp`, 365544],
  [`${washingtonImageRoot}/National Gallery of Art Washington_timeline/National Gallery of Art Washington_timeline_ar.webp`, 348346],
]);
const [arSource, spaceSource, gallerySource, bookSource, modelGallerySource] = await Promise.all([
  readFile(new URL("scripts/ar-viewer.js", root), "utf8"),
  readFile(new URL("scripts/space-viewer.js", root), "utf8"),
  readFile(new URL("scripts/gallery-vr.js", root), "utf8"),
  readFile(new URL("scripts/book-3d.js", root), "utf8"),
  readFile(new URL("3d/index.html", root), "utf8"),
]);

test("Washington museum record exposes the supplied image, model and MindAR target", async () => {
  assert.equal(museum.slug, "national-gallery-of-art-washington");
  assert.equal(museum.media.image, "assets/environments/gallery/images/National Gallery of Art Washington/National Gallery of Art Washington_building_plan/National Gallery of Art Washington.webp");
  assert.equal(museum.media.model, washingtonModelUrl);
  assert.equal(museum.print.imageTargetSource, museum.media.image);
  assert.equal(museum.print.compiledMindTarget, washingtonTargetUrl);
  assert.equal(museum.ar.compiledTarget, museum.print.compiledMindTarget);
  assert.equal(museum.ar.primaryModel, museum.media.model);
  assert.equal(museum.localizations.fr.title, "National Gallery of Art de Washington");
  assert.equal(museum.localizations.ar.title, "المعرض الوطني للفنون في واشنطن");

  for (const [relativePath, expectedSize] of washingtonAssets) {
    const fileUrl = new URL(relativePath.replaceAll(" ", "%20"), root);
    await access(fileUrl);
    assert.equal((await stat(fileUrl)).size, expectedSize, relativePath);
  }

  const modelHash = createHash("sha256").update(await readFile(new URL(washingtonModelSource, root))).digest("hex");
  const targetHash = createHash("sha256").update(await readFile(new URL(washingtonTargetSource, root))).digest("hex");
  assert.equal(modelHash, "b1e51bdc75633bb64d9445b1f5a098afc3fff18e9cf14ee3ad40bdf6860698fb");
  assert.equal(targetHash, "84d3a3b035e7177c15477837c8ae37d9ee82099f152ed963858634fd9a28518f");
});

test("all public museum consumers register Washington without replacing the first five", async () => {
  for (const source of [arSource, spaceSource]) {
    assert.match(source, /"national-gallery-of-art-washington": "content\/museums\/national-gallery-of-art-washington\.json\?v=2"/);
  }
  assert.match(bookSource, /"van-gogh-museum", "national-gallery-of-art-washington"/);
  assert.match(bookSource, /THE SIX MUSEUMS/);
  assert.match(bookSource, /LES SIX MUSÉES/);
  assert.match(bookSource, /المتاحف الستة/);
  assert.match(gallerySource, /id: "national-gallery-of-art-washington"/);
  assert.ok(gallerySource.includes(washingtonModelUrl));
  assert.ok(modelGallerySource.includes(washingtonModelUrl));
  assert.match(gallerySource, /Six connected rooms/);
  assert.match(gallerySource, /MUSEUM_WING_LAST_BOUNDARY_Z/);

  for (const file of ["index.html", "index-fr.html", "index-ar.html"]) {
    const html = await readFile(new URL(file, root), "utf8");
    assert.match(html, /data-museums="[^"]*content\/museums\/national-gallery-of-art-washington\.json\?v=2"/);
  }
});

test("Washington museum routes are assigned to the three matching ARTDACI artworks", () => {
  for (const museumName of ["National Gallery of Art", "National Gallery of Art, Washington"]) {
    assert.deepEqual(resolvePaintingMuseum({ currentLocation: { museum: museumName } }), {
      slug: "national-gallery-of-art-washington",
      url: "content/museums/national-gallery-of-art-washington.json?v=2",
    });
  }
});

test("activation versions address every changed browser module", async () => {
  const expected = new Map([
    ["ar.html", "scripts/ar-viewer.js?v=62"],
    ["space.html", "scripts/space-viewer.js?v=39"],
    ["book-3d.html", "scripts/book-3d.js?v=37"],
    ["gallery-vr.html", "scripts/gallery-vr.js?v=180"],
    ["cinema-vr.html", "scripts/gallery-vr.js?v=150"],
    ["print-artwork.html", "scripts/print-artwork.js?v=12"],
  ]);
  for (const [file, scriptUrl] of expected) {
    assert.ok((await readFile(new URL(file, root), "utf8")).includes(scriptUrl), `${file}: ${scriptUrl}`);
  }
});
