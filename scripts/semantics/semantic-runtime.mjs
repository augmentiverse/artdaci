import {
  getArtwork,
  getArtworkConceptEntries,
  getArtworkIconographyEntries,
  getImageRegion,
  getNodeExperiences,
  getPedagogicalRelations,
  getRegionIconographyEntries,
  localize,
  normalizeLang,
  resolveKnowledgeNode
} from "./semantic-store.mjs";

const ENVIRONMENT_CHANNEL_PRIORITY = Object.freeze({
  web: ["web", "book", "video", "ar", "space-ar", "vr", "geo", "3d", "vr-world"],
  ar: ["ar", "space-ar", "video", "3d", "book", "vr", "geo", "web", "vr-world"],
  vr: ["vr", "3d", "vr-world", "video", "geo", "ar", "space-ar", "book", "web"],
  geo: ["geo", "vr", "3d", "ar", "space-ar", "book", "video", "web", "vr-world"],
  "3d": ["3d", "ar", "vr", "video", "book", "geo", "web", "vr-world", "space-ar"],
  book: ["book", "ar", "video", "3d", "vr", "geo", "web", "space-ar", "vr-world"]
});

function environmentKey(value) {
  const key = String(value || "web").toLowerCase();
  return Object.prototype.hasOwnProperty.call(ENVIRONMENT_CHANNEL_PRIORITY, key) ? key : "web";
}

function localizedNodeLabel(data, id, lang) {
  const resolved = resolveKnowledgeNode(data, id);
  if (!resolved) return id;
  if (resolved.kind === "artwork") return localize(resolved.node.title, lang);
  return localize(resolved.node.labels, lang);
}

function localizeExperience(experience, lang) {
  return {
    ...experience,
    label: localize(experience.labels, lang),
    description: localize(experience.descriptions, lang),
    href: String(experience.href || "").replaceAll("{lang}", encodeURIComponent(lang))
  };
}

function rankExperiences(experiences, environment, lang) {
  const priority = ENVIRONMENT_CHANNEL_PRIORITY[environmentKey(environment)];
  const channelIndex = new Map(priority.map((channel, index) => [channel, index]));
  return experiences
    .map((experience) => localizeExperience(experience, lang))
    .sort((a, b) =>
      (channelIndex.get(a.channel) ?? 99) - (channelIndex.get(b.channel) ?? 99)
      || a.id.localeCompare(b.id)
    );
}

function localizedPedagogicalRelation(data, relation, lang) {
  const neighbor = resolveKnowledgeNode(data, relation.neighborId);
  const region = neighbor ? null : getImageRegion(data, relation.neighborId);
  return {
    id: relation.id,
    type: relation.type,
    direction: relation.direction,
    source: relation.source,
    target: relation.target,
    neighborId: relation.neighborId,
    neighborKind: neighbor?.kind || (region ? "region" : "unknown"),
    neighborLabel: neighbor
      ? localizedNodeLabel(data, relation.neighborId, lang)
      : region
        ? localize(region.labels, lang)
        : relation.neighborId,
    rationale: localize(relation.rationale, lang),
    prompt: localize(relation.prompt, lang)
  };
}

function resolveRegionContext(data, regionId, lang) {
  if (!regionId) return null;
  const region = getImageRegion(data, regionId);
  if (!region) return null;
  const artwork = getArtwork(data, region.artworkId);
  const concepts = (region.conceptIds || [])
    .map((conceptId) => {
      const resolved = resolveKnowledgeNode(data, conceptId);
      if (!resolved?.node) return null;
      return {
        id: conceptId,
        kind: resolved.kind,
        type: resolved.node.type,
        label: localize(resolved.node.labels, lang),
        definition: localize(resolved.node.definitions, lang)
      };
    })
    .filter(Boolean);
  const iconography = getRegionIconographyEntries(data, regionId).map((subject) => ({
    id: subject.id,
    type: subject.type,
    label: localize(subject.labels, lang),
    description: localize(subject.descriptions, lang),
    iconclass: subject.iconclass || null
  }));
  const pedagogy = getPedagogicalRelations(data, regionId)
    .map((relation) => localizedPedagogicalRelation(data, relation, lang));

  return {
    id: region.id,
    artworkId: region.artworkId,
    artworkLabel: artwork ? localize(artwork.title, lang) : region.artworkId,
    label: localize(region.labels, lang),
    description: localize(region.descriptions, lang),
    shape: region.shape,
    xywh: region.xywh,
    concepts,
    iconography,
    pedagogy
  };
}

function nodeConcepts(data, resolved, lang) {
  if (!resolved) return [];
  if (resolved.kind === "artwork") {
    return getArtworkConceptEntries(data, resolved.node.id)
      .sort((a, b) => (b.weight || 0) - (a.weight || 0))
      .map((entry) => ({
        id: entry.concept.id,
        type: entry.concept.type,
        label: localize(entry.concept.labels, lang),
        definition: localize(entry.concept.definitions, lang),
        role: entry.role,
        weight: entry.weight
      }));
  }
  if (resolved.kind === "concept") {
    return [{
      id: resolved.node.id,
      type: resolved.node.type,
      label: localize(resolved.node.labels, lang),
      definition: localize(resolved.node.definitions, lang),
      role: "central",
      weight: 1
    }];
  }
  return [];
}

