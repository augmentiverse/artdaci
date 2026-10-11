const app = document.querySelector('#experience-app');

const COPY = {
  fr: {
    brand: "Compagnon du livre augmenté",
    experience: "Expérience ARTDACI",
    museumExperience: "Musée ARTDACI",
    audio: "Audio",
    audioText: "Écouter le guide audio de cette œuvre.",
    video: "Vidéo",
    videoText: "Voir les contenus vidéo associés à cette œuvre.",
    ar: "Réalité augmentée",
    arText: "Scanner l’image imprimée et révéler sa couche AR.",
    museumArText: "Scanner l’image du musée et révéler son modèle en AR.",
    model: "Modèle 3D",
    modelText: "Explorer ou placer le modèle dans votre espace.",
    vr: "Galerie VR",
    vrText: "Entrer dans l’espace immersif ARTDACI.",
    book: "Livre 3D vivant",
    bookText: "Explorer l’édition numérique spatiale du livre.",
    museum: "Musée associé",
    museumText: "Découvrir le musée dans ARTDACI.",
    relatedWorkText: "Ouvrir l’expérience ARTDACI de cette œuvre.",
    official: "Source officielle",
    officialText: "Consulter la page officielle consacrée à l’œuvre.",
    print: "Page imprimée",
    printText: "Ouvrir la double page correspondante du livre.",
    fallbackSummary: "Une porte d’entrée permanente vers les contenus numériques ARTDACI associés à cette œuvre.",
    footer: "Un seul QR permanent pour tous les contenus numériques de l’œuvre.",
    footerMuseum: "Une entrée ARTDACI permanente vers le musée, ses modèles et ses expériences immersives.",
    back: "Retour à la collection",
    errorTitle: "Expérience introuvable",
    errorBody: "L’identifiant du QR ne correspond pas encore à une expérience publiée."
  },
  en: {
    brand: "Augmented book companion",
    experience: "ARTDACI Experience",
    museumExperience: "ARTDACI Museum",
    audio: "Audio",
    audioText: "Listen to the audio guide for this artwork.",
    video: "Video",
    videoText: "Watch video content associated with this artwork.",
    ar: "Augmented reality",
    arText: "Scan the printed image and reveal its AR layer.",
    museumArText: "Scan the museum image and reveal its AR model.",
    model: "3D model",
    modelText: "Explore or place the model in your own space.",
    vr: "VR Gallery",
    vrText: "Enter the ARTDACI immersive gallery.",
    book: "Living 3D Book",
    bookText: "Explore the spatial digital edition of the book.",
    museum: "Associated museum",
    museumText: "Explore the museum inside ARTDACI.",
    relatedWorkText: "Open this artwork’s ARTDACI experience.",
    official: "Official source",
    officialText: "Open the official page for this artwork.",
    print: "Printed page",
    printText: "Open the corresponding printed-book spread.",
    fallbackSummary: "A permanent gateway to the ARTDACI digital content associated with this artwork.",
    footer: "One permanent QR code for all digital experiences connected to the artwork.",
    footerMuseum: "One permanent ARTDACI entry point for the museum, its models and immersive experiences.",
    back: "Back to collection",
    errorTitle: "Experience not found",
    errorBody: "This QR identifier does not yet match a published experience."
  },
  ar: {
    brand: "الرفيق الرقمي للكتاب المعزّز",
    experience: "تجربة ARTDACI",
    museumExperience: "متحف ARTDACI",
    audio: "الصوت",
    audioText: "الاستماع إلى الدليل الصوتي الخاص بهذا العمل.",
    video: "الفيديو",
    videoText: "مشاهدة محتوى الفيديو المرتبط بهذا العمل.",
    ar: "الواقع المعزز",
    arText: "امسح الصورة المطبوعة لإظهار طبقة الواقع المعزز.",
    museumArText: "امسح صورة المتحف لإظهار نموذجه بالواقع المعزز.",
    model: "نموذج ثلاثي الأبعاد",
    modelText: "استكشف النموذج أو ضعه في مساحتك.",
    vr: "معرض الواقع الافتراضي",
    vrText: "ادخل إلى معرض ARTDACI الغامر.",
    book: "الكتاب الحي ثلاثي الأبعاد",
    bookText: "استكشف النسخة الرقمية المكانية من الكتاب.",
    museum: "المتحف المرتبط",
    museumText: "اكتشف المتحف داخل ARTDACI.",
    relatedWorkText: "افتح تجربة ARTDACI الخاصة بهذا العمل.",
    official: "المصدر الرسمي",
    officialText: "فتح الصفحة الرسمية الخاصة بهذا العمل.",
    print: "الصفحة المطبوعة",
    printText: "فتح الصفحة المقابلة في الكتاب المطبوع.",
    fallbackSummary: "بوابة دائمة إلى المحتوى الرقمي في ARTDACI المرتبط بهذا العمل.",
    footer: "رمز QR دائم واحد يتيح الوصول إلى جميع التجارب الرقمية المرتبطة بالعمل الفني.",
    footerMuseum: "بوابة ARTDACI دائمة إلى المتحف ونماذجه وتجارب الواقع الممتد.",
    back: "العودة إلى المجموعة",
    errorTitle: "التجربة غير موجودة",
    errorBody: "هذا المعرّف لا يرتبط بعد بتجربة منشورة."
  }
};

