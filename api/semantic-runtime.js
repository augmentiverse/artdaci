const runtimeContextDoc = require("../content/semantics/runtime-contexts.json");
const conceptsDoc = require("../content/semantics/concepts.json");
const artworksDoc = require("../content/semantics/artwork-concepts.json");
const culturalDoc = require("../content/semantics/cultural-knowledge.json");
const iconographyDoc = require("../content/semantics/iconography.json");
const imageAnnotationsDoc = require("../content/semantics/image-annotations.json");
const pedagogyDoc = require("../content/semantics/pedagogical-relations.json");
const experiencesDoc = require("../content/semantics/experience-links.json");
const journeysDoc = require("../content/semantics/learning-journeys.json");

const SUPPORTED_LANGS = new Set(["fr", "en", "ar"]);
const SUPPORTED_ENVIRONMENTS = new Set(["web", "book", "ar", "vr", "geo", "3d"]);

function send(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader(
    "Cache-Control",
    status >= 200 && status < 300
      ? "public, s-maxage=300, stale-while-revalidate=1800"
      : "no-store"
  );
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("X-ARTDACI-Semantic-Runtime", "2.12");
  res.end(JSON.stringify(payload));
}

function localize(value, lang) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[lang] || value.en || value.fr || value.ar || Object.values(value)[0] || "";
}

function normalizeExperienceHref(href, lang) {
  return String(href || "").replaceAll("{lang}", encodeURIComponent(lang));
}

function resolveAlias(runtime, resourceType, slug) {
  if (!slug) return null;
  const aliases = runtime.runtimeAliases || {};
  if (resourceType === "museum") return aliases.museumSlugs?.[slug] || null;
  if (resourceType === "artist") return aliases.artistSlugs?.[slug] || null;
  return aliases.artworkSlugs?.[slug] || null;
}

function buildMaps(docs) {
  const conceptMap = new Map((docs.concepts.concepts || []).map((item) => [item.id, item]));
  const artworkMap = new Map((docs.artworks.artworks || []).map((item) => [item.id, item]));
  const entityMap = new Map((docs.cultural.entities || []).map((item) => [item.id, item]));
  const iconographyMap = new Map((docs.iconography.subjects || []).map((item) => [item.id, item]));
  const regionMap = new Map();
  const artworkRegionMap = new Map();
  for (const profile of docs.images.artworks || []) {
    artworkRegionMap.set(profile.artworkId, profile);
    for (const region of profile.regions || []) {
      regionMap.set(region.id, { ...region, artworkId: profile.artworkId, canvas: profile.canvas });
    }
  }
  const experienceMap = new Map((docs.experiences.nodes || []).map((item) => [item.nodeId, item.experiences || []]));
  return { conceptMap, artworkMap, entityMap, iconographyMap, regionMap, artworkRegionMap, experienceMap };
}

function resolveNode(maps, id, lang) {
  if (maps.artworkMap.has(id)) {
    const node = maps.artworkMap.get(id);
    return {
      id,
      kind: "artwork",
      type: "artwork",
      label: localize(node.title, lang),
      subtitle: localize(node.artist, lang),
      raw: node
    };
  }
  if (maps.conceptMap.has(id)) {
    const node = maps.conceptMap.get(id);
    return {
      id,
      kind: "concept",
      type: node.type,
      label: localize(node.labels, lang),
      subtitle: node.type,
      raw: node
    };
  }
  if (maps.entityMap.has(id)) {
    const node = maps.entityMap.get(id);
    return {
      id,
      kind: "entity",
      type: node.type,
      label: localize(node.labels, lang),
      subtitle: node.type,
      raw: node
    };
  }
  if (maps.iconographyMap.has(id)) {
    const node = maps.iconographyMap.get(id);
    return {
      id,
      kind: "iconography",
      type: node.type,
      label: localize(node.labels, lang),
      subtitle: node.type,
      raw: node
    };
  }
  return null;
}

function artworkConcepts(docs, maps, artworkId, lang, limit) {
  const profile = (docs.artworks.artworks || []).find((item) => item.id === artworkId);
  return (profile?.assertions || [])
    .map((assertion) => ({ assertion, concept: maps.conceptMap.get(assertion.conceptId) }))
    .filter((entry) => entry.concept)
    .sort((a, b) => (b.assertion.weight || 0) - (a.assertion.weight || 0))
    .slice(0, limit)
    .map(({ assertion, concept }) => ({
      id: concept.id,
      type: concept.type,
      label: localize(concept.labels, lang),
      definition: localize(concept.definitions, lang),
      weight: assertion.weight,
      role: assertion.role
    }));
}

