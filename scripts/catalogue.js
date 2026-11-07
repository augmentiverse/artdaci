import { formatArtworkNumber } from "./artwork-numbering.js?v=1";
import { resolveArtworkAudioOverview } from "./artwork-media-manifest.js?v=5";
import { IMMERSIVE_ARTWORKS, classifyUnresolvedArtworkRoute, resolveImmersiveArtworkRoute } from "./immersive-routing.js?v=1";

export { classifyUnresolvedArtworkRoute, resolveImmersiveArtworkRoute };

const PRINT_PAGES = {
  en: {
    "mona-lisa": "print-target.html",
    "lady-with-an-ermine": "print-artwork.html?painting=lady-with-an-ermine&lang=en",
    "van-gogh": "print-van-gogh.html",
    "van-gogh-bedroom": "print-van-gogh-bedroom.html",
    "vermeer-girl-with-a-pearl-earring": "print-vermeer-girl-with-a-pearl-earring.html",
    "view-of-delft": "print-artwork.html?painting=view-of-delft&lang=en",
    "monet-impression-sunrise": "print-monet-impression-sunrise.html",
    "pont-d-argenteuil": "print-artwork.html?painting=pont-d-argenteuil&lang=en"
  },
  fr: {
    "mona-lisa": "print-target-fr.html",
    "lady-with-an-ermine": "print-artwork.html?painting=lady-with-an-ermine&lang=fr",
    "van-gogh": "print-van-gogh-fr.html",
    "van-gogh-bedroom": "print-van-gogh-bedroom-fr.html",
    "vermeer-girl-with-a-pearl-earring": "print-vermeer-girl-with-a-pearl-earring-fr.html",
    "view-of-delft": "print-artwork.html?painting=view-of-delft&lang=fr",
    "monet-impression-sunrise": "print-monet-impression-sunrise-fr.html",
    "pont-d-argenteuil": "print-artwork.html?painting=pont-d-argenteuil&lang=fr"
  }
  ,
  ar: {
    "mona-lisa": "print-ar.html?painting=mona-lisa",
    "lady-with-an-ermine": "print-artwork.html?painting=lady-with-an-ermine&lang=ar",
    "van-gogh": "print-ar.html?painting=van-gogh",
    "van-gogh-bedroom": "print-ar.html?painting=van-gogh-bedroom",
    "vermeer-girl-with-a-pearl-earring": "print-ar.html?painting=vermeer-girl-with-a-pearl-earring",
    "view-of-delft": "print-artwork.html?painting=view-of-delft&lang=ar",
    "monet-impression-sunrise": "print-ar.html?painting=monet-impression-sunrise",
    "pont-d-argenteuil": "print-artwork.html?painting=pont-d-argenteuil&lang=ar"
  }
};
const AUDIO_ARTWORK_IDS = Object.freeze({
  "mona-lisa": "ld01",
  "lady-with-an-ermine": "ld02",
  "last-supper": "ld03",
  "annunciation": "ld04",
  "ginevra-de-benci": "ld05",
  "belle-ferronniere": "ld06",
  "vermeer-girl-with-a-pearl-earring": "ve01",
  "view-of-delft": "ve02",
  "vermeer-milkmaid": "ve03",
  "art-of-painting": "ve04",
  "vermeer-astronomer": "ve05",
  "woman-holding-balance": "ve06",
  "van-gogh": "vg01",
  "van-gogh-bedroom": "vg02",
  "starry-night": "vg03",
  "sunflowers": "vg04",
  "cafe-terrace": "vg05",
  "night-cafe": "vg06",
  "monet-impression-sunrise": "mo01",
  "pont-d-argenteuil": "mo02",
  "water-lilies": "mo03",
  "japanese-bridge": "mo04",
  "poppies": "mo05",
  "woman-with-parasol": "mo06",
});

const SEMANTIC_ARTWORK_IDS = Object.freeze({
  "mona-lisa": "ld01",
  "vermeer-girl-with-a-pearl-earring": "ve01",
  "van-gogh": "vg01",
  "monet-impression-sunrise": "mo01"
});

