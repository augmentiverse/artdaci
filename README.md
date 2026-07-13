# DACIART WebAR Art Book

This repository is a GitHub Pages-ready prototype for an augmented reality art book. The first implemented spread is Leonardo da Vinci's **Mona Lisa**.

## What Is Included

- `index.html` - book landing page and first spread preview.
- `ar.html` - live WebAR viewer using MindAR and Three.js.
- `print-target.html` - printable/scannable Mona Lisa target page.
- `print-van-gogh.html` - printable/scannable Van Gogh target page.
- `compile-target.html` - browser utility to generate `assets/targets/van-gogh.mind`.
- `assets/paintings/mona-lisa/mona-lisa.jpg` - printed target image.
- `assets/paintings/mona-lisa/mona-lisa.glb` - 3D model loaded in AR.
- `assets/paintings/van-gogh/van-gogh__Portrait.jpg` - Van Gogh printed target image.
- `assets/paintings/van-gogh/van-gogh__Portrait.glb` - Van Gogh 3D model loaded in AR.
- `assets/targets/mona-lisa.mind` - compiled MindAR image target.
- `content/paintings/mona-lisa.json` - structured painting data record.
- `content/paintings/van-gogh.json` - structured Van Gogh painting data record.
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

## How To Upload To GitHub Pages

1. Create a new GitHub repository.
2. Upload all files and folders from this project root.
3. In the repository, go to **Settings > Pages**.
4. Set **Source** to deploy from the `main` branch root.
5. Open the published GitHub Pages URL.
6. Open `print-target.html` on a second device or print it.
7. Open `ar.html` on your phone and scan the Mona Lisa image.

For Van Gogh:

1. Open `compile-target.html`.
2. Click **Generate van-gogh.mind**.
3. Save the downloaded file as `assets/targets/van-gogh.mind`.
4. Upload that file to GitHub.
5. Open `print-van-gogh.html` on a second screen or print it.
6. Open `ar.html?painting=van-gogh` and scan the Van Gogh portrait.

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
5. Add the new slug to the `PAINTINGS` registry in `scripts/ar-viewer.js`.

The current viewer already supports loading by query string:

```text
ar.html?painting=mona-lisa
ar.html?painting=van-gogh
```

## Regenerating The MindAR Target

This prototype already includes `assets/targets/mona-lisa.mind`.

If you replace the image, regenerate the target with the MindAR image compiler. You can use the official compiler workflow from the MindAR documentation:

https://hiukim.github.io/mind-ar-js-doc/

## Production Next Steps

- Add a painting selector and query-string routing.
- Compress and optimize GLB files.
- Add audio guide files and subtitles.
- Add institutional localization files.
- Add WebXR immersive mode for compatible headsets.
- Add analytics only after privacy review.
