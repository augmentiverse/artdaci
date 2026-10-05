import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const readJson = async (relativePath) =>
  JSON.parse(await fs.readFile(path.join(root, relativePath), "utf8"));

const conceptsDoc = await readJson("content/semantics/concepts.json");
const artworksDoc = await readJson("content/semantics/artwork-concepts.json");
const sourcesDoc = await readJson("content/semantics/sources.json");
const externalMappings = await readJson("content/semantics/external-mappings.json");
const reviewSchema = await readJson("schema/semantic-review-item.schema.json");
const culturalDoc = await readJson("content/semantics/cultural-knowledge.json");
const culturalSchema = await readJson("schema/cultural-knowledge-graph.schema.json");
const linkedArtSchema = await readJson("schema/linked-art-export.schema.json");
const linkedArtApi = await fs.readFile(path.join(root, "api/linked-art.js"), "utf8");
const imageAnnotations = await readJson("content/semantics/image-annotations.json");
const imageAnnotationSchema = await readJson("schema/image-semantic-annotations.schema.json");
const iconographyDoc = await readJson("content/semantics/iconography.json");
const iconographySchema = await readJson("schema/iconography.schema.json");
const experienceDoc = await readJson("content/semantics/experience-links.json");
const experienceSchema = await readJson("schema/semantic-experience-links.schema.json");
const pedagogyDoc = await readJson("content/semantics/pedagogical-relations.json");
const pedagogySchema = await readJson("schema/pedagogical-relations.schema.json");
const queryHintsDoc = await readJson("content/semantics/query-aliases.json");
const queryHintsSchema = await readJson("schema/semantic-query-aliases.schema.json");
const runtimeContexts = await readJson("content/semantics/runtime-contexts.json");
const runtimeSchema = await readJson("schema/semantic-runtime-contexts.schema.json");
const iiifCollection = await readJson("iiif/collection.json");
const iiifIds = ["ld01", "ve01", "vg01", "mo01"];
const iiifManifests = Object.fromEntries(
  await Promise.all(iiifIds.map(async (id) => [id, await readJson(`iiif/${id}/manifest.json`)]))
);
const iiifAnnotationPages = Object.fromEntries(
  await Promise.all(iiifIds.map(async (id) => [id, await readJson(`iiif/${id}/annotations.json`)]))
);
const semanticUi = await fs.readFile(path.join(root, "scripts/semantics/semantic-ui.mjs"), "utf8");
const semanticStore = await fs.readFile(path.join(root, "scripts/semantics/semantic-store.mjs"), "utf8");
const semanticHtml = await fs.readFile(path.join(root, "semantic/index.html"), "utf8");
const semanticCss = await fs.readFile(path.join(root, "styles/semantic.css"), "utf8");
const externalSourcesUi = await fs.readFile(path.join(root, "scripts/semantics/external-sources.mjs"), "utf8");
const semanticSourceApi = await fs.readFile(path.join(root, "api/semantic-source.js"), "utf8");
const mastersHubViewer = await fs.readFile(path.join(root, "geo/scripts/masters-hub-viewer.js"), "utf8");
const mastersHubHtml = await fs.readFile(path.join(root, "geo/masters-hub.html"), "utf8");
const embeddingClient = await fs.readFile(path.join(root, "scripts/semantics/embedding-client.mjs"), "utf8");
const embeddingApi = await fs.readFile(path.join(root, "api/semantic-embeddings.js"), "utf8");
const semanticRuntimeApi = await fs.readFile(path.join(root, "api/semantic-runtime.js"), "utf8");
const semanticRuntimeClient = await fs.readFile(path.join(root, "scripts/semantics/semantic-runtime-client.mjs"), "utf8");
const semanticRuntimeCss = await fs.readFile(path.join(root, "styles/semantic-runtime.css"), "utf8");
const visitorGuide = await fs.readFile(path.join(root, "scripts/visitor-guide.js"), "utf8");
const visitorGuideCss = await fs.readFile(path.join(root, "styles/visitor-guide.css"), "utf8");
const semanticArHotspots = await fs.readFile(path.join(root, "scripts/semantics/semantic-ar-hotspots.mjs"), "utf8");
const semanticVrConstellation = await fs.readFile(path.join(root, "scripts/semantics/semantic-vr-constellation.mjs"), "utf8");
const arCss = await fs.readFile(path.join(root, "styles/ar.css"), "utf8");
const arViewer = await fs.readFile(path.join(root, "scripts/ar-viewer.js"), "utf8");
const vrViewer = await fs.readFile(path.join(root, "scripts/vr-viewer.js"), "utf8");
const arHtml = await fs.readFile(path.join(root, "ar.html"), "utf8");
const vrHtml = await fs.readFile(path.join(root, "vr.html"), "utf8");
const geoRemoteViewer = await fs.readFile(path.join(root, "geo/scripts/remote-viewer.js"), "utf8");
const geoRemoteHtml = await fs.readFile(path.join(root, "geo/remote.html"), "utf8");

