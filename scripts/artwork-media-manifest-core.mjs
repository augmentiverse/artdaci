const SUPPORTED_PROTOCOLS = new Set(["http:", "https:"]);

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
}

export function normalizeLanguage(language) {
  if (typeof language !== "string") return "";
  return language.trim().replaceAll("_", "-").toLowerCase();
}

export function isMediaAsset(value) {
  return isRecord(value) && (hasOwn(value, "path") || hasOwn(value, "available"));
}

function languageCandidates(language, defaultLanguage) {
  const candidates = [];

  for (const value of [language, defaultLanguage]) {
    const normalized = normalizeLanguage(value);
    if (!normalized) continue;

    for (const candidate of [normalized, normalized.split("-")[0]]) {
      if (candidate && !candidates.includes(candidate)) candidates.push(candidate);
    }
  }

  return candidates;
}

function mediaNodeAtPath(manifest, mediaKey) {
  if (!isRecord(manifest?.media) || typeof mediaKey !== "string" || !mediaKey.trim()) {
    return null;
  }

  let current = manifest.media;
  for (const segment of mediaKey.split(".")) {
    if (!segment || !isRecord(current) || !hasOwn(current, segment)) return null;
    current = current[segment];
  }

  return current;
}

export function selectMediaAsset(manifest, mediaKey, language) {
  const node = mediaNodeAtPath(manifest, mediaKey);
  if (isMediaAsset(node)) return node;
  if (!isRecord(node)) return null;

  for (const candidate of languageCandidates(language, manifest?.defaultLanguage)) {
    if (!hasOwn(node, candidate)) continue;
    return isMediaAsset(node[candidate]) ? node[candidate] : null;
  }

  return null;
}

function normalizeBaseUrl(value, label) {
  if (typeof value !== "string" || !value.trim()) {
    throw new TypeError(`${label} is required`);
  }

  const base = new URL(value.endsWith("/") ? value : `${value}/`);
  if (!SUPPORTED_PROTOCOLS.has(base.protocol)) {
    throw new TypeError(`${label} must use HTTP or HTTPS`);
  }
  if (base.username || base.password) {
    throw new TypeError(`${label} must not contain credentials`);
  }
  if (base.search || base.hash) {
    throw new TypeError(`${label} must not contain a query or fragment`);
  }

  return base;
}

function validateRelativePath(path) {
  if (typeof path !== "string" || !path.trim()) {
    throw new TypeError("Media path is required");
  }
  if (path.startsWith("/") || path.includes("\\") || path.includes(":") || path.includes("%")) {
    throw new TypeError("Media path must be a plain relative path");
  }

  const segments = path.split("/");
  if (segments.some((segment) => !segment || segment === "." || segment === "..")) {
    throw new TypeError("Media path contains an invalid segment");
  }
}

export function resolveMediaAsset(manifest, asset) {
  if (!isMediaAsset(asset)) return null;
  if (asset.available === false) return null;
  if (asset.available !== true) {
    throw new TypeError("Media availability must be a boolean");
  }

  validateRelativePath(asset.path);

  const scope = asset.scope ?? "artwork";
  if (!new Set(["artwork", "shared"]).has(scope)) {
    throw new TypeError(`Unsupported media scope: ${scope}`);
  }

  const baseLabel = scope === "shared" ? "sharedMediaBaseUrl" : "mediaBaseUrl";
  const base = normalizeBaseUrl(manifest?.[baseLabel], baseLabel);
  const resolved = new URL(asset.path, base);

  if (!resolved.href.startsWith(base.href)) {
    throw new TypeError("Resolved media URL escapes its configured base");
  }

  return resolved.href;
}

export function resolveManifestMedia(manifest, mediaKey, language) {
  const asset = selectMediaAsset(manifest, mediaKey, language);
  return resolveMediaAsset(manifest, asset);
}

export function resolveAvailableMedia(mediaBaseUrl, media, sharedMediaBaseUrl) {
  return resolveMediaAsset({ mediaBaseUrl, sharedMediaBaseUrl }, media);
}
