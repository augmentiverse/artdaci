import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import * as THREE from '../vendor/three.module.js';
import {guideText,validateActiveGuideConfig,createActiveGuideFlow} from '../geo/scripts/active-guide.mjs';
import {createActiveGuideXrPanel,guideButtonAt} from '../geo/scripts/active-guide-xr-panel.mjs';
import {controllerRayScale} from '../geo/scripts/room-xr-panel.mjs';

const readJson=async path=>JSON.parse(await readFile(new URL(path,import.meta.url)));
const guide=await readJson('../geo/data/leonardo-active-guide.json');
const room=await readJson('../geo/data/salle-des-etats.json');
const catalog=await readJson('../content/media-manifests/catalog.json');
const source=await readFile(new URL('../geo/scripts/room-viewer.js',import.meta.url),'utf8');
const poiIds=room.pointsOfInterest.map(item=>item.id);
const availablePoiIds=poiIds;

test('V6.10 configuration has localized stages, canonical artworks and only the existing room POI',()=>{
  const ids=JSON.stringify(catalog);
  for(const work of guide.guideSections.leonardoWorks)assert.ok(ids.includes(`"${work.artworkId}"`));
  assert.deepEqual(validateActiveGuideConfig(guide,{roomPoiIds:poiIds,knownArtworkIds:['ld01','ld06']}),[]);
  assert.deepEqual(guide.guideSections.leonardoWorks.map(item=>item.artworkId),['ld01','ld06']);
  assert.equal(guide.guideSections.leonardoWorks[0].action.targetPoiId,'ld01-mona-lisa');
  assert.equal(guide.guideSections.leonardoWorks[1].action.type,'information');
  assert.equal(guide.guideSections.leonardoWorks[1].museumStatus,'louvre-collection-display-unverified');
  assert.equal(guide.guideSections.artTrail.nextPoiId,null);
  assert.equal(guide.audio.status,'not-available');
  for(const language of ['fr','en','ar']){
    assert.equal(guide.audio[language],null);
    for(const view of Object.values(guide.states))assert.ok(view.title[language] && view.description[language]);
  }
});

test('V6.10 validator rejects invented room placement, artwork, narration and missing translation',()=>{
  const options={roomPoiIds:poiIds,knownArtworkIds:['ld01','ld06']};
  for(const change of [
    data=>data.guideSections.leonardoWorks[1].action={type:'roomPoi',targetPoiId:'invented-room'},
    data=>data.guideSections.leonardoWorks[1].artworkId='invented-artwork',
    data=>data.guideSections.leonardoWorks[1].museumStatus='on-display-in-current-room',
    data=>data.audio.fr='invented.mp3',
    data=>delete data.states.welcome.title.ar,
  ]){
    const invalid=structuredClone(guide);change(invalid);
    assert.notDeepEqual(validateActiveGuideConfig(invalid,options),[]);
  }
});

test('Welcome, Mona introduction and post-visit follow a contextual event flow, reusing ld01',()=>{
  const flow=createActiveGuideFlow(guide,{availablePoiIds});
  assert.equal(flow.snapshot().state,'notStarted');
  flow.dispatch('LEONARDO_SELECTED');assert.equal(flow.presentation('fr').key,'welcome');
  flow.dispatch('START_TOUR');assert.equal(flow.presentation('fr').key,'monaLisaIntro');
  flow.dispatch('MONA_MORE');assert.equal(flow.presentation('fr').key,'monaMore');
  assert.deepEqual(flow.dispatch('SEE_MONA_LISA').effect,{type:'roomPoi',targetPoiId:'ld01-mona-lisa'});
  flow.dispatch('MONA_LISA_OPENED');assert.equal(flow.snapshot().state,'monaLisaVisited');
  flow.dispatch('RETURN_TO_GUIDE');assert.equal(flow.presentation('fr').key,'postMonaLisa');
  assert.deepEqual(flow.dispatch('REVIEW_MONA').effect,{type:'roomPoi',targetPoiId:'ld01-mona-lisa'});
  assert.equal(flow.presentation('ar').dir,'rtl');
});

test('Other Louvre work is informational, Art Trail does not teleport, and Leonardo profile is existing route',()=>{
  const flow=createActiveGuideFlow(guide,{availablePoiIds});
  flow.dispatch('LEONARDO_SELECTED');flow.dispatch('ABOUT_LEONARDO');
  assert.deepEqual(flow.dispatch('OPEN_PROFILE').effect,{type:'route',path:'../print-leonardo-tribute.html'});
  flow.dispatch('MONA_LISA_VISITED');flow.dispatch('RETURN_TO_GUIDE');flow.dispatch('SHOW_WORKS');
  assert.equal(flow.presentation('en').actions.some(action=>action.id==='SELECT_WORK:ld06'),true);
  assert.equal(flow.dispatch('SELECT_WORK:ld06').effect,null);
  assert.equal(flow.presentation('en').key,'workDetail');
  assert.match(flow.presentation('en').description,/unverified/i);
  flow.dispatch('BACK');flow.dispatch('BACK');
  assert.equal(flow.presentation('en').key,'postMonaLisa');
  assert.equal(flow.dispatch('CONTINUE_TRAIL').effect,null);
  assert.equal(flow.presentation('en').key,'trail');
  assert.equal(flow.snapshot().state,'trailOffered');
});

