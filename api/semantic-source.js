const WIKIDATA_API = "https://www.wikidata.org/w/api.php";
const GETTY_SPARQL = "https://vocab.getty.edu/sparql.json";

function send(res, status, body) {
  res.status(status);
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=86400, stale-while-revalidate=604800");
  res.send(JSON.stringify(body));
}

function normalizeLang(value) {
  const code = String(value || "fr").toLowerCase().split(/[-_]/)[0];
  return ["fr", "en", "ar"].includes(code) ? code : "fr";
}

async function wikidataRequest(params) {
  const url = new URL(WIKIDATA_API);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  url.searchParams.set("format", "json");
  url.searchParams.set("formatversion", "2");
  url.searchParams.set("origin", "*");

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "ARTDACI-Semantic/1.0 (https://artdaci.com/)"
    }
  });

  if (!response.ok) throw new Error(`Wikidata HTTP ${response.status}`);
  return response.json();
}

async function wikidataLabels(ids, lang) {
  const uniqueIds = [...new Set(ids)].filter((id) => /^Q\d+$/.test(id)).slice(0, 40);
  if (!uniqueIds.length) return {};

  const data = await wikidataRequest({
    action: "wbgetentities",
    ids: uniqueIds.join("|"),
    props: "labels|descriptions",
    languages: [lang, "fr", "en", "ar"].join("|"),
    languagefallback: "1"
  });

  return Object.fromEntries(
    uniqueIds.map((id) => {
      const entity = data.entities?.[id] || {};
      const labels = entity.labels || {};
      const descriptions = entity.descriptions || {};
      return [id, {
        label: labels[lang]?.value || labels.fr?.value || labels.en?.value || labels.ar?.value || id,
        description: descriptions[lang]?.value || descriptions.fr?.value || descriptions.en?.value || descriptions.ar?.value || ""
      }];
    })
  );
}

function wikidataClaimIds(entity, property) {
  return (entity.claims?.[property] || [])
    .map((claim) => claim?.mainsnak?.datavalue?.value?.id)
    .filter((id) => /^Q\d+$/.test(id));
}

async function fetchWikidata(id, lang, expand = false) {
  if (!/^Q\d+$/.test(id)) throw new Error("Invalid Wikidata ID");

  const data = await wikidataRequest({
    action: "wbgetentities",
    ids: id,
    props: "labels|descriptions|aliases|claims",
    languages: [lang, "fr", "en", "ar"].join("|"),
    languagefallback: "1"
  });

  const entity = data.entities?.[id];
  if (!entity || entity.missing) throw new Error("Wikidata entity not found");

  const labels = Object.fromEntries(
    Object.entries(entity.labels || {}).map(([code, item]) => [code, item.value])
  );
  const descriptions = Object.fromEntries(
    Object.entries(entity.descriptions || {}).map(([code, item]) => [code, item.value])
  );
  const aliases = Object.fromEntries(
    Object.entries(entity.aliases || {}).map(([code, items]) => [code, items.map((item) => item.value)])
  );
  const aatIds = (entity.claims?.P1014 || [])
    .map((claim) => claim?.mainsnak?.datavalue?.value)
    .filter(Boolean);

  let suggestions = [];
  if (expand) {
    const relationSpecs = [
      ["P279", "broader", "subclass of"],
      ["P31", "instanceOf", "instance of"],
      ["P361", "partOf", "part of"],
      ["P1269", "facetOf", "facet of"],
      ["P460", "related", "related"]
    ];

    const raw = [];
    for (const [property, relationType, relationLabel] of relationSpecs) {
      for (const targetId of wikidataClaimIds(entity, property)) {
        raw.push({ targetId, property, relationType, relationLabel });
      }
    }

    const labelMap = await wikidataLabels(raw.map((item) => item.targetId), lang);
    suggestions = raw.slice(0, 16).map((item) => ({
      provider: "wikidata",
      id: item.targetId,
      uri: `https://www.wikidata.org/entity/${item.targetId}`,
      pageUrl: `https://www.wikidata.org/wiki/${item.targetId}`,
      label: labelMap[item.targetId]?.label || item.targetId,
      description: labelMap[item.targetId]?.description || "",
      property: item.property,
      relationType: item.relationType,
      relationLabel: item.relationLabel,
      status: "external-proposed"
    }));
  }

  return {
    provider: "wikidata",
    id,
    uri: `https://www.wikidata.org/entity/${id}`,
    pageUrl: `https://www.wikidata.org/wiki/${id}`,
    label: labels[lang] || labels.fr || labels.en || labels.ar || id,
    description: descriptions[lang] || descriptions.fr || descriptions.en || descriptions.ar || "",
    labels,
    descriptions,
    aliases,
    crossIdentifiers: { gettyAat: aatIds },
    suggestions,
    license: "CC0 1.0",
    live: true
  };
}

