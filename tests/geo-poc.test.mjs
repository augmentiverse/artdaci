import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
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

test("Louvre GEO data links ld01 without duplicating canonical media", async () => {
  const content = place.contents[0];
  assert.equal(content.artworkId, "ld01");
  assert.equal(place.mediaResolver.canonicalManifestUrl, "https://media.artdaci.com/artworks/ld01/manifest.json");
  assert.equal(content.media.image.manifestKey, "images.main");
  for (const language of ["fr", "en", "ar"]) {
    assert.equal(content.media.audio[language].manifestKey, `audio.overview.${language}`);
  }

  for (const model of place.remoteExperience.models) {
    const stats = await import("node:fs/promises").then(({ stat }) => stat(resolve(repositoryRoot, model.path)));
    assert.ok(stats.isFile(), `${model.path} must exist`);
  }
  assert.match(place.remoteExperience.routes.artworkVr, /vr\.html\?painting=mona-lisa/);
  assert.match(place.remoteExperience.routes.placeVr, /gallery-vr\.html\?room=louvre/);
});

test("GEO language helpers preserve routes and support French, English and Arabic", () => {
  assert.equal(languageFromSearch("?lang=fr"), "fr");
  assert.equal(languageFromSearch("?lang=en-US"), "en");
  assert.equal(languageFromSearch("?lang=ar"), "ar");
  assert.equal(languageFromSearch("?lang=de"), "fr");
  assert.equal(localize(place.name, "ar"), "متحف اللوفر");
  assert.equal(withLanguage("../vr.html?painting=mona-lisa&model=2", "en"), "../vr.html?painting=mona-lisa&model=2&lang=en");
});

test("Project media paths resolve from the isolated GEO scripts directory", () => {
  const moduleUrl = new URL("../geo/scripts/remote-viewer.js", import.meta.url).href;
  const resolved = projectAssetUrl(place.remoteExperience.models[0].path, moduleUrl);
  assert.match(resolved, /assets\/artists\/leonardo-da-vinci\/artworks\/mona-lisa\/models\/monalisa-tableau-c\.glb$/);
  assert.throws(() => projectAssetUrl("../outside.glb", moduleUrl));
  assert.throws(() => projectAssetUrl("https://example.com/model.glb", moduleUrl));
});

test("GEO pages expose the two modes and load only GEO-owned scripts", async () => {
  const index = await readFile(resolve(repositoryRoot, "geo/index.html"), "utf8");
  const placePage = await readFile(resolve(repositoryRoot, "geo/place.html"), "utf8");
  const remote = await readFile(resolve(repositoryRoot, "geo/remote.html"), "utf8");

  assert.match(index, /ARTDACI\s*<br \/>GEO/);
  assert.match(placePage, /data-copy="onsiteTitle"/);
  assert.match(placePage, /data-copy="remoteTitle"/);
  assert.match(placePage, /aria-disabled="true"/);
  assert.match(remote, /vendor\/model-viewer\.min\.js/);
  assert.match(remote, /scripts\/remote-viewer\.js/);
  assert.match(await readFile(resolve(repositoryRoot, "geo/scripts/remote-viewer.js"), "utf8"), /querySelectorAll\("\[data-back-link\]"\)/);
  assert.doesNotMatch(`${index}\n${placePage}\n${remote}`, /maps\.googleapis\.com|geospatial\.googleapis/i);
});
