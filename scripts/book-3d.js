const MANIFEST_URLS = [
  "content/paintings/mona-lisa.json",
  "content/paintings/van-gogh.json",
  "content/paintings/van-gogh-bedroom.json",
  "content/paintings/vermeer-girl-with-a-pearl-earring.json"
];

const BOOK_IMAGE_GALLERIES = {
  "mona-lisa": [
    "assets/paintings/mona-lisa/images/Mona-Lisa_out-of-frame.png",
    "assets/paintings/mona-lisa/images/davinci-monalisa.png",
    "assets/paintings/mona-lisa/images/monalisa-t.png"
  ],
  "van-gogh": [
    "assets/paintings/van-gogh/images/van-gogh-out-of-frame.png",
    "assets/paintings/van-gogh/images/van-gogh_in_bedroom-standing.png",
    "assets/paintings/van-gogh/images/van-gogh__Portrait.jpg"
  ],
  "van-gogh-bedroom": [
    "assets/paintings/van-gogh-bedroom/images/bed_van-gogh.jpeg",
    "assets/paintings/van-gogh-bedroom/images/van-gogh_bedroom-t.png"
  ],
  "vermeer-girl-with-a-pearl-earring": [
    "assets/paintings/vermeer_Girl-with-a-Pearl-Earring/images/Girl_with_a_Pearl_Earring_standing.jpg",
    "assets/paintings/vermeer_Girl-with-a-Pearl-Earring/images/vermeer_Girl-with-a-Pearl-Earring_sitting.png",
    "assets/paintings/vermeer_Girl-with-a-Pearl-Earring/images/vermeer_Girl-with-a-Pearl-Earring_room.png"
  ]
};

const params = new URLSearchParams(location.search);
const lang = params.get("lang") === "fr" ? "fr" : "en";
const book = document.getElementById("book");
const sheetsRoot = document.getElementById("book-sheets");
const previousButton = document.getElementById("book-prev");
const nextButton = document.getElementById("book-next");
const progress = document.getElementById("book-progress");
const dialog = document.getElementById("book-experience");
const experienceTitle = document.getElementById("experience-title");
const experienceKicker = document.getElementById("experience-kicker");
const experienceBody = document.getElementById("experience-body");
const closeExperienceButton = document.getElementById("experience-close");

let currentLeaf = 0;
let sheets = [];
let pageDefinitions = [];
let dragStartX = null;

init();

async function init() {
  applyLanguage();
  const responses = await Promise.all(MANIFEST_URLS.map((url) => fetch(url, { cache: "reload" })));
  if (responses.some((response) => !response.ok)) throw new Error("Book content is unavailable.");
  const manifests = await Promise.all(responses.map((response) => response.json()));
  pageDefinitions = buildPageDefinitions(manifests);
  await buildBook(pageDefinitions);
  bindControls();
  updateBook();
}

function applyLanguage() {
  document.documentElement.lang = lang;
  document.querySelector(".book-back").href = lang === "fr" ? "index-fr.html" : "index.html";
  document.querySelector(".book-back").textContent = lang === "fr" ? "Retour à la collection" : "Back to collection";
  document.querySelector(".book-toolbar p").textContent = lang === "fr" ? "Livre d’art interactif" : "Interactive art book";
  document.querySelector(".book-toolbar h1").textContent = lang === "fr" ? "Le Livre Vivant" : "The Living Book";
  document.querySelector(".book-hint").textContent = lang === "fr"
    ? "Sélectionnez un hotspot lumineux pour ouvrir la 3D, l’audio, l’AR ou une mini-scène."
    : "Select a glowing hotspot to open 3D, audio, AR, or a mini-scene.";
  previousButton.textContent = lang === "fr" ? "← Précédent" : "← Previous";
  nextButton.textContent = lang === "fr" ? "Suivant →" : "Next →";
  closeExperienceButton.textContent = lang === "fr" ? "Retour au livre ✕" : "Return to book ✕";
}

