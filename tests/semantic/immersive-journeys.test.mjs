import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { getLearningJourneys } from "../../scripts/semantics/semantic-store.mjs";

const require = createRequire(import.meta.url);
const runtime = require("../../api/semantic-runtime.js");
const root = new URL("../../", import.meta.url);
const json = async (path) => JSON.parse(await fs.readFile(new URL(path, root), "utf8"));
const text = async (path) => fs.readFile(new URL(path, root), "utf8");

async function fixtures() {
  const [artworks, concepts, experiences, journeys] = await Promise.all([
    json("content/semantics/artwork-concepts.json"),
    json("content/semantics/concepts.json"),
    json("content/semantics/experience-links.json"),
    json("content/semantics/learning-journeys.json")
  ]);
  return {
    artworkMap: new Map(artworks.artworks.map((item) => [item.id, item])),
    conceptMap: new Map(concepts.concepts.map((item) => [item.id, item])),
    experienceMap: new Map(experiences.nodes.map((item) => [item.nodeId, item.experiences])),
    learningJourneys: journeys.journeys
  };
}

const invoke = async (query) => {
  let payload;
  const res = {
    statusCode: 200,
    setHeader() {},
    end(text) { payload = JSON.parse(text); }
  };
  await runtime({ method: "GET", query }, res);
  assert.equal(res.statusCode, 200, payload?.error || "Runtime HTTP error");
  return payload;
};

test("three trilingual journeys use exclusively reviewed artwork profiles", async () => {
  const data = await fixtures();
  const paths = getLearningJourneys(data);
  assert.equal(paths.length, 3);
  for (const journey of paths) {
    assert.equal(journey.steps.length, 3);
    for (const lang of ["fr", "en", "ar"]) {
      assert(journey.title[lang] && journey.objective[lang]);
      assert(journey.steps.every((step) => step.prompt[lang]));
    }
    for (const [index, step] of journey.steps.entries()) {
      assert(data.artworkMap.has(step.artworkId));
      if (index > 0) assert(step.sharedConceptIds.length > 0, journey.id);
      if (step.immersive) assert(step.immersive.href.startsWith("/"), step.artworkId);
    }
  }
  assert.equal(getLearningJourneys(data,"ld01").length, 2);
  assert.equal(getLearningJourneys(data,"ve01").length, 3);
  assert.equal(getLearningJourneys(data,"missing").length, 0);
});

test("semantic runtime exposes verified, language-aware transitions into existing VR", async () => {
  const data = await fixtures();
  const langCases = ["fr","en","ar"];
  for (const lang of langCases) {
    for (const id of ["ld01","ve01","vg01","mo01"]) {
      const out = await invoke({nodeId:id,environment:"vr",lang});
      assert(out.learningPath.steps.length > 0, id);
      assert(out.journeyBridges.length >= 2, id);
      assert(out.journeyBridges.length <= 3, id);
      for (const bridge of out.journeyBridges) {
        assert.notEqual(bridge.toArtworkId, id);
        assert(data.artworkMap.has(bridge.toArtworkId));
        assert(bridge.title && bridge.question && bridge.sharedConcepts.length);
        assert(bridge.href.startsWith("/") && !bridge.href.startsWith("//"));
        const from = data.artworkMap.get(id);
        const target = data.artworkMap.get(bridge.toArtworkId);
        for (const concept of bridge.sharedConcepts) {
          assert(from.assertions.some((item) => item.conceptId === concept.id));
          assert(target.assertions.some((item) => item.conceptId === concept.id));
        }
      }
    }
  }
});

test("immersion augments existing graph rather than creating a second explorer", async () => {
  const [ui, html, three, vr, panel] = await Promise.all([
    text("scripts/semantics/semantic-ui.mjs"),
    text("semantic/index.html"),
    text("scripts/semantics/semantic-vr-constellation.mjs"),
    text("scripts/vr-viewer.js"),
    text("scripts/semantics/semantic-runtime-client.mjs")
  ]);
  assert(ui.includes("journeysMarkup(semanticData, artwork.id)"));
  assert(ui.includes("getLearningJourneys"));
  assert(ui.includes("data-semantic-search"));
  assert(ui.includes("graphSvgMarkup(graph)"));
  assert.equal((html.match(/data-semantic-app/g) || []).length, 1);
  assert(!html.includes("data-intelligent-explorer"));
  assert(three.includes("runtime.journeyBridges"));
  assert(three.includes("semantic-vr-bridge-"));
  assert(three.includes("makePortal(step"));
  assert(vr.includes("currentSession.end().then(navigate, navigate)"));
  assert(panel.includes("crossArtworkMarkup(runtime,lang)"));
});
