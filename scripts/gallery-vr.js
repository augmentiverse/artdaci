import * as THREE from "../vendor/three.module.js";
import { GLTFLoader } from "../vendor/GLTFLoader.module.js";
import { DRACOLoader } from "../vendor/DRACOLoader.module.js";

const MANIFESTS = [
  "content/paintings/mona-lisa.json?v=2",
  "content/paintings/van-gogh.json?v=2",
  "content/paintings/van-gogh-bedroom.json?v=2",
  "content/paintings/vermeer-girl-with-a-pearl-earring.json?v=2"
];
const PRINTED_MANIFESTS = [...MANIFESTS, "content/paintings/monet-impression-sunrise.json?v=2"];
const CONNECTED_AUDIO_WORKS = {
  "da-vinci:0": "mona-lisa",
  "van-gogh:2": "van-gogh",
  "van-gogh:3": "van-gogh-bedroom",
  "vermeer:0": "vermeer-girl-with-a-pearl-earring",
  "monet:0": "monet-impression-sunrise"
};

const GALLERY_IMAGES = {
  "mona-lisa": "assets/paintings/Da Vinci/mona-lisa/images/monalisa-t.png",
  "van-gogh": "assets/paintings/van-gogh/images/van-gogh_portrait-p.png",
  "van-gogh-bedroom": "assets/paintings/van-gogh-bedroom/images/van-gogh_bedroom-t.png",
  "vermeer-girl-with-a-pearl-earring": "assets/paintings/vermeer_Girl-with-a-Pearl-Earring/images/vermee_girl-earring-t.png"
};

const GALLERY_MODEL_OVERRIDES = {
  "van-gogh-bedroom": "assets/paintings/van-gogh-bedroom/bed.glb"
};

// Optional furniture exhibits can be restored here when their GLB assets are present.
const FURNITURE_MODEL_EXHIBITS = [];

const STANDING_VAN_GOGH_MODEL = "assets/paintings/van-gogh/vangogh_istanding.glb";
const PAINTINGS_MODELS_GATEWAY = "assets/paintings/fourniture/gateway-egypt.glb";
const LOUVRE_FACADE_MODEL = "assets/paintings/fourniture/louvre-facade_c.glb";
const OPEN_BOOK_MODEL = "assets/paintings/fourniture/open-book_c.glb";
const BEDROOM_VR_WORLD_URL = "https://marble.worldlabs.ai/worldvr/48b7eb17-56e4-4873-a253-fa13ed516fae";
const LEONARDO_STUDIO_VR_WORLD_URL = "https://marble.worldlabs.ai/worldvr/862ab5f6-8608-469c-a840-8cb10f3859ae";
const LEONARDO_ENRICHED_STUDIO_URL = "https://marble.worldlabs.ai/project/c7853f32-4025-4d66-a536-54bb9db6162d";
const CINEMA_ROOM_X = 14;
const CINEMA_VIDEO_LIBRARY = [
  {
    title: { en: "Leonardo Painting the Mona Lisa", fr: "Léonard peignant La Joconde", ar: "ليوناردو يرسم الموناليزا" },
    src: "assets/paintings/Da Vinci/mona-lisa/audio-video/davinci_painting_monalisa.mp4"
  },
  {
    title: { en: "Mona Lisa Reimagined", fr: "La Joconde réimaginée", ar: "الموناليزا معاد تخيلها" },
    src: "assets/paintings/Da Vinci/mona-lisa/audio-video/mona-lisa_video.mp4",
    audioSrc: "assets/paintings/Da Vinci/mona-lisa/audio-video/Centuries_Behind_Glass.mp3",
    audioSrcFr: "assets/paintings/Da Vinci/mona-lisa/audio-video/La_Joconde_s_évade.mp3",
    audioSrcAr: "assets/paintings/Da Vinci/mona-lisa/audio-video/رقصة_خلف_الإطار.mp3"
  },
  {
    title: { en: "Leonardo’s Vision II", fr: "La vision de Léonard II", ar: "رؤية ليوناردو الثانية" },
    src: "assets/paintings/Da Vinci/mona-lisa/audio-video/dv2.mp4"
  },
  {
    title: { en: "Mona Lisa in Motion", fr: "La Joconde en mouvement", ar: "الموناليزا في حركة" },
    src: "assets/paintings/Da Vinci/mona-lisa/audio-video/m2Vmg.mp4"
  },
  {
    title: { en: "Beyond the Frame III", fr: "Au-delà du cadre III", ar: "خارج الإطار ٣" },
    src: "assets/paintings/Da Vinci/mona-lisa/audio-video/monalisa-out-of-frame-3.mp4"
  }
];

const REIMAGINED_ARTWORKS = [
  { src: "assets/gallery/reimagined/mona-lisa_out.png", title: "Mona Lisa — Beyond the frame", titleAr: "الموناليزا — خارج الإطار" },
  { src: "assets/gallery/reimagined/Monalisa-Davinci.png", title: "Mona Lisa and Leonardo", titleAr: "الموناليزا وليوناردو" },
  { src: "assets/gallery/reimagined/Monalisa-louvre-1.png", title: "Mona Lisa at the Louvre", titleAr: "الموناليزا في اللوفر" },
  { src: "assets/gallery/reimagined/the-bedroom.avif", title: "The Bedroom — Reimagined", titleAr: "غرفة النوم — معاد تخيلها" },
  { src: "assets/gallery/reimagined/van-gogh_in_bedroom-standing.png", title: "Van Gogh in The Bedroom", titleAr: "فان غوخ في غرفة النوم" },
  { src: "assets/gallery/reimagined/vermeer_girl-earring-p.png", title: "Girl with a Pearl Earring — Portrait", titleAr: "الفتاة ذات القرط اللؤلؤي — بورتريه" },
  { src: "assets/gallery/reimagined/vermeer_Girl-with-a-Pearl-Earring_sitting.png", title: "Girl with a Pearl Earring — Seated", titleAr: "الفتاة ذات القرط اللؤلؤي — جالسة" }
];

function getReimaginedPainter(item) {
  if (/bedroom|van-gogh/i.test(item.src)) return "van-gogh";
  if (/vermeer/i.test(item.src)) return "vermeer";
  if (/monet/i.test(item.src)) return "monet";
  return "da-vinci";
}

const ARTIST_ROOMS = {
  "da-vinci": {
    name: "Leonardo da Vinci",
    accent: 0x9d7040,
    works: [
      ["Mona Lisa", "assets/paintings/Da Vinci/Tableaux/Mana Lisa_DaVici.webp"],
      ["The Last Supper", "assets/paintings/Da Vinci/Tableaux/The Last Supper_DaVinci.webp"],
      ["Lady with an Ermine", "assets/paintings/Da Vinci/Tableaux/The Lady with an Ermine_DaVinci.webp"],
      ["The Annunciation", "assets/paintings/Da Vinci/Tableaux/The Annunciation_DaVinci.webp"],
      ["Ginevra de' Benci", "assets/paintings/Da Vinci/Tableaux/Ginevra de' Benci.webp"],
      ["La Belle Ferronnière", "assets/paintings/Da Vinci/Tableaux/La Belle Ferronnière_DaVinci.webp"]
    ]
  },
  "van-gogh": {
    name: "Vincent van Gogh",
    accent: 0xd2a62e,
    works: [
      ["The Starry Night", "assets/paintings/van-gogh/tableaux/The Starry Night_VanGogh.webp"],
      ["Sunflowers", "assets/paintings/van-gogh/tableaux/Tournesols_VanGogh.webp"],
      ["Self-Portrait", "assets/paintings/van-gogh/tableaux/Autoportrait_VanGogh.webp"],
      ["The Bedroom", "assets/paintings/van-gogh/tableaux/The Bedroom_VanGogh.webp"],
      ["Café Terrace at Night", "assets/paintings/van-gogh/tableaux/Café Terrasse at Night_VanGogh.webp"],
      ["The Night Café", "assets/paintings/van-gogh/tableaux/The Night Café_VanGogh.webp"]
    ]
  },
  vermeer: {
    name: "Johannes Vermeer",
    accent: 0x315d78,
    works: [
      ["Girl with a Pearl Earring", "assets/paintings/Vermeer/Girl with a Pearl Earring_Vermeer.webp"],
      ["The Milkmaid", "assets/paintings/Vermeer/The Milkmaid_Vermeer.webp"],
      ["View of Delft", "assets/paintings/Vermeer/View of Delft_Vermeer.webp"],
      ["The Art of Painting", "assets/paintings/Vermeer/The Art of Painting_Vermeer.webp"],
      ["The Astronomer", "assets/paintings/Vermeer/The Astronomer_Vermeer.webp"],
      ["Woman Holding a Balance", "assets/paintings/Vermeer/Woman Holding a Balance_Vermeer.webp"]
    ]
  },
  monet: {
    name: "Claude Monet",
    accent: 0x668d74,
    works: [
      ["Impression, Sunrise", "assets/paintings/monet/Tableaux/Impression-Sunrise_Monet.webp"],
      ["Water Lilies", "assets/paintings/monet/Tableaux/Water Lilies_Monet.webp"],
      ["The Japanese Bridge", "assets/paintings/monet/Tableaux/The Japanese Bridge_Monet.webp"],
      ["Poppies", "assets/paintings/monet/Tableaux/Poppies_Monet.webp"],
      ["Woman with a Parasol", "assets/paintings/monet/Tableaux/Woman with a parasol_Monet.webp"],
      ["Le Pont d'Argenteuil", "assets/paintings/monet/Tableaux/Le Pont d'Argenteuil_Monet.webp"]
    ]
  }
};

