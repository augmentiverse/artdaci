import * as THREE from "../vendor/three.module.js";

const MANIFESTS = [
  "content/paintings/mona-lisa.json",
  "content/paintings/van-gogh.json",
  "content/paintings/van-gogh-bedroom.json",
  "content/paintings/vermeer-girl-with-a-pearl-earring.json"
];

const params = new URLSearchParams(location.search);
const lang = params.get("lang") === "fr" ? "fr" : "en";
const PAINTING_INFO = {
  en: {
    "mona-lisa": "Leonardo used delicate layers of sfumato to soften outlines and give the sitter a lifelike presence. Her expression and the imaginary landscape seem to change as we look.",
    "van-gogh": "Van Gogh painted this self-portrait in Paris in 1887. Short, directional brushstrokes and complementary colours turn his face into an intense study of artistic identity.",
    "van-gogh-bedroom": "Van Gogh painted his room in the Yellow House at Arles as a place of rest. Tilted perspective, strong outlines and expressive colour make the familiar room feel deeply personal.",
    "vermeer-girl-with-a-pearl-earring": "This is a tronie: a character study rather than a formal portrait. Vermeer used ultramarine, soft light and a few bright highlights to create the girl’s direct, memorable presence."
  },
  fr: {
    "mona-lisa": "Léonard utilise de fines couches de sfumato pour adoucir les contours et donner vie au modèle. Son expression et le paysage imaginaire semblent changer au fil du regard.",
    "van-gogh": "Van Gogh peint cet autoportrait à Paris en 1887. Les touches courtes et les couleurs complémentaires transforment son visage en une étude intense de l’identité artistique.",
    "van-gogh-bedroom": "Van Gogh représente sa chambre de la Maison jaune à Arles comme un lieu de repos. La perspective inclinée, les contours marqués et la couleur expressive rendent cet espace très personnel.",
    "vermeer-girl-with-a-pearl-earring": "Cette œuvre est une tronie, une étude de caractère plutôt qu’un portrait officiel. Vermeer associe outremer, lumière douce et quelques reflets pour créer une présence inoubliable."
  }
};
const COPY = {
  en: {
    back: "Back to collection",
    kicker: "Immersive exhibition",
    title: "The ARTDACI Gallery",
    instructions: "Trigger: teleport. A/X: play or pause. B/Y: restart audio. Press a thumbstick to mute.",
    enter: "Enter VR Gallery",
    exit: "Exit VR",
    count: "Four masterpieces",
    loading: "Preparing the gallery…",
    ready: "Gallery ready. Open this page in your headset and enter VR.",
    unsupported: "The gallery preview is ready. For immersive access, open it in Meta Quest Browser or another WebXR headset.",
    failed: "The gallery could not be loaded.",
    playAudio: "Play audio",
    pauseAudio: "Pause audio",
    restartAudio: "Restart",
    muteAudio: "Mute",
    unmuteAudio: "Unmute"
  },
  fr: {
    back: "Retour à la collection",
    kicker: "Exposition immersive",
    title: "La galerie ARTDACI",
    instructions: "Gâchette : téléportation. A/X : lecture ou pause. B/Y : recommencer. Appuyez sur un joystick pour couper le son.",
    enter: "Entrer dans la galerie VR",
    exit: "Quitter la VR",
    count: "Quatre chefs-d’œuvre",
    loading: "Préparation de la galerie…",
    ready: "Galerie prête. Ouvrez cette page dans votre casque puis entrez en VR.",
    unsupported: "L’aperçu de la galerie est prêt. Pour l’immersion, ouvrez-la dans Meta Quest Browser ou un autre casque WebXR.",
    failed: "La galerie n’a pas pu être chargée.",
    playAudio: "Lire l’audio",
    pauseAudio: "Pause",
    restartAudio: "Recommencer",
    muteAudio: "Couper le son",
    unmuteAudio: "Rétablir le son"
  }
};
const text = COPY[lang];

