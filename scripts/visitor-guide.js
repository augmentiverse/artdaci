import { resolveSemanticRuntime } from "./semantics/semantic-runtime-client.mjs?v=2";

const visitorGuideRequestedLang = new URLSearchParams(location.search).get("lang");
const visitorGuideLang = ["en", "fr", "ar"].includes(visitorGuideRequestedLang)
  ? visitorGuideRequestedLang
  : ["en", "fr", "ar"].includes(document.documentElement.lang) ? document.documentElement.lang : "en";

const visitorGuideLabels = {
  en: "Ask the ARTDACI guide",
  fr: "Demander au guide ARTDACI",
  ar: "اسأل دليل ARTDACI"
};

const ARTIST_SLUGS = {
  leonardo: "leonardo",
  vermeer: "vermeer",
  vangogh: "van-gogh",
  "van-gogh": "van-gogh",
  monet: "monet"
};

function currentVisitorContext(runtime = null) {
  if (runtime?.focus?.label) {
    const subtitle = runtime.focus.subtitle ? ` — ${runtime.focus.subtitle}` : "";
    return `${runtime.focus.label}${subtitle} in the ${runtime.context?.environmentLabel || "ARTDACI"} experience`;
  }

  const params = new URLSearchParams(location.search);
  const painting = params.get("painting");
  const bookPage = document.getElementById("book-progress")?.textContent?.trim();
  if (painting) return `the ARTDACI visitor experience for ${painting}`;
  if (location.pathname.includes("/geo/remote.html")) return "the ARTDACI GEO Louvre experience";
  if (location.pathname.includes("/geo/masters-hub.html")) return "the ARTDACI Masters Hub 3D gallery";
  if (bookPage) return `the ARTDACI Living Book, currently showing ${bookPage}`;
  return `${document.title} on the ARTDACI digital museum website`;
}

function semanticGuideRequest() {
  const params = new URLSearchParams(location.search);
  const explicitNode = document.body.dataset.semanticNode;
  if (explicitNode) {
    return {
      nodeId: explicitNode,
      environment: document.body.dataset.semanticEnvironment || "web",
      lang: visitorGuideLang
    };
  }

  const painting = params.get("painting");
  if (painting) {
    const environment = location.pathname.endsWith("/ar.html")
      ? "ar"
      : location.pathname.endsWith("/vr.html") ? "vr" : "web";
    return { slug: painting, resourceType: "painting", environment, lang: visitorGuideLang };
  }

  if (location.pathname.includes("/geo/remote.html")) {
    return { slug: "louvre", resourceType: "museum", environment: "geo", lang: visitorGuideLang };
  }

  if (location.pathname.includes("/geo/masters-hub.html")) {
    const guideSlug = ARTIST_SLUGS[params.get("guide") || ""];
    if (guideSlug) return { slug: guideSlug, resourceType: "artist", environment: "3d", lang: visitorGuideLang };
  }

  return null;
}

function clip(value, max = 150) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function semanticContext(runtime) {
  if (!runtime) return "";
  const lines = [
    `Focus: ${runtime.focus?.label || runtime.focus?.id || "unknown"}${runtime.focus?.subtitle ? ` — ${runtime.focus.subtitle}` : ""}`
  ];

  if (runtime.concepts?.length) {
    lines.push("Concepts: " + runtime.concepts.slice(0, 4)
      .map(item => `${item.label}${item.definition ? ` — ${clip(item.definition, 110)}` : ""}`)
      .join(" | "));
  }

  if (runtime.hotspots?.length) {
    lines.push("Observation regions: " + runtime.hotspots.slice(0, 4).map(item => item.label).join(", "));
  }

  const question = runtime.pedagogy?.find(item => item.prompt)?.prompt;
  if (question) lines.push(`ARTDACI pedagogical question: ${clip(question, 180)}`);

  if (runtime.learningPath?.steps?.length) {
    lines.push("Learning path: " + runtime.learningPath.steps
      .slice(0, 4)
      .map(step => `${step.action || step.stage} → ${step.label}`)
      .join(" | "));
  }

  if (runtime.experiences?.length) {
    lines.push("Available ARTDACI experiences: " + runtime.experiences.slice(0, 4)
      .map(item => `${item.label} [${item.channel}]`)
      .join(" | "));
  }

  return lines.join("\n");
}

function visitorGuidePrompt(runtime = null) {
  const replyLanguage = visitorGuideLang === "ar" ? "Arabic" : visitorGuideLang === "fr" ? "French" : "English";
  const suggestions = runtime?.guide?.suggestedQuestions || [];
  const semantic = semanticContext(runtime);

  return [
    "You are the ARTDACI virtual museum guide.",
    "Help visitors understand artworks with clear, engaging, age-appropriate explanations.",
    "Keep the first answer concise and encourage close looking.",
    "Grounding rules: distinguish established factual graph information from ARTDACI pedagogical interpretation; do not invent relations, locations, attributions, or immersive experiences that are not present in the supplied context. If the visitor asks beyond the supplied context, say that the point needs verification rather than presenting it as an ARTDACI fact.",
    `Current location: ${currentVisitorContext(runtime)}.`,
    semantic ? `ARTDACI semantic context:\n${semantic}` : "",
    suggestions.length ? `Suggested visitor questions:\n- ${suggestions.join("\n- ")}` : "",
    "Welcome me, briefly explain what I can discover here, then offer the suggested questions when available and ask what I would like to explore.",
    `Reply in ${replyLanguage}.`
  ].filter(Boolean).join("\n\n");
}

function visitorGuideUrl(runtime = null) {
  return `https://chatgpt.com/?q=${encodeURIComponent(visitorGuidePrompt(runtime))}`;
}

let semanticRuntime = null;
const guideRequest = semanticGuideRequest();

const visitorGuideLink = document.createElement("a");
visitorGuideLink.className = "visitor-guide-link";
visitorGuideLink.target = "_blank";
visitorGuideLink.rel = "noopener noreferrer";
visitorGuideLink.textContent = visitorGuideLabels[visitorGuideLang] || visitorGuideLabels.en;
visitorGuideLink.setAttribute("aria-label", visitorGuideLink.textContent);
visitorGuideLink.dataset.semanticState = guideRequest ? "loading" : "fallback";
visitorGuideLink.href = visitorGuideUrl();
visitorGuideLink.addEventListener("click", () => {
  visitorGuideLink.href = visitorGuideUrl(semanticRuntime);
});
document.body.appendChild(visitorGuideLink);

if (guideRequest) {
  resolveSemanticRuntime(guideRequest)
    .then(runtime => {
      semanticRuntime = runtime;
      visitorGuideLink.dataset.semanticState = "ready";
      visitorGuideLink.href = visitorGuideUrl(runtime);
      const suggestions = runtime?.guide?.suggestedQuestions || [];
      if (suggestions.length) visitorGuideLink.title = suggestions.slice(0, 2).join(" · ");
    })
    .catch(error => {
      console.warn("Semantic guide context unavailable; using generic ARTDACI guide.", error);
      visitorGuideLink.dataset.semanticState = "fallback";
    });
}
