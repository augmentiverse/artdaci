# ARTDACI — Cloudflare R2 live response-header review

Date: 9 November 2026. Source: GitHub Actions [gallery-assets-review run 42678595115](https://github.com/augmentiverse/artdaci/actions/runs/42678595115), commit `33e9e0e8c43aa83e671fbd234088efb52c981ae4`.

## Scope and caveat

This review used **13 public HTTP HEAD requests**, including nine published media assets declared by `content/media-manifests/` and four artwork media manifest URLs. It did not download media bodies, enumerate an R2 bucket, calculate SHA-256, execute browser-based AR/VR/playback tests or measure end-user latency. A response that works with HEAD does not guarantee GET, range requests or a decoded media experience.

## Observed results

- HTTP **200** on all 13 sampled URLs; 13/13 matched the expected Content-Type.
- All 13 responses sent `Access-Control-Allow-Origin: https://artdaci.com`.
- All 13 responses sent `CF-Cache-Status: DYNAMIC`.
- Three versioned assets sent `Cache-Control: public, max-age=31536000, immutable` (ld01 image AR target-v2 JPEG, model main-v2 GLB and target-v2 MIND).
- Six sampled media files did **not** send an explicit Cache-Control header in this check (one ve01 JPEG, three MP3s, one MP4 and one ve01 GLB).
- Four remote JSON manifests sent `Cache-Control: no-store`, which should remain in place unless the manifest publication strategy changes.
- The exact timestamp from the workflow log was about 18:57 UTC, 9 November 2026.

| Source role | URL path at media.artdaci.com | Status | MIME | Cache-Control |
| --- | --- | --- | --- | --- |
| Image — Leonardo | `/artworks/ld01/images/ar-target-v2.jpg` | 200 | image/jpeg | 1 year, immutable |
| Image — Vermeer | `/artworks/ve01/images/figure-standing.jpg` | 200 | image/jpeg | Not reported |
| Audio — Leonardo | `/artworks/ld01/audio/ar/overview.mp3` | 200 | audio/mpeg | Not reported |
| Audio — Monet | `/artworks/mo01/audio/ar/overview.mp3` | 200 | audio/mpeg | Not reported |
| Audio — Vermeer | `/artworks/ve01/audio/en/guide.mp3` | 200 | audio/mpeg | Not reported |
| Video — Vermeer | `/artworks/ve01/videos/animation.mp4` | 200 | video/mp4 | Not reported |
| 3D model — Leonardo | `/artworks/ld01/models/main-v2.glb` | 200 | model/gltf-binary | 1 year, immutable |
| 3D model — Vermeer | `/artworks/ve01/models/portrait.glb` | 200 | model/gltf-binary | Not reported |
| AR — Leonardo | `/artworks/ld01/ar/target-v2.mind` | 200 | application/octet-stream | 1 year, immutable |
| Leonardo manifest | `/artworks/ld01/manifest.json` | 200 | application/json | no-store |
| Vermeer manifest | `/artworks/ve01/manifest.json` | 200 | application/json | no-store |
| Van Gogh manifest | `/artworks/vg01/manifest.json` | 200 | application/json | no-store |
| Monet manifest | `/artworks/mo01/manifest.json` | 200 | application/json | no-store |

### Interpretation

Cloudflare documentation describes `DYNAMIC` as a response in which the request was not eligible for edge caching at decision time; it is not equivalent to `MISS` and should not be presented as a measured cache hit ratio. Common explanations include Cache Rules bypass, Development Mode or absence of an eligibility rule for some formats. However, the source was checked with HEAD rather than browser GET, and no Cloudflare account settings were inspected.

See: https://developers.cloudflare.com/cache/concepts/cache-responses/ and https://developers.cloudflare.com/cache/troubleshooting/investigating-uncached-responses/

## Recommended safe sequence (no rule changes made)

1. In the Cloudflare dashboard for `media.artdaci.com`, review active Cache Rules, Development Mode and the Rules simulator for one known versioned GLB, one unversioned MP3 and a `manifest.json` path. Confirm whether the domain is proxy-enabled and connected as an R2 custom domain.
2. Test GET and small Range responses from a real browser/mobile device for audio, video, 3D and AR, including CORS, seeking, loading and content decoding. Retest GET after any rule change to verify `MISS` then `HIT` where intended.
3. Consider marking only **public stable assets** under media resource paths (`images`, `audio`, `videos`, `models`, `ar`) eligible for edge caching. Apply long edge TTL only to **immutable versioned keys** and a shorter, revalidation-friendly TTL for replaceable paths. Maintain a purge strategy for edited media.
4. Exclude `manifest.json`, APIs and unpublished assets from broad Cache Everything or Edge TTL overrides; preserve manifest `no-store`, correct per-origin CORS and security headers.
5. Check object metadata and Cache-Control for the six sampled media files without explicit headers, using a documented policy by asset type and expected update frequency.
6. Repeat sampled diagnostics from several geographic vantage points and monitor actual cache hit ratio and origin egress in the Cloudflare analytics UI. A single GitHub runner is not representative of global visitors.

No R2 object, Cloudflare rule, file URL, metadata flag or live production deployment was modified.

## Reproduce

Run: `node scripts/probe-cloudflare-media.mjs --output visual-review/cloudflare-head-report.json`

Unit tests: `node --test tests/cloudflare-head-probe.test.mjs`

The workflow uploads the JSON report as part of the `artdaci-visual-assets-review` artifact and keeps HTTP failures non-blocking to avoid false claims from intermittent network conditions.
