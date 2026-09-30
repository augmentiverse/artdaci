import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import vm from 'node:vm';
import * as THREE from '../vendor/three.module.js';
import {JOURNEY_COPY,journeyRoute,returnScene,validExteriorView,readJourneyState,writeJourneyState,createPassage,createJourneyPortal,exteriorWalk} from '../geo/scripts/journey.mjs';
import {readStick,deadZone,pivotRig,snapTurn} from '../geo/scripts/room-navigation.mjs';
import {controllerRayScale} from '../geo/scripts/room-xr-panel.mjs';
const root=new URL('../',import.meta.url),read=path=>readFile(new URL(path,root),'utf8');
const roomSource=await read('geo/scripts/room-viewer.js');

test('V6.9 routes preserve FR/EN/AR and return to the correct exterior without arbitrary redirects',()=>{
  for(const lang of ['fr','en','ar'])for(const source of ['remote','louvre-xr']){
    const entry=new URL(journeyRoute('room',lang,source),'https://example.test/geo/');
    assert.equal(entry.searchParams.get('lang'),lang);assert.equal(returnScene(entry.search),source);
    const back=new URL(journeyRoute(returnScene(entry.search),lang),entry);
    assert.equal(back.pathname,`/geo/${source}.html`);assert.equal(back.searchParams.get('lang'),lang);
    assert.ok(JOURNEY_COPY[lang].enter && JOURNEY_COPY[lang].back && JOURNEY_COPY[lang].resume);
  }
  assert.equal(returnScene('?from=https://other.test'),'remote');
  assert.throws(()=>journeyRoute('https://other.test','fr'));
});

test('An explicit passage shares concurrent clicks, releases before navigation and never loops on arrival',async()=>{
  const calls=[];let unblock;
  const passage=createPassage({prepare:()=>{calls.push('prepare');return new Promise(r=>unblock=r);},fade:()=>calls.push('fade'),endSession:()=>calls.push('end'),release:()=>calls.push('release'),navigate:()=>calls.push('navigate')});
  assert.deepEqual(calls,[]);
  const a=passage.go(),b=passage.go();assert.equal(a,b);await Promise.resolve();unblock();assert.equal(await a,true);
  await passage.go();assert.deepEqual(calls,['prepare','fade','end','release','navigate']);
});

test('Failed preparation or XR ending keeps the current scene and offers an explicit retry',async()=>{
  for(const failure of ['prepare','end']){
    let fail=true,errors=0,releases=0,navigations=0;
    const passage=createPassage({prepare:()=>{if(fail && failure==='prepare')throw new Error('offline');},fade:()=>{},endSession:()=>{if(fail && failure==='end')throw new Error('XR end failed');},release:()=>releases++,navigate:()=>navigations++,onError:()=>errors++});
    assert.equal(await passage.go(),false);assert.equal(releases,0);assert.equal(navigations,0);assert.equal(errors,1);assert.equal(passage.busy,false);
    fail=false;assert.equal(await passage.go(),true);assert.equal(releases,1);assert.equal(navigations,1);
  }
});

test('Camera state is finite and bounded; private or corrupt storage falls back without breaking navigation',()=>{
  const valid={theta:.8,phi:1.1,radius:12,fov:35};assert.deepEqual(validExteriorView(valid),valid);
  assert.equal(validExteriorView({...valid,radius:Infinity}),null);assert.equal(validExteriorView({...valid,phi:-1}),null);
  assert.equal(readJourneyState(null,'view'),null);assert.doesNotThrow(()=>writeJourneyState(null,'view',valid));
  assert.equal(readJourneyState({getItem:()=>'{broken'},'view'),null);
});

test('Narrative portal is selectable from either controller; its ray ends at the surface and it disposes resources',()=>{
  const previous=globalThis.document;
  globalThis.document={createElement:()=>({getContext:()=>({clearRect(){},fillRect(){},strokeRect(){},fillText(){}})})};
  try{for(const language of ['fr','en','ar']){
    const scene=new THREE.Scene(),journey={busy:false,fadeOpacity:0};
    const portal=createJourneyPortal(THREE,{scene,label:JOURNEY_COPY[language].enter,language,position:new THREE.Vector3(0,1.2,-2),journey});
    portal.update(new THREE.Matrix4(),true);
    for(const x of [-.2,.2]){
      const origin=new THREE.Vector3(x,1.2,0),hit=portal.hit(new THREE.Raycaster(origin,new THREE.Vector3(-x,0,-2).normalize()));
      assert.equal(hit.action,'journey');assert.ok(controllerRayScale(hit)<1);
    }
    journey.busy=true;assert.equal(portal.hit(new THREE.Raycaster()),null);
    portal.dispose();assert.equal(scene.children.length,0);
  }}finally{globalThis.document=previous;}
});

test('The exterior VR control is half size, below and beside the sightline, with unchanged ray target',async()=>{
  const exterior=await read('geo/scripts/louvre-xr.js'),shared=await read('geo/scripts/journey.mjs');
  assert.match(shared,/PlaneGeometry\(\.75,\.1171875\)/);
  assert.match(exterior,/Vector3\(1\.55,\.75,3\.3\)/);
  const head={x:0,z:6},forward={x:0,z:-1},sideways={x:1,z:0};
  const bounds={minX:-8,maxX:8,minZ:2,maxZ:12};
  assert.deepEqual(exteriorWalk(head,forward,sideways,1,0,.05,bounds),{x:0,z:5.9375});
  assert.deepEqual(exteriorWalk({x:8,z:2},forward,sideways,1,1,5,bounds),{x:8,z:2});
});

