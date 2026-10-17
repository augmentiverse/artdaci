import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {resolve,dirname} from "node:path";
import {fileURLToPath} from "node:url";
import {discovery} from "../scripts/book-ar-enrichment.mjs";
import {bookArSemanticIds,semanticArtworkId,semanticWorkHref} from "../scripts/book-ar-semantic.mjs";
const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const artworks=JSON.parse(readFileSync(resolve(root,"content/semantics/artwork-concepts.json"),"utf8")).artworks;
const source=readFileSync(resolve(root,"scripts/book-ar.js"),"utf8");

test("Book AR's 16 paintings navigate to 16 *distinct* semantic graphs",()=>{
 const canonical=new Map(artworks.map(item=>[item.id,item]));
 assert.equal(canonical.size,16);
 const resolved=new Set();
 for(const [artist,profile] of Object.entries(discovery)){
   assert.equal(profile.artworks.length,4);
   assert.equal(Object.keys(bookArSemanticIds[artist]).length,4);
   for(const painting of profile.artworks){
     const id=semanticArtworkId(artist,painting.id);
     const semantic=canonical.get(id);
     assert.ok(semantic,artist+" "+painting.id+" must have a semantic profile");
     // Four original Semantic profiles use their own established image assets.
     // The twelve new profiles reuse the precise Book AR image.
     if(semantic.imageStatus==="artdaci-book-ar-editorial-provisional"){
       assert.equal(semantic.image,"../"+painting.image,"New graph must use selected artwork image");
     } else {
       assert.ok(semantic.image?.startsWith("../assets/artists/"),id+" requires an image");
     }
     assert.equal(semantic.assertions.length>=8,true,id+" needs a meaningful concept graph");
     resolved.add(id);
     for(const lang of ["fr","en","ar"]){
       const href=semanticWorkHref(artist,painting.id,lang);
       assert.ok(href.startsWith("semantic/?"),href);
       const url=new URL(href,"https://artdaci.example/");
       assert.equal(url.searchParams.get("artwork"),id);
       assert.equal(url.searchParams.get("lang"),lang);
       assert.ok(semantic.title[lang],id+" needs a translated title");
       if(semantic.imageStatus==="artdaci-book-ar-editorial-provisional"){
         assert.equal(semantic.title[lang],painting.title[lang]);
       }
     }
   }
 }
 assert.equal(resolved.size,16,"Never silently redirect another artwork to Mona Lisa");
});
test("The Semantic URL is updated when artist or painting is selected",()=>{
 assert.match(source,/function updateSemanticLink\(\)/);
 assert.match(source,/semanticWorkHref\(state.selection,state.selectedWork.id,lang\)/);
 assert.match(source,/state.selectedWork=work;\s*updateSemanticLink\(\)/);
 assert.match(source,/state.selectedWork=state.discovery\?\.setArtist\(id,artist\?\.title\[lang\]\)\|\|null;\s*updateSemanticLink\(\)/);
 assert.equal(semanticWorkHref("vangogh","self-portrait-1889","en"),"semantic/?artwork=vg01&lang=en");
 assert.equal(semanticWorkHref("vermeer","delft","fr"),"semantic/?artwork=ve02&lang=fr");
 assert.equal(semanticWorkHref("monet","water-lilies","ar"),"semantic/?artwork=mo04&lang=ar");
 assert.equal(semanticWorkHref("leonardo","ermine","fr"),"semantic/?artwork=ld02&lang=fr");
 assert.equal(semanticWorkHref("leonardo","unknown","fr"),null);
});
