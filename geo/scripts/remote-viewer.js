import { resolveManifestMedia } from "../../scripts/artwork-media-manifest-core.mjs";
import {JOURNEY_COPY,createJourney,readJourneyState,writeJourneyState,validExteriorView,journeyStorage} from './journey.mjs?v=6-9';
import { mountSemanticRuntimePanel } from "../../scripts/semantics/semantic-runtime-client.mjs?v=1";
import {
  languageFromSearch,
  localize,
  modelCandidateUrl,
  modelVariantCandidates,
  projectAssetUrl,
  selectPerformanceProfile,
  validatePlaceRecord,
  withLanguage,
} from "./geo-core.mjs";

const COPY = {
  fr: {
    remoteMode: "Explorer à distance",
    kicker: "POC Web · parcours culturel interactif",
    title: "Explorez le Louvre à travers trois récits",
    intro: "Orientez la vue, choisissez un point d’intérêt et poursuivez dans les expériences WebXR existantes.",
    overview: "Vue Louvre",
    enterRoom: "Entrer dans la Salle des États",
    recenter: "Recentrer",
    loading: "Chargement du modèle 3D…",
    loadingProgress: "Chargement du modèle 3D · {percent} %",
    ready: "Modèle prêt en {seconds} s. Faites glisser pour tourner et pincez ou utilisez la molette pour zoomer.",
    failed: "Le modèle 3D n’a pas pu être chargé.",
    poiTitle: "Points d’intérêt",
    poiBody: "Sélectionnez une étape pour afficher son récit et son modèle associé.",
    typePlace: "Lieu",
    typeArtwork: "Œuvre",
    typeCharacter: "Personnage-guide",
    artistLabel: "Artiste",
    uncalibrated: "Position locale 3D non calibrée · aucune coordonnée géographique n’est utilisée.",
    audioTitle: "Audio",
    audioAvailable: "Présentation ARTDACI disponible dans la langue active.",
    audioUnavailable: "Aucun récit audio n’est associé à ce point pour le moment.",
    xrTitle: "Continuer en VR / WebXR",
    xrBody: "Ouvrez l’expérience immersive adaptée sur Meta Quest ou un navigateur WebXR compatible.",
    openArtworkVr: "Ouvrir La Joconde en WebXR",
    openPlaceVr: "Explorer le Louvre en VR",
    back: "Revenir à ARTDACI GEO",
    prototype: "Prototype : les positions locales des points d’intérêt ne sont pas encore calibrées.",
  },
  en: {
    remoteMode: "Explore remotely",
    kicker: "Web POC · interactive cultural journey",
    title: "Explore the Louvre through three stories",
    intro: "Orbit the view, choose a point of interest and continue into the existing WebXR experiences.",
    overview: "Louvre view",
    enterRoom: "Enter the Salle des États",
    recenter: "Recenter",
    loading: "Loading 3D model…",
    loadingProgress: "Loading 3D model · {percent}%",
    ready: "Model ready in {seconds}s. Drag to orbit and pinch or use the wheel to zoom.",
    failed: "The 3D model could not be loaded.",
    poiTitle: "Points of interest",
    poiBody: "Choose a stop to reveal its story and associated model.",
    typePlace: "Place",
    typeArtwork: "Artwork",
    typeCharacter: "Character guide",
    artistLabel: "Artist",
    uncalibrated: "Local 3D position not calibrated · no geographic coordinate is being used.",
    audioTitle: "Audio",
    audioAvailable: "ARTDACI overview available in the active language.",
    audioUnavailable: "No audio story is associated with this point yet.",
    xrTitle: "Continue in VR / WebXR",
    xrBody: "Open the appropriate immersive experience on Meta Quest or a compatible WebXR browser.",
    openArtworkVr: "Open Mona Lisa in WebXR",
    openPlaceVr: "Explore the Louvre in VR",
    back: "Back to ARTDACI GEO",
    prototype: "Prototype: the local positions of the points of interest have not been calibrated yet.",
  },
  ar: {
    remoteMode: "الاستكشاف عن بُعد",
    kicker: "نموذج ويب · رحلة ثقافية تفاعلية",
    title: "استكشف اللوفر من خلال ثلاث حكايات",
    intro: "حرّك المشهد واختر نقطة اهتمام، ثم انتقل إلى تجارب WebXR الحالية.",
    overview: "منظر اللوفر",
    enterRoom: "الدخول إلى قاعة الدول",
    recenter: "إعادة توسيط العرض",
    loading: "جارٍ تحميل النموذج ثلاثي الأبعاد…",
    loadingProgress: "جارٍ تحميل النموذج ثلاثي الأبعاد · {percent}٪",
    ready: "النموذج جاهز خلال {seconds} ث. اسحب للتدوير واستخدم القرص أو العجلة للتقريب.",
    failed: "تعذر تحميل النموذج ثلاثي الأبعاد.",
    poiTitle: "نقاط الاهتمام",
    poiBody: "اختر محطة لعرض حكايتها والنموذج المرتبط بها.",
    typePlace: "مكان",
    typeArtwork: "عمل فني",
    typeCharacter: "شخصية مرشدة",
    artistLabel: "الفنان",
    uncalibrated: "الموقع المحلي ثلاثي الأبعاد غير معاير · لا تُستخدم أي إحداثيات جغرافية.",
    audioTitle: "الصوت",
    audioAvailable: "يتوفر عرض ARTDACI باللغة النشطة.",
    audioUnavailable: "لا توجد حكاية صوتية مرتبطة بهذه النقطة حاليًا.",
    xrTitle: "المتابعة في VR / WebXR",
    xrBody: "افتح التجربة الغامرة المناسبة على Meta Quest أو متصفح متوافق مع WebXR.",
    openArtworkVr: "فتح الموناليزا في WebXR",
    openPlaceVr: "استكشاف اللوفر بالواقع الافتراضي",
    back: "العودة إلى ARTDACI GEO",
    prototype: "نموذج أولي: لم تُعاير بعد المواقع المحلية لنقاط الاهتمام.",
  },
};