const params = new URLSearchParams(location.search);
const lang = ["en", "fr", "ar"].includes(params.get("lang")) ? params.get("lang") : "en";
const isCinemaOnly = document.body.dataset.experience === "cinema";
const isQuestBrowser = /OculusBrowser|Meta Quest|Quest/i.test(navigator.userAgent);
const isIOSDevice = /iP(hone|ad|od)/i.test(navigator.userAgent)
  || (/Macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
const previewRoom = params.get("room");
const artistRoomId = params.get("artist");
const artistRoom = ARTIST_ROOMS[artistRoomId] || null;
const isConnectedMuseum = Boolean(artistRoom) || !previewRoom || previewRoom === "paintings";
const ARTIST_ROOM_ORDER = ["da-vinci", "van-gogh", "vermeer", "monet"];
const connectedStartIndex = Math.max(0, ARTIST_ROOM_ORDER.indexOf(artistRoomId));
const connectedStartZ = connectedStartIndex === 0 ? -4.6 : connectedStartIndex * 16 - 5.2;
const connectedStartX = connectedStartIndex === 0 ? -3.75 : 0;
const connectedStartYaw = connectedStartIndex === 0 ? Math.PI / 2 : Math.PI;
const activeRoom = ["paintings", "models", "bedroom", "reimagined"].includes(previewRoom)
  ? previewRoom
  : "paintings";
const isModelsRoom = activeRoom === "models";
const previewPositionX = isCinemaOnly || previewRoom === "cinema" ? CINEMA_ROOM_X : 0;
const previewPositionZ = isCinemaOnly || previewRoom === "cinema"
  ? 32
  : previewRoom === "reimagined"
  ? -3
  : previewRoom === "bedroom"
    ? 17.4
    : previewRoom === "models"
      ? 14
      : 4;
const previewRotationY = isCinemaOnly || ["bedroom", "reimagined", "cinema"].includes(previewRoom) ? Math.PI : 0;
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
  },
  ar: {
    "mona-lisa": "استخدم ليوناردو طبقات رقيقة من السفوماتو لتليين الحواف ومنح الجالسة حضوراً حياً. يتغير تعبيرها والمنظر الخيالي كلما أطلنا النظر.",
    "van-gogh": "رسم فان غوخ هذا البورتريه الذاتي في باريس سنة 1887. تحول ضربات الفرشاة القصيرة والألوان المتكاملة الوجه إلى دراسة مكثفة لهوية الفنان.",
    "van-gogh-bedroom": "رسم فان غوخ غرفته في البيت الأصفر بآرل كمكان للراحة. تجعل الزوايا المائلة والخطوط القوية والألوان التعبيرية الغرفة شخصية وعاطفية.",
    "vermeer-girl-with-a-pearl-earring": "هذه اللوحة دراسة لشخصية وليست بورتريهاً رسمياً. جمع فيرمير بين الأزرق الثمين والضوء الناعم واللمعات الدقيقة ليخلق حضوراً لا يُنسى."
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
    ready: "Gallery ready. Explore on screen or enter VR with a compatible headset.",
    unsupported: "Gallery ready for touch, mouse, and keyboard navigation. This device does not offer immersive VR.",
    failed: "The gallery could not be loaded.",
    playAudio: "Play audio",
    pauseAudio: "Pause audio",
    restartAudio: "Restart",
    muteAudio: "Mute",
    unmuteAudio: "Unmute",
    loadingModels: "Loading 3D exhibits…",
    modelsReady: "The painting models and independent walk-around 3D exhibits are ready.",
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
    leonardoEnrichedStudio: "VISIT LEONARDO'S ENRICHED STUDIO",
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
    watchOnDevice: "Watch on this device",
    livingBook: "THE LIVING 3D BOOK",
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
    ready: "Galerie prête. Explorez sur écran ou entrez en VR avec un casque compatible.",
    unsupported: "Galerie prête pour la navigation tactile, à la souris et au clavier. Cet appareil ne propose pas de VR immersive.",
    failed: "La galerie n’a pas pu être chargée.",
    playAudio: "Lire l’audio",
    pauseAudio: "Pause",
    restartAudio: "Recommencer",
    muteAudio: "Couper le son",
    unmuteAudio: "Rétablir le son",
    loadingModels: "Chargement des œuvres 3D…",
    modelsReady: "Les modèles des tableaux et les œuvres 3D autonomes observables sous tous les angles sont prêts.",
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
    leonardoEnrichedStudio: "VISITER L’ATELIER ENRICHI DE LÉONARD",
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
    watchOnDevice: "Regarder sur cet appareil",
    livingBook: "LE LIVRE 3D VIVANT",
    languageSwitch: "English",
    languageSwitchLabel: "عرض النسخة الإنجليزية من المعرض",
    audioControlsLabel: "أدوات التحكم في الدليل الصوتي",
    videoControlsLabel: "أدوات التحكم في الفيديو",
    exitLinksLabel: "روابط الانتقال والخروج من المعرض",
    stageLabel: "معرض افتراضي يضم أربع روائع فنية",
    exitSign: "SORTIE DE LA GALERIE"
  },
  ar: {
    back: "العودة إلى المجموعة",
    kicker: "معرض غامر",
    title: "معرض ARTDACI",
    instructions: "استخدم الزناد أو قرص اليد للاختيار والانتقال. A/X للتشغيل والإيقاف، وB/Y لإعادة التشغيل، واضغط عصا التحكم لكتم الصوت.",
    enter: "دخول المعرض بالواقع الافتراضي",
    exit: "الخروج من الواقع الافتراضي",
    count: "أربع روائع فنية",
    loading: "جارٍ إعداد المعرض...",
    ready: "المعرض جاهز. افتح هذه الصفحة في جهاز الواقع الافتراضي ثم ادخل.",
    unsupported: "معاينة المعرض جاهزة. للتجربة الغامرة افتحها في متصفح Meta Quest أو جهاز WebXR.",
    failed: "تعذر تحميل المعرض.",
    playAudio: "تشغيل الصوت",
    pauseAudio: "إيقاف مؤقت",
    restartAudio: "إعادة التشغيل",
    muteAudio: "كتم الصوت",
    unmuteAudio: "تشغيل الصوت",
    loadingModels: "جارٍ تحميل النماذج ثلاثية الأبعاد...",
    modelsReady: "نماذج اللوحات والأعمال ثلاثية الأبعاد المستقلة جاهزة.",
    exitGallery: "الخروج إلى المجموعة",
    individualExperiences: "تجارب فردية",
    paintingsRoom: "اللوحات",
    modelsRoom: "نماذج ثلاثية الأبعاد",
    bedroomRoom: "غرفة نوم فان غوخ",
    bedroomLifeSize: "إعادة بناء بالحجم الحقيقي",
    reimaginedRoom: "روائع معاد تخيلها",
    reimaginedSubtitle: "أيقونات مألوفة، حكايات جديدة",
    fastTravel: "انتقال سريع بين القاعات",
    bedroomVrWorld: "زيارة عالم غرفة النوم",
    leonardoStudioVrWorld: "زيارة محترف ليوناردو بالواقع الافتراضي",
    leonardoEnrichedStudio: "زيارة محترف ليوناردو المطوّر",
    playVideo: "الزناد: تشغيل / إيقاف",
    videoPlay: "تشغيل الفيديو",
    videoPause: "إيقاف الفيديو مؤقتاً",
    videoRestart: "إعادة الفيديو",
    videoMute: "كتم الفيديو",
    videoUnmute: "تشغيل صوت الفيديو",
    cinema: "سينما ARTDACI",
    cinemaRoom: "قاعة السينما",
    cinemaEnter: "دخول السينما",
    cinemaReturn: "العودة إلى الأعمال المعاد تخيلها",
    cinemaLibrary: "اختر فيلماً",
    cinemaSit: "اجلس وشاهد",
    cinemaPrevious: "السابق",
    cinemaNext: "التالي",
    cinemaBack: "−10 ثوانٍ",
    cinemaForward: "+10 ثوانٍ",
    cinemaPlayPause: "تشغيل / إيقاف",
    cinemaSound: "تشغيل / كتم الصوت",
    watchOnDevice: "المشاهدة على هذا الجهاز",
    livingBook: "الكتاب الحي ثلاثي الأبعاد",
    languageSwitch: "English",
    languageSwitchLabel: "عرض النسخة الإنجليزية من المعرض",
    audioControlsLabel: "أدوات التحكم في الدليل الصوتي",
    videoControlsLabel: "أدوات التحكم في الفيديو",
    exitLinksLabel: "روابط الانتقال والخروج من المعرض",
    stageLabel: "معرض افتراضي يضم أربع روائع فنية",
    exitSign: "الخروج من المعرض"
  }
};
const text = COPY[lang];

const stage = document.getElementById("gallery-stage");
const status = document.getElementById("gallery-status");
const enterButton = document.getElementById("enter-gallery-vr");
const audioToggleButton = document.getElementById("gallery-audio-toggle");
const audioRestartButton = document.getElementById("gallery-audio-restart");
const audioMuteButton = document.getElementById("gallery-audio-mute");
const ambienceToggleButton = document.getElementById("gallery-ambience-toggle");
const ambienceStopButton = document.getElementById("gallery-ambience-stop");
const videoToggleButton = document.getElementById("gallery-video-toggle");
const videoRestartButton = document.getElementById("gallery-video-restart");
const videoMuteButton = document.getElementById("gallery-video-mute");
const videoSelect = document.getElementById("gallery-video-select");
const videoPreviousButton = document.getElementById("gallery-video-previous");
const videoNextButton = document.getElementById("gallery-video-next");
const videoBackButton = document.getElementById("gallery-video-back");
const videoForwardButton = document.getElementById("gallery-video-forward");
const uiToggleButton = document.getElementById("gallery-ui-toggle");
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

const renderer = new THREE.WebGLRenderer({
  antialias: !isQuestBrowser && !isIOSDevice,
  powerPreference: isIOSDevice ? "default" : "high-performance"
});
renderer.setPixelRatio(isQuestBrowser || isIOSDevice ? 1 : Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.enabled = !isQuestBrowser && !isIOSDevice;
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
let ambienceEnabled = true;
let ambientRoomId = null;
let ambientNodes = null;
let cinemaAudienceRoot = null;
let cinemaAudienceLoadPromise = null;
const cinemaAudienceReadyAt = performance.now() + (isQuestBrowser ? 10000 : 3500);
const controllerCommandState = new Map();
const screenMove = new Set();
const screenKeys = new Set();
let screenLookPointer = null;
let screenLookX = 0;
let screenLookY = 0;
let screenPitch = 0;
let screenLookMoved = false;
let louvreFacadeRoot = null;
let louvreFacadePromise = null;
let openBookTable = null;
let openBookFallback = null;
let openBookLoadStarted = false;

init();

async function init() {
  applyCopy();
  setupVirtualGuide();
  addControllers();
  addHands();
  bindUI();
  // Enable the headset entry control immediately. Gallery assets continue
  // loading in the background and must never block WebXR access.
  if (isQuestBrowser && navigator.xr) enterButton.disabled = false;
  void detectVR();

  if (isCinemaOnly) {
    scene.add(new THREE.HemisphereLight(0xffecd2, 0x17202a, 1.1));
    addCinemaRoomArchitecture();
    addCinemaNavigationSigns();
    buildReimaginedVideoExhibits();
    await detectVR();
    status.textContent = text.ready;
    renderer.setAnimationLoop(render);
    return;
  }

  if (isConnectedMuseum) {
    document.getElementById("gallery-title").textContent = lang === "fr" ? "L’aile des quatre maîtres" : "The Four Masters Wing";
    document.getElementById("gallery-count").textContent = lang === "fr" ? "Quatre salles · vingt-quatre œuvres" : "Four rooms · twenty-four works";
    document.getElementById("gallery-instructions").textContent = lang === "fr"
      ? "Marchez librement d’une salle à l’autre. Écran : glissez pour regarder et utilisez les flèches ou WASD. Casque : gâchette ou pincement."
      : "Walk freely from room to room. Screen: drag to look and use arrows or WASD. Headset: trigger or pinch.";
    buildConnectedMuseumArchitecture();
    renderer.setAnimationLoop(render);
    try {
      const manifestResponses = await Promise.all(PRINTED_MANIFESTS.map((url) => fetch(url)));
      if (manifestResponses.some((response) => !response.ok)) throw new Error("Printed artwork manifest unavailable");
      const printedManifests = await Promise.all(manifestResponses.map((response) => response.json()));
      await buildConnectedMuseumExhibitions(printedManifests);
      await detectVR();
      status.textContent = text.ready;
    } catch (error) {
      console.error(error);
      status.textContent = `${text.failed} ${error.message}`;
    }
    return;
  }

  buildRoom();
  renderer.setAnimationLoop(render);
  try {
    const responses = await Promise.all(MANIFESTS.map((url) => fetch(url)));
    if (responses.some((response) => !response.ok)) throw new Error("Manifest unavailable");
    const paintings = await Promise.all(responses.map((response) => response.json()));
    if (activeRoom === "paintings") await buildExhibition(paintings);
    if (activeRoom === "reimagined") await buildReimaginedExhibition();
    await detectVR();
    status.textContent = text.ready;
    if (isModelsRoom) {
      prepareStandaloneModelExhibits(paintings);
      void buildModelExhibits(paintings);
    } else if (activeRoom === "bedroom") {
      const bedroom = paintings.find((painting) => painting.slug === "van-gogh-bedroom");
      if (bedroom) {
        prepareStandaloneModelExhibits([bedroom], true);
        void buildModelExhibits([bedroom]);
      }
    }
  } catch (error) {
    console.error(error);
    status.textContent = `${text.failed} ${error.message}`;
  }

}

function setupVirtualGuide() {
  const guideCopy = {
    en: {
      title: "Ask the virtual guide",
      intro: "Choose a question or write your own. It will open in the AI assistant you select.",
      label: "Your question about the gallery",
      placeholder: "What would you like to understand?",
      note: "The assistant opens in a new tab and may require you to sign in.",
      questions: [
        "Why is the Mona Lisa's smile so difficult to read?",
        "How did Van Gogh use colour in The Bedroom?",
        "Compare Vermeer and Leonardo's use of light."
      ]
    },
    fr: {
      title: "Interroger le guide virtuel",
      intro: "Choisissez une question ou écrivez la vôtre. Elle s’ouvrira dans l’assistant IA sélectionné.",
      label: "Votre question sur la galerie",
      placeholder: "Que souhaitez-vous comprendre ?",
      note: "L’assistant s’ouvre dans un nouvel onglet et peut demander une connexion.",
      questions: [
        "Pourquoi le sourire de la Joconde est-il si difficile à interpréter ?",
        "Comment Van Gogh utilise-t-il la couleur dans La Chambre ?",
        "Compare la lumière chez Vermeer et Léonard de Vinci."
      ]
    },
    ar: {
      title: "اسأل المرشد الافتراضي",
      intro: "اختر سؤالاً أو اكتب سؤالك، ثم افتحه في مساعد الذكاء الاصطناعي الذي تفضله.",
      label: "سؤالك عن المعرض",
      placeholder: "ما الذي تريد فهمه؟",
      note: "يفتح المساعد في علامة تبويب جديدة وقد يطلب تسجيل الدخول.",
      questions: [
        "لماذا يصعب تفسير ابتسامة الموناليزا؟",
        "كيف استخدم فان غوخ اللون في غرفة النوم؟",
        "قارن بين استخدام الضوء عند فيرمير وليوناردو دافنشي."
      ]
    }
  }[lang];
  const title = document.getElementById("virtual-guide-title");
  const intro = document.getElementById("virtual-guide-intro");
  const label = document.getElementById("virtual-guide-label");
  const question = document.getElementById("virtual-guide-question");
  const suggestions = document.getElementById("virtual-guide-suggestions");
  const chatgpt = document.getElementById("virtual-guide-chatgpt");
  const gemini = document.getElementById("virtual-guide-gemini");
  const note = document.getElementById("virtual-guide-note");
  title.textContent = guideCopy.title;
  intro.textContent = guideCopy.intro;
  label.textContent = guideCopy.label;
  question.placeholder = guideCopy.placeholder;
  note.textContent = guideCopy.note;
  chatgpt.textContent = lang === "ar" ? "اسأل ChatGPT" : lang === "fr" ? "Demander à ChatGPT" : "Ask ChatGPT";
  gemini.textContent = lang === "ar" ? "اسأل Gemini" : lang === "fr" ? "Demander à Gemini" : "Ask Gemini";

  const updateLinks = () => {
    const prompt = question.value.trim() || guideCopy.questions[0];
    const contextualPrompt = `${prompt}\n\nContext: ARTDACI virtual art gallery featuring the Mona Lisa, Van Gogh Self-Portrait, The Bedroom, and Girl with a Pearl Earring. Reply in ${lang === "ar" ? "Arabic" : lang === "fr" ? "French" : "English"}.`;
    chatgpt.href = `https://chatgpt.com/?q=${encodeURIComponent(contextualPrompt)}`;
    gemini.href = `https://gemini.google.com/app?q=${encodeURIComponent(contextualPrompt)}`;
  };

  guideCopy.questions.forEach((suggestion) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = suggestion;
    button.addEventListener("click", () => {
      question.value = suggestion;
      updateLinks();
    });
    suggestions.appendChild(button);
  });
  question.addEventListener("input", updateLinks);
  updateLinks();
}

