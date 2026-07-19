import * as THREE from "../vendor/three.module.js";
import { GLTFLoader } from "../vendor/GLTFLoader.module.js";
import { MindARThree } from "../vendor/mindar-image-three.prod.js";

const CONFIG = {
  slug: "mona-lisa",
  lang: "en",
  target: "",
  model: "",
  modelVariants: [],
  video: "",
  audio: "",
  manifest: "",
  initialScale: 0.42,
  initialRise: 0.18,
  modelRotation: {
    x: 0,
    y: 0,
    z: 0
  }
};

const PAINTINGS = {
  "mona-lisa": "content/paintings/mona-lisa.json",
  "van-gogh": "content/paintings/van-gogh.json",
  "van-gogh-bedroom": "content/paintings/van-gogh-bedroom.json",
  "vermeer-girl-with-a-pearl-earring": "content/paintings/vermeer-girl-with-a-pearl-earring.json"
};

const UI_TEXT = {
  en: {
    ready: "Ready. Tap Start Camera and allow camera access.",
    starting: "Starting...",
    startCamera: "Start Camera",
    back: "Back",
    searching: "Searching",
    locked: "Locked",
    preparing: "Preparing WebAR",
    checkingCamera: "Checking camera permission...",
    audio: "Audio",
    stop: "Stop",
    video: "Video",
    hideVideo: "Hide Video",
    space: "Space",
    rotate: "Rotate",
    reset: "Reset",
    modelChoice: "Model choice",
    noVideoTitle: "No video",
    noVideoBody: "This painting does not have a video layer yet.",
    videoReadyTitle: "Video ready",
    videoReadyBody: "Tap the Video button to play the Mona Lisa documentary layer. Drag the video to move it; use two fingers to resize or rotate it.",
    modelLoading: "Loading the 3D {title} model...",
    trackingReady: "Tracking is ready. The 3D model is loading in the background.",
    engineLoading: "Loading image target and preparing the AR engine...",
    cameraRequest: "Requesting camera permission...",
    modelErrorTitle: "Model could not load",
    modelErrorBody: "The camera is running, but the 3D model file could not be loaded. Check the GLB path and file size.",
    targetErrorTitle: "AR target could not load",
    targetErrorBody: "The image target file could not be loaded. Check the .mind path in the painting manifest.",
    audioUnavailableTitle: "Audio unavailable",
    audioUnavailableBody: "This browser does not support built-in speech narration.",
    audioLoadErrorBody: "The recorded audio could not be loaded. Check that the audio file was uploaded with the site.",
    scanTarget: "Scan the printed {artist}{title} target.",
    catalogue: "Catalogue",
    intro: "Intro",
    arStartErrorTitle: "Camera AR could not start",
    tryAgain: "Try Again",
    audioGuideNotReady: "Audio guide is not ready yet.",
    hotspot: "Hotspot",
    futureLayer: "This interpretive layer is ready for future content.",
    permissionBlocked: "Camera permission was blocked. Tap the site controls in the address bar, allow Camera, then try again.",
    noCamera: "No camera was found. Test on a phone/tablet with a working rear camera, or connect a webcam.",
    cameraInUse: "The camera is already in use by another app or browser tab. Close other camera apps and try again.",
    cameraSettingsUnavailable: "The requested camera settings are not available on this device. Try another browser or device.",
    securityBlocked: "The browser blocked camera access for security reasons. Use HTTPS and avoid embedded/in-app browsers.",
    librariesMissing: "The AR JavaScript libraries did not load. Re-upload the complete project, including the vendor folder.",
    cameraGenericError: "The browser or AR engine refused camera startup. See the technical details below, then try Safari on iOS or Chrome on Android."
  },
  fr: {
    ready: "Prêt. Touchez Démarrer la caméra et autorisez l'accès.",
    starting: "Démarrage...",
    startCamera: "Démarrer la caméra",
    back: "Retour",
    searching: "Recherche",
    locked: "Verrouillé",
    preparing: "Préparation WebAR",
    checkingCamera: "Vérification de l'autorisation caméra...",
    audio: "Audio",
    stop: "Stop",
    video: "Vidéo",
    hideVideo: "Masquer vidéo",
    space: "Espace",
    rotate: "Rotation",
    reset: "Réinitialiser",
    modelChoice: "Choix du modèle",
    noVideoTitle: "Aucune vidéo",
    noVideoBody: "Cette peinture n'a pas encore de couche vidéo.",
    videoReadyTitle: "Vidéo prête",
    videoReadyBody: "Touchez le bouton Vidéo pour lancer la couche documentaire. Faites glisser la vidéo pour la déplacer; utilisez deux doigts pour la redimensionner ou la faire pivoter.",
    modelLoading: "Chargement du modèle 3D : {title}...",
    trackingReady: "Le suivi est prêt. Le modèle 3D se charge en arrière-plan.",
    engineLoading: "Chargement de la cible image et préparation du moteur AR...",
    cameraRequest: "Demande d'autorisation caméra...",
    modelErrorTitle: "Le modèle ne peut pas se charger",
    modelErrorBody: "La caméra fonctionne, mais le fichier 3D ne peut pas être chargé. Vérifiez le chemin du GLB et la taille du fichier.",
    targetErrorTitle: "La cible AR ne peut pas se charger",
    targetErrorBody: "Le fichier cible image ne peut pas être chargé. Vérifiez le chemin du fichier .mind dans la fiche de la peinture.",
    audioUnavailableTitle: "Audio indisponible",
    audioUnavailableBody: "Ce navigateur ne prend pas en charge la narration vocale intégrée.",
    audioLoadErrorBody: "Le fichier audio enregistré ne peut pas être chargé. Vérifiez que le fichier audio a bien été publié avec le site.",
    scanTarget: "Scannez l'image imprimée : {artist}{title}.",
    catalogue: "Catalogue",
    intro: "Intro",
    arStartErrorTitle: "L'AR caméra ne peut pas démarrer",
    tryAgain: "Réessayer",
    audioGuideNotReady: "Le guide audio n'est pas encore prêt.",
    hotspot: "Point d'intérêt",
    futureLayer: "Cette couche d'interprétation est prête pour un contenu futur.",
    permissionBlocked: "L'autorisation caméra a été bloquée. Ouvrez les contrôles du site dans la barre d'adresse, autorisez la caméra, puis réessayez.",
    noCamera: "Aucune caméra n'a été trouvée. Testez sur un téléphone ou une tablette avec caméra arrière, ou connectez une webcam.",
    cameraInUse: "La caméra est déjà utilisée par une autre application ou un autre onglet. Fermez-les puis réessayez.",
    cameraSettingsUnavailable: "Les réglages caméra demandés ne sont pas disponibles sur cet appareil. Essayez un autre navigateur ou appareil.",
    securityBlocked: "Le navigateur a bloqué la caméra pour des raisons de sécurité. Utilisez HTTPS et évitez les navigateurs intégrés.",
    librariesMissing: "Les bibliothèques JavaScript AR ne se sont pas chargées. Republiez le projet complet, y compris le dossier vendor.",
    cameraGenericError: "Le navigateur ou le moteur AR a refusé le démarrage caméra. Consultez les détails techniques, puis essayez Safari sur iOS ou Chrome sur Android."
  }
};

