const params = new URLSearchParams(location.search);
const requestedLang = (params.get("lang") || "en").toLowerCase().split("-")[0];
const lang = ["en", "fr", "ar"].includes(requestedLang) ? requestedLang : "en";

const COPY = {
  en: {
    pageTitle: "ARTDACI — 3D Models",
    back: "← ARTDACI Home",
    brand: "3D Collection",
    heroKicker: "ARTDACI · Interactive 3D",
    heroTitle: "Explore the collection <span>in 3D.</span>",
    lead: "Rotate, inspect and explore selected ARTDACI models—from artwork interpretations and artist figures to the living book and museum architecture.",
    note: "Only one model is loaded at a time. Select any item below to replace the model in the viewer. AR is offered when supported by the device and browser.",
    loading: "Loading 3D model",
    unavailable: "Model unavailable",
    ar: "View in AR",
    stop: "Stop rotation",
    rotate: "Auto-rotate",
    reset: "Reset view",
    libraryKicker: "3D Library",
    libraryTitle: "Choose what you want to inspect.",
    libraryIntro: "This first 3D portal brings together several types of assets already used across ARTDACI. The collection can expand progressively without changing the interaction model.",
    groups: ["Artworks & interpretations", "The Masters", "Museums", "ARTDACI objects"],
    counts: ["3 models", "4 models", "4 models", "1 model"],
    footer: "ARTDACI · Interactive 3D Collection",
    footerLinks: ["VR Gallery", "Masters Hub", "ARTDACI Semantic"],
    categoryArtwork: "Artwork interpretation",
    categoryEnvironment: "Artwork environment",
    categoryMaster: "Master figure",
    categoryMuseum: "Museum architecture",
    categoryObject: "ARTDACI object",
    choices: [
      ["Leonardo da Vinci","Mona Lisa","Compact 3D interpretation for interactive viewing.","Mona Lisa — 3D interpretation"],
      ["Johannes Vermeer","Girl with a Pearl Earring","Three-dimensional interpretation of Vermeer's iconic figure.","Girl with a Pearl Earring — 3D interpretation"],
      ["Vincent van Gogh","The Bedroom","Spatial reconstruction inspired by Van Gogh's Arles bedroom.","The Bedroom — 3D interpretation"],
      ["Master figure","Leonardo da Vinci","Standing 3D character used in ARTDACI narrative experiences.","Leonardo da Vinci — standing figure"],
      ["Master figure","Johannes Vermeer","Standing 3D character for guided and immersive experiences.","Johannes Vermeer — standing figure"],
      ["Master figure","Vincent van Gogh","Lightweight standing model for spatial experiences.","Vincent van Gogh — standing figure"],
      ["Master figure","Claude Monet","Standing 3D character used across ARTDACI environments.","Claude Monet — standing figure"],
      ["Paris · France","Musée d'Orsay","Architectural 3D model used by ARTDACI museum experiences.","Musée d'Orsay — architectural model"],
      ["The Hague · Netherlands","Mauritshuis","3D museum model connected to the Vermeer collection.","Mauritshuis — architectural model"],
      ["Washington · USA","National Gallery of Art","Architectural model for ARTDACI's Washington museum layer.","National Gallery of Art — architectural model"],
      ["Paris · France","Musée du Louvre","Optimized museum model for interactive inspection.","Louvre — architectural model"],
      ["Printed + Digital","The ARTDACI Book","Three-dimensional representation of the printed ARTDACI object.","ARTDACI — 3D book"]
    ]
  },
  fr: {
    pageTitle: "ARTDACI — Modèles 3D",
    back: "← Accueil ARTDACI",
    brand: "Collection 3D",
    heroKicker: "ARTDACI · 3D interactive",
    heroTitle: "Explorez la collection <span>en 3D.</span>",
    lead: "Faites pivoter, examinez et explorez une sélection de modèles ARTDACI : interprétations d’œuvres, figures d’artistes, livre vivant et architecture des musées.",
    note: "Un seul modèle est chargé à la fois. Sélectionnez un élément ci-dessous pour remplacer le modèle dans le visualiseur. L’AR est proposée lorsque l’appareil et le navigateur la prennent en charge.",
    loading: "Chargement du modèle 3D",
    unavailable: "Modèle indisponible",
    ar: "Voir en AR",
    stop: "Arrêter la rotation",
    rotate: "Rotation automatique",
    reset: "Réinitialiser la vue",
    libraryKicker: "Bibliothèque 3D",
    libraryTitle: "Choisissez ce que vous voulez examiner.",
    libraryIntro: "Ce portail 3D rassemble plusieurs types de ressources déjà utilisées dans ARTDACI. La collection pourra s’enrichir progressivement sans modifier le principe d’interaction.",
    groups: ["Œuvres & interprétations", "Les Maîtres", "Musées", "Objets ARTDACI"],
    counts: ["3 modèles", "4 modèles", "4 modèles", "1 modèle"],
    footer: "ARTDACI · Collection 3D interactive",
    footerLinks: ["Galerie VR", "Masters Hub", "ARTDACI Semantic"],
    categoryArtwork: "Interprétation d’œuvre",
    categoryEnvironment: "Environnement d’œuvre",
    categoryMaster: "Figure de maître",
    categoryMuseum: "Architecture de musée",
    categoryObject: "Objet ARTDACI",
    choices: [
      ["Léonard de Vinci","La Joconde","Interprétation 3D compacte pour l’exploration interactive.","La Joconde — interprétation 3D"],
      ["Johannes Vermeer","La Jeune Fille à la perle","Interprétation tridimensionnelle de la figure emblématique de Vermeer.","La Jeune Fille à la perle — interprétation 3D"],
      ["Vincent van Gogh","La Chambre","Reconstruction spatiale inspirée de la chambre de Van Gogh à Arles.","La Chambre — interprétation 3D"],
      ["Figure de maître","Léonard de Vinci","Personnage 3D debout utilisé dans les expériences narratives ARTDACI.","Léonard de Vinci — figure debout"],
      ["Figure de maître","Johannes Vermeer","Personnage 3D debout pour les expériences guidées et immersives.","Johannes Vermeer — figure debout"],
      ["Figure de maître","Vincent van Gogh","Modèle debout léger pour les expériences spatiales.","Vincent van Gogh — figure debout"],
      ["Figure de maître","Claude Monet","Personnage 3D debout utilisé dans les environnements ARTDACI.","Claude Monet — figure debout"],
      ["Paris · France","Musée d'Orsay","Modèle architectural 3D utilisé dans les expériences muséales ARTDACI.","Musée d'Orsay — modèle architectural"],
      ["La Haye · Pays-Bas","Mauritshuis","Modèle 3D du musée relié à la collection Vermeer.","Mauritshuis — modèle architectural"],
      ["Washington · États-Unis","National Gallery of Art","Modèle architectural pour la couche muséale ARTDACI de Washington.","National Gallery of Art — modèle architectural"],
      ["Paris · France","Musée du Louvre","Modèle de musée optimisé pour l’exploration interactive.","Louvre — modèle architectural"],
      ["Imprimé + Numérique","Le livre ARTDACI","Représentation tridimensionnelle de l’objet imprimé ARTDACI.","ARTDACI — livre 3D"]
    ]
  },
  ar: {
    pageTitle: "ARTDACI — النماذج ثلاثية الأبعاد",
    back: "الرئيسية ARTDACI →",
    brand: "مجموعة 3D",
    heroKicker: "ARTDACI · ثلاثي الأبعاد تفاعلي",
    heroTitle: "استكشف المجموعة <span>ثلاثية الأبعاد.</span>",
    lead: "دوّر وافحص واستكشف نماذج مختارة من ARTDACI، من تفسيرات الأعمال وشخصيات الفنانين إلى الكتاب الحي وعمارة المتاحف.",
    note: "يتم تحميل نموذج واحد فقط في كل مرة. اختر أي عنصر أدناه لاستبدال النموذج في العارض. يظهر خيار AR عندما يدعمه الجهاز والمتصفح.",
    loading: "جارٍ تحميل النموذج ثلاثي الأبعاد",
    unavailable: "النموذج غير متاح",
    ar: "عرض في AR",
    stop: "إيقاف الدوران",
    rotate: "دوران تلقائي",
    reset: "إعادة ضبط العرض",
    libraryKicker: "مكتبة 3D",
    libraryTitle: "اختر ما تريد استكشافه.",
    libraryIntro: "يجمع هذا المدخل ثلاثي الأبعاد أنواعاً متعددة من الموارد المستخدمة بالفعل في ARTDACI، ويمكن توسيع المجموعة تدريجياً دون تغيير طريقة التفاعل.",
    groups: ["الأعمال والتفسيرات", "كبار الفنانين", "المتاحف", "عناصر ARTDACI"],
    counts: ["3 نماذج", "4 نماذج", "4 نماذج", "نموذج واحد"],
    footer: "ARTDACI · مجموعة 3D التفاعلية",
    footerLinks: ["معرض VR", "Masters Hub", "ARTDACI Semantic"],
    categoryArtwork: "تفسير للعمل",
    categoryEnvironment: "بيئة العمل",
    categoryMaster: "شخصية فنان",
    categoryMuseum: "عمارة متحف",
    categoryObject: "عنصر ARTDACI",
    choices: [
      ["ليوناردو دافنشي","الموناليزا","تفسير ثلاثي الأبعاد مدمج للاستكشاف التفاعلي.","الموناليزا — تفسير 3D"],
      ["يوهانس فيرمير","الفتاة ذات القرط اللؤلؤي","تفسير ثلاثي الأبعاد للشخصية الأيقونية عند فيرمير.","الفتاة ذات القرط اللؤلؤي — تفسير 3D"],
      ["فنسنت فان غوخ","غرفة النوم","إعادة بناء مكانية مستوحاة من غرفة فان غوخ في آرل.","غرفة النوم — تفسير 3D"],
      ["شخصية فنان","ليوناردو دافنشي","شخصية ثلاثية الأبعاد واقفة مستخدمة في التجارب السردية لـ ARTDACI.","ليوناردو دافنشي — شخصية واقفة"],
      ["شخصية فنان","يوهانس فيرمير","شخصية ثلاثية الأبعاد واقفة للتجارب الموجهة والغامرة.","يوهانس فيرمير — شخصية واقفة"],
      ["شخصية فنان","فنسنت فان غوخ","نموذج واقف خفيف للتجارب المكانية.","فنسنت فان غوخ — شخصية واقفة"],
      ["شخصية فنان","كلود مونيه","شخصية ثلاثية الأبعاد واقفة مستخدمة في بيئات ARTDACI.","كلود مونيه — شخصية واقفة"],
      ["باريس · فرنسا","متحف أورسي","نموذج معماري ثلاثي الأبعاد مستخدم في تجارب ARTDACI المتحفية.","متحف أورسي — نموذج معماري"],
      ["لاهاي · هولندا","موريتشهاوس","نموذج ثلاثي الأبعاد للمتحف مرتبط بمجموعة فيرمير.","موريتشهاوس — نموذج معماري"],
      ["واشنطن · الولايات المتحدة","National Gallery of Art","نموذج معماري لطبقة متحف واشنطن في ARTDACI.","National Gallery of Art — نموذج معماري"],
      ["باريس · فرنسا","متحف اللوفر","نموذج متحف محسّن للاستكشاف التفاعلي.","اللوفر — نموذج معماري"],
      ["مطبوع + رقمي","كتاب ARTDACI","تمثيل ثلاثي الأبعاد للكتاب المطبوع ARTDACI.","ARTDACI — كتاب 3D"]
    ]
  }
};

