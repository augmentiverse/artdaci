import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const read=path=>readFile(new URL('../'+path,import.meta.url),'utf8');

test('GEO homepage introduces real experiences and two focused paths without Louvre pilot copy',async()=>{
 const html=await read('geo/index.html');
 assert.match(html,/<h1 id="geo-title"/);
 assert.match(html,/id="oeuvres"/);
 assert.match(html,/id="musees"/);
 assert.match(html,/data-copy="siteNote"/);
 assert.match(html,/id="artworks-title"/);
 assert.match(html,/id="museums-title"/);
 assert.doesNotMatch(html,/Geo-AR|VPS|Proof of Concept|ld01|data-place-name|data-artwork-id/);
 assert.doesNotMatch(html,/scripts\/geo-page\.js/);
 assert.match(html,/scripts\/geo-home\.js/);
 assert.match(html,/styles\/geo-home\.css/);
});
test('four artwork panoramas are highlighted with a complete 24-work fallback',async()=>{
 const html=await read('geo/index.html');
 const ids=[...html.matchAll(/data-featured-panorama="([^"]+)"/g)].map(x=>x[1]);
 assert.deepEqual(ids,[
  'vermeer-girl-with-a-pearl-earring','view-of-delft','vermeer-milkmaid','van-gogh'
 ]);
 assert.match(html,/streetview-360\.html\?lang=fr/);
 assert.match(html,/artwork-van-gogh/);
 assert.match(html,/self-portrait-orsay-1889-v1.webp/);
 const data=JSON.parse(await read('geo/data/artwork-museum-views.json'));
 assert.equal(data.items.length,24);
 for(const id of ids){
  const item=data.items.find(x=>x.slug===id);
  assert.ok(item?.exactPanoramaUrl||item?.googleMapsPanoramaUrl,id);
 }
});
test('museum path opens the existing Earth Explorer KML and photographic atlas',async()=>{
 const html=await read('geo/index.html');
 assert.match(html,/\.\.\/earth-explorer\.html\?lang=fr/);
 assert.match(html,/artdaci-museums\.kml/);
 assert.match(html,/\.\.\/museums-atlas\.html/);
 assert.match(html,/\.\.\/museums\.html\?lang=fr/);
 const registry=JSON.parse(await read('geo/data/museums.json'));
 assert.equal(registry.museums.length,17);
});
test('localized GEO homepage does not expose the private Google Maps Tiles gateway',async()=>{
 const js=await read('geo/scripts/geo-home.js');
 const html=await read('geo/index.html');
 const css=await read('geo/styles/geo-home.css');
 for(const label of ['fr:{','en:{','ar:{','navArtworks','navMuseums','transparencyTitle','artworksTitle','museumsTitle'])
  assert.ok(js.includes(label),label);
 assert.match(js,/function safePanorama\(value\)/);
 assert.match(js,/artsandculture\.google\.com/);
 assert.match(js,/www\.google\.com/);
 assert.match(js,/lang==='ar'\?'rtl':'ltr'/);
 assert.match(js,/museums-atlas-ar\.html/);
 assert.match(js,/museums-atlas-en\.html/);
 assert.doesNotMatch(js+html,/tile\.googleapis\.com|\/api\/museum-xr|MUSEUM_XR_GOOGLE/);
 assert.match(css,/@media\(max-width:510px\)/);
 assert.match(css,/prefers-reduced-motion/);
 assert.match(html,/class="skip-link"/);
});
