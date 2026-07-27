import * as THREE from "../vendor/three.module.js";
import { GLTFLoader } from "../vendor/GLTFLoader.module.js";
import { DRACOLoader } from "../vendor/DRACOLoader.module.js";

const MANIFESTS = [
  "content/paintings/mona-lisa.json",
  "content/paintings/van-gogh.json",
  "content/paintings/van-gogh-bedroom.json",
  "content/paintings/vermeer-girl-with-a-pearl-earring.json"
];

const GALLERY_IMAGES = {
  "mona-lisa": "assets/paintings/mona-lisa/images/monalisa-t.png",
  "van-gogh": "assets/paintings/van-gogh/images/van-gogh_portrait-p.png",
  "van-gogh-bedroom": "assets/paintings/van-gogh-bedroom/images/van-gogh_bedroom-t.png",
  "vermeer-girl-with-a-pearl-earring": "assets/paintings/vermeer_Girl-with-a-Pearl-Earring/images/vermee_girl-earring-t.png"
};

const GALLERY_MODEL_OVERRIDES = {
  "van-gogh-bedroom": "assets/paintings/van-gogh-bedroom/bed.glb"
};

const FURNITURE_MODEL_EXHIBITS = [
  {
    id: "vermeer-girl",
    title: { en: "Girl with a Pearl Earring", fr: "La Jeune Fille à la perle" },
    src: "assets/paintings/vermeer_Girl-with-a-Pearl-Earring/vermeer_Girl-with-a-Pearl-Earring.glb",
    position: [-2.3, 7.25]
  },
  {
    id: "vermeer-girl-rig",
    title: { en: "Girl with a Pearl Earring — Rigged", fr: "La Jeune Fille à la perle — animée" },
    src: "assets/paintings/vermeer_Girl-with-a-Pearl-Earring/vermeer_Girl-with-a-Pearl-Earring-rig.glb",
    position: [2.3, 7.25]
  }
];

const STANDING_VAN_GOGH_MODEL = "assets/paintings/van-gogh/vangogh_istanding.glb";
const BEDROOM_VR_WORLD_URL = "https://marble.worldlabs.ai/worldvr/48b7eb17-56e4-4873-a253-fa13ed516fae";
const LEONARDO_STUDIO_VR_WORLD_URL = "https://marble.worldlabs.ai/worldvr/862ab5f6-8608-469c-a840-8cb10f3859ae";
const CINEMA_ROOM_X = 14;
const CINEMA_VIDEO_LIBRARY = [
  {
    title: { en: "Leonardo Painting the Mona Lisa", fr: "Léonard peignant La Joconde" },
    src: "assets/paintings/mona-lisa/audio-video/davinci_painting_monalisa.mp4"
  },
  {
    title: { en: "Mona Lisa Reimagined", fr: "La Joconde réimaginée" },
    src: "assets/paintings/mona-lisa/audio-video/mona-lisa_video.mp4",
    audioSrc: "assets/paintings/mona-lisa/audio-video/Centuries_Behind_Glass.mp3",
    audioSrcFr: "assets/paintings/mona-lisa/audio-video/La_Joconde_s_évade.mp3"
  },
  {
    title: { en: "Mona Lisa — Alternate Scene", fr: "La Joconde — scène alternative" },
    src: "assets/paintings/mona-lisa/audio-video/mona-lisa_video-1.mp4"
  },
  {
    title: { en: "Beyond the Frame II", fr: "Au-delà du cadre II" },
    src: "assets/paintings/mona-lisa/audio-video/monalisa-out-of-frame-2.mp4"
  },
  {
    title: { en: "Beyond the Frame III", fr: "Au-delà du cadre III" },
    src: "assets/paintings/mona-lisa/audio-video/monalisa-out-of-frame-3.mp4"
  }
];

const REIMAGINED_ARTWORKS = [
  { src: "assets/gallery/reimagined/mona-lisa_out.png", title: "Mona Lisa — Beyond the frame" },
  { src: "assets/gallery/reimagined/Monalisa-Davinci.png", title: "Mona Lisa and Leonardo" },
  { src: "assets/gallery/reimagined/Monalisa-louvre-1.png", title: "Mona Lisa at the Louvre" },
  { src: "assets/gallery/reimagined/the-bedroom.avif", title: "The Bedroom — Reimagined" },
  { src: "assets/gallery/reimagined/van-gogh_in_bedroom-standing.png", title: "Van Gogh in The Bedroom" },
  { src: "assets/gallery/reimagined/vermeer_girl-earring-p.png", title: "Girl with a Pearl Earring — Portrait" },
  { src: "assets/gallery/reimagined/vermeer_Girl-with-a-Pearl-Earring_sitting.png", title: "Girl with a Pearl Earring — Seated" }
];

const params = new URLSearchParams(location.search);
const lang = params.get("lang") === "fr" ? "fr" : "en";
const previewRoom = params.get("room");
const previewPositionX = previewRoom === "cinema" ? CINEMA_ROOM_X : 0;
const previewPositionZ = previewRoom === "cinema"
  ? 32
  : previewRoom === "reimagined"
  ? 30
  : previewRoom === "bedroom"
    ? 17.4
    : previewRoom === "models"
      ? 14
      : 4;
const previewRotationY = ["bedroom", "reimagined", "cinema"].includes(previewRoom) ? Math.PI : 0;
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
    instructions: "Trigger or hand pinch: select and teleport. A/X: play or pause. B/Y: restart audio. Press a thumbstick to mute.",
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
    unmuteAudio: "Unmute",
    loadingModels: "Loading 3D exhibits…",
    modelsReady: "The painting models and two walk-around Vermeer exhibits are ready.",
    exitGallery: "Exit to collection",
    individualExperiences: "Individual experiences",
    paintingsRoom: "PAINTINGS",
    modelsRoom: "3D MODELS",
    bedroomRoom: "VAN GOGH'S BEDROOM",
    bedroomLifeSize: "LIFE-SIZE RECONSTRUCTION",
    reimaginedRoom: "MASTERPIECES REIMAGINED",
    reimaginedSubtitle: "FAMILIAR ICONS, NEW STORIES",
    fastTravel: "QUICK ROOM ACCESS",
    bedroomVrWorld: "VISIT THE BEDROOM VR WORLD",
    leonardoStudioVrWorld: "VISIT LEONARDO'S STUDIO IN VR",
    playVideo: "TRIGGER: PLAY / PAUSE",
    videoPlay: "Play video",
    videoPause: "Pause video",
    videoRestart: "Restart video",
    videoMute: "Mute video",
    videoUnmute: "Unmute video",
    cinema: "ARTDACI CINEMA",
    cinemaRoom: "CINEMA ROOM",
    cinemaEnter: "ENTER THE CINEMA",
    cinemaReturn: "RETURN TO REIMAGINED ART",
    cinemaLibrary: "CHOOSE A FILM",
    cinemaSit: "SIT & WATCH",
    cinemaPrevious: "Previous",
    cinemaNext: "Next",
    cinemaBack: "−10 seconds",
    cinemaForward: "+10 seconds",
    cinemaPlayPause: "Play / Pause",
    cinemaSound: "Sound on / off",
    languageSwitch: "Français",
    languageSwitchLabel: "Voir la galerie en français",
    exitSign: "EXIT GALLERY"
  },
  fr: {
    back: "Retour à la collection",
    kicker: "Exposition immersive",
    title: "La galerie ARTDACI",
    instructions: "Gâchette ou pincement de la main : sélectionner et se téléporter. A/X : lecture ou pause. B/Y : recommencer. Appuyez sur un joystick pour couper le son.",
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
    unmuteAudio: "Rétablir le son",
    loadingModels: "Chargement des œuvres 3D…",
    modelsReady: "Les modèles des tableaux et deux œuvres 3D de Vermeer observables sous tous les angles sont prêts.",
    exitGallery: "Sortir vers la collection",
    individualExperiences: "Expériences individuelles",
    paintingsRoom: "TABLEAUX",
    modelsRoom: "MODÈLES 3D",
    bedroomRoom: "LA CHAMBRE DE VAN GOGH",
    bedroomLifeSize: "RECONSTRUCTION GRANDEUR NATURE",
    reimaginedRoom: "CHEFS-D'ŒUVRE RÉIMAGINÉS",
    reimaginedSubtitle: "NOUVEAUX REGARDS SUR DES ICÔNES",
    fastTravel: "ACCÈS RAPIDE AUX SALLES",
    bedroomVrWorld: "VISITER LA CHAMBRE EN MONDE VR",
    leonardoStudioVrWorld: "VISITER L’ATELIER DE LÉONARD EN VR",
    playVideo: "GÂCHETTE : LECTURE / PAUSE",
    videoPlay: "Lire la vidéo",
    videoPause: "Mettre la vidéo en pause",
    videoRestart: "Recommencer la vidéo",
    videoMute: "Couper le son vidéo",
    videoUnmute: "Activer le son vidéo",
    cinema: "CINÉMA ARTDACI",
    cinemaRoom: "SALLE DE CINÉMA",
    cinemaEnter: "ENTRER DANS LE CINÉMA",
    cinemaReturn: "RETOUR AUX ŒUVRES RÉIMAGINÉES",
    cinemaLibrary: "CHOISIR UN FILM",
    cinemaSit: "S’ASSEOIR ET REGARDER",
    cinemaPrevious: "Précédent",
    cinemaNext: "Suivant",
    cinemaBack: "−10 secondes",
    cinemaForward: "+10 secondes",
    cinemaPlayPause: "Lecture / Pause",
    cinemaSound: "Son activé / coupé",
    languageSwitch: "English",
    languageSwitchLabel: "View the gallery in English",
    exitSign: "SORTIE DE LA GALERIE"
  }
};
const text = COPY[lang];

