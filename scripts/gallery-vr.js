import * as THREE from "../vendor/three.module.js";
import { GLTFLoader } from "../vendor/GLTFLoader.module.js";
import { DRACOLoader } from "../vendor/DRACOLoader.module.js";

const MANIFESTS = [
  "content/paintings/mona-lisa.json?v=4",
  "content/paintings/van-gogh.json?v=3",
  "content/paintings/vermeer-girl-with-a-pearl-earring.json?v=3",
  "content/paintings/van-gogh-bedroom.json?v=2"
];
const PRINTED_MANIFESTS = [
  "content/paintings/mona-lisa.json?v=4",
  "content/paintings/lady-with-an-ermine.json?v=1",
  "content/paintings/vermeer-girl-with-a-pearl-earring.json?v=3",
  "content/paintings/view-of-delft.json?v=1",
  "content/paintings/van-gogh.json?v=3",
  "content/paintings/van-gogh-bedroom.json?v=2",
  "content/paintings/monet-impression-sunrise.json?v=3",
  "content/paintings/pont-d-argenteuil.json?v=1"
];
const CONNECTED_AUDIO_WORKS = {
  "da-vinci:0": "mona-lisa",
  "van-gogh:2": "van-gogh",
  "van-gogh:3": "van-gogh-bedroom",
  "vermeer:0": "vermeer-girl-with-a-pearl-earring",
  "monet:0": "monet-impression-sunrise"
};
const EIGHT_MASTERPIECES_IMAGES = {
  en: "assets/environments/gallery/images/8-masterpieces/8-masterpieces_en.png",
  fr: "assets/environments/gallery/images/8-masterpieces/8-masterpieces_fr.png",
  ar: "assets/environments/gallery/images/8-masterpieces/8-masterpieces_ar.png"
};

const GALLERY_IMAGES = {
  "mona-lisa": "assets/artists/leonardo-da-vinci/artworks/mona-lisa/images/monalisa-t.png",
  "van-gogh": "assets/artists/vincent-van-gogh/artworks/self-portrait/images/van-gogh-portrait-p.png",
  "van-gogh-bedroom": "assets/artists/vincent-van-gogh/artworks/the-bedroom/images/van-gogh-bedroom-t.png",
  "vermeer-girl-with-a-pearl-earring": "assets/artists/johannes-vermeer/artworks/girl-with-a-pearl-earring/images/vermee-girl-earring-t.png"
};

const GALLERY_MODEL_OVERRIDES = {
  "van-gogh-bedroom": "assets/artists/vincent-van-gogh/artworks/the-bedroom/models/bed.glb"
};

// Optional furniture exhibits can be restored here when their GLB assets are present.
const FURNITURE_MODEL_EXHIBITS = [];
const GALLERY_FURNITURE = [
  { id: "armchair", src: "assets/environments/gallery/models/armchair-w.glb", position: [-3.7, 0, 2.6], rotationY: 0.35, maxSize: 1.55 },
  { id: "brochure-stand", src: "assets/environments/gallery/models/brochure_stand.glb", position: [4.65, 0, 3.55], rotationY: -2.4, maxSize: 1.45 },
  { id: "gallery-table", src: "assets/environments/gallery/models/table-w.glb", position: [0, 0, 2.55], rotationY: 0, maxSize: 1.9 },
  { id: "vitrine-table", src: "assets/environments/gallery/models/table-vitrine-w.glb", position: [3.45, 0, 1.25], rotationY: -0.25, maxSize: 1.8 },
  { id: "louvre-bench", src: "assets/environments/gallery/models/banc-louvre_c.glb", position: [0, 0, -0.25], rotationY: 0, maxSize: 2.65 }
];
const LOUVRE_BENCH_MODEL = "assets/environments/gallery/models/banc-louvre_c.glb";
const LIVING_BOOK_TABLE_MODEL = "assets/environments/gallery/models/table-w.glb";
const LIVING_BOOK_MODEL = "assets/environments/gallery/models/book-artdaci_en.glb";
const LIVING_BOOK_MODEL_LOW_POWER = "assets/environments/gallery/models/book-artdaci_en.glb";
const GROUP_EXHIBIT = {
  model: "assets/shared/groups/dvvm_selfy.glb",
  image: "assets/shared/groups/DVVM_Louvre.png"
};
const MODEL_ARTIST_EXHIBITS = {
  "da-vinci": [
    { title: { en: "Leonardo and Mona Lisa", fr: "Léonard et La Joconde" }, src: "assets/artists/leonardo-da-vinci/artworks/mona-lisa/models/davinci-monalisa-c.glb", rotationY: Math.PI },
    { title: { en: "Leonardo Painting Mona Lisa", fr: "Léonard peignant La Joconde" }, src: "assets/artists/leonardo-da-vinci/artworks/mona-lisa/models/davinci-painting-mona.glb", rotationY: Math.PI },
    { title: { en: "Leonardo da Vinci", fr: "Léonard de Vinci", ar: "ليوناردو دافنشي" }, src: "assets/artists/leonardo-da-vinci/reimagined/models/davinci-standing-c.glb", rotationY: Math.PI },
    { title: { en: "Leonardo and Francis I", fr: "Léonard et François Ier", ar: "ليوناردو وفرنسوا الأول" }, src: "assets/artists/leonardo-da-vinci/reimagined/models/davinci-françois1er.glb", rotationY: Math.PI }
  ],
  "van-gogh": [
    { title: { en: "Vincent van Gogh", fr: "Vincent van Gogh" }, src: "assets/artists/vincent-van-gogh/profile/models/standing.glb", rotationY: Math.PI },
    { title: { en: "Jo van Gogh-Bonger", fr: "Jo van Gogh-Bonger", ar: "جو فان غوخ-بونغر" }, src: "assets/artists/vincent-van-gogh/supporters/models/van-gogh-jo-c.glb", rotationY: Math.PI }
  ],
  vermeer: [
    { title: { en: "Girl with a Pearl Earring", fr: "La Jeune Fille à la perle" }, src: "assets/artists/johannes-vermeer/artworks/girl-with-a-pearl-earring/models/vermeer-girl-with-a-pearl-earring-sitting-c.glb", rotationY: Math.PI },
    { title: { en: "The Milkmaid", fr: "La Laitière" }, src: "assets/artists/johannes-vermeer/profile/models/milkmaid-vermeer-c100.glb", rotationY: Math.PI },
    { title: { en: "The Astronomer", fr: "L’Astronome" }, src: "assets/artists/johannes-vermeer/profile/models/the-astronomer-vermeer-c2.glb", rotationY: Math.PI },
    { title: { en: "Vermeer and His Patrons", fr: "Vermeer et ses mécènes", ar: "فيرمير ورعاته" }, src: "assets/artists/johannes-vermeer/reimagined/models/vermeer-pieter-van-ruijven-rig.glb", rotationY: Math.PI }
  ],
  monet: [
    { title: { en: "Claude Monet", fr: "Claude Monet", ar: "كلود مونيه" }, src: "assets/artists/claude-monet/reimagined/models/claude-monet-standing-c.glb", rotationY: Math.PI },
    { title: { en: "Monet and Paul Durand-Ruel", fr: "Monet et Paul Durand-Ruel", ar: "مونيه وبول دوران-رويل" }, src: "assets/artists/claude-monet/reimagined/models/claude-monet-pauld-durand-ruel-c.glb", rotationY: Math.PI }
  ]
};

const STANDING_VAN_GOGH_MODEL = "assets/artists/vincent-van-gogh/artworks/self-portrait/models/vangogh-istanding.glb";
const PAINTINGS_MODELS_GATEWAY = null;
const LOUVRE_FACADE_MODEL = "assets/environments/gallery/models/Louvre_facade_c.glb";
const CINEMA_SOFA_MODEL = "assets/environments/gallery/models/sofa_c.glb";
const ORNATE_PILL_MODEL = "assets/environments/gallery/models/Ornate_Turquoise_Pill_c.glb";
const ACCENT_SOFA_MODEL = "assets/environments/gallery/models/sofa1.glb";
const CINEMA_GATEWAY_MODEL = "assets/environments/gallery/models/Gateway_Egypt_c.glb";
const LOUVRE_SIDE_OPENING_WIDTH = 9.04;
const LOUVRE_PHOTO_EXHIBITS = [
  { src: "assets/environments/gallery/images/louvre/Louvre-gauche.png", position: [-7.16, 2.45, 0], rotationY: Math.PI / 2, maxWidth: 20, maxHeight: 4.9, portal: true },
  { src: "assets/environments/gallery/images/louvre/Louvre-droite.png", position: [7.16, 2.45, 0], rotationY: -Math.PI / 2, maxWidth: 20, maxHeight: 4.9, portal: true },
  { src: "assets/environments/gallery/images/louvre/Louvre-arrière.png", position: [0, 2.15, 9.66], rotationY: Math.PI, maxWidth: 12.6, maxHeight: 3.85 }
];
const BEDROOM_VR_WORLD_URL = "https://marble.worldlabs.ai/worldvr/48b7eb17-56e4-4873-a253-fa13ed516fae";
const LEONARDO_STUDIO_VR_WORLD_URL = "https://marble.worldlabs.ai/worldvr/862ab5f6-8608-469c-a840-8cb10f3859ae";
const LEONARDO_ENRICHED_STUDIO_URL = "https://marble.worldlabs.ai/project/c7853f32-4025-4d66-a536-54bb9db6162d";
const LOUVRE_GALLERY_VR_WORLD_URL = "https://marble.worldlabs.ai/worldvr/5327a462-1e90-479b-8cec-d2a52a33e04f";
const CINEMA_ROOM_X = 14;
const CINEMA_VIDEO_LIBRARY = [
  {
    title: { en: "The Four Painters Introduce Themselves", fr: "Les quatre peintres se présentent", ar: "الرسامون الأربعة يقدمون أنفسهم" },
    src: "assets/shared/four-painters/introduction.mp4"
  },
  {
    title: { en: "The Four Painters — New Selfie", fr: "Les quatre peintres — nouveau selfie", ar: "الرسامون الأربعة — صورة ذاتية جديدة" },
    src: "assets/shared/groups/audio-video/dvvm-n-selfy.mp4"
  },
  {
    title: { en: "The Four Painters — Selfie", fr: "Les quatre peintres — selfie", ar: "الرسامون الأربعة — صورة ذاتية" },
    src: "assets/shared/groups/audio-video/dvvm-selfy.mp4"
  },
  {
    title: { en: "Leonardo and Mona Lisa in Paris", fr: "Léonard et La Joconde à Paris", ar: "ليوناردو والموناليزا في باريس" },
    src: "assets/artists/leonardo-da-vinci/artworks/mona-lisa/media/davinci-monalisa-paris.mp4"
  },
  {
    title: { en: "Leonardo Painting the Mona Lisa", fr: "Léonard peignant La Joconde", ar: "ليوناردو يرسم الموناليزا" },
    src: "assets/artists/leonardo-da-vinci/artworks/mona-lisa/media/davinci-painting-monalisa.mp4"
  },
  {
    title: { en: "Mona Lisa Reimagined", fr: "La Joconde réimaginée", ar: "الموناليزا معاد تخيلها" },
    src: "assets/artists/leonardo-da-vinci/artworks/mona-lisa/media/mona-lisa-video.mp4",
    audioSrc: "assets/artists/leonardo-da-vinci/artworks/mona-lisa/media/centuries-behind-glass.mp3",
    audioSrcFr: "assets/artists/leonardo-da-vinci/artworks/mona-lisa/media/la-joconde-s-évade.mp3",
    audioSrcAr: "assets/artists/leonardo-da-vinci/artworks/mona-lisa/media/رقصة-خلف-الإطار.mp3"
  },
  {
    title: { en: "Leonardo’s Vision II", fr: "La vision de Léonard II", ar: "رؤية ليوناردو الثانية" },
    src: "assets/artists/leonardo-da-vinci/artworks/mona-lisa/media/dv2.mp4"
  },
  {
    title: { en: "Mona Lisa in Motion", fr: "La Joconde en mouvement", ar: "الموناليزا في حركة" },
    src: "assets/artists/leonardo-da-vinci/artworks/mona-lisa/media/m2vmg.mp4"
  }
];

const CINEMA_MUSIC_LIBRARY = [
  "Afternoon_Light_on_Linen.mp3",
  "Gentle Resonance.mp3",
  "Morning_on_the_Veranda.mp3",
  "Noble Vigil.mp3",
  "Passing Clouds.mp3",
  "Solstice_at_Noon.mp3",
  "The Painted Hall.mp3",
  "The_Marble_Gallery.mp3"
].map((filename) => ({
  title: filename.replace(/\.mp3$/i, "").replaceAll("_", " "),
  src: `assets/music/${filename}`
}));

const MUSEUM_ROOMS = [
  {
    id: "louvre",
    name: { en: "Louvre Museum", fr: "Musée du Louvre", ar: "متحف اللوفر" },
    plan: "assets/environments/gallery/images/Louvre/louvre_building_plan/louvre_building_plan_{lang}.png",
    timeline: "assets/environments/gallery/images/Louvre/louvre_timeline/louvre_timeline_{lang}.png",
    facade: "assets/environments/gallery/images/Louvre/louvre_building_plan/louvre_façade.png",
    views: {
      face: "assets/environments/gallery/images/Louvre/louvre_building/louvre_face.png",
      right: "assets/environments/gallery/images/Louvre/louvre_building/louvre_droit.png",
      left: "assets/environments/gallery/images/Louvre/louvre_building/louvre_gauche.png"
    }, model: "assets/environments/gallery/models/museums/Louvre-full-joint_c.glb",
    colors: [0x132b46, 0xc7a25b]
  },
  {
    id: "mauritshuis",
    name: { en: "Mauritshuis", fr: "Mauritshuis", ar: "متحف موريتشهاوس" },
    plan: "assets/environments/gallery/images/Mauritshuis/Mauritshuis_building_plan/Mauritshuis_building_plan_{lang}.png",
    timeline: "assets/environments/gallery/images/Mauritshuis/Mauritshuis_timeline/Mauritshuis_timeline_{lang}.png",
    facade: "assets/environments/gallery/images/Mauritshuis/Mauritshuis_building_plan/Mauritshuis_façade.png", model: "assets/environments/gallery/models/museums/Mauritshuis_museum_c3.glb",
    colors: [0x3d352b, 0xd3b471]
  },
  {
    id: "czartoryski",
    name: { en: "Czartoryski Museum", fr: "Musée Czartoryski", ar: "متحف تشارتوريسكي" },
    plan: "assets/environments/gallery/images/MNK-Czartoryski/MNK-Czartoryski_building_plan/MNK-Czartoryski_building_plan_{lang}.png",
    timeline: "assets/environments/gallery/images/MNK-Czartoryski/MNK-Czartoryski_timeline/MNK-Czartoryski_timeline_{lang}.png",
    facade: "assets/environments/gallery/images/MNK-Czartoryski/MNK-Czartoryski_building_plan/MNK-Czartoryski_façade.png", model: "assets/environments/gallery/models/museums/MNK-Czartoryski_museum_c3.glb",
    colors: [0x3a2131, 0xd0a36a]
  },
  {
    id: "orsay",
    name: { en: "Musée d’Orsay", fr: "Musée d’Orsay", ar: "متحف أورسيه" },
    plan: "assets/environments/gallery/images/Orsay/orsay_building_plan/orsay_building_plan_{lang}.png",
    timeline: "assets/environments/gallery/images/Orsay/orsay_timeline/orsay_timeline_{lang}.png",
    facade: "assets/environments/gallery/images/Orsay/orsay_building_plan/orsay_façade.png", model: "assets/environments/gallery/models/museums/Orsay_museum_c3.glb",
    colors: [0x183c40, 0xc9ad72]
  },
  {
    id: "van-gogh-museum",
    name: { en: "Van Gogh Museum", fr: "Musée Van Gogh", ar: "متحف فان غوخ" },
    plan: "assets/environments/gallery/images/Van-Gogh-s-Museum/vangogh-s-museum_building_plan/vangogh-s-museum_building_plan_{lang}.png",
    timeline: "assets/environments/gallery/images/Van-Gogh-s-Museum/vangogh-s-museum_timeline/vangogh-s-museum_timeline_{lang}.png",
    facade: "assets/environments/gallery/images/Van-Gogh-s-Museum/vangogh-s-museum_building_plan/vangogh-s-museum.png", model: "assets/environments/gallery/models/museums/Vangogh_museum_c3.glb",
    colors: [0x28415b, 0xe0b84f]
  }
];

const PAINTER_PRESENTATION_VIDEOS = [
  {
    painter: "da-vinci",
    title: { en: "Leonardo da Vinci Introduces Himself", fr: "Léonard de Vinci se présente", ar: "ليوناردو دافنشي يقدم نفسه" },
    src: "assets/artists/leonardo-da-vinci/profile/introduction.mp4"
  },
  {
    painter: "van-gogh",
    title: { en: "Vincent van Gogh Introduces Himself", fr: "Vincent van Gogh se présente", ar: "فنسنت فان غوخ يقدم نفسه" },
    src: "assets/artists/vincent-van-gogh/profile/introduction.mp4"
  },
  {
    painter: "vermeer",
    title: { en: "Johannes Vermeer Introduces Himself", fr: "Johannes Vermeer se présente", ar: "يوهانس فيرمير يقدم نفسه" },
    src: "assets/artists/johannes-vermeer/profile/introduction.mp4"
  },
  {
    painter: "monet",
    title: { en: "Claude Monet Introduces Himself", fr: "Claude Monet se présente", ar: "كلود مونيه يقدم نفسه" },
    src: "assets/artists/claude-monet/profile/introduction.mp4"
  }
];

const PEOPLE_MEDIA_LIBRARY = {
  "da-vinci": {
    videos: [{ title: { en: "Leonardo Thanks King Francis I", fr: "Léonard remercie le roi François Ier", ar: "ليوناردو يشكر الملك فرانسوا الأول" }, src: "assets/artists/leonardo-da-vinci/supporters/video/leonardo-da-vinci-thanking-king-202608151400.mp4" }],
    audio: [],
    music: [
      { lang: "ar", title: "Davinci-François — منكَ المدادُ", src: "assets/artists/leonardo-da-vinci/supporters/music/davinci-françois-منك-المداد.mp3" },
      { lang: "fr", title: "Sous le sceau royal", src: "assets/artists/leonardo-da-vinci/supporters/music/davinci-françois1-sous-le-sceau-royal.mp3" },
      { lang: "en", title: "A Study in Grace", src: "assets/artists/leonardo-da-vinci/supporters/music/davinci-study-in-grace.mp3" }
    ]
  },
  "van-gogh": {
    videos: [{ title: { en: "Vincent, Theo and Jo — Last Words", fr: "Vincent, Theo et Jo — dernières paroles", ar: "فنسنت وثيو وجو — الكلمات الأخيرة" }, src: "assets/artists/vincent-van-gogh/supporters/video/vincent-theo-jo-last-words.mp4" }],
    audio: [
      { lang: "fr", title: "La femme qui a inventé Van Gogh", src: "assets/artists/vincent-van-gogh/supporters/audio/short_audio/la-femme-qui-a-inventé-van-gogh-short.m4a" },
      { lang: "en", title: "The Woman Who Made Van Gogh Famous", src: "assets/artists/vincent-van-gogh/supporters/audio/short_audio/the-woman-who-made-van-gogh-famous-short.m4a" },
      { lang: "ar", title: "جو بونغر — المرأة التي خلدت فان غوخ", src: "assets/artists/vincent-van-gogh/supporters/audio/short_audio/جو-بونغر-المرأة-التي-خلدت-فان-غوخ-short.m4a" }
    ],
    music: [
      { lang: "fr", title: "Jo van Gogh-Bonger — Le champ de tournesols", src: "assets/artists/vincent-van-gogh/supporters/music/jo-van-gogh-bonger-theo-s-wife-le-champ-de-tournesols.mp3" },
      { lang: "en", title: "Jo van Gogh-Bonger — Letters and Lonely Reds", src: "assets/artists/vincent-van-gogh/supporters/music/jo-van-gogh-bonger-theo-s-wife-letters-and-lonely-reds.mp3" },
      { lang: "fr", title: "Vincent et Theo — Mon frère, mon ancre", src: "assets/artists/vincent-van-gogh/supporters/music/vincent-van-gogh-theo-mon-frère-mon-ancre.mp3" }
    ]
  },
  vermeer: {
    videos: [
      { title: { en: "Vermeer Thanks Pieter and Maria", fr: "Vermeer remercie Pieter et Maria", ar: "فيرمير يشكر بيتر وماريا" }, src: "assets/artists/johannes-vermeer/supporters/video/animating-vermeer-thanking-patrons-pieter-van-ruijven-maria-de-knuijt.mp4" },
      { title: { en: "Vermeer and His Patrons", fr: "Vermeer et ses mécènes", ar: "فيرمير ورعاته" }, src: "assets/artists/johannes-vermeer/supporters/video/vermeer-thanking-pieter-an-maria-for-support.mp4" }
    ],
    audio: [{ lang: "ar", title: "عشرون لوحة — Vermeer et Maria", src: "assets/artists/johannes-vermeer/supporters/audio/عشرون-لوحةvermeer-maria.mp3" }],
    music: [
      { lang: "en", title: "Gilded Delft Days", src: "assets/artists/johannes-vermeer/supporters/music/vermeer-pieter-van-ruijven-gilded-delft-days-en.mp3" },
      { lang: "fr", title: "Le silence de Delft", src: "assets/artists/johannes-vermeer/supporters/music/vermeer-pieter-van-ruijven-le-silence-de-delft-fr.mp3" },
      { lang: "ar", title: "لوحاتٌ من ذهب", src: "assets/artists/johannes-vermeer/supporters/music/vermeer-pieter-van-ruijven-لوحات-من-ذهب-ar.mp3" },
      { lang: "en", title: "Impasto Sky", src: "assets/artists/johannes-vermeer/supporters/music/vincent-van-gogh-theo-impasto-sky.mp3" }
    ]
  },
  monet: {
    videos: [],
    audio: [
      { lang: "fr", title: "Le marchand qui a sauvé l'impressionnisme", src: "assets/artists/claude-monet/supporters/audio/le-marchand-qui-a-sauvé-l-impressionnisme.mp3" },
      { lang: "en", title: "The Man Who Bankrolled Impressionism", src: "assets/artists/claude-monet/supporters/audio/the-man-who-bankrolled-impressionism.mp3" },
      { lang: "ar", title: "التاجر الذي أنقذ الانطباعية", src: "assets/artists/claude-monet/supporters/audio/التاجر-الذي-أنقذ-الانطباعية-من-الانتحار.mp3" }
    ],
    music: [
      { lang: "fr", title: "Au-delà des lourdes portes", src: "assets/artists/claude-monet/supporters/music/monet-paul-durand-ruel-au-delà-des-lourdes-portes.mp3" },
      { lang: "en", title: "Jagged Line", src: "assets/artists/claude-monet/supporters/music/monet-paul-durand-ruel-jagged-line.mp3" },
      { lang: "ar", title: "يا خير سند", src: "assets/artists/claude-monet/supporters/music/monet-paul-durand-ruel-يا-خير-سند.mp3" }
    ]
  }
};

function getCinemaVideoLibrary() {
  return [
    ...CINEMA_VIDEO_LIBRARY,
    ...Object.entries(PEOPLE_MEDIA_LIBRARY).flatMap(([painter, library]) => (library.videos || []).map((item) => {
      const painterName = PEOPLE_ROOM_CONFIG[painter]?.name || { en: painter, fr: painter, ar: painter };
      const original = typeof item.title === "string" ? { en: item.title, fr: item.title, ar: item.title } : item.title;
      return {
        ...item,
        painter,
        title: {
          en: `${painterName.en} — ${original.en || original.fr || original.ar}`,
          fr: `${painterName.fr || painterName.en} — ${original.fr || original.en || original.ar}`,
          ar: `${painterName.ar || painterName.en} — ${original.ar || original.en || original.fr}`
        }
      };
    }))
  ];
}

function getCinemaAudioLibrary() {
  return Object.values(PEOPLE_MEDIA_LIBRARY)
    .flatMap((library) => library.audio || [])
    .filter((item) => !item.lang || item.lang === lang);
}

