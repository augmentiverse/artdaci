# ARTDACI Semantic POC V2.5

This folder adds an isolated semantic knowledge layer to ARTDACI without changing the existing media manifests.

## Purpose

The POC demonstrates how ARTDACI can connect artworks through concepts and explicit semantic relations rather than only through pages, artists, or museums.

V2.5 supports:
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

V2.5 uses weighted Jaccard similarity:

`sum(min(weightA, weightB)) / sum(max(weightA, weightB))`

This reduces the influence of generic contextual concepts and gives more importance to defining visual and technical features.

## Semantic paths

In addition to directly shared concepts, the engine detects one-hop bridges such as:

`Sfumato → enables → Visual ambiguity`

or:

`Visible brushwork → expresses → Immediacy`

These paths are shown in the UI to explain why two works can be semantically related even when they do not share exactly the same vocabulary.

## Interactive link graph

V2.5 adds a dependency-free SVG graph to the semantic page.

V2.5 makes the graph the primary navigation surface. The page opens with the current artwork as its central node and displays its highest-weight concepts around it. Selecting a concept recenters the graph and simultaneously updates a compact contextual inspector rather than opening a separate long section.

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

V2.5 begins real linked-data integration while keeping ARTDACI editorial content as the presentation authority.

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

V2.5 adds a clear two-layer graph model:

- **ARTDACI reviewed layer**: local concepts and relations curated by ARTDACI.
- **External proposed layer**: on-demand suggestions from mapped Wikidata and Getty AAT records.

External proposals are never merged silently into the reviewed graph. They are hidden by default and can be overlaid from the contextual inspector. In the visualization they use dashed borders/edges and provider labels.

Getty AAT expansion retrieves broader and narrower thesaurus neighbors through Linked Open Data/SPARQL.

Wikidata expansion retrieves a limited set of structured relations from the mapped entity, including subclass, instance-of, part-of, facet-of and related-item claims when available.

Clicking an external graph node opens the authoritative provider record rather than converting it into an ARTDACI-reviewed node.

## External providers

Memodata / The Integral Dictionary, WordNet, Wikidata, Getty AAT, and museum sources are modeled only as prospective providers.

V2.5 performs no scraping and requires no external semantic API.

External semantic providers must only be activated after their current API access conditions, licensing, attribution requirements and reuse rights have been verified.

## Test URLs

- `/semantic/?artwork=ld01&lang=fr`
- `/semantic/?artwork=ve01&lang=en`
- `/semantic/?artwork=vg01&lang=fr`
- `/semantic/?artwork=mo01&lang=ar`

## Future V2.5 / V2

Possible next steps:
- review concept vocabulary against Getty AAT and other controlled vocabularies;
- connect validated external identifiers without replacing ARTDACI labels;
- expand semantic profiles to the full 32-work collection;
- add two-hop graph traversal where it improves explanation;
- expose semantic helpers to VR / AR / GEO experiences;
- connect the knowledge graph to an ARTDACI conversational guide.


## Public reader mode and future curation

V2.5 deliberately removes all approve/reject/review controls from the public semantic page.

For readers, Getty AAT and Wikidata remain an **exploration layer**:
- external nodes are hidden by default;
- users may display them in the graph;
- external nodes remain visually distinct from ARTDACI-reviewed nodes;
- clicking an external node opens the authoritative source record;
- no reader action changes the ARTDACI knowledge base.

A future curator-only route such as `/semantic/admin/` may reuse `schema/semantic-review-item.schema.json` for controlled editorial promotion of external proposals. This workflow is intentionally not exposed in the reader experience.


## Cultural Knowledge Graph

V2.5 extends the semantic layer beyond Artwork ↔ Concept relationships.

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

V2.5 adds a server-side Linked Art JSON-LD representation for ARTDACI artworks, cultural entities and concepts.

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

V2.5 adds a focused IIIF pilot for the Mona Lisa (`ld01`) without changing the compact page layout.

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

V2.5 extends the image-region pilot from the Mona Lisa to all four semantic pilot artworks:

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

V2.5 adds a distinct iconographic layer so that ARTDACI can separate **what is represented** from **how it is painted**.

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

V2.5 turns the semantic graph into a transversal navigation layer across ARTDACI experiences.

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

V2.5 adds a proprietary pedagogical layer that is intentionally distinct from factual, taxonomic, and external linked-data relations.

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

V2.5 upgrades the compact keyword search into a trilingual natural-language semantic query layer.

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

V2.5 also adds an optional server adapter:

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
