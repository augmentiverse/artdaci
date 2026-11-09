import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {getOtherMuseums,getMuseumAtlasLink} from "../scripts/catalogue-museum-expansion.mjs";

const root=new URL("../",import.meta.url);
const read=async path=>readFile(new URL(path,root),"utf8");
const data=async path=>JSON.parse(await read(path));
const FEATURED=[
  "louvre","mauritshuis","czartoryski","orsay",
  "van-gogh-museum","national-gallery-of-art-washington",
];
const featured=FEATURED.map(slug=>({slug}));
const atlasPage={fr:"museums-atlas.html",en:"museums-atlas-en.html",ar:"museums-atlas-ar.html"};

test("all 17 documented museums split into six featured and eleven additional museums",async()=>{
  const atlas=await data("museum-atlas/data/museums.json");
  assert.equal(atlas.museums.length,17);
  const more=getOtherMuseums(atlas.museums,featured);
  assert.equal(more.length,11);
  assert.equal(new Set(more.map(m=>m.id)).size,11);
  assert.ok(more.every(m=>!FEATURED.includes(m.id)));
  assert.ok(more.every(m=>m.name&&m.city&&m.country));
  assert.deepEqual(more.map(m=>m.id),[
    "rijksmuseum","moma","marmottan","kunsthistorisches",
    "uffizi","national-gallery-london","kroller-muller",
    "yale-art-gallery","courtauld","orangerie","cenacolo-vinciano"
  ]);
  const fr=await read(atlasPage.fr);
  for(const museum of more){
    const url=getMuseumAtlasLink(museum.id,"fr");
    assert.ok(url.startsWith(atlasPage.fr+"#"));
    assert.ok(fr.includes('<article class="section" id="'+url.split("#")[1]+'"'),
      "French atlas deep link must resolve: "+url);
  }
});

for(const lang of ["en","ar"]){
  test(lang+" translated museum names and Atlas anchors remain consistent",async()=>{
    const [base,locale,atlasSource]=await Promise.all([
      data("museum-atlas/data/museums.json"),
      data("museum-atlas/data/"+lang+".json"),
      read(atlasPage[lang]),
    ]);
    const extra=getOtherMuseums(base.museums,featured,locale.museums);
    assert.equal(extra.length,11);
    assert.ok(extra.every(m=>m.name&&m.city&&m.country));
    const script=await read("museum-atlas/scripts/photo-locale.js");
    assert.ok(script.includes("'museum-'+escape(it.museum.id)"));
    assert.ok(atlasSource.includes("museum-atlas/scripts/photo-locale.js"));
    for(const museum of extra)
      assert.equal(getMuseumAtlasLink(museum.id,lang),
        atlasPage[lang]+"#museum-"+museum.id);
  });
}
test("semantic disclosure is located after the six featured museum cards in all languages",async()=>{
  for(const [page,showLabel] of [
    ["index-fr.html","Voir les autres musées"],
    ["index.html","See the other museums"],
    ["index-ar.html","عرض المتاحف الأخرى"],
  ]){
    const html=await read(page);
    assert.match(html,/styles\/home-museum-more\.css\?v=1/);
    const source=await read("scripts/catalogue.js");
    assert.ok(source.includes('class="museum-more"'));
    assert.ok(source.includes('class="museum-more-grid"'));
    assert.ok(source.includes('data-expanded-loaded="false"'));
    assert.ok(source.includes(showLabel));
    assert.ok(source.indexOf('class="museum-index-grid"')<
      source.indexOf('class="museum-more"'));
    assert.ok(source.includes("getOtherMuseums(base.museums, museums"));
  }
});
test("native disclosure has keyboard-focus styling and no fake AR or VR buttons",async()=>{
  const css=await read("styles/home-museum-more.css");
  assert.match(css,/\.museum-more > summary:focus-visible/);
  assert.match(css,/\.museum-more-item a:focus-visible/);
  assert.match(css,/@media\(max-width:600px\)/);
  const js=await read("scripts/catalogue.js");
  const section=js.slice(js.indexOf('const museumMore = root.querySelector'),
    js.indexOf('const input = root.querySelector'));
  assert.ok(!section.includes("gallery-vr.html"));
  assert.ok(!section.includes("space.html"));
  assert.ok(!section.includes("ar.html"));
});