function applyCopy() {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  document.title = `DACIART — ${text.title}`;
  document.getElementById("gallery-back").textContent = isCinemaOnly ? text.cinemaReturn : text.back;
  document.getElementById("gallery-back").href = isCinemaOnly
    ? `gallery-vr.html?lang=${lang}`
    : lang === "ar" ? "index-ar.html" : lang === "fr" ? "index-fr.html" : "index.html";
  document.getElementById("gallery-kicker").textContent = isCinemaOnly ? text.cinemaRoom : text.kicker;
  document.getElementById("gallery-title").textContent = isCinemaOnly ? text.cinema : text.title;
  document.getElementById("gallery-instructions").textContent = text.instructions;
  document.getElementById("gallery-count").textContent = isCinemaOnly ? text.cinemaLibrary : text.count;
  const deviceViewerTitle = document.getElementById("cinema-device-title");
  if (deviceViewerTitle) deviceViewerTitle.textContent = text.watchOnDevice;
  enterButton.textContent = isCinemaOnly ? text.cinemaEnter : text.enter;
  audioToggleButton.textContent = text.playAudio;
  audioRestartButton.textContent = text.restartAudio;
  audioMuteButton.textContent = text.muteAudio;
  if (ambienceToggleButton) ambienceToggleButton.textContent = lang === "ar" ? "تشغيل موسيقى القاعة" : lang === "fr" ? "Jouer la musique de la salle" : "Play room music";
  if (ambienceStopButton) ambienceStopButton.textContent = lang === "ar" ? "إيقاف موسيقى القاعة" : lang === "fr" ? "Arrêter la musique de la salle" : "Stop room music";
  videoToggleButton.textContent = text.videoPlay;
  videoRestartButton.textContent = text.videoRestart;
  videoMuteButton.textContent = text.videoUnmute;
  videoPreviousButton.textContent = text.cinemaPrevious;
  videoNextButton.textContent = text.cinemaNext;
  videoBackButton.textContent = text.cinemaBack;
  videoForwardButton.textContent = text.cinemaForward;
  videoSelect.setAttribute("aria-label", text.cinemaLibrary);
  if (lang === "ar") {
    document.querySelector(".gallery-audio-controls")?.setAttribute("aria-label", text.audioControlsLabel);
    document.querySelector(".gallery-video-controls")?.setAttribute("aria-label", text.videoControlsLabel);
    document.querySelector(".gallery-exit-links")?.setAttribute("aria-label", text.exitLinksLabel);
    stage.setAttribute("aria-label", text.stageLabel);
  }
  document.getElementById("gallery-exit-link").textContent = text.exitGallery;
  document.getElementById("gallery-exit-link").href = lang === "ar" ? "index-ar.html" : lang === "fr" ? "index-fr.html" : "index.html";
  document.getElementById("gallery-bedroom-world-link").textContent = text.bedroomVrWorld;
  document.getElementById("gallery-bedroom-world-link").href = BEDROOM_VR_WORLD_URL;
  document.getElementById("gallery-leonardo-world-link").textContent = text.leonardoStudioVrWorld;
  document.getElementById("gallery-leonardo-world-link").href = LEONARDO_STUDIO_VR_WORLD_URL;
  document.getElementById("gallery-leonardo-enriched-link").textContent = text.leonardoEnrichedStudio;
  document.getElementById("gallery-leonardo-enriched-link").href = LEONARDO_ENRICHED_STUDIO_URL;
  document.getElementById("gallery-cinema-link").textContent = isCinemaOnly ? text.cinemaReturn : text.cinemaEnter;
  document.getElementById("gallery-cinema-link").href = isCinemaOnly
    ? `gallery-vr.html?lang=${lang}`
    : `cinema-vr.html?lang=${lang}`;
  const cinemaDestinations = [
    ["cinema-paintings-link", text.paintingsRoom, "paintings"],
    ["cinema-models-link", text.modelsRoom, "models"],
    ["cinema-bedroom-link", text.bedroomRoom, "bedroom"],
    ["cinema-reimagined-link", text.reimaginedRoom, "reimagined"]
  ];
  cinemaDestinations.forEach(([id, label, room]) => {
    const link = document.getElementById(id);
    if (!link) return;
    link.textContent = label;
    link.href = `gallery-vr.html?lang=${lang}&room=${room}`;
  });
  const cinemaBookLink = document.getElementById("cinema-book-link");
  if (cinemaBookLink) {
    cinemaBookLink.textContent = text.livingBook;
    cinemaBookLink.href = `book-3d.html?lang=${lang}`;
  }
  document.getElementById("gallery-experiences-link").textContent = text.individualExperiences;
  document.getElementById("gallery-experiences-link").href = `space.html?painting=mona-lisa&lang=${lang}`;
  const productLinks = [
    ["gallery-models-link", text.modelsRoom, `gallery-vr.html?lang=${lang}&room=models`],
    ["gallery-paintings-link", text.paintingsRoom, `gallery-vr.html?lang=${lang}&room=paintings`],
    ["gallery-bedroom-link", text.bedroomRoom, `gallery-vr.html?lang=${lang}&room=bedroom`],
    ["gallery-reimagined-link", text.reimaginedRoom, `gallery-vr.html?lang=${lang}&room=reimagined`],
    ["gallery-book-link", text.livingBook, `book-3d.html?lang=${lang}`]
  ];
  productLinks.forEach(([id, label, href]) => {
    const link = document.getElementById(id);
    if (link) {
      link.textContent = label;
      link.href = href;
    }
  });
  document.querySelectorAll(".artist-room-link").forEach((link) => {
    const url = new URL(link.href);
    url.searchParams.set("lang", lang);
    link.href = `${url.pathname.split("/").pop()}?${url.searchParams.toString()}`;
  });
  const languageSwitch = document.getElementById("gallery-language-switch");
  const targetLang = lang === "en" ? "fr" : lang === "fr" ? "ar" : "en";
  const targetParams = new URLSearchParams(location.search);
  targetParams.set("lang", targetLang);
  languageSwitch.textContent = text.languageSwitch;
  languageSwitch.setAttribute("aria-label", text.languageSwitchLabel);
  languageSwitch.lang = targetLang;
  languageSwitch.href = `${isCinemaOnly ? "cinema-vr.html" : "gallery-vr.html"}?${targetParams.toString()}${location.hash}`;
  status.textContent = text.loading;
  updateScreenUiToggle();
}

function updateScreenUiToggle() {
  if (!uiToggleButton) return;
  const collapsed = document.body.classList.contains("screen-ui-collapsed");
  uiToggleButton.setAttribute("aria-expanded", String(!collapsed));
  uiToggleButton.textContent = collapsed
    ? (lang === "ar" ? "القائمة" : lang === "fr" ? "Menu" : "Menu")
    : (lang === "ar" ? "إخفاء القائمة" : lang === "fr" ? "Masquer le menu" : "Hide menu");
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
  (isQuestBrowser ? ceilingLights.filter((_, index) => index % 3 === 0) : ceilingLights).forEach(([x, y, z]) => {
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
  if (activeRoom === "reimagined") addReimaginedPainterRoomSigns();
  else addNavigationSigns();
  addPaintingsReimaginedPortal();
  addCinemaEntranceHotspot();
  addFastTravelStations();
}

function buildArtistRoomArchitecture(room) {
  scene.background = new THREE.Color(0x151515);
  scene.fog = new THREE.Fog(0x151515, 14, 28);
  visitor.position.set(0, 0, 5.8);
  visitor.rotation.y = 0;
  scene.add(new THREE.HemisphereLight(0xfff0d8, 0x20242a, 1.45));
  const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x4b4036, roughness: 0.92 });
  const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xe0d4c3, roughness: 0.96, side: THREE.DoubleSide });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 16), floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);
  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(14, 16), wallMaterial);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = 4.2;
  scene.add(ceiling);
  [
    [[0, 2.1, -8], [14, 4.2], 0],
    [[-7, 2.1, 0], [16, 4.2], Math.PI / 2],
    [[7, 2.1, 0], [16, 4.2], -Math.PI / 2],
    [[0, 2.1, 8], [14, 4.2], Math.PI]
  ].forEach(([position, size, rotationY]) => {
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(...size), wallMaterial);
    wall.position.set(...position);
    wall.rotation.y = rotationY;
    scene.add(wall);
  });
  createWallSign(room.name.toUpperCase(), [0, 3.55, -7.92], 0, { width: 5.5, height: 0.72 });
  const otherRooms = Object.entries(ARTIST_ROOMS).filter(([id]) => id !== artistRoomId);
  otherRooms.forEach(([id, target], index) => {
    createWallSign(target.name, [-4.5 + index * 4.5, 3.5, 7.9], Math.PI, {
      width: 3.5,
      height: 0.48,
      exitUrl: `gallery-vr.html?lang=${lang}&artist=${id}`,
      compact: true
    });
  });
  createWallSign(text.livingBook, [0, 2.85, 7.9], Math.PI, {
    width: 2.8,
    height: 0.42,
    exitUrl: `book-3d.html?lang=${lang}`,
    compact: true
  });
}

