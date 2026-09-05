import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const { formatArtworkNumber } = await import("../scripts/artwork-numbering.js?catalogue-artwork-numbering-test");
const { localizeCatalogueEntry, matchesCatalogueEntry } = await import("../scripts/catalogue.js?catalogue-artwork-numbering-test");

const paintingSources = [
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

async function readJson(url) {
  return JSON.parse(await readFile(url, "utf8"));
}

const sourceDocuments = await Promise.all(
  paintingSources.map((file) => readJson(new URL(`../content/paintings/${file}`, import.meta.url))),
);
const paintings = sourceDocuments.flat();

test("all 24 artworks have an integer bookOrder", () => {
  assert.equal(paintings.length, 24);
  assert.ok(paintings.every(({ bookOrder }) => Number.isInteger(bookOrder)));
});

test("bookOrder values are unique and continuous from 1 to 24", () => {
  assert.deepEqual(
    paintings.map(({ bookOrder }) => bookOrder).sort((a, b) => a - b),
    Array.from({ length: 24 }, (_, index) => index + 1),
  );
});

test("no active artwork defines the obsolete print.spreadNumber", () => {
  assert.ok(paintings.every(({ print }) => !Object.hasOwn(print || {}, "spreadNumber")));
});

test("the catalogue renderer uses bookOrder without a spreadNumber fallback", async () => {
  const source = await readFile(new URL("../scripts/catalogue.js", import.meta.url), "utf8");
  assert.match(source, /formatArtworkNumber\(manifest\.bookOrder, lang\)/);
  assert.doesNotMatch(source, /spreadNumber/);
});

test("English numbering runs from Artwork 001 to Artwork 024", () => {
  assert.deepEqual(
    Array.from({ length: 24 }, (_, index) => formatArtworkNumber(index + 1, "en")),
    Array.from({ length: 24 }, (_, index) => `Artwork ${String(index + 1).padStart(3, "0")}`),
  );
});

test("French numbering runs from Œuvre 001 to Œuvre 024", () => {
  assert.deepEqual(
    Array.from({ length: 24 }, (_, index) => formatArtworkNumber(index + 1, "fr")),
    Array.from({ length: 24 }, (_, index) => `Œuvre ${String(index + 1).padStart(3, "0")}`),
  );
});

test("Arabic numbering uses Eastern Arabic digits from العمل ٠٠١ to العمل ٠٢٤", () => {
  const labels = Array.from({ length: 24 }, (_, index) => formatArtworkNumber(index + 1, "ar"));
  assert.equal(labels[0], "العمل ٠٠١");
  assert.equal(labels.at(-1), "العمل ٠٢٤");
  assert.ok(labels.every((label) => !/[0-9]/.test(label)));
});

test("missing and invalid artwork numbers never produce a false label", () => {
  for (const value of [undefined, null, "1", 0, -1, 1.5, Number.NaN]) {
    assert.equal(formatArtworkNumber(value, "en"), "");
  }
});

test("the shared numbering module has no DOM, network or initialization side effects", async () => {
  const source = await readFile(new URL("../scripts/artwork-numbering.js", import.meta.url), "utf8");
  assert.doesNotMatch(source, /\b(?:document|window|fetch|XMLHttpRequest|addEventListener)\b/);
  assert.doesNotMatch(source, /^\s*import\s/m);
});

test("catalogue and AR import the same versioned utility without a circular dependency", async () => {
  const [catalogue, arViewer, numbering] = await Promise.all([
    readFile(new URL("../scripts/catalogue.js", import.meta.url), "utf8"),
    readFile(new URL("../scripts/ar-viewer.js", import.meta.url), "utf8"),
    readFile(new URL("../scripts/artwork-numbering.js", import.meta.url), "utf8"),
  ]);
  const sharedImport = /import \{ formatArtworkNumber \} from "\.\/artwork-numbering\.js\?v=1";/;
  assert.match(catalogue, sharedImport);
  assert.match(arViewer, sharedImport);
  assert.doesNotMatch(arViewer, /from "\.\/catalogue\.js/);
  assert.doesNotMatch(numbering, /from "\.\/(?:catalogue|ar-viewer)\.js/);
});

test("localization preserves every artwork id, slug and bookOrder", () => {
  const identity = paintings.map(({ id, slug, bookOrder }) => ({ id, slug, bookOrder }));
  for (const language of ["en", "fr", "ar"]) {
    const localizedIdentity = paintings
      .map((painting) => localizeCatalogueEntry(painting, language))
      .map(({ id, slug, bookOrder }) => ({ id, slug, bookOrder }));
    assert.deepEqual(localizedIdentity, identity);
  }
});

test("the four artists remain four consecutive blocks of six", () => {
  const artists = [...paintings]
    .sort((a, b) => a.bookOrder - b.bookOrder)
    .map(({ artist }) => artist.name);
  assert.deepEqual(artists, [
    ...Array(6).fill("Leonardo da Vinci"),
    ...Array(6).fill("Johannes Vermeer"),
    ...Array(6).fill("Vincent van Gogh"),
    ...Array(6).fill("Claude Monet"),
  ]);
});

test("mo04 remains localized and searchable in English, French and Arabic", () => {
  const mo04 = paintings.find(({ slug }) => slug === "japanese-bridge");
  for (const [language, title] of [
    ["en", "The Water-Lily Pond, Green Harmony"],
    ["fr", "Le Bassin aux nymphéas, harmonie verte"],
    ["ar", "بركة زنابق الماء، تناغم أخضر"],
  ]) {
    const localized = localizeCatalogueEntry(mo04, language);
    assert.equal(localized.title, title);
    assert.equal(matchesCatalogueEntry(localized, { query: title, movement: "" }), true);
  }
});