const AR_TRANSLATIONS = {
  fr: {
    "mona-lisa": {
      title: "Mona Lisa",
      texts: {
        historicalContext: "Peinte au début du XVIe siècle, la Mona Lisa appartient à la période de maturité de Léonard de Vinci et reflète l'intérêt de la Haute Renaissance pour le naturalisme idéalisé, la profondeur atmosphérique et la vie intérieure du modèle.",
        artisticAnalysis: "Le portrait repose sur une composition pyramidale calme, des transitions très fines entre ombre et lumière, et une expression énigmatique qui change selon que l'on observe les yeux, la bouche, les mains ou le paysage.",
        composition: "Le modèle est placé dans une structure triangulaire stable. Les mains repliées forment la base, les épaules guident le regard vers le visage, et celui-ci devient le centre immobile d'un paysage en mouvement.",
        palette: "La palette est retenue : carnations chaudes, bruns fumés, verts assourdis, lointains bleu-vert et glacis sombres qui créent la profondeur sans contours durs.",
        perspectiveTechnique: "Léonard utilise le sfumato pour adoucir les transitions et la perspective atmosphérique pour faire reculer le paysage. Les formes semblent ainsi flotter dans l'air.",
        culturalSignificance: "La Mona Lisa est l'une des peintures les plus reconnues au monde et demeure une référence majeure pour le portrait, la culture muséale et l'idée moderne de chef-d'œuvre."
      },
      hotspots: {
        smile: {
          label: "Le sourire",
          category: "détail caché",
          body: "Le sourire semble changer car Léonard adoucit les bords de la bouche par le sfumato, laissant la vision périphérique et l'ombre modifier notre perception."
        },
        hands: {
          label: "Les mains",
          category: "composition",
          body: "Les mains stabilisent la structure pyramidale du portrait et donnent à la figure une présence calme et digne."
        },
        landscape: {
          label: "Le paysage",
          category: "histoire",
          body: "Le paysage utilise la perspective atmosphérique et l'imagination géologique, reliant le modèle aux études de Léonard sur l'eau, la roche et la nature."
        },
        sfumato: {
          label: "Sfumato",
          category: "technique",
          body: "Le sfumato signifie un passage doux, presque fumé. Léonard modèle les formes par des transitions tonales très subtiles plutôt que par des contours nets."
        }
      }
    },
    "van-gogh": {
      title: "Autoportrait",
      texts: {
        historicalContext: "Peint pendant les années parisiennes de Van Gogh, cet autoportrait montre ses recherches sur les contrastes de couleur, la touche fragmentée et les leçons de l'impressionnisme et du néo-impressionnisme.",
        artisticAnalysis: "Le visage est construit par de courtes touches directionnelles qui alternent rouges, oranges, verts et jaunes. Le fond bleu-vert vibre face à la barbe rousse et donne au portrait une intensité électrique.",
        composition: "La tête est légèrement tournée en trois quarts, tandis que le regard fixe le spectateur. Le veston sombre stabilise le bas de l'image et le fond actif fait pression autour de la figure.",
        palette: "Van Gogh utilise des contrastes complémentaires : cheveux et barbe rouge-orange contre un environnement bleu-vert, avec des touches de jaune, rose, turquoise et brun-violet.",
        perspectiveTechnique: "Le portrait dépend moins d'un modèle académique que d'une structure de couleur et de touches directionnelles. La forme naît du mouvement de la peinture.",
        culturalSignificance: "Les autoportraits de Van Gogh sont devenus des icônes de l'identité artistique moderne, associant la touche visible à l'intensité intérieure."
      },
      hotspots: {
        eyes: {
          label: "Le regard",
          category: "psychologie",
          body: "Les yeux créent une rencontre directe avec le spectateur et transforment l'autoportrait en acte d'observation de soi."
        },
        beard: {
          label: "Couleurs complémentaires",
          category: "couleur",
          body: "La barbe orange-rouge vibre contre le fond bleu-vert, intensifiant l'énergie visuelle du portrait."
        },
        background: {
          label: "Touches fragmentées",
          category: "touche",
          body: "Le fond n'est pas neutre : ses petites touches créent un mouvement qui entoure et charge la figure."
        },
        jacket: {
          label: "Structure sombre",
          category: "composition",
          body: "Le veston sombre stabilise le bas de l'image tout en reprenant la même énergie de touche que le visage et le fond."
        }
      }
    },
    "van-gogh-bedroom": {
      title: "La Chambre",
      texts: {
        historicalContext: "Van Gogh peint La Chambre à Arles en 1888, peu après son installation dans la Maison jaune. Cette pièce devait représenter le repos, la stabilité et l'espoir d'un foyer d'artiste dans le sud de la France.",
        artisticAnalysis: "La peinture transforme une chambre simple en espace psychologique intense. Les meubles basculent, les murs penchent et les contours forts maintiennent les couleurs vives en place.",
        composition: "Les lames du plancher guident le regard vers le fond, tandis que le lit domine la partie droite. Chaises, table, tableaux et fenêtre créent un rythme de rectangles.",
        palette: "Van Gogh utilise de grands aplats de bleu, lavande, jaune, orange, vert et rouge. Il voulait évoquer le repos, mais les contrastes rendent la chambre très vivante.",
        perspectiveTechnique: "La perspective est volontairement simplifiée et déformée. Les lignes inclinées et les couleurs plates donnent à la chambre une force expressive.",
        culturalSignificance: "La Chambre est devenue l'une des images les plus aimées de Van Gogh parce qu'elle transforme un intérieur privé en portrait de désir de repos, d'abri et d'espoir artistique."
      },
      hotspots: {
        bed: {
          label: "Le lit",
          category: "symbolique",
          body: "Le grand lit jaune domine la chambre et fait du repos le centre émotionnel de la composition."
        },
        chairs: {
          label: "Les chaises vides",
          category: "composition",
          body: "Les chaises suggèrent la vie quotidienne, l'hospitalité et l'absence. Elles rendent la pièce habitée même sans figure humaine."
        },
        pictures: {
          label: "Les tableaux au mur",
          category: "artiste",
          body: "Les petites images au mur renvoient à l'univers artistique de Van Gogh et transforment la chambre en espace personnel."
        },
        perspective: {
          label: "Perspective inclinée",
          category: "technique",
          body: "Le sol et les meubles ne suivent pas une perspective académique stricte. Leur inclinaison donne à la chambre une tension expressive."
        }
      }
    },
    "vermeer-girl-with-a-pearl-earring": {
      title: "La Jeune Fille à la perle",
      texts: {
        historicalContext: "Peinte à Delft vers 1665, l'œuvre est une tronie : une étude de caractère et de costume plutôt qu'un portrait commandé d'une personne identifiée.",
        artisticAnalysis: "La jeune fille se retourne au moment de la rencontre. Son regard direct, ses lèvres entrouvertes et les contours adoucis rendent l'image immédiate tout en préservant son mystère.",
        composition: "La silhouette triangulaire se détache du fond sombre. La tête et le corps tournent en sens opposés, créant un mouvement en spirale qui aboutit au regard.",
        palette: "Vermeer oppose le bleu outremer et le jaune du turban aux tons terreux du vêtement. Glacis, peinture opaque et reflets précis construisent la lumière.",
        perspectiveTechnique: "Sans architecture visible, la profondeur naît des superpositions, des bords adoucis et des transitions tonales. Les effets optiques ont suscité des comparaisons avec la chambre noire, sans preuve d'une méthode unique.",
        culturalSignificance: "Souvent surnommée la Joconde du Nord, l'œuvre est devenue une icône du mystère, du regard et de l'identité imaginée."
      },
      hotspots: {
        gaze: { label: "Le regard", category: "observation", body: "Les yeux rencontrent le spectateur au moment où la jeune fille se retourne, créant une proximité sans récit explicatif." },
        pearl: { label: "La perle", category: "technique", body: "Quelques touches de lumière suffisent à suggérer la boucle d'oreille, sans crochet visible." },
        turban: { label: "Le turban bleu et jaune", category: "couleur", body: "Le costume fantaisiste signale la tronie. L'outremer et le jaune forment le contraste coloré principal." },
        lips: { label: "Les lèvres entrouvertes", category: "technique", body: "Les reflets humides et les bords adoucis donnent l'impression qu'elle va parler." },
        background: { label: "Le rideau vert caché", category: "conservation", body: "L'analyse technique a révélé un rideau vert translucide dont les plis se sont assombris et effacés avec le temps." }
      }
    }
  }
};