const errors = [];
const assert = (condition, message) => { if (!condition) errors.push(message); };

const conceptIds = conceptsDoc.concepts.map((item) => item.id);
const artworkIds = artworksDoc.artworks.map((item) => item.id);
const conceptSet = new Set(conceptIds);
const artworkSet = new Set(artworkIds);

assert(conceptIds.length === 50, "V2.10 must contain 50 concepts.");
assert(conceptSet.size === conceptIds.length, "Concept IDs must be unique.");
assert(artworkIds.length === 4, "V2.10 must contain four pilot artworks.");
assert(artworkSet.size === artworkIds.length, "Artwork IDs must be unique.");
assert(culturalDoc.entities.length === 20, "V2.10 must contain 20 cultural entities.");
assert(culturalDoc.relations.length === 31, "V2.10 must contain 31 cultural relations.");
assert(culturalSchema.properties?.entities, "Cultural knowledge graph schema must describe entities.");
assert(linkedArtSchema.properties?.["@context"]?.const === "https://linked.art/ns/v1/linked-art.json", "Linked Art schema must use the official context.");
assert(imageAnnotationSchema.properties?.coordinateSystem?.const === "normalized-canvas", "Image annotations must use the normalized canvas model.");
assert(iconographyDoc.subjects.length === 16, "V2.10 must contain sixteen iconographic subjects and motifs.");
assert(iconographyDoc.artworkLinks.length === 16, "V2.10 must contain sixteen artwork-iconography links.");
assert(iconographyDoc.regionLinks.length === 12, "V2.10 must connect twelve IIIF regions to iconography.");
assert(iconographySchema.properties?.subjects, "Iconography schema must describe subjects.");
const iconographyIds = new Set(iconographyDoc.subjects.map((item) => item.id));
assert(iconographyIds.size === iconographyDoc.subjects.length, "Iconography IDs must be unique.");

