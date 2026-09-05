import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const pages = [
  {
    file: "print-target.html",
    title: "Mona Lisa - Printable Artwork Page",
    eyebrow: "Artwork 001 - High Renaissance",
    essentials: [
      "https://media.artdaci.com/artworks/ld01/manifest.json",
      "assets/artists/leonardo-da-vinci/artworks/mona-lisa/images/mona-lisa.jpg",
      "ar.html?painting=mona-lisa&amp;lang=en",
      "space.html?painting=mona-lisa&amp;lang=en&amp;v=11",
      "scripts/artwork-media-manifest.js?v=1",
    ],
  },
  {
    file: "print-target-fr.html",
    title: "Mona Lisa - Page imprimable de l’œuvre",
    eyebrow: "Œuvre 001 - Haute Renaissance",
    essentials: [
      "https://media.artdaci.com/artworks/ld01/manifest.json",
      "assets/artists/leonardo-da-vinci/artworks/mona-lisa/images/mona-lisa.jpg",
      "ar.html?painting=mona-lisa&amp;lang=fr",
      "space.html?painting=mona-lisa&amp;lang=fr&amp;v=10",
      "scripts/artwork-media-manifest.js?v=1",
    ],
  },
  {
    file: "print-vermeer-girl-with-a-pearl-earring.html",
    title: "Vermeer Girl with a Pearl Earring - Printable Artwork Page",
    eyebrow: "The Dutch Golden Age · Artwork 009",
    essentials: [
      "https://media.artdaci.com/artworks/ve01/manifest.json",
      "assets/artists/johannes-vermeer/artworks/girl-with-a-pearl-earring/images/vermeer-girl-with-a-pearl-earring.jpg",
      "ar.html?painting=vermeer-girl-with-a-pearl-earring&amp;lang=en",
      "space.html?painting=vermeer-girl-with-a-pearl-earring&amp;lang=en",
      "scripts/artwork-media-manifest.js?v=3",
    ],
  },
  {
    file: "print-vermeer-girl-with-a-pearl-earring-fr.html",
    title: "Vermeer La Jeune Fille à la perle - Page imprimable de l’œuvre",
    eyebrow: "Le Siècle d'or néerlandais · Œuvre 009",
    essentials: [
      "https://media.artdaci.com/artworks/ve01/manifest.json",
      "assets/artists/johannes-vermeer/artworks/girl-with-a-pearl-earring/images/vermeer-girl-with-a-pearl-earring.jpg",
      "ar.html?painting=vermeer-girl-with-a-pearl-earring&amp;lang=fr",
      "space.html?painting=vermeer-girl-with-a-pearl-earring&amp;lang=fr",
      "scripts/artwork-media-manifest.js?v=3",
    ],
  },
  {
    file: "print-van-gogh.html",
    title: "Van Gogh Self-Portrait - Printable Artwork Page",
    eyebrow: "Artwork 013 - Post-Impressionism",
    essentials: [
      "https://media.artdaci.com/artworks/vg01/manifest.json",
      "assets/artists/vincent-van-gogh/artworks/self-portrait/images/van-gogh-portrait.jpg",
      "ar.html?painting=van-gogh&amp;lang=en",
      "space.html?painting=van-gogh&amp;lang=en&amp;v=10",
      "scripts/artwork-media-manifest.js?v=3",
    ],
  },
  {
    file: "print-van-gogh-fr.html",
    title: "Autoportrait de Van Gogh - Page imprimable de l’œuvre",
    eyebrow: "Œuvre 013 - Post-impressionnisme",
    essentials: [
      "https://media.artdaci.com/artworks/vg01/manifest.json",
      "assets/artists/vincent-van-gogh/artworks/self-portrait/images/van-gogh-portrait.jpg",
      "ar.html?painting=van-gogh&amp;lang=fr",
      "space.html?painting=van-gogh&amp;lang=fr&amp;v=10",
      "scripts/artwork-media-manifest.js?v=3",
    ],
  },
  {
    file: "print-van-gogh-bedroom.html",
    title: "Van Gogh The Bedroom - Printable Artwork Page",
    eyebrow: "Artwork 015 - Post-Impressionism",
    essentials: [
      "assets/artists/vincent-van-gogh/artworks/the-bedroom/images/bed-van-gogh.jpeg",
      "assets/artists/vincent-van-gogh/artworks/the-bedroom/media/van-gogh-bedroom-en.mp3",
      "ar.html?painting=van-gogh-bedroom&amp;lang=en",
      "space.html?painting=van-gogh-bedroom&amp;lang=en&amp;v=10",
      "scripts/painting-museum.js?v=1",
    ],
  },
  {
    file: "print-van-gogh-bedroom-fr.html",
    title: "La Chambre de Van Gogh - Page imprimable de l’œuvre",
    eyebrow: "Œuvre 015 - Post-impressionnisme",
    essentials: [
      "assets/artists/vincent-van-gogh/artworks/the-bedroom/images/bed-van-gogh.jpeg",
      "assets/artists/vincent-van-gogh/artworks/the-bedroom/media/van-gogh-la-chambre-fr.mp3",
      "ar.html?painting=van-gogh-bedroom&amp;lang=fr",
      "space.html?painting=van-gogh-bedroom&amp;lang=fr&amp;v=10",
      "scripts/painting-museum.js?v=1",
    ],
  },
  {
    file: "print-monet-impression-sunrise.html",
    title: "Monet — Impression, Sunrise — Printable Artwork Page",
    eyebrow: "Artwork 024 · Impressionism",
    essentials: [
      "assets/artists/claude-monet/collection/impression-sunrise-monet.png",
      "assets/artists/claude-monet/artworks/impression-sunrise/media/monet-s-optical-illusion-that-birthed-impressionism.mp3",
      "gallery-vr.html?lang=en&amp;artist=monet",
      "print-ar.html?painting=monet-impression-sunrise",
      "scripts/painting-museum.js?v=1",
    ],
  },
  {
    file: "print-monet-impression-sunrise-fr.html",
    title: "Monet — Impression, soleil levant — Page imprimable de l’œuvre",
    eyebrow: "Œuvre 024 · Impressionnisme",
    essentials: [
      "assets/artists/claude-monet/collection/impression-sunrise-monet.png",
      "assets/artists/claude-monet/artworks/impression-sunrise/media/le-hack-neurologique-du-soleil-de-monet.mp3",
      "gallery-vr.html?lang=fr&amp;artist=monet",
      "print-ar.html?painting=monet-impression-sunrise",
      "scripts/painting-museum.js?v=1",
    ],
  },
];

