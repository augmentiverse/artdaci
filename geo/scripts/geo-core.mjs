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

export function validatePointOfInterest(point, context = {}) {
  const errors = [];
  const prefix = context.prefix || "pointOfInterest";
  const modelIds = context.modelIds || new Set();
  const routeIds = context.routeIds || new Set();
  const contentIds = context.contentIds || new Set();

  if (!point?.id) errors.push(`${prefix}.id is required`);
  if (!new Set(["place", "artwork", "character"]).has(point?.type)) {
    errors.push(`${prefix}.type is invalid`);
  }
  if (!point?.modelId || !modelIds.has(point.modelId)) {
    errors.push(`${prefix}.modelId must reference a remote model`);
  }
  if (point?.type === "artwork" && !/^[a-z]{2}\d{2}$/.test(point.artworkId || "")) {
    errors.push(`${prefix}.artworkId must be canonical for artwork POIs`);
  }

  for (const language of GEO_LANGUAGES) {
    if (!point?.content?.title?.[language]) errors.push(`${prefix}.content.title.${language} is required`);
    if (!point?.content?.description?.[language]) errors.push(`${prefix}.content.description.${language} is required`);
  }

  const position = point?.position;
  if (!position || typeof position !== "object" || Array.isArray(position)) {
    errors.push(`${prefix}.position is required`);
  } else {
    if (position.coordinateSpace !== "louvre-model-local") {
      errors.push(`${prefix}.position.coordinateSpace must be louvre-model-local`);
    }
    if (!position.calibrationStatus) errors.push(`${prefix}.position.calibrationStatus is required`);
    for (const axis of ["x", "y", "z"]) {
      if (!(position[axis] === null || Number.isFinite(position[axis]))) {
        errors.push(`${prefix}.position.${axis} must be a number or null`);
      }
    }
  }

  const audio = point?.content?.audio;
  if (audio !== null && audio !== undefined) {
    if (audio.source !== "linked-content" || !contentIds.has(audio.contentArtworkId)) {
      errors.push(`${prefix}.content.audio must reference linked ARTDACI content`);
    }
  }

  if (!Array.isArray(point?.actions)) {
    errors.push(`${prefix}.actions must be an array`);
  } else {
    point.actions.forEach((action, actionIndex) => {
      if (action?.type !== "route" || !routeIds.has(action.routeId)) {
        errors.push(`${prefix}.actions[${actionIndex}] must reference a remote route`);
      }
      for (const language of GEO_LANGUAGES) {
        if (!action?.label?.[language]) errors.push(`${prefix}.actions[${actionIndex}].label.${language} is required`);
      }
    });
  }
  return errors;
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
  const models = place.remoteExperience?.models;
  if (!Array.isArray(models) || models.length === 0) {
    errors.push("At least one remote 3D model is required");
  } else {
    const modelIds = new Set(models.map((model) => model?.id).filter(Boolean));
    if (modelIds.size !== models.length) errors.push("Remote 3D model ids must be unique and present");
    if (!modelIds.has(place.remoteExperience.defaultModelId)) {
      errors.push("Default remote 3D model must reference an available model");
    }

    const points = place.pointsOfInterest;
    if (!Array.isArray(points) || points.length === 0) {
      errors.push("At least one point of interest is required");
    } else {
      const pointIds = new Set(points.map((point) => point?.id).filter(Boolean));
      if (pointIds.size !== points.length) errors.push("Point of interest ids must be unique and present");
      if (!pointIds.has(place.remoteExperience.defaultPointOfInterestId)) {
        errors.push("Default point of interest must reference an available point");
      }
      const context = {
        modelIds,
        routeIds: new Set(Object.keys(place.remoteExperience.routes || {})),
        contentIds: new Set((place.contents || []).map((content) => content?.artworkId).filter(Boolean)),
      };
      points.forEach((point, index) => {
        errors.push(...validatePointOfInterest(point, { ...context, prefix: `pointsOfInterest[${index}]` }));
      });
    }
  }
  return errors;
}
