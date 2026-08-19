# DACIART WebAR Art Book

This repository is a GitHub Pages-ready prototype for an augmented reality art book. It includes a print-first collection index, three catalogue spreads, image-tracked WebAR, room-placement AR, bilingual entry points, QR access, and data-driven painting manifests.

## What Is Included

- `index.html` - English collection companion with searchable data-driven painting index.
- `index-fr.html` - French collection companion with the same interactive index.
- `ar.html` - live WebAR viewer using MindAR and Three.js.
- `space.html` - room-placement viewer for placing a GLB model in the user's space on compatible AR browsers.
- `print-target.html` - rich printable Mona Lisa catalogue spread.
- `print-van-gogh.html` - rich printable Van Gogh catalogue spread.
- `print-van-gogh-bedroom.html` - rich printable Van Gogh bedroom catalogue spread.
- `scripts/catalogue.js` - manifest-driven catalogue UI with search, filtering, comparison, stats, and learning prompts.
- `assets/paintings/Da Vinci/mona-lisa/images/mona-lisa.jpg` - printed target image.
- `assets/paintings/Da Vinci/mona-lisa/mona-lisa.glb` - 3D model loaded in AR.
- `assets/paintings/van-gogh/reimagined-photos/van-gogh__Portrait.jpg` - Van Gogh printed target image.
- `assets/paintings/van-gogh/van-gogh__Portrait.glb` - Van Gogh 3D model loaded in AR.
- `assets/targets/mona-lisa.mind` - compiled MindAR image target.
- `content/paintings/mona-lisa.json` - structured painting data record.
- `content/paintings/van-gogh.json` - structured Van Gogh painting data record.
- `content/paintings/van-gogh-bedroom.json` - structured Van Gogh bedroom painting data record.
- `vendor/` - local copies of Three.js, GLTFLoader, and MindAR used by the AR viewer.
- `AR_Art_Book_Concept.md` - full product and editorial concept.

## How To View Locally

Camera-based WebAR usually will not work from a `file://` URL. Use a local server:

```bash
python -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

On a phone, the easiest route is to upload to GitHub Pages because camera access requires HTTPS on most mobile browsers.

## Installable WebXR Prototype

ARTDACI includes a Progressive Web App shell for the collection, VR gallery, and VR cinema:

- `manifest.webmanifest` describes the installable application and its shortcuts.
- `sw.js` caches only the lightweight application shell.
- `scripts/pwa.js` registers the service worker and shows an install button when the browser exposes an installation prompt.
- Heavy GLB, video, music, audio, MindAR, and ranged media requests deliberately remain network-loaded instead of filling the offline cache.

To test installation:

1. Publish the repository over HTTPS, or serve it from `localhost` during desktop development.
2. Visit `gallery-vr.html` in a compatible browser.
3. Use the **Install ARTDACI** prompt when it appears, or use the browser's installation menu.
4. Launch the installed application; it opens directly in the VR gallery.
5. On Meta Quest, open the HTTPS deployment in Quest Browser and use **Enter VR Gallery** to start the WebXR session.

The service worker provides an offline application shell, not a fully offline museum. Gallery images, models, audio, and video continue to stream on demand so the initial installation stays small and Quest memory remains manageable. A store-distributed Quest APK would still require a native Android wrapper or a Unity/Meta XR build.

## How To Upload To GitHub Pages

1. Create a new GitHub repository.
2. Upload all files and folders from this project root.
3. In the repository, go to **Settings > Pages**.
4. Set **Source** to deploy from the `main` branch root.
5. Open the published GitHub Pages URL.
6. Open `print-target.html` on a second device or print it.
7. Open `ar.html` on your phone and scan the Mona Lisa image.

For Van Gogh, open `print-van-gogh.html` as the printed catalogue spread, then use `ar.html?painting=van-gogh` only when you want the optional AR layer.
For Van Gogh's bedroom, open `print-van-gogh-bedroom.html`, then use `ar.html?painting=van-gogh-bedroom`.

## Important Browser Notes

- Use HTTPS for camera access.
- On iOS, use Safari.
- On Android, use Chrome.
- Allow camera permission when prompted.
- Use good lighting and keep the image target flat.
- Upload the `vendor/` folder. The AR viewer uses local libraries so it can work even when external CDNs are blocked.

## Adding Another Painting

1. Add the painting image to `assets/paintings/{slug}/{slug}.jpg`.
2. Add the GLB model to `assets/paintings/{slug}/{slug}.glb`.
3. Generate a MindAR target file and save it to `assets/targets/{slug}.mind`.
4. Add a JSON record in `content/paintings/{slug}.json`.
5. Add the new slug to the `PAINTINGS` registry in `scripts/ar-viewer.js` and `scripts/space-viewer.js`.
6. Add the manifest path to the `data-manifests` attribute in `index.html` and `index-fr.html`.

The current viewer already supports loading by query string:

```text
ar.html?painting=mona-lisa
ar.html?painting=van-gogh
space.html?painting=mona-lisa
space.html?painting=van-gogh
space.html?painting=van-gogh-bedroom
ar.html?painting=van-gogh-bedroom
```

`space.html` uses model-viewer room placement. Android Chrome can place GLB models directly. iPhone Safari generally needs USDZ files for native room placement; add `media.usdz` to a painting manifest when a USDZ conversion is available. If the model-viewer library is blocked by the browser or network, the page falls back to direct GLB/USDZ links plus the printed page and image AR routes.

## Regenerating The MindAR Target

This prototype already includes `assets/targets/mona-lisa.mind`.

If you replace the image, regenerate the target with the MindAR image compiler. You can use the official compiler workflow from the MindAR documentation:

https://hiukim.github.io/mind-ar-js-doc/

This repo also includes `compile-target.html` as a developer utility for generating a new `.mind` target during production. It is not part of the reader-facing book experience.

## Production Next Steps

- Compress and optimize GLB files.
- Add audio guide files and subtitles for every painting.
- Add institutional localization files for full bilingual parity.
- Add WebXR immersive mode for compatible headsets.
- Vendor `model-viewer` locally if the project must work without CDN access.
- Add automated link, JSON, and browser smoke tests.
- Add analytics only after privacy review.