assert(experienceSchema.properties?.nodes, "Experience schema must describe semantic node links.");
assert(experienceDoc.nodes.length === 13, "V2.10 must map thirteen semantic nodes to experiences.");
assert(experienceDoc.nodes.reduce((sum, entry) => sum + entry.experiences.length, 0) === 41, "V2.10 must expose forty-one cross-media experience links.");
const experienceNodeIds = new Set(experienceDoc.nodes.map((entry) => entry.nodeId));
assert(experienceNodeIds.has("ld01"), "Mona Lisa must expose cross-media experiences.");
assert(experienceNodeIds.has("museum.louvre"), "Louvre must expose cross-media experiences.");
assert(experienceNodeIds.has("place.paris"), "Paris must expose GEO experiences.");
assert(experienceNodeIds.has("artist.vincent-van-gogh"), "Van Gogh must expose a 3D guide.");
assert(experienceNodeIds.has("technique.sfumato"), "Sfumato must expose contextual media.");
for (const entry of experienceDoc.nodes) {
  const knownNode = artworkSet.has(entry.nodeId)
    || culturalDoc.entities.some((entity) => entity.id === entry.nodeId)
    || conceptSet.has(entry.nodeId)
    || iconographyIds.has(entry.nodeId);
  assert(knownNode, `${entry.nodeId}: experience mapping targets an unknown semantic node.`);
  for (const experience of entry.experiences) {
    assert(experienceDoc.channels.includes(experience.channel), `${experience.id}: unknown experience channel.`);
    assert(Boolean(experience.href), `${experience.id}: missing href.`);
    for (const language of ["fr", "en", "ar"]) {
      assert(Boolean(experience.labels?.[language]), `${experience.id}: missing ${language} label.`);
      assert(Boolean(experience.descriptions?.[language]), `${experience.id}: missing ${language} description.`);
    }
  }
}
const allRegionIds = new Set(imageAnnotations.artworks.flatMap((profile) => profile.regions.map((region) => region.id)));
assert(pedagogySchema.properties?.relations, "Pedagogical schema must describe relations.");
assert(pedagogyDoc.relationTypes.length === 6, "V2.10 must define six pedagogical relation types.");
assert(pedagogyDoc.relations.length === 24, "V2.10 must contain twenty-four pedagogical relations.");
assert(queryHintsSchema.properties?.nodeAliases, "Query hints schema must describe node aliases.");
assert(queryHintsDoc.intents.length === 5, "V2.10 must define five natural-language query intents.");
assert(queryHintsDoc.nodeAliases.length === 23, "V2.10 must define twenty-three semantic query aliases.");
for (const language of ["fr", "en", "ar"]) {
  assert(queryHintsDoc.examples?.[language]?.length >= 4, `V2.10 must provide at least four ${language} query examples.`);
}
assert(queryHintsDoc.nodeAliases.some((entry) => entry.nodeId === "technique.sfumato"), "Natural-language search must recognize sfumato.");
assert(queryHintsDoc.nodeAliases.some((entry) => entry.nodeId === "artist.vincent-van-gogh"), "Natural-language search must recognize Van Gogh.");
assert(queryHintsDoc.nodeAliases.some((entry) => entry.nodeId === "place.paris"), "Natural-language search must recognize Paris.");
assert(runtimeSchema.properties?.environments, "Semantic runtime schema must describe environments.");
assert(Object.keys(runtimeContexts.environments || {}).length === 6, "V2.10 must define six semantic runtime environments.");
for (const environment of ["web", "book", "ar", "vr", "geo", "3d"]) {
  assert(Boolean(runtimeContexts.environments?.[environment]), `V2.10 runtime environment missing: ${environment}.`);
}
assert(runtimeContexts.runtimeAliases?.artworkSlugs?.["mona-lisa"] === "ld01", "Runtime must map Mona Lisa to ld01.");
assert(runtimeContexts.runtimeAliases?.artworkSlugs?.["van-gogh"] === "vg01", "Runtime must map Van Gogh self-portrait to vg01.");
assert(runtimeContexts.runtimeAliases?.museumSlugs?.louvre === "museum.louvre", "Runtime must map Louvre museum slug.");
assert(runtimeContexts.runtimeAliases?.artistSlugs?.["van-gogh"] === "artist.vincent-van-gogh", "Runtime must map Van Gogh guide slug.");
const pedagogicalIds = new Set();
const knownSemanticIds = new Set([
  ...conceptSet,
  ...artworkSet,
  ...culturalDoc.entities.map((entity) => entity.id),
  ...iconographyIds
]);
for (const relation of pedagogyDoc.relations) {
  assert(!pedagogicalIds.has(relation.id), `${relation.id}: duplicate pedagogical relation ID.`);
  pedagogicalIds.add(relation.id);
  assert(pedagogyDoc.relationTypes.includes(relation.type), `${relation.id}: unknown pedagogical relation type.`);
  assert(knownSemanticIds.has(relation.source) || allRegionIds.has(relation.source), `${relation.id}: unknown source ${relation.source}.`);
  assert(knownSemanticIds.has(relation.target) || allRegionIds.has(relation.target), `${relation.id}: unknown target ${relation.target}.`);
  assert(relation.source !== relation.target, `${relation.id}: source and target must differ.`);
  for (const language of ["fr", "en", "ar"]) {
    assert(Boolean(relation.rationale?.[language]), `${relation.id}: missing ${language} rationale.`);
    assert(Boolean(relation.prompt?.[language]), `${relation.id}: missing ${language} prompt.`);
  }
}
for (const subject of iconographyDoc.subjects) {
  if (subject.iconclass) {
    assert(/^[0-9]/.test(subject.iconclass.notation), `${subject.id}: invalid Iconclass notation.`);
    assert(String(subject.iconclass.uri || "").includes("iconclass.org"), `${subject.id}: invalid Iconclass URI.`);
  }
}
for (const link of iconographyDoc.artworkLinks) {
  assert(artworkSet.has(link.artworkId), `${link.subjectId}: unknown artwork ${link.artworkId}.`);
  assert(iconographyIds.has(link.subjectId), `${link.subjectId}: unknown iconography subject.`);
}
for (const link of iconographyDoc.regionLinks) {
  assert(allRegionIds.has(link.regionId), `${link.regionId}: unknown IIIF region.`);
  for (const subjectId of link.subjectIds) assert(iconographyIds.has(subjectId), `${link.regionId}: unknown iconography subject ${subjectId}.`);
}
assert(imageAnnotations.artworks.length === 4, "V2.10 must contain four annotated pilot artworks.");
assert(imageAnnotations.artworks.reduce((sum, item) => sum + (item.regions?.length || 0), 0) === 16, "V2.10 must contain sixteen semantic image regions.");
for (const profile of imageAnnotations.artworks) {
  assert(iiifIds.includes(profile.artworkId), `${profile.artworkId}: unexpected IIIF pilot artwork.`);
  assert(profile.regions?.length === 4, `${profile.artworkId}: must expose four semantic regions.`);
  for (const region of profile.regions || []) {
    const [x, y, width, height] = region.xywh;
    assert(x + width <= profile.canvas.width, `${region.id}: region exceeds canvas width.`);
    assert(y + height <= profile.canvas.height, `${region.id}: region exceeds canvas height.`);
    for (const conceptId of region.conceptIds || []) {
      assert(conceptSet.has(conceptId), `${region.id}: unknown concept ${conceptId}`);
    }
  }
}
assert(iiifCollection["@context"] === "http://iiif.io/api/presentation/3/context.json", "IIIF Collection must use Presentation API 3 context.");
assert(iiifCollection.type === "Collection", "IIIF pilot resource must be a Collection.");
assert(iiifCollection.items?.length === 4, "IIIF Collection must contain four manifests.");
for (const id of iiifIds) {
  const manifest = iiifManifests[id];
  const annotations = iiifAnnotationPages[id];
  assert(manifest["@context"] === "http://iiif.io/api/presentation/3/context.json", `${id}: manifest must use Presentation API 3 context.`);
  assert(manifest.type === "Manifest", `${id}: IIIF file must be a Manifest.`);
  assert(manifest.items?.[0]?.type === "Canvas", `${id}: manifest must expose a Canvas.`);
  assert(manifest.items?.[0]?.annotations?.[0]?.id === `https://artdaci.com/iiif/${id}/annotations.json`, `${id}: Canvas must reference its semantic AnnotationPage.`);
  assert(annotations["@context"] === "http://iiif.io/api/presentation/3/context.json", `${id}: AnnotationPage must use Presentation API 3 context.`);
  assert(annotations.type === "AnnotationPage", `${id}: semantic annotations must be an AnnotationPage.`);
  assert(annotations.items?.length === 4, `${id}: AnnotationPage must contain four annotations.`);
  for (const annotation of annotations.items || []) {
    assert(String(annotation.target || "").includes("#xywh="), `${annotation.id}: target must use an xywh Canvas fragment.`);
    const linkedTags = (annotation.body || []).filter((body) => body.type === "SpecificResource");
    const texts = (annotation.body || []).filter((body) => body.type === "TextualBody");
    assert(linkedTags.length > 0, `${annotation.id}: must contain linked semantic tags.`);
    assert(texts.length === 3, `${annotation.id}: must contain FR/EN/AR textual bodies.`);
  }
}

