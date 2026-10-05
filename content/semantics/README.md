# ARTDACI Semantic POC V2.11

This folder adds an isolated semantic knowledge layer to ARTDACI without changing the existing media manifests.

## Purpose

The POC demonstrates how ARTDACI can connect artworks through concepts and explicit semantic relations rather than only through pages, artists, or museums.

V2.11 supports:
- a trilingual FR / EN / AR concept graph;
- 50 curated concepts;
- eight relation types: broader, narrower, related, enables, expresses, contrastsWith, associatedWith, dependsOn;
- weighted artwork-to-concept assertions;
- an interactive glossary;
- graph-neighborhood exploration;
- semantic search across concept labels and definitions;
- weighted related-artwork ranking;
- explainable semantic paths between artworks;
- an interactive SVG link graph centered on the current artwork or selected concept;
- concept-family filters and click-to-recenter exploration without external graph libraries;
- a future path toward semantic search, AR, VR, GEO, and an ARTDACI guide.

## Separation of responsibilities

Existing media manifests remain responsible for physical and digital assets such as images, audio, video, 3D models, and AR targets.

The semantic layer is responsible for:
- concept IDs;
- labels and definitions;
- typed concept relationships;
- weighted artwork-to-concept assertions;
- multilingual presentation;
- semantic similarity and explanatory paths;
- provenance and future external semantic providers.

## Pilot artworks

- `ld01` — Mona Lisa
- `ve01` — Girl with a Pearl Earring
- `vg01` — Self-Portrait, canonical ARTDACI target: 1889, Musée d’Orsay
- `mo01` — Impression, Sunrise

Important: the current `main` media/content files still contain an older 1887 Van Gogh self-portrait reference. This POC does not reuse that image and records `vg01` as the intended 1889 Musée d’Orsay version.

## Files

- `content/semantics/concepts.json` — concept graph and relation vocabulary
- `content/semantics/artwork-concepts.json` — weighted artwork semantic profiles
- `content/semantics/sources.json` — provenance policy and providers
- `schema/semantic-concept.schema.json` — concept schema
- `schema/artwork-semantic-profile.schema.json` — artwork semantic profile schema
- `scripts/semantics/semantic-store.mjs` — data access, search, weighted similarity, semantic paths
- `scripts/semantics/semantic-ui.mjs` — trilingual exploration UI
- `semantic/index.html` — isolated POC route
- `tests/semantic/validate-semantic.mjs` — dependency-free validation

## Weighted assertions

Each artwork now distinguishes:
- `core` concepts: defining concepts of the work;
- `supporting` concepts: important but not defining;
- `contextual` concepts: material, support, or contextual descriptors.

Each assertion carries a weight between 0 and 1.

## Related-artwork score

V2.10 uses weighted Jaccard similarity:

`sum(min(weightA, weightB)) / sum(max(weightA, weightB))`

This reduces the influence of generic contextual concepts and gives more importance to defining visual and technical features.

## Semantic paths

In addition to directly shared concepts, the engine detects one-hop bridges such as:

`Sfumato → enables → Visual ambiguity`

or:

`Visible brushwork → expresses → Immediacy`

These paths are shown in the UI to explain why two works can be semantically related even when they do not share exactly the same vocabulary.

## Interactive link graph

V2.10 adds a dependency-free SVG graph to the semantic page.

V2.10 makes the graph the primary navigation surface. The page opens with the current artwork as its central node and displays its highest-weight concepts around it. Selecting a concept recenters the graph and simultaneously updates a compact contextual inspector rather than opening a separate long section.

Filters can show or hide:
- periods;
- movements;
- genres;
- techniques;
- visual concepts;
- media;
- supports.

The graph intentionally limits the visible neighborhood rather than rendering the full 50-concept / 204-relation network at once. Artwork switching, search, graph filters, concept definitions, and related relations are now grouped into one compact workspace. The detailed semantic profile is collapsed by default, and related artworks use a dense card strip. This reduces vertical scrolling while preserving access to the full information.

## External source integration

V2.10 begins real linked-data integration while keeping ARTDACI editorial content as the presentation authority.

