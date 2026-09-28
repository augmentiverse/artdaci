import { resolveManifestMedia } from "../../scripts/artwork-media-manifest-core.mjs";
import {
  languageFromSearch,
  localize,
  projectAssetUrl,
  validatePlaceRecord,
  withLanguage,
} from "./geo-core.mjs";

const COPY = {
  fr: {
    kicker: "POC Web · exploration distante",
    title: "Le Louvre et La Joconde, où que vous soyez",
    intro: "Manipulez les modèles sur ordinateur ou mobile. Sur Meta Quest, ouvrez ensuite l’expérience WebXR existante.",
    artworkModel: "Œuvre",
    placeModel: "Lieu",
    loading: "Chargement du modèle 3D…",
    ready: "Modèle prêt. Faites glisser pour tourner et pincez ou utilisez la molette pour zoomer.",
    failed: "Le modèle 3D n’a pas pu être chargé.",
    audioTitle: "Écouter la présentation",
    audioBody: "La piste est résolue depuis le manifeste canonique ld01, avec repli local.",
    openArtworkVr: "Ouvrir La Joconde en WebXR",
    openPlaceVr: "Explorer l’aile Louvre en VR",
    back: "Revenir aux deux modes",
    prototype: "Prototype : la position réelle de l’œuvre dans le lieu n’est pas encore relevée.",
  },
  en: {
    kicker: "Web POC · remote exploration",
    title: "The Louvre and Mona Lisa, wherever you are",
    intro: "Manipulate the models on desktop or mobile. On Meta Quest, continue into the existing WebXR experience.",
    artworkModel: "Artwork",
    placeModel: "Place",
    loading: "Loading 3D model…",
    ready: "Model ready. Drag to rotate and pinch or use the wheel to zoom.",
    failed: "The 3D model could not be loaded.",
    audioTitle: "Listen to the overview",
    audioBody: "The track is resolved through the canonical ld01 manifest, with a local fallback.",
    openArtworkVr: "Open Mona Lisa in WebXR",
    openPlaceVr: "Explore the Louvre wing in VR",
    back: "Back to the two modes",
    prototype: "Prototype: the artwork’s real position inside the place has not been surveyed yet.",
  },
  ar: {
    kicker: "نموذج ويب · استكشاف عن بُعد",
    title: "اللوفر والموناليزا أينما كنت",
    intro: "حرّك النماذج على الحاسوب أو الهاتف. وعلى Meta Quest، انتقل إلى تجربة WebXR الحالية.",
    artworkModel: "العمل الفني",
    placeModel: "المكان",
    loading: "جارٍ تحميل النموذج ثلاثي الأبعاد…",
    ready: "النموذج جاهز. اسحب للتدوير واستخدم القرص أو العجلة للتقريب.",
    failed: "تعذر تحميل النموذج ثلاثي الأبعاد.",
    audioTitle: "الاستماع إلى العرض",
    audioBody: "يتم جلب المسار من بيان ld01 الرسمي مع بديل محلي.",
    openArtworkVr: "فتح الموناليزا في WebXR",
    openPlaceVr: "استكشاف جناح اللوفر بالواقع الافتراضي",
    back: "العودة إلى النمطين",
    prototype: "نموذج أولي: لم يتم بعد مسح الموقع الحقيقي للعمل داخل المكان.",
  },
};

const language = languageFromSearch(location.search);
const copy = COPY[language];
const dataUrl = new URL("../data/louvre.json", import.meta.url);
const viewer = document.getElementById("geo-model-viewer");
const status = document.getElementById("viewer-status");
let place;

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

  renderIdentity();
  configureRoutes();
  configureModels();
  configureAudio();
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
  const content = place.contents[0];
  document.querySelectorAll("[data-place-name]").forEach((element) => {
    element.textContent = localize(place.name, language);
  });
  document.querySelectorAll("[data-artwork-title]").forEach((element) => {
    element.textContent = localize(content.title, language);
  });
  document.title = `ARTDACI GEO — ${localize(place.name, language)} — ${localize(content.title, language)}`;
}

function configureRoutes() {
  const routes = place.remoteExperience.routes;
  document.getElementById("artwork-vr-link").href = withLanguage(routes.artworkVr, language);
  document.getElementById("place-vr-link").href = withLanguage(routes.placeVr, language);
}

function configureModels() {
  const models = place.remoteExperience.models;
  const controls = document.getElementById("model-controls");
  controls.replaceChildren();

  models.forEach((model) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "model-choice";
    button.dataset.modelId = model.id;
    button.textContent = model.kind === "place" ? copy.placeModel : copy.artworkModel;
    button.setAttribute("aria-label", localize(model.label, language));
    button.addEventListener("click", () => selectModel(model.id));
    controls.appendChild(button);
  });

  viewer.addEventListener("load", () => {
    status.textContent = copy.ready;
    status.dataset.state = "ready";
  });
  viewer.addEventListener("error", () => {
    status.textContent = copy.failed;
    status.dataset.state = "error";
  });
  selectModel(place.remoteExperience.defaultModelId);
}

function selectModel(modelId) {
  const model = place.remoteExperience.models.find((candidate) => candidate.id === modelId);
  if (!model) return;
  status.textContent = copy.loading;
  status.dataset.state = "loading";
  viewer.src = projectAssetUrl(model.path, import.meta.url);
  viewer.alt = localize(model.label, language);
  document.querySelectorAll("[data-model-id]").forEach((button) => {
    const selected = button.dataset.modelId === modelId;
    button.classList.toggle("is-active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
}

async function configureAudio() {
  const audio = document.getElementById("artwork-audio");
  const content = place.contents[0];
  const audioConfig = content.media.audio[language] || content.media.audio.fr;
  const fallbackUrl = projectAssetUrl(audioConfig.localFallback, import.meta.url);
  audio.src = fallbackUrl;

  try {
    const response = await fetch(place.mediaResolver.canonicalManifestUrl, {
      cache: "no-store",
      credentials: "omit",
    });
    if (!response.ok) return;
    const manifest = await response.json();
    if (manifest.id !== content.artworkId) return;
    const remoteUrl = resolveManifestMedia(manifest, audioConfig.manifestKey, language);
    if (!remoteUrl) return;
    audio.addEventListener("error", () => {
      if (audio.src !== fallbackUrl) {
        audio.src = fallbackUrl;
        audio.load();
      }
    }, { once: true });
    audio.src = remoteUrl;
  } catch (error) {
    console.warn("Canonical ld01 audio unavailable; keeping the local fallback.", error);
  }
}
