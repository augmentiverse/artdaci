const SUPPORTED_LANGS = new Set(["fr", "en", "ar"]);
const DATA_URLS = {
  concepts: new URL("../../content/semantics/concepts.json", import.meta.url),
  artworks: new URL("../../content/semantics/artwork-concepts.json", import.meta.url),
  sources: new URL("../../content/semantics/sources.json", import.meta.url),
  cultural: new URL("../../content/semantics/cultural-knowledge.json", import.meta.url),
  imageAnnotations: new URL("../../content/semantics/image-annotations.json", import.meta.url),
  iconography: new URL("../../content/semantics/iconography.json", import.meta.url),
  experiences: new URL("../../content/semantics/experience-links.json", import.meta.url),
  pedagogy: new URL("../../content/semantics/pedagogical-relations.json", import.meta.url),
  queryHints: new URL("../../content/semantics/query-aliases.json", import.meta.url)
};

const RELATION_WEIGHTS = Object.freeze({
  broader: 0.78,
  narrower: 0.78,
  related: 0.68,
  enables: 0.92,
  expresses: 0.92,
  contrastsWith: 0.72,
  associatedWith: 0.76,
  dependsOn: 0.86
});

let cache = null;

export function normalizeLang(lang) {
  const code = String(lang || "fr").toLowerCase().split(/[-_]/)[0];
  return SUPPORTED_LANGS.has(code) ? code : "fr";
}

export function localize(value, lang = "fr") {
  if (value == null || typeof value !== "object") return value ?? "";
  const code = normalizeLang(lang);
  return value[code] ?? value.fr ?? value.en ?? value.ar ?? "";
}

export async function loadSemanticData() {
  if (cache) return cache;
  const [conceptsResponse, artworksResponse, sourcesResponse, culturalResponse, imageAnnotationsResponse, iconographyResponse, experiencesResponse, pedagogyResponse, queryHintsResponse] = await Promise.all(
    Object.values(DATA_URLS).map((url) => fetch(url, { cache: "no-store" }))
  );
  const responses = [conceptsResponse, artworksResponse, sourcesResponse, culturalResponse, imageAnnotationsResponse, iconographyResponse, experiencesResponse, pedagogyResponse, queryHintsResponse];
  const failed = responses.find((response) => !response.ok);
  if (failed) throw new Error(`Semantic data could not be loaded (${failed.status}).`);

  const [conceptsDoc, artworksDoc, sourcesDoc, culturalDoc, imageAnnotationsDoc, iconographyDoc, experiencesDoc, pedagogyDoc, queryHintsDoc] = await Promise.all(responses.map((response) => response.json()));
  const conceptMap = new Map(conceptsDoc.concepts.map((concept) => [concept.id, concept]));
  const artworkMap = new Map(artworksDoc.artworks.map((artwork) => [artwork.id, artwork]));
  const entityMap = new Map(culturalDoc.entities.map((entity) => [entity.id, entity]));
  const imageAnnotationMap = new Map((imageAnnotationsDoc.artworks || []).map((profile) => [profile.artworkId, profile]));
  const iconographyMap = new Map((iconographyDoc.subjects || []).map((subject) => [subject.id, subject]));
  const experienceMap = new Map((experiencesDoc.nodes || []).map((entry) => [entry.nodeId, entry.experiences || []]));
  const regionMap = new Map((imageAnnotationsDoc.artworks || []).flatMap((profile) =>
    (profile.regions || []).map((region) => [region.id, { ...region, artworkId: profile.artworkId }])
  ));

  cache = {
    concepts: conceptsDoc.concepts,
    artworks: artworksDoc.artworks,
    sources: sourcesDoc.sources,
    policy: sourcesDoc.policy,
    relationTypes: conceptsDoc.relationTypes || ["broader", "narrower", "related"],
    scoring: artworksDoc.scoring || { method: "weighted-jaccard" },
    culturalEntities: culturalDoc.entities,
    culturalRelations: culturalDoc.relations,
    culturalEntityTypes: culturalDoc.entityTypes || [],
    culturalRelationTypes: culturalDoc.relationTypes || [],
    conceptMap,
    artworkMap,
    entityMap,
    imageAnnotations: imageAnnotationsDoc.artworks || [],
    imageAnnotationMap,
    iconographySubjects: iconographyDoc.subjects || [],
    iconographyArtworkLinks: iconographyDoc.artworkLinks || [],
    iconographyRegionLinks: iconographyDoc.regionLinks || [],
    iconographyNodeTypes: iconographyDoc.nodeTypes || [],
    iconographyRelationTypes: iconographyDoc.relationTypes || [],
    iconographyMap,
    experienceChannels: experiencesDoc.channels || [],
    experienceNodes: experiencesDoc.nodes || [],
    experienceMap,
    pedagogicalRelationTypes: pedagogyDoc.relationTypes || [],
    pedagogicalRelations: pedagogyDoc.relations || [],
    queryIntents: queryHintsDoc.intents || [],
    queryNodeAliases: queryHintsDoc.nodeAliases || [],
    queryChannelAliases: queryHintsDoc.channelAliases || {},
    queryExamples: queryHintsDoc.examples || {},
    regionMap
  };
  return cache;
}