async function buildArtistExhibition(room) {
  status.textContent = lang === "fr" ? `Chargement de la salle ${room.name}…` : `Loading ${room.name} room…`;
  const placements = [
    { position: [-3.6, 2.25, -7.91], rotationY: 0, hotspot: [-3.6, -5.6], yaw: 0 },
    { position: [3.6, 2.25, -7.91], rotationY: 0, hotspot: [3.6, -5.6], yaw: 0 },
    { position: [-6.91, 2.25, -3.2], rotationY: Math.PI / 2, hotspot: [-4.6, -3.2], yaw: Math.PI / 2 },
    { position: [-6.91, 2.25, 3.2], rotationY: Math.PI / 2, hotspot: [-4.6, 3.2], yaw: Math.PI / 2 },
    { position: [6.91, 2.25, -3.2], rotationY: -Math.PI / 2, hotspot: [4.6, -3.2], yaw: -Math.PI / 2 },
    { position: [6.91, 2.25, 3.2], rotationY: -Math.PI / 2, hotspot: [4.6, 3.2], yaw: -Math.PI / 2 }
  ];
  for (let index = 0; index < room.works.length; index += 1) {
    const [title, source] = room.works[index];
    const texture = await textureLoader.loadAsync(source);
    optimizeTextureForMobile(texture);
    texture.encoding = THREE.sRGBEncoding;
    texture.minFilter = THREE.LinearFilter;
    const aspect = texture.image.width / texture.image.height;
    const height = Math.min(2.15, 3.05 / aspect);
    const width = height * aspect;
    const placement = placements[index];
    const artwork = new THREE.Group();
    artwork.position.set(...placement.position);
    artwork.rotation.y = placement.rotationY;
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(width + 0.18, height + 0.18, 0.1),
      new THREE.MeshStandardMaterial({ color: room.accent, roughness: 0.48, metalness: 0.16 })
    );
    const image = new THREE.Mesh(new THREE.PlaneGeometry(width, height), new THREE.MeshBasicMaterial({ map: texture }));
    image.position.z = 0.056;
    artwork.add(frame, image);
    const label = makeLabel(title);
    label.position.set(0, -height / 2 - 0.31, 0.07);
    label.scale.set(Math.min(2.35, width + 0.45), 0.62, 1);
    artwork.add(label);
    scene.add(artwork);
    const hotspot = createReimaginedHotspot(title, {
      hotspot: placement.hotspot,
      visitorYaw: placement.yaw
    }, artwork);
    scene.add(hotspot);
    status.textContent = `${index + 1}/6 — ${title}`;
    await new Promise((resolve) => setTimeout(resolve, isQuestBrowser ? 120 : 30));
  }
}

function buildConnectedMuseumArchitecture() {
  const roomCenters = [0, 16, 32, 48];
  const startIndex = Math.max(0, ARTIST_ROOM_ORDER.indexOf(artistRoomId));
  visitor.position.set(connectedStartX, 0, connectedStartZ);
  visitor.rotation.y = connectedStartYaw;
  scene.background = new THREE.Color(0x171717);
  scene.fog = new THREE.Fog(0x171717, 25, 76);
  scene.add(new THREE.HemisphereLight(0xfff1dc, 0x252525, isQuestBrowser ? 1.35 : 1.6));

  roomCenters.forEach((centerZ, index) => {
    const id = ARTIST_ROOM_ORDER[index];
    const room = ARTIST_ROOMS[id];
    addConnectedRoomShell(id, room, centerZ, index);
    addConnectedRoomNavigation(id, centerZ);
  });
  addConnectedMuseumPartitions();
  addLivingBookTable([0, 0, 52.1], 0);
}

function addConnectedRoomShell(id, room, centerZ, index) {
  const schemes = {
    "da-vinci": { wall: 0x101d38, floor: 0x4c392d, trim: 0xc5a15b, ceiling: 0xe9dfce },
    "van-gogh": { wall: 0x5b1938, floor: 0x38233f, trim: 0xd2aa4f, ceiling: 0xead9ad },
    vermeer: { wall: 0x173f66, floor: 0x252c3b, trim: 0xd5b45d, ceiling: 0xf1eadb },
    monet: { wall: 0x174f48, floor: 0x243f3b, trim: 0xd0b35d, ceiling: 0xe8f1e8 }
  };
  const scheme = schemes[id];
  const wallMaterial = new THREE.MeshStandardMaterial({ color: scheme.wall, roughness: 0.94, side: THREE.DoubleSide });
  const floorMaterial = new THREE.MeshStandardMaterial({ color: scheme.floor, roughness: 0.9 });
  const ceilingMaterial = new THREE.MeshStandardMaterial({ color: scheme.ceiling, roughness: 1, side: THREE.DoubleSide });
  const trimMaterial = new THREE.MeshStandardMaterial({ color: scheme.trim, roughness: 0.48, metalness: id === "da-vinci" ? 0.28 : 0.04 });

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 16), floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.z = centerZ;
  floor.receiveShadow = true;
  scene.add(floor);
  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(14, 16), ceilingMaterial);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.set(0, 4.4, centerZ);
  scene.add(ceiling);
  [-7, 7].forEach((x) => {
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(16, 4.4), wallMaterial);
    wall.position.set(x, 2.2, centerZ);
    wall.rotation.y = x < 0 ? Math.PI / 2 : -Math.PI / 2;
    scene.add(wall);
    [0.38, 3.86].forEach((y) => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.09, 15.7), trimMaterial);
      rail.position.set(x + (x < 0 ? 0.04 : -0.04), y, centerZ);
      scene.add(rail);
    });
  });

  if (id === "da-vinci") addDaVinciDecor(centerZ, trimMaterial);
  if (id === "van-gogh") addVanGoghDecor(centerZ, trimMaterial);
  if (id === "vermeer") addVermeerDecor(centerZ, trimMaterial);
  if (id === "monet") addMonetDecor(centerZ, trimMaterial);

  createWallSign(room.name.toUpperCase(), [-6.88, 3.65, centerZ], Math.PI / 2, {
    width: 4.5,
    height: 0.56,
    compact: true
  });
  const lightCount = isQuestBrowser ? 2 : 4;
  for (let lightIndex = 0; lightIndex < lightCount; lightIndex += 1) {
    const x = lightIndex % 2 ? 3.6 : -3.6;
    const z = centerZ + (lightIndex < 2 ? -3.4 : 3.4);
    const light = new THREE.PointLight(0xffe7c8, isQuestBrowser ? 0.72 : 0.92, 8.5);
    light.position.set(x, 3.8, z);
    scene.add(light);
  }
}

function addConnectedMuseumPartitions() {
  const neutral = new THREE.MeshStandardMaterial({ color: 0xd8cebf, roughness: 0.96, side: THREE.DoubleSide });
  [-8, 8, 24, 40, 56].forEach((z, index) => {
    const hasDoor = index > 0 && index < 4;
    const segments = hasDoor
      ? [[-4.5, 5], [4.5, 5]]
      : [[0, 14]];
    segments.forEach(([x, width]) => {
      const wall = new THREE.Mesh(new THREE.PlaneGeometry(width, 4.4), neutral);
      wall.position.set(x, 2.2, z);
      scene.add(wall);
    });
    if (hasDoor) {
      const lintel = new THREE.Mesh(new THREE.BoxGeometry(4, 1.05, 0.18), neutral);
      lintel.position.set(0, 3.88, z);
      scene.add(lintel);
      const glow = new THREE.Mesh(
        new THREE.BoxGeometry(3.75, 0.055, 0.16),
        new THREE.MeshBasicMaterial({ color: 0xe0b867 })
      );
      glow.position.set(0, 3.34, z - 0.03);
      scene.add(glow);

      const previousRoom = ARTIST_ROOMS[ARTIST_ROOM_ORDER[index - 1]];
      const nextRoom = ARTIST_ROOMS[ARTIST_ROOM_ORDER[index]];
      createWallSign(`↑  ${nextRoom.name}`, [0, 3.7, z - 0.11], Math.PI, {
        width: 3.4, height: 0.42, accent: true, compact: true
      });
      createWallSign(`↑  ${previousRoom.name}`, [0, 3.7, z + 0.11], 0, {
        width: 3.4, height: 0.42, accent: true, compact: true
      });
    }
  });
}

async function ensureLouvreFacade() {
  if (louvreFacadeRoot) return louvreFacadeRoot;
  if (louvreFacadePromise) return louvreFacadePromise;
  louvreFacadePromise = (async () => {
    const gltf = await modelLoader.loadAsync(LOUVRE_FACADE_MODEL);
    const facade = gltf.scene;
    facade.name = "louvre-vr-entrance";
    facade.updateMatrixWorld(true);
    let box = new THREE.Box3().setFromObject(facade);
    let size = box.getSize(new THREE.Vector3());
    if (size.z > size.x) {
      facade.rotation.y = Math.PI / 2;
      facade.updateMatrixWorld(true);
      box = new THREE.Box3().setFromObject(facade);
      size = box.getSize(new THREE.Vector3());
    }
    facade.rotation.y += Math.PI;
    facade.updateMatrixWorld(true);
    box = new THREE.Box3().setFromObject(facade);
    size = box.getSize(new THREE.Vector3());
    facade.scale.setScalar(Math.min(14 / Math.max(size.x, 0.001), 5.4 / Math.max(size.y, 0.001)));
    facade.updateMatrixWorld(true);
    box = new THREE.Box3().setFromObject(facade);
    const center = box.getCenter(new THREE.Vector3());
    facade.position.set(-center.x, -box.min.y, 55.82 - center.z);
    facade.traverse((node) => {
      if (!node.isMesh) return;
      node.castShadow = false;
      node.receiveShadow = true;
    });
    scene.add(facade);
    louvreFacadeRoot = facade;
    return facade;
  })().catch((error) => {
    louvreFacadePromise = null;
    console.warn("Louvre facade unavailable.", error);
    return null;
  });
  return louvreFacadePromise;
}

function maybeLoadLouvreFacade() {
  if (!isConnectedMuseum || louvreFacadeRoot || louvreFacadePromise) return;
  if (visitor.position.z < 42) return;
  void ensureLouvreFacade();
}

function addConnectedRoomNavigation(currentId, centerZ) {
  const others = ARTIST_ROOM_ORDER.filter((id) => id !== currentId);
  const signZ = centerZ + 7.86;
  const isMonetEnd = currentId === "monet";
  const roomAccessPosition = isMonetEnd ? [-6.88, 3.62, centerZ + 2.2] : [-4.5, 3.62, signZ];
  const productsPosition = isMonetEnd ? [6.88, 3.62, centerZ + 2.2] : [4.5, 3.62, signZ];
  const roomAccessRotation = isMonetEnd ? Math.PI / 2 : Math.PI;
  const productsRotation = isMonetEnd ? -Math.PI / 2 : Math.PI;
  createWallSign(lang === "fr" ? "ACCÈS DIRECT AUX SALLES" : "DIRECT ROOM ACCESS", roomAccessPosition, roomAccessRotation, {
    width: 3.8, height: 0.42, accent: true, compact: true
  });
  others.forEach((id, index) => {
    const destinationIndex = ARTIST_ROOM_ORDER.indexOf(id);
    createWallSign(ARTIST_ROOMS[id].name, [roomAccessPosition[0], 3.05 - index * 0.55, roomAccessPosition[2]], roomAccessRotation, {
      width: 3.2,
      height: 0.4,
      destination: [0, 0, destinationIndex * 16 - 4.5],
      visitorYaw: 0,
      compact: true
    });
  });
  createWallSign(lang === "fr" ? "EXPLORER ARTDACI" : "EXPLORE ARTDACI", productsPosition, productsRotation, {
    width: 3.4, height: 0.42, accent: true, compact: true
  });
  const usefulLinks = [
    [text.livingBook, `book-3d.html?lang=${lang}`],
    [text.cinemaEnter, `cinema-vr.html?lang=${lang}`],
    [text.modelsRoom, `gallery-vr.html?lang=${lang}&room=models`],
    [text.bedroomRoom, `gallery-vr.html?lang=${lang}&room=bedroom`],
    [text.reimaginedRoom, `gallery-vr.html?lang=${lang}&room=reimagined`],
    [text.exitGallery, lang === "ar" ? "index-ar.html" : lang === "fr" ? "index-fr.html" : "index.html"]
  ];
  usefulLinks.forEach(([label, url], index) => {
    createWallSign(label, [productsPosition[0], 3.05 - index * 0.48, productsPosition[2]], productsRotation, {
      width: 3.2,
      height: 0.35,
      exitUrl: url,
      compact: true
    });
  });
}

