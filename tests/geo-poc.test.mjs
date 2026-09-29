import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";

import {
  languageFromSearch,
  localize,
  modelCandidateUrl,
  modelVariantCandidates,
  projectAssetUrl,
  remoteAssetUrl,
  selectPerformanceProfile,
  validatePlaceRecord,
  withLanguage,
} from "../geo/scripts/geo-core.mjs";

const repositoryRoot = resolve(import.meta.dirname, "..");
const placePath = resolve(repositoryRoot, "geo/data/louvre.json");
const place = JSON.parse(await readFile(placePath, "utf8"));
const languages = ["fr", "en", "ar"];

test("Louvre GEO data is explicit about every unverified geographic value", () => {
  assert.deepEqual(validatePlaceRecord(place), []);
  assert.equal(place.geospatial.latitude, null);
  assert.equal(place.geospatial.longitude, null);
  assert.equal(place.geospatial.altitudeMeters, null);
  assert.equal(place.geospatial.orientation.status, "to-be-determined");
  assert.equal(place.geospatial.anchor.type, "to-be-determined");
  assert.equal(place.geospatial.vps.availability, "to-be-verified");
  assert.equal(place.geospatial.verification.status, "to-be-verified-on-site");
  assert.equal(place.geospatial.verification.source, null);
});

test("GEO V2 exposes the three reusable Louvre points of interest", () => {
  assert.deepEqual(
    place.pointsOfInterest.map(({ id, type }) => [id, type]),
    [
      ["louvre-intro", "place"],
      ["ld01-mona-lisa", "artwork"],
      ["leonardo-guide", "character"],
    ],
  );
  assert.equal(place.remoteExperience.defaultPointOfInterestId, "louvre-intro");
  assert.equal(place.pointsOfInterest[1].artworkId, "ld01");

  for (const point of place.pointsOfInterest) {
    for (const language of languages) {
      assert.ok(point.content.title[language], `${point.id} needs a ${language} title`);
      assert.ok(point.content.description[language], `${point.id} needs a ${language} description`);
    }
    assert.ok(Array.isArray(point.actions));
  }
});

test("POI positions remain uncalibrated local 3D values, never invented geospatial coordinates", () => {
  for (const point of place.pointsOfInterest) {
    assert.equal(point.position.coordinateSpace, "louvre-model-local");
    assert.equal(point.position.calibrationStatus, "not-calibrated");
    assert.deepEqual(
      { x: point.position.x, y: point.position.y, z: point.position.z },
      { x: null, y: null, z: null },
    );
    assert.equal("latitude" in point.position, false);
    assert.equal("longitude" in point.position, false);
  }
});

test("GEO V2 reuses existing Louvre, Mona Lisa and Leonardo models without duplication", async () => {
  assert.equal(place.remoteExperience.defaultModelId, "louvre-building");
  assert.equal(place.remoteExperience.models.filter((model) => model.loading === "initial").length, 1);

  for (const model of place.remoteExperience.models) {
    const modelStats = await stat(resolve(repositoryRoot, model.path));
    assert.ok(modelStats.isFile(), `${model.path} must exist`);
  }

  const leonardo = place.remoteExperience.models.find((model) => model.id === "leonardo-standing");
  assert.equal(leonardo.path, "assets/artists/leonardo-da-vinci/reimagined/models/davinci-standing-c.glb");

  const framed = await stat(resolve(repositoryRoot, "assets/artists/leonardo-da-vinci/artworks/mona-lisa/models/monalisa-tableau-c.glb"));
  const mainV2 = await stat(resolve(repositoryRoot, "assets/artists/leonardo-da-vinci/artworks/mona-lisa/models/mona-lisa-main-v2.glb"));
  assert.ok(mainV2.size < framed.size, "main-v2 should remain the lighter comparison candidate");
});

