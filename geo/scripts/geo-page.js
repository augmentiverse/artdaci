import { resolveManifestMedia } from "../../scripts/artwork-media-manifest-core.mjs";
import {
  GEO_LANGUAGES,
  languageFromSearch,
  localize,
  projectAssetUrl,
  validatePlaceRecord,
  withLanguage,
} from "./geo-core.mjs";

const COPY = {
  fr: {
    prototype: "Proof of Concept · Paris",
    intro: "Un même lieu culturel, deux façons de l’explorer.",
    discover: "Découvrir le lieu",
    placeLabel: "Lieu pilote",
    artworkLabel: "Œuvre pilote",
    modesTitle: "Choisissez votre mode",
    modesIntro: "Le POC sépare volontairement l’expérience sur place de l’exploration distante.",
    onsiteTitle: "Explorer sur place",
    onsiteTag: "Geo-AR · Google Geospatial",
    onsiteBody: "Pour les visiteurs physiquement présents au Louvre. L’ancrage ARCore Geospatial et la vérification VPS nécessitent encore une intégration native et un relevé sur site.",
    unavailable: "Prototype · non disponible",
    remoteTitle: "Explorer à distance",
    remoteTag: "3D · VR · POC Web",
    remoteBody: "Explorez le Louvre et La Joconde en 3D depuis un navigateur, puis passez à l’expérience WebXR sur un casque compatible.",
    openRemote: "Ouvrir le POC distant",
    dataPending: "Coordonnées, altitude, orientation, ancrage et VPS : à vérifier sur site.",
    mediaStatus: "Médias liés au manifeste canonique ARTDACI ld01.",
    error: "Les données du lieu ne peuvent pas être chargées.",
  },
  en: {
    prototype: "Proof of Concept · Paris",
    intro: "One cultural place, two ways to explore it.",
    discover: "Discover the place",
    placeLabel: "Pilot place",
    artworkLabel: "Pilot artwork",
    modesTitle: "Choose your mode",
    modesIntro: "The POC deliberately separates the on-site experience from remote exploration.",
    onsiteTitle: "Explore on site",
    onsiteTag: "Geo-AR · Google Geospatial",
    onsiteBody: "For visitors physically present at the Louvre. ARCore Geospatial anchoring and VPS verification still require a native integration and an on-site survey.",
    unavailable: "Prototype · unavailable",
    remoteTitle: "Explore remotely",
    remoteTag: "3D · VR · Web POC",
    remoteBody: "Explore the Louvre and Mona Lisa in 3D from a browser, then continue in WebXR on a compatible headset.",
    openRemote: "Open the remote POC",
    dataPending: "Coordinates, altitude, orientation, anchor and VPS: pending on-site verification.",
    mediaStatus: "Media linked to the canonical ARTDACI ld01 manifest.",
    error: "The place data could not be loaded.",
  },
  ar: {
    prototype: "نموذج أولي · باريس",
    intro: "مكان ثقافي واحد، وطريقتان لاستكشافه.",
    discover: "اكتشاف المكان",
    placeLabel: "الموقع التجريبي",
    artworkLabel: "العمل التجريبي",
    modesTitle: "اختر طريقة الاستكشاف",
    modesIntro: "يفصل النموذج الأولي بوضوح بين التجربة في الموقع والاستكشاف عن بُعد.",
    onsiteTitle: "الاستكشاف في الموقع",
    onsiteTag: "Geo-AR · Google Geospatial",
    onsiteBody: "للزوار الموجودين فعلياً في اللوفر. ما زال تثبيت ARCore Geospatial والتحقق من VPS يتطلبان تطبيقاً أصلياً ومسحاً ميدانياً.",
    unavailable: "نموذج أولي · غير متاح",
    remoteTitle: "الاستكشاف عن بُعد",
    remoteTag: "ثلاثي الأبعاد · واقع افتراضي · نموذج ويب",
    remoteBody: "استكشف اللوفر والموناليزا ثلاثيَّي الأبعاد من المتصفح، ثم انتقل إلى WebXR على جهاز متوافق.",
    openRemote: "فتح النموذج البعيد",
    dataPending: "الإحداثيات والارتفاع والاتجاه ونوع المرساة وVPS: بانتظار التحقق الميداني.",
    mediaStatus: "وسائط مرتبطة ببيان ARTDACI الرسمي للعمل ld01.",
    error: "تعذر تحميل بيانات المكان.",
  },
};

const language = languageFromSearch(location.search);
const copy = COPY[language];
const dataUrl = new URL("../data/louvre.json", import.meta.url);

init().catch((error) => {
  console.error(error);
  const status = document.querySelector("[data-geo-status]");
  if (status) {
    status.textContent = copy.error;
    status.dataset.state = "error";
  }
});

async function init() {
  setLanguage();
  applyCopy();
  applyLanguageLinks();

  const response = await fetch(dataUrl, { cache: "no-store" });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  const place = await response.json();
  const errors = validatePlaceRecord(place);
  if (errors.length) throw new Error(errors.join("; "));
  renderPlace(place);
  await preferCanonicalImage(place);
}

function setLanguage() {
  document.documentElement.lang = language;
  document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
}

function applyCopy() {
  document.querySelectorAll("[data-copy]").forEach((element) => {
    const value = copy[element.dataset.copy];
    if (value) element.textContent = value;
  });
}

function applyLanguageLinks() {
  document.querySelectorAll("[data-lang-link]").forEach((link) => {
    const targetLanguage = link.dataset.langLink;
    if (!GEO_LANGUAGES.includes(targetLanguage)) return;
    link.href = withLanguage(location.pathname.split("/").pop() || "index.html", targetLanguage);
    link.setAttribute("aria-current", targetLanguage === language ? "page" : "false");
  });
  document.querySelectorAll("[data-geo-link]").forEach((link) => {
    link.href = withLanguage(link.dataset.geoLink, language);
  });
}

function renderPlace(place) {
  const content = place.contents[0];
  document.querySelectorAll("[data-place-name]").forEach((element) => {
    element.textContent = localize(place.name, language);
  });
  document.querySelectorAll("[data-place-city]").forEach((element) => {
    element.textContent = localize(place.city, language);
  });
  document.querySelectorAll("[data-artwork-title]").forEach((element) => {
    element.textContent = localize(content.title, language);
  });
  document.querySelectorAll("[data-artist-name]").forEach((element) => {
    element.textContent = localize(content.artist, language);
  });
  document.querySelectorAll("[data-artwork-id]").forEach((element) => {
    element.textContent = content.artworkId;
  });

  const image = document.querySelector("[data-artwork-image]");
  if (image) {
    image.src = projectAssetUrl(content.media.image.localFallback, import.meta.url);
    image.alt = `${localize(content.title, language)} — ${localize(content.artist, language)}`;
  }
  document.title = `ARTDACI GEO — ${localize(place.name, language)}`;
}

async function preferCanonicalImage(place) {
  const image = document.querySelector("[data-artwork-image]");
  if (!image) return;
  try {
    const response = await fetch(place.mediaResolver.canonicalManifestUrl, {
      cache: "no-store",
      credentials: "omit",
    });
    if (!response.ok) return;
    const manifest = await response.json();
    if (manifest.id !== place.contents[0].artworkId) return;
    const remoteUrl = resolveManifestMedia(manifest, place.contents[0].media.image.manifestKey, language);
    if (!remoteUrl) return;
    const localUrl = image.src;
    image.addEventListener("error", () => { image.src = localUrl; }, { once: true });
    image.src = remoteUrl;
  } catch (error) {
    console.warn("Canonical ld01 image unavailable; keeping the local fallback.", error);
  }
}