function addDaVinciDecor(centerZ, material) {
  [-5.8, -2.9, 0, 2.9, 5.8].forEach((x) => {
    const column = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.16, 3.65, 12), material);
    column.position.set(x, 1.83, centerZ - 7.86);
    scene.add(column);
  });
  const rug = new THREE.Mesh(new THREE.PlaneGeometry(5, 8.5), new THREE.MeshStandardMaterial({ color: 0x6e2731, roughness: 0.92 }));
  rug.rotation.x = -Math.PI / 2;
  rug.position.set(0, 0.012, centerZ);
  scene.add(rug);
}

function addVanGoghDecor(centerZ, material) {
  [-5.2, -2.6, 0, 2.6, 5.2].forEach((x) => {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.13, 15.5), material);
    beam.position.set(x, 4.26, centerZ);
    scene.add(beam);
  });
  const rug = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 7.4), new THREE.MeshStandardMaterial({ color: 0x183f73, roughness: 0.94 }));
  rug.rotation.x = -Math.PI / 2;
  rug.position.set(0, 0.012, centerZ);
  scene.add(rug);
}

function addVermeerDecor(centerZ, material) {
  for (let z = centerZ - 7.5; z <= centerZ + 7.5; z += 1.05) {
    [-6.92, 6.92].forEach((x) => {
      const tileLine = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.045, 0.92), material);
      tileLine.position.set(x, 0.75, z);
      scene.add(tileLine);
    });
  }
  const bench = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.48, 0.75), new THREE.MeshStandardMaterial({ color: 0x6c1e36, roughness: 0.8 }));
  bench.position.set(0, 0.3, centerZ);
  scene.add(bench);
}

function addMonetDecor(centerZ, material) {
  const skylight = new THREE.Mesh(
    new THREE.PlaneGeometry(9.8, 10.5),
    new THREE.MeshBasicMaterial({ color: 0xdff4f4, transparent: true, opacity: 0.88, side: THREE.DoubleSide })
  );
  skylight.rotation.x = Math.PI / 2;
  skylight.position.set(0, 4.36, centerZ);
  scene.add(skylight);
  [-4.8, 0, 4.8].forEach((x) => {
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.06, 10.4), material);
    frame.position.set(x, 4.34, centerZ);
    scene.add(frame);
  });
  const island = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.4, 0.08, 48), new THREE.MeshStandardMaterial({ color: 0x0e6a63, roughness: 0.88 }));
  island.position.set(0, 0.05, centerZ);
  scene.add(island);
}

async function buildConnectedMuseumExhibitions(printedManifests) {
  const manifestsBySlug = new Map(printedManifests.map((manifest) => [manifest.slug, manifest]));
  for (let roomIndex = 0; roomIndex < ARTIST_ROOM_ORDER.length; roomIndex += 1) {
    const id = ARTIST_ROOM_ORDER[roomIndex];
    const room = ARTIST_ROOMS[id];
    const centerZ = roomIndex * 16;
    status.textContent = lang === "fr" ? `Chargement de ${room.name}…` : `Loading ${room.name}…`;
    for (let workIndex = 0; workIndex < room.works.length; workIndex += 1) {
      const manifestSlug = CONNECTED_AUDIO_WORKS[`${id}:${workIndex}`];
      await addConnectedMuseumArtwork(room, room.works[workIndex], centerZ, workIndex, manifestsBySlug.get(manifestSlug));
      await new Promise((resolve) => setTimeout(resolve, isQuestBrowser ? 110 : 20));
    }
  }
}

async function addConnectedMuseumArtwork(room, work, centerZ, index, manifest) {
  const [title, source] = work;
  const texture = await textureLoader.loadAsync(source);
  optimizeTextureForMobile(texture);
  texture.encoding = THREE.sRGBEncoding;
  texture.minFilter = THREE.LinearFilter;
  const aspect = texture.image.width / texture.image.height;
  const height = Math.min(1.82, 2.55 / aspect);
  const width = height * aspect;
  const leftSide = index < 3;
  const x = leftSide ? -6.91 : 6.91;
  const z = centerZ + [-4.6, 0, 4.6][index % 3];
  const rotationY = leftSide ? Math.PI / 2 : -Math.PI / 2;
  const artwork = new THREE.Group();
  artwork.position.set(x, 2.25, z);
  artwork.rotation.y = rotationY;
  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(width + 0.18, height + 0.18, 0.1),
    new THREE.MeshStandardMaterial({ color: room.accent, roughness: 0.46, metalness: 0.14 })
  );
  const image = new THREE.Mesh(new THREE.PlaneGeometry(width, height), new THREE.MeshBasicMaterial({ map: texture }));
  image.position.z = 0.056;
  artwork.add(frame, image);
  const label = makeLabel(title);
  label.position.set(0, -height / 2 - 0.3, 0.07);
  label.scale.set(Math.min(2.15, width + 0.4), 0.58, 1);
  artwork.add(label);
  scene.add(artwork);
  const hotspot = createReimaginedHotspot(title, {
    hotspot: [leftSide ? -4.65 : 4.65, z],
    visitorYaw: rotationY
  }, artwork);
  scene.add(hotspot);
  if (manifest) {
    const exhibit = {
      painting: manifest,
      artwork,
      hotspot,
      audio: null,
      audioReady: false,
      started: false,
      modelDisplay: null
    };
    hotspot.userData.exhibit = exhibit;
    exhibits.push(exhibit);
    exhibitsBySlug.set(manifest.slug, exhibit);
    loadAudioGuide(exhibit).catch((error) => {
      console.warn(`Audio guide unavailable for ${manifest.slug}.`, error);
    });
  }
}

function optimizeTextureForMobile(texture) {
  if (!isIOSDevice || !texture?.image) return texture;
  const image = texture.image;
  const width = image.naturalWidth || image.videoWidth || image.width || 0;
  const height = image.naturalHeight || image.videoHeight || image.height || 0;
  const maximum = 768;
  if (width > maximum || height > maximum) {
    const scale = Math.min(maximum / width, maximum / height);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    canvas.getContext("2d", { alpha: false }).drawImage(image, 0, 0, canvas.width, canvas.height);
    texture.image = canvas;
  }
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

function addPaintingsReimaginedPortal() {
  const fromPaintings = activeRoom === "paintings";
  const fromReimagined = activeRoom === "reimagined";
  if (!fromPaintings && !fromReimagined) return;
  const z = fromPaintings ? 4.86 : -4.86;
  const rotationY = fromPaintings ? Math.PI : 0;
  const destination = fromPaintings ? "reimagined" : "paintings";
  const label = fromPaintings ? text.reimaginedRoom : text.paintingsRoom;
  const portal = new THREE.Group();
  portal.name = "paintings-reimagined-portal";
  const material = new THREE.MeshBasicMaterial({ color: 0x67d8ef });
  [[-1.35, 1.65, 0.12, 3.3, 0.12], [1.35, 1.65, 0.12, 3.3, 0.12], [0, 3.28, 2.82, 0.12, 0.12]]
    .forEach(([x, y, width, height, depth]) => {
      const beam = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
      beam.position.set(x, y, z);
      portal.add(beam);
    });
  scene.add(portal);
  createWallSign(label, [0, 2.86, z + (fromPaintings ? -0.08 : 0.08)], rotationY, {
    width: 2.35,
    height: 0.48,
    exitUrl: `gallery-vr.html?lang=${lang}&room=${destination}`,
    compact: true
  });
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

async function addPaintingsModelsGateway() {
  try {
    const gltf = await modelLoader.loadAsync(PAINTINGS_MODELS_GATEWAY);
    const gateway = gltf.scene;
    gateway.name = "paintings-models-egyptian-gateway";
    gateway.updateMatrixWorld(true);

    let box = new THREE.Box3().setFromObject(gateway);
    let size = box.getSize(new THREE.Vector3());
    if (size.z > size.x) {
      gateway.rotation.y = Math.PI / 2;
      gateway.updateMatrixWorld(true);
      box = new THREE.Box3().setFromObject(gateway);
      size = box.getSize(new THREE.Vector3());
    }

    const scale = Math.min(3.55 / Math.max(size.x, 0.001), 3.85 / Math.max(size.y, 0.001));
    gateway.scale.setScalar(scale);
    gateway.updateMatrixWorld(true);
    box = new THREE.Box3().setFromObject(gateway);
    const center = box.getCenter(new THREE.Vector3());
    gateway.position.set(-center.x, -box.min.y, 5 - center.z);
    gateway.traverse((node) => {
      if (!node.isMesh) return;
      node.castShadow = !isQuestBrowser;
      node.receiveShadow = true;
    });
    scene.add(gateway);
  } catch (error) {
    console.error("Paintings/models gateway unavailable.", error);
  }
}

function addCinemaNavigationSigns() {
  const destinations = [
    { label: text.paintingsRoom, url: `gallery-vr.html?lang=${lang}&room=paintings`, y: 3.35, z: 31.6 },
    { label: text.modelsRoom, url: `gallery-vr.html?lang=${lang}&room=models`, y: 2.78, z: 31.6 },
    { label: text.bedroomRoom, url: `gallery-vr.html?lang=${lang}&room=bedroom`, y: 2.21, z: 31.6 },
    { label: text.reimaginedRoom, url: `gallery-vr.html?lang=${lang}&room=reimagined`, y: 3.35, z: 35.1 },
    { label: text.livingBook, url: `book-3d.html?lang=${lang}`, y: 2.78, z: 35.1 },
    {
      label: text.exitGallery,
      url: lang === "ar" ? "index-ar.html" : lang === "fr" ? "index-fr.html" : "index.html",
      y: 2.21,
      z: 35.1
    }
  ];
  destinations.forEach((destination) => {
    createWallSign(destination.label, [19.88, destination.y, destination.z], -Math.PI / 2, {
      width: 2.35,
      height: 0.43,
      exitUrl: destination.url,
      compact: true
    });
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
  addLivingBookTable([0, 0, 36.2], 0);
}

function addLivingBookTable(position = [3.75, 0, 3.15], rotationY = -0.18) {
  const table = new THREE.Group();
  table.name = "living-book-table";
  table.position.set(...position);
  table.rotation.y = rotationY;

  const wood = new THREE.MeshStandardMaterial({
    color: 0x4b2818,
    roughness: 0.62,
    metalness: 0.03
  });
  const edgeWood = new THREE.MeshStandardMaterial({ color: 0x2c160f, roughness: 0.72 });
  const top = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.11, 0.92), wood);
  top.position.y = 0.84;
  top.castShadow = true;
  top.receiveShadow = true;
  table.add(top);
  [
    [-0.68, -0.32],
    [0.68, -0.32],
    [-0.68, 0.32],
    [0.68, 0.32]
  ].forEach(([x, z]) => {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.82, 0.11), edgeWood);
    leg.position.set(x, 0.41, z);
    leg.castShadow = true;
    table.add(leg);
  });

  const book = new THREE.Group();
  book.name = "living-3d-book";
  book.position.set(0, 0.94, 0);
  book.rotation.y = -0.14;
  const coverMaterial = new THREE.MeshStandardMaterial({
    color: 0x182f48,
    roughness: 0.48,
    metalness: 0.08
  });
  const pagesMaterial = new THREE.MeshStandardMaterial({ color: 0xf0dfbd, roughness: 0.9 });
  const goldMaterial = new THREE.MeshStandardMaterial({
    color: 0xc9a55c,
    roughness: 0.38,
    metalness: 0.48
  });
  const lowerCover = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.035, 0.62), coverMaterial);
  lowerCover.position.y = -0.055;
  const pages = new THREE.Mesh(new THREE.BoxGeometry(0.81, 0.09, 0.57), pagesMaterial);
  const upperCover = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.035, 0.62), coverMaterial);
  upperCover.position.y = 0.065;
  const spine = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.14, 0.62), goldMaterial);
  spine.position.x = -0.43;
  book.add(lowerCover, pages, upperCover, spine);

  const coverCanvas = document.createElement("canvas");
  coverCanvas.width = 1024;
  coverCanvas.height = 720;
  const context = coverCanvas.getContext("2d");
  context.fillStyle = "#182f48";
  context.fillRect(0, 0, coverCanvas.width, coverCanvas.height);
  context.strokeStyle = "#c9a55c";
  context.lineWidth = 28;
  context.strokeRect(34, 34, coverCanvas.width - 68, coverCanvas.height - 68);
  context.fillStyle = "#f4dfaa";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.font = lang === "ar" ? "700 66px Tahoma" : "700 61px Georgia";
  wrapCanvasText(context, text.livingBook, coverCanvas.width / 2, 310, 810, 82);
  context.font = "700 34px Georgia";
  context.fillText("ARTDACI", coverCanvas.width / 2, 575);
  const coverTexture = new THREE.CanvasTexture(coverCanvas);
  coverTexture.encoding = THREE.sRGBEncoding;
  coverTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const coverTitle = new THREE.Mesh(
    new THREE.PlaneGeometry(0.76, 0.52),
    new THREE.MeshBasicMaterial({ map: coverTexture })
  );
  coverTitle.rotation.x = -Math.PI / 2;
  coverTitle.position.y = 0.084;
  book.add(coverTitle);

  const hitTarget = new THREE.Mesh(
    new THREE.BoxGeometry(0.92, 0.2, 0.68),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
  );
  hitTarget.userData.exitUrl = `book-3d.html?lang=${lang}`;
  book.add(hitTarget);
  teleportTargets.push(hitTarget);

  [lowerCover, pages, upperCover, spine].forEach((part) => {
    part.castShadow = true;
    part.receiveShadow = true;
  });
  table.add(book);
  openBookTable = table;
  openBookFallback = book;

  const label = makeLabel(text.livingBook);
  label.position.set(0, 1.2, -0.58);
  label.scale.set(1.55, 0.38, 1);
  table.add(label);
  scene.add(table);
}

