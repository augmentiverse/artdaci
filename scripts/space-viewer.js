import { fetchArtworkManifest } from "./artwork-media-manifest.js";
import { resolveManifestMedia } from "./artwork-media-manifest-core.mjs";
import { classifyUnresolvedArtworkRoute, resolveImmersiveArtworkRoute } from "./catalogue.js";

const PAINTINGS = {
  "mona-lisa": "content/paintings/mona-lisa.json",
  "van-gogh": "content/paintings/van-gogh.json",
  "van-gogh-bedroom": "content/paintings/van-gogh-bedroom.json",
  "vermeer-girl-with-a-pearl-earring": "content/paintings/vermeer-girl-with-a-pearl-earring.json"
};
const MUSEUMS = {
  "louvre": "content/museums/louvre.json?v=2",
  "mauritshuis": "content/museums/mauritshuis.json",
  "czartoryski": "content/museums/czartoryski.json",
  "orsay": "content/museums/orsay.json",
  "van-gogh-museum": "content/museums/van-gogh-museum.json"
};

const COPY = {
  en: {
    back: "Back",
    kicker: "Room Placement",
    loading: "Loading model...",
    ready: "Model ready. Tap Place in My Space to position it in your room.",
    readyWithUsdz: "Model ready. Tap Place in My Space. iPhone/iPad will use USDZ; Android will use Scene Viewer.",
    readyWithoutUsdz: "Model ready. Tap Place in My Space to generate the AR view from the selected model.",
    fallbackTitle: "3D preview unavailable",
    fallbackBody: "The room-placement viewer library did not load. You can still open the printed page, image AR, or listen to the audio overview.",
    audioOverview: "Audio overview",
    audioOverviewPause: "Pause overview",
    audioOverviewMissing: "Audio overview unavailable",
    place: "Place in My Space",
    openVr: "Open in VR headset",
    vrGallery: "Visit VR Gallery",
    externalVrWorld: "Visit as a VR World",
    imageAr: "Image AR",
    printedPage: "Printed Page",
    modelChoice: "Model choice",
    routeUnavailableTitle: "Experience unavailable",
    routeUnavailable: "This artwork is known, but room placement is not available for it yet.",
    routeUnknownTitle: "Artwork not found",
    routeUnknown: "The requested artwork was not recognized. Return to the catalogue to choose an available experience.",
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
    readyWithoutUsdz: "Modèle prêt. Touchez Placer dans mon espace pour générer la vue AR à partir du modèle sélectionné.",
    fallbackTitle: "Aperçu 3D indisponible",
    fallbackBody: "La bibliothèque de placement dans l'espace ne s'est pas chargée. Vous pouvez tout de même ouvrir la page imprimée, l'AR image ou écouter l'aperçu audio.",
    audioOverview: "Aperçu audio",
    audioOverviewPause: "Mettre en pause",
    audioOverviewMissing: "Aperçu audio indisponible",
    place: "Placer dans mon espace",
    openVr: "Ouvrir dans un casque VR",
    vrGallery: "Visiter la galerie VR",
    externalVrWorld: "Visiter comme monde VR",
    imageAr: "AR sur image",
    printedPage: "Page imprimée",
    modelChoice: "Choix du modèle",
    routeUnavailableTitle: "Expérience indisponible",
    routeUnavailable: "Cette œuvre est connue, mais le placement dans l'espace n'est pas encore disponible.",
    routeUnknownTitle: "Œuvre introuvable",
    routeUnknown: "L'œuvre demandée n'a pas été reconnue. Revenez au catalogue pour choisir une expérience disponible.",
    unsupported: "Ce navigateur peut afficher le modèle 3D, mais il peut ne pas prendre en charge le placement AR dans l'espace.",
    iosNote: "L'AR spatiale est disponible lorsque le modèle possède un fichier AR compatible avec cet appareil.",
    intro: "Placez le modèle 3D dans votre espace, puis déplacez-le, tournez-le et redimensionnez-le avec les contrôles AR de votre appareil."
  },
  ar: {
    back: "رجوع",
    kicker: "وضع النموذج في المساحة",
    loading: "جارٍ تحميل النموذج...",
    ready: "النموذج جاهز. اضغط «ضعه في مساحتي» لتثبيته في غرفتك.",
    readyWithUsdz: "النموذج جاهز. يستخدم iPhone وiPad ملف USDZ، ويستخدم Android عارض المشاهد.",
    readyWithoutUsdz: "النموذج جاهز. اضغط «ضعه في مساحتي» لفتح الواقع المعزز.",
    fallbackTitle: "المعاينة ثلاثية الأبعاد غير متاحة",
    fallbackBody: "تعذر تحميل عارض النماذج. يمكنك فتح الواقع المعزز على الصورة أو الاستماع إلى الدليل الصوتي.",
    audioOverview: "الدليل الصوتي",
    audioOverviewPause: "إيقاف مؤقت",
    audioOverviewMissing: "الدليل الصوتي غير متاح",
    place: "ضعه في مساحتي",
    openVr: "فتح في جهاز الواقع الافتراضي",
    vrGallery: "زيارة معرض الواقع الافتراضي",
    externalVrWorld: "زيارة العالم الافتراضي",
    imageAr: "واقع معزز على الصورة",
    printedPage: "الصفحة المطبوعة",
    modelChoice: "اختيار النموذج",
    routeUnavailableTitle: "التجربة غير متاحة",
    routeUnavailable: "هذه اللوحة معروفة، لكن وضعها في المساحة غير متاح بعد.",
    routeUnknownTitle: "اللوحة غير موجودة",
    routeUnknown: "لم يتم التعرف على اللوحة المطلوبة. ارجع إلى الفهرس لاختيار تجربة متاحة.",
    unsupported: "يمكن لهذا المتصفح عرض النموذج، لكنه قد لا يدعم وضعه في الغرفة.",
    iosNote: "يتوفر الواقع المعزز المكاني عندما يوجد ملف متوافق مع جهازك.",
    intro: "ضع النموذج ثلاثي الأبعاد في مساحتك، ثم حرّكه وأدره وغيّر حجمه باستخدام أدوات الواقع المعزز."
  }
};