### Wikidata

Status: active.

ARTDACI uses Wikidata persistent Q identifiers and a Vercel server-side adapter to retrieve multilingual labels, descriptions, aliases, and Getty AAT identifiers when present.

Wikidata structured data is released under CC0 1.0.

### Getty Art & Architecture Thesaurus (AAT)

Status: active.

ARTDACI stores verified AAT identifiers locally and uses the Getty Linked Open Data / SPARQL service for live term and scope-note retrieval. Getty XML web services are not used because Getty has discontinued those services.

Getty Vocabulary data is available under ODC-By 1.0. The ARTDACI UI preserves Getty attribution when Getty data is displayed.

### Memodata / The Integral Dictionary

Status: adapter disabled, contact required.

Sensagent/Memodata still advertises XML/content services, but no sufficiently clear current public API and reuse license was verified on 2026-10-04. ARTDACI therefore does not scrape or ingest Memodata content automatically. The provider remains represented in the architecture so it can be activated after explicit access and reuse terms are confirmed.

### Initial verified mappings

Artwork mappings:
- ld01 -> Wikidata Q12418
- ve01 -> Wikidata Q185372
- vg01 -> Wikidata Q3630735
- mo01 -> Wikidata Q86013499

Initial concept mappings cover Renaissance, Baroque, Impressionism, Post-Impressionism, portrait, self-portrait, seascape/marine art, sfumato, glazing, oil painting, and canvas.

Files:
- `content/semantics/external-mappings.json`
- `scripts/semantics/external-sources.mjs`
- `api/semantic-source.js`

## External graph expansion

V2.10 adds a clear two-layer graph model:

- **ARTDACI reviewed layer**: local concepts and relations curated by ARTDACI.
- **External proposed layer**: on-demand suggestions from mapped Wikidata and Getty AAT records.

External proposals are never merged silently into the reviewed graph. They are hidden by default and can be overlaid from the contextual inspector. In the visualization they use dashed borders/edges and provider labels.

Getty AAT expansion retrieves broader and narrower thesaurus neighbors through Linked Open Data/SPARQL.

Wikidata expansion retrieves a limited set of structured relations from the mapped entity, including subclass, instance-of, part-of, facet-of and related-item claims when available.

Clicking an external graph node opens the authoritative provider record rather than converting it into an ARTDACI-reviewed node.

## External providers

Memodata / The Integral Dictionary, WordNet, Wikidata, Getty AAT, and museum sources are modeled only as prospective providers.

V2.10 performs no scraping and requires no external semantic API.

External semantic providers must only be activated after their current API access conditions, licensing, attribution requirements and reuse rights have been verified.

## Test URLs

- `/semantic/?artwork=ld01&lang=fr`
- `/semantic/?artwork=ve01&lang=en`
- `/semantic/?artwork=vg01&lang=fr`
- `/semantic/?artwork=mo01&lang=ar`

## Future V2.10 / V2

Possible next steps:
- review concept vocabulary against Getty AAT and other controlled vocabularies;
- connect validated external identifiers without replacing ARTDACI labels;
- expand semantic profiles to the full 32-work collection;
- add two-hop graph traversal where it improves explanation;
- expose semantic helpers to VR / AR / GEO experiences;
- connect the knowledge graph to an ARTDACI conversational guide.


## Public reader mode and future curation

V2.10 deliberately removes all approve/reject/review controls from the public semantic page.

For readers, Getty AAT and Wikidata remain an **exploration layer**:
- external nodes are hidden by default;
- users may display them in the graph;
- external nodes remain visually distinct from ARTDACI-reviewed nodes;
- clicking an external node opens the authoritative source record;
- no reader action changes the ARTDACI knowledge base.

A future curator-only route such as `/semantic/admin/` may reuse `schema/semantic-review-item.schema.json` for controlled editorial promotion of external proposals. This workflow is intentionally not exposed in the reader experience.


## Cultural Knowledge Graph

V2.10 extends the semantic layer beyond Artwork ↔ Concept relationships.

New entity types:
- `artist`
- `museum`
- `place`
- `subject`
- `event`

