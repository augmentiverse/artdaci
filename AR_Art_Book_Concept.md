# Augmented Reality Art Book Concept

## Working Title

**Masterpieces Alive: The Augmented Museum Book**

## Core Vision

Masterpieces Alive is a premium coffee-table art book that behaves like three products at once:

- a museum-quality printed catalogue,
- a browser-based augmented reality exhibition,
- an AI-powered guide for personal, classroom, library, and museum use.

Each spread presents one canonical painting as a complete art-historical entry. When the reader views the printed artwork through a phone, tablet, or AR glasses, the image becomes an anchor for a spatial experience: the painting rises from the page as a framed 3D object, layers can be explored, hotspots reveal scholarship, and an AI museum guide answers questions in natural language.

The design philosophy is restrained, elegant, and curatorial. The AR should feel like a private museum opening in the room, not like a game layered on top of art.

## Product Principles

1. **The printed book must stand alone.** It should remain valuable without a device.
2. **The AR must clarify, not distract.** Every interaction should deepen looking, context, or memory.
3. **Respect the artwork.** Animation and reconstruction should be subtle, labeled, and reversible.
4. **Use the page as the portal.** The printed reproduction is the primary image target.
5. **Design for institutions.** Content must support schools, universities, museums, libraries, accessibility programs, and multilingual audiences.
6. **Build for scale.** Adding new paintings should be a content operation, not an application rewrite.

## Book Format

- Format: oversized coffee-table book, approximately 30 x 36 cm.
- Paper: matte archival stock with controlled reflectivity for camera recognition.
- Binding: lay-flat binding to keep image targets planar.
- Reproductions: color-managed, high-resolution, museum-catalogue quality.
- AR markers: image-target based, with optional discreet QR code per spread.
- Typography: elegant serif for essays, neutral sans-serif for metadata and labels.
- Layout mood: premium museum catalogue, generous margins, quiet hierarchy, precise captions.

## Reader Modes

### 1. Print Mode

The reader uses the book like a traditional art encyclopedia. Each entry includes title, artist, date, movement, context, biography, analysis, symbolism, technique, influence, facts, timeline, map, and references.

### 2. AR Mode

The reader opens the web experience, points the camera at the printed painting, and unlocks a spatial interpretation layer.

### 3. Guided Learning Mode

Teachers, docents, or parents select a structured tour, quiz, vocabulary list, or curriculum sequence.

### 4. Museum Mode

Institutions can customize labels, languages, tours, accessibility layers, and local exhibition links.

## First Integrated Painting: Mona Lisa

The book now opens with **Leonardo da Vinci's Mona Lisa** as the first complete painting experience. This first spread acts as the flagship demonstration of the product: the printed reproduction is the image target, and the supplied GLB model becomes the first 3D object that rises from the page.

### First Spread Asset Binding

- Painting: **Mona Lisa**
- Artist: **Leonardo da Vinci**
- Date: **c. 1503-1519**
- Movement: **High Renaissance**
- Museum: **Musee du Louvre, Paris**
- Printed image target: `assets/paintings/mona-lisa/images/mona-lisa.jpg`
- AR model: `assets/paintings/mona-lisa/mona-lisa.glb`
- Data record: `content/paintings/mona-lisa.json`
- Book order: `1`
- Image target ID: `target-001-mona-lisa`

### First AR Moment

When the reader scans the Mona Lisa reproduction, the system recognizes the printed image and loads `content/paintings/mona-lisa.json`. The painting emerges from the page as the supplied 3D model, then presents a restrained ring of hotspots around the face, hands, landscape, and sfumato technique. The first recommended interaction is the **Audio Guide**, followed by **Hidden Details**, **Brushstrokes**, **Lighting**, and **Ask Guide**.

## Table of Contents

### Front Matter

1. Foreword: Why Paintings Still Need Presence
2. How to Use This Book
3. The AR Museum Interface
4. A Short History of Painting
5. Glossary of Art-Historical Terms
6. Timeline of Major Movements
7. Map of Museums and Collections

### Chapter 1: Early Renaissance and Northern Renaissance

1. Leonardo da Vinci, Mona Lisa
2. Giotto, Lamentation
3. Jan van Eyck, Arnolfini Portrait
4. Fra Angelico, Annunciation
5. Botticelli, Primavera
6. Botticelli, The Birth of Venus
7. Leonardo da Vinci, The Last Supper
8. Raphael, The School of Athens
9. Michelangelo, Sistine Chapel Ceiling
10. Albrecht Durer, Self-Portrait