const REIMAGINED_ARTWORKS = [
  { src: "assets/shared/reimagined-gallery/mona-lisa_out.png", title: "Mona Lisa — Beyond the frame", titleAr: "الموناليزا — خارج الإطار" },
  { src: "assets/shared/reimagined-gallery/Monalisa-Davinci.png", title: "Mona Lisa and Leonardo", titleAr: "الموناليزا وليوناردو" },
  { src: "assets/shared/reimagined-gallery/Monalisa-louvre-1.png", title: "Mona Lisa at the Louvre", titleAr: "الموناليزا في اللوفر" },
  { src: "assets/shared/reimagined-gallery/the-bedroom.avif", title: "The Bedroom — Reimagined", titleAr: "غرفة النوم — معاد تخيلها" },
  { src: "assets/shared/reimagined-gallery/van-gogh_in_bedroom-standing.png", title: "Van Gogh in The Bedroom", titleAr: "فان غوخ في غرفة النوم" },
  { src: "assets/shared/reimagined-gallery/vermeer_girl-earring-p.png", title: "Girl with a Pearl Earring — Portrait", titleAr: "الفتاة ذات القرط اللؤلؤي — بورتريه" },
  { src: "assets/shared/reimagined-gallery/vermeer_Girl-with-a-Pearl-Earring_sitting.png", title: "Girl with a Pearl Earring — Seated", titleAr: "الفتاة ذات القرط اللؤلؤي — جالسة" },
  { src: "assets/artists/leonardo-da-vinci/artworks/mona-lisa/images/mona-lisa-out-of-frame.png", title: "Mona Lisa — Out of the frame" },
  { src: "assets/artists/leonardo-da-vinci/artworks/mona-lisa/images/davinci-monalisa.png", title: "Leonardo and Mona Lisa" },
  { src: "assets/artists/vincent-van-gogh/artworks/self-portrait/images/van-gogh-out-of-frame.png", title: "Van Gogh — Out of the frame" },
  { src: "assets/artists/vincent-van-gogh/artworks/self-portrait/images/van-gogh-in-bedroom-standing.png", title: "Van Gogh in his bedroom" },
  { src: "assets/artists/vincent-van-gogh/artworks/the-bedroom/images/bed-van-gogh.jpeg", title: "The Bedroom — Spatial interpretation" },
  { src: "assets/artists/johannes-vermeer/reimagined/images/vermeer-pieter-van-ruijven-1.png", title: "Vermeer and his patrons I" },
  { src: "assets/artists/johannes-vermeer/reimagined/images/vermeer-pieter-van-ruijven-2.png", title: "Vermeer and his patrons II" },
  { src: "assets/artists/johannes-vermeer/artworks/girl-with-a-pearl-earring/images/vermeer-girl-with-a-pearl-earring-sitting.png", title: "Girl with a Pearl Earring — Reimagined" },
  { src: "assets/artists/johannes-vermeer/artworks/girl-with-a-pearl-earring/images/vermeer-girl-with-a-pearl-earring-room.png", title: "Girl with a Pearl Earring — In the room" },
  { src: "assets/artists/claude-monet/reimagined/images/monet-paul-durand-ruel.png", title: "Monet and Paul Durand-Ruel" },
  { src: "assets/artists/claude-monet/artworks/impression-sunrise/images/woman-with-a-parasol-claude-monet.png", title: "Monet — Woman with a Parasol" }
];

const PEOPLE_BEHIND_PAINTERS = [
  { painter: "da-vinci", src: "assets/artists/leonardo-da-vinci/supporters/images/davinci-françois1er-2.png", title: { en: "Leonardo and Francis I", fr: "Léonard et François Ier", ar: "ليوناردو وفرنسوا الأول" } },
  { painter: "da-vinci", src: "assets/artists/leonardo-da-vinci/supporters/images/davinci-françois1er.png", title: { en: "Francis I — Leonardo's Royal Patron", fr: "François Ier — mécène royal de Léonard", ar: "فرنسوا الأول — راعي ليوناردو الملكي" } },
  { painter: "van-gogh", src: "assets/artists/vincent-van-gogh/supporters/images/vangogh-jo-van-gogh-bonger.png", title: { en: "Jo van Gogh-Bonger", fr: "Jo van Gogh-Bonger", ar: "جو فان غوخ-بونغر" } },
  { painter: "van-gogh", src: "assets/artists/vincent-van-gogh/supporters/images/vincent-van-gogh-jo-van-gogh-bonger.png", title: { en: "Vincent and Jo — A Legacy Preserved", fr: "Vincent et Jo — un héritage préservé", ar: "فنسنت وجو — إرث محفوظ" } },
  { painter: "vermeer", src: "assets/artists/johannes-vermeer/supporters/images/vermeer-pieter-maria.png", title: { en: "Vermeer with Pieter van Ruijven and Maria de Knuijt", fr: "Vermeer avec Pieter van Ruijven et Maria de Knuijt", ar: "فيرمير مع بيتر فان راوفن وماريا دي كنويت" } },
  { painter: "vermeer", src: "assets/artists/johannes-vermeer/supporters/images/vermeer-pieter-van-ruijven-1.png", title: { en: "Pieter van Ruijven and Maria de Knuijt", fr: "Pieter van Ruijven et Maria de Knuijt", ar: "بيتر فان راوفن وماريا دي كنويت" } },
  { painter: "vermeer", src: "assets/artists/johannes-vermeer/supporters/images/vermeer-pieter-van-ruijven-2.png", title: { en: "The Patrons Behind Vermeer's Delft Legacy", fr: "Les mécènes à l’origine de l’héritage delftois de Vermeer", ar: "الرعاة وراء إرث فيرمير في دلفت" } },
  { painter: "monet", src: "assets/artists/claude-monet/supporters/images/monet-paul-durand-ruel-2.jpg", title: { en: "Monet and Paul Durand-Ruel", fr: "Monet et Paul Durand-Ruel", ar: "مونيه وبول دوران-رويل" } },
  { painter: "monet", src: "assets/artists/claude-monet/supporters/images/monet-paul-durand-ruel.png", title: { en: "Paul Durand-Ruel — Champion of Impressionism", fr: "Paul Durand-Ruel — défenseur de l'impressionnisme", ar: "بول دوران-رويل — نصير الانطباعية" } }
];

const PEOPLE_ROOM_CONFIG = {
  "da-vinci": {
    name: { en: "Leonardo da Vinci", fr: "Léonard de Vinci", ar: "ليوناردو دافنشي" },
    subtitle: { en: "Royal patronage and a Renaissance legacy", fr: "Mécénat royal et héritage de la Renaissance", ar: "الرعاية الملكية وإرث عصر النهضة" },
    wall: 0x4b2719, wood: 0x24150d, floor: 0x4a3321, light: 0xffd7a0,
    event: {
      en: "assets/artists/leonardo-da-vinci/supporters/timelines/leonardo-and-françois-i-renaissance-journey-en.png",
      fr: "assets/artists/leonardo-da-vinci/supporters/timelines/leonardo-and-françois-i-renaissance-journey-fr.png",
      ar: "assets/artists/leonardo-da-vinci/supporters/timelines/leonardo-and-françois-i-renaissance-journey-ar.png"
    }
  },
  "van-gogh": {
    name: { en: "Vincent van Gogh", fr: "Vincent van Gogh", ar: "فنسنت فان غوخ" },
    subtitle: { en: "Devotion, letters, and the making of a legacy", fr: "Dévouement, lettres et construction d'un héritage", ar: "الإخلاص والرسائل وبناء الإرث" },
    wall: 0x183b56, wood: 0x472717, floor: 0x6a4928, light: 0xffc85f,
    event: {
      en: "assets/artists/vincent-van-gogh/supporters/timelines/van-gogh-family-legacy-timeline-en.png",
      fr: "assets/artists/vincent-van-gogh/supporters/timelines/van-gogh-family-legacy-timeline-fr.png",
      ar: "assets/artists/vincent-van-gogh/supporters/timelines/van-gogh-family-legacy-timeline-ar.png"
    }
  },
  vermeer: {
    name: { en: "Johannes Vermeer", fr: "Johannes Vermeer", ar: "يوهانس فيرمير" },
    subtitle: { en: "Quiet patronage in Delft", fr: "Un mécénat discret à Delft", ar: "رعاية هادئة في دلفت" },
    wall: 0x173f42, wood: 0x291a12, floor: 0x493a2c, light: 0xffe0a8,
    event: {
      en: "assets/artists/johannes-vermeer/supporters/timelines/vermeer-s-patronage-story-timeline-en.png",
      fr: "assets/artists/johannes-vermeer/supporters/timelines/vermeer-s-patronage-story-timeline-fr.png",
      ar: "assets/artists/johannes-vermeer/supporters/timelines/vermeer-s-patronage-story-timeline-ar.png"
    }
  },
  monet: {
    name: { en: "Claude Monet", fr: "Claude Monet", ar: "كلود مونيه" },
    subtitle: { en: "A dealer's faith in Impressionism", fr: "La confiance d'un marchand dans l'impressionnisme", ar: "إيمان تاجر بالفن الانطباعي" },
    wall: 0x425a54, wood: 0x293527, floor: 0x65583e, light: 0xddebb5,
    event: {
      en: "assets/artists/claude-monet/supporters/timelines/monet-and-durand-ruel-an-impressionist-partnership-en.png",
      fr: "assets/artists/claude-monet/supporters/timelines/monet-and-durand-ruel-an-impressionist-partnership-fr.png",
      ar: "assets/artists/claude-monet/supporters/timelines/monet-and-durand-ruel-an-impressionist-partnership-ar.png"
    }
  }
};

function getReimaginedPainter(item) {
  if (/bedroom|van-gogh/i.test(item.src)) return "van-gogh";
  if (/vermeer/i.test(item.src)) return "vermeer";
  if (/monet/i.test(item.src)) return "monet";
  return "da-vinci";
}

const ARTIST_ROOMS = {
  "da-vinci": {
    name: "Leonardo da Vinci",
    portrait: "assets/artists/leonardo-da-vinci/profile/portrait.png",
    accent: 0x9d7040,
    works: [
      ["Mona Lisa", "assets/artists/leonardo-da-vinci/collection/mana-lisa-davici.webp"],
      ["The Last Supper", "assets/artists/leonardo-da-vinci/collection/the-last-supper-davinci.webp"],
      ["Lady with an Ermine", "assets/artists/leonardo-da-vinci/collection/the-lady-with-an-ermine-davinci.webp"],
      ["The Annunciation", "assets/artists/leonardo-da-vinci/collection/the-annunciation-davinci.webp"],
      ["Ginevra de' Benci", "assets/artists/leonardo-da-vinci/collection/ginevra-de-benci.webp"],
      ["La Belle Ferronnière", "assets/artists/leonardo-da-vinci/collection/la-belle-ferronnière-davinci.webp"]
    ]
  },
  "van-gogh": {
    name: "Vincent van Gogh",
    portrait: "assets/artists/vincent-van-gogh/profile/portrait.png",
    accent: 0xd2a62e,
    works: [
      ["The Starry Night", "assets/artists/vincent-van-gogh/collection/the-starry-night-vangogh.webp"],
      ["Sunflowers", "assets/artists/vincent-van-gogh/collection/tournesols-vangogh.webp"],
      ["Self-Portrait", "assets/artists/vincent-van-gogh/collection/autoportrait-vangogh.webp"],
      ["The Bedroom", "assets/artists/vincent-van-gogh/collection/the-bedroom-vangogh.webp"],
      ["Café Terrace at Night", "assets/artists/vincent-van-gogh/collection/café-terrasse-at-night-vangogh.webp"],
      ["The Night Café", "assets/artists/vincent-van-gogh/collection/the-night-café-vangogh.webp"]
    ]
  },
  vermeer: {
    name: "Johannes Vermeer",
    portrait: "assets/artists/johannes-vermeer/profile/portrait.png",
    accent: 0x315d78,
    works: [
      ["Girl with a Pearl Earring", "assets/artists/johannes-vermeer/collection/girl-with-a-pearl-earring-vermeer.webp"],
      ["The Milkmaid", "assets/artists/johannes-vermeer/collection/the-milkmaid-vermeer.webp"],
      ["View of Delft", "assets/artists/johannes-vermeer/collection/view-of-delft-vermeer.webp"],
      ["The Art of Painting", "assets/artists/johannes-vermeer/collection/the-art-of-painting-vermeer.webp"],
      ["The Astronomer", "assets/artists/johannes-vermeer/collection/the-astronomer-vermeer.webp"],
      ["Woman Holding a Balance", "assets/artists/johannes-vermeer/collection/woman-holding-a-balance-vermeer.webp"]
    ]
  },
  monet: {
    name: "Claude Monet",
    portrait: "assets/artists/claude-monet/profile/portrait.png",
    accent: 0x668d74,
    works: [
      ["Impression, Sunrise", "assets/artists/claude-monet/collection/impression-sunrise-monet.webp"],
      ["Water Lilies", "assets/artists/claude-monet/collection/water-lilies-monet.webp"],
      ["The Japanese Bridge", "assets/artists/claude-monet/collection/the-japanese-bridge-monet.webp"],
      ["Poppies", "assets/artists/claude-monet/collection/poppies-monet.webp"],
      ["Woman with a Parasol", "assets/artists/claude-monet/collection/woman-with-a-parasol-claude-monet.png"],
      ["Le Pont d'Argenteuil", "assets/artists/claude-monet/collection/le-pont-d-argenteuil-monet.webp"]
    ]
  }
};

