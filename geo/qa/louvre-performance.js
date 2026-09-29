const MODEL_ROOT = "../../assets/environments/gallery/models/museums/";
const BASIS_TRANSCODER = "https://www.gstatic.com/basis-universal/versioned/2021-04-15-ba1c3e4/";

const variants = {
  "quest-webp": {
    name: "Quest WebP 2K",
    file: "Louvre-full-joint-quest.glb",
    bytes: 7_690_072,
    textureBytes: null,
    gpuMiB: 160,
    strategy: "WebP 2K · GPU RGB8 estimé",
  },
  "quest-ktx1k": {
    name: "Quest KTX2 1K actuel",
    file: "Louvre-full-joint-quest-ktx2-1k.glb",
    bytes: 7_704_904,
    textureBytes: 3_267_572,
    gpuMiB: 6.67,
    strategy: "Normal UASTC · autres ETC1S",
  },
  "quest-ktx1k-base-padding-clean-uastc": {
    name: "Quest KTX2 1K corrigé · validé Quest 3S",
    file: "Louvre-full-joint-quest-ktx2-1k-mat001-basecolor-padding-clean-uastc.glb",
    bytes: 8_588_080,
    textureBytes: 4_150_742,
    gpuMiB: 6.67,
    strategy: "Validé Meta Quest 3S · padding UV nettoyé · normal + baseColor UASTC",
  },
  "quest-ktx512": {
    name: "Quest KTX2 512 · basse mémoire",
    file: "Louvre-full-joint-quest-ktx2-512.glb",
    bytes: 5_368_512,
    textureBytes: 931_186,
    gpuMiB: 1.67,
    strategy: "Normal UASTC · autres ETC1S · 512 px",
  },
};

const COPY = {
  fr: {
    title: "Comparaison Louvre — Quest", intro: "Page expérimentale locale, absente de la navigation publique.", active: "Variante active",
    variant: "Variante à tester", mainGroup: "Comparaison principale", labGroup: "Isolation V3.2", load: "Charger / recharger", fallback: "Fallback WebP", recenter: "Recentrer", fullscreen: "Plein écran",
    xrChecking: "Vérification…", xrReady: "Compatible", xrUnavailable: "Indisponible", xrInfo: "Le test visuel 3D reste disponible sans session immersive.", xrStart: "Lancer WebXR",
    diagnostics: "Diagnostic", download: "Téléchargement", texturePayload: "Payload KTX2", gpu: "Mémoire textures GPU estimée", triangles: "Triangles", strategy: "Stratégie", loadTime: "Temps de chargement observé", progress: "Progression",
    basis: "Transcodeur actuel fourni à l’exécution par gstatic ; l’hébergement local est prévu pour une version de production.", loading: "Chargement de {name}…", ready: "Prêt en {seconds} s", failed: "Échec du chargement de {name}", unavailable: "WebXR immersif indisponible dans ce contexte.", available: "Session immersive-ar disponible ; activation uniquement sur action utilisateur.", vrOnly: "immersive-vr est pris en charge, mais cette page QA orbitale n’ouvre pas de session VR.", unknown: "Non applicable", pending: "En attente",
  },
  en: {
    title: "Louvre comparison — Quest", intro: "Local experimental page, not linked from public navigation.", active: "Active variant",
    variant: "Variant to test", mainGroup: "Main comparison", labGroup: "V3.2 isolation", load: "Load / reload", fallback: "WebP fallback", recenter: "Recenter", fullscreen: "Fullscreen",
    xrChecking: "Checking…", xrReady: "Compatible", xrUnavailable: "Unavailable", xrInfo: "The visual 3D test remains available without an immersive session.", xrStart: "Start WebXR",
    diagnostics: "Diagnostics", download: "Download", texturePayload: "KTX2 payload", gpu: "Estimated GPU texture memory", triangles: "Triangles", strategy: "Strategy", loadTime: "Observed load time", progress: "Progress",
    basis: "The current transcoder is supplied at runtime by gstatic; local hosting is planned for production.", loading: "Loading {name}…", ready: "Ready in {seconds}s", failed: "Failed to load {name}", unavailable: "Immersive WebXR is unavailable in this context.", available: "An immersive-ar session is available; activation requires a user action.", vrOnly: "immersive-vr is supported, but this orbital QA page does not start a VR session.", unknown: "Not applicable", pending: "Pending",
  },
  ar: {
    title: "مقارنة اللوفر — Quest", intro: "صفحة تجريبية محلية غير مرتبطة بالتنقل العام.", active: "النسخة النشطة",
    variant: "النسخة المراد اختبارها", mainGroup: "المقارنة الرئيسية", labGroup: "عزل V3.2", load: "تحميل / إعادة تحميل", fallback: "الرجوع إلى WebP", recenter: "إعادة التوسيط", fullscreen: "ملء الشاشة",
    xrChecking: "جارٍ التحقق…", xrReady: "متوافق", xrUnavailable: "غير متاح", xrInfo: "يبقى الاختبار المرئي ثلاثي الأبعاد متاحًا من دون جلسة غامرة.", xrStart: "تشغيل WebXR",
    diagnostics: "التشخيص", download: "التنزيل", texturePayload: "حمولة KTX2", gpu: "ذاكرة القوام الرسومية التقديرية", triangles: "المثلثات", strategy: "الاستراتيجية", loadTime: "زمن التحميل الملحوظ", progress: "التقدم",
    basis: "يوفّر gstatic محوّل الشفرة الحالي وقت التشغيل؛ ومن المخطط استضافته محليًا للإنتاج.", loading: "جارٍ تحميل {name}…", ready: "جاهز خلال {seconds} ث", failed: "تعذر تحميل {name}", unavailable: "WebXR الغامر غير متاح في هذا السياق.", available: "جلسة immersive-ar متاحة؛ ولا يبدأ تشغيلها إلا بتفاعل المستخدم.", vrOnly: "جلسة immersive-vr مدعومة، لكن صفحة QA المدارية هذه لا تبدأ جلسة VR.", unknown: "غير منطبق", pending: "في الانتظار",
  },
};