const UI = {
  en: {
    search: "Search by title, artist, technique, period...",
    allMovements: "All movements",
    reset: "Reset",
    results: "artworks",
    print: "Open printable artwork page",
    ar: "Image AR",
    space: "Room AR",
    audioOverview: "Audio Overview",
    vocabulary: "Vocabulary",
    noResults: "No artwork matches that search.",
    years: "years covered",
    modes: "active modes",
    printFirst: "printable artwork pages",
    by: "by",
    dimensions: "Dimensions",
    location: "Location",
    palette: "Palette",
    technique: "Technique",
    context: "Context",
    semantic: "Explore semantic graph",
    showAll: "Show all {count} artworks",
    showLess: "Show fewer artworks"
    , museums: "MUSEUMS", museumsIntro: "Discover the institutions that preserve these paintings and open their architectural models in VR, image AR, or spatial AR.", museumVr: "Museum VR", museumAr: "Image AR", museumSpace: "Space AR"
  },
  fr: {
    search: "Rechercher par titre, artiste, technique, période...",
    allMovements: "Tous les mouvements",
    reset: "Réinitialiser",
    results: "œuvres",
    print: "Ouvrir la page imprimable",
    ar: "RA sur image",
    space: "RA dans l’espace",
    audioOverview: "Aperçu audio",
    vocabulary: "Vocabulaire",
    noResults: "Aucune œuvre ne correspond à cette recherche.",
    years: "années couvertes",
    modes: "modes actifs",
    printFirst: "pages d’œuvres imprimables",
    by: "par",
    dimensions: "Dimensions",
    location: "Lieu",
    palette: "Palette",
    technique: "Technique",
    context: "Contexte",
    semantic: "Explorer le graphe sémantique",
    showAll: "Afficher les {count} œuvres",
    showLess: "Réduire la collection"
    , museums: "MUSÉES", museumsIntro: "Découvrez les institutions qui conservent ces tableaux et ouvrez leurs modèles architecturaux en VR, RA sur image ou RA dans l’espace.", museumVr: "VR du musée", museumAr: "RA sur image", museumSpace: "RA dans l’espace"
  },
  ar: {
    search: "ابحث بالعنوان أو الفنان أو التقنية أو الفترة...",
    allMovements: "جميع الحركات الفنية",
    reset: "إعادة الضبط",
    results: "لوحات",
    print: "فتح صفحة العمل القابلة للطباعة",
    ar: "واقع معزز",
    space: "وضع في المساحة",
    audioOverview: "الدليل الصوتي",
    vocabulary: "المفردات",
    noResults: "لا توجد لوحة مطابقة لهذا البحث.",
    years: "سنة تغطيها المجموعة",
    modes: "تجارب متاحة",
    printFirst: "صفحات أعمال قابلة للطباعة",
    by: "للفنان",
    dimensions: "الأبعاد",
    location: "الموقع",
    palette: "الألوان",
    technique: "التقنية",
    context: "السياق",
    semantic: "استكشف الرسم البياني الدلالي",
    showAll: "عرض الأعمال الفنية وعددها {count}",
    showLess: "عرض أعمال أقل"
    , museums: "المتاحف", museumsIntro: "اكتشف المتاحف التي تحفظ هذه اللوحات وافتح نماذجها المعمارية في الواقع الافتراضي أو المعزز.", museumVr: "واقع افتراضي", museumAr: "واقع معزز بالصورة", museumSpace: "واقع معزز مكاني"
  }
};

const FR_TITLES = {
  "mona-lisa": "La Joconde",
  "van-gogh": "Autoportrait",
  "van-gogh-bedroom": "La Chambre",
  "vermeer-girl-with-a-pearl-earring": "La Jeune Fille à la perle",
  "monet-impression-sunrise": "Impression, soleil levant"
  ,"lady-with-an-ermine": "La Dame à l’hermine", "view-of-delft": "Vue de Delft", "pont-d-argenteuil": "Le Pont d’Argenteuil"
};