const copy = COPY[lang];
document.documentElement.lang = lang;
document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
document.title = copy.pageTitle;

const homeHref = lang === "fr" ? "../index-fr.html" : lang === "ar" ? "../index-ar.html" : "../index.html";
const back = document.querySelector(".d3-back");
const brand = document.querySelector(".d3-brand");
back.href = homeHref;
back.textContent = copy.back;
brand.href = homeHref;
brand.querySelector("span").textContent = copy.brand;

const langLinks = document.querySelectorAll(".d3-lang a");
const langValues = ["en","fr","ar"];
langLinks.forEach((link, index) => {
  const value = langValues[index];
  link.href = "?lang=" + value;
  if (value === lang) link.setAttribute("aria-current","page");
  else link.removeAttribute("aria-current");
});

document.querySelector(".d3-copy .d3-kicker").textContent = copy.heroKicker;
document.getElementById("d3-page-title").innerHTML = copy.heroTitle;
document.querySelector(".d3-lead").textContent = copy.lead;
document.querySelector(".d3-note").textContent = copy.note;
document.querySelector(".d3-ar-button").textContent = copy.ar;
document.querySelector(".d3-section-head .d3-kicker").textContent = copy.libraryKicker;
document.getElementById("d3-library-title").textContent = copy.libraryTitle;
document.querySelector(".d3-section-head > p:last-child").textContent = copy.libraryIntro;

