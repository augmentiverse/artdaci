const MANIFEST_URLS = [
  "content/paintings/mona-lisa.json",
  "content/paintings/van-gogh.json",
  "content/paintings/van-gogh-bedroom.json",
  "content/paintings/vermeer-girl-with-a-pearl-earring.json"
];

const BEDROOM_VR_WORLD_URL = "https://marble.worldlabs.ai/worldvr/48b7eb17-56e4-4873-a253-fa13ed516fae";
const LEONARDO_STUDIO_VR_WORLD_URL = "https://marble.worldlabs.ai/worldvr/862ab5f6-8608-469c-a840-8cb10f3859ae";

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

const BOOK_SECTION_COPY = {
  en: {
    story: "STORY & CONTEXT",
    looking: "LOOK CLOSER",
    technique: "MATERIALS & DISCOVERIES",
    legacy: "MEANING & LEGACY",
    notice: "DETAILS TO REMEMBER"
  },
  fr: {
    story: "HISTOIRE ET CONTEXTE",
    looking: "REGARDER DE PLUS PRÈS",
    technique: "MATIÈRES ET DÉCOUVERTES",
    legacy: "SENS ET HÉRITAGE",
    notice: "DÉTAILS À RETENIR"
  },
  ar: {
    story: "القصة والسياق",
    looking: "نظرة أقرب",
    technique: "المواد والاكتشافات",
    legacy: "المعنى والإرث",
    notice: "تفاصيل جديرة بالتذكر"
  }
};

const BOOK_FRENCH_TEXT = {
  "mona-lisa": {
    story: "Léonard commence ce portrait à Florence au début du XVIe siècle. Le modèle est généralement identifié comme Lisa Gherardini, épouse du marchand Francesco del Giocondo. Léonard conserva pourtant le tableau et continua probablement à le retravailler pendant plusieurs années. Cette lente élaboration transforme un portrait privé en une étude ambitieuse de la présence humaine, de la lumière et de la nature.",
    looking: "La pose de trois quarts remplace le profil rigide encore courant dans les portraits florentins. Les mains croisées forment une base stable, tandis que le visage devient le centre calme de la composition. À l’arrière-plan, routes, eau et montagnes se dissolvent dans l’atmosphère. Le sourire paraît changer parce que ses transitions très douces sollicitent différemment la vision centrale et périphérique.",
    technique: "Le sfumato naît de fines couches transparentes qui atténuent contours et contrastes comme une légère fumée. L’imagerie scientifique révèle aussi des modifications des doigts, du voile et du paysage : Léonard construisait l’œuvre par observation et révision. Peinte sur un panneau de peuplier devenu fragile, La Joconde est aujourd’hui protégée au Louvre dans une vitrine à température et humidité contrôlées.",
    legacy: "La virtuosité de l’œuvre, la réputation de Léonard, le vol spectaculaire de 1911 et d’innombrables reproductions ont fait de La Joconde une icône mondiale. Elle a influencé le portrait psychologique et l’union de la figure avec le paysage, avant d’être réinterprétée par Marcel Duchamp, Andy Warhol et la culture populaire. Son pouvoir demeure pourtant dans de très petites décisions visuelles qui récompensent un regard lent."
  },
  "van-gogh": {
    story: "Van Gogh peint cet autoportrait à Paris en 1887, au moment où il découvre l’impressionnisme, le néo-impressionnisme et les nouvelles théories de la couleur. Faute d’argent pour payer régulièrement des modèles, il utilise son propre visage comme laboratoire. Chaque autoportrait lui permet d’étudier la ressemblance, l’expression et la manière dont une touche visible peut traduire un état intérieur.",
    looking: "La tête, légèrement tournée, se détache d’un fond bleu-vert parcouru de touches courtes. Les rouges et orangés de la barbe vibrent contre leurs couleurs complémentaires. Les coups de pinceau suivent le front, les pommettes, la barbe et la veste au lieu de disparaître dans un modelé académique. Le regard fixe stabilise cette surface agitée et donne au portrait sa tension psychologique.",
    technique: "Van Gogh construit les volumes avec la direction, l’épaisseur et la couleur des touches. Les marques serrées du visage décrivent sa structure, tandis que le fond forme une atmosphère mouvante. Les contrastes rouge-vert et orange-bleu témoignent de ses recherches parisiennes. Cette méthode prépare le langage plus libre et expressif qu’il développera ensuite à Arles et à Saint-Rémy.",
    legacy: "Les autoportraits de Van Gogh sont devenus des images majeures de l’artiste moderne : le peintre y est à la fois observateur, modèle et matière d’expérimentation. Ils ont montré aux expressionnistes que la fidélité psychologique pouvait compter autant que la ressemblance physique. Regardez surtout la relation entre les yeux immobiles et les touches mobiles : le tableau semble enregistrer l’acte même de se regarder."
  },
  "van-gogh-bedroom": {
    story: "Van Gogh peint sa chambre de la Maison jaune à Arles en octobre 1888, peu avant l’arrivée de Paul Gauguin. Il rêvait d’y créer un « atelier du Midi » réunissant des artistes. Cette pièce modeste représentait pour lui un premier foyer personnel et un refuge. Dans une lettre à son frère Theo, il explique que la couleur devait suggérer le repos et « reposer l’imagination ».",
    looking: "La chambre réelle était trapézoïdale, mais Van Gogh accentue encore ses angles. Le sol semble se relever et les meubles basculer vers le visiteur. Le lit jaune domine la droite, tandis que les chaises, la table, la fenêtre et les tableaux forment un rythme de rectangles. Les contours épais et les aplats inspirés des estampes japonaises rendent l’espace volontairement plus expressif que réaliste.",
    technique: "Van Gogh décrivait des murs violet pâle, un sol rouge fané, des meubles jaune chrome et une couverture écarlate. Des pigments rouges sensibles à la lumière ont disparu peu à peu : les murs paraissent aujourd’hui plus bleus et le sol moins rose. Les analyses ont aussi confirmé les dégâts d’eau de la première version et révélé des fragments de journal utilisés pour maintenir la peinture qui s’écaillait.",
    legacy: "Van Gogh réalisa trois versions authentiques : Amsterdam en 1888, Chicago en 1889 après les dégâts subis par la première, puis une réduction destinée à sa mère et à sa sœur, aujourd’hui à Paris. Les portraits accrochés au mur changent selon les versions. L’œuvre transforme une chambre vide en portrait émotionnel du foyer, de l’amitié espérée et du besoin de stabilité."
  },
  "vermeer-girl-with-a-pearl-earring": {
    story: "Peinte à Delft vers 1665, l’œuvre est une tronie : une étude de caractère et de costume, non un portrait officiel destiné à identifier une personne. L’identité du modèle reste inconnue. Le turban imaginaire, la pose tournée et l’arrière-plan sombre détachent la jeune fille de la vie quotidienne et créent un instant suspendu.",
    looking: "Le corps se tourne dans une direction tandis que la tête revient vers nous. Ce mouvement en spirale aboutit au contact du regard et aux lèvres entrouvertes. Le col clair sépare le visage du vêtement, et la perle répond aux reflets des yeux et de la bouche. Quelques accents lumineux suffisent à faire émerger la figure de l’obscurité.",
    technique: "Vermeer emploie un outremer naturel coûteux, obtenu à partir de lapis-lazuli, pour le foulard bleu. Le fond était autrefois une surface vert sombre plus brillante, dont les pigments organiques ont pâli. L’étude scientifique de 2018 a utilisé microscope 3D, MA-XRF et imagerie infrarouge. Elle a révélé de minuscules cils et confirmé que la « perle » n’a ni contour complet ni crochet visible.",
    legacy: "Acquise en 1881 pour seulement deux florins et trente centimes, l’œuvre entre au Mauritshuis en 1902. Sa simplicité, son silence narratif et son identité ouverte ont inspiré romans, cinéma, photographie et mode. Les théories sur une camera obscura restent possibles mais non prouvées : aucune preuve documentaire ou trace matérielle ne confirme l’emploi d’un appareil précis."
  }
};