const PRINT_PAGES = {
  en: {
    "mona-lisa": "print-target.html",
    "van-gogh": "print-van-gogh.html",
    "van-gogh-bedroom": "print-van-gogh-bedroom.html",
    "vermeer-girl-with-a-pearl-earring": "print-vermeer-girl-with-a-pearl-earring.html"
  },
  fr: {
    "mona-lisa": "print-target-fr.html",
    "van-gogh": "print-van-gogh-fr.html",
    "van-gogh-bedroom": "print-van-gogh-bedroom-fr.html",
    "vermeer-girl-with-a-pearl-earring": "print-vermeer-girl-with-a-pearl-earring-fr.html"
  },
  ar: {
    "mona-lisa": "print-ar.html?painting=mona-lisa",
    "van-gogh": "print-ar.html?painting=van-gogh",
    "van-gogh-bedroom": "print-ar.html?painting=van-gogh-bedroom",
    "vermeer-girl-with-a-pearl-earring": "print-ar.html?painting=vermeer-girl-with-a-pearl-earring"
  }
};

const FR_TITLES = {
  "van-gogh-bedroom": "La Chambre",
  "vermeer-girl-with-a-pearl-earring": "La Jeune Fille à la perle"
};

const params = new URLSearchParams(window.location.search);
const requestedMuseum = params.get("museum");
const requestedPainting = params.get("painting");
const resourceType = requestedMuseum !== null ? "museum" : "painting";
const catalogue = resourceType === "museum" ? MUSEUMS : PAINTINGS;
const paintingRoute = resourceType === "painting" ? resolveImmersiveArtworkRoute(requestedPainting, "space") : null;
const requestedSlug = resourceType === "museum" ? requestedMuseum : requestedPainting;
const slug = resourceType === "museum"
  ? (MUSEUMS[requestedMuseum] ? requestedMuseum : null)
  : (paintingRoute?.runtimeSlug || (requestedPainting !== null && PAINTINGS[requestedPainting] ? requestedPainting : null));