const groupHeaders = [...document.querySelectorAll(".d3-group-head")];
groupHeaders.forEach((header, index) => {
  header.querySelector("h3").textContent = copy.groups[index];
  header.querySelector("span").textContent = copy.counts[index];
});

const choices = [...document.querySelectorAll(".d3-model-choice")];
const categories = [
  copy.categoryArtwork, copy.categoryArtwork, copy.categoryEnvironment,
  copy.categoryMaster, copy.categoryMaster, copy.categoryMaster, copy.categoryMaster,
  copy.categoryMuseum, copy.categoryMuseum, copy.categoryMuseum, copy.categoryMuseum,
  copy.categoryObject
];
choices.forEach((button, index) => {
  const item = copy.choices[index];
  if (!item) return;
  button.dataset.category = categories[index];
  button.dataset.title = item[3];
  button.querySelector("span").textContent = item[0];
  button.querySelector("strong").textContent = item[1];
  button.querySelector("small").textContent = item[2];
});

const footer = document.querySelector(".d3-footer");
footer.querySelector(":scope > span").textContent = copy.footer;
const footerLinks = footer.querySelectorAll("a");
footerLinks[0].textContent = copy.footerLinks[0];
footerLinks[0].href = "../gallery-vr.html?lang=" + lang;
footerLinks[1].textContent = copy.footerLinks[1];
footerLinks[1].href = "../geo/masters-hub.html?lang=" + lang;
footerLinks[2].textContent = copy.footerLinks[2];
footerLinks[2].href = "../semantic/?lang=" + lang;

