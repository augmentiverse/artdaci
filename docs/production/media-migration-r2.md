# ARTDACI media migration — Cloudflare R2

Status: **production migration plan; no media is deleted from GitHub by this document.**

## Goal

Keep the permanent printed-book contract unchanged:

`https://artdaci.com/x/{lang}/{publicId}`

while moving heavy delivery assets out of the Git repository to object storage served from:

`https://media.artdaci.com/`

The Experience Hub, AR viewer and spatial 3D viewer consume media paths from manifests. They can therefore move from repository-relative paths to absolute HTTPS media URLs without changing printed QR codes.

## Storage boundary

### Keep in GitHub

- HTML, CSS and JavaScript
- `content/*.json` manifests and `content/registry.json`
- `.mind` image-tracking targets
- UI icons, logos and small thumbnails
- lightweight project documentation and configuration

### Move to R2 progressively

- `.glb`, `.gltf`, `.usdz`
- `.mp4`, `.webm`
- large `.mp3`, `.m4a`, `.wav`
- 360° panoramas and large VR textures
- high-resolution master images that are not required as lightweight app shell assets

## Canonical object-key scheme

Use lowercase ASCII paths for all new R2 object keys, even when legacy GitHub filenames contain accents or Arabic characters.

Examples:

```text
leonardo/mona-lisa/3d/mona-lisa.glb
leonardo/mona-lisa/3d/mona-lisa-out-of-frame.glb
leonardo/mona-lisa/audio/fr-guide.m4a
leonardo/mona-lisa/audio/en-guide.m4a
leonardo/mona-lisa/audio/ar-overview.mp3
leonardo/mona-lisa/video/reimagined.mp4

vermeer/girl-with-a-pearl-earring/3d/portrait.glb
vermeer/girl-with-a-pearl-earring/audio/fr-guide.m4a

van-gogh/self-portrait/3d/portrait.glb
van-gogh/the-bedroom/3d/room.glb

museums/louvre/3d/louvre.glb
museums/mauritshuis/3d/mauritshuis.glb
```

The filename in R2 is an implementation detail. The stable public identifier remains the `/x/...` URL.

## Required CORS policy

R2 must allow browser GET/HEAD access from the production site and temporary preview origins used during migration.

Production origins:

```text
https://artdaci.com
https://www.artdaci.com
```

During migration, Vercel preview URLs may also be allowed temporarily. Development can additionally allow `http://localhost:*` if needed.

Recommended methods and headers:

```text
Methods: GET, HEAD
Allowed headers: Range, Content-Type
Expose headers: Content-Length, Content-Range, Accept-Ranges, ETag
```

Do not use a wildcard production CORS policy if the bucket later contains private or editorial material.

## Content types

Objects must be uploaded with correct metadata:

| Extension | Content-Type |
|---|---|
| `.glb` | `model/gltf-binary` |
| `.gltf` | `model/gltf+json` |
| `.mp4` | `video/mp4` |
| `.webm` | `video/webm` |
| `.mp3` | `audio/mpeg` |
| `.m4a` | `audio/mp4` |
| `.jpg` / `.jpeg` | `image/jpeg` |
| `.png` | `image/png` |
| `.webp` | `image/webp` |

Large video and audio objects should support byte-range requests.

## Cache policy

Prefer versioned/immutable R2 object keys. Example:

`leonardo/mona-lisa/3d/v1/mona-lisa.glb`

For immutable files, use a long-lived cache policy. When a file changes materially, upload a new object key and update only the manifest. The permanent QR remains untouched.

## Migration sequence

1. Upload/copy the selected files to R2; do not remove GitHub originals.
2. Verify each `https://media.artdaci.com/...` URL directly over HTTPS.
3. Update one manifest on the feature branch to use the R2 URLs.
4. Let `Experience Hub integrity` and Vercel Preview run.
5. Test Experience Hub, audio/video, image-tracked AR and spatial 3D on desktop and a real phone.
6. Repeat for the next experience only after the pilot passes.
7. Keep GitHub originals during a rollback window.
8. Remove migrated binaries from GitHub in a later dedicated cleanup PR, after checking that no HTML/JS/JSON still references them.

## Pilot order

### Wave 1 — Mona Lisa (`ldv-ml`)

This is the gold-master pilot because its permanent route and complete experience have already been validated.

Priority referenced assets include:

- primary and variant GLB files in `assets/artists/leonardo-da-vinci/artworks/mona-lisa/models/`
- short FR/EN guides and long-language overview audio in `.../mona-lisa/media/`
- `assets/animations/artdaci-Mona_Lisa_animation.mp4`
- `.../mona-lisa/media/mona-lisa-video.mp4`

Do not migrate unrelated legacy videos in the same directory merely because they are large; migrate files that current manifests actually reference first.

### Wave 2 — complete existing experiences

- `ver-gpe` — Girl with a Pearl Earring
- `vg-sp` — Van Gogh Self-Portrait
- `vg-br` — The Bedroom
- `mon-is` — Impression, Sunrise

### Wave 3 — museum architecture

- `mus-louvre`
- `mus-czartoryski`
- `mus-mauritshuis`
- `mus-vangogh`
- `mus-orsay`

Keep their `.mind` targets in GitHub initially; migrate their GLB architecture files.

### Wave 4 — newly enriched works

When one of the remaining works receives audio, video, AR targets or 3D models, add the capability to its manifest and store new heavy media directly in R2 rather than recommitting it to GitHub.

## Current large-file signals

The repository already contains individual referenced assets in the tens of megabytes, including Mona Lisa and Van Gogh GLBs and long audio files. For example, the current primary Mona Lisa GLB is about 21.7 MB, the Van Gogh self-portrait GLBs are roughly 25–28 MB each, and the Bedroom primary GLB is roughly 36.6 MB. Several long MP3 guides are about 18–28 MB each.

This is sufficient to justify moving runtime media delivery out of the Git repository.

## Compatibility note

The current AR engine assigns manifest URLs directly to MindAR, `GLTFLoader`, HTML video/audio and Three.js textures; the spatial viewer assigns manifest model URLs directly to `<model-viewer>`. Absolute HTTPS R2 URLs are therefore compatible with the existing loading model. The critical external requirement is correct CORS and Content-Type metadata.

## Rollback rule

Every migration commit must be reversible by changing only manifest URLs back to their previous GitHub-relative paths. Do not mix media deletion into the same commit that changes delivery URLs.

## Integrity rule

Run before merging:

```bash
node tools/validate-experience-registry.mjs
```

For a full local clone with media present, generate a media footprint report with:

```bash
node tools/audit-experience-media.mjs
```