The pilot graph contains 20 cultural entities and 31 explicit cultural relations.

Examples:
- `ld01 -> createdBy -> artist.leonardo-da-vinci`
- `ld01 -> heldBy -> museum.louvre`
- `museum.louvre -> locatedIn -> place.paris`
- `ve01 -> createdBy -> artist.johannes-vermeer`
- `artist.johannes-vermeer -> associatedWithPlace -> place.delft`
- `mo01 -> associatedWithPlace -> place.le-havre`
- `mo01 -> creationEvent -> event.creation-mo01`

Artists and museums are aligned with Getty ULAN and Wikidata where verified. Places are aligned with Getty TGN and Wikidata where verified. Le Havre currently uses Wikidata only until a precise TGN record is confirmed.

The public graph treats these entities exactly like concepts for navigation: clicking an artist, museum, place, subject or event recenters the graph on that node.

### Getty vocabulary coverage

- AAT: art concepts, techniques, genres, materials and supports
- ULAN: artists, people, museums and repositories
- TGN: geographic places
- Wikidata: cross-domain linked identifiers and multilingual descriptions

ARTDACI remains the pedagogical presentation layer; external authority records enrich identity and interoperability rather than replacing the ARTDACI labels.


## Linked Art interoperability

V2.10 adds a server-side Linked Art JSON-LD representation for ARTDACI artworks, cultural entities and concepts.

Endpoint:

`/api/linked-art?kind=<artwork|entity|concept>&id=<ARTDACI-ID>&lang=<fr|en|ar>`

Examples:
- `/api/linked-art?kind=artwork&id=ld01&lang=fr`
- `/api/linked-art?kind=entity&id=artist.leonardo-da-vinci&lang=en`
- `/api/linked-art?kind=entity&id=place.paris&lang=fr`
- `/api/linked-art?kind=concept&id=technique.sfumato&lang=fr`

The endpoint:
- uses the official Linked Art JSON-LD context `https://linked.art/ns/v1/linked-art.json`;
- responds with the Linked Art profile media type;
- supports `GET`, `HEAD` and `OPTIONS`;
- gives ARTDACI entities stable canonical semantic URIs under `https://artdaci.com/api/linked-art`;
- exposes Wikidata and Getty identifiers through `equivalent`;
- represents artworks as `HumanMadeObject`;
- represents artists as `Person`, museums as `Group`, places as `Place`, subjects/concepts as `Type`, and cultural events as `Activity`;
- represents artwork production with `produced_by`, `carried_out_by`, `timespan`, `took_place_at` and `technique` when the ARTDACI graph contains the required evidence;
- exposes the holding museum with `current_custodian` and its city with `current_location` when known.

The reader UI provides a compact **Linked Art JSON-LD** link in the contextual source panel. This is an interoperability surface, not a replacement for the reader-oriented ARTDACI graph.


## IIIF semantic image regions

V2.10 adds a focused IIIF pilot for the Mona Lisa (`ld01`) without changing the compact page layout.

### Pilot model

The pilot uses a stable virtual Canvas of **1000 × 1453**. Semantic regions are defined once in `content/semantics/image-annotations.json` and can be scaled to any displayed image size.

Four initial regions are provided:
- face;
- hands;
- left landscape;
- right landscape.

Each region contains:
- trilingual label and pedagogical description;
- `xywh` coordinates in the virtual Canvas;
- one or more ARTDACI semantic concept IDs.

### IIIF Presentation 3

Static interoperable resources:
- `/iiif/ld01/manifest.json`
- `/iiif/ld01/annotations.json`

The Manifest paints the canonical portrait Mona Lisa asset onto a IIIF Canvas and references an external AnnotationPage. Each semantic annotation targets a Canvas region with `#xywh=x,y,w,h` and contains:
- multilingual textual comments;
- linked semantic tags pointing to ARTDACI Linked Art concept URIs.

This follows the IIIF Presentation 3 / W3C Web Annotation pattern for regional annotations and external semantic tagging.

### Reader experience