function regionConcepts(maps, region, lang, limit) {
  return (region?.conceptIds || [])
    .map((id) => maps.conceptMap.get(id))
    .filter(Boolean)
    .slice(0, limit)
    .map((concept) => ({
      id: concept.id,
      type: concept.type,
      label: localize(concept.labels, lang),
      definition: localize(concept.definitions, lang),
      weight: 1,
      role: "region"
    }));
}

function iconographyFor(docs, maps, artworkId, regionId, lang) {
  const ids = new Set();
  if (artworkId) {
    for (const link of docs.iconography.artworkLinks || []) {
      if (link.artworkId === artworkId) ids.add(link.subjectId);
    }
  }
  if (regionId) {
    for (const link of docs.iconography.regionLinks || []) {
      if (link.regionId === regionId) {
        for (const id of link.subjectIds || []) ids.add(id);
      }
    }
  }
  return [...ids].map((id) => maps.iconographyMap.get(id)).filter(Boolean).map((subject) => ({
    id: subject.id,
    type: subject.type,
    label: localize(subject.labels, lang),
    description: localize(subject.descriptions, lang),
    iconclass: subject.iconclass || null
  }));
}

function pedagogyFor(docs, maps, ids, lang, limit) {
  const idSet = new Set(ids.filter(Boolean));
  const rows = [];
  for (const relation of docs.pedagogy.relations || []) {
    let direction = null;
    let neighborId = null;
    if (idSet.has(relation.source)) {
      direction = "outgoing";
      neighborId = relation.target;
    } else if (idSet.has(relation.target)) {
      direction = "incoming";
      neighborId = relation.source;
    }
    if (!direction) continue;
    const node = resolveNode(maps, neighborId, lang);
    const region = maps.regionMap.get(neighborId);
    rows.push({
      id: relation.id,
      type: relation.type,
      direction,
      source: relation.source,
      target: relation.target,
      neighbor: node ? {
        id: node.id,
        kind: node.kind,
        type: node.type,
        label: node.label
      } : region ? {
        id: region.id,
        kind: "region",
        type: "image-region",
        label: localize(region.labels, lang),
        artworkId: region.artworkId
      } : { id: neighborId, kind: "unknown", label: neighborId },
      rationale: localize(relation.rationale, lang),
      prompt: localize(relation.prompt, lang)
    });
  }
  return rows.slice(0, limit);
}

function rankedExperiences(maps, nodeIds, policy, lang) {
  const seen = new Set();
  const channelRank = new Map((policy.preferredChannels || []).map((channel, index) => [channel, index]));
  const rows = [];

  for (const nodeId of nodeIds.filter(Boolean)) {
    for (const experience of maps.experienceMap.get(nodeId) || []) {
      if (seen.has(experience.id)) continue;
      seen.add(experience.id);
      rows.push({
        id: experience.id,
        nodeId,
        channel: experience.channel,
        label: localize(experience.labels, lang),
        description: localize(experience.descriptions, lang),
        href: normalizeExperienceHref(experience.href, lang),
        external: Boolean(experience.external),
        rank: channelRank.has(experience.channel) ? channelRank.get(experience.channel) : 999
      });
    }
  }

  return rows
    .sort((a, b) => a.rank - b.rank || a.label.localeCompare(b.label))
    .slice(0, policy.maxExperiences)
    .map(({ rank, ...item }) => item);
}

function hotspotsFor(maps, artworkId, selectedRegionId, lang, limit) {
  const profile = maps.artworkRegionMap.get(artworkId);
  if (!profile) return [];
  const width = profile.canvas?.width || 1;
  const height = profile.canvas?.height || 1;

  return (profile.regions || [])
    .map((region) => {
      const [x, y, w, h] = region.xywh;
      return {
        id: region.id,
        label: localize(region.labels, lang),
        description: localize(region.descriptions, lang),
        selected: region.id === selectedRegionId,
        xywh: region.xywh,
        normalized: {
          x: x / width,
          y: y / height,
          width: w / width,
          height: h / height
        },
        conceptIds: region.conceptIds || []
      };
    })
    .sort((a, b) => Number(b.selected) - Number(a.selected))
    .slice(0, limit);
}

function semanticHrefForNeighbor(neighbor, lang) {
  if (!neighbor?.id) return "";
  if (neighbor.kind === "region") {
    return `/semantic/?artwork=${encodeURIComponent(neighbor.artworkId || "")}&lang=${encodeURIComponent(lang)}&region=${encodeURIComponent(neighbor.id)}`;
  }
  return `/semantic/?lang=${encodeURIComponent(lang)}&node=${encodeURIComponent(neighbor.id)}`;
}

