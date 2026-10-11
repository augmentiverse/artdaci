# ARTDACI — GLB model migration and R2 publication

**Date:** 2026-10-11  
**Branch:** `feature/artdaci-four-models-20261011`  
**Policy:** Preserve current experiences and older R2 objects. Do not claim publication until the new assets have been uploaded and verified.

## Four requested files

| Artwork ID | Role | Local Git asset | Cloudflare R2 destination | Bytes |
|---|---|---|---|---:|
| `vg01` | 1889 self-portrait model | `assets/artists/vincent-van-gogh/artworks/self-portrait/models/van-gogh_self-portrait.glb` | `artworks/vg01/models/van-gogh_self-portrait.glb` | 2,782,692 |
| `vg01` | Standing Van Gogh | `assets/artists/vincent-van-gogh/artworks/self-portrait/models/van-gogh_standing.glb` | `artworks/vg01/models/van-gogh_standing.glb` | 4,562,864 |
| `ve01` | Standing Girl with a Pearl Earring | `assets/artists/johannes-vermeer/artworks/girl-with-a-pearl-earring/models/girl-pearl_standing.glb` | `artworks/ve01/models/girl-pearl_standing.glb` | 3,032,692 |
| `ve02` | View of Delft | `assets/artists/johannes-vermeer/artworks/view_of_delft/models/view-of-delft.glb` | `artworks/ve02/models/view-of-delft.glb` | 3,118,640 |

Git already contains all four exact binary files, so the new Vercel Preview can test locally served assets without downloading a second copy into the repository.

## User-facing integration

- **Van Gogh:** replace the old portrait and standing variants in both AR-on-image and Space AR; individual VR uses the same artwork variant source. Replace all relevant gallery and cinema standing model references and the Van Gogh guide in Masters Hub. Preserve the separate Bedroom-standing variant.
- **Girl with a Pearl Earring:** retain portrait and sitting choices, add a localized third **standing** choice in AR and Space AR, and a distinct 3D Collection card.
- **View of Delft:** add an actual 3D model to the 3D Collection, the Vermeer VR gallery's 3D exhibits, and a Space AR destination (`space.html?painting=view-of-delft&lang=fr`). Do not pretend that an image-tracked AR target or individual VR scene exists; offer the Vermeer gallery as an alternative.
- **3D Collection:** add three cards (Van Gogh self-portrait, the new standing Vermeer girl and View of Delft) to the existing three artwork cards. The existing standing Van Gogh card points to the requested standing GLB. FR/EN/AR labels are provided.

## Cloudflare R2 staging

The new model keys are registered as `available:false`, `migrationStatus:"planned"` in the checked-in manifests for `vg01`, `ve01`, `ve02`. This is **intentional**: the Cloudflare R2 upload has **not yet been executed/confirmed** from this ChatGPT connection. Claiming `published` would cause clients to mistake nonexistent objects for working versions.

WebXR and Space AR now map the new variants to R2 keys `models.portrait-2026`, `models.standing-2026`, `models.delft-2026`. The existing loaders fall back to local Vercel assets when those R2 keys are absent, so **old R2 portrait/standing versions cannot silently override the requested replacements**.

### Complete R2 upload from a machine with configured rclone

PowerShell **7+** and an existing working rclone Cloudflare R2 remote are needed. Use the actual rclone remote/bucket as `-RemotePrefix` — the script does not guess the bucket or request credentials in chat.

```powershell
# From the checked-out feature branch's repository root.
pwsh ./scripts/publish-four-models-r2.ps1 -RemotePrefix "YOUR_REMOTE:YOUR_BUCKET"
# Check dry-run paths and SHA-256 hashes, then publish:
pwsh ./scripts/publish-four-models-r2.ps1 -RemotePrefix "YOUR_REMOTE:YOUR_BUCKET" -Publish
```

The script validates the three existing remote manifest IDs **before** any upload, uploads to four **new** object keys (no old key is overwritten), downloads each file and compares byte length and SHA-256, merges only new entries into the existing remote manifests, downloads and checks those manifests, and updates the three local manifest JSON files after verification. Review and commit the resulting three changed manifest files to the feature branch.

The app's existing CDN, cache and CORS settings should be checked after upload. Ensure model responses have the MIME type `model/gltf-binary`. The previous R2 models remain available as rollback assets.

**No R2 credentials are embedded in the repository or log output.**

## Verification checklist before production

1. Run `node --test tests/four-models-integration.test.mjs`.
2. Run `node --test tests/immersive-routing.test.mjs` and the applicable Masters Hub checks.
3. On the feature Preview open the 3D Collection in all 3 languages; select all four new/replaced models.
4. Open `space.html?painting=van-gogh&lang=fr` and select portrait / standing / Bedroom; open `space.html?painting=vermeer-girl-with-a-pearl-earring&lang=fr` and select standing; open `space.html?painting=view-of-delft&lang=fr` and verify the model and no unsupported AR/VR links.
5. In Meta Quest 3S, verify Van Gogh in individual VR and the gallery; verify standing model orientation, reachability, collision comfort and texture rendering. Verify the Vermeer exhibit and View of Delft.
6. Check Masters Hub Van Gogh guide height, feet placement and gesture controls.
7. After R2 publishing, test actual CDN URLs for HTTP 200/GLB content type, re-run model tests and confirm fallback.
8. **Merge only after validating** compatibility with separate Semantic V3 (#13) and consolidation (#14) PRs. Do not overwrite those unmerged branches.

## Known limitations

- Cloudflare R2 **cannot be published through the currently connected tools**: the repeatable rclone script is prepared, but the upload itself needs a configured Cloudflare R2 connection.
- Runtime browser/device tests are not the same as file/manifest checks and remain necessary.
- These are artistic 3D interpretations, not claims of faithful geometric reconstruction.