export function getConcept(data, conceptId) {
  return data.conceptMap.get(conceptId) || null;
}

export function getArtwork(data, artworkId) {
  return data.artworkMap.get(artworkId) || null;
}


export function getCulturalEntity(data, entityId) {
  return data.entityMap.get(entityId) || null;
}

export function getCulturalRelations(data, nodeId) {
  const output = [];
  for (const relation of data.culturalRelations || []) {
    if (relation.source === nodeId) {
      output.push({ ...relation, direction: "outgoing", neighborId: relation.target });
    } else if (relation.target === nodeId) {
      output.push({ ...relation, direction: "incoming", neighborId: relation.source });
    }
  }
  return output;
}

export function resolveKnowledgeNode(data, nodeId) {
  const artwork = getArtwork(data, nodeId);
  if (artwork) return { kind: "artwork", node: artwork };
  const entity = getCulturalEntity(data, nodeId);
  if (entity) return { kind: "entity", node: entity };
  const iconography = getIconographicSubject(data, nodeId);
  if (iconography) return { kind: "iconography", node: iconography };
  const concept = getConcept(data, nodeId);
  if (concept) return { kind: "concept", node: concept };
  return null;
}

export function getArtworkCulturalEntries(data, artworkId) {
  return getCulturalRelations(data, artworkId)
    .filter((relation) => relation.direction === "outgoing")
    .map((relation) => ({
      relation,
      entity: getCulturalEntity(data, relation.target)
    }))
    .filter((entry) => entry.entity);
}

export function getImageAnnotationProfile(data, artworkId) {
  return data.imageAnnotationMap?.get(artworkId) || null;
}

export function getIconographicSubject(data, subjectId) {
  return data.iconographyMap?.get(subjectId) || null;
}

export function getArtworkIconographyEntries(data, artworkId) {
  return (data.iconographyArtworkLinks || [])
    .filter((link) => link.artworkId === artworkId)
    .map((link) => ({
      ...link,
      subject: getIconographicSubject(data, link.subjectId)
    }))
    .filter((entry) => entry.subject);
}

export function getRegionIconographyEntries(data, regionId) {
  const link = (data.iconographyRegionLinks || []).find((item) => item.regionId === regionId);
  if (!link) return [];
  return (link.subjectIds || [])
    .map((subjectId) => getIconographicSubject(data, subjectId))
    .filter(Boolean);
}

export function getIconographyArtworks(data, subjectId) {
  return (data.iconographyArtworkLinks || [])
    .filter((link) => link.subjectId === subjectId)
    .map((link) => ({
      ...link,
      artwork: getArtwork(data, link.artworkId)
    }))
    .filter((entry) => entry.artwork);
}

export function getNodeExperiences(data, nodeId) {
  return data.experienceMap?.get(nodeId) || [];
}

export function getImageRegion(data, regionId) {
  return data.regionMap?.get(regionId) || null;
}

export function getPedagogicalRelations(data, nodeId) {
  const output = [];
  for (const relation of data.pedagogicalRelations || []) {
    if (relation.source === nodeId) {
      output.push({ ...relation, direction: "outgoing", neighborId: relation.target });
    } else if (relation.target === nodeId) {
      output.push({ ...relation, direction: "incoming", neighborId: relation.source });
    }
  }
  return output;
}