const lang = ["en", "fr", "ar"].includes(params.get("lang")) ? params.get("lang") : "en";

init();

async function init() {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  applyStaticCopy();

  if (!slug) {
    await showUnavailableRoute();
    return;
  }

  try {
    const response = await fetch(catalogue[slug], { cache: "reload" });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    const manifest = await response.json();
    const mediaContext = await getArtworkMediaContext();
    configureViewer(manifest, mediaContext);
  } catch (error) {
    document.getElementById("space-status").textContent = `${COPY[lang].unsupported} ${error.message}`;
  }
}

async function showUnavailableRoute() {
  const routeKind = resourceType === "painting"
    ? await classifyUnresolvedArtworkRoute(requestedSlug)
    : "unknown";
  const isKnown = routeKind === "unsupported";
  const title = COPY[lang][isKnown ? "routeUnavailableTitle" : "routeUnknownTitle"];
  const message = COPY[lang][isKnown ? "routeUnavailable" : "routeUnknown"];
  const status = document.getElementById("space-status");

  document.title = `DACIART - ${title}`;
  document.getElementById("space-title").textContent = title;
  document.getElementById("space-copy").textContent = message;
  status.textContent = message;
  status.setAttribute("role", "alert");
  document.getElementById("space-model").style.display = "none";
  document.querySelector(".space-panel .actions").style.display = "none";
  document.getElementById("ios-note").hidden = true;
}

function applyStaticCopy() {
  const text = COPY[lang];
  document.getElementById("back-link").textContent = text.back;
  document.getElementById("back-link").href = lang === "ar" ? "index-ar.html" : lang === "fr" ? "index-fr.html" : "index.html";
  document.getElementById("space-kicker").textContent = text.kicker;
  document.getElementById("space-copy").textContent = text.intro;
  document.getElementById("space-status").textContent = text.loading;
  document.getElementById("ar-button").textContent = text.place;
  document.getElementById("vr-link").textContent = text.openVr;
  document.getElementById("vr-gallery-link").textContent = text.vrGallery;
  document.getElementById("vr-gallery-link").href = `gallery-vr.html?lang=${lang}`;
  document.getElementById("image-ar-link").textContent = text.imageAr;
  document.getElementById("print-link").textContent = text.printedPage;
  document.getElementById("ios-note").textContent = text.iosNote;
}

