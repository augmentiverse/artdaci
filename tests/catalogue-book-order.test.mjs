import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

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

const expectedOrder = [
  { id: "ld01", canonicalSlug: "mona-lisa", runtimeSlug: "mona-lisa", artist: "Leonardo da Vinci" },
  { id: "ld03", canonicalSlug: "the-last-supper", runtimeSlug: "last-supper", artist: "Leonardo da Vinci" },
  { id: "ld06", canonicalSlug: "la-belle-ferronniere", runtimeSlug: "belle-ferronniere", artist: "Leonardo da Vinci" },
  { id: "ld02", canonicalSlug: "lady-with-an-ermine", runtimeSlug: "lady-with-an-ermine", artist: "Leonardo da Vinci" },
  { id: "ld05", canonicalSlug: "ginevra-de-benci", runtimeSlug: "ginevra-de-benci", artist: "Leonardo da Vinci" },
  { id: "ld04", canonicalSlug: "annunciation", runtimeSlug: "annunciation", artist: "Leonardo da Vinci" },
  { id: "ve05", canonicalSlug: "the-astronomer", runtimeSlug: "vermeer-astronomer", artist: "Johannes Vermeer" },
  { id: "ve04", canonicalSlug: "the-art-of-painting", runtimeSlug: "art-of-painting", artist: "Johannes Vermeer" },
  { id: "ve01", canonicalSlug: "girl-with-a-pearl-earring", runtimeSlug: "vermeer-girl-with-a-pearl-earring", artist: "Johannes Vermeer" },
  { id: "ve06", canonicalSlug: "woman-holding-a-balance", runtimeSlug: "woman-holding-balance", artist: "Johannes Vermeer" },
  { id: "ve02", canonicalSlug: "view-of-delft", runtimeSlug: "view-of-delft", artist: "Johannes Vermeer" },
  { id: "ve03", canonicalSlug: "the-milkmaid", runtimeSlug: "vermeer-milkmaid", artist: "Johannes Vermeer" },
  { id: "vg01", canonicalSlug: "self-portrait", runtimeSlug: "van-gogh", artist: "Vincent van Gogh" },
  { id: "vg03", canonicalSlug: "the-starry-night", runtimeSlug: "starry-night", artist: "Vincent van Gogh" },
  { id: "vg02", canonicalSlug: "bedroom-in-arles", runtimeSlug: "van-gogh-bedroom", artist: "Vincent van Gogh" },
  { id: "vg05", canonicalSlug: "cafe-terrace-at-night", runtimeSlug: "cafe-terrace", artist: "Vincent van Gogh" },
  { id: "vg06", canonicalSlug: "the-night-cafe", runtimeSlug: "night-cafe", artist: "Vincent van Gogh" },
  { id: "vg04", canonicalSlug: "sunflowers", runtimeSlug: "sunflowers", artist: "Vincent van Gogh" },
  { id: "mo03", canonicalSlug: "water-lilies", runtimeSlug: "water-lilies", artist: "Claude Monet" },
  { id: "mo04", canonicalSlug: "the-japanese-footbridge", runtimeSlug: "japanese-bridge", artist: "Claude Monet" },
  { id: "mo06", canonicalSlug: "woman-with-a-parasol", runtimeSlug: "woman-with-parasol", artist: "Claude Monet" },
  { id: "mo02", canonicalSlug: "the-bridge-at-argenteuil", runtimeSlug: "pont-d-argenteuil", artist: "Claude Monet" },
  { id: "mo05", canonicalSlug: "poppies", runtimeSlug: "poppies", artist: "Claude Monet" },
  { id: "mo01", canonicalSlug: "impression-sunrise", runtimeSlug: "monet-impression-sunrise", artist: "Claude Monet" },
];

async function readJson(url) {
  return JSON.parse(await readFile(url, "utf8"));
}

const sourceDocuments = await Promise.all(
  paintingSources.map((file) => readJson(new URL(`../content/paintings/${file}`, import.meta.url))),
);
const paintings = sourceDocuments.flat();
const mediaCatalog = await readJson(new URL("../content/media-manifests/catalog.json", import.meta.url));
const activeCatalog = mediaCatalog.artworks.filter((artwork) => artwork.status === "active");