const params = new URLSearchParams(location.search);
const lang = ["en", "fr", "ar"].includes(params.get("lang")) ? params.get("lang") : "en";
const isCinemaOnly = document.body.dataset.experience === "cinema";
const isQuestBrowser = /OculusBrowser|Meta Quest|Quest/i.test(navigator.userAgent);
const isIOSDevice = /iP(hone|ad|od)/i.test(navigator.userAgent)
  || (/Macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
const isHandheldMobile = !isQuestBrowser && (
  isIOSDevice
  || /Android|Mobile|IEMobile|Opera Mini/i.test(navigator.userAgent)
  || (matchMedia("(pointer: coarse)").matches && Math.min(screen.width, screen.height) < 900)
);
const isLowPowerDevice = isQuestBrowser || isHandheldMobile;
// Phones and tablets get the painted collection without optional GLB props.
// These models are decorative and can exhaust the browser's memory on mobile.
const allowDecorative3DModels = !isHandheldMobile;
const previewRoom = params.get("room");
const artistRoomId = params.get("artist");
const artistRoom = ARTIST_ROOMS[artistRoomId] || null;
const isModelMuseum = previewRoom === "models";
const isFiveMuseumsWing = previewRoom === "museums";
const requestedMuseumIndex = Math.max(0, MUSEUM_ROOMS.findIndex((room) => room.id === params.get("museum")));
const modelArtistId = ARTIST_ROOMS[artistRoomId] ? artistRoomId : "da-vinci";
// The standalone cinema has no `room` query parameter, but it must never be
// treated as the connected museum. Otherwise entering WebXR moves the visitor
// to the gallery entrance while the cinema remains tens of metres away.
const isConnectedMuseum = !isCinemaOnly && !isModelMuseum && !isFiveMuseumsWing && previewRoom !== "people" && (Boolean(artistRoom) || !previewRoom || previewRoom === "paintings");
const ARTIST_ROOM_ORDER = ["da-vinci", "vermeer", "van-gogh", "monet"];
const connectedStartIndex = Math.max(0, ARTIST_ROOM_ORDER.indexOf(artistRoomId));
const connectedStartZ = connectedStartIndex === 0 ? -4.6 : connectedStartIndex * 16 - 5.2;
const connectedStartX = connectedStartIndex === 0 ? -3.75 : 0;
const connectedStartYaw = connectedStartIndex === 0 ? Math.PI / 2 : Math.PI;
const activeRoom = ["paintings", "models", "bedroom", "reimagined", "groups", "louvre", "museums", "people"].includes(previewRoom)
  ? previewRoom
  : "paintings";
document.body.dataset.galleryRoom = isCinemaOnly ? "cinema" : activeRoom;
document.body.dataset.galleryArtist = isModelMuseum ? modelArtistId : artistRoomId || (activeRoom === "paintings" ? "da-vinci" : "all");
const isModelsRoom = activeRoom === "models";
const previewPositionX = isCinemaOnly || previewRoom === "cinema" ? CINEMA_ROOM_X : 0;
const previewPositionZ = isCinemaOnly || previewRoom === "cinema"
  ? 32
  : previewRoom === "reimagined"
  ? -3
  : previewRoom === "bedroom"
    ? 17.4
    : previewRoom === "models"
      ? -5.2
      : 4;
const previewRotationY = isCinemaOnly || ["models", "bedroom", "reimagined", "groups", "cinema"].includes(previewRoom) ? Math.PI : 0;
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
    instructions: "Controller: trigger. Hands: point and pinch. Without controllers: look at a target until the reticle turns green.",
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
    cinemaReturn: "RETURN TO THE VR GALLERY",
    cinemaLibrary: "CHOOSE A FILM",
    cinemaSit: "SIT & WATCH",
    cinemaPrevious: "Previous",
    cinemaNext: "Next",
    cinemaBack: "REWIND",
    cinemaForward: "FORWARD",
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
    instructions: "Manette : gâchette. Mains : pointez et pincez. Sans manette : regardez une cible jusqu’à ce que le viseur devienne vert.",
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
    cinemaReturn: "RETOUR À LA GALERIE VR",
    cinemaLibrary: "CHOISIR UN FILM",
    cinemaSit: "S’ASSEOIR ET REGARDER",
    cinemaPrevious: "Précédent",
    cinemaNext: "Suivant",
    cinemaBack: "RECULER",
    cinemaForward: "AVANCER",
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
    instructions: "باليد: أشِر ثم اقرص. بدون وحدات تحكم: انظر إلى الهدف حتى يتحول المؤشر إلى اللون الأخضر.",
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
    cinemaReturn: "العودة إلى معرض الواقع الافتراضي",
    cinemaLibrary: "اختر فيلماً",
    cinemaSit: "اجلس وشاهد",
    cinemaPrevious: "السابق",
    cinemaNext: "التالي",
    cinemaBack: "رجوع",
    cinemaForward: "تقديم",
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
const narrationSelect = document.getElementById("gallery-narration-select");
const narrationToggleButton = document.getElementById("gallery-narration-toggle");
const narrationStopButton = document.getElementById("gallery-narration-stop");
const musicSelect = document.getElementById("gallery-music-select");
const musicToggleButton = document.getElementById("gallery-music-toggle");
const musicStopButton = document.getElementById("gallery-music-stop");
const narrationPreviousButton = document.getElementById("gallery-narration-previous");
const narrationNextButton = document.getElementById("gallery-narration-next");
const narrationBackButton = document.getElementById("gallery-narration-back");
const narrationForwardButton = document.getElementById("gallery-narration-forward");
const musicPreviousButton = document.getElementById("gallery-music-previous");
const musicNextButton = document.getElementById("gallery-music-next");
const musicBackButton = document.getElementById("gallery-music-back");
const musicForwardButton = document.getElementById("gallery-music-forward");
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
  antialias: !isLowPowerDevice && !isIOSDevice,
  powerPreference: isIOSDevice ? "default" : "high-performance"
});
renderer.setPixelRatio(isLowPowerDevice || isIOSDevice ? 1 : Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.enabled = !isLowPowerDevice && !isIOSDevice;
renderer.xr.enabled = true;
renderer.xr.setReferenceSpaceType("local-floor");
if (isQuestBrowser) renderer.xr.setFramebufferScaleFactor?.(0.82);
stage.appendChild(renderer.domElement);

const textureLoader = new THREE.TextureLoader();
const audioLoader = new THREE.AudioLoader();
const modelLoadingManager = new THREE.LoadingManager();
const dracoLoader = new DRACOLoader(modelLoadingManager);
dracoLoader.setDecoderPath("vendor/draco/");
const modelLoader = new GLTFLoader(modelLoadingManager);
modelLoader.setDRACOLoader(dracoLoader);
const furnitureSourceCache = new Map();
const controllers = [renderer.xr.getController(0), renderer.xr.getController(1)];
const hands = [renderer.xr.getHand(0), renderer.xr.getHand(1)];
const handJointGeometry = new THREE.SphereGeometry(0.008, 12, 8);
const handJointMaterials = [
  new THREE.MeshBasicMaterial({ color: 0x8ee8ff, transparent: true, opacity: 0.82 }),
  new THREE.MeshBasicMaterial({ color: 0xffd58e, transparent: true, opacity: 0.82 })
];
const gazeReticleMaterial = new THREE.MeshBasicMaterial({
  color: 0xd4aa5c,
  transparent: true,
  opacity: 0.88,
  depthTest: false,
  depthWrite: false,
  side: THREE.DoubleSide
});
const gazeReticle = new THREE.Mesh(new THREE.RingGeometry(0.012, 0.019, 40), gazeReticleMaterial);
gazeReticle.position.set(0, 0, -1.15);
gazeReticle.renderOrder = 1000;
gazeReticle.visible = false;
camera.add(gazeReticle);
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
let cinemaSofaLoaded = false;
let cinemaMusicIndex = 0;
const narrationPlayer = new Audio();
const musicPlayer = new Audio();
const roomAmbiencePlayer = new Audio();
const ROOM_AMBIENCE_TRACKS = CINEMA_MUSIC_LIBRARY.map((item) => item.src);
const ROOM_AMBIENCE_OFFSETS = {
  "da-vinci": 0,
  "van-gogh": 1,
  vermeer: 2,
  monet: 3,
  paintings: 0,
  models: 4,
  bedroom: 1,
  reimagined: 2,
  groups: 3,
  louvre: 4,
  "museum-louvre": 0,
  "museum-mauritshuis": 1,
  "museum-czartoryski": 3,
  "museum-orsay": 5,
  "museum-van-gogh-museum": 7,
  people: 0
};
let roomAmbienceTrackIndex = 0;
let roomAmbienceSourceRoom = null;
narrationPlayer.preload = "metadata";
musicPlayer.preload = "metadata";
musicPlayer.volume = 0.82;
roomAmbiencePlayer.preload = "auto";
roomAmbiencePlayer.volume = 0.34;
roomAmbiencePlayer.addEventListener("ended", () => {
  const roomId = ambientNodes?.roomId;
  if (!roomId || !ambienceEnabled || audioMuted) return;
  selectRoomAmbience(roomId, true);
  roomAmbiencePlayer.play().catch((error) => {
    console.warn("The next room music track is waiting for a visitor gesture.", error);
    ambientNodes = null;
    updateAmbienceButtons();
  });
});
const cinemaAudienceReadyAt = performance.now() + (isQuestBrowser ? 10000 : 3500);
const controllerCommandState = new Map();
const screenMove = new Set();
const screenKeys = new Set();
let screenLookPointer = null;
let screenLookX = 0;
let screenLookY = 0;
let screenPitch = 0;
let screenLookMoved = false;
let openBookTable = null;
let openBookFallback = null;
let livingBookAssetsPromise = null;
let connectedManifestMap = null;
let lastSpatialUpdateAt = 0;
let lastMobileRenderAt = 0;
let gazeTarget = null;
let gazeTargetStartedAt = 0;
let gazeBlockedTarget = null;
const GAZE_DWELL_MS = 1650;
const connectedRoomsLoaded = new Set();
const connectedPortraitsLoaded = new Set();
const connectedRoomLoads = new Map();
const modelRoomsLoaded = new Set();
const modelRoomLoads = new Map();
const museumRoomsLoaded = new Set();
const museumRoomLoads = new Map();
const museumPanelsLoaded = new Set();
const museumPanelLoads = new Map();
const museumRoomRetryAt = new Map();
let fiveMuseumsPreloadPromise = null;
const eightMasterpiecesPanelsLoaded = new Set();

init();

async function init() {
  applyCopy();
  configurePeopleMediaLibrary();
  setupVirtualGuide();
  addControllers();
  addHands();
  bindUI();
  if (isFiveMuseumsWing) {
    const unlockMuseumMusic = async () => {
      await audioListener.context.resume();
      updateRoomAmbience(true);
    };
    addEventListener("pointerdown", unlockMuseumMusic, { once: true });
    addEventListener("keydown", unlockMuseumMusic, { once: true });
  }
  // Enable the headset entry control immediately. Gallery assets continue
  // loading in the background and must never block WebXR access.
  if (isQuestBrowser && navigator.xr) enterButton.disabled = false;
  void detectVR();

  if (isCinemaOnly) {
    scene.add(new THREE.HemisphereLight(0xffecd2, 0x17202a, 1.1));
    addCinemaRoomArchitecture();
    addCinemaNavigationSigns();
    addVirtualGuideStation([19.88, 1.08, 29.65], -Math.PI / 2, "the ARTDACI virtual cinema and its reimagined artist films");
    buildReimaginedVideoExhibits();
    renderer.setAnimationLoop(render);
    status.textContent = text.ready;
    return;
  }

  if (isModelMuseum) {
    buildModelMuseumArchitecture();
    renderer.setAnimationLoop(render);
    if (allowDecorative3DModels) {
      void loadModelMuseumRoom(Math.max(0, ARTIST_ROOM_ORDER.indexOf(modelArtistId)));
    }
    status.textContent = text.ready;
    return;
  }

  if (activeRoom === "groups") {
    buildGroupGalleryRoom();
    decorateGalleryRoom("groups", true);
    renderer.setAnimationLoop(render);
    try {
      await buildGroupExhibit();
      await detectVR();
      status.textContent = text.ready;
    } catch (error) {
      console.error(error);
      status.textContent = `${text.failed} ${error.message}`;
    }
    return;
  }

  if (activeRoom === "louvre") {
    buildLouvreMuseumRoom();
    decorateGalleryRoom("louvre", true);
    addLouvreGalleryFurniture();
    renderer.setAnimationLoop(render);
    try {
      await buildLouvreMuseumExhibits();
      await detectVR();
      status.textContent = text.ready;
    } catch (error) {
      console.error(error);
      status.textContent = `${text.failed} ${error.message}`;
    }
    return;
  }

  if (isFiveMuseumsWing) {
    buildFiveMuseumsWing();
    renderer.setAnimationLoop(render);
    await Promise.all([...new Set([0, requestedMuseumIndex])].map(loadFiveMuseumsRoom));
    void preloadFiveMuseumsWing();
    await detectVR();
    status.textContent = text.ready;
    return;
  }

  if (activeRoom === "people") {
    buildPeopleBehindPaintersRoom();
    renderer.setAnimationLoop(render);
    try {
      await buildPeopleBehindPaintersExhibits();
      await buildPeopleRoomVideoExhibits();
      decoratePeopleRoom();
      await detectVR();
      status.textContent = text.ready;
    } catch (error) {
      console.error(error);
      status.textContent = `${text.failed} ${error.message}`;
    }
    return;
  }

  if (isConnectedMuseum) {
    document.getElementById("gallery-title").textContent = lang === "fr" ? "L’aile des quatre maîtres" : "The Four Masters Wing";
    document.getElementById("gallery-count").textContent = lang === "fr" ? "Quatre salles · vingt-quatre œuvres" : "Four rooms · twenty-four works";
    document.getElementById("gallery-instructions").textContent = lang === "fr"
      ? "Déplacez-vous entre les salles. Avec les mains : pointez et pincez. Sans manette : fixez une cible jusqu’au changement de couleur du viseur."
      : "Move between rooms. With hands: point and pinch. Without controllers: hold your gaze on a target until the reticle changes colour.";
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

function preloadFiveMuseumsWing() {
  if (fiveMuseumsPreloadPromise) return fiveMuseumsPreloadPromise;
  fiveMuseumsPreloadPromise = (async () => {
    for (let index = 1; index < MUSEUM_ROOMS.length; index += 1) {
      let loaded = false;
      for (let attempt = 0; attempt < 3 && !loaded; attempt += 1) {
        loaded = Boolean(await loadFiveMuseumsRoom(index));
        if (!loaded) await new Promise((resolve) => setTimeout(resolve, 2800));
      }
      await new Promise((resolve) => setTimeout(resolve, isQuestBrowser ? 900 : 350));
    }
  })();
  return fiveMuseumsPreloadPromise;
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
    chatgpt.href = makeVirtualGuideUrl(getCurrentGuideContext(), prompt);
    const contextualPrompt = `${prompt}\n\nContext: ${getCurrentGuideContext()}. Reply in ${lang === "ar" ? "Arabic" : lang === "fr" ? "French" : "English"}.`;
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

function getCurrentGuideContext() {
  if (isCinemaOnly) return "ARTDACI virtual cinema and its reimagined artist films";
  if (activeRoom === "louvre") return "the ARTDACI Louvre room, its photographs, and its 3D facade";
  if (activeRoom === "groups") return "the ARTDACI reimagined painter-groups room";
  if (activeRoom === "people") return "the ARTDACI People Behind the Painters room and the patrons who sustained four artistic legacies";
  if (isModelMuseum) return `${ARTIST_ROOMS[artistRoomId]?.name || "the Four Masters"} 3D model room`;
  if (artistRoom) return `${artistRoom.name}'s painting room`;
  return `the ARTDACI ${activeRoom} room featuring Leonardo da Vinci, Vermeer, Van Gogh, and Monet`;
}

function makeVirtualGuideUrl(context, question = "Welcome me, explain what I can discover here, and ask what I would like to explore.") {
  const replyLanguage = lang === "ar" ? "Arabic" : lang === "fr" ? "French" : "English";
  const prompt = `You are the ARTDACI virtual museum guide. Help visitors understand artworks with clear, engaging, age-appropriate explanations. Distinguish established facts from interpretation, encourage close looking, and keep the first answer concise. Current location: ${context}. Visitor request: ${question} Reply in ${replyLanguage}.`;
  return `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`;
}

function addVirtualGuideStation(position, rotationY, context) {
  const label = lang === "ar" ? "اسأل دليل ChatGPT" : lang === "fr" ? "DEMANDER AU GUIDE CHATGPT" : "ASK THE CHATGPT GUIDE";
  return createWallSign(label, position, rotationY, {
    width: 2.2,
    height: 0.31,
    exitUrl: makeVirtualGuideUrl(context),
    compact: true,
    subtle: true
  });
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
  const bedroomWorldLink = document.getElementById("gallery-bedroom-world-link");
  if (bedroomWorldLink) { bedroomWorldLink.textContent = text.bedroomVrWorld; bedroomWorldLink.href = BEDROOM_VR_WORLD_URL; }
  const leonardoWorldLink = document.getElementById("gallery-leonardo-world-link");
  if (leonardoWorldLink) { leonardoWorldLink.textContent = text.leonardoStudioVrWorld; leonardoWorldLink.href = LEONARDO_STUDIO_VR_WORLD_URL; }
  const louvreWorldLink = document.getElementById("gallery-louvre-world-link");
  if (louvreWorldLink) {
    louvreWorldLink.textContent = lang === "fr"
      ? "Explorer une galerie du Louvre en VR"
      : lang === "ar" ? "استكشاف إحدى قاعات اللوفر بالواقع الافتراضي" : "Explore a Louvre Gallery in VR";
    louvreWorldLink.href = LOUVRE_GALLERY_VR_WORLD_URL;
  }
  const enrichedLink = document.getElementById("gallery-leonardo-enriched-link");
  if (enrichedLink) { enrichedLink.textContent = text.leonardoEnrichedStudio; enrichedLink.href = LEONARDO_ENRICHED_STUDIO_URL; }
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
  const experiencesLink = document.getElementById("gallery-experiences-link");
  if (experiencesLink) { experiencesLink.textContent = text.individualExperiences; experiencesLink.href = `space.html?painting=mona-lisa&lang=${lang}`; }
  const productLinks = [
    ["gallery-models-link", text.modelsRoom, `gallery-vr.html?lang=${lang}&room=models`],
    ["gallery-paintings-link", text.paintingsRoom, `gallery-vr.html?lang=${lang}&room=paintings`],
    ["gallery-bedroom-link", text.bedroomRoom, `gallery-vr.html?lang=${lang}&room=bedroom`],
    ["gallery-reimagined-link", text.reimaginedRoom, `gallery-vr.html?lang=${lang}&room=reimagined`],
    ["gallery-groups-link", lang === "fr" ? "Groupes de peintres en 3D" : lang === "ar" ? "مجموعات الرسامين ثلاثية الأبعاد" : "Painter Groups in 3D", `gallery-vr.html?lang=${lang}&room=groups`],
    ["gallery-louvre-link", lang === "fr" ? "Musée du Louvre" : lang === "ar" ? "متحف اللوفر" : "Louvre Museum", `gallery-vr.html?lang=${lang}&room=louvre`],
    ["gallery-museums-link", lang === "fr" ? "Aile des cinq musées" : lang === "ar" ? "جناح المتاحف الخمسة" : "Five Museums Wing", `gallery-vr.html?lang=${lang}&room=museums`],
    ["gallery-people-link", lang === "fr" ? "Les personnes derrière les peintres" : lang === "ar" ? "الأشخاص وراء الرسامين" : "People Behind the Painters", `gallery-vr.html?lang=${lang}&room=people&artist=da-vinci`],
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
    if (isModelMuseum) url.searchParams.set("room", "models");
    link.href = `${url.pathname.split("/").pop()}?${url.searchParams.toString()}`;
  });
  const languageSwitch = document.getElementById("gallery-language-switch");
  const targetLang = lang === "en" ? "fr" : lang === "fr" ? "ar" : "en";
  const targetParams = new URLSearchParams(location.search);
  targetParams.set("lang", targetLang);
  languageSwitch.textContent = targetLang === "ar" ? "العربية" : targetLang === "fr" ? "Français" : "English";
  languageSwitch.setAttribute("aria-label", text.languageSwitchLabel);
  languageSwitch.lang = targetLang;
  languageSwitch.href = `${isCinemaOnly ? "cinema-vr.html" : "gallery-vr.html"}?${targetParams.toString()}${location.hash}`;
  const secondarySwitch = document.getElementById("gallery-language-switch-secondary");
  if (secondarySwitch) {
    const secondaryLang = ["en", "fr", "ar"].find((code) => code !== lang && code !== targetLang);
    const secondaryParams = new URLSearchParams(location.search);
    secondaryParams.set("lang", secondaryLang);
    secondarySwitch.textContent = secondaryLang === "ar" ? "العربية" : secondaryLang === "fr" ? "FRANÇAIS" : "ENGLISH";
    secondarySwitch.lang = secondaryLang;
    secondarySwitch.href = `cinema-vr.html?${secondaryParams.toString()}${location.hash}`;
  }
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

function addMovementHotspot(position, destination, label, visitorYaw = 0, captionRotation = 0, labelOptions = {}) {
  const group = new THREE.Group();
  group.position.set(position[0], 0.018, position[1]);
  group.userData.destination = new THREE.Vector3(destination[0], 0, destination[1]);
  group.userData.visitorYaw = visitorYaw;

  const target = new THREE.Mesh(
    new THREE.CircleGeometry(0.48, 40),
    new THREE.MeshBasicMaterial({ color: 0x69c6d5, transparent: true, opacity: 0.2, side: THREE.DoubleSide })
  );
  target.rotation.x = -Math.PI / 2;
  target.userData.hotspot = group;
  group.add(target);

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.36, 0.48, 40),
    new THREE.MeshBasicMaterial({ color: 0xbcecf2, transparent: true, opacity: 0.82, side: THREE.DoubleSide })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.007;
  group.add(ring);

  const caption = makeLabel(label, labelOptions);
  caption.position.set(0, 0.018, 0.73);
  caption.rotation.x = -Math.PI / 2;
  caption.rotation.z = captionRotation;
  caption.scale.set(1.05, 0.68, 1);
  group.add(caption);
  teleportTargets.push(target);
  scene.add(group);
  return group;
}

function addMovementNetwork(roomCenters, roomLabels, x = 0) {
  roomCenters.forEach((centerZ, index) => {
    if (index > 0) {
      const previous = lang === "ar" ? `← ${roomLabels[index - 1]}` : lang === "fr" ? `← SALLE PRÉCÉDENTE` : `← PREVIOUS ROOM`;
      addMovementHotspot([x - 1.15, centerZ], [x, roomCenters[index - 1]], previous, Math.PI);
    }
    if (index < roomCenters.length - 1) {
      const next = lang === "ar" ? `${roomLabels[index + 1]} →` : lang === "fr" ? `SALLE SUIVANTE →` : `NEXT ROOM →`;
      // The visitor enters the first (Da Vinci) room facing the opposite side
      // of this floor caption, so rotate that first NEXT ROOM label 180°.
      addMovementHotspot(
        [x + 1.15, centerZ],
        [x, roomCenters[index + 1]],
        next,
        0,
        index === 0 ? Math.PI : 0
      );
    }
  });
}

function addReimaginedRoomLinks() {
  const rooms = [
    { centerZ: 0, label: lang === "ar" ? "ليوناردو دا فينشي" : "LEONARDO DA VINCI" },
    { centerZ: 10, label: lang === "ar" ? "فان غوخ" : "VAN GOGH" },
    { centerZ: 22, label: lang === "ar" ? "فيرمير" : "VERMEER" },
    { centerZ: 34, label: lang === "ar" ? "مونيه" : "MONET" }
  ];
  const linkXPositions = [-3.25, 0, 3.25];

  rooms.forEach((currentRoom) => {
    rooms
      .filter((destinationRoom) => destinationRoom.centerZ !== currentRoom.centerZ)
      .forEach((destinationRoom, index) => {
        addMovementHotspot(
          [linkXPositions[index], currentRoom.centerZ + 3.15],
          [0, destinationRoom.centerZ],
          destinationRoom.label,
          destinationRoom.centerZ < currentRoom.centerZ ? Math.PI : 0,
          Math.PI
        );
      });
  });
}

function addLocalMovementHotspots(points) {
  points.forEach(({ position, label, yaw = 0, captionRotation = 0 }) => {
    addMovementHotspot(position, position, label, yaw, captionRotation);
  });
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
  (isLowPowerDevice ? ceilingLights.filter((_, index) => index % 3 === 0) : ceilingLights).forEach(([x, y, z]) => {
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
  if (activeRoom === "reimagined") {
    addReimaginedPainterRoomDecor();
    addReimaginedPainterRoomSigns();
    addReimaginedRoomLinks();
  }
  else addNavigationSigns();
  addPaintingsReimaginedPortal();
  addCinemaEntranceHotspot();
  addMovementNetwork([0, 10, 22, 34], [text.paintingsRoom, text.modelsRoom, text.bedroomRoom, text.reimaginedRoom]);
  addFastTravelStations();
  const guideStations = {
    paintings: [[5.88, 1.25, 4.15], -Math.PI / 2, "the ARTDACI paintings gallery"],
    models: [[5.88, 1.25, 14.1], -Math.PI / 2, "the ARTDACI 3D models gallery"],
    bedroom: [[5.88, 1.25, 27.6], -Math.PI / 2, "Van Gogh's Bedroom in 3D"],
    reimagined: [[5.88, 1.25, 38.1], -Math.PI / 2, "the ARTDACI reimagined masterpieces gallery"]
  };
  addVirtualGuideStation(...guideStations[activeRoom]);
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
  if (allowDecorative3DModels) void addFurnitureModel({
    src: GALLERY_FURNITURE.find((item) => item.id === "brochure-stand").src,
    name: "da-vinci-center-brochure-stand",
    position: [0, 0, 0],
    rotationY: Math.PI,
    maxSize: 1.55
  });
  if (allowDecorative3DModels) void addFurnitureModel({
    src: GALLERY_FURNITURE.find((item) => item.id === "armchair").src,
    name: "monet-living-book-armchair",
    position: [2.55, 0, 52.1],
    rotationY: -Math.PI / 2,
    maxSize: 1.55
  });
  void addMonetFinalWallLogo();
  addMovementNetwork(roomCenters, ARTIST_ROOM_ORDER.map((id) => ARTIST_ROOMS[id].name));
}

function localizedMuseumName(room) {
  return room.name[lang] || room.name.en;
}

function museumImagePath(template) {
  return template.replace("{lang}", lang);
}

function buildFiveMuseumsWing() {
  const roomCenters = MUSEUM_ROOMS.map((_, index) => index * 16);
  visitor.position.set(0, 0, requestedMuseumIndex ? requestedMuseumIndex * 16 - 5.2 : -5.2);
  visitor.rotation.y = Math.PI;
  scene.background = new THREE.Color(0x10171b);
  scene.fog = new THREE.Fog(0x10171b, 28, 88);
  scene.add(new THREE.HemisphereLight(0xffefd6, 0x182129, isQuestBrowser ? 1.3 : 1.55));
  document.getElementById("gallery-title").textContent = lang === "fr" ? "L’aile des cinq musées" : lang === "ar" ? "جناح المتاحف الخمسة" : "The Five Museums Wing";
  document.getElementById("gallery-count").textContent = lang === "fr" ? "Cinq salles reliées · plans et chronologies" : lang === "ar" ? "خمس قاعات مترابطة · مخططات وخطوط زمنية" : "Five connected rooms · plans and timelines";
  document.getElementById("gallery-instructions").textContent = lang === "fr" ? "Traversez les cinq salles. Les panneaux de la salle suivante se chargent à votre approche." : lang === "ar" ? "تنقّل بين القاعات الخمس. تُحمّل لوحات القاعة التالية عند اقترابك منها." : "Walk through all five rooms. The next room’s panels load as you approach.";

  MUSEUM_ROOMS.forEach((room, index) => addFiveMuseumsRoomShell(room, roomCenters[index], index));
  addFiveMuseumsPartitions();
  addFiveMuseumsMovementNetwork(roomCenters, MUSEUM_ROOMS.map(localizedMuseumName));
  addLivingBookTable([1.85, 0, -6.05], Math.PI);
  if (allowDecorative3DModels) void addFurnitureModel({
    src: ACCENT_SOFA_MODEL,
    name: "five-museums-louvre-living-book-sofa",
    position: [-3.15, 0, -6.05],
    rotationY: 0,
    maxSize: 2.35
  });
}

function addFiveMuseumsMovementNetwork(roomCenters, roomLabels) {
  roomCenters.forEach((centerZ, index) => {
    if (index > 0) {
      const previous = lang === "ar" ? `← ${roomLabels[index - 1]}` : lang === "fr" ? "← SALLE PRÉCÉDENTE" : "← PREVIOUS ROOM";
      const returningThroughLouvreDoor = index === 1;
      addMovementHotspot(
        returningThroughLouvreDoor ? [4.8, 11] : [-1.15, centerZ],
        returningThroughLouvreDoor ? [4.8, 5] : [0, roomCenters[index - 1]],
        previous,
        Math.PI,
        Math.PI,
        { highDetail: true }
      );
    }
    if (index < roomCenters.length - 1) {
      const next = lang === "ar" ? `${roomLabels[index + 1]} →` : lang === "fr" ? "SALLE SUIVANTE →" : "NEXT ROOM →";
      const leavingLouvre = index === 0;
      addMovementHotspot(
        leavingLouvre ? [4.8, 5] : [1.15, centerZ],
        leavingLouvre ? [4.8, 11] : [0, roomCenters[index + 1]],
        next,
        0,
        Math.PI,
        { highDetail: true }
      );
    }
  });
}

function addFiveMuseumsRoomShell(room, centerZ, index) {
  const wall = new THREE.MeshStandardMaterial({ color: room.colors[0], roughness: 0.94, side: THREE.DoubleSide });
  const floor = new THREE.MeshStandardMaterial({ color: index % 2 ? 0x302b27 : 0x252d31, roughness: 0.9 });
  const ceiling = new THREE.MeshStandardMaterial({ color: 0xe9e1d3, roughness: 1, side: THREE.DoubleSide });
  const trim = new THREE.MeshStandardMaterial({ color: room.colors[1], roughness: 0.5, metalness: 0.12 });
  const floorMesh = new THREE.Mesh(new THREE.PlaneGeometry(14, 16), floor);
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.position.z = centerZ;
  scene.add(floorMesh);
  const ceilingMesh = new THREE.Mesh(new THREE.PlaneGeometry(14, 16), ceiling);
  ceilingMesh.rotation.x = Math.PI / 2;
  ceilingMesh.position.set(0, 4.4, centerZ);
  scene.add(ceilingMesh);
  [-7, 7].forEach((x) => {
    const side = new THREE.Mesh(new THREE.PlaneGeometry(16, 4.4), wall);
    side.position.set(x, 2.2, centerZ);
    side.rotation.y = x < 0 ? Math.PI / 2 : -Math.PI / 2;
    scene.add(side);
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.09, 15.6), trim);
    rail.position.set(x + (x < 0 ? 0.04 : -0.04), 0.42, centerZ);
    scene.add(rail);
  });
  createWallSign(localizedMuseumName(room), [0, 4.12, centerZ - 7.86], 0, { width: 4.6, height: 0.38, compact: true });
  addFiveMuseumsRoomLinks(centerZ, index);
  const light = new THREE.PointLight(0xffe7c8, isQuestBrowser ? 0.9 : 1.2, 11);
  light.position.set(0, 3.85, centerZ);
  scene.add(light);
}

function addFiveMuseumsRoomLinks(centerZ, roomIndex) {
  const collectionUrl = lang === "ar" ? "index-ar.html" : lang === "fr" ? "index-fr.html" : "index.html";
  const globalGalleryLabel = lang === "fr" ? "GALERIE VR GLOBALE" : lang === "ar" ? "معرض الواقع الافتراضي العام" : "GLOBAL VR GALLERY";
  const collectionLabel = lang === "fr" ? "COLLECTION ARTDACI" : lang === "ar" ? "مجموعة ARTDACI" : "ARTDACI COLLECTION";
  const onLouvreRearWall = roomIndex === 0;
  const linkZ = centerZ + (onLouvreRearWall ? -7.86 : 7.86);
  const linkRotation = onLouvreRearWall ? 0 : Math.PI;
  const linkY = onLouvreRearWall ? 1.05 : 2.05;
  createWallSign(globalGalleryLabel, [-4.75, linkY, linkZ], linkRotation, {
    width: 3.8,
    height: 0.5,
    exitUrl: `gallery-vr.html?lang=${lang}`,
    compact: true,
    highDetail: true
  });
  createWallSign(collectionLabel, [4.75, linkY, linkZ], linkRotation, {
    width: 3.8,
    height: 0.5,
    exitUrl: collectionUrl,
    compact: true,
    highDetail: true
  });
}

function addFiveMuseumsPartitions() {
  const material = new THREE.MeshStandardMaterial({ color: 0xd9d0c2, roughness: 0.96, side: THREE.DoubleSide });
  [-8, 8, 24, 40, 56, 72].forEach((z, index) => {
    const hasDoor = index > 0 && index < 5;
    const isLouvreExit = index === 1;
    const segments = isLouvreExit ? [[-2, 10]] : hasDoor ? [[-4.5, 5], [4.5, 5]] : [[0, 14]];
    segments.forEach(([x, width]) => {
      const panel = new THREE.Mesh(new THREE.PlaneGeometry(width, 4.4), material);
      panel.position.set(x, 2.2, z);
      scene.add(panel);
    });
    if (hasDoor) {
      const lintel = new THREE.Mesh(new THREE.BoxGeometry(4, 1.05, 0.18), material);
      lintel.position.set(isLouvreExit ? 5 : 0, 3.88, z);
      scene.add(lintel);
      const doorX = isLouvreExit ? 5 : 0;
      createWallSign(`↑ ${localizedMuseumName(MUSEUM_ROOMS[index])}`, [doorX, 3.65, z - 0.11], Math.PI, { width: 3.5, height: 0.4, accent: true, compact: true, highDetail: true });
      createWallSign(`↑ ${localizedMuseumName(MUSEUM_ROOMS[index - 1])}`, [doorX, 3.65, z + 0.11], 0, { width: 3.5, height: 0.4, accent: true, compact: true, highDetail: true });
    }
  });
  createWallSign(lang === "fr" ? "RETOUR À ARTDACI" : lang === "ar" ? "العودة إلى ARTDACI" : "BACK TO ARTDACI", [0, 2.2, 71.88], 0, { width: 3.6, height: 0.48, exitUrl: `gallery-vr.html?lang=${lang}`, compact: true });
}

async function loadFiveMuseumsRoom(index) {
  if (museumRoomsLoaded.has(index) || museumRoomLoads.has(index) || !MUSEUM_ROOMS[index]) return museumRoomLoads.get(index);
  if ((museumRoomRetryAt.get(index) || 0) > performance.now()) return null;
  const task = (async () => {
    const room = MUSEUM_ROOMS[index];
    status.textContent = lang === "fr" ? `Chargement de ${localizedMuseumName(room)}…` : lang === "ar" ? `جارٍ تحميل ${localizedMuseumName(room)}…` : `Loading ${localizedMuseumName(room)}…`;
    const centerZ = index * 16;
    const panels = index === 0
      ? [
          ["louvre-face", room.views.face, 0, centerZ - 7.91, 0, "", { maxWidth: 8.8, maxHeight: 3.55, positionY: 2.05, hideLabel: true, highDetail: true, volumetric: true }],
          ["louvre-right", room.views.right, 6.91, centerZ, -Math.PI / 2, "", { maxWidth: 11.2, maxHeight: 3.5, positionY: 2.15, hideLabel: true, highDetail: true, volumetric: true }],
          ["louvre-left", room.views.left, -6.91, centerZ, Math.PI / 2, "", { maxWidth: 11.2, maxHeight: 3.5, positionY: 2.15, hideLabel: true, highDetail: true, volumetric: true }],
          ["louvre-plan", room.plan, -5.45, centerZ + 7.91, Math.PI, lang === "fr" ? "PLAN DU BÂTIMENT" : lang === "ar" ? "مخطط المبنى" : "BUILDING PLAN", { maxWidth: 2.4, maxHeight: 1.75, positionY: 2.05, labelScale: 0.28, highDetail: true }],
          ["louvre-timeline", room.timeline, -0.5, centerZ + 7.91, Math.PI, lang === "fr" ? "CHRONOLOGIE" : lang === "ar" ? "الخط الزمني" : "TIMELINE", { maxWidth: 6.8, maxHeight: 3, positionY: 2.12, labelScale: 0.34, labelAbove: true, highDetail: true }]
        ]
      : [
          ["plan", room.plan, -6.91, centerZ - 3.5, Math.PI / 2, lang === "fr" ? "PLAN DU BÂTIMENT" : lang === "ar" ? "مخطط المبنى" : "BUILDING PLAN", { maxWidth: 4.3, maxHeight: 2.35, positionY: 2.25, highDetail: true }],
          ["timeline", room.timeline, -6.91, centerZ + 3, Math.PI / 2, lang === "fr" ? "CHRONOLOGIE" : lang === "ar" ? "الخط الزمني" : "TIMELINE", { maxWidth: 6.2, maxHeight: 3.45, positionY: 2.25, labelScale: 0.34, labelAbove: true, highDetail: true }],
          ["facade", room.facade, 6.91, centerZ - 0.15, -Math.PI / 2, lang === "fr" ? "FAÇADE DU MUSÉE" : lang === "ar" ? "واجهة المتحف" : "MUSEUM FACADE", { maxWidth: 6.8, maxHeight: 3.45, positionY: 2.25, labelScale: 0.34, labelAbove: true, highDetail: true, volumetric: true }]
        ];
    const results = await Promise.allSettled(panels.map(([panelId, ...args]) => loadMuseumPanelOnce(`${room.id}:${panelId}`, () => addMuseumInformationPanel(...args))));
    const failures = results.filter((result) => result.status === "rejected");
    if (failures.length) {
      failures.forEach((failure) => console.warn(`Museum panel unavailable in ${room.id}.`, failure.reason));
      museumRoomRetryAt.set(index, performance.now() + 2500);
      return false;
    }
    await loadMuseumArchitecturalModel(room, index, centerZ);
    museumRoomsLoaded.add(index);
    museumRoomRetryAt.delete(index);
    status.textContent = text.ready;
    return true;
  })().finally(() => museumRoomLoads.delete(index));
  museumRoomLoads.set(index, task);
  return task;
}

async function loadMuseumArchitecturalModel(room, index, centerZ) {
  if (!allowDecorative3DModels || !room.model) return null;
  if (index === 0) {
    const model = await addFurnitureModel({
      src: room.model,
      name: "museum-architecture-louvre",
      position: [0, 0.02, centerZ],
      rotationY: 0,
      maxSize: 6.96
    });
    return model;
  }
  const position = [0, 0.02, centerZ];
  const baseGroup = new THREE.Group();
  baseGroup.position.set(position[0], 0, position[2]);
  const dark = new THREE.Color(room.colors[0]).offsetHSL(0, 0.06, 0.08);
  const accent = new THREE.Color(room.colors[1]);
  const tiers = [
    { radiusTop: 1.56, radiusBottom: 1.68, height: 0.16, y: 0.08, color: dark },
    { radiusTop: 1.42, radiusBottom: 1.5, height: 0.22, y: 0.27, color: accent },
    { radiusTop: 1.28, radiusBottom: 1.36, height: 0.13, y: 0.445, color: dark }
  ];
  tiers.forEach((tier) => {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(tier.radiusTop, tier.radiusBottom, tier.height, 48), new THREE.MeshStandardMaterial({ color: tier.color, roughness: 0.48, metalness: 0.2 }));
    mesh.position.y = tier.y; mesh.receiveShadow = true; baseGroup.add(mesh);
  });
  [0.17, 0.39].forEach((y, ringIndex) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(ringIndex ? 1.34 : 1.53, 0.035, 10, 64), new THREE.MeshStandardMaterial({ color: ringIndex ? accent : 0xf1d99a, metalness: 0.65, roughness: 0.25 }));
    ring.rotation.x = Math.PI / 2; ring.position.y = y; baseGroup.add(ring);
  });
  const motifGeometry = index % 2 ? new THREE.OctahedronGeometry(0.075, 0) : new THREE.BoxGeometry(0.1, 0.1, 0.045);
  for (let motif = 0; motif < 12; motif += 1) {
    const angle = motif / 12 * Math.PI * 2;
    const ornament = new THREE.Mesh(motifGeometry, new THREE.MeshStandardMaterial({ color: 0xf4dfaa, metalness: 0.55, roughness: 0.3 }));
    ornament.position.set(Math.sin(angle) * 1.48, 0.29, Math.cos(angle) * 1.48);
    ornament.rotation.y = angle; baseGroup.add(ornament);
  }
  scene.add(baseGroup);
  return addFurnitureModel({ src: room.model, name: `museum-architecture-${room.id}`, position: [position[0], 0.51, position[2]], rotationY: Math.PI, maxSize: 2.35 });
}

