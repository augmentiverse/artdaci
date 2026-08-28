# ARTDACI Experience Hub — Reference Model v1

Status: **frozen reference for the printed-book companion architecture**.

Validated baseline: commit `3068274c938be0f73a64040f9b708ad980831fc1` on branch `feat/experience-hub-mona-lisa` after successful Vercel validation of the permanent Mona Lisa route.

## Public URL contract

Printed QR codes must point only to stable ARTDACI routes:

`/x/{lang}/{publicId}`

Supported language codes in v1: `fr`, `en`, `ar`.

The public ID is permanent. It must never be renamed, recycled, or tied to a raw media filename. The destination, manifest and media resources may evolve without changing the printed QR.

## Registry contract

`content/registry.json` is the canonical resolver for permanent public IDs. Each entry identifies the resource type, manifest, slug, localized title, image and optional relationships such as an ARTDACI museum hub.

## Experience Hub contract

`experience.html` + `scripts/experience.js` render a data-driven hub from the registry and the referenced manifest.

A hub may expose audio, video, image-tracked AR, spatial 3D, VR, Living Book, museum context, an official external source and/or a print page. A capability is shown only when its manifest or registry data actually supports it. Missing capabilities must not silently fall back to another artwork.

## Media contract

Printed QR codes must never point directly to `.mp3`, `.m4a`, `.mp4`, `.glb`, `.mind` or temporary Vercel/GitHub deployment URLs. Media paths are implementation details behind the permanent Experience Hub.

## Leonardo permanent IDs

| Permanent ID | Work | Slug |
|---|---|---|
| `ldv-ml` | Mona Lisa / La Joconde | `mona-lisa` |
| `ldv-ls` | The Last Supper / La Cène | `last-supper` |
| `ldv-le` | The Lady with an Ermine / La Dame à l’hermine | `lady-with-an-ermine` |
| `ldv-an` | The Annunciation / L’Annonciation | `annunciation` |
| `ldv-gb` | Ginevra de’ Benci | `ginevra-de-benci` |
| `ldv-bf` | La Belle Ferronnière | `belle-ferronniere` |

These IDs are reserved permanently for ARTDACI.

## Vermeer permanent IDs

| Permanent ID | Work | Slug |
|---|---|---|
| `ver-gpe` | Girl with a Pearl Earring / La Jeune Fille à la perle | `vermeer-girl-with-a-pearl-earring` |
| `ver-mm` | The Milkmaid / La Laitière | `vermeer-milkmaid` |
| `ver-vd` | View of Delft / Vue de Delft | `view-of-delft` |
| `ver-ap` | The Art of Painting / L’Art de la peinture | `art-of-painting` |
| `ver-as` | The Astronomer / L’Astronome | `vermeer-astronomer` |
| `ver-wb` | Woman Holding a Balance / La Femme à la balance | `woman-holding-balance` |

These IDs are reserved permanently for ARTDACI.

## Museum permanent IDs currently in use

| Permanent ID | Museum |
|---|---|
| `mus-louvre` | Musée du Louvre |
| `mus-czartoryski` | Princes Czartoryski Museum |
| `mus-mauritshuis` | Mauritshuis |

## Extension rule

New works must receive a permanent ID first, then an individual object manifest, then a registry entry. The same Experience Hub template is reused; no artwork-specific HTML page should be required for the QR entry point.
