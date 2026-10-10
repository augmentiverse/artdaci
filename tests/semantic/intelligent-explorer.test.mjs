import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { test } from "node:test";

const root = new URL("../../", import.meta.url);
const read = async (p) => fs.readFile(new URL(p, root), "utf8");
const readJson = async (p) => JSON.parse(await read(p));

test("the catalogue has 24 active works, while four have reviewed profiles", async () => {
  const catalogue = await readJson("content/media-manifests/catalog.json");
  const document = await readJson("content/semantics/artwork-concepts.json");
  const active = catalogue.artworks.filter((work) => work.status === "active");
  const profiles = new Set(document.artworks.map((work) => work.id));
  assert.equal(active.length, 24);
  assert.equal(profiles.size, 4);
  assert.equal(new Set(active.map((work) => work.artistId)).size, 4);
  assert([...profiles].every((id) => active.some((work) => work.id === id)));
});

test("the new explorer preserves the original Semantic graph and its URL model", async () => {
  const html = await read("semantic/index.html");
  const ui = await read("scripts/semantics/semantic-ui.mjs");
  const explorer = await read("scripts/semantics/semantic-explorer.mjs");
  const css = await read("styles/semantic-explorer.css");
  assert(html.includes('data-intelligent-explorer'));
  assert(html.includes('data-semantic-app'));
  assert(html.includes('semantic.css?v=17'));
  assert(ui.includes('initIntelligentExplorer(semanticData, lang, artwork.id)'));
  assert(explorer.includes('a.status === "active"'));
  assert(explorer.includes('data.artworkMap.get(item.id)'));
  assert(explorer.includes('href.startsWith("//")'));
  assert(explorer.includes('URLSearchParams({ artwork:id, lang })'));
  assert(explorer.includes('fr:') && explorer.includes('en:') && explorer.includes('ar:'));
  assert(css.includes('prefers-reduced-motion'));
});

test("the explorer filters out external immersive links while preserving manifest data", async () => {
  const doc = await readJson("content/semantics/experience-links.json");
  const links = doc.nodes.flatMap((node) => node.experiences);
  assert(links.some((entry) => entry.href.startsWith("/")));
  assert(links.some((entry) => entry.href.startsWith("https://")));
  const explorer = await read("scripts/semantics/semantic-explorer.mjs");
  assert(explorer.includes('!href.startsWith("/")'));
  assert(explorer.includes('href.startsWith("//")'));
  assert(explorer.includes('url.origin === location.origin'));
});
