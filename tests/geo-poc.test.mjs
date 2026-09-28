import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";

import {
  languageFromSearch,
  localize,
  projectAssetUrl,
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
  assert.doesNotMatch(`${index}\n${placePage}\n${remote}\n${runtime}`, /maps\.googleapis\.com|geospatial\.googleapis/i);
});
