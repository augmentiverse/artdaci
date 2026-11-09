# ARTDACI — Homepage visual assets: audit and review

9 November 2026 · Work-in-progress, not approved artwork replacements.

All 24 source image paths used by the painting Index exist in the GitHub repository. Their total size is approximately 5.84 MiB. The original wordmark image assets/varia/artdaci-logo.png weighs approximately 2.43 MiB, making it a strong optimization candidate.

## Hosting scope: GitHub/Vercel versus Cloudflare R2

**This report's 24 images and 5.84 MiB refer only to the GitHub-hosted homepage Painting Index thumbnails. They are not a global media inventory.**

ARTDACI also delivers a substantial media library through the Cloudflare R2 custom domain `https://media.artdaci.com/` (per-artwork `artworks/{id}/` and shared `shared/` prefixes). The runtime reads `content/media-manifests/artworks/{id}/manifest.json` and `scripts/artwork-media-manifest.js`, which selects a published R2 asset when available and retains selective local fallbacks. These manifests reference images, audio, videos, 3D models and AR files.

At the time of this audit, the 24 source-ready artwork media manifests declare **107 media references**, including **90 marked available** and **17 not marked available**. The available references are **10 images, 70 audio files, 1 video, 5 models and 4 AR assets**. The sum of **recorded** bytes is about **310.43 MiB**, but one available image has no recorded size. These are metadata declarations, not a live inventory of Cloudflare R2 or proof that each URL currently responds. Other assets referenced outside this registry may exist.

Run `node scripts/audit-media-storage.mjs` for a repeatable inventory and `node scripts/audit-media-storage.mjs --json` for the detailed declarations. Check public URLs, HTTP status, MIME, CORS, size and integrity independently as needed using narrowly scoped verification such as `scripts/check-vg01-orsay-media.mjs --remote`, without pulling entire videos or models during routine CI.

**Storage policy:** Do not copy existing Cloudflare-hosted originals into GitHub/Vercel, silently rewrite Cloudflare URLs, alter R2 object keys, or re-encode AR tracking targets/GLB/long-form media as part of homepage image optimization. Keep remote media URLs and fallback behaviors intact. Assess performance separately for local thumbnail loading and for CDN-delivered remote media.

### Live R2 header sampling (non-destructive)

Use `node scripts/probe-cloudflare-media.mjs` to inspect a bounded representative sample of **published manifest references** via `HEAD` requests: 2 images, 3 audio, 1 video, 2 models, 1 AR target, and four R2 manifest URLs. `HEAD` does not transfer media bodies. Results report status, MIME, CORS for `https://artdaci.com`, Content-Length, Cache-Control, CF-Cache-Status (when present), Accept-Ranges, and elapsed time.

Because the check is performed from the GitHub Actions environment rather than a visitor browser, an HTTP `HEAD` result is **not** a guarantee of successful image rendering, audio playback, GLB loading, image tracking, correct CDN caching or frontend performance. In particular, some servers disallow HEAD even when GET works. A missing CORS header should be investigated in the browser before changing production settings. The check is deliberately non-blocking and never updates Cloudflare R2.

Review `cloudflare-head-report.json` in the GitHub Actions artifact `artdaci-visual-assets-review`. The CLI also supports `--json`, `--strict` and `--output <file>` for manual investigations; `--strict` flags warnings and inconclusive responses as nonzero.
Three already-frameless thumbnails need higher pixel density before they can be displayed sharply on high-DPI screens:

| Artwork slug | Current pixels | Current file | Higher-resolution candidate (uncropped) |
| --- | ---: | --- | --- |
| lady-with-an-ermine | 360 x 484 | assets/home-gallery/leonardo-lady-with-ermine-frameless.webp | assets/artists/leonardo-da-vinci/collection/the-lady-with-an-ermine-davinci.webp |
| belle-ferronniere | 360 x 459 | assets/home-gallery/leonardo-belle-ferronniere-frameless.webp | assets/artists/leonardo-da-vinci/collection/la-belle-ferronnière-davinci.webp |
| pont-d-argenteuil | 300 x 225 | assets/home-gallery/monet-bridge-at-argenteuil-frameless.webp | assets/artists/claude-monet/collection/le-pont-d-argenteuil-monet.webp |

Automated size inspection cannot establish where the painted area ends or whether a decorative frame is present. Source attribution, precise artistic cropping and painting edges must be verified visually; the site continues using its existing artwork images until that review is complete.

The read-only Node script scripts/audit-gallery-images.mjs inspects all 24 source files; tests/gallery-image-quality.test.mjs prevents broken image references or corrupt intrinsic dimensions. The Python script tools/prepare-gallery-visuals.py creates a lossless, downsampled WebP logo candidate and side-by-side pictures of each small thumbnail and corresponding high-resolution original. GitHub Actions workflow gallery-assets-review.yml uploads these temporary review files as an artifact. It never commits the candidate images or alters the website.

After visual approval, replace only the homepage display image assets with reviewed frameless high-density versions. Leave printable originals, museum images, AR image tracking, VR models and canonical content unaltered.

Commands: node scripts/audit-gallery-images.mjs ; node --test tests/gallery-image-quality.test.mjs ; python3 tools/prepare-gallery-visuals.py --output visual-review (Pillow required).
