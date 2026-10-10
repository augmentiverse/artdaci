const COPY = {
  fr: { button:"Sémantique", title:"Contexte sémantique", concepts:"Notions", hotspots:"Observer", path:"Parcours ARTDACI", pedagogy:"Question pédagogique", next:"Continuer", close:"Fermer", open:"Ouvrir le graphe" },
  en: { button:"Semantic", title:"Semantic context", concepts:"Concepts", hotspots:"Observe", path:"ARTDACI path", pedagogy:"Learning question", next:"Continue", close:"Close", open:"Open graph" },
  ar: { button:"دلالي", title:"السياق الدلالي", concepts:"المفاهيم", hotspots:"لاحظ", path:"مسار ARTDACI", pedagogy:"سؤال تعليمي", next:"تابع", close:"إغلاق", open:"افتح الرسم الدلالي" }
};

function esc(value) {
  return String(value ?? "")
    .replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")
    .replaceAll('"',"&quot;").replaceAll("'","&#039;");
}

export async function resolveSemanticRuntime({ nodeId, slug, resourceType="painting", regionId, environment="web", lang="fr" } = {}) {
  const params = new URLSearchParams({ environment, lang });
  if (nodeId) params.set("nodeId", nodeId);
  if (slug) params.set("slug", slug);
  if (resourceType) params.set("resourceType", resourceType);
  if (regionId) params.set("regionId", regionId);
  params.set("runtime", "2.12");
  const response = await fetch(`/api/semantic-runtime?${params.toString()}`, {
    headers:{ Accept:"application/json" },
    cache:"no-store"
  });
  if (!response.ok) throw new Error(`Semantic runtime HTTP ${response.status}`);
  return response.json();
}

function learningPathMarkup(runtime, lang) {
  const t=COPY[lang]||COPY.en;
  const steps=(runtime.learningPath?.steps||[]).slice(0,4);
  if(!steps.length) return "";
  return `
    <section class="semantic-runtime-path-section">
      <h3>${esc(t.path)}</h3>
      <div class="semantic-runtime-path" data-semantic-learning-path>
        ${steps.map((step,index)=>`<a class="semantic-runtime-path-step" data-semantic-path-stage="${esc(step.stage)}" href="${esc(step.href)}"${step.external?' target="_blank" rel="noopener noreferrer"':""}>
          <span class="semantic-runtime-path-index">${index+1}</span>
          <span><small>${esc(step.action||step.stage)}</small><strong>${esc(step.label)}</strong>${step.channel?`<em>${esc(step.channel)}</em>`:""}</span>
        </a>`).join("")}
      </div>
    </section>`;
}

function crossArtworkMarkup(runtime, lang) {
  const labels = {
    fr: { heading: "Passer à une autre œuvre", via: "Concepts communs" },
    en: { heading: "Travel to another artwork", via: "Shared concepts" },
    ar: { heading: "انتقل إلى عمل آخر", via: "مفاهيم مشتركة" }
  }[lang] || { heading: "Related artwork", via: "Shared concepts" };
  const seen = new Set();
  const bridges = (runtime.journeyBridges || []).filter((item) => {
    if (!item.href?.startsWith("/") || item.href.startsWith("//") || seen.has(item.toArtworkId)) return false;
    seen.add(item.toArtworkId);
    return true;
  }).slice(0, 3);
  if (!bridges.length) return "";
  return `
    <section class="semantic-runtime-cross-artwork">
      <h3>${esc(labels.heading)}</h3>
      <div class="semantic-runtime-next">
        ${bridges.map((item) => `<a href="${esc(item.href)}">
          <strong>${esc(item.toArtworkLabel)}</strong>
          <small>${esc(item.title)} · ${esc(labels.via)} :
            ${esc(item.sharedConcepts.map((entry) => entry.label).join(" · "))}</small>
        </a>`).join("")}
      </div>
    </section>`;
}

function panelMarkup(runtime, lang) {
  const t=COPY[lang]||COPY.en;
  const question=runtime.pedagogy?.find(item=>item.prompt)?.prompt||"";
  return `
    <div class="semantic-runtime-panel-head">
      <div><small>${esc(runtime.context.environmentLabel)}</small><strong>${esc(runtime.focus.label)}</strong></div>
      <button type="button" data-semantic-runtime-close aria-label="${esc(t.close)}">×</button>
    </div>
    ${runtime.hotspots?.length?`<section><h3>${esc(t.hotspots)}</h3><div class="semantic-runtime-chips">${runtime.hotspots.map(item=>`<a href="/semantic/?artwork=${encodeURIComponent(runtime.focus.artworkId||runtime.focus.id)}&lang=${encodeURIComponent(lang)}&region=${encodeURIComponent(item.id)}">${esc(item.label)}</a>`).join("")}</div></section>`:""}
    ${runtime.concepts?.length?`<section><h3>${esc(t.concepts)}</h3><div class="semantic-runtime-chips">${runtime.concepts.slice(0,6).map(item=>`<span>${esc(item.label)}</span>`).join("")}</div></section>`:""}
    ${learningPathMarkup(runtime,lang)}
    ${crossArtworkMarkup(runtime,lang)}
    ${question?`<section class="semantic-runtime-question"><h3>${esc(t.pedagogy)}</h3><p>${esc(question)}</p></section>`:""}
    ${runtime.next?.length?`<section><h3>${esc(t.next)}</h3><div class="semantic-runtime-next">${runtime.next.slice(0,4).map(item=>`<a href="${esc(item.href)}"${item.external?' target="_blank" rel="noopener noreferrer"':""}><strong>${esc(item.label)}</strong><small>${esc(item.reason)}</small></a>`).join("")}</div></section>`:""}
    <a class="semantic-runtime-open" href="${esc(runtime.links.semantic)}">${esc(t.open)} →</a>
  `;
}

export async function mountSemanticRuntimePanel({ anchor, nodeId, slug, resourceType="painting", environment="web", lang="fr" }={}) {
  const anchorElement=typeof anchor==="string"?document.querySelector(anchor):anchor;
  if(!anchorElement) return null;
  try{
    const runtime=await resolveSemanticRuntime({nodeId,slug,resourceType,environment,lang});
    const t=COPY[lang]||COPY.en;
    const button=document.createElement("button");
    button.type="button";
    button.className="semantic-runtime-trigger";
    button.textContent=t.button;
    button.setAttribute("aria-expanded","false");

    const panel=document.createElement("aside");
    panel.className="semantic-runtime-panel";
    panel.hidden=true;
    panel.setAttribute("aria-label",t.title);
    panel.innerHTML=panelMarkup(runtime,lang);

    const open=()=>{panel.hidden=false;button.setAttribute("aria-expanded","true");};
    const close=()=>{panel.hidden=true;button.setAttribute("aria-expanded","false");};
    button.addEventListener("click",()=>panel.hidden?open():close());
    panel.querySelector("[data-semantic-runtime-close]")?.addEventListener("click",close);

    anchorElement.appendChild(button);
    document.body.appendChild(panel);
    return { runtime, button, panel, open, close };
  }catch(error){
    console.warn("Semantic runtime unavailable; immersive viewer continues without it.",error);
    return null;
  }
}