The artwork inspector exposes an **Explore image** action. It opens a native modal dialog instead of adding vertical page length. The painting is shown with interactive overlays; selecting a region displays its explanation and associated concepts. Selecting a concept closes the image explorer and recenters the ARTDACI semantic graph on that concept.

The IIIF Manifest remains accessible as a technical/interoperability link, while the image explorer is the reader-facing feature.


## IIIF Pilot Collection

V2.10 extends the image-region pilot from the Mona Lisa to all four semantic pilot artworks:

- `ld01` — Mona Lisa;
- `ve01` — Girl with a Pearl Earring;
- `vg01` — Van Gogh Self-Portrait, 1889;
- `mo01` — Impression, Sunrise.

Each artwork currently exposes four pedagogical semantic regions, for a total of **16 regions**.

The Van Gogh pilot explicitly uses the canonical 1889 asset:
`/assets/artists/vincent-van-gogh/collection/autoportrait-vangogh.webp`.

### IIIF Collection

A Presentation API 3 Collection groups the pilot corpus:

`/iiif/collection.json`

It references the four manifests:

- `/iiif/ld01/manifest.json`
- `/iiif/ve01/manifest.json`
- `/iiif/vg01/manifest.json`
- `/iiif/mo01/manifest.json`

Each manifest references its own external AnnotationPage containing four regional annotations with trilingual commentary and semantic concept links.

The existing **Explore image** interaction automatically appears for every artwork that has an annotation profile, so no separate reader workflow is needed for the additional pilot works.


## Iconography and depicted subjects

V2.10 adds a distinct iconographic layer so that ARTDACI can separate **what is represented** from **how it is painted**.

The pilot contains **16 iconographic subjects, motifs, and depicted objects**, linked to the four artworks and to twelve IIIF image regions.

Three node types are used:
- `iconographic-subject` — general represented subject matter;
- `motif` — a meaningful recurring or artwork-specific visual motif;
- `depicted-object` — an identifiable represented object or body part.

Examples include:
- adult woman;
- young woman;
- artist self-portrait;
- human hand;
- sunrise;
- seascape;
- harbor;
- rowing boat;
- pearl earring;
- headscarf;
- misty industrial harbor.

### Iconclass alignment

ARTDACI stores selected Iconclass notations only when the mapping is sufficiently clear. Verified pilot examples include:
- `31D15` — adult woman;
- `31D13` — young woman / maiden;
- `31D14` — adult man;
- `48B3` — portrait / self-portrait of artist;
- `31A2245` — hand;
- `31A221(+822)` — female head;
- `24A1` — sunrise;
- `25H23` — sea / seascape;
- `25H2` — landscapes with waters;
- `46C223` — harbor;
- `46C232` — rowing boat;
- `25I` — landscape with man-made constructions.

Artwork-specific motifs such as the pearl earring or the misty industrial harbor remain ARTDACI editorial nodes when no precise Iconclass notation has been verified.

### Iconclass live provider

Iconclass is registered as a live linked-data provider. For mapped subjects, ARTDACI retrieves the linked record on demand through the server adapter and provides the authoritative Iconclass page.

No bulk vocabulary ingestion is performed. Because the current public Iconclass Terms page does not state a reusable data license, ARTDACI treats Iconclass as a linked authority rather than assuming unrestricted reuse rights.

### IIIF integration

Twelve IIIF regions now have iconographic links in addition to formal semantic concepts. In the image explorer, readers can move from a visual region directly to a subject such as **hand**, **sunrise**, **harbor**, **rowing boat**, or **pearl earring**, then recenter the knowledge graph on that subject.


## Cross-media semantic navigation

V2.10 turns the semantic graph into a transversal navigation layer across ARTDACI experiences.

A dedicated mapping file, `content/semantics/experience-links.json`, links semantic node IDs to real ARTDACI destinations. The pilot maps **13 semantic nodes to 41 experiences** across:

- Web;
- image-tracked AR;
- spatial AR;
- WebXR / VR;
- GEO;
- 3D;
- the living book;
- video;
- external VR worlds.