const viewer = document.getElementById("d3-model");
const loading = document.getElementById("d3-loading");
const category = document.getElementById("d3-category");
const title = document.getElementById("d3-title");
const rotateButton = document.getElementById("d3-rotate");
const resetButton = document.getElementById("d3-reset");
let rotating = viewer.hasAttribute("auto-rotate");

function selectModel(button) {
  const src = button.dataset.src;
  const nextTitle = button.dataset.title || "3D";
  const nextCategory = button.dataset.category || "ARTDACI 3D";
  if (!src || !viewer) return;
  choices.forEach((choice) => choice.setAttribute("aria-current", choice === button ? "true" : "false"));
  category.textContent = nextCategory;
  title.textContent = nextTitle;
  loading.textContent = copy.loading;
  loading.hidden = false;
  viewer.setAttribute("src", src);
  viewer.setAttribute("alt", nextTitle);
}

choices.forEach((button) => {
  button.addEventListener("click", () => {
    selectModel(button);
    document.querySelector(".d3-stage-wrap")?.scrollIntoView({ behavior: "smooth", block: "center" });
  });
});

viewer?.addEventListener("load", () => { loading.hidden = true; });
viewer?.addEventListener("error", () => {
  loading.textContent = copy.unavailable;
  loading.hidden = false;
});

function refreshRotateLabel() {
  rotateButton.textContent = rotating ? copy.stop : copy.rotate;
  rotateButton.setAttribute("aria-pressed", rotating ? "true" : "false");
}
refreshRotateLabel();
resetButton.textContent = copy.reset;

rotateButton?.addEventListener("click", () => {
  rotating = !rotating;
  if (rotating) viewer.setAttribute("auto-rotate", "");
  else viewer.removeAttribute("auto-rotate");
  refreshRotateLabel();
});

resetButton?.addEventListener("click", () => {
  if (typeof viewer.resetTurntableRotation === "function") viewer.resetTurntableRotation();
  viewer.cameraOrbit = "0deg 75deg auto";
  viewer.cameraTarget = "auto auto auto";
  viewer.fieldOfView = "auto";
});

const first = choices.find((choice) => choice.getAttribute("aria-current") === "true") || choices[0];
if (first) {
  category.textContent = first.dataset.category;
  title.textContent = first.dataset.title;
}