const stage = document.getElementById("gallery-stage");
const status = document.getElementById("gallery-status");
const enterButton = document.getElementById("enter-gallery-vr");
const audioToggleButton = document.getElementById("gallery-audio-toggle");
const audioRestartButton = document.getElementById("gallery-audio-restart");
const audioMuteButton = document.getElementById("gallery-audio-mute");
const videoToggleButton = document.getElementById("gallery-video-toggle");
const videoRestartButton = document.getElementById("gallery-video-restart");
const videoMuteButton = document.getElementById("gallery-video-mute");
const videoSelect = document.getElementById("gallery-video-select");
const videoPreviousButton = document.getElementById("gallery-video-previous");
const videoNextButton = document.getElementById("gallery-video-next");
const videoBackButton = document.getElementById("gallery-video-back");
const videoForwardButton = document.getElementById("gallery-video-forward");
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x191714);
scene.fog = new THREE.Fog(0x191714, 16, 44);

const camera = new THREE.PerspectiveCamera(62, innerWidth / innerHeight, 0.05, 60);
camera.position.set(0, 1.65, 0);
const audioListener = new THREE.AudioListener();
camera.add(audioListener);
const visitor = new THREE.Group();
visitor.position.x = previewPositionX;
visitor.position.z = previewPositionZ;
visitor.rotation.y = previewRotationY;
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
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("vendor/draco/");
const modelLoader = new GLTFLoader();
modelLoader.setDRACOLoader(dracoLoader);
const controllers = [renderer.xr.getController(0), renderer.xr.getController(1)];
const hands = [renderer.xr.getHand(0), renderer.xr.getHand(1)];
const handJointGeometry = new THREE.SphereGeometry(0.008, 12, 8);
const handJointMaterials = [
  new THREE.MeshBasicMaterial({ color: 0x8ee8ff, transparent: true, opacity: 0.82 }),
  new THREE.MeshBasicMaterial({ color: 0xffd58e, transparent: true, opacity: 0.82 })
];
const teleportTargets = [];
const exhibits = [];
const exhibitsBySlug = new Map();
const galleryVideoExhibits = [];
const galleryVideoScreens = [];
const cinemaControlMeshes = [];
const teleportRaycaster = new THREE.Raycaster();
const rayRotation = new THREE.Matrix4();
const clock = new THREE.Clock();
let currentSession = null;
let snapTurnReady = true;
let activeExhibit = null;
let activeGalleryVideo = null;
let audioMuted = false;
const controllerCommandState = new Map();

init();

async function init() {
  applyCopy();
  buildRoom();
  addControllers();
  addHands();
  bindUI();

  try {
    const responses = await Promise.all(MANIFESTS.map((url) => fetch(url, { cache: "reload" })));
    if (responses.some((response) => !response.ok)) throw new Error("Manifest unavailable");
    const paintings = await Promise.all(responses.map((response) => response.json()));
    await buildExhibition(paintings);
    await buildReimaginedExhibition();
    buildReimaginedVideoExhibits();
    await detectVR();
    void buildModelExhibits(paintings);
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
  videoToggleButton.textContent = text.videoPlay;
  videoRestartButton.textContent = text.videoRestart;
  videoMuteButton.textContent = text.videoUnmute;
  videoPreviousButton.textContent = text.cinemaPrevious;
  videoNextButton.textContent = text.cinemaNext;
  videoBackButton.textContent = text.cinemaBack;
  videoForwardButton.textContent = text.cinemaForward;
  videoSelect.setAttribute("aria-label", text.cinemaLibrary);
  document.getElementById("gallery-exit-link").textContent = text.exitGallery;
  document.getElementById("gallery-exit-link").href = lang === "fr" ? "index-fr.html" : "index.html";
  document.getElementById("gallery-bedroom-world-link").textContent = text.bedroomVrWorld;
  document.getElementById("gallery-bedroom-world-link").href = BEDROOM_VR_WORLD_URL;
  document.getElementById("gallery-leonardo-world-link").textContent = text.leonardoStudioVrWorld;
  document.getElementById("gallery-leonardo-world-link").href = LEONARDO_STUDIO_VR_WORLD_URL;
  document.getElementById("gallery-cinema-link").textContent = text.cinemaEnter;
  document.getElementById("gallery-cinema-link").href = `gallery-vr.html?lang=${lang}&room=cinema`;
  document.getElementById("gallery-experiences-link").textContent = text.individualExperiences;
  document.getElementById("gallery-experiences-link").href = `space.html?painting=mona-lisa&lang=${lang}`;
  const languageSwitch = document.getElementById("gallery-language-switch");
  const targetLang = lang === "fr" ? "en" : "fr";
  const targetParams = new URLSearchParams(location.search);
  targetParams.set("lang", targetLang);
  languageSwitch.textContent = text.languageSwitch;
  languageSwitch.setAttribute("aria-label", text.languageSwitchLabel);
  languageSwitch.lang = targetLang;
  languageSwitch.href = `gallery-vr.html?${targetParams.toString()}${location.hash}`;
  status.textContent = text.loading;
}

function buildRoom() {
  scene.add(new THREE.HemisphereLight(0xfff5df, 0x342e27, 1.15));

  const ceilingLights = [
    [-3, 3.5, 1.5],
    [3, 3.5, 1.5],
    [-3, 3.5, -3],
    [3, 3.5, -3],
    [-3, 3.5, 8],
    [3, 3.5, 8],
    [-3, 3.5, 13],
    [3, 3.5, 13],
    [-3, 3.5, 19],
    [3, 3.5, 19],
    [-3, 3.5, 26],
    [3, 3.5, 26],
    [-3, 3.5, 32],
    [3, 3.5, 32],
    [-3, 3.5, 37],
    [3, 3.5, 37]
  ];
  ceilingLights.forEach(([x, y, z]) => {
    const light = new THREE.PointLight(0xffe7c2, 0.82, 9);
    light.position.set(x, y, z);
    scene.add(light);
  });

  const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x594d40, roughness: 0.88 });
  const ceilingMaterial = new THREE.MeshStandardMaterial({
    color: 0xe8dfd1,
    roughness: 1,
    side: THREE.DoubleSide
  });
  [
    { z: 0, depth: 10, name: "paintings-room-floor" },
    { z: 10, depth: 10, name: "models-room-floor" },
    { z: 22, depth: 14, name: "bedroom-room-floor" },
    { z: 34, depth: 10, name: "reimagined-room-floor" }
  ].forEach(({ z, depth, name }) => {
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(12, depth), floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.z = z;
    floor.receiveShadow = true;
    floor.name = name;
    scene.add(floor);

    const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(12, depth), ceilingMaterial);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(0, 4, z);
    scene.add(ceiling);
  });

  const wallMaterial = new THREE.MeshStandardMaterial({
    color: 0xd8cbbb,
    roughness: 0.95,
    side: THREE.DoubleSide
  });
  const louvreWallMaterial = new THREE.MeshStandardMaterial({
    color: 0x07142d,
    roughness: 0.9,
    side: THREE.DoubleSide
  });
  [
    { size: [12, 4], position: [0, 2, -5], rotation: [0, 0, 0], louvre: true },
    { size: [10, 4], position: [-6, 2, 0], rotation: [0, Math.PI / 2, 0], louvre: true },
    { size: [10, 4], position: [6, 2, 0], rotation: [0, -Math.PI / 2, 0], louvre: true },
    { size: [5, 4], position: [-3.5, 2, 5], rotation: [0, Math.PI, 0], louvre: true },
    { size: [5, 4], position: [3.5, 2, 5], rotation: [0, Math.PI, 0], louvre: true },
    { size: [2, 1.1], position: [0, 3.45, 5], rotation: [0, Math.PI, 0], louvre: true },
    { size: [10, 4], position: [-6, 2, 10], rotation: [0, Math.PI / 2, 0] },
    { size: [10, 4], position: [6, 2, 10], rotation: [0, -Math.PI / 2, 0] },
    { size: [5, 4], position: [-3.5, 2, 15], rotation: [0, Math.PI, 0] },
    { size: [5, 4], position: [3.5, 2, 15], rotation: [0, Math.PI, 0] },
    { size: [2, 1.1], position: [0, 3.45, 15], rotation: [0, Math.PI, 0] },
    { size: [14, 4], position: [-6, 2, 22], rotation: [0, Math.PI / 2, 0] },
    { size: [14, 4], position: [6, 2, 22], rotation: [0, -Math.PI / 2, 0] },
    { size: [5, 4], position: [-3.5, 2, 29], rotation: [0, Math.PI, 0] },
    { size: [5, 4], position: [3.5, 2, 29], rotation: [0, Math.PI, 0] },
    { size: [2, 1.1], position: [0, 3.45, 29], rotation: [0, Math.PI, 0] },
    { size: [10, 4], position: [-6, 2, 34], rotation: [0, Math.PI / 2, 0] },
    { size: [3.7, 4], position: [6, 2, 31.15], rotation: [0, -Math.PI / 2, 0] },
    { size: [3.7, 4], position: [6, 2, 36.85], rotation: [0, -Math.PI / 2, 0] },
    { size: [2.6, 1.1], position: [6, 3.45, 34], rotation: [0, -Math.PI / 2, 0] },
    { size: [12, 4], position: [0, 2, 39], rotation: [0, Math.PI, 0] }
  ].forEach((wall) => {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(...wall.size),
      wall.louvre ? louvreWallMaterial : wallMaterial
    );
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

  const modelRoomRug = new THREE.Mesh(
    new THREE.PlaneGeometry(9.6, 5.5),
    new THREE.MeshStandardMaterial({ color: 0x263f52, roughness: 0.9 })
  );
  modelRoomRug.rotation.x = -Math.PI / 2;
  modelRoomRug.position.set(0, 0.006, 10.4);
  scene.add(modelRoomRug);

  const bedroomRoomFloor = new THREE.Mesh(
    new THREE.PlaneGeometry(10.8, 12.8),
    new THREE.MeshStandardMaterial({ color: 0x9e7548, roughness: 0.94 })
  );
  bedroomRoomFloor.rotation.x = -Math.PI / 2;
  bedroomRoomFloor.position.set(0, 0.007, 22);
  scene.add(bedroomRoomFloor);

  const reimaginedRoomFloor = new THREE.Mesh(
    new THREE.PlaneGeometry(10.8, 9.7),
    new THREE.MeshStandardMaterial({ color: 0x253642, roughness: 0.9 })
  );
  reimaginedRoomFloor.rotation.x = -Math.PI / 2;
  reimaginedRoomFloor.position.set(0, 0.008, 34);
  scene.add(reimaginedRoomFloor);

  const cinemaCorridorFloor = new THREE.Mesh(
    new THREE.PlaneGeometry(2.2, 2.6),
    new THREE.MeshStandardMaterial({ color: 0x24151a, roughness: 0.94 })
  );
  cinemaCorridorFloor.rotation.x = -Math.PI / 2;
  cinemaCorridorFloor.position.set(7, 0.009, 34);
  cinemaCorridorFloor.receiveShadow = true;
  scene.add(cinemaCorridorFloor);

  addLouvrePaintingsRoomDecor();
  addCinemaRoomArchitecture();
  addNavigationSigns();
  addCinemaEntranceHotspot();
  addFastTravelStations();
}