Examples:
- `ld01` → Salle des États GEO, image AR, spatial AR, individual VR, Louvre VR, Living Book;
- `museum.louvre` → Louvre GEO, Salle des États, Louvre VR gallery, 3D/AR museum viewer, Marble VR world;
- `place.paris` → ARTDACI GEO Paris and Louvre GEO;
- `artist.vincent-van-gogh` → Van Gogh 3D guide, Van Gogh VR room, Bedroom 3D;
- `technique.sfumato` → Mona Lisa painting-process video and Salle des États context.

### Masters Hub guide deep links

The Masters Hub now accepts a public `guide` query parameter:

- `?guide=leonardo`
- `?guide=vermeer`
- `?guide=van-gogh`
- `?guide=monet`

A deep-linked guide automatically selects the corresponding artist zone and loads the 3D guide when the Hub is ready. The language switch preserves the guide parameter.

### Reader experience

Nodes that have immersive destinations display a small experience marker in the SVG graph. Selecting the node reveals a compact horizontal **ARTDACI Experiences** strip in the inspector. The strip is horizontally scrollable to avoid making the semantic page vertically longer.

The semantic graph therefore acts as the navigation backbone between the knowledge graph and ARTDACI’s Web, AR, VR, GEO, 3D, video, and book surfaces.


## ARTDACI pedagogical relations

V2.10 adds a proprietary pedagogical layer that is intentionally distinct from factual, taxonomic, and external linked-data relations.

The pilot contains **24 pedagogical relations** across six learning intentions:

- `helpsUnderstand` — one concept or technique helps explain another;
- `observeIn` — a concept or technique can be observed in a precise IIIF region;
- `compareWith` — two works or concepts are useful to compare;
- `contrastForLearning` — a contrast is deliberately introduced to clarify a distinction;
- `buildsOn` — a historical or conceptual node provides a learning path toward another;
- `fromDetailToConcept` — a visual detail becomes the entry point to a broader concept.

Each pedagogical relation contains:
- source and target IDs;
- a trilingual pedagogical rationale;
- a trilingual observation question.

Examples include:
- sfumato → helps understand → softened edges;
- sfumato → observe in → Mona Lisa face;
- Mona Lisa → compare with → Girl with a Pearl Earring;
- portrait → contrast for learning with → self-portrait;
- visible brushwork → helps understand → materiality;
- Van Gogh Self-Portrait → compare with → Impression, Sunrise;
- broken color → helps understand → optical perception;
- Vermeer pearl region → from detail to concept → optical perception.

### Graph behavior

A **Pedagogy** toggle controls a lightweight overlay. At most three pedagogical neighbors are added around the current graph center, and only when they are not already visible through factual relations. Pedagogical edges use a dedicated dashed style.

This prevents the graph from becoming dense while still making ARTDACI’s learning logic explicit.

### Inspector behavior

The inspector shows a horizontally scrollable ARTDACI pedagogy strip. Each card gives:
- the pedagogical relation;
- the target;
- a short rationale;
- an observation question.

### IIIF integration

Pedagogical relations may target an image region. Selecting such a relation opens the appropriate IIIF image explorer and region. Region URLs can also be deep-linked with:

`?artwork=ld01&lang=fr&region=ld01.face`

This enables routes such as:

`Sfumato → Observe in → Mona Lisa face → observation question`.

The pedagogical layer is editorial ARTDACI content. It is not presented as a Getty, Wikidata, Iconclass, CIDOC CRM, or Linked Art assertion.


## Natural-language hybrid semantic search

V2.10 upgrades the compact keyword search into a trilingual natural-language semantic query layer.

The pilot recognizes five query intentions:

- observation — e.g. “Où observer le sfumato dans La Joconde ?”;
- comparison — e.g. “Comparer Van Gogh et Monet”;
- immersive experience — e.g. “Quelles expériences VR pour Van Gogh ?”;
- location — e.g. “Quels musées et œuvres sont liés à Paris ?”;
- explanation — e.g. “Pourquoi la touche visible donne-t-elle une sensation de matière ?”.

The query model contains **23 curated semantic aliases** across FR/EN/AR and clickable example questions.

### Hybrid ranking

The default search runs entirely in the browser and combines:

- recognized multilingual aliases;
- token overlap;
- direct graph proximity;
- ARTDACI pedagogical relations;
- cultural and iconographic links;
- immersive experience availability;
- a lightweight **96-dimensional local vector fingerprint** based on token and character features.

The local vector layer is deliberately small and dependency-free. It is a fallback representation, not a learned neural language model.

### Optional neural embeddings

V2.10 also adds an optional server adapter:

- `/api/semantic-embeddings`
- `scripts/semantics/embedding-client.mjs`

When configured, the client reranks the local hybrid results with neural embedding cosine similarity. When it is not configured or fails, the reader transparently keeps the local graph + vector ranking.

Configuration is provider-neutral and uses:

- `ARTDACI_EMBEDDING_ENDPOINT`
- `ARTDACI_EMBEDDING_MODEL`
- `ARTDACI_EMBEDDING_API_KEY` (optional if the selected provider does not require it)

No neural embedding provider is enabled by default in the POC.

### Search result types

The same query can return:

- graph nodes — artwork, concept, artist, museum, place, iconographic subject;
- IIIF regions — especially for “where can I observe…” questions;
- direct ARTDACI experiences — AR, VR, GEO, 3D, book, or video.

This makes search a second navigation entry point into the same semantic and immersive continuum already exposed by the graph.


## Semantic Runtime

V2.10 turns the semantic knowledge layer into a shared runtime for ARTDACI immersive surfaces.

### Context resolution

The runtime is exposed through:

- `/api/semantic-runtime`
- `scripts/semantics/semantic-runtime-client.mjs`
- `content/semantics/runtime-contexts.json`

A client can resolve a semantic context with:

`nodeId | slug + resourceType + environment + lang + optional regionId`

The current environments are:

- `web`;
- `book`;
- `ar`;
- `vr`;
- `geo`;
- `3d`.

Each environment defines a different priority order, preferred experience channels, and output limits. This means that the same semantic node can generate a different contextual response depending on whether the reader is on the Web, scanning the printed book in AR, navigating a VR scene, or exploring a museum in GEO.

### Runtime output

The runtime response contains:

- `focus` — resolved semantic node;
- `hotspots` — IIIF regions with normalized 0–1 geometry for immersive overlays;
- `concepts` — prioritized concepts for the current artwork or region;
- `iconography` — depicted subjects and motifs;
- `pedagogy` — ARTDACI learning relations and observation questions;
- `experiences` — immersive destinations ranked by environment;
- `next` — compact semantic or immersive continuation paths.

Normalized hotspot geometry is derived from the stable IIIF virtual Canvas, so the same region definitions can be reused by Web, MindAR, WebXR, and future spatial interfaces.

### First immersive consumers

V2.10 integrates the shared runtime into four existing surfaces:

1. **Image AR** — `ar.html`
2. **Individual VR / WebXR** — `vr.html`
3. **ARTDACI GEO Louvre** — `geo/remote.html`
4. **Masters Hub 3D guides** — `geo/masters-hub.html?guide=...`

The semantic runtime is non-blocking: if its API cannot load, the AR/VR/GEO/3D experience continues normally.

Each supported surface displays a compact **Semantic** button. Its contextual panel exposes hotspots, concepts, a pedagogical question, continuation links, and a link back to the full semantic graph.

### Deep links

The Web semantic reader now supports semantic node deep links:

`/semantic/?lang=fr&node=artist.vincent-van-gogh`

and keeps the existing region deep links:

`/semantic/?artwork=ld01&lang=fr&region=ld01.face`

This makes the navigation bidirectional: immersive environments can enter the knowledge graph at the current semantic node, while the graph can route back into AR/VR/GEO/3D experiences.

The Semantic Runtime does not create new factual assertions. It resolves and prioritizes existing ARTDACI semantic, iconographic, pedagogical, IIIF, and experience data according to the current environment.


## Semantic hotspots in image-tracked AR

V2.10 projects the existing IIIF semantic regions directly into the MindAR image-target coordinate system.