test("the catalogue contains 24 active artworks with unique canonical IDs and runtime slugs", () => {
  assert.equal(paintings.length, 24);
  assert.equal(activeCatalog.length, 24);
  assert.equal(new Set(activeCatalog.map(({ id }) => id)).size, 24);
  assert.equal(new Set(paintings.map(({ slug }) => slug)).size, 24);
  assert.deepEqual(
    new Set(activeCatalog.map(({ id }) => id)),
    new Set(expectedOrder.map(({ id }) => id)),
  );
});

test("bookOrder is an integer, unique, continuous and matches the exact book sequence", () => {
  const ordered = [...paintings].sort((a, b) => a.bookOrder - b.bookOrder);
  assert.deepEqual(ordered.map(({ bookOrder }) => bookOrder), Array.from({ length: 24 }, (_, index) => index + 1));
  assert.ok(ordered.every(({ bookOrder }) => Number.isInteger(bookOrder)));
  assert.deepEqual(ordered.map(({ slug }) => slug), expectedOrder.map(({ runtimeSlug }) => runtimeSlug));
});

test("the four artists occupy continuous blocks of six artworks", () => {
  const orderedArtists = [...paintings]
    .sort((a, b) => a.bookOrder - b.bookOrder)
    .map(({ artist }) => artist.name);
  assert.deepEqual(orderedArtists, expectedOrder.map(({ artist }) => artist));
  for (const artist of ["Leonardo da Vinci", "Johannes Vermeer", "Vincent van Gogh", "Claude Monet"]) {
    assert.equal(orderedArtists.filter((name) => name === artist).length, 6);
  }
});

test("canonical IDs and public slugs remain paired with their historical runtime slugs", () => {
  const activeById = new Map(activeCatalog.map((artwork) => [artwork.id, artwork]));
  for (const expected of expectedOrder) {
    assert.equal(activeById.get(expected.id)?.slug, expected.canonicalSlug);
    assert.ok(paintings.some(({ slug }) => slug === expected.runtimeSlug));
  }
});

test("mo04 uses the precise Orsay identity while preserving its existing slugs and media path", () => {
  const mo04 = paintings.find(({ slug }) => slug === "japanese-bridge");
  const catalogMo04 = activeCatalog.find(({ id }) => id === "mo04");
  assert.equal(mo04.title, "The Water-Lily Pond, Green Harmony");
  assert.equal(mo04.localizations.fr.title, "Le Bassin aux nymphéas, harmonie verte");
  assert.equal(mo04.date, "1899");
  assert.deepEqual(mo04.currentLocation, { museum: "Musée d’Orsay", city: "Paris", country: "France" });
  assert.equal(mo04.media.image, "assets/artists/paintings_images/monet/monet_japanese-bridge.png");
  assert.equal(catalogMo04.slug, "the-japanese-footbridge");
  assert.deepEqual(catalogMo04.title, {
    fr: "Le Bassin aux nymphéas, harmonie verte",
    en: "The Water-Lily Pond, Green Harmony",
  });
});

test("existing print route inputs remain available without an Orsay 1889 draft reference", async () => {
  const catalogueSource = await readFile(new URL("../scripts/catalogue.js", import.meta.url), "utf8");
  for (const slug of [
    "mona-lisa",
    "lady-with-an-ermine",
    "van-gogh",
    "van-gogh-bedroom",
    "vermeer-girl-with-a-pearl-earring",
    "view-of-delft",
    "monet-impression-sunrise",
    "pont-d-argenteuil",
  ]) {
    assert.match(catalogueSource, new RegExp(`"${slug}"\\s*:`));
  }
  const canonicalData = JSON.stringify({ sourceDocuments, mediaCatalog });
  assert.doesNotMatch(canonicalData, /vg01-orsay-1889|orsay-1889|manifest-draft/i);
});

test("the active vg01 media manifest remains byte-for-byte the Chicago 1887 release", async () => {
  const manifest = await readFile(new URL("../content/media-manifests/artworks/vg01/manifest.json", import.meta.url));
  assert.equal(manifest.byteLength, 5437);
  assert.equal(
    createHash("sha256").update(manifest).digest("hex"),
    "b6ea17a1dfa70c060d99cab43d573c5bd9ea7fd0a3dd3e5e8ff20e0316794abb",
  );
});