function addCinemaRoomArchitecture() {
  const wallMaterial = new THREE.MeshStandardMaterial({
    color: 0x141a22,
    roughness: 0.9,
    side: THREE.DoubleSide
  });
  const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x24151a, roughness: 0.94 });
  const ceilingMaterial = new THREE.MeshStandardMaterial({
    color: 0x0b1016,
    roughness: 1,
    side: THREE.DoubleSide
  });
  const acousticMaterial = new THREE.MeshStandardMaterial({ color: 0x243b4a, roughness: 0.98 });

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(12, 10), floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(CINEMA_ROOM_X, 0.006, 34);
  floor.receiveShadow = true;
  scene.add(floor);

  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(12, 10), ceilingMaterial);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.set(CINEMA_ROOM_X, 4, 34);
  scene.add(ceiling);

  [
    { size: [12, 4], position: [CINEMA_ROOM_X, 2, 29], rotationY: 0 },
    { size: [12, 4], position: [CINEMA_ROOM_X, 2, 39], rotationY: Math.PI },
    { size: [3.7, 4], position: [8, 2, 31.15], rotationY: Math.PI / 2 },
    { size: [3.7, 4], position: [8, 2, 36.85], rotationY: Math.PI / 2 },
    { size: [2.6, 1.1], position: [8, 3.45, 34], rotationY: Math.PI / 2 },
    { size: [10, 4], position: [20, 2, 34], rotationY: -Math.PI / 2 }
  ].forEach((wall) => {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(...wall.size), wallMaterial);
    mesh.position.set(...wall.position);
    mesh.rotation.y = wall.rotationY;
    mesh.receiveShadow = true;
    scene.add(mesh);
  });

  [-4.8, -3.55, -2.3, 2.3, 3.55, 4.8].forEach((offset) => {
    const panel = new THREE.Mesh(new THREE.BoxGeometry(0.82, 2.75, 0.1), acousticMaterial);
    panel.position.set(CINEMA_ROOM_X + offset, 2.05, 38.86);
    scene.add(panel);
  });

  [-3.8, 0, 3.8].forEach((offset) => {
    const light = new THREE.SpotLight(0xffd9ae, 1.05, 8, Math.PI / 4.5, 0.62, 1.4);
    light.position.set(CINEMA_ROOM_X + offset, 3.75, 32.5);
    light.target.position.set(CINEMA_ROOM_X + offset * 0.55, 1.2, 36);
    scene.add(light, light.target);
  });

  const aisleLightMaterial = new THREE.MeshBasicMaterial({ color: 0x4fc6e8 });
  [-5.5, 5.5].forEach((offset) => {
    const strip = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.025, 8.8), aisleLightMaterial);
    strip.position.set(CINEMA_ROOM_X + offset, 0.025, 34);
    scene.add(strip);
  });
}

function addLouvrePaintingsRoomDecor() {
  const gold = new THREE.MeshStandardMaterial({
    color: 0xb8914f,
    roughness: 0.42,
    metalness: 0.38
  });
  const navyWainscot = new THREE.MeshStandardMaterial({
    color: 0x0a152b,
    roughness: 0.86
  });

  const addRail = (size, position, rotationY = 0, material = gold) => {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
    rail.position.set(...position);
    rail.rotation.y = rotationY;
    scene.add(rail);
  };

  [0.42, 3.66].forEach((height) => {
    addRail([11.82, 0.075, 0.06], [0, height, -4.93]);
    addRail([9.82, 0.075, 0.06], [-5.93, height, 0], Math.PI / 2);
    addRail([9.82, 0.075, 0.06], [5.93, height, 0], Math.PI / 2);
  });

  addRail([11.75, 0.68, 0.055], [0, 0.02, -4.92], 0, navyWainscot);
  addRail([9.75, 0.68, 0.055], [-5.92, 0.02, 0], Math.PI / 2, navyWainscot);
  addRail([9.75, 0.68, 0.055], [5.92, 0.02, 0], Math.PI / 2, navyWainscot);

  [-5.1, 0, 5.1].forEach((x) => {
    addRail([0.045, 3.12, 0.055], [x, 2.03, -4.92]);
  });

  const skylight = new THREE.Mesh(
    new THREE.PlaneGeometry(8.8, 6.7),
    new THREE.MeshBasicMaterial({
      color: 0xe7edf0,
      transparent: true,
      opacity: 0.82,
      side: THREE.DoubleSide
    })
  );
  skylight.rotation.x = Math.PI / 2;
  skylight.position.set(0, 3.955, 0);
  scene.add(skylight);

  for (let x = -4.4; x <= 4.4; x += 1.1) {
    addRail([0.045, 0.05, 6.65], [x, 3.94, 0]);
  }
  for (let z = -3.3; z <= 3.3; z += 1.1) {
    addRail([8.75, 0.05, 0.045], [0, 3.94, z]);
  }

  const bench = new THREE.Group();
  const seat = new THREE.Mesh(
    new THREE.BoxGeometry(2.5, 0.18, 0.72),
    new THREE.MeshStandardMaterial({ color: 0x263d5d, roughness: 0.78 })
  );
  seat.position.y = 0.62;
  bench.add(seat);
  [-1.0, 1.0].forEach((x) => {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.62, 0.56), gold);
    leg.position.set(x, 0.31, 0);
    bench.add(leg);
  });
  bench.position.set(0, 0, 2.55);
  scene.add(bench);
}

function addNavigationSigns() {
  const collectionUrl = lang === "fr" ? "index-fr.html" : "index.html";
  createWallSign(text.paintingsRoom, [0, 3.58, -4.88], 0, { width: 2.1, height: 0.58 });
  createWallSign(text.modelsRoom, [-5.86, 3.34, 10], Math.PI / 2, { width: 3.4 });
  createWallSign(`${text.modelsRoom}  →`, [0, 3.47, 4.88], Math.PI, {
    width: 1.82,
    height: 0.66,
    accent: true
  });
  createWallSign(`←  ${text.paintingsRoom}`, [0, 3.47, 5.12], 0, {
    width: 1.82,
    height: 0.66,
    accent: true
  });
  createWallSign(`${text.bedroomRoom}  →`, [0, 3.47, 14.88], Math.PI, {
    width: 1.82,
    height: 0.66,
    accent: true
  });
  createWallSign(`←  ${text.modelsRoom}`, [0, 3.47, 15.12], 0, {
    width: 1.82,
    height: 0.66,
    accent: true
  });
  createWallSign(`${text.reimaginedRoom}  →`, [0, 3.47, 28.88], Math.PI, {
    width: 3.65,
    height: 0.66,
    accent: true
  });
  createWallSign(`←  ${text.bedroomRoom}`, [0, 3.47, 29.12], 0, {
    width: 2.65,
    height: 0.66,
    accent: true
  });
  createWallSign(text.reimaginedRoom, [0, 3.58, 38.88], Math.PI, { width: 5.1 });
  createWallSign(text.reimaginedSubtitle, [0, 3.05, 38.87], Math.PI, {
    width: 4.65,
    height: 0.58,
    accent: true
  });
  createWallSign(text.cinemaEnter, [6.02, 3.42, 34], -Math.PI / 2, {
    width: 1.9,
    height: 0.34,
    destination: [CINEMA_ROOM_X, 0, 32],
    visitorYaw: Math.PI,
    compact: true
  });
  createWallSign(text.leonardoStudioVrWorld, [-5.85, 3.5, 37.15], Math.PI / 2, {
    width: 1.45,
    height: 0.27,
    exitUrl: LEONARDO_STUDIO_VR_WORLD_URL,
    compact: true
  });
  createWallSign(text.cinemaReturn, [8.12, 1.25, 30.6], Math.PI / 2, {
    width: 2.65,
    height: 0.52,
    destination: [0, 0, 34],
    visitorYaw: Math.PI
  });
  createWallSign(text.bedroomRoom, [-5.86, 3.25, 24.5], Math.PI / 2, { width: 4.1 });
  createWallSign(text.bedroomLifeSize, [-5.85, 2.58, 24.5], Math.PI / 2, {
    width: 3.55,
    height: 0.58,
    accent: true
  });
  createWallSign(text.bedroomVrWorld, [-5.85, 1.75, 24.5], Math.PI / 2, {
    width: 1.75,
    height: 0.32,
    exitUrl: BEDROOM_VR_WORLD_URL,
    compact: true
  });
  createWallSign(text.exitSign, [0, 0.5, -4.86], 0, {
    width: 0.9,
    height: 0.28,
    exitUrl: collectionUrl,
    compact: true
  });
  createWallSign(text.exitSign, [5.86, 3.48, 12.7], -Math.PI / 2, {
    width: 0.9,
    height: 0.28,
    exitUrl: collectionUrl,
    compact: true
  });
  createWallSign(text.exitSign, [-5.86, 3.12, 37.15], Math.PI / 2, {
    width: 0.9,
    height: 0.25,
    exitUrl: collectionUrl,
    compact: true
  });
}