test("GEO Quest publishes only validated profiles while preserving the original fallback", async () => {
  const louvre = place.remoteExperience.models.find((model) => model.id === "louvre-building");
  assert.equal(place.schemaVersion, "3.1");
  assert.equal(louvre.path, "assets/environments/gallery/models/museums/Louvre-full-joint_c.glb");
  assert.equal(louvre.remoteBaseUrl, "https://media.artdaci.com/geo/louvre/models/");
  assert.deepEqual(
    louvre.variants.map((variant) => variant.id),
    ["desktop", "mobile", "quest", "quest-low", "quest-webp"],
  );

  const originalBytes = await readFile(resolve(repositoryRoot, louvre.path));
  assert.equal(
    createHash("sha256").update(originalBytes).digest("hex"),
    "06276e8634b6e759513ba4ceed823931dd0547fe1e6de42b9868f3f80fb13b91",
  );
  const published = Object.fromEntries(
    louvre.variants.filter((variant) => variant.status === "validated").map((variant) => [variant.id, variant]),
  );
  assert.deepEqual(Object.keys(published), ["quest", "quest-low", "quest-webp"]);
  assert.deepEqual(
    [published.quest.remotePath, published["quest-low"].remotePath, published["quest-webp"].remotePath],
    ["louvre-quest-1k.glb", "louvre-quest-low.glb", "louvre-quest-webp.glb"],
  );
  assert.deepEqual(
    [published.quest.bytes, published["quest-low"].bytes, published["quest-webp"].bytes],
    [8588080, 5368512, 7690072],
  );
  assert.deepEqual(
    [published.quest.sha256, published["quest-low"].sha256, published["quest-webp"].sha256],
    [
      "FE3F680040D46BD96ECD509D86ED62581566433F4130B68A3D7A1B5BF8C27ECA",
      "FEBB083D55F1836883A7EF064479D9EE2FCF1E619E99454C6F1A090B19C50C07",
      "FE024A765591D4110DD77BCDB9C4EA80FD26D1536A892EE3D6CB0A3F4315BAE0",
    ],
  );
  assert.equal(published.quest.hardwareValidation.device, "Meta Quest 3S");
  assert.equal(published.quest.hardwareValidation.status, "user-validated");
  assert.equal(published.quest.hardwareValidation.benchmark, null);
  assert.ok(published.quest.hardwareValidation.observations.includes("no-observed-magenta-fringe"));
  assert.equal(louvre.variants.some((variant) => /mat001-(?:mr|basecolor-uastc|basecolor-mr)/.test(variant.path || variant.remotePath || "")), false);
});

test("GEO Quest selection is data-driven and keeps low-memory, compatibility and original fallbacks", () => {
  assert.equal(selectPerformanceProfile({
    deviceMemory: 16,
    hardwareConcurrency: 12,
    maxTextureSize: 16384,
    viewportWidth: 1440,
  }), "desktop");
  assert.equal(selectPerformanceProfile({
    coarsePointer: true,
    deviceMemory: 4,
    hardwareConcurrency: 4,
    viewportWidth: 390,
  }), "mobile");
  assert.equal(selectPerformanceProfile({
    immersiveVr: true,
    coarsePointer: true,
    maxTextureSize: 8192,
  }), "quest");
  assert.equal(selectPerformanceProfile({ forcedProfile: "quest" }), "quest");
  assert.equal(selectPerformanceProfile({ forcedProfile: "quest-low" }), "quest-low");
  assert.equal(selectPerformanceProfile({ forcedProfile: "quest-webp" }), "quest-webp");
  assert.notEqual(selectPerformanceProfile({ viewportWidth: 390 }), "quest-low");

  const louvre = place.remoteExperience.models.find((model) => model.id === "louvre-building");
  assert.deepEqual(
    modelVariantCandidates(louvre, "mobile").map((candidate) => candidate.id),
    ["mobile", "quest-webp", "original"],
  );
  assert.deepEqual(
    modelVariantCandidates(louvre, "quest").map((candidate) => candidate.id),
    ["quest", "quest-low", "quest-webp", "original"],
  );
  assert.deepEqual(
    modelVariantCandidates(louvre, "quest-low").map((candidate) => candidate.id),
    ["quest-low", "quest-webp", "original"],
  );
  assert.deepEqual(
    modelVariantCandidates(louvre, "quest-webp").map((candidate) => candidate.id),
    ["quest-webp", "original"],
  );
  const questCandidates = modelVariantCandidates(louvre, "quest");
  assert.equal(new Set(questCandidates.map((candidate) => candidate.remoteUrl || candidate.path)).size, questCandidates.length);
  assert.equal(questCandidates[0].remoteUrl, "https://media.artdaci.com/geo/louvre/models/louvre-quest-1k.glb");
  assert.equal(questCandidates[1].remoteUrl, "https://media.artdaci.com/geo/louvre/models/louvre-quest-low.glb");
  assert.equal(questCandidates[2].remoteUrl, "https://media.artdaci.com/geo/louvre/models/louvre-quest-webp.glb");
  assert.equal(questCandidates[3].source, "project");
  assert.deepEqual(
    modelVariantCandidates({ path: "fallback.glb", variants: [{ id: "mobile", path: "" }] }, "mobile"),
    [{ id: "original", path: "fallback.glb", remoteUrl: "", source: "project" }],
  );
});