const BOOK_ARABIC_TEXT = {
  "mona-lisa": {
    story: "بدأ ليوناردو دافنشي رسم هذا البورتريه في فلورنسا مطلع القرن السادس عشر. ويُعتقد أن الجالسة هي ليزا غيرارديني. احتفظ ليوناردو باللوحة وواصل تنقيحها سنوات، فتحولت من صورة شخصية إلى دراسة عميقة للحضور الإنساني والضوء والطبيعة.",
    looking: "تمنح وضعية الثلاثة أرباع واليدان المتقاطعتان التكوين هدوءاً وثباتاً. يتلاشى الطريق والماء والجبال في الخلفية بفضل المنظور الجوي، بينما يبدو الابتسام متغيراً بسبب الانتقالات الناعمة حول الفم.",
    technique: "بنى ليوناردو تقنية السفوماتو بطبقات شفافة بالغة الرقة تخفف الحواف مثل الدخان. تكشف الصور العلمية تعديلات في الأصابع والوشاح والمنظر الطبيعي، ما يدل على عملية طويلة من الملاحظة والمراجعة.",
    legacy: "جعلت براعة اللوحة وشهرة ليوناردو وسرقتها عام 1911 وانتشار نسخها منها أيقونة عالمية. أثرت في فن البورتريه النفسي وما زالت تفاصيلها الدقيقة تكافئ النظر البطيء."
  },
  "van-gogh": {
    story: "رسم فان غوخ هذا البورتريه الذاتي في باريس سنة 1887 أثناء تعرفه إلى الانطباعية ونظريات اللون الحديثة. استخدم وجهه مختبراً عملياً لدراسة التعبير واللون وضربات الفرشاة.",
    looking: "تتحرك ضربات قصيرة زرقاء وخضراء حول الرأس، وتتوهج اللحية الحمراء والبرتقالية أمام ألوانها المكملة. يثبّت النظر المباشر السطح المتحرك ويمنح الصورة توترها النفسي.",
    technique: "يبني فان غوخ الشكل باتجاه الضربات وسماكتها ولونها. تصف العلامات بنية الوجه، بينما تتحول الخلفية إلى جو نابض يمهد لأسلوبه الأكثر حرية في آرل وسان ريمي.",
    legacy: "أصبحت بورتريهاته الذاتية صوراً أساسية للفنان الحديث بوصفه رساماً ومراقباً وموضوعاً للتجربة في آن واحد. ألهمت الأجيال اللاحقة للبحث عن الصدق النفسي لا التشابه فقط."
  },
  "van-gogh-bedroom": {
    story: "رسم فان غوخ غرفته في البيت الأصفر بآرل في أكتوبر 1888. مثّلت الغرفة أول منزل خاص به وملاذاً شخصياً، وكان يريد للألوان أن توحي بالراحة وتهدئ الخيال.",
    looking: "كانت الغرفة الحقيقية شبه منحرفة، لكن فان غوخ بالغ في زواياها. يبدو الأرض مائلاً والأثاث متجهاً نحو المشاهد، وتخلق السرير والكراسي والنافذة إيقاعاً من المستطيلات والخطوط القوية.",
    technique: "وصف الفنان جدراناً بنفسجية باهتة وأرضية حمراء وأثاثاً أصفر وغطاءً قرمزياً. بهتت الأصباغ الحمراء الحساسة للضوء، لذلك تبدو الجدران اليوم أكثر زرقة مما كانت عليه.",
    legacy: "أنجز فان غوخ ثلاث نسخ أصلية من غرفة النوم. تتغير الصور المعلقة بين النسخ، وتحول اللوحة المكان البسيط إلى صورة عاطفية للبيت والصداقة والحاجة إلى الاستقرار."
  },
  "vermeer-girl-with-a-pearl-earring": {
    story: "رسم فيرمير هذه اللوحة في دلفت نحو 1665. وهي تروني، أي دراسة لشخصية وملابس غير مألوفة وليست بورتريهاً رسمياً. ما زالت هوية الفتاة مجهولة.",
    looking: "يدور الجسد في اتجاه بينما يعود الرأس نحو المشاهد. ينتهي هذا الالتفاف باتصال مباشر للعينين وشفاه نصف مفتوحة، وتكرر اللؤلؤة أضواء العين والفم.",
    technique: "استخدم فيرمير حجر اللازورد الثمين في غطاء الرأس الأزرق. كان لون الخلفية أخضر داكناً ثم بهت. وكشفت دراسة 2018 رموشاً دقيقة وأكدت أن اللؤلؤة بلا محيط كامل أو خطاف ظاهر.",
    legacy: "اشتُريت اللوحة عام 1881 بسعر زهيد، ودخلت مجموعة موريتشهاوس سنة 1902. ألهم غموضها وصمتها السردي الروايات والسينما والتصوير والأزياء."
  }
};

