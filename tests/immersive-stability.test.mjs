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

test("Meta Quest stays constrained while essential 3D exhibits remain enabled", () => {
  const questProfile = detectRuntimeProfile(environment({
    width: 1832,
    height: 1920,
    coarse: true,
    memory: 4,
    userAgent: "Mozilla/5.0 OculusBrowser Meta Quest 3S"
  }));
  assert.equal(questProfile.constrained, true);
  assert.equal(questProfile.maxPixelRatio, 1);
  assert.match(gallerySource, /let allowExhibit3DModels = isQuestBrowser \|\| \(!isHandheldMobile && !isLowPowerDevice\);/);
  assert.match(gallerySource, /if \(runtimeProfile\.constrained\) \{[\s\S]*?allowExhibit3DModels = isQuestBrowser;/);
  assert.match(gallerySource, /async function addDedicatedArtistModel[\s\S]*?if \(!allowExhibit3DModels\) return;/);
  assert.match(gallerySource, /async function buildModelExhibits[\s\S]*?if \(!allowExhibit3DModels\) return;/);
  assert.match(gallerySource, /async function buildGroupExhibit[\s\S]*?if \(!allowExhibit3DModels\) return;/);
  assert.match(gallerySource, /if \(!essential && !allowDecorative3DModels\) return null;/);
});

test("gallery audio guides stay lazy and auto-start only on hotspot proximity", () => {
  assert.doesNotMatch(gallerySource, /exhibitsBySlug\.set\([^\n]+\);\s*loadAudioGuide\(/);
  assert.match(gallerySource, /resolveArtworkAudioOverview\(\{ artworkId: audioWork\.artworkId, language: lang \}\)/);
  assert.doesNotMatch(gallerySource, /painting\.media\?\.audioOverviews|painting\.media\?\.audioOverview/);
  assert.match(gallerySource, /const AUTO_AUDIO_HOTSPOT_RADIUS = 0\.9/);
  assert.match(gallerySource, /function maybeAutoStartHotspotAudio\(exhibit\)/);
  assert.match(gallerySource, /horizontalDistanceToHotspot\(exhibit\) > AUTO_AUDIO_HOTSPOT_RADIUS/);
  assert.match(gallerySource, /if \(exhibit\.audioLoadPromise\) return;/);
  assert.match(gallerySource, /void ensureAudioGuide\(requestedExhibit\)\.then/);
  assert.match(gallerySource, /maybeAutoStartHotspotAudio\(next\)/);
  assert.match(gallerySource, /maybeAutoStartHotspotAudio\(activeExhibit\)/);
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

test("Quest locomotion supports free walking, floor teleport and collision-aware movement", () => {
  assert.match(gallerySource, /function moveVisitorBy\(deltaX, deltaZ\)/);
  assert.match(gallerySource, /function isNavigablePosition\(x, z\)/);
  assert.match(gallerySource, /function teleportToWalkableFloor\(raycaster\)/);
  assert.match(gallerySource, /teleportRaycaster\.intersectObjects\(getWalkableFloorMeshes\(\), false\)/);
  assert.match(gallerySource, /smoothTurnEnabled/);
  assert.match(gallerySource, /registerCollisionRect\(x, z, width, 0\.12/);
  assert.match(gallerySource, /collidable: true/);
  assert.match(gallerySource, /moveVisitorBy\(motion\.x, motion\.z\)/);
});

test("gallery text reuses the high-contrast People room typography on Quest", () => {
  assert.match(gallerySource, /function makeLabel[\s\S]*?background\.addColorStop\(0, "#102c30"\)/);
  assert.match(gallerySource, /function makeLabel[\s\S]*?Georgia, "Times New Roman", serif/);
  assert.match(gallerySource, /function makeInformationPanel[\s\S]*?isQuestBrowser \? 0\.65/);
  assert.match(gallerySource, /function makeInformationPanel[\s\S]*?texture\.anisotropy = isLowPowerDevice \? 2/);
});

test("Louvre and cinema restore their requested 3D presentation models", () => {
  assert.match(gallerySource, /LOUVRE_ARTDACI_BOOK_MODEL = "assets\/environments\/gallery\/models\/artdaci_book3d_v2\.glb"/);
  assert.match(gallerySource, /LOUVRE_MONA_LISA_TABLEAU_MODEL = "assets\/artists\/leonardo-da-vinci\/artworks\/mona-lisa\/models\/monalisa-tableau-c\.glb"/);
  assert.match(gallerySource, /LOUVRE_BUILDING_PLAN = "assets\/environments\/gallery\/images\/Louvre\/louvre_building_plan\/louvre_building_plan_\{lang\}\.png"/);
  assert.match(gallerySource, /function addLouvreArtdaciBookDisplay\(\)/);
  assert.match(gallerySource, /name: "louvre-artdaci-book-table"/);
  assert.match(gallerySource, /name = "louvre-artdaci-book3d-v2"/);
  assert.match(gallerySource, /previewRoom === "louvre"[\s\S]*?\? 8\.4/);
  assert.match(gallerySource, /visitor\.position\.set\(0, 0, 8\.4\)/);
  assert.match(gallerySource, /EXPLORE THE LOUVRE IN VR"[\s\S]*?\[-6\.86, 3\.45, 7\.15\]/);
  assert.match(gallerySource, /BACK TO THE VR GALLERY"[\s\S]*?\[-3\.75, 4\.12, 9\.72\]/);
  assert.match(gallerySource, /maxSize: 3\.48/);
  assert.match(gallerySource, /book\.scale\.setScalar\(0\.736/);
  assert.match(gallerySource, /name = "louvre-artdaci-book-link"/);
  assert.match(gallerySource, /bookHitTarget\.userData\.exitUrl = `book-3d\.html\?lang=\$\{lang\}`/);
  assert.match(gallerySource, /await addMuseumInformationPanel\([\s\S]*?LOUVRE_BUILDING_PLAN[\s\S]*?9\.82[\s\S]*?Math\.PI/);
  assert.match(gallerySource, /async function ensureLouvreMonaLisaWallModel\(\)/);
  assert.match(gallerySource, /name = "louvre-mona-lisa-tableau"/);
  assert.match(gallerySource, /assembly\.name = "louvre-mona-lisa-tableau-assembly"/);
  assert.match(gallerySource, /hitTarget\.name = "louvre-mona-lisa-tableau-handle"/);
  assert.match(gallerySource, /6\.82 - box\.max\.x[\s\S]*?7\.15 - center\.z/);
  assert.doesNotMatch(gallerySource, /LOUVRE_FACADE_MODEL/);
  assert.doesNotMatch(gallerySource, /ensureLouvreFacade\(/);
  assert.match(gallerySource, /name: "cinema-egypt-gateway"[\s\S]*?essential: true/);
  assert.match(gallerySource, /function maybeLoadCinemaAudience\(\) \{\s*if \(!allowExhibit3DModels \|\| isIOSDevice\) return;/);
});

test("Louvre Living Book can be moved, rotated and placed on its side without leaving the table", () => {
  assert.match(gallerySource, /let louvreBookInteraction = null/);
  assert.match(gallerySource, /assembly\.name = "louvre-artdaci-book-assembly"/);
  assert.match(gallerySource, /function clampLouvreBookToTable\(\)/);
  assert.doesNotMatch(gallerySource, /function clampLouvreBookToTable\(\)[\s\S]*?assembly\.rotation\.x = 0/);
  assert.doesNotMatch(gallerySource, /function clampLouvreBookToTable\(\)[\s\S]*?assembly\.rotation\.z = 0/);
  assert.match(gallerySource, /tableTopY - box\.min\.y/);
  assert.match(gallerySource, /controller\.addEventListener\("squeezestart", \(\) => tryGrabLouvreBook\(controller\)\)/);
  assert.match(gallerySource, /controller\.addEventListener\("squeezeend", \(\) => releaseLouvreBook\(controller\)\)/);
  assert.match(gallerySource, /controller\.attach\(louvreBookInteraction\.assembly\)/);
  assert.match(gallerySource, /scene\.attach\(louvreBookInteraction\.assembly\)/);
  assert.match(gallerySource, /rotateMode: event\.shiftKey \|\| event\.altKey \|\| event\.button === 2/);
  assert.match(gallerySource, /assembly\.rotation\.set\(/);
  assert.match(gallerySource, /GRIP : DÉPLACER \/ TOURNER/);
  assert.match(gallerySource, /SHIFT \+ DRAG : TOURNER/);
});

test("Louvre Mona Lisa tableau uses the same free move and rotation controls as the Living Book", () => {
  assert.match(gallerySource, /let louvreMonaLisaInteraction = null/);
  assert.match(gallerySource, /function tryGrabLouvreMonaLisa\(controller\)/);
  assert.match(gallerySource, /controller\.attach\(louvreMonaLisaInteraction\.assembly\)/);
  assert.match(gallerySource, /function releaseLouvreMonaLisa\(controller\)/);
  assert.match(gallerySource, /scene\.attach\(louvreMonaLisaInteraction\.assembly\)/);
  assert.match(gallerySource, /function tryBeginScreenMonaLisaDrag\(event\)/);
  assert.match(gallerySource, /rotateMode: event\.shiftKey \|\| event\.altKey \|\| event\.button === 2/);
  assert.match(gallerySource, /function updateScreenMonaLisaDrag\(event\)[\s\S]*?assembly\.rotation\.set\(/);
  assert.match(gallerySource, /function updateScreenMonaLisaDrag\(event\)[\s\S]*?assembly\.position\.copy/);
  assert.match(gallerySource, /GRIP : DÉPLACER \/ TOURNER/);
  assert.match(gallerySource, /SHIFT \+ DRAG : TOURNER/);
});

test("Louvre Living Book interaction hint stays hidden until the book is pointed at", () => {
  assert.match(gallerySource, /hint\.name = "louvre-artdaci-book-hint"/);
  assert.match(gallerySource, /hint\.visible = false/);
  assert.match(gallerySource, /function setLouvreBookHintVisible\(visible\)/);
  assert.match(gallerySource, /function updateLouvreBookPointerHint\(\)/);
  assert.match(gallerySource, /function updateLouvreBookScreenHover\(event\)/);
  assert.doesNotMatch(gallerySource, /label\.userData\.exitUrl = `book-3d\.html/);
});

test("Quest navigation fully releases WebXR and browser focus before changing pages", () => {
  assert.match(gallerySource, /let pendingNavigationUrl = null/);
  assert.match(gallerySource, /document\.body\.dataset\.xrNavigation = "ending"/);
  assert.match(gallerySource, /async function waitForRendererXrRelease\(\)/);
  assert.match(gallerySource, /async function prepareQuestPageNavigation\(\)/);
  assert.match(gallerySource, /stopRenderLoop\(\);[\s\S]*?await waitForRendererXrRelease\(\);[\s\S]*?renderer\.xr\.enabled = false/);
  assert.match(gallerySource, /document\.visibilityState !== "visible" \|\| !document\.hasFocus\(\)/);
  assert.match(gallerySource, /setTimeout\(resolve, 900\)/);
  assert.match(gallerySource, /await renderer\.xr\.setSession\(session\);[\s\S]*?session\.addEventListener\("end"/);
  assert.doesNotMatch(gallerySource, /if \(currentSession\) await currentSession\.end\(\);\s*location\.href = url/);
});

test("cinema and gallery signage use the People Behind the Painters high-contrast style", () => {
  assert.match(gallerySource, /function createWallSign[\s\S]*?background\.addColorStop\(0, "#102c30"\)/);
  assert.match(gallerySource, /function createWallSign[\s\S]*?isLowPowerDevice \? 1280 : 1600/);
  assert.match(gallerySource, /function paintCinemaPlaque[\s\S]*?background\.addColorStop\(0, "#102c30"\)/);
  assert.match(gallerySource, /buttonScale = isQuestBrowser \? 0\.75/);
  assert.match(gallerySource, /createWallSign\(destination\.label, \[19\.88,[\s\S]*?31\.15\]/);
  assert.match(gallerySource, /addVirtualGuideStation\(\[19\.88, 1\.08, 31\.15\], -Math\.PI \/ 2/);
});

test("3D model gallery plaques are laid back ninety degrees for visitor readability", () => {
  assert.ok((gallerySource.match(/label\.rotation\.x = -Math\.PI \/ 2;/g) || []).length >= 3);
  assert.doesNotMatch(gallerySource, /label\.rotation\.x = -Math\.PI \/ 5;/);
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