export function getArtworkAssertions(data, artworkId) {
  const artwork = getArtwork(data, artworkId);
  if (!artwork) return [];
  if (Array.isArray(artwork.assertions) && artwork.assertions.length) return artwork.assertions;
  return (artwork.concepts || []).map((conceptId) => ({ conceptId, weight: 0.5, role: "supporting" }));
}

export function getArtworkConcepts(data, artworkId) {
  return getArtworkAssertions(data, artworkId)
    .map((assertion) => getConcept(data, assertion.conceptId))
    .filter(Boolean);
}

export function getArtworkConceptEntries(data, artworkId) {
  return getArtworkAssertions(data, artworkId)
    .map((assertion) => ({
      ...assertion,
      concept: getConcept(data, assertion.conceptId)
    }))
    .filter((entry) => entry.concept);
}

export function getRelatedConcepts(data, conceptId) {
  const concept = getConcept(data, conceptId);
  if (!concept) return [];
  const seen = new Set();
  const output = [];

  for (const [relationType, ids] of Object.entries(concept.relations || {})) {
    for (const id of ids || []) {
      const key = `${relationType}:${id}`;
      if (seen.has(key)) continue;
      const target = getConcept(data, id);
      if (!target) continue;
      seen.add(key);
      output.push({
        relationType,
        relationWeight: RELATION_WEIGHTS[relationType] ?? 0.6,
        concept: target
      });
    }
  }

  return output.sort((a, b) =>
    b.relationWeight - a.relationWeight ||
    a.concept.id.localeCompare(b.concept.id)
  );
}

function assertionMap(data, artworkId) {
  return new Map(
    getArtworkAssertions(data, artworkId)
      .map((assertion) => [assertion.conceptId, Number(assertion.weight) || 0])
  );
}

export function getRelatedArtworks(data, artworkId) {
  const source = getArtwork(data, artworkId);
  if (!source) return [];

  const sourceWeights = assertionMap(data, artworkId);

  return data.artworks
    .filter((candidate) => candidate.id !== artworkId)
    .map((candidate) => {
      const candidateWeights = assertionMap(data, candidate.id);
      const unionIds = new Set([...sourceWeights.keys(), ...candidateWeights.keys()]);
      const sharedConceptIds = [...sourceWeights.keys()].filter((id) => candidateWeights.has(id));

      let numerator = 0;
      let denominator = 0;
      for (const id of unionIds) {
        const a = sourceWeights.get(id) || 0;
        const b = candidateWeights.get(id) || 0;
        numerator += Math.min(a, b);
        denominator += Math.max(a, b);
      }

      return {
        artwork: candidate,
        sharedConceptIds,
        sharedCount: sharedConceptIds.length,
        score: denominator ? numerator / denominator : 0,
        bridges: getSemanticBridges(data, artworkId, candidate.id, 5)
      };
    })
    .filter((item) => item.sharedCount > 0 || item.bridges.length > 0)
    .sort((a, b) =>
      b.score - a.score ||
      b.sharedCount - a.sharedCount ||
      a.artwork.id.localeCompare(b.artwork.id)
    );
}

export function getSemanticBridges(data, sourceArtworkId, targetArtworkId, limit = 8) {
  const sourceAssertions = getArtworkAssertions(data, sourceArtworkId);
  const targetAssertions = getArtworkAssertions(data, targetArtworkId);
  const targetMap = new Map(targetAssertions.map((item) => [item.conceptId, item]));
  const paths = [];
  const seen = new Set();

  for (const sourceAssertion of sourceAssertions) {
    const shared = targetMap.get(sourceAssertion.conceptId);
    if (shared) {
      const key = `shared:${sourceAssertion.conceptId}`;
      if (!seen.has(key)) {
        seen.add(key);
        paths.push({
          kind: "shared",
          fromConceptId: sourceAssertion.conceptId,
          relationType: "shared",
          toConceptId: sourceAssertion.conceptId,
          score: Math.min(sourceAssertion.weight || 0, shared.weight || 0)
        });
      }
    }

    const concept = getConcept(data, sourceAssertion.conceptId);
    if (!concept) continue;
    for (const [relationType, relatedIds] of Object.entries(concept.relations || {})) {
      for (const relatedId of relatedIds || []) {
        const targetAssertion = targetMap.get(relatedId);
        if (!targetAssertion) continue;
        const key = `${sourceAssertion.conceptId}:${relationType}:${relatedId}`;
        if (seen.has(key)) continue;
        seen.add(key);
        const relationWeight = RELATION_WEIGHTS[relationType] ?? 0.6;
        paths.push({
          kind: "bridge",
          fromConceptId: sourceAssertion.conceptId,
          relationType,
          toConceptId: relatedId,
          score: (sourceAssertion.weight || 0) * (targetAssertion.weight || 0) * relationWeight
        });
      }
    }
  }

  return paths
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.max(1, limit));
}