const stage = document.getElementById("gallery-stage");
const status = document.getElementById("gallery-status");
const enterButton = document.getElementById("enter-gallery-vr");
const audioToggleButton = document.getElementById("gallery-audio-toggle");
const audioRestartButton = document.getElementById("gallery-audio-restart");
const audioMuteButton = document.getElementById("gallery-audio-mute");
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x191714);
scene.fog = new THREE.Fog(0x191714, 12, 26);

const camera = new THREE.PerspectiveCamera(62, innerWidth / innerHeight, 0.05, 60);
camera.position.set(0, 1.65, 4);
const audioListener = new THREE.AudioListener();
camera.add(audioListener);
const visitor = new THREE.Group();
visitor.add(camera);
scene.add(visitor);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.enabled = true;
renderer.xr.enabled = true;
renderer.xr.setReferenceSpaceType("local-floor");
stage.appendChild(renderer.domElement);

const textureLoader = new THREE.TextureLoader();
const audioLoader = new THREE.AudioLoader();
const controllers = [renderer.xr.getController(0), renderer.xr.getController(1)];
const teleportTargets = [];
const exhibits = [];
const teleportRaycaster = new THREE.Raycaster();
const rayRotation = new THREE.Matrix4();
const clock = new THREE.Clock();
let currentSession = null;
let snapTurnReady = true;
let activeExhibit = null;
let audioMuted = false;
const controllerCommandState = new Map();

init();

async function init() {
  applyCopy();
  buildRoom();
  addControllers();
  bindUI();

  try {
    const responses = await Promise.all(MANIFESTS.map((url) => fetch(url, { cache: "reload" })));
    if (responses.some((response) => !response.ok)) throw new Error("Manifest unavailable");
    const paintings = await Promise.all(responses.map((response) => response.json()));
    await buildExhibition(paintings);
    await detectVR();
  } catch (error) {
    console.error(error);
    status.textContent = `${text.failed} ${error.message}`;
  }

  renderer.setAnimationLoop(render);
}

function applyCopy() {
  document.documentElement.lang = lang;
  document.title = `DACIART — ${text.title}`;
  document.getElementById("gallery-back").textContent = text.back;
  document.getElementById("gallery-back").href = lang === "fr" ? "index-fr.html" : "index.html";
  document.getElementById("gallery-kicker").textContent = text.kicker;
  document.getElementById("gallery-title").textContent = text.title;
  document.getElementById("gallery-instructions").textContent = text.instructions;
  document.getElementById("gallery-count").textContent = text.count;
  enterButton.textContent = text.enter;
  audioToggleButton.textContent = text.playAudio;
  audioRestartButton.textContent = text.restartAudio;
  audioMuteButton.textContent = text.muteAudio;
  status.textContent = text.loading;
}

function buildRoom() {
  scene.add(new THREE.HemisphereLight(0xfff5df, 0x342e27, 1.15));

  const ceilingLights = [
    [-3, 3.5, 1.5],
    [3, 3.5, 1.5],
    [-3, 3.5, -3],
    [3, 3.5, -3]
  ];
  ceilingLights.forEach(([x, y, z]) => {
    const light = new THREE.PointLight(0xffe7c2, 0.82, 9);
    light.position.set(x, y, z);
    scene.add(light);
  });

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(12, 10),
    new THREE.MeshStandardMaterial({ color: 0x594d40, roughness: 0.88 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  floor.name = "gallery-floor";
  scene.add(floor);

  const ceiling = new THREE.Mesh(
    new THREE.PlaneGeometry(12, 10),
    new THREE.MeshStandardMaterial({ color: 0xe8dfd1, roughness: 1, side: THREE.DoubleSide })
  );
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = 4;
  scene.add(ceiling);

  const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xd8cbbb, roughness: 0.95 });
  [
    { size: [12, 4], position: [0, 2, -5], rotation: [0, 0, 0] },
    { size: [10, 4], position: [-6, 2, 0], rotation: [0, Math.PI / 2, 0] },
    { size: [10, 4], position: [6, 2, 0], rotation: [0, -Math.PI / 2, 0] },
    { size: [12, 4], position: [0, 2, 5], rotation: [0, Math.PI, 0] }
  ].forEach((wall) => {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(...wall.size), wallMaterial);
    mesh.position.set(...wall.position);
    mesh.rotation.set(...wall.rotation);
    mesh.receiveShadow = true;
    scene.add(mesh);
  });

  const rug = new THREE.Mesh(
    new THREE.PlaneGeometry(4.2, 5.4),
    new THREE.MeshStandardMaterial({ color: 0x6e2630, roughness: 0.9 })
  );
  rug.rotation.x = -Math.PI / 2;
  rug.position.y = 0.006;
  scene.add(rug);
}

