import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const readBytes = (path) => readFile(new URL(path, root));
const readText = (path) => readFile(new URL(path, root), "utf8");
const readJson = async (path) => JSON.parse(await readText(path));
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

const group = await readJson("content/ar-groups/vermeer.json");
const vercel = await readJson("vercel.json");
const html = await readText("ar-vermeer.html");
const runtime = await readText("scripts/ar-vermeer.js");
const homepages = await Promise.all(["index.html", "index-fr.html", "index-ar.html"].map(readText));

assert.equal(group.groupId, "vermeer");
assert.equal(group.canonicalUrl, "https://artdaci.com/ar/vermeer");
assert.equal(group.qrCode, "/assets/qr/groups/vermeer.png");
assert.equal(group.status, "ready");
assert.deepEqual(group.artworks.map(({ id }) => id), ["ve05", "ve04", "ve01", "ve06", "ve02", "ve03"]);
assert.deepEqual(group.artworks.map(({ targetIndex }) => targetIndex), [0, 1, 2, 3, 4, 5]);
assert.equal(new Set(group.artworks.map(({ targetIndex }) => targetIndex)).size, 6);

for (const artwork of group.artworks) {
  const target = await readBytes(artwork.targetSource.replace(/^\//, ""));
  assert.equal(sha256(target), artwork.targetSourceSha256, `${artwork.id}: empreinte source`);
  assert.match(artwork.url, /^https:\/\/artdaci\.com\/ar\//);
}

const compiled = await readBytes(group.compiledTargets.replace(/^\//, ""));
assert.equal(compiled.byteLength, group.compiledTargetsBytes);
assert.equal(sha256(compiled), group.compiledTargetsSha256);
assert.ok(compiled.byteLength > 3_000_000, "la cible compilée doit contenir les six tableaux");

const qr = await readBytes(group.qrCode.replace(/^\//, ""));
assert.equal(qr.subarray(1, 4).toString("ascii"), "PNG");
assert.equal(qr.readUInt32BE(16), 481);
assert.equal(qr.readUInt32BE(20), 481);

assert.equal(vercel.rewrites.find(({ source }) => source === "/ar/vermeer")?.destination, "/ar-vermeer.html");
assert.equal(vercel.redirects.length, 24, "les 24 routes QR individuelles doivent rester intactes");
assert.equal(vercel.redirects.find(({ source }) => source === "/ar/girl-with-a-pearl-earring")?.destination, "/ar.html?painting=vermeer-girl-with-a-pearl-earring");
assert.equal(vercel.redirects.find(({ source }) => source === "/ar/view-of-delft")?.destination, "/ar.html?painting=view-of-delft");

assert.match(html, /styles\/ar-leonardo\.css\?v=1/);
assert.match(html, /scripts\/ar-vermeer\.js\?v=1/);
assert.match(html, /"three\/addons\/":"\/vendor\/three-addons\/"/);
assert.match(runtime, /credentials:\s*"same-origin"/);
assert.match(runtime, /imageTargetSrc:\s*group\.compiledTargets/);
assert.equal((runtime.match(/new MindARThree\(/g) || []).length, 1, "une seule création de session MindAR");
assert.match(runtime, /\$\("start"\)\.addEventListener\("click"/);
assert.doesNotMatch(runtime.split('$\("start"\).addEventListener')[0], /new MindARThree\(/, "aucune session avant Start");
assert.match(runtime, /mindar\.addAnchor\(artwork\.targetIndex\)/);
assert.match(runtime, /anchor\.onTargetFound/);
assert.match(runtime, /anchor\.onTargetLost/);

for (const homepage of homepages) {
  assert.equal((homepage.match(/href="ar\/vermeer"/g) || []).length, 1, "chaque accueil doit exposer une seule entrée Vermeer AR");
  assert.match(homepage, /hv2-experience-no">10</);
}

console.log("PASS: route Vermeer, ordre 0–5, six sources, cible compilée et 24 routes individuelles préservées.");
