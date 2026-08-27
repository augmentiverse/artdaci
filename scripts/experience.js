const app = document.querySelector('#experience-app');

const COPY = {
  fr: {
    brand: "Compagnon du livre augmenté",
    experience: "Expérience ARTDACI",
    museumExperience: "Musée ARTDACI",
    by: "Léonard de Vinci",
    audio: "Audio",
    audioText: "Écouter le guide audio en français.",
    video: "Vidéo",
    videoText: "Voir la couche vidéo et les scènes réinventées.",
    ar: "Réalité augmentée",
    arText: "Scanner l’image imprimée et révéler la couche AR.",
    museumArText: "Scanner l’image du musée et révéler son modèle en AR.",
    model: "Modèle 3D",
    modelText: "Placer le modèle dans votre espace.",
    vr: "Galerie VR",
    vrText: "Entrer dans l’espace immersif ARTDACI.",
    book: "Livre 3D vivant",
    bookText: "Explorer l’édition numérique spatiale du livre.",
    museum: "Musée du Louvre",
    museumText: "Découvrir le musée dans ARTDACI.",
    relatedWork: "La Joconde",
    relatedWorkText: "Revenir à l’expérience ARTDACI de l’œuvre.",
    official: "Page officielle du Louvre",
    officialText: "Consulter la page officielle du Louvre consacrée à l’œuvre.",
    print: "Page imprimée",
    printText: "Revenir à la double page de catalogue.",
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
    by: "Leonardo da Vinci",
    audio: "Audio",
    audioText: "Listen to the English audio guide.",
    video: "Video",
    videoText: "Watch the video layer and reimagined scenes.",
    ar: "Augmented reality",
    arText: "Scan the printed image and reveal its AR layer.",
    museumArText: "Scan the museum image and reveal its AR model.",
    model: "3D model",
    modelText: "Place the model in your own space.",
    vr: "VR Gallery",
    vrText: "Enter the ARTDACI immersive gallery.",
    book: "Living 3D Book",
    bookText: "Explore the spatial digital edition of the book.",
    museum: "Louvre Museum",
    museumText: "Explore the museum inside ARTDACI.",
    relatedWork: "Mona Lisa",
    relatedWorkText: "Return to the artwork’s ARTDACI experience.",
    official: "Official Louvre page",
    officialText: "Open the Louvre’s official page for this artwork.",
    print: "Printed page",
    printText: "Return to the catalogue spread.",
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
    by: "ليوناردو دا فينشي",
    audio: "الصوت",
    audioText: "الاستماع إلى الدليل الصوتي.",
    video: "الفيديو",
    videoText: "مشاهدة الطبقة المرئية والمشاهد المعاد تخيلها.",
    ar: "الواقع المعزز",
    arText: "امسح الصورة المطبوعة لإظهار طبقة الواقع المعزز.",
    museumArText: "امسح صورة المتحف لإظهار نموذجه بالواقع المعزز.",
    model: "نموذج ثلاثي الأبعاد",
    modelText: "ضع النموذج في مساحتك.",
    vr: "معرض الواقع الافتراضي",
    vrText: "ادخل إلى معرض ARTDACI الغامر.",
    book: "الكتاب الحي ثلاثي الأبعاد",
    bookText: "استكشف النسخة الرقمية المكانية من الكتاب.",
    museum: "متحف اللوفر",
    museumText: "اكتشف المتحف داخل ARTDACI.",
    relatedWork: "الموناليزا",
    relatedWorkText: "العودة إلى تجربة ARTDACI الخاصة باللوحة.",
    official: "الصفحة الرسمية للوفر",
    officialText: "فتح الصفحة الرسمية للوفر الخاصة بالعمل الفني.",
    print: "الصفحة المطبوعة",
    printText: "العودة إلى صفحة الكتالوج.",
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
  const tag = enabled && href ? 'a' : 'div';
  const classes = `experience-card${enabled && href ? '' : ' is-disabled'}`;
  const hrefAttr = enabled && href ? ` href="${href}"` : '';
  const targetAttr = enabled && href && external ? ' target="_blank" rel="noopener noreferrer"' : '';
  return `<${tag} class="${classes}"${hrefAttr}${targetAttr}>
    <span class="experience-icon" aria-hidden="true">${icon}</span>
    <div><strong>${title}</strong><p>${text}</p></div>
  </${tag}>`;
}

function collectionHref(lang) {
  return lang === 'en' ? '/index.html' : lang === 'ar' ? '/index-ar.html' : '/index-fr.html';
}

function renderError(copy, lang) {
  app.innerHTML = `<section class="experience-error"><div><img src="/assets/varia/artdaci-logo.png" alt="ARTDACI" class="experience-logo" /><h1>${copy.errorTitle}</h1><p>${copy.errorBody}</p><p><a href="${collectionHref(lang)}">${copy.back}</a></p></div></section>`;
}

async function init() {
  const { lang, id } = resolveRoute();
  const copy = COPY[lang];
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

  try {
    const registry = await fetch('/content/registry.json', { cache: 'no-store' }).then((r) => {
      if (!r.ok) throw new Error('registry');
      return r.json();
    });
    const entry = registry.items?.[id];
    if (!entry) return renderError(copy, lang);

    const manifest = await fetch(absolute(entry.manifest), { cache: 'no-store' }).then((r) => {
      if (!r.ok) throw new Error('manifest');
      return r.json();
    });

    const localized = localizedManifest(manifest, lang);
    const isMuseum = entry.type === 'museum';
    const title = entry.title?.[lang] || localized.title || (isMuseum ? copy.museum : 'Mona Lisa');
    const image = absolute(entry.image || manifest.media?.image || manifest.print?.imageTargetSource);
    const langLinks = ['fr', 'en', 'ar'].map((code) => `<a href="/x/${code}/${id}"${code === lang ? ' aria-current="page"' : ''}>${code.toUpperCase()}</a>`).join('');

    let byline = copy.by;
    let meta = `${manifest.date || ''} · ${manifest.medium || ''} · ${manifest.currentLocation?.museum || ''}${manifest.currentLocation?.city ? `, ${manifest.currentLocation.city}` : ''}`;
    let summary;
    let cards;
    let footerText = copy.footer;

    if (isMuseum) {
      byline = entry.location?.[lang] || '';
      meta = entry.location?.[lang] || '';
      summary = localized.texts?.artisticAnalysis || '';
      footerText = copy.footerMuseum;
      const related = entry.relatedPaintingId ? registry.items?.[entry.relatedPaintingId] : null;
      const relatedTitle = related?.title?.[lang] || copy.relatedWork;
      cards = [
        card({ href: `/ar.html?museum=${entry.slug}&lang=${lang}`, icon: '◈', title: copy.ar, text: copy.museumArText }),
        card({ href: `/space.html?museum=${entry.slug}&lang=${lang}`, icon: '◉', title: copy.model, text: copy.modelText }),
        card({ href: `/gallery-vr.html?lang=${lang}`, icon: '🥽', title: copy.vr, text: copy.vrText }),
        card({ href: `/book-3d.html?lang=${lang}`, icon: '📖', title: copy.book, text: copy.bookText }),
        card({ href: related ? `/x/${lang}/${entry.relatedPaintingId}` : '', icon: '🖼', title: relatedTitle, text: copy.relatedWorkText, enabled: Boolean(related) })
      ].join('');
    } else {
      const audio = firstByLang(manifest.media?.audioGuides, lang) || firstByLang(manifest.media?.audioOverviews, lang);
      const video = manifest.media?.videos?.[0];
      const museumEntry = entry.museumId ? registry.items?.[entry.museumId] : null;
      const museumTitle = museumEntry?.title?.[lang] || copy.museum;
      const officialArtworkUrl = manifest.currentLocation?.galleryUrl || '';
      summary = lang === 'fr'
        ? "Une porte d’entrée unique vers l’analyse, le son, la vidéo, la réalité augmentée, la 3D et les espaces immersifs associés à La Joconde."
        : lang === 'ar'
          ? "بوابة واحدة تجمع التحليل والصوت والفيديو والواقع المعزز والنماذج ثلاثية الأبعاد والتجارب الغامرة المرتبطة بالموناليزا."
          : "A single gateway to the analysis, audio, video, augmented reality, 3D and immersive spaces connected to the Mona Lisa.";

      cards = [
        card({ href: audio ? absolute(audio.src) : '', icon: '🎧', title: copy.audio, text: copy.audioText, enabled: Boolean(audio) }),
        card({ href: video ? absolute(video.src) : '', icon: '▶', title: copy.video, text: copy.videoText, enabled: Boolean(video) }),
        card({ href: `/ar.html?painting=${manifest.slug || entry.slug}&lang=${lang}`, icon: '◈', title: copy.ar, text: copy.arText }),
        card({ href: `/space.html?painting=${manifest.slug || entry.slug}&lang=${lang}`, icon: '◉', title: copy.model, text: copy.modelText }),
        card({ href: `/gallery-vr.html?lang=${lang}`, icon: '🥽', title: copy.vr, text: copy.vrText }),
        card({ href: `/book-3d.html?lang=${lang}`, icon: '📖', title: copy.book, text: copy.bookText }),
        card({ href: museumEntry ? `/x/${lang}/${entry.museumId}` : '', icon: '🏛', title: museumTitle, text: copy.museumText, enabled: Boolean(museumEntry) }),
        card({ href: officialArtworkUrl, icon: '↗', title: copy.official, text: copy.officialText, enabled: Boolean(officialArtworkUrl), external: true }),
        card({ href: lang === 'fr' ? '/print-target-fr.html' : '/print-target.html', icon: '▤', title: copy.print, text: copy.printText })
      ].join('');
    }

    app.innerHTML = `
      <header class="experience-topbar">
        <a class="experience-brand" href="${collectionHref(lang)}">
          <img src="/assets/varia/artdaci-logo.png" alt="ARTDACI" />
          <span><strong>ARTDACI</strong><span>${copy.brand}</span></span>
        </a>
        <nav class="experience-language" aria-label="Language">${langLinks}</nav>
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
          <p class="experience-summary">${summary}</p>
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
