const NUMBER_LABELS = Object.freeze({
  en: "Artwork",
  fr: "Œuvre",
  ar: "العمل"
});

export function normalizeArtworkNumberLanguage(lang) {
  const primary = String(lang || "en").trim().toLowerCase().split("-")[0];
  return primary === "fr" || primary === "ar" ? primary : "en";
}

export function formatArtworkNumber(bookOrder, lang) {
  if (!Number.isInteger(bookOrder) || bookOrder < 1) return "";

  const language = normalizeArtworkNumberLanguage(lang);
  const paddedNumber = String(bookOrder).padStart(3, "0");
  const localizedNumber = language === "ar"
    ? paddedNumber.replace(/\d/g, (digit) => "٠١٢٣٤٥٦٧٨٩"[Number(digit)])
    : paddedNumber;
  return `${NUMBER_LABELS[language]} ${localizedNumber}`;
}
