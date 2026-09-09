import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { resolveArtworkAudioOverview } from "../scripts/artwork-media-manifest.js?audio-overview-test";

const root = new URL("../", import.meta.url);
const migration = JSON.parse(await readFile(new URL("docs/production/migrations/living-book-audio-overviews-r2.json", root), "utf8"));
const [book, gallery, ar, arHtml, print, catalogue, space] = await Promise.all([
  readFile(new URL("scripts/book-3d.js", root), "utf8"),
  readFile(new URL("scripts/gallery-vr.js", root), "utf8"),
  readFile(new URL("scripts/ar-viewer.js", root), "utf8"),
  readFile(new URL("ar.html", root), "utf8"),
  readFile(new URL("scripts/print-artwork.js", root), "utf8"),
  readFile(new URL("scripts/catalogue.js", root), "utf8"),
  readFile(new URL("scripts/space-viewer.js", root), "utf8"),
]);
const manifestFiles = new Map([
  ["ld01", "content/media-manifests/artworks/ld01/manifest.json"],
  ["ld02", "content/media-manifests/artworks/ld02/manifest.json"],
  ["ve01", "content/media-manifests/artworks/ve01/manifest.json"],
  ["ve05", "content/media-manifests/artworks/ve05/manifest.json"],
  ["vg01", "content/media-manifests/artworks/vg01/manifest.json"],
  ["vg02", "content/media-manifests/artworks/vg02/manifest.json"],
  ["mo01", "content/media-manifests/artworks/mo01/manifest.json"],
  ["mo02", "content/media-manifests/artworks/mo02/manifest.json"],
]);
const manifests = new Map(await Promise.all([...manifestFiles].map(async ([id, path]) => (
  [id, JSON.parse(await readFile(new URL(path, root), "utf8"))]
))));
const unpublishedLocalNames = [
  "Secrets_Hiding_in_Lady_with_an_Ermine.mp3",
  "Secrets_de_la_Dame_à_l_hermine.mp3",
  "بصمات_دافنشي_ولغز_سيدة_مع_قاقم.mp3",
  "Vermeer’s_the_Astronom.mp3",
  "vermeer_l_astronome.mp3",
  "أسرار_العلم_والإيمان_في_لوحة_عالم_الفلك (1).mp3",
  "How_Monet_s_Argenteuil_Bridges_Birthed_Modern_Art.mp3",
  "La_lumière_pure_du_Pont_d_Argenteuil.mp3",
  "جسر_أرجنتوي_وشرارة_الفن_الانطباعي.mp3",
];

function audioManifest({ id = "aa01", language = "en", available = true, mimeType = "audio/mpeg" } = {}) {
  return {
    id,
    defaultLanguage: "en",
    mediaBaseUrl: `https://media.artdaci.com/artworks/${id}/`,
    sharedMediaBaseUrl: "https://media.artdaci.com/shared/",
    media: {
      audio: {
        overview: {
          [language]: {
            scope: "artwork",
            path: `audio/${language}/overview.mp3`,
            mimeType,
            available,
            migrationStatus: available ? "published" : "planned",
            language,
          },
        },
      },
    },
  };
}

test("manifest-first overview resolution accepts only an available exact-language MP3", async () => {
  const calls = [];
  const manifest = audioManifest({ id: "aa01", language: "fr" });
  const result = await resolveArtworkAudioOverview({
    artworkId: "aa01",
    language: "fr-FR",
    fetchManifest: async (url) => {
      calls.push(url);
      return manifest;
    },
  });

  assert.equal(result, "https://media.artdaci.com/artworks/aa01/audio/fr/overview.mp3");
  assert.deepEqual(calls, ["https://media.artdaci.com/artworks/aa01/manifest.json"]);
});

test("planned, missing, invalid and failed manifests never expose audio", async () => {
  assert.equal(await resolveArtworkAudioOverview({
    artworkId: "aa02",
    language: "en",
    fetchManifest: async () => audioManifest({ id: "aa02", available: false }),
  }), null);
  assert.equal(await resolveArtworkAudioOverview({
    artworkId: "aa03",
    language: "fr",
    fetchManifest: async () => audioManifest({ id: "aa03", language: "en" }),
  }), null);
  assert.equal(await resolveArtworkAudioOverview({
    artworkId: "aa04",
    language: "en",
    fetchManifest: async () => audioManifest({ id: "wrong-id" }),
  }), null);
  assert.equal(await resolveArtworkAudioOverview({
    artworkId: "aa05",
    language: "en",
    fetchManifest: async () => audioManifest({ id: "aa05", mimeType: "audio/mp4" }),
  }), null);
  assert.equal(await resolveArtworkAudioOverview({
    artworkId: "aa06",
    language: "en",
    fetchManifest: async () => { throw new Error("network"); },
  }), null);
  assert.equal(await resolveArtworkAudioOverview({ language: "en" }), null);
});

test("the six published overviews resolve and the other fifteen stay planned", async () => {
  const published = [
    ["ve01", "fr"],
    ["vg01", "en"], ["vg01", "fr"],
    ["mo01", "en"], ["mo01", "fr"], ["mo01", "ar"],
  ];

  for (const [id, language] of published) {
    const result = await resolveArtworkAudioOverview({
      artworkId: id,
      language,
      fetchManifest: async () => manifests.get(id),
    });
    assert.equal(result, `https://media.artdaci.com/artworks/${id}/audio/${language}/overview.mp3`);
  }

  assert.equal(migration.status, "planned");
  assert.equal(migration.resources.length, 15);
  assert.equal(new Set(migration.resources.map(({ destination }) => destination)).size, 15);
  for (const resource of migration.resources) {
    assert.match(resource.destination, /^artworks\/(?:ld01|ld02|ve05|ve01|vg02|mo02)\/audio\/(?:en|fr|ar)\/overview\.mp3$/);
    assert.equal(resource.destination.includes(".."), false);
    assert.equal(resource.mimeType, "audio/mpeg");
    const manifest = manifests.get(resource.artworkId);
    const asset = manifest.media.audio.overview[resource.language];
    assert.equal(asset.available, false);
    assert.equal(asset.migrationStatus, "planned");
    assert.equal(asset.path, `audio/${resource.language}/overview.mp3`);
  }
});

