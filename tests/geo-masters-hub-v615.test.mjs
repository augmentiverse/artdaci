import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import * as THREE from '../vendor/three.module.js';
import {MAX_ACTIVE_GUIDES,createArtistGuideEngine,validateArtistGuideConfig} from '../geo/scripts/artist-guide-engine.mjs';
import {createGuideModelHandle} from '../geo/scripts/artist-guide-model.mjs';
import {resolveArtworkCapabilities} from '../geo/scripts/artwork-experience.mjs';
import {HUB_GUIDE_COPY,validateHub,layoutHubButtons,panelButtonAt} from '../geo/scripts/masters-hub-core.mjs';

const root=new URL('../',import.meta.url),json=path=>JSON.parse(readFileSync(new URL(path,root),'utf8'));
const hub=json('geo/data/masters-hub.json'),catalog=json('content/media-manifests/catalog.json');
const guides=['leonardo','vermeer','vangogh','monet'].map(name=>json(`geo/data/guides/${name}-hub-guide.json`));
const leonardo=guides[0],modelPath=leonardo.model.path;
const flush=()=>new Promise(resolve=>setImmediate(resolve));

test('only Leonardo is active, with the unchanged validated GLB and exactly three works',()=>{
  assert.deepEqual(validateHub(hub,catalog),[]);assert.equal(MAX_ACTIVE_GUIDES,1);
  assert.equal(leonardo.model.status,'available');assert.equal(modelPath,'assets/artists/leonardo-da-vinci/reimagined/models/davinci-standing-c.glb');
  assert.equal(createHash('sha256').update(readFileSync(new URL(modelPath,root))).digest('hex'),'528034c1a7a2cd1d6a3b86ca4cbe250fa9eca95ab793d866630cb59240b8b18f');
  assert.deepEqual(leonardo.works,['ld01','ld06','ld02']);
  for(const guide of guides){const artist=hub.artists.find(item=>item.artistId===guide.artistId);assert.deepEqual(validateArtistGuideConfig(guide,{artist,knownArtworkIds:artist.works.map(work=>work.artworkId)}),[]);}
  for(const guide of guides.slice(1))assert.deepEqual(guide.model,{status:'reserved',path:null});
});

test('generic guide loads once, releases, and reloads without keeping an obsolete instance',async()=>{
  const handles=[],disposed=[],mounted=[];
  const engine=createArtistGuideEngine({configs:guides,loadModel:async descriptor=>{const handle={path:descriptor.path,id:handles.length+1};handles.push(handle);return handle;},onModelReady:handle=>mounted.push(handle.id),disposeModel:handle=>disposed.push(handle.id)});
  assert.equal(engine.snapshot().guidesLoaded,0);
  await engine.loadGuide('leonardo-guide');assert.equal(engine.snapshot().guidesLoaded,1);
  assert.deepEqual(mounted,[1]);assert.deepEqual(handles.map(h=>h.path),[modelPath]);
  engine.unloadGuide();assert.equal(engine.snapshot().guidesLoaded,0);assert.deepEqual(disposed,[1]);
  await engine.loadGuide('leonardo-guide');assert.equal(engine.snapshot().guidesLoaded,1);assert.deepEqual(mounted,[1,2]);
  engine.dispose();assert.deepEqual(disposed,[1,2]);
});

test('late cancelled Leonardo load is disposed and never mounted',async()=>{
  let finish;const mounted=[],disposed=[];
  const engine=createArtistGuideEngine({configs:guides,loadModel:()=>new Promise(resolve=>finish=resolve),onModelReady:handle=>mounted.push(handle),disposeModel:handle=>disposed.push(handle)});
  const pending=engine.loadGuide('leonardo-guide');await flush();engine.unloadGuide();
  const obsolete={id:'late'};finish(obsolete);await pending;
  assert.equal(engine.snapshot().guidesLoaded,0);assert.deepEqual(mounted,[]);assert.deepEqual(disposed,[obsolete]);engine.dispose();
});

test('runtime guide uses the exact user-selected QA transform and a light raycast proxy',()=>{
  assert.deepEqual(leonardo.transform,{positionX:5.85,positionY:0.04,positionZ:-7.7,scale:1.24,rotationY:-0.82,groundOffset:0,centerOffsetX:0,centerOffsetZ:0});
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(.73,1.899,.65),new THREE.MeshBasicMaterial()),handle=createGuideModelHandle(THREE,mesh),scene=new THREE.Scene();
  handle.apply(leonardo.transform);handle.mount(scene);
  const bounds=new THREE.Box3().setFromObject(mesh),height=bounds.max.y-bounds.min.y;
  assert.ok(Math.abs(bounds.min.y-.04)<.01);assert.ok(height>=2.34&&height<=2.37);
  assert.equal(handle.proxy.geometry.attributes.position.count,24);
  const center=handle.proxy.getWorldPosition(new THREE.Vector3());
  for(const x of [-.2,.2]){const origin=new THREE.Vector3(center.x+x,center.y,center.z+2),ray=new THREE.Raycaster(origin,new THREE.Vector3(0,0,-1));assert.ok(ray.intersectObject(handle.proxy).length);}
  handle.dispose();assert.equal(scene.children.includes(handle.root),false);
});