const language = languageFromSearch(location.search);
const copy = COPY[language];
const dataUrl = new URL("../data/louvre.json", import.meta.url);
const viewer = document.getElementById("geo-model-viewer");
const status = document.getElementById("viewer-status");
const audio = document.getElementById("artwork-audio");
const audioDescription = document.getElementById("audio-description");
let place;
let activeModelId = "";
let activeModelCandidates = [];
let activeCandidateIndex = -1;
let activeAudioFallback = "";
let audioRequestId = 0;
let modelLoadStartedAt = 0;
let canonicalManifestPromise;
let performanceProfile = "mobile";
let leaving=false,restoredView=false;
const storage=journeyStorage();
const savedView=validExteriorView(readJourneyState(storage,'remote-view'));
const journey=createJourney({destination:'room',source:'remote',language,release:releaseExterior,saveState:()=>{
  const orbit=viewer.getCameraOrbit();writeJourneyState(storage,'remote-view',activeModelId==='louvre-building'?{theta:orbit.theta,phi:orbit.phi,radius:orbit.radius,fov:viewer.getFieldOfView()}:null);
}});
window.addEventListener('pagehide',releaseExterior);
window.addEventListener('pageshow',event=>{if(event.persisted)location.reload();});
function releaseExterior(){if(leaving)return;leaving=true;audioRequestId++;audio.pause();audio.removeAttribute('src');audio.load();const Viewer=customElements.get('model-viewer');if(Viewer)Viewer.modelCacheSize=0;viewer.removeAttribute('src');viewer.remove();}

init().catch((error) => {
  console.error(error);
  status.textContent = copy.failed;
  status.dataset.state = "error";
});

async function init() {
  document.documentElement.lang = language;
  document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  applyCopy();

  const response = await fetch(dataUrl, { cache: "no-store" });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  place = await response.json();
  const errors = validatePlaceRecord(place);
  if (errors.length) throw new Error(errors.join("; "));

  await configurePerformanceProfile();
  renderIdentity();
  configureRoutes();
  configureViewer();
  renderPointsOfInterest();
  bindControls();
  const requestedPoi = new URLSearchParams(location.search).get("poi");
  selectPointOfInterest(place.pointsOfInterest.some(point => point.id === requestedPoi) ? requestedPoi : place.remoteExperience.defaultPointOfInterestId);
  void mountSemanticRuntimePanel({
    anchor: document.querySelector(".viewer-toolbar"),
    slug: "louvre",
    resourceType: "museum",
    environment: "geo",
    lang: language
  });
}

function applyCopy() {
  document.querySelectorAll("[data-copy]").forEach((element) => {
    if (copy[element.dataset.copy]) element.textContent = copy[element.dataset.copy];
  });
  document.querySelectorAll("[data-lang-link]").forEach((link) => {
    link.href = withLanguage("remote.html", link.dataset.langLink);
    link.setAttribute("aria-current", link.dataset.langLink === language ? "page" : "false");
  });
  document.querySelectorAll("[data-back-link]").forEach((link) => {
    link.href = withLanguage("place.html", language);
  });
}