function addCinemaEntranceHotspot() {
  const group = new THREE.Group();
  group.position.set(5.15, 0.02, 34);
  group.userData.destination = new THREE.Vector3(CINEMA_ROOM_X, 0, 32);
  group.userData.visitorYaw = Math.PI;

  const target = new THREE.Mesh(
    new THREE.CircleGeometry(0.52, 48),
    new THREE.MeshBasicMaterial({
      color: 0xb9914c,
      transparent: true,
      opacity: 0.34,
      side: THREE.DoubleSide
    })
  );
  target.rotation.x = -Math.PI / 2;
  target.userData.hotspot = group;
  group.add(target);
  teleportTargets.push(target);

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.39, 0.52, 48),
    new THREE.MeshBasicMaterial({
      color: 0xffd79a,
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide
    })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.007;
  group.add(ring);

  const label = makeLabel(text.cinemaEnter);
  label.position.set(0, 0.035, 0.7);
  label.rotation.x = -Math.PI / 2;
  label.scale.set(1.1, 0.27, 1);
  group.add(label);
  scene.add(group);
}

function createWallSign(message, position, rotationY, options = {}) {
  const canvas = document.createElement("canvas");
  canvas.width = 1600;
  canvas.height = 480;
  const context = canvas.getContext("2d");
  const isExit = Boolean(options.exitUrl);
  const isTravel = Boolean(options.destination);
  context.fillStyle = isExit ? "#812f38" : isTravel ? "#17566a" : options.accent ? "#273f51" : "#211c17";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = isExit ? "#ffd8d8" : isTravel ? "#a9efff" : "#c7a45d";
  context.lineWidth = 14;
  context.strokeRect(7, 7, canvas.width - 14, canvas.height - 14);
  context.fillStyle = "#fffaf1";
  context.textAlign = "center";
  context.textBaseline = "middle";
  let wallFontSize = options.compact
    ? (message.length > 28 ? 60 : message.length > 18 ? 68 : 76)
    : (message.length > 28 ? 88 : message.length > 18 ? 104 : 126);
  context.font = `800 ${wallFontSize}px Arial`;
  while (context.measureText(message).width > canvas.width - 110) {
    wallFontSize = Math.max(wallFontSize - 4, 58);
    context.font = `800 ${wallFontSize}px Arial`;
    if (wallFontSize === 58) break;
  }
  context.fillText(message, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.encoding = THREE.sRGBEncoding;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(options.width || 3.1, options.height || 0.94),
    new THREE.MeshBasicMaterial({ map: texture })
  );
  sign.position.set(...position);
  sign.rotation.y = rotationY;
  if (options.exitUrl) {
    sign.userData.exitUrl = options.exitUrl;
    teleportTargets.push(sign);
  } else if (options.destination) {
    sign.userData.hotspot = {
      userData: {
        destination: new THREE.Vector3(...options.destination),
        visitorYaw: options.visitorYaw || 0,
        exhibit: null
      }
    };
    teleportTargets.push(sign);
  }
  scene.add(sign);
  return sign;
}

function addFastTravelStations() {
  const rooms = [
    { id: "paintings", label: text.paintingsRoom, destination: [0, 0, 0.8], visitorYaw: 0 },
    { id: "models", label: text.modelsRoom, destination: [0, 0, 10], visitorYaw: 0 },
    { id: "bedroom", label: text.bedroomRoom, destination: [0, 0, 20.6], visitorYaw: Math.PI },
    { id: "reimagined", label: text.reimaginedRoom, destination: [0, 0, 34], visitorYaw: Math.PI },
    { id: "cinema", label: text.cinemaRoom, destination: [CINEMA_ROOM_X, 0, 32], visitorYaw: Math.PI }
  ];
  const stations = [
    { room: "paintings", position: [5.86, 3.35, 3.25], rotationY: -Math.PI / 2 },
    { room: "models", position: [5.86, 3.35, 7.15], rotationY: -Math.PI / 2 },
    { room: "bedroom", position: [5.86, 3.35, 17.4], rotationY: -Math.PI / 2 },
    { room: "reimagined", position: [-5.86, 3.35, 30.6], rotationY: Math.PI / 2 },
    { room: "cinema", position: [8.12, 3.35, 31], rotationY: Math.PI / 2 }
  ];

  stations.forEach((station) => {
    const [x, y, z] = station.position;
    const compactTop = 3.72;
    createWallSign(text.fastTravel, [x, compactTop, z], station.rotationY, {
      width: 0.86,
      height: 0.17,
      accent: true,
      compact: true
    });
    rooms.filter((room) => room.id !== station.room).forEach((room, index) => {
      createWallSign(room.label, [x, compactTop - 0.21 - index * 0.19, z], station.rotationY, {
        width: 0.86,
        height: 0.15,
        destination: room.destination,
        visitorYaw: room.visitorYaw,
        compact: true
      });
    });
  });
}

async function buildExhibition(paintings) {
  const placements = [
    { position: [-2.2, 2.15, -4.92], rotationY: 0, hotspot: [-2.2, -2.55], visitorYaw: 0, modelPosition: [-3.2, 10.25] },
    { position: [5.92, 2.1, -1.9], rotationY: -Math.PI / 2, hotspot: [3.55, -1.9], visitorYaw: -Math.PI / 2, modelPosition: [0, 10.25] },
    { position: [-5.92, 2.1, -1.9], rotationY: Math.PI / 2, hotspot: [-3.55, -1.9], visitorYaw: Math.PI / 2, modelPosition: [1.4, 10.25] },
    { position: [2.2, 2.15, -4.92], rotationY: 0, hotspot: [2.2, -2.55], visitorYaw: 0, modelPosition: [3.2, 10.25] }
  ];

  await Promise.all(paintings.map((painting, index) => addPainting(painting, placements[index])));
}

async function addPainting(painting, placement) {
  const image = GALLERY_IMAGES[painting.slug]
    || painting.media?.image
    || painting.print?.imageTargetSource;
  const texture = await textureLoader.loadAsync(image);
  texture.encoding = THREE.sRGBEncoding;

  const widthCm = painting.dimensions?.widthCm || texture.image.width;
  const heightCm = painting.dimensions?.heightCm || texture.image.height;
  const aspect = GALLERY_IMAGES[painting.slug]
    ? texture.image.width / texture.image.height
    : widthCm / heightCm;
  const maxHeight = 1.72;
  const maxWidth = 2.65;
  const height = Math.min(maxHeight, maxWidth / aspect);
  const width = height * aspect;

  const artwork = new THREE.Group();
  artwork.position.set(...placement.position);
  artwork.rotation.y = placement.rotationY;
  artwork.userData.painting = painting.slug;

  const canvas = new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshStandardMaterial({ map: texture, roughness: 0.78 })
  );
  canvas.position.z = 0.018;
  artwork.add(canvas);

  const title = localizedTitle(painting);
  const information = makeInformationPanel(painting, title);
  information.position.set(0, -height / 2 - 0.55, 0.035);
  information.scale.set(2.25, 2.25, 1);
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
    started: false,
    modelPosition: placement.modelPosition,
    modelDisplay: null
  };
  exhibits.push(exhibit);
  exhibitsBySlug.set(painting.slug, exhibit);
  hotspot.userData.exhibit = exhibit;
  loadAudioGuide(exhibit).catch((error) => {
    console.warn(`Audio guide unavailable for ${painting.slug}.`, error);
  });
}

async function buildReimaginedExhibition() {
  const placements = [
    { position: [-3.7, 1.72, 38.92], rotationY: Math.PI, hotspot: [-3.7, 36.45], visitorYaw: Math.PI },
    { position: [0, 1.72, 38.92], rotationY: Math.PI, hotspot: [0, 36.45], visitorYaw: Math.PI },
    { position: [3.7, 1.72, 38.92], rotationY: Math.PI, hotspot: [3.7, 36.45], visitorYaw: Math.PI },
    { position: [-5.92, 1.9, 32.2], rotationY: Math.PI / 2, hotspot: [-3.45, 32.2], visitorYaw: Math.PI / 2 },
    { position: [-5.92, 1.9, 35.8], rotationY: Math.PI / 2, hotspot: [-3.45, 35.8], visitorYaw: Math.PI / 2 },
    { position: [5.92, 1.9, 30.85], rotationY: -Math.PI / 2, hotspot: [3.45, 30.85], visitorYaw: -Math.PI / 2 },
    { position: [5.92, 1.9, 37.15], rotationY: -Math.PI / 2, hotspot: [3.45, 37.15], visitorYaw: -Math.PI / 2 }
  ];

  await Promise.all(REIMAGINED_ARTWORKS.map(async (item, index) => {
    const texture = await textureLoader.loadAsync(item.src);
    texture.encoding = THREE.sRGBEncoding;
    const aspect = texture.image.width / texture.image.height;
    const height = Math.min(1.32, 2.2 / aspect);
    const width = height * aspect;
    const placement = placements[index];

    const artwork = new THREE.Group();
    artwork.position.set(...placement.position);
    artwork.rotation.y = placement.rotationY;

    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(width + 0.16, height + 0.16, 0.1),
      new THREE.MeshStandardMaterial({ color: 0xb68b4c, roughness: 0.48, metalness: 0.25 })
    );
    artwork.add(frame);

    const image = new THREE.Mesh(
      new THREE.PlaneGeometry(width, height),
      new THREE.MeshStandardMaterial({ map: texture, roughness: 0.72 })
    );
    image.position.z = 0.056;
    artwork.add(image);

    const title = makeLabel(item.title);
    title.position.set(0, -height / 2 - 0.22, 0.07);
    title.scale.set(Math.min(2.15, width + 0.62), 0.9, 1);
    artwork.add(title);
    scene.add(artwork);
    scene.add(createReimaginedHotspot(item.title, placement, artwork));
  }));
}