test('Leonardo plaque is centred between the two gilded corner columns and remains legible',()=>{
  const source=readFileSync(new URL('geo/scripts/masters-hub-viewer.js',root),'utf8');
  assert.equal((7.15+9.25)/2,8.2);
  assert.match(source,/artist\.artistId==='ld'\?8\.2:7\.8/);
  assert.match(source,/board\(guideButtonTexture\(guideCopy\.call\),1\.72,\.43,reserve,middle\.yaw\)/);
  assert.match(source,/fillStyle='#fff3d7'/);
  assert.match(source,/strokeStyle='#dbbc75'/);
});

test('FR EN AR and RTL guide actions remain generic and all three work capacities stay truthful',async()=>{
  const engine=createArtistGuideEngine({configs:guides,workTitle:(id,language)=>hub.artists[0].works.find(work=>work.artworkId===id).title[language]});
  await engine.loadGuide('leonardo-guide');
  for(const language of ['fr','en','ar']){
    assert.ok(HUB_GUIDE_COPY[language].call&&HUB_GUIDE_COPY[language].release);
    assert.equal(engine.presentation(language).dir,language==='ar'?'rtl':'ltr');
    engine.dispatch('DISCOVER_WORKS');assert.deepEqual(engine.presentation(language).actions.slice(0,3).map(action=>action.id),['ARTWORK_SELECTED:ld01','ARTWORK_SELECTED:ld06','ARTWORK_SELECTED:ld02']);
    for(const work of hub.artists[0].works){const entry=catalog.artworks.find(item=>item.id===work.artworkId),manifest=json(`content/media-manifests/artworks/${work.artworkId}/manifest.json`);const capabilities=resolveArtworkCapabilities({entry,work,manifest,language});
      assert.equal(capabilities.audio.status,'available');assert.equal(capabilities.museum.status,'available');
      assert.equal(capabilities.model3d.status,work.artworkId==='ld01'?'available':'missing');
      for(const route of ['ar','space','vr'])assert.equal(capabilities[route].status,work.artworkId==='ld01'?'available':'unsupported');
    }
  }
  engine.dispose();
});

test('compact XR layout keeps eight guide artwork actions targetable in both reading directions',()=>{
  for(const rtl of [false,true]){
    const buttons=layoutHubButtons(Array.from({length:8},(_,index)=>({id:String(index)})),rtl);
    for(const button of buttons){assert.ok(button.y+button.height<=900);assert.equal(panelButtonAt(buttons,button.x+button.width/2,button.y+button.height/2),button.id);}
  }
});

test('viewer uses only generic guide/artwork engines, deferred GLTF loading and lightweight guide raycast',()=>{
  const source=readFileSync(new URL('geo/scripts/masters-hub-viewer.js',root),'utf8');
  for(const pattern of [/createArtistGuideEngine\(/,/createArtistGuideUi\(/,/createArtistGuideXrPanel\(/,/createArtworkExperience\(/,/loadModel:async descriptor/,/targets\.push\(handle\.proxy\)/,/kind==='guide'/,/kind==='guide-panel'/,/guideQA/])assert.match(source,pattern);
  assert.doesNotMatch(source,/createRoomGuide|createActiveGuideFlow|MONA_LISA_VISITED/);
});

test('both actual XR controller select handlers can target the Leonardo proxy and guide panel',async()=>{
  const source=readFileSync(new URL('geo/scripts/masters-hub-viewer.js',root),'utf8');
  const scene=new THREE.Scene(),rig=new THREE.Group(),camera=new THREE.PerspectiveCamera();scene.add(rig);rig.add(camera);
  const proxy=new THREE.Mesh(new THREE.BoxGeometry(1,2,.6),new THREE.MeshBasicMaterial());proxy.position.set(0,1.3,-3);proxy.userData.guide=true;scene.add(proxy);
  const hands=[new THREE.Group(),new THREE.Group()];for(const [index,hand] of hands.entries())hand.position.set(index?.2:-.2,1.3,0);
  const session={visibilityState:'visible'},opened=[],actions=[];let guidePanelHit=null;
  const renderer={xr:{isPresenting:true,getController:index=>hands[index],getSession:()=>session,addEventListener(){}}};
  const guideXrPanel={hit:()=>guidePanelHit,mesh:{visible:true},setHover(){},place(){}};
  const state=vm.createContext({THREE,scene,rig,camera,renderer,controllers:[],targets:[proxy],xrRay:new THREE.Raycaster(),xrPanel:{hit:()=>null},guideXrPanel,firstHubHit:(_,hits)=>hits[0]||null,config:hub,ready:true,head:new THREE.Vector3(),turnArmed:false,navigator:{xr:{isSessionSupported:async()=>true}},$:()=>({}),copy:{vr:'VR',exitVr:'Exit'},lang:'fr',showGuide:()=>opened.push(true),guideUi:{activate:action=>actions.push(action)},renderGuide(){}});
  vm.runInContext(source.slice(source.indexOf('function controllerTarget('),source.indexOf('function navigateXr(')),state);await state.configureXr();scene.updateMatrixWorld(true);
  for(const [index,hand] of hands.entries()){hand.dispatchEvent({type:'connected',data:{handedness:index?'right':'left'}});assert.equal(state.controllerTarget(hand).kind,'guide');hand.dispatchEvent({type:'select'});}
  assert.equal(opened.length,2);
  guidePanelHit={action:'DISCOVER_WORKS',point:new THREE.Vector3(0,1.3,-1),distance:1};
  for(const hand of hands)hand.dispatchEvent({type:'select'});
  assert.deepEqual(actions,['DISCOVER_WORKS','DISCOVER_WORKS']);
});