function configureViewer(manifest, mediaContext) {
  const model = document.getElementById("space-model");
  const defaultTitle = manifest.title || "Artwork";
  const arTitles = {
    "mona-lisa": "الموناليزا",
    "van-gogh": "بورتريه ذاتي",
    "van-gogh-bedroom": "غرفة النوم",
    "vermeer-girl-with-a-pearl-earring": "الفتاة ذات القرط اللؤلؤي"
  };
  const title = lang === "ar" ? arTitles[slug] || defaultTitle : lang === "fr" ? FR_TITLES[slug] || defaultTitle : defaultTitle;
  const modelVariants = getModelVariants(manifest);
  const initialVariant = modelVariants[0];
  const src = initialVariant?.localSrc || manifest.ar?.primaryModel || manifest.media?.model;
  const localPoster = manifest.media?.image || manifest.print?.imageTargetSource;
  const usdz = manifest.media?.usdz || manifest.media?.usdzModel;
  const audioOverview = getLocalizedAudioOverview(manifest);

  document.title = `DACIART - ${title} - ${COPY[lang].kicker}`;
  document.getElementById("space-title").textContent = title;

  if (!src) throw new Error("No 3D model is configured for this painting.");
  const status = document.getElementById("space-status");
  if (initialVariant) prepareModelVariant(initialVariant, mediaContext);
  loadModelVariant(model, initialVariant || createFallbackVariant(src), {
    onLoad: () => {
      status.textContent = usdz ? COPY[lang].readyWithUsdz : COPY[lang].readyWithoutUsdz;
    },
    onError: (event, failedSrc) => {
      console.error(`Room AR model failed to load: ${failedSrc}`, event);
      status.textContent = `${COPY[lang].unsupported} (${failedSrc})`;
    }
  });
  model.alt = `${title} 3D model`;
  applyModelPoster(model, resolveConfiguredMedia(mediaContext, mediaContext?.config.posterKey), localPoster);
  if (usdz) {
    model.setAttribute("ios-src", usdz);
  } else {
    document.getElementById("ios-note").hidden = false;
  }

  document.getElementById("image-ar-link").href = `ar.html?${resourceType}=${slug}&lang=${lang}`;
  updateVrLink(0);
  document.getElementById("print-link").href = PRINT_PAGES[lang]?.[slug] || "index.html";
  renderModelVariantControls(model, modelVariants, usdz, mediaContext);
  renderExperienceActions(audioOverview, mediaContext);
  renderExternalExperiences(manifest.externalExperiences);
  checkModelViewerAvailability(usdz, audioOverview);
  model.addEventListener("ar-status", (event) => {
    if (event.detail.status === "failed") {
      document.getElementById("space-status").textContent = COPY[lang].unsupported;
    }
  });
}

function getModelVariants(manifest) {
  // Space AR can use a different set of models from image-tracked AR.
  const variants = manifest.media?.modelVariants || manifest.ar?.modelVariants || [];
  const list = Array.isArray(variants) ? variants : [];
  if (list.length) {
    return list.filter((variant) => variant?.src).map((variant) => ({
      ...variant,
      localSrc: variant.src,
      remoteSrc: "",
      loadedSrc: "",
      remoteResolved: false
    }));
  }

  const fallback = manifest.ar?.primaryModel || manifest.media?.model;
  return fallback
    ? [{
        id: "model-1",
        label: { en: "Model 1", fr: "Modèle 1" },
        src: fallback,
        localSrc: fallback,
        remoteSrc: "",
        loadedSrc: "",
        remoteResolved: false
      }]
    : [];
}

async function getArtworkMediaContext() {
  const config = getArtworkMediaConfig();
  if (!config) return null;

  try {
    const manifest = await fetchArtworkManifest(config.manifestUrl);
    if (manifest?.id !== config.artworkId) return null;
    return { config, manifest, resolvedMedia: new Map() };
  } catch (error) {
    console.warn("Artwork media manifest unavailable; keeping the local spatial media.", error);
    return null;
  }
}

function getArtworkMediaConfig() {
  const element = [...document.querySelectorAll("[data-artwork-media-manifest-url]")]
    .find((candidate) => candidate.dataset.artworkMediaFor === slug);
  if (!element?.dataset.artworkMediaId || !element.dataset.artworkMediaManifestUrl) return null;

  try {
    const modelKeys = parseMediaKeyMap(element.dataset.artworkMediaModelKeys);
    const audioKeys = parseMediaKeyMap(element.dataset.artworkMediaAudioKeys);
    if (!modelKeys || !audioKeys) return null;
    return {
      artworkId: element.dataset.artworkMediaId,
      manifestUrl: element.dataset.artworkMediaManifestUrl,
      posterKey: element.dataset.artworkMediaPosterKey || "",
      modelKeys,
      audioKeys
    };
  } catch (error) {
    console.warn("Invalid declarative artwork media configuration; keeping the local spatial media.", error);
    return null;
  }
}

function parseMediaKeyMap(value) {
  const parsed = JSON.parse(value || "{}");
  return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
}