function resolveRoute() {
  const parts = location.pathname.split('/').filter(Boolean);
  const xIndex = parts.indexOf('x');
  const query = new URLSearchParams(location.search);
  const routeLang = xIndex >= 0 ? parts[xIndex + 1] : null;
  const routeId = xIndex >= 0 ? parts[xIndex + 2] : null;
  const lang = routeLang || query.get('lang') || 'fr';
  const id = routeId || query.get('id') || 'ldv-ml';
  return { lang: ['fr', 'en', 'ar'].includes(lang) ? lang : 'fr', id };
}

function absolute(path) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  return `/${path.replace(/^\//, '')}`;
}

function firstByLang(items = [], lang) {
  return items.find((item) => item.lang === lang) || items.find((item) => item.lang === 'en') || items[0] || null;
}

function localizedManifest(manifest, lang) {
  const local = manifest.localizations?.[lang] || {};
  return {
    title: local.title || manifest.title,
    texts: { ...(manifest.texts || {}), ...(local.texts || {}) }
  };
}

function card({ href, icon, title, text, enabled = true, external = false }) {
  if (!enabled || !href) return '';
  const target = external ? ' target="_blank" rel="noopener noreferrer"' : '';
  return `<a class="experience-card" href="${href}"${target}>
    <span class="experience-icon" aria-hidden="true">${icon}</span>
    <div><strong>${title}</strong><p>${text}</p></div>
  </a>`;
}

function collectionHref(lang) {
  return lang === 'en' ? '/index.html' : lang === 'ar' ? '/index-ar.html' : '/index-fr.html';
}

function printHref(entry, lang) {
  if (!entry.printPage) return '';
  if (typeof entry.printPage === 'string') return entry.printPage;
  return entry.printPage[lang] || entry.printPage.en || entry.printPage.fr || '';
}

function hasModel(manifest, entry) {
  if (entry.capabilities?.model3d === false) return false;
  if (entry.capabilities?.model3d === true) return true;
  const variants = manifest.media?.modelVariants || manifest.ar?.modelVariants || [];
  return Boolean(manifest.media?.model || manifest.ar?.primaryModel || variants.some?.((item) => item?.src));
}

function hasImageAr(manifest, entry) {
  if (entry.capabilities?.ar === false) return false;
  if (entry.capabilities?.ar === true) return true;
  return Boolean(
    manifest.ar?.compiledTarget ||
    manifest.ar?.compiledMindTarget ||
    manifest.print?.compiledMindTarget
  );
}

function renderError(copy, lang) {
  app.innerHTML = `<section class="experience-error"><div>
    <img src="/assets/varia/artdaci-logo.png" alt="ARTDACI" class="experience-logo" />
    <h1>${copy.errorTitle}</h1><p>${copy.errorBody}</p>
    <p><a href="${collectionHref(lang)}">${copy.back}</a></p>
  </div></section>`;
}

async function loadJson(path) {
  const response = await fetch(absolute(path), { cache: 'no-store' });
  if (!response.ok) throw new Error(`${response.status} ${path}`);
  return response.json();
}

