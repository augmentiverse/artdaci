import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
import { formatArtworkDimensions } from "../scripts/catalogue.js?audit-dimensions-test";

const guides = { fr: "atlas.html", en: "atlas-en.html", ar: "atlas-ar.html" };

test("guide language navigation uses valid pages and provides canonical and hreflang metadata", async () => {
  for (const [language, filename] of Object.entries(guides)) {
    const html = await readFile(new URL("../" + filename, import.meta.url), "utf8");
    assert.ok(html.includes('<html lang="' + language + '"'), filename);
    assert.doesNotMatch(html, /atlas-fr\.html/);
    const nav = html.match(/<nav class="guide-actions"[^>]*>([\s\S]*?)<\/nav>/)?.[1];
    assert.ok(nav, filename + " language navigation");
    assert.ok(html.includes('rel="canonical" href="https://artdaci.com/' + filename + '"'));
    for (const [alternateLanguage, target] of Object.entries(guides)) {
      assert.ok(html.includes('rel="alternate" hreflang="' + alternateLanguage + '" href="https://artdaci.com/' + target + '"'));
      if (alternateLanguage !== language) {
        assert.ok(nav.includes('href="' + target + '"'), filename + " -> " + target);
        await access(new URL("../" + target, import.meta.url));
      }
    }
    assert.ok(html.includes('rel="alternate" hreflang="x-default" href="https://artdaci.com/atlas-en.html"'));
  }
});

test("catalogue dimensions remain hidden until both positive numerical values are present", async () => {
  assert.equal(formatArtworkDimensions({ heightCm: 77, widthCm: 53 }), "77 × 53 cm");
  assert.equal(formatArtworkDimensions({ heightCm: 67.5, widthCm: 45 }), "67.5 × 45 cm");
  for (const input of [null, undefined, {}, { heightCm: 77 }, { widthCm: 53 },
    { heightCm: 0, widthCm: 53 }, { heightCm: -10, widthCm: 53 },
    { heightCm: "77", widthCm: 53 }, { heightCm: NaN, widthCm: 53 },
    { heightCm: Infinity, widthCm: 53 }]) {
    assert.equal(formatArtworkDimensions(input), "");
  }
  const source = await readFile(new URL("../scripts/catalogue.js", import.meta.url), "utf8");
  assert.ok(source.includes("const dimensions = formatArtworkDimensions(manifest.dimensions);"));
  assert.ok(source.includes("dimensions ?"));
  assert.doesNotMatch(source, /\?\s*x\s*\?\s*cm/);
});

test("all 24 artwork records format available dimensions without fabricated values", async () => {
  const filenames = ["mona-lisa.json", "lady-with-an-ermine.json", "vermeer-girl-with-a-pearl-earring.json",
    "view-of-delft.json", "van-gogh.json", "van-gogh-bedroom.json", "monet-impression-sunrise.json",
    "pont-d-argenteuil.json", "additional-16.json"];
  const documents = await Promise.all(filenames.map(async (name) =>
    JSON.parse(await readFile(new URL("../content/paintings/" + name, import.meta.url), "utf8"))));
  const artworks = documents.flat();
  assert.equal(artworks.length, 24);
  for (const artwork of artworks) {
    const dimensions = formatArtworkDimensions(artwork.dimensions);
    assert.ok(!dimensions || /^\d+(?:\.\d+)? × \d+(?:\.\d+)? cm$/.test(dimensions), artwork.slug);
  }
});

test("all three homepages point to the updated catalogue renderer", async () => {
  for (const page of ["index.html", "index-fr.html", "index-ar.html"]) {
    const html = await readFile(new URL("../" + page, import.meta.url), "utf8");
    assert.ok(html.includes('scripts/catalogue.js?v=22'), page);
  }
});
