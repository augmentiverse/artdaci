import {
  getArtwork,
  getArtworkConceptEntries,
  getArtworkCulturalEntries,
  getCulturalEntity,
  getCulturalRelations,
  getConceptTypeGroups,
  getImageAnnotationProfile,
  getIconographicSubject,
  getArtworkIconographyEntries,
  getRegionIconographyEntries,
  getIconographyArtworks,
  getNodeExperiences,
  getImageRegion,
  getPedagogicalRelations,
  getRelatedArtworks,
  getRelatedConcepts,
  loadSemanticData,
  localize,
  normalizeLang,
  resolveKnowledgeNode,
  searchSemantic,
  searchSemanticNaturalLanguage
} from "./semantic-store.mjs";
import {
  fetchProviderRecord,
  getExternalMapping,
  mappingProviders,
  providerPageUrl,
  providersFromExternal
} from "./external-sources.mjs";
import { rerankWithNeuralEmbeddings } from "./embedding-client.mjs";
import { initIntelligentExplorer } from "./semantic-explorer.mjs";

const UI = {
  fr: {
    eyebrow: "ARTDACI Semantic · V2.8",
    title: "Explorer l’art par les relations",
    intro: "Naviguez directement dans le graphe : œuvres, techniques, mouvements et concepts se répondent dans un même espace.",
    choose: "Œuvre",
    searchLabel: "Recherche sémantique",
    searchPlaceholder: "Posez une question : où observer le sfumato ?",
    searchExamples: "Exemples",
    searchHybrid: "Recherche hybride",
    searchModeLocal: "graphe + vecteur local",
    searchModeNeural: "graphe + embeddings neuronaux",
    searchIntentObserve: "observer",
    searchIntentCompare: "comparer",
    searchIntentExperience: "expériences",
    searchIntentLocation: "localiser",
    searchIntentExplain: "comprendre",
    searchIntentExplore: "explorer",
    searchRegion: "Région IIIF",
    searchExperience: "Expérience ARTDACI",
    searchReasonGraph: "graphe",
    searchReasonVector: "similarité",
    searchReasonEmbedding: "embedding",
    searchReasonPedagogy: "pédagogie",
    searchReasonAlias: "terme reconnu",
    searchReasonExperience: "expérience",
    searchReasonText: "texte",
    graphTitle: "Graphe sémantique",
    graphIntro: "Cliquez sur un nœud pour recentrer le graphe.",
    backArtwork: "Revenir à l’œuvre",
    all: "Tous",
    centralNode: "Nœud central",
    profile: "Profil sémantique détaillé",
    profileHint: "Afficher les concepts pondérés de l’œuvre",
    relatedArtworks: "Œuvres reliées",
    shared: "concepts communs",
    paths: "Chemins sémantiques",
    weightedScore: "proximité",
    definition: "Définition",
    relations: "Relations",
    artworkOverview: "Vue d’ensemble",
    openProfile: "Voir le profil détaillé",
    source: "Définition éditoriale ARTDACI",
    provider: "Memodata / TID prévu comme provider potentiel, désactivé dans V2.8",
    externalSources: "Sources externes",
    sourceLoading: "Vérification des sources…",
    sourceUnavailable: "Source momentanément indisponible",
    sourceLive: "données en direct",
    sourceLinked: "identifiant lié",
    sourceOpen: "Ouvrir la source",
    linkedArt: "Linked Art JSON-LD",
    imageExplore: "Explorer l’image",
    imageRegions: "Régions sémantiques",
    imageHint: "Sélectionnez une zone du tableau pour découvrir les concepts qui lui sont associés.",
    iiifManifest: "Manifeste IIIF",
    closeImage: "Fermer",
    regionConcepts: "Concepts associés",
    exploreConcept: "Explorer dans le graphe",
    externalSuggestions: "Suggestions externes",
    showExternal: "Afficher dans le graphe",
    hideExternal: "Masquer les suggestions",
    externalProposed: "proposé par une source externe",
    back: "Retour à ARTDACI",
    loading: "Chargement du graphe…",
    error: "Impossible de charger les données sémantiques.",
    noResults: "Aucun résultat",
    results: "Résultats",
    core: "central",
    supporting: "important",
    contextual: "contextuel",
    weight: "poids",
    broader: "plus large",
    narrower: "plus précis",
    related: "associé à",
    enables: "permet",
    expresses: "exprime",
    contrastsWith: "contraste avec",
    associatedWith: "associé à",
    dependsOn: "dépend de",
    sharedRelation: "partagé",
    noImage: "Image 1889 indisponible",
    noImageNote: "vg01 utilise l’Autoportrait de 1889 du Musée d’Orsay ; cette notice s’affiche seulement si l’image ne peut pas être chargée.",
    artists: "Artistes",
    museums: "Musées",
    places: "Lieux",
    subjects: "Sujets",
    events: "Événements",
    createdBy: "créé par",
    created: "a créé",
    heldBy: "conservé à",
    holds: "conserve",
    locatedIn: "situé à",
    locationOf: "lieu de",
    associatedWithPlace: "associé à",
    placeAssociatedWith: "lié à",
    depictsSubject: "représente",
    depictedIn: "représenté dans",
    creationEvent: "création",
    eventFor: "concerne",
    carriedOutBy: "réalisé par",
    carriedOut: "a réalisé",
    concernsArtwork: "concerne",
    concernedBy: "concerné par",
    occurredAt: "a eu lieu à",
    siteOf: "lieu de",
    periods: "Périodes",
    movements: "Mouvements",
    genres: "Genres",
    techniques: "Techniques",
    visualConcepts: "Concepts",
    media: "Médiums",
    supports: "Supports",
    iconography: "Iconographie",
    iconographicSubjects: "Sujets représentés",
    motifs: "Motifs",
    depictedObjects: "Objets représentés",
    depicts: "représente",
    hasMotif: "motif",
    containsObject: "contient",
    depictedBy: "représenté dans",
    motifOf: "motif de",
    objectIn: "objet dans",
    iconclassNotation: "Notation Iconclass",
    iconclassSource: "Référence iconographique",
    coOccurs: "co-représenté avec",
    experiences: "Expériences ARTDACI",
    experiencesHint: "Continuer dans le Web, l’AR, la VR, GEO, la 3D ou le livre.",
    experienceAvailable: "expérience disponible",
    channelWeb: "Web",
    channelAr: "AR",
    channelSpaceAr: "AR espace",
    channelVr: "VR",
    channelGeo: "GEO",
    channel3d: "3D",
    channelBook: "Livre",
    channelVideo: "Vidéo",
    channelVrWorld: "Monde VR",
    pedagogy: "Pédagogie",
    pedagogyHint: "Relations ARTDACI conçues pour apprendre, observer et comparer.",
    pedagogyShow: "Afficher la pédagogie",
    pedagogyHide: "Masquer la pédagogie",
    pedagogicalQuestion: "Question d’observation",
    helpsUnderstand: "aide à comprendre",
    helpsUnderstandIncoming: "mieux compris grâce à",
    observeIn: "observer dans",
    observeInIncoming: "zone d’observation pour",
    compareWith: "comparer avec",
    contrastForLearning: "mettre en contraste avec",
    buildsOn: "permet d’aborder",
    buildsOnIncoming: "approfondi depuis",
    fromDetailToConcept: "du détail vers le concept",
    fromDetailToConceptIncoming: "compris à partir du détail"
  },
  en: {
    eyebrow: "ARTDACI Semantic · V2.8",
    title: "Explore art through relationships",
    intro: "Navigate directly through the graph: artworks, techniques, movements, and concepts share one compact workspace.",
    choose: "Artwork",
    searchLabel: "Semantic search",
    searchPlaceholder: "Ask a question: where can I observe sfumato?",
    searchExamples: "Examples",
    searchHybrid: "Hybrid search",
    searchModeLocal: "graph + local vector",
    searchModeNeural: "graph + neural embeddings",
    searchIntentObserve: "observe",
    searchIntentCompare: "compare",
    searchIntentExperience: "experiences",
    searchIntentLocation: "locate",
    searchIntentExplain: "understand",
    searchIntentExplore: "explore",
    searchRegion: "IIIF region",
    searchExperience: "ARTDACI experience",
    searchReasonGraph: "graph",
    searchReasonVector: "similarity",
    searchReasonEmbedding: "embedding",
    searchReasonPedagogy: "pedagogy",
    searchReasonAlias: "recognized term",
    searchReasonExperience: "experience",
    searchReasonText: "text",
    graphTitle: "Semantic graph",
    graphIntro: "Click a node to recenter the graph.",
    backArtwork: "Back to artwork",
    all: "All",
    centralNode: "Central node",
    profile: "Detailed semantic profile",
    profileHint: "Show the artwork’s weighted concepts",
    relatedArtworks: "Related artworks",
    shared: "shared concepts",
    paths: "Semantic paths",
    weightedScore: "proximity",
    definition: "Definition",
    relations: "Relations",
    artworkOverview: "Overview",
    openProfile: "View detailed profile",
    source: "ARTDACI editorial definition",
    provider: "Memodata / TID is modeled as a potential provider and remains disabled in V2.8",
    externalSources: "External sources",
    sourceLoading: "Checking sources…",
    sourceUnavailable: "Source temporarily unavailable",
    sourceLive: "live data",
    sourceLinked: "linked identifier",
    sourceOpen: "Open source",
    linkedArt: "Linked Art JSON-LD",
    imageExplore: "Explore image",
    imageRegions: "Semantic regions",
    imageHint: "Select an area of the painting to discover its associated concepts.",
    iiifManifest: "IIIF Manifest",
    closeImage: "Close",
    regionConcepts: "Related concepts",
    exploreConcept: "Explore in graph",
    externalSuggestions: "External suggestions",
    showExternal: "Show in graph",
    hideExternal: "Hide suggestions",
    externalProposed: "proposed by an external source",
    back: "Back to ARTDACI",
    loading: "Loading graph…",
    error: "Semantic data could not be loaded.",
    noResults: "No results",
    results: "Results",
    core: "core",
    supporting: "important",
    contextual: "contextual",
    weight: "weight",
    broader: "broader than",
    narrower: "narrower than",
    related: "related to",
    enables: "enables",
    expresses: "expresses",
    contrastsWith: "contrasts with",
    associatedWith: "associated with",
    dependsOn: "depends on",
    sharedRelation: "shared",
    noImage: "1889 image unavailable",
    noImageNote: "vg01 uses the 1889 Musée d’Orsay Self-Portrait; this notice appears only if the image cannot be loaded.",
    artists: "Artists",
    museums: "Museums",
    places: "Places",
    subjects: "Subjects",
    events: "Events",
    createdBy: "created by",
    created: "created",
    heldBy: "held by",
    holds: "holds",
    locatedIn: "located in",
    locationOf: "location of",
    associatedWithPlace: "associated with",
    placeAssociatedWith: "associated place",
    depictsSubject: "depicts",
    depictedIn: "depicted in",
    creationEvent: "creation event",
    eventFor: "event for",
    carriedOutBy: "carried out by",
    carriedOut: "carried out",
    concernsArtwork: "concerns",
    concernedBy: "concerned by",
    occurredAt: "occurred at",
    siteOf: "site of",
    periods: "Periods",
    movements: "Movements",
    genres: "Genres",
    techniques: "Techniques",
    visualConcepts: "Concepts",
    media: "Media",
    supports: "Supports",
    iconography: "Iconography",
    iconographicSubjects: "Depicted subjects",
    motifs: "Motifs",
    depictedObjects: "Depicted objects",
    depicts: "depicts",
    hasMotif: "motif",
    containsObject: "contains",
    depictedBy: "depicted in",
    motifOf: "motif of",
    objectIn: "object in",
    iconclassNotation: "Iconclass notation",
    iconclassSource: "Iconographic reference",
    coOccurs: "co-occurs with",
    experiences: "ARTDACI experiences",
    experiencesHint: "Continue in Web, AR, VR, GEO, 3D, or the living book.",
    experienceAvailable: "experience available",
    channelWeb: "Web",
    channelAr: "AR",
    channelSpaceAr: "Space AR",
    channelVr: "VR",
    channelGeo: "GEO",
    channel3d: "3D",
    channelBook: "Book",
    channelVideo: "Video",
    channelVrWorld: "VR world",
    pedagogy: "Pedagogy",
    pedagogyHint: "ARTDACI relationships designed for learning, observation, and comparison.",
    pedagogyShow: "Show pedagogy",
    pedagogyHide: "Hide pedagogy",
    pedagogicalQuestion: "Observation question",
    helpsUnderstand: "helps understand",
    helpsUnderstandIncoming: "better understood through",
    observeIn: "observe in",
    observeInIncoming: "observation region for",
    compareWith: "compare with",
    contrastForLearning: "contrast for learning with",
    buildsOn: "builds understanding toward",
    buildsOnIncoming: "deepened from",
    fromDetailToConcept: "from detail to concept",
    fromDetailToConceptIncoming: "understood from the detail"
  },
  ar: {
    eyebrow: "ARTDACI Semantic · V2.8",
    title: "استكشاف الفن عبر العلاقات",
    intro: "تنقل مباشرة داخل الشبكة: الأعمال والتقنيات والحركات والمفاهيم ضمن مساحة واحدة ومكثفة.",
    choose: "العمل",
    searchLabel: "بحث دلالي",
    searchPlaceholder: "اطرح سؤالًا: أين ألاحظ السفوماتو؟",
    searchExamples: "أمثلة",
    searchHybrid: "بحث هجين",
    searchModeLocal: "الرسم البياني + متجه محلي",
    searchModeNeural: "الرسم البياني + تضمينات عصبية",
    searchIntentObserve: "ملاحظة",
    searchIntentCompare: "مقارنة",
    searchIntentExperience: "تجارب",
    searchIntentLocation: "تحديد المكان",
    searchIntentExplain: "فهم",
    searchIntentExplore: "استكشاف",
    searchRegion: "منطقة IIIF",
    searchExperience: "تجربة ARTDACI",
    searchReasonGraph: "الرسم البياني",
    searchReasonVector: "تشابه",
    searchReasonEmbedding: "تضمين",
    searchReasonPedagogy: "بيداغوجيا",
    searchReasonAlias: "مصطلح معروف",
    searchReasonExperience: "تجربة",
    searchReasonText: "نص",
    graphTitle: "الشبكة الدلالية",
    graphIntro: "انقر على عقدة لإعادة تمركز الشبكة.",
    backArtwork: "العودة إلى العمل",
    all: "الكل",
    centralNode: "العقدة المركزية",
    profile: "الملف الدلالي المفصل",
    profileHint: "إظهار المفاهيم المرجحة للعمل",
    relatedArtworks: "أعمال مترابطة",
    shared: "مفاهيم مشتركة",
    paths: "مسارات دلالية",
    weightedScore: "القرب",
    definition: "التعريف",
    relations: "العلاقات",
    artworkOverview: "نظرة عامة",
    openProfile: "عرض الملف المفصل",
    source: "تعريف تحريري من ARTDACI",
    provider: "Memodata / TID مزود محتمل ويبقى معطلاً في V2.8",
    externalSources: "المصادر الخارجية",
    sourceLoading: "جارٍ التحقق من المصادر…",
    sourceUnavailable: "المصدر غير متاح مؤقتًا",
    sourceLive: "بيانات مباشرة",
    sourceLinked: "معرف مرتبط",
    sourceOpen: "فتح المصدر",
    linkedArt: "Linked Art JSON-LD",
    imageExplore: "استكشاف الصورة",
    imageRegions: "مناطق دلالية",
    imageHint: "اختر منطقة من اللوحة لاكتشاف المفاهيم المرتبطة بها.",
    iiifManifest: "بيان IIIF",
    closeImage: "إغلاق",
    regionConcepts: "المفاهيم المرتبطة",
    exploreConcept: "استكشاف في الشبكة",
    externalSuggestions: "اقتراحات خارجية",
    showExternal: "إظهارها في الشبكة",
    hideExternal: "إخفاء الاقتراحات",
    externalProposed: "مقترح من مصدر خارجي",
    back: "العودة إلى ARTDACI",
    loading: "جارٍ تحميل الشبكة…",
    error: "تعذر تحميل البيانات الدلالية.",
    noResults: "لا توجد نتائج",
    results: "النتائج",
    core: "محوري",
    supporting: "مهم",
    contextual: "سياقي",
    weight: "الوزن",
    broader: "أوسع من",
    narrower: "أدق من",
    related: "مرتبط بـ",
    enables: "يتيح",
    expresses: "يعبّر عن",
    contrastsWith: "يتباين مع",
    associatedWith: "مرتبط بـ",
    dependsOn: "يعتمد على",
    sharedRelation: "مشترك",
    noImage: "صورة 1889 غير متاحة",
    noImageNote: "يستخدم vg01 بورتريه 1889 المحفوظ في متحف أورسي؛ تظهر هذه الملاحظة فقط إذا تعذر تحميل الصورة.",
    artists: "الفنانون",
    museums: "المتاحف",
    places: "الأماكن",
    subjects: "الموضوعات",
    events: "الأحداث",
    createdBy: "أنجزه",
    created: "أنجز",
    heldBy: "محفوظ في",
    holds: "يضم",
    locatedIn: "يوجد في",
    locationOf: "موقع",
    associatedWithPlace: "مرتبط بـ",
    placeAssociatedWith: "مكان مرتبط",
    depictsSubject: "يمثل",
    depictedIn: "مُمثل في",
    creationEvent: "حدث الإنشاء",
    eventFor: "حدث يخص",
    carriedOutBy: "أنجزه",
    carriedOut: "أنجز",
    concernsArtwork: "يخص",
    concernedBy: "مرتبط بـ",
    occurredAt: "حدث في",
    siteOf: "مكان الحدث",
    periods: "الفترات",
    movements: "الحركات",
    genres: "الأنواع",
    techniques: "التقنيات",
    visualConcepts: "المفاهيم",
    media: "الوسائط",
    supports: "الدعامات",
    iconography: "الأيقونوغرافيا",
    iconographicSubjects: "الموضوعات الممثلة",
    motifs: "العناصر الأيقونوغرافية",
    depictedObjects: "الأشياء الممثلة",
    depicts: "يمثل",
    hasMotif: "عنصر",
    containsObject: "يتضمن",
    depictedBy: "مُمثل في",
    motifOf: "عنصر في",
    objectIn: "شيء في",
    iconclassNotation: "ترميز Iconclass",
    iconclassSource: "مرجع أيقونوغرافي",
    coOccurs: "يظهر مع",
    experiences: "تجارب ARTDACI",
    experiencesHint: "تابع الاستكشاف عبر الويب أو الواقع المعزز أو الافتراضي أو GEO أو 3D أو الكتاب.",
    experienceAvailable: "تجربة متاحة",
    channelWeb: "ويب",
    channelAr: "AR",
    channelSpaceAr: "AR مكاني",
    channelVr: "VR",
    channelGeo: "GEO",
    channel3d: "3D",
    channelBook: "كتاب",
    channelVideo: "فيديو",
    channelVrWorld: "عالم VR",
    pedagogy: "البيداغوجيا",
    pedagogyHint: "علاقات ARTDACI صُممت للتعلم والملاحظة والمقارنة.",
    pedagogyShow: "إظهار العلاقات التعليمية",
    pedagogyHide: "إخفاء العلاقات التعليمية",
    pedagogicalQuestion: "سؤال للملاحظة",
    helpsUnderstand: "يساعد على فهم",
    helpsUnderstandIncoming: "يُفهم بشكل أفضل عبر",
    observeIn: "يُلاحظ في",
    observeInIncoming: "منطقة ملاحظة لـ",
    compareWith: "قارن مع",
    contrastForLearning: "ضع في مقابلة تعليمية مع",
    buildsOn: "يمهد لفهم",
    buildsOnIncoming: "يُعمّق انطلاقًا من",
    fromDetailToConcept: "من التفصيل إلى المفهوم",
    fromDetailToConceptIncoming: "يُفهم انطلاقًا من التفصيل"
  }
};

