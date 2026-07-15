const PAINTINGS = {
  "mona-lisa": "content/paintings/mona-lisa.json",
  "van-gogh": "content/paintings/van-gogh.json",
  "van-gogh-bedroom": "content/paintings/van-gogh-bedroom.json"
};

const COPY = {
  en: {
    back: "Back",
    kicker: "Room Placement",
    loading: "Loading model...",
    ready: "Model ready. Tap Place in My Space to position it in your room.",
    readyWithUsdz: "Model ready. Tap Place in My Space. iPhone/iPad will use USDZ; Android will use Scene Viewer.",
    readyWithoutUsdz: "Model ready. Android and WebXR-compatible devices can use spatial AR. iPhone/iPad needs a USDZ file for this artwork.",
    place: "Place in My Space",
    imageAr: "Image AR",
    printedPage: "Printed Page",
    unsupported: "This browser can preview the 3D model, but may not support room-scale AR placement.",
    iosNote: "Spatial AR is available when the model has a compatible AR file for this device.",
    intro: "Place the 3D model in your space, then move, rotate, and scale it with your device's AR controls."
  },
  fr: {
    back: "Retour",
    kicker: "Placement dans l'espace",
    loading: "Chargement du modele...",
    ready: "Modele pret. Touchez Placer dans mon espace pour le positionner dans votre piece.",
    readyWithUsdz: "Modele pret. Touchez Placer dans mon espace. iPhone/iPad utilisera USDZ; Android utilisera Scene Viewer.",
    readyWithoutUsdz: "Modele pret. Android et les appareils WebXR compatibles peuvent utiliser l'AR spatiale. iPhone/iPad necessite un fichier USDZ pour cette oeuvre.",
    place: "Placer dans mon espace",
    imageAr: "AR sur image",
    printedPage: "Page imprimee",
    unsupported: "Ce navigateur peut afficher le modele 3D, mais il peut ne pas prendre en charge le placement AR dans l'espace.",
    iosNote: "L'AR spatiale est disponible lorsque le modele possede un fichier AR compatible avec cet appareil.",
    intro: "Placez le modele 3D dans votre espace, puis deplacez-le, tournez-le et redimensionnez-le avec les controles AR de votre appareil."
  }
};

const PRINT_PAGES = {
  en: {
    "mona-lisa": "print-target.html",
    "van-gogh": "print-van-gogh.html",
    "van-gogh-bedroom": "print-van-gogh-bedroom.html"
  },
  fr: {
    "mona-lisa": "print-target-fr.html",
    "van-gogh": "print-van-gogh-fr.html",
    "van-gogh-bedroom": "print-van-gogh-bedroom-fr.html"
  }
};

const params = new URLSearchParams(window.location.search);
const slug = PAINTINGS[params.get("painting")] ? params.get("painting") : "mona-lisa";
const lang = params.get("lang") === "fr" ? "fr" : "en";

init();

async function init() {
  document.documentElement.lang = lang;
  applyStaticCopy();

  try {
    const response = await fetch(PAINTINGS[slug], { cache: "reload" });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    const manifest = await response.json();
    configureViewer(manifest);
  } catch (error) {
    document.getElementById("space-status").textContent = `${COPY[lang].unsupported} ${error.message}`;
  }
}

function applyStaticCopy() {
  const text = COPY[lang];
  document.getElementById("back-link").textContent = text.back;
  document.getElementById("back-link").href = lang === "fr" ? "index-fr.html" : "index.html";
  document.getElementById("space-kicker").textContent = text.kicker;
  document.getElementById("space-copy").textContent = text.intro;
  document.getElementById("space-status").textContent = text.loading;
  document.getElementById("ar-button").textContent = text.place;
  document.getElementById("image-ar-link").textContent = text.imageAr;
  document.getElementById("print-link").textContent = text.printedPage;
  document.getElementById("ios-note").textContent = text.iosNote;
}

function configureViewer(manifest) {
  const model = document.getElementById("space-model");
  const arButton = document.getElementById("ar-button");
  const title = manifest.title || "Artwork";
  const src = manifest.ar?.primaryModel || manifest.media?.model;
  const poster = manifest.media?.image || manifest.print?.imageTargetSource;
  const usdz = manifest.media?.usdz || manifest.media?.usdzModel;

  document.title = `DACIART - ${title} - ${COPY[lang].kicker}`;
  document.getElementById("space-title").textContent = lang === "fr" && slug === "van-gogh-bedroom" ? "La Chambre" : title;

  model.src = src;
  model.alt = `${title} 3D model`;
  if (poster) model.poster = poster;
  if (usdz) {
    model.setAttribute("ios-src", usdz);
    document.getElementById("space-status").textContent = COPY[lang].readyWithUsdz;
  } else {
    document.getElementById("ios-note").hidden = false;
    document.getElementById("space-status").textContent = COPY[lang].readyWithoutUsdz;
  }

  document.getElementById("image-ar-link").href = `ar.html?painting=${slug}&lang=${lang}`;
  document.getElementById("print-link").href = PRINT_PAGES[lang]?.[slug] || "index.html";
  arButton.addEventListener("click", (event) => {
    event.preventDefault();
    if (typeof model.activateAR === "function") {
      model.activateAR();
    } else {
      document.getElementById("space-status").textContent = COPY[lang].unsupported;
    }
  });
  model.addEventListener("ar-status", (event) => {
    if (event.detail.status === "failed") {
      document.getElementById("space-status").textContent = COPY[lang].unsupported;
    }
  });
}