async function buildExhibition(paintings) {
  const placements = [
    { position: [-2.2, 2.15, -4.92], rotationY: 0, hotspot: [-2.2, -2.55], visitorYaw: 0 },
    { position: [5.92, 2.1, -1.9], rotationY: -Math.PI / 2, hotspot: [3.55, -1.9], visitorYaw: -Math.PI / 2 },
    { position: [-5.92, 2.1, -1.9], rotationY: Math.PI / 2, hotspot: [-3.55, -1.9], visitorYaw: Math.PI / 2 },
    { position: [2.2, 2.15, -4.92], rotationY: 0, hotspot: [2.2, -2.55], visitorYaw: 0 }
  ];

  await Promise.all(paintings.map((painting, index) => addPainting(painting, placements[index])));
}

async function addPainting(painting, placement) {
  const image = painting.media?.image || painting.print?.imageTargetSource;
  const texture = await textureLoader.loadAsync(image);
  texture.encoding = THREE.sRGBEncoding;

  const widthCm = painting.dimensions?.widthCm || texture.image.width;
  const heightCm = painting.dimensions?.heightCm || texture.image.height;
  const aspect = widthCm / heightCm;
  const maxHeight = 1.72;
  const maxWidth = 2.65;
  const height = Math.min(maxHeight, maxWidth / aspect);
  const width = height * aspect;

  const artwork = new THREE.Group();
  artwork.position.set(...placement.position);
  artwork.rotation.y = placement.rotationY;
  artwork.userData.painting = painting.slug;

  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(width + 0.18, height + 0.18, 0.10),
    new THREE.MeshStandardMaterial({ color: 0x5b3718, roughness: 0.55, metalness: 0.18 })
  );
  frame.castShadow = true;
  artwork.add(frame);

  const canvas = new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshStandardMaterial({ map: texture, roughness: 0.78 })
  );
  canvas.position.z = 0.056;
  artwork.add(canvas);

  const title = localizedTitle(painting);
  const information = makeInformationPanel(painting, title);
  information.position.set(0, -height / 2 - 0.62, 0.07);
  information.scale.set(2.12, 2.12, 1);
  artwork.add(information);
  scene.add(artwork);

  const hotspot = createTeleportHotspot(title, placement, artwork);
  scene.add(hotspot);

  const exhibit = {
    painting,
    artwork,
    hotspot,
    audio: null,
    audioReady: false,
    started: false
  };
  exhibits.push(exhibit);
  loadAudioGuide(exhibit).catch((error) => {
    console.warn(`Audio guide unavailable for ${painting.slug}.`, error);
  });
}

function createTeleportHotspot(title, placement, artwork) {
  const group = new THREE.Group();
  group.position.set(placement.hotspot[0], 0.018, placement.hotspot[1]);
  group.userData.destination = new THREE.Vector3(placement.hotspot[0], 0, placement.hotspot[1]);
  group.userData.visitorYaw = placement.visitorYaw;
  group.userData.artwork = artwork;

  const target = new THREE.Mesh(
    new THREE.CircleGeometry(0.48, 48),
    new THREE.MeshBasicMaterial({
      color: 0xc7a45d,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide
    })
  );
  target.rotation.x = -Math.PI / 2;
  target.userData.hotspot = group;
  group.add(target);
  teleportTargets.push(target);

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.36, 0.48, 48),
    new THREE.MeshBasicMaterial({
      color: 0xffd989,
      transparent: true,
      opacity: 0.92,
      side: THREE.DoubleSide
    })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.006;
  group.add(ring);

  const marker = makeLabel(`${lang === "fr" ? "Écouter" : "Listen"}\n${title}`);
  marker.position.set(0, 0.035, 0.68);
  marker.rotation.x = -Math.PI / 2;
  marker.scale.set(1.25, 0.32, 1);
  group.add(marker);
  return group;
}