const TYPE_LABELS = {
  period: "periods",
  movement: "movements",
  genre: "genres",
  technique: "techniques",
  concept: "visualConcepts",
  medium: "media",
  support: "supports"
};

const CULTURAL_TYPE_LABELS = {
  artist: "artists",
  museum: "museums",
  place: "places",
  subject: "subjects",
  event: "events"
};

const ICONOGRAPHY_TYPE_LABELS = {
  "iconographic-subject": "iconographicSubjects",
  motif: "motifs",
  "depicted-object": "depictedObjects"
};

const GRAPH_TYPES = ["period", "movement", "genre", "technique", "concept", "medium", "support", "artist", "museum", "place", "subject", "event", "iconographic-subject", "motif", "depicted-object"];

const params = new URLSearchParams(location.search);
const lang = normalizeLang(params.get("lang") || document.documentElement.lang || "fr");
const t = UI[lang];
document.documentElement.lang = lang;
document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";

const q = (selector, root = document) => root.querySelector(selector);
const app = q("[data-semantic-app]");
const status = q("[data-semantic-status]");
const backLink = q("[data-back-link]");

backLink.href = lang === "en" ? "../index.html" : lang === "ar" ? "../index-ar.html" : "../index-fr.html";
backLink.textContent = t.back;
q("[data-eyebrow]").textContent = t.eyebrow;
q("[data-page-title]").textContent = t.title;
q("[data-intro]").textContent = t.intro;
status.textContent = t.loading;

