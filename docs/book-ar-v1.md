# ARTDACI Book AR V1 — draft image-tracking pilot
## Goal
Extend ARTDACI's existing printed book and its homepage 3D book visual with image-triggered multimedia, using the front-cover *image* as a MindAR target. **The 3D GLB is not itself an Image AR marker.** The existing `assets/environments/gallery/models/artdaci_book3d_v2.glb` is reused in the introduction without altering the asset.

## Files
- `book-ar.html`, `styles/book-ar.css`: responsive camera introduction and media controls in FR/EN/AR.
- `scripts/book-ar.js`: MindAR tracking, floating video/painting panel, pause on target loss, speech on explicit tap, user-initiated video playback.
- `scripts/book-ar-data.mjs`: language strings and existing media routes.
- `tools/book-ar/compile-target.html`: browser-based .mind compiler for the *exact flat front-cover artwork*.
- `tests/book-ar.test.mjs`: Node static integration assertions.
- EN/FR/AR homepage and Living Book get a link to the pilot.

## Required before ready for publication
**The genuine cover image and precompiled `.mind` marker have not yet been provided.** The branch deliberately contains no fabricated marker. The UI detects its absence, prompts for a local cover image, and compiles an in-memory temporary target (best tested on a desktop or capable mobile device). This enables limited demos but is NOT a substitute for production tracking.

To complete:
1. Locate original flat cover of the **printed book and GLB**, ideally PNG/JPEG/WebP without perspective, background or shadow; check edition and crop match.
2. Open `tools/book-ar/compile-target.html` on HTTPS/localhost and use the exact cover file; save generated `artdaci-book-cover.mind`.
3. Place the marker at `assets/targets/artdaci-book-cover.mind` in this branch. Ensure HTTP 200 and binary response, and compare with the printed cover.
4. Run `node --test tests/book-ar.test.mjs`, `node --check scripts/book-ar.js`; inspect rendered pages and permissions.
5. Run real camera tests on iOS Safari + Android Chrome over HTTPS: permission allow/deny, strong/weak light, losing/reacquiring cover, poster and videos, voice/language, page return, orientation, performance, touch targets.
6. Scan print directly. To scan a **3D book shown on a screen**, use a second device with the cover clearly front-facing; camera-to-screen tracking depends on angle, brightness and reflection. Do not imply the 3D file itself has an intrinsic AR marker.

## Architecture and data
- Tracking: repository's existing `vendor/mindar-image-three.prod.js` and `vendor/mindar-image.prod.js`.
- 3D overlay: repository's `vendor/three.module.js`; canvas/video texture anchored to the tracked cover.
- Multimedia: reuse existing introduction video and 4 painter-profile videos in the repository. Video audio language may not match UI language; verify licences and spoken audio before public launch.
- Links: `geo/masters-hub.html`, `semantic/`, `book-3d.html`, all language-preserving.
- The camera runs in the user's browser and no frames are uploaded by this pilot. Requires HTTPS except localhost. Mobile Safari/Chrome compatibility still needs actual physical validation.
- No GLB alteration, Cloudflare R2 mutation, API credential, or production change in this branch.

## Release policy
This PR is a **draft** until cover target, real-device tests, and accessibility checks are complete. Deploy a preview first; never merge or promote this incomplete pilot to production automatically.
