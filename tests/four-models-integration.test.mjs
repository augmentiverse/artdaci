import test from "node:test";
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { resolveImmersiveArtworkRoute } from "../scripts/immersive-routing.js";

const root = new URL("../", import.meta.url);
const read = async (name) => readFile(new URL(name,root),"utf8");
const json = async (name) => JSON.parse(await read(name));

const MODELS = Object.freeze({
  portrait:"assets/artists/vincent-van-gogh/artworks/self-portrait/models/van-gogh_self-portrait.glb",
  standing:"assets/artists/vincent-van-gogh/artworks/self-portrait/models/van-gogh_standing.glb",
  pearl:"assets/artists/johannes-vermeer/artworks/girl-with-a-pearl-earring/models/girl-pearl_standing.glb",
  delft:"assets/artists/johannes-vermeer/artworks/view_of_delft/models/view-of-delft.glb"
});
const objects = [
  {id:"vg01",key:"portrait-2026",path:"models/van-gogh_self-portrait.glb",source:MODELS.portrait,bytes:2782692},
  {id:"vg01",key:"standing-2026",path:"models/van-gogh_standing.glb",source:MODELS.standing,bytes:4562864},
  {id:"ve01",key:"standing-2026",path:"models/girl-pearl_standing.glb",source:MODELS.pearl,bytes:3032692},
  {id:"ve02",key:"delft-2026",path:"models/view-of-delft.glb",source:MODELS.delft,bytes:3118640}
];
const hasSource = (variants,source)=>variants?.some(v=>v.src===source);
const count = (src,needle)=>src.split(needle).length - 1;

test("each requested GLB exists in Git and has a valid binary GLB header",async()=>{
  for(const {source,bytes} of objects){
    const path = new URL(source,root);
    const info = await stat(path);
    assert.equal(info.size,bytes,source);
    const data = await readFile(path);
    assert.equal(data.toString("ascii",0,4),"glTF",source);
    assert.equal(data.readUInt32LE(4),2,source+" requires GLB 2.0");
    assert.equal(data.readUInt32LE(8),data.length,source+" byte length");
  }
});

test("Vincent's new 1889 self-portrait and standing model replace the prior GLBs in both AR variant lists",async()=>{
  const data=await json("content/paintings/van-gogh.json");
  assert.equal(data.date,"1889");
  assert.equal(data.media.model,MODELS.portrait);
  assert.equal(data.ar.primaryModel,MODELS.portrait);
  for(const section of [data.media,data.ar]){
    assert.equal(section.modelVariants.find(v=>v.id==="portrait")?.src,MODELS.portrait);
    assert.equal(section.modelVariants.find(v=>v.id==="standing")?.src,MODELS.standing);
    assert(section.modelVariants.some(v=>v.id==="bedroom-standing"),"Preserve Bedroom variant");
  }
  const source=JSON.stringify(data);
  assert(!source.includes("van-gogh-portrait.glb")&&!source.includes("van-gogh-standing.glb"));
});

test("Girl with a Pearl Earring preserves portrait and seated choices and adds a standing AR/Space choice",async()=>{
  const data=await json("content/paintings/vermeer-girl-with-a-pearl-earring.json");
  for(const section of [data.media,data.ar]){
    assert.deepEqual(section.modelVariants.map(v=>v.id),["portrait","sitting","standing"]);
    assert.equal(section.modelVariants[2].src,MODELS.pearl);
    for(const language of ["en","fr","ar"])assert(section.modelVariants[2].label[language]);
  }
});

test("View of Delft has a 3D model and Space AR route but does not claim image AR or a private VR viewer",async()=>{
  const data=await json("content/paintings/view-of-delft.json");
  assert.equal(data.media.model,MODELS.delft);
  assert.deepEqual(data.media.modelVariants.map(v=>v.id),["delft"]);
  assert.equal(data.media.modelVariants[0].src,MODELS.delft);
  assert.equal(resolveImmersiveArtworkRoute("ve02","space")?.runtimeSlug,"view-of-delft");
  assert.equal(resolveImmersiveArtworkRoute("view-of-delft","space")?.artworkId,"ve02");
  assert.equal(resolveImmersiveArtworkRoute("ve02","ar"),null);
  assert.equal(resolveImmersiveArtworkRoute("ve02","vr"),null);
  const space=await read("scripts/space-viewer.js");
  assert(space.includes('"view-of-delft": "content/paintings/view-of-delft.json"'));
  assert(space.includes('if (slug === "view-of-delft") {'));
  assert(space.includes("imageArLink.style.display = \"none\""));
  assert(space.includes("individualVrLink.style.display = \"none\""));
});

