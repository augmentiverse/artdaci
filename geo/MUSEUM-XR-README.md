# ARTDACI Museum XR — isolated Meta Quest / Street View WebXR pilot

This feature is an **unreleased, Vercel Authentication-protected Preview**. The published site is unaffected.

## Quest 3S regression check (2026-11-04)
- After adding visible controller rays, the user reported that **Enter VR did not complete** although entry worked on the previous Preview. No browser-side stack trace is available; the root cause has not been confirmed.
- This build defaults to **stable VR** (original head-tracked panorama, yaw thumbstick, **controller lasers, turquoise hover, trigger to open a linked panorama, and A/X fallback**). The stable render path intentionally omits continuous headset-camera, gaze and HUD computations; gaze fallback runs only on a trigger press. `?xrControls=enhanced` retains the more complex camera-following markers and headset message overlay, but is optional and experimental.
- `requestSession('immersive-vr')` is called directly in the VR button click handler to preserve transient user activation. Dedicated diagnostics report request sent, Quest consent pending, permission granted, started or rejected, and give an actionable message if the browser never responds. A controller-overlay failure is caught instead of preventing rendering.
- The user confirmed that stable-mode immersion launches, but controller selection was disabled in stable mode. Controller selection and A/X fallback have now been restored in stable mode. **These controls have not yet been validated on the physical Quest 3S** after the change. Only the stable mode should be tried first. Keep the older working preview available for comparison.
- Continue to require Vercel Preview authentication and branch-only API configuration; do not merge to production.

## What is ready
- `geo/museum-xr.html?lang=fr&museum=national-gallery-london` loads the WebXR interface.
- Four existing artwork links route to their distinct source museums.
- Three languages: FR, EN and AR; original Google Arts & Culture link preserved.
- Panorama rendered on an inward-facing Three.js sphere, Meta Quest `immersive-vr` session and controller-ray hotspot selection.
- The pilot now supports full horizontal and vertical **look-around**: drag/touch/arrow keys and mouse wheel or +/- buttons on desktop, natural head movement plus right-hand stick turning on Quest. An opt-in artificial pitch rotation was **not** added for headset comfort. Zoom buttons/wheel apply to the non-VR canvas; WebXR stereo uses a headset-controlled projection, so headset optical zoom is **not** claimed.
- Signed tickets can follow nearby panorama IDs from Google's `metadata.links`. The user has confirmed that Quest 3S laser/trigger navigation **works**. Navigation markers are now rendered as **small numbered gold discs (0.30m across) with an invisible 0.34m-radius selection sphere**, preserving usability without obscuring artwork. On controller hover, the badge highlights turquoise and a transient, in-world tooltip shows the view number, compass heading and the exact descriptive text supplied by Google, if any; otherwise it explicitly says **room name not provided**. The corresponding HTML directional buttons carry accessible titles. The feature makes no unverified claims about actual exhibition rooms. Quest A/X remains a fallback. In demo mode, travel is limited to directly linked panoramas within **90 metres** of the museum; verified indoor traversal remains restricted to verified `indoor` imagery within 35m. No direct free movement or 6DoF reconstruction.
- Viewer now offers an explicit **HD (native-dependent)** (zoom 3, e.g. `3328×1664`, 7 × 4 tiles for a `13312×6656` native panorama) versus **Standard** (zoom 2, e.g. `1664×832`, 4 × 2 tiles) setting, with the actual loaded resolution shown to the visitor. Tile fetching uses only two concurrent requests. If Google rejects a tile, the signed zoom fallback steps down one level at a time, so a working 360° view can look low resolution. Google original panoramas may also contain compression or blur not fixable by resampling.
- A Node Vercel function `/api/museum-xr` acts as an opt-in backend to Google Maps Tile API. It uses **keyless Workload Identity Federation (Vercel Preview OIDC → Google STS → short-lived service account OAuth)**, not the browser API key or a Google private key.
- The backend accepts a fixed five-record pilot catalog. Verified indoor views are strictly checked within 35m of the selected artwork's museum coordinates. Separately labeled Street View *demo* views may be outdoor, and signed adjacent-panorama navigation is limited to 90m from the museum; it must never be described as viewing the painting in its real gallery.
- Starting a museum view first checks the nearest panorama. If it is outdoor or missing, it now probes a fixed 13-point cluster around the supplied museum coordinates using `/streetview/panoIds`, then inspects up to 8 distinct candidates, accepting only `imageryType=indoor` within 35m. **Nearby is not proof of the exact room or artwork**. The UI labels any discovered nearby view as unverified and retains a link to the official Google Arts & Culture panorama.
- The private Preview relies on **Vercel Authentication** (no separate pilot access code). The authenticated Preview is scoped to the feature branch, and Google federation accepts only its Preview identity. Sessions use signed 20-minute tickets; no Google OAuth bearer is included in those tickets.
- The **small private pilot runs without Redis**. It applies a best-effort per-instance limit of 60 upstream requests/minute and 300 upstream requests/UTC day, including token-exchange requests. These limits reset after cold starts and apply separately to each server instance: **they are NOT global billing caps**. Redis may be added later to establish a globally shared daily limit. The Google Cloud API quotas and billing alerts remain separate controls.
- No persistent panorama/image storage; transient canvas buffers exist only for active visualization.
- Google Maps Tiles 5xx errors receive at most one bounded upstream retry; if an image tile still fails, the browser requests a **new signed ticket** for a lower Street View zoom (HD: 3 → 2 → 1 → 0; Standard: 2 → 1 → 0). Image dimensions now scale down from the panorama metadata's native maximum-zoom (level 5) dimensions: the old fixed `2^zoom` column count incorrectly asked for an eighth tile (`x=7`) when only seven were available at zoom 3 for a `13312px` source, resulting in Google HTTP 400. This fallback is intended to make private Quest testing more resilient, and it may visibly reduce image quality. It cannot make missing indoor Google panoramas available. The viewer shows safe upstream error stage and HTTP status. This is one final diagnostic pilot: if higher-quality Street View and authentic indoor artwork views remain unavailable, suspend Maps Tiles usage and keep the official Arts & Culture links. The nearby panorama selection is not a claim of verified artwork placement.
- Attribution text appears in both the HTML viewer and a headset-rendered panel. Google Maps logo and report-problem UX inside WebXR still require compliance testing and improvements.