async function loadAudioGuide(exhibit) {
  const guides = exhibit.painting.media?.audioOverviews || exhibit.painting.media?.audioOverview || [];
  const list = Array.isArray(guides) ? guides : [guides];
  const guide = list.find((item) => item?.lang === lang)
    || list.find((item) => item?.lang === "en")
    || list[0];
  if (!guide?.src) return;

  const buffer = await audioLoader.loadAsync(guide.src);
  // Use a clean non-HRTF signal and calculate distance volume ourselves.
  // This avoids the artefacts some Quest devices produce with long HRTF narration.
  const audio = new THREE.Audio(audioListener);
  audio.setBuffer(buffer);
  audio.setLoop(false);
  audio.setVolume(0);
  audio.setFilters(createVoiceCleanupFilters());
  scene.add(audio);
  exhibit.audio = audio;
  exhibit.audioReady = true;
}

function createVoiceCleanupFilters() {
  const context = audioListener.context;
  const highPass = context.createBiquadFilter();
  highPass.type = "highpass";
  highPass.frequency.value = 85;
  highPass.Q.value = 0.7;

  const presence = context.createBiquadFilter();
  presence.type = "peaking";
  presence.frequency.value = 2600;
  presence.Q.value = 0.85;
  presence.gain.value = 2.4;

  const lowPass = context.createBiquadFilter();
  lowPass.type = "lowpass";
  lowPass.frequency.value = 11500;
  lowPass.Q.value = 0.7;

  const compressor = context.createDynamicsCompressor();
  compressor.threshold.value = -25;
  compressor.knee.value = 22;
  compressor.ratio.value = 3;
  compressor.attack.value = 0.012;
  compressor.release.value = 0.24;
  return [highPass, presence, lowPass, compressor];
}

function localizedTitle(painting) {
  if (lang !== "fr") return painting.title || "";
  const titles = {
    "mona-lisa": "La Joconde",
    "van-gogh": "Autoportrait",
    "van-gogh-bedroom": "La Chambre",
    "vermeer-girl-with-a-pearl-earring": "La Jeune Fille à la perle"
  };
  return titles[painting.slug] || painting.title || "";
}

function makeLabel(message) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  context.fillStyle = "#f2eadc";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = "#4b3c2d";
  context.lineWidth = 8;
  context.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);
  context.fillStyle = "#251f19";
  context.font = "600 54px Georgia";
  context.textAlign = "center";
  const lines = message.split("\n");
  context.fillText(lines[0], canvas.width / 2, 100);
  context.font = "34px Arial";
  context.fillStyle = "#65584b";
  context.fillText(lines[1] || "", canvas.width / 2, 172);

  const texture = new THREE.CanvasTexture(canvas);
  texture.encoding = THREE.sRGBEncoding;
  return new THREE.Mesh(
    new THREE.PlaneGeometry(1, 0.25),
    new THREE.MeshBasicMaterial({ map: texture })
  );
}

function makeInformationPanel(painting, title) {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 520;
  const context = canvas.getContext("2d");
  context.fillStyle = "#f4ecdf";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = "#4b3c2d";
  context.lineWidth = 10;
  context.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);

  context.textAlign = "left";
  context.fillStyle = "#211b16";
  context.font = "700 72px Georgia";
  context.fillText(title, 54, 98);

  context.fillStyle = "#7b2937";
  context.font = "600 34px Arial";
  context.fillText(`${painting.artist?.name || ""} · ${painting.date || ""}`, 56, 152);

  context.fillStyle = "#4f463d";
  context.font = "32px Georgia";
  const body = PAINTING_INFO[lang]?.[painting.slug] || painting.texts?.curatorInsight || "";
  drawWrappedText(context, body, 56, 225, canvas.width - 112, 46, 5);

  const texture = new THREE.CanvasTexture(canvas);
  texture.encoding = THREE.sRGBEncoding;
  return new THREE.Mesh(
    new THREE.PlaneGeometry(1, 0.433),
    new THREE.MeshBasicMaterial({ map: texture })
  );
}