test("GEO remote model URLs stay within their configured HTTPS base", () => {
  const moduleUrl = new URL("../geo/scripts/remote-viewer.js", import.meta.url).href;
  const remote = remoteAssetUrl("https://media.artdaci.com/geo/louvre/models/", "louvre-quest-1k.glb");
  assert.equal(remote, "https://media.artdaci.com/geo/louvre/models/louvre-quest-1k.glb");
  assert.equal(modelCandidateUrl({ remoteUrl: remote }, moduleUrl), remote);
  assert.match(modelCandidateUrl({ path: "assets/model.glb" }, moduleUrl), /assets\/model\.glb$/);
  assert.throws(() => remoteAssetUrl("http://media.artdaci.com/geo/", "model.glb"));
  assert.throws(() => remoteAssetUrl("https://media.artdaci.com/geo/", "../model.glb"));
  assert.throws(() => modelCandidateUrl({ remoteUrl: "http://example.com/model.glb" }, moduleUrl));
});

test("Mona Lisa POI resolves canonical audio with FR EN AR local fallbacks", () => {
  const content = place.contents[0];
  const point = place.pointsOfInterest.find((candidate) => candidate.id === "ld01-mona-lisa");
  assert.equal(content.artworkId, "ld01");
  assert.equal(point.content.audio.source, "linked-content");
  assert.equal(point.content.audio.contentArtworkId, "ld01");
  assert.equal(place.mediaResolver.canonicalManifestUrl, "https://media.artdaci.com/artworks/ld01/manifest.json");
  assert.equal(content.media.image.manifestKey, "images.main");
  for (const language of languages) {
    assert.equal(content.media.audio[language].manifestKey, `audio.overview.${language}`);
    assert.match(content.media.audio[language].localFallback, /mona-lisa|الموناليزا/);
  }
});

test("GEO language helpers preserve routes and support French English and Arabic", () => {
  assert.equal(languageFromSearch("?lang=fr"), "fr");
  assert.equal(languageFromSearch("?lang=en-US"), "en");
  assert.equal(languageFromSearch("?lang=ar"), "ar");
  assert.equal(languageFromSearch("?lang=de"), "fr");
  assert.equal(localize(place.name, "ar"), "متحف اللوفر");
  assert.equal(withLanguage("../vr.html?painting=mona-lisa&model=2", "en"), "../vr.html?painting=mona-lisa&model=2&lang=en");
  assert.match(place.remoteExperience.routes.artworkVr, /vr\.html\?painting=mona-lisa&model=2/);
  assert.match(place.remoteExperience.routes.placeVr, /gallery-vr\.html\?room=louvre/);
});

test("Project media paths resolve from the isolated GEO scripts directory", () => {
  const moduleUrl = new URL("../geo/scripts/remote-viewer.js", import.meta.url).href;
  const framedModel = place.remoteExperience.models.find((model) => model.id === "mona-lisa-framed");
  const resolved = projectAssetUrl(framedModel.path, moduleUrl);
  assert.match(resolved, /assets\/artists\/leonardo-da-vinci\/artworks\/mona-lisa\/models\/monalisa-tableau-c\.glb$/);
  assert.throws(() => projectAssetUrl("../outside.glb", moduleUrl));
  assert.throws(() => projectAssetUrl("https://example.com/model.glb", moduleUrl));
});

test("Remote page exposes the V2 journey while V1 entry pages remain intact", async () => {
  const index = await readFile(resolve(repositoryRoot, "geo/index.html"), "utf8");
  const placePage = await readFile(resolve(repositoryRoot, "geo/place.html"), "utf8");
  const remote = await readFile(resolve(repositoryRoot, "geo/remote.html"), "utf8");
  const runtime = await readFile(resolve(repositoryRoot, "geo/scripts/remote-viewer.js"), "utf8");

  assert.match(index, /ARTDACI\s*<br \/>GEO/);
  assert.match(placePage, /data-copy="onsiteTitle"/);
  assert.match(placePage, /data-copy="remoteTitle"/);
  assert.match(placePage, /aria-disabled="true"/);
  assert.match(remote, /id="poi-list"/);
  assert.match(remote, /id="poi-detail"/);
  assert.match(remote, /id="artwork-audio"/);
  assert.match(remote, /id="reset-view-button"/);
  assert.match(remote, /vendor\/model-viewer\.min\.js/);
  assert.match(runtime, /selectPointOfInterest/);
  assert.match(runtime, /resolveCanonicalAudio/);
  assert.match(runtime, /modelCacheSize\s*=\s*1/);
  assert.match(runtime, /activeCandidateIndex \+ 1 < activeModelCandidates\.length/);
  assert.match(runtime, /modelCandidateUrl/);
  assert.doesNotMatch(runtime, /navigator\.userAgent/);
  assert.doesNotMatch(`${index}\n${placePage}\n${remote}\n${runtime}`, /maps\.googleapis\.com|geospatial\.googleapis/i);
});