const LEARNING_STAGE_LABELS = {
  observe: { fr: "Observer", en: "Observe", ar: "لاحظ" },
  understand: { fr: "Comprendre", en: "Understand", ar: "افهم" },
  compare: { fr: "Comparer", en: "Compare", ar: "قارن" },
  experience: { fr: "Expérimenter", en: "Experience", ar: "جرّب" }
};

function learningPathFor({ pedagogy, hotspots, concepts, experiences, artworkId, lang, environment }) {
  const steps = [];
  const observeRelation = pedagogy.find((item) =>
    ["observeIn", "fromDetailToConcept"].includes(item.type) && item.neighbor?.kind === "region"
  );
  const observeRegion = observeRelation?.neighbor || hotspots[0] || null;
  if (observeRegion?.id && artworkId) {
    steps.push({
      stage: "observe",
      action: localize(LEARNING_STAGE_LABELS.observe, lang),
      id: observeRegion.id,
      label: observeRegion.label || localize(LEARNING_STAGE_LABELS.observe, lang),
      description: observeRelation?.prompt || observeRelation?.rationale || observeRegion.description || "",
      targetKind: "region",
      href: `/semantic/?artwork=${encodeURIComponent(artworkId)}&lang=${encodeURIComponent(lang)}&region=${encodeURIComponent(observeRegion.id)}`,
      external: false
    });
  }

  const concept = concepts[0];
  if (concept?.id) {
    steps.push({
      stage: "understand",
      action: localize(LEARNING_STAGE_LABELS.understand, lang),
      id: concept.id,
      label: concept.label,
      description: concept.definition || "",
      targetKind: "concept",
      href: `/semantic/?lang=${encodeURIComponent(lang)}&node=${encodeURIComponent(concept.id)}`,
      external: false
    });
  }

  const compareRelation = pedagogy.find((item) =>
    ["compareWith", "contrastForLearning"].includes(item.type) && item.neighbor?.id
  );
  if (compareRelation) {
    steps.push({
      stage: "compare",
      action: localize(LEARNING_STAGE_LABELS.compare, lang),
      id: compareRelation.neighbor.id,
      label: compareRelation.neighbor.label,
      description: compareRelation.prompt || compareRelation.rationale || "",
      targetKind: compareRelation.neighbor.kind,
      href: semanticHrefForNeighbor(compareRelation.neighbor, lang),
      external: false
    });
  }

  const experience = experiences.find((item) =>
    !(environment === "vr" && String(item.href || "").startsWith("/vr.html?"))
  ) || experiences[0];
  if (experience?.href) {
    steps.push({
      stage: "experience",
      action: localize(LEARNING_STAGE_LABELS.experience, lang),
      id: experience.id,
      label: experience.label,
      description: experience.description || "",
      targetKind: "experience",
      channel: experience.channel,
      href: experience.href,
      external: Boolean(experience.external)
    });
  }

  return {
    pattern: "observe-understand-compare-experience",
    steps
  };
}


function guideQuestionForStep(step, lang) {
  if (!step?.label) return "";
  const label = `« ${step.label} »`;
  if (lang === "ar") {
    if (step.stage === "observe") return `ما الذي ينبغي أن ألاحظه في ${label}؟`;
    if (step.stage === "understand") return `لماذا يُعد ${label} مهماً هنا؟`;
    if (step.stage === "compare") return `قارن مع ${label}: ما الذي ينبغي أن ألاحظه؟`;
    if (step.stage === "experience") return "ما تجربة ARTDACI التي يمكنني فتحها بعد ذلك؟";
    return `اشرح لي ${label} ببساطة.`;
  }
  if (lang === "fr") {
    if (step.stage === "observe") return `Que dois-je observer dans ${label} ?`;
    if (step.stage === "understand") return `Pourquoi ${label} est-il important ici ?`;
    if (step.stage === "compare") return `Compare avec ${label} : que dois-je remarquer ?`;
    if (step.stage === "experience") return "Quelle expérience ARTDACI puis-je ouvrir ensuite ?";
    return `Explique-moi ${label} simplement.`;
  }
  if (step.stage === "observe") return `What should I observe in ${label}?`;
  if (step.stage === "understand") return `Why is ${label} important here?`;
  if (step.stage === "compare") return `Compare with ${label}: what should I notice?`;
  if (step.stage === "experience") return "Which ARTDACI experience should I open next?";
  return `Explain ${label} simply.`;
}