The Semantic Runtime now exposes a `spatial` block containing:
- the source IIIF Canvas width and height;
- the image aspect ratio;
- a MindAR target width normalized to `1`;
- the corresponding target height derived from the Canvas aspect ratio.

Each hotspot already contains normalized `x`, `y`, `width`, and `height` values. The AR hotspot module converts these values into target-local coordinates centered on the tracked painting.

### Runtime behavior

The new module:

`scripts/semantics/semantic-ar-hotspots.mjs`

creates, for each IIIF region:
- a transparent raycastable plane;
- a visible semantic outline;
- a compact multilingual label;
- a stable target-local position that follows the tracked image.

Hotspot geometry is rendered with depth testing disabled so the semantic overlay remains visible above the 3D layer without changing the underlying artwork or model.

### Direct interaction

When the user touches a semantic region:
1. the selected region is visually highlighted;
2. the ordinary model-rotation gesture is suppressed for that tap;
3. ARTDACI requests region-specific context from `/api/semantic-runtime`;
4. the information panel displays the region description;
5. up to five associated concepts are shown;
6. the most relevant ARTDACI pedagogical observation question is displayed.

A **Regions / Régions / المناطق** control in the AR dock lets the user show or hide the semantic overlay.

The hotspot layer is non-blocking. If semantic data or the runtime API is unavailable, image tracking, 3D content, audio, video, and existing AR interaction continue normally.

### Current pilot

The system activates only when the current artwork has IIIF semantic regions. The existing four-region pilots for Mona Lisa, Girl with a Pearl Earring, Van Gogh Self-Portrait (1889), and Impression, Sunrise are therefore immediately compatible at the semantic-data level; only artworks currently routed through the image-AR viewer can display them in camera.

This is the first step toward using the same regions for AR labels, contextual narration, semantic animations, and future WebXR spatial annotations.


## Semantic constellation in VR / WebXR

V2.10 extends the shared Semantic Runtime into the individual VR viewer with an in-world semantic constellation.

The new module:

`scripts/semantics/semantic-vr-constellation.mjs`

uses the contextual concepts already returned by `/api/semantic-runtime?environment=vr`.

### In-world behavior

Up to five priority concepts are arranged around the 3D artwork as compact spatial nodes. The constellation follows the same `modelRoot`, so moving, rotating, or resizing the artwork also preserves the semantic context around it.

Each node contains:
- a raycastable semantic target;
- a visible ring;
- a multilingual concept label.

A floating information card displays:
- the selected concept;
- its definition;
- the most relevant ARTDACI pedagogical observation question when available.

### Controller interaction

In immersive VR, controller selection now follows this priority:

1. semantic concept node;
2. artwork/model grab.

This prevents a semantic selection from accidentally moving the 3D model. All descendants of the semantic constellation are explicitly excluded from the model-grab raycast.

The same semantic nodes are selectable with the mouse or pointer in the normal desktop VR preview, making the feature testable without entering a headset.

### Visibility

A **Notions / Concepts / المفاهيم** control is added to the VR toolbar. It toggles the in-world constellation without disabling the existing Semantic Runtime panel.

The semantic constellation is non-blocking: if the runtime API or semantic data is unavailable, the existing VR model, manipulation controls, and WebXR session continue normally.

V2.10 therefore establishes a shared semantic interaction pattern across immersive modes:

`IIIF region → AR hotspot → concept → VR constellation → pedagogical question → semantic graph / next experience`.

This makes the knowledge graph not only a Web navigation structure but an active spatial layer inside ARTDACI's immersive interfaces.


## Immersive pedagogical path and semantic portals

V2.10 adds an explicit contextual learning path generated by the Semantic Runtime:

`Observe → Understand → Compare → Experience`.

The runtime response now includes a `learningPath` block. Its steps are derived only from already reviewed ARTDACI data:

- **Observe** prioritizes an `observeIn` / `fromDetailToConcept` pedagogical relation toward an IIIF region, or otherwise the first contextual hotspot.
- **Understand** points to the highest-priority contextual concept and its definition.
- **Compare** uses an ARTDACI `compareWith` or `contrastForLearning` relation when one is available.
- **Experience** points to the highest-ranked immersive destination for the current environment.

