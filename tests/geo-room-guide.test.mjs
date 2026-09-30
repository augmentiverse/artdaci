import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import * as THREE from '../vendor/three.module.js';
import {GUIDE_COPY,validateRoomGuide,validateGuidePlacement,resolveRoomGuide,createLazyGuide,placeGuideModel,createRoomGuide} from '../geo/scripts/room-guide.mjs';
import {createRoomXrPanel,controllerRayScale} from '../geo/scripts/room-xr-panel.mjs';

const guide=JSON.parse(await readFile(new URL('../geo/data/leonardo-guide.json',import.meta.url)));
const room=JSON.parse(await readFile(new URL('../geo/data/salle-des-etats.json',import.meta.url)));
const source=await readFile(new URL('../geo/scripts/room-viewer.js',import.meta.url),'utf8');

test('V6.8 character has localized content, a room-local proposal and only the existing Mona Lisa destination',()=>{
  assert.deepEqual(validateRoomGuide(guide,room),[]);
  for(const language of ['fr','en','ar']){
    const resolved=resolveRoomGuide(guide,language);
    assert.equal(resolved.type,'character');
    assert.equal(resolved.title,guide.content.title[language]);
    assert.ok(resolved.description && resolved.artist && GUIDE_COPY[language].seeMona);
    assert.equal(guide.content.audio[language],null);
  }
  const wrong=structuredClone(guide);wrong.action.targetPoiId='second-mona-lisa';
  assert.ok(validateRoomGuide(wrong,room).length);
  assert.equal(room.pointsOfInterest.length,1,'V6.7 Mona Lisa configuration is not repurposed');
});

test('Guide model is the unchanged tracked GLB, Draco + WebP, with known geometry cost',async()=>{
  const bytes=await readFile(new URL('../'+guide.model.path,import.meta.url));
  assert.equal(bytes.length,3107640);
  assert.equal(createHash('sha256').update(bytes).digest('hex'),guide.model.sha256);
  const gltf=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)));
  assert.ok(gltf.extensionsUsed.includes('KHR_draco_mesh_compression'));
  assert.ok(gltf.extensionsUsed.includes('EXT_texture_webp'));
  assert.equal(gltf.meshes.length,1);
  assert.equal(gltf.accessors[gltf.meshes[0].primitives[0].indices].count/3,600574);
  assert.equal(gltf.images.length,4);
});

test('QA transforms reject non-finite values, central-path obstruction, walls and oversized scale',()=>{
  assert.deepEqual(validateGuidePlacement(guide.placement,room),[]);
  for(const edit of [p=>p.scale=NaN,p=>p.scale=3,p=>p.position.x=0,p=>p.position.x=6,p=>p.position.y=-1,p=>p.position.z=-9]){
    const placement=structuredClone(guide.placement);edit(placement);
    assert.ok(validateGuidePlacement(placement,room).length);
  }
});

test('Lazy guide makes no initial request and shares one model across simultaneous/repeated selections',async()=>{
  let loads=0,mounts=0,releases=0,resolve;
  const model={},states=[];
  const lazy=createLazyGuide({load:()=>{loads++;return new Promise(r=>resolve=r);},mount:()=>mounts++,release:()=>releases++,onState:s=>states.push(s)});
  assert.equal(loads,0);
  const first=lazy.ensure(),second=lazy.ensure();assert.equal(first,second);
  await Promise.resolve();assert.equal(loads,1);
  resolve(model);assert.equal(await first,model);assert.equal(await lazy.ensure(),model);
  assert.equal(loads,1);assert.equal(mounts,1);assert.deepEqual(states,['loading','ready']);
  lazy.dispose();lazy.dispose();assert.equal(releases,1);
  assert.equal(await lazy.ensure(),null);assert.equal(loads,1);
});