function createReimaginedHotspot(title, placement, artwork) {
  const group = new THREE.Group();
  group.position.set(placement.hotspot[0], 0.018, placement.hotspot[1]);
  group.userData.destination = new THREE.Vector3(placement.hotspot[0], 0, placement.hotspot[1]);
  group.userData.visitorYaw = placement.visitorYaw;
  group.userData.artwork = artwork;

  const target = new THREE.Mesh(
    new THREE.CircleGeometry(0.43, 48),
    new THREE.MeshBasicMaterial({
      color: 0x70c7d8,
      transparent: true,
      opacity: 0.24,
      side: THREE.DoubleSide
    })
  );
  target.rotation.x = -Math.PI / 2;
  target.userData.hotspot = group;
  group.add(target);
  teleportTargets.push(target);

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.33, 0.43, 48),
    new THREE.MeshBasicMaterial({
      color: 0x9eeaff,
      transparent: true,
      opacity: 0.94,
      side: THREE.DoubleSide
    })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.006;
  group.add(ring);

  const marker = makeLabel(`${lang === "fr" ? "Voir" : "View"}\n${title}`);
  marker.position.set(0, 0.035, 0.64);
  marker.rotation.x = -Math.PI / 2;
  marker.scale.set(1.35, 0.32, 1);
  group.add(marker);
  return group;
}

function buildReimaginedVideoExhibits() {
  const cinema = new THREE.Group();
  cinema.name = "artdaci-cinema";
  cinema.position.x = CINEMA_ROOM_X;

  const darkMaterial = new THREE.MeshStandardMaterial({ color: 0x0d1015, roughness: 0.62 });
  const blueMaterial = new THREE.MeshStandardMaterial({ color: 0x19384a, roughness: 0.72 });
  const goldMaterial = new THREE.MeshStandardMaterial({ color: 0xb9914c, roughness: 0.44, metalness: 0.28 });

  const backdrop = new THREE.Mesh(new THREE.BoxGeometry(5.55, 3.68, 0.2), darkMaterial);
  backdrop.position.set(0, 2.02, 36.55);
  cinema.add(backdrop);

  const video = document.createElement("video");
  video.crossOrigin = "anonymous";
  video.preload = "metadata";
  video.playsInline = true;
  video.loop = true;
  video.muted = true;
  video.style.display = "none";
  document.body.appendChild(video);

  const texture = new THREE.VideoTexture(video);
  texture.encoding = THREE.sRGBEncoding;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  const television = new THREE.Mesh(
    new THREE.BoxGeometry(4.72, 2.72, 0.18),
    new THREE.MeshStandardMaterial({ color: 0x101114, roughness: 0.38, metalness: 0.32 })
  );
  television.position.set(0, 2.22, 36.39);
  cinema.add(television);

  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(4.42, 2.42),
    new THREE.MeshBasicMaterial({ map: texture, color: 0xffffff, side: THREE.DoubleSide })
  );
  screen.position.set(0, 2.22, 36.29);
  cinema.add(screen);

  const title = makeLabel(text.cinema);
  title.position.set(0, 3.73, 36.22);
  title.scale.set(3.5, 0.58, 1);
  cinema.add(title);

  const exhibit = {
    title: CINEMA_VIDEO_LIBRARY[0].title,
    src: CINEMA_VIDEO_LIBRARY[0].src,
    display: television,
    screen,
    video,
    sound: null,
    cinema: true,
    playlistIndex: 0
  };

  video.addEventListener("timeupdate", () => {
    if (!exhibit.sound?.duration) return;
    const expected = video.currentTime % exhibit.sound.duration;
    if (Math.abs(exhibit.sound.currentTime - expected) > 0.35) exhibit.sound.currentTime = expected;
  });
  video.addEventListener("pause", () => exhibit.sound?.pause());
  video.addEventListener("play", () => {
    if (!video.muted && exhibit.sound) {
      exhibit.sound.currentTime = exhibit.sound.duration
        ? video.currentTime % exhibit.sound.duration
        : video.currentTime;
      exhibit.sound.play().catch(() => {});
    }
  });

  screen.userData.videoExhibit = exhibit;
  galleryVideoExhibits.push(exhibit);
  galleryVideoScreens.push(screen);
  teleportTargets.push(screen);
  activeGalleryVideo = exhibit;
  videoSelect.innerHTML = "";
  CINEMA_VIDEO_LIBRARY.forEach((item, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = `${index + 1}. ${localizedCinemaTitle(item)}`;
    videoSelect.appendChild(option);
  });

  const controlActions = [
    { label: text.cinemaPrevious, type: "previous" },
    { label: text.cinemaPlayPause, type: "toggle" },
    { label: text.videoRestart, type: "restart" },
    { label: text.cinemaSound, type: "mute" },
    { label: text.cinemaBack, type: "seek", value: -10 },
    { label: text.cinemaForward, type: "seek", value: 10 },
    { label: text.cinemaNext, type: "next" }
  ];
  controlActions.forEach((control, index) => {
    const button = createCinemaButton(control.label, {
      type: control.type,
      value: control.value,
      position: [-3.75, 3.45 - index * 0.39, 36.02],
      width: 1.85,
      height: 0.34,
      material: blueMaterial,
      compact: true
    });
    cinema.add(button);
  });

  const libraryHeading = makeLabel(text.cinemaLibrary);
  libraryHeading.position.set(3.75, 3.72, 35.98);
  libraryHeading.scale.set(1.65, 0.42, 1);
  cinema.add(libraryHeading);
  CINEMA_VIDEO_LIBRARY.forEach((item, index) => {
    const button = createCinemaButton(`${index + 1}. ${localizedCinemaTitle(item)}`, {
      type: "select",
      value: index,
      position: [3.75, 3.35 - index * 0.42, 35.98],
      width: 1.85,
      height: 0.36,
      material: index === 0 ? goldMaterial : blueMaterial
    });
    cinema.add(button);
  });

  [-3.75, 3.75].forEach((x) => {
    const console = new THREE.Mesh(new THREE.BoxGeometry(2.18, 3.42, 0.18), darkMaterial);
    console.position.set(x, 2.02, 36.2);
    cinema.add(console);
  });

  addCinemaViewingSpot(cinema);
  addCinemaSofaModel(cinema).catch((error) => {
    console.warn("The cinema sofa model could not be loaded.", error);
  });
  scene.add(cinema);
  setCinemaVideo(exhibit, 0, false);
  updateGalleryVideoButtons();
}

function localizedCinemaTitle(item) {
  return typeof item.title === "string" ? item.title : item.title?.[lang] || item.title?.en || "";
}

function createCinemaButton(label, options) {
  const canvas = document.createElement("canvas");
  canvas.width = 900;
  canvas.height = 220;
  const context = canvas.getContext("2d");
  const background = context.createLinearGradient(0, 0, canvas.width, canvas.height);
  background.addColorStop(0, options.compact ? "#132331" : "#17384a");
  background.addColorStop(1, options.compact ? "#0b151e" : "#102b3a");
  context.fillStyle = background;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = options.compact ? "#b99a60" : "#a9efff";
  context.lineWidth = options.compact ? 5 : 10;
  context.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);
  if (options.compact) {
    context.strokeStyle = "rgba(255, 241, 210, .24)";
    context.lineWidth = 2;
    context.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
  }
  context.fillStyle = options.compact ? "#f0dfbf" : "#fffaf1";
  context.textAlign = "center";
  context.textBaseline = "middle";
  let size = options.compact
    ? (label.length > 20 ? 34 : label.length > 12 ? 40 : 46)
    : (label.length > 24 ? 46 : label.length > 12 ? 58 : 78);
  context.font = options.compact ? `600 ${size}px Georgia` : `800 ${size}px Arial`;
  while (context.measureText(label).width > canvas.width - 70 && size > 30) {
    size -= 2;
    context.font = options.compact ? `600 ${size}px Georgia` : `800 ${size}px Arial`;
  }
  context.fillText(label, canvas.width / 2, canvas.height / 2);
  const texture = new THREE.CanvasTexture(canvas);
  texture.encoding = THREE.sRGBEncoding;
  const faceMaterial = new THREE.MeshBasicMaterial({ map: texture });
  const button = new THREE.Mesh(
    new THREE.BoxGeometry(options.width, options.height, 0.08),
    [
      options.material,
      options.material,
      options.material,
      options.material,
      faceMaterial,
      faceMaterial
    ]
  );
  button.position.set(...options.position);
  button.userData.cinemaAction = { type: options.type, value: options.value };
  cinemaControlMeshes.push(button);
  teleportTargets.push(button);
  return button;
}

async function addCinemaSofaModel(cinema) {
  const gltf = await modelLoader.loadAsync("assets/paintings/fourniture/sofa.glb");
  const sofa = gltf.scene;
  sofa.name = "cinema-sofa-model";
  sofa.traverse((node) => {
    if (!node.isMesh) return;
    node.castShadow = true;
    node.receiveShadow = true;
    if (node.material) {
      node.material.roughness = Math.max(node.material.roughness ?? 0.72, 0.58);
      node.material.needsUpdate = true;
    }
  });

  sofa.rotation.y = 0;
  sofa.updateMatrixWorld(true);
  let box = new THREE.Box3().setFromObject(sofa);
  let size = box.getSize(new THREE.Vector3());
  if (size.z > size.x) {
    sofa.rotation.y += Math.PI / 2;
    sofa.updateMatrixWorld(true);
    box = new THREE.Box3().setFromObject(sofa);
    size = box.getSize(new THREE.Vector3());
  }
  const scale = 3.75 / Math.max(size.x, 0.001);
  sofa.scale.setScalar(scale);
  sofa.updateMatrixWorld(true);
  box = new THREE.Box3().setFromObject(sofa);
  const center = box.getCenter(new THREE.Vector3());
  sofa.position.set(-center.x, -box.min.y, 29.12 - box.min.z);
  cinema.add(sofa);
}