const BOOK_ENGLISH_TEXT = {
  "mona-lisa": {
    story: "Leonardo began this portrait in Florence in the early sixteenth century. The sitter is generally identified as Lisa Gherardini, wife of the merchant Francesco del Giocondo. Leonardo nevertheless kept the painting and probably refined it over several years. That slow process transformed a private likeness into an ambitious study of human presence, light, atmosphere, and the changing forms of nature.",
    looking: "The natural three-quarter pose replaces the rigid profile common in earlier Florentine portraits. Folded hands create a stable base while the face becomes the calm centre of the design. Behind her, roads, water, and mountains dissolve into atmospheric distance. The smile seems to shift because its soft tonal transitions register differently in central and peripheral vision.",
    technique: "Sfumato is built from extremely thin translucent layers that soften edges and contrasts like smoke. Scientific imaging also reveals changes to the fingers, veil, face, and landscape: Leonardo developed the work through repeated observation and revision. Painted on a poplar panel that has warped over time, the Mona Lisa is now protected at the Louvre in a temperature- and humidity-controlled case.",
    legacy: "Technical brilliance, Leonardo’s reputation, the spectacular 1911 theft, and endless reproduction turned the Mona Lisa into a global icon. It shaped psychological portraiture and the integration of figure and landscape, then became material for artists including Marcel Duchamp and Andy Warhol. Its lasting power, however, lies in many quiet visual decisions that reward slow looking."
  },
  "van-gogh": {
    story: "Van Gogh painted this self-portrait in Paris in 1887, while absorbing Impressionism, Neo-Impressionism, and modern colour theory. Because he could rarely afford professional models, he used his own face as a practical laboratory. Each self-portrait allowed him to test likeness, expression, complementary colour, and the ability of visible brushwork to communicate an inner state.",
    looking: "The head turns slightly against a blue-green field of short strokes. Reds and oranges in the beard vibrate against their complementary colours. Instead of disappearing into smooth academic modelling, the brushmarks follow the forehead, cheekbones, beard, jacket, and surrounding air. The fixed gaze steadies this restless surface and gives the portrait its psychological tension.",
    technique: "Van Gogh builds form through the direction, thickness, and colour of individual strokes. Closely packed marks describe the structure of the face while the background becomes a moving atmosphere. Red-green and orange-blue contrasts reflect his experiments in Paris. This method prepares the freer, more expressive visual language he would develop in Arles and Saint-Rémy.",
    legacy: "Van Gogh’s self-portraits became defining images of the modern artist: painter, observer, and experimental subject at once. They showed later Expressionists that psychological truth could matter as much as physical likeness. Look especially at the relationship between the still eyes and the moving brushwork—the painting seems to preserve the act of looking at oneself."
  },
  "van-gogh-bedroom": {
    story: "Van Gogh painted his room in the Yellow House at Arles in October 1888, shortly before Paul Gauguin arrived. He hoped to create a shared “Studio of the South” there. The modest bedroom represented his first home of his own and a private refuge. In a letter to Theo, he explained that its colours should suggest rest and “repose the imagination.”",
    looking: "The real room was trapezoidal, but Van Gogh heightened its irregular angles. The floor appears to tilt upward and the furniture seems to fall toward the viewer. The yellow bed dominates the right side while chairs, table, window, and pictures create a rhythm of rectangles. Thick outlines and flat colour, inspired partly by Japanese prints, make the space expressive rather than optically correct.",
    technique: "Van Gogh described pale violet walls, a faded red floor, chrome-yellow furniture, and a scarlet blanket. Light-sensitive red pigments gradually faded, so the walls now look bluer and the floor less pink. Technical study also confirmed water damage to the first version and found fragments of newspaper that Van Gogh attached to hold flaking paint in place.",
    legacy: "Van Gogh made three authentic versions: Amsterdam in 1888, Chicago in 1889 after the first was damaged, and a smaller reduction for his mother and sister, now in Paris. The portraits on the wall change between versions. The painting turns an empty room into an emotional portrait of home, hoped-for friendship, and the need for stability."
  },
  "vermeer-girl-with-a-pearl-earring": {
    story: "Painted in Delft around 1665, this work is a tronie—a study of character and unusual costume rather than a formal portrait intended to record one person’s identity. The sitter remains unknown. The imagined turban, turning pose, and dark background remove the girl from everyday Dutch life and create a suspended moment of encounter.",
    looking: "Her body turns one way while her head returns toward us. This spiral movement ends in direct eye contact and parted lips. The bright collar separates the face from the jacket, while the earring echoes highlights in the eyes and mouth. A small number of precisely placed accents is enough to bring the figure out of darkness.",
    technique: "Vermeer used costly natural ultramarine made from lapis lazuli in the blue headscarf. The background was once a glossier deep green but its organic pigments faded. The 2018 examination used 3D microscopy, MA-XRF, and infrared imaging. It revealed tiny eyelashes and confirmed that the “pearl” has neither a complete contour nor a visible hook.",
    legacy: "Bought in 1881 for only two guilders and thirty cents, the painting entered the Mauritshuis collection in 1902. Its visual economy, narrative silence, and open identity have inspired novels, film, photography, and fashion. Camera-obscura theories remain possible but unproven: no document or physical trace confirms that Vermeer used a particular optical device."
  }
};

