import * as THREE from "../vendor/three.module.js";
import { GLTFLoader } from "../vendor/GLTFLoader.module.js";
import { DRACOLoader } from "../vendor/DRACOLoader.module.js";
import { fetchArtworkManifest } from "./artwork-media-manifest.js";
import { resolveManifestMedia } from "./artwork-media-manifest-core.mjs";
import { classifyUnresolvedArtworkRoute, resolveImmersiveArtworkRoute } from "./catalogue.js";

const PAINTINGS = {
  "mona-lisa": "content/paintings/mona-lisa.json",
  "van-gogh": "content/paintings/van-gogh.json",
  "van-gogh-bedroom": "content/paintings/van-gogh-bedroom.json",
  "vermeer-girl-with-a-pearl-earring": "content/paintings/vermeer-girl-with-a-pearl-earring.json"
};

const COPY = {
  en: {
    back: "Back",
    kicker: "Headset experience",
    enter: "Enter VR",
    exit: "Exit VR",
    model: "3D model",
    reset: "Reset model",
    loading: "Loading 3D model…",
    ready: "Ready. Put on your headset and select Enter VR.",
    routeUnavailableTitle: "Experience unavailable",
    routeUnavailable: "This artwork is known, but individual VR is not available for it yet.",
    routeUnknownTitle: "Artwork not found",
    routeUnknown: "The requested artwork was not recognized. Return to the catalogue to choose an available experience.",
    unsupported: "Immersive VR is not available in this browser. Open this page in Meta Quest Browser or another WebXR headset.",
    failed: "The VR experience could not start.",
    instructions: "Trigger: grab, move and rotate. Use both triggers to resize and rotate."
  },
  fr: {
    back: "Retour",
    kicker: "Expérience dans un casque",
    enter: "Entrer en VR",
    exit: "Quitter la VR",
    model: "Modèle 3D",
    reset: "Réinitialiser",
    loading: "Chargement du modèle 3D…",
    ready: "Prêt. Mettez votre casque puis sélectionnez Entrer en VR.",
    routeUnavailableTitle: "Expérience indisponible",
    routeUnavailable: "Cette œuvre est connue, mais la VR individuelle n'est pas encore disponible.",
    routeUnknownTitle: "Œuvre introuvable",
    routeUnknown: "L'œuvre demandée n'a pas été reconnue. Revenez au catalogue pour choisir une expérience disponible.",
    unsupported: "La VR immersive n’est pas disponible dans ce navigateur. Ouvrez cette page dans Meta Quest Browser ou un autre casque WebXR.",
    failed: "L’expérience VR n’a pas pu démarrer.",
    instructions: "Gâchette : saisir, déplacer et orienter. Utilisez les deux gâchettes pour redimensionner et faire pivoter."
  },
  ar: {
    back: "رجوع",
    kicker: "تجربة جهاز الواقع الافتراضي",
    enter: "دخول الواقع الافتراضي",
    exit: "الخروج من الواقع الافتراضي",
    model: "نموذج ثلاثي الأبعاد",
    reset: "إعادة ضبط النموذج",
    loading: "جارٍ تحميل النموذج ثلاثي الأبعاد...",
    ready: "جاهز. ضع الجهاز ثم اختر دخول الواقع الافتراضي.",
    routeUnavailableTitle: "التجربة غير متاحة",
    routeUnavailable: "هذه اللوحة معروفة، لكن تجربة الواقع الافتراضي الفردية غير متاحة بعد.",
    routeUnknownTitle: "اللوحة غير موجودة",
    routeUnknown: "لم يتم التعرف على اللوحة المطلوبة. ارجع إلى الفهرس لاختيار تجربة متاحة.",
    unsupported: "الواقع الافتراضي غير متاح في هذا المتصفح. افتح الصفحة في متصفح Meta Quest أو جهاز WebXR.",
    failed: "تعذر بدء تجربة الواقع الافتراضي.",
    instructions: "الزناد: إمساك وتحريك وتدوير. استخدم الزنادين معاً لتغيير الحجم والتدوير."
  }
};

const params = new URLSearchParams(location.search);
const requestedPainting = params.get("painting");
const paintingRoute = resolveImmersiveArtworkRoute(requestedPainting, "vr");
const slug = paintingRoute?.runtimeSlug
  || (requestedPainting !== null && PAINTINGS[requestedPainting] ? requestedPainting : null);
