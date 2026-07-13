import * as THREE from "../vendor/three.module.js";
import { GLTFLoader } from "../vendor/GLTFLoader.module.js";
import { MindARThree } from "../vendor/mindar-image-three.prod.js";

const CONFIG = {
  target: "assets/targets/mona-lisa.mind",
  model: "assets/paintings/mona-lisa/mona-lisa.glb",
  manifest: "content/paintings/mona-lisa.json",
  initialScale: 0.42,
  initialRise: 0.18,
  modelRotation: {
    x: 0,
    y: 0,
    z: 0
  }
};

const state = {
  mindarThree: null,
  anchor: null,
  model: null,
  spin: false,
  warmLight: false,
  keepVisible: true,
  targetFoundOnce: false,
  isDragging: false,
  gestureMode: null,
  activePointers: new Map(),
  lastPointerX: 0,
  lastPointerY: 0,
  lastPinchDistance: 0,
  lastTwoFingerY: 0,
  manualRotation: {
    x: 0,
    y: 0
  },
  targetRise: CONFIG.initialRise,
  targetScale: CONFIG.initialScale,
  clock: null,
  manifest: null,
  started: false
};

const hotspotFallback = {
  intro: {
    kicker: "Catalogue",
    title: "Mona Lisa",
    body: "Point your camera at the printed Mona Lisa target. When tracking locks, the 3D model will rise from the page."
  }
};

async function init() {
  bindUI();
  await loadManifest();
  setStartupMessage("Ready. Tap Start Camera and allow camera access.");
}

function bindUI() {
  document.getElementById("start-ar").addEventListener("click", async (event) => {
    if (state.started) return;
    state.started = true;
    event.currentTarget.disabled = true;
    event.currentTarget.textContent = "Starting...";
    await startAR();
  });

  document.getElementById("toggle-spin").addEventListener("click", (event) => {
    state.spin = !state.spin;
    event.currentTarget.classList.toggle("active", state.spin);
  });

  document.getElementById("reset-view").addEventListener("click", () => {
    state.spin = false;
    state.warmLight = false;
    state.keepVisible = true;
    state.manualRotation.x = 0;
    state.manualRotation.y = 0;
    state.targetRise = CONFIG.initialRise;
    state.targetScale = CONFIG.initialScale;
    document.getElementById("toggle-spin").classList.remove("active");
    applyModelRotation();
    updateLighting();
  });

  document.getElementById("close-info").addEventListener("click", () => {
    document.getElementById("info-panel").classList.add("collapsed");
  });

  bindRotationGestures();

  document.querySelectorAll(".hotspot").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".hotspot").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      showHotspot(button.dataset.hotspot);
    });
  });
}

function bindRotationGestures() {
  const root = document.getElementById("ar-root");

  root.addEventListener("pointerdown", (event) => {
    if (!state.model) return;
    event.preventDefault();
    state.activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    root.setPointerCapture?.(event.pointerId);
    updateGestureStart();
  });

  root.addEventListener("pointermove", (event) => {
    if (!state.model || !state.activePointers.has(event.pointerId)) return;
    event.preventDefault();
    state.activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (state.activePointers.size >= 2) {
      handleTwoFingerGesture();
      return;
    }

    if (state.gestureMode !== "rotate") return;

    const deltaX = event.clientX - state.lastPointerX;
    const deltaY = event.clientY - state.lastPointerY;
    state.lastPointerX = event.clientX;
    state.lastPointerY = event.clientY;

    state.manualRotation.y += deltaX * 0.01;
    state.manualRotation.x += deltaY * 0.006;
    state.manualRotation.x = clamp(state.manualRotation.x, -0.65, 0.65);
    applyModelRotation();
  });

  root.addEventListener("pointerup", (event) => {
    state.activePointers.delete(event.pointerId);
    state.isDragging = false;
    root.releasePointerCapture?.(event.pointerId);
    updateGestureStart();
  });

  root.addEventListener("pointercancel", (event) => {
    state.activePointers.delete(event.pointerId);
    state.isDragging = false;
    updateGestureStart();
  });
}

function updateGestureStart() {
  const pointers = [...state.activePointers.values()];

  if (pointers.length === 1) {
    state.gestureMode = "rotate";
    state.isDragging = true;
    state.lastPointerX = pointers[0].x;
    state.lastPointerY = pointers[0].y;
    return;
  }

  if (pointers.length >= 2) {
    state.gestureMode = "transform";
    state.isDragging = false;
    state.lastPinchDistance = getPointerDistance(pointers[0], pointers[1]);
    state.lastTwoFingerY = (pointers[0].y + pointers[1].y) / 2;
    return;
  }

  state.gestureMode = null;
  state.lastPinchDistance = 0;
}

