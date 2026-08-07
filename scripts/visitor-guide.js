const visitorGuideRequestedLang = new URLSearchParams(location.search).get("lang");
const visitorGuideLang = ["en", "fr", "ar"].includes(visitorGuideRequestedLang)
  ? visitorGuideRequestedLang
  : ["en", "fr", "ar"].includes(document.documentElement.lang) ? document.documentElement.lang : "en";

const visitorGuideLabels = {
  en: "Ask the ChatGPT guide",
  fr: "Demander au guide ChatGPT",
  ar: "اسأل دليل ChatGPT"
};

function currentVisitorContext() {
  const params = new URLSearchParams(location.search);
  const painting = params.get("painting");
  const bookPage = document.getElementById("book-progress")?.textContent?.trim();
  if (painting) return `the ARTDACI visitor experience for ${painting}`;
  if (bookPage) return `the ARTDACI Living Book, currently showing ${bookPage}`;
  return `${document.title} on the ARTDACI digital museum website`;
}

function visitorGuideUrl() {
  const replyLanguage = visitorGuideLang === "ar" ? "Arabic" : visitorGuideLang === "fr" ? "French" : "English";
  const prompt = `You are the ARTDACI virtual museum guide. Help visitors understand artworks with clear, engaging, age-appropriate explanations. Distinguish established facts from interpretation, encourage close looking, and keep the first answer concise. Current location: ${currentVisitorContext()}. Welcome me, explain what I can discover here, and ask what I would like to explore. Reply in ${replyLanguage}.`;
  return `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`;
}

const visitorGuideLink = document.createElement("a");
visitorGuideLink.className = "visitor-guide-link";
visitorGuideLink.target = "_blank";
visitorGuideLink.rel = "noopener noreferrer";
visitorGuideLink.textContent = visitorGuideLabels[visitorGuideLang] || visitorGuideLabels.en;
visitorGuideLink.setAttribute("aria-label", visitorGuideLink.textContent);
visitorGuideLink.href = visitorGuideUrl();
visitorGuideLink.addEventListener("click", () => { visitorGuideLink.href = visitorGuideUrl(); });
document.body.appendChild(visitorGuideLink);