function drawWrappedText(context, message, x, y, maxWidth, lineHeight, maxLines) {
  const words = message.split(/\s+/);
  let line = "";
  let lineNumber = 0;
  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    if (context.measureText(testLine).width > maxWidth && line) {
      context.fillText(line, x, y + lineNumber * lineHeight);
      line = word;
      lineNumber += 1;
      if (lineNumber >= maxLines) return;
    } else {
      line = testLine;
    }
  }
  if (lineNumber < maxLines) context.fillText(line, x, y + lineNumber * lineHeight);
}

function addControllers() {
  controllers.forEach((controller) => {
    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, -1)
    ]);
    const line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0xc7a45d }));
    line.scale.z = 8;
    controller.add(line);
    controller.addEventListener("selectstart", () => teleportFrom(controller));
    visitor.add(controller);
  });
}

function teleportFrom(controller) {
  rayRotation.identity().extractRotation(controller.matrixWorld);
  teleportRaycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
  teleportRaycaster.ray.direction.set(0, 0, -1).applyMatrix4(rayRotation).normalize();
  const hit = teleportRaycaster.intersectObjects(teleportTargets, false)[0];
  if (!hit) return;
  const hotspot = hit.object.userData.hotspot;
  if (!hotspot) return;

  visitor.rotation.y = hotspot.userData.visitorYaw;
  visitor.updateMatrixWorld(true);
  const head = renderer.xr.getCamera(camera).getWorldPosition(new THREE.Vector3());
  visitor.position.x += hotspot.userData.destination.x - head.x;
  visitor.position.z += hotspot.userData.destination.z - head.z;
  selectNearestAudioGuide(true);
}

function bindUI() {
  enterButton.addEventListener("click", toggleVR);
  audioToggleButton.addEventListener("click", toggleAudioGuide);
  audioRestartButton.addEventListener("click", restartAudioGuide);
  audioMuteButton.addEventListener("click", toggleAudioMute);
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
      stopAllAudioGuides();
    }, { once: true });
    await renderer.xr.setSession(currentSession);
    await audioListener.context.resume();
    enterButton.textContent = text.exit;
  } catch (error) {
    console.error(error);
    status.textContent = `${text.failed} ${error.message}`;
  }
}

function selectNearestAudioGuide(force = false) {
  if ((!currentSession && !force) || !exhibits.length) return;
  const head = getListenerPosition();
  let nearest = null;
  let nearestDistance = Infinity;

  exhibits.forEach((exhibit) => {
    const position = exhibit.hotspot.getWorldPosition(new THREE.Vector3());
    const distance = position.distanceTo(head);
    if (distance < nearestDistance) {
      nearest = exhibit;
      nearestDistance = distance;
    }
  });

  const next = force || nearestDistance <= 3.25 ? nearest : null;
  if (!force && next === activeExhibit) {
    if (next?.audioReady && !next.started) startAudioGuide(next);
    return;
  }

  if (activeExhibit?.audio?.isPlaying) activeExhibit.audio.stop();
  if (activeExhibit) activeExhibit.started = false;
  activeExhibit = next;

  if (activeExhibit) {
    startAudioGuide(activeExhibit);
    status.textContent = `${localizedTitle(activeExhibit.painting)} — ${lang === "fr" ? "guide audio spatial" : "spatial audio guide"}`;
  }
}

function startAudioGuide(exhibit) {
  if (!exhibit.audioReady || exhibit.started || audioListener.context.state !== "running") return;
  exhibit.audio.play();
  exhibit.started = true;
  updateAudioButtons();
}

function stopAllAudioGuides() {
  exhibits.forEach((exhibit) => {
    if (exhibit.audio?.isPlaying) exhibit.audio.stop();
    exhibit.started = false;
  });
  activeExhibit = null;
  updateAudioButtons();
}