const state = {
  mindarThree: null,
  anchor: null,
  model: null,
  modelLoaded: false,
  video: null,
  videoMesh: null,
  videoVisible: false,
  audio: null,
  spin: false,
  warmLight: false,
  speaking: false,
  keepVisible: true,
  targetFoundOnce: false,
  isDragging: false,
  gestureMode: null,
  activePointers: new Map(),
  lastPointerX: 0,
  lastPointerY: 0,
  lastPinchDistance: 0,
  lastTwoFingerY: 0,
  lastTwoFingerX: 0,
  lastTwoFingerAngle: 0,
  videoPointerStart: false,
  manualRotation: {
    x: 0,
    y: 0
  },
  videoTargetPosition: {
    x: 0.64,
    y: 0.02,
    z: 0.36
  },
  videoTargetScale: 1,
  videoTargetRotation: 0,
  targetRise: CONFIG.initialRise,
  targetScale: CONFIG.initialScale,
  selectedModelIndex: 0,
  modelLoading: false,
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
  selectPainting();
  bindUI();
  applyStaticLanguage();
  await loadManifest();
  setStartupMessage(t("ready"));
}

function selectPainting() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("painting") || "mona-lisa";
  CONFIG.slug = PAINTINGS[slug] ? slug : "mona-lisa";
  CONFIG.lang = params.get("lang") === "fr" ? "fr" : "en";
  CONFIG.manifest = PAINTINGS[CONFIG.slug];
}