const FR_SUMMARIES = {
  "mona-lisa": "De dimensions modestes mais d’une ambition immense, La Joconde réunit innovation technique, profondeur psychologique et observation scientifique. Son expression changeante, son paysage atmosphérique et ses transitions presque imperceptibles donnent au portrait une présence vivante.",
  "last-supper": "L’annonce de la trahison par le Christ déclenche une succession de réactions distinctes parmi les apôtres, tandis que sa figure immobile ancre toute la composition.",
  "belle-ferronniere": "Le regard latéral, le contour ferme et le modelé subtil de la jeune femme composent une présence attentive, assurée et psychologiquement immédiate.",
  "lady-with-an-ermine": "Cecilia se tourne comme si quelqu’un venait d’entrer. Le mouvement de l’hermine, sa longue main et la lumière dirigée donnent au portrait la vivacité d’un instant saisi.",
  "ginevra-de-benci": "Sa présence directe et son expression réservée remplacent le portrait de profil conventionnel par une immédiateté psychologique nouvelle.",
  "annunciation": "La précision des plantes, la délicatesse des ailes et le paysage atmosphérique lointain unissent observation attentive et récit sacré.",
  "vermeer-astronomer": "Le savant tend la main vers un globe céleste tandis que la lumière de la fenêtre transforme la pensée en action visible.",
  "art-of-painting": "Un rideau nous introduit dans une rencontre mise en scène entre le peintre et un modèle qui incarne l’Histoire.",
  "vermeer-girl-with-a-pearl-earring": "La jeune fille se retourne au moment même de la rencontre. Ses lèvres entrouvertes, son regard direct et les contours adoucis rendent sa présence immédiate tout en maintenant son identité insaisissable.",
  "woman-holding-balance": "La balance vide, la main suspendue et le visage calme transforment la pesée matérielle en méditation sur le jugement.",
  "view-of-delft": "Un vaste ciel domine la scène. Les nuages alternent ombre et lumière sur le front d’eau, tandis que les reflets et les petites figures ralentissent le regard.",
  "vermeer-milkmaid": "Le filet de lait régulier et la concentration de la servante donnent l’impression que le temps s’est suspendu.",
  "van-gogh": "Van Gogh place son visage devant un champ turquoise et vert. La barbe orangée forme un contrepoint complémentaire, tandis que les touches ondulantes intensifient la force psychologique du regard.",
  "starry-night": "Les étoiles tourbillonnantes et le mouvement du ciel transforment le paysage observé en une puissante vision intérieure.",
  "van-gogh-bedroom": "La perspective déformée, les angles accentués, les aplats colorés et les contours vigoureux transforment la chambre de la Maison jaune en un espace profondément subjectif et émotionnel.",
  "cafe-terrace": "La terrasse jaune avance devant la rue bleue et le ciel étoilé, faisant de la couleur elle-même le véritable sujet du tableau.",
  "night-cafe": "Les couleurs âpres, le sol presque vide et les figures isolées transforment la salle en une image de fatigue et de malaise.",
  "sunflowers": "Les fleurs, montrées à différents stades d’épanouissement et de déclin, transforment un simple vase en méditation sur la vitalité et le temps.",
  "water-lilies": "Le ciel, les arbres, les fleurs et l’eau se confondent jusqu’à donner au reflet autant de présence qu’au paysage.",
  "japanese-bridge": "L’arche du pont apporte une structure calme au milieu du feuillage dense, des reflets et des nymphéas flottants.",
  "woman-with-parasol": "Le point de vue bas, le voile en mouvement et l’ombrelle inclinée donnent à la rencontre une impression immédiate, traversée par le vent.",
  "pont-d-argenteuil": "La géométrie ferme du pont traverse la composition, tandis que les voiles, les rides de l’eau et les reflets maintiennent la scène en mouvement.",
  "poppies": "Les coquelicots rouges dispersés animent un champ balayé par la brise, où les figures semblent absorbées par la lumière et le temps.",
  "monet-impression-sunrise": "Les barques sombres conduisent le regard vers les grues et les cheminées dissoutes dans la brume. Le soleil orange et son reflet vertical structurent les touches horizontales de l’eau."
};

