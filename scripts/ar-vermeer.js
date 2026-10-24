/**
 * ARTDACI Vermeer six-image route. The exact target order is defined in
 * content/ar-groups/vermeer.json and compiled into vermeer-six.mind.
 */
import * as THREE from "/vendor/three.module.js";
import { MindARThree } from "/vendor/mindar-image-three.prod.js";

const $ = (id) => document.getElementById(id);
const state = { mindar: null, running: false, artwork: null, resources: [] };
const group = await fetch("/content/ar-groups/vermeer.json", {
  cache: "no-store",
  credentials: "same-origin",
}).then(async (response) => {
  if (!response.ok) throw new Error(`Catalogue inaccessible (HTTP ${response.status})`);
  return response.json();
});

if (group.artworks.length !== 6 || group.artworks.some((artwork, index) => artwork.targetIndex !== index)) {
  throw new Error("Ordre des six cibles incorrect dans le manifeste Vermeer.");
}

const asNode = (tag, text, cssClass = "") => {
  const node = document.createElement(tag);
  node.textContent = text;
  if (cssClass) node.className = cssClass;
  return node;
};

for (const artwork of group.artworks) {
  const card = document.createElement("article");
  card.className = "artwork";
  const image = document.createElement("img");
  image.src = artwork.targetSource;
  image.alt = artwork.title;
  image.loading = "lazy";
  image.decoding = "async";
  card.append(image);
  const detail = document.createElement("div");
  detail.append(asNode("small", artwork.id.toUpperCase()), asNode("h3", artwork.title));
  detail.append(asNode("small", artwork.experience === "image-ar" ? "Expérience AR 3D existante" : "Reconnaissance d’image + fiche numérique"));
  const link = asNode("a", artwork.experience === "image-ar" ? "Ouvrir l’AR individuelle" : "Ouvrir la notice");
  link.href = artwork.url;
  detail.append(link);
  card.append(detail);
  $("artwork-grid").append(card);
}

function makeLabelTexture(artwork) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 236;
  const context = canvas.getContext("2d");
  context.fillStyle = "#102638";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#d7b56d";
  context.fillRect(0, 0, canvas.width, 11);
  context.fillStyle = "#e5c67e";
  context.font = "bold 38px sans-serif";
  context.fillText("ARTDACI · VERMEER", 37, 71);
  context.fillStyle = "#ffffff";
  context.font = "bold 58px Georgia,serif";
  context.fillText(artwork.title, 37, 148, 954);
  context.fillStyle = "#cad1d7";
  context.font = "29px sans-serif";
  context.fillText("Image reconnue · découvrir la notice sur le téléphone", 37, 209);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function showArtwork(artwork) {
  state.artwork = artwork;
  $("recognized").hidden = false;
  $("recognized-title").textContent = artwork.title;
  $("recognized-description").textContent = artwork.experience === "image-ar"
    ? "La reconnaissance a réussi. L’expérience AR 3D complète existe également pour cette œuvre."
    : "La reconnaissance AR est active. La notice numérique correspondante est disponible, mais aucun modèle 3D dédié n’est encore publié.";
  $("recognized-link").href = artwork.url;
  $("recognized-link").textContent = artwork.experience === "image-ar" ? "Ouvrir l’AR individuelle" : "Ouvrir la notice";
  $("scan-state").textContent = `Image reconnue : ${artwork.title}`;
}

function disposeResources() {
  for (const { geometry, material, texture } of state.resources) {
    geometry.dispose();
    material.dispose();
    texture.dispose();
  }
  state.resources = [];
}

async function stopAR() {
  if (!state.running && !state.mindar) return;
  try {
    state.mindar?.renderer?.setAnimationLoop(null);
    await state.mindar?.stop();
  } finally {
    disposeResources();
    state.mindar = null;
    state.running = false;
    state.artwork = null;
    $("viewer").hidden = true;
    $("recognized").hidden = true;
    $("intro").hidden = false;
    $("ar-root").replaceChildren();
    $("scan-state").textContent = "Pointez la caméra vers une œuvre.";
  }
}

$("stop").addEventListener("click", () => { void stopAR(); });
window.addEventListener("pagehide", () => { void stopAR(); }, { once: true });

$("start").addEventListener("click", async () => {
  if (state.running || state.mindar) return;
  if (!window.isSecureContext) {
    $("readiness").textContent = "La caméra exige HTTPS (ou localhost).";
    return;
  }
  if (!navigator.mediaDevices?.getUserMedia) {
    $("readiness").textContent = "Caméra indisponible sur ce navigateur.";
    return;
  }

  $("start").disabled = true;
  $("viewer").hidden = false;
  $("intro").hidden = true;
  $("scan-state").textContent = "Chargement des six cibles et ouverture de la caméra…";
  try {
    const mindar = new MindARThree({
      container: $("ar-root"),
      imageTargetSrc: group.compiledTargets,
      maxTrack: 1,
    });
    state.mindar = mindar;
    const { renderer, scene, camera } = mindar;
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.8));
    scene.add(new THREE.HemisphereLight(0xffffff, 0x8da5c3, 1.3));

    for (const artwork of group.artworks) {
      const anchor = mindar.addAnchor(artwork.targetIndex);
      const texture = makeLabelTexture(artwork);
      const geometry = new THREE.PlaneGeometry(0.95, 0.22);
      const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
      const card = new THREE.Mesh(geometry, material);
      const ratio = await new Promise((resolve) => {
        const image = new Image();
        image.onload = () => resolve(image.height / image.width);
        image.onerror = () => resolve(1);
        image.src = artwork.targetSource;
      });
      card.position.set(0, -(ratio / 2 + 0.16), 0.04);
      anchor.group.add(card);
      state.resources.push({ geometry, material, texture });
      anchor.onTargetFound = () => showArtwork(artwork);
      anchor.onTargetLost = () => {
        if (state.artwork?.id !== artwork.id) return;
        state.artwork = null;
        $("recognized").hidden = true;
        $("scan-state").textContent = "Image perdue · visez un autre tableau.";
      };
    }

    await mindar.start();
    state.running = true;
    $("scan-state").textContent = "Caméra prête · dirigez-la vers une reproduction.";
    renderer.setAnimationLoop(() => renderer.render(scene, camera));
  } catch (error) {
    await stopAR();
    $("readiness").textContent = `Impossible de démarrer : ${error.message || error}`;
  } finally {
    $("start").disabled = false;
  }
});
