import { getNodeExperiences, localize } from "./semantic-store.mjs";

// Catalogue entries and documented semantic profiles are intentionally separate.
const I18N = {
  fr: {
    kicker:"NOUVEAU · EXPLORATION GUIDÉE",title:"Explorez les œuvres et leurs relations",
    intro:"Quatre peintres, un catalogue à parcourir et des parcours fondés sur les connaissances documentées.",
    all:"Tous les peintres",catalogue:"Catalogue complet",profiles:"Profils sémantiques",
    search:"Rechercher une œuvre ou un peintre",concepts:"Parcours par concept",allConcepts:"Tous les concepts",
    analyzed:"Profil analysé",entry:"Notice du catalogue",selected:"œuvres affichées",
    active:"œuvres actives",reviewed:"profils sémantiques",details:"Œuvre sélectionnée",
    conceptDetails:"Concepts associés",experiences:"Expériences ARTDACI",
    explore:"Explorer le graphe",artistGraph:"Découvrir cet artiste dans le graphe",
    pending:"Cette œuvre figure au catalogue ARTDACI. Son profil sémantique détaillé n’est pas encore disponible.",
    note:"Les parcours par concept portent uniquement sur les quatre œuvres analysées.",
    empty:"Aucune œuvre ne correspond aux filtres.",error:"L’explorateur guidé est indisponible ; le graphe principal reste utilisable."
  },
  en: {
    kicker:"NEW · GUIDED EXPLORATION",title:"Explore artworks and their connections",
    intro:"Four painters, a browsable catalogue and pathways grounded in documented knowledge.",
    all:"All painters",catalogue:"Full catalogue",profiles:"Semantic profiles",
    search:"Search artwork or artist",concepts:"Concept pathways",allConcepts:"All concepts",
    analyzed:"Reviewed profile",entry:"Catalogue entry",selected:"artworks shown",
    active:"active artworks",reviewed:"semantic profiles",details:"Selected artwork",
    conceptDetails:"Related concepts",experiences:"ARTDACI experiences",
    explore:"Explore the graph",artistGraph:"Explore this artist in the graph",
    pending:"This artwork is in the ARTDACI catalogue. Its detailed semantic profile is not yet available.",
    note:"Concept pathways cover only the four analyzed artworks.",
    empty:"No artworks match your filters.",error:"The guided explorer is unavailable; the main graph still works."
  },
  ar: {
    kicker:"جديد · استكشاف موجه",title:"استكشف الأعمال الفنية وروابطها",
    intro:"أربعة رسامين وفهرس للأعمال ومسارات مبنية على معرفة موثقة.",
    all:"جميع الرسامين",catalogue:"الفهرس الكامل",profiles:"الملفات الدلالية",
    search:"ابحث عن عمل فني أو رسام",concepts:"مسارات المفاهيم",allConcepts:"جميع المفاهيم",
    analyzed:"ملف محلل",entry:"بطاقة الفهرس",selected:"أعمال معروضة",
    active:"أعمال نشطة",reviewed:"ملفات دلالية",details:"العمل المحدد",
    conceptDetails:"مفاهيم مرتبطة",experiences:"تجارب ARTDACI",
    explore:"استكشاف الرسم المعرفي",artistGraph:"استكشاف الفنان في الرسم المعرفي",
    pending:"هذا العمل مدرج في فهرس ARTDACI، لكن ملفه الدلالي التفصيلي غير متاح بعد.",
    note:"تعتمد مسارات المفاهيم على الأعمال الأربعة المحللة فقط.",
    empty:"لا توجد أعمال تطابق عوامل التصفية.",error:"المستكشف الموجه غير متاح؛ الرسم المعرفي الرئيسي يعمل."
  }
};
const ARTISTS = {
  ld:"artist.leonardo-da-vinci",
  ve:"artist.johannes-vermeer",
  vg:"artist.vincent-van-gogh",
  mo:"artist.claude-monet"
};
const TOPICS = ["concept.light","concept.color","concept.gaze","concept.optical-perception"];
const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (c) =>
  ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" })[c]);
const norm = (value) => String(value ?? "").normalize("NFD")
  .replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase();
const urlFor = (id, lang, node) => {
  const params = new URLSearchParams({ artwork:id, lang });
  if (node) params.set("node",node);
  return "?" + params.toString();
};
const safeExperience = (exp, lang) => {
  const href = String(exp?.href || "").replaceAll("{lang}",encodeURIComponent(lang));
  if (!href.startsWith("/") || href.startsWith("//") || href.includes("\\")) return null;
  try {
    const url = new URL(href,location.origin);
    return url.origin === location.origin ? url.pathname + url.search + url.hash : null;
  } catch { return null; }
};

