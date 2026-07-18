const PRINT_PAGES = {
  en: {
    "mona-lisa": "print-target.html",
    "van-gogh": "print-van-gogh.html",
    "van-gogh-bedroom": "print-van-gogh-bedroom.html"
  },
  fr: {
    "mona-lisa": "print-target-fr.html",
    "van-gogh": "print-van-gogh-fr.html",
    "van-gogh-bedroom": "print-van-gogh-bedroom-fr.html"
  }
};

const UI = {
  en: {
    search: "Search by title, artist, technique, period...",
    allMovements: "All movements",
    reset: "Reset",
    results: "artworks",
    print: "Printed Spread",
    ar: "Image AR",
    space: "Room AR",
    vocabulary: "Vocabulary",
    noResults: "No artwork matches that search.",
    years: "years covered",
    modes: "active modes",
    printFirst: "print-first spreads",
    by: "by",
    dimensions: "Dimensions",
    location: "Location",
    palette: "Palette",
    technique: "Technique",
    context: "Context"
  },
  fr: {
    search: "Rechercher par titre, artiste, technique, periode...",
    allMovements: "Tous les mouvements",
    reset: "Reinitialiser",
    results: "oeuvres",
    print: "Double page",
    ar: "AR image",
    space: "AR espace",
    vocabulary: "Vocabulaire",
    noResults: "Aucune oeuvre ne correspond a cette recherche.",
    years: "annees couvertes",
    modes: "modes actifs",
    printFirst: "doubles pages papier",
    by: "par",
    dimensions: "Dimensions",
    location: "Lieu",
    palette: "Palette",
    technique: "Technique",
    context: "Contexte"
  }
};

const FR_TITLES = {
  "van-gogh": "Autoportrait",
  "van-gogh-bedroom": "La Chambre"
};

const app = document.getElementById("catalogue-app");

if (app) initCatalogue(app);

async function initCatalogue(root) {
  const lang = root.dataset.lang === "fr" ? "fr" : "en";
  const text = UI[lang];
  const manifestPaths = root.dataset.manifests.split(",").map((item) => item.trim()).filter(Boolean);

  try {
    const manifests = await Promise.all(manifestPaths.map(loadManifest));
    root.dataset.ready = "true";
    document.querySelector(".static-index")?.setAttribute("hidden", "");
    renderCatalogue(root, manifests.sort((a, b) => a.bookOrder - b.bookOrder), lang, text);
  } catch (error) {
    root.innerHTML = `<p class="catalogue-error">${escapeHtml(error.message)}</p>`;
  }
}

async function loadManifest(path) {
  const response = await fetch(path, { cache: "reload" });
  if (!response.ok) throw new Error(`Could not load ${path}: ${response.status}`);
  return response.json();
}

function renderCatalogue(root, manifests, lang, text) {
  const movements = [...new Set(manifests.flatMap((item) => item.movement || []))].sort();
  const state = {
    query: "",
    movement: ""
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
          ${movements.map((movement) => `<option value="${escapeHtml(movement)}">${escapeHtml(movement)}</option>`).join("")}
        </select>
      </label>
      <button class="button" type="button" data-action="reset">${text.reset}</button>
    </div>
    <div class="collection-stats"></div>
    <div class="catalogue-layout">
      <div class="artwork-grid"></div>
    </div>
  `;

  const input = root.querySelector("input");
  const select = root.querySelector("select");
  const reset = root.querySelector("[data-action='reset']");

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
    update();
  });

  function update() {
    const filtered = manifests.filter((manifest) => matches(manifest, state));
    root.querySelector(".collection-stats").innerHTML = renderStats(manifests, filtered, text);
    root.querySelector(".artwork-grid").innerHTML = filtered.length
      ? filtered.map((manifest) => renderCard(manifest, lang, text)).join("")
      : `<p class="empty-results">${text.noResults}</p>`;
  }

  update();
}

function matches(manifest, state) {
  const haystack = [
    manifest.title,
    manifest.artist?.name,
    manifest.date,
    manifest.medium,
    ...(manifest.movement || []),
    manifest.texts?.historicalContext,
    manifest.texts?.artisticAnalysis,
    manifest.texts?.palette,
    manifest.texts?.perspectiveTechnique,
    ...(manifest.education?.vocabulary || [])
  ].filter(Boolean).join(" ").toLowerCase();

  return (!state.query || haystack.includes(state.query))
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
  const title = getTitle(manifest, lang);
  const image = manifest.media?.image || manifest.print?.imageTargetSource;
  const movement = (manifest.movement || []).join(", ");
  const printUrl = PRINT_PAGES[lang]?.[slug] || PRINT_PAGES.en[slug] || "index.html";
  const location = [manifest.currentLocation?.museum, manifest.currentLocation?.city].filter(Boolean).join(", ");

  return `
    <article class="artwork-card">
      <a class="artwork-image" href="${printUrl}">
        <img src="${escapeHtml(image)}" alt="${escapeHtml(title)}" loading="lazy" />
      </a>
      <div class="artwork-content">
        <p class="eyebrow">Spread ${String(manifest.print?.spreadNumber || manifest.bookOrder).padStart(3, "0")}</p>
        <h3>${escapeHtml(title)}</h3>
        <p class="card-meta">${escapeHtml(manifest.artist?.name || "")}, ${escapeHtml(manifest.date || "")}</p>
        <p>${escapeHtml(shorten(manifest.texts?.artisticAnalysis || manifest.texts?.historicalContext || "", 210))}</p>
        <dl class="mini-facts">
          <div><dt>${text.dimensions}</dt><dd>${manifest.dimensions?.heightCm || "?"} x ${manifest.dimensions?.widthCm || "?"} cm</dd></div>
          <div><dt>${text.location}</dt><dd>${escapeHtml(location || movement)}</dd></div>
        </dl>
        <div class="tag-strip">
          ${(manifest.education?.vocabulary || []).slice(0, 4).map((item) => `<span>${escapeHtml(item)}</span>`).join("")}
        </div>
        <div class="card-actions">
          <a class="button primary" href="${printUrl}">${text.print}</a>
          <a class="button" href="ar.html?painting=${slug}&amp;lang=${lang}">${text.ar}</a>
          <a class="button" href="space.html?painting=${slug}&amp;lang=${lang}">${text.space}</a>
        </div>
      </div>
    </article>
  `;
}

function getTitle(manifest, lang) {
  return lang === "fr" ? FR_TITLES[manifest.slug] || manifest.title : manifest.title;
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