const lang = ["en", "fr", "ar"].includes(params.get("lang")) ? params.get("lang") : "en";
const requestedModel = Number.parseInt(params.get("model") || "0", 10);
const text = COPY[lang];
const ARABIC_TITLES = {
  "mona-lisa": "الموناليزا",
  "van-gogh": "بورتريه ذاتي لفان غوخ",
  "van-gogh-bedroom": "غرفة النوم",
  "vermeer-girl-with-a-pearl-earring": "الفتاة ذات القرط اللؤلؤي"
};

const stage = document.getElementById("vr-stage");
const status = document.getElementById("vr-status");
const enterButton = document.getElementById("enter-vr");
const resetButton = document.getElementById("vr-reset");
const modelChoice = document.getElementById("vr-model-choice");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x171411);

const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.05, 100);
camera.position.set(0, 1.6, 3);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.xr.enabled = true;
renderer.xr.setReferenceSpaceType("local-floor");
stage.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xfff4df, 0x353b48, 1.5));
const keyLight = new THREE.DirectionalLight(0xffffff, 1.6);
keyLight.position.set(2, 4, 3);
scene.add(keyLight);

const floor = new THREE.Mesh(
  new THREE.CircleGeometry(8, 64),
  new THREE.MeshStandardMaterial({ color: 0x24211d, roughness: 0.92 })
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);
scene.add(new THREE.GridHelper(12, 24, 0x806c48, 0x40382e));

const modelRoot = new THREE.Group();
scene.add(modelRoot);

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("vendor/draco/");
const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);
const modelCache = new Map();
const controllers = [renderer.xr.getController(0), renderer.xr.getController(1)];
const grabbing = new Set();
const raycaster = new THREE.Raycaster();
const rayMatrix = new THREE.Matrix4();
const initialPose = {
  position: new THREE.Vector3(0, 1.25, -2),
  quaternion: new THREE.Quaternion(),
  scale: new THREE.Vector3(1, 1, 1)
};
let modelObject = null;
let variants = [];
let twoHandState = null;
let currentSession = null;
let currentVariantIndex = -1;

init();

async function init() {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  applyCopy();

  if (!slug) {
    await showUnavailableRoute();
    return;
  }
  addControllers();
  bindUI();

  try {
    const response = await fetch(PAINTINGS[slug], { cache: "reload" });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    const manifest = await response.json();
    variants = await configureModelVariants(getModelVariants(manifest));
    document.getElementById("vr-title").textContent = lang === "ar"
      ? ARABIC_TITLES[slug] || manifest.title || "ARTDACI VR"
      : manifest.title || "ARTDACI VR";
    renderVariantOptions();
    const index = THREE.MathUtils.clamp(Number.isFinite(requestedModel) ? requestedModel : 0, 0, variants.length - 1);
    modelChoice.value = String(index);
    await loadVariant(index);
    await detectVR();
  } catch (error) {
    console.error(error);
    status.textContent = `${text.failed} ${error.message}`;
  }

  renderer.setAnimationLoop(render);
}

async function showUnavailableRoute() {
  const routeKind = await classifyUnresolvedArtworkRoute(requestedPainting);
  const isKnown = routeKind === "unsupported";
  const title = text[isKnown ? "routeUnavailableTitle" : "routeUnknownTitle"];
  const message = text[isKnown ? "routeUnavailable" : "routeUnknown"];

  document.title = `DACIART - ${title}`;
  document.getElementById("vr-title").textContent = title;
  status.textContent = message;
  status.setAttribute("role", "alert");
  enterButton.style.display = "none";
  resetButton.style.display = "none";
  modelChoice.style.display = "none";
  document.getElementById("vr-model-label").style.display = "none";
  stage.style.display = "none";
  stage.setAttribute("aria-hidden", "true");
}

function applyCopy() {
  document.getElementById("vr-back").textContent = text.back;
  document.getElementById("vr-back").href = slug
    ? `space.html?painting=${encodeURIComponent(slug)}&lang=${lang}`
    : (lang === "ar" ? "index-ar.html" : lang === "fr" ? "index-fr.html" : "index.html");
  document.getElementById("gallery-link").textContent = lang === "ar" ? "معرض الواقع الافتراضي" : lang === "fr" ? "Galerie VR" : "VR Gallery";
  document.getElementById("gallery-link").href = `gallery-vr.html?lang=${lang}`;
  document.getElementById("vr-kicker").textContent = text.kicker;
  document.getElementById("vr-instructions").textContent = text.instructions;
  document.getElementById("vr-model-label").textContent = text.model;
  enterButton.textContent = text.enter;
  resetButton.textContent = text.reset;
}

