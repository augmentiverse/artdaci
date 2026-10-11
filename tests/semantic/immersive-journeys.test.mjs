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


test("Monet return signs appear inside WebXR and navigate through the existing exit targets", async () => {
  const [gallery, html] = await Promise.all([
    text("scripts/gallery-vr.js"), text("gallery-vr.html")
  ]);
  const begin = gallery.indexOf("function monetLearningJourneyReturnHref() {");
  const end = gallery.indexOf("function addDaVinciDecor(", begin);
  assert(begin >= 0 && end > begin);
  const create = new Function(
    "params", "isConnectedMuseum", "artistRoomId", "lang",
    "ARTIST_ROOM_ORDER", "ARTIST_ROOMS", "text", "createWallSign", "makeVirtualGuideUrl",
    gallery.slice(begin,end) +
      "\nreturn { monetLearningJourneyReturnHref, addConnectedRoomNavigation };"
  );
  const rooms = ["da-vinci","vermeer","van-gogh","monet"];
  const roomNames = Object.fromEntries(rooms.map((name) => [name,{name}]));
  const copy = {
    livingBook:"Book", cinemaEnter:"Cinema", modelsRoom:"Models", bedroomRoom:"Bedroom",
    reimaginedRoom:"Reimagined", exitGallery:"Exit"
  };
  for (const lang of ["fr","en","ar"]) {
    for (const journey of ["light-perception","color-gesture"]) {
      const signs = [];
      const controls = create(
        { get:(key) => ({journey,step:"2"})[key] }, true, "monet", lang,
        rooms,roomNames,copy,(label,pos,rotation,options) => {
          const target = {label,position:pos,rotation,options};
          signs.push(target);
          return target;
        },()=>"guide.html"
      );
      const url = controls.monetLearningJourneyReturnHref();
      assert(url?.startsWith("semantic/?artwork=mo01&lang="+lang));
      controls.addConnectedRoomNavigation("monet",48);
      const returns = signs.filter((sign) =>
        sign.name?.startsWith("semantic-monet-journey-return-"));
      assert.equal(returns.length,2, lang+" "+journey);
      assert(returns.every((sign) => sign.options.exitUrl === url));
      assert(returns.some((sign) => sign.name.endsWith("-entry")));
      assert(returns.some((sign) => sign.name.endsWith("-final")));
      assert(returns.every((sign) => sign.options.width >= 2.7));
    }
  }
  for (const [journey,step,artist,isConnectedMuseum] of [
    ["light-perception","1","monet",true],
    ["gaze-presence","2","monet",true],
    ["light-perception","2","vermeer",true],
    ["light-perception","2","monet",false]
  ]) {
    const signs = [];
    const controls = create(
      {get:(key) => ({journey,step})[key]},isConnectedMuseum,artist,"fr",
      rooms,roomNames,copy,(label,pos,rotation,options) => {
        const sign={label,position:pos,rotation,options};
        signs.push(sign);
        return sign;
      },()=>"guide.html"
    );
    assert.equal(controls.monetLearningJourneyReturnHref(),null);
    controls.addConnectedRoomNavigation("monet",48);
    assert.equal(signs.filter((s) => s.name?.startsWith("semantic-monet-journey-return")).length,0);
  }
  assert(gallery.includes("teleportTargets.push(sign);"));
  assert(gallery.includes("exitGallery(hit.object.userData.exitUrl)"));
  assert(html.includes("gallery-vr.js?v=180"));
});


test("final Van Gogh journey returns to Semantic with two verified destinations in FR EN AR", async () => {
  const [constellation, viewer, vrHtml, semanticUi, semanticHtml] = await Promise.all([
    text("scripts/semantics/semantic-vr-constellation.mjs"),
    text("scripts/vr-viewer.js"),
    text("vr.html"),
    text("scripts/semantics/semantic-ui.mjs"),
    text("semantic/index.html")
  ]);
  const start = constellation.indexOf("  const finished = runtime.activeJourney?.complete");
  const end = constellation.indexOf("  const panelTexture = makeTexture({", start);
  assert(start >= 0 && end > start, "In-world final portals must precede info-panel initialization");
  const build = new Function(
    "runtime", "lang", "rtl", "makePortal", "interactiveGroups", "hitTargets", "group",
    constellation.slice(start, end) + "\nreturn { finished, endingPortals };"
  );

  for (const lang of ["fr", "en", "ar"]) {
    const terminal = await invoke({
      nodeId: "vg01", environment: "vr", lang, journey: "gaze-presence", step: "2"
    });
    assert.equal(terminal.activeJourney?.complete, true);
    assert.equal(terminal.journeyBridges.length, 0, "No false next artwork at the end");
    assert.equal(terminal.journeyCompletion?.reviewHref,
      "/semantic/?artwork=vg01&lang=" + lang + "&journey=gaze-presence&step=2");
    assert.equal(terminal.journeyCompletion?.exploreHref,
      "/semantic/?artwork=vg01&lang=" + lang + "&explore=journeys");

    const objects = [];
    const interactives = new Map(), hitTargets = [];
    const result = build(terminal,lang,lang === "ar",
      (step) => {
        const part = {
          group:{position:{y:0,z:0}},
          label:{material:{opacity:0},scale:{set(){}}},
          hit:{userData:{semanticSelection:{kind:"portal",item:step}}}
        };
        return part;
      },
      interactives,hitTargets,{add:(v) => objects.push(v)}
    );
    assert(result.finished);
    assert.equal(result.endingPortals.length, 2);
    assert.equal(objects.length, 2);
    assert.equal(hitTargets.length, 4);
    assert.deepEqual(result.endingPortals.map((p) => p.href),
      [terminal.journeyCompletion.reviewHref,terminal.journeyCompletion.exploreHref]);
    assert(interactives.has("portal:journey-end:review"));
    assert(interactives.has("portal:journey-end:explore"));
  }

  const neutral = await invoke({nodeId:"vg01",environment:"vr",lang:"fr"});
  assert.equal(neutral.activeJourney, null);
  assert.equal(neutral.journeyCompletion,null);
  const first = await invoke({
    nodeId:"ld01",environment:"vr",lang:"fr",journey:"gaze-presence",step:"0"
  });
  assert.equal(first.journeyCompletion,null);
  assert.match(viewer,/runtime\.journeyCompletion\?\.reviewHref/);
  assert.match(viewer,/getElementById\("vr-back"\)/);
  assert.match(viewer,/getElementById\("gallery-link"\)/);
  assert.match(viewer,/semantic-vr-constellation\.mjs\?v=9/);
  assert.match(vrHtml,/vr-viewer\.js\?v=18/);
  assert.match(semanticUi,/params\.get\("explore"\) === "journeys"/);
  assert.match(semanticHtml,/semantic-ui\.mjs\?v=22/);
});