function buildPageDefinitions(manifests) {
  const pages = [
    {
      kind: "cover",
      eyebrow: "ARTDACI",
      title: lang === "fr" ? "CHEFS-D’ŒUVRE VIVANTS" : "MASTERPIECES ALIVE",
      subtitle: lang === "fr" ? "Un livre imprimé. Un musée spatial." : "A printed book. A spatial museum."
    },
    {
      kind: "intro",
      eyebrow: lang === "fr" ? "MODE D’EMPLOI" : "HOW TO EXPLORE",
      title: lang === "fr" ? "Lisez. Touchez. Entrez." : "Read. Select. Enter.",
      body: lang === "fr"
        ? "Tournez les pages comme dans un livre réel. Les repères lumineux ouvrent des objets 3D, des narrations, des animations et des scènes immersives. Fermez l’expérience pour revenir exactement à la page quittée."
        : "Turn pages as you would in a real book. Glowing markers open 3D objects, narration, animation, and immersive scenes. Close an experience to return to the exact page you left."
    }
  ];

  manifests.forEach((manifest, index) => {
    const title = localizedTitle(manifest);
    const audio = getAudio(manifest);
    const videos = manifest.media?.videos || [];
    pages.push({
      kind: "artwork",
      eyebrow: `${String(index + 1).padStart(2, "0")} · ${manifest.movement?.[0] || "Masterpiece"}`,
      title,
      subtitle: `${manifest.artist?.name || ""} · ${manifest.date || ""}`,
      image: manifest.media?.image || manifest.print?.imageTargetSource,
      body: manifest.texts?.historicalContext || "",
      manifest,
      hotspots: [
        { label: "3D", x: 83, y: 23, type: "space" },
        { label: "♪", x: 83, y: 35, type: "audio", audio },
        { label: "AR", x: 83, y: 47, type: "ar" },
        ...(videos[0] ? [{ label: "▶", x: 83, y: 59, type: "video", video: videos[0] }] : [])
      ]
    });
    pages.push({
      kind: "analysis",
      eyebrow: lang === "fr" ? "REGARDER DE PLUS PRÈS" : "LOOK CLOSER",
      title,
      image: manifest.media?.image || manifest.print?.imageTargetSource,
      galleryImages: BOOK_IMAGE_GALLERIES[manifest.slug] || [],
      body: manifest.texts?.artisticAnalysis || manifest.texts?.composition || "",
      facts: (manifest.texts?.interestingFacts || []).slice(0, 3),
      manifest,
      hotspots: [
        { label: "VR", x: 82, y: 24, type: manifest.slug === "van-gogh-bedroom" ? "world" : "vr" },
        { label: "◉", x: 82, y: 38, type: "gallery" },
        ...(videos[1] ? [{ label: "▶", x: 82, y: 52, type: "video", video: videos[1] }] : [])
      ]
    });
  });

  pages.push({
    kind: "back",
    eyebrow: "ARTDACI",
    title: lang === "fr" ? "CONTINUEZ L’EXPLORATION" : "KEEP EXPLORING",
    subtitle: lang === "fr" ? "La collection continue dans la galerie VR." : "The collection continues inside the VR Gallery."
  });
  if (pages.length % 2) pages.push({ kind: "blank", title: "" });
  return pages;
}

async function buildBook(pages) {
  const textures = await Promise.all(pages.map(createPageTexture));
  for (let index = 0; index < pages.length; index += 2) {
    const sheet = document.createElement("article");
    sheet.className = "sheet";
    sheet.style.zIndex = String(pages.length - index);

    const front = createPageSurface(pages[index], textures[index], "front");
    const back = createPageSurface(pages[index + 1], textures[index + 1], "back");
    sheet.append(front, back);
    sheetsRoot.appendChild(sheet);
    sheets.push(sheet);
  }
}

function createPageSurface(definition, texture, side) {
  const page = document.createElement("section");
  page.className = `page page-${side}`;
  page.style.backgroundImage = `url("${texture}")`;
  (definition.hotspots || []).forEach((hotspot) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "page-hotspot";
    button.textContent = hotspot.label;
    button.style.left = `${hotspot.x}%`;
    button.style.top = `${hotspot.y}%`;
    button.setAttribute("aria-label", `${hotspot.type}: ${definition.title}`);
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      openExperience(definition, hotspot);
    });
    page.appendChild(button);
  });
  return page;
}

async function createPageTexture(definition) {
  const canvas = document.createElement("canvas");
  canvas.width = 1600;
  canvas.height = 2200;
  const context = canvas.getContext("2d");
  drawPaper(context, canvas, definition.kind);

  if (definition.kind === "analysis" && definition.galleryImages?.length) {
    const galleryImages = await Promise.all(definition.galleryImages.slice(0, 3).map(loadImage));
    drawImageGallery(context, galleryImages, 130, 360, 1340, 700);
  } else if (definition.image) {
    const image = await loadImage(definition.image);
    if (definition.kind === "artwork") {
      drawCoverImage(context, image, 120, 390, 1360, 920);
    } else {
      drawCoverImage(context, image, 130, 360, 1340, 700);
    }
  }

  drawPageCopy(context, canvas, definition);
  return canvas.toDataURL("image/jpeg", 0.94);
}