function getModelVariants(manifest) {
  const list = manifest.media?.modelVariants || manifest.ar?.modelVariants || [];
  if (Array.isArray(list) && list.length) {
    return list.filter((variant) => variant?.src).map((variant) => ({
      ...variant,
      localSrc: variant.src,
      remoteSrc: "",
      loadedSrc: ""
    }));
  }
  const src = manifest.media?.model || manifest.ar?.primaryModel;
  return src ? [{
    id: "model-1",
    label: { en: "Model 1", fr: "Modèle 1" },
    src,
    localSrc: src,
    remoteSrc: "",
    loadedSrc: ""
  }] : [];
}

async function configureModelVariants(localVariants) {
  const config = getArtworkMediaConfig();
  if (!config) return localVariants;

  try {
    const mediaManifest = await fetchArtworkManifest(config.manifestUrl);
    if (mediaManifest?.id !== config.artworkId) return localVariants;

    localVariants.forEach((variant) => {
      const mediaKey = config.modelKeys[variant.id];
      if (!mediaKey) return;

      try {
        variant.remoteSrc = resolveManifestMedia(mediaManifest, mediaKey, lang) || "";
      } catch (error) {
        console.warn(`Remote model unavailable for ${variant.id}; keeping the local model.`, error);
      }
    });
  } catch (error) {
    console.warn("Artwork media manifest unavailable; keeping the local VR models.", error);
  }

  return localVariants;
}

function getArtworkMediaConfig() {
  const element = [...document.querySelectorAll("[data-artwork-media-manifest-url]")]
    .find((candidate) => candidate.dataset.artworkMediaFor === slug);
  if (!element?.dataset.artworkMediaId || !element.dataset.artworkMediaManifestUrl) return null;

  try {
    const modelKeys = JSON.parse(element.dataset.artworkMediaModelKeys || "{}");
    if (!modelKeys || typeof modelKeys !== "object" || Array.isArray(modelKeys)) return null;
    return {
      artworkId: element.dataset.artworkMediaId,
      manifestUrl: element.dataset.artworkMediaManifestUrl,
      modelKeys
    };
  } catch (error) {
    console.warn("Invalid declarative artwork media configuration; keeping the local VR models.", error);
    return null;
  }
}

function getVariantLabel(variant, index) {
  if (typeof variant.label === "string") return variant.label;
  if (lang === "ar") return variant.label?.ar || `النموذج ${index + 1}`;
  return variant.label?.[lang] || variant.label?.en || `Model ${index + 1}`;
}

function renderVariantOptions() {
  modelChoice.replaceChildren();
  variants.forEach((variant, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = getVariantLabel(variant, index);
    modelChoice.appendChild(option);
  });
}

async function loadVariant(index) {
  const variant = variants[index];
  if (!variant) return;
  if (index === currentVariantIndex && modelObject) {
    resetModel();
    status.textContent = text.ready;
    return;
  }

  const previousIndex = currentVariantIndex;
  status.textContent = text.loading;
  modelChoice.disabled = true;

  try {
    const nextModel = await loadVariantModel(variant);
    if (modelObject) modelRoot.remove(modelObject);
    modelObject = nextModel;
    modelRoot.add(modelObject);
    currentVariantIndex = index;
    modelChoice.value = String(index);
    resetModel();
    status.textContent = text.ready;
  } catch (error) {
    if (previousIndex >= 0) modelChoice.value = String(previousIndex);
    throw error;
  } finally {
    modelChoice.disabled = false;
  }
}

async function loadVariantModel(variant) {
  const preferredSrc = variant.loadedSrc || variant.remoteSrc || variant.localSrc;

  try {
    const model = await loadModel(preferredSrc);
    variant.loadedSrc = preferredSrc;
    return model;
  } catch (error) {
    if (preferredSrc === variant.localSrc) throw error;
    console.warn(`Remote GLB unavailable for ${variant.id}; loading the local model.`, error);
    const model = await loadModel(variant.localSrc);
    variant.loadedSrc = variant.localSrc;
    return model;
  }
}

function loadModel(src) {
  if (!modelCache.has(src)) {
    const request = loader.loadAsync(src)
      .then((gltf) => {
        normalizeModel(gltf.scene);
        return gltf.scene;
      })
      .catch((error) => {
        modelCache.delete(src);
        throw error;
      });
    modelCache.set(src, request);
  }

  return modelCache.get(src);
}

function normalizeModel(object) {
  object.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const largest = Math.max(size.x, size.y, size.z) || 1;
  const scale = 1.25 / largest;
  object.scale.setScalar(scale);
  object.position.copy(center).multiplyScalar(-scale);
  object.updateMatrixWorld(true);
  const normalizedBox = new THREE.Box3().setFromObject(object);
  object.position.y -= normalizedBox.min.y;
}