function loadMuseumPanelOnce(key, loader) {
  if (museumPanelsLoaded.has(key)) return Promise.resolve(true);
  if (museumPanelLoads.has(key)) return museumPanelLoads.get(key);
  const task = loader()
    .then(() => {
      museumPanelsLoaded.add(key);
      return true;
    })
    .finally(() => museumPanelLoads.delete(key));
  museumPanelLoads.set(key, task);
  return task;
}

async function addMuseumInformationPanel(template, x, z, rotationY, labelText, options = {}) {
  const texture = await textureLoader.loadAsync(museumImagePath(template));
  prepareMuseumInformationTexture(texture, options.highDetail);
  texture.encoding = THREE.sRGBEncoding;
  texture.minFilter = THREE.LinearFilter;
  const aspect = texture.image.width / texture.image.height;
  const maxWidth = options.maxWidth || 5.2;
  const maxHeight = options.maxHeight || 3.15;
  const height = Math.min(maxHeight, maxWidth / aspect);
  const width = height * aspect;
  const group = new THREE.Group();
  group.position.set(x, options.positionY || 2.18, z);
  group.rotation.y = rotationY;
  const frameDepth = options.volumetric ? 0.24 : 0.08;
  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(width + (options.volumetric ? 0.24 : 0.16), height + (options.volumetric ? 0.24 : 0.16), frameDepth),
    new THREE.MeshStandardMaterial({ color: options.volumetric ? 0x4b3a25 : 0xc9a860, roughness: 0.42, metalness: options.volumetric ? 0.24 : 0.15 })
  );
  const imageMaterial = options.volumetric
    ? new THREE.MeshStandardMaterial({ map: texture, bumpMap: texture, bumpScale: 0.045, roughness: 0.48, metalness: 0.02 })
    : new THREE.MeshBasicMaterial({ map: texture });
  const image = new THREE.Mesh(new THREE.PlaneGeometry(width, height, options.volumetric ? 24 : 1, options.volumetric ? 16 : 1), imageMaterial);
  image.position.z = frameDepth / 2 + (options.volumetric ? 0.065 : 0.012);
  if (options.volumetric) {
    image.castShadow = true;
    image.receiveShadow = true;
    const inset = new THREE.Mesh(
      new THREE.BoxGeometry(width + 0.07, height + 0.07, 0.09),
      new THREE.MeshStandardMaterial({ color: 0x16110c, roughness: 0.72 })
    );
    inset.position.z = frameDepth / 2 + 0.004;
    group.add(inset);
  }
  group.add(frame, image);
  if (!options.hideLabel) {
    const label = makeLabel(labelText, { highDetail: options.highDetail });
    label.position.set(0, options.labelAbove ? height / 2 + 0.2 : -height / 2 - 0.28, frameDepth / 2 + (options.volumetric ? 0.075 : 0.025));
    label.scale.set(Math.min(2.8, width + 0.3), options.labelScale || 0.48, 1);
    group.add(label);
  }
  scene.add(group);
  if (options.volumetric && !isLowPowerDevice) {
    const light = new THREE.SpotLight(0xffe2b5, 0.78, 8, Math.PI / 5.5, 0.5);
    light.position.set(x > 0 ? x - 2.6 : x + 2.6, 3.75, z - 1.2);
    light.target = image;
    scene.add(light);
  }
  revealLoadedDisplay(group);
  return group;
}

function prepareMuseumInformationTexture(texture, highDetail = false) {
  if (!texture?.image) return texture;
  const image = texture.image;
  const width = image.naturalWidth || image.videoWidth || image.width || 0;
  const height = image.naturalHeight || image.videoHeight || image.height || 0;
  const maximum = highDetail
    ? (isQuestBrowser ? 2048 : isHandheldMobile ? 1536 : 4096)
    : (isQuestBrowser ? 1536 : isHandheldMobile ? 1024 : 4096);
  if (width > maximum || height > maximum) {
    const scale = Math.min(maximum / width, maximum / height);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    const context = canvas.getContext("2d", { alpha: false });
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    texture.image = canvas;
  }
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), isQuestBrowser ? 4 : 8);
  texture.needsUpdate = true;
  return texture;
}

function maybeLoadFiveMuseumsRoom() {
  if (!isFiveMuseumsWing) return;
  const visitorZ = currentSession ? getListenerPosition().z : visitor.position.z;
  const index = THREE.MathUtils.clamp(Math.floor((visitorZ + 8) / 16), 0, MUSEUM_ROOMS.length - 1);
  if (!museumRoomsLoaded.has(index)) void loadFiveMuseumsRoom(index);
  const forward = THREE.MathUtils.clamp(index + 1, 0, MUSEUM_ROOMS.length - 1);
  const nextBoundaryZ = 8 + index * 16;
  if (forward !== index && visitorZ >= nextBoundaryZ - 6) void loadFiveMuseumsRoom(forward);
}

function buildModelMuseumArchitecture() {
  visitor.position.set(0, 0, -5.2);
  visitor.rotation.y = Math.PI;
  scene.background = new THREE.Color(0x11171d);
  scene.fog = new THREE.Fog(0x11171d, 18, 34);
  scene.add(new THREE.HemisphereLight(0xfff1dc, 0x202832, isQuestBrowser ? 1.25 : 1.5));
  const room = ARTIST_ROOMS[modelArtistId];
  document.getElementById("gallery-title").textContent = lang === "fr"
    ? `${room.name} — salle des modèles 3D`
    : `${room.name} — Independent 3D Model Room`;
  document.getElementById("gallery-count").textContent = lang === "fr"
    ? "Une salle fermée · chargement indépendant"
    : "One closed room · independent loading";

  addConnectedRoomShell(modelArtistId, room, 0, 0);
  addStandaloneModelRoomEndWalls();
  addModelRoomNavigation(modelArtistId, 0);
  addVirtualGuideStation([-6.88, 1.18, 6.35], Math.PI / 2, `${room.name}'s 3D model room`);
  addLocalMovementHotspots([
    { position: [0, -5.2], label: lang === "fr" ? "ENTRÉE" : lang === "ar" ? "المدخل" : "ENTRANCE", yaw: Math.PI, captionRotation: Math.PI },
    { position: [0, 0], label: lang === "fr" ? "MODÈLES 3D" : lang === "ar" ? "نماذج ثلاثية الأبعاد" : "3D MODELS", yaw: Math.PI, captionRotation: Math.PI }
  ]);
}

function addStandaloneModelRoomEndWalls() {
  const material = new THREE.MeshStandardMaterial({ color: 0x18222c, roughness: 0.95, side: THREE.DoubleSide });
  [-8, 8].forEach((z, index) => {
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(14, 4.4), material);
    wall.position.set(0, 2.2, z);
    wall.rotation.y = index ? Math.PI : 0;
    scene.add(wall);
  });
}

function buildGroupGalleryRoom() {
  document.getElementById("gallery-title").textContent = lang === "fr" ? "Groupes de peintres réimaginés" : "Reimagined Painter Groups";
  document.getElementById("gallery-count").textContent = lang === "fr" ? "Une installation 3D" : "One 3D installation";
  scene.background = new THREE.Color(0x111821);
  scene.fog = new THREE.Fog(0x111821, 18, 34);
  visitor.position.set(0, 0, 5.8);
  visitor.rotation.y = 0;
  scene.add(new THREE.HemisphereLight(0xfff1dc, 0x172334, 1.55));
  const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x18314a, roughness: 0.94, side: THREE.DoubleSide });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 16), new THREE.MeshStandardMaterial({ color: 0x392f2a, roughness: 0.9 }));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);
  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(14, 16), wallMaterial);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = 4.4;
  scene.add(ceiling);
  [
    [[0, 2.2, -8], [14, 4.4], 0],
    [[-7, 2.2, 0], [16, 4.4], Math.PI / 2],
    [[7, 2.2, 0], [16, 4.4], -Math.PI / 2],
    [[0, 2.2, 8], [14, 4.4], Math.PI]
  ].forEach(([position, size, rotationY]) => {
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(...size), wallMaterial);
    wall.position.set(...position);
    wall.rotation.y = rotationY;
    scene.add(wall);
  });
  createWallSign(lang === "fr" ? "GROUPES RÉIMAGINÉS" : "REIMAGINED GROUPS", [0, 3.72, -7.9], 0, { width: 5.2, height: 0.58, accent: true });
  createWallSign(text.paintingsRoom, [-4.4, 3.55, 7.9], Math.PI, { width: 3, height: 0.42, exitUrl: `gallery-vr.html?lang=${lang}&room=paintings`, compact: true });
  createWallSign(text.modelsRoom, [0, 3.55, 7.9], Math.PI, { width: 3, height: 0.42, exitUrl: `gallery-vr.html?lang=${lang}&room=models`, compact: true });
  createWallSign(text.reimaginedRoom, [4.4, 3.55, 7.9], Math.PI, { width: 3, height: 0.42, exitUrl: `gallery-vr.html?lang=${lang}&room=reimagined`, compact: true });
  createWallSign(lang === "fr" ? "GALERIE VR PRINCIPALE" : lang === "ar" ? "معرض الواقع الافتراضي الرئيسي" : "MAIN VR GALLERY", [-2.2, 2.9, 7.9], Math.PI, {
    width: 3.3, height: 0.4, exitUrl: `gallery-vr.html?lang=${lang}`, compact: true
  });
  createWallSign(lang === "fr" ? "SORTIR VERS LA COLLECTION" : lang === "ar" ? "الخروج إلى المجموعة" : "EXIT TO COLLECTION", [2.2, 2.9, 7.9], Math.PI, {
    width: 3.3,
    height: 0.4,
    exitUrl: lang === "ar" ? "index-ar.html" : lang === "fr" ? "index-fr.html" : "index.html",
    compact: true
  });
  addVirtualGuideStation([-6.88, 1.25, 5.9], Math.PI / 2, "the ARTDACI reimagined painter-groups room");
  addLocalMovementHotspots([
    { position: [0, 5.6], label: lang === "fr" ? "ENTRÉE" : lang === "ar" ? "المدخل" : "ENTRANCE", yaw: 0 },
    { position: [0, 0.8], label: lang === "fr" ? "EXPOSITION" : lang === "ar" ? "المعرض" : "EXHIBITION", yaw: Math.PI },
    { position: [0, -5.2], label: lang === "fr" ? "ŒUVRE PRINCIPALE" : lang === "ar" ? "العمل الرئيسي" : "MAIN EXHIBIT", yaw: 0 }
  ]);
}

function buildLouvreMuseumRoom() {
  document.getElementById("gallery-title").textContent = lang === "fr" ? "Musée du Louvre — galerie virtuelle" : lang === "ar" ? "متحف اللوفر — معرض افتراضي" : "Louvre Museum — Virtual Gallery";
  document.getElementById("gallery-count").textContent = lang === "fr" ? "Trois photos · une façade 3D" : lang === "ar" ? "ثلاث صور · واجهة ثلاثية الأبعاد" : "Three photographs · one 3D facade";
  scene.background = new THREE.Color(0x6f412e);
  scene.fog = new THREE.Fog(0x6f412e, 24, 46);
  visitor.position.set(0, 0, 7.1);
  visitor.rotation.y = 0;
  scene.add(new THREE.HemisphereLight(0xfff3d3, 0x5d3524, isQuestBrowser ? 1.35 : 1.65));

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 20), new THREE.MeshStandardMaterial({ color: 0xb98242, roughness: 0.72 }));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);
  const parquetMaterial = new THREE.MeshBasicMaterial({ color: 0x6f3d1e, transparent: true, opacity: 0.34 });
  const parquetStep = isLowPowerDevice ? 2 : 1;
  for (let z = -9; z <= 9; z += parquetStep) {
    for (let x = -6.2; x <= 6.2; x += 1.25 * parquetStep) {
      const slat = new THREE.Mesh(new THREE.PlaneGeometry(1.12 * parquetStep, 0.055), parquetMaterial);
      slat.rotation.x = -Math.PI / 2;
      slat.rotation.z = ((Math.round(x + z) % 2) ? 1 : -1) * Math.PI / 4;
      slat.position.set(x, 0.008, z);
      scene.add(slat);
    }
  }

  const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x82462f, roughness: 0.9, side: THREE.DoubleSide });
  // Build each side wall in two sections, leaving a genuine floor-to-ceiling
  // opening for the photographic continuation of the room.
  const sideWallSectionWidth = (20 - LOUVRE_SIDE_OPENING_WIDTH) / 2;
  const sideWallSectionOffset = (LOUVRE_SIDE_OPENING_WIDTH + sideWallSectionWidth) / 2;
  [-7, 7].forEach((x) => {
    [-sideWallSectionOffset, sideWallSectionOffset].forEach((z) => {
      const wall = new THREE.Mesh(new THREE.PlaneGeometry(sideWallSectionWidth, 4.9), wallMaterial);
      wall.position.set(x, 2.45, z);
      wall.rotation.y = x < 0 ? Math.PI / 2 : -Math.PI / 2;
      scene.add(wall);
    });
  });
  [[0, 2.45, -10, 0], [0, 2.45, 10, Math.PI]].forEach(([x, y, z, rotationY]) => {
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(14, 4.9), wallMaterial);
    wall.position.set(x, y, z);
    wall.rotation.y = rotationY;
    scene.add(wall);
  });

  const gold = new THREE.MeshStandardMaterial({ color: 0xb88935, roughness: 0.38, metalness: 0.48 });
  const darkMarble = new THREE.MeshStandardMaterial({ color: 0x211b18, roughness: 0.5, metalness: 0.12 });
  [-7, 7].forEach((x) => {
    const side = x < 0 ? -1 : 1;
    [0.23, 4.42].forEach((y) => {
      [-sideWallSectionOffset, sideWallSectionOffset].forEach((z) => {
        const cornice = new THREE.Mesh(new THREE.BoxGeometry(0.16, y < 1 ? 0.32 : 0.28, sideWallSectionWidth), y < 1 ? darkMarble : gold);
        cornice.position.set(x - side * 0.08, y, z);
        scene.add(cornice);
      });
    });
    // Dark, shallow jambs make the photograph read as space beyond the wall
    // instead of a picture placed on its surface.
    [-LOUVRE_SIDE_OPENING_WIDTH / 2, LOUVRE_SIDE_OPENING_WIDTH / 2].forEach((z) => {
      const jamb = new THREE.Mesh(new THREE.BoxGeometry(0.34, 4.9, 0.13), darkMarble);
      jamb.position.set(x + side * 0.08, 2.45, z);
      scene.add(jamb);
    });
    const threshold = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.08, LOUVRE_SIDE_OPENING_WIDTH), darkMarble);
    threshold.position.set(x + side * 0.08, 0.04, 0);
    scene.add(threshold);
  });

  // A luminous glazed vault with gilded ribs, echoing the Grande Galerie.
  const glass = new THREE.MeshStandardMaterial({ color: 0xdcebf0, emissive: 0x758a91, emissiveIntensity: 0.28, transparent: true, opacity: 0.76, roughness: 0.34, side: THREE.DoubleSide });
  for (let z = -9.5; z <= 9.5; z += 1.9) {
    const pane = new THREE.Mesh(new THREE.PlaneGeometry(7.2, 1.72), glass);
    pane.rotation.x = Math.PI / 2;
    pane.position.set(0, 5.12, z);
    scene.add(pane);
    const rib = new THREE.Mesh(new THREE.BoxGeometry(7.7, 0.1, 0.12), gold);
    rib.position.set(0, 5.08, z - 0.91);
    scene.add(rib);
  }
  [-3.75, 3.75].forEach((x) => {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 20), gold);
    rail.position.set(x, 5.05, 0);
    scene.add(rail);
  });

  // Keep both end walls open and free of columns so architecture and menus
  // remain fully visible.
  [-9.78, 9.78].forEach((z) => {
    const entablature = new THREE.Mesh(new THREE.BoxGeometry(10.2, 0.42, 0.54), gold);
    entablature.position.set(0, 4.72, z);
    scene.add(entablature);
  });

  [2.6, -3.0].forEach((z, index) => {
    const warm = new THREE.PointLight(0xffd49a, isQuestBrowser ? 0.7 : 1.05, 13, 1.5);
    warm.position.set(0, 4.45, z);
    scene.add(warm);
  });
  createWallSign(lang === "fr" ? "GALERIE DU LOUVRE" : lang === "ar" ? "معرض اللوفر" : "THE LOUVRE GALLERY", [0, 4.18, -9.7], 0, { width: 4.7, height: 0.5, accent: true, compact: true });
  createWallSign(lang === "fr" ? "EXPLORER LE LOUVRE EN VR" : lang === "ar" ? "استكشاف اللوفر بالواقع الافتراضي" : "EXPLORE THE LOUVRE IN VR", [-6.86, 3.45, 5.45], Math.PI / 2, { width: 3.4, height: 0.46, exitUrl: LOUVRE_GALLERY_VR_WORLD_URL, compact: true, accent: true });
  createWallSign(lang === "fr" ? "RETOUR À LA GALERIE VR" : lang === "ar" ? "العودة إلى معرض الواقع الافتراضي" : "BACK TO THE VR GALLERY", [-3.75, 4.45, 9.72], Math.PI, { width: 3.15, height: 0.4, exitUrl: `gallery-vr.html?lang=${lang}`, compact: true });
  createWallSign(lang === "fr" ? "SORTIR VERS LA COLLECTION" : lang === "ar" ? "الخروج إلى المجموعة" : "EXIT TO COLLECTION", [0, 4.45, 9.72], Math.PI, {
    width: 3.15,
    height: 0.4,
    exitUrl: lang === "ar" ? "index-ar.html" : lang === "fr" ? "index-fr.html" : "index.html",
    compact: true
  });
  addVirtualGuideStation([3.75, 4.45, 9.72], Math.PI, "the ARTDACI Louvre room, its photographs, and its 3D facade");
  addLocalMovementHotspots([
    { position: [0, 7.1], label: lang === "fr" ? "ENTRÉE" : lang === "ar" ? "المدخل" : "ENTRANCE", yaw: 0 },
    { position: [0, 1.8], label: lang === "fr" ? "CENTRE" : lang === "ar" ? "الوسط" : "CENTRE", yaw: 0 },
    { position: [0, -6.8], label: lang === "fr" ? "TABLEAUX" : lang === "ar" ? "اللوحات" : "PAINTINGS", yaw: 0 }
  ]);
}