function t(key) {
  return UI_TEXT[CONFIG.lang]?.[key] || UI_TEXT.en[key] || key;
}

function applyStaticLanguage() {
  document.documentElement.lang = CONFIG.lang;
  document.querySelector(".icon-link").textContent = t("back");
  document.getElementById("tracking-status").textContent = t("searching");
  document.querySelector("#loading-screen h1").textContent = t("preparing");
  const startButton = document.getElementById("start-ar");
  startButton.innerHTML = `<span class="camera-glyph" aria-hidden="true"></span>${t("startCamera")}`;
  startButton.setAttribute("aria-label", t("startCamera"));
  document.getElementById("audio-guide").textContent = t("audio");
  document.getElementById("video-guide").textContent = t("video");
  document.getElementById("toggle-spin").textContent = t("rotate");
  document.getElementById("reset-view").textContent = t("reset");
  document.getElementById("space-link").textContent = t("space");
  document.getElementById("space-link").href = `space.html?painting=${CONFIG.slug}&lang=${CONFIG.lang}&v=14`;
  document.getElementById("panel-kicker").textContent = t("catalogue");
}

function localizeManifest(manifest) {
  const translation = AR_TRANSLATIONS[CONFIG.lang]?.[CONFIG.slug];
  if (!translation) return manifest;

  const localized = JSON.parse(JSON.stringify(manifest));
  localized.title = translation.title || localized.title;
  localized.texts = {
    ...(localized.texts || {}),
    ...(translation.texts || {})
  };
  localized.hotspots = (localized.hotspots || []).map((hotspot) => ({
    ...hotspot,
    ...(translation.hotspots?.[hotspot.id] || {})
  }));
  return localized;
}