function bindUI() {
  enterButton.addEventListener("click", toggleVR);
  resetButton.addEventListener("click", resetModel);
  modelChoice.addEventListener("change", () => loadVariant(Number(modelChoice.value)).catch(showError));
  addEventListener("resize", resize);
}

async function detectVR() {
  if (!navigator.xr) {
    status.textContent = text.unsupported;
    return;
  }
  const supported = await navigator.xr.isSessionSupported("immersive-vr");
  enterButton.disabled = !supported;
  status.textContent = supported ? text.ready : text.unsupported;
}

async function toggleVR() {
  try {
    if (currentSession) {
      await currentSession.end();
      return;
    }
    currentSession = await navigator.xr.requestSession("immersive-vr", {
      optionalFeatures: ["local-floor", "bounded-floor", "hand-tracking"]
    });
    currentSession.addEventListener("end", () => {
      currentSession = null;
      enterButton.textContent = text.enter;
      grabbing.clear();
      twoHandState = null;
    }, { once: true });
    await renderer.xr.setSession(currentSession);
    enterButton.textContent = text.exit;
  } catch (error) {
    showError(error);
  }
}

function addControllers() {
  controllers.forEach((controller, index) => {
    controller.userData.index = index;
    controller.addEventListener("selectstart", () => startGrab(index));
    controller.addEventListener("selectend", () => endGrab(index));

    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, -1)
    ]);
    const line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0xc7a45d }));
    line.scale.z = 4;
    controller.add(line);
    scene.add(controller);
  });
}

function controllerHitsModel(controller) {
  if (!modelObject) return false;
  rayMatrix.identity().extractRotation(controller.matrixWorld);
  raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
  raycaster.ray.direction.set(0, 0, -1).applyMatrix4(rayMatrix).normalize();
  return raycaster.intersectObject(modelRoot, true).length > 0;
}

function startGrab(index) {
  const controller = controllers[index];
  if (!controllerHitsModel(controller) && grabbing.size === 0) return;
  grabbing.add(index);

  if (grabbing.size === 1) {
    controller.attach(modelRoot);
  } else {
    scene.attach(modelRoot);
    beginTwoHandTransform();
  }
}

function endGrab(index) {
  if (!grabbing.has(index)) return;
  scene.attach(modelRoot);
  grabbing.delete(index);
  twoHandState = null;

  if (grabbing.size === 1) {
    const remainingIndex = [...grabbing][0];
    controllers[remainingIndex].attach(modelRoot);
  }
}

function beginTwoHandTransform() {
  const [first, second] = [...grabbing].slice(0, 2).map((index) => controllers[index]);
  const a = first.getWorldPosition(new THREE.Vector3());
  const b = second.getWorldPosition(new THREE.Vector3());
  twoHandState = {
    startMidpoint: a.clone().add(b).multiplyScalar(0.5),
    startVector: b.clone().sub(a),
    startPosition: modelRoot.position.clone(),
    startQuaternion: modelRoot.quaternion.clone(),
    startScale: modelRoot.scale.clone()
  };
}

function updateTwoHandTransform() {
  if (!twoHandState || grabbing.size < 2) return;
  const [first, second] = [...grabbing].slice(0, 2).map((index) => controllers[index]);
  const a = first.getWorldPosition(new THREE.Vector3());
  const b = second.getWorldPosition(new THREE.Vector3());
  const midpoint = a.clone().add(b).multiplyScalar(0.5);
  const currentVector = b.clone().sub(a);
  const startLength = twoHandState.startVector.length() || 1;
  const scaleFactor = THREE.MathUtils.clamp(currentVector.length() / startLength, 0.1, 10);
  const rotation = new THREE.Quaternion().setFromUnitVectors(
    twoHandState.startVector.clone().normalize(),
    currentVector.clone().normalize()
  );

  modelRoot.position.copy(twoHandState.startPosition).add(midpoint.sub(twoHandState.startMidpoint));
  modelRoot.quaternion.copy(rotation.multiply(twoHandState.startQuaternion));
  modelRoot.scale.copy(twoHandState.startScale).multiplyScalar(scaleFactor);
}

function resetModel() {
  scene.attach(modelRoot);
  grabbing.clear();
  twoHandState = null;
  modelRoot.position.copy(initialPose.position);
  modelRoot.quaternion.copy(initialPose.quaternion);
  modelRoot.scale.copy(initialPose.scale);
}

function resize() {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
}

function render() {
  updateTwoHandTransform();
  renderer.render(scene, camera);
}

function showError(error) {
  console.error(error);
  status.textContent = `${text.failed} ${error.message || ""}`.trim();
}
