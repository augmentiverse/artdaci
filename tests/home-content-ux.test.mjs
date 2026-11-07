import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const pages = ["index.html", "index-fr.html", "index-ar.html"];
const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("homepages expose compact, accessible navigation and catalogue controls", async () => {
  for (const page of pages) {
    const html = await read(page);
    assert.match(html, /styles\/home-ux\.css\?v=1/);
    assert.match(html, /scripts\/home-ux\.js\?v=1/);
    assert.match(html, /<details class="hv2-mobile-menu">/);
    assert.match(html, /<nav class="hv2-mobile-menu-nav" aria-label="[^"]+">/);
    assert.match(html, /id="catalogue-app"[\s\S]*?data-compact="true"/);
    assert.equal((html.match(/scripts\/catalogue\.js\?v=18/g) || []).length, 1, page);
    assert.match(html, /<meta property="og:image" content="https:\/\/artdaci\.com\/assets\/varia\/artdaci-book-cover\.webp" \/>/);
    assert.match(html, /class="hv2-curatorial-note"/);
  }
});

test("mobile UX stylesheet replaces the clipped navigation and reduces overlays", async () => {
  const css = await read("styles/home-ux.css");
  assert.match(css, /@media \(max-width: 780px\)[\s\S]*?\.home-v2 \.hv2-header > \.hv2-nav\s*\{\s*display: none;/);
  assert.match(css, /@media \(max-width: 780px\)[\s\S]*?\.home-v2 \.hv2-mobile-menu\s*\{[\s\S]*?display: block;/);
  assert.match(css, /\.home-v2 \[id\]\s*\{\s*scroll-margin-top: 96px;/);
  assert.match(css, /@media \(max-width: 640px\)[\s\S]*?\.home-v2 \.visitor-guide-link\s*\{[\s\S]*?width: 48px;[\s\S]*?height: 48px;/);
});

test("French catalogue content is complete and avoids unknown dimension placeholders", async () => {
  const catalogue = await import(`../scripts/catalogue.js?home-content-ux=${Date.now()}`);
  const sourceFiles = [
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
  const groups = await Promise.all(sourceFiles.map(async (file) => JSON.parse(await read(`content/paintings/${file}`))));
  const paintings = groups.flat();
  assert.equal(paintings.length, 24);

  for (const painting of paintings) {
    const french = catalogue.localizeCatalogueEntry(painting, "fr");
    assert.ok(french.texts?.artisticAnalysis?.trim(), `${painting.slug} needs a French summary`);
    assert.ok(french.localizedMovement.every((label) => label.trim()), `${painting.slug} needs movement labels`);
  }
  assert.equal(
    catalogue.localizeCatalogueEntry(paintings.find(({ slug }) => slug === "mona-lisa"), "fr").title,
    "La Joconde",
  );

  const source = await read("scripts/catalogue.js");
  assert.match(source, /const compactLimit = 8;/);
  assert.match(source, /showAll: "Afficher les \{count\} œuvres"/);
  assert.doesNotMatch(source, /\? x \? cm/);
  assert.doesNotMatch(source, /\|\| "\?"/);
});

test("French labels use RA consistently and the museum discovery links stay compact", async () => {
  const french = await read("index-fr.html");
  assert.match(french, /Art · Histoires · Relations · RA · 3D · VR · Musées/);
  assert.match(french, /Scanner le livre · RA/);
  assert.doesNotMatch(french, />[^<]*(?:Scanner le livre · AR|AR multi-tableaux)[^<]*</);

  const museums = await read("museums.html");
  assert.match(museums, /class="discovery-links"/);
  assert.match(museums, /id="brand-subtitle">Explorateur de musées</);
  assert.match(museums, /grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(museums, /Atlas des 17 musées ↗/);
  assert.match(museums, /Street View 360° ↗/);
  assert.match(museums, /Google Earth · 17 musées ↗/);
});