async function init() {
  const { lang, id } = resolveRoute();
  const copy = COPY[lang];
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

  try {
    const registry = await loadJson('content/registry.json');
    const entry = registry.items?.[id];
    if (!entry) return renderError(copy, lang);

    const manifest = await loadJson(entry.manifest);
    if (Array.isArray(manifest)) throw new Error(`Manifest ${entry.manifest} must be an object`);

    const localized = localizedManifest(manifest, lang);
    const isMuseum = entry.type === 'museum';
    const title = entry.title?.[lang] || localized.title || entry.slug;
    const image = absolute(entry.image || manifest.media?.image || manifest.print?.imageTargetSource);
    const languageLinks = ['fr', 'en', 'ar']
      .map((code) => `<a href="/x/${code}/${id}"${code === lang ? ' aria-current="page"' : ''}>${code.toUpperCase()}</a>`)
      .join('');

    let byline = '';
    let meta = '';
    let summary = localized.texts?.artisticAnalysis || localized.texts?.historicalContext || copy.fallbackSummary;
    let footerText = copy.footer;
    let cards = '';

    if (isMuseum) {
      byline = entry.location?.[lang] || '';
      meta = byline;
      footerText = copy.footerMuseum;
      const relatedIds = entry.relatedPaintingIds || (entry.relatedPaintingId ? [entry.relatedPaintingId] : []);
      const relatedCards = relatedIds.map((relatedId) => {
        const related = registry.items?.[relatedId];
        if (!related) return '';
        return card({
          href: `/x/${lang}/${relatedId}`,
          icon: '🖼',
          title: related.title?.[lang] || related.slug,
          text: copy.relatedWorkText
        });
      }).join('');

      cards = [
        card({ href: `/ar.html?museum=${entry.slug}&lang=${lang}`, icon: '◈', title: copy.ar, text: copy.museumArText, enabled: hasImageAr(manifest, entry) }),
        card({ href: `/space.html?museum=${entry.slug}&lang=${lang}`, icon: '◉', title: copy.model, text: copy.modelText, enabled: hasModel(manifest, entry) }),
        card({ href: `/gallery-vr.html?lang=${lang}`, icon: '🥽', title: copy.vr, text: copy.vrText }),
        card({ href: `/book-3d.html?lang=${lang}`, icon: '📖', title: copy.book, text: copy.bookText }),
        relatedCards
      ].join('');
    } else {
      byline = entry.artistTitle?.[lang] || manifest.artist?.name || '';
      const location = manifest.currentLocation || {};
      meta = [manifest.date, manifest.medium, location.museum, location.city].filter(Boolean).join(' · ');

      const audio = firstByLang(manifest.media?.audioGuides, lang) || firstByLang(manifest.media?.audioOverviews, lang);
      const video = manifest.media?.videos?.[0];
      const museumEntry = entry.museumId ? registry.items?.[entry.museumId] : null;
      const officialArtworkUrl = location.galleryUrl || '';
      const printedPage = printHref(entry, lang);

      cards = [
        card({ href: audio ? absolute(audio.src) : '', icon: '🎧', title: copy.audio, text: copy.audioText, enabled: Boolean(audio) }),
        card({ href: video ? absolute(video.src) : '', icon: '▶', title: copy.video, text: copy.videoText, enabled: Boolean(video) }),
        card({ href: `/ar.html?painting=${entry.slug}&lang=${lang}`, icon: '◈', title: copy.ar, text: copy.arText, enabled: hasImageAr(manifest, entry) }),
        card({ href: `/space.html?painting=${entry.slug}&lang=${lang}`, icon: '◉', title: copy.model, text: copy.modelText, enabled: hasModel(manifest, entry) }),
        card({ href: `/gallery-vr.html?lang=${lang}`, icon: '🥽', title: copy.vr, text: copy.vrText }),
        card({ href: `/book-3d.html?lang=${lang}`, icon: '📖', title: copy.book, text: copy.bookText }),
        card({
          href: museumEntry ? `/x/${lang}/${entry.museumId}` : '',
          icon: '🏛',
          title: museumEntry?.title?.[lang] || copy.museum,
          text: copy.museumText,
          enabled: Boolean(museumEntry)
        }),
        card({ href: officialArtworkUrl, icon: '↗', title: copy.official, text: copy.officialText, enabled: Boolean(officialArtworkUrl), external: true }),
        card({ href: printedPage, icon: '▤', title: copy.print, text: copy.printText, enabled: Boolean(printedPage) })
      ].join('');
    }

    app.innerHTML = `
      <header class="experience-topbar">
        <a class="experience-brand" href="${collectionHref(lang)}">
          <img src="/assets/varia/artdaci-logo.png" alt="ARTDACI" />
          <span><strong>ARTDACI</strong><span>${copy.brand}</span></span>
        </a>
        <nav class="experience-language" aria-label="Language">${languageLinks}</nav>
      </header>

      <section class="experience-hero">
        <figure class="experience-artwork">
          <img src="${image}" alt="${title}" />
          <figcaption>${title}${byline ? ` · ${byline}` : ''}</figcaption>
        </figure>
        <div class="experience-copy">
          <p class="experience-eyebrow">${isMuseum ? copy.museumExperience : copy.experience} · ${id}</p>
          <h1>${title}</h1>
          ${byline ? `<h2>${byline}</h2>` : ''}
          ${meta ? `<p class="experience-meta">${meta}</p>` : ''}
          ${summary ? `<p class="experience-summary">${summary}</p>` : ''}
        </div>
      </section>

      <section class="experience-grid" aria-label="ARTDACI media">${cards}</section>

      <footer class="experience-footer">
        <span>${footerText}</span>
        <a href="${collectionHref(lang)}">${copy.back}</a>
      </footer>`;

    document.title = `${title} — ARTDACI`;
  } catch (error) {
    console.error(error);
    renderError(copy, lang);
  }
}

init();
