import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const root = new URL("../", import.meta.url);
const readJson = async (path) => JSON.parse(await readFile(new URL(path, root), "utf8"));

const catalog = await readJson("content/media-manifests/catalog.json");
const routes = await readJson("content/artwork-qr-routes.json");
const vercel = await readJson("vercel.json");
const active = catalog.artworks.filter((artwork) => artwork.status === "active");

async function manifestFor(artwork) {
  return readJson(`content/media-manifests/${artwork.manifest.path}`);
}

test("the QR catalogue contains exactly 24 active works in four groups of six", () => {
  assert.equal(active.length, 24);
  for (const artist of catalog.artists) {
    assert.equal(active.filter((artwork) => artwork.artistId === artist.id).length, 6);
  }
});

test("each active manifest exposes one direct official artdaci.com QR URL", async () => {
  for (const artwork of active) {
    const manifest = await manifestFor(artwork);
    const url = new URL(manifest.pageUrl);
    assert.equal(manifest.id, artwork.id);
    assert.equal(url.protocol, "https:");
    assert.equal(url.hostname, "artdaci.com");
    assert.match(url.pathname, /^\/ar\/[a-z0-9-]+$/);
    assert.doesNotMatch(manifest.pageUrl, /github\.io|vercel\.app|localhost|127\.0\.0\.1/i);
  }
});

test("the six Leonardo routes match the approved printed destinations", async () => {
  const expected = {
    ld01: "https://artdaci.com/ar/monalisa",
    ld03: "https://artdaci.com/ar/lastsupper",
    ld06: "https://artdaci.com/ar/ferronniere",
    ld02: "https://artdaci.com/ar/ermine",
    ld05: "https://artdaci.com/ar/ginevra",
    ld04: "https://artdaci.com/ar/annunciation",
  };
  for (const [id, url] of Object.entries(expected)) {
    const artwork = active.find((item) => item.id === id);
    assert.equal((await manifestFor(artwork)).pageUrl, url);
  }
});

test("every official QR path has one Vercel redirect synchronized with the route map", async () => {
  assert.deepEqual(Object.keys(routes.routes).sort(), active.map(({ id }) => id).sort());
  assert.equal(vercel.redirects.length, 24);
  for (const artwork of active) {
    const manifest = await manifestFor(artwork);
    const source = new URL(manifest.pageUrl).pathname;
    const redirect = vercel.redirects.find((item) => item.source === source);
    assert.ok(redirect, `missing redirect for ${artwork.id}`);
    assert.equal(redirect.destination, routes.routes[artwork.id].destination);
    assert.equal(redirect.permanent, false);
  }
});

test("AR-capable works route to AR and unavailable works route to their own artwork page", () => {
  const capable = new Set(["ld01", "ve01", "ve02", "vg01", "vg02"]);
  for (const [id, route] of Object.entries(routes.routes)) {
    if (capable.has(id)) assert.match(route.destination, /^\/ar\.html\?painting=/);
    else {
      assert.match(route.destination, /^\/print-(?:artwork|monet-impression-sunrise)\.html/);
      assert.doesNotMatch(route.destination, /painting=mona-lisa/, `unexpected Mona Lisa fallback for ${id}`);
    }
  }
});

test("each generated artwork PNG is square and print-resolution", async () => {
  for (const artwork of active) {
    const png = await readFile(new URL(`assets/qr/artworks/${artwork.id}.png`, root));
    assert.equal(png.subarray(1, 4).toString("ascii"), "PNG");
    const width = png.readUInt32BE(16);
    const height = png.readUInt32BE(20);
    assert.equal(width, height);
    assert.ok(width >= 850, `${artwork.id} is only ${width}px`);
  }
});

test("the print control sheet derives labels, links and payload text from manifests", async () => {
  const html = await readFile(new URL("print-book-qrs.html", root), "utf8");
  const script = await readFile(new URL("scripts/print-book-qrs.js", root), "utf8");
  assert.match(html, /scripts\/print-book-qrs\.js\?v=1/);
  assert.match(script, /manifest\.pageUrl/);
  assert.match(script, /assets\/qr\/artworks\/\$\{esc\(artwork\.id\)\}\.png/);
  assert.match(script, /active\.length !== 24/);
});

test("legacy retained QR destinations contain no GitHub, Preview or local URLs", async () => {
  const legacy = await readJson("content/legacy-qr-destinations.json");
  assert.equal(Object.keys(legacy.destinations).length, 41);
  for (const url of Object.values(legacy.destinations)) {
    assert.equal(new URL(url).hostname, "artdaci.com");
    assert.doesNotMatch(url, /github\.io|vercel\.app|localhost|127\.0\.0\.1/i);
  }
});

test("historical printable pages display and link the exact payload encoded by each QR asset", async () => {
  const legacy = await readJson("content/legacy-qr-destinations.json");
  const pages = {
    "print-target.html": ["mona-lisa-ar-en.png", "mona-lisa-space-en.png", "mona-lisa-audio-en.png"],
    "print-target-fr.html": ["mona-lisa-ar-fr.png", "mona-lisa-space-fr.png", "mona-lisa-audio-fr.png"],
    "print-vermeer-girl-with-a-pearl-earring.html": ["vermeer-girl-pearl-ar-en.png", "vermeer-girl-pearl-space-en.png", "vermeer-girl-pearl-audio-en.png"],
    "print-vermeer-girl-with-a-pearl-earring-fr.html": ["vermeer-girl-pearl-ar-fr.png", "vermeer-girl-pearl-space-fr.png", "vermeer-girl-pearl-audio-fr.png"],
    "print-van-gogh.html": ["van-gogh-ar-en.png", "van-gogh-space-en.png"],
    "print-van-gogh-fr.html": ["van-gogh-ar-fr.png", "van-gogh-space-fr.png"],
    "print-van-gogh-bedroom.html": ["van-gogh-bedroom-ar-en.png", "van-gogh-bedroom-space-en.png", "van-gogh-bedroom-audio-en.png"],
    "print-van-gogh-bedroom-fr.html": ["van-gogh-bedroom-ar-fr.png", "van-gogh-bedroom-space-fr.png", "van-gogh-bedroom-audio-fr.png"],
  };

  for (const [page, filenames] of Object.entries(pages)) {
    const html = await readFile(new URL(page, root), "utf8");
    for (const filename of filenames) {
      const url = legacy.destinations[filename];
      const escapedUrl = url.replaceAll("&", "&amp;");
      assert.match(html, new RegExp(`src=["']assets/qr/${filename.replaceAll(".", "\\.")}["']`));
      assert.ok(html.includes(`href="${escapedUrl}"`), `${page} does not link ${url}`);
      assert.ok(html.includes(`<code>${escapedUrl}</code>`), `${page} does not print ${url}`);
    }
  }
});