const params = new URLSearchParams(location.search);
const language = ["fr", "en", "ar"].includes(params.get("lang")) ? params.get("lang") : "fr";
const copy = COPY[language];
const viewer = document.getElementById("louvre-viewer");
const frame = document.getElementById("viewer-frame");
const select = document.getElementById("variant-select");
const status = document.getElementById("load-status");
let activeKey = "quest-ktx1k-base-padding-clean-uastc";
let loadStarted = 0;

document.documentElement.lang = language;
document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
for (const node of document.querySelectorAll("[data-copy]")) node.textContent = copy[node.dataset.copy];
for (const node of document.querySelectorAll("[data-copy-label]")) node.label = copy[node.dataset.copyLabel];
for (const link of document.querySelectorAll(".language-switcher a")) {
  if (link.hreflang === language) link.setAttribute("aria-current", "page");
}

const formatMiB = (bytes) => `${(bytes / 1048576).toFixed(2)} MiB`;
const interpolate = (value, replacements) => Object.entries(replacements).reduce((text, [key, replacement]) => text.replace(`{${key}}`, replacement), value);

function renderMetrics(variant) {
  document.getElementById("active-name").textContent = variant.name;
  document.getElementById("metric-file").textContent = formatMiB(variant.bytes);
  document.getElementById("metric-textures").textContent = variant.textureBytes ? formatMiB(variant.textureBytes) : copy.unknown;
  document.getElementById("metric-gpu").textContent = `≈ ${variant.gpuMiB.toFixed(2)} MiB`;
  document.getElementById("metric-triangles").textContent = "779 027";
  document.getElementById("metric-strategy").textContent = variant.strategy;
  document.getElementById("metric-time").textContent = copy.pending;
  document.getElementById("metric-progress").textContent = "0 %";
}

function loadVariant(key = select.value) {
  activeKey = variants[key] ? key : "quest-webp";
  select.value = activeKey;
  const variant = variants[activeKey];
  renderMetrics(variant);
  status.className = "load-status";
  status.textContent = interpolate(copy.loading, { name: variant.name });
  loadStarted = performance.now();
  const source = new URL(MODEL_ROOT + variant.file, import.meta.url);
  source.searchParams.set("qaReload", String(Date.now()));
  viewer.src = source.href;
  viewer.alt = variant.name;
}

function recenter() {
  viewer.cameraOrbit = "35deg 70deg auto";
  viewer.cameraTarget = "auto auto auto";
  viewer.fieldOfView = "35deg";
  viewer.jumpCameraToGoal?.();
}

viewer.addEventListener("progress", (event) => {
  document.getElementById("metric-progress").textContent = `${Math.round((event.detail?.totalProgress || 0) * 100)} %`;
});
viewer.addEventListener("load", () => {
  const seconds = ((performance.now() - loadStarted) / 1000).toFixed(2);
  document.getElementById("metric-time").textContent = `${seconds} s`;
  document.getElementById("metric-progress").textContent = "100 %";
  status.className = "load-status ready";
  status.textContent = interpolate(copy.ready, { seconds });
});
viewer.addEventListener("error", () => {
  status.className = "load-status error";
  status.textContent = interpolate(copy.failed, { name: variants[activeKey].name });
});

document.getElementById("load-button").addEventListener("click", () => loadVariant());
document.getElementById("fallback-button").addEventListener("click", () => loadVariant("quest-webp"));
document.getElementById("recenter-button").addEventListener("click", recenter);
document.getElementById("fullscreen-button").addEventListener("click", async () => {
  if (document.fullscreenElement) await document.exitFullscreen();
  else await frame.requestFullscreen();
});

async function configureWebXR() {
  const indicator = document.getElementById("xr-indicator");
  const detail = document.getElementById("xr-detail");
  const button = document.getElementById("xr-button");
  let immersiveAr = false;
  let immersiveVr = false;
  try {
    if (window.isSecureContext && navigator.xr) {
      [immersiveAr, immersiveVr] = await Promise.all([
        navigator.xr.isSessionSupported("immersive-ar"),
        navigator.xr.isSessionSupported("immersive-vr"),
      ]);
    }
  } catch (error) {
    console.info("WebXR capability query failed; continuing in 3D mode.", error);
  }
  const anyImmersive = immersiveAr || immersiveVr;
  indicator.className = `indicator ${anyImmersive ? "ready" : "unavailable"}`;
  indicator.textContent = anyImmersive ? copy.xrReady : copy.xrUnavailable;
  detail.textContent = immersiveAr ? copy.available : immersiveVr ? copy.vrOnly : copy.unavailable;
  button.disabled = !immersiveAr;
  if (immersiveAr) button.addEventListener("click", () => viewer.activateAR());
}

await customElements.whenDefined("model-viewer");
const ModelViewerElement = customElements.get("model-viewer");
if (ModelViewerElement) ModelViewerElement.modelCacheSize = 1;
select.value = activeKey;
loadVariant(activeKey);
configureWebXR();

window.__ARTDACI_GEO_QA__ = { variants, BASIS_TRANSCODER, loadVariant, recenter };