export async function initIntelligentExplorer(data, requestedLang, selectedId) {
  const root = document.querySelector("[data-intelligent-explorer]");
  if (!root) return;
  const lang = I18N[requestedLang] ? requestedLang : "fr";
  const t = I18N[lang];
  try {
    const res = await fetch(new URL("../../content/media-manifests/catalog.json",import.meta.url));
    if (!res.ok) throw new Error("catalogue: "+res.status);
    const catalogue = await res.json();
    const artists = (catalogue.artists || []).filter((a) => Object.hasOwn(ARTISTS,a.id));
    const items = (catalogue.artworks || []).filter((a) =>
      a.status === "active" && a.title && artists.some((artist) => artist.id === a.artistId));
    const profiles = new Set(data.artworks.map((artwork) => artwork.id));
    const analyzed = items.filter((item) => profiles.has(item.id));
    const artistLabel = (code) =>
      localize(data.entityMap?.get(ARTISTS[code])?.labels,lang) ||
      localize(artists.find((a) => a.id === code)?.name,lang) || code;
    const title = (item) => localize(data.artworkMap.get(item.id)?.title || item.title,lang);
    const topicItems = TOPICS.map((id) => ({ id, node:data.conceptMap.get(id) }))
      .filter((topic) => topic.node && analyzed.filter((item) =>
        data.artworkMap.get(item.id)?.assertions?.some((a) => a.conceptId === topic.id)).length >= 2);
    const state = {
      mode:"profiles",artist:"all",topic:"all",query:"",
      focused:items.some((a) => a.id === selectedId) ? selectedId : analyzed[0]?.id
    };
    root.hidden = false;
    root.innerHTML =
      '<header class="ike-head"><div><p class="ike-kicker">'+escapeHtml(t.kicker)+'</p>'+
      '<h2>'+escapeHtml(t.title)+'</h2><p>'+escapeHtml(t.intro)+'</p></div>'+
      '<div class="ike-counts"><span><b>'+items.length+'</b> '+escapeHtml(t.active)+'</span>'+
      '<span><b>'+analyzed.length+'</b> '+escapeHtml(t.reviewed)+'</span></div></header>'+
      '<div class="ike-controls"><div class="ike-switch" role="group" aria-label="Display">'+
      '<button type="button" data-ike-mode="profiles">'+escapeHtml(t.profiles)+'</button>'+
      '<button type="button" data-ike-mode="catalogue">'+escapeHtml(t.catalogue)+'</button></div>'+
      '<label class="ike-search"><span class="ike-sr">'+escapeHtml(t.search)+'</span>'+
      '<input type="search" data-ike-query aria-label="'+escapeHtml(t.search)+
      '" placeholder="'+escapeHtml(t.search)+'" autocomplete="off"></label></div>'+
      '<div class="ike-filter" role="group" aria-label="'+escapeHtml(t.all)+'">'+
      '<button type="button" data-ike-artist="all">'+escapeHtml(t.all)+'</button>'+
      artists.map((a) => '<button type="button" data-ike-artist="'+escapeHtml(a.id)+'">'+
        escapeHtml(artistLabel(a.id))+'</button>').join("")+'</div>'+
      '<p class="ike-label">'+escapeHtml(t.concepts)+'</p>'+
      '<div class="ike-filter" role="group" aria-label="'+escapeHtml(t.concepts)+'">'+
      '<button type="button" data-ike-topic="all">'+escapeHtml(t.allConcepts)+'</button>'+
      topicItems.map((x) => '<button type="button" data-ike-topic="'+escapeHtml(x.id)+'">'+
        escapeHtml(localize(x.node.labels,lang))+'</button>').join("")+'</div>'+
      '<p class="ike-note">'+escapeHtml(t.note)+'</p>'+
      '<div class="ike-layout"><section class="ike-list" aria-label="'+escapeHtml(t.catalogue)+'">'+
      '<p data-ike-total aria-live="polite" class="ike-total"></p>'+
      '<div data-ike-items class="ike-grid"></div></section>'+
      '<aside class="ike-detail" data-ike-detail aria-label="'+escapeHtml(t.details)+'"></aside></div>';

    const results = root.querySelector("[data-ike-items]");
    const total = root.querySelector("[data-ike-total]");
    const details = root.querySelector("[data-ike-detail]");
    const filtered = () => items.filter((item) => {
      if (state.mode === "profiles" && !profiles.has(item.id)) return false;
      if (state.artist !== "all" && item.artistId !== state.artist) return false;
      if (state.topic !== "all" && !data.artworkMap.get(item.id)?.assertions
          ?.some((a) => a.conceptId === state.topic)) return false;
      return !state.query || norm(title(item)+" "+artistLabel(item.artistId)).includes(norm(state.query));
    });
    function showDetail(item) {
      if (!item) { details.innerHTML = '<p>'+escapeHtml(t.empty)+'</p>'; return; }
      const profile = data.artworkMap.get(item.id);
      const topics = (profile?.assertions || []).filter((a) => a.role === "core")
        .sort((a,b) => b.weight-a.weight).slice(0,6);
      const links = getNodeExperiences(data,item.id)
        .map((e) => ({ e,url:safeExperience(e,lang) }))
        .filter((x) => x.url).slice(0,4);
      const artistPilot = analyzed.find((a) => a.artistId === item.artistId);
      details.innerHTML =
        '<p class="ike-label">'+escapeHtml(t.details)+'</p>'+
        (profile?.image?.startsWith("../assets/") ?
        '<img loading="lazy" class="ike-image" src="'+escapeHtml(profile.image)+
        '" alt="'+escapeHtml(title(item))+'">' : '')+
        '<h3>'+escapeHtml(title(item))+'</h3>'+
        '<p class="ike-artist">'+escapeHtml(artistLabel(item.artistId))+'</p>'+
        '<span class="ike-tag '+(profile?'ike-reviewed':'')+'">'+escapeHtml(profile?t.analyzed:t.entry)+'</span>'+
        (profile ?
          '<p class="ike-meta">'+escapeHtml(localize(profile.date,lang))+' · '+
            escapeHtml(localize(profile.museum,lang))+'</p>'+
          '<p class="ike-label">'+escapeHtml(t.conceptDetails)+'</p>'+
          '<div class="ike-links">'+topics.map((a) => {
            const concept = data.conceptMap.get(a.conceptId);
            return concept ? '<a href="'+escapeHtml(urlFor(item.id,lang,a.conceptId))+'">'+
              escapeHtml(localize(concept.labels,lang))+'</a>' : '';
          }).join("")+'</div>'+
          '<a class="ike-main-link" href="'+escapeHtml(urlFor(item.id,lang))+'">'+escapeHtml(t.explore)+' ↗</a>' :
          '<p class="ike-pending">'+escapeHtml(t.pending)+'</p>'+
          (artistPilot ? '<a class="ike-main-link" href="'+escapeHtml(urlFor(artistPilot.id,lang,ARTISTS[item.artistId]))+
            '">'+escapeHtml(t.artistGraph)+' ↗</a>' : '')
        )+
        (links.length ? '<div class="ike-experiences"><p class="ike-label">'+escapeHtml(t.experiences)+'</p>'+
          '<div class="ike-links">'+links.map(({e,url}) => '<a href="'+escapeHtml(url)+'">'+
            escapeHtml(localize(e.labels,lang))+' ↗</a>').join("")+'</div></div>' : '');
    }
    function render() {
      const shown = filtered();
      if (!shown.some((item) => item.id === state.focused)) state.focused = shown[0]?.id || null;
      total.textContent = shown.length+" "+t.selected;
      results.innerHTML = shown.length ? shown.map((item) =>
        '<button type="button" class="ike-item '+(item.id===state.focused?'is-current':'')+
        '" data-ike-item="'+escapeHtml(item.id)+'" aria-pressed="'+(item.id===state.focused)+'">'+
        '<small>'+escapeHtml(artistLabel(item.artistId))+'</small><strong>'+escapeHtml(title(item))+
        '</strong><span class="ike-tag '+(profiles.has(item.id)?'ike-reviewed':'')+'">'+
        escapeHtml(profiles.has(item.id)?t.analyzed:t.entry)+'</span></button>'
      ).join("") : '<p class="ike-pending">'+escapeHtml(t.empty)+'</p>';
      showDetail(shown.find((item) => item.id === state.focused));
      for (const [attr,value] of [["mode",state.mode],["artist",state.artist],["topic",state.topic]]) {
        root.querySelectorAll("[data-ike-"+attr+"]").forEach((button) => {
          const active = button.getAttribute("data-ike-"+attr) === value;
          button.classList.toggle("is-current",active);
          button.setAttribute("aria-pressed",String(active));
        });
      }
    }
    root.addEventListener("click",(event) => {
      const hit = event.target.closest("[data-ike-item],[data-ike-artist],[data-ike-topic],[data-ike-mode]");
      if (!hit || !root.contains(hit)) return;
      if (hit.hasAttribute("data-ike-item")) state.focused=hit.dataset.ikeItem;
      else if (hit.hasAttribute("data-ike-artist")) state.artist=hit.dataset.ikeArtist;
      else if (hit.hasAttribute("data-ike-topic")) {
        state.topic=hit.dataset.ikeTopic;
        if (state.topic!=="all") state.mode="profiles";
      } else if (hit.hasAttribute("data-ike-mode")) {
        state.mode=hit.dataset.ikeMode;
        if (state.mode==="catalogue") state.topic="all";
      }
      render();
    });
    root.querySelector("[data-ike-query]").addEventListener("input",(event) => {
      state.query=event.target.value; render();
    });
    render();
  } catch (error) {
    console.warn("ARTDACI explorer:",error);
    root.hidden=false;
    root.textContent=t.error;
  }
}
