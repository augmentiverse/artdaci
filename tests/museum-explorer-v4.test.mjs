// Dependency-free smoke tests for ARTDACI Museum Explorer V4.
// Run from repo root: node tests/museum-explorer-v4.test.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
const html=readFileSync(new URL("../museums.html",import.meta.url),"utf8");
const milestones=JSON.parse(readFileSync(new URL("../content/museums/history-v4.json",import.meta.url),"utf8"));
const embedded=html.match(/const EMBEDDED_MUSEUM_DATA=(\{[\s\S]*?\})\s*;\s*\(async\(\)=>/);
assert.ok(embedded,"embedded editorial records must remain available");
const base=JSON.parse(embedded[1]);
assert.equal(base.museums.length,6);
assert.equal(Object.keys(milestones.museums).length,6);
assert.equal(milestones.schemaVersion,"1.0");
let count=0;
for(const museum of base.museums){
  assert.equal(museum.facts.length,2,museum.id+" must retain two facts");
  assert.ok(museum.artworks.length>0,museum.id+" must have a curated artwork");
  const events=milestones.museums[museum.id];
  assert.equal(events?.length,3,museum.id+" must have exactly three historical milestones");
  for(const event of events){
    assert.match(event.year,/^\d{4}$/);
    assert.match(event.source,/^https:\/\//);
    for(const lang of ["fr","en","ar"]) assert.ok(event.text[lang]?.length>20,museum.id+": "+lang+" history missing");
    count++;
  }
}
for(const id of ["tab-history","pane-history","history-timeline","artworks"]){
  assert.ok(html.includes('id="'+id+'"'),id+" panel missing");
}
const inline=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map(m=>m[1]).filter(s=>s.trim());
assert.ok(inline.length,"inline portal JavaScript missing");
for(const js of inline) new vm.Script(js,{filename:"museums.html inline script"});
const imageDefs=html.match(/const ARTWORK_IMAGES=\{([\s\S]*?)\};/);
assert.ok(imageDefs,"artwork thumbnail mapping missing");
for(const museum of base.museums) for(const work of museum.artworks){
  assert.ok(new RegExp("\\b"+work.id+"\\s*:").test(imageDefs[1]),"thumbnail mapping missing for "+work.id);
}
console.log("Museum Explorer V4 OK: 6 museums, 12 facts, "+count+" sourced historical milestones, 12 artwork thumbnails, 3 languages, valid JavaScript.");