function handleTwoFingerGesture() {
  const pointers = [...state.activePointers.values()];
  if (pointers.length < 2) return;

  const distance = getPointerDistance(pointers[0], pointers[1]);
  const midY = (pointers[0].y + pointers[1].y) / 2;

  if (state.lastPinchDistance > 0) {
    const scaleDelta = distance / state.lastPinchDistance;
    state.targetScale = clamp(state.targetScale * scaleDelta, 0.14, 1.35);
  }

  if (state.lastTwoFingerY > 0) {
    const raiseDelta = (state.lastTwoFingerY - midY) * 0.0025;
    state.targetRise = clamp(state.targetRise + raiseDelta, -0.08, 0.85);
  }

  state.lastPinchDistance = distance;
  state.lastTwoFingerY = midY;
}

function getPointerDistance(first, second) {
  return Math.hypot(first.x - second.x, first.y - second.y);
}

async function loadManifest() {
  try {
    const response = await fetch(CONFIG.manifest);
    state.manifest = await response.json();
    hotspotFallback.intro.body = state.manifest.texts.artisticAnalysis;
  } catch (error) {
    console.warn("Manifest could not be loaded. Using fallback copy.", error);
  }
}

async function startAR() {
  if (!THREE || !MindARThree || !GLTFLoader) {
    showStartupError(new Error(getMissingLibraryMessage()));
    return;
  }

  clearStartupError();

  try {
    await preflightCamera();
  } catch (error) {
    showStartupError(error);
    return;
  }

  try {
    setStartupMessage("Loading image target and preparing the AR engine...");
    state.clock = new THREE.Clock();
    const root = document.getElementById("ar-root");

    state.mindarThree = new MindARThree({
      container: root,
      imageTargetSrc: CONFIG.target,
      filterMinCF: 0.0001,
      filterBeta: 0.001
    });

    const { renderer, scene, camera } = state.mindarThree;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const ambient = new THREE.AmbientLight(0xffffff, 0.72);
    ambient.name = "ambient-light";
    scene.add(ambient);

    const key = new THREE.DirectionalLight(0xfff2dc, 1.15);
    key.name = "key-light";
    key.position.set(1.8, 2.4, 2.2);
    scene.add(key);

    const fill = new THREE.DirectionalLight(0x9fc4ff, 0.35);
    fill.name = "fill-light";
    fill.position.set(-1.4, 0.8, 1.2);
    scene.add(fill);

    state.anchor = state.mindarThree.addAnchor(0);
    state.anchor.group.visible = false;

    addAnchorStage(state.anchor.group);
    await loadModel(state.anchor.group);

    state.anchor.onTargetFound = () => {
      state.targetFoundOnce = true;
      state.anchor.group.visible = true;
      setTrackingStatus(true);
      showHotspot("intro");
    };

    state.anchor.onTargetLost = () => {
      setTrackingStatus(false);
      if (state.keepVisible && state.targetFoundOnce) {
        state.anchor.group.visible = true;
      }
    };

    setStartupMessage("Requesting camera permission...");
    await state.mindarThree.start();
    document.getElementById("loading-screen").classList.add("hidden");
    renderer.setAnimationLoop(() => renderFrame(renderer, scene, camera));
  } catch (error) {
    showStartupError(error);
  }
}

async function preflightCamera() {
  if (!window.isSecureContext) {
    throw new Error("This page is not running in a secure browser context. Camera access requires HTTPS or localhost.");
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("This browser does not expose navigator.mediaDevices.getUserMedia. Use Safari on iOS or Chrome on Android, and avoid in-app browsers.");
  }

  setStartupMessage("Checking camera permission...");
  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: { ideal: "environment" },
      width: { ideal: 1280 },
      height: { ideal: 720 }
    },
    audio: false
  });

  stream.getTracks().forEach((track) => track.stop());
}

function addAnchorStage(group) {
  const frameGeometry = new THREE.BoxGeometry(1.04, 1.48, 0.035);
  const frameMaterial = new THREE.MeshStandardMaterial({
    color: 0x5a3a1d,
    roughness: 0.48,
    metalness: 0.18
  });
  const frame = new THREE.Mesh(frameGeometry, frameMaterial);
  frame.position.z = -0.02;
  group.add(frame);

  const shadowGeometry = new THREE.PlaneGeometry(1.18, 1.62);
  const shadowMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.22,
    side: THREE.DoubleSide
  });
  const shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
  shadow.position.z = -0.04;
  group.add(shadow);
}

async function loadModel(group) {
  setStartupMessage("Loading the 3D Mona Lisa model...");
  const loader = new GLTFLoader();

  return new Promise((resolve, reject) => {
    loader.load(
      CONFIG.model,
      (gltf) => {
        state.model = gltf.scene;
        state.model.name = "mona-lisa-model";
        state.model.scale.setScalar(CONFIG.initialScale);
        state.model.position.set(0, 0, 0);
        applyModelRotation();

        state.model.traverse((child) => {
          if (!child.isMesh) return;
          child.castShadow = false;
          child.receiveShadow = false;
          if (child.material) {
            child.material.side = THREE.DoubleSide;
            child.material.needsUpdate = true;
          }
        });

        group.add(state.model);
        resolve();
      },
      undefined,
      reject
    );
  });
}

