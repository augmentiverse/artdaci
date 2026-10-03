import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import vm from 'node:vm';
import * as THREE from '../vendor/three.module.js';
import {createHubXrPanel} from '../geo/scripts/masters-hub-panel.mjs';
import {HUB_IDS,HUB_COPY,HUB_LANGUAGES,validateHub,resolveHubMedia,artworkActions,museumRoute,loadHubManifest,wallPlacement,readHubSticks,createSelectionGate,firstHubHit,layoutHubButtons,panelButtonAt} from '../geo/scripts/masters-hub-core.mjs';
import {movePosition,snapTurn,pivotRig,deadZone} from '../geo/scripts/room-navigation.mjs';
const root=new URL('../',import.meta.url),json=p=>JSON.parse(readFileSync(new URL(p,root),'utf8'));
const config=json('geo/data/masters-hub.json'),catalog=json('content/media-manifests/catalog.json');
const works=config.artists.flatMap(a=>a.works),manifest=id=>json(`content/media-manifests/artworks/${id}/manifest.json`);

test('V6.13 contains exactly four artists and the twelve requested IDs in order',()=>{
  assert.deepEqual(validateHub(config,catalog),[]);assert.equal(config.artists.length,4);
  for(const a of config.artists){assert.equal(a.works.length,3);assert.deepEqual(a.works.map(w=>w.artworkId),HUB_IDS[a.artistId]);}
  assert.equal(new Set(works.map(w=>w.artworkId)).size,12);
  const wrong=structuredClone(config);wrong.artists[0].works[0].artworkId='ld03';assert.ok(validateHub(wrong,catalog).length);
});
test('every work resolves to its canonical catalogue identity and local manifest',()=>{
  for(const a of config.artists)for(const w of a.works){const entry=catalog.artworks.find(e=>e.id===w.artworkId),m=manifest(w.artworkId);assert.equal(entry.slug,m.slug);assert.equal(m.artist.id,a.artistId);assert.equal(entry.manifest.path,`artworks/${w.artworkId}/manifest.json`);}
});
test('all twelve thumbnail and fallback references exist in shared assets or isolated Hub media',()=>{
  for(const work of works)for(const key of ['thumbnail','imageFallback']){assert.ok(existsSync(new URL(work[key],root)),work[key]);assert.match(work[key],/^(assets\/artists|geo\/media)\//);}
});
test('audio is exact-language: canonical overview or explicitly configured Hub narration',()=>{
  let available=0;
  for(const w of works)for(const lang of HUB_LANGUAGES){const media=resolveHubMedia(w,manifest(w.artworkId),lang);assert.ok(media.audio,`${w.artworkId}/${lang}`);available++;if(w.artworkId==='vg02'&&lang==='ar')assert.equal(media.audio,w.audioPresentation.ar.path);else assert.match(media.audio,new RegExp(`/audio/${lang}/overview\\.mp3$`));assert.ok(artworkActions(media,lang).some(a=>a.id==='audio'));}
  assert.equal(available,36);
  const canonicalBedroom={...works.find(w=>w.artworkId==='vg02'),audioPresentation:undefined};
  assert.equal(resolveHubMedia(canonicalBedroom,manifest('vg02'),'ar').audio,null);
});
test('planned, wrong-language and wrong-artwork media cannot enable an audio action',()=>{
  const work=works[0],m=structuredClone(manifest('ld01'));m.media.audio.overview.ar.available=false;assert.equal(resolveHubMedia(work,m,'ar').audio,null);
  m.media.audio.overview.ar.available=true;m.media.audio.overview.ar.language='en';assert.equal(resolveHubMedia(work,m,'ar').audio,null);
  assert.equal(resolveHubMedia(work,manifest('vg01'),'fr').audio,null);
  delete m.media.audio.overview.ar;m.defaultLanguage='en';assert.equal(resolveHubMedia(work,m,'ar').audio,null);
});
test('image fallback survives absent, planned or malformed remote image entries',()=>{
  const work=works[0],m=structuredClone(manifest('ld01'));m.media.images[work.imagePresentation?.manifestKey||'main'].available=false;assert.deepEqual(resolveHubMedia(work,m,'fr').imageCandidates,[work.imageFallback]);
  m.media.images[work.imagePresentation?.manifestKey||'main'].available=true;m.media.images[work.imagePresentation?.manifestKey||'main'].path='../escape.png';assert.deepEqual(resolveHubMedia(work,m,'fr').imageCandidates,[work.imageFallback]);
  assert.ok(resolveHubMedia(work,manifest('ld01'),'fr').imageCandidates.includes(work.imageFallback));
});
test('manifest loading falls back locally after remote failure or identity mismatch',async()=>{
  for(const remote of ['failure','wrong']){const calls=[];const result=await loadHubManifest('vg02',{rootUrl:root,fetchImpl:async url=>{calls.push(url);if(calls.length===1){if(remote==='failure')throw new Error('offline');return {ok:true,json:async()=>manifest('ld01')};}return {ok:true,json:async()=>manifest('vg02')};}});assert.equal(result.id,'vg02');assert.equal(calls.length,2);assert.equal(calls[1],new URL('content/media-manifests/artworks/vg02/manifest.json',root).href);}
});
test('unavailable manifests fail gracefully and bounded timeout reaches local fallback',async()=>{
  assert.equal(await loadHubManifest('ld01',{rootUrl:root,fetchImpl:async()=>({ok:false})}),null);
  let calls=0;const m=await loadHubManifest('ld01',{rootUrl:root,timeoutMs:10,fetchImpl:(url,{signal})=>{calls++;if(calls===2)return Promise.resolve({ok:true,json:async()=>manifest('ld01')});return new Promise((resolve,reject)=>signal.addEventListener('abort',()=>reject(new Error('aborted'))));}});assert.equal(m.id,'ld01');assert.equal(calls,2);
});
test('only verified museum routes are exposed, preserving FR/EN/AR',()=>{
  assert.equal(museumRoute('invented','fr'),null);
  for(const work of works)for(const lang of HUB_LANGUAGES){const route=museumRoute(work.museumId,lang);if(work.museumId){assert.ok(existsSync(new URL(`content/museums/${work.museumId}.json`,root)));assert.equal(new URL(route,new URL('geo/masters-hub.html',root)).searchParams.get('lang'),lang);}else assert.equal(route,null);}
  assert.ok(existsSync(new URL('gallery-vr.html',root)));
});
test('V6.13 actions exclude future 3D, AR, Space, VR and video capabilities',()=>{
  for(const w of works){const actions=artworkActions(resolveHubMedia(w,manifest(w.artworkId),'fr'),'fr');assert.deepEqual(actions.map(a=>a.id),['about','image','audio',...(w.museumId?['museum']:[]),'return']);}
});
test('guide configurations reserve identities without runtime paths or models',()=>{
  assert.deepEqual(config.artists.find(a=>a.artistId==='ve').guide,{guideId:'vermeer-guide',status:'reserved'});
  for(const a of config.artists)assert.deepEqual(Object.keys(a.guide).sort(),['guideId','status']);
  const mutated=structuredClone(config);mutated.artists[1].guide.model='vermeer_standing.glb';assert.ok(validateHub(mutated,catalog).length);
  assert.equal(existsSync(new URL('assets/artists/johannes-vermeer/reimagined/models/vermeer_standing.glb',root)),false);
});
test('Hub startup prepares a guide loader but loads no GLB or video before explicit selection',()=>{
  const viewer=readFileSync(new URL('geo/scripts/masters-hub-viewer.js',root),'utf8');assert.match(viewer,/loadModel:async descriptor/);assert.match(viewer,/guideEngine\.loadGuide\('leonardo-guide'\)/);
  for(const path of ['geo/scripts/masters-hub-panel.mjs','geo/masters-hub.html'])assert.doesNotMatch(readFileSync(new URL(path,root),'utf8'),/GLTFLoader|DRACOLoader|model-viewer|\.glb|<video|VideoTexture/);
  assert.match(readFileSync(new URL('geo/masters-hub.html',root),'utf8'),/<audio[^>]+preload="none"/);
});
test('every label and work description exists in FR/EN/AR; Arabic uses RTL in HTML and XR',()=>{
  for(const lang of HUB_LANGUAGES){assert.deepEqual(Object.keys(HUB_COPY[lang]).sort(),Object.keys(HUB_COPY.fr).sort());assert.ok(Object.values(HUB_COPY[lang]).every(Boolean));}
  for(const w of works)for(const lang of HUB_LANGUAGES)assert.ok(w.description[lang]&&w.title[lang]);
  const source=readFileSync(new URL('geo/scripts/masters-hub-viewer.js',root),'utf8');assert.match(source,/document\.documentElement\.dir=lang==='ar'\?'rtl':'ltr'/);
});
test('four wall layouts face inward and provide twelve distinct painting locations',()=>{
  const points=[];for(const a of config.artists)for(let i=0;i<3;i++){const p=wallPlacement(a.zone.wall,i);points.push(`${p.x},${p.z}`);const inward={x:Math.sin(p.yaw),z:Math.cos(p.yaw)};assert.ok(p.x*inward.x+p.z*inward.z<0);}
  assert.equal(new Set(points).size,12);
});
test('XR buttons never overlap in LTR or RTL for three, four or five available actions',()=>{
  for(const count of [3,4,5])for(const rtl of [false,true]){const buttons=layoutHubButtons(Array.from({length:count},(_,i)=>({id:String(i)})),rtl);for(const b of buttons){assert.equal(panelButtonAt(buttons,b.x+b.width/2,b.y+b.height/2),b.id);assert.ok(b.y+b.height<=900);}for(let i=0;i<buttons.length;i++)for(let j=i+1;j<buttons.length;j++){const a=buttons[i],b=buttons[j];assert.ok(a.x+a.width<=b.x||b.x+b.width<=a.x||a.y+a.height<=b.y||b.y+b.height<=a.y);}}
});
test('both controller sources use handedness independent of connection order',()=>{
  const left={handedness:'left',gamepad:{mapping:'xr-standard',axes:[0,0,.4,-.8]}},right={handedness:'right',gamepad:{mapping:'xr-standard',axes:[0,0,.9,0]}};
  assert.deepEqual(readHubSticks([right,left]),{left:{x:.4,y:-.8},right:{x:.9,y:0}});assert.deepEqual(readHubSticks([left,right]),readHubSticks([right,left]));
  assert.deepEqual(readHubSticks([]),{left:{x:0,y:0},right:{x:0,y:0}});
});
test('panel ray hits block objects behind them; both hands can target the same action',()=>{
  const panel={action:'image',distance:1.2,point:{x:0,y:1,z:0}},behind={kind:'artwork',distance:4};
  for(const hand of ['left','right'])assert.equal(firstHubHit({...panel,hand},[behind]).action,'image');
  assert.equal(firstHubHit({...panel,action:null},[behind]).kind,'panel');assert.equal(firstHubHit(null,[behind]),behind);
});
test('navigation stays in Hub bounds and head-centred turns can complete 360 degrees',()=>{
  const b=config.navigation.bounds;assert.deepEqual(movePosition({x:0,z:0},0,1,0,100,b),{x:0,z:b.minZ});
  let p={x:1,z:2};const h={x:1.4,z:2.1};for(let i=0;i<8;i++)p=pivotRig(p,h,Math.PI/4);assert.ok(Math.abs(p.x-1)<1e-9&&Math.abs(p.z-2)<1e-9);
  assert.equal(snapTurn(.9,false).angle,0);assert.equal(snapTurn(0,false).armed,true);assert.equal(snapTurn(.9,true).angle,-Math.PI/4);
});
test('late media responses cannot reopen a dismissed or different artwork',()=>{const gate=createSelectionGate(),first=gate.next();assert.ok(gate.current(first));gate.next();assert.equal(gate.current(first),false);});
test('GEO exposes both experiences and Hub return preserves the language',()=>{
  const landing=readFileSync(new URL('geo/index.html',root),'utf8'),viewer=readFileSync(new URL('geo/scripts/masters-hub-viewer.js',root),'utf8');
  assert.match(landing,/data-geo-link="remote.html"/);assert.match(landing,/data-geo-link="masters-hub.html"/);assert.match(viewer,/\.\/\?lang=\$\{lang\}/);
});

test('real Hub XR panel raycasts all actions in three languages without covering the central gaze',()=>{
  const previous=globalThis.document;
  const ctx={clearRect(){},fillRect(){},strokeRect(){},fillText(){},drawImage(){},measureText:t=>({width:t.length*12})};
  globalThis.document={createElement:()=>({getContext:()=>ctx})};
  try{for(const language of HUB_LANGUAGES){
    const panel=createHubXrPanel(THREE,language),actions=artworkActions(resolveHubMedia(works[0],manifest('ld01'),language),language);
    panel.draw({title:'Artwork',artist:'Artist',description:'Description',actions});panel.mesh.visible=true;
    const origin=new THREE.Vector3(0,1.65,0);panel.place(new THREE.Matrix4().makeTranslation(0,1.65,0));
    assert.equal(panel.hit(new THREE.Raycaster(origin,new THREE.Vector3(0,0,-1))),null);
    for(const button of layoutHubButtons(actions,language==='ar')){
      const point=panel.mesh.localToWorld(new THREE.Vector3(((button.x+button.width/2)/1024-.5)*1.08,(.5-(button.y+button.height/2)/900)*.95,0));
      const hit=panel.hit(new THREE.Raycaster(origin,point.clone().sub(origin).normalize()));assert.equal(hit.action,button.id);panel.setHover(button.id);assert.ok(hit.distance<2);
    }
    panel.dispose();
  }}finally{globalThis.document=previous;}
});

test('actual left and right controller handlers select artworks, target panels and teleport only on the floor',async()=>{
  const source=readFileSync(new URL('geo/scripts/masters-hub-viewer.js',root),'utf8');
  const scene=new THREE.Scene(),rig=new THREE.Group(),camera=new THREE.PerspectiveCamera();scene.add(rig);rig.add(camera);camera.position.y=1.65;
  const hands=[new THREE.Group(),new THREE.Group()];hands[0].position.set(-.2,1.3,0);hands[1].position.set(.2,1.3,0);
  const item={work:works[0]},art=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.MeshBasicMaterial());art.position.set(0,1.3,-3);art.userData.item=item;scene.add(art);scene.updateMatrixWorld(true);
  const actions=[],opened=[],button={},session={visibilityState:'visible',inputSources:[]};let panelHit=null;
  const renderer={xr:{isPresenting:true,getController:i=>hands[i],getCamera:()=>{scene.updateMatrixWorld(true);return camera;},getSession:()=>session,getReferenceSpace:()=>({}),addEventListener(){}}};
  const state=vm.createContext({THREE,scene,rig,camera,renderer,controllers:[],targets:[art],xrRay:new THREE.Raycaster(),xrPanel:{hit:()=>panelHit,setHover(){},place(){}},guideXrPanel:null,guideUi:null,guideHandle:null,firstHubHit,config,ready:true,head:new THREE.Vector3(),look:new THREE.Vector3(),turnArmed:false,xrEntry:null,needsPanelPlacement:false,needsGuidePanelPlacement:false,selected:null,readHubSticks,snapTurn,pivotRig,movePosition,deadZone,yaw:0,
    navigator:{xr:{isSessionSupported:async()=>true}},$:()=>button,copy:HUB_COPY.fr,lang:'fr',highlight(){},runAction:a=>actions.push(a),openArtwork:w=>opened.push(w),navigate(){},keys:new Set(),held:new Map()});
  vm.runInContext(source.slice(source.indexOf('function controllerTarget('),source.indexOf('function resize(')),state);await state.configureXr();
  for(const [i,c] of hands.entries()){c.dispatchEvent({type:'connected',data:{handedness:i?'right':'left'}});c.dispatchEvent({type:'select'});}
  assert.equal(opened.length,2);assert.ok(rig.position.equals(new THREE.Vector3()));
  panelHit={action:'image',point:new THREE.Vector3(0,1.3,-1.1),distance:1.1};
  for(const c of hands)c.dispatchEvent({type:'select'});assert.deepEqual(actions,['image','image']);assert.ok(rig.position.equals(new THREE.Vector3()));
  state.navigateXr(.016,{getViewerPose:()=>({})});for(const c of hands){assert.equal(c.userData.line.scale.z,1.1);assert.equal(c.userData.cursor.visible,true);}
  panelHit={...panelHit,action:null};for(const c of hands)c.dispatchEvent({type:'select'});assert.equal(actions.length,2);assert.ok(rig.position.equals(new THREE.Vector3()));
  panelHit=null;hands[0].rotation.x=-Math.PI/4;hands[0].dispatchEvent({type:'select'});assert.ok(rig.position.z<-.5);
});

test('actual thumbnail loader falls back once and keeps a selectable placeholder if both images fail',async()=>{
  const source=readFileSync(new URL('geo/scripts/masters-hub-viewer.js',root),'utf8');
  for(const failBoth of [false,true]){
    const calls=[],item={work:works[1],mesh:new THREE.Mesh(new THREE.PlaneGeometry(),new THREE.MeshBasicMaterial()),frame:new THREE.Mesh(new THREE.BoxGeometry(),new THREE.MeshBasicMaterial())};
    const state=vm.createContext({THREE,disposed:false,imagesLoaded:0,imageFailures:0,lang:'fr',copy:HUB_COPY.fr,asset:p=>p,renderer:{capabilities:{getMaxAnisotropy:()=>4}},labelTexture:()=>new THREE.Texture(),imageCanvas:async path=>{calls.push(path);if(failBoth||calls.length===1)throw new Error('unavailable');return {width:600,height:768};}});
    vm.runInContext(source.slice(source.indexOf('async function loadExhibit('),source.indexOf('function configureHtml(')),state);await state.loadExhibit(item);
    assert.deepEqual(calls,[works[1].thumbnail,works[1].imageFallback]);assert.equal(state.imagesLoaded,failBoth?0:1);assert.equal(state.imageFailures,failBoth?1:0);assert.ok(item.mesh.material.map);
  }
});

test('actual pointer handler selects by mouse or touch and does not select after dragging to look',()=>{
  const source=readFileSync(new URL('geo/scripts/masters-hub-viewer.js',root),'utf8'),opened=[],item={work:works[0]};
  const canvas={style:{},focus(){},setPointerCapture(){}};
  const state=vm.createContext({canvas,renderer:{xr:{isPresenting:false}},drag:null,yaw:0,pitch:0,pointerHit:()=>({object:{userData:{item}}}),highlight(){},openArtwork:x=>opened.push(x),navigate(){}});
  vm.runInContext(source.slice(source.indexOf('function configurePointer('),source.indexOf('function controllerTarget(')),state);state.configurePointer();
  for(const pointerType of ['mouse','touch']){const e={pointerId:1,pointerType,clientX:50,clientY:60};canvas.onpointerdown(e);canvas.onpointerup(e);}
  assert.equal(opened.length,2);
  canvas.onpointerdown({pointerId:2,clientX:0,clientY:0});canvas.onpointermove({pointerId:2,clientX:1800,clientY:20});canvas.onpointerup({pointerId:2,clientX:1800,clientY:20});
  assert.equal(opened.length,2);assert.ok(Math.abs(state.yaw)>Math.PI*2);assert.ok(Number.isFinite(state.pitch));
  canvas.onpointerdown({pointerId:3,clientX:0,clientY:0});canvas.onpointercancel();assert.equal(state.drag,null);
});