async function buildLouvreMuseumExhibits() {
  for (let index = 0; index < LOUVRE_PHOTO_EXHIBITS.length; index += 1) {
    const item = LOUVRE_PHOTO_EXHIBITS[index];
    const texture = await textureLoader.loadAsync(item.src);
    optimizeTextureForMobile(texture);
    texture.encoding = THREE.sRGBEncoding;
    texture.minFilter = THREE.LinearFilter;
    const aspect = texture.image.width / texture.image.height;
    const height = Math.min(item.maxHeight, item.maxWidth / aspect);
    const width = height * aspect;
    const display = new THREE.Group();
    display.position.set(...item.position);
    display.rotation.y = item.rotationY;
    const imageMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      polygonOffset: false
    });
    const image = new THREE.Mesh(new THREE.PlaneGeometry(width, height), imageMaterial);
    image.position.z = item.portal ? 0 : 0.056;
    display.add(image);
    scene.add(display);
  }
  await ensureLouvreFacade();
}

function buildPeopleBehindPaintersRoom() {
  const roomId = PEOPLE_ROOM_CONFIG[artistRoomId] ? artistRoomId : "da-vinci";
  const room = PEOPLE_ROOM_CONFIG[roomId];
  document.getElementById("gallery-title").textContent = `${room.name[lang] || room.name.en} — ${lang === "fr" ? "les personnes derrière le peintre" : lang === "ar" ? "الأشخاص وراء الفنان" : "People Behind the Painter"}`;
  document.getElementById("gallery-count").textContent = room.subtitle[lang] || room.subtitle.en;
  document.getElementById("gallery-instructions").textContent = lang === "fr"
    ? "Découvrez les mécènes, proches et défenseurs qui ont fait vivre ces héritages artistiques."
    : lang === "ar" ? "اكتشف الرعاة والأقارب والمدافعين الذين حافظوا على هذه الموروثات الفنية." : "Meet the patrons, relatives, and advocates who sustained these artistic legacies.";

  scene.background = new THREE.Color(room.wood);
  scene.fog = new THREE.Fog(room.wood, 20, 38);
  visitor.position.set(0, 0, 6.4);
  visitor.rotation.y = 0;
  scene.add(new THREE.HemisphereLight(room.light, room.wood, isQuestBrowser ? 0.78 : 0.94));

  const floorMaterial = new THREE.MeshStandardMaterial({ color: room.floor, roughness: 0.76 });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 18), floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // A lightweight herringbone suggestion, echoing the parquet in the reference.
  const parquetMaterial = new THREE.MeshBasicMaterial({ color: 0x8a5a35, transparent: true, opacity: 0.3 });
  for (let z = -8; z <= 8; z += 1.1) {
    for (let x = -6; x <= 6; x += 1.5) {
      const slat = new THREE.Mesh(new THREE.PlaneGeometry(1.25, 0.08), parquetMaterial);
      slat.rotation.x = -Math.PI / 2;
      slat.rotation.z = ((Math.round((x + z) * 10) % 2) ? 1 : -1) * Math.PI / 4;
      slat.position.set(x, 0.008, z);
      scene.add(slat);
    }
  }

  const burgundy = new THREE.MeshStandardMaterial({ color: room.wall, roughness: 0.94, side: THREE.DoubleSide });
  const matteTrimColors = { "da-vinci": 0x343b42, "van-gogh": 0x294558, vermeer: 0x294b4d, monet: 0x3d5148 };
  const wood = new THREE.MeshStandardMaterial({ color: matteTrimColors[roomId], roughness: 1, metalness: 0, side: THREE.DoubleSide });
  const cream = new THREE.MeshStandardMaterial({ color: 0xd9c9ae, roughness: 0.92, side: THREE.DoubleSide });
  [[-7, 2.25, 0, Math.PI / 2, 18], [7, 2.25, 0, -Math.PI / 2, 18], [0, 2.25, -9, 0, 14], [0, 2.25, 9, Math.PI, 14]].forEach(([x, y, z, rotationY, width]) => {
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(width, 4.5), burgundy);
    wall.position.set(x, y, z);
    wall.rotation.y = rotationY;
    scene.add(wall);
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(width, 1.18), wood);
    panel.position.set(x, 0.59, z + (z === -9 ? 0.012 : z === 9 ? -0.012 : 0));
    panel.rotation.y = rotationY;
    scene.add(panel);
  });

  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(14, 18), cream);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = 4.5;
  scene.add(ceiling);
  const skylight = new THREE.Mesh(
    new THREE.PlaneGeometry(5.8, 9.2),
    new THREE.MeshBasicMaterial({ color: 0xfff3cf, side: THREE.DoubleSide })
  );
  skylight.rotation.x = Math.PI / 2;
  skylight.position.set(0, 4.47, 0);
  scene.add(skylight);
  [
    [6.15, 0.12, 0.18, 0, 4.39, -4.68], [6.15, 0.12, 0.18, 0, 4.39, 4.68],
    [0.18, 0.12, 9.55, -3.0, 4.39, 0], [0.18, 0.12, 9.55, 3.0, 4.39, 0]
  ].forEach(([width, height, depth, x, y, z]) => {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), wood);
    beam.position.set(x, y, z);
    scene.add(beam);
  });
  skylight.renderOrder = 1;

  [-5.5, 0, 5.5].forEach((z) => {
    [-4.5, 0, 4.5].forEach((x) => {
      const light = new THREE.PointLight(room.light, isLowPowerDevice ? 0.28 : 0.46, 8.5);
      light.position.set(x, 4.05, z);
      scene.add(light);
    });
  });

  addPeopleRoomNavigation(roomId);
  addVirtualGuideStation([-6.88, 1.25, 7], Math.PI / 2, `the people who sustained ${room.name.en}'s artistic legacy`);
  addLocalMovementHotspots([
    { position: [0, 6.2], label: lang === "fr" ? "ENTRÉE" : lang === "ar" ? "المدخل" : "ENTRANCE", yaw: 0 },
    { position: [0, 0], label: lang === "fr" ? "PORTRAITS" : lang === "ar" ? "الصور" : "PORTRAITS", yaw: 0 },
    { position: [0, -6.2], label: lang === "fr" ? "RÉCIT" : lang === "ar" ? "القصة" : "STORY", yaw: 0 },
    { position: [0, 7.55], label: lang === "fr" ? "MENU" : lang === "ar" ? "القائمة" : "MENU", yaw: Math.PI }
  ]);
}

function addPeopleRoomNavigation(currentRoomId) {
  const menuBackdrop = new THREE.Mesh(
    new THREE.PlaneGeometry(13.45, 4.15),
    new THREE.MeshStandardMaterial({ color: 0x0b302b, roughness: 0.88, side: THREE.DoubleSide })
  );
  // The visitor approaches this wall from lower Z values. Keep the backdrop
  // behind every clickable sign so it cannot hide the menu.
  menuBackdrop.position.set(0, 2.25, 8.895);
  menuBackdrop.rotation.y = Math.PI;
  scene.add(menuBackdrop);
  const menuGold = new THREE.MeshStandardMaterial({ color: 0xc99b4a, roughness: 0.48, metalness: 0.24 });
  [[13.3, 0.025, 0, 4.27], [13.3, 0.025, 0, 0.23], [0.025, 4.06, -6.58, 2.25], [0.025, 4.06, 6.58, 2.25]].forEach(([width, height, x, y]) => {
    const border = new THREE.Mesh(new THREE.PlaneGeometry(width, height), menuGold);
    border.position.set(x, y, 8.885);
    border.rotation.y = Math.PI;
    scene.add(border);
  });
  const roomHeading = lang === "fr" ? "AUTRES SALLES" : lang === "ar" ? "غرف أخرى" : "OTHER ROOMS";
  createWallSign(roomHeading, [0, 3.84, 8.87], Math.PI, {
    width: 4.1, height: 0.56, peopleMenu: true, heading: true, compact: true
  });
  const painterIcons = { "da-vinci": "◇", "van-gogh": "✿", vermeer: "⌕", monet: "◉" };
  Object.entries(PEOPLE_ROOM_CONFIG).reverse().forEach(([id, room], index) => {
    const x = -4.65 + index * 3.1;
    createWallSign(room.name[lang] || room.name.en, [x, 3.18, 8.87], Math.PI, {
      width: 2.78, height: 0.5,
      exitUrl: `gallery-vr.html?lang=${lang}&room=people&artist=${id}`,
      compact: true,
      peopleMenu: true,
      icon: painterIcons[id],
      active: id === currentRoomId
    });
  });
  const destinations = [
    [text.modelsRoom, `gallery-vr.html?lang=${lang}&room=models`, "⬡"],
    [text.paintingsRoom, `gallery-vr.html?lang=${lang}&room=paintings`, "▣"],
    [lang === "fr" ? "GALERIE PRINCIPALE" : lang === "ar" ? "المعرض الرئيسي" : "MAIN GALLERY", `gallery-vr.html?lang=${lang}`, "⌂"],
    [text.livingBook, `book-3d.html?lang=${lang}`, "▤"],
    [text.cinemaEnter, `cinema-vr.html?lang=${lang}`, "◎"],
    [text.reimaginedRoom, `gallery-vr.html?lang=${lang}&room=reimagined`, "▧"],
    [lang === "fr" ? "COLLECTION" : lang === "ar" ? "المجموعة" : "COLLECTION", lang === "ar" ? "index-ar.html" : lang === "fr" ? "index-fr.html" : "index.html", "◫"]
  ];
  destinations.forEach(([label, url, icon], index) => {
    const column = index % 3;
    const row = Math.floor(index / 3);
    createWallSign(label, [-4.15 + column * 4.15, 2.43 - row * 0.66, 8.87], Math.PI, {
      width: 3.72, height: 0.53, exitUrl: url, compact: true, peopleMenu: true, icon
    });
  });
}

async function buildPeopleBehindPaintersExhibits() {
  const roomId = PEOPLE_ROOM_CONFIG[artistRoomId] ? artistRoomId : "da-vinci";
  const room = PEOPLE_ROOM_CONFIG[roomId];
  const portraits = PEOPLE_BEHIND_PAINTERS.filter((item) => item.painter === roomId);
  const portraitPlacement = (index) => {
    const side = index % 2 === 0 ? -1 : 1;
    const row = Math.floor(index / 2);
    const z = portraits.length <= 2 ? 0.2 : -2.45 + row * 4.9;
    return [side * 6.88, 2.42, z, side < 0 ? Math.PI / 2 : -Math.PI / 2];
  };

  await Promise.all(portraits.map(async (item, index) => {
    const texture = await textureLoader.loadAsync(item.src);
    optimizeTextureForMobile(texture);
    texture.encoding = THREE.sRGBEncoding;
    texture.minFilter = THREE.LinearFilter;
    const aspect = texture.image.width / texture.image.height;
    const height = Math.min(1.72, 2.35 / aspect);
    const width = height * aspect;
    const [x, y, z, rotationY] = portraitPlacement(index);
    const display = new THREE.Group();
    display.position.set(x, y, z);
    display.rotation.y = rotationY;

    const outer = new THREE.Mesh(
      new THREE.BoxGeometry(width + 0.32, height + 0.32, 0.12),
      new THREE.MeshStandardMaterial({ color: 0x46545d, roughness: 1, metalness: 0 })
    );
    display.add(outer);
    const inner = new THREE.Mesh(
      new THREE.BoxGeometry(width + 0.17, height + 0.17, 0.145),
      new THREE.MeshStandardMaterial({ color: 0xb9aa84, roughness: 0.92, metalness: 0.03 })
    );
    display.add(inner);
    const image = new THREE.Mesh(new THREE.PlaneGeometry(width, height), new THREE.MeshBasicMaterial({ map: texture }));
    image.position.z = 0.079;
    display.add(image);
    const label = makeLabel(item.title[lang] || item.title.en);
    label.position.set(0, -height / 2 - 0.36, 0.09);
    label.scale.set(Math.min(2.45, width + 0.52), 0.58, 1);
    display.add(label);
    scene.add(display);
  }));

  const eventSrc = room.event?.[lang] || room.event?.en || portraits[0]?.src;
  if (!eventSrc) return;
  const eventTexture = await textureLoader.loadAsync(eventSrc);
  eventTexture.encoding = THREE.sRGBEncoding;
  eventTexture.anisotropy = isLowPowerDevice ? 2 : renderer.capabilities.getMaxAnisotropy();
  eventTexture.generateMipmaps = true;
  eventTexture.minFilter = THREE.LinearMipmapLinearFilter;
  eventTexture.magFilter = THREE.LinearFilter;
  eventTexture.needsUpdate = true;
  const eventAspect = eventTexture.image.width / eventTexture.image.height;
  const eventHeight = Math.min(3.42, 11.7 / eventAspect);
  const eventWidth = eventHeight * eventAspect;
  const storyWall = new THREE.Group();
  storyWall.position.set(0, 2.32, -8.87);
  const border = new THREE.Mesh(
    new THREE.BoxGeometry(eventWidth + 0.28, eventHeight + 0.28, 0.12),
    new THREE.MeshStandardMaterial({ color: 0x52616b, roughness: 1, metalness: 0 })
  );
  storyWall.add(border);
  const storyImage = new THREE.Mesh(new THREE.PlaneGeometry(eventWidth, eventHeight), new THREE.MeshBasicMaterial({ map: eventTexture }));
  storyImage.position.z = 0.071;
  storyWall.add(storyImage);
  scene.add(storyWall);

  const readingSpot = new THREE.Group();
  readingSpot.position.set(0, 0.012, -8.05);
  readingSpot.userData.destination = new THREE.Vector3(0, 0, -8.05);
  readingSpot.userData.visitorYaw = 0;
  const readingTarget = new THREE.Mesh(
    new THREE.CircleGeometry(0.42, 32),
    new THREE.MeshBasicMaterial({ color: 0xdde7e9, transparent: true, opacity: 0.16, side: THREE.DoubleSide })
  );
  readingTarget.rotation.x = -Math.PI / 2;
  readingTarget.userData.hotspot = readingSpot;
  readingSpot.add(readingTarget);
  teleportTargets.push(readingTarget);
  scene.add(readingSpot);
}

async function buildPeopleRoomVideoExhibits() {
  const roomId = PEOPLE_ROOM_CONFIG[artistRoomId] ? artistRoomId : "da-vinci";
  const videos = PEOPLE_MEDIA_LIBRARY[roomId]?.videos || [];
  if (!videos.length) return;
  videoSelect.innerHTML = "";
  await Promise.all(videos.map(async (item, index) => {
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.preload = "metadata";
    video.playsInline = true;
    video.loop = true;
    video.muted = true;
    video.src = item.src;
    const texture = new THREE.VideoTexture(video);
    texture.encoding = THREE.sRGBEncoding;
    texture.minFilter = THREE.LinearFilter;
    const width = videos.length > 1 ? 2.75 : 3.15;
    const display = new THREE.Group();
    display.position.set(videos.length > 1 ? (index ? 4.95 : -4.95) : 4.85, 2.15, -8.78);
    const frame = new THREE.Mesh(new THREE.BoxGeometry(width + 0.25, 2.02, 0.14), new THREE.MeshStandardMaterial({ color: 0xcaa255, roughness: 0.36, metalness: 0.38 }));
    display.add(frame);
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(width, 1.72), new THREE.MeshBasicMaterial({ map: texture, color: 0xffffff }));
    screen.position.z = 0.081;
    display.add(screen);
    const label = makePeopleVideoCaption(localizedCinemaTitle(item), width);
    label.position.set(0, -1.27, 0.09);
    display.add(label);
    scene.add(display);
    const exhibit = { title: item.title, src: item.src, display, screen, video, sound: null, cinema: true, playlistIndex: index, playlist: videos };
    screen.userData.videoExhibit = exhibit;
    const playbackControl = makeLabel(lang === "ar" ? "تشغيل / إيقاف" : lang === "fr" ? "LECTURE / PAUSE" : "PLAY / PAUSE");
    playbackControl.position.set(0, -1.76, 0.1);
    playbackControl.scale.set(1.35, 0.32, 1);
    playbackControl.userData.videoExhibit = exhibit;
    display.add(playbackControl);
    galleryVideoExhibits.push(exhibit);
    galleryVideoScreens.push(screen, playbackControl);
    teleportTargets.push(screen, playbackControl);
    if (!activeGalleryVideo) activeGalleryVideo = exhibit;
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = `${index + 1}. ${localizedCinemaTitle(item)}`;
    videoSelect.appendChild(option);
  }));
  updateGalleryVideoButtons();
}

function decoratePeopleRoom() {
  const roomId = PEOPLE_ROOM_CONFIG[artistRoomId] ? artistRoomId : "da-vinci";
  [-5.75, 5.75].forEach((x, index) => void addFurnitureModel({
    src: ORNATE_PILL_MODEL,
    name: `people-${roomId}-ornate-pill-${index + 1}`,
    position: [x, 0, -7.35],
    rotationY: index ? Math.PI : 0,
    maxSize: 1.65
  }));
  if (["monet", "vermeer"].includes(roomId)) void addFurnitureModel({
    src: ACCENT_SOFA_MODEL,
    name: `people-${roomId}-accent-sofa`,
    position: [0, 0, 5.1],
    rotationY: Math.PI,
    maxSize: 2.25
  });
}

function decorateGalleryRoom(roomName, includeSofa = false) {
  [-5.25, 5.25].forEach((x, index) => void addFurnitureModel({
    src: ORNATE_PILL_MODEL,
    name: `${roomName}-ornate-pill-${index + 1}`,
    position: [x, 0, -6.6],
    rotationY: index ? Math.PI : 0,
    maxSize: 1.75
  }));
  if (includeSofa) void addFurnitureModel({
    src: ACCENT_SOFA_MODEL,
    name: `${roomName}-accent-sofa`,
    position: [0, 0, roomName === "louvre" ? 5.65 : 4.4],
    rotationY: Math.PI,
    maxSize: 2.35
  });
}

function addLouvreGalleryFurniture() {
  const armchairSrc = GALLERY_FURNITURE.find((item) => item.id === "armchair")?.src;
  if (armchairSrc) {
    [-4.65, 4.65].forEach((x, index) => void addFurnitureModel({
      src: armchairSrc,
      name: `louvre-armchair-${index + 1}`,
      position: [x, 0, 6.25],
      rotationY: Math.PI / 2,
      maxSize: 1.25
    }));
  }
  void addFurnitureModel({
    src: "assets/environments/gallery/models/table-vitrine-w.glb",
    name: "louvre-central-vitrine",
    position: [0, 0, 3.9],
    rotationY: 0,
    maxSize: 1.55
  });
  void addFurnitureModel({
    src: "assets/environments/gallery/models/brochure_stand.glb",
    name: "louvre-information-stand",
    position: [5.45, 0, -1.5],
    rotationY: -Math.PI / 2,
    maxSize: 1.2
  });
  void addFurnitureModel({
    src: LOUVRE_BENCH_MODEL,
    name: "louvre-gallery-bench",
    position: [0, 0, -1.15],
    rotationY: 0,
    maxSize: 2.9
  });
}

async function buildGroupExhibit() {
  const texture = await textureLoader.loadAsync(GROUP_EXHIBIT.image);
  texture.encoding = THREE.sRGBEncoding;
  const aspect = texture.image.width / texture.image.height;
  const imageHeight = Math.min(2.25, 5.1 / aspect);
  const imageWidth = imageHeight * aspect;
  const frame = new THREE.Mesh(new THREE.BoxGeometry(imageWidth + 0.18, imageHeight + 0.18, 0.1), new THREE.MeshStandardMaterial({ color: 0xc7a45d, roughness: 0.5, metalness: 0.24 }));
  frame.position.set(0, 2.35, -7.84);
  scene.add(frame);
  const image = new THREE.Mesh(new THREE.PlaneGeometry(imageWidth, imageHeight), new THREE.MeshStandardMaterial({ map: texture, roughness: 0.7 }));
  image.position.set(0, 2.35, -7.78);
  scene.add(image);

  if (!allowDecorative3DModels) return;

  const gltf = await modelLoader.loadAsync(GROUP_EXHIBIT.model);
  const model = gltf.scene;
  model.rotation.y = 0;
  model.updateMatrixWorld(true);
  let modelBox = new THREE.Box3().setFromObject(model);
  const modelHeight = modelBox.getSize(new THREE.Vector3()).y;
  model.scale.setScalar(2.15 / Math.max(modelHeight, 0.001));
  model.updateMatrixWorld(true);
  modelBox = new THREE.Box3().setFromObject(model);
  const modelCenter = modelBox.getCenter(new THREE.Vector3());
  model.position.set(-modelCenter.x, -modelBox.min.y, -1.1 - modelCenter.z);
  model.traverse((node) => {
    if (!node.isMesh) return;
    node.castShadow = !isQuestBrowser;
    node.receiveShadow = true;
  });
  scene.add(model);
  const light = new THREE.SpotLight(0xffe5bb, 1.2, 9, Math.PI / 4, 0.45);
  light.position.set(0, 4.1, 2.3);
  light.target = model;
  scene.add(light);
  await addFurnitureModel({
    src: GALLERY_FURNITURE.find((item) => item.id === "armchair").src,
    name: "groups-gallery-armchair",
    position: [4.6, 0, 1.4],
    rotationY: -Math.PI / 2,
    maxSize: 1.65
  });
}

function addModelRoomNavigation(currentId, centerZ) {
  const otherRooms = ARTIST_ROOM_ORDER.filter((id) => id !== currentId);
  createWallSign(lang === "fr" ? "MODÈLES 3D" : "3D MODELS", [-6.88, 3.08, centerZ], Math.PI / 2, {
    width: 3.3, height: 0.44, accent: true, compact: true
  });
  createWallSign(lang === "fr" ? "AUTRES SALLES 3D" : "OTHER 3D ROOMS", [6.88, 3.68, centerZ], -Math.PI / 2, {
    width: 3.5, height: 0.42, accent: true, compact: true
  });
  otherRooms.forEach((id, index) => {
    createWallSign(ARTIST_ROOMS[id].name, [6.88, 3.13 - index * 0.52, centerZ], -Math.PI / 2, {
      width: 2.8,
      height: 0.38,
      exitUrl: `gallery-vr.html?lang=${lang}&room=models&artist=${id}`,
      compact: true
    });
  });
  const collectionUrl = lang === "ar" ? "index-ar.html" : lang === "fr" ? "index-fr.html" : "index.html";
  createWallSign(lang === "fr" ? "GALERIE VR PRINCIPALE" : lang === "ar" ? "معرض الواقع الافتراضي الرئيسي" : "MAIN VR GALLERY", [6.88, 1.47, centerZ], -Math.PI / 2, {
    width: 3.1, height: 0.38, exitUrl: `gallery-vr.html?lang=${lang}`, compact: true
  });
  createWallSign(lang === "fr" ? "SORTIR VERS LA COLLECTION" : lang === "ar" ? "الخروج إلى المجموعة" : "EXIT TO COLLECTION", [6.88, 0.95, centerZ], -Math.PI / 2, {
    width: 3.1, height: 0.38, exitUrl: collectionUrl, compact: true
  });
}

async function loadModelMuseumRoom(roomIndex) {
  if (!isModelMuseum || modelRoomsLoaded.has(roomIndex)) return;
  if (modelRoomLoads.has(roomIndex)) return modelRoomLoads.get(roomIndex);
  const load = (async () => {
    modelRoomsLoaded.add(roomIndex);
    const id = ARTIST_ROOM_ORDER[roomIndex];
    const centerZ = 0;
    const items = MODEL_ARTIST_EXHIBITS[id] || [];
    if (!items.length) {
      createWallSign(lang === "fr" ? "MODÈLES MONET À VENIR" : "MONET 3D MODELS COMING SOON", [0, 2.15, centerZ + 7.86], Math.PI, {
        width: 4.5, height: 0.62, accent: true, compact: true
      });
      return;
    }
    for (let index = 0; index < items.length; index += 1) {
      await addDedicatedArtistModel(items[index], centerZ, index, items.length);
      await new Promise((resolve) => setTimeout(resolve, isQuestBrowser ? 1100 : 120));
    }
  })().finally(() => modelRoomLoads.delete(roomIndex));
  modelRoomLoads.set(roomIndex, load);
  return load;
}