### Chapter 2: High Renaissance, Mannerism, and Venice

11. Giorgione, The Tempest
12. Titian, Assumption of the Virgin
13. Titian, Venus of Urbino
14. Veronese, The Wedding at Cana
15. Tintoretto, The Last Supper
16. Bronzino, Portrait of Eleonora of Toledo
17. El Greco, The Burial of the Count of Orgaz
18. Parmigianino, Madonna with the Long Neck

### Chapter 3: Baroque Drama and Dutch Golden Age

19. Caravaggio, The Calling of Saint Matthew
20. Caravaggio, Judith Beheading Holofernes
21. Artemisia Gentileschi, Judith Slaying Holofernes
22. Rubens, The Descent from the Cross
23. Velazquez, Las Meninas
24. Velazquez, The Surrender of Breda
25. Rembrandt, The Night Watch
26. Rembrandt, The Return of the Prodigal Son
27. Vermeer, Girl with a Pearl Earring
28. Vermeer, The Art of Painting
29. Frans Hals, The Laughing Cavalier
30. Poussin, Et in Arcadia Ego

### Chapter 4: Rococo, Neoclassicism, and Revolution

31. Watteau, Pilgrimage to Cythera
32. Fragonard, The Swing
33. Gainsborough, The Blue Boy
34. Elisabeth Vigee Le Brun, Self-Portrait with Her Daughter
35. David, Oath of the Horatii
36. David, The Death of Marat
37. Ingres, Grande Odalisque
38. Goya, The Third of May 1808
39. Goya, Saturn Devouring His Son

### Chapter 5: Romanticism, Realism, and Modern Life

40. Gericault, The Raft of the Medusa
41. Delacroix, Liberty Leading the People
42. Friedrich, Wanderer above the Sea of Fog
43. Friedrich, The Sea of Ice
44. Turner, The Fighting Temeraire
45. Turner, Rain, Steam and Speed
46. Courbet, The Stone Breakers
47. Millet, The Gleaners
48. Manet, Olympia
49. Manet, A Bar at the Folies-Bergere
50. Whistler, Arrangement in Grey and Black No. 1

### Chapter 6: Impressionism and Post-Impressionism

51. Monet, Impression, Sunrise
52. Monet, Water Lilies
53. Renoir, Dance at Le Moulin de la Galette
54. Degas, The Ballet Class
55. Morisot, The Cradle
56. Cassatt, The Child's Bath
57. Caillebotte, Paris Street; Rainy Day
58. Seurat, A Sunday Afternoon on the Island of La Grande Jatte
59. Cezanne, The Card Players
60. Cezanne, Mont Sainte-Victoire
61. Van Gogh, The Potato Eaters
62. Van Gogh, Sunflowers
63. Van Gogh, The Starry Night
64. Gauguin, Where Do We Come From? What Are We? Where Are We Going?
65. Toulouse-Lautrec, At the Moulin Rouge

### Chapter 7: Symbolism, Expressionism, and Early Modernism

66. Munch, The Scream
67. Klimt, The Kiss
68. Klimt, Portrait of Adele Bloch-Bauer I
69. Ensor, Christ's Entry into Brussels
70. Rousseau, The Dream
71. Matisse, The Joy of Life
72. Matisse, The Red Studio
73. Kandinsky, Composition VII
74. Marc, The Yellow Cow
75. Schiele, Self-Portrait with Physalis

### Chapter 8: Cubism, Futurism, Dada, and Abstraction

76. Picasso, Les Demoiselles d'Avignon
77. Picasso, Guernica
78. Braque, Violin and Candlestick
79. Duchamp, Nude Descending a Staircase, No. 2
80. Malevich, Black Square
81. Mondrian, Composition with Red, Blue and Yellow
82. Klee, Senecio
83. Delaunay, Simultaneous Windows
84. Boccioni, The City Rises

### Chapter 9: Surrealism, Mexican Modernism, and Mid-Century Art