const MOVEMENT_LABELS = {
  fr: {
    Renaissance: "Renaissance",
    "High Renaissance": "Haute Renaissance",
    "Dutch Golden Age": "Âge d’or néerlandais",
    Baroque: "Baroque",
    "Post-Impressionism": "Postimpressionnisme",
    Impressionism: "Impressionnisme"
  },
  ar: {
    Renaissance: "عصر النهضة",
    "High Renaissance": "عصر النهضة العليا",
    "Dutch Golden Age": "العصر الذهبي الهولندي",
    Baroque: "الباروك",
    "Post-Impressionism": "ما بعد الانطباعية",
    Impressionism: "الانطباعية"
  }
};

const FR_VOCABULARY = {
  "atmospheric perspective": "perspective atmosphérique",
  portraiture: "portrait",
  "High Renaissance": "Haute Renaissance",
  "poplar panel": "panneau de peuplier",
  pentimenti: "repentirs",
  "infrared reflectography": "réflectographie infrarouge",
  "multispectral imaging": "imagerie multispectrale",
  glaze: "glacis",
  "conservation ethics": "déontologie de la conservation",
  "peripheral vision": "vision périphérique",
  Impressionism: "Impressionnisme",
  "complementary colour": "couleurs complémentaires",
  atmosphere: "atmosphère",
  "Post-Impressionism": "Postimpressionnisme",
  interior: "intérieur",
  "complementary color": "couleurs complémentaires",
  "expressive perspective": "perspective expressive",
  "red lake pigment": "laque rouge",
  lining: "rentoilage",
  "technical imaging": "imagerie scientifique",
  "Yellow House": "Maison jaune",
  "Studio of the South": "Atelier du Midi",
  "self-portrait": "autoportrait",
  "complementary colors": "couleurs complémentaires",
  "broken brushwork": "touche fragmentée",
  "directional stroke": "touche directionnelle",
  "Dutch Golden Age": "Âge d’or néerlandais",
  ultramarine: "outremer",
  highlight: "rehaut",
  "camera obscura": "chambre noire",
  "conservation imaging": "imagerie de conservation"
};

const FR_ARTIST_NAMES = {
  "Leonardo da Vinci": "Léonard de Vinci"
};

const FR_LOCATION_LABELS = {
  "Musee du Louvre": "Musée du Louvre",
  "Uffizi Galleries": "Galeries des Offices",
  "The Hague": "La Haye",
  Netherlands: "Pays-Bas",
  Poland: "Pologne",
  Kraków: "Cracovie",
  London: "Londres"
};

const AR_TITLES = {
  "mona-lisa": "الموناليزا",
  "van-gogh": "بورتريه ذاتي",
  "van-gogh-bedroom": "غرفة النوم",
  "vermeer-girl-with-a-pearl-earring": "الفتاة ذات القرط اللؤلؤي"
  ,"lady-with-an-ermine": "السيدة ذات القاقم", "view-of-delft": "منظر دلفت", "monet-impression-sunrise": "انطباع، شروق الشمس", "pont-d-argenteuil": "جسر أرجنتوي"
};

const AR_SUMMARIES = {
  "mona-lisa": "بورتريه يجمع بين السفوماتو والمنظور الجوي وتعبير يتغير مع النظرة. تكشف اليدان والمنظر الطبيعي والابتسامة عن بحث ليوناردو الطويل في الضوء والحضور الإنساني.",
  "van-gogh": "يبني فان غوخ وجهه بضربات قصيرة وألوان متكاملة. يمنح التباين بين اللحية البرتقالية والخلفية الزرقاء الخضراء الصورة طاقة نفسية قوية.",
  "van-gogh-bedroom": "حوّل فان غوخ غرفته في البيت الأصفر إلى مساحة عاطفية. تجعل الزوايا المائلة والألوان المسطحة والأثاث القوي المكان أكثر تعبيراً من الواقع.",
  "vermeer-girl-with-a-pearl-earring": "هذه اللوحة دراسة لشخصية وليست بورتريهاً رسمياً. يخلق الضوء الناعم والأزرق الثمين والقرط اللامع لحظة لقاء مباشرة مع المشاهد."
};

