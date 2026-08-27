const app = document.querySelector('#experience-app');

const COPY = {
  fr: {
    loading: "Chargement de l’expérience ARTDACI…",
    brand: "Compagnon du livre augmenté",
    experience: "Expérience ARTDACI",
    by: "Léonard de Vinci",
    audio: "Audio",
    audioText: "Écouter le guide audio en français.",
    video: "Vidéo",
    videoText: "Voir la couche vidéo et les scènes réinventées.",
    ar: "Réalité augmentée",
    arText: "Scanner l’image imprimée et révéler la couche AR.",
    model: "Modèle 3D",
    modelText: "Placer le modèle dans votre espace.",
    vr: "Galerie VR",
    vrText: "Entrer dans l’espace immersif ARTDACI.",
    book: "Livre 3D vivant",
    bookText: "Explorer l’édition numérique spatiale du livre.",
    museum: "Musée du Louvre",
    museumText: "Découvrir le musée et son contexte.",
    print: "Page imprimée",
    printText: "Revenir à la double page de catalogue.",
    unavailable: "Bientôt disponible",
    footer: "Un seul QR permanent pour tous les contenus numériques de l’œuvre.",
    back: "Retour à la collection",
    errorTitle: "Expérience introuvable",
    errorBody: "L’identifiant du QR ne correspond pas encore à une expérience publiée."
  },
  en: {
    loading: "Loading the ARTDACI experience…",
    brand: "Augmented book companion",
    experience: "ARTDACI Experience",
    by: "Leonardo da Vinci",
    audio: "Audio",
    audioText: "Listen to the English audio guide.",
    video: "Video",
    videoText: "Watch the video layer and reimagined scenes.",
    ar: "Augmented reality",
    arText: "Scan the printed image and reveal its AR layer.",
    model: "3D model",
    modelText: "Place the model in your own space.",
    vr: "VR Gallery",
    vrText: "Enter the ARTDACI immersive gallery.",
    book: "Living 3D Book",
    bookText: "Explore the spatial digital edition of the book.",
    museum: "Louvre Museum",
    museumText: "Explore the museum and its context.",
    print: "Printed page",
    printText: "Return to the catalogue spread.",
    unavailable: "Coming soon",
    footer: "One permanent QR code for all digital experiences connected to the artwork.",
    back: "Back to collection",
    errorTitle: "Experience not found",
    errorBody: "This QR identifier does not yet match a published experience."
  },
  ar: {
    loading: "جارٍ تحميل تجربة ARTDACI…",
    brand: "الرفيق الرقمي للكتاب المعزّز",
    experience: "تجربة ARTDACI",
    by: "ليوناردو دا فينشي",
    audio: "الصوت",
    audioText: "الاستماع إلى الدليل الصوتي.",
    video: "الفيديو",
    videoText: "مشاهدة الطبقة المرئية والمشاهد المعاد تخيلها.",
    ar: "الواقع المعزز",
    arText: "امسح الصورة المطبوعة لإظهار طبقة الواقع المعزز.",
    model: "نموذج ثلاثي الأبعاد",
    modelText: "ضع النموذج في مساحتك.",
    vr: "معرض الواقع الافتراضي",
    vrText: "ادخل إلى معرض ARTDACI الغامر.",
    book: "الكتاب الحي ثلاثي الأبعاد",
    bookText: "استكشف النسخة الرقمية المكانية من الكتاب.",
    museum: "متحف اللوفر",
    museumText: "اكتشف المتحف وسياق العمل الفني.",
    print: "الصفحة المطبوعة",
    printText: "العودة إلى صفحة الكتالوج.",
    unavailable: "قريباً",
    footer: "رمز QR دائم واحد يتيح الوصول إلى جميع التجارب الرقمية المرتبطة بالعمل الفني.",
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

function card({ href, icon, title, text, enabled = true }) {
  const tag = enabled && href ? 'a' : 'div';
  const classes = `experience-card${enabled && href ? '' : ' is-disabled'}`;
  const hrefAttr = enabled && href ? ` href="${href}"` : '';
  return `<${tag} class="${classes}"${hrefAttr}>
    <span class="experience-icon" aria-hidden="true">${icon}</span>
    <div><strong>${title}</strong><p>${text}</p></div>
  </${tag}>`;
}

function renderError(copy) {
  app.innerHTML = `<section class="experience-error"><div><img src="/assets/varia/artdaci-logo.png" alt="ARTDACI" class="experience-logo" /><h1>${copy.errorTitle}</h1><p>${copy.errorBody}</p><p><a href="/index-fr.html">${copy.back}</a></p></div></section>`;
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
    if (!entry) return renderError(copy);

    const manifest = await fetch(absolute(entry.manifest), { cache: 'no-store' }).then((r) => {
      if (!r.ok) throw new Error('manifest');
      return r.json();
    });

    const title = entry.title?.[lang] || manifest.title || 'Mona Lisa';
    const image = absolute(entry.image || manifest.media?.image || manifest.print?.imageTargetSource);
    const audio = firstByLang(manifest.media?.audioGuides, lang) || firstByLang(manifest.media?.audioOverviews, lang);
    const video = manifest.media?.videos?.[0];
    const museumUrl = manifest.currentLocation?.galleryUrl || '#';
    const summary = lang === 'fr'
      ? "Une porte d’entrée unique vers l’analyse, le son, la vidéo, la réalité augmentée, la 3D et les espaces immersifs associés à La Joconde."
      : lang === 'ar'
        ? "بوابة واحدة تجمع التحليل والصوت والفيديو والواقع المعزز والنماذج ثلاثية الأبعاد والتجارب الغامرة المرتبطة بالموناليزا."
        : "A single gateway to the analysis, audio, video, augmented reality, 3D and immersive spaces connected to the Mona Lisa.";

    const langLinks = ['fr', 'en', 'ar'].map((code) => `<a href="/x/${code}/${id}"${code === lang ? ' aria-current="page"' : ''}>${code.toUpperCase()}</a>`).join('');

    app.innerHTML = `
      <header class="experience-topbar">
        <a class="experience-brand" href="/${lang === 'en' ? 'index.html' : lang === 'ar' ? 'index-ar.html' : 'index-fr.html'}">
          <img src="/assets/varia/artdaci-logo.png" alt="ARTDACI" />
          <span><strong>ARTDACI</strong><span>${copy.brand}</span></span>
        </a>
        <nav class="experience-language" aria-label="Language">${langLinks}</nav>
      </header>

      <section class="experience-hero">
        <figure class="experience-artwork">
          <img src="${image}" alt="${title}" />
          <figcaption>${title} · ${copy.by}</figcaption>
        </figure>
        <div class="experience-copy">
          <p class="experience-eyebrow">${copy.experience} · ${id}</p>
          <h1>${title}</h1>
          <h2>${copy.by}</h2>
          <p class="experience-meta">${manifest.date || ''} · ${manifest.medium || ''} · ${manifest.currentLocation?.museum || ''}, ${manifest.currentLocation?.city || ''}</p>
          <p class="experience-summary">${summary}</p>
        </div>
      </section>

      <section class="experience-grid" aria-label="ARTDACI media">
        ${card({ href: audio ? absolute(audio.src) : '', icon: '🎧', title: copy.audio, text: copy.audioText, enabled: Boolean(audio) })}
        ${card({ href: video ? absolute(video.src) : '', icon: '▶', title: copy.video, text: copy.videoText, enabled: Boolean(video) })}
        ${card({ href: `/ar.html?painting=${manifest.slug || entry.slug}&lang=${lang}`, icon: '◈', title: copy.ar, text: copy.arText })}
        ${card({ href: `/space.html?painting=${manifest.slug || entry.slug}&lang=${lang}`, icon: '◉', title: copy.model, text: copy.modelText })}
        ${card({ href: `/gallery-vr.html?lang=${lang}`, icon: '🥽', title: copy.vr, text: copy.vrText })}
        ${card({ href: `/book-3d.html?lang=${lang}`, icon: '📖', title: copy.book, text: copy.bookText })}
        ${card({ href: museumUrl, icon: '🏛', title: copy.museum, text: copy.museumText, enabled: Boolean(museumUrl) })}
        ${card({ href: lang === 'fr' ? '/print-target-fr.html' : '/print-target.html', icon: '▤', title: copy.print, text: copy.printText })}
      </section>

      <footer class="experience-footer">
        <span>${copy.footer}</span>
        <a href="/${lang === 'en' ? 'index.html' : lang === 'ar' ? 'index-ar.html' : 'index-fr.html'}">${copy.back}</a>
      </footer>`;

    document.title = `${title} — ARTDACI`;
  } catch (error) {
    console.error(error);
    renderError(copy);
  }
}

init();
