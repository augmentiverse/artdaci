# ARTDACI — browser verification of Cloudflare-hosted immersive media

This diagnostic covers a production-origin browser session against https://artdaci.com, while changes under review remain in a draft PR. It does not modify the live site or Cloudflare R2.

## Browser workflow

- `scripts/check-cloudflare-browser.mjs` opens the real `space.html?painting=mona-lisa` page in headless Chromium, activates the initially deferred 3D viewer and inspects whether the `model-viewer` component reports a loaded Cloudflare model or a local fallback.
- From the same production origin it creates `<audio>` and `<video>` elements for two *manifest-published* Cloudflare objects, requests metadata and attempts brief playback (the video is muted). It records the HTMLMediaElement state, error code and whether playback started.
- It also sends browser `fetch` requests with `Range: bytes=0-1023` for audio, video, GLB and MindAR target, cancelling each response after the first received chunk to limit data transfer.
- The `model-viewer`'s software WebGL capabilities in a CI Chromium browser may be different from a modern phone or VR headset. This check is not proof of native AR, headset VR or iOS Quick Look support.
- Browser network failures and autoplay/codec restrictions are recorded as non-blocking findings rather than treated as confirmed production outages.

## Run and inspect

The workflow `.github/workflows/cloudflare-browser-diagnostics.yml` installs the test-only `playwright-core` outside the project, uses the runner's Chrome/Chromium and uploads the resulting `cloudflare-browser-report.json` JSON as a seven-day GitHub Actions artifact.

`node --test tests/cloudflare-browser-diagnostics.test.mjs` performs offline checks for the selection of published media and interpretation of HTTP Range responses.

To run locally, install `playwright-core` and Chrome, then set `ARTDACI_PLAYWRIGHT_CORE` to the package directory if not resolvable from the project, and run:

```bash
node scripts/check-cloudflare-browser.mjs --output browser-review/cloudflare-browser-report.json
```

Interpretation: a result of `ok` is a successful sample in this headless browser; `warning` requires review, and `inconclusive` does not establish a failure. Seek/Range support is strongest when the server returns HTTP 206 and proper Content-Range headers. A response of HTTP 200 is not proof of broken playback, but indicates the Range was not honoured.

Do not alter cache policy, remote URLs, CORS or the source R2 objects solely on the basis of one CI result. Perform targeted physical-device checks if warnings persist.
