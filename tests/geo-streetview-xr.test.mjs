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
 assert.match(viewer,/import \{advancePinchTurn\} from '\.\/streetview-hand-turn\.mjs'/);
 assert.match(viewer,/const handMode=params\.get\('hands'\)==='1'&&!enhancedXR/);
 assert.match(viewer,/function updateHandTurning\(session,xrFrame\)/);
 assert.match(viewer,/xrFrame\.getJointPose\(thumbJoint,referenceSpace\)/);
 assert.match(viewer,/xrFrame\.getJointPose\(indexJoint,referenceSpace\)/);
 assert.match(viewer,/advancePinchTurn\(pinchTurn\.key===key\?pinchTurn\.state:null,sample\)/);
 assert.match(viewer,/renderer\.setAnimationLoop\(\(time,xrFrame\)=>/);
 assert.match(viewer,/handMode\?\['local-floor','hand-tracking'\]:\['local-floor'\]/);
 assert.match(viewer,/handMode&&info\.isHand/);
 assert.match(viewer,/info\.isHand=Boolean\(event\?\.data\?\.hand\)/);
 assert.match(viewer,/handLink\.href='\?'\+handParams\.toString\(\)/);
 assert.match(entry,/id="hand-mode-link"/);
 assert.match(entry,/id="hand-help"/);
 assert.match(entry,/id="hand-status"/);
 
 assert.match(viewer,/const enhancedXR=params\.get\('xrControls'\)==='enhanced'/);
 assert.match(viewer,/if\(session&&!enhancedXR\)/);
 assert.match(viewer,/function activateXRHotspot\(controller\)/);
 assert.doesNotMatch(viewer,/function activateXRHotspot\(controller\)\{\s*if\(!enhancedXR\)return;/);
 assert.doesNotMatch(viewer,/function activateNextXRNeighbor\(\)\{\s*if\(!enhancedXR\)return;/);
 assert.match(viewer,/controllerHit\(controller\)\|\|gazeHit\(\)/);
 assert.match(viewer,/hotspots\.position\.set\(0,1\.25,0\)/);
 assert.match(viewer,/const aimed=new Set\(\)/);

 assert.match(viewer,/if\(pressed&&!buttonStates\.get\(key\)\)activateNextXRNeighbor\(\)/);
 assert.match(viewer,/info\.laser\.visible=Boolean\(info\.connected\)/);
 assert.match(viewer,/new THREE\.SphereGeometry\(\.34,12,10\)/);
 assert.match(viewer,/new THREE\.Sprite\(new THREE\.SpriteMaterial/);
 assert.match(viewer,/sprite\.scale\.set\(\.30,\.30,1\)/);
 assert.match(viewer,/hitArea\.userData\.navigation=nav/);
 assert.match(viewer,/hitArea\.userData\.badge=badge/);
 assert.match(viewer,/updateHoverCard\(aimed\.values\(\)\.next\(\)\.value\|\|null\)/);
 assert.match(viewer,/updateHoverCard\(hovering\.values\(\)\.next\(\)\.value\|\|null\)/);
 assert.match(viewer,/hoverCard\.position\.copy\(tempOrigin\)/);
 assert.match(viewer,/hoverCard\.lookAt\(rayOrigins\)/);
 assert.match(viewer,/t\.unknownRoom/);
 assert.match(viewer,/t\.googleHint/);
 assert.match(viewer,/button\.setAttribute\('aria-label',button\.title\)/);
 assert.match(viewer,/hitArea\.add\(badge\)/);
 assert.doesNotMatch(viewer,/target\.scale\.setScalar\(selected\?1\.18:1\)/);

 assert.match(viewer,/renderer\.render\(scene,camera\)/);
 
 assert.match(viewer,/if\(session&&enhancedXR\)/);
 assert.match(viewer,/renderer\.render\(scene,camera\)/);
 assert.match(viewer,/renderer\.xr\.addEventListener\('sessionstart'/);
 assert.match(viewer,/navigator\.xr\.requestSession\('immersive-vr'/);
 assert.match(viewer,/xrText\.pending/);
 assert.match(viewer,/xrText\.stale/);
 assert.match(viewer,/vrStatus\.textContent=xrText\.ready/);
 assert.match(entry,/id="xr-diagnostic"/);
 assert.match(entry,/id="xr-mode-link"/);
 assert.match(entry,/id="xr-mode-summary"/);
 assert.match(viewer,/canvas\.addEventListener\('pointerdown'/);
 assert.match(viewer,/canvas\.addEventListener\('pointermove'/);
 assert.match(viewer,/addHotspots\(meta\)/);
 assert.match(viewer,/loadNeighbor\(item\.panoId\)/);
 assert.match(viewer,/function setDesktopZoom/);
 assert.match(viewer,/zoom-in/);
 assert.match(viewer,/zoom-out/);
 assert.doesNotMatch(viewer,/if\(meta\.imageryType==='indoor'\)addHotspots/);
 assert.match(entry,/id="zoom-in"/);
 assert.match(entry,/id="zoom-out"/);
 assert.match(entry,/id="links-help"/);
 assert.match(viewer,/canvas\.addEventListener\('wheel'/);
 assert.match(viewer,/session\.inputSources/);
 assert.match(viewer,/controller\.addEventListener\('selectstart'/);
 assert.match(viewer,/controller\.addEventListener\('select'/);
 assert.match(viewer,/controller\.add\(laser\)/);

 assert.match(viewer,/head\.getWorldPosition\(rayOrigins\)/);

 assert.match(viewer,/gazeHit\(\)/);
 assert.match(viewer,/source\.gamepad\?\.buttons\?\.\[4\]/);
 assert.match(viewer,/activateNextXRNeighbor\(\)/);
 assert.match(viewer,/vrNotice\(t\.aim\)/);
 assert.match(viewer,/if\(renderer\.xr\.isPresenting\)vrNotice/);
 assert.match(entry,/petit repère doré numéroté/);
 assert.match(viewer,/numéro|number|رقم/);
 assert.match(viewer,/hoverCard\.visible=true/);
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