async function gettyQuery(query) {
  const url = new URL(GETTY_SPARQL);
  url.searchParams.set("query", query);

  const response = await fetch(url, {
    headers: {
      Accept: "application/sparql-results+json, application/json",
      "User-Agent": "ARTDACI-Semantic/1.0 (https://artdaci.com/)"
    }
  });

  if (!response.ok) throw new Error(`Getty SPARQL HTTP ${response.status}`);
  return response.json();
}

const GETTY_VOCABS = Object.freeze({
  "getty-aat": { segment: "aat", label: "Getty AAT" },
  "getty-ulan": { segment: "ulan", label: "Getty ULAN" },
  "getty-tgn": { segment: "tgn", label: "Getty TGN" }
});

async function fetchGetty(provider, id, expand = false) {
  const config = GETTY_VOCABS[provider];
  if (!config) throw new Error("Unsupported Getty vocabulary");
  if (!/^\d{6,12}$/.test(id)) throw new Error("Invalid Getty vocabulary ID");

  const conceptUri = `http://vocab.getty.edu/${config.segment}/${id}`;
  const baseQuery = `
PREFIX gvp: <http://vocab.getty.edu/ontology#>
PREFIX xl: <http://www.w3.org/2008/05/skos-xl#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX dct: <http://purl.org/dc/terms/>
SELECT DISTINCT ?term ?language ?scopeNote
WHERE {
  BIND(<${conceptUri}> AS ?concept)
  OPTIONAL {
    ?concept xl:prefLabel ?labelNode .
    ?labelNode gvp:term ?term .
    OPTIONAL { ?labelNode dct:language ?language . }
  }
  OPTIONAL { ?concept skos:scopeNote ?scopeNote . }
}
LIMIT 30`.trim();

  const data = await gettyQuery(baseQuery);
  const bindings = data.results?.bindings || [];
  const terms = bindings
    .map((row) => ({ value: row.term?.value || "", language: row.language?.value || "" }))
    .filter((item) => item.value);
  const scopeNotes = [...new Set(bindings.map((row) => row.scopeNote?.value).filter(Boolean))];

  let suggestions = [];
  if (expand) {
    const expansionQuery = `
PREFIX gvp: <http://vocab.getty.edu/ontology#>
PREFIX xl: <http://www.w3.org/2008/05/skos-xl#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
SELECT DISTINCT ?direction ?target ?term
WHERE {
  BIND(<${conceptUri}> AS ?concept)
  {
    ?concept (gvp:broaderPreferred|skos:broader) ?target .
    BIND("broader" AS ?direction)
  }
  UNION
  {
    ?target (gvp:broaderPreferred|skos:broader) ?concept .
    BIND("narrower" AS ?direction)
  }
  OPTIONAL {
    ?target xl:prefLabel ?labelNode .
    ?labelNode gvp:term ?term .
  }
}
LIMIT 24`.trim();

    const expansionData = await gettyQuery(expansionQuery);
    const rows = expansionData.results?.bindings || [];
    const dedupe = new Map();
    for (const row of rows) {
      const uri = row.target?.value || "";
      const match = uri.match(new RegExp(`/${config.segment}/(\\d+)$`));
      if (!match) continue;
      const targetId = match[1];
      const direction = row.direction?.value || "related";
      const key = `${direction}:${targetId}`;
      if (!dedupe.has(key)) {
        dedupe.set(key, {
          provider,
          id: targetId,
          uri,
          pageUrl: `http://vocab.getty.edu/page/${config.segment}/${targetId}`,
          label: row.term?.value || `${config.label} ${targetId}`,
          relationType: direction,
          relationLabel: direction === "broader" ? "broader term" : "narrower term",
          status: "external-proposed"
        });
      }
    }
    suggestions = [...dedupe.values()].slice(0, 14);
  }

  return {
    provider,
    id,
    vocabulary: config.segment,
    uri: conceptUri,
    pageUrl: `http://vocab.getty.edu/page/${config.segment}/${id}`,
    terms,
    label: terms[0]?.value || `${config.label} ${id}`,
    scopeNote: scopeNotes[0] || "",
    scopeNotes,
    suggestions,
    license: "ODC-By 1.0",
    attribution: `Contains information from the J. Paul Getty Trust, Getty Research Institute, Getty Vocabulary Program (${config.label}), made available under the ODC Attribution License.`,
    live: true
  };
}

