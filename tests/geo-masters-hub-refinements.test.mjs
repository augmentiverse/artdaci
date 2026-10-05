import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import * as THREE from '../vendor/three.module.js';
import {resolveHubMedia,resolveHubImage,wallPlacement,firstHubHit,HUB_COPY,HUB_GUIDE_COPY,readHubKeyboard,validateHub} from '../geo/scripts/masters-hub-core.mjs';
import {movePosition} from '../geo/scripts/room-navigation.mjs';
import {resolveArtworkCapabilities} from '../geo/scripts/artwork-experience.mjs';
import {artworkExperiencePresentation} from '../geo/scripts/artwork-experience-panel.mjs';
import {createHubArchitecture,HUB_EXIT} from '../geo/scripts/masters-hub-room.mjs';

const root=new URL('../',import.meta.url),json=p=>JSON.parse(readFileSync(new URL(p,root),'utf8'));
const hub=json('geo/data/masters-hub.json'),catalog=json('content/media-manifests/catalog.json');
const work=id=>hub.artists.flatMap(a=>a.works).find(w=>w.artworkId===id);
const manifest=id=>json(`content/media-manifests/artworks/${id}/manifest.json`);

test('vg01 wall, detail, fallback and localized metadata all select the 1889 collection portrait',()=>{
  const w=work('vg01'),m=manifest('vg01'),artist=hub.artists.find(a=>a.artistId==='vg');
  assert.equal(w.thumbnail,w.imageFallback);
  assert.equal(w.imagePresentation.manifestKey,'collection');
  assert.equal(w.imagePresentation.date,'1889');
  assert.equal(createHash('sha256').update(readFileSync(new URL(w.thumbnail,root))).digest('hex'),m.media.images.collection.sha256);
  for(const language of ['fr','en','ar']){
    const caps=resolveArtworkCapabilities({entry:catalog.artworks.find(e=>e.id==='vg01'),work:w,manifest:m,language});
    assert.equal(caps.image.url,'https://media.artdaci.com/artworks/vg01/images/collection.webp');
    assert.deepEqual(resolveHubMedia(w,m,language).imageCandidates,[w.thumbnail,caps.image.url]);
    const panel=artworkExperiencePresentation({artist,work:w,language,view:'about',capabilities:caps});
    assert.equal(panel.title,w.title[language]);assert.match(panel.title,/1889/);assert.match(panel.description,/1889/);
  }
});

test('pinned variants never fall back to another portrait when the manifest is absent, unavailable or mismatched',()=>{
  for(const id of ['vg01']){
    const w=work(id),key=w.imagePresentation.manifestKey;
    for(const mode of ['absent','unavailable','sha','wrong-artwork']){
      const m=mode==='absent'?null:structuredClone(manifest(id));
      if(mode==='unavailable')m.media.images[key].available=false;
      if(mode==='sha')m.media.images[key].sha256='0'.repeat(64);
      if(mode==='wrong-artwork')m.id='ve01';
      assert.deepEqual(resolveHubImage(w,m),{status:'local-fallback',url:w.thumbnail});
      assert.deepEqual(resolveHubMedia(w,m,'fr').imageCandidates,[w.thumbnail]);
    }
  }
});

test('Mona Lisa and Parasol reuse the exact user-selected captioned images on the wall and in detail',()=>{
  for(const [id,path] of [['ld01','assets/artists/leonardo-da-vinci/collection/mana-lisa-davinci.webp'],['mo06','assets/artists/claude-monet/collection/woman-with-a-parasol-claude-monet.png']]){
    const w=work(id);assert.equal(w.thumbnail,path);assert.equal(w.imageFallback,path);
    assert.equal(w.imagePresentation.source,'hub-local');
    assert.equal(createHash('sha256').update(readFileSync(new URL(path,root))).digest('hex'),w.imagePresentation.sha256);
    for(const m of [manifest(id),null,manifest('ve01')])assert.deepEqual(resolveHubMedia(w,m,'fr').imageCandidates,[path]);
  }
});

test('Bedroom prefers canonical exact-language audio, then verified same-language local fallback including Arabic',()=>{
  const w=work('vg02'),m=manifest('vg02');assert.equal(m.media.audio.overview.ar,undefined);
  for(const language of ['fr','en','ar']){
    const selected=w.audioPresentation[language];
    assert.equal(createHash('sha256').update(readFileSync(new URL(selected.path,root))).digest('hex'),selected.sha256);
    for(const source of [m,null]){
      const canonical=Boolean(source&&language!=='ar'),expected=canonical?`https://media.artdaci.com/artworks/vg02/audio/${language}/overview.mp3`:selected.path;
      const media=resolveHubMedia(w,source,language);
      assert.equal(media.audio,expected);
      assert.deepEqual(media.audioCandidates.map(candidate=>candidate.status),canonical?['available','local-fallback']:['local-fallback']);
      const caps=resolveArtworkCapabilities({entry:catalog.artworks.find(e=>e.id==='vg02'),work:w,manifest:source,language});
      assert.equal(caps.audio.url,expected);assert.equal(caps.audio.status,canonical?'available':'local-fallback');
    }
  }
  const missing=structuredClone(w);delete missing.audioPresentation.ar;
  assert.equal(resolveHubMedia(missing,m,'ar').audio,null);
  missing.audioPresentation.ar={...w.audioPresentation.en};
  assert.equal(resolveHubMedia(missing,m,'ar').audio,null);
  const invalid=structuredClone(hub);invalid.artists[2].works[1].audioPresentation.ar.path='../en.mp3';
  assert.ok(validateHub(invalid,catalog).includes('Invalid local audio presentation'));
});

