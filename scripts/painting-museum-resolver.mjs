/**
 * Canonical painting → museum association for the ARTDACI print experience.
 * Never infer a museum from the painter: artists' works are spread worldwide.
 *
 * Returns a validated ARTDACI museum record, or null for an institution
 * for which ARTDACI has not yet created a museum record and media.
 */
const MUSEUMS = Object.freeze({
  "musee du louvre": { slug: "louvre", url: "content/museums/louvre.json?v=3" },
  "mauritshuis": { slug: "mauritshuis", url: "content/museums/mauritshuis.json" },
  "princes czartoryski museum": { slug: "czartoryski", url: "content/museums/czartoryski.json?v=2" },
  "musee d'orsay": { slug: "orsay", url: "content/museums/orsay.json" },
  "van gogh museum": { slug: "van-gogh-museum", url: "content/museums/van-gogh-museum.json" },
  "national gallery of art": { slug: "national-gallery-of-art-washington", url: "content/museums/national-gallery-of-art-washington.json?v=1" },
  "national gallery of art, washington": { slug: "national-gallery-of-art-washington", url: "content/museums/national-gallery-of-art-washington.json?v=1" }
});

export function normalizeMuseumName(value) {
  return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u2018\u2019\u02bc]/g, "'").trim().toLowerCase().replace(/\s+/g, " ");
}

export function resolvePaintingMuseum(manifest) {
  const canonicalMuseum = normalizeMuseumName(manifest?.currentLocation?.museum);
  return MUSEUMS[canonicalMuseum] || null;
}
