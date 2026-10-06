const params = new URLSearchParams(location.search);
const requested = (params.get("lang") || "en").toLowerCase().split("-")[0];
const lang = ["en","fr","ar"].includes(requested) ? requested : "en";

const COPY = {
  en: {
    title: "ARTDACI — Virtual Worlds",
    back: "← ARTDACI Home",
    brand: "Virtual Worlds",
    related: ["VR Gallery","Living Book"],
    kicker: "ARTDACI · Immersive Worlds",
    hero: "Step inside <span>the artwork’s world.</span>",
    lead: "Explore spatial worlds inspired by museums, artists and paintings. These experiences extend ARTDACI beyond the gallery interface into environments that can be entered and explored.",
    note: "The worlds below are external immersive experiences already connected to ARTDACI. Device support and VR behavior depend on the platform used to open them.",
    types: ["Museum World","Artist World","Enriched Artist World","Painting World"],
    titles: ["Louvre Gallery","Leonardo’s Studio","Leonardo’s Enriched Studio","The Bedroom"],
    desc: [
      "Enter a generated Louvre-inspired gallery and experience museum space as an explorable virtual environment.",
      "Visit an imagined studio of Leonardo da Vinci and move through a spatial interpretation of the artist’s world.",
      "Explore the enriched version of Leonardo’s studio, designed as a deeper narrative and spatial extension of the artist experience.",
      "Step into a virtual world inspired by Van Gogh’s Bedroom and experience the painted space as an environment around you."
    ],
    cta: "Enter world →",
    footer: "ARTDACI · Virtual Worlds",
    footerLinks: ["VR Gallery","3D Models","Masters Hub","VR Cinema"]
  },
  fr: {
    title: "ARTDACI — Mondes virtuels",
    back: "← Accueil ARTDACI",
    brand: "Mondes virtuels",
    related: ["Galerie VR","Livre Vivant"],
    kicker: "ARTDACI · Mondes immersifs",
    hero: "Entrez dans <span>le monde de l’œuvre.</span>",
    lead: "Explorez des mondes spatiaux inspirés des musées, des artistes et des peintures. Ces expériences prolongent ARTDACI au-delà de l’interface de galerie vers des environnements que l’on peut réellement parcourir.",
    note: "Les mondes ci-dessous sont des expériences immersives externes déjà reliées à ARTDACI. Leur comportement en VR dépend de l’appareil et de la plateforme utilisés.",
    types: ["Monde muséal","Monde d’artiste","Monde d’artiste enrichi","Monde d’une peinture"],
    titles: ["Galerie du Louvre","Atelier de Léonard","Atelier enrichi de Léonard","La Chambre"],
    desc: [
      "Entrez dans une galerie générée inspirée du Louvre et découvrez l’espace muséal comme un environnement virtuel explorable.",
      "Visitez un atelier imaginé de Léonard de Vinci et parcourez une interprétation spatiale de son univers.",
      "Explorez la version enrichie de l’atelier de Léonard, conçue comme un prolongement narratif et spatial plus profond.",
      "Entrez dans un monde virtuel inspiré de La Chambre de Van Gogh et vivez l’espace peint comme un environnement autour de vous."
    ],
    cta: "Entrer dans le monde →",
    footer: "ARTDACI · Mondes virtuels",
    footerLinks: ["Galerie VR","Modèles 3D","Masters Hub","Cinéma VR"]
  },
  ar: {
    title: "ARTDACI — العوالم الافتراضية",
    back: "الرئيسية ARTDACI →",
    brand: "العوالم الافتراضية",
    related: ["معرض VR","الكتاب الحي"],
    kicker: "ARTDACI · عوالم غامرة",
    hero: "ادخل إلى <span>عالم العمل الفني.</span>",
    lead: "استكشف عوالم مكانية مستوحاة من المتاحف والفنانين واللوحات. توسّع هذه التجارب ARTDACI خارج واجهة المعرض نحو بيئات يمكن الدخول إليها والتجول فيها.",
    note: "العوالم أدناه تجارب غامرة خارجية مرتبطة مسبقاً بـ ARTDACI. يعتمد سلوك الواقع الافتراضي على الجهاز والمنصة المستخدمة.",
    types: ["عالم متحفي","عالم فنان","عالم فنان مُثرى","عالم لوحة"],
    titles: ["معرض اللوفر","مرسم ليوناردو","مرسم ليوناردو المُثرى","غرفة النوم"],
    desc: [
      "ادخل إلى معرض مولّد مستوحى من اللوفر واختبر الفضاء المتحفي كبيئة افتراضية قابلة للاستكشاف.",
      "زر مرسماً متخيلاً لليوناردو دافنشي وتجول في تفسير مكاني لعالم الفنان.",
      "استكشف النسخة المُثرية من مرسم ليوناردو، المصممة كتوسّع سردي ومكاني أعمق لتجربة الفنان.",
      "ادخل إلى عالم افتراضي مستوحى من غرفة نوم فان غوخ واختبر الفضاء المرسوم كبيئة تحيط بك."
    ],
    cta: "دخول العالم ←",
    footer: "ARTDACI · العوالم الافتراضية",
    footerLinks: ["معرض VR","نماذج 3D","Masters Hub","سينما VR"]
  }
};

const c = COPY[lang];
document.documentElement.lang = lang;
document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
document.title = c.title;

const homeHref = lang === "fr" ? "../index-fr.html" : lang === "ar" ? "../index-ar.html" : "../index.html";
const back = document.querySelector(".vw-back");
back.href = homeHref;
back.textContent = c.back;
const brand = document.querySelector(".vw-brand");
brand.href = homeHref;
brand.querySelector("span").textContent = c.brand;

const related = document.querySelectorAll(".vw-actions a");
related[0].textContent = c.related[0];
related[0].href = "../gallery-vr.html?lang=" + lang;
related[1].textContent = c.related[1];
related[1].href = "../book-3d.html?lang=" + lang;

document.querySelector(".vw-kicker").textContent = c.kicker;
document.getElementById("vw-title").innerHTML = c.hero;
document.querySelector(".vw-lead").textContent = c.lead;
document.querySelector(".vw-note").textContent = c.note;

const worlds = [...document.querySelectorAll(".vw-world")];
worlds.forEach((world,index) => {
  world.querySelector(".vw-world-type").textContent = c.types[index];
  world.querySelector("h2").textContent = c.titles[index];
  world.querySelector("p").textContent = c.desc[index];
  world.querySelector(".vw-world-cta").textContent = c.cta;
  world.querySelector(".vw-world-arrow").textContent = lang === "ar" ? "↖" : "↗";
});

const footer = document.querySelector(".vw-footer");
footer.querySelector(":scope > span").textContent = c.footer;
const links = footer.querySelectorAll("a");
const hrefs = [
  "../gallery-vr.html?lang=" + lang,
  "../3d/?lang=" + lang,
  "../geo/masters-hub.html?lang=" + lang,
  "../cinema-vr.html?lang=" + lang
];
links.forEach((link,index) => {
  link.textContent = c.footerLinks[index];
  link.href = hrefs[index];
});
