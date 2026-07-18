const PAINTINGS = {
  "mona-lisa": "content/paintings/mona-lisa.json",
  "van-gogh": "content/paintings/van-gogh.json",
  "van-gogh-bedroom": "content/paintings/van-gogh-bedroom.json"
};

const COPY = {
  en: {
    back: "Back",
    kicker: "Room Placement",
    loading: "Loading model...",
    ready: "Model ready. Tap Place in My Space to position it in your room.",
    readyWithUsdz: "Model ready. Tap Place in My Space. iPhone/iPad will use USDZ; Android will use Scene Viewer.",
    readyWithoutUsdz: "Model ready. Android and WebXR-compatible devices can use spatial AR. iPhone/iPad needs a USDZ file for this artwork.",
    fallbackTitle: "3D preview unavailable",
    fallbackBody: "The room-placement viewer library did not load. You can still open the printed page, image AR, or listen to the audio overview.",
    audioOverview: "Audio overview",
    audioOverviewPause: "Pause overview",
    audioOverviewMissing: "Audio overview unavailable",
    downloadUsdz: "Download USDZ",
    place: "Place in My Space",
    imageAr: "Image AR",
    printedPage: "Printed Page",
    modelChoice: "Model choice",
    unsupported: "This browser can preview the 3D model, but may not support room-scale AR placement.",
    iosNote: "Spatial AR is available when the model has a compatible AR file for this device.",
    intro: "Place the 3D model in your space, then move, rotate, and scale it with your device's AR controls."
  },
  fr: {
    back: "Retour",
    kicker: "Placement dans l'espace",
    loading: "Chargement du modèle...",
    ready: "Modèle prêt. Touchez Placer dans mon espace pour le positionner dans votre pièce.",
    readyWithUsdz: "Modèle prêt. Touchez Placer dans mon espace. iPhone/iPad utilisera USDZ; Android utilisera Scene Viewer.",
    readyWithoutUsdz: "Modèle prêt. Android et les appareils WebXR compatibles peuvent utiliser l'AR spatiale. iPhone/iPad nécessite un fichier USDZ pour cette œuvre.",
    fallbackTitle: "Aperçu 3D indisponible",
    fallbackBody: "La bibliothèque de placement dans l'espace ne s'est pas chargée. Vous pouvez tout de même ouvrir la page imprimée, l'AR image ou écouter l'aperçu audio.",
    audioOverview: "Aperçu audio",
    audioOverviewPause: "Mettre en pause",
    audioOverviewMissing: "Aperçu audio indisponible",
    downloadUsdz: "Télécharger USDZ",
    place: "Placer dans mon espace",
    imageAr: "AR sur image",
    printedPage: "Page imprimée",
    modelChoice: "Choix du modèle",
    unsupported: "Ce navigateur peut afficher le modèle 3D, mais il peut ne pas prendre en charge le placement AR dans l'espace.",
    iosNote: "L'AR spatiale est disponible lorsque le modèle possède un fichier AR compatible avec cet appareil.",
    intro: "Placez le modèle 3D dans votre espace, puis déplacez-le, tournez-le et redimensionnez-le avec les contrôles AR de votre appareil."
  }
};

const PRINT_PAGES = {
  en: {
    "mona-lisa": "print-target.html",
    "van-gogh": "print-van-gogh.html",
    "van-gogh-bedroom": "print-van-gogh-bedroom.html"
  },
  fr: {
    "mona-lisa": "print-target-fr.html",
    "van-gogh": "print-van-gogh-fr.html",
    "van-gogh-bedroom": "print-van-gogh-bedroom-fr.html"
  }
};

const params = new URLSearchParams(window.location.search);
const slug = PAINTINGS[params.get("painting")] ? params.get("painting") : "mona-lisa";
const lang = params.get("lang") === "fr" ? "fr" : "en";

init();

async function init() {
  document.documentElement.lang = lang;
  applyStaticCopy();

  try {
    const response = await fetch(PAINTINGS[slug], { cache: "reload" });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    const manifest = await response.json();
    configureViewer(manifest);
  } catch (error) {
    document.getElementById("space-status").textContent = `${COPY[lang].unsupported} ${error.message}`;
  }
}

function applyStaticCopy() {
  const text = COPY[lang];
  document.getElementById("back-link").textContent = text.back;
  document.getElementById("back-link").href = lang === "fr" ? "index-fr.html" : "index.html";
  document.getElementById("space-kicker").textContent = text.kicker;
  document.getElementById("space-copy").textContent = text.intro;
  document.getElementById("space-status").textContent = text.loading;
  document.getElementById("ar-button").textContent = text.place;
  document.getElementById("image-ar-link").textContent = text.imageAr;
  document.getElementById("print-link").textContent = text.printedPage;
  document.getElementById("ios-note").textContent = text.iosNote;
}

