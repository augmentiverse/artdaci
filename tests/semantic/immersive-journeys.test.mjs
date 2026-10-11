import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { getLearningJourneys, localize } from "../../scripts/semantics/semantic-store.mjs";

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

test("regression: render every trilingual journey without hiding the graph", async () => {
  const data = await fixtures();
  const ui = await text("scripts/semantics/semantic-ui.mjs");
  const start = ui.indexOf("function journeyImmersiveHref(href, journeyId, stepIndex) {");
  const end = ui.indexOf("function relatedMarkup(data, artworkId) {", start);
  assert(start >= 0 && end > start, "Both journey renderers must exist");
  const source = ui.slice(start, end);
  const compile = new Function(
    "getLearningJourneys", "JOURNEY_COPY", "lang", "esc", "localize",
    "urlFor", "experienceHref", "console", "params",
    source + "\nreturn { journeysMarkup, safeJourneysMarkup };"
  );
  const esc = (value) => String(value ?? "")
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
  const copy = {
    fr: { heading:"Parcours", intro:"Découvrir", evidence:"Relation fondée sur", graph:"Graphe", immersive:"Immersion", status:"Éditorial" },
    en: { heading:"Journeys", intro:"Discover", evidence:"Connected through", graph:"Graph", immersive:"Immersive", status:"Editorial" },
    ar: { heading:"مسارات", intro:"استكشف", evidence:"مفاهيم", graph:"الرسم", immersive:"غامر", status:"تعليمي" }
  };
  for (const lang of ["fr", "en", "ar"]) {
    const render = compile(getLearningJourneys,copy,lang,esc,localize,
      (id) => "?artwork=" + encodeURIComponent(id) + "&lang=" + lang,
      (entry) => String(entry.href || "").replaceAll("{lang}",lang),console,
      new URLSearchParams());
    for (const artworkId of ["ld01", "ve01", "vg01", "mo01"]) {
      const markup = render.journeysMarkup(data, artworkId);
      assert(markup.includes("semantic-cross-journeys"), artworkId+" "+lang);
      assert(markup.includes("cross-journey-evidence"), artworkId+" "+lang);
      assert(markup.includes("cross-journey-actions"), artworkId+" "+lang);
      assert.equal(render.safeJourneysMarkup(data, artworkId), markup);
    }
  }
});

test("regression: optional journey failure cannot prevent the original graph", async () => {
  const ui = await text("scripts/semantics/semantic-ui.mjs");
  assert(ui.includes("safeJourneysMarkup(semanticData, artwork.id)"));
  assert(ui.includes("renderWorkspace(semanticData, artwork.id)"));
  assert(ui.indexOf("renderWorkspace(semanticData, artwork.id)") < ui.indexOf("safeJourneysMarkup(semanticData, artwork.id)"));
  assert(ui.includes("console.warn(\"ARTDACI learning journeys unavailable; retaining core semantic experience.\""));
  assert(!ui.includes("data.conceptMap.get(id).labels, lang))).join"));
});


test("a selected learning journey preserves stage, evidence, destination, and completion", async () => {
  for (const lang of ["fr","en","ar"]) {
    const first = await invoke({
      nodeId:"ld01", environment:"vr", lang, journey:"light-perception",step:"0"
    });
    assert.equal(first.activeJourney?.stepIndex,0);
    assert.equal(first.activeJourney?.totalSteps,3);
    assert.equal(first.journeyBridges.length,1);
    assert.equal(first.journeyBridges[0].toArtworkId,"ve01");
    assert(first.journeyBridges[0].href.includes("journey=light-perception"));
    assert(first.journeyBridges[0].href.includes("step=1"));
    const second = await invoke({
      nodeId:"ve01", environment:"vr", lang, journey:"light-perception",step:"1"
    });
    assert.equal(second.activeJourney?.stepIndex,1);
    assert.equal(second.journeyBridges.length,1);
    assert.equal(second.journeyBridges[0].toArtworkId,"mo01");
    assert(second.journeyBridges[0].href.startsWith("/gallery-vr.html?"));
    assert(second.journeyBridges[0].href.includes("journey=light-perception"));
    assert(second.journeyBridges[0].href.includes("step=2"));
    const final = await invoke({
      nodeId:"mo01", environment:"vr", lang, journey:"light-perception",step:"2"
    });
    assert.equal(final.activeJourney?.complete,true);
    assert.equal(final.journeyBridges.length,0);
  }
});

test("journey parameters never authorize an unrelated or invented path", async () => {
  const wrongStep = await invoke({nodeId:"ld01",lang:"fr",environment:"vr",journey:"light-perception",step:"2"});
  assert.equal(wrongStep.activeJourney,null);
  const unknown = await invoke({nodeId:"ld01",lang:"fr",environment:"vr",journey:"invented",step:"0"});
  assert.equal(unknown.activeJourney,null);
  const unrelated = await invoke({nodeId:"mo01",lang:"fr",environment:"vr",journey:"gaze-presence",step:"2"});
  assert.equal(unrelated.activeJourney,null);
  const special = await invoke({nodeId:"ve01",lang:"fr",environment:"vr",journey:"color-gesture",step:"0"});
  assert.equal(special.journeyBridges.length,1);
  assert.equal(special.journeyBridges[0].toArtworkId,"vg01");
  assert(special.journeyBridges[0].sharedConcepts.some(x=>x.id==="concept.color"));
});

test("the existing UI and immersive viewers carry the journey without duplicate controls", async () => {
  const [ui,vr,html,viewer,client,gallery] = await Promise.all([
    text("scripts/semantics/semantic-ui.mjs"),
    text("scripts/semantics/semantic-vr-constellation.mjs"),
    text("vr.html"),
    text("scripts/vr-viewer.js"),
    text("scripts/semantics/semantic-runtime-client.mjs"),
    text("scripts/gallery-vr.js")
  ]);
  assert(ui.includes("journeyImmersiveHref(experienceHref(step.immersive), journey.id, index)"));
  assert(ui.includes("selectedJourney ?"));
  assert(vr.includes("runtime.activeJourney?.title"));
  assert(vr.includes("bridge.destinationStepIndex"));
  assert(viewer.includes('journeyId: params.get("journey")'));
  assert(viewer.includes('journeyStep: params.get("step")'));
  assert(client.includes("runtime.activeJourney"));
  assert(client.includes('journeyId:locationParams.get("journey")'));
  assert(gallery.includes("returnLink.href ="));
  assert(html.includes("vr-viewer.js?v=17"));
});
