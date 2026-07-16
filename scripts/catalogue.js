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
    compare: "Compare",
    remove: "Remove",
    selected: "Compare Selection",
    selectionHint: "Choose up to two artworks to compare period, technique, palette, and learning goals.",
    clear: "Clear",
    learningPath: "Learning Path",
    discussion: "Discussion Prompts",
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
    context: "Context",
    compareEmpty: "Select artworks from the cards to build a comparison."
  },
  fr: {
    search: "Rechercher par titre, artiste, technique, periode...",
    allMovements: "Tous les mouvements",
    reset: "Reinitialiser",
    results: "oeuvres",
    print: "Double page",
    ar: "AR image",
    space: "AR espace",
    compare: "Comparer",
    remove: "Retirer",
    selected: "Selection comparative",
    selectionHint: "Choisissez jusqu'a deux oeuvres pour comparer periode, technique, palette et objectifs.",
    clear: "Effacer",
    learningPath: "Parcours pedagogique",
    discussion: "Questions",
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
    context: "Contexte",
    compareEmpty: "Selectionnez des oeuvres dans les fiches pour creer une comparaison."
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
    movement: "",
    selected: []
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
      <aside class="study-panel"></aside>
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
    state.selected = [];
    update();
  });

  root.addEventListener("click", (event) => {
    const button = event.target.closest("[data-compare]");
    if (!button) return;

    const slug = button.dataset.compare;
    if (state.selected.includes(slug)) {
      state.selected = state.selected.filter((item) => item !== slug);
    } else {
      state.selected = [...state.selected, slug].slice(-2);
    }
    update();
  });

  function update() {
    const filtered = manifests.filter((manifest) => matches(manifest, state));
    root.querySelector(".collection-stats").innerHTML = renderStats(manifests, filtered, text);
    root.querySelector(".artwork-grid").innerHTML = filtered.length
      ? filtered.map((manifest) => renderCard(manifest, lang, text, state)).join("")
      : `<p class="empty-results">${text.noResults}</p>`;
    root.querySelector(".study-panel").innerHTML = renderStudyPanel(manifests, state, lang, text);
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

function renderCard(manifest, lang, text, state) {
  const slug = manifest.slug;
  const title = getTitle(manifest, lang);
  const image = manifest.media?.image || manifest.print?.imageTargetSource;
  const movement = (manifest.movement || []).join(", ");
  const selected = state.selected.includes(slug);
  const printUrl = PRINT_PAGES[lang]?.[slug] || PRINT_PAGES.en[slug] || "index.html";
  const location = [manifest.currentLocation?.museum, manifest.currentLocation?.city].filter(Boolean).join(", ");

  return `
    <article class="artwork-card${selected ? " selected" : ""}">
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
          <button class="button" type="button" data-compare="${slug}">${selected ? text.remove : text.compare}</button>
        </div>
      </div>
    </article>
  `;
}

function renderStudyPanel(manifests, state, lang, text) {
  const selected = state.selected.map((slug) => manifests.find((item) => item.slug === slug)).filter(Boolean);
  const focus = selected[0] || manifests[0];
  const promptItems = selected.length ? selected : [focus];

  return `
    <section class="compare-panel">
      <div class="panel-heading">
        <p class="eyebrow">${text.selected}</p>
        <p>${text.selectionHint}</p>
      </div>
      ${selected.length ? renderComparison(selected, lang, text) : `<p class="panel-empty">${text.compareEmpty}</p>`}
    </section>
    <section class="learning-panel">
      <p class="eyebrow">${text.learningPath}</p>
      <ol>
        ${promptItems.flatMap((manifest) => (manifest.education?.learningObjectives || []).slice(0, 2).map((item) => `<li>${escapeHtml(item)}</li>`)).join("")}
      </ol>
      <h3>${text.discussion}</h3>
      <ul>
        ${promptItems.flatMap((manifest) => (manifest.education?.discussionPrompts || []).slice(0, 2).map((item) => `<li>${escapeHtml(item)}</li>`)).join("")}
      </ul>
      <h3>${text.vocabulary}</h3>
      <div class="tag-strip">
        ${[...new Set(promptItems.flatMap((manifest) => manifest.education?.vocabulary || []))].slice(0, 10).map((item) => `<span>${escapeHtml(item)}</span>`).join("")}
      </div>
    </section>
  `;
}

function renderComparison(selected, lang, text) {
  return `
    <div class="comparison-grid">
      ${selected.map((manifest) => `
        <article>
          <h3>${escapeHtml(getTitle(manifest, lang))}</h3>
          <dl>
            <div><dt>${text.by}</dt><dd>${escapeHtml(manifest.artist?.name || "")}</dd></div>
            <div><dt>${text.context}</dt><dd>${escapeHtml(shorten(manifest.texts?.historicalContext || "", 160))}</dd></div>
            <div><dt>${text.palette}</dt><dd>${escapeHtml(shorten(manifest.texts?.palette || "", 130))}</dd></div>
            <div><dt>${text.technique}</dt><dd>${escapeHtml(shorten(manifest.texts?.perspectiveTechnique || "", 130))}</dd></div>
          </dl>
        </article>
      `).join("")}
    </div>
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