## Security and billing prerequisites
All environment variables must be added in Vercel **for the feature branch Preview only** — not Production:
- `MUSEUM_XR_ENABLED=true`
- `MUSEUM_XR_GOOGLE_PROJECT_ID`: Google Cloud billing project ID.
- `MUSEUM_XR_GOOGLE_SERVICE_ACCOUNT_EMAIL=artdaci-museum-xr@artdaci-museum-xr.iam.gserviceaccount.com`: email of the account allowed to be impersonated (no private key).
- `MUSEUM_XR_GOOGLE_PROJECT_NUMBER`: numerical Google Cloud project **number**, not the string project ID.
- `MUSEUM_XR_WORKLOAD_POOL_ID=artdaci-vercel` and `MUSEUM_XR_WORKLOAD_PROVIDER_ID=vercel-artdaci-preview`: configured Google Workload Identity Federation provider.
- OIDC enabled on Vercel team issuer `https://oidc.vercel.com/daci` with Google-side provider attribute condition `assertion.sub == "owner:daci:project:artdaci:environment:preview"`.
- IAM service account Workload Identity User grant restricted to **that exact OIDC subject**. No Google JSON key may be generated or added to Vercel.
- `VERCEL_ENV` must be `preview`; it is supplied automatically by Vercel.
- `MUSEUM_XR_TICKET_SECRET`: secure random secret of at least 32 characters.
- No Museum XR passphrase is needed. The prior `MUSEUM_XR_PREVIEW_TOKEN` environment setting is deprecated and ignored by the code; remove it from Vercel when convenient.
- OPTIONAL: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` if a globally shared request ceiling is needed. Both must be set together.

**No Redis store is created or required for this tiny private pilot.** Activate the API only after the keyless OAuth identity and Vercel Authentication are verified. The code returns HTTP 503 when required secrets/configuration are missing; it is restricted to Preview with branch-scoped Vercel environment variables. OIDC exchange also fails closed when Vercel does not provide a subject token or when deployed outside Preview.

A browser API key restricted to `https://artdaci.com/*` is **not compatible with this server OAuth strategy**; retain it restricted and unused, or deactivate it if not needed. The previously created $5 Google Cloud billing budget sends alerts only and does not enforce a spending cap. The local gateway request cap is separately enforced; do not assume it controls all Google requests using the same Cloud project.

For federation, consult the official Vercel setup: https://vercel.com/docs/oidc/gcp
The gateway uses Google STS and IAM Credentials `generateAccessToken`, limited to `cloud-platform` scope, and includes the configured `X-Goog-User-Project` header for Maps Tiles API.

## Important limitations
1. Google Arts & Culture `sv_pid` is not a Map Tiles `panoId`; the app does **not** scrape or reuse the Arts & Culture imagery. Google Map Tiles may not return the interior views seen in Arts & Culture, or may select an adjacent floor or room.
2. Photo spheres are monoscopic **3DoF** imagery rather than navigable geometric **6DoF** reconstructions. Hotspots allow panorama teleportation only where the API supplies accessible links, and outdoor demo views are static. Even a 4K panorama may look soft inside a VR headset because it covers an entire 360° sphere.
3. Review live Google Maps Tile terms: https://developers.google.com/maps/documentation/tile/policies — including logo, full copyright text, visible report-problem action in immersive mode, and imagery caching requirements. **Do not launch publicly until compliance is verified.**
4. Review Vercel function compatibility, browser/CORS behavior, session expiry, Upstash API, HTTPS origins, OpenXR browser compatibility and Meta Quest 3 performance.
5. The user has tested the Preview on Quest 3S: rotating the view is working, but the original golden markers were visible yet unselectable. Updated targeting changes require a new hardware test. National Gallery's nearest panorama returned `outdoor`, and the demo experienced upstream HTTP 500 responses. An HTTP 500 stage is now exposed in safe diagnostic metadata. A successful headset panorama rendering has **not** been verified.

## Validation
`node --test tests/geo-streetview-xr.test.mjs tests/museum-xr-gateway.test.mjs tests/museum-xr-oidc.test.mjs tests/museum-xr-search.test.mjs`

Test expected disabled behavior from Preview:
`POST /api/museum-xr` -> 503 when `MUSEUM_XR_ENABLED` or secrets are absent.
No keys, OAuth bearer tokens or Redis tokens should ever appear in client bundles, API responses, GitHub or logs. The redundant pilot access code has been removed from the viewer and gateway. The pilot is not intended as a substitute for a globally enforced production cost cap.
