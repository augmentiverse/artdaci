import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const { formatArtworkNumber } = await import("../scripts/artwork-numbering.js?immersive-routing-test");
const { classifyUnresolvedArtworkRoute, resolveImmersiveArtworkRoute } = await import("../scripts/immersive-routing.js?immersive-routing-test");
const { getArtworkImmersiveActions } = await import("../scripts/catalogue.js?immersive-routing-test");

const experiences = ["ar", "space", "vr"];
const supported = [
  { id: "ld01", canonical: "mona-lisa", alias: "mona-lisa", runtime: "mona-lisa" },
  { id: "ve01", canonical: "girl-with-a-pearl-earring", alias: "vermeer-girl-with-a-pearl-earring", runtime: "vermeer-girl-with-a-pearl-earring" },
  { id: "vg01", canonical: "self-portrait", alias: "van-gogh", runtime: "van-gogh" },
  { id: "vg02", canonical: "bedroom-in-arles", alias: "van-gogh-bedroom", runtime: "van-gogh-bedroom" },
];

for (const experience of experiences) {
  test(`${experience}: absent parameter intentionally keeps the historical Mona Lisa default`, () => {
    assert.deepEqual(resolveImmersiveArtworkRoute(null, experience), {
      artworkId: "ld01",
      canonicalSlug: "mona-lisa",
      runtimeSlug: "mona-lisa",
      kind: "default",
    });
  });

  test(`${experience}: canonical slugs, canonical IDs and historical aliases resolve correctly`, () => {
    for (const artwork of supported) {
      assert.equal(resolveImmersiveArtworkRoute(artwork.canonical, experience)?.runtimeSlug, artwork.runtime);
      assert.equal(resolveImmersiveArtworkRoute(artwork.id, experience)?.runtimeSlug, artwork.runtime);
      assert.equal(resolveImmersiveArtworkRoute(artwork.alias, experience)?.runtimeSlug, artwork.runtime);
    }
  });

  test(`${experience}: unsupported and unknown explicit requests never resolve to Mona Lisa`, () => {
    assert.equal(resolveImmersiveArtworkRoute("the-starry-night", experience), null);
    assert.equal(resolveImmersiveArtworkRoute("totally-unknown", experience), null);
    assert.equal(resolveImmersiveArtworkRoute("", experience), null);
  });

  test(`${experience}: repeated routing is deterministic`, () => {
    assert.deepEqual(
      resolveImmersiveArtworkRoute("self-portrait", experience),
      resolveImmersiveArtworkRoute("self-portrait", experience),
    );
  });
}

test("known unsupported canonical artwork and unknown slug are distinguished without throwing", async () => {
  const catalogResponse = {
    ok: true,
    json: async () => ({ artworks: [{ id: "vg03", slug: "the-starry-night", status: "active" }] }),
  };
  assert.equal(await classifyUnresolvedArtworkRoute("vg03", async () => catalogResponse), "unsupported");
  assert.equal(await classifyUnresolvedArtworkRoute("the-starry-night", async () => catalogResponse), "unsupported");
  assert.equal(await classifyUnresolvedArtworkRoute("totally-unknown", async () => catalogResponse), "unknown");
  assert.equal(await classifyUnresolvedArtworkRoute("anything", async () => { throw new TypeError("network"); }), "unknown");
});

test("catalogue exposes immersive actions only for supported artworks in EN, FR and AR", () => {
  const labels = {
    en: { ar: "Image AR", space: "Room AR" },
    fr: { ar: "AR image", space: "AR espace" },
    ar: { ar: "واقع معزز", space: "وضع في المساحة" },
  };
  for (const lang of ["en", "fr", "ar"]) {
    const actions = getArtworkImmersiveActions("van-gogh", lang, labels[lang]);
    assert.deepEqual(actions.map((action) => action.experience), ["ar", "space"]);
    assert.deepEqual(actions.map((action) => action.label), [labels[lang].ar, labels[lang].space]);
    assert.deepEqual(getArtworkImmersiveActions("starry-night", lang, labels[lang]), []);
  }
});

test("the existing Monet gallery action remains available without exposing unsupported individual viewers", () => {
  const actions = getArtworkImmersiveActions("monet-impression-sunrise", "en");
  assert.equal(actions.length, 1);
  assert.equal(actions[0].experience, "gallery");
  assert.match(actions[0].href, /^gallery-vr\.html\?/);
});