const graphState = {
  artworkId: null,
  centerConceptId: null,
  centerEntityId: null,
  centerIconographyId: null,
  activeTypes: new Set(GRAPH_TYPES),
  externalSuggestions: [],
  externalVisible: false,
  pedagogyVisible: true
};

let semanticData = null;

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[ch]);
}

function urlFor(artworkId, targetLang = lang, regionId = null) {
  const base = `?artwork=${encodeURIComponent(artworkId)}&lang=${encodeURIComponent(targetLang)}`;
  return regionId ? `${base}&region=${encodeURIComponent(regionId)}` : base;
}
function relationLabel(type) {
  return type === "shared" ? t.sharedRelation : (t[type] || type);
}

function typeLabel(type) {
  return t[TYPE_LABELS[type]] || t[CULTURAL_TYPE_LABELS[type]] || t[ICONOGRAPHY_TYPE_LABELS[type]] || type;
}

function iconographyRelationLabel(type, direction = "outgoing") {
  const reverse = {
    depicts: "depictedBy",
    hasMotif: "motifOf",
    containsObject: "objectIn"
  };
  const key = direction === "incoming" ? (reverse[type] || type) : type;
  return t[key] || key;
}

function culturalRelationLabel(type, direction = "outgoing") {
  const reverse = {
    createdBy: "created",
    heldBy: "holds",
    locatedIn: "locationOf",
    associatedWithPlace: "placeAssociatedWith",
    depictsSubject: "depictedIn",
    creationEvent: "eventFor",
    carriedOutBy: "carriedOut",
    concernsArtwork: "concernedBy",
    occurredAt: "siteOf"
  };
  const key = direction === "incoming" ? (reverse[type] || type) : type;
  return t[key] || key;
}

function pedagogicalRelationLabel(type, direction = "outgoing") {
  if (direction === "incoming") {
    const reverseKey = {
      helpsUnderstand: "helpsUnderstandIncoming",
      observeIn: "observeInIncoming",
      buildsOn: "buildsOnIncoming",
      fromDetailToConcept: "fromDetailToConceptIncoming"
    }[type];
    if (reverseKey) return t[reverseKey] || type;
  }
  return t[type] || type;
}

function pedagogicalNeighbor(data, relation) {
  const resolved = resolveKnowledgeNode(data, relation.neighborId);
  if (resolved) return { kind: "node", resolved };
  const region = getImageRegion(data, relation.neighborId);
  if (region) return { kind: "region", region };
  return null;
}

function pedagogicalTargetLabel(data, entry) {
  if (!entry) return "";
  if (entry.kind === "node") return knowledgeNodeLabel(data, entry.resolved);
  return localize(entry.region.labels, lang);
}

function pedagogicalRelationsMarkup(data, nodeId) {
  const relations = getPedagogicalRelations(data, nodeId)
    .map((relation) => ({ relation, entry: pedagogicalNeighbor(data, relation) }))
    .filter((item) => item.entry)
    .slice(0, 6);
  if (!relations.length) return "";

  return `
    <section class="pedagogical-relations">
      <div class="pedagogical-relations-head">
        <div>
          <h3>${esc(t.pedagogy)}</h3>
          <p>${esc(t.pedagogyHint)}</p>
        </div>
        <span>ARTDACI</span>
      </div>
      <div class="pedagogical-relation-list">
        ${relations.map(({ relation, entry }) => {
          const action = entry.kind === "node"
            ? `data-pedagogical-node="${esc(relation.neighborId)}"`
            : `data-pedagogical-region="${esc(relation.neighborId)}" data-pedagogical-artwork="${esc(entry.region.artworkId)}"`;
          return `
            <button type="button" class="pedagogical-relation-card" ${action}>
              <span class="pedagogical-relation-type">${esc(pedagogicalRelationLabel(relation.type, relation.direction))}</span>
              <strong>${esc(pedagogicalTargetLabel(data, entry))}</strong>
              <p>${esc(localize(relation.rationale, lang))}</p>
              <small><b>${esc(t.pedagogicalQuestion)} :</b> ${esc(localize(relation.prompt, lang))}</small>
            </button>
          `;
        }).join("")}
      </div>
    </section>
  `;
}

function graphNodeFromResolved(data, id, resolved, subtitle) {
  if (!resolved) return null;
  const type = resolved.kind === "entity"
    ? resolved.node.type
    : resolved.kind === "concept"
      ? resolved.node.type
      : resolved.kind === "iconography"
        ? resolved.node.type
        : "artwork";
  return {
    id,
    kind: resolved.kind,
    type,
    label: knowledgeNodeLabel(data, resolved),
    subtitle,
    weight: 0.62,
    pedagogical: true
  };
}

function graphWithPedagogicalRelations(graph) {
  if (!graphState.pedagogyVisible || !graph.center) return graph;
  const existingIds = new Set([graph.center.id, ...graph.nodes.map((node) => node.id)]);
  const additions = [];

  for (const relation of getPedagogicalRelations(semanticData, graph.center.id)) {
    if (additions.length >= 3) break;
    if (existingIds.has(relation.neighborId)) continue;
    const resolved = resolveKnowledgeNode(semanticData, relation.neighborId);
    if (!resolved) continue;
    if (resolved.kind === "entity" && !graphState.activeTypes.has(resolved.node.type)) continue;
    if (resolved.kind === "concept" && !graphState.activeTypes.has(resolved.node.type)) continue;
    if (resolved.kind === "iconography" && !graphState.activeTypes.has(resolved.node.type)) continue;

    const node = graphNodeFromResolved(
      semanticData,
      relation.neighborId,
      resolved,
      pedagogicalRelationLabel(relation.type, relation.direction)
    );
    if (!node) continue;
    existingIds.add(relation.neighborId);
    additions.push({
      node,
      edge: {
        label: pedagogicalRelationLabel(relation.type, relation.direction),
        strength: 0.56,
        pedagogical: true
      }
    });
  }

  return {
    ...graph,
    nodes: [...graph.nodes, ...additions.map((item) => item.node)],
    edges: [...graph.edges, ...additions.map((item) => item.edge)]
  };
}

function knowledgeNodeLabel(data, resolved) {
  if (!resolved) return "";
  if (resolved.kind === "artwork") return localize(resolved.node.title, lang);
  if (resolved.kind === "entity") return localize(resolved.node.labels, lang);
  if (resolved.kind === "iconography") return localize(resolved.node.labels, lang);
  return localize(resolved.node.labels, lang);
}

function renderLanguages(artworkId) {
  q("[data-language-nav]").innerHTML = [["fr", "FR"], ["en", "EN"], ["ar", "AR"]]
    .map(([code, label]) => `
      <a class="${code === lang ? "is-active" : ""}" href="${urlFor(artworkId, code)}"
         lang="${code}"${code === "ar" ? ' dir="rtl"' : ""}>${label}</a>
    `).join("");
}

function artworkTabs(data, artworkId) {
  return `
    <div class="artwork-switcher" role="navigation" aria-label="${esc(t.choose)}">
      ${data.artworks.map((artwork) => `
        <a href="${urlFor(artwork.id)}" class="artwork-switch ${artwork.id === artworkId ? "is-active" : ""}">
          <strong>${esc(localize(artwork.title, lang))}</strong>
          <span>${esc(localize(artwork.artist, lang))}</span>
        </a>
      `).join("")}
    </div>`;
}

function renderSearchBox() {
  const examples = semanticData?.queryExamples?.[lang] || [];
  return `
    <div class="workspace-search semantic-natural-search">
      <label>
        <span class="sr-only">${esc(t.searchLabel)}</span>
        <input type="search" data-semantic-search placeholder="${esc(t.searchPlaceholder)}" autocomplete="off" />
      </label>
      ${examples.length ? `
        <div class="semantic-query-examples" aria-label="${esc(t.searchExamples)}">
          <span>${esc(t.searchExamples)}</span>
          ${examples.slice(0, 4).map((example) => `
            <button type="button" data-query-example="${esc(example)}">${esc(example)}</button>
          `).join("")}
        </div>
      ` : ""}
      <div class="workspace-search-results semantic-natural-results" data-search-results hidden></div>
    </div>`;
}
function wrapGraphLabel(label, max = 18) {
  const words = String(label || "").split(/\s+/).filter(Boolean);
  if (!words.length) return [""];
  const lines = [""];
  for (const word of words) {
    const current = lines[lines.length - 1];
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= max || !current) {
      lines[lines.length - 1] = candidate;
    } else if (lines.length < 2) {
      lines.push(word);
    } else {
      lines[1] = `${lines[1].slice(0, Math.max(0, max - 1))}…`;
      break;
    }
  }
  return lines.slice(0, 2);
}

