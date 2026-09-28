export const GEO_LANGUAGES = Object.freeze(["fr", "en", "ar"]);

export function normalizeGeoLanguage(value, fallback = "fr") {
  const language = String(value || "").trim().replaceAll("_", "-").toLowerCase().split("-")[0];
  return GEO_LANGUAGES.includes(language) ? language : fallback;
}

export function languageFromSearch(search, fallback = "fr") {
  return normalizeGeoLanguage(new URLSearchParams(search).get("lang"), fallback);
}

export function localize(value, language, fallback = "fr") {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object" || Array.isArray(value)) return "";
  return value[language] || value[fallback] || value.en || Object.values(value).find(Boolean) || "";
}

export function withLanguage(path, language) {
  const [pathAndQuery, hash = ""] = String(path).split("#", 2);
  const [pathname, query = ""] = pathAndQuery.split("?", 2);
  const params = new URLSearchParams(query);
  params.set("lang", normalizeGeoLanguage(language));
  return `${pathname}?${params.toString()}${hash ? `#${hash}` : ""}`;
}

export function projectAssetUrl(path, moduleUrl) {
  if (typeof path !== "string" || !path.trim()) throw new TypeError("Asset path is required");
  if (/^[a-z][a-z\d+.-]*:/i.test(path) || path.startsWith("//") || path.includes("\\")) {
    throw new TypeError("Project assets must use repository-relative paths");
  }
  const cleanPath = path.replace(/^\/+/, "");
  if (cleanPath.split("/").some((segment) => !segment || segment === "." || segment === "..")) {
    throw new TypeError("Project asset path contains an invalid segment");
  }
  return new URL(`../../${cleanPath}`, moduleUrl).href;
}

export function validatePlaceRecord(place) {
  const errors = [];
  if (!place || typeof place !== "object" || Array.isArray(place)) return ["Place record must be an object"];
  if (!place.id) errors.push("Place id is required");
  for (const language of GEO_LANGUAGES) {
    if (!place.name?.[language]) errors.push(`Place name.${language} is required`);
  }

  const geo = place.geospatial;
  if (!geo || typeof geo !== "object") {
    errors.push("Geospatial block is required");
  } else {
    for (const field of ["latitude", "longitude", "altitudeMeters"]) {
      if (!(geo[field] === null || Number.isFinite(geo[field]))) {
        errors.push(`geospatial.${field} must be a number or null`);
      }
    }
    if (!geo.orientation?.status) errors.push("Orientation status is required");
    if (!geo.anchor?.type || !geo.anchor?.status) errors.push("Anchor type and status are required");
    if (!geo.vps?.availability) errors.push("VPS availability is required");
    if (!geo.verification?.status) errors.push("Geographic verification status is required");
  }

  if (!Array.isArray(place.contents) || place.contents.length === 0) {
    errors.push("At least one linked ARTDACI content item is required");
  } else {
    place.contents.forEach((content, index) => {
      if (!/^[a-z]{2}\d{2}$/.test(content?.artworkId || "")) {
        errors.push(`contents[${index}].artworkId must be canonical`);
      }
    });
  }

  if (!place.mediaResolver?.canonicalManifestUrl) errors.push("Canonical media manifest URL is required");
  if (!Array.isArray(place.remoteExperience?.models) || place.remoteExperience.models.length === 0) {
    errors.push("At least one remote 3D model is required");
  }
  return errors;
}
