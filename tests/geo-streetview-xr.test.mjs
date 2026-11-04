import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {parseMuseumLink,metersBetween,validateIndoorPanorama,tileGrid,bearingVector} from '../geo/scripts/streetview-xr-core.mjs';

const official='https://artsandculture.google.com/streetview/the-national-gallery/abc?sv_lat=51.5088&sv_lng=-0.1293&sv_h=62.98&sv_p=8';
test('only trusted Arts & Culture URLs and finite coordinates are accepted',()=>{
 assert.equal(parseMuseumLink('https://evil.example/?sv_lat=51&sv_lng=1'),null);
 assert.equal(parseMuseumLink('javascript:alert(1)'),null);
 assert.equal(parseMuseumLink('https://artsandculture.google.com/?sv_lat=999&sv_lng=0'),null);
 assert.equal(parseMuseumLink('https://artsandculture.google.com/?sv_lat=&sv_lng=0'),null);
 assert.deepEqual(parseMuseumLink(official)?.lat,51.5088);
});
test('coordinates are geodetically bounded',()=>{assert.equal(metersBetween({lat:1,lng:1},{lat:1,lng:1}),0)});
test('unverified and outdoor Google viewpoints are not claimed as museum interiors',()=>{
 const target={lat:51.5088,lng:-0.1293};
 const good={panoId:'temp',lat:51.5088,lng:-0.1293,imageryType:'indoor'};
 assert.equal(validateIndoorPanorama(good,target).ok,true);
 assert.equal(validateIndoorPanorama({...good,imageryType:'outdoor'},target).reason,'outdoor');
 assert.equal(validateIndoorPanorama({...good,lat:51.6},target).reason,'distance');
 assert.equal(validateIndoorPanorama({},target).ok,false);
});
test('tiled panoramas have a bounded resolution and request budget',()=>{
 const normal={imageWidth:13312,imageHeight:6656,tileWidth:512,tileHeight:512};
 assert.deepEqual(tileGrid(normal,3),{outputWidth:3328,outputHeight:1664,tileWidth:512,tileHeight:512,columns:7,rows:4,level:3});
 assert.deepEqual(tileGrid(normal,2),{outputWidth:1664,outputHeight:832,tileWidth:512,tileHeight:512,columns:4,rows:2,level:2});
 assert.deepEqual(tileGrid(normal,1),{outputWidth:832,outputHeight:416,tileWidth:512,tileHeight:512,columns:2,rows:1,level:1});
 assert.deepEqual(tileGrid(normal,0),{outputWidth:416,outputHeight:208,tileWidth:512,tileHeight:512,columns:1,rows:1,level:0});
 assert.throws(()=>tileGrid(normal,5),/memory budget/);
 assert.throws(()=>tileGrid({imageWidth:0},2));
 assert.ok(Math.abs(bearingVector(90).x-3)<1e-8);
});
test('museum XR is opt-in, uses official URLs and does not overwrite existing VR scenes',async()=>{
 const [viewer,entry,registry,louvre]=await Promise.all([
  readFile(new URL('../geo/scripts/streetview-xr.js',import.meta.url),'utf8'),
  readFile(new URL('../geo/museum-xr.html',import.meta.url),'utf8'),
  readFile(new URL('../geo/scripts/museum-views.js',import.meta.url),'utf8'),
  readFile(new URL('../geo/louvre-xr.html',import.meta.url),'utf8')
 ]);
 assert.match(viewer,/requestSession\('immersive-vr'/);
 assert.match(viewer,/canvas\.addEventListener\('pointerdown'/);
 assert.match(viewer,/canvas\.addEventListener\('pointermove'/);
 assert.match(viewer,/canvas\.addEventListener\('wheel'/);
 assert.match(viewer,/session\.inputSources/);
 assert.match(viewer,/hdUnavailable/);
 assert.match(entry,/id="controls-help"/);
 assert.match(viewer,/museum-xr/);
 assert.doesNotMatch(viewer,/GOOGLE_MAP_TILES_KEY/);
 assert.match(viewer,/reportProblemLink/);
 assert.match(viewer,/meta\.copyright/);
 assert.match(entry,/scripts\/streetview-xr\.js/);
 assert.match(entry,/id="quality"/);
 assert.match(viewer,/quality:\$\('quality'\)\.value/);
 assert.match(viewer,/dim\.width\+' × '\+dim\.height/);
 assert.match(viewer,/Promise\.all\(\[worker\(\),worker\(\)\]\)/);
 assert.match(registry,/museum-xr\.html/);
 assert.match(louvre,/scripts\/louvre-xr\.js/);
});