function graphDataForArtwork(data, artworkId) {
  const artwork = getArtwork(data, artworkId);
  if (!artwork) return { center: null, nodes: [], edges: [] };

  const conceptEntries = getArtworkConceptEntries(data, artworkId)
    .filter((entry) => graphState.activeTypes.has(entry.concept.type))
    .sort((a, b) => (b.weight || 0) - (a.weight || 0))
    .slice(0, 6);

  const culturalEntries = getArtworkCulturalEntries(data, artworkId)
    .filter((entry) => graphState.activeTypes.has(entry.entity.type))
    .slice(0, 4);

  const iconographyEntries = getArtworkIconographyEntries(data, artworkId)
    .filter((entry) => graphState.activeTypes.has(entry.subject.type))
    .sort((a, b) => (b.weight || 0) - (a.weight || 0))
    .slice(0, 5);

  return {
    center: {
      id: artwork.id,
      kind: "artwork",
      type: "artwork",
      label: localize(artwork.title, lang),
      subtitle: localize(artwork.artist, lang)
    },
    nodes: [
      ...conceptEntries.map((entry) => ({
        id: entry.concept.id,
        kind: "concept",
        type: entry.concept.type,
        label: localize(entry.concept.labels, lang),
        subtitle: t[entry.role] || entry.role,
        weight: entry.weight
      })),
      ...culturalEntries.map((entry) => ({
        id: entry.entity.id,
        kind: "entity",
        type: entry.entity.type,
        label: localize(entry.entity.labels, lang),
        subtitle: culturalRelationLabel(entry.relation.type, "outgoing"),
        weight: 0.88
      })),
      ...iconographyEntries.map((entry) => ({
        id: entry.subject.id,
        kind: "iconography",
        type: entry.subject.type,
        label: localize(entry.subject.labels, lang),
        subtitle: iconographyRelationLabel(entry.relation, "outgoing"),
        weight: entry.weight || 0.78
      }))
    ],
    edges: [
      ...conceptEntries.map((entry) => ({
        label: t[entry.role] || entry.role,
        strength: entry.weight || 0.5
      })),
      ...culturalEntries.map((entry) => ({
        label: culturalRelationLabel(entry.relation.type, "outgoing"),
        strength: 0.82
      })),
      ...iconographyEntries.map((entry) => ({
        label: iconographyRelationLabel(entry.relation, "outgoing"),
        strength: entry.weight || 0.76
      }))
    ]
  };
}

function graphDataForConcept(data, conceptId) {
  const concept = data.conceptMap.get(conceptId);
  if (!concept) return { center: null, nodes: [], edges: [] };

  const neighbors = getRelatedConcepts(data, conceptId)
    .filter(({ concept: target }) => graphState.activeTypes.has(target.type))
    .slice(0, 11);

  return {
    center: {
      id: concept.id,
      kind: "concept",
      type: concept.type,
      label: localize(concept.labels, lang),
      subtitle: typeLabel(concept.type)
    },
    nodes: neighbors.map(({ relationType, concept: target, relationWeight }) => ({
      id: target.id,
      kind: "concept",
      type: target.type,
      label: localize(target.labels, lang),
      subtitle: relationLabel(relationType),
      weight: relationWeight
    })),
    edges: neighbors.map(({ relationType, relationWeight }) => ({
      label: relationLabel(relationType),
      strength: relationWeight
    }))
  };
}

function graphDataForEntity(data, entityId) {
  const entity = getCulturalEntity(data, entityId);
  if (!entity) return { center: null, nodes: [], edges: [] };

  const relations = getCulturalRelations(data, entityId)
    .map((relation) => ({
      relation,
      resolved: resolveKnowledgeNode(data, relation.neighborId)
    }))
    .filter((entry) => entry.resolved)
    .filter((entry) => {
      if (entry.resolved.kind === "entity") return graphState.activeTypes.has(entry.resolved.node.type);
      return true;
    })
    .slice(0, 12);

  return {
    center: {
      id: entity.id,
      kind: "entity",
      type: entity.type,
      label: localize(entity.labels, lang),
      subtitle: typeLabel(entity.type)
    },
    nodes: relations.map(({ relation, resolved }) => ({
      id: relation.neighborId,
      kind: resolved.kind === "entity" ? "entity" : resolved.kind,
      type: resolved.kind === "entity" ? resolved.node.type : resolved.kind,
      label: knowledgeNodeLabel(data, resolved),
      subtitle: culturalRelationLabel(relation.type, relation.direction),
      weight: 0.8
    })),
    edges: relations.map(({ relation }) => ({
      label: culturalRelationLabel(relation.type, relation.direction),
      strength: 0.78
    }))
  };
}

function graphDataForIconography(data, subjectId) {
  const subject = getIconographicSubject(data, subjectId);
  if (!subject) return { center: null, nodes: [], edges: [] };

  const artworkEntries = getIconographyArtworks(data, subjectId).slice(0, 4);
  const peerMap = new Map();

  for (const { artwork } of artworkEntries) {
    for (const entry of getArtworkIconographyEntries(data, artwork.id)) {
      if (entry.subject.id === subjectId) continue;
      if (!graphState.activeTypes.has(entry.subject.type)) continue;
      const previous = peerMap.get(entry.subject.id);
      if (!previous || (entry.weight || 0) > (previous.weight || 0)) {
        peerMap.set(entry.subject.id, entry);
      }
    }
  }

  const peers = [...peerMap.values()]
    .sort((a, b) => (b.weight || 0) - (a.weight || 0))
    .slice(0, 7);

  return {
    center: {
      id: subject.id,
      kind: "iconography",
      type: subject.type,
      label: localize(subject.labels, lang),
      subtitle: typeLabel(subject.type)
    },
    nodes: [
      ...artworkEntries.map((entry) => ({
        id: entry.artwork.id,
        kind: "artwork",
        type: "artwork",
        label: localize(entry.artwork.title, lang),
        subtitle: iconographyRelationLabel(entry.relation, "incoming"),
        weight: entry.weight || 0.8
      })),
      ...peers.map((entry) => ({
        id: entry.subject.id,
        kind: "iconography",
        type: entry.subject.type,
        label: localize(entry.subject.labels, lang),
        subtitle: t.coOccurs,
        weight: entry.weight || 0.65
      }))
    ],
    edges: [
      ...artworkEntries.map((entry) => ({
        label: iconographyRelationLabel(entry.relation, "incoming"),
        strength: entry.weight || 0.8
      })),
      ...peers.map((entry) => ({
        label: t.coOccurs,
        strength: Math.max(0.5, (entry.weight || 0.65) * 0.75)
      }))
    ]
  };
}

const EXPERIENCE_CHANNEL_KEYS = {
  web: "channelWeb",
  ar: "channelAr",
  "space-ar": "channelSpaceAr",
  vr: "channelVr",
  geo: "channelGeo",
  "3d": "channel3d",
  book: "channelBook",
  video: "channelVideo",
  "vr-world": "channelVrWorld"
};

function experienceChannelLabel(channel) {
  const key = EXPERIENCE_CHANNEL_KEYS[channel];
  return key ? (t[key] || channel) : channel;
}

function experienceHref(experience) {
  return String(experience.href || "").replaceAll("{lang}", encodeURIComponent(lang));
}

function experienceLinksMarkup(data, nodeId) {
  const experiences = getNodeExperiences(data, nodeId);
  if (!experiences.length) return "";

  return `
    <section class="semantic-experiences" aria-label="${esc(t.experiences)}">
      <div class="semantic-experiences-head">
        <div>
          <h3>${esc(t.experiences)}</h3>
          <p>${esc(t.experiencesHint)}</p>
        </div>
        <span>${experiences.length}</span>
      </div>
      <div class="semantic-experience-strip">
        ${experiences.map((experience) => {
          const href = experienceHref(experience);
          const externalAttrs = experience.external ? ' target="_blank" rel="noopener noreferrer"' : "";
          return `
            <a class="semantic-experience-card channel-${esc(experience.channel)}" href="${esc(href)}"${externalAttrs}>
              <span class="semantic-experience-channel">${esc(experienceChannelLabel(experience.channel))}</span>
              <strong>${esc(localize(experience.labels, lang))}</strong>
              <small>${esc(localize(experience.descriptions, lang))}</small>
              <b aria-hidden="true">→</b>
            </a>
          `;
        }).join("")}
      </div>
    </section>
  `;
}

function graphNodeMarkup(node, x, y, isCenter = false) {
  const width = isCenter ? 176 : 138;
  const experienceCount = semanticData ? getNodeExperiences(semanticData, node.id).length : 0;
  const height = isCenter ? 68 : 54;
  const lines = wrapGraphLabel(node.label, isCenter ? 23 : 16);
  const dataAttr = node.kind === "concept"
    ? ` data-graph-concept-id="${esc(node.id)}"`
    : node.kind === "entity"
      ? ` data-graph-entity-id="${esc(node.id)}"`
      : node.kind === "iconography"
        ? ` data-graph-iconography-id="${esc(node.id)}"`
        : node.kind === "artwork"
        ? ` data-graph-artwork-id="${esc(node.id)}"`
        : node.kind === "external"
          ? ` data-graph-external-url="${esc(node.pageUrl || "")}"`
          : "";
  const interactive = ["concept", "entity", "iconography", "artwork", "external"].includes(node.kind) ? ' tabindex="0" role="button"' : "";
  const yStart = lines.length === 1 ? 4 : -5;

  return `
    <g class="semantic-svg-node node-${esc(node.type || "concept")} ${node.kind === "external" ? "is-external" : ""} ${isCenter ? "is-center" : ""} ${experienceCount ? "has-experiences" : ""}"
       transform="translate(${x} ${y})"${dataAttr}${interactive}>
      <rect x="${-width / 2}" y="${-height / 2}" width="${width}" height="${height}" rx="${isCenter ? 16 : 12}"></rect>
      <text class="semantic-svg-node-label" text-anchor="middle">
        ${lines.map((line, i) => `<tspan x="0" y="${yStart + i * 14}">${esc(line)}</tspan>`).join("")}
      </text>
      <text class="semantic-svg-node-type" text-anchor="middle" x="0" y="${height / 2 - 7}">${esc(node.subtitle || "")}</text>
      ${experienceCount ? `<circle class="semantic-svg-experience-dot" cx="${width / 2 - 9}" cy="${-height / 2 + 9}" r="4"><title>${experienceCount} ${esc(t.experienceAvailable)}</title></circle>` : ""}
      <title>${esc(node.label)} · ${esc(node.subtitle || node.type)}</title>
    </g>`;
}

function graphWithExternalSuggestions(graph) {
  if (!graphState.externalVisible || (!graphState.centerConceptId && !graphState.centerEntityId && !graphState.centerIconographyId) || !graphState.externalSuggestions.length) {
    return graph;
  }

  const localIds = new Set(graph.nodes.map((node) => node.id));
  const external = graphState.externalSuggestions
    .filter((item) => !localIds.has(item.id))
    .slice(0, 7)
    .map((item) => ({
      id: `${item.provider}:${item.id}`,
      sourceId: item.id,
      kind: "external",
      type: "external",
      provider: item.provider,
      label: item.label || item.id,
      subtitle: `${providerDisplayName(item.provider)} · ${item.relationLabel || item.relationType || ""}`,
      pageUrl: item.pageUrl || providerPageUrl(item.provider, item.id)
    }));

  return {
    ...graph,
    nodes: [...graph.nodes, ...external],
    edges: [
      ...graph.edges,
      ...external.map((item) => ({
        label: item.subtitle,
        strength: 0.45,
        external: true
      }))
    ]
  };
}

