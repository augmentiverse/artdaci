import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const cases = [
  {
    file: "index.html",
    message: "Featured printable artwork pages",
    numbers: ["Artwork 001", "Artwork 009", "Artwork 013", "Artwork 015"],
    titles: ["Mona Lisa", "Girl with a Pearl Earring", "Self-Portrait", "The Bedroom"],
    cta: "Open printable artwork page",
    routes: [
      "print-target.html",
      "print-vermeer-girl-with-a-pearl-earring.html",
      "print-van-gogh.html",
      "print-van-gogh-bedroom.html",
    ],
  },
  {
    file: "index-fr.html",
    message: "Sélection de pages d’œuvres imprimables",
    numbers: ["Œuvre 001", "Œuvre 009", "Œuvre 013", "Œuvre 015"],
    titles: ["La Joconde", "La Jeune Fille à la perle", "Autoportrait", "La Chambre"],
    cta: "Ouvrir la page imprimable",
    routes: [
      "print-target-fr.html",
      "print-vermeer-girl-with-a-pearl-earring-fr.html",
      "print-van-gogh-fr.html",
      "print-van-gogh-bedroom-fr.html",
    ],
  },
  {
    file: "index-ar.html",
    message: "مجموعة مختارة من صفحات الأعمال القابلة للطباعة",
    numbers: ["العمل ٠٠١", "العمل ٠٠٩", "العمل ٠١٣", "العمل ٠١٥"],
    titles: ["الموناليزا", "الفتاة ذات القرط اللؤلؤي", "بورتريه ذاتي", "غرفة النوم"],
    cta: "فتح صفحة العمل القابلة للطباعة",
    routes: [
      "print-ar.html?painting=mona-lisa",
      "print-ar.html?painting=vermeer-girl-with-a-pearl-earring",
      "print-ar.html?painting=van-gogh",
      "print-ar.html?painting=van-gogh-bedroom",
    ],
  },
];

const imagePaths = [
  "assets/artists/leonardo-da-vinci/artworks/mona-lisa/images/mona-lisa.jpg",
  "assets/artists/johannes-vermeer/artworks/girl-with-a-pearl-earring/images/vermeer-girl-with-a-pearl-earring.jpg",
  "assets/artists/vincent-van-gogh/artworks/self-portrait/images/van-gogh-portrait.jpg",
  "assets/artists/vincent-van-gogh/artworks/the-bedroom/images/bed-van-gogh.jpeg",
];

function extractFallback(source) {
  const start = source.indexOf('<div class="static-index">');
  assert.notEqual(start, -1, "static fallback exists");
  const end = source.indexOf("</section>", start);
  assert.notEqual(end, -1, "static fallback stays inside the catalogue section");
  return source.slice(start, end);
}

test("static catalogue fallbacks expose the same four featured artworks in all languages", async () => {
  for (const expected of cases) {
    const source = await readFile(new URL(`../${expected.file}`, import.meta.url), "utf8");
    const fallback = extractFallback(source);
    const cards = [...fallback.matchAll(/<article class="artwork-card">([\s\S]*?)<\/article>/g)].map((match) => match[1]);

    assert.equal(cards.length, 4, expected.file);
    assert.ok(fallback.includes(expected.message), expected.message);
    assert.deepEqual(
      cards.map((card) => card.match(/<p class="eyebrow">([^<]+)<\/p>/)?.[1]),
      expected.numbers,
      `${expected.file} artwork order`,
    );
    assert.deepEqual(
      cards.map((card) => card.match(/<h3>([^<]+)<\/h3>/)?.[1]),
      expected.titles,
      `${expected.file} titles`,
    );

    cards.forEach((card, index) => {
      const route = expected.routes[index].replaceAll("&", "&amp;");
      assert.ok(card.includes(`<a class="artwork-image" href="${route}">`), `${expected.file} image route ${route}`);
      assert.ok(card.includes(`<a class="button primary" href="${route}">${expected.cta}</a>`), `${expected.file} CTA ${route}`);
      assert.ok(card.includes(`src="${imagePaths[index]}"`), `${expected.file} image ${imagePaths[index]}`);
      assert.match(card, /<img [^>]*alt="[^"]+"/);
    });

    assert.doesNotMatch(fallback, /(?:Spread|Double page) 00[234]/);
    assert.equal((source.match(/scripts\/catalogue\.js\?v=14/g) || []).length, 1, expected.file);
    assert.doesNotMatch(source, /scripts\/catalogue\.js\?v=13/);
  }
});

test("all static fallback image sources and print destinations exist locally", async () => {
  for (const path of imagePaths) await access(new URL(`../${path}`, import.meta.url));
  for (const expected of cases) {
    for (const route of expected.routes) {
      const pathname = route.split("?")[0];
      await access(new URL(`../${pathname}`, import.meta.url));
    }
  }
});

test("dynamic print route mappings remain aligned with the static selection", async () => {
  const source = await readFile(new URL("../scripts/catalogue.js", import.meta.url), "utf8");
  const printPages = source.match(/const PRINT_PAGES = \{[\s\S]*?\n\};/)?.[0] || "";
  const slugs = ["mona-lisa", "vermeer-girl-with-a-pearl-earring", "van-gogh", "van-gogh-bedroom"];

  for (const [languageIndex, expected] of cases.entries()) {
    expected.routes.forEach((route, routeIndex) => {
      assert.ok(
        printPages.includes(`"${slugs[routeIndex]}": "${route}"`),
        `${expected.file} keeps its dynamic ${slugs[routeIndex]} route`,
      );
    });
    assert.equal(expected.routes.length, 4, `language ${languageIndex + 1}`);
  }
});