test("existing VR gallery, cinema and Masters Hub use requested Van Gogh standing GLB",async()=>{
  const [gallery,guide]=await Promise.all([
    read("scripts/gallery-vr.js"),json("geo/data/guides/vangogh-hub-guide.json")
  ]);
  assert.equal(guide.model.path,MODELS.standing);
  assert(!gallery.includes("assets/artists/vincent-van-gogh/profile/models/standing.glb"));
  assert(!gallery.includes("vangogh-istanding.glb"));
  assert(count(gallery,MODELS.standing)>=3);
  assert(gallery.includes('"view-of-delft": "'+MODELS.delft+'"'));
});

test("all four new R2 keys are tracked but are NOT claimed to be published before verified upload",async()=>{
  const [vg,ve,view]=await Promise.all(["vg01","ve01","ve02"]
    .map(id=>json("content/media-manifests/artworks/"+id+"/manifest.json")));
  const manifests={vg01:vg,ve01:ve,ve02:view};
  for(const item of objects){
    const asset=manifests[item.id].media.models[item.key];
    assert(asset,item.id+":"+item.key);
    assert.equal(asset.path,item.path);
    assert.equal(asset.bytes,item.bytes);
    assert.equal(asset.mimeType,"model/gltf-binary");
    if (asset.available) {
      assert.equal(asset.migrationStatus,"published");
      assert.match(asset.sha256,/^[a-f0-9]{64}$/,"Only verified objects can be published");
    } else {
      assert.equal(asset.migrationStatus,"planned");
      assert(!asset.sha256,"Hash must only be recorded after actual byte verification");
    }
  }
  const [ar,space,vr]=await Promise.all(["ar.html","space.html","vr.html"].map(read));
  for(const html of [ar,space,vr]){
    assert(html.includes("models.portrait-2026"));
    assert(html.includes("models.standing-2026"));
    assert(!html.includes('"portrait":"models.portrait","standing":"models.standing"'));
  }
  assert(space.includes('"standing":"models.standing-2026"'));
  assert(space.includes('"delft":"models.delft-2026"'));
});

test("3D collection exposes fifteen choices including the new artworks and standing model",async()=>{
  const [html,js]=await Promise.all([read("3d/index.html"),read("scripts/3d-collection.js")]);
  const buttons=[...html.matchAll(/<button\b[^>]*class="d3-model-choice"[\s\S]*?<\/button>/g)];
  assert.equal(buttons.length,15);
  for(const src of Object.values(MODELS)){
    const matches=buttons.filter(b=>b[0].includes("../"+src));
    assert.equal(matches.length,1,"3D collection must use "+src);
  }
  assert(html.includes("3d-collection.js?v=2"));
  assert.equal(count(js,"copy.categoryArtwork"),6);
  assert(js.includes('counts: ["6 models"'));
  assert(js.includes('counts: ["6 modèles"'));
  assert(js.includes('counts: ["6 نماذج"'));
  for(const label of ["Vue de Delft — interprétation 3D","View of Delft — 3D interpretation","منظر دلفت — نموذج ثلاثي الأبعاد"]){
    assert(js.includes(label),label);
  }
});

test("new 3D/AR/VR entries are activated through versioned UI resources",async()=>{
  const [space,vr,ar,gallery,modelPage]=await Promise.all([
    read("space.html"),read("vr.html"),read("ar.html"),read("gallery-vr.html"),read("3d/index.html")
  ]);
  assert(space.includes('space-viewer.js?v=37'));
  assert(vr.includes('vr-viewer.js?v=17'));
  assert(ar.includes('ar-viewer.js?v=60'));
  assert(gallery.includes('gallery-vr.js?v=179'));
  assert(modelPage.includes('3d-collection.js?v=2'));
});
