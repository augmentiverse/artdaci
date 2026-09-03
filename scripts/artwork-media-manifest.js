import {
  normalizeLanguage,
  resolveMediaAsset,
  selectMediaAsset,
} from "./artwork-media-manifest-core.mjs";

const manifestRequests = new Map();
const audioLinkStates = new WeakMap();

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
      const localImageUrl = element.tagName === "IMG" && attribute === "src"
        ? element.getAttribute(attribute)
        : null;
      const existingAudioLinkState = audioLinkStates.get(element);
      const localAudioUrl = element.tagName === "A" && attribute === "href" && asset.mimeType?.startsWith("audio/")
        ? existingAudioLinkState?.localUrl || element.getAttribute(attribute)
        : null;
      const localImageFailed = Boolean(localImageUrl) && element.complete && element.naturalWidth === 0;

      if (localImageUrl && localImageUrl !== mediaUrl) {
        const restoreLocalImage = () => {
          element.removeEventListener("load", keepRemoteImage);
          if (!localImageFailed && element.getAttribute(attribute) === mediaUrl) {
            element.setAttribute(attribute, localImageUrl);
          }
        };
        const keepRemoteImage = () => {
          element.removeEventListener("error", restoreLocalImage);
        };

        element.addEventListener("error", restoreLocalImage, { once: true });
        element.addEventListener("load", keepRemoteImage, { once: true });
      }

      const assignedUrl = localAudioUrl && localAudioUrl !== mediaUrl
        ? prepareAudioLinkFallback(element, attribute, localAudioUrl, mediaUrl)
        : mediaUrl;
      element.setAttribute(attribute, assignedUrl);

      if (asset.mimeType && element.tagName === "SOURCE") {
        element.setAttribute("type", asset.mimeType);
      }
    } catch (error) {
      console.warn(`Artwork media unavailable: ${mediaKey}`, error);
    }
  });
}

function prepareAudioLinkFallback(element, attribute, localUrl, remoteUrl) {
  let state = audioLinkStates.get(element);

  if (!state) {
    state = {
      attribute,
      localUrl,
      remoteUrl,
      status: "unverified",
      pending: false,
    };

    element.addEventListener("click", (event) => {
      if (!shouldVerifyAudioLink(event, element) || state.status !== "unverified") return;

      event.preventDefault();
      if (state.pending) return;
      state.pending = true;

      return verifyRemoteAudio(state.remoteUrl)
        .then((available) => {
          const destination = available ? state.remoteUrl : state.localUrl;
          state.status = available ? "remote" : "local";
          element.setAttribute(state.attribute, destination);
          window.location.assign(destination);
        })
        .catch((error) => {
          console.warn("Artwork audio navigation failed", error);
        })
        .finally(() => {
          state.pending = false;
        });
    });

    audioLinkStates.set(element, state);
  } else if (state.remoteUrl !== remoteUrl) {
    state.attribute = attribute;
    state.remoteUrl = remoteUrl;
    state.status = "unverified";
  }

  return state.status === "local" ? state.localUrl : remoteUrl;
}

function shouldVerifyAudioLink(event, element) {
  const target = (element.getAttribute("target") || "").toLowerCase();
  return event.isTrusted !== false &&
    !event.defaultPrevented &&
    (event.button ?? 0) === 0 &&
    !event.altKey &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.shiftKey &&
    !element.hasAttribute("download") &&
    (!target || target === "_self");
}

async function verifyRemoteAudio(url) {
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { Range: "bytes=0-0" },
      cache: "no-store",
      credentials: "omit",
      mode: "cors",
    });
    const contentType = response.headers?.get("content-type");

    try {
      await response.body?.cancel();
    } catch {
      // The response status is sufficient; cancellation is only best-effort.
    }

    return (response.status === 200 || response.status === 206) &&
      (!contentType || contentType.toLowerCase().startsWith("audio/"));
  } catch {
    return false;
  }
}

function defaultMediaAttribute(element) {
  if (element.tagName === "A") return "href";
  if (element.tagName === "OBJECT") return "data";
  return "src";
}
