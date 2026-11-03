# ARTDACI Museum XR — isolated Meta Quest / Street View WebXR pilot

This feature is an **unreleased and initially disabled** Vercel Preview. The published site is unaffected.

## What is ready
- `geo/museum-xr.html?lang=fr&museum=national-gallery-london` loads the WebXR interface.
- Four existing artwork links route to their distinct source museums.
- Three languages: FR, EN and AR; original Google Arts & Culture link preserved.
- Panorama rendered on an inward-facing Three.js sphere, Meta Quest `immersive-vr` session and controller-ray hotspot selection.
- A Node Vercel function `/api/museum-xr` acts as an opt-in backend to Google Maps Tile API. It uses **server-to-server OAuth 2.0**, not the browser API key.
- The backend only accepts five museum records from the registry and the user-provided National Gallery example, refuses non-indoor panoramas, checks geographic proximity and restricts navigation to adjacent panoramas in a 35m radius.
- Access requires a private preview passphrase. Sessions use signed 20-minute tickets; no Google OAuth bearer is included in those tickets.
- Daily cap is enforced through an **atomic Redis increment with Lua** and fails closed if Redis is not available. The limit is 300 **total upstream requests (including token requests)** per UTC day, which is more restrictive than 300 Google Street View tiles. The cap does not correspond directly to a maximum dollar charge or guarantee zero billing.
- No persistent panorama/image storage; transient canvas buffers exist only for active visualization.
- Attribution text appears in both the HTML viewer and a headset-rendered panel. Google Maps logo and report-problem UX inside WebXR still require compliance testing and improvements.

## Security and billing prerequisites
All environment variables must be added in Vercel **for the feature branch Preview only** — not Production:
- `MUSEUM_XR_ENABLED=true`
- `MUSEUM_XR_GOOGLE_PROJECT_ID`: Google Cloud billing project ID.
- `MUSEUM_XR_GOOGLE_SERVICE_ACCOUNT_EMAIL` and `MUSEUM_XR_GOOGLE_PRIVATE_KEY`: OAuth service account JSON email and private key, kept server-side in encrypted secrets. Consider Workload Identity Federation/OIDC instead of static private keys for production.
- `MUSEUM_XR_TICKET_SECRET`: secure random secret of at least 32 characters.
- `MUSEUM_XR_PREVIEW_TOKEN`: distinct secure random passphrase of at least 24 characters. Never store it in GitHub; share it privately only with the person testing.
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`: Redis store supporting the Upstash REST API, restricted and configured with a limit and retention appropriate to the pilot.

**No new paid store is automatically created.** Choose a Redis provider and cost limits before enabling the API. Never turn `MUSEUM_XR_ENABLED` on without all of the above. The code explicitly returns HTTP 503 when any prerequisite is missing.

A browser API key restricted to `https://artdaci.com/*` is **not compatible with this server OAuth strategy**; retain it restricted and unused, or deactivate it if not needed. The previously created $5 Google Cloud billing budget sends alerts only and does not enforce a spending cap. The local gateway request cap is separately enforced; do not assume it controls all Google requests using the same Cloud project.

For service account OAuth, consult Google's documented `cloud-platform` scope and `X-Goog-User-Project` request header:
https://developers.google.com/maps/documentation/tile/get-api-key

## Important limitations
1. Google Arts & Culture `sv_pid` is not a Map Tiles `panoId`; the app does **not** scrape or reuse the Arts & Culture imagery. Google Map Tiles may not return the interior views seen in Arts & Culture, or may select an adjacent floor or room.
2. Photo spheres are monoscopic 3DoF imagery rather than navigable geometric 6DoF reconstructions. Hotspots allow panorama teleportation only where the API supplies links.
3. Review live Google Maps Tile terms: https://developers.google.com/maps/documentation/tile/policies — including logo, full copyright text, visible report-problem action in immersive mode, and imagery caching requirements. **Do not launch publicly until compliance is verified.**
4. Review Vercel function compatibility, browser/CORS behavior, session expiry, Upstash API, HTTPS origins, OpenXR browser compatibility and Meta Quest 3 performance.
5. No current Google panorama access or Quest headset test has been performed. Activation and coverage verification require account-side setup and real hardware.

## Validation
`node --test tests/geo-streetview-xr.test.mjs tests/museum-xr-gateway.test.mjs`

Test expected disabled behavior from Preview:
`POST /api/museum-xr` -> 503 when `MUSEUM_XR_ENABLED` or secrets are absent.
No keys, OAuth bearer tokens or Redis tokens should ever appear in client bundles, API responses, GitHub or logs.