function graphSvgMarkup(graph) {
  if (!graph.center) return `<p class="graph-empty">${esc(t.noResults)}</p>`;

  const cx = 410;
  const cy = 220;
  const radiusX = graph.nodes.length <= 6 ? 235 : 300;
  const radiusY = graph.nodes.length <= 6 ? 145 : 165;
  const positions = graph.nodes.map((node, index) => {
    const angle = (-Math.PI / 2) + (Math.PI * 2 * index / Math.max(1, graph.nodes.length));
    return { node, x: cx + Math.cos(angle) * radiusX, y: cy + Math.sin(angle) * radiusY };
  });

  const edges = positions.map(({ node, x, y }, index) => {
    const edge = graph.edges[index];
    return `
      <g class="semantic-svg-edge ${node.kind === "external" ? "is-external" : ""} ${edge?.pedagogical ? "is-pedagogical" : ""}">
        <line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}"></line>
        <title>${esc(graph.center.label)} → ${esc(edge?.label || "")}</title>
      </g>`;
  }).join("");

  return `
    <svg class="semantic-link-graph" viewBox="0 0 820 440" role="img" aria-label="${esc(t.graphTitle)}">
      <g class="semantic-svg-edges">${edges}</g>
      <g class="semantic-svg-nodes">
        ${graphNodeMarkup(graph.center, cx, cy, true)}
        ${positions.map(({ node, x, y }) => graphNodeMarkup(node, x, y)).join("")}
      </g>
    </svg>`;
}

function graphToolbar() {
  return `
    <div class="graph-controls">
      <button type="button" class="graph-reset" data-graph-reset>${esc(t.backArtwork)}</button>
      <button type="button" class="graph-pedagogy ${graphState.pedagogyVisible ? "is-active" : ""}" data-graph-pedagogy>
        ${esc(graphState.pedagogyVisible ? t.pedagogyHide : t.pedagogyShow)}
      </button>
      <div class="graph-filters" role="group" aria-label="${esc(t.graphTitle)}">
        <button type="button" class="graph-filter is-active" data-graph-all>${esc(t.all)}</button>
        ${GRAPH_TYPES.map((type) => `
          <button type="button" class="graph-filter is-active" data-graph-type="${esc(type)}">${esc(typeLabel(type))}</button>
        `).join("")}
      </div>
    </div>`;
}
function iiifManifestUrl(artworkId) {
  return `/iiif/${encodeURIComponent(artworkId)}/manifest.json`;
}

function imageRegionStyle(profile, region) {
  const [x, y, width, height] = region.xywh;
  return [
    `left:${(x / profile.canvas.width) * 100}%`,
    `top:${(y / profile.canvas.height) * 100}%`,
    `width:${(width / profile.canvas.width) * 100}%`,
    `height:${(height / profile.canvas.height) * 100}%`
  ].join(";");
}

function imageRegionDetailMarkup(data, region) {
  if (!region) return "";
  const concepts = region.conceptIds
    .map((id) => data.conceptMap.get(id))
    .filter(Boolean);
  const iconography = getRegionIconographyEntries(data, region.id);
  const pedagogical = getPedagogicalRelations(data, region.id)
    .map((relation) => ({ relation, entry: pedagogicalNeighbor(data, relation) }))
    .filter((item) => item.entry);

  return `
    <span class="image-region-kicker">${esc(t.imageRegions)}</span>
    <h3>${esc(localize(region.labels, lang))}</h3>
    <p>${esc(localize(region.descriptions, lang))}</p>
    <div class="image-region-concepts">
      <strong>${esc(t.regionConcepts)}</strong>
      <div>
        ${concepts.map((concept) => `
          <button type="button" data-region-concept="${esc(concept.id)}">
            ${esc(localize(concept.labels, lang))}
            <span>→</span>
          </button>
        `).join("")}
      </div>
    </div>
    ${iconography.length ? `
      <div class="image-region-iconography">
        <strong>${esc(t.iconography)}</strong>
        <div>
          ${iconography.map((subject) => `
            <button type="button" data-region-iconography="${esc(subject.id)}">
              ${esc(localize(subject.labels, lang))}
              ${subject.iconclass ? `<small>Iconclass ${esc(subject.iconclass.notation)}</small>` : ""}
            </button>
          `).join("")}
        </div>
      </div>
    ` : ""}
    ${pedagogical.length ? `
      <div class="image-region-pedagogy">
        <strong>${esc(t.pedagogy)}</strong>
        ${pedagogical.map(({ relation, entry }) => `
          <button type="button"
            ${entry.kind === "node"
              ? `data-region-pedagogical-node="${esc(relation.neighborId)}"`
              : `data-region-pedagogical-region="${esc(relation.neighborId)}"`}>
            <span>${esc(pedagogicalRelationLabel(relation.type, relation.direction))}</span>
            <b>${esc(pedagogicalTargetLabel(data, entry))}</b>
            <small>${esc(localize(relation.prompt, lang))}</small>
          </button>
        `).join("")}
      </div>
    ` : ""}
  `;
}
function imageExplorerDialogMarkup(data, artworkId) {
  const profile = getImageAnnotationProfile(data, artworkId);
  const artwork = getArtwork(data, artworkId);
  if (!profile || !artwork) return "";

  const firstRegion = profile.regions[0] || null;
  return `
    <dialog class="image-region-dialog" data-image-dialog>
      <div class="image-region-shell">
        <header class="image-region-header">
          <div>
            <span class="section-kicker">IIIF · ARTDACI</span>
            <h2>${esc(localize(artwork.title, lang))} · ${esc(t.imageRegions)}</h2>
            <p>${esc(t.imageHint)}</p>
          </div>
          <div class="image-region-header-actions">
            <a href="${iiifManifestUrl(artworkId)}" target="_blank" rel="noopener noreferrer">${esc(t.iiifManifest)} ↗</a>
            <button type="button" data-image-close aria-label="${esc(t.closeImage)}">×</button>
          </div>
        </header>
        <div class="image-region-layout">
          <div class="image-region-map">
            <img src="${esc(profile.canvas.image)}" alt="${esc(localize(artwork.title, lang))}" />
            ${profile.regions.map((region, index) => `
              <button type="button"
                class="image-region-hotspot ${index === 0 ? "is-active" : ""}"
                style="${imageRegionStyle(profile, region)}"
                data-image-region="${esc(region.id)}"
                aria-label="${esc(localize(region.labels, lang))}">
                <span>${index + 1}</span>
              </button>
            `).join("")}
          </div>
          <aside class="image-region-detail" data-image-region-detail>
            ${imageRegionDetailMarkup(data, firstRegion)}
          </aside>
        </div>
      </div>
    </dialog>
  `;
}

function selectImageRegion(regionId) {
  const profile = getImageAnnotationProfile(semanticData, graphState.artworkId);
  if (!profile) return;
  const region = profile.regions.find((item) => item.id === regionId);
  if (!region) return;

  document.querySelectorAll("[data-image-region]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.imageRegion === regionId);
  });
  const detail = q("[data-image-region-detail]");
  if (detail) detail.innerHTML = imageRegionDetailMarkup(semanticData, region);
}