async function addOpenBookModel(table, fallbackBook) {
  try {
    const gltf = await modelLoader.loadAsync(OPEN_BOOK_MODEL);
    const model = gltf.scene;
    model.name = "living-book-open-model";
    model.updateMatrixWorld(true);
    let box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const longestSide = Math.max(size.x, size.z, 0.001);
    model.scale.setScalar(1.25 / longestSide);
    model.updateMatrixWorld(true);
    box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.set(-center.x, 0.91 - box.min.y, -center.z);
    model.rotation.y = -0.12;
    model.traverse((node) => {
      if (!node.isMesh) return;
      node.castShadow = !isIOSDevice && !isQuestBrowser;
      node.receiveShadow = true;
      node.userData.exitUrl = `book-3d.html?lang=${lang}`;
      teleportTargets.push(node);
    });
    table.add(model);
    fallbackBook.visible = false;
  } catch (error) {
    console.warn("Open Living Book model unavailable; using the lightweight fallback.", error);
  }
}

function maybeLoadOpenBookModel() {
  if (openBookLoadStarted || !openBookTable || !openBookFallback) return;
  if (isConnectedMuseum && louvreFacadePromise && !louvreFacadeRoot) return;
  const tablePosition = openBookTable.getWorldPosition(new THREE.Vector3());
  if (tablePosition.distanceTo(getListenerPosition()) > 4.5) return;
  openBookLoadStarted = true;
  void addOpenBookModel(openBookTable, openBookFallback);
}

function wrapCanvasText(context, message, x, y, maxWidth, lineHeight) {
  const words = message.split(/\s+/);
  const lines = [];
  let line = "";
  words.forEach((word) => {
    const candidate = line ? `${line} ${word}` : word;
    if (line && context.measureText(candidate).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  });
  if (line) lines.push(line);
  const firstY = y - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((item, index) => context.fillText(item, x, firstY + index * lineHeight));
}

function addNavigationSigns() {
  const collectionUrl = lang === "ar" ? "index-ar.html" : lang === "fr" ? "index-fr.html" : "index.html";
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
  createWallSign(text.cinemaEnter, [6.02, 3.55, 34], -Math.PI / 2, {
    width: 2.5,
    height: 0.44,
    exitUrl: `cinema-vr.html?lang=${lang}`,
    compact: true
  });
  createWallSign(text.leonardoStudioVrWorld, [6.02, 3.02, 34], -Math.PI / 2, {
    width: 2.55,
    height: 0.42,
    exitUrl: LEONARDO_STUDIO_VR_WORLD_URL,
    compact: true
  });
  createWallSign(text.bedroomVrWorld, [6.02, 2.5, 34], -Math.PI / 2, {
    width: 2.45,
    height: 0.42,
    exitUrl: BEDROOM_VR_WORLD_URL,
    compact: true
  });
  createWallSign(text.leonardoStudioVrWorld, [-5.85, 3.5, 37.15], Math.PI / 2, {
    width: 2,
    height: 0.36,
    exitUrl: LEONARDO_STUDIO_VR_WORLD_URL,
    compact: true
  });
  createWallSign(text.bedroomRoom, [-5.86, 3.25, 24.5], Math.PI / 2, { width: 4.1 });
  createWallSign(text.bedroomLifeSize, [-5.85, 2.58, 24.5], Math.PI / 2, {
    width: 3.55,
    height: 0.58,
    accent: true
  });
  createWallSign(text.bedroomVrWorld, [-5.85, 1.75, 24.5], Math.PI / 2, {
    width: 2.25,
    height: 0.4,
    exitUrl: BEDROOM_VR_WORLD_URL,
    compact: true
  });
  createWallSign(text.exitSign, [0, 0.5, -4.86], 0, {
    width: 1.2,
    height: 0.34,
    exitUrl: collectionUrl,
    compact: true
  });
  createWallSign(text.exitSign, [5.86, 3.48, 12.7], -Math.PI / 2, {
    width: 1.2,
    height: 0.34,
    exitUrl: collectionUrl,
    compact: true
  });
  createWallSign(text.exitSign, [-5.86, 3.12, 37.15], Math.PI / 2, {
    width: 1.2,
    height: 0.3,
    exitUrl: collectionUrl,
    compact: true
  });
}

function addReimaginedPainterRoomSigns() {
  const roomNames = [
    { id: "da-vinci", centerZ: 0, name: lang === "fr" ? "LÉONARD DE VINCI — RÉIMAGINÉ" : "LEONARDO DA VINCI — REIMAGINED" },
    { id: "van-gogh", centerZ: 10, name: lang === "fr" ? "VAN GOGH — RÉIMAGINÉ" : "VAN GOGH — REIMAGINED" },
    { id: "vermeer", centerZ: 22, name: lang === "fr" ? "VERMEER — RÉIMAGINÉ" : "VERMEER — REIMAGINED" },
    { id: "monet", centerZ: 34, name: lang === "fr" ? "MONET — RÉIMAGINÉ" : "MONET — REIMAGINED" }
  ];
  roomNames.forEach((room) => {
    createWallSign(room.name, [-5.86, 3.48, room.centerZ], Math.PI / 2, {
      width: 4.15, height: 0.5, accent: true, compact: true
    });
  });
  [
    [4.88, roomNames[1].name, Math.PI], [5.12, roomNames[0].name, 0],
    [14.88, roomNames[2].name, Math.PI], [15.12, roomNames[1].name, 0],
    [28.88, roomNames[3].name, Math.PI], [29.12, roomNames[2].name, 0]
  ].forEach(([z, label, rotationY]) => {
    createWallSign(`↑  ${label}`, [0, 3.48, z], rotationY, {
      width: 3.6, height: 0.48, accent: true, compact: true
    });
  });
}

function addCinemaEntranceHotspot() {
  const group = new THREE.Group();
  group.position.set(5.15, 0.02, 34);

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
  target.userData.exitUrl = `cinema-vr.html?lang=${lang}`;
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
  label.scale.set(1.5, 0.36, 1);
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
    { id: "paintings", label: text.paintingsRoom },
    { id: "models", label: text.modelsRoom },
    { id: "bedroom", label: text.bedroomRoom },
    { id: "reimagined", label: text.reimaginedRoom }
  ];
  // In the reimagined exhibition the side walls belong to the artworks.
  // Put navigation on the partition walls so links never cover an image.
  const stations = activeRoom === "reimagined"
    ? [
        { room: "paintings", position: [-3.55, 3.35, 4.84], rotationY: Math.PI },
        { room: "models", position: [-3.55, 3.35, 14.84], rotationY: Math.PI },
        { room: "bedroom", position: [-3.55, 3.35, 28.84], rotationY: Math.PI },
        { room: "reimagined", position: [-3.55, 3.35, 38.84], rotationY: Math.PI }
      ]
    : [
        { room: "paintings", position: [5.86, 3.35, 3.25], rotationY: -Math.PI / 2 },
        { room: "models", position: [5.86, 3.35, 7.15], rotationY: -Math.PI / 2 },
        { room: "bedroom", position: [5.86, 3.35, 17.4], rotationY: -Math.PI / 2 },
        { room: "reimagined", position: [-5.86, 3.35, 30.6], rotationY: Math.PI / 2 }
      ];

  stations.forEach((station) => {
    const [x, , z] = station.position;
    const onPartitionWall = activeRoom === "reimagined";
    const signPosition = (y, offset = 0) => onPartitionWall
      ? [x + offset, y, z]
      : [x, y, z + offset];
    const compactTop = 3.62;
    createWallSign(text.fastTravel, signPosition(compactTop), station.rotationY, {
      width: 2.7,
      height: 0.4,
      accent: true,
      compact: true
    });
    rooms.filter((room) => room.id !== station.room).forEach((room, index) => {
      const columnOffset = index % 2 === 0 ? -0.78 : 0.78;
      const rowY = 3.16 - Math.floor(index / 2) * 0.42;
      createWallSign(room.label, signPosition(rowY, columnOffset), station.rotationY, {
        width: 1.78,
        height: 0.36,
        exitUrl: `gallery-vr.html?lang=${lang}&room=${room.id}`,
        compact: true
      });
    });
    createWallSign(text.cinemaEnter, signPosition(2.28), station.rotationY, {
      width: 1.9,
      height: 0.38,
      exitUrl: `cinema-vr.html?lang=${lang}`,
      compact: true
    });
    createWallSign(text.livingBook, signPosition(1.84, -0.78), station.rotationY, {
      width: 1.78,
      height: 0.34,
      exitUrl: `book-3d.html?lang=${lang}`,
      compact: true
    });
    createWallSign(text.bedroomVrWorld, signPosition(1.84, 0.78), station.rotationY, {
      width: 1.78,
      height: 0.34,
      exitUrl: BEDROOM_VR_WORLD_URL,
      compact: true
    });
  });
}