let assertionCount = 0;
for (const artwork of artworksDoc.artworks) {
  for (const assertion of artwork.assertions || []) {
    assertionCount += 1;
    assert(conceptSet.has(assertion.conceptId), `${artwork.id}: unknown concept ${assertion.conceptId}`);
  }
}
assert(assertionCount === 77, `Expected 77 weighted assertions, got ${assertionCount}.`);

const vg01 = artworksDoc.artworks.find((item) => item.id === "vg01");
assert(vg01?.date?.en === "1889", "vg01 must remain the 1889 Self-Portrait.");
assert(String(vg01?.museum?.en || "").includes("Orsay"), "vg01 must remain linked to Musée d’Orsay.");
assert(vg01?.image === "../assets/artists/vincent-van-gogh/collection/autoportrait-vangogh.webp", "V2.10 must use the canonical 1889 Van Gogh image.");
const ld01 = artworksDoc.artworks.find((item) => item.id === "ld01");
assert(ld01?.image === "../assets/artists/leonardo-da-vinci/collection/mana-lisa-davinci.webp", "ld01 must use the canonical portrait Mona Lisa asset.");
const vg01Canonical = artworksDoc.artworks.find((item) => item.id === "vg01");
assert(vg01Canonical?.image === "../assets/artists/vincent-van-gogh/collection/autoportrait-vangogh.webp", "vg01 must use the canonical 1889 Van Gogh self-portrait asset.");

const sourceById = new Map(sourcesDoc.sources.map((source) => [source.id, source]));
assert(sourceById.get("wikidata")?.status === "active", "Wikidata must remain active.");
assert(sourceById.get("wikidata")?.license === "CC0 1.0", "Wikidata license must be recorded.");
assert(sourceById.get("getty-aat")?.status === "active", "Getty AAT must remain active.");
assert(sourceById.get("getty-aat")?.license === "ODC-By 1.0", "Getty AAT license must be recorded.");
assert(sourceById.get("getty-ulan")?.status === "active", "Getty ULAN must be active.");
assert(sourceById.get("getty-tgn")?.status === "active", "Getty TGN must be active.");
assert(sourceById.get("iconclass")?.status === "active", "Iconclass must be active.");
assert(sourceById.get("iconclass")?.mode === "live-lod", "Iconclass must use live linked-data retrieval.");
assert(sourceById.get("memodata-tid")?.status === "contact-required", "Memodata must remain contact-required.");

assert(externalMappings.artworkMappings.length === 4, "Four artwork mappings are required.");
assert(externalMappings.conceptMappings.length >= 10, "At least ten concept mappings are required.");
for (const mapping of externalMappings.artworkMappings) {
  assert(artworkSet.has(mapping.artworkId), `Unknown mapped artwork: ${mapping.artworkId}`);
  assert(/^Q\d+$/.test(mapping.wikidata), `Invalid Wikidata ID: ${mapping.wikidata}`);
}
for (const mapping of externalMappings.conceptMappings) {
  assert(conceptSet.has(mapping.conceptId), `Unknown mapped concept: ${mapping.conceptId}`);
  if (mapping.wikidata) assert(/^Q\d+$/.test(mapping.wikidata), `Invalid Wikidata ID for ${mapping.conceptId}`);
  if (mapping.gettyAat) assert(/^\d{6,12}$/.test(mapping.gettyAat), `Invalid Getty AAT ID for ${mapping.conceptId}`);
}