function wireImageExplorer() {
  const dialog = q("[data-image-dialog]");
  if (!dialog) return;

  dialog.addEventListener("click", (event) => {
    const closeButton = event.target.closest("[data-image-close]");
    if (closeButton) {
      dialog.close();
      return;
    }

    const regionButton = event.target.closest("[data-image-region]");
    if (regionButton) {
      selectImageRegion(regionButton.dataset.imageRegion);
      return;
    }

    const conceptButton = event.target.closest("[data-region-concept]");
    if (conceptButton) {
      dialog.close();
      setInspectorConcept(conceptButton.dataset.regionConcept, true);
      q(".semantic-workspace")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    const pedagogicalNodeButton = event.target.closest("[data-region-pedagogical-node]");
    if (pedagogicalNodeButton) {
      const id = pedagogicalNodeButton.dataset.regionPedagogicalNode;
      const resolved = resolveKnowledgeNode(semanticData, id);
      dialog.close();
      if (!resolved) return;
      if (resolved.kind === "artwork") location.href = urlFor(id);
      else if (resolved.kind === "entity") setInspectorEntity(id, true);
      else if (resolved.kind === "iconography") setInspectorIconography(id, true);
      else setInspectorConcept(id, true);
      q(".semantic-workspace")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    const iconographyButton = event.target.closest("[data-region-iconography]");
    if (iconographyButton) {
      dialog.close();
      setInspectorIconography(iconographyButton.dataset.regionIconography, true);
      q(".semantic-workspace")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    if (event.target === dialog) dialog.close();
  });
}
function artworkInspector(data, artworkId) {
  const artwork = getArtwork(data, artworkId);
  const keyEntries = getArtworkConceptEntries(data, artworkId).slice(0, 6);
  const imageProfile = getImageAnnotationProfile(data, artworkId);
  if (!artwork) return "";

  const thumb = artwork.image
    ? `<img class="inspector-thumb" src="${esc(artwork.image)}" alt="" />`
    : `<div class="inspector-thumb inspector-placeholder">1889</div>`;

  return `
    <div class="inspector-heading">
      <span class="inspector-kicker">${esc(t.artworkOverview)}</span>
      <h2>${esc(localize(artwork.title, lang))}</h2>
      <p>${esc(localize(artwork.artist, lang))}</p>
    </div>
    <div class="inspector-artwork-row">
      ${thumb}
      <dl>
        <div><dt>Date</dt><dd>${esc(localize(artwork.date, lang))}</dd></div>
        <div><dt>Museum</dt><dd>${esc(localize(artwork.museum, lang))}</dd></div>
      </dl>
    </div>
    ${artwork.image ? "" : `<p class="inspector-note">${esc(t.noImageNote)}</p>`}
    <div class="inspector-tags">
      ${keyEntries.map((entry) => `
        <button type="button" data-inspector-concept="${esc(entry.concept.id)}">${esc(localize(entry.concept.labels, lang))}</button>
      `).join("")}
    </div>
    <button type="button" class="inspector-profile-link" data-open-profile>${esc(t.openProfile)}</button>
    ${imageProfile ? `
      <div class="image-analysis-actions">
        <button type="button" data-image-explore>${esc(t.imageExplore)}</button>
        <a href="${iiifManifestUrl(artwork.id)}" target="_blank" rel="noopener noreferrer">${esc(t.iiifManifest)} ↗</a>
      </div>
    ` : ""}
    ${pedagogicalRelationsMarkup(data, artwork.id)}
    ${experienceLinksMarkup(data, artwork.id)}
    <section class="external-sources" data-external-sources data-entity-kind="artwork" data-entity-id="${esc(artwork.id)}">
      <div class="external-sources-head">
        <h3>${esc(t.externalSources)}</h3>
        <span>${esc(t.sourceLoading)}</span>
      </div>
    </section>
  `;
}

function conceptInspector(data, conceptId) {
  const concept = data.conceptMap.get(conceptId);
  if (!concept) return "";
  const related = getRelatedConcepts(data, conceptId).slice(0, 6);

  return `
    <div class="inspector-heading">
      <span class="inspector-kicker">${esc(typeLabel(concept.type))}</span>
      <h2>${esc(localize(concept.labels, lang))}</h2>
    </div>
    <p class="inspector-definition">${esc(localize(concept.definitions, lang))}</p>
    <div class="inspector-meta">
      <span>${esc(t.source)}</span>
    </div>
    <div class="inspector-relations">
      <h3>${esc(t.relations)}</h3>
      ${related.map(({ relationType, concept: target }) => `
        <button type="button" data-inspector-concept="${esc(target.id)}">
          <span>${esc(relationLabel(relationType))}</span>
          <strong>${esc(localize(target.labels, lang))}</strong>
        </button>
      `).join("")}
    </div>
    ${pedagogicalRelationsMarkup(data, concept.id)}
    ${experienceLinksMarkup(data, concept.id)}
    <section class="external-sources" data-external-sources data-entity-kind="concept" data-entity-id="${esc(concept.id)}">
      <div class="external-sources-head">
        <h3>${esc(t.externalSources)}</h3>
        <span>${esc(t.sourceLoading)}</span>
      </div>
    </section>
  `;
}

function iconographyInspector(data, subjectId) {
  const subject = getIconographicSubject(data, subjectId);
  if (!subject) return "";
  const artworks = getIconographyArtworks(data, subjectId);

  return `
    <div class="inspector-heading">
      <span class="inspector-kicker">${esc(typeLabel(subject.type))}</span>
      <h2>${esc(localize(subject.labels, lang))}</h2>
    </div>
    <p class="inspector-definition">${esc(localize(subject.descriptions, lang))}</p>
    ${subject.iconclass ? `
      <div class="iconclass-notation">
        <span>${esc(t.iconclassNotation)}</span>
        <strong>${esc(subject.iconclass.notation)}</strong>
      </div>
    ` : ""}
    <div class="inspector-relations">
      <h3>${esc(t.relatedArtworks)}</h3>
      ${artworks.map(({ artwork, relation }) => `
        <a class="inspector-relation-link" href="${urlFor(artwork.id)}">
          <span>${esc(iconographyRelationLabel(relation, "incoming"))}</span>
          <strong>${esc(localize(artwork.title, lang))}</strong>
        </a>
      `).join("")}
    </div>
    ${pedagogicalRelationsMarkup(data, subject.id)}
    ${experienceLinksMarkup(data, subject.id)}
    <section class="external-sources" data-external-sources data-entity-kind="iconography" data-entity-id="${esc(subject.id)}">
      <div class="external-sources-head">
        <h3>${esc(t.iconclassSource)}</h3>
        <span>${subject.iconclass ? esc(subject.iconclass.notation) : "—"}</span>
      </div>
    </section>
  `;
}

function culturalEntityInspector(data, entityId) {
  const entity = getCulturalEntity(data, entityId);
  if (!entity) return "";

  const relations = getCulturalRelations(data, entityId)
    .map((relation) => ({ relation, resolved: resolveKnowledgeNode(data, relation.neighborId) }))
    .filter((entry) => entry.resolved)
    .slice(0, 7);

  return `
    <div class="inspector-heading">
      <span class="inspector-kicker">${esc(typeLabel(entity.type))}</span>
      <h2>${esc(localize(entity.labels, lang))}</h2>
    </div>
    <p class="inspector-definition">${esc(localize(entity.descriptions, lang))}</p>
    ${entity.temporal ? `<div class="entity-temporal">${esc(entity.temporal.start || "")}${entity.temporal.end && entity.temporal.end !== entity.temporal.start ? `–${esc(entity.temporal.end)}` : ""}</div>` : ""}
    <div class="inspector-relations">
      <h3>${esc(t.relations)}</h3>
      ${relations.map(({relation,resolved}) => {
        const targetId = relation.neighborId;
        const attr = resolved.kind === "entity"
          ? `data-inspector-entity="${esc(targetId)}"`
          : resolved.kind === "concept"
            ? `data-inspector-concept="${esc(targetId)}"`
            : "";
        const artworkHref = resolved.kind === "artwork" ? urlFor(targetId) : null;
        const body = `
          <span>${esc(culturalRelationLabel(relation.type, relation.direction))}</span>
          <strong>${esc(knowledgeNodeLabel(data, resolved))}</strong>`;
        return artworkHref
          ? `<a class="inspector-relation-link" href="${artworkHref}">${body}</a>`
          : `<button type="button" ${attr}>${body}</button>`;
      }).join("")}
    </div>
    ${pedagogicalRelationsMarkup(data, entity.id)}
    ${experienceLinksMarkup(data, entity.id)}
    <section class="external-sources" data-external-sources data-entity-kind="entity" data-entity-id="${esc(entity.id)}">
      <div class="external-sources-head">
        <h3>${esc(t.externalSources)}</h3>
        <span>${esc(t.sourceLoading)}</span>
      </div>
    </section>
  `;
}

function renderWorkspace(data, artworkId) {
  graphState.artworkId = artworkId;
  graphState.centerConceptId = null;
  const graph = graphDataForArtwork(data, artworkId);

  return `
    <section class="semantic-workspace" aria-labelledby="graph-heading">
      <div class="workspace-topline">
        ${artworkTabs(data, artworkId)}
        ${renderSearchBox()}
      </div>

      <div class="workspace-grid">
        <div class="graph-panel">
          <div class="graph-panel-head">
            <div>
              <span class="section-kicker">${esc(t.graphTitle)}</span>
              <h2 id="graph-heading">${esc(t.graphTitle)}</h2>
            </div>
            <p>${esc(t.graphIntro)}</p>
          </div>
          ${graphToolbar()}
          <div class="graph-stage" data-link-graph>${graphSvgMarkup(graph)}</div>
          <div class="graph-caption" data-graph-caption>
            <strong>${esc(t.centralNode)}:</strong> ${esc(graph.center?.label || "")}
          </div>
        </div>

        <aside class="semantic-inspector" data-inspector>
          ${artworkInspector(data, artworkId)}
        </aside>
      </div>
    </section>`;
}

function profileMarkup(data, artworkId) {
  const groups = getConceptTypeGroups(data, artworkId);
  return `
    <details class="semantic-drawer" data-profile-drawer>
      <summary>
        <span>
          <strong>${esc(t.profile)}</strong>
          <small>${esc(t.profileHint)}</small>
        </span>
        <span class="drawer-icon">＋</span>
      </summary>
      <div class="drawer-content">
        ${[...groups.entries()].map(([type, entries]) => `
          <div class="profile-group">
            <h3>${esc(typeLabel(type))}</h3>
            <div class="profile-chips">
              ${entries.map((entry) => `
                <button type="button" data-profile-concept="${esc(entry.concept.id)}" class="profile-chip role-${esc(entry.role)}">
                  <span>${esc(localize(entry.concept.labels, lang))}</span>
                  <small>${esc(t[entry.role] || entry.role)} · ${Math.round((entry.weight || 0) * 100)}%</small>
                </button>
              `).join("")}
            </div>
          </div>
        `).join("")}
      </div>
    </details>`;
}

function pathMarkup(data, bridge) {
  const from = data.conceptMap.get(bridge.fromConceptId);
  const to = data.conceptMap.get(bridge.toConceptId);
  if (!from || !to) return "";
  if (bridge.kind === "shared") {
    return `<li><strong>${esc(localize(from.labels, lang))}</strong><span>${esc(t.sharedRelation)}</span></li>`;
  }
  return `<li><strong>${esc(localize(from.labels, lang))}</strong><span>→ ${esc(relationLabel(bridge.relationType))} →</span><strong>${esc(localize(to.labels, lang))}</strong></li>`;
}

function relatedMarkup(data, artworkId) {
  const related = getRelatedArtworks(data, artworkId);
  return `
    <section class="related-strip" aria-labelledby="related-heading">
      <div class="related-strip-head">
        <div>
          <span class="section-kicker">${esc(t.relatedArtworks)}</span>
          <h2 id="related-heading">${esc(t.relatedArtworks)}</h2>
        </div>
      </div>
      <div class="related-grid">
        ${related.map((item) => {
          const labels = item.sharedConceptIds.slice(0, 3)
            .map((id) => data.conceptMap.get(id))
            .filter(Boolean)
            .map((concept) => localize(concept.labels, lang));

          return `
            <article class="related-card">
              <a href="${urlFor(item.artwork.id)}">
                <span class="related-id">ARTDACI · ${esc(item.artwork.id)}</span>
                <h3>${esc(localize(item.artwork.title, lang))}</h3>
                <p>${esc(localize(item.artwork.artist, lang))}</p>
              </a>
              <div class="related-score">
                <strong>${Math.round(item.score * 100)}%</strong>
                <span>${esc(t.weightedScore)}</span>
              </div>
              <p class="related-shared">${esc(labels.join(" · "))}</p>
              <details class="semantic-paths">
                <summary>${esc(t.paths)}</summary>
                <ol>${item.bridges.slice(0, 4).map((bridge) => pathMarkup(data, bridge)).join("")}</ol>
              </details>
            </article>`;
        }).join("")}
      </div>
    </section>`;
}

function currentGraph() {
  const baseGraph = graphState.centerIconographyId
    ? graphDataForIconography(semanticData, graphState.centerIconographyId)
    : graphState.centerEntityId
      ? graphDataForEntity(semanticData, graphState.centerEntityId)
      : graphState.centerConceptId
      ? graphDataForConcept(semanticData, graphState.centerConceptId)
      : graphDataForArtwork(semanticData, graphState.artworkId);
  return graphWithExternalSuggestions(graphWithPedagogicalRelations(baseGraph));
}
function refreshGraph() {
  const graph = currentGraph();
  q("[data-link-graph]").innerHTML = graphSvgMarkup(graph);
  q("[data-graph-caption]").innerHTML = `<strong>${esc(t.centralNode)}:</strong> ${esc(graph.center?.label || "")}`;
  const reset = q("[data-graph-reset]");
  if (reset) reset.disabled = !(graphState.centerConceptId || graphState.centerEntityId || graphState.centerIconographyId);
  wireGraphNodes();
}

function setInspectorConcept(conceptId, recenter = true) {
  graphState.centerConceptId = conceptId;
  graphState.centerEntityId = null;
  graphState.centerIconographyId = null;
  graphState.externalSuggestions = [];
  graphState.externalVisible = false;
  q("[data-inspector]").innerHTML = conceptInspector(semanticData, conceptId);
  wireInspector();

  if (recenter) refreshGraph();
}

function setInspectorEntity(entityId, recenter = true) {
  graphState.centerConceptId = null;
  graphState.centerEntityId = entityId;
  graphState.centerIconographyId = null;
  graphState.externalSuggestions = [];
  graphState.externalVisible = false;
  q("[data-inspector]").innerHTML = culturalEntityInspector(semanticData, entityId);
  wireInspector();
  if (recenter) refreshGraph();
}

function setInspectorIconography(subjectId, recenter = true) {
  graphState.centerConceptId = null;
  graphState.centerEntityId = null;
  graphState.centerIconographyId = subjectId;
  graphState.externalSuggestions = [];
  graphState.externalVisible = false;
  q("[data-inspector]").innerHTML = iconographyInspector(semanticData, subjectId);
  wireInspector();
  if (recenter) refreshGraph();
}

function setInspectorArtwork() {
  graphState.centerConceptId = null;
  graphState.centerEntityId = null;
  graphState.centerIconographyId = null;
  graphState.externalSuggestions = [];
  graphState.externalVisible = false;
  q("[data-inspector]").innerHTML = artworkInspector(semanticData, graphState.artworkId);
  wireInspector();
  refreshGraph();
}

function wireGraphNodes() {
  document.querySelectorAll("[data-graph-concept-id]").forEach((node) => {
    const activate = () => setInspectorConcept(node.dataset.graphConceptId, true);
    node.addEventListener("click", activate);
    node.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activate();
      }
    });
  });

  document.querySelectorAll("[data-graph-iconography-id]").forEach((node) => {
    const activate = () => setInspectorIconography(node.dataset.graphIconographyId, true);
    node.addEventListener("click", activate);
    node.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activate();
      }
    });
  });

  document.querySelectorAll("[data-graph-artwork-id]").forEach((node) => {
    const activate = () => {
      location.href = urlFor(node.dataset.graphArtworkId);
    };
    node.addEventListener("click", activate);
    node.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activate();
      }
    });
  });

  document.querySelectorAll("[data-graph-entity-id]").forEach((node) => {
    const activate = () => setInspectorEntity(node.dataset.graphEntityId, true);
    node.addEventListener("click", activate);
    node.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activate();
      }
    });
  });

  document.querySelectorAll("[data-graph-external-url]").forEach((node) => {
    const openExternal = () => {
      const url = node.dataset.graphExternalUrl;
      if (url) window.open(url, "_blank", "noopener,noreferrer");
    };
    node.addEventListener("click", openExternal);
    node.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openExternal();
      }
    });
  });
}


