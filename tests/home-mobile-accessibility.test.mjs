import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const pages = [
  ["index.html", "Skip to main content"],
  ["index-fr.html", "Aller au contenu principal"],
  ["index-ar.html", "الانتقال إلى المحتوى الرئيسي"],
];
const get = (name) => readFile(new URL("../" + name, import.meta.url), "utf8");

test("every homepage offers a keyboard skip link with a focusable main landmark", async () => {
  for (const [page, label] of pages) {
    const html = await get(page);
    assert.ok(html.includes('<a class="artdaci-skip-link" href="#main-content">' + label + "</a>"), page);
    assert.ok(html.indexOf("artdaci-skip-link") < html.indexOf("hv2-header"), page);
    assert.ok(html.includes('<main id="main-content" class="home-shell hv2-main" tabindex="-1">'), page);
    assert.ok(html.includes('styles/home-mobile-smart-art.css?v=2'), page);
    assert.ok(html.includes('scripts/smart-tv-cover.js?v=3'), page);
    assert.ok(html.includes('scripts/trim-baked-frames.js?v=2'), page);
  }
});

test("homepage mobile refinements increase caption, index button and header tap readability", async () => {
  const styles = await get("styles/home-mobile-smart-art.css");
  assert.match(styles, /smart-art-caption\s*\{[\s\S]*?font-size:12px;/);
  assert.match(styles, /artdaci-skip-link:focus-visible/);
  assert.match(styles, /hv2-language a\s*\{[\s\S]*?min-height:44px/);
  assert.match(styles, /painting-index-gallery \.card-actions \.button\s*\{[\s\S]*?min-height:44px/);
  assert.match(styles, /prefers-reduced-motion:reduce/);
  assert.match(styles, /scroll-margin-top:130px/);
});

test("3D component loads only when near the viewport or explicitly requested", async () => {
  const script = await get("scripts/smart-tv-cover.js");
  assert.match(script, /new IntersectionObserver\(/);
  assert.ok(script.includes("observer.observe(hero)"));
  assert.ok(script.includes("function scheduleModel()"));
  assert.ok(script.includes("activate(next, true)"));
  assert.ok(script.includes("model.removeAttribute('auto-rotate')"));
  assert.ok(script.includes("vendor/model-viewer.min.js?v=3.5.0"));
});

test("only catalogue thumbnails are resized; full printable art crops keep their resolution", async () => {
  const script = await get("scripts/trim-baked-frames.js");
  assert.ok(script.includes('img.closest(".painting-index-gallery")'));
  assert.ok(script.includes("Math.min(1, 1280 / Math.max(sw, sh)) : 1"));
  assert.ok(script.includes('thumbnail ? .88 : .93'));
  assert.ok(script.includes("ctx.drawImage(img,sx,sy,sw,sh,0,0,canvas.width,canvas.height)"));
  assert.ok(script.includes("const measured = {"));
});