async function toggleAudioGuide() {
  await audioListener.context.resume();
  if (!activeExhibit) selectNearestAudioGuide(true);
  if (!activeExhibit?.audioReady) return;

  if (activeExhibit.audio.isPlaying) {
    activeExhibit.audio.pause();
  } else {
    activeExhibit.audio.play();
    activeExhibit.started = true;
  }
  updateAudioButtons();
}

async function restartAudioGuide() {
  await audioListener.context.resume();
  if (!activeExhibit) selectNearestAudioGuide(true);
  if (!activeExhibit?.audioReady) return;
  if (activeExhibit.audio.isPlaying) activeExhibit.audio.stop();
  activeExhibit.started = false;
  startAudioGuide(activeExhibit);
}

function toggleAudioMute() {
  audioMuted = !audioMuted;
  updateAudioButtons();
}

function updateAudioButtons() {
  const playing = Boolean(activeExhibit?.audio?.isPlaying);
  audioToggleButton.textContent = playing ? text.pauseAudio : text.playAudio;
  audioToggleButton.classList.toggle("active", playing);
  audioMuteButton.textContent = audioMuted ? text.unmuteAudio : text.muteAudio;
  audioMuteButton.classList.toggle("active", audioMuted);
}

function updateAudioVolume() {
  if (!activeExhibit?.audio) return;
  const head = getListenerPosition();
  const paintingPosition = activeExhibit.artwork.getWorldPosition(new THREE.Vector3());
  const distance = paintingPosition.distanceTo(head);
  const volume = audioMuted ? 0 : THREE.MathUtils.clamp(1.18 - distance / 4.2, 0.12, 1);
  activeExhibit.audio.setVolume(volume);
}

function getListenerPosition() {
  const activeCamera = currentSession ? renderer.xr.getCamera(camera) : camera;
  return activeCamera.getWorldPosition(new THREE.Vector3());
}

function updateControllerAudioCommands() {
  if (!currentSession) return;
  for (const source of currentSession.inputSources) {
    if (!source.gamepad) continue;
    const key = source.handedness || "unknown";
    const previous = controllerCommandState.get(key) || {};
    const current = {
      toggle: Boolean(source.gamepad.buttons[4]?.pressed),
      restart: Boolean(source.gamepad.buttons[5]?.pressed),
      mute: Boolean(source.gamepad.buttons[3]?.pressed)
    };
    if (current.toggle && !previous.toggle) toggleAudioGuide();
    if (current.restart && !previous.restart) restartAudioGuide();
    if (current.mute && !previous.mute) toggleAudioMute();
    controllerCommandState.set(key, current);
  }
}

function updateLocomotion(delta) {
  if (!currentSession) return;
  const xrCamera = renderer.xr.getCamera(camera);
  const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(xrCamera.quaternion);
  forward.y = 0;
  forward.normalize();
  const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0));

  for (const source of currentSession.inputSources) {
    const gamepad = source.gamepad;
    if (!gamepad?.axes?.length) continue;
    const x = gamepad.axes[gamepad.axes.length - 2] || 0;
    const y = gamepad.axes[gamepad.axes.length - 1] || 0;

    if (source.handedness === "left") {
      visitor.position.addScaledVector(right, x * delta * 1.8);
      visitor.position.addScaledVector(forward, -y * delta * 1.8);
      visitor.position.x = THREE.MathUtils.clamp(visitor.position.x, -5.3, 5.3);
      visitor.position.z = THREE.MathUtils.clamp(visitor.position.z, -4.3, 4.3);
    }

    if (source.handedness === "right") {
      if (Math.abs(x) > 0.72 && snapTurnReady) {
        visitor.rotation.y -= Math.sign(x) * Math.PI / 6;
        snapTurnReady = false;
      } else if (Math.abs(x) < 0.3) {
        snapTurnReady = true;
      }
    }
  }
}

function resize() {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
}

function render() {
  updateLocomotion(Math.min(clock.getDelta(), 0.05));
  selectNearestAudioGuide();
  updateAudioVolume();
  updateControllerAudioCommands();
  renderer.render(scene, camera);
}
