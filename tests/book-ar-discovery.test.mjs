import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {resolve,dirname} from "node:path";
import {fileURLToPath} from "node:url";
import {artists} from "../scripts/book-ar-data.mjs";
import {discovery,exploreCopy,local,selectedArtwork} from "../scripts/book-ar-enrichment.mjs";
const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>readFileSync(resolve(root,p),"utf8");
test("ARTDACI 1.2 has four curatorial profiles and 16 locally hosted works",()=>{
 assert.deepEqual(Object.keys(discovery).sort(),artists.map(x=>x.id).sort());
 for(const artist of artists){
  const p=discovery[artist.id];
  assert.equal(p.artworks.length,4,artist.id);
  assert.ok(/^\d{4}–\d{4}$/.test(p.dates),artist.id);
  assert.ok(p.artworks.every(w=>existsSync(resolve(root,w.image))),artist.id);
  assert.equal(new Set(p.artworks.map(w=>w.id)).size,4);
  for(const lang of ["fr","en","ar"]){
    for(const part of ["bio","fact","question","origin"]){
      assert.ok(local(p[part],lang).length>35,artist.id+" "+part+" "+lang);
    }
    for(const w of p.artworks){
      assert.ok(local(w.title,lang).length>2,lang+" "+w.id);
      assert.ok(local(w.museum,lang).length>3,lang+" "+w.id);
      assert.ok(w.date&&w.dateEn);
    }
  }
  assert.deepEqual(selectedArtwork(artist.id,p.artworks[0].id),p.artworks[0]);
 }
 assert.ok(discovery.vangogh.artworks[0].id==="self-portrait-1889");
});
test("all AR learning labels translated",()=>{
 for(const lang of ["fr","en","ar"]){
  for(const key of ["about","works","fact","hint","more","current","workSelection","scanHint"])
   assert.ok(exploreCopy[lang][key],lang+"."+key);
 }
});
test("discovery UI connected to 3D display; old scan workflow preserved",()=>{
 const html=read("book-ar.html"),src=read("scripts/book-ar.js"),ui=read("scripts/book-ar-discovery.mjs"),css=read("styles/book-ar.css");
 assert.match(html,/id="discovery-panel"/);
 assert.match(html,/data-explore-tab="works"/);
 assert.match(html,/scripts\/book-ar\.js\?v=3/);
 assert.match(ui,/onArtwork\(work\)/);
 assert.match(src,/state\.discovery=setupBookDiscovery\(lang,selectWork\)/);
 assert.match(src,/refreshThumbs\(id\)/);
 assert.match(src,/state\.screen\.scale\.set\(w, w\/ratio\/\.56, 1\)/);
 assert.match(src,/new MindARThree\(/);
 assert.match(css,/\.discovery-gallery/);
});
