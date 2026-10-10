# ARTDACI Semantic V3 — immersive cross-artwork learning (pilot)

## Design principle: enrich, do not duplicate

V2.11 already offers an interactive semantic SVG graph, hybrid natural-language
search, concepts, pedagogical relations, IIIF regions, WebXR concept constellations,
AR hotspots and an adaptive Semantic Runtime. This V3 **pilot** does not add a
second graph, search box, artwork catalogue or knowledge inspector.

### What is genuinely new

1. **Three editorial learning journeys** (FR/EN/AR) cross artworks and painters:
   - Light and perception: Mona Lisa → Girl with a Pearl Earring → Impression, Sunrise.
   - Gaze and presence: Mona Lisa → Girl with a Pearl Earring → Self-Portrait (1889).
   - Color and painterly gesture: Girl with a Pearl Earring → Self-Portrait (1889) → Impression, Sunrise.
2. Each journey transition is **evidence-gated**: both reviewed artwork profiles
   must share at least one documented concept from that journey's concepts.
   The UI displays those shared concepts and an editorial observation question.
   This is a pedagogical comparison, not proof of historical influence.
3. On the existing Semantic page, one **collapsed section** appears between
   the main graph and the already existing related-artwork area. It uses existing
   semantic deep links and the curated artwork experience manifest, rather than
   creating a competing search or navigator.
4. The existing VR semantic constellation gains **in-world cross-artwork portals**
   sourced from the server Semantic Runtime. First selection explains the theme
   and shared evidence; second selection opens the verified VR destination, ending
   the current WebXR session before navigation (existing safe viewer mechanism).
   VR portal labels distinguish individual learning themes.
5. The existing AR/VR/GEO/3D Semantic Runtime panel includes a **cross-artwork
   continuation** section when the focus is a reviewed artwork. The same runtime
   surfaces a grounded comparison question through its existing guide contract.

### Data and verification boundaries

- Input: four reviewed semantic profiles only, from
  `content/semantics/artwork-concepts.json`. This is **not** a semantic migration
  of the full 24-work catalogue.
- Journey definitions and editorial questions:
  `content/semantics/learning-journeys.json`.
- Supporting concept definitions: `content/semantics/concepts.json`.
- Destinations: only previously documented `channel=vr` experiences from
  `content/semantics/experience-links.json` (prefer individual `/vr.html`,
  otherwise existing gallery rooms). No new or speculative route is invented.
- Shared IDs remain unchanged. Existing semantic search, graph, AR hotspots,
  IIIF and VR scene rendering remain available and have no new hard dependency
  on the bridge feature.
- The Semantic Runtime API adds only the optional `journeyBridges` field.
  Its existing `runtimeVersion=2.12` is deliberately retained for compatibility.

### Validation before merging

Commands in repository root:

```bash
node --test tests/semantic/immersive-journeys.test.mjs
node tests/semantic/validate-semantic.mjs
```

Review `/semantic/?lang=fr`, `lang=en` and `lang=ar` in the feature branch
Preview, including keyboard navigation, RTL, desktop and mobile.

In a supported headset (Meta Quest Browser), open the individual Mona Lisa,
Vermeer and Van Gogh VR scenes. Select a cross-artwork portal once to inspect
the grounded explanation, twice to navigate to the other artwork; check WebXR
session exit, return navigation and pointer selection. Monet's documented link
currently leads to its existing gallery room.

### Deployment rules

Feature branch only; draft pull request; preserve `main` and production.
Do not promote without full regression and headset testing. Preview protection
should remain enabled; do not disable authentication to speed up testing.

### Future increments

- Curate and review semantic profiles for the remaining active artworks before
  including them in evidence-based pedagogical journeys.
- Validate museum and location transitions across immersive environments.
- Measure learner performance and accessibility in real teaching sessions;
  any claim of pedagogical effectiveness must be empirically evaluated.