function iconclassPageUrl(notation) {
  return `https://iconclass.org/${encodeURIComponent(notation)}`;
}

async function fetchIconclass(notation, lang) {
  if (!/^[0-9][0-9A-Z]*(?:\([^)]*\))?(?:\([^)]*\))?$/.test(notation)) {
    throw new Error("Invalid Iconclass notation");
  }

  const url = `https://iconclass.org/${encodeURIComponent(notation)}.json`;
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "ARTDACI-Semantic/1.0 (https://artdaci.com/)"
    }
  });
  if (!response.ok) throw new Error(`Iconclass HTTP ${response.status}`);

  const data = await response.json();
  const pick = (...values) => values.find((value) => typeof value === "string" && value.trim()) || "";
  const translations = data?.txt || data?.text || data?.label || data?.labels || {};
  const label = pick(
    translations?.[lang],
    translations?.fr,
    translations?.en,
    translations?.ar,
    data?.text,
    data?.label,
    data?.description,
    notation
  );

  const parentValues = [
    ...(Array.isArray(data?.parents) ? data.parents : []),
    ...(Array.isArray(data?.parent) ? data.parent : data?.parent ? [data.parent] : []),
    ...(Array.isArray(data?.broader) ? data.broader : data?.broader ? [data.broader] : [])
  ];

  const normalizeRelatedNotation = (item) => {
    if (typeof item === "string") return item;
    return item?.notation || item?.id || item?.code || "";
  };

  const suggestions = [...new Set(parentValues.map(normalizeRelatedNotation).filter(Boolean))]
    .slice(0, 8)
    .map((id) => ({
      provider: "iconclass",
      id,
      uri: `http://iconclass.org/${id}`,
      pageUrl: iconclassPageUrl(id),
      label: id,
      relationType: "broader",
      relationLabel: "broader iconographic subject",
      status: "external-proposed"
    }));

  return {
    provider: "iconclass",
    id: notation,
    notation,
    uri: `http://iconclass.org/${notation}`,
    pageUrl: iconclassPageUrl(notation),
    label,
    description: pick(data?.description, data?.scope_note, data?.scopeNote),
    rawLanguages: translations && typeof translations === "object" ? translations : {},
    suggestions,
    license: null,
    rightsNote: "Live linked Iconclass record. ARTDACI does not assume bulk reuse rights; see Iconclass Terms of Use.",
    live: true
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return send(res, 405, { error: "Method not allowed" });
  }

  const provider = String(req.query?.provider || "");
  const id = String(req.query?.id || "");
  const lang = normalizeLang(req.query?.lang);
  const expand = String(req.query?.expand || "") === "1";

  try {
    if (provider === "wikidata") {
      return send(res, 200, await fetchWikidata(id, lang, expand));
    }
    if (GETTY_VOCABS[provider]) {
      return send(res, 200, await fetchGetty(provider, id, expand));
    }
    if (provider === "iconclass") {
      return send(res, 200, await fetchIconclass(id, lang));
    }
    if (provider === "memodata-tid") {
      return send(res, 409, {
        provider,
        status: "contact-required",
        live: false,
        error: "Automated Memodata ingestion is disabled until current API access and reuse terms are confirmed."
      });
    }
    return send(res, 400, { error: "Unsupported semantic provider" });
  } catch (error) {
    return send(res, 502, {
      provider,
      id,
      live: false,
      error: error instanceof Error ? error.message : String(error)
    });
  }
}
