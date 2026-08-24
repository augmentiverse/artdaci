const PAGE_MUSEUMS = {
  "print-target.html": ["louvre", "content/museums/louvre.json"], "print-target-fr.html": ["louvre", "content/museums/louvre.json"],
  "print-vermeer-girl-with-a-pearl-earring.html": ["mauritshuis", "content/museums/mauritshuis.json"], "print-vermeer-girl-with-a-pearl-earring-fr.html": ["mauritshuis", "content/museums/mauritshuis.json"],
  "print-van-gogh.html": ["van-gogh-museum", "content/museums/van-gogh-museum.json"], "print-van-gogh-fr.html": ["van-gogh-museum", "content/museums/van-gogh-museum.json"],
  "print-van-gogh-bedroom.html": ["van-gogh-museum", "content/museums/van-gogh-museum.json"], "print-van-gogh-bedroom-fr.html": ["van-gogh-museum", "content/museums/van-gogh-museum.json"]
  ,"print-monet-impression-sunrise.html": ["marmottan", null], "print-monet-impression-sunrise-fr.html": ["marmottan", null]
};
const filename = location.pathname.split("/").pop();
const lang = document.documentElement.lang?.startsWith("fr") ? "fr" : document.documentElement.lang?.startsWith("ar") ? "ar" : "en";
const C = {
  en: { eyebrow: "THE MUSEUM", intro: "This painting is preserved at", note: "The museum image printed in the book is an AR target. Explore its architecture through all three immersive modes.", vr: "Museum VR", ar: "Image AR", space: "Space AR" },
  fr: { eyebrow: "LE MUSÉE", intro: "Ce tableau est conservé au", note: "L’image du musée imprimée dans le livre est une cible AR. Explorez son architecture dans les trois modes immersifs.", vr: "VR du musée", ar: "AR image", space: "AR espace" },
  ar: { eyebrow: "المتحف", intro: "تُحفظ هذه اللوحة في", note: "صورة المتحف المطبوعة في الكتاب هي هدف للواقع المعزز. استكشف عمارته عبر التجارب الثلاث.", vr: "واقع افتراضي", ar: "واقع معزز بالصورة", space: "واقع معزز مكاني" }
}[lang];
const target = document.querySelector(".catalogue-text");
const arabicMuseum = filename === "print-ar.html" ? ({ "mona-lisa": ["louvre", "content/museums/louvre.json"], "vermeer-girl-with-a-pearl-earring": ["mauritshuis", "content/museums/mauritshuis.json"], "van-gogh": ["van-gogh-museum", "content/museums/van-gogh-museum.json"], "van-gogh-bedroom": ["van-gogh-museum", "content/museums/van-gogh-museum.json"] }[new URLSearchParams(location.search).get("painting")]) : null;
const selectedMuseum = PAGE_MUSEUMS[filename] || arabicMuseum;
if (target && selectedMuseum) {
  const [slug, url] = selectedMuseum;
  try {
    const museum = url ? await fetch(url).then((response) => response.json()) : {
      title: "Musée Marmottan Monet", slug: "marmottan", media: { image: "assets/artists/claude-monet/collection/impression-sunrise-monet.png" },
      texts: { artisticAnalysis: lang === "fr" ? "Installé dans un ancien hôtel particulier parisien, le musée conserve la plus importante collection d’œuvres de Claude Monet, dont Impression, soleil levant." : "Set in a former Parisian townhouse, the museum holds the largest collection of works by Claude Monet, including Impression, Sunrise." }
    };
    const localized = museum.localizations?.[lang] || {};
    const title = localized.title || museum.title;
    const body = localized.texts?.artisticAnalysis || museum.texts?.artisticAnalysis || "";
    const section = document.createElement("section");
    section.className = "painting-museum-section";
    const actions = url ? `<a class="button primary" href="gallery-vr.html?lang=${lang}&amp;room=museums&amp;museum=${slug}">${C.vr}</a><a class="button" href="ar.html?museum=${slug}&amp;lang=${lang}">${C.ar}</a><a class="button" href="space.html?museum=${slug}&amp;lang=${lang}">${C.space}</a>` : `<a class="button primary" href="gallery-vr.html?lang=${lang}&amp;artist=monet">${C.vr}</a>`;
    section.innerHTML = `<img src="${museum.media.image}" alt="${title}"/><div><p class="eyebrow">${C.eyebrow}</p><h2>${title}</h2><p><strong>${C.intro} ${title}.</strong> ${body}</p>${url ? `<p>${C.note}</p>` : ""}<div class="card-actions">${actions}</div></div>`;
    target.insertBefore(section, target.querySelector(".ar-note") || null);
  } catch (error) { console.warn("Museum section unavailable.", error); }
}