function renderFrame(renderer, scene, camera) {
  const delta = state.clock ? state.clock.getDelta() : 0;

  if (state.anchor?.group && state.keepVisible && state.targetFoundOnce) {
    state.anchor.group.visible = true;
  }

  if (state.model) {
    state.model.scale.lerp(new THREE.Vector3(state.targetScale, state.targetScale, state.targetScale), 0.12);
    state.model.position.z += (state.targetRise - state.model.position.z) * 0.08;

    if (state.spin) {
      state.manualRotation.y += delta * 0.55;
      applyModelRotation();
    }
  }

  renderer.render(scene, camera);
}

function updateLighting() {
  const scene = state.mindarThree?.scene;
  if (!scene) return;

  const key = scene.getObjectByName("key-light");
  const fill = scene.getObjectByName("fill-light");
  const ambient = scene.getObjectByName("ambient-light");

  if (state.warmLight) {
    key.color.set(0xffc27a);
    key.intensity = 1.45;
    fill.intensity = 0.12;
    ambient.intensity = 0.5;
  } else {
    key.color.set(0xfff2dc);
    key.intensity = 1.15;
    fill.intensity = 0.35;
    ambient.intensity = 0.72;
  }
}

function applyModelRotation() {
  if (!state.model) return;

  state.model.rotation.set(
    CONFIG.modelRotation.x + state.manualRotation.x,
    CONFIG.modelRotation.y + state.manualRotation.y,
    CONFIG.modelRotation.z
  );
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function setTrackingStatus(locked) {
  const badge = document.getElementById("tracking-status");
  badge.textContent = locked ? "Locked" : "Searching";
  badge.classList.toggle("locked", locked);
  badge.classList.toggle("searching", !locked);
}

function showHotspot(id) {
  const panel = document.getElementById("info-panel");
  const hotspot = getHotspotContent(id);
  document.getElementById("panel-kicker").textContent = hotspot.kicker;
  document.getElementById("panel-title").textContent = hotspot.title;
  document.getElementById("panel-body").textContent = hotspot.body;
  panel.classList.remove("collapsed");
}

function getHotspotContent(id) {
  if (id === "intro") return hotspotFallback.intro;

  const found = state.manifest?.hotspots?.find((item) => item.id === id);
  if (!found) {
    return {
      kicker: "Hotspot",
      title: "Mona Lisa",
      body: "This interpretive layer is ready for future content."
    };
  }

  return {
    kicker: found.category.replaceAll("-", " "),
    title: found.label,
    body: found.body
  };
}

function showStartupError(error) {
  console.error(error);
  const screen = document.getElementById("loading-screen");
  screen.classList.remove("hidden");
  screen.querySelector("h1").textContent = "Camera AR could not start";
  setStartupMessage(
    getFriendlyCameraError(error)
  );
  showErrorDetails(error);
  const button = document.getElementById("start-ar");
  button.disabled = false;
  button.textContent = "Try Again";
  state.started = false;
}

function setStartupMessage(message) {
  const element = document.getElementById("startup-message");
  if (element) element.textContent = message;
}

function clearStartupError() {
  const details = document.getElementById("error-details");
  if (!details) return;
  details.hidden = true;
  details.textContent = "";
}

function showErrorDetails(error) {
  const details = document.getElementById("error-details");
  if (!details) return;

  const lines = [
    `Error name: ${error?.name || "Unknown"}`,
    `Error message: ${error?.message || String(error)}`,
    `Secure context: ${window.isSecureContext}`,
    `getUserMedia available: ${Boolean(navigator.mediaDevices?.getUserMedia)}`,
    `User agent: ${navigator.userAgent}`
  ];

  details.textContent = lines.join("\n");
  details.hidden = false;
}

function getFriendlyCameraError(error) {
  const name = error?.name || "";

  if (name === "NotAllowedError" || name === "PermissionDeniedError") {
    return "Camera permission was blocked. Tap the site controls in the address bar, allow Camera, then try again.";
  }

  if (name === "NotFoundError" || name === "DevicesNotFoundError") {
    return "No camera was found. Test on a phone/tablet with a working rear camera, or connect a webcam.";
  }

  if (name === "NotReadableError" || name === "TrackStartError") {
    return "The camera is already in use by another app or browser tab. Close other camera apps and try again.";
  }

  if (name === "OverconstrainedError") {
    return "The requested camera settings are not available on this device. Try another browser or device.";
  }

  if (name === "SecurityError") {
    return "The browser blocked camera access for security reasons. Use HTTPS and avoid embedded/in-app browsers.";
  }

  if (String(error?.message || "").includes("Required AR libraries")) {
    return "The AR JavaScript libraries did not load. Re-upload the complete project, including the vendor folder.";
  }

  return "The browser or AR engine refused camera startup. See the technical details below, then try Safari on iOS or Chrome on Android.";
}

function getMissingLibraryMessage() {
  const missing = [];

  if (!THREE) missing.push("vendor/three.module.js");
  if (!GLTFLoader) missing.push("vendor/GLTFLoader.module.js");
  if (!MindARThree) missing.push("vendor/mindar-image-three.prod.js");

  return `Required AR libraries did not load: ${missing.join(", ")}`;
}

window.addEventListener("load", init);
