# ARTDACI — Homepage visual assets: audit and review

9 November 2026 · Work-in-progress, not approved artwork replacements.

All 24 source image paths used by the painting Index exist in the GitHub repository. Their total size is approximately 5.84 MiB. The original wordmark image assets/varia/artdaci-logo.png weighs approximately 2.43 MiB, making it a strong optimization candidate.

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
