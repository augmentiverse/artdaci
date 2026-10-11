# ARTDACI — Consolidation phase 1 (11 October 2026)

**Scope:** factual corrections, stable artwork URLs, provenance audit register, media-state honesty, offline clarity, and lightweight regression checks.

**Safety:** Feature branch only. Do not merge into `main` or deploy to `artdaci.com` without reviewing the Preview and the Meta Quest 3S path.

## Changes

1. **Van Gogh self-portrait 1889, Musée d'Orsay.** The VR gallery descriptions (EN, FR, AR) no longer describe the 1887 Paris self-portrait. The 1889 identification was verified with the authoritative collection record: <https://www.musee-orsay.fr/en/artworks/portrait-de-lartiste-747> (RF 1949 17). The collection artwork, date, museum and self-portrait text align with `content/paintings/van-gogh.json` and `content/semantics/artwork-concepts.json`.
2. **24 stable work URLs.** Every published media manifest already declares `https://artdaci.com/a/{artworkId}`, but the repository had no handler for that route. `vercel.json` now rewrites these URLs to `api/artwork-redirect.js`, which redirects **only the 24 active IDs** to working, preexisting printable pages. An explicit mapping handles cases where the catalogue slug differs from the print page slug. Language `en`, `fr`, `ar` is supported; unknown IDs return 404 and disallowed HTTP methods return 405. No historical `pageUrl` or QR identifier is changed.
3. **Media status.** The Arabic overview for `vg02` is explicitly recorded as `planned`, `available:false`. This is a tracking change, **not** audio production or R2 publication. It must not be advertised as playable.
4. **Editorial provenance.** `content/editorial/provenance-review.json` inventories the 16 entries from `content/paintings/additional-16.json` with their currently claimed museum and media image path. All formal source citations and reproduction rights remain `pending`, with null fields, until verified. An artwork's public-domain status is not proof that every photographic/audio/3D derivative has been licensed.
5. **Offline.** `offline.html` offers accessible EN/FR/AR offline messaging; PWA v7 now directs failed uncached navigation there rather than returning a misleading home page. Large media remain network-dependent.
6. **Cache activation.** The gallery loads `gallery-vr.js?v=179` to avoid stale descriptions. Service worker cache version incremented from v6 to v7.
7. **QA.** `tests/artdaci-consolidation-phase1.test.mjs` contains six focused regression suites. `.github/workflows/artdaci-quality.yml` runs those and the media manifest core tests on relevant PRs using sparse checkout to avoid downloading the 1.7 GiB collection of tracked media.

## Precautions / unfinished work

- **R2 verification:** the physical Arabic `vg02` audio asset has not been confirmed; do not mark it published until a verified object, hash and right to distribute are documented.
- **Editorial licenses:** 16 records remain pending. Obtain authoritative museum records and the image/video/audio/3D source licenses individually. No clearance is presumed by this phase.
- **Deep links:** test `/a/ld01?lang=fr`, `/a/ve01?lang=ar`, `/a/vg01`, `/a/mo06?lang=en`, and an unknown `/a/zz99` in the deployed **Preview** before merging. Verify that browser/Vercel route rewriting carries `lang`.
- **Cache:** verify offline state after service worker activation, then repeat with one cached page and one uncached page.
- **History:** do not replace historical V1 print addresses or external QR targets.
- **Other ongoing work:** Semantic V3 has a separate draft pull request. The consolidation branch intentionally starts at `main` and does not contain Semantic V3. Reconcile both changes before a future production release.
- **Performance and maintenance:** asset optimization, R2 migration, large VR gallery module extraction and expanding the 4 reviewed semantic profiles to all 24 active works require separate, staged work and additional testing.

## Checks

```sh
node --test tests/artdaci-consolidation-phase1.test.mjs
node --test tests/artwork-media-manifest-core.test.mjs
```

**Required manual QA:** Preview deploy READY, links and editorial copy in FR/EN/AR, Quest 3S VR Gallery, offline behavior, then explicit sign-off for merging. No production changes in this phase.