function addCinemaViewingSpot(cinema) {
  const viewingSpot = new THREE.Group();
  viewingSpot.position.set(0, 0.02, 31);
  viewingSpot.userData.destination = new THREE.Vector3(CINEMA_ROOM_X, 0, 30.1);
  viewingSpot.userData.visitorYaw = Math.PI;
  viewingSpot.userData.visitorHeightOffset = -0.55;
  const target = new THREE.Mesh(
    new THREE.CircleGeometry(0.55, 48),
    new THREE.MeshBasicMaterial({ color: 0xb9914c, transparent: true, opacity: 0.34, side: THREE.DoubleSide })
  );
  target.rotation.x = -Math.PI / 2;
  target.userData.hotspot = viewingSpot;
  viewingSpot.add(target);
  teleportTargets.push(target);
  const label = makeLabel(text.cinemaSit);
  label.position.set(0, 0.03, 0.7);
  label.rotation.x = -Math.PI / 2;
  label.scale.set(1.55, 0.36, 1);
  viewingSpot.add(label);
  cinema.add(viewingSpot);
}

function setCinemaVideo(exhibit, index, autoplay = true) {
  if (!exhibit?.cinema) return;
  const item = CINEMA_VIDEO_LIBRARY[(index + CINEMA_VIDEO_LIBRARY.length) % CINEMA_VIDEO_LIBRARY.length];
  const logicalMuted = exhibit.video.muted;
  exhibit.video.pause();
  if (exhibit.sound) {
    exhibit.sound.pause();
    exhibit.sound.remove();
    exhibit.sound = null;
  }
  exhibit.playlistIndex = (index + CINEMA_VIDEO_LIBRARY.length) % CINEMA_VIDEO_LIBRARY.length;
  exhibit.title = item.title;
  exhibit.src = item.src;
  const companionAudioSrc = lang === "fr" && item.audioSrcFr ? item.audioSrcFr : item.audioSrc;
  exhibit.video.src = item.src;
  exhibit.video.currentTime = 0;
  exhibit.video.muted = logicalMuted;
  exhibit.video.volume = companionAudioSrc ? 0 : 1;
  if (companionAudioSrc) {
    const sound = document.createElement("audio");
    sound.src = companionAudioSrc;
    sound.preload = "auto";
    sound.loop = true;
    sound.muted = logicalMuted;
    sound.style.display = "none";
    document.body.appendChild(sound);
    exhibit.sound = sound;
  }
  exhibit.video.load();
  exhibit.video.addEventListener("loadeddata", () => {
    if (exhibit.video.currentTime === 0) exhibit.video.currentTime = 0.01;
  }, { once: true });
  if (autoplay) exhibit.video.play().catch(() => {});
  activeGalleryVideo = exhibit;
  status.textContent = `${text.cinema}: ${localizedCinemaTitle(item)}`;
  updateGalleryVideoButtons();
}

function runCinemaAction(action) {
  const exhibit = activeGalleryVideo?.cinema
    ? activeGalleryVideo
    : galleryVideoExhibits.find((item) => item.cinema);
  if (!exhibit || !action) return;
  activeGalleryVideo = exhibit;
  if (action.type === "toggle") toggleGalleryVideo(exhibit);
  if (action.type === "restart") restartGalleryVideo(exhibit);
  if (action.type === "mute") toggleGalleryVideoMute(exhibit);
  if (action.type === "previous") setCinemaVideo(exhibit, exhibit.playlistIndex - 1);
  if (action.type === "next") setCinemaVideo(exhibit, exhibit.playlistIndex + 1);
  if (action.type === "select") setCinemaVideo(exhibit, action.value);
  if (action.type === "seek") {
    const duration = Number.isFinite(exhibit.video.duration) ? exhibit.video.duration : Infinity;
    exhibit.video.currentTime = THREE.MathUtils.clamp(exhibit.video.currentTime + action.value, 0, duration);
    if (exhibit.sound) {
      exhibit.sound.currentTime = exhibit.sound.duration
        ? exhibit.video.currentTime % exhibit.sound.duration
        : exhibit.video.currentTime;
    }
  }
}

async function toggleGalleryVideo(exhibit) {
  exhibit = exhibit || activeGalleryVideo || getNearestGalleryVideo();
  if (!exhibit?.video) return;
  activeGalleryVideo = exhibit;
  galleryVideoExhibits.forEach((item) => {
    if (item !== exhibit) {
      item.video.muted = true;
      if (item.sound) {
        item.sound.muted = true;
        item.sound.pause();
      }
      if (!item.video.paused) item.video.play().catch(() => {});
    }
  });
  if (activeExhibit?.audio?.isPlaying) activeExhibit.audio.pause();
  if (exhibit.video.muted) {
    exhibit.video.muted = false;
    if (exhibit.sound) {
      exhibit.sound.muted = false;
      exhibit.sound.currentTime = exhibit.sound.duration
        ? exhibit.video.currentTime % exhibit.sound.duration
        : exhibit.video.currentTime;
      exhibit.sound.play().catch(() => {});
    }
    try {
      await exhibit.video.play();
    } catch (error) {
      console.warn("Video playback is waiting for a visitor gesture.", error);
    }
  } else if (exhibit.video.paused) {
    try {
      await exhibit.video.play();
    } catch (error) {
      console.warn("Video playback is waiting for a visitor gesture.", error);
    }
  } else {
    exhibit.video.pause();
    exhibit.sound?.pause();
  }
  updateGalleryVideoButtons();
}

function restartGalleryVideo(exhibit = activeGalleryVideo) {
  exhibit = exhibit || getNearestGalleryVideo();
  if (!exhibit?.video) return;
  activeGalleryVideo = exhibit;
  exhibit.video.currentTime = 0;
  exhibit.video.muted = false;
  if (exhibit.sound) {
    exhibit.sound.currentTime = 0;
    exhibit.sound.muted = false;
    exhibit.sound.play().catch(() => {});
  }
  exhibit.video.play().catch(() => {});
  updateGalleryVideoButtons();
}

function toggleGalleryVideoMute(exhibit = activeGalleryVideo) {
  exhibit = exhibit || getNearestGalleryVideo();
  if (!exhibit?.video) return;
  activeGalleryVideo = exhibit;
  exhibit.video.muted = !exhibit.video.muted;
  if (exhibit.sound) {
    exhibit.sound.muted = exhibit.video.muted;
    if (exhibit.video.muted) exhibit.sound.pause();
    else {
      exhibit.sound.currentTime = exhibit.sound.duration
        ? exhibit.video.currentTime % exhibit.sound.duration
        : exhibit.video.currentTime;
      exhibit.sound.play().catch(() => {});
    }
  }
  if (!exhibit.video.paused) exhibit.video.play().catch(() => {});
  updateGalleryVideoButtons();
}

function getNearestGalleryVideo() {
  if (!galleryVideoExhibits.length) return null;
  const head = getListenerPosition();
  return galleryVideoExhibits.reduce((nearest, exhibit) => {
    const distance = exhibit.display.getWorldPosition(new THREE.Vector3()).distanceTo(head);
    return !nearest || distance < nearest.distance ? { exhibit, distance } : nearest;
  }, null)?.exhibit || null;
}

function updateGalleryVideoButtons() {
  const video = activeGalleryVideo?.video;
  const disabled = !video;
  videoToggleButton.disabled = disabled;
  videoRestartButton.disabled = disabled;
  videoMuteButton.disabled = disabled;
  videoSelect.disabled = disabled;
  videoPreviousButton.disabled = disabled;
  videoNextButton.disabled = disabled;
  videoBackButton.disabled = disabled;
  videoForwardButton.disabled = disabled;
  if (activeGalleryVideo?.cinema) videoSelect.value = String(activeGalleryVideo.playlistIndex);
  videoToggleButton.textContent = video && !video.paused ? text.videoPause : text.videoPlay;
  videoMuteButton.textContent = video && !video.muted ? text.videoMute : text.videoUnmute;
  videoToggleButton.classList.toggle("active", Boolean(video && !video.paused));
  videoMuteButton.classList.toggle("active", Boolean(video && !video.muted));
}

function updateGalleryVideoVolume() {
  if (!galleryVideoExhibits.length) return;
  const head = getListenerPosition();
  galleryVideoExhibits.forEach((exhibit) => {
    if (exhibit.video.paused || exhibit.video.muted) {
      exhibit.video.volume = 0;
      if (exhibit.sound) exhibit.sound.volume = 0;
      return;
    }
    const position = exhibit.display.getWorldPosition(new THREE.Vector3());
    const volume = THREE.MathUtils.clamp(1.15 - position.distanceTo(head) / 5.5, 0.08, 1);
    if (exhibit.sound) {
      exhibit.video.volume = 0;
      exhibit.sound.volume = volume;
    } else {
      exhibit.video.volume = volume;
    }
  });
}

function toggleVideoFromPointer(event) {
  if (currentSession || (!galleryVideoScreens.length && !cinemaControlMeshes.length)) return;
  const bounds = renderer.domElement.getBoundingClientRect();
  const pointer = new THREE.Vector2(
    ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
    -((event.clientY - bounds.top) / bounds.height) * 2 + 1
  );
  teleportRaycaster.setFromCamera(pointer, camera);
  const hit = teleportRaycaster.intersectObjects([...galleryVideoScreens, ...cinemaControlMeshes], false)[0];
  if (hit?.object.userData.cinemaAction) {
    runCinemaAction(hit.object.userData.cinemaAction);
  } else if (hit?.object.userData.videoExhibit) {
    toggleGalleryVideo(hit.object.userData.videoExhibit);
  }
}