85. de Chirico, The Mystery and Melancholy of a Street
86. Dali, The Persistence of Memory
87. Magritte, The Treachery of Images
88. Miro, The Farm
89. Kahlo, The Two Fridas
90. Rivera, Man at the Crossroads
91. O'Keeffe, Jimson Weed/White Flower No. 1
92. Hopper, Nighthawks
93. Wood, American Gothic
94. Pollock, Autumn Rhythm
95. Rothko, Orange and Yellow

### Chapter 10: Pop, Contemporary, and Global Perspectives

96. Warhol, Marilyn Diptych
97. Lichtenstein, Whaam!
98. Basquiat, Untitled, 1981
99. Hockney, A Bigger Splash
100. Kusama, Infinity Nets

### Back Matter

1. Technical Notes on the AR System
2. Conservation, Imaging, and Digital Ethics
3. Bibliography
4. Museum Index
5. Artist Index
6. Rights and Image Credits

## Standard Page Structure

Each painting receives one double-page spread, with expanded foldout or digital supplements for selected masterpieces.

### Left Page

- Full-bleed or dominant reproduction of the painting.
- Title, artist, date, medium, dimensions, current museum, accession or collection note.
- AR launch instruction and optional QR code.
- Small map showing the artwork's present location.
- Thumbnail timeline with artist life, movement, and major historical events.

### Right Page

- 150-250 word historical context.
- 120-180 word artist biography.
- Detailed artistic analysis.
- Symbolism and iconography.
- Composition analysis with diagram callouts.
- Color palette strip with named dominant colors.
- Perspective, materials, and technique.
- Cultural significance and influence.
- Interesting facts.
- References and further reading.

### Optional Foldout or Digital Companion

- Conservation history.
- X-ray, infrared, and restoration images where rights allow.
- Comparative works.
- Classroom worksheet.
- Curator interview transcript.

## AR Interaction Flow

### Entry

1. Reader scans a QR code or opens the book's web app.
2. The browser requests camera permission.
3. The interface asks the reader to point at a painting.
4. MindAR recognizes the printed reproduction as an image target.
5. The spread loads painting-specific content from the content API.

### Recognition State

- A quiet focus reticle confirms tracking.
- The printed image receives a soft border glow.
- If tracking is weak, the interface gives concise guidance: more light, flatter page, closer camera.

### Painting Emergence

- The painting lifts 3-8 cm above the page.
- A museum-quality frame extrudes around it.
- Subtle parallax gives depth to canvas, stretcher, frame, varnish, and shadows.
- The user can move around the anchored object while the work remains spatially fixed.

### Main AR Menu

Floating icons appear around the painting:

- Artist
- History
- Timeline
- Museum
- Hidden Details
- Documentary
- Audio Guide
- Quiz
- X-ray
- Brushstrokes
- Layers
- Lighting
- Studio
- Ask Guide

Each icon opens a panel or spatial scene. Panels should orbit the artwork without covering the painting unless the user explicitly enters a close-inspection mode.

### Deep Interaction Modes

#### Exploded Painting

The work separates into labeled layers:

- support or panel,
- sketch,
- underpainting,
- pigment layers,
- glazes,
- restoration zones,
- varnish,
- current visible surface.

The user scrubs through layers with a vertical slider or hand gesture.

#### Brushstroke Visualization

Normal maps and displacement maps reveal paint texture. Selected brushstrokes rise subtly in 3D, with labels explaining impasto, glazing, scumbling, pointillism, or flat color fields.

#### Lighting Simulation

The user switches among:

- daylight,
- candlelight,
- museum lighting,
- raking conservation light,
- historically plausible original setting.

Each lighting change includes a note explaining how perception changes.

#### Hidden Details

A magnifying lens reveals:

- pentimenti,
- signatures,
- symbolic objects,
- cracks,
- restoration marks,
- compositional corrections,
- underdrawings where available.

#### X-ray and Infrared Mode

The visible image crossfades into infrared reflectography, x-ray, ultraviolet fluorescence, or conservation photography when those assets exist. If authentic scans are unavailable, the mode should clearly display "interpretive reconstruction" rather than implying documentary evidence.

#### Painter's Studio

A miniature studio reconstructs tools, materials, assistants, lighting, and social context. The reader can tap pigments, brushes, easels, props, or letters to learn how the work may have been produced.

#### Character Animation

For paintings with people, animation remains minimal:

- breathing,
- blinking,
- cloth movement,
- candle flicker,
- atmospheric particles,
- gaze shift.