const params = new URLSearchParams(location.search);
const lang = ["en", "fr", "ar"].includes(params.get("lang")) ? params.get("lang") : "en";
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
const activePointers = new Map();
let pinchStartDistance = null;
let pinchHandled = false;
let suppressPageClick = false;

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
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  document.querySelector(".book-back").href = lang === "ar" ? "index-ar.html" : lang === "fr" ? "index-fr.html" : "index.html";
  document.querySelector(".book-back").textContent = lang === "ar" ? "العودة إلى المجموعة" : lang === "fr" ? "Retour à la collection" : "Back to collection";
  document.querySelector(".book-toolbar p").textContent = lang === "ar" ? "كتاب فني تفاعلي" : lang === "fr" ? "Livre d’art interactif" : "Interactive art book";
  document.querySelector(".book-toolbar h1").textContent = lang === "ar" ? "الكتاب الحي" : lang === "fr" ? "Le Livre Vivant" : "The Living Book";
  document.querySelector(".book-hint").textContent = lang === "ar"
    ? "انقر على الصفحة أو اسحبها أو اقرصها لقلبها. اختر علامة مضيئة لفتح المحتوى الغامر."
    : lang === "fr"
      ? "Cliquez sur une page, balayez ou pincez pour la tourner. Sélectionnez un repère lumineux pour le contenu immersif."
      : "Click a page, swipe, or pinch to turn it. Select a glowing hotspot for immersive content.";
  previousButton.textContent = lang === "ar" ? "→ السابق" : lang === "fr" ? "← Précédent" : "← Previous";
  nextButton.textContent = lang === "ar" ? "التالي ←" : lang === "fr" ? "Suivant →" : "Next →";
  closeExperienceButton.textContent = lang === "ar" ? "العودة إلى الكتاب ✕" : lang === "fr" ? "Retour au livre ✕" : "Return to book ✕";
}