test("viewer guards precede painting content fetches and contain no explicit-route Mona fallback", async () => {
  for (const file of ["ar-viewer.js", "space-viewer.js", "vr-viewer.js"]) {
    const source = await readFile(new URL(`../scripts/${file}`, import.meta.url), "utf8");
    assert.match(source, /if \(!(?:CONFIG\.manifest|slug)\) \{[\s\S]*?showUnavailableRoute\(\)[\s\S]*?return;/);
    assert.doesNotMatch(source, /\?[^:\n]+:\s*["']mona-lisa["']/);
    assert.doesNotMatch(source, /\|\|\s*PAINTINGS\[["']mona-lisa["']\]/);
    assert.doesNotMatch(source, /location\.(?:assign|replace)\s*\(/);
  }
});

test("AR unavailable routes leave the localized Back link above a non-interactive terminal overlay", async () => {
  const source = await readFile(new URL("../scripts/ar-viewer.js", import.meta.url), "utf8");
  const unavailableRoute = source.match(/async function showUnavailableRoute\(\) \{[\s\S]*?\n\}/)?.[0] || "";

  assert.match(unavailableRoute, /loadingScreen\.style\.pointerEvents = "none";/);
  assert.match(unavailableRoute, /document\.querySelector\("\.top-hud"\)\.style\.zIndex = "11";/);
  assert.doesNotMatch(unavailableRoute, /location\.(?:assign|replace)\s*\(/);
});

test("AR artwork numbers use canonical bookOrder with localized three-digit labels", () => {
  const bookOrders = { ld01: 1, ve01: 9, vg01: 13, vg02: 15 };
  for (const [artworkId, bookOrder] of Object.entries(bookOrders)) {
    assert.equal(formatArtworkNumber(bookOrder, "en"), `Artwork ${String(bookOrder).padStart(3, "0")}`, artworkId);
    assert.equal(formatArtworkNumber(bookOrder, "fr"), `Œuvre ${String(bookOrder).padStart(3, "0")}`, artworkId);
  }
  assert.equal(formatArtworkNumber(bookOrders.ld01, "ar"), "العمل ٠٠١");
  assert.equal(formatArtworkNumber(bookOrders.ve01, "ar"), "العمل ٠٠٩");
  assert.equal(formatArtworkNumber(bookOrders.vg01, "ar"), "العمل ٠١٣");
  assert.equal(formatArtworkNumber(bookOrders.vg02, "ar"), "العمل ٠١٥");
});

test("AR interface derives artwork numbering only from bookOrder", async () => {
  const [source, html] = await Promise.all([
    readFile(new URL("../scripts/ar-viewer.js", import.meta.url), "utf8"),
    readFile(new URL("../ar.html", import.meta.url), "utf8"),
  ]);
  const applyLanguage = source.match(/function applyStaticLanguage\(\) \{[\s\S]*?\n\}/)?.[0] || "";
  const updateInterface = source.match(/function updateInterfaceFromManifest\(manifest\) \{[\s\S]*?\n\}/)?.[0] || "";

  assert.match(html, /<span id="spread-label"><\/span>/);
  assert.doesNotMatch(html, /Spread 001/);
  assert.match(source, /import \{ formatArtworkNumber \} from "\.\/artwork-numbering\.js\?v=1";/);
  assert.doesNotMatch(source, /from "\.\/catalogue\.js/);
  assert.match(applyLanguage, /getElementById\("spread-label"\)\.textContent = "";/);
  assert.match(applyLanguage, /getElementById\("spread-label"\)\.style\.display = "none";/);
  assert.match(updateInterface, /Number\.isInteger\(manifest\.bookOrder\)/);
  assert.match(updateInterface, /formatArtworkNumber\(manifest\.bookOrder, CONFIG\.lang\)/);
  assert.match(updateInterface, /style\.display = hasBookOrder \? "" : "none";/);
  assert.doesNotMatch(updateInterface, /spreadNumber|\bSpread\b|Double page/);
});

test("AR people and museum resources remain unnumbered", async () => {
  const person = JSON.parse(await readFile(new URL("../content/people/van-gogh-jo.json", import.meta.url), "utf8"));
  const museumFiles = ["louvre.json", "mauritshuis.json", "czartoryski.json", "orsay.json", "van-gogh-museum.json"];
  const museums = await Promise.all(museumFiles.map(async (file) => (
    JSON.parse(await readFile(new URL(`../content/museums/${file}`, import.meta.url), "utf8"))
  )));

  assert.equal(person.bookOrder, undefined);
  assert.equal(Object.hasOwn(person.print, "spreadNumber"), false);
  assert.ok(museums.every(({ bookOrder }) => bookOrder === undefined));
});