test('Failed guide has no automatic retry; late model after disposal is released without mounting',async()=>{
  let loads=0,mounts=0,releases=0;
  const lazy=createLazyGuide({load:()=>{loads++;throw new Error('offline');},mount:()=>mounts++,release:()=>releases++});
  await assert.rejects(lazy.ensure(),/offline/);
  assert.equal(lazy.state,'error');assert.equal(loads,1);assert.equal(mounts,0);
  await assert.rejects(lazy.ensure(),/offline/);assert.equal(loads,2);
  let complete;
  const late=createLazyGuide({load:()=>new Promise(r=>complete=r),mount:()=>mounts++,release:()=>releases++});
  const pending=late.ensure();await Promise.resolve();late.dispose();complete({});
  assert.equal(await pending,null);assert.equal(mounts,0);assert.equal(releases,1);
});

test('Model placement centers the feet without altering geometry or source buffers',()=>{
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(.73,1.9,.65),new THREE.MeshBasicMaterial());
  const positions=Array.from(mesh.geometry.attributes.position.array);
  placeGuideModel(THREE,mesh);mesh.updateMatrixWorld(true);
  const box=new THREE.Box3().setFromObject(mesh);
  assert.ok(Math.abs(box.min.y)<1e-8);
  assert.ok(Math.abs(box.getCenter(new THREE.Vector3()).x)<1e-8);
  assert.deepEqual(Array.from(mesh.geometry.attributes.position.array),positions);
  mesh.geometry.dispose();mesh.material.dispose();
});

function canvasDocument(){
  const context={clearRect(){},fillRect(){},strokeRect(){},fillText(){},measureText(value){return {width:String(value).length*12};}};
  return {context,document:{createElement:()=>({width:1024,height:800,getContext:()=>context})}};
}

test('A lightweight proxy selects the loaded character without raycasting its dense model',async()=>{
  const previous=globalThis.document,{document}=canvasDocument();globalThis.document=document;
  const scene=new THREE.Scene(),model=new THREE.Mesh(new THREE.BoxGeometry(.73,1.9,.65),new THREE.MeshBasicMaterial());
  let loads=0;model.raycast=()=>{throw new Error('Dense geometry must not be raycast');};
  let instance;
  try{
    instance=createRoomGuide(THREE,{scene,config:guide,room,language:'fr',loader:{loadAsync:async()=>{loads++;return {scene:model};}},disposeModel:()=>{},onState:()=>{}});
    const p=guide.placement.position;
    const marker=scene.getObjectByName('ARTDACI_leonardo-guide').children.find(child=>child.geometry?.type==='RingGeometry');
    assert.equal(marker.geometry.parameters.innerRadius,.18/3);
    assert.equal(marker.geometry.parameters.outerRadius,.25/3);
    const markerRay=y=>new THREE.Raycaster(new THREE.Vector3(p.x,p.y+y*guide.placement.scale,p.z+3),new THREE.Vector3(0,0,-1));
    assert.equal(loads,0);
    assert.ok(instance.hit(markerRay(1.05)),'The center of the unloaded guide marker is selectable');
    await instance.ensure();await instance.ensure();assert.equal(loads,1);
    assert.ok(instance.hit(markerRay(2.1)),'The marker remains selectable above the loaded model');
    const ray=new THREE.Raycaster(new THREE.Vector3(p.x,p.y+1,p.z+3),new THREE.Vector3(0,0,-1));
    assert.ok(instance.hit(ray));
    assert.equal(scene.children.filter(x=>x.name==='ARTDACI_leonardo-guide').length,1);
    instance.dispose();assert.equal(scene.children.length,0);
  }finally{globalThis.document=previous;model.geometry.dispose();model.material.dispose();}
});