function nodeIconography(data, resolved, lang) {
  if (!resolved) return [];
  if (resolved.kind === "artwork") {
    return getArtworkIconographyEntries(data, resolved.node.id).map((entry) => ({
      id: entry.subject.id,
      type: entry.subject.type,
      relation: entry.relation,
      weight: entry.weight,
      label: localize(entry.subject.labels, lang),
      description: localize(entry.subject.descriptions, lang),
      iconclass: entry.subject.iconclass || null
    }));
  }
  if (resolved.kind === "iconography") {
    return [{
      id: resolved.node.id,
      type: resolved.node.type,
      relation: "central",
      weight: 1,
      label: localize(resolved.node.labels, lang),
      description: localize(resolved.node.descriptions, lang),
      iconclass: resolved.node.iconclass || null
    }];
  }
  return [];
}

function nodeSummary(resolved, lang) {
  if (!resolved) return null;
  if (resolved.kind === "artwork") {
    return {
      id: resolved.node.id,
      kind: "artwork",
      type: "artwork",
      label: localize(resolved.node.title, lang),
      secondaryLabel: localize(resolved.node.artist, lang)
    };
  }
  return {
    id: resolved.node.id,
    kind: resolved.kind,
    type: resolved.node.type,
    label: localize(resolved.node.labels, lang),
    secondaryLabel: localize(resolved.node.descriptions || resolved.node.definitions, lang)
  };
}

function recommendedDestinations(data, nodeId, region, environment, lang) {
  const ids = new Set([nodeId]);
  for (const relation of getPedagogicalRelations(data, nodeId)) {
    if (resolveKnowledgeNode(data, relation.neighborId)) ids.add(relation.neighborId);
  }
  if (region) {
    for (const concept of region.concepts) ids.add(concept.id);
    for (const subject of region.iconography) ids.add(subject.id);
    for (const relation of region.pedagogy) {
      if (resolveKnowledgeNode(data, relation.neighborId)) ids.add(relation.neighborId);
    }
  }

  const candidates = [];
  for (const id of ids) {
    for (const experience of rankExperiences(getNodeExperiences(data, id), environment, lang)) {
      candidates.push({
        ...experience,
        semanticNodeId: id,
        semanticNodeLabel: localizedNodeLabel(data, id, lang)
      });
    }
  }

  const seen = new Set();
  return candidates.filter((candidate) => {
    const key = candidate.href || candidate.id;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 8);
}

export function resolveSemanticContext(data, options = {}) {
  const lang = normalizeLang(options.lang);
  const environment = environmentKey(options.environment);
  const requestedNodeId = options.nodeId || getImageRegion(data, options.regionId)?.artworkId || null;
  const resolved = requestedNodeId ? resolveKnowledgeNode(data, requestedNodeId) : null;
  const region = resolveRegionContext(data, options.regionId, lang);

  const pedagogy = requestedNodeId
    ? getPedagogicalRelations(data, requestedNodeId)
      .map((relation) => localizedPedagogicalRelation(data, relation, lang))
    : [];

  return {
    version: "2.6",
    environment,
    lang,
    node: nodeSummary(resolved, lang),
    region,
    concepts: region?.concepts?.length ? region.concepts : nodeConcepts(data, resolved, lang),
    iconography: region?.iconography?.length ? region.iconography : nodeIconography(data, resolved, lang),
    pedagogy: region?.pedagogy?.length ? region.pedagogy : pedagogy,
    experiences: requestedNodeId
      ? rankExperiences(getNodeExperiences(data, requestedNodeId), environment, lang)
      : [],
    destinations: requestedNodeId
      ? recommendedDestinations(data, requestedNodeId, region, environment, lang)
      : []
  };
}

export function resolveArtworkRegions(data, artworkId, options = {}) {
  const lang = normalizeLang(options.lang);
  const environment = environmentKey(options.environment);
  const profile = data.imageAnnotationMap?.get(artworkId);
  if (!profile) return [];

  return (profile.regions || []).map((region, index) => {
    const context = resolveSemanticContext(data, {
      nodeId: artworkId,
      regionId: region.id,
      environment,
      lang
    });
    return {
      id: region.id,
      index: index + 1,
      label: context.region?.label || region.id,
      description: context.region?.description || "",
      xywh: region.xywh,
      canvas: profile.canvas,
      context
    };
  });
}

export function semanticRuntimeCapabilities(data, nodeId) {
  const resolved = resolveKnowledgeNode(data, nodeId);
  const artworkId = resolved?.kind === "artwork" ? nodeId : null;
  return {
    nodeId,
    resolved: Boolean(resolved),
    hasImageRegions: Boolean(artworkId && data.imageAnnotationMap?.get(artworkId)?.regions?.length),
    hasPedagogy: Boolean(getPedagogicalRelations(data, nodeId).length),
    hasExperiences: Boolean(getNodeExperiences(data, nodeId).length)
  };
}