function drawImageGallery(context, images, x, y, width, height) {
  const gap = 24;
  const cellWidth = (width - gap * (images.length - 1)) / images.length;
  images.forEach((image, index) => {
    drawCoverImage(context, image, x + index * (cellWidth + gap), y, cellWidth, height);
  });
}

function drawPaper(context, canvas, kind) {
  const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
  if (kind === "cover" || kind === "back") {
    gradient.addColorStop(0, "#762f35");
    gradient.addColorStop(1, "#2a1617");
  } else {
    gradient.addColorStop(0, "#f8f0df");
    gradient.addColorStop(1, "#e4d4bb");
  }
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = kind === "cover" || kind === "back" ? "#d4ac66" : "#9b7448";
  context.lineWidth = 10;
  context.strokeRect(55, 55, canvas.width - 110, canvas.height - 110);
}

function drawPageCopy(context, canvas, definition) {
  const dark = definition.kind === "cover" || definition.kind === "back";
  context.fillStyle = dark ? "#e4bd75" : "#8a303c";
  context.font = "800 38px Arial";
  context.letterSpacing = "4px";
  context.fillText(definition.eyebrow || "", 120, 170);
  context.letterSpacing = "0px";

  context.fillStyle = dark ? "#fff5df" : "#241c16";
  context.font = `700 ${dark ? 108 : 78}px Georgia`;
  const titleY = definition.image ? 280 : 620;
  drawWrappedText(context, definition.title || "", 120, titleY, 1360, dark ? 122 : 92, 4);

  if (definition.subtitle) {
    context.fillStyle = dark ? "#dfcaa6" : "#765b47";
    context.font = "600 42px Arial";
    drawWrappedText(context, definition.subtitle, 120, definition.image ? titleY + 82 : titleY + 285, 1320, 58, 3);
  }

  if (definition.body) {
    context.fillStyle = "#3f352c";
    context.font = "42px Georgia";
    const bodyY = definition.kind === "artwork" ? 1445 : definition.image ? 1190 : 1040;
    drawWrappedText(context, definition.body, 130, bodyY, 1320, 62, definition.kind === "artwork" ? 8 : 9);
  }

  if (definition.facts?.length) {
    context.fillStyle = "#7d2f3e";
    context.font = "700 38px Arial";
    context.fillText(lang === "fr" ? "À RETENIR" : "THINGS TO NOTICE", 130, 1760);
    context.fillStyle = "#3f352c";
    context.font = "36px Georgia";
    definition.facts.forEach((fact, index) => {
      drawWrappedText(context, `• ${fact}`, 145, 1835 + index * 112, 1260, 48, 2);
    });
  }

  context.fillStyle = dark ? "#d6bd92" : "#765f4a";
  context.font = "30px Arial";
  context.fillText("ARTDACI · MASTERPIECES ALIVE", 120, canvas.height - 100);
}

function drawCoverImage(context, image, x, y, width, height) {
  const imageAspect = image.width / image.height;
  const targetAspect = width / height;
  let sourceWidth = image.width;
  let sourceHeight = image.height;
  let sourceX = 0;
  let sourceY = 0;
  if (imageAspect > targetAspect) {
    sourceWidth = image.height * targetAspect;
    sourceX = (image.width - sourceWidth) / 2;
  } else {
    sourceHeight = image.width / targetAspect;
    sourceY = (image.height - sourceHeight) / 2;
  }
  context.save();
  context.shadowColor = "rgba(39,24,13,.45)";
  context.shadowBlur = 32;
  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height);
  context.restore();
  context.strokeStyle = "#9e7748";
  context.lineWidth = 12;
  context.strokeRect(x, y, width, height);
}