No comedic movement, speech, or exaggerated dramatization should be used unless part of a separately labeled children's interpretive mode.

#### Guided Storytelling

The audio guide highlights regions of the painting as the narration explains composition, symbolism, chronology, and technique.

#### Spatial Audio

Ambient sound is optional and historically sensitive:

- church resonance,
- market murmur,
- battlefield distance,
- wind,
- water,
- studio silence,
- period music when appropriate.

Ambient sound must never obscure narration or accessibility audio.

#### AI Museum Guide

The guide answers questions such as:

- Why is this figure smiling?
- What does this symbol mean?
- What was happening in the world when this was painted?
- How does this compare with another work in the book?
- What should I look at first?

The guide should cite the book's approved knowledge base and clearly distinguish scholarship, interpretation, and uncertainty.

## UX Journey

### First-Time Reader

1. Opens the book.
2. Sees a simple "Scan to awaken the painting" instruction.
3. Opens the browser-based AR experience.
4. Grants camera permission.
5. Points at the painting.
6. Watches the framed painting emerge.
7. Taps Audio Guide.
8. Uses Hidden Details.
9. Saves the painting to a personal collection.

### Returning Reader

1. Opens web app from home screen or QR code.
2. Selects language and saved preferences.
3. Scans any page.
4. Resumes last mode or starts a guided tour.

### Teacher

1. Opens Educator Dashboard.
2. Selects grade level, language, and lesson duration.
3. Chooses a thematic route: perspective, revolution, portraits, women artists, color, colonial histories, abstraction.
4. Projects teacher view while students scan their own books.
5. Runs quizzes and discussion prompts.
6. Exports participation and assessment data.

### Museum or Library Visitor

1. Uses institution-branded access link.
2. Chooses a tour or accessibility mode.
3. Scans pages or posters.
4. Receives locally relevant museum links and visit information.

## Technical Architecture

### Client Layer

- Browser-based WebAR application.
- MindAR for printed image tracking.
- WebXR for immersive sessions where device support is available.
- Three.js for custom 3D rendering, materials, lighting, animation, and asset management.
- A-Frame for rapid declarative scene composition where appropriate.
- HTML5, CSS, and JavaScript/TypeScript for interface, overlays, media, and accessibility.
- Service worker for offline caching of core book assets.

### Rendering Layer

- GLTF/GLB models for frames, studios, mini museums, props, timelines, and animated reconstructions.
- Physically based materials for frames, canvas, glass, metal, wood, and varnish.
- Texture atlases and compressed textures for mobile performance.
- Level-of-detail assets for low, medium, and high performance devices.
- Web Audio API for spatial audio and narration mixing.

### Content Layer

- Headless CMS or structured content repository.
- Painting records stored as JSON.
- Media records stored in object storage or CDN.
- Rights and license metadata attached to every asset.
- Localization files per language.
- Curriculum metadata for educator mode.

### AI Layer

- Retrieval-augmented AI guide grounded in approved painting records, essays, glossary entries, timelines, and references.
- Institutional moderation policies.
- Age-sensitive answer modes.
- Citation-aware responses.
- Offline fallback to curated FAQ and scripted narration.

### Backend Layer

- Content API for painting metadata, tours, media manifests, quizzes, and localization.
- Asset pipeline for GLB, image, video, audio, and target files.
- Analytics API for anonymized usage events.
- Authentication only for institutional dashboards, teachers, saved collections, or licensed content.
- Multi-user synchronization service using WebRTC or WebSocket rooms for shared AR sessions.

### Deployment Layer

- CDN-hosted static app shell.
- Edge caching for painting manifests and compressed media.
- Versioned content releases.
- Feature flags for experimental AR modes.
- Progressive Web App install option.
- Fallback non-AR web pages for unsupported browsers.

## Data Model

