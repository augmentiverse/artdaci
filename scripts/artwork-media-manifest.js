import {
  normalizeLanguage,
  resolveMediaAsset,
  selectMediaAsset,
} from "./artwork-media-manifest-core.mjs";

const manifestRequests = new Map();

document.querySelectorAll("[data-artwork-media-manifest]").forEach((root) => {
  loadArtworkMedia(root);
});

export async function loadArtworkMedia(root) {
  const manifestUrl = root.dataset.artworkMediaManifest;
  if (!manifestUrl) return;

  try {
    const manifest = await fetchArtworkManifest(manifestUrl);
    applyArtworkMedia(root, manifest);
  } catch (error) {
    console.warn(`Artwork media manifest unavailable: ${manifestUrl}`, error);
  }
}

export function fetchArtworkManifest(manifestUrl) {
  if (!manifestRequests.has(manifestUrl)) {
    const request = fetch(manifestUrl, {
      cache: "no-store",
      credentials: "omit",
    })
      .then((response) => {
        if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
        return response.json();
      })
      .catch((error) => {
        manifestRequests.delete(manifestUrl);
        throw error;
      });

    manifestRequests.set(manifestUrl, request);
  }

  return manifestRequests.get(manifestUrl);
}

export function applyArtworkMedia(root, manifest) {
  root.querySelectorAll("[data-artwork-media]").forEach((element) => {
    const mediaKey = element.dataset.artworkMedia;
    const language = normalizeLanguage(
      element.dataset.artworkMediaLang ||
        root.dataset.artworkMediaLang ||
        document.documentElement.lang ||
        manifest.defaultLanguage,
    );

    try {
      const asset = selectMediaAsset(manifest, mediaKey, language);
      const mediaUrl = resolveMediaAsset(manifest, asset);
      if (!mediaUrl) return;

      const attribute = element.dataset.artworkMediaAttribute || defaultMediaAttribute(element);
      element.setAttribute(attribute, mediaUrl);

      if (asset.mimeType && element.tagName === "SOURCE") {
        element.setAttribute("type", asset.mimeType);
      }
    } catch (error) {
      console.warn(`Artwork media unavailable: ${mediaKey}`, error);
    }
  });
}

function defaultMediaAttribute(element) {
  if (element.tagName === "A") return "href";
  if (element.tagName === "OBJECT") return "data";
  return "src";
}
