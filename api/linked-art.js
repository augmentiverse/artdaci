const artworksDoc = require("../content/semantics/artwork-concepts.json");
const conceptsDoc = require("../content/semantics/concepts.json");
const culturalDoc = require("../content/semantics/cultural-knowledge.json");
const mappingsDoc = require("../content/semantics/external-mappings.json");

const CONTEXT = "https://linked.art/ns/v1/linked-art.json";
const MEDIA_TYPE = 'application/ld+json;profile="https://linked.art/ns/v1/linked-art.json"';
const CANONICAL = "https://artdaci.com/api/linked-art";
const PRIMARY_NAME = {
  id: "http://vocab.getty.edu/aat/300404670",
  type: "Type",
  _label: "Primary Name"
};

const artworks = new Map(artworksDoc.artworks.map((item) => [item.id, item]));
const concepts = new Map(conceptsDoc.concepts.map((item) => [item.id, item]));
const entities = new Map(culturalDoc.entities.map((item) => [item.id, item]));
const artworkMappings = new Map(mappingsDoc.artworkMappings.map((item) => [item.artworkId, item]));
const conceptMappings = new Map(mappingsDoc.conceptMappings.map((item) => [item.conceptId, item]));

function langCode(value) {
  const lang = String(value || "fr").toLowerCase().split(/[-_]/)[0];
  return ["fr", "en", "ar"].includes(lang) ? lang : "fr";
}

function localize(value, lang) {
  if (!value || typeof value !== "object") return value || "";
  return value[lang] || value.fr || value.en || value.ar || "";
}

function canonicalUri(kind, id) {
  return `${CANONICAL}?kind=${encodeURIComponent(kind)}&id=${encodeURIComponent(id)}`;
}

function nameBlock(label) {
  return [{
    type: "Name",
    classified_as: [PRIMARY_NAME],
    content: label
  }];
}

function relationFrom(source, type) {
  return culturalDoc.relations.filter((relation) => relation.source === source && relation.type === type);
}

function entityType(entity) {
  if (!entity) return null;
  if (entity.type === "artist") return "Person";
  if (entity.type === "museum") return "Group";
  if (entity.type === "place") return "Place";
  if (entity.type === "subject") return "Type";
  if (entity.type === "event") return "Activity";
  return "Type";
}

function externalEquivalent(external, type, label) {
  const output = [];
  if (external?.wikidata) {
    output.push({
      id: `https://www.wikidata.org/entity/${external.wikidata}`,
      type,
      _label: label
    });
  }
  if (external?.gettyUlan) {
    output.push({
      id: `http://vocab.getty.edu/ulan/${external.gettyUlan}`,
      type,
      _label: label
    });
  }
  if (external?.gettyTgn) {
    output.push({
      id: `http://vocab.getty.edu/tgn/${external.gettyTgn}`,
      type,
      _label: label
    });
  }
  if (external?.gettyAat) {
    output.push({
      id: `http://vocab.getty.edu/aat/${external.gettyAat}`,
      type: "Type",
      _label: label
    });
  }
  return output;
}

function entityReference(entity, lang) {
  if (!entity) return null;
  return {
    id: canonicalUri("entity", entity.id),
    type: entityType(entity),
    _label: localize(entity.labels, lang)
  };
}

function placeReference(entity, lang) {
  if (!entity || entity.type !== "place") return null;
  return {
    id: canonicalUri("entity", entity.id),
    type: "Place",
    _label: localize(entity.labels, lang)
  };
}

function timeSpan(temporal) {
  if (!temporal?.start) return null;
  const start = String(temporal.start);
  const end = String(temporal.end || temporal.start);
  return {
    type: "TimeSpan",
    _label: start === end ? start : `${start}–${end}`,
    begin_of_the_begin: `${start}-01-01T00:00:00Z`,
    end_of_the_end: `${end}-12-31T23:59:59Z`
  };
}

function buildEntity(id, lang) {
  const entity = entities.get(id);
  if (!entity) return null;

  const type = entityType(entity);
  const label = localize(entity.labels, lang);
  const record = {
    "@context": CONTEXT,
    id: canonicalUri("entity", entity.id),
    type,
    _label: label,
    identified_by: nameBlock(label)
  };

  const equivalent = externalEquivalent(entity.external, type, label);
  if (equivalent.length) record.equivalent = equivalent;

  if (entity.type === "event") {
    const ts = timeSpan(entity.temporal);
    if (ts) record.timespan = ts;

    const actors = relationFrom(entity.id, "carriedOutBy")
      .map((relation) => entityReference(entities.get(relation.target), lang))
      .filter(Boolean);
    if (actors.length) record.carried_out_by = actors;

    const places = relationFrom(entity.id, "occurredAt")
      .map((relation) => placeReference(entities.get(relation.target), lang))
      .filter(Boolean);
    if (places.length) record.took_place_at = places;
  }

  return record;
}