const AR_METADATA = {
  "mona-lisa": { artist: "ليوناردو دافنشي", date: "نحو 1503–1519", location: "متحف اللوفر، باريس" },
  "van-gogh": { artist: "فنسنت فان غوخ", date: "1889", location: "متحف أورسي، باريس" },
  "van-gogh-bedroom": { artist: "فنسنت فان غوخ", date: "أكتوبر 1888", location: "متحف فان غوخ، أمستردام" },
  "vermeer-girl-with-a-pearl-earring": { artist: "يوهانس فيرمير", date: "نحو 1665", location: "موريتشهاوس، لاهاي" }
};

const LOCALIZABLE_TEXT_FIELDS = Object.freeze([
  "historicalContext",
  "artisticAnalysis",
  "palette",
  "perspectiveTechnique"
]);

export function normalizeCatalogueLanguage(value) {
  const language = String(value || "").trim().toLowerCase().split(/[-_]/)[0];
  return ["en", "fr", "ar"].includes(language) ? language : "en";
}

function asLocalization(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function firstPresentText(...values) {
  return values.find((value) => typeof value === "string" && value.trim()) || "";
}

function localizedArtistName(localization) {
  if (typeof localization.artist === "string") return localization.artist;
  return asLocalization(localization.artist).name;
}

function localizedLocationValue(localization, field) {
  return asLocalization(localization.currentLocation)[field] || localization[field];
}

function localizeMovementLabel(value, language) {
  return MOVEMENT_LABELS[language]?.[value] || value;
}

function localizeVocabularyLabel(value, language) {
  return language === "fr" ? (FR_VOCABULARY[value] || value) : value;
}

function localizeArtistLabel(value, language) {
  return language === "fr" ? (FR_ARTIST_NAMES[value] || value) : value;
}

function localizeLocationLabel(value, language) {
  return language === "fr" ? (FR_LOCATION_LABELS[value] || value) : value;
}

function localizeDateLabel(value, language) {
  if (language !== "fr") return value;
  if (value === "October 1888") return "octobre 1888";
  return value.replace(/^c\.\s*/i, "vers ");
}

function getLegacyLocalization(manifest, language) {
  const slug = manifest.slug;
  if (language === "fr") {
    return {
      title: FR_TITLES[slug],
      artisticAnalysis: FR_SUMMARIES[slug]
    };
  }
  if (language !== "ar") return {};

  const metadata = AR_METADATA[slug] || {};
  return {
    title: AR_TITLES[slug],
    artist: metadata.artist,
    date: metadata.date,
    location: metadata.location,
    artisticAnalysis: AR_SUMMARIES[slug]
  };
}

export function localizeCatalogueEntry(source, requestedLanguage) {
  const manifest = asLocalization(source);
  const language = normalizeCatalogueLanguage(requestedLanguage);
  const localizations = asLocalization(manifest.localizations);
  const requested = asLocalization(localizations[language]);
  const english = asLocalization(localizations.en);
  const legacy = getLegacyLocalization(manifest, language);
  const result = { ...manifest };

  result.title = firstPresentText(requested.title, legacy.title, english.title, manifest.title);
  result.date = localizeDateLabel(
    firstPresentText(requested.date, legacy.date, english.date, manifest.date),
    language
  );
  result.medium = firstPresentText(requested.medium, english.medium, manifest.medium);

  const artistName = localizeArtistLabel(firstPresentText(
    localizedArtistName(requested),
    legacy.artist,
    localizedArtistName(english),
    manifest.artist?.name
  ), language);
  if (manifest.artist || artistName) result.artist = { ...asLocalization(manifest.artist), name: artistName };

  if (manifest.currentLocation || requested.currentLocation || english.currentLocation || legacy.location) {
    result.currentLocation = { ...asLocalization(manifest.currentLocation) };
    if (legacy.location) {
      result.currentLocation = { ...result.currentLocation, museum: legacy.location, city: "", country: "" };
    } else {
      for (const field of ["museum", "city", "country"]) {
        result.currentLocation[field] = localizeLocationLabel(firstPresentText(
          localizedLocationValue(requested, field),
          localizedLocationValue(english, field),
          manifest.currentLocation?.[field]
        ), language);
      }
    }
  }

  const requestedTexts = asLocalization(requested.texts);
  const englishTexts = asLocalization(english.texts);
  if (manifest.texts || requested.texts || english.texts || legacy.artisticAnalysis) {
    result.texts = { ...asLocalization(manifest.texts) };
    for (const field of LOCALIZABLE_TEXT_FIELDS) {
      result.texts[field] = firstPresentText(
        requestedTexts[field],
        field === "artisticAnalysis" ? legacy.artisticAnalysis : "",
        englishTexts[field],
        manifest.texts?.[field]
      );
    }
  }

  result.localizedMovement = (manifest.movement || [])
    .map((movement) => localizeMovementLabel(movement, language));
  result.localizedVocabulary = (manifest.education?.vocabulary || [])
    .map((term) => localizeVocabularyLabel(term, language));

  return result;
}

const app = typeof document === "undefined" ? null : document.getElementById("catalogue-app");

if (app) initCatalogue(app);

async function initCatalogue(root) {
  const lang = normalizeCatalogueLanguage(root.dataset.lang);
  const text = UI[lang];
  const manifestPaths = root.dataset.manifests.split(",").map((item) => item.trim()).filter(Boolean);

  try {
    const museumPaths = root.dataset.compact === "true"
      ? []
      : (root.dataset.museums || "").split(",").map((item) => item.trim()).filter(Boolean);
    const [manifests, museums] = await Promise.all([
      Promise.all(manifestPaths.map(loadManifest)),
      Promise.all(museumPaths.map(loadManifest))
    ]);
    root.dataset.ready = "true";
    document.querySelector(".static-index")?.setAttribute("hidden", "");
    const localizedManifests = manifests
      .flat()
      .map((manifest) => localizeCatalogueEntry(manifest, lang))
      .sort((a, b) => a.bookOrder - b.bookOrder);
    const manifestsWithAudio = await Promise.all(localizedManifests.map(async (manifest) => ({
      ...manifest,
      audioOverviewUrl: await resolveArtworkAudioOverview({
        artworkId: AUDIO_ARTWORK_IDS[manifest.slug],
        language: lang,
      }),
    })));
    renderCatalogue(root, manifestsWithAudio, museums, lang, text);
  } catch (error) {
    root.innerHTML = `<p class="catalogue-error">${escapeHtml(error.message)}</p>`;
  }
}

async function loadManifest(path) {
  const response = await fetch(path, { cache: "reload" });
  if (!response.ok) throw new Error(`Could not load ${path}: ${response.status}`);
  return response.json();
}

function renderCatalogue(root, manifests, museums, lang, text) {
  const movements = [...new Set(manifests.flatMap((item) => item.movement || []))].sort();
  const compact = root.dataset.compact === "true";
  const compactLimit = 8;
  const state = {
    query: "",
    movement: "",
    expanded: !compact
  };

  root.innerHTML = `
    <div class="catalogue-toolbar">
      <label class="search-field">
        <span>${text.search}</span>
        <input type="search" placeholder="${text.search}" />
      </label>
      <label class="filter-field">
        <span>${text.allMovements}</span>
        <select>
          <option value="">${text.allMovements}</option>
          ${movements.map((movement) => `<option value="${escapeHtml(movement)}">${escapeHtml(localizeMovementLabel(movement, lang))}</option>`).join("")}
        </select>
      </label>
      <button class="button" type="button" data-action="reset">${text.reset}</button>
    </div>
    <div class="collection-stats"></div>
    <div class="catalogue-layout">
      <div class="artwork-grid" id="catalogue-artworks"></div>
    </div>
    ${compact ? `<div class="catalogue-expand-row"><button class="button" type="button" data-action="expand" aria-controls="catalogue-artworks"></button></div>` : ""}
    ${compact ? "" : `<section class="museum-index-section">
      <header><p class="eyebrow">ARTDACI</p><h2>${text.museums}</h2><p>${text.museumsIntro}</p></header>
      <div class="museum-index-grid">${museums.map((museum) => renderMuseumCard(museum, lang, text)).join("")}</div>
    </section>`}
  `;

  const input = root.querySelector("input");
  const select = root.querySelector("select");
  const reset = root.querySelector("[data-action='reset']");
  const expand = root.querySelector("[data-action='expand']");

  input.addEventListener("input", () => {
    state.query = input.value.trim().toLowerCase();
    update();
  });

  select.addEventListener("change", () => {
    state.movement = select.value;
    update();
  });

  reset.addEventListener("click", () => {
    input.value = "";
    select.value = "";
    state.query = "";
    state.movement = "";
    state.expanded = !compact;
    update();
  });

  expand?.addEventListener("click", () => {
    state.expanded = !state.expanded;
    update();
  });

  function update() {
    const filtered = manifests.filter((manifest) => matchesCatalogueEntry(manifest, state));
    const filtering = Boolean(state.query || state.movement);
    const visible = compact && !state.expanded && !filtering
      ? filtered.slice(0, compactLimit)
      : filtered;
    root.querySelector(".collection-stats").innerHTML = renderStats(manifests, filtered, text);
    root.querySelector(".artwork-grid").innerHTML = filtered.length
      ? visible.map((manifest) => renderCard(manifest, lang, text)).join("")
      : `<p class="empty-results">${text.noResults}</p>`;
    if (expand) {
      expand.hidden = filtering || filtered.length <= compactLimit;
      expand.textContent = state.expanded
        ? text.showLess
        : text.showAll.replace("{count}", String(filtered.length));
      expand.setAttribute("aria-expanded", String(state.expanded));
    }
  }

  update();
}

function renderMuseumCard(museum, lang, text) {
  const localized = museum.localizations?.[lang] || {};
  const title = localized.title || museum.title;
  const body = localized.texts?.artisticAnalysis || museum.texts?.artisticAnalysis || "";
  const slug = museum.slug;
  return `<article class="museum-index-card">
    <img src="${escapeHtml(museum.media?.image)}" alt="${escapeHtml(title)}" loading="lazy" />
    <div><h3>${escapeHtml(title)}</h3><p>${escapeHtml(shorten(body, 190))}</p>
      <div class="card-actions">
        <a class="button primary" href="gallery-vr.html?lang=${lang}&amp;room=museums&amp;museum=${slug}">${text.museumVr}</a>
        <a class="button" href="ar.html?museum=${slug}&amp;lang=${lang}">${text.museumAr}</a>
        <a class="button" href="space.html?museum=${slug}&amp;lang=${lang}">${text.museumSpace}</a>
      </div>
    </div>
  </article>`;
}

export function matchesCatalogueEntry(manifest, state) {
  const query = String(state.query || "").trim().toLowerCase();
  const haystack = [
    manifest.title,
    manifest.artist?.name,
    manifest.date,
    manifest.medium,
    ...(manifest.movement || []),
    ...(manifest.localizedMovement || []),
    manifest.texts?.historicalContext,
    manifest.texts?.artisticAnalysis,
    manifest.texts?.palette,
    manifest.texts?.perspectiveTechnique,
    ...(manifest.education?.vocabulary || []),
    ...(manifest.localizedVocabulary || [])
  ].filter(Boolean).join(" ").toLowerCase();

  return (!query || haystack.includes(query))
    && (!state.movement || (manifest.movement || []).includes(state.movement));
}

function renderStats(all, filtered, text) {
  const years = all.map((item) => extractYear(item.date)).filter(Boolean);
  const modes = new Set(all.flatMap((item) => item.ar?.availableModes || []));
  const yearSpan = years.length ? Math.max(...years) - Math.min(...years) : 0;

  return `
    <div><strong>${filtered.length}</strong><span>${text.results}</span></div>
    <div><strong>${yearSpan}</strong><span>${text.years}</span></div>
    <div><strong>${modes.size}</strong><span>${text.modes}</span></div>
    <div><strong>${all.length}</strong><span>${text.printFirst}</span></div>
  `;
}

function renderCard(manifest, lang, text) {
  const slug = manifest.slug;
  const title = manifest.title;
  const image = manifest.media?.image || manifest.print?.imageTargetSource;
  const movement = (manifest.localizedMovement || manifest.movement || []).join(", ");
  const printUrl = PRINT_PAGES[lang]?.[slug] || PRINT_PAGES.en[slug] || `print-artwork.html?painting=${encodeURIComponent(slug)}&lang=${lang}`;
  const audioOverviewUrl = manifest.audioOverviewUrl;
  const location = [manifest.currentLocation?.museum, manifest.currentLocation?.city].filter(Boolean).join(", ");
  const summary = manifest.texts?.artisticAnalysis || manifest.texts?.historicalContext || "";
  const artist = manifest.artist?.name || "";
  const date = manifest.date || "";
  const displayLocation = location;
  const height = manifest.dimensions?.heightCm;
  const width = manifest.dimensions?.widthCm;
  const facts = [
    height && width ? `<div><dt>${text.dimensions}</dt><dd>${height} x ${width} cm</dd></div>` : "",
    displayLocation || movement ? `<div><dt>${text.location}</dt><dd>${escapeHtml(displayLocation || movement)}</dd></div>` : ""
  ].filter(Boolean).join("");
  const immersiveActions = getArtworkImmersiveActions(slug, lang, text)
    .map((action) => `<a class="button" href="${action.href}">${action.label}</a>`)
    .join("\n");
  const semanticArtworkId = SEMANTIC_ARTWORK_IDS[slug];
  const semanticAction = semanticArtworkId
    ? `<a class="button semantic-artwork-link" href="semantic/?artwork=${encodeURIComponent(semanticArtworkId)}&amp;lang=${encodeURIComponent(lang)}">${text.semantic}</a>`
    : "";

  return `
    <article class="artwork-card">
      <a class="artwork-image" href="${printUrl}">
        <img src="${escapeHtml(image)}" alt="${escapeHtml(title)}" loading="lazy" />
      </a>
      <div class="artwork-content">
        <p class="eyebrow">${formatArtworkNumber(manifest.bookOrder, lang)}</p>
        <h3>${escapeHtml(title)}</h3>
        <p class="card-meta">${escapeHtml(artist)}, ${escapeHtml(date)}</p>
        <p>${escapeHtml(shorten(summary, 210))}</p>
        ${facts ? `<dl class="mini-facts">${facts}</dl>` : ""}
        <div class="tag-strip">
          ${lang === "ar" ? "" : (manifest.localizedVocabulary || manifest.education?.vocabulary || []).slice(0, 4).map((item) => `<span>${escapeHtml(item)}</span>`).join("")}
        </div>
        <div class="card-actions">
          <a class="button primary" href="${printUrl}">${text.print}</a>
          ${immersiveActions}
          ${semanticAction}
          ${audioOverviewUrl ? `<a class="button" href="${escapeHtml(audioOverviewUrl)}">${text.audioOverview}</a>` : ""}
        </div>
      </div>
    </article>
  `;
}

export function getArtworkImmersiveActions(slug, lang, text = UI[lang] || UI.en) {
  if (slug === "monet-impression-sunrise") {
    return [{
      experience: "gallery",
      href: `gallery-vr.html?lang=${lang}&amp;artist=monet`,
      label: lang === "fr" ? "Salle Monet" : "Monet Room"
    }];
  }

  const artwork = IMMERSIVE_ARTWORKS.find((candidate) => candidate.runtimeSlug === slug);
  if (!artwork) return [];

  return [
    artwork.ar && { experience: "ar", href: `ar.html?painting=${slug}&amp;lang=${lang}`, label: text.ar },
    artwork.space && { experience: "space", href: `space.html?painting=${slug}&amp;lang=${lang}`, label: text.space }
  ].filter(Boolean);
}

function extractYear(value = "") {
  const match = String(value).match(/\d{4}/);
  return match ? Number(match[0]) : null;
}

function shorten(value, limit) {
  if (value.length <= limit) return value;
  return `${value.slice(0, limit - 1).trim()}...`;
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