function extract(source, pattern, label) {
  const match = source.match(pattern);
  assert.ok(match, label);
  return match[1].trim();
}

test("historical print pages use canonical artwork numbers and printable-page titles", async () => {
  assert.equal(pages.length, 10);

  for (const expected of pages) {
    const source = await readFile(new URL(`../${expected.file}`, import.meta.url), "utf8");
    const title = extract(source, /<title>([^<]+)<\/title>/, `${expected.file} title`);
    const eyebrow = extract(source, /<p class="eyebrow">([^<]+)<\/p>/, `${expected.file} primary eyebrow`);

    assert.equal(title, expected.title, `${expected.file} title`);
    assert.equal(eyebrow, expected.eyebrow, `${expected.file} artwork number`);
    assert.doesNotMatch(title, /Printed Catalogue Spread|Double page de catalogue|Double page imprimée/);
    assert.doesNotMatch(eyebrow, /\bSpread\s+00[1-5]\b|Double page\s+00[1-5]\b/);
  }
});

test("historical print page routes, media fallbacks and script versions stay intact", async () => {
  for (const expected of pages) {
    const source = await readFile(new URL(`../${expected.file}`, import.meta.url), "utf8");
    for (const value of expected.essentials) {
      assert.ok(source.includes(value), `${expected.file} keeps ${value}`);
    }
  }
});

test("active VG01 content remains the historical 1887 release", async () => {
  const [painting, manifest] = await Promise.all([
    readFile(new URL("../content/paintings/van-gogh.json", import.meta.url), "utf8").then(JSON.parse),
    readFile(new URL("../content/media-manifests/artworks/vg01/manifest.json", import.meta.url), "utf8").then(JSON.parse),
  ]);

  assert.equal(painting.id, "vincent-van-gogh-self-portrait-1887");
  assert.equal(painting.date, "1887");
  assert.equal(
    painting.print.imageTargetSource,
    "assets/artists/vincent-van-gogh/artworks/self-portrait/images/van-gogh-portrait.jpg",
  );
  assert.equal(manifest.id, "vg01");
  assert.equal(manifest.artwork.date, "1887");
  assert.equal(manifest.media.images.main.path, "images/main.jpg");
  assert.equal(manifest.media.images.main.available, true);
  assert.equal(manifest.media.images.main.migrationStatus, "published");
});