function resolveConfiguredMedia(mediaContext, mediaKey) {
  if (!mediaContext || typeof mediaKey !== "string" || !mediaKey) return "";
  if (mediaContext.resolvedMedia.has(mediaKey)) return mediaContext.resolvedMedia.get(mediaKey);

  try {
    const mediaUrl = resolveManifestMedia(mediaContext.manifest, mediaKey, lang) || "";
    mediaContext.resolvedMedia.set(mediaKey, mediaUrl);
    return mediaUrl;
  } catch (error) {
    console.warn(`Remote media unavailable for ${mediaKey}; keeping the local media.`, error);
    mediaContext.resolvedMedia.set(mediaKey, "");
    return "";
  }
}

function prepareModelVariant(variant, mediaContext) {
  if (!variant || variant.remoteResolved) return;
  variant.remoteResolved = true;
  const mediaKey = mediaContext?.config.modelKeys[variant.id];
  variant.remoteSrc = resolveConfiguredMedia(mediaContext, mediaKey);
}

function createFallbackVariant(src) {
  return {
    id: "model-1",
    localSrc: src,
    remoteSrc: "",
    loadedSrc: "",
    remoteResolved: true
  };
}

const modelLoadRequests = new WeakMap();

function loadModelVariant(model, variant, { onLoad, onError }) {
  const localSrc = variant.localSrc;
  let activeSrc = variant.loadedSrc || variant.remoteSrc || localSrc;
  let usingLocalFallback = !variant.remoteSrc || activeSrc === localSrc;
  const requestToken = Symbol("model-load");
  modelLoadRequests.set(model, requestToken);

  const cleanup = () => {
    model.removeEventListener("load", handleLoad);
    model.removeEventListener("error", handleError);
  };
  const handleLoad = () => {
    if (modelLoadRequests.get(model) !== requestToken) return;
    cleanup();
    variant.loadedSrc = activeSrc;
    onLoad?.(activeSrc);
  };
  const handleError = (event) => {
    if (modelLoadRequests.get(model) !== requestToken) return;
    if (!usingLocalFallback && localSrc) {
      console.warn(`Remote spatial model unavailable for ${variant.id}; loading the local model.`);
      usingLocalFallback = true;
      activeSrc = localSrc;
      model.setAttribute("src", activeSrc);
      return;
    }

    cleanup();
    onError?.(event, activeSrc);
  };

  model.addEventListener("load", handleLoad);
  model.addEventListener("error", handleError);
  model.setAttribute("src", activeSrc);
}

function applyModelPoster(model, remotePoster, localPoster) {
  if (!remotePoster) {
    if (localPoster) model.poster = localPoster;
    return;
  }

  const posterProbe = new Image();
  posterProbe.addEventListener("load", () => {
    model.poster = remotePoster;
  }, { once: true });
  posterProbe.addEventListener("error", () => {
    console.warn("Remote spatial poster unavailable; keeping the local poster.");
    if (localPoster) model.poster = localPoster;
  }, { once: true });
  posterProbe.src = remotePoster;
}

function getModelVariantLabel(variant, index) {
  if (typeof variant.label === "string") return variant.label;
  if (lang === "ar") return variant.label?.ar || `النموذج ${index + 1}`;
  return variant.label?.[lang] || variant.label?.en || `Model ${index + 1}`;
}

function renderModelVariantControls(model, variants, defaultUsdz, mediaContext) {
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
      if (button.classList.contains("active")) return;

      const arButton = document.getElementById("ar-button");
      const variantUsdz = variant.usdz || variant.iosSrc || (index === 0 ? defaultUsdz : "");

      arButton.disabled = true;
      document.getElementById("space-status").textContent = COPY[lang].loading;
      prepareModelVariant(variant, mediaContext);
      loadModelVariant(model, variant, {
        onLoad: () => {
          arButton.disabled = false;
          document.getElementById("space-status").textContent = variantUsdz
            ? COPY[lang].readyWithUsdz
            : COPY[lang].readyWithoutUsdz;
        },
        onError: () => {
          arButton.disabled = false;
          document.getElementById("space-status").textContent = COPY[lang].unsupported;
        }
      });
      updateVrLink(index);
      if (variantUsdz) {
        model.setAttribute("ios-src", variantUsdz);
      } else {
        model.removeAttribute("ios-src");
      }

      group.querySelectorAll(".model-variant").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
    });
    group.appendChild(button);
  });

  // The model must be selected before launching the native AR viewer.
  actions.prepend(group);
}