export function getConceptNeighborhood(data, conceptId, limit = 12) {
  const center = getConcept(data, conceptId);
  if (!center) return { center: null, neighbors: [] };
  const neighbors = getRelatedConcepts(data, conceptId).slice(0, limit);
  return { center, neighbors };
}

export function getConceptTypeGroups(data, artworkId) {
  const groups = new Map();
  for (const entry of getArtworkConceptEntries(data, artworkId)) {
    const type = entry.concept.type || "concept";
    if (!groups.has(type)) groups.set(type, []);
    groups.get(type).push(entry);
  }
  for (const entries of groups.values()) {
    entries.sort((a, b) => (b.weight || 0) - (a.weight || 0));
  }
  return groups;
}

function normalizeSearchText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function tokenizeSearchText(value) {
  return normalizeSearchText(value)
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .split(/\s+/)
    .filter((token) => token.length > 1);
}

function fnv1a(value) {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function localVector(value, dimensions = 96) {
  const vector = new Float32Array(dimensions);
  const normalized = normalizeSearchText(value);
  const tokens = tokenizeSearchText(normalized);
  const features = [...tokens];

  const compact = normalized.replace(/\s+/g, " ");
  for (let index = 0; index < compact.length - 2; index += 1) {
    features.push(`#${compact.slice(index, index + 3)}`);
  }

  for (const feature of features) {
    const hash = fnv1a(feature);
    const slot = hash % dimensions;
    const sign = ((hash >>> 8) & 1) ? 1 : -1;
    vector[slot] += sign;
  }

  let length = 0;
  for (const value of vector) length += value * value;
  length = Math.sqrt(length) || 1;
  for (let index = 0; index < vector.length; index += 1) vector[index] /= length;
  return vector;
}

function cosineSimilarity(a, b) {
  let score = 0;
  const length = Math.min(a.length, b.length);
  for (let index = 0; index < length; index += 1) score += a[index] * b[index];
  return Math.max(-1, Math.min(1, score));
}

function knowledgeDocumentText(data, id, lang) {
  const resolved = resolveKnowledgeNode(data, id);
  if (!resolved) return "";
  const language = normalizeLang(lang);

  if (resolved.kind === "artwork") {
    const artwork = resolved.node;
    const concepts = getArtworkConceptEntries(data, artwork.id)
      .slice(0, 10)
      .map((entry) => localize(entry.concept.labels, language));
    const iconography = getArtworkIconographyEntries(data, artwork.id)
      .slice(0, 8)
      .map((entry) => localize(entry.subject.labels, language));
    return [
      ...Object.values(artwork.title || {}),
      ...Object.values(artwork.artist || {}),
      ...Object.values(artwork.museum || {}),
      ...Object.values(artwork.date || {}),
      ...concepts,
      ...iconography,
      artwork.id
    ].join(" ");
  }

  if (resolved.kind === "entity") {
    const entity = resolved.node;
    return [
      ...Object.values(entity.labels || {}),
      ...Object.values(entity.descriptions || {}),
      entity.type,
      entity.id
    ].join(" ");
  }

  if (resolved.kind === "iconography") {
    const subject = resolved.node;
    return [
      ...Object.values(subject.labels || {}),
      ...Object.values(subject.descriptions || {}),
      subject.iconclass?.notation || "",
      subject.type,
      subject.id
    ].join(" ");
  }

  const concept = resolved.node;
  return [
    ...Object.values(concept.labels || {}),
    ...Object.values(concept.definitions || {}),
    concept.type,
    concept.id
  ].join(" ");
}

function allKnowledgeIds(data) {
  return [
    ...data.artworks.map((item) => item.id),
    ...data.concepts.map((item) => item.id),
    ...(data.culturalEntities || []).map((item) => item.id),
    ...(data.iconographySubjects || []).map((item) => item.id)
  ];
}

function directGraphNeighbors(data, nodeId) {
  const neighbors = new Set();

  for (const relation of getCulturalRelations(data, nodeId)) neighbors.add(relation.neighborId);
  for (const relation of getPedagogicalRelations(data, nodeId)) {
    if (resolveKnowledgeNode(data, relation.neighborId)) neighbors.add(relation.neighborId);
  }

  const resolved = resolveKnowledgeNode(data, nodeId);
  if (resolved?.kind === "concept") {
    for (const related of getRelatedConcepts(data, nodeId)) neighbors.add(related.concept.id);
    for (const artwork of data.artworks) {
      if (getArtworkAssertions(data, artwork.id).some((assertion) => assertion.conceptId === nodeId)) {
        neighbors.add(artwork.id);
      }
    }
  } else if (resolved?.kind === "artwork") {
    for (const entry of getArtworkConceptEntries(data, nodeId)) neighbors.add(entry.concept.id);
    for (const entry of getArtworkCulturalEntries(data, nodeId)) neighbors.add(entry.entity.id);
    for (const entry of getArtworkIconographyEntries(data, nodeId)) neighbors.add(entry.subject.id);
  } else if (resolved?.kind === "iconography") {
    for (const entry of getIconographyArtworks(data, nodeId)) neighbors.add(entry.artwork.id);
  }

  return neighbors;
}

function detectNaturalLanguageQuery(data, query, lang = "fr") {
  const language = normalizeLang(lang);
  const normalized = normalizeSearchText(query);
  const intentScores = new Map();

  for (const intent of data.queryIntents || []) {
    const phrases = [
      ...(intent.phrases?.[language] || []),
      ...(intent.phrases?.fr || []),
      ...(intent.phrases?.en || []),
      ...(intent.phrases?.ar || [])
    ];
    for (const phrase of phrases) {
      if (normalized.includes(normalizeSearchText(phrase))) {
        intentScores.set(intent.id, (intentScores.get(intent.id) || 0) + 1);
      }
    }
  }

  const intent = [...intentScores.entries()]
    .sort((a, b) => b[1] - a[1])[0]?.[0] || "explore";

  const seedScores = new Map();
  for (const entry of data.queryNodeAliases || []) {
    const aliases = [
      ...(entry.aliases?.[language] || []),
      ...(entry.aliases?.fr || []),
      ...(entry.aliases?.en || []),
      ...(entry.aliases?.ar || [])
    ];
    for (const alias of aliases) {
      const normalizedAlias = normalizeSearchText(alias);
      if (!normalizedAlias || !normalized.includes(normalizedAlias)) continue;
      const weight = Math.max(1, normalizedAlias.split(/\s+/).length);
      seedScores.set(entry.nodeId, Math.max(seedScores.get(entry.nodeId) || 0, weight));
    }
  }

  for (const id of allKnowledgeIds(data)) {
    const text = normalizeSearchText(knowledgeDocumentText(data, id, language));
    const resolved = resolveKnowledgeNode(data, id);
    const label = resolved?.kind === "artwork"
      ? localize(resolved.node.title, language)
      : localize(resolved?.node?.labels, language);
    const normalizedLabel = normalizeSearchText(label);
    if (normalizedLabel && normalized.includes(normalizedLabel)) {
      seedScores.set(id, Math.max(seedScores.get(id) || 0, 2.5));
    } else if (normalizedLabel && text.includes(normalized) && normalized.length >= 4) {
      seedScores.set(id, Math.max(seedScores.get(id) || 0, 1));
    }
  }

  const channels = [];
  for (const [channel, aliases] of Object.entries(data.queryChannelAliases || {})) {
    if ((aliases || []).some((alias) => normalized.includes(normalizeSearchText(alias)))) {
      channels.push(channel);
    }
  }

  return {
    query,
    normalized,
    intent,
    channels,
    seeds: [...seedScores.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([id, score]) => ({ id, score }))
      .slice(0, 8)
  };
}

function pedagogicalRegionResults(data, detected, lang) {
  if (detected.intent !== "observe") return [];
  const results = [];
  const seen = new Set();

  for (const seed of detected.seeds) {
    for (const relation of getPedagogicalRelations(data, seed.id)) {
      const region = getImageRegion(data, relation.neighborId);
      if (!region || seen.has(region.id)) continue;
      seen.add(region.id);
      results.push({
        kind: "region",
        id: region.id,
        artworkId: region.artworkId,
        label: localize(region.labels, lang),
        subtitle: localize(getArtwork(data, region.artworkId)?.title, lang),
        score: 1.6 + (seed.score * 0.12),
        reasons: ["pedagogy", relation.type],
        rationale: localize(relation.rationale, lang),
        prompt: localize(relation.prompt, lang)
      });
    }
  }

  return results;
}

function experienceSearchResults(data, detected, lang) {
  if (detected.intent !== "experience" && !detected.channels.length) return [];
  const preferredIds = new Set(detected.seeds.map((seed) => seed.id));
  for (const seed of detected.seeds) {
    for (const neighbor of directGraphNeighbors(data, seed.id)) preferredIds.add(neighbor);
  }

  const results = [];
  for (const entry of data.experienceNodes || []) {
    const graphRelated = preferredIds.has(entry.nodeId);
    if (!graphRelated && detected.seeds.length) continue;
    for (const experience of entry.experiences || []) {
      if (detected.channels.length && !detected.channels.includes(experience.channel)) continue;
      results.push({
        kind: "experience",
        id: experience.id,
        nodeId: entry.nodeId,
        label: localize(experience.labels, lang),
        subtitle: experience.channel,
        description: localize(experience.descriptions, lang),
        href: String(experience.href || "").replaceAll("{lang}", encodeURIComponent(normalizeLang(lang))),
        external: Boolean(experience.external),
        score: (graphRelated ? 1.8 : 0.8) + (detected.channels.includes(experience.channel) ? 0.8 : 0),
        reasons: ["experience", experience.channel]
      });
    }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, 8);
}

export function searchSemanticNaturalLanguage(data, query, lang = "fr") {
  const detected = detectNaturalLanguageQuery(data, query, lang);
  if (!detected.normalized) {
    return {
      query,
      intent: "explore",
      channels: [],
      seeds: [],
      results: [],
      examples: data.queryExamples?.[normalizeLang(lang)] || []
    };
  }

  const language = normalizeLang(lang);
  const queryTokens = new Set(tokenizeSearchText(detected.normalized));
  const queryVector = localVector(detected.normalized);
  const seedMap = new Map(detected.seeds.map((seed) => [seed.id, seed.score]));
  const graphNeighbors = new Map();

  for (const seed of detected.seeds) {
    for (const neighbor of directGraphNeighbors(data, seed.id)) {
      graphNeighbors.set(neighbor, Math.max(graphNeighbors.get(neighbor) || 0, seed.score));
    }
  }

  const nodeResults = allKnowledgeIds(data).map((id) => {
    const resolved = resolveKnowledgeNode(data, id);
    const document = knowledgeDocumentText(data, id, language);
    const normalizedDocument = normalizeSearchText(document);
    const documentTokens = new Set(tokenizeSearchText(document));
    const overlap = [...queryTokens].filter((token) => documentTokens.has(token)).length;
    const tokenScore = queryTokens.size ? overlap / queryTokens.size : 0;
    const vectorScore = Math.max(0, cosineSimilarity(queryVector, localVector(document)));
    const seedScore = seedMap.has(id) ? Math.min(1, seedMap.get(id) / 2.5) : 0;
    const graphScore = graphNeighbors.has(id) ? Math.min(1, graphNeighbors.get(id) / 2.5) : 0;
    const exactScore = normalizedDocument.includes(detected.normalized) ? 1 : 0;
    const experiences = getNodeExperiences(data, id);
    const channelScore = detected.channels.length && experiences.some((experience) => detected.channels.includes(experience.channel)) ? 1 : 0;

    let score =
      (seedScore * 0.34) +
      (tokenScore * 0.22) +
      (vectorScore * 0.18) +
      (graphScore * 0.18) +
      (exactScore * 0.08);

    if (detected.intent === "experience") score += channelScore * 0.24;
    if (detected.intent === "location" && resolved?.kind === "entity" && ["museum", "place"].includes(resolved.node.type)) score += 0.18;
    if (detected.intent === "compare" && ["artwork", "entity"].includes(resolved?.kind)) score += 0.08;

    const reasons = [];
    if (seedScore > 0) reasons.push("alias");
    if (graphScore > 0) reasons.push("graph");
    if (vectorScore >= 0.35) reasons.push("vector");
    if (channelScore > 0) reasons.push("experience");
    if (exactScore > 0) reasons.push("text");

    return {
      kind: resolved?.kind || "concept",
      id,
      resolved,
      label: resolved?.kind === "artwork"
        ? localize(resolved.node.title, language)
        : localize(resolved?.node?.labels, language),
      subtitle: resolved?.kind === "artwork"
        ? localize(resolved.node.artist, language)
        : resolved?.kind === "entity"
          ? resolved.node.type
          : resolved?.node?.type || resolved?.kind,
      score,
      reasons,
      vectorScore
    };
  })
    .filter((item) => item.resolved && item.score >= 0.12)
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
    .slice(0, 12);

  const regionResults = pedagogicalRegionResults(data, detected, language);
  const experienceResults = experienceSearchResults(data, detected, language);

  return {
    query,
    intent: detected.intent,
    channels: detected.channels,
    seeds: detected.seeds,
    mode: "graph+local-vector",
    results: [...regionResults, ...experienceResults, ...nodeResults]
      .sort((a, b) => b.score - a.score)
      .slice(0, 14),
    examples: data.queryExamples?.[language] || []
  };
}

export function searchSemantic(data, query, lang = "fr") {
  const needle = normalizeSearchText(query);
  if (!needle) return { concepts: [], artworks: [], entities: [], iconography: [] };
  const language = normalizeLang(lang);

  const concepts = data.concepts
    .map((concept) => {
      const preferredLabel = localize(concept.labels, language);
      const haystack = normalizeSearchText([
        ...Object.values(concept.labels || {}),
        ...Object.values(concept.definitions || {}),
        concept.id,
        concept.type
      ].join(" "));
      let score = 0;
      if (normalizeSearchText(preferredLabel) === needle) score += 5;
      if (normalizeSearchText(preferredLabel).startsWith(needle)) score += 3;
      if (haystack.includes(needle)) score += 1;
      return { concept, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.concept.id.localeCompare(b.concept.id))
    .slice(0, 12);

  const artworks = data.artworks
    .map((artwork) => {
      const haystack = normalizeSearchText([
        ...Object.values(artwork.title || {}),
        ...Object.values(artwork.artist || {}),
        ...Object.values(artwork.museum || {}),
        artwork.id
      ].join(" "));
      return { artwork, score: haystack.includes(needle) ? 1 : 0 };
    })
    .filter((item) => item.score > 0)
    .slice(0, 8);

  const entities = (data.culturalEntities || [])
    .map((entity) => {
      const preferredLabel = localize(entity.labels, language);
      const haystack = normalizeSearchText([
        ...Object.values(entity.labels || {}),
        ...Object.values(entity.descriptions || {}),
        entity.id,
        entity.type
      ].join(" "));
      let score = 0;
      if (normalizeSearchText(preferredLabel) === needle) score += 5;
      if (normalizeSearchText(preferredLabel).startsWith(needle)) score += 3;
      if (haystack.includes(needle)) score += 1;
      return { entity, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.entity.id.localeCompare(b.entity.id))
    .slice(0, 10);

  const iconography = (data.iconographySubjects || [])
    .map((subject) => {
      const preferredLabel = localize(subject.labels, language);
      const haystack = normalizeSearchText([
        ...Object.values(subject.labels || {}),
        ...Object.values(subject.descriptions || {}),
        subject.id,
        subject.type,
        subject.iconclass?.notation || ""
      ].join(" "));
      let score = 0;
      if (normalizeSearchText(preferredLabel) === needle) score += 5;
      if (normalizeSearchText(preferredLabel).startsWith(needle)) score += 3;
      if (haystack.includes(needle)) score += 1;
      return { subject, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.subject.id.localeCompare(b.subject.id))
    .slice(0, 10);

  return { concepts, artworks, entities, iconography };
}

export function clearSemanticCache() {
  cache = null;
}