```json
{
  "id": "vangogh-starry-night-1889",
  "slug": "the-starry-night",
  "title": "The Starry Night",
  "artist": {
    "name": "Vincent van Gogh",
    "birthYear": 1853,
    "deathYear": 1890,
    "nationality": "Dutch",
    "bioShort": "",
    "bioLong": ""
  },
  "date": "1889",
  "movement": ["Post-Impressionism"],
  "medium": "Oil on canvas",
  "dimensions": {
    "heightCm": 73.7,
    "widthCm": 92.1
  },
  "currentLocation": {
    "museum": "The Museum of Modern Art",
    "city": "New York",
    "country": "United States",
    "latitude": 40.7614,
    "longitude": -73.9776,
    "galleryUrl": ""
  },
  "print": {
    "spreadNumber": 63,
    "chapter": "Impressionism and Post-Impressionism",
    "imageTargetId": "target-063",
    "qrUrl": ""
  },
  "texts": {
    "historicalContext": "",
    "artistBiography": "",
    "artisticAnalysis": "",
    "symbolism": "",
    "composition": "",
    "palette": "",
    "perspectiveTechnique": "",
    "culturalSignificance": "",
    "influence": "",
    "interestingFacts": []
  },
  "timeline": [
    {
      "year": 1889,
      "label": "Painting completed",
      "type": "artwork"
    }
  ],
  "hotspots": [
    {
      "id": "cypress",
      "label": "Cypress Tree",
      "position2D": [0.18, 0.62],
      "position3D": [0.18, 0.1, 0.03],
      "category": "symbolism",
      "body": "",
      "media": []
    }
  ],
  "ar": {
    "frameModel": "models/frames/gilt-frame-01.glb",
    "layerModel": "models/layers/vangogh-starry-night.glb",
    "studioScene": "scenes/studios/saint-remy.json",
    "museumScene": "scenes/museums/moma-mini.json",
    "lightingPresets": ["daylight", "museum", "moonlight"],
    "xrayAssets": [],
    "infraredAssets": [],
    "brushstrokeAssets": []
  },
  "media": {
    "audioGuides": [],
    "videos": [],
    "subtitles": [],
    "signLanguage": [],
    "imageCredits": []
  },
  "education": {
    "ageBands": ["8-11", "12-15", "16-18", "university"],
    "learningObjectives": [],
    "quiz": [],
    "vocabulary": [],
    "discussionPrompts": []
  },
  "rights": {
    "publicDomainStatus": "",
    "imageLicense": "",
    "assetRestrictions": "",
    "creditLine": ""
  },
  "references": []
}
```

## 3D Asset Recommendations

### Painting Object

- Use a flat but physically convincing canvas object with shallow depth.
- Add frame geometry based on the artwork's historical or museum frame when known.
- Use high-resolution texture maps for the image, with lower-resolution fallbacks.
- Add optional glass reflection only if historically or museologically appropriate.

### Layer Assets

- Build layers as separate transparent planes or shallow meshes.
- Use real conservation scans where rights allow.
- Use interpretive layers only when clearly labeled.
- Keep layer animation slow and legible.

### Brushstroke Assets

- Generate normal maps and displacement maps from high-resolution scans.
- For impasto-heavy works, create selected raised stroke meshes.
- For works such as Seurat or Pollock, use procedural particle or stroke systems to explain technique.

### Studio and Museum Scenes

- Keep scenes miniature by default to reduce cognitive load.
- Offer "enter scene" as a deliberate secondary action.
- Use GLB models optimized for mobile: compressed geometry, baked lighting, and texture atlases.

### Performance Budgets

- Initial AR load: under 10 MB for standard page experience.
- Full media bundle: streamed on demand.
- GLB per standard page: ideally under 3 MB.
- Texture sets: compressed and tiered by device capability.
- Target recognition files: precompiled and cached.

## Audio, Video, and Interactive Content

### Audio Guide

- 60-second short version.
- 3-minute standard version.
- 8-minute expert version.
- Child-friendly version.
- Audio description version for blind and low-vision users.
- Multilingual narration with subtitles.

### Video Documentary

- 30-second vertical quick insight.
- 3-5 minute curator segment.
- Restoration or conservation segment.
- Artist biography segment.
- Museum location segment.

### Interactive Content

- Hotspot tours.
- Time slider for historical events.
- Technique simulator.
- Symbol hunt.
- Compare mode with another painting.
- Quiz mode.
- Teacher-led prompt mode.
- "Look for 30 seconds" slow-looking exercise.

## Educational Product Strategy

### For Schools

- Curriculum-aligned lesson packs.
- Age-specific explanations.
- Classroom mode with teacher pacing.
- Printable worksheets and digital quizzes.
- Vocabulary support.
- Assessment exports.

### For Universities

- Deeper scholarly essays.
- Comparative visual analysis tools.
- Conservation and technical art history modules.
- Citation exports.
- Seminar discussion modes.

