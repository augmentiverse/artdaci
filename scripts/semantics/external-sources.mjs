const MAPPINGS_URL = new URL("../../content/semantics/external-mappings.json", import.meta.url);
let mappingsCache = null;
const providerCache = new Map();

export async function loadExternalMappings() {
  if (mappingsCache) return mappingsCache;
  const response = await fetch(MAPPINGS_URL, { cache: "no-store" });
  if (!response.ok) throw new Error(`External semantic mappings could not be loaded (${response.status}).`);
  mappingsCache = await response.json();
  return mappingsCache;
}

export async function getExternalMapping(kind, id) {
  const mappings = await loadExternalMappings();
  const list = kind === "artwork" ? mappings.artworkMappings : mappings.conceptMappings;
  return list.find((item) => (kind === "artwork" ? item.artworkId : item.conceptId) === id) || null;
}

export function providerPageUrl(provider, id) {
  if (provider === "wikidata") return `https://www.wikidata.org/wiki/${encodeURIComponent(id)}`;
  if (provider === "getty-aat") return `http://vocab.getty.edu/page/aat/${encodeURIComponent(id)}`;
  if (provider === "getty-ulan") return `http://vocab.getty.edu/page/ulan/${encodeURIComponent(id)}`;
  if (provider === "getty-tgn") return `http://vocab.getty.edu/page/tgn/${encodeURIComponent(id)}`;
  if (provider === "iconclass") return `https://iconclass.org/${encodeURIComponent(id)}`;
  return null;
}

export async function fetchProviderRecord(provider, id, lang = "fr", options = {}) {
  const expand = Boolean(options.expand);
  const key = `${provider}:${id}:${lang}:${expand ? "expand" : "base"}`;
  if (providerCache.has(key)) return providerCache.get(key);

  const promise = fetch(
    `/api/semantic-source?provider=${encodeURIComponent(provider)}&id=${encodeURIComponent(id)}&lang=${encodeURIComponent(lang)}${expand ? "&expand=1" : ""}`,
    { headers: { Accept: "application/json" } }
  ).then(async (response) => {
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data.error || `${provider} request failed (${response.status})`);
      error.data = data;
      throw error;
    }
    return data;
  });

  providerCache.set(key, promise);
  try {
    return await promise;
  } catch (error) {
    providerCache.delete(key);
    throw error;
  }
}

export function mappingProviders(mapping) {
  if (!mapping) return [];
  const providers = [];
  if (mapping.wikidata) providers.push({ provider: "wikidata", id: mapping.wikidata });
  if (mapping.gettyAat) providers.push({ provider: "getty-aat", id: mapping.gettyAat });
  if (mapping.gettyUlan) providers.push({ provider: "getty-ulan", id: mapping.gettyUlan });
  if (mapping.gettyTgn) providers.push({ provider: "getty-tgn", id: mapping.gettyTgn });
  if (mapping.iconclass) providers.push({ provider: "iconclass", id: typeof mapping.iconclass === "string" ? mapping.iconclass : mapping.iconclass.notation });
  return providers;
}

export function providersFromExternal(external) {
  return mappingProviders(external || {});
}

export function clearExternalSourceCache() {
  mappingsCache = null;
  providerCache.clear();
}
