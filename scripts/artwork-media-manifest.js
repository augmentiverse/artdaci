document.querySelectorAll("[data-artwork-media-manifest]").forEach((root) => {
  loadArtworkMedia(root);
});

async function loadArtworkMedia(root) {
  const manifestUrl = root.dataset.artworkMediaManifest;
  if (!manifestUrl) return;

  try {
    const response = await fetch(manifestUrl);
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);

    const manifest = await response.json();
    const mainImage = resolveAvailableMedia(manifest.mediaBaseUrl, manifest.media?.images?.main);
    if (!mainImage) return;

    root.querySelectorAll('[data-artwork-media="images.main"]').forEach((image) => {
      image.src = mainImage;
    });
  } catch (error) {
    console.warn(`Artwork media manifest unavailable: ${manifestUrl}`, error);
  }
}

function resolveAvailableMedia(mediaBaseUrl, media) {
  if (!mediaBaseUrl || media?.available !== true || !media.path) return null;

  const baseUrl = mediaBaseUrl.endsWith("/") ? mediaBaseUrl : `${mediaBaseUrl}/`;
  const url = new URL(media.path, baseUrl);
  return ["http:", "https:"].includes(url.protocol) ? url.href : null;
}
