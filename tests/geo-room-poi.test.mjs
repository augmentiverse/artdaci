import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from '../vendor/three.module.js';
import {validateRoomPoi,resolveRoomPoi,roomPoiAudioCandidates,roomHotspotPosition,interpolateRoomView} from '../geo/scripts/room-poi.mjs';
import {controllerRayScale,createRoomXrPanel} from '../geo/scripts/room-xr-panel.mjs';

const room=JSON.parse(await readFile(new URL('../geo/data/salle-des-etats.json',import.meta.url),'utf8'));
const place=JSON.parse(await readFile(new URL('../geo/data/louvre.json',import.meta.url),'utf8'));
const manifest=JSON.parse(await readFile(new URL('../content/media-manifests/artworks/ld01/manifest.json',import.meta.url),'utf8'));
const viewerUrl=new URL('../geo/scripts/room-viewer.js',import.meta.url);

test('Room-local hotspot links only the existing ld01 node and content, not surveyed coordinates',()=>{
  assert.deepEqual(validateRoomPoi(room,place),[]);
  assert.equal(room.pointsOfInterest.length,1);
  const anchor=room.pointsOfInterest[0].anchor;
  assert.equal(anchor.targetNode,room.artwork.nodeName);
  assert.equal(anchor.coordinateSpace,'generated-room-local-y-up');
  assert.match(anchor.calibrationStatus,/not-surveyed/);
  const position=roomHotspotPosition({x:0,y:2.1,z:-9.535},anchor.offset);
  assert.ok(position.z>room.artwork.position[2]);
  assert.equal(position.x,room.artwork.position[0]);
  assert.ok(position.y<1.58,'The unobtrusive marker sits below the frame');
  assert.equal(room.pointsOfInterest[0].anchor.offset[1],-.71,'The marker is slightly lower without moving the artwork');
  const invalid=structuredClone(room);invalid.pointsOfInterest[0].anchor.offset=[0,NaN,0];
  assert.ok(validateRoomPoi(invalid,place).includes('Invalid room-local artwork anchor'));
  const duplicate=structuredClone(room);duplicate.pointsOfInterest.push(structuredClone(duplicate.pointsOfInterest[0]));
  assert.ok(validateRoomPoi(duplicate,place).includes('Room point of interest ids must be unique'));
});

test('Mona Lisa information, artist and WebXR route remain localized in FR, EN and AR',()=>{
  for(const language of ['fr','en','ar']){
    const poi=resolveRoomPoi(room,place,language);
    assert.equal(poi.title,place.pointsOfInterest[1].content.title[language]);
    assert.equal(poi.artist,place.pointsOfInterest[1].content.artist[language]);
    assert.equal(poi.description,place.pointsOfInterest[1].content.description[language]);
    assert.equal(poi.artworkUrl,`../vr.html?painting=mona-lisa&model=2&lang=${language}`);
  }
});

test('Audio candidates use published canonical overview first, then the existing local copy',()=>{
  for(const language of ['fr','en','ar']){
    const poi=resolveRoomPoi(room,place,language);
    const candidates=roomPoiAudioCandidates(poi,manifest,language,viewerUrl);
    assert.deepEqual(candidates.map(item=>item.source),['r2','local']);
    assert.match(candidates[0].url,new RegExp(`/audio/${language}/overview\\.mp3$`));
    assert.ok(candidates[1].url.startsWith(new URL('../',import.meta.url).href));
    assert.ok(candidates[1].url.endsWith('.mp3'));
  }
});

test('Unavailable or malformed manifest gives one local audio fallback, with no retry loop',()=>{
  const poi=resolveRoomPoi(room,place,'fr');
  for(const unavailable of [null,{media:{audio:{overview:{fr:{available:false}}}}},{mediaBaseUrl:'http://invalid/',media:{audio:{overview:{fr:{path:'../bad.mp3',available:true}}}}}]){
    const candidates=roomPoiAudioCandidates(poi,unavailable,'fr',viewerUrl);
    assert.equal(candidates.length,1);
    assert.equal(candidates[0].source,'local');
  }
});

test('Smooth approach has exact endpoints and a short route across the angle boundary',()=>{
  const start={x:0,z:13,yaw:Math.PI-.1},end={x:0,z:-7.3,yaw:-Math.PI+.1};
  assert.deepEqual(interpolateRoomView(start,end,0),start);
  const middle=interpolateRoomView(start,end,.5);
  assert.ok(Math.abs(middle.z-2.85)<1e-9);
  assert.ok(Math.abs(middle.yaw-Math.PI)<1e-9);
  assert.ok(Math.abs(interpolateRoomView(start,end,1).yaw-(Math.PI+.1))<1e-9);
});