function renderIdentity() {
  document.querySelectorAll("[data-place-name]").forEach((element) => {
    element.textContent = localize(place.name, language);
  });
  document.title = `ARTDACI GEO — ${localize(place.name, language)} — ${copy.remoteMode}`;
}

function configureRoutes() {
  const routes = place.remoteExperience.routes;
  document.getElementById("artwork-vr-link").href = withLanguage(routes.artworkVr, language);
  document.getElementById("place-vr-link").href = withLanguage(routes.placeVr, language);
  document.getElementById("room-link").href = withLanguage(routes.salleDesEtats, language);
  document.getElementById('room-link').textContent=JOURNEY_COPY[language].enter;
  document.getElementById('journey-note').textContent=JOURNEY_COPY[language].note;
  journey.bind(document.getElementById('room-link'));
  const xrLink=document.getElementById('exterior-xr-link');xrLink.textContent=JOURNEY_COPY[language].xr;xrLink.href=withLanguage('louvre-xr.html',language);
}

function configureViewer() {
  viewer.addEventListener("progress", (event) => {
    if (!event.detail || status.dataset.state !== "loading") return;
    const percent = Math.round(event.detail.totalProgress * 100);
    status.textContent = copy.loadingProgress.replace("{percent}", String(percent));
  });
  viewer.addEventListener("load", () => {
    if(leaving)return;
    if(!restoredView && savedView && new URLSearchParams(location.search).get('return')==='room'){
      viewer.cameraOrbit=`${savedView.theta}rad ${savedView.phi}rad ${savedView.radius}m`;viewer.fieldOfView=`${savedView.fov}deg`;viewer.jumpCameraToGoal?.();restoredView=true;
    }
    journey.ready(viewer);
    const elapsedSeconds = Math.max(0, performance.now() - modelLoadStartedAt) / 1000;
    viewer.dataset.loadMs = String(Math.round(elapsedSeconds * 1000));
    status.textContent = copy.ready.replace("{seconds}", elapsedSeconds.toFixed(1));
    status.dataset.state = "ready";
  });
  viewer.addEventListener("error", () => {
    if(leaving)return;
    if (activeCandidateIndex + 1 < activeModelCandidates.length) {
      const failedCandidate = activeModelCandidates[activeCandidateIndex];
      console.warn(`Model variant ${failedCandidate.id} unavailable; trying the next candidate.`);
      activeCandidateIndex += 1;
      loadActiveModelCandidate();
      return;
    }
    status.textContent = copy.failed;
    status.dataset.state = "error";
  });
}

async function configurePerformanceProfile() {
  await customElements.whenDefined("model-viewer");
  const ModelViewerElement = customElements.get("model-viewer");
  if (ModelViewerElement) ModelViewerElement.modelCacheSize = 1;

  const params = new URLSearchParams(location.search);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("webgl2") || canvas.getContext("webgl");
  const maxTextureSize = context?.getParameter(context.MAX_TEXTURE_SIZE) || 0;
  context?.getExtension("WEBGL_lose_context")?.loseContext();

  let immersiveVr = false;
  try {
    immersiveVr = Boolean(await navigator.xr?.isSessionSupported?.("immersive-vr"));
  } catch (error) {
    console.info("WebXR capability could not be queried; continuing with browser signals.", error);
  }

  performanceProfile = selectPerformanceProfile({
    forcedProfile: params.get("quality"),
    immersiveVr,
    coarsePointer: matchMedia("(pointer: coarse)").matches,
    saveData: Boolean(navigator.connection?.saveData),
    deviceMemory: navigator.deviceMemory,
    hardwareConcurrency: navigator.hardwareConcurrency,
    maxTextureSize,
    viewportWidth: innerWidth,
  });
  viewer.dataset.performanceProfile = performanceProfile;
}

function bindControls() {
  document.getElementById("overview-button").addEventListener("click", () => {
    selectPointOfInterest(place.remoteExperience.defaultPointOfInterestId);
  });
  document.getElementById("reset-view-button").addEventListener("click", resetCamera);
}

function renderPointsOfInterest() {
  const list = document.getElementById("poi-list");
  list.replaceChildren();
  place.pointsOfInterest.forEach((point, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "poi-card";
    button.dataset.poiId = point.id;
    button.innerHTML = `<span class="poi-number">${String(index + 1).padStart(2, "0")}</span><span><small>${pointTypeLabel(point.type)}</small><strong>${localize(point.content.title, language)}</strong></span>`;
    button.addEventListener("click", () => selectPointOfInterest(point.id));
    list.appendChild(button);
  });
}

