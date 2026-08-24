const SOURCES = {
  "lady-with-an-ermine": "content/paintings/lady-with-an-ermine.json",
  "view-of-delft": "content/paintings/view-of-delft.json",
  "pont-d-argenteuil": "content/paintings/pont-d-argenteuil.json"
};
const MUSEUMS = {
  "lady-with-an-ermine": ["czartoryski", "content/museums/czartoryski.json"],
  "view-of-delft": ["mauritshuis", "content/museums/mauritshuis.json"],
  "pont-d-argenteuil": ["orsay", "content/museums/orsay.json"]
};
const COPY = {
  en: { entry: "Museum Catalogue Entry", context: "Historical context", analysis: "Look closely", technique: "Technique and perception", legacy: "Meaning and legacy", museum: "THE MUSEUM", museumIntro: "This painting is preserved at", museumNote: "The museum image printed in the book is an AR target. Scan it to reveal the architectural model, place the model in your space, or visit its VR gallery.", ar: "Image AR", space: "Space AR", vr: "Museum VR", living: "Open the Living Book", back: "Back to the index", date: "Date", medium: "Medium", dimensions: "Dimensions", location: "Location" },
  fr: { entry: "Notice de catalogue", context: "Contexte historique", analysis: "Voir de près", technique: "Technique et perception", legacy: "Sens et héritage", museum: "LE MUSÉE", museumIntro: "Ce tableau est conservé au", museumNote: "L’image du musée imprimée dans le livre est une cible AR. Scannez-la pour révéler son modèle architectural, placez le modèle dans votre espace ou visitez sa galerie VR.", ar: "AR image", space: "AR espace", vr: "VR du musée", living: "Ouvrir le Living Book", back: "Retour à l’index", date: "Date", medium: "Technique", dimensions: "Dimensions", location: "Lieu" },
  ar: { entry: "بطاقة العمل", context: "السياق التاريخي", analysis: "نظرة قريبة", technique: "التقنية والإدراك", legacy: "المعنى والإرث", museum: "المتحف", museumIntro: "تُحفظ هذه اللوحة في", museumNote: "صورة المتحف المطبوعة في الكتاب هي هدف للواقع المعزز. امسحها لإظهار النموذج المعماري أو ضعه في مساحتك أو زر معرضه الافتراضي.", ar: "واقع معزز بالصورة", space: "واقع معزز مكاني", vr: "معرض المتحف الافتراضي", living: "فتح الكتاب الحي", back: "العودة إلى الفهرس", date: "التاريخ", medium: "التقنية", dimensions: "الأبعاد", location: "الموقع" }
};
const TEXTS = {
  fr: {
    "lady-with-an-ermine": ["Peinte vers 1489–1491 à la cour de Milan, l’œuvre représente Cecilia Gallerani, femme lettrée liée à Ludovic Sforza.", "Cecilia et l’hermine se tournent dans un même mouvement, comme si quelqu’un venait d’entrer. La main, le regard et la lumière transforment le portrait en instant vivant.", "Les transitions douces donnent volume au visage, à la main et au pelage. Les examens techniques révèlent les révisions successives de Léonard.", "L’hermine peut évoquer la pureté, la modération, Cecilia et les emblèmes de Ludovic Sforza. L’œuvre renouvelle profondément le portrait psychologique."],
    "view-of-delft": ["Vers 1660–1661, Vermeer observe Delft depuis le sud et transforme une vue urbaine en méditation sur la lumière, le climat et l’identité civique.", "Le vaste ciel règle les alternances d’ombre et de lumière. La tour éclairée de la Nieuwe Kerk devient le foyer de cette ville silencieuse.", "Bandes horizontales, distance tonale, perspective et petites touches lumineuses construisent un espace à la fois crédible et recomposé.", "Vue de Delft est l’un des paysages majeurs du Siècle d’or néerlandais et l’une des œuvres emblématiques du Mauritshuis."],
    "pont-d-argenteuil": ["Monet peint le pont en 1874, dans une banlieue où se rencontrent loisirs, navigation, industrie et modernité.", "L’horizontale du pont dialogue avec les mâts, les voiles et les reflets. L’eau conduit le regard vers les arches et le lointain lumineux.", "Des touches visibles de bleu, de vert, de blanc et de couleurs chaudes laissent l’œil recomposer l’éclat mouvant de l’eau.", "Conservé au Musée d’Orsay, le tableau est un jalon de l’impressionnisme et de la représentation de la vie moderne autour de Paris."]
  }
};
const params = new URLSearchParams(location.search);
const slug = SOURCES[params.get("painting")] ? params.get("painting") : "lady-with-an-ermine";
const lang = ["en", "fr", "ar"].includes(params.get("lang")) ? params.get("lang") : "en";
document.documentElement.lang = lang; document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
const esc = (v = "") => String(v).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const [manifest, museum] = await Promise.all([fetch(SOURCES[slug]).then(r => r.json()), fetch(MUSEUMS[slug][1]).then(r => r.json())]);
const copy = COPY[lang]; const localized = manifest.localizations?.[lang] || {}; const museumLocalized = museum.localizations?.[lang] || {};
const title = localized.title || manifest.title; const locationName = museumLocalized.title || museum.title;
const base = manifest.texts; const selected = TEXTS[lang]?.[slug] || [base.historicalContext, base.artisticAnalysis, `${base.palette || ""} ${base.perspectiveTechnique || ""}`, `${base.culturalSignificance || ""} ${base.influence || ""}`];
document.title = `${title} — ARTDACI`; const indexUrl = lang === "fr" ? "index-fr.html" : lang === "ar" ? "index-ar.html" : "index.html";
document.getElementById("dynamic-artwork-spread").innerHTML = `
  <section class="catalogue-plate"><p class="eyebrow">ARTDACI · ${String(manifest.bookOrder).padStart(3,"0")}</p><figure class="target-art"><img src="${esc(manifest.media.image)}" alt="${esc(title)}"/><figcaption><strong>${esc(title)}</strong><span>${esc(manifest.artist.name)} · ${esc(manifest.date)} · ${esc(locationName)}</span></figcaption></figure></section>
  <section class="catalogue-text"><header><p class="eyebrow">${copy.entry}</p><h1>${esc(title)}</h1><p class="artist">${esc(manifest.artist.name)}</p></header>
  <dl class="catalogue-meta"><div><dt>${copy.date}</dt><dd>${esc(manifest.date)}</dd></div><div><dt>${copy.medium}</dt><dd>${esc(manifest.medium)}</dd></div><div><dt>${copy.dimensions}</dt><dd>${manifest.dimensions.heightCm} × ${manifest.dimensions.widthCm} cm</dd></div><div><dt>${copy.location}</dt><dd>${esc(locationName)}</dd></div></dl>
  <div class="catalogue-grid"><section><h2>${copy.context}</h2><p>${esc(selected[0])}</p></section><section><h2>${copy.analysis}</h2><p>${esc(selected[1])}</p></section><section><h2>${copy.technique}</h2><p>${esc(selected[2])}</p></section><section><h2>${copy.legacy}</h2><p>${esc(selected[3])}</p></section></div>
  <section class="painting-museum-section"><img src="${esc(museum.media.image)}" alt="${esc(locationName)}"/><div><p class="eyebrow">${copy.museum}</p><h2>${esc(locationName)}</h2><p><strong>${copy.museumIntro} ${esc(locationName)}.</strong> ${esc(museumLocalized.texts?.artisticAnalysis || museum.texts.artisticAnalysis)}</p><p>${copy.museumNote}</p><div class="card-actions"><a class="button primary" href="gallery-vr.html?lang=${lang}&amp;room=museums&amp;museum=${museum.slug}">${copy.vr}</a><a class="button" href="ar.html?museum=${museum.slug}&amp;lang=${lang}">${copy.ar}</a><a class="button" href="space.html?museum=${museum.slug}&amp;lang=${lang}">${copy.space}</a></div></div></section>
  <aside class="ar-note"><a class="button primary" href="book-3d.html?lang=${lang}">${copy.living}</a><a class="button" href="${indexUrl}">${copy.back}</a></aside></section>`;