test('Quest controller ray ends at the panel surface while retaining the usual length off-menu',()=>{
  assert.equal(controllerRayScale({distance:1.5}),.3);
  assert.equal(controllerRayScale({distance:5}),1);
  assert.equal(controllerRayScale({distance:10}),1);
  assert.equal(controllerRayScale(null),1);
  assert.equal(controllerRayScale({distance:0}),1);
});

test('Quest panel ray identifies the actual button and highlights only that target',()=>{
  const previousDocument=globalThis.document,fills=[];
  const context={
    clearRect(){},strokeRect(){},fillText(){},measureText(value){return {width:String(value).length*13};},
    fillRect(x,y,width,height){fills.push({x,y,width,height,color:this.fillStyle});},
  };
  globalThis.document={createElement:()=>({width:1024,height:800,getContext:()=>context})};
  let panel;
  try{
    panel=createRoomXrPanel(THREE,'fr');
    panel.draw({artworkLabel:'Œuvre',observe:'Observer',vrPoiHint:'Viser',approach:'Approcher',play:'Écouter',stop:'Arrêter',explore:'Explorer',returnRoom:'Retour'},
      {title:'La Joconde',artist:'Léonard de Vinci',description:'Présentation de l’œuvre.'},{audioLabel:'Audio disponible'});
    panel.mesh.visible=true;panel.mesh.position.z=-1.5;panel.mesh.updateMatrixWorld(true);
    const x=(200/1024-.5)*1.28,y=.5-550/800;
    const ray=new THREE.Raycaster(new THREE.Vector3(),new THREE.Vector3(x,y,-1.5).normalize());
    const hit=panel.hit(ray);
    assert.equal(hit.action,'approach');
    assert.ok(Math.abs(hit.distance-1.5)<.1);
    assert.equal(fills.findLast(item=>item.x===48 && item.y===510).color,'#33404a');
    panel.setHover(hit.action);
    assert.equal(fills.findLast(item=>item.x===48 && item.y===510).color,'#8de2ed');
    panel.setHover(null);
    assert.equal(fills.findLast(item=>item.x===48 && item.y===510).color,'#33404a');
  } finally {panel?.dispose();globalThis.document=previousDocument;}
});

test('HTML and viewer expose desktop, touch and Quest selection without changing V5 room controls',async()=>{
  const html=await readFile(new URL('../geo/room.html',import.meta.url),'utf8');
  const viewer=await readFile(viewerUrl,'utf8');
  const xrPanel=await readFile(new URL('../geo/scripts/room-xr-panel.mjs',import.meta.url),'utf8');
  for(const id of ['poi-button','room-poi-panel','poi-approach','poi-observe','poi-explore','poi-return','poi-audio-play','poi-audio-stop','poi-observation-controls','poi-observation-audio','poi-observation-explore','poi-observation-return'])assert.ok(html.includes(`id="${id}"`),id);
  assert.match(viewer,/pointerHitsArtwork\(e\)/);
  assert.match(viewer,/xrInteractiveHit\(controller\)/);
  assert.ok(viewer.indexOf("if(interactive?.kind==='artwork')")<viewer.indexOf('const point=controller.userData.getTarget()'));
  assert.match(viewer,/returnToRoom\(\) \{closePoi\(\)/);
  assert.match(xrPanel,/raycaster\.intersectObject\(mesh,false\)/);
  assert.match(xrPanel,/button\('explore',copy\.explore/);
  assert.match(xrPanel,/button\('audio',audioActionLabel/);
  assert.match(xrPanel,/ctx\.lineWidth=targeted\?7:2/);
  assert.match(viewer,/line\.scale\.z=controllerRayScale\(interactive\)/);
  assert.match(viewer,/xrPanel\.setHover\(panelHover\)/);
  assert.match(viewer,/cursor\.position\.copy\(interactive\.point\)/);
  assert.match(viewer,/snapTurn\(right.x,turnArmed/);
  assert.match(viewer,/controller.userData.getTarget/);
  assert.match(html,/data-lang="ar"/);
  assert.equal(room.version,'v5');
  assert.equal(room.model.sha256,'59359407aa1ab092c30932bed3e79fcf60f993fc534c8197835943c79e00efac');
});