function configureViewer(manifest) {
  const model = document.getElementById("space-model");
  const title = manifest.title || "Artwork";
  const modelVariants = getModelVariants(manifest);
  const src = modelVariants[0]?.src || manifest.ar?.primaryModel || manifest.media?.model;
  const poster = manifest.media?.image || manifest.print?.imageTargetSource;
  const usdz = manifest.media?.usdz || manifest.media?.usdzModel;
  const audioOverview = getLocalizedAudioOverview(manifest);

  document.title = `DACIART - ${title} - ${COPY[lang].kicker}`;
  document.getElementById("space-title").textContent = lang === "fr" && slug === "van-gogh-bedroom" ? "La Chambre" : title;

  model.setAttribute("src", src);
  model.alt = `${title} 3D model`;
  if (poster) model.poster = poster;
  if (usdz) {
    model.setAttribute("ios-src", usdz);
    document.getElementById("space-status").textContent = COPY[lang].readyWithUsdz;
  } else {
    document.getElementById("ios-note").hidden = false;
    document.getElementById("space-status").textContent = COPY[lang].readyWithoutUsdz;
  }

  document.getElementById("image-ar-link").href = `ar.html?painting=${slug}&lang=${lang}`;
  document.getElementById("print-link").href = PRINT_PAGES[lang]?.[slug] || "index.html";
  renderModelVariantControls(model, modelVariants);
  renderDirectAssetLinks(usdz, audioOverview);
  checkModelViewerAvailability(usdz, audioOverview);
  model.addEventListener("ar-status", (event) => {
    if (event.detail.status === "failed") {
      document.getElementById("space-status").textContent = COPY[lang].unsupported;
    }
  });
}

function getModelVariants(manifest) {
  const variants = manifest.ar?.modelVariants || manifest.media?.modelVariants || [];
  const list = Array.isArray(variants) ? variants : [];
  if (list.length) return list.filter((variant) => variant?.src);

  const fallback = manifest.ar?.primaryModel || manifest.media?.model;
  return fallback
    ? [{ id: "model-1", label: { en: "Model 1", fr: "Modèle 1" }, src: fallback }]
    : [];
}

function getModelVariantLabel(variant, index) {
  if (typeof variant.label === "string") return variant.label;
  return variant.label?.[lang] || variant.label?.en || `Model ${index + 1}`;
}

function renderModelVariantControls(model, variants) {
  if (variants.length < 2) return;

  const actions = document.querySelector(".space-panel .actions");
  if (!actions) return;

  const group = document.createElement("div");
  group.className = "model-variant-group";
  group.setAttribute("role", "group");
  group.setAttribute("aria-label", COPY[lang].modelChoice || COPY.en.modelChoice);

  variants.forEach((variant, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `button model-variant${index === 0 ? " active" : ""}`;
    button.textContent = getModelVariantLabel(variant, index);
    button.addEventListener("click", () => {
      model.setAttribute("src", variant.src);
      group.querySelectorAll(".model-variant").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
    });
    group.appendChild(button);
  });

  actions.appendChild(group);
}

function getLocalizedAudioOverview(manifest) {
  const overviews = manifest.media?.audioOverviews || manifest.media?.audioOverview || [];
  const list = Array.isArray(overviews) ? overviews : [overviews];
  return list.find((item) => item.lang === lang) || list.find((item) => item.lang === "en") || list[0] || null;
}

function renderDirectAssetLinks(usdz, audioOverview) {
  const actions = document.querySelector(".space-panel .actions");
  if (!actions) return;

  actions.insertAdjacentHTML("beforeend", `
    <button id="audio-overview-button" class="button" type="button">${audioOverview ? COPY[lang].audioOverview : COPY[lang].audioOverviewMissing}</button>
    ${usdz ? `<a class="button" href="${usdz}" rel="ar">${COPY[lang].downloadUsdz}</a>` : ""}
  `);
  bindAudioOverview(audioOverview);
}

function bindAudioOverview(audioOverview) {
  const button = document.getElementById("audio-overview-button");
  const panel = document.querySelector(".space-panel");
  if (!button || !panel) return;

  if (!audioOverview?.src) {
    button.disabled = true;
    return;
  }

  const player = document.createElement("audio");
  player.id = "audio-overview-player";
  player.className = "audio-overview-player";
  player.controls = true;
  player.preload = "metadata";
  player.src = audioOverview.src;
  if (audioOverview.type) player.type = audioOverview.type;
  player.hidden = true;
  panel.appendChild(player);

  button.addEventListener("click", async () => {
    player.hidden = false;
    if (player.paused) {
      try {
        await player.play();
        button.textContent = COPY[lang].audioOverviewPause;
      } catch (error) {
        player.focus();
      }
    } else {
      player.pause();
      button.textContent = COPY[lang].audioOverview;
    }
  });

  player.addEventListener("pause", () => {
    button.textContent = COPY[lang].audioOverview;
  });
  player.addEventListener("play", () => {
    button.textContent = COPY[lang].audioOverviewPause;
  });
}

function checkModelViewerAvailability(usdz, audioOverview) {
  window.setTimeout(() => {
    if (customElements.get("model-viewer")) return;

    const model = document.getElementById("space-model");
    model.classList.add("viewer-fallback");
    model.innerHTML = `
      <div class="viewer-fallback-panel">
        <strong>${COPY[lang].fallbackTitle}</strong>
        <span>${COPY[lang].fallbackBody}</span>
        <div class="actions">
          ${audioOverview?.src ? `<a class="button primary" href="${audioOverview.src}">${COPY[lang].audioOverview}</a>` : ""}
          ${usdz ? `<a class="button" href="${usdz}" rel="ar">${COPY[lang].downloadUsdz}</a>` : ""}
        </div>
      </div>
    `;
    document.getElementById("space-status").textContent = COPY[lang].fallbackBody;
  }, 1800);
}