async function addDedicatedArtistModel(item, centerZ, index, count) {
  if (!allowDecorative3DModels) return;
  const gltf = await modelLoader.loadAsync(item.src);
  const display = new THREE.Group();
  const x = count === 1 ? 0 : (index - (count - 1) / 2) * 2.55;
  display.position.set(x, 0, centerZ);
  const pedestal = new THREE.Mesh(
    new THREE.CylinderGeometry(1.25, 1.4, 0.26, 32),
    new THREE.MeshStandardMaterial({ color: 0xc7b898, roughness: 0.72 })
  );
  pedestal.position.y = 0.13;
  display.add(pedestal);
  const model = gltf.scene;
  normalizeGalleryModel(model);
  model.rotation.y = item.rotationY || 0;
  model.position.y += 0.27;
  model.traverse((node) => {
    if (!node.isMesh) return;
    node.castShadow = false;
    node.receiveShadow = true;
  });
  display.add(model);
  const titleText = item.title[lang] || item.title.en;
  const label = makeLabel(titleText);
  label.position.set(0, 0.48, -1.03);
  label.rotation.x = -Math.PI / 5;
  label.rotation.y = Math.PI;
  label.scale.set(1.85, 0.56, 1);
  display.add(label);
  scene.add(display);
  const light = new THREE.SpotLight(0xffe6bd, 0.9, 7, Math.PI / 4.5, 0.5);
  light.position.set(x, 3.8, centerZ - 1.2);
  light.target = display;
  scene.add(light);
  const pseudoExhibit = { painting: { slug: item.src, title: titleText }, modelDisplay: display };
  scene.add(createModelTeleportHotspot(pseudoExhibit, display));
  revealLoadedDisplay(display);
}

function maybeLoadModelMuseumRoom() {
  if (!isModelMuseum) return;
  const roomIndex = Math.max(0, ARTIST_ROOM_ORDER.indexOf(modelArtistId));
  if (!modelRoomsLoaded.has(roomIndex)) void loadModelMuseumRoom(roomIndex);
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
  const lightCount = isLowPowerDevice ? 1 : 4;
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
  return ensureLouvreWallModel({
    src: LOUVRE_FACADE_MODEL,
    name: "louvre-vr-exhibit",
    z: -7.95,
    faceIntoRoom: Math.PI,
    warning: "Louvre facade unavailable."
  });
}

async function ensureLouvreWallModel({ src, name, z, faceIntoRoom, warning }) {
  if (!src) return null;
  if (scene.getObjectByName(name)) return scene.getObjectByName(name);
  return (async () => {
    const gltf = await modelLoader.loadAsync(src);
    const model = gltf.scene;
    model.name = name;
    model.updateMatrixWorld(true);
    let box = new THREE.Box3().setFromObject(model);
    let size = box.getSize(new THREE.Vector3());
    if (size.z > size.x) {
      model.rotation.y = Math.PI / 2;
      model.updateMatrixWorld(true);
      box = new THREE.Box3().setFromObject(model);
      size = box.getSize(new THREE.Vector3());
    }
    model.rotation.y += faceIntoRoom;
    model.updateMatrixWorld(true);
    box = new THREE.Box3().setFromObject(model);
    size = box.getSize(new THREE.Vector3());
    model.scale.setScalar(Math.min(10.5 / Math.max(size.x, 0.001), 3.25 / Math.max(size.y, 0.001)));
    model.updateMatrixWorld(true);
    box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.set(-center.x, -box.min.y, z - center.z);
    model.traverse((node) => {
      if (!node.isMesh) return;
      node.castShadow = false;
      node.receiveShadow = true;
    });
    scene.add(model);
    return model;
  })().catch((error) => {
    console.warn(warning, error);
    return null;
  });
}

function addConnectedRoomNavigation(currentId, centerZ) {
  const others = ARTIST_ROOM_ORDER.filter((id) => id !== currentId);
  const signZ = centerZ + 7.86;
  const roomAccessPosition = [-4.5, 3.62, signZ];
  const productsPosition = [4.5, 3.62, signZ];
  const roomAccessRotation = Math.PI;
  const productsRotation = Math.PI;
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
    [lang === "fr" ? "GALERIE VR PRINCIPALE" : lang === "ar" ? "معرض الواقع الافتراضي الرئيسي" : "MAIN VR GALLERY", `gallery-vr.html?lang=${lang}`],
    [text.livingBook, `book-3d.html?lang=${lang}`],
    [lang === "ar" ? "اسأل دليل ChatGPT" : lang === "fr" ? "DEMANDER AU GUIDE CHATGPT" : "ASK THE CHATGPT GUIDE", makeVirtualGuideUrl(`${ARTIST_ROOMS[currentId].name}'s painting room`)],
    [text.cinemaEnter, `cinema-vr.html?lang=${lang}`],
    [text.modelsRoom, `gallery-vr.html?lang=${lang}&room=models`],
    [text.bedroomRoom, `gallery-vr.html?lang=${lang}&room=bedroom`],
    [text.reimaginedRoom, `gallery-vr.html?lang=${lang}&room=reimagined`],
    [lang === "fr" ? "Musée du Louvre" : lang === "ar" ? "متحف اللوفر" : "Louvre Museum", `gallery-vr.html?lang=${lang}&room=louvre`],
    [text.exitGallery, lang === "ar" ? "index-ar.html" : lang === "fr" ? "index-fr.html" : "index.html"]
  ];
  usefulLinks.forEach(([label, url], index) => {
    createWallSign(label, [productsPosition[0], 3.05 - index * 0.34, productsPosition[2]], productsRotation, {
      width: 3.2,
      height: 0.3,
      exitUrl: url,
      compact: true
    });
  });
}

function addDaVinciDecor(centerZ, material) {
  [-5.8, -2.9, 2.9, 5.8].forEach((x) => {
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
  connectedManifestMap = new Map(printedManifests.map((manifest) => [manifest.slug, manifest]));
  // Load only the arrival room. Other rooms are streamed shortly before the
  // visitor crosses their entrance, on desktop as well as mobile and WebXR.
  await loadConnectedMuseumRoom(connectedStartIndex);
}

async function loadConnectedMuseumRoom(roomIndex) {
  if (!connectedManifestMap || connectedRoomsLoaded.has(roomIndex)) return;
  if (connectedRoomLoads.has(roomIndex)) return connectedRoomLoads.get(roomIndex);
  const load = (async () => {
    connectedRoomsLoaded.add(roomIndex);
    const id = ARTIST_ROOM_ORDER[roomIndex];
    const room = ARTIST_ROOMS[id];
    const centerZ = roomIndex * 16;
    status.textContent = lang === "fr" ? `Chargement de ${room.name}…` : `Loading ${room.name}…`;
    await addArtistEntrancePortrait(id, room, centerZ);
    if (id === "da-vinci" || id === "monet") await addEightMasterpiecesPanel(id, centerZ);
    for (let workIndex = 0; workIndex < room.works.length; workIndex += 1) {
      const manifestSlug = CONNECTED_AUDIO_WORKS[`${id}:${workIndex}`];
      await addConnectedMuseumArtwork(room, room.works[workIndex], centerZ, workIndex, connectedManifestMap.get(manifestSlug));
      await new Promise((resolve) => setTimeout(resolve, isQuestBrowser ? 110 : 20));
    }
  })().finally(() => connectedRoomLoads.delete(roomIndex));
  connectedRoomLoads.set(roomIndex, load);
  return load;
}

async function addEightMasterpiecesPanel(roomId, centerZ) {
  if (eightMasterpiecesPanelsLoaded.has(roomId)) return;
  eightMasterpiecesPanelsLoaded.add(roomId);
  try {
    if (roomId === "da-vinci") {
      await addMuseumInformationPanel(EIGHT_MASTERPIECES_IMAGES[lang], 1.45, centerZ - 7.87, 0, "", {
        maxWidth: 4.45,
        maxHeight: 3.05,
        positionY: 2.2,
        hideLabel: true,
        highDetail: true
      });
    } else {
      await addMuseumInformationPanel(EIGHT_MASTERPIECES_IMAGES[lang], 0, centerZ + 7.87, Math.PI, "", {
        maxWidth: 4.8,
        maxHeight: 3.2,
        positionY: 2.05,
        hideLabel: true,
        highDetail: true
      });
    }
  } catch (error) {
    eightMasterpiecesPanelsLoaded.delete(roomId);
    console.warn(`Eight-masterpieces panel unavailable in ${roomId}.`, error);
  }
}

async function addArtistEntrancePortrait(id, room, centerZ) {
  if (!room.portrait || connectedPortraitsLoaded.has(id)) return;
  connectedPortraitsLoaded.add(id);
  try {
    const texture = await textureLoader.loadAsync(room.portrait);
    optimizeTextureForMobile(texture);
    texture.encoding = THREE.sRGBEncoding;
    texture.minFilter = THREE.LinearFilter;
    const aspect = texture.image.width / texture.image.height;
    const isDaVinciEntrance = id === "da-vinci";
    const height = isDaVinciEntrance ? 1.82 : 1.58;
    const width = height * aspect;
    const portrait = new THREE.Group();
    portrait.name = `${id}-entrance-portrait`;
    portrait.position.set(-4.55, 2.18, centerZ - 7.88);
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(width + 0.16, height + 0.16, 0.08),
      new THREE.MeshStandardMaterial({ color: room.accent, roughness: 0.48, metalness: 0.12 })
    );
    const image = new THREE.Mesh(new THREE.PlaneGeometry(width, height), new THREE.MeshBasicMaterial({ map: texture }));
    image.position.z = 0.046;
    portrait.add(frame, image);
    scene.add(portrait);
  } catch (error) {
    connectedPortraitsLoaded.delete(id);
    console.warn(`Entrance portrait unavailable for ${id}.`, error);
  }
}

async function addMonetFinalWallLogo() {
  try {
    const texture = await textureLoader.loadAsync("assets/varia/artdaci-logo.png");
    optimizeTextureForMobile(texture);
    texture.encoding = THREE.sRGBEncoding;
    texture.minFilter = THREE.LinearFilter;
    const logo = new THREE.Mesh(
      new THREE.PlaneGeometry(0.68, 0.68),
      new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide })
    );
    logo.name = "monet-final-wall-artdaci-logo";
    logo.position.set(0, 4.02, 55.88);
    logo.rotation.y = Math.PI;
    scene.add(logo);
  } catch (error) {
    console.warn("ARTDACI final-wall logo unavailable.", error);
  }
}