function linkedArtUrl(kind, id) {
  return `/api/linked-art?kind=${encodeURIComponent(kind)}&id=${encodeURIComponent(id)}&lang=${encodeURIComponent(lang)}`;
}

function linkedArtExportMarkup(kind, id) {
  if (!["artwork", "entity", "concept"].includes(kind)) return "";
  return `<a class="linked-art-export" href="${linkedArtUrl(kind, id)}" target="_blank" rel="noopener noreferrer">${esc(t.linkedArt)} ↗</a>`;
}

function providerDisplayName(provider) {
  if (provider === "wikidata") return "Wikidata";
  if (provider === "getty-aat") return "Getty AAT";
  if (provider === "getty-ulan") return "Getty ULAN";
  if (provider === "getty-tgn") return "Getty TGN";
  if (provider === "iconclass") return "Iconclass";
  return provider;
}

function sourceRecordMarkup(provider, id, record, error = null) {
  const pageUrl = record?.pageUrl || providerPageUrl(provider, id);
  const label = record?.label || (provider === "getty-aat" ? `AAT ${id}` : id);
  const description = record?.description || record?.scopeNote || "";
  const stateText = record?.live ? t.sourceLive : (error ? t.sourceUnavailable : t.sourceLinked);
  const license = record?.license || (provider === "wikidata" ? "CC0 1.0" : provider.startsWith("getty-") ? "ODC-By 1.0" : "");
  const attribution = record?.attribution || record?.rightsNote || "";

  return `
    <article class="external-source-card ${error ? "is-unavailable" : ""}">
      <div class="external-source-title">
        <strong>${esc(providerDisplayName(provider))}</strong>
        <span>${esc(stateText)}</span>
      </div>
      <div class="external-source-id">${esc(id)}${license ? ` · ${esc(license)}` : ""}</div>
      <p>${esc(description || label)}</p>
      ${attribution ? `<small class="external-source-attribution">${esc(attribution)}</small>` : ""}
      ${pageUrl ? `<a href="${esc(pageUrl)}" target="_blank" rel="noopener noreferrer">${esc(t.sourceOpen)} ↗</a>` : ""}
    </article>`;
}

async function renderExternalSources() {
  const container = q("[data-external-sources]");
  if (!container) return;

  const kind = container.dataset.entityKind;
  const id = container.dataset.entityId;
  const mapping = kind === "entity"
    ? getCulturalEntity(semanticData, id)?.external || null
    : kind === "iconography"
      ? getIconographicSubject(semanticData, id)?.iconclass
        ? { iconclass: getIconographicSubject(semanticData, id).iconclass }
        : null
      : await getExternalMapping(kind, id).catch(() => null);
  const providers = (kind === "entity" || kind === "iconography") ? providersFromExternal(mapping) : mappingProviders(mapping);

  if (!providers.length) {
    container.innerHTML = `
      <div class="external-sources-head">
        <h3>${esc(t.externalSources)}</h3>
        <div class="external-head-actions">
          ${linkedArtExportMarkup(kind, id)}
          <span>—</span>
        </div>
      </div>`;
    return;
  }

  container.innerHTML = `
    <div class="external-sources-head">
      <h3>${esc(t.externalSources)}</h3>
      <div class="external-head-actions">
        ${linkedArtExportMarkup(kind, id)}
        <span>${esc(t.sourceLoading)}</span>
      </div>
    </div>
    <div class="external-source-grid">
      ${providers.map(({provider,id}) => sourceRecordMarkup(provider,id,null)).join("")}
    </div>`;

  const expand = kind === "concept" || kind === "entity" || kind === "iconography";
  const settled = await Promise.all(
    providers.map(async ({provider,id}) => {
      try {
        return { provider, id, record: await fetchProviderRecord(provider, id, lang, { expand }), error: null };
      } catch (error) {
        return { provider, id, record: null, error };
      }
    })
  );

  if (kind === "concept" && graphState.centerConceptId !== id) return;
  if (kind === "entity" && graphState.centerEntityId !== id) return;
  if (kind === "iconography" && graphState.centerIconographyId !== id) return;

  const suggestions = settled
    .flatMap(({record}) => record?.suggestions || [])
    .filter((item, index, list) =>
      list.findIndex((other) =>
        other.provider === item.provider &&
        other.id === item.id &&
        other.relationType === item.relationType
      ) === index
    )
    .slice(0, 12);

  if (kind === "concept" || kind === "entity" || kind === "iconography") {
    graphState.externalSuggestions = suggestions;
    graphState.externalVisible = false;
  }

  container.innerHTML = `
    <div class="external-sources-head">
      <h3>${esc(t.externalSources)}</h3>
      <div class="external-head-actions">
        ${linkedArtExportMarkup(kind, id)}
        <span>${esc(mapping?.status || "")}</span>
      </div>
    </div>
    <div class="external-source-grid">
      ${settled.map(({provider,id,record,error}) => sourceRecordMarkup(provider,id,record,error)).join("")}
    </div>
    ${(kind === "concept" || kind === "entity" || kind === "iconography") && suggestions.length ? `
      <div class="external-suggestion-control">
        <div>
          <strong>${esc(t.externalSuggestions)}</strong>
          <span>${suggestions.length} · ${esc(t.externalProposed)}</span>
        </div>
        <button type="button" data-external-graph-toggle>${esc(t.showExternal)}</button>
      </div>
    ` : ""}
  `;

  q("[data-external-graph-toggle]", container)?.addEventListener("click", (event) => {
    graphState.externalVisible = !graphState.externalVisible;
    event.currentTarget.textContent = graphState.externalVisible ? t.hideExternal : t.showExternal;
    event.currentTarget.classList.toggle("is-active", graphState.externalVisible);
    refreshGraph();
  });
}