function guideFor({ focus, learningPath, concepts, pedagogy, experiences, lang }) {
  const suggestedQuestions = [];
  for (const step of learningPath?.steps || []) {
    const question = guideQuestionForStep(step, lang);
    if (question && !suggestedQuestions.includes(question)) suggestedQuestions.push(question);
  }

  if (!suggestedQuestions.length && focus?.label) {
    suggestedQuestions.push(
      lang === "ar"
        ? `اشرح لي « ${focus.label} » ببساطة.`
        : lang === "fr"
          ? `Explique-moi « ${focus.label} » simplement.`
          : `Explain “${focus.label}” simply.`
    );
  }

  return {
    mode: "grounded-semantic",
    focusId: focus?.id || null,
    suggestedQuestions: suggestedQuestions.slice(0, 4),
    grounding: {
      factual: "ARTDACI reviewed factual graph and mapped authority identifiers",
      pedagogical: "ARTDACI editorial pedagogical layer",
      instruction: "Distinguish factual graph information from ARTDACI pedagogical interpretation and do not invent unsupported relations."
    },
    contextCounts: {
      concepts: concepts?.length || 0,
      pedagogy: pedagogy?.length || 0,
      experiences: experiences?.length || 0
    }
  };
}


/**
 * Evidence-based transitions to a *different* artwork in an existing VR scene.
 * Only reviewed artwork assertions, curated questions and manifest routes are used.
 * This does not assert historical influence or invent a destination.
 */
function journeyBridgesFor(docs, maps, artworkId, lang) {
  if (!artworkId) return [];
  const results = [];
  const assertions = (id) => new Set((maps.artworkMap.get(id)?.assertions || [])
    .map((entry) => entry.conceptId));
  for (const journey of docs.journeys.journeys || []) {
    const index = (journey.steps || []).findIndex((step) => step.artworkId === artworkId);
    if (index < 0 || journey.steps.length < 2) continue;
    const destination = journey.steps[(index + 1) % journey.steps.length];
    const target = maps.artworkMap.get(destination.artworkId);
    if (!target || target.id === artworkId) continue;
    const fromConcepts = assertions(artworkId);
    const toConcepts = assertions(destination.artworkId);
    const concepts = (journey.conceptIds || [])
      .filter((id) => fromConcepts.has(id) && toConcepts.has(id) && maps.conceptMap.has(id))
      .map((id) => ({ id, label: localize(maps.conceptMap.get(id).labels, lang) }));
    if (!concepts.length) continue;
    const candidates = (maps.experienceMap.get(destination.artworkId) || [])
      .filter((entry) => entry.channel === "vr" && String(entry.href || "").startsWith("/"));
    const experience = candidates.find((entry) =>
      String(entry.href || "").startsWith("/vr.html?")) || candidates[0];
    if (!experience) continue;
    results.push({
      id: journey.id,
      title: localize(journey.title, lang),
      objective: localize(journey.objective, lang),
      fromArtworkId: artworkId,
      toArtworkId: target.id,
      toArtworkLabel: localize(target.title, lang),
      toArtworkArtist: localize(target.artist, lang),
      question: localize(destination.prompt, lang),
      sharedConcepts: concepts,
      experienceId: experience.id,
      href: normalizeExperienceHref(experience.href, lang),
      channel: experience.channel,
      grounding: "reviewed-artwork-assertions + editorial-learning-journey"
    });
  }
  return results;
}

