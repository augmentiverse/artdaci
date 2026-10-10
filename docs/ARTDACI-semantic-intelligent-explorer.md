# ARTDACI Semantic — Intelligent Knowledge Explorer (feature preview)

This is an additive enhancement to Semantic POC V2.11, not a replacement of
the existing semantic SVG graph or the knowledge model.

## Data boundaries

- 24 active catalogue entries from content/media-manifests/catalog.json.
- 4 reviewed semantic profiles from content/semantics/artwork-concepts.json.
- The four painters come from the official ARTDACI catalogue and the cultural
  knowledge graph. Catalogue-only entries are explicitly labelled and do not
  acquire invented semantic assertions.
- Experiences are read from content/semantics/experience-links.json, and only
  same-origin, site-relative destinations are offered.
- Existing concept identifiers, reviewed assertions, language keys and the
  Arabic RTL layout are preserved.

## New interactions

Painter filters, catalogue/profile switch, accent-insensitive search, curated
concept pathways across the four annotated artworks, explanatory artwork
details, core-concept deep links, and links to immersive ARTDACI content when
those links are already documented in the experience manifest.

Files: scripts/semantics/semantic-explorer.mjs,
styles/semantic-explorer.css, semantic/index.html and an additive initialization
hook in scripts/semantics/semantic-ui.mjs.

## Checks before production

Run:
- node --test tests/semantic/intelligent-explorer.test.mjs
- node tests/semantic/validate-semantic.mjs

Then manually verify the feature-branch Vercel Preview at:
- /semantic/?lang=fr
- /semantic/?lang=en
- /semantic/?lang=ar

Check desktop, mobile, RTL, keyboard-only navigation, data availability,
catalogue-only disclaimers and individual AR/VR/GEO destinations.

The feature must remain on its branch until the preview is independently
validated. No automatic production merge or promotion.