test('A future configured Art Trail destination can emit a real POI effect only when that POI exists',()=>{
  const configured=structuredClone(guide);
  configured.guideSections.artTrail.nextPoiId='future-louvre-poi';
  const unavailable=createActiveGuideFlow(configured,{availablePoiIds});
  unavailable.dispatch('MONA_LISA_VISITED');unavailable.dispatch('RETURN_TO_GUIDE');
  assert.equal(unavailable.dispatch('CONTINUE_TRAIL').effect,null);
  const available=createActiveGuideFlow(configured,{availablePoiIds:[...availablePoiIds,'future-louvre-poi']});
  available.dispatch('MONA_LISA_VISITED');available.dispatch('RETURN_TO_GUIDE');
  assert.deepEqual(available.dispatch('CONTINUE_TRAIL').effect,{type:'roomPoi',targetPoiId:'future-louvre-poi'});
});

test('V6.10 XR panel is compact, translucent, localized and targetable by both controllers',()=>{
  const previous=globalThis.document;
  const ctx={clearRect(){},fillRect(){},strokeRect(){},fillText(){},measureText(value){return {width:String(value).length*13};}};
  globalThis.document={createElement:()=>({width:1024,height:800,getContext:()=>ctx})};
  try{for(const language of ['fr','en','ar']){
    const flow=createActiveGuideFlow(guide,{availablePoiIds});flow.dispatch('LEONARDO_SELECTED');
    const panel=createActiveGuideXrPanel(THREE,language);
    panel.draw(flow.presentation(language),{kicker:'Guide',role:'Leonardo',closeLabel:guideText(guide.actionLabels.CLOSE,language)});
    panel.mesh.visible=true;panel.mesh.position.z=-1.55;panel.mesh.updateMatrixWorld(true);
    for(const x of [-.18,.18]){
      const ray=new THREE.Raycaster(new THREE.Vector3(x,0,0),new THREE.Vector3(-x+(284/1024-.5)*1.28,(.5-553/800),-1.55).normalize());
      const hit=panel.hit(ray);
      assert.equal(hit.action,'guide-v610:START_TOUR');
      assert.ok(controllerRayScale(hit)<1);
      panel.setHover(hit.action);
    }
    assert.equal(panel.mesh.geometry.parameters.width,1.28);
    assert.equal(panel.mesh.geometry.parameters.height,1);
    assert.equal(guideButtonAt([{id:'x',x:10,y:10,width:40,height:30}],20,20),'x');
    panel.dispose();
  }}finally{globalThis.document=previous;}
});

test('Viewer dispatches guide events without changing Mona Lisa open/approach or controller locomotion',()=>{
  assert.match(source,/function showMonaFromGuide\(\)\s*\{\s*closeGuide\(\);\s*openPoi\(\);\s*approachPoi\(\);\s*\}/);
  assert.match(source,/activeGuideFlow\?\.dispatch\('MONA_LISA_OPENED'\)/);
  assert.match(source,/activeGuideFlow\?\.dispatch\('MONA_LISA_VISITED'\)/);
  assert.match(source,/activeGuidePanel\?\.hit\(xrRay\)/);
  assert.match(source,/activeGuidePanel\?\.setHover\(panelHover\)/);
  assert.match(source,/guideOpen && activeGuidePanel\?activeGuidePanel:xrPanel/);
  assert.match(source,/const turn=snapTurn\(right\.x,turnArmed/);
  assert.match(source,/const next=movePosition\(head,yaw,-deadZone\(left\.y\)/);
});

test('Actual room controller select handlers activate V6.10 buttons with both Quest hands',async()=>{
  const scene=new THREE.Scene(),rig=new THREE.Group();scene.add(rig);
  const left=new THREE.Group(),right=new THREE.Group();
  const events=[],target={distance:1,point:new THREE.Vector3(0,1,-1)};
  const activeGuidePanel={hit:()=>({...target,inside:true,action:'guide-v610:START_TOUR'}),setHover:()=>{}};
  const renderer={xr:{isPresenting:true,getController:index=>[left,right][index],getSession:()=>({visibilityState:'visible'}),addEventListener(){}}};
  const state=vm.createContext({THREE,scene,rig,renderer,controllers:[],config:room,xrRay:new THREE.Raycaster(),
    activeGuidePanel,xrPanel:{hit:()=>null,setHover:()=>{}},guide:{hit:()=>null,setHover:()=>{}},hitArtwork:()=>null,
    navigator:{xr:{isSessionSupported:async()=>true}},xrButton:{addEventListener(){}},copy:{vr:'VR'},ready:true,
    turnArmed:false,xrSupported:false,head:new THREE.Vector3(),camera:{},runPoiAction:action=>events.push(action),
    controllerRayScale,hotspotHover:false,updateHotspot(){}});
  vm.runInContext(source.slice(source.indexOf('function xrInteractiveHit('),source.indexOf('function turnRig(')),state);
  await state.configureXr();
  for(const [controller,handedness] of [[left,'left'],[right,'right']]){
    controller.dispatchEvent({type:'connected',data:{handedness}});
    controller.dispatchEvent({type:'select'});
  }
  assert.deepEqual(events,['guide-v610:START_TOUR','guide-v610:START_TOUR']);
  assert.ok(rig.position.equals(new THREE.Vector3()),'Guide button selection must not teleport');
  scene.userData.updateTeleport();
  assert.equal(left.userData.line.scale.z,.2);
  assert.equal(right.userData.line.scale.z,.2);
});