function wireInspector() {
  renderExternalSources();

  document.querySelectorAll("[data-pedagogical-node]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.pedagogicalNode;
      const resolved = resolveKnowledgeNode(semanticData, id);
      if (!resolved) return;
      if (resolved.kind === "artwork") location.href = urlFor(id);
      else if (resolved.kind === "entity") setInspectorEntity(id, true);
      else if (resolved.kind === "iconography") setInspectorIconography(id, true);
      else setInspectorConcept(id, true);
    });
  });

  document.querySelectorAll("[data-pedagogical-region]").forEach((button) => {
    button.addEventListener("click", () => {
      const regionId = button.dataset.pedagogicalRegion;
      const artworkId = button.dataset.pedagogicalArtwork;
      if (artworkId !== graphState.artworkId) {
        location.href = urlFor(artworkId, lang, regionId);
        return;
      }
      const dialog = q("[data-image-dialog]");
      if (dialog?.showModal) dialog.showModal();
      selectImageRegion(regionId);
    });
  });

  q("[data-image-explore]")?.addEventListener("click", () => {
    const dialog = q("[data-image-dialog]");
    if (dialog?.showModal) dialog.showModal();
  });

  document.querySelectorAll("[data-inspector-iconography]").forEach((button) => {
    button.addEventListener("click", () => setInspectorIconography(button.dataset.inspectorIconography, true));
  });

  document.querySelectorAll("[data-inspector-entity]").forEach((button) => {
    button.addEventListener("click", () => setInspectorEntity(button.dataset.inspectorEntity, true));
  });

  document.querySelectorAll("[data-inspector-concept]").forEach((button) => {
    button.addEventListener("click", () => setInspectorConcept(button.dataset.inspectorConcept, true));
  });

  q("[data-open-profile]")?.addEventListener("click", () => {
    const drawer = q("[data-profile-drawer]");
    if (!drawer) return;
    drawer.open = true;
    drawer.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}
function wireProfile() {
  document.querySelectorAll("[data-profile-concept]").forEach((button) => {
    button.addEventListener("click", () => {
      setInspectorConcept(button.dataset.profileConcept, true);
      q(".semantic-workspace")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  q("[data-profile-drawer]")?.addEventListener("toggle", (event) => {
    const icon = event.currentTarget.querySelector(".drawer-icon");
    if (icon) icon.textContent = event.currentTarget.open ? "−" : "＋";
  });
}

function wireGraphControls() {
  q("[data-graph-reset]")?.addEventListener("click", setInspectorArtwork);

  q("[data-graph-pedagogy]")?.addEventListener("click", (event) => {
    graphState.pedagogyVisible = !graphState.pedagogyVisible;
    event.currentTarget.classList.toggle("is-active", graphState.pedagogyVisible);
    event.currentTarget.textContent = graphState.pedagogyVisible ? t.pedagogyHide : t.pedagogyShow;
    refreshGraph();
  });

  q("[data-graph-all]")?.addEventListener("click", () => {
    graphState.activeTypes = new Set(GRAPH_TYPES);
    graphState.externalSuggestions = [];
    graphState.externalVisible = false;
    document.querySelectorAll("[data-graph-type]").forEach((button) => button.classList.add("is-active"));
    q("[data-graph-all]")?.classList.add("is-active");
    refreshGraph();
  });

  document.querySelectorAll("[data-graph-type]").forEach((button) => {
    button.addEventListener("click", () => {
      const type = button.dataset.graphType;
      if (graphState.activeTypes.has(type)) graphState.activeTypes.delete(type);
      else graphState.activeTypes.add(type);

      button.classList.toggle("is-active", graphState.activeTypes.has(type));
      q("[data-graph-all]")?.classList.toggle("is-active", graphState.activeTypes.size === GRAPH_TYPES.length);
      refreshGraph();
    });
  });

  wireGraphNodes();
}
function searchIntentLabel(intent) {
  const key = {
    observe: "searchIntentObserve",
    compare: "searchIntentCompare",
    experience: "searchIntentExperience",
    location: "searchIntentLocation",
    explain: "searchIntentExplain",
    explore: "searchIntentExplore"
  }[intent] || "searchIntentExplore";
  return t[key] || intent;
}

function searchReasonLabel(reason) {
  const key = {
    graph: "searchReasonGraph",
    vector: "searchReasonVector",
    embedding: "searchReasonEmbedding",
    pedagogy: "searchReasonPedagogy",
    alias: "searchReasonAlias",
    experience: "searchReasonExperience",
    text: "searchReasonText"
  }[reason];
  return key ? (t[key] || reason) : reason;
}

function naturalSearchResultMarkup(result) {
  const reasons = [...new Set(result.reasons || [])].slice(0, 3);
  const reasonMarkup = reasons.length ? `
    <span class="semantic-query-reasons">
      ${reasons.map((reason) => `<i>${esc(searchReasonLabel(reason))}</i>`).join("")}
    </span>
  ` : "";

  if (result.kind === "experience") {
    const externalAttrs = result.external ? ' target="_blank" rel="noopener noreferrer"' : "";
    return `
      <a class="semantic-query-result is-experience" href="${esc(result.href)}"${externalAttrs}>
        <span class="semantic-query-kind">${esc(t.searchExperience)} · ${esc(experienceChannelLabel(result.subtitle))}</span>
        <strong>${esc(result.label)}</strong>
        <small>${esc(result.description || "")}</small>
        ${reasonMarkup}
      </a>
    `;
  }

  if (result.kind === "region") {
    return `
      <button type="button" class="semantic-query-result is-region"
        data-natural-region="${esc(result.id)}"
        data-natural-artwork="${esc(result.artworkId)}">
        <span class="semantic-query-kind">${esc(t.searchRegion)} · ${esc(result.subtitle || "")}</span>
        <strong>${esc(result.label)}</strong>
        ${result.rationale ? `<small>${esc(result.rationale)}</small>` : ""}
        ${result.prompt ? `<em>${esc(result.prompt)}</em>` : ""}
        ${reasonMarkup}
      </button>
    `;
  }

  return `
    <button type="button" class="semantic-query-result" data-natural-node="${esc(result.id)}">
      <span class="semantic-query-kind">${esc(typeLabel(result.subtitle || result.kind))}</span>
      <strong>${esc(result.label)}</strong>
      ${reasonMarkup}
    </button>
  `;
}

function wireSearch() {
  const input = q("[data-semantic-search]");
  const results = q("[data-search-results]");
  if (!input || !results) return;

  const close = () => {
    results.hidden = true;
    results.innerHTML = "";
  };

  const activateNode = (id) => {
    const resolved = resolveKnowledgeNode(semanticData, id);
    if (!resolved) return;
    if (resolved.kind === "artwork") location.href = urlFor(id);
    else if (resolved.kind === "entity") setInspectorEntity(id, true);
    else if (resolved.kind === "iconography") setInspectorIconography(id, true);
    else setInspectorConcept(id, true);
    q(".semantic-workspace")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const activateRegion = (artworkId, regionId) => {
    if (artworkId !== graphState.artworkId) {
      location.href = urlFor(artworkId, lang, regionId);
      return;
    }
    const dialog = q("[data-image-dialog]");
    if (dialog?.showModal) dialog.showModal();
    selectImageRegion(regionId);
  };

  let renderToken = 0;

  const render = async () => {
    const token = ++renderToken;
    const value = input.value.trim();
    if (!value) return close();

    const found = searchSemanticNaturalLanguage(semanticData, value, lang);
    results.hidden = false;

    if (!found.results.length) {
      const fallback = searchSemantic(semanticData, value, lang);
      const fallbackCount =
        fallback.concepts.length + fallback.artworks.length + fallback.entities.length + fallback.iconography.length;
      results.innerHTML = fallbackCount
        ? `<p class="search-empty">${esc(t.noResults)} · ${fallbackCount}</p>`
        : `<p class="search-empty">${esc(t.noResults)}</p>`;
      return;
    }

    const reranked = await rerankWithNeuralEmbeddings(value, found.results);
    if (token !== renderToken) return;
    const finalResults = reranked.results || found.results;
    const modeLabel = reranked.mode === "graph+neural-embedding" ? t.searchModeNeural : t.searchModeLocal;

    results.innerHTML = `
      <div class="semantic-query-summary">
        <strong>${esc(t.searchHybrid)}</strong>
        <span>${esc(searchIntentLabel(found.intent))} · ${esc(modeLabel)}</span>
      </div>
      <div class="semantic-query-result-list">
        ${finalResults.map(naturalSearchResultMarkup).join("")}
      </div>
    `;

    results.querySelectorAll("[data-natural-node]").forEach((button) => {
      button.addEventListener("click", () => {
        activateNode(button.dataset.naturalNode);
        close();
      });
    });

    results.querySelectorAll("[data-natural-region]").forEach((button) => {
      button.addEventListener("click", () => {
        activateRegion(button.dataset.naturalArtwork, button.dataset.naturalRegion);
        close();
      });
    });
  };

  let searchTimer = 0;
  input.addEventListener("input", () => {
    window.clearTimeout(searchTimer);
    searchTimer = window.setTimeout(() => { void render(); }, 220);
  });
  input.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
    if (event.key === "Enter") {
      event.preventDefault();
      void render();
    }
  });

  document.querySelectorAll("[data-query-example]").forEach((button) => {
    button.addEventListener("click", () => {
      input.value = button.dataset.queryExample || button.textContent || "";
      input.focus();
      render();
    });
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".workspace-search")) close();
  });
}
try {
  semanticData = await loadSemanticData();
  const requestedId = params.get("artwork") || "ld01";
  const artwork = getArtwork(semanticData, requestedId) || semanticData.artworks[0];

  graphState.artworkId = artwork.id;
  graphState.centerConceptId = null;
  graphState.centerEntityId = null;
  graphState.centerIconographyId = null;
  graphState.activeTypes = new Set(GRAPH_TYPES);
  graphState.pedagogyVisible = true;

  document.title = `${localize(artwork.title, lang)} · ARTDACI Semantic`;
  renderLanguages(artwork.id);

  app.innerHTML = [
    renderWorkspace(semanticData, artwork.id),
    relatedMarkup(semanticData, artwork.id),
    profileMarkup(semanticData, artwork.id),
    imageExplorerDialogMarkup(semanticData, artwork.id),
    `<p class="semantic-provenance-note">${esc(t.provider)}</p>`
  ].join("");

  wireGraphControls();
  wireInspector();
  wireProfile();
  wireImageExplorer();
  wireSearch();

  const requestedNode = params.get("node");
  if (requestedNode) {
    const resolved = resolveKnowledgeNode(semanticData, requestedNode);
    if (resolved?.kind === "entity") setInspectorEntity(requestedNode, true);
    else if (resolved?.kind === "iconography") setInspectorIconography(requestedNode, true);
    else if (resolved?.kind === "concept") setInspectorConcept(requestedNode, true);
    else if (resolved?.kind === "artwork" && requestedNode !== artwork.id) location.href = urlFor(requestedNode);
  }

  const requestedRegion = params.get("region");
  if (requestedRegion) {
    const region = getImageRegion(semanticData, requestedRegion);
    if (region?.artworkId === artwork.id) {
      const dialog = q("[data-image-dialog]");
      if (dialog?.showModal) dialog.showModal();
      selectImageRegion(requestedRegion);
    }
  }

  const assertionCount = semanticData.artworks.reduce(
    (sum, item) => sum + (item.assertions?.length || item.concepts?.length || 0),
    0
  );
  status.textContent = `${semanticData.concepts.length} concepts · ${semanticData.iconographySubjects.length} sujets iconographiques · ${semanticData.pedagogicalRelations.length} relations pédagogiques · ${semanticData.imageAnnotations.length} œuvres IIIF · FR / EN / AR`;
  status.dataset.state = "ready";
  void initIntelligentExplorer(semanticData, lang, artwork.id);
} catch (error) {
  console.error(error);
  status.textContent = t.error;
  status.dataset.state = "error";
}
