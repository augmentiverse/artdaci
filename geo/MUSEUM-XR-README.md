# ARTDACI Museum XR — isolated Meta Quest / Street View WebXR pilot

This feature is an **unreleased and initially disabled** Vercel Preview. The published site is unaffected.

## What is ready
- `geo/museum-xr.html?lang=fr&museum=national-gallery-london` loads the WebXR interface.
- Four existing artwork links route to their distinct source museums.
- Three languages: FR, EN and AR; original Google Arts & Culture link preserved.
- Panorama rendered on an inward-facing Three.js sphere, Meta Quest `immersive-vr` session and controller-ray hotspot selection.
- A Node Vercel function `/api/museum-xr` acts as an opt-in backend to Google Maps Tile API. It uses **keyless Workload Identity Federation (Vercel Preview OIDC → Google STS → short-lived service account OAuth)**, not the browser API key or a Google private key.
- The backend only accepts five museum records from the registry and the user-provided National Gallery example, refuses non-indoor panoramas, checks geographic proximity and restricts navigation to adjacent panoramas in a 35m radius.
- Access requires a private preview passphrase. Sessions use signed 20-minute tickets; no Google OAuth bearer is included in those tickets.
- The **small private pilot runs without Redis**. It applies a best-effort per-instance limit of 60 upstream requests/minute and 300 upstream requests/UTC day, including token-exchange requests. These limits reset after cold starts and apply separately to each server instance: **they are NOT global billing caps**. Redis may be added later to establish a globally shared daily limit. The Google Cloud API quotas and billing alerts remain separate controls.
- No persistent panorama/image storage; transient canvas buffers exist only for active visualization.
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
- `MUSEUM_XR_PREVIEW_TOKEN`: distinct secure random passphrase of at least 24 characters. Never store it in GitHub; share it privately only with the person testing.
- OPTIONAL: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` if a globally shared request ceiling is needed. Both must be set together.

**No Redis store is created or required for this tiny private pilot.** Activate the API only after the keyless OAuth identity and Preview passphrase have been verified. The code returns HTTP 503 when required secrets/configuration are missing; it is branch-locked to Preview. OIDC exchange also fails closed when Vercel does not provide a subject token or when deployed outside Preview.

A browser API key restricted to `https://artdaci.com/*` is **not compatible with this server OAuth strategy**; retain it restricted and unused, or deactivate it if not needed. The previously created $5 Google Cloud billing budget sends alerts only and does not enforce a spending cap. The local gateway request cap is separately enforced; do not assume it controls all Google requests using the same Cloud project.

For federation, consult the official Vercel setup: https://vercel.com/docs/oidc/gcp
The gateway uses Google STS and IAM Credentials `generateAccessToken`, limited to `cloud-platform` scope, and includes the configured `X-Goog-User-Project` header for Maps Tiles API.

## Important limitations
1. Google Arts & Culture `sv_pid` is not a Map Tiles `panoId`; the app does **not** scrape or reuse the Arts & Culture imagery. Google Map Tiles may not return the interior views seen in Arts & Culture, or may select an adjacent floor or room.
2. Photo spheres are monoscopic 3DoF imagery rather than navigable geometric 6DoF reconstructions. Hotspots allow panorama teleportation only where the API supplies links.
3. Review live Google Maps Tile terms: https://developers.google.com/maps/documentation/tile/policies — including logo, full copyright text, visible report-problem action in immersive mode, and imagery caching requirements. **Do not launch publicly until compliance is verified.**
4. Review Vercel function compatibility, browser/CORS behavior, session expiry, Upstash API, HTTPS origins, OpenXR browser compatibility and Meta Quest 3 performance.
5. No current Google panorama access or Quest headset test has been performed. Activation and coverage verification require account-side setup and real hardware.

## Validation
`node --test tests/geo-streetview-xr.test.mjs tests/museum-xr-gateway.test.mjs tests/museum-xr-oidc.test.mjs`

Test expected disabled behavior from Preview:
`POST /api/museum-xr` -> 503 when `MUSEUM_XR_ENABLED` or secrets are absent.
No keys, OAuth bearer tokens or Redis tokens should ever appear in client bundles, API responses, GitHub or logs. Preview access code must not be committed. The pilot is not intended as a substitute for a globally enforced production cost cap.