function maybeLoadConnectedMuseumRoom() {
  if (!isConnectedMuseum || !connectedManifestMap) return;
  const z = visitor.position.z;
  const roomIndex = THREE.MathUtils.clamp(Math.floor((z + 8) / 16), 0, ARTIST_ROOM_ORDER.length - 1);
  if (!connectedRoomsLoaded.has(roomIndex)) void loadConnectedMuseumRoom(roomIndex);

  // Entrances between rooms are at z=8, 24 and 40. Begin streaming the next
  // room within four metres, leaving time for its paintings to appear.
  const preloadDistance = 4;
  for (let boundaryIndex = 0; boundaryIndex < ARTIST_ROOM_ORDER.length - 1; boundaryIndex += 1) {
    const boundaryZ = 8 + boundaryIndex * 16;
    if (Math.abs(z - boundaryZ) > preloadDistance) continue;
    const adjacentRoom = z < boundaryZ ? boundaryIndex + 1 : boundaryIndex;
    if (!connectedRoomsLoaded.has(adjacentRoom)) void loadConnectedMuseumRoom(adjacentRoom);
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
    const image = new THREE.Mesh(new THREE.PlaneGeometry(width, height), new THREE.MeshBasicMaterial({ map: texture }));
    image.position.z = 0.018;
    artwork.add(image);
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
  if ((!isHandheldMobile && !isQuestBrowser) || !texture?.image) return texture;
  const image = texture.image;
  const width = image.naturalWidth || image.videoWidth || image.width || 0;
  const height = image.naturalHeight || image.videoHeight || image.height || 0;
  const maximum = isQuestBrowser ? 768 : 512;
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
    { size: [2.6, 1.6], position: [8, 3.2, 34], rotationY: Math.PI / 2 },
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
  addLocalMovementHotspots([
    { position: [CINEMA_ROOM_X, 30.1], label: lang === "fr" ? "ENTRÉE" : lang === "ar" ? "المدخل" : "ENTRANCE", yaw: Math.PI, captionRotation: Math.PI },
    { position: [CINEMA_ROOM_X, 32.2], label: lang === "fr" ? "SIÈGES" : lang === "ar" ? "المقاعد" : "SEATING", yaw: Math.PI, captionRotation: Math.PI },
    { position: [CINEMA_ROOM_X, 35.1], label: lang === "fr" ? "ÉCRAN" : lang === "ar" ? "الشاشة" : "SCREEN", yaw: Math.PI, captionRotation: Math.PI },
    { position: [CINEMA_ROOM_X + 4.7, 33.8], label: lang === "fr" ? "MENUS" : lang === "ar" ? "القوائم" : "MENUS", yaw: -Math.PI / 2, captionRotation: Math.PI }
  ]);
}

async function addPaintingsModelsGateway() {
  if (!PAINTINGS_MODELS_GATEWAY) return;
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
    { label: lang === "fr" ? "GALERIE VR" : lang === "ar" ? "معرض الواقع الافتراضي" : "VR GALLERY", url: `gallery-vr.html?lang=${lang}` },
    {
      label: lang === "fr" ? "COLLECTION" : lang === "ar" ? "المجموعة" : "COLLECTION",
      url: lang === "ar" ? "index-ar.html" : lang === "fr" ? "index-fr.html" : "index.html"
    },
    ...["en", "fr", "ar"].filter((code) => code !== lang).map((code) => ({
      label: code === "ar" ? "العربية" : code === "fr" ? "FRANÇAIS" : "ENGLISH",
      url: `cinema-vr.html?lang=${code}`
    }))
  ];
  // Keep navigation in one compact vertical column, away from the music menu.
  destinations.forEach((destination, index) => {
    createWallSign(destination.label, [19.88, 3.35 - index * 0.57, 29.65], -Math.PI / 2, {
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
  table.userData.fallbackTableParts = table.children.slice();

  const book = new THREE.Group();
  book.name = "living-3d-book";
  book.position.set(0, 0.94, 0);
  book.rotation.y = Math.PI - 0.14;
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
  const coverScale = isLowPowerDevice ? 0.5 : 1;
  coverCanvas.width = 1024 * coverScale;
  coverCanvas.height = 720 * coverScale;
  const context = coverCanvas.getContext("2d");
  context.scale(coverScale, coverScale);
  context.fillStyle = "#182f48";
  context.fillRect(0, 0, 1024, 720);
  context.strokeStyle = "#c9a55c";
  context.lineWidth = 28;
  context.strokeRect(34, 34, 1024 - 68, 720 - 68);
  context.fillStyle = "#f4dfaa";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.font = '700 61px "Segoe UI", Tahoma, Arial, sans-serif';
  wrapCanvasText(context, text.livingBook, 512, 310, 810, 82);
  context.font = '700 34px "Segoe UI", Arial, sans-serif';
  context.fillText("ARTDACI", 512, 575);
  const coverTexture = new THREE.CanvasTexture(coverCanvas);
  coverTexture.encoding = THREE.sRGBEncoding;
  coverTexture.anisotropy = isLowPowerDevice ? 1 : renderer.capabilities.getMaxAnisotropy();
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
  hitTarget.position.set(0, 1.02, 0);
  table.add(hitTarget);
  teleportTargets.push(hitTarget);

  [lowerCover, pages, upperCover, spine].forEach((part) => {
    part.castShadow = true;
    part.receiveShadow = true;
  });
  table.add(book);
  // The procedural placeholder is retained only as an invisible interaction
  // target while the real ARTDACI book is loaded.
  book.visible = false;
  openBookTable = table;
  openBookFallback = book;

  const label = makeLabel(text.livingBook);
  label.name = "living-book-label";
  label.position.set(0, 1.2, -0.58);
  label.scale.set(1.55, 0.38, 1);
  table.add(label);
  scene.add(table);
  if (allowDecorative3DModels && !isLowPowerDevice) void ensureLivingBookAssetsLoaded();
}

function ensureLivingBookAssetsLoaded() {
  if (!openBookTable) return Promise.resolve();
  if (!livingBookAssetsPromise) {
    livingBookAssetsPromise = loadLivingBookTableFurniture(openBookTable);
  }
  return livingBookAssetsPromise;
}

function maybeLoadLivingBookAssets() {
  if (!allowDecorative3DModels || !isLowPowerDevice || !openBookTable || livingBookAssetsPromise) return;
  const tablePosition = openBookTable.getWorldPosition(new THREE.Vector3());
  if (tablePosition.distanceTo(getListenerPosition()) < 13) void ensureLivingBookAssetsLoaded();
}

async function loadLivingBookTableFurniture(table) {
  let tabletopY = 0.895;
  try {
    const gltf = await modelLoader.loadAsync(LIVING_BOOK_TABLE_MODEL);
    const furniture = gltf.scene;
    furniture.updateMatrixWorld(true);
    let box = new THREE.Box3().setFromObject(furniture);
    const size = box.getSize(new THREE.Vector3());
    furniture.scale.setScalar(1.65 / Math.max(size.x, size.z, 0.001));
    furniture.updateMatrixWorld(true);
    box = new THREE.Box3().setFromObject(furniture);
    const center = box.getCenter(new THREE.Vector3());
    furniture.position.set(-center.x, -box.min.y, -center.z);
    furniture.traverse((node) => {
      if (!node.isMesh) return;
      node.castShadow = !isQuestBrowser;
      node.receiveShadow = true;
    });
    table.add(furniture);
    table.userData.fallbackTableParts.forEach((part) => { part.visible = false; });
    tabletopY = furniture.position.y + box.max.y;
    const label = table.getObjectByName("living-book-label");
    if (label) label.position.y = tabletopY + 0.32;
  } catch (error) {
    console.warn("Living Book furniture unavailable; using the fallback table.", error);
  }
  await loadLivingBookModel(table, tabletopY);
}

async function loadLivingBookModel(table, tabletopY) {
  try {
    const gltf = await modelLoader.loadAsync(isLowPowerDevice ? LIVING_BOOK_MODEL_LOW_POWER : LIVING_BOOK_MODEL);
    const model = gltf.scene;
    model.name = "living-book-artdaci-model";
    model.rotation.y = Math.PI;
    model.updateMatrixWorld(true);
    let box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    model.scale.setScalar(0.92 / Math.max(size.x, size.z, 0.001));
    model.updateMatrixWorld(true);
    box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    // Keep the lowest vertex almost flush with the tabletop. The tiny offset
    // prevents flickering without making the book appear to float.
    model.position.set(-center.x, tabletopY - box.min.y + 0.002, -center.z);
    model.traverse((node) => {
      if (!node.isMesh) return;
      node.castShadow = !isLowPowerDevice;
      node.receiveShadow = !isLowPowerDevice;
      if (node.material?.map) {
        node.material.map.anisotropy = isLowPowerDevice ? 1 : renderer.capabilities.getMaxAnisotropy();
        node.material.map.needsUpdate = true;
      }
    });
    table.add(model);
  } catch (error) {
    console.warn("The ARTDACI Living Book model could not be loaded.", error);
  }
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
    { id: "vermeer", centerZ: 10, name: lang === "fr" ? "VERMEER — RÉIMAGINÉ" : "VERMEER — REIMAGINED" },
    { id: "van-gogh", centerZ: 22, name: lang === "fr" ? "VAN GOGH — RÉIMAGINÉ" : "VAN GOGH — REIMAGINED" },
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

function addReimaginedPainterRoomDecor() {
  const rooms = [
    { centerZ: 0, depth: 10, wall: 0x4b2719, panel: 0x24150d, floor: 0x4a3321, trim: 0xc79a58 },
    { centerZ: 10, depth: 10, wall: 0x244f72, panel: 0x183247, floor: 0x79552d, trim: 0xe0ad42 },
    { centerZ: 22, depth: 14, wall: 0x245d61, panel: 0x173c3f, floor: 0x514238, trim: 0xc9a96a },
    { centerZ: 34, depth: 10, wall: 0x557063, panel: 0x2f473c, floor: 0x695e42, trim: 0xd7c982 }
  ];
  const cream = new THREE.MeshStandardMaterial({ color: 0xe5d8c2, roughness: 0.94, side: THREE.DoubleSide });

  rooms.forEach((room) => {
    const wallMaterial = new THREE.MeshStandardMaterial({ color: room.wall, roughness: 0.94, side: THREE.DoubleSide });
    const panelMaterial = new THREE.MeshStandardMaterial({ color: room.panel, roughness: 0.76, side: THREE.DoubleSide });
    const trimMaterial = new THREE.MeshStandardMaterial({ color: room.trim, roughness: 0.52, metalness: 0.12 });
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(11.75, room.depth - 0.12),
      new THREE.MeshStandardMaterial({ color: room.floor, roughness: 0.82 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0.012, room.centerZ);
    floor.receiveShadow = true;
    scene.add(floor);

    [-1, 1].forEach((side) => {
      const x = side * 5.985;
      const rotationY = side < 0 ? Math.PI / 2 : -Math.PI / 2;
      const wall = new THREE.Mesh(new THREE.PlaneGeometry(room.depth, 4), wallMaterial);
      wall.position.set(x, 2, room.centerZ);
      wall.rotation.y = rotationY;
      scene.add(wall);
      const panel = new THREE.Mesh(new THREE.PlaneGeometry(room.depth, 1.08), panelMaterial);
      panel.position.set(x - side * 0.008, 0.54, room.centerZ);
      panel.rotation.y = rotationY;
      scene.add(panel);
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.1, room.depth), trimMaterial);
      rail.position.set(x - side * 0.025, 1.1, room.centerZ);
      scene.add(rail);
      for (let offset = -room.depth / 2 + 1.35; offset < room.depth / 2; offset += 2.7) {
        const moulding = new THREE.Mesh(new THREE.BoxGeometry(0.07, 1.0, 0.055), trimMaterial);
        moulding.position.set(x - side * 0.03, 0.55, room.centerZ + offset);
        scene.add(moulding);
      }
    });

    const ceilingInset = new THREE.Mesh(new THREE.PlaneGeometry(7.4, room.depth - 0.45), cream);
    ceilingInset.rotation.x = Math.PI / 2;
    ceilingInset.position.set(0, 3.985, room.centerZ);
    scene.add(ceilingInset);
    [-3.9, 3.9].forEach((x) => {
      const ceilingTrim = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, room.depth - 0.35), trimMaterial);
      ceilingTrim.position.set(x, 3.94, room.centerZ);
      scene.add(ceilingTrim);
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

function navigationMenuPalette(position, options) {
  if (options.peopleMenu || activeRoom === "people") {
    return { background: options.heading ? "#09232b" : options.active ? "#70252d" : "#4b171d", border: "#d9ac58", text: "#fff3df", icon: "#e5b856" };
  }
  if (isCinemaOnly || previewRoom === "cinema") {
    return { background: "#30131d", border: "#d5a454", text: "#fff1dc", icon: "#efbd68" };
  }

  const painterPalettes = {
    "da-vinci": { background: "#4b2719", border: "#d1a15b", text: "#fff1dc", icon: "#e4b96f" },
    "van-gogh": { background: "#173b5a", border: "#e0ad42", text: "#fff4d0", icon: "#f2c44f" },
    vermeer: { background: "#174b50", border: "#c9aa69", text: "#f5ead7", icon: "#ddbd77" },
    monet: { background: "#3d5d50", border: "#d4ca83", text: "#f5f1dc", icon: "#e4d996" }
  };
  let painterId = ARTIST_ROOMS[artistRoomId] ? artistRoomId : null;
  const z = position[2] || 0;
  if (activeRoom === "reimagined") {
    painterId = z < 5 ? "da-vinci" : z < 16 ? "vermeer" : z < 29 ? "van-gogh" : "monet";
  } else if (activeRoom === "paintings" && isConnectedMuseum) {
    painterId = z < 8 ? "da-vinci" : z < 24 ? "vermeer" : z < 40 ? "van-gogh" : "monet";
  }
  if (painterId) return painterPalettes[painterId];

  const roomPalettes = {
    models: { background: "#243b4a", border: "#b9d1d8", text: "#f4fbff", icon: "#d2e4e9" },
    bedroom: { background: "#254b68", border: "#e3ae48", text: "#fff2ce", icon: "#f1c45c" },
    groups: { background: "#51212d", border: "#d2a05d", text: "#fff0de", icon: "#e6b66f" },
    louvre: { background: "#071b36", border: "#c7a25b", text: "#f7ead1", icon: "#dfbd78" }
  };
  return roomPalettes[activeRoom] || { background: "#142c3c", border: "#d2aa62", text: "#fff2df", icon: "#e5bb70" };
}

function formatMenuText(message, options = {}) {
  if (lang === "ar" || !message) return message;
  if (options.mainCategory) return message.toLocaleUpperCase(lang === "fr" ? "fr" : "en");
  if (lang === "fr") {
    return message.replace(/^(\s*)(\p{L})/u, (_, spacing, letter) => `${spacing}${letter.toLocaleUpperCase("fr")}`);
  }
  return message.replace(/(^|[\s—–/])([a-z])/g, (_, prefix, letter) => `${prefix}${letter.toLocaleUpperCase("en")}`);
}

function createWallSign(message, position, rotationY, options = {}) {
  message = formatMenuText(message, options);
  const canvas = document.createElement("canvas");
  const signResolution = options.highDetail ? 1600 : isFiveMuseumsWing && isLowPowerDevice ? 1280 : isLowPowerDevice ? 960 : 1600;
  canvas.width = signResolution;
  canvas.height = Math.round(signResolution * 0.3);
  const canvasScale = canvas.width / 1600;
  const context = canvas.getContext("2d");
  const isExit = Boolean(options.exitUrl);
  const isTravel = Boolean(options.destination);
  const hasMenuEffect = options.peopleMenu || isExit || isTravel;
  const menuPalette = navigationMenuPalette(position, options);
  context.fillStyle = hasMenuEffect
    ? menuPalette.background
    : isExit ? "#712832" : isTravel ? "#0b5064" : options.accent ? "#1b354a" : "#0f1b26";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = hasMenuEffect ? menuPalette.border : "#e0bd73";
  context.lineWidth = (hasMenuEffect ? 8 : 14) * canvasScale;
  context.strokeRect(7 * canvasScale, 7 * canvasScale, canvas.width - 14 * canvasScale, canvas.height - 14 * canvasScale);
  if (hasMenuEffect) {
    context.lineWidth = 3 * canvasScale;
    context.strokeRect(24 * canvasScale, 24 * canvasScale, canvas.width - 48 * canvasScale, canvas.height - 48 * canvasScale);
  }
  context.fillStyle = hasMenuEffect ? menuPalette.text : "#ffffff";
  context.textAlign = "center";
  context.textBaseline = "middle";
  let wallFontSize = (options.compact
    ? (message.length > 28 ? 60 : message.length > 18 ? 68 : 76)
    : (message.length > 28 ? 88 : message.length > 18 ? 104 : 126)) * canvasScale;
  const fontFamily = hasMenuEffect ? 'Georgia, "Times New Roman", serif' : '"Segoe UI Variable", "Segoe UI", Arial, sans-serif';
  context.font = `${hasMenuEffect ? 600 : 700} ${wallFontSize}px ${fontFamily}`;
  const iconSpace = options.icon ? 250 * canvasScale : 0;
  while (context.measureText(message).width > canvas.width - (110 * canvasScale) - iconSpace) {
    wallFontSize = Math.max(wallFontSize - 4 * canvasScale, 58 * canvasScale);
    context.font = `${hasMenuEffect ? 600 : 700} ${wallFontSize}px ${fontFamily}`;
    if (wallFontSize === 58 * canvasScale) break;
  }
  context.fillText(message, canvas.width / 2 + (options.icon ? 70 * canvasScale : 0), canvas.height / 2);
  if (options.icon) {
    context.fillStyle = menuPalette.icon;
    context.font = `700 ${118 * canvasScale}px "Segoe UI Symbol", "Segoe UI", sans-serif`;
    context.fillText(options.icon, 155 * canvasScale, canvas.height / 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.encoding = THREE.sRGBEncoding;
  texture.anisotropy = options.highDetail
    ? Math.min(renderer.capabilities.getMaxAnisotropy(), isQuestBrowser ? 4 : 8)
    : isLowPowerDevice ? 1 : renderer.capabilities.getMaxAnisotropy();
  const signMaterial = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: Boolean(options.subtle),
    opacity: options.subtle ? 0.78 : 1,
    depthWrite: !options.subtle
  });
  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(options.width || 3.1, options.height || 0.94),
    signMaterial
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
    createWallSign(lang === "fr" ? "GALERIE VR PRINCIPALE" : lang === "ar" ? "معرض الواقع الافتراضي الرئيسي" : "MAIN VR GALLERY", signPosition(1.4, -0.78), station.rotationY, {
      width: 1.78,
      height: 0.34,
      exitUrl: `gallery-vr.html?lang=${lang}`,
      compact: true
    });
    createWallSign(lang === "fr" ? "SORTIR VERS LA COLLECTION" : lang === "ar" ? "الخروج إلى المجموعة" : "EXIT TO COLLECTION", signPosition(1.4, 0.78), station.rotationY, {
      width: 1.78,
      height: 0.34,
      exitUrl: lang === "ar" ? "index-ar.html" : lang === "fr" ? "index-fr.html" : "index.html",
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

async function addPaintingsGalleryFurniture() {
  if (!allowDecorative3DModels) return;
  for (const item of GALLERY_FURNITURE) {
    try {
      const gltf = await modelLoader.loadAsync(item.src);
      const model = gltf.scene;
      model.updateMatrixWorld(true);
      let box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      model.scale.setScalar(item.maxSize / Math.max(size.x, size.y, size.z, 0.001));
      model.rotation.y = item.rotationY;
      model.updateMatrixWorld(true);
      box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      model.position.set(item.position[0] - center.x, item.position[1] - box.min.y, item.position[2] - center.z);
      model.name = `paintings-room-${item.id}`;
      model.traverse((node) => {
        if (!node.isMesh) return;
        node.castShadow = !isQuestBrowser;
        node.receiveShadow = true;
      });
      scene.add(model);
      if (item.id === "gallery-table") {
        model.updateMatrixWorld(true);
        const placedBox = new THREE.Box3().setFromObject(model);
        void addFurnitureModel({
          src: LIVING_BOOK_MODEL,
          name: "paintings-room-artdaci-book-on-table",
          position: [item.position[0], placedBox.max.y + 0.006, item.position[2]],
          rotationY: item.rotationY + Math.PI,
          maxSize: 0.86
        });
      }
      await new Promise((resolve) => setTimeout(resolve, isQuestBrowser ? 500 : 60));
    } catch (error) {
      console.warn(`Gallery furniture unavailable for ${item.id}.`, error);
    }
  }
}

async function addFurnitureModel({ src, name, position, rotationY = 0, maxSize = 1.6, parent = scene }) {
  if (!allowDecorative3DModels) return null;
  try {
    if (!furnitureSourceCache.has(src)) {
      furnitureSourceCache.set(src, modelLoader.loadAsync(src).then((gltf) => gltf.scene));
    }
    const source = await furnitureSourceCache.get(src);
    const model = source.clone(true);
    model.name = name;
    model.rotation.y = rotationY;
    model.updateMatrixWorld(true);
    let box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    model.scale.setScalar(maxSize / Math.max(size.x, size.y, size.z, 0.001));
    model.updateMatrixWorld(true);
    box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.set(position[0] - center.x, position[1] - box.min.y, position[2] - center.z);
    model.traverse((node) => {
      if (!node.isMesh) return;
      node.castShadow = !isQuestBrowser;
      node.receiveShadow = true;
    });
    parent.add(model);
    return model;
  } catch (error) {
    console.warn(`Furniture unavailable: ${name}`, error);
    return null;
  }
}

async function buildExhibition(paintings) {
  const placements = [
    { position: [-2.2, 2.15, -4.92], rotationY: 0, hotspot: [-2.2, -2.55], visitorYaw: 0, modelPosition: [-3.2, 10.25] },
    { position: [5.92, 2.1, -1.9], rotationY: -Math.PI / 2, hotspot: [3.55, -1.9], visitorYaw: -Math.PI / 2, modelPosition: [0, 10.25] },
    { position: [-5.92, 2.1, -1.9], rotationY: Math.PI / 2, hotspot: [-3.55, -1.9], visitorYaw: Math.PI / 2, modelPosition: [1.4, 10.25] },
    { position: [2.2, 2.15, -4.92], rotationY: 0, hotspot: [2.2, -2.55], visitorYaw: 0, modelPosition: [3.2, 10.25] }
  ];

  void addPaintingsGalleryFurniture();

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
  const roomCenters = { "da-vinci": 0, vermeer: 10, "van-gogh": 22, monet: 34 };
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

  buildPainterPresentationVideos();

  if (!REIMAGINED_ARTWORKS.some((item) => getReimaginedPainter(item) === "monet")) {
    createWallSign(lang === "fr" ? "NOUVELLES ŒUVRES À VENIR" : "MORE REIMAGINED WORKS COMING SOON", [0, 2.15, 38.88], Math.PI, {
      width: 4.8, height: 0.64, accent: true, compact: true
    });
  }
}

function buildPainterPresentationVideos() {
  const roomCenters = { "da-vinci": 0, vermeer: 10, "van-gogh": 22, monet: 34 };
  PAINTER_PRESENTATION_VIDEOS.forEach((item) => {
    const centerZ = roomCenters[item.painter];
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.preload = "metadata";
    video.playsInline = true;
    video.loop = true;
    video.muted = true;
    video.src = item.src;

    const texture = new THREE.VideoTexture(video);
    texture.encoding = THREE.sRGBEncoding;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    const display = new THREE.Group();
    display.name = `${item.painter}-presentation-video`;
    // Keep the central doorway clear: the presentation screen belongs to the
    // left-hand section of each room's exit wall.
    display.position.set(-3.72, 2.32, centerZ + 4.82);
    display.rotation.y = Math.PI;

    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(2.86, 1.82, 0.14),
      new THREE.MeshStandardMaterial({ color: 0xb78b43, roughness: 0.4, metalness: 0.32 })
    );
    display.add(frame);

    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(2.62, 1.48),
      new THREE.MeshBasicMaterial({ map: texture, color: 0xffffff, side: THREE.DoubleSide })
    );
    screen.position.z = 0.081;
    display.add(screen);

    const localizedTitle = item.title[lang] || item.title.en;
    const instruction = lang === "ar" ? "اختر للتشغيل أو الإيقاف" : lang === "fr" ? "Sélectionner pour lire ou mettre en pause" : "Select to play or pause";
    const label = makeLabel(`${localizedTitle}\n${instruction}`);
    label.position.set(0, -1.12, 0.09);
    label.scale.set(2.82, 0.56, 1);
    display.add(label);
    scene.add(display);

    const exhibit = {
      title: item.title,
      src: item.src,
      display,
      screen,
      video,
      sound: null,
      cinema: false
    };
    screen.userData.videoExhibit = exhibit;
    galleryVideoExhibits.push(exhibit);
    galleryVideoScreens.push(screen);
    teleportTargets.push(screen);
  });
}

async function addReimaginedEntranceMonaLisa() {
  const gltf = await modelLoader.loadAsync("assets/artists/leonardo-da-vinci/artworks/mona-lisa/models/mona-lisa-standing-c.glb");
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

function createReimaginedHotspot(_title, placement, artwork) {
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

  return group;
}

function buildReimaginedVideoExhibits() {
  const cinemaPlaylist = getCinemaVideoLibrary();
  const cinema = new THREE.Group();
  cinema.name = "artdaci-cinema";
  cinema.position.x = CINEMA_ROOM_X;
  cinemaAudienceRoot = cinema;

  const darkMaterial = new THREE.MeshStandardMaterial({ color: 0x0d1015, roughness: 0.62 });
  const brassMaterial = new THREE.MeshStandardMaterial({ color: 0x9b5f1d, roughness: 0.38, metalness: 0.42 });

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

  const title = makeCinemaPlaqueLabel(text.cinema);
  title.position.set(0, 3.73, 36.22);
  title.scale.set(3.5, 0.58, 1);
  cinema.add(title);

  const exhibit = {
    title: cinemaPlaylist[0].title,
    src: cinemaPlaylist[0].src,
    display: television,
    screen,
    video,
    sound: null,
    cinema: true,
    playlistIndex: 0,
    playlist: cinemaPlaylist
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
  cinemaPlaylist.forEach((item, index) => {
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
      material: brassMaterial,
      compact: true
    });
    cinema.add(button);
  });

  const musicHeading = makeCinemaPlaqueLabel(lang === "ar" ? "موسيقى السينما" : lang === "fr" ? "MUSIQUE DU CINÉMA" : "CINEMA MUSIC");
  musicHeading.position.set(5.77, 3.72, 34.65);
  musicHeading.rotation.y = -Math.PI / 2;
  musicHeading.scale.set(1.65, 0.42, 1);
  cinema.add(musicHeading);
  const musicSpacing = Math.min(0.4, 2.35 / Math.max(1, CINEMA_MUSIC_LIBRARY.length - 1));
  CINEMA_MUSIC_LIBRARY.forEach((item, index) => {
    const button = createCinemaButton(`${index + 1}. ${item.title}`, {
      type: "music-select",
      value: index,
      position: [5.76, 3.34 - index * musicSpacing, 34.65],
      rotationY: -Math.PI / 2,
      width: 1.9,
      height: Math.min(0.34, musicSpacing * 0.82),
      material: brassMaterial
    });
    cinema.add(button);
  });
  [
    { label: lang === "fr" ? "PRÉCÉDENT" : lang === "ar" ? "السابق" : "PREVIOUS", type: "music-previous" },
    { label: text.cinemaBack, type: "music-back" },
    { label: lang === "fr" ? "LECTURE / PAUSE" : lang === "ar" ? "تشغيل / إيقاف" : "PLAY / PAUSE", type: "music-toggle" },
    { label: text.cinemaForward, type: "music-forward" },
    { label: lang === "fr" ? "ARRÊTER" : lang === "ar" ? "إيقاف" : "STOP", type: "music-stop" },
    { label: lang === "fr" ? "SUIVANT" : lang === "ar" ? "التالي" : "NEXT", type: "music-next" }
  ].forEach((control, index) => {
    const button = createCinemaButton(control.label, {
      type: control.type,
      position: [5.76, 0.94 - index * 0.17, 34.65],
      rotationY: -Math.PI / 2,
      width: 1.9,
      height: 0.15,
      material: brassMaterial,
      compact: true
    });
    cinema.add(button);
  });

  const cinemaAudio = getCinemaAudioLibrary();
  const audioHeading = makeCinemaPlaqueLabel(lang === "ar" ? "البرامج الصوتية" : lang === "fr" ? "PROGRAMMES AUDIO" : "AUDIO PROGRAMS");
  // The Egyptian gateway occupies the middle of this wall. Place audio on
  // the clear wall section beside it instead of drawing controls over it.
  audioHeading.position.set(-5.77, 3.72, 30.55);
  audioHeading.rotation.y = Math.PI / 2;
  audioHeading.scale.set(1.65, 0.42, 1);
  cinema.add(audioHeading);
  cinemaAudio.forEach((item, index) => {
    const button = createCinemaButton(`${index + 1}. ${item.title}`, {
      type: "audio-select", value: index,
      position: [-5.76, 3.3 - index * 0.42, 30.55], rotationY: Math.PI / 2,
      width: 1.9, height: 0.34, material: brassMaterial
    });
    cinema.add(button);
  });
  [
    [text.cinemaPrevious, "audio-previous"], [text.cinemaBack, "audio-back"],
    [text.cinemaPlayPause, "audio-toggle"], [text.cinemaForward, "audio-forward"],
    [text.cinemaNext, "audio-next"], [lang === "fr" ? "ARRÊTER" : lang === "ar" ? "إيقاف" : "STOP", "audio-stop"]
  ].forEach(([label, type], index) => {
    const button = createCinemaButton(label, {
      type, position: [-5.76, 1.25 - index * 0.22, 30.55], rotationY: Math.PI / 2,
      width: 1.9, height: 0.19, material: brassMaterial, compact: true
    });
    cinema.add(button);
  });

  const libraryHeading = makeCinemaPlaqueLabel(text.cinemaLibrary);
  libraryHeading.position.set(3.75, 3.72, 35.98);
  libraryHeading.scale.set(1.65, 0.42, 1);
  cinema.add(libraryHeading);
  const cinemaLibrarySpacing = Math.min(0.42, 2.8 / Math.max(1, cinemaPlaylist.length - 1));
  cinemaPlaylist.forEach((item, index) => {
    const button = createCinemaButton(`${index + 1}. ${localizedCinemaTitle(item)}`, {
      type: "select",
      value: index,
      position: [3.75, 3.35 - index * cinemaLibrarySpacing, 35.98],
      width: 1.85,
      height: Math.min(0.36, cinemaLibrarySpacing * 0.84),
      material: brassMaterial
    });
    cinema.add(button);
  });

  [-3.75, 3.75].forEach((x) => {
    const console = new THREE.Mesh(new THREE.BoxGeometry(2.18, 3.42, 0.18), darkMaterial);
    console.position.set(x, 2.02, 36.2);
    cinema.add(console);
  });

  addCinemaViewingSpot(cinema);
  void addFurnitureModel({
    src: GALLERY_FURNITURE.find((item) => item.id === "armchair").src,
    name: "cinema-armchair",
    position: [3.72, 0, 29.72],
    rotationY: 0,
    maxSize: 0.95,
    parent: cinema
  });
  addCinemaSofaModel(cinema).catch((error) => {
    console.warn("The cinema sofa model could not be loaded.", error);
  });
  void addFurnitureModel({
    src: CINEMA_GATEWAY_MODEL,
    name: "cinema-egypt-gateway",
    position: [-5.92, 0, 34],
    rotationY: Math.PI * 1.5,
    maxSize: 3.05,
    parent: cinema
  });
  scene.add(cinema);
  setCinemaVideo(exhibit, 0, false);
  updateGalleryVideoButtons();
}

function localizedCinemaTitle(item) {
  return typeof item.title === "string" ? item.title : item.title?.[lang] || item.title?.en || "";
}

function paintCinemaPlaque(context, width, height, label, heading = false) {
  label = lang === "ar" ? label : label.toLocaleUpperCase(lang === "fr" ? "fr" : "en");
  const brass = context.createLinearGradient(0, 0, width, height);
  brass.addColorStop(0, "#d6a24d");
  brass.addColorStop(0.45, "#b87825");
  brass.addColorStop(1, "#7b4313");
  context.fillStyle = brass;
  context.fillRect(0, 0, width, height);

  context.strokeStyle = "#4c280b";
  context.lineWidth = 12;
  context.strokeRect(7, 7, width - 14, height - 14);
  context.strokeStyle = "#e3b760";
  context.lineWidth = 5;
  context.strokeRect(19, 19, width - 38, height - 38);
  context.strokeStyle = "rgba(62, 28, 4, .55)";
  context.lineWidth = 3;
  context.strokeRect(29, 29, width - 58, height - 58);

  [[38, 38], [width - 38, 38], [38, height - 38], [width - 38, height - 38]].forEach(([x, y]) => {
    const stud = context.createRadialGradient(x - 4, y - 4, 2, x, y, 14);
    stud.addColorStop(0, "#f1ca77");
    stud.addColorStop(0.45, "#a6651f");
    stud.addColorStop(1, "#3a1c06");
    context.fillStyle = stud;
    context.beginPath();
    context.arc(x, y, 14, 0, Math.PI * 2);
    context.fill();
  });

  context.fillStyle = "#211307";
  context.textAlign = "center";
  context.textBaseline = "middle";
  let size = heading ? 82 : label.length > 30 ? 34 : label.length > 18 ? 40 : 48;
  const family = lang === "ar" ? '"Segoe UI", Tahoma, Arial, sans-serif' : 'Georgia, "Times New Roman", serif';
  context.font = `700 ${size}px ${family}`;
  while (context.measureText(label).width > width - 110 && size > 28) {
    size -= 2;
    context.font = `700 ${size}px ${family}`;
  }
  context.fillText(label, width / 2, height / 2 + 2);
}

function makeCinemaPlaqueLabel(message) {
  const canvas = document.createElement("canvas");
  const scale = isLowPowerDevice ? 0.5 : 1;
  canvas.width = 1200 * scale;
  canvas.height = 260 * scale;
  const context = canvas.getContext("2d");
  context.scale(scale, scale);
  paintCinemaPlaque(context, 1200, 260, message, true);
  const texture = new THREE.CanvasTexture(canvas);
  texture.encoding = THREE.sRGBEncoding;
  return new THREE.Mesh(
    new THREE.PlaneGeometry(1.28, 0.32),
    new THREE.MeshBasicMaterial({ map: texture })
  );
}

function createCinemaButton(label, options) {
  const canvas = document.createElement("canvas");
  const logicalWidth = 900;
  const logicalHeight = 220;
  const buttonScale = isLowPowerDevice ? 0.5 : 1;
  canvas.width = logicalWidth * buttonScale;
  canvas.height = logicalHeight * buttonScale;
  const context = canvas.getContext("2d");
  context.scale(buttonScale, buttonScale);
  paintCinemaPlaque(context, logicalWidth, logicalHeight, label);
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
  button.rotation.y = options.rotationY || 0;
  button.userData.cinemaAction = { type: options.type, value: options.value };
  cinemaControlMeshes.push(button);
  teleportTargets.push(button);
  return button;
}

async function addCinemaSofaModel(cinema) {
  if (cinemaSofaLoaded) return;
  if (!CINEMA_SOFA_MODEL) return;
  cinemaSofaLoaded = true;
  const gltf = await modelLoader.loadAsync(CINEMA_SOFA_MODEL);
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
  sofa.rotation.y += Math.PI;
  sofa.updateMatrixWorld(true);
  box = new THREE.Box3().setFromObject(sofa);
  size = box.getSize(new THREE.Vector3());
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
      src: "assets/artists/leonardo-da-vinci/artworks/mona-lisa/models/davinci-monalisa-c.glb",
      name: "cinema-sofa-left-davinci-mona-lisa",
      x: -3.15,
      y: 0,
      z: 29.75,
      height: 1.66,
      rotationY: Math.atan2(3.15, 6.55)
    },
    {
      src: "assets/artists/johannes-vermeer/artworks/girl-with-a-pearl-earring/models/vermeer-girl-with-a-pearl-earring-sitting-c.glb",
      name: "cinema-sofa-left-vermeer",
      x: -2.05,
      y: 0,
      z: 29.75,
      height: 1.28,
      rotationY: Math.atan2(2.05, 6.55)
    },
    {
      src: "assets/artists/vincent-van-gogh/profile/models/standing.glb",
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
  if (!allowDecorative3DModels || isIOSDevice) return;
  if (!cinemaAudienceRoot || cinemaAudienceLoadPromise || performance.now() < cinemaAudienceReadyAt) return;
  const dx = visitor.position.x - CINEMA_ROOM_X;
  const dz = visitor.position.z - 34;
  if (dx * dx + dz * dz > 56.25) return;
  cinemaAudienceLoadPromise = (async () => {
    if (!cinemaSofaLoaded) {
      try {
        await addCinemaSofaModel(cinemaAudienceRoot);
      } catch (error) {
        console.warn("The cinema sofa model could not be loaded.", error);
      }
      await new Promise((resolve) => setTimeout(resolve, isQuestBrowser ? 1200 : 180));
    }
    await addCinemaAudienceModels(cinemaAudienceRoot);
  })();
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
  musicPlayer.pause();
  const playlist = exhibit.playlist || CINEMA_VIDEO_LIBRARY;
  const item = playlist[(index + playlist.length) % playlist.length];
  const logicalMuted = exhibit.video.muted;
  exhibit.video.pause();
  if (exhibit.sound) {
    exhibit.sound.pause();
    exhibit.sound.remove();
    exhibit.sound = null;
  }
  exhibit.playlistIndex = (index + playlist.length) % playlist.length;
  exhibit.title = item.title;
  exhibit.src = item.src;
  const companionAudioSrc = lang === "ar" && item.audioSrcAr
    ? item.audioSrcAr
    : lang === "fr" && item.audioSrcFr
      ? item.audioSrcFr
      : item.audioSrc;
  if (isQuestBrowser && !autoplay) {
    exhibit.video.removeAttribute("src");
    exhibit.video.dataset.pendingSrc = item.src;
  } else {
    exhibit.video.src = item.src;
    delete exhibit.video.dataset.pendingSrc;
  }
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
  if (action.type.startsWith("music-")) {
    runCinemaMusicAction(action);
    return;
  }
  if (action.type.startsWith("audio-")) {
    runCinemaAudioAction(action);
    return;
  }
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

function setCinemaMusic(index, autoplay = true) {
  const item = CINEMA_MUSIC_LIBRARY[(index + CINEMA_MUSIC_LIBRARY.length) % CINEMA_MUSIC_LIBRARY.length];
  cinemaMusicIndex = (index + CINEMA_MUSIC_LIBRARY.length) % CINEMA_MUSIC_LIBRARY.length;
  galleryVideoExhibits.forEach((videoExhibit) => videoExhibit.video.pause());
  narrationPlayer.pause();
  stopRoomAmbience();
  if (musicPlayer.src !== new URL(item.src, location.href).href) {
    musicPlayer.src = item.src;
    musicPlayer.load();
  }
  musicPlayer.currentTime = 0;
  if (musicSelect) musicSelect.value = item.src;
  if (autoplay) musicPlayer.play().catch((error) => console.warn("Cinema music is waiting for a visitor gesture.", error));
  status.textContent = `${lang === "fr" ? "Musique du cinéma" : lang === "ar" ? "موسيقى السينما" : "Cinema music"}: ${item.title}`;
}

function runCinemaMusicAction(action) {
  if (!CINEMA_MUSIC_LIBRARY.length) return;
  if (action.type === "music-select") setCinemaMusic(Number(action.value));
  if (action.type === "music-previous") setCinemaMusic(cinemaMusicIndex - 1);
  if (action.type === "music-next") setCinemaMusic(cinemaMusicIndex + 1);
  if (action.type === "music-stop") stopLibraryAudio("music");
  if (action.type === "music-toggle") {
    if (!musicPlayer.src) setCinemaMusic(cinemaMusicIndex);
    else if (musicPlayer.paused) musicPlayer.play().catch(() => {});
    else musicPlayer.pause();
  }
  if (action.type === "music-back") seekLibraryAudio("music", -10);
  if (action.type === "music-forward") seekLibraryAudio("music", 10);
}

function runCinemaAudioAction(action) {
  const library = getCinemaAudioLibrary();
  if (!library.length) return;
  if (action.type === "audio-select") {
    narrationSelect.value = library[Number(action.value)].src;
    stopLibraryAudio("audio");
    void toggleLibraryAudio("audio");
  }
  if (action.type === "audio-previous") stepLibraryAudio("audio", -1);
  if (action.type === "audio-next") stepLibraryAudio("audio", 1);
  if (action.type === "audio-back") seekLibraryAudio("audio", -10);
  if (action.type === "audio-forward") seekLibraryAudio("audio", 10);
  if (action.type === "audio-toggle") void toggleLibraryAudio("audio");
  if (action.type === "audio-stop") stopLibraryAudio("audio");
}

async function toggleGalleryVideo(exhibit) {
  exhibit = exhibit || activeGalleryVideo || getNearestGalleryVideo();
  if (!exhibit?.video) return;
  if (exhibit.video.dataset.pendingSrc) {
    exhibit.video.src = exhibit.video.dataset.pendingSrc;
    delete exhibit.video.dataset.pendingSrc;
    exhibit.video.load();
  }
  activeGalleryVideo = exhibit;
  musicPlayer.pause();
  narrationPlayer.pause();
  galleryVideoExhibits.forEach((item) => {
    if (item !== exhibit) {
      item.video.muted = true;
      if (item.sound) {
        item.sound.muted = true;
        item.sound.pause();
      }
      // Only one gallery video should decode at a time. This is especially
      // important now that every painter room has an optional presentation.
      if (!item.video.paused) item.video.pause();
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
  if (!allowDecorative3DModels) return;
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

function makeLabel(message, options = {}) {
  message = formatMenuText(message, options);
  const canvas = document.createElement("canvas");
  const logicalWidth = 1600;
  const logicalHeight = 400;
  const labelScale = options.highDetail ? 1 : isLowPowerDevice ? 0.6 : 1;
  canvas.width = logicalWidth * labelScale;
  canvas.height = logicalHeight * labelScale;
  const context = canvas.getContext("2d");
  context.scale(labelScale, labelScale);
  context.fillStyle = "#101923";
  context.fillRect(0, 0, logicalWidth, logicalHeight);
  context.strokeStyle = "#d3ae61";
  context.lineWidth = 10;
  context.strokeRect(6, 6, logicalWidth - 12, logicalHeight - 12);
  context.fillStyle = "#f8fbff";
  context.textAlign = "center";
  const lines = message.split("\n");
  let titleSize = 84;
  context.font = `650 ${titleSize}px "Segoe UI Variable", "Segoe UI", Arial, sans-serif`;
  while (context.measureText(lines[0]).width > logicalWidth - 100 && titleSize > 54) {
    titleSize -= 4;
    context.font = `650 ${titleSize}px "Segoe UI Variable", "Segoe UI", Arial, sans-serif`;
  }
  context.fillText(lines[0], logicalWidth / 2, lines[1] ? 158 : 220);
  context.font = '550 54px "Segoe UI Variable", "Segoe UI", Arial, sans-serif';
  context.fillStyle = "#c8d5df";
  context.fillText(lines[1] || "", logicalWidth / 2, 278);

  const texture = new THREE.CanvasTexture(canvas);
  texture.encoding = THREE.sRGBEncoding;
  texture.anisotropy = isLowPowerDevice ? 1 : renderer.capabilities.getMaxAnisotropy();
  return new THREE.Mesh(
    new THREE.PlaneGeometry(1.28, 0.32),
    new THREE.MeshBasicMaterial({ map: texture })
  );
}

function makePeopleVideoCaption(title, width = 3.15) {
  const canvas = document.createElement("canvas");
  const logicalWidth = 1600;
  const logicalHeight = 360;
  const scale = isLowPowerDevice ? 0.65 : 1;
  canvas.width = logicalWidth * scale;
  canvas.height = logicalHeight * scale;
  const context = canvas.getContext("2d");
  context.scale(scale, scale);

  const background = context.createLinearGradient(0, 0, logicalWidth, logicalHeight);
  background.addColorStop(0, "#102c30");
  background.addColorStop(1, "#08191d");
  context.fillStyle = background;
  context.fillRect(0, 0, logicalWidth, logicalHeight);
  context.strokeStyle = "#d5ad62";
  context.lineWidth = 10;
  context.strokeRect(7, 7, logicalWidth - 14, logicalHeight - 14);
  context.strokeStyle = "rgba(255, 235, 190, .35)";
  context.lineWidth = 3;
  context.strokeRect(24, 24, logicalWidth - 48, logicalHeight - 48);

  const displayTitle = lang === "ar" ? title : title.toLocaleUpperCase(lang === "fr" ? "fr" : "en");
  const prompt = lang === "ar"
    ? "اختر الشاشة للتشغيل أو الإيقاف المؤقت"
    : lang === "fr"
      ? "SÉLECTIONNEZ L’ÉCRAN POUR LIRE OU METTRE EN PAUSE"
      : "SELECT THE SCREEN TO PLAY OR PAUSE";
  const family = lang === "ar" ? '"Segoe UI", Tahoma, Arial, sans-serif' : 'Georgia, "Times New Roman", serif';
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillStyle = "#fff8e9";
  let titleSize = 68;
  context.font = `700 ${titleSize}px ${family}`;
  while (context.measureText(displayTitle).width > logicalWidth - 150 && titleSize > 42) {
    titleSize -= 3;
    context.font = `700 ${titleSize}px ${family}`;
  }
  context.fillText(displayTitle, logicalWidth / 2, 142);
  context.fillStyle = "#e5c47f";
  context.font = `600 38px ${lang === "ar" ? family : 'Inter, "Segoe UI", Arial, sans-serif'}`;
  context.fillText(prompt, logicalWidth / 2, 255);

  const texture = new THREE.CanvasTexture(canvas);
  texture.encoding = THREE.sRGBEncoding;
  texture.anisotropy = isLowPowerDevice ? 2 : renderer.capabilities.getMaxAnisotropy();
  return new THREE.Mesh(
    new THREE.PlaneGeometry(width, 0.64),
    new THREE.MeshBasicMaterial({ map: texture })
  );
}

function makeInformationPanel(painting, title) {
  const canvas = document.createElement("canvas");
  const logicalWidth = 1800;
  const logicalHeight = 780;
  const panelScale = isLowPowerDevice ? 0.4 : 1;
  canvas.width = logicalWidth * panelScale;
  canvas.height = logicalHeight * panelScale;
  const context = canvas.getContext("2d");
  context.scale(panelScale, panelScale);
  context.fillStyle = "#0f1822";
  context.fillRect(0, 0, logicalWidth, logicalHeight);
  context.strokeStyle = "#d3ae61";
  context.lineWidth = 10;
  context.strokeRect(7, 7, logicalWidth - 14, logicalHeight - 14);

  context.textAlign = "left";
  context.fillStyle = "#e4bd6b";
  context.font = '650 62px "Segoe UI Variable", "Segoe UI", Arial, sans-serif';
  context.fillText(`${painting.artist?.name || ""} · ${painting.date || ""}`, 80, 122);

  context.fillStyle = "#f4f7fa";
  context.font = '500 54px "Segoe UI Variable", "Segoe UI", Arial, sans-serif';
  const body = PAINTING_INFO[lang]?.[painting.slug] || painting.texts?.curatorInsight || "";
  drawWrappedText(context, body, 80, 245, logicalWidth - 160, 72, 7);

  const texture = new THREE.CanvasTexture(canvas);
  texture.encoding = THREE.sRGBEncoding;
  texture.anisotropy = isLowPowerDevice ? 1 : renderer.capabilities.getMaxAnisotropy();
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

function updateGazeNavigation(now) {
  if (!currentSession) {
    gazeReticle.visible = false;
    gazeTarget = null;
    gazeBlockedTarget = null;
    return;
  }

  // A controller remains the primary input when present. Gaze automatically
  // becomes available for hand-only or completely controller-free sessions.
  const hasPhysicalController = [...currentSession.inputSources].some((source) => source.gamepad && !source.hand);
  if (hasPhysicalController) {
    gazeReticle.visible = false;
    gazeTarget = null;
    return;
  }

  gazeReticle.visible = true;
  const xrCamera = renderer.xr.getCamera(camera);
  const origin = xrCamera.getWorldPosition(new THREE.Vector3());
  const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(xrCamera.getWorldQuaternion(new THREE.Quaternion())).normalize();
  teleportRaycaster.set(origin, direction);
  const hit = teleportRaycaster.intersectObjects(teleportTargets, false)[0];
  const nextTarget = hit?.object || null;

  if (!nextTarget) {
    gazeTarget = null;
    gazeBlockedTarget = null;
    gazeReticleMaterial.color.set(0xd4aa5c);
    gazeReticle.scale.setScalar(1);
    return;
  }

  if (nextTarget === gazeBlockedTarget) {
    gazeReticleMaterial.color.set(0x77b99a);
    gazeReticle.scale.setScalar(1);
    return;
  }

  if (nextTarget !== gazeTarget) {
    gazeTarget = nextTarget;
    gazeTargetStartedAt = now;
  }
  const progress = THREE.MathUtils.clamp((now - gazeTargetStartedAt) / GAZE_DWELL_MS, 0, 1);
  gazeReticleMaterial.color.setRGB(
    THREE.MathUtils.lerp(0.83, 0.36, progress),
    THREE.MathUtils.lerp(0.67, 0.9, progress),
    THREE.MathUtils.lerp(0.36, 0.72, progress)
  );
  gazeReticle.scale.setScalar(1 + progress * 0.55);
  if (progress >= 1) {
    gazeBlockedTarget = nextTarget;
    gazeTarget = null;
    activateInteractionHit(hit);
  }
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
  narrationToggleButton?.addEventListener("click", () => toggleLibraryAudio("audio"));
  narrationStopButton?.addEventListener("click", () => stopLibraryAudio("audio"));
  musicToggleButton?.addEventListener("click", () => toggleLibraryAudio("music"));
  musicStopButton?.addEventListener("click", () => stopLibraryAudio("music"));
  narrationSelect?.addEventListener("change", () => stopLibraryAudio("audio"));
  musicSelect?.addEventListener("change", () => stopLibraryAudio("music"));
  narrationPreviousButton?.addEventListener("click", () => stepLibraryAudio("audio", -1));
  narrationNextButton?.addEventListener("click", () => stepLibraryAudio("audio", 1));
  narrationBackButton?.addEventListener("click", () => seekLibraryAudio("audio", -10));
  narrationForwardButton?.addEventListener("click", () => seekLibraryAudio("audio", 10));
  musicPreviousButton?.addEventListener("click", () => stepLibraryAudio("music", -1));
  musicNextButton?.addEventListener("click", () => stepLibraryAudio("music", 1));
  musicBackButton?.addEventListener("click", () => seekLibraryAudio("music", -10));
  musicForwardButton?.addEventListener("click", () => seekLibraryAudio("music", 10));
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

function configurePeopleMediaLibrary() {
  if (!narrationSelect || !musicSelect) return;
  const roomId = PEOPLE_ROOM_CONFIG[artistRoomId] ? artistRoomId : "da-vinci";
  const painterName = (id) => PEOPLE_ROOM_CONFIG[id]?.name?.[lang] || PEOPLE_ROOM_CONFIG[id]?.name?.en || id;
  const collect = (kind) => {
    if (isCinemaOnly && kind === "music") return CINEMA_MUSIC_LIBRARY;
    if (!isCinemaOnly) return (PEOPLE_MEDIA_LIBRARY[roomId]?.[kind] || [])
      .filter((item) => !item.lang || item.lang === lang)
      .map((item) => ({ ...item, painter: roomId }));
    return Object.entries(PEOPLE_MEDIA_LIBRARY).flatMap(([painter, library]) => (library[kind] || [])
      .filter((item) => !item.lang || item.lang === lang)
      .map((item) => ({ ...item, painter })));
  };
  const populate = (select, items) => {
    select.innerHTML = "";
    items.forEach((item, index) => {
      const option = document.createElement("option");
      option.value = item.src;
      option.textContent = `${index + 1}. ${isCinemaOnly ? `${painterName(item.painter)} — ` : ""}${item.title}`;
      select.appendChild(option);
    });
    select.disabled = !items.length;
  };
  populate(narrationSelect, collect("audio"));
  populate(musicSelect, collect("music"));
  const copy = lang === "fr"
    ? { audio: "Récits audio", music: "Musiques", playAudio: "Lire le récit", playMusic: "Lire la musique", stop: "Arrêter" }
    : lang === "ar"
      ? { audio: "قصص صوتية", music: "موسيقى", playAudio: "تشغيل القصة", playMusic: "تشغيل الموسيقى", stop: "إيقاف" }
      : { audio: "Audio stories", music: "Music", playAudio: "Play audio", playMusic: "Play music", stop: "Stop" };
  document.getElementById("gallery-narration-label").textContent = copy.audio;
  document.getElementById("gallery-music-label").textContent = copy.music;
  narrationToggleButton.textContent = copy.playAudio;
  musicToggleButton.textContent = copy.playMusic;
  narrationStopButton.textContent = copy.stop;
  musicStopButton.textContent = copy.stop;
  const transport = lang === "fr"
    ? { previous: "Précédent", next: "Suivant", back: "Reculer", forward: "Avancer" }
    : lang === "ar"
      ? { previous: "السابق", next: "التالي", back: "رجوع", forward: "تقديم" }
      : { previous: "Previous", next: "Next", back: "Rewind", forward: "Forward" };
  [narrationPreviousButton, musicPreviousButton].forEach((button) => { if (button) button.textContent = transport.previous; });
  [narrationNextButton, musicNextButton].forEach((button) => { if (button) button.textContent = transport.next; });
  [narrationBackButton, musicBackButton].forEach((button) => { if (button) button.textContent = transport.back; });
  [narrationForwardButton, musicForwardButton].forEach((button) => { if (button) button.textContent = transport.forward; });
}

async function toggleLibraryAudio(kind) {
  const isMusic = kind === "music";
  const player = isMusic ? musicPlayer : narrationPlayer;
  const other = isMusic ? narrationPlayer : musicPlayer;
  const select = isMusic ? musicSelect : narrationSelect;
  const button = isMusic ? musicToggleButton : narrationToggleButton;
  if (!select?.value) return;
  galleryVideoExhibits.forEach((exhibit) => exhibit.video.pause());
  stopRoomAmbience();
  other.pause();
  if (player.src && !player.paused) {
    player.pause();
  } else {
    if (player.src !== new URL(select.value, location.href).href) {
      player.src = select.value;
      player.load();
    }
    await player.play().catch((error) => console.warn("Audio playback is waiting for a visitor gesture.", error));
  }
  updateLibraryAudioButtons();
  button.classList.toggle("active", !player.paused);
}

function stopLibraryAudio(kind) {
  const player = kind === "music" ? musicPlayer : narrationPlayer;
  player.pause();
  player.currentTime = 0;
  updateLibraryAudioButtons();
}

function stepLibraryAudio(kind, direction) {
  const select = kind === "music" ? musicSelect : narrationSelect;
  if (!select?.options.length) return;
  select.selectedIndex = (select.selectedIndex + direction + select.options.length) % select.options.length;
  stopLibraryAudio(kind);
  void toggleLibraryAudio(kind);
}

function seekLibraryAudio(kind, seconds) {
  const player = kind === "music" ? musicPlayer : narrationPlayer;
  if (!player.src) return;
  const duration = Number.isFinite(player.duration) ? player.duration : Infinity;
  player.currentTime = THREE.MathUtils.clamp(player.currentTime + seconds, 0, duration);
}

function updateLibraryAudioButtons() {
  const labels = lang === "fr"
    ? { audio: "Lire le récit", music: "Lire la musique", pause: "Pause" }
    : lang === "ar"
      ? { audio: "تشغيل القصة", music: "تشغيل الموسيقى", pause: "إيقاف مؤقت" }
      : { audio: "Play audio", music: "Play music", pause: "Pause" };
  narrationToggleButton.textContent = narrationPlayer.paused ? labels.audio : labels.pause;
  musicToggleButton.textContent = musicPlayer.paused ? labels.music : labels.pause;
  narrationToggleButton.classList.toggle("active", !narrationPlayer.paused);
  musicToggleButton.classList.toggle("active", !musicPlayer.paused);
}

[narrationPlayer, musicPlayer].forEach((player) => {
  player.addEventListener("play", updateLibraryAudioButtons);
  player.addEventListener("pause", updateLibraryAudioButtons);
  player.addEventListener("ended", updateLibraryAudioButtons);
});

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
  const museumWing = isConnectedMuseum || isFiveMuseumsWing;
  const peopleRoom = activeRoom === "people";
  const modelRoom = isModelMuseum;
  visitor.position.x = THREE.MathUtils.clamp(visitor.position.x, museumWing ? -6.3 : modelRoom ? -6.3 : peopleRoom ? -6.45 : -5.3, museumWing ? 6.3 : modelRoom ? 6.3 : peopleRoom ? 6.45 : 19.3);
  visitor.position.z = THREE.MathUtils.clamp(visitor.position.z, museumWing ? -7.3 : modelRoom ? -7.3 : peopleRoom ? -8.35 : -4.3, isFiveMuseumsWing ? 71.3 : museumWing ? 55.3 : modelRoom ? 7.3 : peopleRoom ? 8.35 : 38.3);
}

async function detectVR() {
  if (!navigator.xr) {
    status.textContent = text.unsupported;
    return;
  }
  try {
    const supported = await navigator.xr.isSessionSupported("immersive-vr");
    enterButton.disabled = !supported;
    status.textContent = supported ? text.ready : text.unsupported;
  } catch (error) {
    console.warn("WebXR capability detection failed.", error);
    // Some Quest Browser releases have intermittently rejected the capability
    // probe while still accepting requestSession from a user gesture.
    enterButton.disabled = !isQuestBrowser;
    status.textContent = isQuestBrowser ? text.ready : text.unsupported;
  }
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
    const xrLayer = currentSession.renderState?.baseLayer;
    if (isQuestBrowser && xrLayer && "fixedFoveation" in xrLayer) xrLayer.fixedFoveation = 1;
    visitor.position.set(isConnectedMuseum ? connectedStartX : previewPositionX, 0, isConnectedMuseum ? connectedStartZ : previewPositionZ);
    visitor.rotation.set(0, isConnectedMuseum ? connectedStartYaw : previewRotationY, 0);
    await audioListener.context.resume().catch(() => {});
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
  if (isFiveMuseumsWing) {
    const index = THREE.MathUtils.clamp(Math.floor((visitor.position.z + 8) / 16), 0, MUSEUM_ROOMS.length - 1);
    return `museum-${MUSEUM_ROOMS[index].id}`;
  }
  if (isConnectedMuseum) {
    const index = THREE.MathUtils.clamp(Math.floor((visitor.position.z + 8) / 16), 0, ARTIST_ROOM_ORDER.length - 1);
    return ARTIST_ROOM_ORDER[index];
  }
  return activeRoom;
}

function selectRoomAmbience(roomId, advance = false) {
  if (advance) roomAmbienceTrackIndex = (roomAmbienceTrackIndex + 1) % ROOM_AMBIENCE_TRACKS.length;
  else roomAmbienceTrackIndex = ROOM_AMBIENCE_OFFSETS[roomId] ?? 0;
  const src = ROOM_AMBIENCE_TRACKS[roomAmbienceTrackIndex];
  if (roomAmbiencePlayer.src !== new URL(src, location.href).href) {
    roomAmbiencePlayer.src = src;
    roomAmbiencePlayer.load();
  }
  roomAmbienceSourceRoom = roomId;
}

function startRoomAmbience(roomId = roomAtVisitorPosition()) {
  if (!roomId || !ambienceEnabled || ambientNodes || audioMuted || audioListener.context.state !== "running") return;
  if (activeExhibit?.audio?.isPlaying || !narrationPlayer.paused || !musicPlayer.paused) return;
  if (roomAmbienceSourceRoom !== roomId) selectRoomAmbience(roomId);
  ambientNodes = { roomId, media: roomAmbiencePlayer };
  ambientRoomId = roomId;
  roomAmbiencePlayer.play().catch((error) => {
    console.warn("Room music is waiting for a visitor gesture.", error);
    ambientNodes = null;
    updateAmbienceButtons();
  });
  updateAmbienceButtons();
}

function stopRoomAmbience() {
  if (!ambientNodes) return;
  ambientNodes.media?.pause();
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
  const narrationWasPlaying = Boolean(activeExhibit?.audio?.isPlaying);
  if (narrationWasPlaying) stopAllAudioGuides();
  if (!narrationWasPlaying && ambientNodes) {
    ambienceEnabled = false;
    stopRoomAmbience();
  } else if (!ambientNodes) {
    ambienceEnabled = true;
    startRoomAmbience();
  }
  updateAmbienceButtons();
}

function stopRoomAmbienceByVisitor() {
  ambienceEnabled = false;
  stopRoomAmbience();
  roomAmbiencePlayer.currentTime = 0;
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
      const museumWing = isConnectedMuseum || isFiveMuseumsWing;
      const peopleRoom = activeRoom === "people";
      const modelRoom = isModelMuseum;
      visitor.position.x = THREE.MathUtils.clamp(visitor.position.x, museumWing ? -6.3 : modelRoom ? -6.3 : peopleRoom ? -6.45 : -5.3, museumWing ? 6.3 : modelRoom ? 6.3 : peopleRoom ? 6.45 : 19.3);
      visitor.position.z = THREE.MathUtils.clamp(visitor.position.z, museumWing ? -7.3 : modelRoom ? -7.3 : peopleRoom ? -8.35 : -4.3, isFiveMuseumsWing ? 71.3 : museumWing ? 55.3 : modelRoom ? 7.3 : peopleRoom ? 8.35 : 38.3);
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

function render(now = performance.now()) {
  if (isHandheldMobile && !currentSession && now - lastMobileRenderAt < 33) return;
  lastMobileRenderAt = now;
  maybeLoadCinemaAudience();
  maybeLoadConnectedMuseumRoom();
  maybeLoadFiveMuseumsRoom();
  maybeLoadModelMuseumRoom();
  maybeLoadLivingBookAssets();
  updateHandVisuals();
  updateGazeNavigation(now);
  const delta = Math.min(clock.getDelta(), 0.05);
  updateLocomotion(delta);
  updateScreenLocomotion(delta);
  const spatialUpdateInterval = isQuestBrowser ? 160 : 80;
  if (now - lastSpatialUpdateAt >= spatialUpdateInterval) {
    lastSpatialUpdateAt = now;
    selectNearestAudioGuide();
    updateAudioVolume();
    updateRoomAmbience();
    updateGalleryVideoVolume();
  }
  updateControllerAudioCommands();
  renderer.render(scene, camera);
}
