# ARTDACI Museum XR — WebXR Street View pilot (not enabled in production)

## Scope
- New isolated route `geo/museum-xr.html?lang=fr&source=<encoded Google Arts & Culture URL>`.
- Linked from `geo/museum-views.html` for artwork panoramas supplied by the project owner, and from `geo/index.html` for the National Gallery example.
- Meta Quest Browser-compatible WebXR `immersive-vr` via the site's vendored Three.js, controller-ray selection of neighboring panorama markers, and ordinary HTML button fallback.
- FR / EN / AR UI. Existing GEO, VR Gallery and Louvre XR remain unchanged.

## Source/licensing boundary — crucial
A link hosted by `artsandculture.google.com/streetview` is **not itself** a reusable equirectangular image, a stable Google Maps Tiles panorama ID, a license to republish imagery, or a guarantee that Map Tiles has equivalent coverage.
This viewer **never** scrapes Google Arts & Culture, converts its `sv_pid` into a Maps Tiles ID, redistributes tiles, or stores imagery.
It looks up an independent Map Tiles panorama by latitude/longitude, accepts only nearby `imageryType: indoor` imagery, and preserves the original external museum tour link as a fallback. Even a close indoor panorama must be manually validated for accuracy and artwork visibility.
Google Maps Tiles panorama IDs are temporary and are used only for the session. Image copyright and report-problem link are surfaced as required.

## Activation prerequisites (not yet complete)
1. Review current Google Maps Platform Map Tiles API and Street View policies, allowable immersive use and attribution requirements for this implementation.
2. Create a Google Cloud project with **billing enabled**, enable the **Map Tiles API**, and create a **browser API key** restricted to `https://artdaci.com/*` and applicable Vercel previews. Apply key API restrictions and billing quotas/alerts. Google usage is not guaranteed free; do not commit a secret or unrestricted key.
3. After review, supply the browser key through a deployment-specific config mechanism, rather than committing it to this repository. The pilot intentionally contains an empty `GOOGLE_MAP_TILES_KEY` and remains disabled until integration and compliance sign-off. A browser key is client-visible by design; use only a properly restricted browser key, not a service-account credential.
4. Test whether the Google Map Tiles endpoints, session creation and tile responses permit access from the served site in Quest Browser (CORS and browser-key restrictions). If not, use a small same-origin server gateway with appropriately protected credentials, policy review and no image persistence.
5. Confirm a nearby indoor panorama is available for each museum. Note that same-position GPS alone cannot distinguish floors or establish that a specified painting appears in view. The 35-meter guard is a defensive heuristic, **not** verification of the museum room.
6. Perform a human-on-headset test (Meta Quest 3, HTTPS, controller raycast, `immersive-vr`, attribution legibility, performance, comfort, and accessible desktop fallback).

## Design constraints / future hardening
- High-resolution Google tiles are not pre-cached or downloaded to the repository. Zoom 2 caps the stitched texture near 1.7K×0.9K. Visual sharpness is intentionally limited for a small Quest performance budget.
- The view is monoscopic 360° imagery at a fixed point, **not** stereoscopic depth, photogrammetry or physical room-scale 6DoF. Head orientation is tracked, but leaning does not reveal true parallax.
- Adjacent panoramas come from `metadata.links`, which may refer to an exterior scene. The viewer rechecks `imageryType` and distance for each transition.
- Production fallback displays the institutional link. No misleading “VR available” promise should be shown while API configuration is inactive.
- Attribution and the report-problem action must remain visible and usable in the headset as well as on the 2D page; the current prototype's HTML attribution is *not* yet an in-headset overlay. This must be fixed before launch.
- `node --test tests/geo-streetview-xr.test.mjs` validates static logic; manual testing and browser/runtime verification are still required.

## Reference
https://developers.google.com/maps/documentation/tile/streetview
https://developers.google.com/maps/documentation/tile/policies
