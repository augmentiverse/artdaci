# ARTDACI GEO V6.10 — Leonardo Active Guide

This layer starts from `artdaci-geo-v6.9` (`e76007d6c259ac58a9ae49a45aa54617790e2dd7`). It keeps the V5 room, the validated static Leonardo GLB and placement, the V6.7 Mona Lisa flow, the V6.8 Quest controls, and the V6.9 Louvre transition unchanged.

`data/leonardo-active-guide.json` holds the FR/EN/AR text, action labels, artwork references, optional profile route, future Art Trail destination, and narration availability. `scripts/active-guide.mjs` validates it and manages session-only state. `scripts/room-viewer.js` adapts its effects to the existing room POI and panels; `scripts/active-guide-xr-panel.mjs` provides a separate, compact Quest panel without changing the validated V6.8 panel geometry or controller logic.

## Events and states

| Event | Result |
| --- | --- |
| `LEONARDO_SELECTED`, `RETURN_TO_GUIDE` | Opens welcome, introduction, or post-Mona content according to session state. |
| `START_TOUR` | Changes `welcomed` to `monaLisaIntroduced`. |
| `SEE_MONA_LISA`, `REVIEW_MONA` | Emits the existing `ld01-mona-lisa` room POI effect; the viewer calls its unchanged `showMonaFromGuide()` path. |
| `MONA_LISA_OPENED`, `MONA_LISA_VISITED` | Marks the existing Mona POI visited during this page session. |
| `ABOUT_LEONARDO`, `MONA_MORE`, `SHOW_WORKS`, `SELECT_WORK:<id>` | Opens a short, localized guide section. |
| `CONTINUE_TRAIL` | Emits a destination only when `nextPoiId` is configured and present in the current room's POI list. Currently no destination exists, so a localized “later” step is shown. |
| `BACK`, `CLOSE` | Navigates guide panels or closes them; does not alter room navigation. |

The flow states are `notStarted`, `welcomed`, `monaLisaIntroduced`, `monaLisaVisited`, and `trailOffered`. They reset on page reload. No backend or persistence is added.

## Artwork and audio boundaries

`ld01` is the only artwork placed in this virtual room. `ld06` (La Belle Ferronnière) is present in the ARTDACI Louvre data, but its current museum display is not verified: its guide action is information-only, with no room location or external artwork route. No Leonardo guide narration is approved in the repository. Existing Mona Lisa FR/EN/AR audio remains with the Mona POI; unrelated Leonardo music is not presented as his voice. The JSON reserves `audio` fields as `null` for future approved narration.

## Quest 3S acceptance procedure

Open the local QA URL supplied with the running server, enter VR, then use either controller to: select Leonardo; choose **Commencer la visite**; choose **Voir La Joconde**; interact with the Mona POI; return to Leonardo and verify the changed post-visit message; choose **Revoir La Joconde**; and choose **Continuer le parcours ARTDACI** to see the future-trail notice without teleportation. Repeat with the other controller. Verify left-stick locomotion, right-stick snap rotation, 360° head tracking, floor teleportation, audio, and return to the Louvre.

## User-confirmed hardware validation

The user has validated this V6.10 state on a real Meta Quest 3S. The confirmed checks cover correct rendering and CSS, Leonardo selection, contextual welcome and post-Mona dialogue, starting the visit, the existing Mona Lisa viewing and revisiting path, the Leonardo profile section, the works section, and the intended future-trail notice. Both controllers work; panels are readable and comfortable. Locomotion, full 360° rotation, teleportation, FR/EN/AR and Arabic RTL are preserved. This records the user's hardware test, not an additional hardware test by the coding agent. No FPS or memory measurements are claimed.