function bindUI() {
  document.getElementById("start-ar").addEventListener("click", async (event) => {
    if (state.started) return;
    state.started = true;
    event.currentTarget.disabled = true;
    event.currentTarget.textContent = t("starting");
    await startAR();
  });

  document.getElementById("toggle-spin").addEventListener("click", (event) => {
    state.spin = !state.spin;
    event.currentTarget.classList.toggle("active", state.spin);
  });

  document.getElementById("audio-guide").addEventListener("click", () => {
    toggleAudioGuide();
  });

  document.getElementById("video-guide").addEventListener("click", () => {
    toggleVideoLayer();
  });

  document.getElementById("reset-view").addEventListener("click", () => {
    state.spin = false;
    state.warmLight = false;
    state.keepVisible = true;
    state.manualRotation.x = 0;
    state.manualRotation.y = 0;
    state.targetRise = CONFIG.initialRise;
    state.targetScale = CONFIG.initialScale;
    resetVideoTransform();
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
    if (!state.model && !state.videoMesh) return;
    event.preventDefault();
    state.activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (state.activePointers.size === 1) {
      state.videoPointerStart = isPointerOnVideo(event);
    }
    root.setPointerCapture?.(event.pointerId);
    updateGestureStart();
  });

  root.addEventListener("pointermove", (event) => {
    if ((!state.model && !state.videoMesh) || !state.activePointers.has(event.pointerId)) return;
    event.preventDefault();
    state.activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (state.activePointers.size >= 2) {
      handleTwoFingerGesture();
      return;
    }

    if (state.gestureMode === "video") {
      moveVideoWithPointer(event);
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
    if (state.activePointers.size === 0) state.videoPointerStart = false;
    updateGestureStart();
  });

  root.addEventListener("pointercancel", (event) => {
    state.activePointers.delete(event.pointerId);
    state.isDragging = false;
    if (state.activePointers.size === 0) state.videoPointerStart = false;
    updateGestureStart();
  });
}

function updateGestureStart() {
  const pointers = [...state.activePointers.values()];

  if (pointers.length === 1) {
    state.gestureMode = state.videoPointerStart && state.videoMesh ? "video" : "rotate";
    state.isDragging = true;
    state.lastPointerX = pointers[0].x;
    state.lastPointerY = pointers[0].y;
    return;
  }

  if (pointers.length >= 2) {
    state.gestureMode = state.videoPointerStart && state.videoMesh ? "video-transform" : "transform";
    state.isDragging = false;
    state.lastPinchDistance = getPointerDistance(pointers[0], pointers[1]);
    state.lastTwoFingerAngle = getPointerAngle(pointers[0], pointers[1]);
    state.lastTwoFingerY = (pointers[0].y + pointers[1].y) / 2;
    state.lastTwoFingerX = (pointers[0].x + pointers[1].x) / 2;
    return;
  }

  state.gestureMode = null;
  state.lastPinchDistance = 0;
  state.lastTwoFingerAngle = 0;
  state.lastTwoFingerX = 0;
}

function handleTwoFingerGesture() {
  const pointers = [...state.activePointers.values()];
  if (pointers.length < 2) return;

  const distance = getPointerDistance(pointers[0], pointers[1]);
    const midX = (pointers[0].x + pointers[1].x) / 2;
  const midY = (pointers[0].y + pointers[1].y) / 2;

  if (state.gestureMode === "video-transform") {
    if (state.lastPinchDistance > 0) {
      const scaleDelta = distance / state.lastPinchDistance;
      state.videoTargetScale = clamp(state.videoTargetScale * scaleDelta, 0.45, 2.4);
    }

    if (state.lastTwoFingerY > 0) {
      state.videoTargetPosition.x = clamp(state.videoTargetPosition.x + (midX - state.lastTwoFingerX) * 0.0022, -1.25, 1.25);
      state.videoTargetPosition.y = clamp(state.videoTargetPosition.y - (midY - state.lastTwoFingerY) * 0.0022, -0.9, 0.7);
    }

    state.lastPinchDistance = distance;
    state.lastTwoFingerX = midX;
    state.lastTwoFingerY = midY;
    return;
  }

  if (state.lastPinchDistance > 0) {
    const scaleDelta = distance / state.lastPinchDistance;
    state.targetScale = clamp(state.targetScale * scaleDelta, 0.14, 1.35);
  }

  if (state.lastTwoFingerY > 0) {
    const raiseDelta = (state.lastTwoFingerY - midY) * 0.0025;
    state.targetRise = clamp(state.targetRise + raiseDelta, -0.08, 0.85);
  }

  state.lastPinchDistance = distance;
  state.lastTwoFingerX = midX;
  state.lastTwoFingerY = midY;
}

function getPointerDistance(first, second) {
  return Math.hypot(first.x - second.x, first.y - second.y);
}

function getPointerAngle(first, second) {
  return Math.atan2(second.y - first.y, second.x - first.x);
}

function getAngleDelta(angle, previousAngle) {
  let delta = angle - previousAngle;
  if (delta > Math.PI) delta -= Math.PI * 2;
  if (delta < -Math.PI) delta += Math.PI * 2;
  return delta;
}

function isPointerOnVideo(event) {
  if (!state.videoMesh || !state.videoMesh.visible || !state.mindarThree?.camera) return false;

  const rect = event.currentTarget.getBoundingClientRect();
  const pointer = new THREE.Vector2(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -(((event.clientY - rect.top) / rect.height) * 2 - 1)
  );
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(pointer, state.mindarThree.camera);
  return raycaster.intersectObject(state.videoMesh, true).length > 0;
}

function moveVideoWithPointer(event) {
  const deltaX = event.clientX - state.lastPointerX;
  const deltaY = event.clientY - state.lastPointerY;
  state.lastPointerX = event.clientX;
  state.lastPointerY = event.clientY;
  state.videoTargetPosition.x = clamp(state.videoTargetPosition.x + deltaX * 0.0022, -1.25, 1.25);
  state.videoTargetPosition.y = clamp(state.videoTargetPosition.y - deltaY * 0.0022, -0.9, 0.7);
}

function resetVideoTransform() {
  state.videoTargetPosition.x = 0;
  state.videoTargetPosition.y = -0.58;
  state.videoTargetPosition.z = CONFIG.initialRise + 0.14;
  state.videoTargetScale = 0.88;
  state.videoTargetRotation = 0;
  if (state.videoMesh) {
    state.videoMesh.rotation.z = state.videoTargetRotation;
  }
}

async function loadManifest() {
  try {
    const response = await fetch(CONFIG.manifest);
    state.manifest = localizeManifest(await response.json());
    hotspotFallback.intro.body = state.manifest.texts.artisticAnalysis;
    configureFromManifest(state.manifest);
    updateInterfaceFromManifest(state.manifest);
    renderHotspotButtons(state.manifest);
  } catch (error) {
    console.warn("Manifest could not be loaded. Using fallback copy.", error);
  }
}

function renderHotspotButtons(manifest) {
  const bar = document.querySelector(".hotspot-bar");
  const buttons = [
    { id: "intro", label: t("intro") },
    ...(manifest.hotspots || []).slice(0, 8).map((hotspot) => ({
      id: hotspot.id,
      label: hotspot.label
    }))
  ];

  bar.innerHTML = "";
  buttons.forEach((item, index) => {
    const button = document.createElement("button");
    button.className = `hotspot${index === 0 ? " active" : ""}`;
    button.type = "button";
    button.dataset.hotspot = item.id;
    button.textContent = item.label;
    button.addEventListener("click", () => {
      document.querySelectorAll(".hotspot").forEach((node) => node.classList.remove("active"));
      button.classList.add("active");
      showHotspot(item.id);
    });
    bar.appendChild(button);
  });
}

function configureFromManifest(manifest) {
  const audioGuide = getLocalizedAudioGuide(manifest);
  CONFIG.modelVariants = getModelVariants(manifest);
  state.selectedModelIndex = 0;
  CONFIG.target = manifest.ar?.compiledTarget || manifest.print?.compiledMindTarget || CONFIG.target;
  CONFIG.model = CONFIG.modelVariants[0]?.src || manifest.ar?.primaryModel || manifest.media?.model || CONFIG.model;
  CONFIG.video = manifest.media?.videos?.[0]?.src || "";
  CONFIG.audio = audioGuide?.src ? withAssetVersion(audioGuide.src) : "";
  CONFIG.initialScale = manifest.ar?.viewer?.initialScale ?? CONFIG.initialScale;
  CONFIG.initialRise = manifest.ar?.viewer?.initialRise ?? CONFIG.initialRise;
  CONFIG.modelRotation = manifest.ar?.viewer?.modelRotation || CONFIG.modelRotation;
  state.audio?.pause();
  state.audio = null;
  state.speaking = false;
  state.targetScale = CONFIG.initialScale;
  state.targetRise = CONFIG.initialRise;
  resetVideoTransform();
  renderModelVariantControls();
}

function getLocalizedAudioGuide(manifest) {
  const guides = manifest.media?.audioGuides || [];
  const localizedGuide = guides.find((guide) => guide.lang === CONFIG.lang);
  if (localizedGuide) return localizedGuide;
  if (CONFIG.lang !== "en") return guides.find((guide) => guide.lang === "en") || null;
  return null;
}

function getModelVariants(manifest) {
  const variants = manifest.ar?.modelVariants || manifest.media?.modelVariants || [];
  const list = Array.isArray(variants) ? variants : [];
  if (list.length) {
    return list.filter((variant) => variant?.src);
  }

  const fallback = manifest.ar?.primaryModel || manifest.media?.model || CONFIG.model;
  return fallback
    ? [{ id: "model-1", label: { en: "Model 1", fr: "Modèle 1" }, src: fallback }]
    : [];
}

function getModelVariantLabel(variant, index) {
  if (typeof variant.label === "string") return variant.label;
  return variant.label?.[CONFIG.lang] || variant.label?.en || `Model ${index + 1}`;
}

function renderModelVariantControls() {
  document.getElementById("model-variant-group")?.remove();
  if (CONFIG.modelVariants.length < 2) return;

  const dock = document.querySelector(".mini-dock");
  if (!dock) return;

  const group = document.createElement("div");
  group.id = "model-variant-group";
  group.className = "model-variant-group";
  group.setAttribute("role", "group");
  group.setAttribute("aria-label", t("modelChoice"));

  CONFIG.modelVariants.forEach((variant, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `model-variant${index === state.selectedModelIndex ? " active" : ""}`;
    button.dataset.modelIndex = String(index);
    button.textContent = getModelVariantLabel(variant, index);
    button.addEventListener("click", () => switchModelVariant(index));
    group.appendChild(button);
  });

  dock.insertBefore(group, document.getElementById("toggle-spin"));
}

function updateModelVariantControls() {
  document.querySelectorAll(".model-variant").forEach((button) => {
    const isActive = Number(button.dataset.modelIndex) === state.selectedModelIndex;
    button.classList.toggle("active", isActive);
    button.disabled = state.modelLoading;
  });
}

async function switchModelVariant(index) {
  if (!CONFIG.modelVariants[index] || index === state.selectedModelIndex || state.modelLoading) return;

  state.selectedModelIndex = index;
  CONFIG.model = CONFIG.modelVariants[index].src;
  updateModelVariantControls();

  if (!state.anchor?.group || !state.started) return;

  if (state.model) {
    state.anchor.group.remove(state.model);
    disposeModel(state.model);
    state.model = null;
    state.modelLoaded = false;
  }

  try {
    await loadModel(state.anchor.group);
  } catch (error) {
    console.error(error);
    document.getElementById("panel-title").textContent = t("modelErrorTitle");
    document.getElementById("panel-body").textContent = t("modelErrorBody");
    document.getElementById("info-panel").classList.remove("collapsed");
  } finally {
    updateModelVariantControls();
  }
}

function disposeModel(model) {
  model.traverse((child) => {
    if (!child.isMesh) return;
    child.geometry?.dispose?.();
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.filter(Boolean).forEach((material) => {
      Object.values(material).forEach((value) => {
        if (value?.isTexture) value.dispose();
      });
      material.dispose?.();
    });
  });
}

function withAssetVersion(src) {
  const separator = src.includes("?") ? "&" : "?";
  return `${src}${separator}lang=${CONFIG.lang}&v=22`;
}

function updateInterfaceFromManifest(manifest) {
  const title = manifest.title || "Artwork";
  const artist = manifest.artist?.name || "";
  const spread = manifest.print?.spreadNumber ? `Spread ${String(manifest.print.spreadNumber).padStart(3, "0")}` : "Spread";
  document.title = `DACIART WebAR Viewer - ${title}`;
  document.getElementById("spread-label").textContent = spread;
  document.getElementById("artwork-title").textContent = title;
  document.getElementById("panel-title").textContent = title;
  document.getElementById("panel-body").textContent = t("scanTarget")
    .replace("{artist}", artist ? `${artist} ` : "")
    .replace("{title}", title);
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
    setStartupMessage(t("engineLoading"));
    await verifyRequiredAsset(CONFIG.target, t("targetErrorBody"));
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

    state.anchor.onTargetFound = () => {
      state.targetFoundOnce = true;
      state.anchor.group.visible = true;
      setTrackingStatus(true);
      showHotspot("intro");
      if (!state.modelLoaded) {
        document.getElementById("panel-body").textContent = t("trackingReady");
      }
    };

    state.anchor.onTargetLost = () => {
      setTrackingStatus(false);
      if (state.keepVisible && state.targetFoundOnce) {
        state.anchor.group.visible = true;
      }
    };

    setStartupMessage(t("cameraRequest"));
    await state.mindarThree.start();
    document.getElementById("loading-screen").classList.add("hidden");
    renderer.setAnimationLoop(() => renderFrame(renderer, scene, camera));
    loadModel(state.anchor.group).catch((error) => {
      console.error(error);
      document.getElementById("panel-title").textContent = t("modelErrorTitle");
      document.getElementById("panel-body").textContent = t("modelErrorBody");
      document.getElementById("info-panel").classList.remove("collapsed");
    });
    if (CONFIG.video) {
      addVideoLayer(state.anchor.group);
    }
  } catch (error) {
    showStartupError(error);
  }
}