test("active editorial JSON no longer exposes the nine untracked MP3 files", async () => {
  const activePaths = [
    "content/paintings/additional-16.json",
    "content/paintings/lady-with-an-ermine.json",
    "content/paintings/pont-d-argenteuil.json",
  ];
  const activeSources = await Promise.all(activePaths.map((path) => readFile(new URL(path, root), "utf8")));

  for (const filename of unpublishedLocalNames) {
    assert.equal(activeSources.some((source) => source.includes(filename)), false, filename);
  }
});

test("generic print exposes no local fallback and creates audio only after interaction", () => {
  assert.match(print, /resolveArtworkAudioOverview\(\{/);
  assert.doesNotMatch(print, /media\?\.audioOverviews|overview\.src/);
  assert.match(print, /audioOverviewUrl \? `<button/);
  assert.match(print, /button\.addEventListener\("click", \(\) => \{\s*if \(!audio\) \{\s*audio = new Audio\(\)/);
  assert.match(print, /audio\.preload = "none"/);
  assert.doesNotMatch(print, /autoplay/);
});

test("catalogue and Spatial expose only exact-language manifest audio", () => {
  for (const source of [catalogue, space]) {
    assert.match(source, /resolveArtworkAudioOverview/);
    assert.doesNotMatch(source, /media\?\.audioOverviews|media\?\.audioOverview/);
  }
  assert.match(catalogue, /audioOverviewUrl \? `<a class="button"/);
  assert.match(space, /if \(!actions \|\| !audioOverviewUrl\) return/);
  assert.match(space, /player\.preload = "none"/);
  assert.match(space, /button\.addEventListener\("click", async \(\) => \{[\s\S]*?prepareSource\(\)/);
  assert.doesNotMatch(space, /Remote spatial audio unavailable; loading the local guide/);
});

test("Living Book keeps its eight canonical works and manifest-gates lazy audio", () => {
  for (const token of [
    '"ld01", "slug": "mona-lisa", "bookOrder": 1',
    '"ld02", "slug": "lady-with-an-ermine", "bookOrder": 4',
    '"ve05", "slug": "vermeer-astronomer", "bookOrder": 7',
    '"ve01", "slug": "vermeer-girl-with-a-pearl-earring", "bookOrder": 9',
    '"vg01", "slug": "van-gogh", "bookOrder": 13',
    '"vg02", "slug": "van-gogh-bedroom", "bookOrder": 15',
    '"mo02", "slug": "pont-d-argenteuil", "bookOrder": 22',
    '"mo01", "slug": "monet-impression-sunrise", "bookOrder": 24',
  ]) assert.ok(book.includes(token), token);
  assert.match(book, /resolveArtworkAudioOverview\(\{[\s\S]*?canonicalId[\s\S]*?language: lang/);
  assert.doesNotMatch(book, /media\?\.audioOverviews/);
  assert.match(book, /\.\.\.\(audio \? \[\{ label: "♪"/);
  assert.match(book, /<audio controls preload="none"/);
  assert.doesNotMatch(book, /<audio controls autoplay/);
  assert.match(book, /media\.removeAttribute\("src"\)/);
});

test("connected Gallery VR uses canonical IDs and downloads overview audio only on interaction", () => {
  for (const [id, slug] of [
    ["ld01", "mona-lisa"], ["ld02", "lady-with-an-ermine"],
    ["ve05", "vermeer-astronomer"], ["ve01", "vermeer-girl-with-a-pearl-earring"],
    ["vg01", "van-gogh"], ["vg02", "van-gogh-bedroom"],
    ["mo02", "pont-d-argenteuil"], ["mo01", "monet-impression-sunrise"],
  ]) assert.match(gallery, new RegExp(`artworkId: "${id}", slug: "${slug}"`));
  assert.match(gallery, /resolveArtworkAudioOverview\(\{ artworkId: audioWork\.artworkId, language: lang \}\)/);
  assert.match(gallery, /if \(manifest && audioOverviewUrl\)/);
  assert.match(gallery, /loadGalleryAudio\(exhibit\.audioOverviewUrl\)/);
  assert.doesNotMatch(gallery, /painting\.media\?\.audioOverviews|painting\.media\?\.audioOverview/);
  assert.doesNotMatch(gallery, /loadAudioGuide\(exhibit[^)]*\);\s*exhibits\.push/);
  assert.match(gallery, /void ensureAudioGuide\(requestedExhibit\)\.then/);
});

test("AR keeps Guide and Overview roles separate without autoplay", () => {
  assert.match(ar, /manifest\.media\?\.audioGuides \|\| \[\]/);
  assert.doesNotMatch(ar, /manifest\.media\?\.audioOverviews/);
  assert.match(ar, /CONFIG\.audioSequence = false/);
  assert.match(ar, /audio\.preload = "none"/);
  assert.doesNotMatch(ar, /if \(!CONFIG\.audioSequence\) playNativeAudioGuide\(true\)/);
  assert.match(arHtml, /data-artwork-media-audio-keys='\{"en":"audio\.guide\.en","fr":"audio\.guide\.fr"\}'/);
  assert.doesNotMatch(arHtml, /data-artwork-media-audio-keys='[^']*audio\.overview/);
});
