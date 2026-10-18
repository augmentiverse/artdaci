import assert from "node:assert/strict";
import test from "node:test";
import { access, readFile } from "node:fs/promises";
import { createRequire } from "node:module";

const root = new URL("../", import.meta.url);
const read = async (path) => readFile(new URL(path, root), "utf8");
const json = async (path) => JSON.parse(await read(path));
const require = createRequire(import.meta.url);
const artworkRedirect = require("../api/artwork-redirect.js");

test("Van Gogh Orsay self-portrait is consistently the documented 1889 painting", async () => {
  const [gallery, painting, semantic] = await Promise.all([
    read("scripts/gallery-vr.js"), json("content/paintings/van-gogh.json"),
    json("content/semantics/artwork-concepts.json")
  ]);
  const copy = gallery.slice(gallery.indexOf("const PAINTING_INFO = {"),
    gallery.indexOf("const COPY = {"));
  assert.doesNotMatch(copy, /1887/);
  assert.equal((copy.match(/1889/g) || []).length, 3, "gallery EN/FR/AR must say 1889");
  assert.equal(painting.date,"1889");
  assert.match(painting.currentLocation.museum,/Orsay/);
  assert.equal(semantic.artworks.find((item) => item.id === "vg01").date.en, "1889");
});

test("persistent /a/:id links resolve to known print pages without open redirects", async () => {
  const [catalog, redirectConfig, supplements, printJS] = await Promise.all([
    json("content/media-manifests/catalog.json"),
    json("vercel.json"), json("content/paintings/additional-16.json"),
    read("scripts/print-artwork.js")
  ]);
  assert.deepEqual(redirectConfig.rewrites, [
    {source:"/a/:id",destination:"/api/artwork-redirect"}
  ]);
  const records = catalog.artworks.filter((item)=>item.status==="active");
  assert.equal(records.length,24);
  assert.equal(Object.keys(artworkRedirect.PRINT_SLUGS).length,24);
  const genericSlugs = new Set(supplements.map((item)=>item.slug));
  for (const source of ["lady-with-an-ermine","view-of-delft","pont-d-argenteuil"]) {
    assert(printJS.includes('"'+source+'":'), source);
    genericSlugs.add(source);
  }
  for (const record of records) {
    const manifest = await json("content/media-manifests/"+record.manifest.path);
    assert.equal(manifest.id,record.id);
    assert.equal(new URL(manifest.pageUrl).pathname, "/a/"+record.id);
    for (const lang of ["en","fr","ar"]) {
      const target = artworkRedirect.destinationForArtwork(record.id,lang);
      assert(target && target.startsWith("/") && !target.startsWith("//"));
      const path = target.split("?")[0].slice(1);
      await access(new URL(path,root));
      if (path === "print-artwork.html") {
        const actualSlug = new URL(target,"https://artdaci.com").searchParams.get("painting");
        assert(genericSlugs.has(actualSlug), record.id+": unsupported generic slug "+actualSlug);
      }
    }
  }

  const makeResponse = () => {
    const state = { statusCode:200, headers:{}, body:null };
    state.setHeader=(name,value)=>state.headers[name]=value;
    state.end=(body)=>{state.body=body;return state};
    return state;
  };
  const ok = makeResponse();
  artworkRedirect({method:"GET",query:{id:"vg01",lang:"fr"}},ok);
  assert.equal(ok.statusCode,302);
  assert.equal(ok.headers.Location,"/print-van-gogh-fr.html");
  for (const id of ["../../../etc/passwd","constructor","__proto__","ld07","unknown"]) {
    const result=makeResponse();
    artworkRedirect({method:"GET",query:{id,lang:"en"}},result);
    assert.equal(result.statusCode,404,id);
    assert.equal(result.headers.Location,undefined,id);
  }
  const notAllowed=makeResponse();
  artworkRedirect({method:"POST",query:{id:"ld01"}},notAllowed);
  assert.equal(notAllowed.statusCode,405);
});

test("unreviewed supplemental references and reproduction rights are explicitly pending", async () => {
  const supplemental=await json("content/paintings/additional-16.json");
  const review=await json("content/editorial/provenance-review.json");
  assert.equal(supplemental.length,16);
  assert.equal(review.artworks.length,16);
  assert.equal(review.status,"editorial-audit-incomplete");
  const bySlug=new Map(review.artworks.map((item)=>[item.slug,item]));
  assert.equal(bySlug.size,16);
  for (const painting of supplemental) {
    const item=bySlug.get(painting.slug);
    assert(item, painting.slug+" requires an audit record");
    assert.equal(item.title,painting.title);
    assert.equal(item.claimVerification,"pending");
    assert.equal(item.licenseVerification,"pending");
    assert.equal(item.sourceReference,null);
    assert.equal(item.mediaSource,null);
    assert.equal(item.reproductionLicense,null);
  }
});

test("Bedroom Arabic overview is declared missing, not falsely published", async () => {
  const manifest=await json("content/media-manifests/artworks/vg02/manifest.json");
  const arabic=manifest.media.audio.overview.ar;
  assert.equal(arabic.language,"ar");
  assert.equal(arabic.available,false);
  assert.equal(arabic.migrationStatus,"planned");
  assert.equal(arabic.path,"audio/ar/overview.mp3");
  assert.equal("sha256" in arabic,false);
});

test("PWA uses its own trilingual offline page rather than pretending a navigation succeeded", async () => {
  const [sw,offline]=await Promise.all([read("sw.js"),read("offline.html")]);
  assert(sw.includes('const VERSION = "artdaci-pwa-v7"'));
  assert(sw.includes('"./offline.html"'));
  assert(sw.includes('caches.match("./offline.html")'));
  assert(!sw.includes('|| caches.match("./index.html")'));
  assert(offline.includes('name="robots" content="noindex, nofollow"'));
  for (const lang of ["fr","en","ar"]) assert(offline.includes(lang+": ["));
  assert(offline.includes('id="offline-home"'));
});

test("VR gallery boots with the revised editorial asset", async () => {
  const html=await read("gallery-vr.html");
  assert.match(html,/scripts\/gallery-vr\.js\?v=179/);
});