test('Actual exterior XR navigation reads the left stick, clips movement and snap-turns around the tracked head',async()=>{
  const exterior=await read('geo/scripts/louvre-xr.js'),rig=new THREE.Group(),headCamera=new THREE.Group();
  rig.position.z=6;headCamera.position.y=1.65;rig.add(headCamera);
  const left=new THREE.Group(),right=new THREE.Group();
  left.userData.source={handedness:'left',gamepad:{mapping:'xr-standard',axes:[0,0,0,-1]}};
  right.userData.source={handedness:'right',gamepad:{mapping:'xr-standard',axes:[0,0,0,0]}};
  const context=vm.createContext({THREE,rig,camera:headCamera,controllers:[{controller:left},{controller:right}],renderer:{xr:{getSession:()=>({visibilityState:'visible'}),getReferenceSpace:()=>({}),getCamera:()=>headCamera}},stage:{dataset:{}},walkBounds:{minX:-8,maxX:8,minZ:2,maxZ:12},readStick,deadZone,pivotRig,snapTurn,exteriorWalk,turnArmed:true});
  vm.runInContext(exterior.slice(exterior.indexOf('function navigateExterior('),exterior.indexOf('function frame(')),context);
  context.navigateExterior(.05,{getViewerPose:()=>({})});
  assert.ok(Math.abs(rig.position.z-5.9375)<1e-6);
  right.userData.source.gamepad.axes[2]=1;
  context.navigateExterior(.05,{getViewerPose:()=>({})});
  assert.ok(Math.abs(rig.rotation.y+Math.PI/4)<1e-6);
  assert.ok(Number.isFinite(JSON.parse(context.stage.dataset.xrPosition).z));
});

test('Room controller handlers prioritize artwork and guide; the new passage never triggers teleportation',async()=>{
  const scene=new THREE.Scene(),rig=new THREE.Group();scene.add(rig);const controllers=[new THREE.Group(),new THREE.Group()];
  const hit={kind:'panel',action:'journey',distance:2,point:new THREE.Vector3(0,1,-2)};let calls=0;
  scene.userData.journey={hit:()=>hit,setHover(){}};
  const config=JSON.parse(await read('geo/data/salle-des-etats.json'));
  const renderer={xr:{isPresenting:true,getController:i=>controllers[i],getSession:()=>({visibilityState:'visible'}),addEventListener(){}}};
  const context=vm.createContext({THREE,scene,rig,renderer,controllers:[],config,xrRay:new THREE.Raycaster(),xrPanel:{hit:()=>null,setHover(){}},guide:{hit:()=>null,setHover(){}},hitArtwork:()=>null,navigator:{xr:{isSessionSupported:async()=>true}},xrButton:{addEventListener(){}},copy:{vr:'VR'},ready:true,turnArmed:false,xrSupported:false,head:new THREE.Vector3(),camera:{},runPoiAction:action=>{assert.equal(action,'journey');calls++;},controllerRayScale,hotspotHover:false,updateHotspot(){}});
  vm.runInContext(roomSource.slice(roomSource.indexOf('function xrInteractiveHit('),roomSource.indexOf('function turnRig(')),context);await context.configureXr();
  for(const controller of controllers){controller.dispatchEvent({type:'connected',data:{}});controller.dispatchEvent({type:'select'});}
  assert.equal(calls,2);assert.ok(rig.position.equals(new THREE.Vector3()));
});

test('Room failure keeps the return link outside loading overlay; preparation does not preload a GLB',async()=>{
  const html=await read('geo/room.html'),shared=await read('geo/scripts/journey.mjs');
  assert.match(roomSource,/document.querySelector\('\.room-heading'\).after\(returnLink\)/);
  assert.match(roomSource,/setView\(config.navigation.entry\)/);
  assert.match(shared,/method:'HEAD'/);assert.doesNotMatch(shared,/GLTFLoader|loadAsync/);
  assert.match(html,/room-stage/);
});

test('Both exterior controller select handlers activate the passage, without auto-requesting VR on arrival',async()=>{
  const exterior=await read('geo/scripts/louvre-xr.js'),scene=new THREE.Scene(),rig=new THREE.Group();scene.add(rig);
  const inputs=[new THREE.Group(),new THREE.Group()];let calls=0;
  const context=vm.createContext({THREE,scene,rig,controllers:[],ray:new THREE.Raycaster(),renderer:{xr:{getController:i=>inputs[i],getSession:()=>({visibilityState:'visible'})}},portal:{hit:()=>({action:'journey'})},journey:{go:()=>calls++}});
  vm.runInContext(exterior.slice(exterior.indexOf('for(let i=0;i<2;i++)'),exterior.indexOf('function resize(')),context);
  for(const controller of inputs){controller.dispatchEvent({type:'connected'});controller.dispatchEvent({type:'select'});}
  assert.equal(calls,2);
  assert.match(exterior,/vrButton.addEventListener\('click',async/);
  assert.match(roomSource,/withLanguage\('room.html\?from='\+returnScene\(location.search\)/);
});

test('Validated V5, V6.7 and V6.8 modules and configuration are byte-identical to the restoration tag',async()=>{
  const protectedFiles=['geo/data/salle-des-etats.json','geo/data/leonardo-guide.json','geo/scripts/room-guide.mjs','geo/scripts/room-poi.mjs','geo/scripts/room-navigation.mjs','geo/scripts/room-xr-panel.mjs','geo/styles/room.css'];
  for(const file of protectedFiles){
    const baseline=execFileSync('git',['show',`artdaci-geo-v6.8:${file}`],{cwd:new URL('../',import.meta.url),encoding:'utf8'});
    assert.equal((await read(file)).replaceAll('\r\n','\n'),baseline.replaceAll('\r\n','\n'),file);
  }
});