Each step carries a localized action label, target label, short explanation, target kind, and destination URL. Missing stages are omitted rather than fabricated.

### VR semantic portals

The individual WebXR viewer renders up to four learning-path steps as portal-shaped spatial objects below the semantic concept constellation.

The portal interaction deliberately uses two activations:

1. the first selection focuses the portal and explains the next pedagogical step in the in-world information panel;
2. selecting the same portal again opens its destination.

This prevents an accidental controller click from abruptly leaving an immersive scene. When a portal is activated during an immersive WebXR session, the viewer first requests the current XR session to end and then performs same-tab navigation.

Portal destinations can lead to:
- a precise IIIF semantic region;
- a semantic concept;
- a comparison target;
- an ARTDACI AR / VR / GEO / 3D / video / book experience.

Concept nodes and learning portals remain part of the same non-blocking semantic layer. If the Semantic Runtime is unavailable, the underlying VR viewer continues normally.

V2.10 therefore turns the semantic constellation from an explanatory overlay into a navigable pedagogical sequence while preserving ARTDACI's distinction between factual graph relations, editorial pedagogy, and immersive destinations.


## Adaptive learning path across immersive surfaces

V2.10 reuses the Runtime `learningPath` in the shared immersive Semantic panel, so the same contextual sequence is now visible in image AR, individual VR, ARTDACI GEO, and Masters Hub 3D guides.

The panel displays up to four compact, horizontally scrollable steps:

`Observe → Understand → Compare → Experience`.

Each step is a real link produced by the Semantic Runtime from reviewed ARTDACI data. A step may open an IIIF image region, a concept in the graph, a comparison target, or an immersive destination ranked for the current environment.

This layer is deliberately shared rather than reimplemented in each viewer:
- `scripts/semantics/semantic-runtime-client.mjs` renders the learning path;
- `styles/semantic-runtime.css` provides the compact stepper;
- AR, VR, GEO, and Masters Hub all consume the same component.

The VR in-world portals remain available. The V2.10 panel therefore provides a consistent 2D control surface while the VR constellation provides the spatial equivalent.

As with the rest of the Semantic Runtime, this remains non-blocking: if semantic data cannot load, the underlying AR/VR/GEO/3D experience continues normally.


## Grounded conversational guide

V2.11 connects the existing ARTDACI ChatGPT visitor guide to the Semantic Runtime without adding an API key or a second conversational backend.

The Semantic Runtime now exposes a `guide` block with up to four trilingual starter questions derived from the contextual learning path. Typical intents are:
- observe a precise semantic region;
- understand the most relevant concept;
- compare with a pedagogically linked work or concept;
- continue toward an ARTDACI immersive experience.

The shared visitor guide resolves the current semantic focus before preparing its ChatGPT link:
- image AR and individual VR use the current `painting` slug;
- ARTDACI GEO remote exploration uses `museum.louvre`;
- Masters Hub deep-linked artist guides use the current artist slug.

The generated guide prompt includes only a compact ARTDACI context: focus, top concepts, semantic image regions, one pedagogical question, the adaptive learning path, and ranked immersive experiences. It explicitly instructs the conversational guide to distinguish factual graph information from ARTDACI pedagogical interpretation and not to invent unsupported relations.

If the Semantic Runtime is unavailable, the guide falls back to the previous generic ARTDACI museum-guide prompt. The immersive experience therefore remains non-blocking.

The same guide control is now available on AR, VR, GEO remote exploration, and Masters Hub. No production merge is implied by this POC branch.


## Main-site entry points

The semantic layer is now discoverable from the three ARTDACI homepages (FR / EN / AR) through a global ARTDACI Semantic action.

The catalogue also exposes contextual semantic links only for the four artworks currently supported by the pilot graph:
- Mona Lisa (`ld01`);
- Girl with a Pearl Earring (`ve01`);
- Van Gogh Self-Portrait 1889 (`vg01`);
- Impression, Sunrise (`mo01`).

Unsupported artworks do not receive a semantic action, so the main catalogue never advertises a semantic destination that does not exist.
