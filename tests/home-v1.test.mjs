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
    assert.match(html, /styles\/home-v2-adjustments\.css\?v=9/);
  }
});

test("featured artworks have natural proportions: portraits and Monet landscape", async () => {
  const css = await read("styles/home-v2-adjustments.css");
  assert.match(css, /\.home-v2 \.hv2-featured-grid\s*\{[\s\S]*?repeat\(4, minmax\(0, 1fr\)\)/);
  assert.match(css, /\.home-v2 \.hv2-work-visual\s*\{[\s\S]*?height:\s*clamp\(/);
  assert.match(css, /\.home-v2 \.hv2-work \.hv2-work-visual img,[\s\S]*?width:\s*auto;[\s\S]*?height:\s*auto;[\s\S]*?max-width:\s*100%;[\s\S]*?max-height:\s*100%;[\s\S]*?aspect-ratio:\s*auto;[\s\S]*?object-fit:\s*contain/);
  assert.match(css, /\.home-v2 \.hv2-work-copy\s*\{[\s\S]*?margin-top:\s*auto/);
  const imageRule = css.match(/\.home-v2 \.hv2-work \.hv2-work-visual img,[\s\S]*?transition:[^}]+}/)?.[0] ?? "";
  assert.doesNotMatch(imageRule, /border-radius:\s*50%/, "The paintings, unlike decorative page elements, must not be circular");
  for (const file of pages) {
    const html = await read(file);
    const featured = html.match(/<div class="hv2-featured-grid">([\s\S]*?)<\/div>\s*<\/section>/)?.[1] ?? "";
    assert.equal((featured.match(/class="hv2-work"/g) ?? []).length, 4, file);
    assert.equal((featured.match(/class="hv2-work-visual"/g) ?? []).length, 4, file);
    const workImages = [...featured.matchAll(/<span class="hv2-work-visual"><img src="([^"]+)"/g)];
    assert.equal(workImages.length, 4, file);
    for (const match of workImages) await access(path.join(root,match[1]));
  }
});

test("Mona Lisa uses the user's image with no circular crop or internal padding", async () => {
  const css = await read("styles/home-v2-adjustments.css");
  const art = "assets/artists/leonardo-da-vinci/artworks/mona-lisa/images/mona-lisa-home-medallion.webp";
  await access(path.join(root,art));
  assert.ok((await stat(path.join(root,art))).size > 5000);
  assert.match(css, /\.home-v2 \.hv2-work \.hv2-work-visual img,[\s\S]*?object-fit:\s*contain/);
  assert.match(css, /\.home-v2 \.hv2-work \.hv2-work-visual img,[\s\S]*?padding:\s*0/);
  for (const file of pages) {
    const html = await read(file);
    const featured = html.match(/<div class="hv2-featured-grid">([\s\S]*?)<\/div>\s*<\/section>/)?.[1] ?? "";
    assert.ok(featured.includes('src="' + art + '"'));
    assert.ok(!featured.includes('mona-lisa/images/mona-lisa.jpg'));
  }
});

test("Masters portraits fill frameless cropped windows across FR EN AR", async () => {
  const css = await read("styles/home-v2-adjustments.css");
  assert.match(css, /\.home-v2 \.hv2-master-photo\s*\{[\s\S]*?overflow:\s*hidden/);
  assert.match(css, /\.home-v2 \.hv2-master-card \.hv2-master-photo img\s*\{[\s\S]*?object-fit:\s*cover/);
  assert.match(css, /\.home-v2 \.hv2-master-card::before\s*\{\s*display:\s*none/);
  assert.match(css, /\.home-v2 \.hv2-master-card \.hv2-master-photo img\s*\{[\s\S]*?transform:\s*none/);
  for (const file of pages) {
    const html = await read(file);
    assert.equal((html.match(/class="hv2-master-photo"/g) ?? []).length, 4, file);
    assert.equal((html.match(/assets\/artists\/[^"]+\/profile\/home-portrait\.webp/g) ?? []).length, 4, file);
    assert.doesNotMatch(html, /src="assets\/artists\/[^"]+\/profile\/portrait\.png"/);
    for (const artist of ["leonardo-da-vinci","johannes-vermeer","vincent-van-gogh","claude-monet"]) {
      const asset = path.join(root,"assets/artists",artist,"profile/home-portrait.webp");
      assert.ok((await stat(asset)).size > 1000, artist + " photo must be present and nonempty");
      assert.ok((await stat(asset)).size < 100000, artist + " homepage photo must remain lightweight");
    }
  }
});

test("Book AR scan button follows rather than overlaps the hero caption", async () => {
  const css = await read("styles/home-v2-adjustments.css");
  assert.match(css, /\.home-v2 \.hv2-book-hero \.hv2-book-signature\s*\{[\s\S]*?position:\s*static/);
  assert.match(css, /\.home-v2 \.hv2-book-hero \.hv2-book-scan\s*\{[\s\S]*?position:\s*relative/);
  for (const file of pages) {
    const html = await read(file);
    const captionAt = html.indexOf('class="hv2-book-signature"');
    const scanAt = html.indexOf('class="hv2-button hv2-book-scan"');
    assert.ok(captionAt > 0 && scanAt > captionAt, file + " must put scan below caption");
    assert.match(html, /data-book-ar-v1="1"/);
    assert.doesNotMatch(html, /data-book-ar-v1="1"[^>]*style=/);
  }
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