function updateVrLink(modelIndex) {
  const link = document.getElementById("vr-link");
  if (!link) return;
  link.href = resourceType === "museum"
    ? `gallery-vr.html?lang=${lang}&room=museums&museum=${encodeURIComponent(slug)}`
    : `vr.html?painting=${encodeURIComponent(slug)}&lang=${lang}&model=${modelIndex}`;
}

function getLocalizedAudioOverview(manifest) {
  const overviews = manifest.media?.audioOverviews || manifest.media?.audioOverview || [];
  const list = Array.isArray(overviews) ? overviews : [overviews];
  const mediaLang = lang;
  // Arabic intentionally preserves the historic French guide fallback.
  return list.find((item) => item.lang === mediaLang) || list.find((item) => item.lang === "fr") || list.find((item) => item.lang === "en") || list[0] || null;
}

function renderExperienceActions(audioOverview, mediaContext) {
  const actions = document.querySelector(".space-panel .actions");
  if (!actions) return;

  actions.insertAdjacentHTML("beforeend", `
    <button id="audio-overview-button" class="button" type="button">${audioOverview ? COPY[lang].audioOverview : COPY[lang].audioOverviewMissing}</button>
  `);
  bindAudioOverview(audioOverview, mediaContext);
}

function renderExternalExperiences(experiences) {
  const actions = document.querySelector(".space-panel .actions");
  const list = Array.isArray(experiences) ? experiences : [];
  if (!actions || !list.length) return;

  list.filter((experience) => experience?.url).forEach((experience) => {
    const link = document.createElement("a");
    link.className = "button external-vr-world";
    link.href = experience.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = experience.label?.[lang]
      || experience.label?.en
      || COPY[lang].externalVrWorld;
    actions.appendChild(link);
  });
}

function bindAudioOverview(audioOverview, mediaContext) {
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
  player.preload = "none";
  player.hidden = true;
  panel.appendChild(player);

  const localSrc = audioOverview.src;
  let sourcePrepared = false;
  let usingRemoteSource = false;
  let fallbackAttempted = false;
  let playRequested = false;

  const prepareSource = () => {
    if (sourcePrepared) return;
    const mediaKey = mediaContext?.config.audioKeys[lang];
    const remoteSrc = resolveConfiguredMedia(mediaContext, mediaKey);
    player.src = remoteSrc || localSrc;
    player.dataset.mediaType = audioOverview.type || "";
    sourcePrepared = true;
    usingRemoteSource = Boolean(remoteSrc);
  };

  player.addEventListener("error", () => {
    if (!usingRemoteSource || fallbackAttempted || !localSrc) return;
    console.warn("Remote spatial audio unavailable; loading the local guide.");
    fallbackAttempted = true;
    usingRemoteSource = false;
    player.src = localSrc;
    player.load();
    if (playRequested) player.play().catch(() => player.focus());
  });

  button.addEventListener("click", async () => {
    player.hidden = false;
    if (player.paused) {
      playRequested = true;
      prepareSource();
      try {
        await player.play();
        button.textContent = COPY[lang].audioOverviewPause;
      } catch (error) {
        player.focus();
      }
    } else {
      playRequested = false;
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
        </div>
      </div>
    `;
    document.getElementById("space-status").textContent = COPY[lang].fallbackBody;
  }, 1800);
}
