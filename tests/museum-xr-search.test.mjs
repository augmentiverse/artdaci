import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
const require=createRequire(import.meta.url);
const search=require('../lib/museum-xr-search.cjs');

test('bounded pilot searches around one museum coordinate only',()=>{
 const m={lat:51.5088729467,lng:-0.1293340557};
 const coords=search.searchLocations(m);
 assert.equal(coords.length,13);
 assert.deepEqual(coords[0],{lat:0+Math.round(m.lat*1e8)/1e8,lng:0+Math.round(m.lng*1e8)/1e8});
 assert.ok(coords.every(c=>Math.abs(c.lat-m.lat)<0.0002&&Math.abs(c.lng-m.lng)<0.0003));
 assert.throws(()=>search.searchLocations({lat:90,lng:0}),/Invalid/);
});
test('Google panoIds deduplicated, bounded and cleaned',()=>{
 const panoIds=Array.from({length:20},(_,n)=>'pano_test_'+n);
 const ids=search.distinctPanoIds({panoIds:['',null,'bad!',panoIds[0],panoIds[0],...panoIds]});
 assert.equal(ids.length,8);
 assert.equal(ids[0],panoIds[0]);
 assert.deepEqual(search.distinctPanoIds({panoIds:[]}),[]);
});
test('unverified outdoor or distant panoramas never pass the classification',()=>{
 const m={lat:51.50887,lng:-0.12933};
 const validate=(v)=>v.imageryType==='indoor'&&v.lat===m.lat&&v.lng===m.lng;
 assert.equal(search.classify({panoId:'pano1',imageryType:'outdoor'},m,validate),'nearest-outdoor');
 assert.equal(search.classify({panoId:'pano1',imageryType:'indoor',lat:0},m,validate),'outside-museum-radius');
 assert.equal(search.classify({panoId:'pano1',imageryType:'indoor',lat:m.lat,lng:m.lng},m,validate),'indoor-nearby');
 assert.equal(search.classify({},m,validate),'no-panorama');
});
test('gateway queries Google bulk panoIds with bounded candidates rather than trusting Arts & Culture pano ID',async()=>{
 const source=await readFile(new URL('../api/museum-xr.js',import.meta.url),'utf8');
 assert.match(source,/streetview\/panoIds/);
 assert.match(source,/finder\.distinctPanoIds/);
 assert.match(source,/security\.validateIndoor\(data,m\)/);
 assert.match(source,/INDOOR_PANORAMA_NOT_FOUND/);
});