function buildPageDefinitions(manifests) {
  const sectionCopy = BOOK_SECTION_COPY[lang];
  const pages = [
    {
      kind: "cover",
      eyebrow: "ARTDACI",
      title: lang === "ar" ? "روائع فنية حية" : lang === "fr" ? "CHEFS-D’ŒUVRE VIVANTS" : "MASTERPIECES ALIVE",
      subtitle: lang === "ar" ? "كتاب مطبوع، ومتحف مكاني." : lang === "fr" ? "Un livre imprimé. Un musée spatial." : "A printed book. A spatial museum."
    },
    {
      kind: "intro",
      eyebrow: lang === "ar" ? "طريقة الاستكشاف" : lang === "fr" ? "MODE D’EMPLOI" : "HOW TO EXPLORE",
      title: lang === "ar" ? "اقرأ. اختر. ادخل." : lang === "fr" ? "Lisez. Touchez. Entrez." : "Read. Select. Enter.",
      body: lang === "ar"
        ? "اقلب الصفحات كما في كتاب حقيقي. تفتح العلامات المضيئة نماذج ثلاثية الأبعاد وسرداً صوتياً ورسوم حركة ومشاهد غامرة، ثم تعيدك إلى الصفحة نفسها."
        : lang === "fr"
          ? "Tournez les pages comme dans un livre réel. Les repères lumineux ouvrent des objets 3D, des narrations, des animations et des scènes immersives. Fermez l’expérience pour revenir exactement à la page quittée."
          : "Turn pages as you would in a real book. Glowing markers open 3D objects, narration, animation, and immersive scenes. Close an experience to return to the exact page you left."
    }
  ];

  manifests.forEach((manifest, index) => {
    const title = localizedTitle(manifest);
    const audio = getAudio(manifest);
    const videos = manifest.media?.videos || [];
    const texts = getBookTexts(manifest);
    const galleryImages = BOOK_IMAGE_GALLERIES[manifest.slug] || [];
    pages.push({
      kind: "artwork",
      eyebrow: `${String(index + 1).padStart(2, "0")} · ${sectionCopy.story}`,
      title,
      subtitle: `${manifest.artist?.name || ""} · ${manifest.date || ""}`,
      image: manifest.media?.image || manifest.print?.imageTargetSource,
      body: texts.story,
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
      eyebrow: sectionCopy.looking,
      title,
      image: manifest.media?.image || manifest.print?.imageTargetSource,
      galleryImages,
      body: texts.looking,
      manifest,
      hotspots: [
        { label: "VR", x: 82, y: 24, type: manifest.slug === "van-gogh-bedroom" ? "world" : "vr" },
        { label: "◉", x: 82, y: 38, type: "gallery" },
        ...(manifest.slug === "mona-lisa"
          ? [{ label: "VR+", x: 82, y: 52, type: "studio", url: LEONARDO_STUDIO_VR_WORLD_URL }]
          : [])
      ]
    });
    pages.push({
      kind: "technique",
      eyebrow: sectionCopy.technique,
      title,
      image: galleryImages[1] || manifest.media?.image || manifest.print?.imageTargetSource,
      body: texts.technique,
      manifest,
      hotspots: [
        ...(videos[0] ? [{ label: "▶", x: 82, y: 25, type: "video", video: videos[0] }] : []),
        { label: "AR", x: 82, y: 39, type: "ar" }
      ]
    });
    pages.push({
      kind: "legacy",
      eyebrow: sectionCopy.legacy,
      title,
      image: galleryImages[2] || galleryImages[0] || manifest.media?.image,
      body: texts.legacy,
      facts: (manifest.texts?.interestingFacts || []).slice(0, 3),
      manifest,
      hotspots: [
        { label: "3D", x: 82, y: 24, type: "space" },
        { label: "♪", x: 82, y: 38, type: "audio", audio },
        ...(videos[1] ? [{ label: "▶", x: 82, y: 52, type: "video", video: videos[1] }] : [])
      ]
    });
  });

  pages.push({
    kind: "back",
    eyebrow: "ARTDACI",
    title: lang === "ar" ? "تابع الاستكشاف" : lang === "fr" ? "CONTINUEZ L’EXPLORATION" : "KEEP EXPLORING",
    subtitle: lang === "ar" ? "تستمر المجموعة داخل معرض الواقع الافتراضي." : lang === "fr" ? "La collection continue dans la galerie VR." : "The collection continues inside the VR Gallery."
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
  page.dataset.kind = definition.kind || "";
  if (definition.manifest?.slug) page.dataset.painting = definition.manifest.slug;
  page.setAttribute("aria-label", definition.title || definition.eyebrow || "Book page");
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
  page.addEventListener("click", (event) => {
    if (event.target.closest(".page-hotspot") || dialog.open) return;
    if (suppressPageClick) {
      suppressPageClick = false;
      return;
    }
    if (side === "front") nextPage();
    else previousPage();
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
    drawImageGallery(context, galleryImages, 130, 350, 1340, 620);
  } else if (definition.image) {
    const image = await loadImage(definition.image);
    if (definition.kind === "artwork") {
      drawCoverImage(context, image, 120, 420, 1360, 760);
    } else {
      drawCoverImage(context, image, 130, 350, 1340, 620);
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
    const bodyY = definition.kind === "artwork" ? 1280 : definition.image ? 1065 : 990;
    const bodyBottom = definition.facts?.length ? 1650 : 1990;
    context.fillStyle = "rgba(255, 250, 240, .66)";
    context.fillRect(105, bodyY - 52, 1390, bodyBottom - bodyY + 78);
    context.fillStyle = "#2e251e";
    drawTextInBox(context, definition.body, 130, bodyY, 1340, bodyBottom - bodyY, {
      fontFamily: "Georgia",
      maxFontSize: 42,
      minFontSize: 31,
      lineHeightRatio: 1.48
    });
  }

  if (definition.facts?.length) {
    context.fillStyle = "#7d2f3e";
    context.font = "700 34px Arial";
    context.fillText(BOOK_SECTION_COPY[lang].notice, 130, 1720);
    context.fillStyle = "#3f352c";
    context.font = "32px Georgia";
    definition.facts.forEach((fact, index) => {
      drawWrappedText(context, `• ${fact}`, 145, 1780 + index * 92, 1260, 42, 2);
    });
  }

  context.fillStyle = dark ? "#d6bd92" : "#765f4a";
  context.font = "30px Arial";
  context.fillText("ARTDACI · MASTERPIECES ALIVE", 120, canvas.height - 100);
}

function drawTextInBox(context, message, x, y, width, height, options = {}) {
  const family = options.fontFamily || "Georgia";
  const maxSize = options.maxFontSize || 42;
  const minSize = options.minFontSize || 30;
  const ratio = options.lineHeightRatio || 1.45;
  for (let size = maxSize; size >= minSize; size -= 1) {
    context.font = `${size}px ${family}`;
    const lines = wrapTextLines(context, message, width);
    const lineHeight = size * ratio;
    if (lines.length * lineHeight <= height) {
      lines.forEach((line, index) => context.fillText(line, x, y + index * lineHeight));
      return;
    }
  }
  context.font = `${minSize}px ${family}`;
  const lineHeight = minSize * ratio;
  const maxLines = Math.max(1, Math.floor(height / lineHeight));
  const lines = wrapTextLines(context, message, width).slice(0, maxLines);
  if (lines.length === maxLines) lines[maxLines - 1] = `${lines[maxLines - 1].replace(/[.,;:]?$/, "")}…`;
  lines.forEach((line, index) => context.fillText(line, x, y + index * lineHeight));
}

function wrapTextLines(context, message, maxWidth) {
  const words = String(message).split(/\s+/);
  const lines = [];
  let line = "";
  words.forEach((word) => {
    const testLine = line ? `${line} ${word}` : word;
    if (line && context.measureText(testLine).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = testLine;
    }
  });
  if (line) lines.push(line);
  return lines;
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
  if (lang === "ar") return {
    "mona-lisa": "الموناليزا",
    "van-gogh": "بورتريه ذاتي",
    "van-gogh-bedroom": "غرفة النوم",
    "vermeer-girl-with-a-pearl-earring": "الفتاة ذات القرط اللؤلؤي"
  }[manifest.slug] || manifest.title;
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
  const mediaLang = lang === "ar" ? "fr" : lang;
  return list.find((item) => item.lang === mediaLang) || list.find((item) => item.lang === "fr") || list.find((item) => item.lang === "en") || list[0];
}

function getBookTexts(manifest) {
  if (lang === "ar" && BOOK_ARABIC_TEXT[manifest.slug]) return BOOK_ARABIC_TEXT[manifest.slug];
  if (lang === "fr" && BOOK_FRENCH_TEXT[manifest.slug]) return BOOK_FRENCH_TEXT[manifest.slug];
  if (BOOK_ENGLISH_TEXT[manifest.slug]) return BOOK_ENGLISH_TEXT[manifest.slug];
  const texts = manifest.texts || {};
  const techniqueBySlug = {
    "mona-lisa": [texts.sfumatoStudy, texts.scientificAnalysis, texts.conservationHistory],
    "van-gogh": [texts.palette, texts.perspectiveTechnique],
    "van-gogh-bedroom": [texts.palette, texts.perspectiveTechnique],
    "vermeer-girl-with-a-pearl-earring": [texts.palette, texts.perspectiveTechnique]
  };
  return {
    story: [texts.historicalContext, texts.artistBiography].filter(Boolean).join(" "),
    looking: [texts.artisticAnalysis, texts.composition].filter(Boolean).join(" "),
    technique: (techniqueBySlug[manifest.slug] || [texts.palette, texts.perspectiveTechnique]).filter(Boolean).join(" "),
    legacy: [texts.culturalSignificance, texts.influence, texts.curatorInsight].filter(Boolean).join(" ")
  };
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
  book.addEventListener("pointerdown", (event) => {
    dragStartX = event.clientX;
    activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (activePointers.size === 2) {
      pinchStartDistance = getPointerDistance();
      pinchHandled = false;
    }
  });
  book.addEventListener("pointermove", (event) => {
    if (!activePointers.has(event.pointerId)) return;
    activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (activePointers.size !== 2 || pinchHandled || pinchStartDistance === null) return;
    const change = getPointerDistance() - pinchStartDistance;
    if (change < -70) {
      pinchHandled = true;
      markPageClickSuppressed();
      nextPage();
    } else if (change > 70) {
      pinchHandled = true;
      markPageClickSuppressed();
      previousPage();
    }
  });
  book.addEventListener("pointerup", (event) => {
    const wasPinching = pinchStartDistance !== null;
    activePointers.delete(event.pointerId);
    if (activePointers.size < 2) pinchStartDistance = null;
    if (wasPinching) {
      dragStartX = null;
      return;
    }
    if (dragStartX === null) return;
    const delta = event.clientX - dragStartX;
    dragStartX = null;
    if (delta < -55) {
      markPageClickSuppressed();
      nextPage();
    }
    if (delta > 55) {
      markPageClickSuppressed();
      previousPage();
    }
  });
  book.addEventListener("pointercancel", (event) => {
    activePointers.delete(event.pointerId);
    if (activePointers.size < 2) pinchStartDistance = null;
    dragStartX = null;
  });
}

function getPointerDistance() {
  const points = [...activePointers.values()];
  if (points.length < 2) return 0;
  return Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
}

function markPageClickSuppressed() {
  suppressPageClick = true;
  setTimeout(() => { suppressPageClick = false; }, 400);
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

    const front = sheet.querySelector(".page-front");
    const back = sheet.querySelector(".page-back");
    const frontIsVisible = index === currentLeaf;
    const backIsVisible = index === currentLeaf - 1;
    if (front) {
      front.style.pointerEvents = frontIsVisible ? "auto" : "none";
      front.setAttribute("aria-hidden", String(!frontIsVisible));
      front.querySelectorAll(".page-hotspot").forEach((button) => {
        button.tabIndex = frontIsVisible ? 0 : -1;
      });
    }
    if (back) {
      back.style.pointerEvents = backIsVisible ? "auto" : "none";
      back.setAttribute("aria-hidden", String(!backIsVisible));
      back.querySelectorAll(".page-hotspot").forEach((button) => {
        button.tabIndex = backIsVisible ? 0 : -1;
      });
    }
  });
  previousButton.disabled = currentLeaf === 0;
  nextButton.disabled = currentLeaf === sheets.length;
  const visiblePage = Math.min(currentLeaf * 2, pageDefinitions.length - 1);
  progress.textContent = currentLeaf === 0
    ? (lang === "ar" ? "الغلاف" : lang === "fr" ? "Couverture" : "Cover")
    : `${lang === "ar" ? "الصفحات" : "Pages"} ${visiblePage}–${Math.min(visiblePage + 1, pageDefinitions.length)}`;
}

function openExperience(definition, hotspot) {
  const manifest = definition.manifest;
  experienceTitle.textContent = definition.title;
  experienceKicker.textContent = {
    audio: lang === "ar" ? "سرد صوتي" : lang === "fr" ? "Narration audio" : "Audio narration",
    video: lang === "ar" ? "مشهد متحرك معاد تخيله" : lang === "fr" ? "Scène réimaginée en mouvement" : "Reimagined scene in motion",
    space: lang === "ar" ? "نموذج ثلاثي الأبعاد تفاعلي" : lang === "fr" ? "Objet 3D interactif" : "Interactive 3D object",
    ar: lang === "ar" ? "واقع معزز" : lang === "fr" ? "Réalité augmentée" : "Augmented reality",
    vr: lang === "ar" ? "مشهد واقع افتراضي" : lang === "fr" ? "Scène VR" : "VR scene",
    world: lang === "ar" ? "عالم افتراضي" : lang === "fr" ? "Monde VR" : "VR world",
    studio: lang === "ar" ? "محترف ليوناردو الافتراضي" : lang === "fr" ? "Atelier de Léonard en VR" : "Leonardo’s Studio in VR",
    gallery: lang === "ar" ? "معرض غامر" : lang === "fr" ? "Galerie immersive" : "Immersive gallery"
  }[hotspot.type] || "Immersive layer";

  if (hotspot.type === "audio" && hotspot.audio?.src) {
    experienceBody.innerHTML = `<div class="experience-audio"><audio controls autoplay src="${hotspot.audio.src}"></audio></div>`;
  } else if (hotspot.type === "video" && hotspot.video?.src) {
    const companionAudioSrc = (lang === "fr" || lang === "ar") && hotspot.video.audioSrcFr
      ? hotspot.video.audioSrcFr
      : hotspot.video.audioSrc;
    const companionAudio = companionAudioSrc
      ? `<audio data-video-sound preload="auto" src="${companionAudioSrc}"></audio>`
      : "";
    experienceBody.innerHTML = `
      <div class="experience-video">
        <video controls autoplay playsinline ${companionAudioSrc ? "muted" : ""} src="${hotspot.video.src}"></video>
        ${companionAudio}
        <div class="experience-video-controls">
          <button type="button" data-video-action="toggle">${lang === "fr" ? "Pause" : "Pause"}</button>
          <button type="button" data-video-action="mute">${lang === "fr" ? "Couper le son" : "Mute sound"}</button>
        </div>
        <p>${hotspot.video.description || ""}</p>
      </div>
    `;
    bindBookVideoControls();
  } else if (hotspot.type === "world") {
    experienceBody.innerHTML = `
      <div class="experience-world">
        <p>${lang === "fr"
          ? "Explorez la chambre de Van Gogh comme un monde VR immersif."
          : "Explore Van Gogh’s Bedroom as an immersive VR world."}</p>
        <a href="${BEDROOM_VR_WORLD_URL}">
          ${lang === "fr" ? "Ouvrir le monde VR de La Chambre" : "Open The Bedroom VR World"}
        </a>
        <small>${lang === "fr"
          ? "Le monde VR s’ouvrira directement dans cette fenêtre."
          : "The VR world will open directly in this window."}</small>
      </div>
    `;
  } else if (hotspot.type === "studio") {
    experienceBody.innerHTML = `
      <div class="experience-world">
        <p>${lang === "fr"
          ? "Entrez dans l’atelier de Léonard de Vinci et découvrez son univers en VR."
          : "Enter Leonardo da Vinci’s studio and explore his world in VR."}</p>
        <a href="${hotspot.url || LEONARDO_STUDIO_VR_WORLD_URL}">
          ${lang === "fr" ? "Ouvrir l’atelier de Léonard en VR" : "Open Leonardo’s Studio in VR"}
        </a>
        <small>${lang === "fr"
          ? "Le monde VR s’ouvrira directement dans cette fenêtre."
          : "The VR world will open directly in this window."}</small>
      </div>
    `;
  } else {
    const url = getExperienceUrl(manifest, hotspot.type);
    experienceBody.innerHTML = `<iframe title="${experienceTitle.textContent}" src="${url}" allow="autoplay; fullscreen; xr-spatial-tracking; camera"></iframe>`;
  }
  dialog.showModal();
}

function bindBookVideoControls() {
  const player = experienceBody.querySelector("video");
  const sound = experienceBody.querySelector("[data-video-sound]");
  const toggle = experienceBody.querySelector('[data-video-action="toggle"]');
  const mute = experienceBody.querySelector('[data-video-action="mute"]');
  if (!player || !toggle || !mute) return;

  let companionMuted = false;
  const syncSound = () => {
    if (!sound) return;
    const expectedTime = sound.duration
      ? player.currentTime % sound.duration
      : player.currentTime;
    if (Math.abs(sound.currentTime - expectedTime) > 0.35) {
      sound.currentTime = expectedTime;
    }
  };
  const playSound = () => {
    if (!sound || companionMuted || player.paused) return;
    syncSound();
    sound.play().catch(() => {});
  };

  if (sound) {
    player.volume = 0;
    player.addEventListener("timeupdate", syncSound);
    player.addEventListener("play", playSound);
    player.addEventListener("pause", () => sound.pause());
    playSound();
  }

  const update = () => {
    toggle.textContent = player.paused
      ? (lang === "fr" ? "Lire la vidéo" : "Play video")
      : (lang === "fr" ? "Pause" : "Pause");
    mute.textContent = (sound ? companionMuted : player.muted)
      ? (lang === "fr" ? "Activer le son" : "Unmute sound")
      : (lang === "fr" ? "Couper le son" : "Mute sound");
  };
  toggle.addEventListener("click", () => {
    if (player.paused) player.play().catch(() => {});
    else player.pause();
    update();
  });
  mute.addEventListener("click", () => {
    if (sound) {
      companionMuted = !companionMuted;
      sound.muted = companionMuted;
      if (companionMuted) sound.pause();
      else playSound();
    } else {
      player.muted = !player.muted;
    }
    update();
  });
  player.addEventListener("play", update);
  player.addEventListener("pause", update);
  update();
}

function getExperienceUrl(manifest, type) {
  const slug = encodeURIComponent(manifest.slug);
  if (type === "space") return `space.html?painting=${slug}&lang=${lang}`;
  if (type === "ar") return `ar.html?painting=${slug}&lang=${lang}`;
  if (type === "vr") return `vr.html?painting=${slug}&lang=${lang}`;
  if (type === "gallery") return `gallery-vr.html?lang=${lang}`;
  if (type === "world") return BEDROOM_VR_WORLD_URL;
  return `space.html?painting=${slug}&lang=${lang}`;
}

function closeExperience() {
  experienceBody.innerHTML = "";
  dialog.close();
}
