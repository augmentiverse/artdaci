import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pages = ["index.html", "index-fr.html", "index-ar.html"];
const modelPath = "assets/environments/gallery/models/artdaci_book3d_v2.glb";

const read = (file) => readFile(path.join(root, file), "utf8");

test("homepage hero exposes the local ARTDACI 3D book in every language", async () => {
  await access(path.join(root, modelPath));
  assert.ok((await stat(path.join(root, modelPath))).size > 0, "3D book must not be empty");

  for (const file of pages) {
    const html = await read(file);
    assert.match(html, /vendor\/model-viewer\.min\.js\?v=3\.5\.0/);
    assert.match(html, new RegExp(`<model-viewer[\\s\\S]*?src="${modelPath}"[\\s\\S]*?auto-rotate`));
    assert.match(html, /class="hv2-book-model"/);
    assert.match(html, /rotation-per-second="6deg"/);
    assert.match(html, /loading="lazy"/);
    assert.doesNotMatch(html, /class="hv2-art-wall"/);
  }
});

test("homepage uses the blue theme and a compact responsive 3D hero", async () => {
  const css = await read("styles/home-v2-adjustments.css");

  assert.match(css, /--hv2-bg:\s*#06192b/);
  assert.match(css, /--hv2-gold:\s*#70c5ef/);
  assert.match(css, /\.home-v2 \.hv2-book-hero\s*\{[\s\S]*?width:\s*min\(100%, 410px\);[\s\S]*?min-height:\s*360px/);
  assert.match(css, /\.home-v2 \.hv2-book-model\s*\{[\s\S]*?height:\s*330px/);
  assert.match(css, /@media \(max-width: 420px\)[\s\S]*?font-size:\s*clamp\(36px, 11\.6vw, 48px\)/);
  assert.match(css, /\.home-v2 \.hv2-hero-copy\s*\{[\s\S]*?min-width:\s*0;[\s\S]*?max-width:\s*100%/);
  assert.match(css, /@media \(max-width: 780px\)[\s\S]*?grid-template-columns:\s*minmax\(0, 1fr\)/);
  assert.match(css, /width:\s*calc\(100% - 24px\);[\s\S]*?max-width:\s*1440px/);

  for (const file of pages) {
    const html = await read(file);
    assert.match(html, /<meta name="theme-color" content="#06192b" \/>/);
    assert.match(html, /styles\/home-v2-adjustments\.css\?v=4/);
  }
});

test("featured artworks use one shared medallion layout", async () => {
  const css = await read("styles/home-v2-adjustments.css");
  assert.match(css, /\.home-v2 \.hv2-featured-grid\s*\{[\s\S]*?repeat\(4, minmax\(0, 1fr\)\)/);
  assert.match(css, /\.home-v2 \.hv2-work img,[\s\S]*?aspect-ratio:\s*1;[\s\S]*?border-radius:\s*50%/);

  for (const file of pages) {
    const html = await read(file);
    const featured = html.match(/<div class="hv2-featured-grid">([\s\S]*?)<\/div>\s*<\/section>/)?.[1] ?? "";
    assert.equal((featured.match(/class="hv2-work"/g) ?? []).length, 4, `${file} must expose four artworks`);
  }
});

test("Masters portraits use the compact luminous portal treatment", async () => {
  const css = await read("styles/home-v2-adjustments.css");
  assert.match(css, /Masters: compact luminous portraits/);
  assert.match(css, /\.home-v2 \.hv2-master-card::before/);
  assert.match(css, /\.home-v2 \.hv2-master-card img\s*\{[\s\S]*?width:\s*min\(72%, 205px\)/);
});

test("French and Arabic experience labels are localized", async () => {
  const fr = await read("index-fr.html");
  const ar = await read("index-ar.html");

  assert.match(fr, /<h3>Sémantique ARTDACI<\/h3>/);
  assert.match(fr, /<h3>Hub des Maîtres<\/h3>/);
  assert.doesNotMatch(fr, /<h3>ARTDACI Semantic<\/h3>|<h3>Masters Hub<\/h3>/);

  assert.match(ar, /<h3>دلالات ARTDACI<\/h3>/);
  assert.match(ar, /<h3>بوابة الأساتذة<\/h3>/);
  assert.doesNotMatch(ar, /<h3>ARTDACI Semantic<\/h3>|<h3>Masters Hub<\/h3>/);
});