function prepareStandaloneModelExhibits(paintings, bedroomOnly = false) {
  const positions = bedroomOnly
    ? [[0, 22]]
    : [[-3.2, 10.25], [0, 10.25], [0, 22], [3.2, 10.25]];
  paintings.forEach((painting, index) => {
    exhibitsBySlug.set(painting.slug, {
      painting,
      modelPosition: positions[index] || [0, 10.25],
      modelDisplay: null
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
  const roomCenters = { "da-vinci": 0, "van-gogh": 10, vermeer: 22, monet: 34 };
  const roomSlots = new Map();
  const placementFor = (painter) => {
    const centerZ = roomCenters[painter];
    const index = roomSlots.get(painter) || 0;
    roomSlots.set(painter, index + 1);
    const side = index % 2 === 0 ? -1 : 1;
    const row = Math.floor(index / 2);
    const z = centerZ - 2.45 + row * 2.45;
    return side < 0
      ? { position: [-5.92, 1.95, z], rotationY: Math.PI / 2, hotspot: [-3.45, z], visitorYaw: Math.PI / 2 }
      : { position: [5.92, 1.95, z], rotationY: -Math.PI / 2, hotspot: [3.45, z], visitorYaw: -Math.PI / 2 };
  };

  await Promise.all(REIMAGINED_ARTWORKS.map(async (item) => {
    const texture = await textureLoader.loadAsync(item.src);
    texture.encoding = THREE.sRGBEncoding;
    const aspect = texture.image.width / texture.image.height;
    const height = Math.min(1.2, 1.9 / aspect);
    const width = height * aspect;
    const placement = placementFor(getReimaginedPainter(item));

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

    const itemTitle = lang === "ar" ? item.titleAr || item.title : item.title;
    const title = makeLabel(itemTitle);
    title.position.set(0, -height / 2 - 0.31, 0.07);
    title.scale.set(Math.min(1.9, width + 0.42), 0.62, 1);
    artwork.add(title);
    scene.add(artwork);
    scene.add(createReimaginedHotspot(itemTitle, placement, artwork));
  }));

  if (!REIMAGINED_ARTWORKS.some((item) => getReimaginedPainter(item) === "monet")) {
    createWallSign(lang === "fr" ? "NOUVELLES ŒUVRES À VENIR" : "MORE REIMAGINED WORKS COMING SOON", [0, 2.15, 38.88], Math.PI, {
      width: 4.8, height: 0.64, accent: true, compact: true
    });
  }
}

async function addReimaginedEntranceMonaLisa() {
  const gltf = await modelLoader.loadAsync("assets/paintings/Da Vinci/mona-lisa/mona-lisa_standing_c.glb");
  const display = new THREE.Group();
  display.name = "reimagined-portal-mona-lisa";
  display.position.set(5.05, 0, 34);
  display.rotation.y = -Math.PI / 2;

  const model = gltf.scene;
  model.updateMatrixWorld(true);
  let box = new THREE.Box3().setFromObject(model);
  const sourceHeight = box.getSize(new THREE.Vector3()).y;
  model.scale.setScalar(1.72 / Math.max(sourceHeight, 0.001));
  model.updateMatrixWorld(true);
  box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  model.position.set(-center.x, -box.min.y, -center.z);
  model.traverse((node) => {
    if (!node.isMesh) return;
    node.castShadow = true;
    node.receiveShadow = true;
  });
  display.add(model);

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.56, 0.62, 0.08, 48),
    new THREE.MeshStandardMaterial({ color: 0x17191f, roughness: 0.56, metalness: 0.18 })
  );
  base.position.y = 0.04;
  base.receiveShadow = true;
  display.add(base);
  scene.add(display);

  const light = new THREE.SpotLight(0xffdfb0, 1.25, 5, Math.PI / 5, 0.54, 1.1);
  light.position.set(3.7, 3.6, 34);
  light.target = display;
  scene.add(light, light.target);
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

  const marker = makeLabel(`${lang === "ar" ? "شاهد" : lang === "fr" ? "Voir" : "View"}\n${title}`);
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
  cinemaAudienceRoot = cinema;

  const darkMaterial = new THREE.MeshStandardMaterial({ color: 0x0d1015, roughness: 0.62 });
  const blueMaterial = new THREE.MeshStandardMaterial({ color: 0x19384a, roughness: 0.72 });
  const goldMaterial = new THREE.MeshStandardMaterial({ color: 0xb9914c, roughness: 0.44, metalness: 0.28 });

  const backdrop = new THREE.Mesh(new THREE.BoxGeometry(5.55, 3.68, 0.2), darkMaterial);
  backdrop.position.set(0, 2.02, 36.55);
  cinema.add(backdrop);

  const video = document.getElementById("cinema-device-player") || document.createElement("video");
  video.crossOrigin = "anonymous";
  video.preload = "metadata";
  video.playsInline = true;
  video.loop = true;
  video.muted = true;
  if (!video.id) {
    video.style.display = "none";
    document.body.appendChild(video);
  }

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

  // Face the seating toward the screen on the opposite wall.
  sofa.rotation.y = Math.PI * 1.5;
  sofa.updateMatrixWorld(true);
  let box = new THREE.Box3().setFromObject(sofa);
  let size = box.getSize(new THREE.Vector3());
  if (size.z > size.x) {
    sofa.rotation.y += Math.PI / 2;
    sofa.updateMatrixWorld(true);
    box = new THREE.Box3().setFromObject(sofa);
    size = box.getSize(new THREE.Vector3());
  }
  const scale = 3.1 / Math.max(size.x, 0.001);
  sofa.scale.setScalar(scale);
  sofa.updateMatrixWorld(true);
  box = new THREE.Box3().setFromObject(sofa);
  const center = box.getCenter(new THREE.Vector3());
  // Keep the rear edge against the back wall while preserving usable floor space.
  sofa.position.set(-center.x, -box.min.y, 29.18 - box.min.z);
  cinema.add(sofa);

  const sofaLight = new THREE.SpotLight(0xffd2a1, 1.15, 6, Math.PI / 4, 0.58, 1.2);
  sofaLight.position.set(0, 3.5, 31.4);
  sofaLight.target = sofa;
  cinema.add(sofaLight, sofaLight.target);
}

async function addCinemaAudienceModels(cinema) {
  const audience = [
    {
      src: "assets/paintings/Da Vinci/mona-lisa/davinci-monalisa_c.glb",
      name: "cinema-sofa-left-davinci-mona-lisa",
      x: -3.15,
      y: 0,
      z: 29.75,
      height: 1.66,
      rotationY: Math.atan2(3.15, 6.55)
    },
    {
      src: "assets/paintings/vermeer_Girl-with-a-Pearl-Earring/vermeer_Girl-with-a-Pearl-Earring_sitting_c.glb",
      name: "cinema-sofa-left-vermeer",
      x: -2.05,
      y: 0,
      z: 29.75,
      height: 1.28,
      rotationY: Math.atan2(2.05, 6.55)
    },
    {
      src: "assets/paintings/van-gogh/vangogh-standing_c.glb",
      name: "cinema-sofa-right-van-gogh",
      x: 2.65,
      y: 0,
      z: 29.65,
      height: 1.7,
      rotationY: Math.atan2(-2.65, 6.65)
    }
  ];

  for (const entry of audience) {
    try {
      const gltf = await modelLoader.loadAsync(entry.src);
      const model = gltf.scene;
      model.name = entry.name;
      model.rotation.y = entry.rotationY;
      model.updateMatrixWorld(true);
      let box = new THREE.Box3().setFromObject(model);
      const sourceHeight = box.getSize(new THREE.Vector3()).y;
      model.scale.setScalar(entry.height / Math.max(sourceHeight, 0.001));
      model.updateMatrixWorld(true);
      box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      model.position.set(entry.x - center.x, entry.y - box.min.y, entry.z - center.z);
      model.traverse((node) => {
        if (!node.isMesh) return;
        node.castShadow = true;
        node.receiveShadow = true;
      });
      cinema.add(model);
      // Let the Quest browser release the parser's temporary memory before
      // beginning the next large GLB.
      await new Promise((resolve) => setTimeout(resolve, isQuestBrowser ? 900 : 180));
    } catch (error) {
      console.warn(`Cinema character could not load: ${entry.name}`, error);
    }
  }
}

function maybeLoadCinemaAudience() {
  if (isIOSDevice || isQuestBrowser) return;
  if (!cinemaAudienceRoot || cinemaAudienceLoadPromise || performance.now() < cinemaAudienceReadyAt) return;
  const dx = visitor.position.x - CINEMA_ROOM_X;
  const dz = visitor.position.z - 34;
  if (dx * dx + dz * dz > 56.25) return;
  cinemaAudienceLoadPromise = addCinemaAudienceModels(cinemaAudienceRoot);
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
  const companionAudioSrc = lang === "ar" && item.audioSrcAr
    ? item.audioSrcAr
    : lang === "fr" && item.audioSrcFr
      ? item.audioSrcFr
      : item.audioSrc;
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
  for (const painting of paintings) {
    const exhibit = exhibitsBySlug.get(painting.slug);
    const modelSrc = getDefaultModelSource(painting);
    if (!exhibit || !modelSrc) continue;
    try {
      await addGalleryModel(exhibit, modelSrc);
      loaded += 1;
      status.textContent = `${text.loadingModels} ${loaded}/${paintings.length}`;
      await new Promise((resolve) => setTimeout(resolve, isQuestBrowser ? 500 : 80));
    } catch (error) {
      console.error(`3D exhibit unavailable for ${painting.slug}.`, error);
    }
  }
  const furnitureLoaded = isModelsRoom ? await buildFurnitureModelExhibits() : 0;
  status.textContent = loaded
    ? `${text.modelsReady} ${loaded + furnitureLoaded}/${paintings.length + FURNITURE_MODEL_EXHIBITS.length}`
    : text.ready;
}

async function buildFurnitureModelExhibits() {
  let loaded = 0;
  for (const item of FURNITURE_MODEL_EXHIBITS) {
    try {
      const gltf = await modelLoader.loadAsync(item.src);
      addFurnitureGalleryModel(item, gltf.scene);
      loaded += 1;
      await new Promise((resolve) => setTimeout(resolve, isQuestBrowser ? 650 : 100));
    } catch (error) {
      console.error(`Furniture exhibit unavailable for ${item.id}.`, error);
    }
  }
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
  const label = makeLabel(`${lang === "ar" ? "نموذج ثلاثي الأبعاد" : lang === "fr" ? "Modèle 3D" : "3D model"}\n${localizedTitle}`);
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
  revealLoadedDisplay(display);
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
  const label = makeLabel(`${lang === "ar" ? "عمل ثلاثي الأبعاد" : lang === "fr" ? "Œuvre 3D" : "3D exhibit"}\n${title}`);
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
  revealLoadedDisplay(display);
}

function revealLoadedDisplay(display) {
  const materials = [];
  display.traverse((node) => {
    if (!node.isMesh) return;
    const nodeMaterials = Array.isArray(node.material) ? node.material : [node.material];
    nodeMaterials.forEach((material) => {
      if (!material || materials.includes(material)) return;
      materials.push(material);
      material.userData.galleryOpacity = material.opacity;
      material.transparent = true;
      material.opacity = 0;
    });
  });
  const startedAt = performance.now();
  const fade = (now) => {
    const progress = Math.min((now - startedAt) / 650, 1);
    materials.forEach((material) => {
      material.opacity = material.userData.galleryOpacity * progress;
      material.needsUpdate = true;
    });
    if (progress < 1) requestAnimationFrame(fade);
  };
  requestAnimationFrame(fade);
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
  if (!isQuestBrowser) {
    const standingGltf = await modelLoader.loadAsync(STANDING_VAN_GOGH_MODEL);
    addLifeSizeStandingVanGogh(display, standingGltf.scene);
  }
  scene.add(display);
  exhibit.modelDisplay = display;
  revealLoadedDisplay(display);

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

  const marker = makeLabel(`${lang === "ar" ? "ادخل" : lang === "fr" ? "Entrer dans" : "Enter"}\n${localizedTitle(exhibit.painting)}`);
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

  const marker = makeLabel(`${lang === "ar" ? "استكشف ثلاثي الأبعاد" : lang === "fr" ? "Explorer en 3D" : "Explore in 3D"}\n${title}`);
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

  const marker = makeLabel(`${lang === "ar" ? "استمع" : lang === "fr" ? "Écouter" : "Listen"}\n${title}`);
  marker.position.set(0, 0.035, 0.68);
  marker.rotation.x = -Math.PI / 2;
  marker.scale.set(1.25, 0.32, 1);
  group.add(marker);
  return group;
}

async function loadAudioGuide(exhibit) {
  const guides = exhibit.painting.media?.audioOverviews || exhibit.painting.media?.audioOverview || [];
  const list = Array.isArray(guides) ? guides : [guides];
  const mediaLang = lang;
  const guide = list.find((item) => item?.lang === mediaLang)
    || list.find((item) => item?.lang === "fr")
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
  if (lang === "ar") {
    return {
      "mona-lisa": "الموناليزا",
      "van-gogh": "بورتريه ذاتي",
      "van-gogh-bedroom": "غرفة النوم",
      "vermeer-girl-with-a-pearl-earring": "الفتاة ذات القرط اللؤلؤي"
    }[painting.slug] || painting.title || "";
  }
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
    new THREE.PlaneGeometry(1.28, 0.32),
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
  stopRoomAmbience();
  galleryVideoExhibits.forEach((exhibit) => exhibit.video.pause());
  if (currentSession) await currentSession.end();
  location.href = url;
}

function bindUI() {
  if (uiToggleButton) document.body.classList.add("screen-ui-collapsed");
  updateScreenUiToggle();
  uiToggleButton?.addEventListener("click", () => {
    document.body.classList.toggle("screen-ui-collapsed");
    updateScreenUiToggle();
  });
  enterButton.addEventListener("click", toggleVR);
  audioToggleButton.addEventListener("click", toggleAudioGuide);
  audioRestartButton.addEventListener("click", restartAudioGuide);
  audioMuteButton.addEventListener("click", toggleAudioMute);
  ambienceToggleButton?.addEventListener("click", toggleRoomAmbience);
  ambienceStopButton?.addEventListener("click", stopRoomAmbienceByVisitor);
  videoToggleButton.addEventListener("click", () => toggleGalleryVideo());
  videoRestartButton.addEventListener("click", () => restartGalleryVideo());
  videoMuteButton.addEventListener("click", () => toggleGalleryVideoMute());
  videoSelect.addEventListener("change", () => runCinemaAction({ type: "select", value: Number(videoSelect.value) }));
  videoPreviousButton.addEventListener("click", () => runCinemaAction({ type: "previous" }));
  videoNextButton.addEventListener("click", () => runCinemaAction({ type: "next" }));
  videoBackButton.addEventListener("click", () => runCinemaAction({ type: "seek", value: -10 }));
  videoForwardButton.addEventListener("click", () => runCinemaAction({ type: "seek", value: 10 }));
  renderer.domElement.addEventListener("pointerdown", toggleVideoFromPointer);
  renderer.domElement.addEventListener("pointerdown", beginScreenLook);
  renderer.domElement.addEventListener("pointermove", updateScreenLook);
  renderer.domElement.addEventListener("pointerup", endScreenLook);
  renderer.domElement.addEventListener("pointercancel", endScreenLook);
  document.querySelectorAll("[data-move]").forEach((button) => {
    const direction = button.dataset.move;
    const start = (event) => { event.preventDefault(); screenMove.add(direction); };
    const stop = () => screenMove.delete(direction);
    button.addEventListener("pointerdown", start);
    button.addEventListener("pointerup", stop);
    button.addEventListener("pointercancel", stop);
    button.addEventListener("pointerleave", stop);
  });
  document.querySelectorAll("[data-turn]").forEach((button) => {
    button.addEventListener("click", () => {
      visitor.rotation.y += button.dataset.turn === "left" ? Math.PI / 8 : -Math.PI / 8;
    });
  });
  addEventListener("keydown", (event) => screenKeys.add(event.key.toLowerCase()));
  addEventListener("keyup", (event) => screenKeys.delete(event.key.toLowerCase()));
  addEventListener("resize", resize);
}

function beginScreenLook(event) {
  if (currentSession || event.target !== renderer.domElement) return;
  audioListener.context.resume().catch(() => {});
  screenLookPointer = event.pointerId;
  screenLookX = event.clientX;
  screenLookY = event.clientY;
  screenLookMoved = false;
  renderer.domElement.setPointerCapture?.(event.pointerId);
}

function updateScreenLook(event) {
  if (currentSession || event.pointerId !== screenLookPointer) return;
  const dx = event.clientX - screenLookX;
  const dy = event.clientY - screenLookY;
  if (Math.abs(dx) + Math.abs(dy) > 2) screenLookMoved = true;
  screenLookX = event.clientX;
  screenLookY = event.clientY;
  visitor.rotation.y -= dx * 0.004;
  screenPitch = THREE.MathUtils.clamp(screenPitch - dy * 0.003, -1.05, 1.05);
  camera.rotation.x = screenPitch;
}

function endScreenLook(event) {
  if (event.pointerId !== screenLookPointer) return;
  screenLookPointer = null;
  if (!screenLookMoved) activateScreenInteraction(event);
}

function activateScreenInteraction(event) {
  const bounds = renderer.domElement.getBoundingClientRect();
  const pointer = new THREE.Vector2(
    ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
    -((event.clientY - bounds.top) / bounds.height) * 2 + 1
  );
  teleportRaycaster.setFromCamera(pointer, camera);
  activateInteractionHit(teleportRaycaster.intersectObjects(teleportTargets, false)[0]);
}

function updateScreenLocomotion(delta) {
  if (currentSession) return;
  const forwardPressed = screenMove.has("forward") || screenKeys.has("w") || screenKeys.has("arrowup");
  const backwardPressed = screenMove.has("backward") || screenKeys.has("s") || screenKeys.has("arrowdown");
  const leftPressed = screenMove.has("left") || screenKeys.has("a") || screenKeys.has("arrowleft");
  const rightPressed = screenMove.has("right") || screenKeys.has("d") || screenKeys.has("arrowright");
  const local = new THREE.Vector3(
    (rightPressed ? 1 : 0) - (leftPressed ? 1 : 0),
    0,
    (backwardPressed ? 1 : 0) - (forwardPressed ? 1 : 0)
  );
  if (!local.lengthSq()) return;
  local.normalize().applyAxisAngle(new THREE.Vector3(0, 1, 0), visitor.rotation.y);
  visitor.position.addScaledVector(local, delta * 2.45);
  const connected = isConnectedMuseum;
  visitor.position.x = THREE.MathUtils.clamp(visitor.position.x, connected ? -6.3 : -5.3, connected ? 6.3 : 19.3);
  visitor.position.z = THREE.MathUtils.clamp(visitor.position.z, connected ? -7.3 : -4.3, connected ? 55.3 : 38.3);
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
      visitor.position.set(isConnectedMuseum ? connectedStartX : previewPositionX, 0, isConnectedMuseum ? connectedStartZ : previewPositionZ);
      visitor.rotation.set(0, isConnectedMuseum ? connectedStartYaw : previewRotationY, 0);
    }, { once: true });
    await renderer.xr.setSession(currentSession);
    visitor.position.set(isConnectedMuseum ? connectedStartX : previewPositionX, 0, isConnectedMuseum ? connectedStartZ : previewPositionZ);
    visitor.rotation.set(0, isConnectedMuseum ? connectedStartYaw : previewRotationY, 0);
    await audioListener.context.resume();
    enterButton.textContent = text.exit;
  } catch (error) {
    console.error(error);
    status.textContent = `${text.failed} ${error.message}`;
  }
}

