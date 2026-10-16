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


## New: View of Delft MindAR image target — supplied, pending Git staging

Both exact authored files have now been supplied as attachments and validated in
the working environment (11 October 2026), but they have **not yet been
committed as binary files to GitHub**, and **have not been uploaded to R2**.

- `view-of-delft.mind` — 561,730 bytes, SHA-256 `112684ff6ceb17b075d51daa48e48ec21cc9d0b2a362f0da267f7b11364f6dcb`;
  MindAR version **2**, **one target**, target dimensions **1374 × 1145**.
- `ve02-view-of-delft-web.webp` — 98,008 bytes, SHA-256 `828ddd6ee4612320978c3d485a4002f749634ab3b9951917405af2c829a46d50`;
  valid WebP, actual image dimensions **1374 × 1145**.

The dimensions match exactly. Target recognition and 3D orientation still require
an actual phone test. A downloadable ZIP with both assets was prepared in the
conversation, keeping the required Git paths. After installing these files
into this feature branch, run:

```powershell
.\scripts\activate-view-of-delft-mindar.ps1
node --test tests/four-models-integration.test.mjs tests/immersive-routing.test.mjs
git add assets/targets/view-of-delft.mind assets/artists/johannes-vermeer/artworks/view_of_delft/images/ve02-view-of-delft-web.webp scripts/immersive-routing.js scripts/ar-viewer.js content/paintings/view-of-delft.json tests/four-models-integration.test.mjs tests/immersive-routing.test.mjs
git commit -m "feat(ve02): activate verified Delft MindAR tracking"
git push origin feature/artdaci-four-models-20261011
```

The activation verifies both files' SHA-256 hashes, enables AR image tracking,
updates the print/reference image to the genuine matching WebP, and
adjusts the regression assertions. Once the Preview confirms image recognition,
publish the two canonical keys to R2 using
`scripts/publish-view-of-delft-ar-r2.ps1` with verified rclone credentials.
There is no direct R2 upload or binary GitHub upload capability in the current connection.

## Previous staging status

The author has specified these exact paths:

- Image target: \`assets/targets/view-of-delft.mind\`.
- Tracking image: \`assets/artists/johannes-vermeer/artworks/view_of_delft/images/ve02-view-of-delft-web.webp\`.
- AR model: \`assets/artists/johannes-vermeer/artworks/view_of_delft/models/view-of-delft.glb\` (already present).

**At the time of the change, neither the .mind nor this .webp was present in the Git tree.** Do not fabricate a .mind file, substitute a different tracking target, or claim that an unverified Cloudflare image is the exact image used for target generation.

The painting manifest \`content/paintings/view-of-delft.json\` now declares \`ar.compiledTarget\`, \`ar.imageTarget\`, \`ar.primaryModel\`, \`ar.modelVariants\` and a conservative viewer transform. The AR preview uses the **exact authored WebP path** specified by the user. That image must be delivered before the AR route becomes public. The older collection image remains on the existing print page until the authored WebP is available, and must not be represented as the target used to compile `.mind`. The remote \`ve02\` manifest has \`media.ar.target\` and \`media.images.tracking-source\` entries with \`available:false\`, \`migrationStatus:"planned"\`. The image's existing Cloudflare location has not been independently verified or mapped to this canonical key.

The AR viewer and \`ar.html\` recognize the canonical \`ve02\` manifest and its target/image/model keys. The publicly advertised image-tracking route \`resolveImmersiveArtworkRoute("ve02","ar")\` intentionally remains **disabled** pending the real binary assets. Space AR already supports the model, and its Image AR link will appear automatically once the route is enabled.

### Publish the missing files and activate

1. Place the genuine authored \`.mind\` and the exact source \`.webp\` at the two paths above in this **feature branch**. Do not commit placeholders.
2. From a working Cloudflare rclone installation, execute the dry run:
   \`\`\`powershell
   pwsh ./scripts/publish-view-of-delft-ar-r2.ps1 -RemotePrefix "YOUR_REMOTE:YOUR_BUCKET"
   \`\`\`
   Then execute with \`-Publish\`. The script uploads only the two canonical new keys, checks remote bytes and SHA-256 against local files, then merges/rechecks the R2 manifest and stages the verified local manifest values. If the image is already present under another R2 key, identify that precise key and compare the actual SHA-256 before deciding to copy it or to reference it. No speculative URL or published status should be inserted.
3. Change \`ve02\` to \`ar:true\` in \`scripts/immersive-routing.js\`, **only after target/image availability and a positive MindAR recognition test**. Refresh its import version if necessary.
4. Replace \`print.imageTargetSource\` and \`media.image\` by the verified image as appropriate for the tracking instructions/printed page, after confirming that it is the image used to compile \`view-of-delft.mind\`. Avoid showing a different edition of the painting as the scanned target.
5. Verify \`ar.html?painting=view-of-delft&lang=fr\` on a camera-capable phone, with target acquisition, stable anchoring, 3D loading and fallback/permissions handling. Repeat EN and AR.
6. Re-run \`node --test tests/four-models-integration.test.mjs\` and amend the staging guard tests as part of activation. Test the user-visible catalogue, print page, Space AR and Masters Hub entry points. Keep Vercel Preview until validated.

**Note:** \`view-of-delft.mind\` is a **compiled tracking asset**, not a geometric model. The GLB is the 3D representation that the tracker reveals. The matching source image is essential to recognizing the painting reliably.


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
