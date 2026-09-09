import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { detectRuntimeProfile } from "../scripts/runtime-profile.js?v=1";

const gallerySource = await readFile(new URL("../scripts/gallery-vr.js", import.meta.url), "utf8");
const bookSource = await readFile(new URL("../scripts/book-3d.js", import.meta.url), "utf8");

function environment({ width = 1440, height = 900, coarse = false, memory = 8, userAgent = "Desktop" } = {}) {
  return {
    innerWidth: width,
    innerHeight: height,
    navigator: { deviceMemory: memory, userAgent },
    screen: { width, height },
    matchMedia: () => ({ matches: coarse })
  };
}

test("desktop keeps the normal high-quality runtime profile", () => {
  const profile = detectRuntimeProfile(environment());
  assert.equal(profile.name, "normal");
  assert.equal(profile.maxPixelRatio, 2);
  assert.equal(profile.bookTextureScale, 1);
});

test("small coarse-pointer devices use the constrained profile", () => {
  const profile = detectRuntimeProfile(environment({ width: 390, height: 844, coarse: true, memory: 4 }));
  assert.equal(profile.name, "constrained");
  assert.equal(profile.maxPixelRatio, 1);
  assert.equal(profile.bookTextureScale, 0.625);
});

test("Smart TV and limited WebGL capabilities independently select the constrained profile", () => {
  assert.equal(detectRuntimeProfile(environment({ userAgent: "Mozilla/5.0 Tizen SmartTV" })).constrained, true);
  assert.equal(detectRuntimeProfile(environment(), { maxTextureSize: 2048, maxTextures: 16 }).constrained, true);
});

test("gallery audio guides are lazy, exact-language and released when inactive", () => {
  assert.doesNotMatch(gallerySource, /exhibitsBySlug\.set\([^\n]+\);\s*loadAudioGuide\(/);
  assert.match(gallerySource, /resolveArtworkAudioOverview\(\{ artworkId: audioWork\.artworkId, language: lang \}\)/);
  assert.doesNotMatch(gallerySource, /painting\.media\?\.audioOverviews|painting\.media\?\.audioOverview/);
  assert.match(gallerySource, /await ensureAudioGuide\(requestedExhibit\)/);
  assert.match(gallerySource, /function releaseAudioGuide\(exhibit\)/);
  assert.match(gallerySource, /narrationPlayer\.preload = "none"/);
  assert.match(gallerySource, /roomAmbiencePlayer\.preload = "none"/);
});

test("gallery uses one guarded render loop and handles repeated WebGL loss without reload", () => {
  assert.equal((gallerySource.match(/new THREE\.WebGLRenderer/g) || []).length, 1);
  assert.match(gallerySource, /function startRenderLoop\(\)/);
  assert.match(gallerySource, /webglcontextlost/);
  assert.match(gallerySource, /webglcontextrestored/);
  assert.match(gallerySource, /webglContextLossCount > 1/);
  assert.doesNotMatch(gallerySource, /location\.(?:reload|replace)\(/);
});

test("constrained gallery streams non-visible rooms instead of preloading them all", () => {
  assert.match(gallerySource, /if \(!isLowPowerDevice\) void preloadFiveMuseumsWing\(\)/);
  assert.match(gallerySource, /if \(isLowPowerDevice\) \{\s*await loadReimaginedPainter\(nearestReimaginedPainter\(\)\)/);
  assert.match(gallerySource, /maybeLoadReimaginedPainter\(\);/);
});

test("Living Book retains only the visible page window and cancels stale work", () => {
  assert.doesNotMatch(bookSource, /Promise\.all\(pages\.map\(createPageTexture\)\)/);
  assert.match(bookSource, /function getDesiredPageIndexes\(\)/);
  assert.match(bookSource, /load\.controller\.abort\(\)/);
  assert.match(bookSource, /URL\.revokeObjectURL\(url\)/);
  assert.match(bookSource, /canvas\.toBlob/);
});

test("Living Book generates only the eight curated artworks in canonical book order", () => {
  const selection = bookSource.match(/const LIVING_BOOK_ARTWORKS = Object\.freeze\((\[[\s\S]*?\])\);/);
  assert.ok(selection, "Living Book selection must remain declarative");
  const selectedArtworks = JSON.parse(selection[1]);
  assert.deepEqual(selectedArtworks, [
    { canonicalId: "ld01", slug: "mona-lisa", bookOrder: 1 },
    { canonicalId: "ld02", slug: "lady-with-an-ermine", bookOrder: 4 },
    { canonicalId: "ve05", slug: "vermeer-astronomer", bookOrder: 7 },
    { canonicalId: "ve01", slug: "vermeer-girl-with-a-pearl-earring", bookOrder: 9 },
    { canonicalId: "vg01", slug: "van-gogh", bookOrder: 13 },
    { canonicalId: "vg02", slug: "van-gogh-bedroom", bookOrder: 15 },
    { canonicalId: "mo02", slug: "pont-d-argenteuil", bookOrder: 22 },
    { canonicalId: "mo01", slug: "monet-impression-sunrise", bookOrder: 24 }
  ]);
  const expectedPageCount = 5
    + selectedArtworks.reduce((total, artwork) => total + (artwork.bookOrder <= 8 ? 4 : 1), 0)
    + 5
    + 1;
  assert.equal(expectedPageCount, 28);
  const manifestList = bookSource.match(/const MANIFEST_URLS = \[([\s\S]*?)\];/);
  assert.ok(manifestList);
  assert.doesNotMatch(manifestList[1], /view-of-delft/);
  assert.match(bookSource, /const paintings = LIVING_BOOK_ARTWORKS\.map/);
  assert.ok(bookSource.indexOf("const paintings = LIVING_BOOK_ARTWORKS.map") < bookSource.indexOf("buildPageDefinitions(paintings"));
});

test("Living Book audio and video remain interaction-driven and are released on exit", () => {
  assert.match(bookSource, /button\.addEventListener\("click", \(event\) => \{[\s\S]*?openExperience\(definition, hotspot\)/);
  assert.match(bookSource, /function closeExperience\(\) \{[\s\S]*?media\.pause\(\);[\s\S]*?media\.removeAttribute\("src"\);[\s\S]*?experienceBody\.innerHTML = ""/);
  assert.match(bookSource, /addEventListener\("pagehide"/);
});