assert(semanticHtml.includes("POC V2.11"), "Semantic page must expose V2.11.");
assert(semanticHtml.includes("semantic.css?v=17"), "Semantic page must load V2.10 CSS.");
assert(semanticHtml.includes("semantic-ui.mjs?v=19"), "Semantic page must load V2.10 UI.");
assert(semanticUi.includes("graphWithExternalSuggestions"), "External graph exploration must remain available.");
assert(semanticUi.includes("graphDataForEntity"), "Cultural entities must be graph centers.");
assert(semanticUi.includes("graphDataForIconography"), "Iconographic subjects must be graph centers.");
assert(semanticUi.includes("iconographyInspector"), "Iconographic subjects must have a dedicated inspector.");
assert(semanticUi.includes("data-graph-iconography-id"), "Iconographic graph nodes must be interactive.");
assert(semanticUi.includes("data-region-iconography"), "IIIF regions must link to iconographic subjects.");
assert(semanticUi.includes("semanticData.iconographySubjects.length"), "Reader status must expose iconography count.");
assert(semanticUi.includes("semanticData.pedagogicalRelations.length"), "Reader status must expose pedagogical relation count.");
assert(semanticUi.includes("searchSemanticNaturalLanguage"), "Reader must use the natural-language semantic search engine.");
assert(semanticUi.includes("data-query-example"), "Reader must expose clickable natural-language query examples.");
assert(semanticUi.includes("data-natural-region"), "Natural-language results must deep-link to IIIF regions.");
assert(semanticUi.includes("rerankWithNeuralEmbeddings"), "Natural-language search must support optional neural reranking.");
assert(semanticStore.includes("searchSemanticNaturalLanguage"), "Semantic store must expose the hybrid natural-language search function.");
assert(semanticUi.includes("graphWithPedagogicalRelations"), "Graph must support the ARTDACI pedagogical overlay.");
assert(semanticUi.includes("pedagogicalRelationsMarkup"), "Inspectors must expose pedagogical relations.");
assert(semanticUi.includes("data-graph-pedagogy"), "Graph must expose a pedagogy visibility toggle.");
assert(semanticUi.includes("data-pedagogical-region"), "Pedagogical relations must deep-link to IIIF regions.");
assert(semanticUi.includes('params.get("region")'), "Semantic page must support direct IIIF region deep links.");
assert(semanticCss.includes(".semantic-svg-edge.is-pedagogical"), "Pedagogical graph edges must have dedicated styling.");
assert(semanticCss.includes(".pedagogical-relation-list"), "Pedagogical cards must use a compact horizontal strip.");
assert(semanticCss.includes(".image-region-pedagogy"), "IIIF region pedagogy styling must be present.");
assert(semanticCss.includes(".semantic-query-examples"), "Natural-language query examples must have dedicated styling.");
assert(semanticCss.includes(".semantic-query-result"), "Hybrid semantic search results must have dedicated styling.");
assert(semanticStore.includes("localVector"), "Hybrid search must include the lightweight local vector fallback.");
assert(semanticStore.includes("detectNaturalLanguageQuery"), "Hybrid search must detect query intent and semantic seeds.");
assert(semanticStore.includes("experienceSearchResults"), "Hybrid search must return immersive experience results.");
assert(semanticStore.includes("pedagogicalRegionResults"), "Hybrid search must return pedagogical IIIF region results.");
assert(embeddingClient.includes("rerankWithNeuralEmbeddings"), "Embedding client must expose optional neural reranking.");
assert(embeddingApi.includes("ARTDACI_EMBEDDING_ENDPOINT"), "Embedding API must be provider-configurable.");
assert(embeddingApi.includes("local-vector-fallback"), "Embedding API must advertise local fallback when unconfigured.");
assert(semanticRuntimeApi.includes('runtimeVersion: "2.11"'), "Semantic Runtime API must expose runtime version 2.11.");
assert(semanticRuntimeApi.includes("learningPathFor"), "Semantic Runtime API must derive a contextual pedagogical learning path.");
assert(semanticRuntimeApi.includes("observe-understand-compare-experience"), "Semantic Runtime must identify the four-stage learning pattern.");
assert(semanticRuntimeApi.includes("compareWith"), "Semantic Runtime learning path must support ARTDACI comparison relations.");
assert(semanticRuntimeApi.includes("contrastForLearning"), "Semantic Runtime learning path must support pedagogical contrasts.");
assert(semanticRuntimeApi.includes('environment === "vr"'), "VR learning path must avoid reopening the current individual VR surface.");
assert(semanticRuntimeApi.includes("preferredChannels"), "Semantic Runtime API must prioritize channels by environment.");
assert(semanticRuntimeApi.includes("normalized"), "Semantic Runtime API must expose normalized hotspot geometry.");
assert(semanticRuntimeApi.includes("pedagogyFor"), "Semantic Runtime API must expose pedagogical context.");
assert(semanticRuntimeApi.includes("rankedExperiences"), "Semantic Runtime API must expose contextual immersive experiences.");
assert(semanticRuntimeApi.includes("guideFor"), "Semantic Runtime must expose grounded conversational guide context.");
assert(semanticRuntimeApi.includes("guideQuestionForStep"), "Semantic Runtime must derive guide questions from learning-path stages.");
assert(semanticRuntimeApi.includes('mode: "grounded-semantic"'), "Semantic Runtime guide must identify grounded semantic mode.");
assert(semanticRuntimeClient.includes("resolveSemanticRuntime"), "Semantic Runtime client must expose context resolution.");
assert(semanticRuntimeClient.includes("mountSemanticRuntimePanel"), "Semantic Runtime client must mount immersive UI.");
assert(semanticRuntimeClient.includes("learningPathMarkup"), "Shared Semantic Runtime panel must render the adaptive learning path.");
assert(semanticRuntimeClient.includes("data-semantic-learning-path"), "Shared Semantic Runtime panel must expose the learning path container.");
assert(semanticRuntimeClient.includes("data-semantic-path-stage"), "Shared Semantic Runtime panel must identify each pedagogical stage.");
assert(semanticRuntimeCss.includes(".semantic-runtime-path-step"), "Shared Semantic Runtime styles must include learning path cards.");
assert(arViewer.includes("semantic-runtime-client.mjs?v=2"), "AR viewer must load the V2.10 shared semantic client.");
assert(vrViewer.includes("semantic-runtime-client.mjs?v=2"), "VR viewer must load the V2.10 shared semantic client.");
assert(geoRemoteViewer.includes("semantic-runtime-client.mjs?v=2"), "GEO viewer must load the V2.10 shared semantic client.");
assert(mastersHubViewer.includes("semantic-runtime-client.mjs?v=2"), "Masters Hub must load the V2.10 shared semantic client.");
assert(visitorGuide.includes("resolveSemanticRuntime"), "Visitor guide must resolve the current ARTDACI semantic context.");
assert(visitorGuide.includes("semanticGuideRequest"), "Visitor guide must infer the semantic focus from the current immersive surface.");
assert(visitorGuide.includes("ARTDACI semantic context"), "Visitor guide prompt must embed grounded ARTDACI semantic context.");
assert(visitorGuide.includes("suggestedQuestions"), "Visitor guide must consume Runtime-generated starter questions.");
assert(visitorGuide.includes("do not invent relations"), "Visitor guide must explicitly prohibit unsupported semantic claims.");
assert(visitorGuideCss.includes('data-semantic-state="ready"'), "Visitor guide must visually indicate semantic grounding readiness.");
assert(arHtml.includes("visitor-guide.js?v=2"), "AR must load the semantic-aware visitor guide.");
assert(vrHtml.includes("visitor-guide.js?v=2"), "VR must load the semantic-aware visitor guide.");
assert(geoRemoteHtml.includes("../scripts/visitor-guide.js?v=2"), "GEO remote must load the semantic-aware visitor guide.");
assert(mastersHubHtml.includes("../scripts/visitor-guide.js?v=2"), "Masters Hub must load the semantic-aware visitor guide.");
assert(semanticRuntimeCss.includes(".semantic-runtime-panel"), "Semantic Runtime panel styling must exist.");
assert(arViewer.includes("mountSemanticRuntimePanel"), "Image AR viewer must consume Semantic Runtime.");
assert(arViewer.includes("createSemanticArHotspots"), "Image AR viewer must project semantic regions into MindAR.");
assert(arViewer.includes("setupSemanticArHotspots"), "Image AR viewer must initialize semantic hotspots non-blockingly.");
assert(arViewer.includes("showSemanticRegion"), "Image AR viewer must expose contextual region details.");
assert(arViewer.includes("semantic-hotspots-toggle"), "Image AR viewer must let readers show or hide semantic regions.");
assert(arViewer.includes("state.semanticHotspots?.setVisible(false)"), "Semantic AR hotspots must hide when image tracking is lost.");
assert(arViewer.includes("state.semanticHotspotsVisible && state.targetTracked"), "Semantic AR hotspot visibility must require active image tracking.");
assert(semanticArHotspots.includes("semantic-hotspot-hit"), "Semantic AR hotspot module must create raycastable region hit planes.");
assert(semanticArHotspots.includes("stopImmediatePropagation"), "Semantic AR hotspot taps must not trigger model-rotation gestures.");
assert(semanticArHotspots.includes("regionObjects"), "Semantic AR hotspot module must track selectable region objects.");
assert(arCss.includes(".info-panel.semantic-region-active"), "AR semantic region panel must have dedicated readable styling.");
assert(vrViewer.includes("mountSemanticRuntimePanel"), "Individual VR viewer must consume Semantic Runtime.");
assert(vrViewer.includes("createSemanticVrConstellation"), "VR viewer must create an in-world semantic constellation.");
assert(vrViewer.includes("setupSemanticVrConstellation"), "VR viewer must initialize the semantic constellation non-blockingly.");
assert(vrViewer.includes("selectSemanticWithController"), "VR controllers must prioritize semantic node selection.");
assert(vrViewer.includes("selectSemanticWithPointer"), "Desktop VR preview must allow semantic node selection.");
assert(vrViewer.includes("isSemanticVrObject"), "Semantic VR objects must be excluded from model grabbing.");
assert(vrViewer.includes("semantic-vr-toggle"), "VR toolbar must expose a semantic constellation visibility control.");
assert(semanticVrConstellation.includes("semantic-vr-constellation"), "Semantic VR module must create a dedicated constellation group.");
assert(semanticVrConstellation.includes("semantic-vr-hit"), "Semantic VR nodes must expose raycastable hit targets.");
assert(semanticVrConstellation.includes("semantic-vr-info"), "Semantic VR must expose an in-world information card.");
assert(semanticVrConstellation.includes("findPedagogy"), "Semantic VR cards must use ARTDACI pedagogical context.");
assert(semanticVrConstellation.includes("runtime.concepts.slice(0, 5)"), "Semantic VR constellation must stay compact.");
assert(semanticVrConstellation.includes("runtime.learningPath?.steps"), "Semantic VR must consume the contextual learning path.");
assert(semanticVrConstellation.includes("semantic-vr-portal-hit"), "Semantic VR must expose raycastable learning portals.");
assert(semanticVrConstellation.includes("portalInstruction"), "Semantic portals must explain the two-step activation pattern.");
assert(semanticVrConstellation.includes("activate"), "Semantic portal selection must distinguish focus from activation.");
assert(vrViewer.includes("activateSemanticPortal"), "VR viewer must safely activate a selected semantic portal.");
assert(vrViewer.includes("currentSession.end().then(navigate, navigate)"), "VR portal navigation must end the active XR session before changing destination.");
assert(vrViewer.includes('semantic-vr-constellation.mjs?v=2'), "VR viewer must load the V2.10 semantic constellation cache version.");
assert(geoRemoteViewer.includes("mountSemanticRuntimePanel"), "Louvre GEO viewer must consume Semantic Runtime.");
assert(mastersHubViewer.includes("mountSemanticRuntimePanel"), "Masters Hub must consume Semantic Runtime for deep-linked guides.");
assert(arHtml.includes("semantic-runtime.css?v=2"), "AR page must load Semantic Runtime styles.");
assert(arHtml.includes("ar-viewer.js?v=58"), "AR page must load the V2.10 viewer cache version.");
assert(arHtml.includes("styles/ar.css?v=40"), "AR page must load the V2.10 AR stylesheet cache version.");
assert(vrHtml.includes("semantic-runtime.css?v=2"), "VR page must load Semantic Runtime styles.");
assert(vrHtml.includes("vr-viewer.js?v=11"), "VR page must load the V2.10 viewer cache version.");
assert(geoRemoteHtml.includes("../styles/semantic-runtime.css?v=2"), "GEO page must load Semantic Runtime styles.");
assert(mastersHubHtml.includes("../styles/semantic-runtime.css?v=2"), "Masters Hub must load Semantic Runtime styles.");
assert(semanticUi.includes('params.get("node")'), "Semantic reader must support node deep links from the runtime.");
assert(semanticUi.includes("experienceLinksMarkup"), "Semantic inspectors must expose cross-media experience links.");
assert(semanticUi.includes("getNodeExperiences"), "Semantic UI must load node experience mappings.");
assert(semanticUi.includes("semantic-svg-experience-dot"), "Graph nodes with immersive destinations must be marked.");
assert(semanticCss.includes(".semantic-experience-strip"), "Cross-media experiences must use a compact horizontal strip.");
assert(semanticCss.includes(".semantic-experience-card"), "Cross-media experience card styling must be present.");
assert(semanticUi.includes("data-graph-entity-id"), "Cultural graph nodes must be interactive.");
assert(semanticUi.includes("culturalEntityInspector"), "Cultural entity inspector must be available.");
assert(semanticUi.includes("linkedArtExportMarkup"), "Linked Art export must be exposed from the inspector.");
assert(semanticUi.includes("imageExplorerDialogMarkup"), "IIIF image explorer must be rendered.");
assert(semanticUi.includes("semanticData.imageAnnotations.length"), "Reader status must expose the number of IIIF pilot artworks.");
assert(semanticUi.includes("data-image-explore"), "Artwork inspector must expose the image explorer.");
assert(semanticUi.includes("data-image-region"), "IIIF semantic regions must be interactive.");
assert(semanticUi.includes("data-region-concept"), "Image regions must link back to semantic concepts.");
assert(semanticCss.includes(".image-region-dialog"), "IIIF image explorer dialog styling must be present.");
assert(semanticCss.includes(".image-region-hotspot"), "IIIF region hotspot styling must be present.");
assert(semanticCss.includes("readability hotfix"), "Graph readability hotfix must be present.");
assert(semanticCss.includes(".semantic-svg-node.is-center.node-artist rect"), "Centered cultural nodes must force the dark high-contrast background.");
assert(semanticCss.includes(".semantic-svg-node:not(.is-center):not(.is-external) .semantic-svg-node-label"), "Non-centered graph nodes must force dark readable labels.");
assert(semanticCss.includes(".linked-art-export"), "Linked Art export styling must be present.");
assert(linkedArtApi.includes("HumanMadeObject"), "Linked Art endpoint must export artworks as HumanMadeObject.");
assert(linkedArtApi.includes("current_custodian"), "Linked Art artwork export must expose museum custody.");
assert(linkedArtApi.includes("produced_by"), "Linked Art artwork export must expose production.");
assert(linkedArtApi.includes("GET, HEAD, OPTIONS"), "Linked Art endpoint must support GET, HEAD and OPTIONS.");
assert(linkedArtApi.includes('application/ld+json;profile="https://linked.art/ns/v1/linked-art.json"'), "Linked Art endpoint must advertise the profile media type.");
assert(semanticCss.includes(".semantic-svg-node.node-artist"), "Artist nodes must have dedicated styling.");
assert(semanticCss.includes(".semantic-svg-node.node-museum"), "Museum nodes must have dedicated styling.");
assert(semanticCss.includes(".semantic-svg-node.node-place"), "Place nodes must have dedicated styling.");
assert(semanticCss.includes(".semantic-svg-node.node-iconographic-subject"), "Iconographic subjects must have dedicated styling.");
assert(semanticCss.includes(".semantic-svg-node.node-motif"), "Iconographic motifs must have dedicated styling.");
assert(semanticCss.includes(".semantic-svg-node.node-depicted-object"), "Depicted objects must have dedicated styling.");
assert(semanticCss.includes(".iconclass-notation"), "Iconclass notation styling must be present.");
assert(semanticUi.includes("data-external-graph-toggle"), "External graph toggle must remain available.");
assert(semanticUi.includes("external-source-attribution"), "Getty attribution must remain visible.");
assert(semanticCss.includes(".semantic-svg-node.is-external"), "External graph nodes must remain visually distinct.");
assert(externalSourcesUi.includes("expand=1"), "External source expansion requests must remain supported.");
assert(semanticSourceApi.includes("WIKIDATA_API"), "Wikidata API support must remain enabled.");
assert(semanticSourceApi.includes("GETTY_SPARQL"), "Getty vocabulary support must remain enabled.");
assert(semanticSourceApi.includes('"getty-ulan"'), "Getty ULAN API support must be enabled.");
assert(semanticSourceApi.includes('"getty-tgn"'), "Getty TGN API support must be enabled.");
assert(externalSourcesUi.includes("getty-ulan"), "Getty ULAN client support must be enabled.");
assert(externalSourcesUi.includes("getty-tgn"), "Getty TGN client support must be enabled.");
assert(externalSourcesUi.includes("iconclass"), "Iconclass client support must be enabled.");
assert(semanticSourceApi.includes("fetchIconclass"), "Iconclass live LOD adapter must be enabled.");
assert(mastersHubViewer.includes("guideDeepLinkSlug"), "Masters Hub must accept a guide deep-link parameter.");
assert(mastersHubViewer.includes("await callGuide(guideDeepLinkId)"), "Masters Hub must auto-open a deep-linked 3D guide.");
assert(mastersHubHtml.includes("masters-hub-viewer.js?v=6-15-19"), "Masters Hub must load the guide deep-link build.");
assert(semanticSourceApi.includes("suggestions"), "External expansion suggestions must remain supported.");

assert(!semanticUi.includes("REVIEW_STORAGE_KEY"), "Public reader UI must not persist a review queue.");
assert(!semanticUi.includes("data-review-add"), "Public reader UI must not expose add-to-review controls.");
assert(!semanticUi.includes("data-review-status"), "Public reader UI must not expose approve/reject controls.");
assert(!semanticUi.includes("exportReviewQueue"), "Public reader UI must not expose review export.");
assert(!semanticCss.includes(".semantic-review-drawer"), "Public reader CSS must not expose a review drawer.");

assert(reviewSchema.properties?.status?.enum?.includes("candidate"), "Future admin schema must retain candidate state.");
assert(reviewSchema.properties?.status?.enum?.includes("approved"), "Future admin schema must retain approved state.");
assert(reviewSchema.properties?.status?.enum?.includes("rejected"), "Future admin schema must retain rejected state.");

if (errors.length) {
  console.error("ARTDACI Semantic V2.10 validation failed:");
  errors.forEach((error) => console.error(" -", error));
  process.exit(1);
}

console.log("ARTDACI Semantic V2.10 validation OK.");
