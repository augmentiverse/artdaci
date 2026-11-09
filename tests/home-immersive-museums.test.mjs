import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";

const read=(p)=>readFile(new URL("../"+p,import.meta.url),"utf8");
const pages=[
  {file:"index-fr.html",lang:"fr",atlas:"museums-atlas.html",
    title:"Les musées à vivre en",kicker:"17 musées · 24 œuvres",label:"Musées virtuels"},
  {file:"index.html",lang:"en",atlas:"museums-atlas-en.html",
    title:"Museums beyond their walls",kicker:"17 museums · 24 artworks",label:"Virtual museums"},
  {file:"index-ar.html",lang:"ar",atlas:"museums-atlas-ar.html",
    title:"المتاحف من منظور جديد",kicker:"١٧ متحفًا · ٢٤ عملًا فنيًا",label:"متاحف افتراضية"},
];
for(const p of pages){
  test(p.file+" features AR / VR discovery without saying all 17 are immersive",async()=>{
    const html=await read(p.file);
    assert.match(html,/styles\/home-immersive-museums\.css\?v=1/);
    const block=html.match(/<section id="places" class="hv2-section hv2-museum-immersive"[\s\S]*?<\/section>/)?.[0];
    assert.ok(block);
    assert.ok(block.includes(p.title));
    assert.ok(block.includes(p.kicker));
    assert.ok(block.includes(p.label));
    assert.ok(block.includes('class="hv2-museum-tech"'));
    assert.ok(block.includes('class="hv2-button hv2-button-primary" href="museums.html?lang='+p.lang+'"'));
    assert.ok(block.includes('class="hv2-museum-immersive-link" href="museums.html?lang='+p.lang+'&amp;tab=immersive"'));
    const generalIndex=block.indexOf('href="museums.html?lang='+p.lang+'"');
    const immersiveIndex=block.indexOf('class="hv2-museum-immersive-link"');
    assert.ok(generalIndex>=0 && immersiveIndex>generalIndex,"Immersive link should follow museum discovery");
    assert.ok(block.includes('href="'+p.atlas+'"'));
    assert.ok(block.includes('gallery-vr.html?lang='+p.lang));
    assert.ok(block.includes('geo/index.html?lang='+p.lang));
    assert.ok(!/six musées|six museums|المتاحف الستة|6 museums|6 musées/.test(block));
    assert.equal((block.match(/class="hv2-place-primary"/g)||[]).length,1);
    assert.equal((block.match(/class="hv2-place-secondary"/g)||[]).length,1);
    assert.equal((block.match(/class="hv2-museum-immersive-footer"/g)||[]).length,1);
    assert.ok(block.indexOf('class="hv2-museum-immersive-footer"')>
      block.indexOf('class="hv2-place-secondary"'),"AR/VR CTA must follow the virtual and GEO cards");
    assert.match(await read(p.atlas),/<html/i);
  });
}
test("virtual museums green panel has an intentionally high-contrast label",async()=>{
  const css=await read("styles/home-immersive-museums.css");
  assert.match(css,/\.hv2-place-primary \.hv2-section-kicker/);
  assert.match(css,/color:\s*#e9ffd0/);
  assert.match(css,/linear-gradient\(128deg,\s*#103f33/);
  assert.match(css,/\.hv2-place-primary h3/);
  assert.match(css,/\.hv2-place-primary p:not\(\.hv2-section-kicker\)/);
  assert.match(css,/@media \(max-width: 680px\)/);
  assert.match(css,/\.hv2-museum-immersive-link:focus-visible/);
});

for(const [file,general,immersive] of [
  ["index-fr.html","Découvrir les musées : photographies, histoires, œuvres et exploration 3D/GEO","Explorer les expériences muséales AR / VR"],
  ["index.html","Discover the museums: photographs, stories, artworks and 3D/GEO exploration","Explore museum AR / VR experiences"],
  ["index-ar.html","اكتشف المتاحف: صور وقصص وأعمال فنية واستكشاف 3D/GEO","استكشف تجارب المتاحف بالواقع المعزز والافتراضي"],
]) {
  test(file+" restores full museum discovery and reserves AR/VR for the last link",async()=>{
    const html=await read(file);
    const block=html.match(/<section id="places"[\s\S]*?<\/section>/)?.[0]||"";
    assert.ok(block.includes(general),"General museum label missing");
    assert.ok(block.includes(immersive),"Immersive bottom CTA missing");
    assert.equal((block.match(new RegExp(immersive,"g"))||[]).length,1,
      "Immersive link text must appear only once in the museum section");
    assert.ok(!/Découvrir les six musées|Discover six museums|المتاحف الستة/.test(block));
  });
}