test('Shared XR panel switches character / Mona Lisa actions, preserving hit distance and Arabic direction',()=>{
  const previous=globalThis.document;
  for(const language of ['fr','en','ar']){
    const fake=canvasDocument();globalThis.document=fake.document;
    const panel=createRoomXrPanel(THREE,language),g=resolveRoomGuide(guide,language),c=GUIDE_COPY[language];
    try{
      const copy={artworkLabel:c.label,mona:c.seeMona,returnRoom:c.returnVisit,close:c.close,retry:c.retry,play:'Play',observe:'Observe',explore:'Explore',vrPoiHint:'Aim'};
      panel.draw(copy,g,{audioLabel:c.ready});panel.mesh.visible=true;panel.mesh.position.z=-1.55;panel.mesh.updateMatrixWorld(true);
      const hitAt=(x,y)=>panel.hit(new THREE.Raycaster(new THREE.Vector3(),new THREE.Vector3((x/1024-.5)*1.28,.5-y/800,-1.55).normalize()));
      assert.equal(hitAt(512,550).action,'guide-mona');
      assert.equal(hitAt(200,650).action,'guide-return');
      assert.equal(hitAt(750,650).action,'guide-close');
      assert.ok(controllerRayScale(hitAt(512,550))<1);
      panel.setHover('guide-mona');
      assert.equal(fake.context.direction,language==='ar'?'rtl':'ltr');
      panel.draw(copy,{...g,modelFailed:true},{audioLabel:c.failed});
      assert.equal(hitAt(512,735).action,'guide-retry');
      panel.draw(copy,{title:'Mona Lisa',artist:'Leonardo',description:'Artwork'},{observing:true});
      assert.equal(hitAt(500,550).action,'explore','Existing observation controls still own their UV region');
    }finally{panel.dispose();}
  }
  globalThis.document=previous;
});

test('Compact XR panels clear the central sightline and retain button targeting after head rotation in FR/EN/AR',()=>{
  const previous=globalThis.document;
  try{
    globalThis.document=canvasDocument().document;
    for(const language of ['fr','en','ar']){
      const panel=createRoomXrPanel(THREE,language),c=GUIDE_COPY[language];
      try{
        panel.draw({artworkLabel:c.label,mona:c.seeMona,returnRoom:c.returnVisit,close:c.close},resolveRoomGuide(guide,language),{});
        panel.mesh.visible=true;
        for(const yaw of [0,Math.PI/2,Math.PI]){
          const origin=new THREE.Vector3(2,1.6,-3),rotation=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),yaw);
          panel.place(new THREE.Matrix4().compose(origin,rotation,new THREE.Vector3(1,1,1)));
          assert.equal(panel.mesh.scale.x,.82);
          assert.equal(panel.mesh.material.depthWrite,false);
          assert.equal(panel.hit(new THREE.Raycaster(origin,new THREE.Vector3(0,0,-1).applyQuaternion(rotation))),null);
          const target=panel.mesh.localToWorld(new THREE.Vector3(0,.5-550/800,0));
          const hit=panel.hit(new THREE.Raycaster(origin,target.sub(origin).normalize()));
          assert.equal(hit.action,'guide-mona');
          assert.ok(controllerRayScale(hit)<1);
        }
      }finally{panel.dispose();}
    }
  }finally{globalThis.document=previous;}
});

test('See Mona Lisa invokes the original open/approach path exactly once and closes the character panel',()=>{
  const calls=[],context=vm.createContext({closeGuide:()=>calls.push('closeGuide'),openPoi:()=>calls.push('openPoi'),approachPoi:()=>calls.push('approachPoi')});
  const match=source.match(/function showMonaFromGuide\(\) \{[\s\S]*?\n\}/);
  vm.runInContext(match[0],context);context.showMonaFromGuide();
  assert.deepEqual(calls,['closeGuide','openPoi','approachPoi']);
});