async function verifyRequiredAsset(src, message) {
  if (!src) throw new Error(message);
  try {
    const response = await fetch(src, { cache: "reload" });
    if (!response.ok) {
      throw new Error(`${message} (${src}: ${response.status})`);
    }
  } catch (error) {
    if (error.message?.includes(src)) throw error;
    console.warn("Asset preflight failed; allowing AR engine to try loading directly.", error);
  }
}

function addVideoLayer(group) {
  const button = document.getElementById("video-guide");
  button.disabled = false;
  button.classList.add("active");
  button.textContent = t("hideVideo");

  const video = document.createElement("video");
  video.src = CONFIG.video;
  video.crossOrigin = "anonymous";
  video.loop = true;
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";

  const texture = new THREE.VideoTexture(video);
  texture.encoding = THREE.sRGBEncoding;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  const aspect = 16 / 9;
  const width = 0.72;
  const geometry = new THREE.PlaneGeometry(width, width / aspect);
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 1,
    toneMapped: false
  });

  const panel = new THREE.Mesh(geometry, material);
  panel.name = "ar-video-panel";
  panel.position.set(state.videoTargetPosition.x, state.videoTargetPosition.y, state.videoTargetPosition.z);
  panel.scale.setScalar(state.videoTargetScale);
  panel.rotation.z = state.videoTargetRotation;
  panel.renderOrder = 20;
  panel.visible = true;
  group.add(panel);

  state.video = video;
  state.videoMesh = panel;
  state.videoVisible = true;

  video.play().catch(() => {
    document.getElementById("panel-title").textContent = t("videoReadyTitle");
    document.getElementById("panel-body").textContent = t("videoReadyBody");
    document.getElementById("info-panel").classList.remove("collapsed");
  });
}