### For Museums

- White-label tours.
- Exhibition-specific inserts.
- Gift shop edition.
- Membership and ticket links.
- Curator-recorded audio.
- Analytics for visitor engagement.

### For Libraries

- Durable public-use edition.
- Offline media packages.
- Accessibility-first interface.
- Public program kits.
- Reading-group guides.

### For Cultural Institutions

- Multilingual publishing.
- Traveling exhibition companion.
- Local artist extension packs.
- Regional curriculum partnerships.
- Open educational resource edition for selected public-domain works.

## Scalability Plan

Adding a new painting should require:

1. Create painting metadata in the CMS.
2. Upload reproduction and rights metadata.
3. Generate and test image target.
4. Add hotspot coordinates.
5. Upload AR assets and media.
6. Attach localization strings.
7. Attach educational content.
8. Publish a versioned content manifest.

The app loads painting experiences from manifests. New chapters, languages, tours, and institutional overlays are therefore content additions, not code changes.

The Mona Lisa entry is the first implemented example of this pattern: its reproduction, model, metadata, hotspots, learning objectives, and AR modes are all declared in `content/paintings/mona-lisa.json`.

## Quality and Governance

### Editorial Review

- Art historian review.
- Museum educator review.
- Accessibility review.
- Rights and reproduction review.
- Cultural sensitivity review.
- Technical QA.

### AR Review

- Tracking stability on glossy and matte light conditions.
- Performance on mid-range phones.
- Legibility of labels.
- Spatial placement accuracy.
- Audio clarity.
- Offline fallback.

### AI Review

- Source-grounded answers.
- No unsupported certainty.
- Age-appropriate language.
- Bias and cultural context checks.
- Institution-specific moderation.

## Accessibility

- Audio descriptions.
- Subtitles for all narration and video.
- Sign-language video windows.
- High-contrast interface.
- Reduced-motion mode.
- Screen-reader compatible non-AR pages.
- Keyboard and switch-accessible web interface.
- Simplified explanations.
- Child mode.
- Multilingual text and audio.
- Captions for ambient sound.

## Monetization and Editions

### Consumer Edition

- Premium printed book.
- Browser AR included.
- Optional paid expansion packs.

### School Edition

- Classroom dashboard.
- Teacher resources.
- Student analytics.
- LMS integrations.

### Museum Edition

- Custom branding.
- Local exhibition content.
- Curator media.
- Visitor analytics.

### Collector Edition

- Slipcase.
- Larger reproductions.
- Signed essays or partner museum content.
- Exclusive AR studio reconstructions.

### Digital Companion Subscription

- New paintings.
- New languages.
- New tours.
- Seasonal exhibitions.
- Expert lectures.

## Prototype Roadmap

### Phase 1: Proof of Concept

- 5 paintings.
- Image tracking.
- Painting emergence.
- Hotspots.
- Audio guide.
- Basic data model.

### Phase 2: Editorial Pilot

- 20 paintings.
- Printed sample chapter.
- Layer mode.
- Timeline.
- Quiz.
- Accessibility pass.

### Phase 3: Institutional Pilot

- 50 paintings.
- Teacher dashboard.
- Museum-branded mode.
- AI guide beta.
- Multi-language support.

### Phase 4: Full Publication

- 100 paintings.
- Full book production.
- CDN-hosted AR platform.
- Institutional licensing.
- Analytics and content management.

## Technical Notes and Source Basis

- MindAR is suitable for this concept because it is an open-source WebAR library supporting image tracking and A-Frame integration, with direct Three.js support available in newer versions.
- WebXR is the right long-term browser standard for immersive rendering, but production planning should account for uneven browser support and require graceful fallbacks.
- Three.js provides the flexible low-level 3D rendering layer needed for custom frames, materials, lighting, animation, GLTF assets, and spatial interfaces.
- A-Frame can accelerate declarative scene composition, particularly for prototypes, educator scenes, and reusable AR components.

## Recommended Sources for Technical Planning

- MindAR documentation: https://hiukim.github.io/mind-ar-js-doc/
- MDN WebXR Device API: https://developer.mozilla.org/en-US/docs/Web/API/WebXR_Device_API
- Three.js documentation: https://threejs.org/docs/
- A-Frame documentation: https://aframe.io/docs/
