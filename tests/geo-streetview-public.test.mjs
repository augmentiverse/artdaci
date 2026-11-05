import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const root=new URL('../geo/',import.meta.url);
async function source(path){return readFile(new URL(path,root),'utf8')}
async function json(path){return JSON.parse(await source(path))}

test('24 artworks map to sourced museum pins, with 17 atlas museums and one extra institution',async()=>{
 const [art,museum,venues]=await Promise.all([
  json('data/artwork-museum-views.json'),
  json('data/museums.json'),
  json('data/artwork-streetview-venues.json')
 ]);
 assert.equal(art.items.length,24);
 assert.equal(museum.museums.length,17);
 assert.equal(venues.additionalVenues.length,1);
 assert.equal(Object.keys(venues.artworkToVenue).length,24);
 const points=new Map([...museum.museums,...venues.additionalVenues].map(v=>[v.id,v]));
 for(const artwork of art.items){
  const venue=points.get(venues.artworkToVenue[artwork.slug]);
  assert.ok(venue,'missing venue for '+artwork.slug);
  assert.ok(Number.isFinite(venue.latitude)&&Math.abs(venue.latitude)<=90);
  assert.ok(Number.isFinite(venue.longitude)&&Math.abs(venue.longitude)<=180);
  assert.ok(/^https:\/\//.test(venue.coordinateSource));
 }
 assert.equal(art.items.filter(x=>x.exactPanoramaUrl).length,6);
});
test('direct panoramas are official Arts and Culture URLs, and artwork visibility is not asserted',async()=>{
 const {items}=await json('data/artwork-museum-views.json');
 for(const work of items.filter(x=>x.exactPanoramaUrl)){
  const url=new URL(work.exactPanoramaUrl);
  assert.equal(url.hostname,'artsandculture.google.com');
  assert.ok(url.pathname.startsWith('/streetview/'),work.slug);
 }
 const page=await source('streetview-360.html');
 const client=await source('scripts/streetview-public.js');
 assert.match(page,/une vue panoramique proche d’un musée/i);
 assert.match(client,/sourceKind\(item\)/);
 assert.match(client,/providerLink\(item\.exactPanoramaUrl\)/);
 assert.match(client,/map_action','pano'/);
 assert.match(client,/viewpoint',lat\+','\+lng/);
 assert.doesNotMatch(client,/museum-xr|GoogleServiceToken|MUSEUM_XR_|tile\.googleapis\.com/);
 assert.match(client,/source:\'Visite \/ source institutionnelle\'/);
 assert.match(client,/quest:'Dans Meta Quest Browser/);
});
test('GEO and museum dossier pages link to multilingual public discovery without breaking their original flows',async()=>{
 const [geo,geoPage,views,viewsJs,publicPage]=await Promise.all([
  source('index.html'),source('scripts/geo-page.js'),
  source('museum-views.html'),source('scripts/museum-views.js'),
  source('streetview-360.html')
 ]);
 assert.match(geo,/data-geo-link="streetview-360\.html"/);
 assert.match(geo,/data-copy="streetviewOpen"/);
 assert.match(geoPage,/streetviewTitle:/);
 assert.match(geoPage,/streetviewOpen:/);
 assert.match(views,/id="streetview-public-link"/);
 assert.match(viewsJs,/streetview-360\.html\?lang=/);
 assert.match(publicPage,/scripts\/streetview-public\.js/);
 for(const id of ['page-title','geo-disclaimer','cards','q','kind','results','geo-return'])
  assert.match(publicPage,new RegExp('id="'+id+'"'));
 for(const lang of ['fr','en','ar'])
  assert.match(publicPage,new RegExp('data-lang="'+lang+'"'));
});
