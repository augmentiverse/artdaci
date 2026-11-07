import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const here=new URL('../',import.meta.url);
const content=async file=>readFile(new URL(file,here),'utf8');

test('the homepage hero exposes VR Gallery and accurately names the Living Book in all languages',async()=>{
 for(const [page,lang,book,vr,scan] of [
  ['index.html','en','Explore the Living Book','Enter the VR Gallery','Scan the book cover in AR'],
  ['index-fr.html','fr','Explorer le Livre vivant','Entrer dans la galerie VR','Scanner la couverture en RA'],
  ['index-ar.html','ar','استكشف الكتاب الحي','ادخل معرض الواقع الافتراضي','امسح غلاف الكتاب بالواقع المعزز']
 ]){
  const html=await content(page);
  assert.match(html,new RegExp('href="book-3d\\.html\\?lang='+lang+'">'+book));
  assert.match(html,new RegExp('href="gallery-vr\\.html\\?lang='+lang+'">'+vr));
  assert.match(html,new RegExp('href="book-ar\\.html\\?lang='+lang+'">'+scan));
  assert.match(html,/href="#featured-title"/);
  assert.match(html,new RegExp('href="3d/\\?lang='+lang+'"'));
 }
});

test('supplied GEO panorama and painting links stay separate and trusted',async()=>{
 const data=JSON.parse(await content('geo/data/artwork-museum-views.json'));
 const get=slug=>data.items.find(x=>x.slug===slug);
 const pearl=get('vermeer-girl-with-a-pearl-earring');
 assert.ok(pearl.googleMapsPanoramaUrl.startsWith('https://www.google.com/maps/'));
 assert.ok(pearl.googleMapsPanoramaUrl.includes('fHwCjye_LWcAAAQrDCFU1A'));
 assert.ok(pearl.exactPanoramaUrl.startsWith('https://artsandculture.google.com/streetview/'));
 const delft=get('view-of-delft');
 assert.ok(delft.googleMapsPanoramaUrl.includes('Qk3tjMU9r-IAAAQrDCFU0A'));
 assert.ok(get('vermeer-milkmaid').exactPanoramaUrl.endsWith('/kgF3c2qIEYZR8g'));
 const monet=get('woman-with-parasol');
 assert.equal(monet.exactPanoramaUrl,null);
 assert.ok(monet.artworkReferenceUrl.startsWith('https://artsandculture.google.com/asset/'));
 assert.ok(monet.museumGoogleMapsPanoramaUrl.includes('yrLgZVKGIbwAAARXTGCytQ'));
 for(const id of ['woman-holding-balance','ginevra-de-benci'])
  assert.equal(get(id).museumGoogleMapsPanoramaUrl,monet.museumGoogleMapsPanoramaUrl);
 assert.equal(data.items.length,24);
});

test('public GEO restricts destination domains and does not expose private WebXR Google Cloud API',async()=>{
 const js=await content('geo/scripts/streetview-public.js');
 assert.match(js,/function verifiedMapsUrl/);
 assert.match(js,/u\.hostname==='www\.google\.com'/);
 assert.match(js,/function artworkReference/);
 assert.match(js,/u\.pathname\.startsWith\('\/asset\/'\)/);
 assert.match(js,/mapsArtwork\?\s*'action action-secondary'/);
 assert.match(js,/if\(point&&!mapsArtwork&&!mapsMuseum\)/);
 assert.doesNotMatch(js,/MUSEUM_XR_GOOGLE|tile\.googleapis\.com|\/api\/museum-xr/);
});