async function buildModelExhibits(paintings) {
  status.textContent = text.loadingModels;
  let loaded = 0;
  const results = await Promise.allSettled(paintings.map(async (painting) => {
    const exhibit = exhibitsBySlug.get(painting.slug);
    const modelSrc = getDefaultModelSource(painting);
    if (!exhibit || !modelSrc) return;
    await addGalleryModel(exhibit, modelSrc);
    loaded += 1;
    status.textContent = `${text.loadingModels} ${loaded}/${paintings.length}`;
  }));
  results.forEach((result, index) => {
    if (result.status === "rejected") {
      console.error(`3D exhibit unavailable for ${paintings[index]?.slug || "unknown painting"}.`, result.reason);
    }
  });
  const furnitureLoaded = await buildFurnitureModelExhibits();
  status.textContent = loaded
    ? `${text.modelsReady} ${loaded + furnitureLoaded}/${paintings.length + FURNITURE_MODEL_EXHIBITS.length}`
    : text.ready;
}

async function buildFurnitureModelExhibits() {
  let loaded = 0;
  const results = await Promise.allSettled(
    FURNITURE_MODEL_EXHIBITS.map(async (item) => {
      const gltf = await modelLoader.loadAsync(item.src);
      addFurnitureGalleryModel(item, gltf.scene);
      loaded += 1;
    })
  );
  results.forEach((result, index) => {
    if (result.status === "rejected") {
      console.error(`Furniture exhibit unavailable for ${FURNITURE_MODEL_EXHIBITS[index].id}.`, result.reason);
    }
  });
  return loaded;
}

function addFurnitureGalleryModel(item, model) {
  const display = new THREE.Group();
  const [x, z] = item.position;
  display.position.set(x, 0, z);
  display.userData.furniture = item.id;

  const pedestal = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 0.2, 1.55),
    new THREE.MeshStandardMaterial({ color: 0x314d5d, roughness: 0.76 })
  );
  pedestal.position.y = 0.1;
  pedestal.receiveShadow = true;
  display.add(pedestal);

  model.updateMatrixWorld(true);
  let box = new THREE.Box3().setFromObject(model);
  let size = box.getSize(new THREE.Vector3());
  if (size.z > size.x) {
    model.rotation.y = Math.PI / 2;
    model.updateMatrixWorld(true);
    box = new THREE.Box3().setFromObject(model);
    size = box.getSize(new THREE.Vector3());
  }
  const scale = 2.2 / Math.max(size.x, size.y, size.z, 0.001);
  model.scale.setScalar(scale);
  model.updateMatrixWorld(true);
  box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  model.position.set(-center.x, 0.21 - box.min.y, -center.z);
  model.traverse((node) => {
    if (!node.isMesh) return;
    node.castShadow = true;
    node.receiveShadow = true;
  });
  display.add(model);

  const localizedTitle = item.title[lang] || item.title.en;
  const label = makeLabel(`${lang === "fr" ? "Modèle 3D" : "3D model"}\n${localizedTitle}`);
  label.position.set(0, 0.5, -0.92);
  label.rotation.y = Math.PI;
  label.rotation.x = -Math.PI / 5;
  label.scale.set(1.72, 0.72, 1);
  display.add(label);

  const light = new THREE.SpotLight(0xffedcf, 0.82, 5, Math.PI / 5, 0.48);
  light.position.set(x, 3.4, z + 0.35);
  light.target = display;
  scene.add(light);
  scene.add(display);

  const pseudoExhibit = {
    painting: { slug: item.id, title: localizedTitle },
    modelDisplay: display
  };
  const hotspot = createModelTeleportHotspot(pseudoExhibit, display);
  scene.add(hotspot);
}

function getDefaultModelSource(painting) {
  if (GALLERY_MODEL_OVERRIDES[painting.slug]) return GALLERY_MODEL_OVERRIDES[painting.slug];
  const variants = painting.media?.modelVariants || painting.ar?.modelVariants || [];
  return variants.find((variant) => variant?.src)?.src
    || painting.media?.model
    || painting.ar?.primaryModel
    || "";
}

async function addGalleryModel(exhibit, modelSrc) {
  const gltf = await modelLoader.loadAsync(modelSrc);
  if (exhibit.painting.slug === "van-gogh-bedroom") {
    await addLifeSizeBedroom(exhibit, gltf.scene);
    return;
  }

  const display = new THREE.Group();
  const [x, z] = exhibit.modelPosition;
  display.position.set(x, 0, z);
  display.userData.painting = exhibit.painting.slug;

  const pedestal = new THREE.Mesh(
    new THREE.BoxGeometry(1.48, 0.24, 1.48),
    new THREE.MeshStandardMaterial({ color: 0xc9bca8, roughness: 0.78 })
  );
  pedestal.position.y = 0.12;
  pedestal.receiveShadow = true;
  display.add(pedestal);

  const model = gltf.scene;
  normalizeGalleryModel(model);
  model.position.y += 0.25;
  model.traverse((node) => {
    if (!node.isMesh) return;
    node.castShadow = false;
    node.receiveShadow = false;
  });
  display.add(model);

  const title = localizedTitle(exhibit.painting);
  const label = makeLabel(`${lang === "fr" ? "Œuvre 3D" : "3D exhibit"}\n${title}`);
  label.position.set(0, 0.43, -0.76);
  label.rotation.y = Math.PI;
  label.rotation.x = -Math.PI / 5;
  label.scale.set(1.55, 0.72, 1);
  display.add(label);

  const light = new THREE.SpotLight(0xffedcf, 0.72, 5, Math.PI / 5, 0.5);
  light.position.set(x, 3.5, z + 0.5);
  light.target = display;
  scene.add(light);

  scene.add(display);
  exhibit.modelDisplay = display;
  const hotspot = createModelTeleportHotspot(exhibit, display);
  scene.add(hotspot);
}

async function addLifeSizeBedroom(exhibit, model) {
  const display = new THREE.Group();
  display.position.set(0, 0, 22.2);
  display.rotation.y = Math.PI;
  display.userData.painting = exhibit.painting.slug;

  const dimensions = scaleBedroomToLifeSize(model, 2.7);
  model.traverse((node) => {
    if (!node.isMesh) return;
    node.castShadow = false;
    node.receiveShadow = true;
    if (node.material) node.material.side = THREE.DoubleSide;
  });
  display.add(model);
  const standingGltf = await modelLoader.loadAsync(STANDING_VAN_GOGH_MODEL);
  addLifeSizeStandingVanGogh(display, standingGltf.scene);
  scene.add(display);
  exhibit.modelDisplay = display;

  const dimensionsText = `${dimensions.width.toFixed(1)} × ${dimensions.depth.toFixed(1)} × ${dimensions.height.toFixed(1)} m`;
  const information = makeLabel(
    `${text.bedroomLifeSize}\n${dimensionsText}`
  );
  information.position.set(0, 1.25, 3.15);
  information.scale.set(2.65, 1.05, 1);
  display.add(information);

  const hotspot = createBedroomEntranceHotspot(exhibit);
  scene.add(hotspot);
}

function addLifeSizeStandingVanGogh(roomDisplay, model) {
  model.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const scale = 1.72 / (size.y || 1);
  model.scale.setScalar(scale);
  model.position.set(
    -center.x * scale - 1.25,
    -box.min.y * scale,
    -center.z * scale + 0.7
  );
  model.rotation.y = Math.PI * 0.12;
  model.traverse((node) => {
    if (!node.isMesh) return;
    node.castShadow = false;
    node.receiveShadow = false;
    if (node.material) node.material.side = THREE.DoubleSide;
  });
  roomDisplay.add(model);
}

function scaleBedroomToLifeSize(model, targetHeight) {
  model.updateMatrixWorld(true);
  const sourceBox = new THREE.Box3().setFromObject(model);
  const sourceSize = sourceBox.getSize(new THREE.Vector3());
  const sourceCenter = sourceBox.getCenter(new THREE.Vector3());
  const scale = targetHeight / (sourceSize.y || 1);
  model.scale.setScalar(scale);
  model.position.set(
    -sourceCenter.x * scale,
    -sourceBox.min.y * scale,
    -sourceCenter.z * scale
  );
  model.updateMatrixWorld(true);
  const scaledBox = new THREE.Box3().setFromObject(model);
  const scaledSize = scaledBox.getSize(new THREE.Vector3());
  return {
    width: scaledSize.x,
    height: scaledSize.y,
    depth: scaledSize.z
  };
}

function createBedroomEntranceHotspot(exhibit) {
  const group = new THREE.Group();
  group.position.set(0, 0.02, 17.4);
  // The authored model has a closed façade. Keep the marker outside, but place
  // the visitor just inside the room so the experience feels like entering it.
  group.userData.destination = new THREE.Vector3(0, 0, 20.6);
  group.userData.visitorYaw = Math.PI;
  group.userData.artwork = exhibit.modelDisplay;
  group.userData.exhibit = exhibit;

  const target = new THREE.Mesh(
    new THREE.CircleGeometry(0.62, 56),
    new THREE.MeshBasicMaterial({
      color: 0x90528f,
      transparent: true,
      opacity: 0.38,
      side: THREE.DoubleSide
    })
  );
  target.rotation.x = -Math.PI / 2;
  target.userData.hotspot = group;
  group.add(target);
  teleportTargets.push(target);

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.46, 0.62, 56),
    new THREE.MeshBasicMaterial({
      color: 0xe6a8e5,
      transparent: true,
      opacity: 0.96,
      side: THREE.DoubleSide
    })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.007;
  group.add(ring);

  const marker = makeLabel(`${lang === "fr" ? "Entrer dans" : "Enter"}\n${localizedTitle(exhibit.painting)}`);
  marker.position.set(0, 0.04, -0.82);
  marker.rotation.x = -Math.PI / 2;
  marker.scale.set(1.65, 0.42, 1);
  group.add(marker);
  return group;
}

function normalizeGalleryModel(model) {
  model.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const largest = Math.max(size.x, size.y, size.z) || 1;
  const scale = 1.32 / largest;
  model.scale.setScalar(scale);
  model.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
  model.updateMatrixWorld(true);
  const normalized = new THREE.Box3().setFromObject(model);
  model.position.y -= normalized.min.y;
}