function selectPointOfInterest(pointId) {
  const point = place.pointsOfInterest.find((candidate) => candidate.id === pointId);
  if (!point) return;

  document.querySelectorAll("[data-poi-id]").forEach((button) => {
    const selected = button.dataset.poiId === point.id;
    button.classList.toggle("is-active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });

  document.getElementById("poi-type").textContent = pointTypeLabel(point.type);
  document.getElementById("poi-title").textContent = localize(point.content.title, language);
  document.getElementById("poi-description").textContent = localize(point.content.description, language);
  document.getElementById("poi-calibration").textContent = copy.uncalibrated;

  const artist = document.getElementById("poi-artist");
  const artistName = localize(point.content.artist, language);
  artist.hidden = !artistName;
  artist.textContent = artistName ? `${copy.artistLabel} · ${artistName}` : "";

  renderPointActions(point);
  configurePointAudio(point);
  selectModel(point.modelId);
}

function pointTypeLabel(type) {
  if (type === "artwork") return copy.typeArtwork;
  if (type === "character") return copy.typeCharacter;
  return copy.typePlace;
}

function renderPointActions(point) {
  const container = document.getElementById("poi-actions");
  container.replaceChildren();
  point.actions.forEach((action) => {
    const route = place.remoteExperience.routes[action.routeId];
    if (!route) return;
    const link = document.createElement("a");
    link.className = "geo-button poi-action";
    link.href = withLanguage(route, language);
    link.textContent = localize(action.label, language);
    container.appendChild(link);
  });
}

function selectModel(modelId) {
  const model = place.remoteExperience.models.find((candidate) => candidate.id === modelId);
  if (!model) return;

  document.getElementById("viewer-model-label").textContent = localize(model.label, language);
  if (model.id === activeModelId) {
    resetCamera();
    return;
  }

  activeModelId = model.id;
  activeModelCandidates = modelVariantCandidates(model, performanceProfile);
  activeCandidateIndex = 0;
  viewer.dataset.modelId = model.id;
  viewer.alt = localize(model.label, language);
  loadActiveModelCandidate();
  resetCamera();
}

function loadActiveModelCandidate() {
  const candidate = activeModelCandidates[activeCandidateIndex];
  if (!candidate) {
    status.textContent = copy.failed;
    status.dataset.state = "error";
    return;
  }
  modelLoadStartedAt = performance.now();
  status.textContent = copy.loading;
  status.dataset.state = "loading";
  viewer.dataset.variantId = candidate.id;
  viewer.dataset.variantSource = candidate.source;
  viewer.src = modelCandidateUrl(candidate, import.meta.url);
}

function resetCamera() {
  viewer.cameraOrbit = "auto auto auto";
  viewer.cameraTarget = "auto auto auto";
  viewer.fieldOfView = "35deg";
  viewer.jumpCameraToGoal?.();
}

function configurePointAudio(point) {
  const requestId = ++audioRequestId;
  audio.pause();
  audio.hidden = true;
  audio.removeAttribute("src");
  audio.load();
  activeAudioFallback = "";

  const audioReference = point.content.audio;
  if (!audioReference) {
    audioDescription.textContent = copy.audioUnavailable;
    return;
  }

  const content = place.contents.find((candidate) => candidate.artworkId === audioReference.contentArtworkId);
  const audioConfig = content?.media?.audio?.[language] || content?.media?.audio?.fr;
  if (!content || !audioConfig) {
    audioDescription.textContent = copy.audioUnavailable;
    return;
  }

  activeAudioFallback = projectAssetUrl(audioConfig.localFallback, import.meta.url);
  audio.src = activeAudioFallback;
  audio.hidden = false;
  audioDescription.textContent = copy.audioAvailable;

  resolveCanonicalAudio(content, audioConfig).then((remoteUrl) => {
    if (requestId !== audioRequestId || !remoteUrl) return;
    audio.src = remoteUrl;
  });
}

async function resolveCanonicalAudio(content, audioConfig) {
  try {
    canonicalManifestPromise ||= fetch(place.mediaResolver.canonicalManifestUrl, {
      cache: "no-store",
      credentials: "omit",
    }).then((response) => response.ok ? response.json() : null);
    const manifest = await canonicalManifestPromise;
    if (manifest?.id !== content.artworkId) return "";
    return resolveManifestMedia(manifest, audioConfig.manifestKey, language) || "";
  } catch (error) {
    console.warn("Canonical ld01 audio unavailable; keeping the local fallback.", error);
    return "";
  }
}

audio.addEventListener("error", () => {
  if (activeAudioFallback && audio.src !== activeAudioFallback) {
    audio.src = activeAudioFallback;
    audio.load();
  }
});
