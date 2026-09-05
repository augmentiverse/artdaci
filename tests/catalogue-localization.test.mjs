import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const {
  localizeCatalogueEntry,
  matchesCatalogueEntry,
  normalizeCatalogueLanguage,
} = await import("../scripts/catalogue.js?catalogue-localization-test");

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
const groupedPaintings = sourceDocuments.at(-1);
const mediaCatalog = await readJson(new URL("../content/media-manifests/catalog.json", import.meta.url));

test("catalogue languages normalize deterministically to en, fr or ar", () => {
  assert.equal(normalizeCatalogueLanguage("en"), "en");
  assert.equal(normalizeCatalogueLanguage("fr-FR"), "fr");
  assert.equal(normalizeCatalogueLanguage("AR_ma"), "ar");
  assert.equal(normalizeCatalogueLanguage("de"), "en");
  assert.equal(normalizeCatalogueLanguage(null), "en");
});

test("all 16 grouped paintings use their localized French and Arabic titles", () => {
  assert.equal(groupedPaintings.length, 16);
  for (const painting of groupedPaintings) {
    assert.equal(localizeCatalogueEntry(painting, "en").title, painting.title);
    assert.equal(localizeCatalogueEntry(painting, "fr").title, painting.localizations.fr.title);
    assert.equal(localizeCatalogueEntry(painting, "ar").title, painting.localizations.ar.title);
  }
});

test("missing and blank translations fall back through localized English to the base value", () => {
  const withEnglish = {
    title: "Base title",
    artist: { name: "Base artist" },
    localizations: {
      en: { title: "English title", artist: { name: "English artist" } },
      fr: { title: "   " },
    },
  };
  const localized = localizeCatalogueEntry(withEnglish, "fr");
  assert.equal(localized.title, "English title");
  assert.equal(localized.artist.name, "English artist");
  assert.equal(localizeCatalogueEntry({ title: "Base title" }, "ar").title, "Base title");
  assert.equal(localizeCatalogueEntry(null, "fr").title, "");
});

test("localization does not mutate sources or overwrite structural fields", () => {
  const source = {
    id: "stable-id",
    slug: "stable-slug",
    bookOrder: 20,
    title: "Base title",
    artist: { name: "Base artist", birthYear: 1840 },
    media: { image: "assets/stable.png" },
    ar: { availableModes: ["painting-emergence"] },
    localizations: {
      fr: {
        id: "changed-id",
        slug: "changed-slug",
        bookOrder: 99,
        title: "Titre localisé",
        media: { image: "assets/changed.png" },
        ar: { availableModes: [] },
      },
    },
  };
  const before = structuredClone(source);
  const localized = localizeCatalogueEntry(source, "fr");
  assert.deepEqual(source, before);
  assert.notEqual(localized, source);
  assert.equal(localized.id, "stable-id");
  assert.equal(localized.slug, "stable-slug");
  assert.equal(localized.bookOrder, 20);
  assert.deepEqual(localized.media, source.media);
  assert.deepEqual(localized.ar, source.ar);
  assert.equal(localized.artist.birthYear, 1840);
  assert.equal(localized.title, "Titre localisé");
});

test("localizing the catalogue preserves its 24 IDs, slugs and bookOrder positions", () => {
  const activeIds = mediaCatalog.artworks.filter(({ status }) => status === "active").map(({ id }) => id);
  assert.equal(activeIds.length, 24);
  assert.equal(new Set(activeIds).size, 24);
  for (const language of ["en", "fr", "ar"]) {
    const localized = paintings.map((painting) => localizeCatalogueEntry(painting, language));
    assert.equal(localized.length, 24);
    assert.deepEqual(localized.map(({ slug }) => slug), paintings.map(({ slug }) => slug));
    assert.deepEqual(
      [...localized].sort((a, b) => a.bookOrder - b.bookOrder).map(({ bookOrder }) => bookOrder),
      Array.from({ length: 24 }, (_, index) => index + 1),
    );
  }
});

test("mo04 has exact EN, FR and AR titles while its slugs and routes stay stable", async () => {
  const mo04 = paintings.find(({ slug }) => slug === "japanese-bridge");
  const catalogMo04 = mediaCatalog.artworks.find(({ id }) => id === "mo04");
  assert.equal(localizeCatalogueEntry(mo04, "en").title, "The Water-Lily Pond, Green Harmony");
  assert.equal(localizeCatalogueEntry(mo04, "fr").title, "Le Bassin aux nymphéas, harmonie verte");
  assert.equal(localizeCatalogueEntry(mo04, "ar").title, "بركة زنابق الماء، تناغم أخضر");
  assert.equal(mo04.slug, "japanese-bridge");
  assert.equal(catalogMo04.slug, "the-japanese-footbridge");
  assert.equal(mo04.bookOrder, 20);
  assert.equal(mo04.media.image, "assets/artists/paintings_images/monet/monet_japanese-bridge.png");
  const source = await readFile(new URL("../scripts/catalogue.js", import.meta.url), "utf8");
  assert.match(source, /print-artwork\.html\?painting=\$\{encodeURIComponent\(slug\)\}&lang=\$\{lang\}/);
});

test("localized titles and base artist names are searchable after localization", () => {
  const mo04 = paintings.find(({ slug }) => slug === "japanese-bridge");
  for (const [language, title] of [
    ["en", "The Water-Lily Pond, Green Harmony"],
    ["fr", "Le Bassin aux nymphéas, harmonie verte"],
    ["ar", "بركة زنابق الماء، تناغم أخضر"],
  ]) {
    const localized = localizeCatalogueEntry(mo04, language);
    assert.equal(matchesCatalogueEntry(localized, { query: title, movement: "" }), true);
    assert.equal(matchesCatalogueEntry(localized, { query: "Claude Monet", movement: "" }), true);
  }
});

test("canonical catalogue data never references the Orsay 1889 preparation branch", () => {
  assert.doesNotMatch(
    JSON.stringify({ sourceDocuments, mediaCatalog }),
    /vg01-orsay-1889|orsay-1889|manifest-draft/i,
  );
});