function createModelTeleportHotspot(exhibit, display) {
  const title = localizedTitle(exhibit.painting);
  const group = new THREE.Group();
  group.position.set(display.position.x, 0.019, display.position.z - 1.55);
  group.userData.destination = new THREE.Vector3(display.position.x, 0, display.position.z - 1.55);
  group.userData.visitorYaw = Math.PI;
  group.userData.artwork = display;
  group.userData.exhibit = exhibit;

  const target = new THREE.Mesh(
    new THREE.CircleGeometry(0.43, 48),
    new THREE.MeshBasicMaterial({
      color: 0x497e9f,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    })
  );
  target.rotation.x = -Math.PI / 2;
  target.userData.hotspot = group;
  group.add(target);
  teleportTargets.push(target);

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.31, 0.43, 48),
    new THREE.MeshBasicMaterial({
      color: 0x8edbff,
      transparent: true,
      opacity: 0.94,
      side: THREE.DoubleSide
    })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.006;
  group.add(ring);

  const marker = makeLabel(`${lang === "fr" ? "Explorer en 3D" : "Explore in 3D"}\n${title}`);
  marker.position.set(0, 0.035, 0.62);
  marker.rotation.x = -Math.PI / 2;
  marker.scale.set(1.25, 0.32, 1);
  group.add(marker);
  return group;
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
  canvas.width = 1600;
  canvas.height = 400;
  const context = canvas.getContext("2d");
  context.fillStyle = "#f2eadc";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = "#4b3c2d";
  context.lineWidth = 12;
  context.strokeRect(6, 6, canvas.width - 12, canvas.height - 12);
  context.fillStyle = "#251f19";
  context.textAlign = "center";
  const lines = message.split("\n");
  let titleSize = 84;
  context.font = `700 ${titleSize}px Georgia`;
  while (context.measureText(lines[0]).width > canvas.width - 100 && titleSize > 54) {
    titleSize -= 4;
    context.font = `700 ${titleSize}px Georgia`;
  }
  context.fillText(lines[0], canvas.width / 2, lines[1] ? 158 : 220);
  context.font = "600 54px Arial";
  context.fillStyle = "#65584b";
  context.fillText(lines[1] || "", canvas.width / 2, 278);

  const texture = new THREE.CanvasTexture(canvas);
  texture.encoding = THREE.sRGBEncoding;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return new THREE.Mesh(
    new THREE.PlaneGeometry(1, 0.25),
    new THREE.MeshBasicMaterial({ map: texture })
  );
}

function makeInformationPanel(painting, title) {
  const canvas = document.createElement("canvas");
  canvas.width = 1800;
  canvas.height = 780;
  const context = canvas.getContext("2d");
  context.fillStyle = "#f4ecdf";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = "#4b3c2d";
  context.lineWidth = 14;
  context.strokeRect(7, 7, canvas.width - 14, canvas.height - 14);

  context.textAlign = "left";
  context.fillStyle = "#211b16";
  let panelTitleSize = 106;
  context.font = `700 ${panelTitleSize}px Georgia`;
  while (context.measureText(title).width > canvas.width - 160 && panelTitleSize > 72) {
    panelTitleSize -= 4;
    context.font = `700 ${panelTitleSize}px Georgia`;
  }
  context.fillText(title, 78, 142);

  context.fillStyle = "#7b2937";
  context.font = "700 52px Arial";
  context.fillText(`${painting.artist?.name || ""} · ${painting.date || ""}`, 80, 222);

  context.fillStyle = "#332b24";
  context.font = "54px Georgia";
  const body = PAINTING_INFO[lang]?.[painting.slug] || painting.texts?.curatorInsight || "";
  drawWrappedText(context, body, 80, 330, canvas.width - 160, 72, 6);

  const texture = new THREE.CanvasTexture(canvas);
  texture.encoding = THREE.sRGBEncoding;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
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

function addHands() {
  hands.forEach((hand, index) => {
    hand.userData.handIndex = index;
    hand.addEventListener("pinchstart", () => interactFromHand(hand));
    visitor.add(hand);
  });
}

function updateHandVisuals() {
  hands.forEach((hand, handIndex) => {
    Object.values(hand.joints || {}).forEach((joint) => {
      if (!joint.userData.artdaciJoint) {
        const marker = new THREE.Mesh(handJointGeometry, handJointMaterials[handIndex]);
        marker.userData.handJointMarker = true;
        joint.add(marker);
        joint.userData.artdaciJoint = marker;
      }
      const radius = joint.jointRadius || 0.008;
      joint.userData.artdaciJoint.scale.setScalar(radius / 0.008);
    });
  });
}

function teleportFrom(controller) {
  rayRotation.identity().extractRotation(controller.matrixWorld);
  teleportRaycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
  teleportRaycaster.ray.direction.set(0, 0, -1).applyMatrix4(rayRotation).normalize();
  const hit = teleportRaycaster.intersectObjects(teleportTargets, false)[0];
  activateInteractionHit(hit);
}

function interactFromHand(hand) {
  const indexTip = hand.joints?.["index-finger-tip"];
  const indexKnuckle = hand.joints?.["index-finger-phalanx-proximal"]
    || hand.joints?.["index-finger-metacarpal"];
  if (!indexTip?.visible || !indexKnuckle?.visible) return;
  const origin = indexTip.getWorldPosition(new THREE.Vector3());
  const direction = origin.clone()
    .sub(indexKnuckle.getWorldPosition(new THREE.Vector3()))
    .normalize();
  teleportRaycaster.set(origin, direction);
  const hit = teleportRaycaster.intersectObjects(teleportTargets, false)[0];
  activateInteractionHit(hit);
}

function activateInteractionHit(hit) {
  if (!hit) return;
  if (hit.object.userData.cinemaAction) {
    runCinemaAction(hit.object.userData.cinemaAction);
    return;
  }
  if (hit.object.userData.videoExhibit) {
    toggleGalleryVideo(hit.object.userData.videoExhibit);
    return;
  }
  if (hit.object.userData.exitUrl) {
    exitGallery(hit.object.userData.exitUrl);
    return;
  }
  const hotspot = hit.object.userData.hotspot;
  if (!hotspot) return;

  activeExhibit = hotspot.userData.exhibit || activeExhibit;
  visitor.rotation.y = hotspot.userData.visitorYaw;
  visitor.updateMatrixWorld(true);
  const head = renderer.xr.getCamera(camera).getWorldPosition(new THREE.Vector3());
  visitor.position.x += hotspot.userData.destination.x - head.x;
  visitor.position.z += hotspot.userData.destination.z - head.z;
  visitor.position.y = hotspot.userData.visitorHeightOffset || 0;
  selectNearestAudioGuide(true);
}

async function exitGallery(url) {
  stopAllAudioGuides();
  galleryVideoExhibits.forEach((exhibit) => exhibit.video.pause());
  if (currentSession) await currentSession.end();
  location.href = url;
}

function bindUI() {
  enterButton.addEventListener("click", toggleVR);
  audioToggleButton.addEventListener("click", toggleAudioGuide);
  audioRestartButton.addEventListener("click", restartAudioGuide);
  audioMuteButton.addEventListener("click", toggleAudioMute);
  videoToggleButton.addEventListener("click", () => toggleGalleryVideo());
  videoRestartButton.addEventListener("click", () => restartGalleryVideo());
  videoMuteButton.addEventListener("click", () => toggleGalleryVideoMute());
  videoSelect.addEventListener("change", () => runCinemaAction({ type: "select", value: Number(videoSelect.value) }));
  videoPreviousButton.addEventListener("click", () => runCinemaAction({ type: "previous" }));
  videoNextButton.addEventListener("click", () => runCinemaAction({ type: "next" }));
  videoBackButton.addEventListener("click", () => runCinemaAction({ type: "seek", value: -10 }));
  videoForwardButton.addEventListener("click", () => runCinemaAction({ type: "seek", value: 10 }));
  renderer.domElement.addEventListener("pointerdown", toggleVideoFromPointer);
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
      visitor.position.set(previewPositionX, 0, previewPositionZ);
      visitor.rotation.set(0, previewRotationY, 0);
    }, { once: true });
    await renderer.xr.setSession(currentSession);
    visitor.position.set(previewPositionX, 0, previewPositionZ);
    visitor.rotation.set(0, previewRotationY, 0);
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
    const paintingPosition = exhibit.hotspot.getWorldPosition(new THREE.Vector3());
    const modelPosition = exhibit.modelDisplay?.getWorldPosition(new THREE.Vector3());
    const distance = Math.min(
      paintingPosition.distanceTo(head),
      modelPosition ? modelPosition.distanceTo(head) : Infinity
    );
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
  const modelPosition = activeExhibit.modelDisplay?.getWorldPosition(new THREE.Vector3());
  const distance = Math.min(
    paintingPosition.distanceTo(head),
    modelPosition ? modelPosition.distanceTo(head) : Infinity
  );
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
    const videoIsNear = activeGalleryVideo
      && activeGalleryVideo.display.getWorldPosition(new THREE.Vector3()).distanceTo(getListenerPosition()) <= 5.5;
    if (videoIsNear) {
      if (current.toggle && !previous.toggle) toggleGalleryVideo(activeGalleryVideo);
      if (current.restart && !previous.restart) restartGalleryVideo(activeGalleryVideo);
      if (current.mute && !previous.mute) toggleGalleryVideoMute(activeGalleryVideo);
    } else {
      if (current.toggle && !previous.toggle) toggleAudioGuide();
      if (current.restart && !previous.restart) restartAudioGuide();
      if (current.mute && !previous.mute) toggleAudioMute();
    }
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
      visitor.position.x = THREE.MathUtils.clamp(visitor.position.x, -5.3, 19.3);
      visitor.position.z = THREE.MathUtils.clamp(visitor.position.z, -4.3, 38.3);
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
  updateHandVisuals();
  updateLocomotion(Math.min(clock.getDelta(), 0.05));
  selectNearestAudioGuide();
  updateAudioVolume();
  updateGalleryVideoVolume();
  updateControllerAudioCommands();
  renderer.render(scene, camera);
}
