import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const migration = JSON.parse(await readFile(new URL("docs/production/migrations/cloudflare-media-2026-11-13.json", root), "utf8"));
const vg02 = JSON.parse(await readFile(new URL("content/media-manifests/artworks/vg02/manifest.json", root), "utf8"));

test("R2 migration record pins immutable keys to the local fallback bytes", async () => {
  assert.equal(migration.bucket, "artdaci-media");
  assert.equal(migration.publicBaseUrl, "https://media.artdaci.com/");
  assert.equal(migration.cacheControl, "public, max-age=31536000, immutable");
  assert.equal(migration.resources.length, 7);

  for (const resource of migration.resources) {
    const source = new URL(resource.source.replaceAll(" ", "%20"), root);
    assert.equal((await stat(source)).size, resource.bytes, resource.source);
    const hash = createHash("sha256").update(await readFile(source)).digest("hex");
    assert.equal(hash, resource.sha256, resource.source);
    assert.ok(resource.key.includes(`sha256-${resource.sha256.slice(0, 12)}`), resource.key);
  }
});

test("VG02 exposes the three short Masters Hub presentations through its canonical manifest", () => {
  for (const language of ["en", "fr", "ar"]) {
    const asset = vg02.media.audio.presentation[language];
    const migrationAsset = migration.resources.find(({ key }) => key === `artworks/vg02/${asset.path}`);
    assert.ok(migrationAsset, `${language} presentation migration`);
    assert.equal(asset.available, true);
    assert.equal(asset.migrationStatus, "published");
    assert.equal(asset.language, language);
    assert.equal(asset.bytes, migrationAsset.bytes);
    assert.equal(asset.sha256, migrationAsset.sha256);
  }
});

test("public consumers use the versioned R2 URLs while local files remain as fallbacks", async () => {
  const paintingGif = "https://media.artdaci.com/shared/images/artists/leonardo-da-vinci/profile/painting-mona-lisa--sha256-1813c0127cda.gif";
  for (const file of ["index.html", "index-fr.html", "index-ar.html"]) {
    assert.ok((await readFile(new URL(file, root), "utf8")).includes(paintingGif), file);
  }

  const tribute = await readFile(new URL("scripts/print-leonardo-tribute.js", root), "utf8");
  assert.ok(tribute.includes("https://media.artdaci.com/shared/images/artists/leonardo-da-vinci/profile/atelier-animation--sha256-af354c8b94d2.gif"));

  const museum = JSON.parse(await readFile(new URL("content/museums/national-gallery-of-art-washington.json", root), "utf8"));
  assert.match(museum.media.model, /^https:\/\/media\.artdaci\.com\/shared\/museums\/national-gallery-of-art-washington\/models\//);
  assert.match(museum.ar.compiledTarget, /^https:\/\/media\.artdaci\.com\/shared\/museums\/national-gallery-of-art-washington\/ar\//);
});
