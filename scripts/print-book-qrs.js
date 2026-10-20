const root = document.getElementById("qr-book");

const esc = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

async function loadArtwork(artwork) {
  const manifestPath = `content/media-manifests/${artwork.manifest.path}`;
  const response = await fetch(manifestPath, { cache: "no-store", credentials: "omit" });
  if (!response.ok) throw new Error(`Manifest ${artwork.id}: HTTP ${response.status}`);
  const manifest = await response.json();
  if (manifest.id !== artwork.id) throw new Error(`Manifest identity mismatch: ${artwork.id}`);
  const url = new URL(manifest.pageUrl);
  if (url.protocol !== "https:" || url.hostname !== "artdaci.com") {
    throw new Error(`Invalid official destination: ${manifest.pageUrl}`);
  }
  return { ...artwork, manifest };
}

async function render() {
  const catalogResponse = await fetch("content/media-manifests/catalog.json", { cache: "no-store", credentials: "omit" });
  if (!catalogResponse.ok) throw new Error(`Catalog: HTTP ${catalogResponse.status}`);
  const catalog = await catalogResponse.json();
  const active = catalog.artworks.filter((artwork) => artwork.status === "active");
  if (active.length !== 24) throw new Error(`Expected 24 active artworks, found ${active.length}`);
  const artworks = await Promise.all(active.map(loadArtwork));

  root.innerHTML = catalog.artists.map((artist) => {
    const works = artworks.filter((artwork) => artwork.artistId === artist.id);
    return `<section class="artist-sheet" data-artist="${esc(artist.id)}">
      <header>
        <p>${esc(artist.name.en)}</p>
        <h2>${esc(artist.name.fr)}</h2>
      </header>
      <div class="qr-grid">
        ${works.map((artwork) => `<article class="artwork-qr" data-artwork-id="${esc(artwork.id)}">
          <a href="${esc(artwork.manifest.pageUrl)}">
            <img src="assets/qr/artworks/${esc(artwork.id)}.png" alt="QR code for ${esc(artwork.title.en)}" />
          </a>
          <div>
            <span>${esc(artwork.id.toUpperCase())}</span>
            <h3>${esc(artwork.title.en)}</h3>
            <p lang="fr">${esc(artwork.title.fr)}</p>
            <code>${esc(artwork.manifest.pageUrl)}</code>
          </div>
        </article>`).join("")}
      </div>
    </section>`;
  }).join("");
}

render().catch((error) => {
  root.dataset.error = "true";
  root.innerHTML = `<p class="error">QR control sheet unavailable: ${esc(error.message)}</p>`;
});
