import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const cases = [
  {
    page: "index.html",
    language: "en",
    routes: [
      "print-target.html",
      "print-vermeer-girl-with-a-pearl-earring.html",
      "print-van-gogh.html",
      "print-monet-impression-sunrise.html",
    ],
    titles: ["Mona Lisa", "Girl with a Pearl Earring", "Self-Portrait", "Impression, Sunrise"],
  },
  {
    page: "index-fr.html",
    language: "fr",
    routes: [
      "print-target-fr.html",
      "print-vermeer-girl-with-a-pearl-earring-fr.html",
      "print-van-gogh-fr.html",
      "print-monet-impression-sunrise-fr.html",
    ],
    titles: ["La Joconde", "La Jeune Fille à la perle", "Autoportrait", "Impression, soleil levant"],
  },
  {
    page: "index-ar.html",
    language: "ar",
    routes: [
      "print-ar.html?painting=mona-lisa",
      "print-ar.html?painting=vermeer-girl-with-a-pearl-earring",
      "print-ar.html?painting=van-gogh",
      "print-ar.html?painting=monet-impression-sunrise",
    ],
    titles: ["الموناليزا", "الفتاة ذات القرط اللؤلؤي", "بورتريه ذاتي", "انطباع، شروق الشمس"],
  },
];

const images = [
  "assets/artists/leonardo-da-vinci/collection/mana-lisa-davinci.webp",
  "assets/artists/johannes-vermeer/collection/girl-with-a-pearl-earring-vermeer.webp",
  "assets/artists/vincent-van-gogh/artworks/self-portrait/images/self-portrait-orsay-1889-v1.webp",
  "assets/artists/claude-monet/collection/impression-sunrise-monet.webp",
];

test("the current four featured masterpieces remain visible and linked in each language", async () => {
  for (const c of cases) {
    const html = await readFile(new URL("../" + c.page, import.meta.url), "utf8");
    const section = html.match(/<div class="hv2-featured-grid">([\s\S]*?)<\/div>\s*<\/section>/)?.[1];
    assert.ok(section, c.page + " featured artwork section exists");
    const cards = [...section.matchAll(/<a class="hv2-work" href="([^"]+)">([\s\S]*?)<\/a>/g)];
    assert.equal(cards.length, 4, c.page + " contains exactly four featured works");
    cards.forEach((card, i) => {
      assert.equal(card[1], c.routes[i], c.page + " artwork route " + i);
      assert.ok(card[2].includes("<strong>" + c.titles[i] + "</strong>"), c.page + " title " + i);
      assert.ok(card[2].includes('src="' + images[i] + '"'), c.page + " image " + i);
      assert.match(card[2], /<img [^>]*alt="[^"]+"/, c.page + " accessible alt " + i);
    });
  }
});

test("featured thumbnails and destination files exist", async () => {
  for (const image of images) await access(new URL("../" + image, import.meta.url));
  for (const c of cases) {
    for (const route of c.routes) {
      await access(new URL("../" + route.split("?")[0], import.meta.url));
    }
  }
});

test("all homepages expose the 24-artwork searchable catalogue and module", async () => {
  for (const c of cases) {
    const html = await readFile(new URL("../" + c.page, import.meta.url), "utf8");
    assert.ok(html.includes('id="painting-index"'), c.page);
    assert.ok(html.includes('id="catalogue-app"'), c.page);
    assert.ok(html.includes('data-lang="' + c.language + '"'), c.page);
    assert.ok(html.includes("content/paintings/additional-16.json"), c.page);
    assert.ok(html.includes('scripts/catalogue.js?v=23'), c.page);
    assert.ok(html.includes("<noscript>"), c.page + " provides a no-JS explanation");
  }
});

test("dynamic printable routes are provided for non-featured artworks", async () => {
  const catalogue = await readFile(new URL("../scripts/catalogue.js", import.meta.url), "utf8");
  assert.ok(catalogue.includes('print-artwork.html?painting='));
  assert.match(catalogue, /print-artwork\.html\?painting=\$\{encodeURIComponent\(slug\)\}&lang=\$\{lang\}/);
});
