"use strict";

// Stable /a/<artworkId> links declared in media manifests.
// Explicit reviewed print slugs are required: some catalogue slugs differ.
const PRINT_SLUGS = Object.freeze({
  ld01: "mona-lisa", ld02: "lady-with-an-ermine",
  ld03: "last-supper", ld04: "annunciation", ld05: "ginevra-de-benci", ld06: "belle-ferronniere",
  ve01: "vermeer-girl-with-a-pearl-earring", ve02: "view-of-delft",
  ve03: "vermeer-milkmaid", ve04: "art-of-painting",
  ve05: "vermeer-astronomer", ve06: "woman-holding-balance",
  vg01: "van-gogh", vg02: "van-gogh-bedroom", vg03: "starry-night",
  vg04: "sunflowers", vg05: "cafe-terrace", vg06: "night-cafe",
  mo01: "monet-impression-sunrise", mo02: "pont-d-argenteuil",
  mo03: "water-lilies", mo04: "japanese-bridge", mo05: "poppies", mo06: "woman-with-parasol"
});

// Dedicated authored print spreads exist for these five experiences.
const FEATURED_SPREADS = Object.freeze({
  ld01: ["print-target.html", "print-target-fr.html"],
  ve01: ["print-vermeer-girl-with-a-pearl-earring.html", "print-vermeer-girl-with-a-pearl-earring-fr.html"],
  vg01: ["print-van-gogh.html", "print-van-gogh-fr.html"],
  vg02: ["print-van-gogh-bedroom.html", "print-van-gogh-bedroom-fr.html"],
  mo01: ["print-monet-impression-sunrise.html", "print-monet-impression-sunrise-fr.html"]
});

function destinationForArtwork(id, requestedLanguage) {
  if (typeof id !== "string" || !Object.hasOwn(PRINT_SLUGS,id)) return null;
  const lang = ["en","fr","ar"].includes(requestedLanguage) ? requestedLanguage : "en";
  const slug = PRINT_SLUGS[id];
  if (FEATURED_SPREADS[id]) {
    if (lang === "ar") return "/print-ar.html?painting=" + encodeURIComponent(slug);
    return "/" + FEATURED_SPREADS[id][lang === "fr" ? 1 : 0];
  }
  return "/print-artwork.html?painting=" + encodeURIComponent(slug) + "&lang=" + lang;
}

module.exports = (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow","GET, HEAD");
    res.statusCode = 405;
    return res.end("Method not allowed");
  }
  // /a/:id is mapped by vercel.json; accepting only listed IDs prevents open redirects.
  const id = Array.isArray(req.query?.id) ? null : req.query?.id;
  const lang = Array.isArray(req.query?.lang) ? null : req.query?.lang;
  const destination = destinationForArtwork(id, lang);
  if (!destination) {
    res.statusCode = 404;
    return res.end("ARTDACI artwork not found");
  }
  res.statusCode = 302;
  res.setHeader("Location", destination);
  return res.end();
};
module.exports.destinationForArtwork = destinationForArtwork;
module.exports.PRINT_SLUGS = PRINT_SLUGS;