function drawWrappedText(context, message, x, y, maxWidth, lineHeight, maxLines) {
  const words = String(message).split(/\s+/);
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

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function localizedTitle(manifest) {
  if (lang !== "fr") return manifest.title;
  return {
    "mona-lisa": "La Joconde",
    "van-gogh": "Autoportrait",
    "van-gogh-bedroom": "La Chambre",
    "vermeer-girl-with-a-pearl-earring": "La Jeune Fille à la perle"
  }[manifest.slug] || manifest.title;
}

function getAudio(manifest) {
  const list = manifest.media?.audioOverviews || [];
  return list.find((item) => item.lang === lang) || list.find((item) => item.lang === "en") || list[0];
}

function bindControls() {
  previousButton.addEventListener("click", previousPage);
  nextButton.addEventListener("click", nextPage);
  closeExperienceButton.addEventListener("click", closeExperience);
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeExperience();
  });
  addEventListener("keydown", (event) => {
    if (dialog.open) return;
    if (event.key === "ArrowRight") nextPage();
    if (event.key === "ArrowLeft") previousPage();
  });
  book.addEventListener("pointerdown", (event) => { dragStartX = event.clientX; });
  book.addEventListener("pointerup", (event) => {
    if (dragStartX === null) return;
    const delta = event.clientX - dragStartX;
    dragStartX = null;
    if (delta < -55) nextPage();
    if (delta > 55) previousPage();
  });
}

function nextPage() {
  if (currentLeaf >= sheets.length) return;
  currentLeaf += 1;
  updateBook();
}

function previousPage() {
  if (currentLeaf <= 0) return;
  currentLeaf -= 1;
  updateBook();
}

function updateBook() {
  sheets.forEach((sheet, index) => {
    const turned = index < currentLeaf;
    sheet.classList.toggle("turned", turned);
    sheet.style.zIndex = turned ? String(index + 1) : String(sheets.length - index + 5);
  });
  previousButton.disabled = currentLeaf === 0;
  nextButton.disabled = currentLeaf === sheets.length;
  const visiblePage = Math.min(currentLeaf * 2, pageDefinitions.length - 1);
  progress.textContent = currentLeaf === 0
    ? (lang === "fr" ? "Couverture" : "Cover")
    : `${lang === "fr" ? "Pages" : "Pages"} ${visiblePage}–${Math.min(visiblePage + 1, pageDefinitions.length)}`;
}

function openExperience(definition, hotspot) {
  const manifest = definition.manifest;
  experienceTitle.textContent = definition.title;
  experienceKicker.textContent = {
    audio: lang === "fr" ? "Narration audio" : "Audio narration",
    video: lang === "fr" ? "Scène réimaginée en mouvement" : "Reimagined scene in motion",
    space: lang === "fr" ? "Objet 3D interactif" : "Interactive 3D object",
    ar: lang === "fr" ? "Réalité augmentée" : "Augmented reality",
    vr: lang === "fr" ? "Scène VR" : "VR scene",
    world: lang === "fr" ? "Monde VR" : "VR world",
    gallery: lang === "fr" ? "Galerie immersive" : "Immersive gallery"
  }[hotspot.type] || "Immersive layer";

  if (hotspot.type === "audio" && hotspot.audio?.src) {
    experienceBody.innerHTML = `<div class="experience-audio"><audio controls autoplay src="${hotspot.audio.src}"></audio></div>`;
  } else if (hotspot.type === "video" && hotspot.video?.src) {
    experienceBody.innerHTML = `
      <div class="experience-video">
        <video controls autoplay playsinline src="${hotspot.video.src}"></video>
        <p>${hotspot.video.description || ""}</p>
      </div>
    `;
  } else {
    const url = getExperienceUrl(manifest, hotspot.type);
    experienceBody.innerHTML = `<iframe title="${experienceTitle.textContent}" src="${url}" allow="autoplay; fullscreen; xr-spatial-tracking; camera"></iframe>`;
  }
  dialog.showModal();
}

function getExperienceUrl(manifest, type) {
  const slug = encodeURIComponent(manifest.slug);
  if (type === "space") return `space.html?painting=${slug}&lang=${lang}`;
  if (type === "ar") return `ar.html?painting=${slug}&lang=${lang}`;
  if (type === "vr") return `vr.html?painting=${slug}&lang=${lang}`;
  if (type === "gallery") return `gallery-vr.html?lang=${lang}`;
  if (type === "world") {
    return manifest.externalExperiences?.find((item) => item.type === "vr-world")?.url
      || `vr.html?painting=${slug}&lang=${lang}`;
  }
  return `space.html?painting=${slug}&lang=${lang}`;
}

function closeExperience() {
  experienceBody.innerHTML = "";
  dialog.close();
}
