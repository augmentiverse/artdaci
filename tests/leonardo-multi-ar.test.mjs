import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const readText = (path) => readFile(new URL(path, root), "utf8");
const readJson = async (path) => JSON.parse(await readText(path));
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

const group = await readJson("content/ar-groups/leonardo.json");
const vercel = await readJson("vercel.json");
const html = await readText("ar-leonardo.html");
const runtime = await readText("scripts/ar-leonardo.js");
const homepages = await Promise.all(["index.html", "index-fr.html", "index-ar.html"].map(readText));

assert.equal(group.groupId, "leonardo");
assert.equal(group.canonicalUrl, "https://artdaci.com/ar/leonardo");
assert.equal(group.status, "ready");
assert.deepEqual(group.artworks.map(({ id }) => id), ["ld01", "ld03", "ld06", "ld02", "ld05", "ld04"]);
assert.deepEqual(group.artworks.map(({ targetIndex }) => targetIndex), [0, 1, 2, 3, 4, 5]);
assert.equal(new Set(group.artworks.map(({ targetIndex }) => targetIndex)).size, 6);

for (const artwork of group.artworks) {
  const source = new URL(artwork.targetSource.slice(1), root);
  const bytes = await readFile(source);
  assert.ok(bytes.byteLength > 50_000, `${artwork.id}: image cible trop petite`);
  assert.equal(sha256(bytes), artwork.targetSourceSha256, `${artwork.id}: empreinte image cible`);
  assert.match(artwork.url, /^https:\/\/artdaci\.com\/ar\//);
}

const compiled = await readFile(new URL(group.compiledTargets.slice(1), root));
assert.equal(compiled.byteLength, group.compiledTargetsBytes);
assert.equal(sha256(compiled), group.compiledTargetsSha256);
assert.ok(compiled.byteLength > 3_000_000, "la cible compilée doit contenir les six tableaux");

assert.equal(vercel.rewrites.find(({ source }) => source === "/ar/leonardo")?.destination, "/ar-leonardo.html");
assert.equal(vercel.redirects.length, 24, "les 24 routes QR individuelles doivent rester intactes");
assert.equal(vercel.redirects.find(({ source }) => source === "/ar/monalisa")?.destination, "/ar.html?painting=mona-lisa");
assert.equal(vercel.redirects.find(({ source }) => source === "/ar/lastsupper")?.destination, "/print-artwork.html?painting=last-supper");

assert.match(html, /styles\/ar-leonardo\.css\?v=1/);
assert.match(html, /scripts\/ar-leonardo\.js\?v=2/);
assert.match(html, /"three\/addons\/":"\/vendor\/three-addons\/"/);
assert.match(runtime, /credentials:\s*"same-origin"/);
assert.match(runtime, /imageTargetSrc:\s*group\.compiledTargets/);
assert.equal((runtime.match(/new MindARThree\(/g) || []).length, 1, "une seule création de session MindAR");
assert.equal((runtime.match(/group\.compiledTargets/g) || []).length, 1, "aucun préchargement séparé du .mind");
assert.ok(runtime.indexOf('$("start").addEventListener') < runtime.indexOf("new MindARThree("), "la session démarre uniquement après Start");
assert.match(runtime, /anchor\.onTargetFound/);
assert.match(runtime, /anchor\.onTargetLost/);

for (const homepage of homepages) {
  assert.equal((homepage.match(/href="ar\/leonardo"/g) || []).length, 1, "chaque accueil doit exposer une seule entrée Léonard AR");
  assert.match(homepage, /hv2-experience-no">09</);
}

console.log("PASS: route Léonard, ordre 0–5, six sources, cible compilée et 24 routes individuelles préservées.");
