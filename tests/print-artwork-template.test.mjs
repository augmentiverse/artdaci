import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const [html, script, numbering] = await Promise.all([
  readFile(new URL("print-artwork.html", root), "utf8"),
  readFile(new URL("scripts/print-artwork.js", root), "utf8"),
  import("../scripts/artwork-numbering.js?print-artwork-template-test"),
]);

const paintingFiles = [
  "mona-lisa.json",
  "lady-with-an-ermine.json",
  "vermeer-girl-with-a-pearl-earring.json",
  "view-of-delft.json",
  "van-gogh.json",
  "van-gogh-bedroom.json",
  "monet-impression-sunrise.json",
  "pont-d-argenteuil.json",
  "additional-16.json",
];
const sourceDocuments = await Promise.all(
  paintingFiles.map(async (file) => JSON.parse(await readFile(new URL(`content/paintings/${file}`, root), "utf8"))),
);
const paintings = sourceDocuments.flat();
const historicalSlugs = new Set([
  "mona-lisa",
  "vermeer-girl-with-a-pearl-earring",
  "van-gogh",
  "van-gogh-bedroom",
  "monet-impression-sunrise",
]);
const genericPaintings = paintings.filter(({ slug }) => !historicalSlugs.has(slug));

test("the generic template imports the shared numbering utility with its browser version", () => {
  assert.match(script, /^import \{ formatArtworkNumber \} from "\.\/artwork-numbering\.js\?v=1";/);
});

test("generic numbering uses only bookOrder and does not duplicate the formatter", () => {
  assert.match(script, /formatArtworkNumber\(manifest\.bookOrder, lang\)/);
  assert.doesNotMatch(script, /spreadNumber|String\(manifest\.bookOrder\)\.padStart/);
  assert.equal((script.match(/function formatArtworkNumber/g) || []).length, 0);
});

test("the HTML activation contract pairs the printable-page fallback title with v3", () => {
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
  const version = html.match(/scripts\/print-artwork\.js\?v=(\d+)/)?.[1];

  assert.ok(version === "2" || version === "3");
  if (version === "3") {
    assert.equal(title, "ARTDACI — Printable Artwork Page");
    assert.doesNotMatch(title, /Artwork Spread|Printed Spread|Double page/);
  } else {
    assert.ok(
      title === "ARTDACI — Artwork Spread" || title === "ARTDACI — Printable Artwork Page",
      "the v2 preparation may retain the legacy title until the atomic HTML activation commit",
    );
  }
});

test("dynamic page-title suffixes are localized in English, French and Arabic", () => {
  for (const title of ["Printable Artwork Page", "Page imprimable de l’œuvre", "صفحة العمل القابلة للطباعة"]) {
    assert.ok(script.includes(`pageTitle: "${title}"`), title);
  }
  assert.match(script, /document\.title = `\$\{title\} — \$\{copy\.pageTitle\}`/);
});

test("English, French and Arabic generic numbers use the canonical formatter", () => {
  assert.equal(numbering.formatArtworkNumber(2, "en"), "Artwork 002");
  assert.equal(numbering.formatArtworkNumber(2, "fr"), "Œuvre 002");
  assert.equal(numbering.formatArtworkNumber(2, "ar"), "العمل ٠٠٢");
});

test("an invalid or missing bookOrder hides the indicator without a false number", () => {
  for (const value of [undefined, null, "2", 0, -1, 2.5]) {
    assert.equal(numbering.formatArtworkNumber(value, "en"), "");
  }
  assert.match(script, /artworkNumber \? "" : " hidden"/);
});

test("all 19 generic routes retain stable slugs, bookOrder and localized titles", () => {
  assert.equal(paintings.length, 24);
  assert.equal(genericPaintings.length, 19);
  assert.deepEqual(
    genericPaintings.map(({ bookOrder }) => bookOrder).sort((a, b) => a - b),
    [2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 14, 16, 17, 18, 19, 20, 21, 22, 23],
  );
  for (const painting of genericPaintings) {
    assert.ok(painting.slug);
    assert.ok(Number.isInteger(painting.bookOrder));
    assert.ok(painting.title);
    assert.ok(painting.localizations?.fr?.title, `${painting.slug} French title`);
    assert.ok(painting.localizations?.ar?.title, `${painting.slug} Arabic title`);
  }
});

test("generic route construction remains owned by the catalogue and is unchanged", async () => {
  const catalogue = await readFile(new URL("scripts/catalogue.js", root), "utf8");
  assert.match(catalogue, /print-artwork\.html\?painting=\$\{encodeURIComponent\(slug\)\}&lang=\$\{lang\}/);
  for (const slug of ["lady-with-an-ermine", "view-of-delft", "pont-d-argenteuil"]) {
    assert.match(catalogue, new RegExp(`"${slug}": "print-artwork\\.html\\?painting=${slug}&lang=(?:en|fr|ar)"`));
  }
});

test("painting media, museum media and immersive actions remain in the rendered template", () => {
  for (const token of [
    "manifest.media.image",
    "museum.media.image",
    "gallery-vr.html?lang=${lang}",
    "ar.html?museum=${museum.slug}",
    "space.html?museum=${museum.slug}",
    "book-3d.html?lang=${lang}",
  ]) assert.ok(script.includes(token), token);
});

test("language and RTL attributes are updated while invalid languages fall back to English", () => {
  assert.match(script, /\["en", "fr", "ar"\]\.includes\(params\.get\("lang"\)\) \? params\.get\("lang"\) : "en"/);
  assert.match(script, /document\.documentElement\.dir = lang === "ar" \? "rtl" : "ltr"/);
});

test("unknown routes render an explicit error without importing application modules", () => {
  assert.match(script, /if \(!manifest\) throw new Error\(`Unknown painting: \$\{slug\}`\)/);
  assert.match(script, /root\.dataset\.error = "true"/);
  assert.match(script, /const DEFAULT_SLUG = "lady-with-an-ermine"/);
  assert.doesNotMatch(script, /(?:import|from).*\/(?:catalogue|ar-viewer)\.js/);
  assert.doesNotMatch(script, /mona-lisa/);
});
