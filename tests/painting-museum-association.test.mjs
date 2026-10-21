import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import test from "node:test";
import { resolvePaintingMuseum, normalizeMuseumName } from "../scripts/painting-museum-resolver.mjs";

const root=new URL("../",import.meta.url);
const paths=[
  "mona-lisa.json","lady-with-an-ermine.json","vermeer-girl-with-a-pearl-earring.json",
  "view-of-delft.json","van-gogh.json","van-gogh-bedroom.json",
  "monet-impression-sunrise.json","pont-d-argenteuil.json","additional-16.json"
];
const paintings=(await Promise.all(paths.map(async (p)=>
  JSON.parse(await readFile(new URL("content/paintings/"+p,root),"utf8"))))).flat();
const bySlug=Object.fromEntries(paintings.map(p=>[p.slug,p]));
const EXPECTED={
  "mona-lisa":"louvre","vermeer-astronomer":"louvre","belle-ferronniere":"louvre",
  "lady-with-an-ermine":"czartoryski",
  "vermeer-girl-with-a-pearl-earring":"mauritshuis","view-of-delft":"mauritshuis",
  "van-gogh":"orsay","pont-d-argenteuil":"orsay","poppies":"orsay","japanese-bridge":"orsay",
  "van-gogh-bedroom":"van-gogh-museum",
  "ginevra-de-benci":"national-gallery-of-art-washington",
  "woman-holding-balance":"national-gallery-of-art-washington",
  "woman-with-parasol":"national-gallery-of-art-washington"
};
test("L’Astronome stays at the Louvre and uses only Louvre architecture",async()=>{
  const work=bySlug["vermeer-astronomer"];
  assert.equal(work.currentLocation.museum,"Musée du Louvre");
  const m=resolvePaintingMuseum(work);
  assert.equal(m.slug,"louvre");
  const metadata=JSON.parse(await readFile(new URL(m.url.split("?")[0],root),"utf8"));
  assert.equal(metadata.slug,"louvre");
  assert.match(metadata.media.image,/Louvre\/.*Louvre_museum\.webp/);
});
test("all 24 artworks resolve by actual collection, never by painter",async()=>{
  assert.equal(paintings.length,24);
  for(const painting of paintings){
    const resolved=resolvePaintingMuseum(painting);
    const expected=EXPECTED[painting.slug]||null;
    assert.equal(resolved?.slug||null,expected,painting.slug+": incorrect museum association");
    if(resolved){
      const record=JSON.parse(await readFile(new URL(resolved.url.split("?")[0],root),"utf8"));
      assert.equal(record.slug,resolved.slug);
      await access(new URL(record.media.image,root));
    }
  }
});
test("museums outside the six featured institutions never borrow an artist's museum",()=>{
  for(const slug of ["last-supper","annunciation","vermeer-milkmaid","art-of-painting","starry-night","sunflowers","cafe-terrace","night-cafe","water-lilies","monet-impression-sunrise"]){
    assert.equal(resolvePaintingMuseum(bySlug[slug]),null,slug);
  }
});
test("normalization handles accents and artist identity is irrelevant",()=>{
  assert.equal(normalizeMuseumName("Musée d’Orsay"),"musee d'orsay");
  assert.equal(resolvePaintingMuseum({artist:{name:"Johannes Vermeer"},currentLocation:{museum:"Musée du Louvre"}}).slug,"louvre");
  assert.equal(resolvePaintingMuseum({artist:{name:"Johannes Vermeer"},currentLocation:{museum:"Rijksmuseum"}}),null);
});
test("unsupported museum has a transparent placeholder without deceptive immersive links",async()=>{
  const script=await readFile(new URL("scripts/print-artwork.js",root),"utf8");
  assert.match(script,/resolvePaintingMuseum\(manifest\)/);
  assert.doesNotMatch(script,/artistMuseum|manifest\.artist\?\.name === "Johannes Vermeer"/);
  assert.match(script,/museum-no-photo/);
  assert.match(script,/museumUnavailable/);
});
