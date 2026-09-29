export const GEO_LANGUAGES = Object.freeze(["fr", "en", "ar"]);
export const GEO_PERFORMANCE_PROFILES = Object.freeze([
  "desktop",
  "mobile",
  "quest",
  "quest-low",
  "quest-webp",
]);

export function selectPerformanceProfile(signals = {}) {
  if (GEO_PERFORMANCE_PROFILES.includes(signals.forcedProfile)) return signals.forcedProfile;

  const deviceMemory = Number(signals.deviceMemory) || 0;
  const hardwareConcurrency = Number(signals.hardwareConcurrency) || 0;
  const maxTextureSize = Number(signals.maxTextureSize) || 0;
  const viewportWidth = Number(signals.viewportWidth) || 0;
  const constrainedForXr = signals.coarsePointer
    || (deviceMemory > 0 && deviceMemory <= 8)
    || (maxTextureSize > 0 && maxTextureSize <= 8192);

  if (signals.immersiveVr && constrainedForXr) return "quest";

  const constrained = signals.saveData
    || signals.coarsePointer
    || (viewportWidth > 0 && viewportWidth < 900)
    || (deviceMemory > 0 && deviceMemory < 6)
    || (hardwareConcurrency > 0 && hardwareConcurrency < 6)
    || (maxTextureSize > 0 && maxTextureSize < 8192);
  return constrained ? "mobile" : "desktop";
}

export function modelVariantCandidates(model, profile) {
  if (!model?.path) return [];
  const variants = new Map((model.variants || []).map((variant) => [variant.id, variant]));
  const orders = {
    desktop: ["desktop", "mobile", "quest-webp", "quest"],
    mobile: ["mobile", "quest-webp", "quest"],
    quest: ["quest", "quest-low", "quest-webp"],
    "quest-low": ["quest-low", "quest-webp"],
    "quest-webp": ["quest-webp"],
  };
  const configuredOrder = model.profileOrders?.[profile];
  const requestedOrder = Array.isArray(configuredOrder) ? configuredOrder : (orders[profile] || orders.mobile);
  const candidates = requestedOrder
    .map((id) => variants.get(id))
    .filter(Boolean)
    .map((variant) => {
      const path = typeof variant.path === "string" ? variant.path.trim() : "";
      const remotePath = typeof variant.remotePath === "string" ? variant.remotePath.trim() : "";
      if (!path && !remotePath) return null;
      return {
        id: variant.id,
        path,
        remoteUrl: remotePath ? remoteAssetUrl(model.remoteBaseUrl, remotePath) : "",
        source: remotePath ? "r2" : "project",
      };
    })
    .filter(Boolean);
  candidates.push({ id: "original", path: model.path, remoteUrl: "", source: "project" });
  return candidates.filter((candidate, index, all) => (
    all.findIndex((other) => (other.remoteUrl || other.path) === (candidate.remoteUrl || candidate.path)) === index
  ));
}

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

export function remoteAssetUrl(baseUrl, path) {
  if (typeof baseUrl !== "string" || !baseUrl.trim()) throw new TypeError("Remote asset base URL is required");
  if (typeof path !== "string" || !path.trim()) throw new TypeError("Remote asset path is required");
  if (/^[a-z][a-z\d+.-]*:/i.test(path) || path.startsWith("//") || path.includes("\\")) {
    throw new TypeError("Remote asset paths must be relative");
  }
  const cleanPath = path.replace(/^\/+/, "");
  if (cleanPath.split("/").some((segment) => !segment || segment === "." || segment === "..")) {
    throw new TypeError("Remote asset path contains an invalid segment");
  }
  const base = new URL(baseUrl);
  if (base.protocol !== "https:" || !base.pathname.endsWith("/")) {
    throw new TypeError("Remote asset base URL must be HTTPS and end with a slash");
  }
  const resolved = new URL(cleanPath, base);
  if (resolved.origin !== base.origin || !resolved.pathname.startsWith(base.pathname)) {
    throw new TypeError("Remote asset path escapes its configured base URL");
  }
  return resolved.href;
}

export function modelCandidateUrl(candidate, moduleUrl) {
  if (candidate?.remoteUrl) {
    const remote = new URL(candidate.remoteUrl);
    if (remote.protocol !== "https:") throw new TypeError("Remote model candidates must use HTTPS");
    return remote.href;
  }
  return projectAssetUrl(candidate?.path, moduleUrl);
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

    models.forEach((model, modelIndex) => {
      if (!model?.path) errors.push(`remoteExperience.models[${modelIndex}].path is required`);
      if (model?.remoteBaseUrl !== undefined) {
        try {
          remoteAssetUrl(model.remoteBaseUrl, "probe.glb");
        } catch {
          errors.push(`remoteExperience.models[${modelIndex}].remoteBaseUrl is invalid`);
        }
      }
      if (model?.variants !== undefined) {
        if (!Array.isArray(model.variants)) {
          errors.push(`remoteExperience.models[${modelIndex}].variants must be an array`);
        } else {
          const variantIds = new Set(model.variants.map((variant) => variant?.id).filter(Boolean));
          if (variantIds.size !== model.variants.length) {
            errors.push(`remoteExperience.models[${modelIndex}].variant ids must be unique and present`);
          }
          model.variants.forEach((variant, variantIndex) => {
            const prefix = `remoteExperience.models[${modelIndex}].variants[${variantIndex}]`;
            if (!GEO_PERFORMANCE_PROFILES.includes(variant?.id)) errors.push(`${prefix}.id is invalid`);
            const hasPath = typeof variant?.path === "string" && Boolean(variant.path.trim());
            const hasRemotePath = typeof variant?.remotePath === "string" && Boolean(variant.remotePath.trim());
            if (hasPath === hasRemotePath) errors.push(`${prefix} must define exactly one of path or remotePath`);
            if (hasRemotePath) {
              try {
                remoteAssetUrl(model.remoteBaseUrl, variant.remotePath);
              } catch {
                errors.push(`${prefix}.remotePath is invalid`);
              }
            }
            if (!new Set(["experimental", "validated"]).has(variant?.status)) {
              errors.push(`${prefix}.status is invalid`);
            }
            if (variant?.status === "validated") {
              if (!/^[a-f\d]{64}$/i.test(variant.sha256 || "")) errors.push(`${prefix}.sha256 is required`);
              if (!Number.isInteger(variant.bytes) || variant.bytes <= 0) errors.push(`${prefix}.bytes is required`);
            }
          });
          if (model.profileOrders !== undefined) {
            if (!model.profileOrders || typeof model.profileOrders !== "object" || Array.isArray(model.profileOrders)) {
              errors.push(`remoteExperience.models[${modelIndex}].profileOrders must be an object`);
            } else {
              for (const [profile, order] of Object.entries(model.profileOrders)) {
                const prefix = `remoteExperience.models[${modelIndex}].profileOrders.${profile}`;
                if (!GEO_PERFORMANCE_PROFILES.includes(profile)) errors.push(`${prefix} is not a supported profile`);
                if (!Array.isArray(order) || order.length === 0) {
                  errors.push(`${prefix} must be a non-empty array`);
                  continue;
                }
                if (new Set(order).size !== order.length) errors.push(`${prefix} must not contain duplicates`);
                for (const variantId of order) {
                  if (!variantIds.has(variantId)) errors.push(`${prefix} references an unavailable variant`);
                }
              }
            }
          }
        }
      }
    });

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