test('The actual touch pointer handler opens the guide without starting a drag and keeps Mona Lisa priority',()=>{
  const nodes=new Map(),events={};
  const element=()=>({addEventListener(){},setAttribute(){}});
  const canvas={addEventListener:(name,callback)=>events[name]=callback,focus(){},setPointerCapture(){throw new Error('Selection must not capture a movement gesture');}};
  const counts={guide:0,mona:0};
  const state=vm.createContext({
    document:{getElementById:id=>{if(!nodes.has(id))nodes.set(id,element());return nodes.get(id);},querySelectorAll:()=>[],addEventListener(){}},
    window:{addEventListener(){}},canvas,ready:true,renderer:{xr:{isPresenting:false}},pointerHitsArtwork:()=>false,pointerRay:{},guide:{hit:()=>({distance:1})},
    openGuide:()=>counts.guide++,openPoi:()=>counts.mona++,drag:null,
    poiAudio:element(),poiButton:element(),poiReturn:element(),observationAudio:element(),audioPlay:element(),audioStop:element(),
    updateAudioUi(){},closePoi(){},approachPoi(){},observePoi(){},returnToRoom(){},toggleAudio(){},
  });
  vm.runInContext(source.slice(source.indexOf('function configureInputs('),source.indexOf('function step(')),state);
  state.configureInputs();
  events.pointerdown({pointerType:'touch',pointerId:1,clientX:100,clientY:100});
  assert.equal(counts.guide,1);assert.equal(state.drag,null);
  state.pointerHitsArtwork=()=>true;
  events.pointerdown({pointerType:'touch',pointerId:2,clientX:100,clientY:100});
  assert.equal(counts.mona,1);assert.equal(counts.guide,1);
});

test('Both actual controller handlers select Leonardo, then prioritize panel and Mona Lisa over teleportation',async()=>{
  const scene=new THREE.Scene(),rig=new THREE.Group();scene.add(rig);
  const left=new THREE.Group(),right=new THREE.Group();left.position.set(-.2,1.3,0);right.position.set(.2,1.3,0);
  const counters={guide:0,mona:0,actions:[]},panel={hit:()=>null,setHover:()=>{}};
  const controllerHit={distance:1,point:new THREE.Vector3(0,1,-1)};
  const character={hit:()=>controllerHit,setHover:()=>{}};
  const renderer={xr:{isPresenting:true,getController:i=>[left,right][i],getSession:()=>({visibilityState:'visible'}),addEventListener(){}}};
  const state=vm.createContext({THREE,scene,rig,renderer,controllers:[],config:room,xrRay:new THREE.Raycaster(),xrPanel:panel,guide:character,hitArtwork:()=>null,
    navigator:{xr:{isSessionSupported:async()=>true}},xrButton:{addEventListener(){}},copy:{vr:'VR'},ready:true,turnArmed:false,xrSupported:false,head:new THREE.Vector3(),camera:{},
    openGuide:()=>counters.guide++,openPoi:()=>counters.mona++,runPoiAction:a=>counters.actions.push(a),controllerRayScale,hotspotHover:false,updateHotspot(){}});
  vm.runInContext(source.slice(source.indexOf('function xrInteractiveHit('),source.indexOf('function turnRig(')),state);
  await state.configureXr();
  for(const [controller,handedness] of [[left,'left'],[right,'right']]){
    controller.dispatchEvent({type:'connected',data:{handedness}});
    controller.dispatchEvent({type:'select'});
    assert.ok(rig.position.equals(new THREE.Vector3()),'Selecting a guide must not teleport');
  }
  assert.equal(counters.guide,2);scene.userData.updateTeleport();
  assert.equal(left.userData.line.scale.z,.2);assert.equal(right.userData.line.scale.z,.2);
  panel.hit=()=>({...controllerHit,inside:true,action:'guide-mona'});
  left.dispatchEvent({type:'select'});right.dispatchEvent({type:'select'});
  assert.deepEqual(counters.actions,['guide-mona','guide-mona']);
  panel.hit=()=>null;state.hitArtwork=()=>controllerHit;
  left.dispatchEvent({type:'select'});right.dispatchEvent({type:'select'});
  assert.equal(counters.mona,2);assert.equal(counters.guide,2);
});