function conceptReference(conceptId, lang) {
  const concept = concepts.get(conceptId);
  if (!concept) return null;
  const mapping = conceptMappings.get(conceptId);
  const label = localize(concept.labels, lang);
  if (mapping?.gettyAat) {
    return {
      id: `http://vocab.getty.edu/aat/${mapping.gettyAat}`,
      type: "Type",
      _label: label
    };
  }
  return {
    id: canonicalUri("concept", conceptId),
    type: "Type",
    _label: label
  };
}

function buildConcept(id, lang) {
  const concept = concepts.get(id);
  if (!concept) return null;
  const label = localize(concept.labels, lang);
  const mapping = conceptMappings.get(id) || {};
  const record = {
    "@context": CONTEXT,
    id: canonicalUri("concept", id),
    type: "Type",
    _label: label,
    identified_by: nameBlock(label)
  };

  const equivalent = externalEquivalent({
    wikidata: mapping.wikidata,
    gettyAat: mapping.gettyAat
  }, "Type", label);
  if (equivalent.length) record.equivalent = equivalent;
  return record;
}

function buildArtwork(id, lang) {
  const artwork = artworks.get(id);
  if (!artwork) return null;

  const label = localize(artwork.title, lang);
  const record = {
    "@context": CONTEXT,
    id: canonicalUri("artwork", id),
    type: "HumanMadeObject",
    _label: label,
    identified_by: nameBlock(label)
  };

  const mapping = artworkMappings.get(id);
  if (mapping?.wikidata) {
    record.equivalent = [{
      id: `https://www.wikidata.org/entity/${mapping.wikidata}`,
      type: "HumanMadeObject",
      _label: label
    }];
  }

  const artistRelation = relationFrom(id, "createdBy")[0];
  const eventRelation = relationFrom(id, "creationEvent")[0];
  const placeRelation = eventRelation
    ? relationFrom(eventRelation.target, "occurredAt")[0]
    : null;

  const production = {
    type: "Production",
    _label: `Production of ${label}`
  };

  if (artistRelation) {
    const artist = entities.get(artistRelation.target);
    const artistRef = entityReference(artist, lang);
    if (artistRef) production.carried_out_by = [artistRef];
  }

  if (eventRelation) {
    const event = entities.get(eventRelation.target);
    const ts = timeSpan(event?.temporal);
    if (ts) production.timespan = ts;
  }

  if (placeRelation) {
    const place = placeReference(entities.get(placeRelation.target), lang);
    if (place) production.took_place_at = [place];
  }

  const technique = (artwork.assertions || [])
    .filter((assertion) => concepts.get(assertion.conceptId)?.type === "technique")
    .map((assertion) => conceptReference(assertion.conceptId, lang))
    .filter(Boolean);
  if (technique.length) production.technique = technique;

  record.produced_by = production;

  const classifications = (artwork.assertions || [])
    .filter((assertion) => ["period", "movement", "genre"].includes(concepts.get(assertion.conceptId)?.type))
    .map((assertion) => conceptReference(assertion.conceptId, lang))
    .filter(Boolean);
  if (classifications.length) record.classified_as = classifications;

  const museumRelation = relationFrom(id, "heldBy")[0];
  if (museumRelation) {
    const museum = entities.get(museumRelation.target);
    const museumRef = entityReference(museum, lang);
    if (museumRef) record.current_custodian = [museumRef];

    const locationRelation = relationFrom(museumRelation.target, "locatedIn")[0];
    if (locationRelation) {
      const place = placeReference(entities.get(locationRelation.target), lang);
      if (place) record.current_location = place;
    }
  }

  return record;
}

function buildRecord(kind, id, lang) {
  if (kind === "artwork") return buildArtwork(id, lang);
  if (kind === "entity") return buildEntity(id, lang);
  if (kind === "concept") return buildConcept(id, lang);
  return null;
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Vary", "Accept");

  if (req.method === "OPTIONS") {
    res.setHeader("Allow", "GET, HEAD, OPTIONS");
    res.status(204).end();
    return;
  }

  if (!["GET", "HEAD"].includes(req.method)) {
    res.setHeader("Allow", "GET, HEAD, OPTIONS");
    res.status(405).end();
    return;
  }

  const kind = String(req.query?.kind || "");
  const id = String(req.query?.id || "");
  const lang = langCode(req.query?.lang);
  const record = buildRecord(kind, id, lang);

  if (!record) {
    res.status(404);
    if (req.method === "HEAD") return res.end();
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res.end(JSON.stringify({ error: "Linked Art entity not found" }));
  }

  res.setHeader("Content-Type", MEDIA_TYPE);
  res.setHeader("Cache-Control", "public, s-maxage=86400, stale-while-revalidate=604800");
  res.setHeader("Link", '<https://linked.art/ns/v1/linked-art.json>; rel="http://www.w3.org/ns/json-ld#context"; type="application/ld+json"');

  if (req.method === "HEAD") return res.status(200).end();
  return res.status(200).end(JSON.stringify(record, null, 2));
};