test('four keyboard arrows move in the viewing direction without changing camera yaw',()=>{
  for(const [key,forward,side] of [['ArrowUp',1,0],['ArrowDown',-1,0],['ArrowLeft',0,-1],['ArrowRight',0,1]]){
    const input=readHubKeyboard(new Set([key]));assert.deepEqual(input,{forward,side});
    for(const yaw of [0,Math.PI/2,Math.PI]){
      const p=movePosition({x:0,z:0},yaw,input.forward,input.side,1,hub.navigation.bounds);
      assert.ok(Math.abs(Math.hypot(p.x,p.z)-1)<1e-9);
    }
  }
  assert.deepEqual(readHubKeyboard(new Set(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'])),{forward:0,side:0});
  assert.deepEqual(readHubKeyboard(new Set(['KeyW','ArrowUp'])),{forward:1,side:0});
});

test('actual keyboard listener accepts canvas focus but leaves links, buttons, inputs and XR alone',()=>{
  const source=readFileSync(new URL('geo/scripts/masters-hub-viewer.js',root),'utf8'),handlers={},keys=new Set(),renderer={xr:{isPresenting:false}};
  const state=vm.createContext({keys,renderer,window:{addEventListener:(type,handler)=>handlers[type]=handler},closePanel(){}});
  vm.runInContext(source.slice(source.indexOf("window.addEventListener('keydown'"),source.indexOf('  const clearInput=')),state);
  for(const tagName of ['CANVAS','BODY','DIV','A','BUTTON','INPUT','TEXTAREA','SELECT']){
    let prevented=false;handlers.keydown({code:'ArrowRight',target:{tagName},preventDefault(){prevented=true;}});
    assert.equal(keys.has('ArrowRight'),['CANVAS','BODY','DIV'].includes(tagName));assert.equal(prevented,keys.has('ArrowRight'));
    handlers.keyup({code:'ArrowRight'});assert.equal(keys.size,0);
  }
  renderer.xr.isPresenting=true;handlers.keydown({code:'ArrowUp',target:{tagName:'CANVAS'},preventDefault(){}});assert.equal(keys.size,0);
});

test('actual Hub frame moves with all four arrows without rotating the desktop camera',()=>{
  const source=readFileSync(new URL('geo/scripts/masters-hub-viewer.js',root),'utf8');
  for(const [key,axis,sign] of [['ArrowUp','z',-1],['ArrowDown','z',1],['ArrowLeft','x',-1],['ArrowRight','x',1]]){
    const rig=new THREE.Group(),camera=new THREE.PerspectiveCamera();
    const state=vm.createContext({scene:new THREE.Scene(),disposed:false,lastTime:0,ready:true,guideUi:null,selected:null,renderer:{xr:{isPresenting:false},render(){}},document:{hidden:false},keys:new Set([key]),held:new Map(),rig,camera,yaw:0,pitch:0,config:hub,readHubKeyboard,movePosition,frameCount:0,lastMetrics:0});
    vm.runInContext(source.slice(source.indexOf('function render('),source.indexOf('async function init(')),state);
    state.render(50);assert.ok(rig.position[axis]*sign>0);assert.equal(state.yaw,0);assert.equal(camera.rotation.y,0);
  }
});

test('actual Hub shell exposes twelve bare image planes and only transient hover outlines, with no repeated wall captions',()=>{
  const source=readFileSync(new URL('geo/scripts/masters-hub-viewer.js',root),'utf8');
  const guideCopy=HUB_GUIDE_COPY.fr;
  const state=vm.createContext({THREE,scene:null,renderer:{capabilities:{getMaxAnisotropy:()=>4}},createHubArchitecture:()=>new THREE.Group(),config:hub,lang:'fr',copy:HUB_COPY.fr,guideCopy,guideLabels:artistId=>guideCopy.artists?.[artistId]||guideCopy,wallPlacement,HUB_EXIT,exhibits:[],targets:[],exitTarget:null,guideCallTargets:new Map(),guideHandle:null,labelTexture:()=>new THREE.Texture(),guideButtonTexture:()=>new THREE.Texture()});
  vm.runInContext(source.slice(source.indexOf('function board('),source.indexOf('async function loadExhibit(')),state);state.buildShell();
  assert.equal(state.exhibits.length,12);
  // Four artist signs, two reservations, two guide calls and the exit; no artwork captions.
  assert.equal(state.scene.children.filter(node=>node.isMesh).length,9);
  for(const item of state.exhibits){assert.equal(item.group.children.filter(node=>node.isMesh).length,1);assert.ok(item.frame.isLineLoop);assert.equal(item.frame.visible,false);}
  vm.runInContext(source.slice(source.indexOf('function highlight('),source.indexOf('function configurePointer(')),state);
  const item=state.exhibits[0];item.mesh.visible=true;state.highlight(new Set([item]));assert.equal(item.frame.visible,true);state.highlight(new Set());assert.equal(item.frame.visible,false);
});

test('GEO exit occupies a neutral corner and is directly raycastable from either hand',async()=>{
  for(const artist of hub.artists)for(let i=0;i<3;i++){
    const p=wallPlacement(artist.zone.wall,i);
    assert.ok(Math.hypot(HUB_EXIT.x-p.x,HUB_EXIT.z-p.z)>4);
  }
  const scene=new THREE.Scene(),rig=new THREE.Group(),camera=new THREE.PerspectiveCamera();scene.add(rig);rig.add(camera);
  const target=new THREE.Mesh(new THREE.PlaneGeometry(HUB_EXIT.width,HUB_EXIT.height),new THREE.MeshBasicMaterial({side:THREE.DoubleSide}));
  target.position.set(HUB_EXIT.x,HUB_EXIT.y,HUB_EXIT.z);target.rotation.y=HUB_EXIT.yaw;target.userData.exit=true;scene.add(target);
  const hands=[new THREE.Group(),new THREE.Group()],routes=[];
  for(const [i,hand] of hands.entries()){
    hand.position.set(7.4+i*.4,1.4,7.6);hand.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,-1),target.position.clone().sub(hand.position).normalize());
  }
  const renderer={xr:{getController:i=>hands[i],getSession:()=>({visibilityState:'visible'}),addEventListener(){}}};
  const state=vm.createContext({THREE,scene,rig,camera,renderer,controllers:[],targets:[target],xrRay:new THREE.Raycaster(),xrPanel:{hit:()=>null},guideXrPanel:null,firstHubHit,config:hub,ready:true,lang:'ar',head:new THREE.Vector3(),turnArmed:false,navigator:{xr:{isSessionSupported:async()=>true}},$:()=>({}),copy:HUB_COPY.ar,navigate:url=>routes.push(url)});
  const source=readFileSync(new URL('geo/scripts/masters-hub-viewer.js',root),'utf8');
  vm.runInContext(source.slice(source.indexOf('function controllerTarget('),source.indexOf('function navigateXr(')),state);
  await state.configureXr();scene.updateMatrixWorld(true);
  for(const hand of hands){assert.equal(state.controllerTarget(hand).kind,'exit');hand.dispatchEvent({type:'select'});}
  assert.deepEqual(routes,['./?lang=ar','./?lang=ar']);
});

test('royal decor uses a flat parquet, bounded instanced geometry and one small generated texture',()=>{
  const noop=()=>{},ctx={save:noop,restore:noop,translate:noop,rotate:noop,fillRect:noop,beginPath:noop,moveTo:noop,bezierCurveTo:noop,stroke:noop};
  const room=createHubArchitecture(THREE,{artists:hub.artists,maxAnisotropy:4,createCanvas:()=>({getContext:()=>ctx})});
  room.updateMatrixWorld(true);
  const floor=room.getObjectByName('Hub_flat_parquet');
  assert.equal(floor.geometry.index.count/3,2);assert.ok(!floor.material.normalMap&&!floor.material.bumpMap);
  for(let i=0;i<floor.geometry.attributes.position.count;i++){
    const point=new THREE.Vector3().fromBufferAttribute(floor.geometry.attributes.position,i).applyMatrix4(floor.matrixWorld);
    assert.ok(Math.abs(point.y)<1e-10);
  }
  let triangles=0,draws=0;const textures=new Set();
  room.traverse(node=>{if(!node.isMesh)return;draws++;triangles+=(node.geometry.index?.count||node.geometry.attributes.position.count)/3*(node.isInstancedMesh?node.count:1);if(node.material.map)textures.add(node.material.map);});
  assert.ok(draws<=16,`${draws} material batches`);assert.ok(triangles<10000,`${triangles} triangles`);
  assert.equal(textures.size,1);assert.equal(floor.material.map.image.width,512);assert.equal(room.userData.externalDecorRequests,0);
  assert.ok(room.getObjectByName('Hub_gilded_ceiling_rosettes'));assert.ok(room.getObjectByName('Hub_warm_ceiling_insets'));
});
