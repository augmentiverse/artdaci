import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const html = readFileSync(new URL("../reimagined.html", import.meta.url), "utf8");
const script = readFileSync(new URL("../scripts/reimagined.js", import.meta.url), "utf8");

test("reimagined gallery includes four artist stories and five group images", () => {
  for (const artist of ["leonardo", "vermeer", "vangogh", "monet"]) {
    assert.match(html, new RegExp(`id="${artist}-stills"`));
  }
  assert.match(html, /id="group-stills"/);

  const sources = [...html.matchAll(/<img[^>]+src="(https:\/\/media\.artdaci\.com\/shared\/images\/(?:artists|groups)\/reimagined\/[^"]+)"/g)].map((match) => match[1]);
  const uniqueSources = [...new Set(sources)];
  assert.equal(uniqueSources.length, 15);
  assert.equal(uniqueSources.filter((source) => source.includes("/groups/reimagined/")).length, 5);
  assert.equal(uniqueSources.filter((source) => source.endsWith(".webp")).length, 10);
  assert.equal(uniqueSources.filter((source) => source.endsWith(".png")).length, 5);
});

test("every localized gallery key is available in English, French and Arabic", () => {
  const attributes = [...html.matchAll(/data-l10n(?:-alt|-aria)?="([^"]+)"/g)].map((match) => match[1]);
  for (const key of new Set(attributes)) {
    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const occurrences = script.match(new RegExp(`\\b${escaped}:`, "g")) ?? [];
    assert.equal(occurrences.length, 3, `${key} should be translated in all three languages`);
  }
});

test("image gallery has an accessible lightbox and no missing legacy hero movie", () => {
  assert.match(html, /<dialog[^>]+id="r-lightbox"/);
  assert.match(html, /class="r-lightbox-close"[^>]+aria-label="Close image"/);
  assert.match(script, /lightbox\.showModal\(\)/);
  assert.doesNotMatch(html, /mona-lisa_out-of-the-book\.mp4/);
});