function toggleVideoLayer() {
  const button = document.getElementById("video-guide");

  if (!CONFIG.video) {
    document.getElementById("panel-title").textContent = t("noVideoTitle");
    document.getElementById("panel-body").textContent = t("noVideoBody");
    document.getElementById("info-panel").classList.remove("collapsed");
    return;
  }

  if (!state.videoMesh) {
    if (state.anchor?.group) addVideoLayer(state.anchor.group);
    return;
  }

  state.videoVisible = !state.videoVisible;
  state.videoMesh.visible = state.videoVisible;
  button.classList.toggle("active", state.videoVisible);

  if (state.videoVisible) {
    state.video?.play().catch(() => {});
    button.textContent = t("hideVideo");
  } else {
    state.video?.pause();
    button.textContent = t("video");
  }
}

async function preflightCamera() {
  if (!window.isSecureContext) {
    throw new Error("This page is not running in a secure browser context. Camera access requires HTTPS or localhost.");
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("This browser does not expose navigator.mediaDevices.getUserMedia. Use Safari on iOS or Chrome on Android, and avoid in-app browsers.");
  }

  setStartupMessage(t("checkingCamera"));
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

async function loadModel(group) {
  const label = state.manifest?.title || "artwork";
  document.getElementById("panel-body").textContent = t("modelLoading").replace("{title}", label);
  const loader = new GLTFLoader();
  state.modelLoading = true;
  updateModelVariantControls();

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
        state.modelLoaded = true;
        state.modelLoading = false;
        updateModelVariantControls();
        showHotspot("intro");
        playNativeAudioGuide(true);
        resolve();
      },
      undefined,
      (error) => {
        state.modelLoading = false;
        updateModelVariantControls();
        reject(error);
      }
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

  if (state.videoMesh) {
    state.videoMesh.position.x += (state.videoTargetPosition.x - state.videoMesh.position.x) * 0.16;
    state.videoMesh.position.y += (state.videoTargetPosition.y - state.videoMesh.position.y) * 0.16;
    state.videoMesh.position.z += (state.videoTargetPosition.z - state.videoMesh.position.z) * 0.16;
    const videoScale = new THREE.Vector3(state.videoTargetScale, state.videoTargetScale, state.videoTargetScale);
    state.videoMesh.scale.lerp(videoScale, 0.16);
    state.videoMesh.rotation.z = 0;
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
  badge.textContent = locked ? t("locked") : t("searching");
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

function toggleAudioGuide() {
  const button = document.getElementById("audio-guide");

  if (CONFIG.audio) {
    toggleNativeAudioGuide();
    return;
  }

  if (!("speechSynthesis" in window)) {
    document.getElementById("panel-title").textContent = t("audioUnavailableTitle");
    document.getElementById("panel-body").textContent = t("audioUnavailableBody");
    document.getElementById("info-panel").classList.remove("collapsed");
    return;
  }

  if (state.speaking) {
    window.speechSynthesis.cancel();
    state.speaking = false;
    button.classList.remove("active");
    button.textContent = t("audio");
    return;
  }

  const utterance = new SpeechSynthesisUtterance(getAudioGuideText());
  utterance.lang = CONFIG.lang === "fr" ? "fr-FR" : "en-US";
  utterance.rate = 0.92;
  utterance.pitch = 1;
  utterance.onend = () => {
    state.speaking = false;
    button.classList.remove("active");
    button.textContent = t("audio");
  };

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
  state.speaking = true;
  button.classList.add("active");
  button.textContent = t("stop");
}

function ensureNativeAudioGuide() {
  if (!CONFIG.audio) return null;
  if (state.audio) return state.audio;

  const audio = new Audio(CONFIG.audio);
  audio.preload = "auto";
  audio.playsInline = true;
  audio.addEventListener("error", () => {
    state.speaking = false;
    const button = document.getElementById("audio-guide");
    button.classList.remove("active");
    button.textContent = t("audio");
    document.getElementById("panel-title").textContent = t("audioUnavailableTitle");
    document.getElementById("panel-body").textContent = t("audioLoadErrorBody");
    document.getElementById("info-panel").classList.remove("collapsed");
  });
  audio.addEventListener("ended", () => {
    state.speaking = false;
    const button = document.getElementById("audio-guide");
    button.classList.remove("active");
    button.textContent = t("audio");
  });
  state.audio = audio;
  return audio;
}

function playNativeAudioGuide(quiet = false) {
  const audio = ensureNativeAudioGuide();
  if (!audio) return;

  const button = document.getElementById("audio-guide");
  window.speechSynthesis?.cancel();
  audio.play().then(() => {
    state.speaking = true;
    button.classList.add("active");
    button.textContent = t("stop");
  }).catch(() => {
    state.speaking = false;
    button.classList.remove("active");
    button.textContent = t("audio");
    if (!quiet) {
      document.getElementById("panel-title").textContent = t("audio");
      document.getElementById("panel-body").textContent = CONFIG.lang === "fr"
        ? "Touchez Audio pour lancer la narration enregistrée."
        : "Tap Audio to start the recorded narration.";
      document.getElementById("info-panel").classList.remove("collapsed");
    }
  });
}

function toggleNativeAudioGuide() {
  const audio = ensureNativeAudioGuide();
  const button = document.getElementById("audio-guide");
  if (!audio) return;

  if (state.speaking && !audio.paused) {
    audio.pause();
    state.speaking = false;
    button.classList.remove("active");
    button.textContent = t("audio");
    return;
  }

  playNativeAudioGuide();
}

function getAudioGuideText() {
  const manifest = state.manifest;
  if (!manifest) return t("audioGuideNotReady");

  const artist = manifest.artist?.name ? `by ${manifest.artist.name}` : "";
  const parts = [
    `${manifest.title} ${artist}.`,
    manifest.texts?.historicalContext,
    manifest.texts?.artisticAnalysis,
    manifest.texts?.composition,
    manifest.texts?.palette,
    manifest.texts?.perspectiveTechnique,
    manifest.texts?.culturalSignificance
  ];

  return parts.filter(Boolean).join(" ");
}

function getHotspotContent(id) {
  if (id === "intro") return hotspotFallback.intro;

  const found = state.manifest?.hotspots?.find((item) => item.id === id);
  if (!found) {
    return {
      kicker: t("hotspot"),
      title: state.manifest?.title || "Artwork",
      body: t("futureLayer")
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
  screen.querySelector("h1").textContent = t("arStartErrorTitle");
  setStartupMessage(
    getFriendlyCameraError(error)
  );
  showErrorDetails(error);
  const button = document.getElementById("start-ar");
  button.disabled = false;
  button.textContent = t("tryAgain");
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
    return t("permissionBlocked");
  }

  if (name === "NotFoundError" || name === "DevicesNotFoundError") {
    return t("noCamera");
  }

  if (name === "NotReadableError" || name === "TrackStartError") {
    return t("cameraInUse");
  }

  if (name === "OverconstrainedError") {
    return t("cameraSettingsUnavailable");
  }

  if (name === "SecurityError") {
    return t("securityBlocked");
  }

  if (String(error?.message || "").includes("Required AR libraries")) {
    return t("librariesMissing");
  }

  return t("cameraGenericError");
}

function getMissingLibraryMessage() {
  const missing = [];

  if (!THREE) missing.push("vendor/three.module.js");
  if (!GLTFLoader) missing.push("vendor/GLTFLoader.module.js");
  if (!MindARThree) missing.push("vendor/mindar-image-three.prod.js");

  return `Required AR libraries did not load: ${missing.join(", ")}`;
}

window.addEventListener("load", init);