function selectNearestAudioGuide(force = false) {
  if (!exhibits.length || (!force && audioListener.context.state !== "running")) return;
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
  stopRoomAmbience();
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
  updateRoomAmbience(true);
}

async function toggleAudioGuide() {
  await audioListener.context.resume();
  if (!activeExhibit) selectNearestAudioGuide(true);
  if (!activeExhibit?.audioReady) return;

  if (activeExhibit.audio.isPlaying) {
    activeExhibit.audio.pause();
    updateRoomAmbience(true);
  } else {
    stopRoomAmbience();
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
  if (audioMuted) stopRoomAmbience();
  else updateRoomAmbience(true);
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

function roomAtVisitorPosition() {
  if (isCinemaOnly) return null;
  if (isConnectedMuseum) {
    const index = THREE.MathUtils.clamp(Math.floor((visitor.position.z + 8) / 16), 0, ARTIST_ROOM_ORDER.length - 1);
    return ARTIST_ROOM_ORDER[index];
  }
  return activeRoom;
}

function ambientFrequencies(roomId) {
  return {
    "da-vinci": [146.83, 220, 293.66],
    "van-gogh": [130.81, 196, 261.63],
    vermeer: [174.61, 261.63, 349.23],
    monet: [164.81, 246.94, 329.63],
    paintings: [146.83, 220, 293.66],
    models: [110, 164.81, 220],
    bedroom: [130.81, 196, 261.63],
    reimagined: [123.47, 185, 246.94]
  }[roomId] || [146.83, 220, 293.66];
}

function startRoomAmbience(roomId = roomAtVisitorPosition()) {
  if (!roomId || !ambienceEnabled || ambientNodes || audioMuted || audioListener.context.state !== "running") return;
  if (activeExhibit?.audio?.isPlaying) return;
  const context = audioListener.context;
  const master = context.createGain();
  master.gain.setValueAtTime(0.0001, context.currentTime);
  master.gain.exponentialRampToValueAtTime(0.026, context.currentTime + 1.8);
  master.connect(context.destination);
  const oscillators = ambientFrequencies(roomId).map((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = index === 1 ? "triangle" : "sine";
    oscillator.frequency.value = frequency / (index === 2 ? 2 : 1);
    oscillator.detune.value = (index - 1) * 3;
    gain.gain.value = index === 0 ? 0.34 : 0.2;
    oscillator.connect(gain).connect(master);
    oscillator.start();
    return oscillator;
  });
  ambientNodes = { roomId, master, oscillators };
  ambientRoomId = roomId;
  updateAmbienceButtons();
}

function stopRoomAmbience() {
  if (!ambientNodes) return;
  const { master, oscillators } = ambientNodes;
  const context = audioListener.context;
  master.gain.cancelScheduledValues(context.currentTime);
  master.gain.setTargetAtTime(0.0001, context.currentTime, 0.12);
  oscillators.forEach((oscillator) => {
    try { oscillator.stop(context.currentTime + 0.55); } catch (_) {}
  });
  ambientNodes = null;
  updateAmbienceButtons();
}

function updateRoomAmbience(force = false) {
  if (isCinemaOnly || audioListener.context.state !== "running") return;
  const nextRoom = roomAtVisitorPosition();
  if (nextRoom !== ambientRoomId) {
    stopRoomAmbience();
    ambientRoomId = nextRoom;
  }
  if ((force || !ambientNodes) && !activeExhibit?.audio?.isPlaying) startRoomAmbience(nextRoom);
}

async function toggleRoomAmbience() {
  await audioListener.context.resume();
  ambienceEnabled = true;
  const narrationWasPlaying = Boolean(activeExhibit?.audio?.isPlaying);
  if (narrationWasPlaying) stopAllAudioGuides();
  if (!narrationWasPlaying && ambientNodes) stopRoomAmbience();
  else if (!ambientNodes) startRoomAmbience();
  updateAmbienceButtons();
}

function stopRoomAmbienceByVisitor() {
  ambienceEnabled = false;
  stopRoomAmbience();
  updateAmbienceButtons();
}

function updateAmbienceButtons() {
  if (!ambienceToggleButton) return;
  const playing = Boolean(ambientNodes);
  ambienceToggleButton.classList.toggle("active", playing);
  ambienceToggleButton.textContent = playing
    ? (lang === "ar" ? "إيقاف الموسيقى مؤقتاً" : lang === "fr" ? "Mettre la musique en pause" : "Pause room music")
    : (lang === "ar" ? "تشغيل موسيقى القاعة" : lang === "fr" ? "Jouer la musique de la salle" : "Play room music");
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
      visitor.position.x = THREE.MathUtils.clamp(visitor.position.x, isConnectedMuseum ? -6.3 : -5.3, isConnectedMuseum ? 6.3 : 19.3);
      visitor.position.z = THREE.MathUtils.clamp(visitor.position.z, isConnectedMuseum ? -7.3 : -4.3, isConnectedMuseum ? 55.3 : 38.3);
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
  maybeLoadCinemaAudience();
  maybeLoadOpenBookModel();
  maybeLoadLouvreFacade();
  updateHandVisuals();
  const delta = Math.min(clock.getDelta(), 0.05);
  updateLocomotion(delta);
  updateScreenLocomotion(delta);
  selectNearestAudioGuide();
  updateAudioVolume();
  updateRoomAmbience();
  updateGalleryVideoVolume();
  updateControllerAudioCommands();
  renderer.render(scene, camera);
}