function nextDestinations(pedagogy, experiences, lang) {
  const rows = [];
  for (const relation of pedagogy.slice(0, 3)) {
    rows.push({
      kind: relation.neighbor.kind,
      id: relation.neighbor.id,
      label: relation.neighbor.label,
      reason: relation.type,
      href: semanticHrefForNeighbor(relation.neighbor, lang)
    });
  }
  for (const experience of experiences.slice(0, 3)) {
    rows.push({
      kind: "experience",
      id: experience.id,
      label: experience.label,
      reason: experience.channel,
      href: experience.href,
      external: experience.external
    });
  }
  return rows.slice(0, 6);
}

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.statusCode = 204;
    return res.end();
  }
  if (req.method !== "GET") return send(res, 405, { error: "Method not allowed" });

  try {
    const lang = SUPPORTED_LANGS.has(req.query?.lang) ? req.query.lang : "fr";
    const environment = SUPPORTED_ENVIRONMENTS.has(req.query?.environment) ? req.query.environment : "web";
    // Bundle the reviewed semantic documents with the serverless function.
    // This avoids protected Preview self-fetches to the deployment's own hostname.
    const docs = {
      runtime: runtimeContextDoc,
      concepts: conceptsDoc,
      artworks: artworksDoc,
      cultural: culturalDoc,
      iconography: iconographyDoc,
      images: imageAnnotationsDoc,
      pedagogy: pedagogyDoc,
      experiences: experiencesDoc,
      journeys: journeysDoc
    };
    const { runtime } = docs;
    const maps = buildMaps(docs);
    const resourceType = String(req.query?.resourceType || "painting");
    const slug = String(req.query?.slug || "");
    const requestedNodeId = String(req.query?.nodeId || "");
    const regionId = String(req.query?.regionId || "");
    const region = regionId ? maps.regionMap.get(regionId) : null;
    const aliasedId = resolveAlias(runtime, resourceType, slug);
    const focusId = requestedNodeId || region?.artworkId || aliasedId;

    if (!focusId) {
      return send(res, 400, { error: "nodeId, regionId, or recognized slug is required." });
    }

    const focus = resolveNode(maps, focusId, lang);
    if (!focus) return send(res, 404, { error: "Semantic node not found.", id: focusId });

    const policy = runtime.environments?.[environment] || runtime.environments.web;
    const artworkId = focus.kind === "artwork" ? focus.id : region?.artworkId || null;
    const regionFocus = regionId ? maps.regionMap.get(regionId) : null;
    const conceptsOut = regionFocus
      ? regionConcepts(maps, regionFocus, lang, policy.maxConcepts)
      : artworkId
        ? artworkConcepts(docs, maps, artworkId, lang, policy.maxConcepts)
        : focus.kind === "concept"
          ? [{
              id: focus.id,
              type: focus.type,
              label: focus.label,
              definition: localize(focus.raw.definitions, lang),
              weight: 1,
              role: "focus"
            }]
          : [];

    const pedagogyIds = [focus.id, regionId].filter(Boolean);
    const pedagogyOut = pedagogyFor(docs, maps, pedagogyIds, lang, policy.maxPedagogy);
    const experienceNodeIds = [focus.id, artworkId].filter(Boolean);
    const experiencesOut = rankedExperiences(maps, experienceNodeIds, policy, lang);
    const hotspotsOut = artworkId ? hotspotsFor(maps, artworkId, regionId, lang, policy.maxRegions) : [];
    const learningPathOut = learningPathFor({
      pedagogy: pedagogyOut,
      hotspots: hotspotsOut,
      concepts: conceptsOut,
      experiences: experiencesOut,
      artworkId,
      lang,
      environment
    });
    const guideOut = guideFor({
      focus,
      learningPath: learningPathOut,
      concepts: conceptsOut,
      pedagogy: pedagogyOut,
      experiences: experiencesOut,
      lang
    });

    const payload = {
      schemaVersion: "1.0",
      runtimeVersion: "2.12",
      context: {
        environment,
        environmentLabel: localize(policy.label, lang),
        lang,
        priorities: policy.priorities,
        preferredChannels: policy.preferredChannels
      },
      focus: {
        id: focus.id,
        kind: focus.kind,
        type: focus.type,
        label: focus.label,
        subtitle: focus.subtitle,
        artworkId,
        regionId: regionId || null
      },
      spatial: artworkId && maps.artworkRegionMap.get(artworkId)?.canvas
        ? (() => {
            const canvas = maps.artworkRegionMap.get(artworkId).canvas;
            return {
              source: "IIIF normalized-canvas",
              coordinateSystem: "mindar-image-target",
              canvas: {
                width: canvas.width,
                height: canvas.height,
                aspect: canvas.width / canvas.height
              },
              target: {
                width: 1,
                height: canvas.height / canvas.width
              }
            };
          })()
        : null,
      hotspots: hotspotsOut,
      concepts: conceptsOut,
      iconography: iconographyFor(docs, maps, artworkId, regionId, lang),
      pedagogy: pedagogyOut,
      experiences: experiencesOut,
      next: nextDestinations(pedagogyOut, experiencesOut, lang),
      learningPath: learningPathOut,
      journeyBridges: journeyBridgesFor(docs, maps, artworkId, lang),
      guide: guideOut,
      links: {
        semantic: artworkId
          ? `/semantic/?artwork=${encodeURIComponent(artworkId)}&lang=${encodeURIComponent(lang)}${regionId ? `&region=${encodeURIComponent(regionId)}` : ""}`
          : `/semantic/?lang=${encodeURIComponent(lang)}&node=${encodeURIComponent(focus.id)}`
      },
      provenance: {
        runtime: "ARTDACI Semantic Runtime",
        editorialRelations: "ARTDACI",
        factualGraph: "ARTDACI + linked external authorities where mapped"
      }
    };

    return send(res, 200, payload);
  } catch (error) {
    console.error(error);
    return send(res, 500, { error: "Semantic runtime failed.", detail: error.message || String(error) });
  }
};
