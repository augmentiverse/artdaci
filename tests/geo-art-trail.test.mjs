import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import vm from 'node:vm';
import * as THREE from '../vendor/three.module.js';
import {createArtTrailFlow,validateArtTrail,TRAIL_COPY,TRAIL_CATEGORIES,DISPLAY_STATUSES,TRAIL_SESSION_KEY,readTrailSession,markTrailMonaVisited,trailAudioUrl} from '../geo/scripts/art-trail.mjs';
import {createArtTrailXrPanel,createArtTrailUi} from '../geo/scripts/art-trail-ui.mjs';
import {createActiveGuideFlow} from '../geo/scripts/active-guide.mjs';
import {controllerRayScale} from '../geo/scripts/room-xr-panel.mjs';
import {journeyRoute} from '../geo/scripts/journey.mjs';

const root=new URL('../',import.meta.url);
const read=path=>readFile(new URL(path,root),'utf8');
const data=JSON.parse(await read('geo/data/louvre-art-trail.json'));
const source=await read('geo/scripts/room-viewer.js');
const room=JSON.parse(await read('geo/data/salle-des-etats.json'));
const guide=JSON.parse(await read('geo/data/leonardo-active-guide.json'));
const store=()=>{const entries=new Map();return {getItem:key=>entries.get(key),setItem:(key,value)=>entries.set(key,value)};};

test('V6.11.1 separates two displayed artworks from one documentary collection work',async()=>{
  assert.deepEqual(validateArtTrail(data),[]);
  assert.equal(data.stops.length,7);
  const artworks=data.stops.filter(stop=>stop.type==='artwork');
  assert.deepEqual(artworks.map(stop=>stop.artworkId),['ld01','ld06','ve05']);
  assert.deepEqual(data.stops.filter(stop=>stop.trailCategory==='museum-trail').map(stop=>stop.artworkId),['ld01','ve05']);
  assert.deepEqual(data.stops.filter(stop=>stop.trailCategory==='collection').map(stop=>stop.artworkId),['ld06']);
  assert.deepEqual(data.stops.filter(stop=>stop.trailCategory==='context').map(stop=>stop.type),['museum','room','artist','artist']);
  assert.deepEqual(TRAIL_CATEGORIES,['museum-trail','collection']);
  assert.ok(!JSON.stringify(data).includes('ld04'));
  const catalog=await read('content/media-manifests/catalog.json');
  for(const work of artworks)assert.ok(catalog.includes('"'+work.artworkId+'"'));
  assert.deepEqual(data.stops.filter(stop=>stop.type==='artist').map(stop=>stop.artistId),['ld','ve']);
});

test('Official display snapshots never invent a room for non-displayed Belle Ferronnière or spatial positions',()=>{
  const [mona,belle,astro]=data.stops.filter(stop=>stop.type==='artwork');
  assert.equal(mona.displayStatus,'on-display');assert.deepEqual(mona.museumLocation,{room:'711',wing:'Denon',level:1});
  assert.equal(belle.displayStatus,'not-currently-displayed');assert.equal(belle.museumLocation,null);assert.equal(belle.spatiallyVisitable,false);
  assert.equal(astro.displayStatus,'on-display');assert.deepEqual(astro.museumLocation,{room:'837',wing:'Richelieu',level:2});
  assert.equal(mona.spatiallyVisitable,true);assert.equal(astro.spatiallyVisitable,true);
  for(const [work,ark] of [[mona,'cl010062370'],[belle,'cl010062372'],[astro,'cl010064324']]){
    assert.equal(work.sources[0].url,'https://collections.louvre.fr/ark:/53355/'+ark);
    assert.equal(work.sources[0].checkedOn,'2026-10-02');assert.ok(work.inventory&&work.collection);
  }
  for(const stop of data.stops)assert.deepEqual(stop.spatial.position,{x:null,y:null,z:null});
  for(const change of [d=>d.stops[4].museumLocation={room:'710',wing:'Denon',level:1},d=>d.stops[6].spatial.position.x=2,d=>d.stops[4].artworkId='ld04',d=>d.stops[3].media={},d=>delete d.stops[0].title.ar,d=>d.stops[6].sources[0].url='https://example.com',d=>d.stops[4].trailCategory='museum-trail',d=>d.stops[6].spatiallyVisitable=false]){
    const invalid=structuredClone(data);change(invalid);assert.ok(validateArtTrail(invalid).length);
  }
});

test('Both categories, display badges and actions are distinct and translated in FR/EN/AR',()=>{
  for(const lang of ['fr','en','ar']){
    for(const status of DISPLAY_STATUSES)assert.ok(TRAIL_COPY[lang].statuses[status]);
    assert.equal(new Set(Object.values(TRAIL_COPY[lang].statuses)).size,4);
    assert.ok(TRAIL_COPY[lang].museumAction&&TRAIL_COPY[lang].collectionAction);
    const flow=createArtTrailFlow(data);flow.dispatch('OPEN_MUSEUM');
    assert.equal(flow.presentation(lang).title,data.categories['museum-trail'].title[lang]);flow.dispatch('START');
    for(const id of ['ld01','ve05']){const view=flow.presentation(lang);assert.equal(view.stop.artworkId,id);assert.equal(view.statusLabel,TRAIL_COPY[lang].statuses['on-display']);for(const action of view.actions)assert.ok(action.label);flow.dispatch('NEXT');}
    flow.dispatch('OPEN_COLLECTION');assert.equal(flow.presentation(lang).title,data.categories.collection.title[lang]);flow.dispatch('START');
    assert.equal(flow.presentation(lang).statusLabel,TRAIL_COPY[lang].statuses['not-currently-displayed']);
  }
  assert.equal(TRAIL_COPY.fr.statuses['on-display'],'Exposée actuellement');
  assert.equal(TRAIL_COPY.en.statuses['on-display'],'Currently on display');
  assert.equal(TRAIL_COPY.fr.statuses['not-currently-displayed'],'Collection du Louvre — actuellement non exposée');
  assert.equal(TRAIL_COPY.en.statuses['not-currently-displayed'],'Louvre collection — not currently on display');
});

test('After Mona the physical trail proposes Astronomer, while Belle stays in a separate collection',()=>{
  const flow=createArtTrailFlow(data,{monaVisited:true});flow.dispatch('OPEN_MUSEUM');
  assert.match(flow.presentation('fr').description,/Prochaine étape : L’Astronome/);
  flow.dispatch('START');assert.equal(flow.snapshot().currentId,'ve05-astronomer');
  assert.match(flow.presentation('fr').description,/Salle 837 · Richelieu · Niveau 2/);
  assert.equal(flow.presentation('fr').actions.at(-1).id,'NEXT');
  flow.dispatch('PREVIOUS');assert.equal(flow.snapshot().currentId,'ld01-mona-lisa');
  assert.equal(flow.dispatch('MONA').effect,'MONA');
  flow.dispatch('OPEN_MUSEUM');flow.dispatch('START');assert.equal(flow.snapshot().currentId,'ve05-astronomer');
  flow.dispatch('NEXT');assert.equal(flow.snapshot().mode,'complete');
  flow.dispatch('NEXT');assert.equal(flow.snapshot().mode,'complete');
  flow.dispatch('PREVIOUS');assert.equal(flow.snapshot().currentId,'ve05-astronomer');
  flow.dispatch('OPEN_COLLECTION');flow.dispatch('START');assert.equal(flow.snapshot().currentId,'ld06-belle-ferronniere');
  assert.equal(flow.presentation('fr').actions.at(-1).id,'ROOM');
  assert.doesNotMatch(flow.presentation('fr').description,/Salle \d/);
  assert.equal(flow.dispatch('GUIDE').effect,'GUIDE');
});

test('Session restores only valid stops, retains Mona, survives blocked/corrupt storage and explicit returns',()=>{
  const beforeTrail=store();markTrailMonaVisited(beforeTrail);
  assert.equal(createArtTrailFlow(data,{storage:beforeTrail}).snapshot().monaVisited,true,'A Mona visit is retained even before the first trail opening');
  const storage=store(),flow=createArtTrailFlow(data,{storage,monaVisited:true});
  flow.dispatch('MONA_VISITED');flow.dispatch('OPEN_MUSEUM');flow.dispatch('START');
  const resumed=createArtTrailFlow(data,{storage});resumed.dispatch('OPEN_MUSEUM');resumed.dispatch('START');
  assert.equal(resumed.snapshot().currentId,'ve05-astronomer');assert.equal(resumed.snapshot().monaVisited,true);
  assert.ok(resumed.snapshot().visited.includes('ld01-mona-lisa'));
  resumed.dispatch('OPEN_COLLECTION');resumed.dispatch('START');assert.equal(resumed.snapshot().category,'collection');
  const collectionResume=createArtTrailFlow(data,{storage});collectionResume.dispatch('OPEN_COLLECTION');collectionResume.dispatch('START');assert.equal(collectionResume.snapshot().currentId,'ld06-belle-ferronniere');
  for(const action of ['GUIDE','ROOM','EXTERIOR']){resumed.dispatch('OPEN_MUSEUM');assert.equal(resumed.dispatch(action).effect,action);assert.equal(resumed.snapshot().mode,'closed');}
  storage.setItem(TRAIL_SESSION_KEY,'{');assert.equal(readTrailSession(storage),null);
  storage.setItem(TRAIL_SESSION_KEY,JSON.stringify({currentId:'invented',visited:['invented','louvre']}));
  const clean=createArtTrailFlow(data,{storage});assert.equal(clean.snapshot().currentId,null);assert.deepEqual(clean.snapshot().visited,['louvre']);
  assert.doesNotThrow(()=>createArtTrailFlow(data,{storage:{getItem(){throw Error();},setItem(){throw Error();}}}));
});

test('Artwork exploration reuses images and exact-language published canonical audio, without duplicate Mona media',async()=>{
  for(const stop of data.stops.filter(stop=>stop.media)){
    assert.ok((await stat(new URL(stop.media.image,root))).size>0);
    const manifest=JSON.parse(await read(stop.media.manifest));
    for(const lang of ['fr','en','ar'])assert.equal(trailAudioUrl(stop,manifest,lang),`https://media.artdaci.com/artworks/${stop.artworkId}/audio/${lang}/overview.mp3`);
    assert.equal(trailAudioUrl(stop,manifest,'es'),null);
    const unavailable=structuredClone(manifest);unavailable.media.audio.overview.fr.available=false;assert.equal(trailAudioUrl(stop,unavailable,'fr'),null);
    unavailable.id='ld01';assert.equal(trailAudioUrl(stop,unavailable,'en'),null);
  }
  assert.equal(data.stops[3].media,undefined);
  const flow=createArtTrailFlow(data,{monaVisited:true});flow.dispatch('OPEN_COLLECTION');flow.dispatch('START');flow.dispatch('EXPLORE');
  assert.equal(flow.snapshot().mode,'detail');assert.match(flow.presentation('fr').statusLabel,/non exposée/);
  flow.dispatch('OPEN_MUSEUM');flow.dispatch('START');flow.dispatch('EXPLORE');
  assert.match(flow.presentation('en').description,/837.*Richelieu/);
});

function canvasDocument(){
  const context={clearRect(){},fillRect(){},strokeRect(){},fillText(){},drawImage(){},measureText:value=>({width:String(value).length*13})};
  return {createElement:()=>({width:1024,height:800,getContext:()=>context})};
}

test('The compact translucent XR trail targets and highlights real UV buttons from both hands in FR/EN/AR',()=>{
  const previous=globalThis.document;globalThis.document=canvasDocument();
  try{for(const lang of ['fr','en','ar']){
    const flow=createArtTrailFlow(data);flow.dispatch('OPEN');
    const panel=createArtTrailXrPanel(THREE,lang);panel.draw(flow.presentation(lang),{closeLabel:TRAIL_COPY[lang].CLOSE});
    panel.mesh.visible=true;panel.mesh.position.z=-1.55;panel.mesh.updateMatrixWorld(true);
    for(const x of [-.2,.2]){
      const ray=new THREE.Raycaster(new THREE.Vector3(x,0,0),new THREE.Vector3(-x+(284/1024-.5)*1.28,.5-553/800,-1.55).normalize());
      const hit=panel.hit(ray);assert.equal(hit.action,'trail:START');assert.ok(controllerRayScale(hit)<1);panel.setHover(hit.action);
    }
    assert.equal(panel.mesh.geometry.parameters.width,1.28);assert.ok(panel.mesh.material.transparent);panel.dispose();
  }}finally{globalThis.document=previous;}
});

test('Both actual room controller handlers prioritize trail buttons, shorten rays, highlight and never teleport',async()=>{
  const scene=new THREE.Scene(),rig=new THREE.Group();scene.add(rig);
  const left=new THREE.Group(),right=new THREE.Group(),events=[],hover=[];
  const target={inside:true,action:'trail:NEXT',distance:1,point:new THREE.Vector3(0,1,-1)};
  const artTrail={panel:{hit:()=>target,setHover:action=>hover.push(action)}};
  const renderer={xr:{isPresenting:true,getController:index=>[left,right][index],getSession:()=>({visibilityState:'visible'}),addEventListener(){}}};
  const state=vm.createContext({THREE,scene,rig,renderer,controllers:[],config:room,xrRay:new THREE.Raycaster(),artTrail,
    xrPanel:{hit:()=>null,setHover(){}},guide:{hit:()=>null,setHover(){}},hitArtwork:()=>null,
    navigator:{xr:{isSessionSupported:async()=>true}},xrButton:{addEventListener(){}},copy:{vr:'VR'},ready:true,
    turnArmed:false,xrSupported:false,head:new THREE.Vector3(),camera:{},runPoiAction:action=>events.push(action),controllerRayScale,hotspotHover:false,updateHotspot(){}});
  vm.runInContext(source.slice(source.indexOf('function xrInteractiveHit('),source.indexOf('function turnRig(')),state);await state.configureXr();
  for(const [controller,handedness] of [[left,'left'],[right,'right']]){controller.dispatchEvent({type:'connected',data:{handedness}});controller.dispatchEvent({type:'select'});}
  scene.userData.updateTeleport();assert.deepEqual(events,['trail:NEXT','trail:NEXT']);assert.ok(rig.position.equals(new THREE.Vector3()));
  assert.equal(left.userData.line.scale.z,.2);assert.equal(right.userData.line.scale.z,.2);assert.equal(hover.at(-1),'trail:NEXT');
  assert.ok(left.userData.cursor.visible&&right.userData.cursor.visible);
});

test('Leonardo post-Mona dispatch exposes two separate routes without mutating V6.10 context',()=>{
  const flow=createActiveGuideFlow(guide,{availablePoiIds:['ld01-mona-lisa']});flow.dispatch('MONA_LISA_VISITED');flow.dispatch('RETURN_TO_GUIDE');
  const opened=[];const state=vm.createContext({activeGuideFlow:flow,openArtTrail:category=>opened.push(category)});
  vm.runInContext(source.slice(source.indexOf('function runGuideAction('),source.indexOf('async function openArtTrail(')),state);
  state.runGuideAction('CONTINUE_TRAIL');state.runGuideAction('SHOW_WORKS');
  assert.deepEqual(opened,['museum-trail','collection']);assert.equal(flow.snapshot().view,'postMonaLisa');
  assert.match(source,/if\(action==='CONTINUE_TRAIL'\)\{openArtTrail\('museum-trail'\)/);
  assert.match(source,/if\(action==='SHOW_WORKS'\)\{openArtTrail\('collection'\)/);
  assert.match(source,/function showMonaFromGuide\(\)\s*\{\s*closeGuide\(\);\s*openPoi\(\);\s*approachPoi\(\);\s*\}/);
  for(const lang of ['fr','en','ar'])assert.match(journeyRoute('louvre-xr',lang),new RegExp('lang='+lang));
});

test('Leonardo renders the two localized routes on the validated HTML and XR panels only after Mona',()=>{
  const drawSource=source.slice(source.indexOf('function drawGuidePanel('),source.indexOf('function requestGuideModel('));
  for(const lang of ['fr','en','ar']){
    const flow=createActiveGuideFlow(guide,{availablePoiIds:['ld01-mona-lisa']});flow.dispatch('MONA_LISA_VISITED');flow.dispatch('RETURN_TO_GUIDE');
    const nodes=new Map(),buttons=[],xrViews=[];
    const node=()=>({textContent:'',hidden:false,append(button){buttons.push(button);},replaceChildren(){buttons.length=0;}});
    const state=vm.createContext({activeGuideFlow:flow,lang,TRAIL_COPY,guideOpen:true,
      document:{getElementById:id=>{if(!nodes.has(id))nodes.set(id,node());return nodes.get(id);},createElement:()=>({...node(),dataset:{},addEventListener(){}})},
      guideActions:node(),legacyGuideActions:node(),guideStatus:node(),guide:{state:'ready'},guideCopy:{label:'Guide',loading:'',failed:''},guidePoi:{artist:'Leonardo'},
      activeGuideConfig:guide,activeGuidePanel:{draw:view=>xrViews.push(view)},guideText:(labels,language)=>labels[language],
      renderer:{xr:{isPresenting:false}},xrPanel:{draw(){}},panelNeedsPlacement:false});
    vm.runInContext(drawSource,state);state.drawGuidePanel();
    assert.equal(buttons.find(button=>button.dataset.guideAction==='CONTINUE_TRAIL').textContent,TRAIL_COPY[lang].museumAction);
    assert.equal(buttons.find(button=>button.dataset.guideAction==='SHOW_WORKS').textContent,TRAIL_COPY[lang].collectionAction);
    assert.equal(buttons[0].dataset.guideAction,'CONTINUE_TRAIL');
    assert.equal(xrViews[0].actions.find(action=>action.id==='CONTINUE_TRAIL').label,TRAIL_COPY[lang].museumAction);
    assert.equal(xrViews[0].dir,lang==='ar'?'rtl':'ltr');
  }
});

test('Protected V5–V6.10 modules, styles and configurations remain unchanged from the V6.10 tag (Git CRLF normalized)',async()=>{
  const files=['geo/data/salle-des-etats.json','geo/data/leonardo-guide.json','geo/data/leonardo-active-guide.json','geo/scripts/room-navigation.mjs','geo/scripts/room-poi.mjs','geo/scripts/room-xr-panel.mjs','geo/scripts/room-guide.mjs','geo/scripts/active-guide.mjs','geo/scripts/active-guide-xr-panel.mjs','geo/scripts/journey.mjs','geo/scripts/louvre-xr.js','geo/styles/room.css','geo/styles/active-guide.css'];
  for(const path of files){
    const baseline=execFileSync('git',['show','artdaci-geo-v6.10:'+path],{cwd:root,maxBuffer:12*1024*1024});
    assert.equal((await read(path)).replaceAll('\r\n','\n'),baseline.toString('utf8').replaceAll('\r\n','\n'),path);
  }
});

test('UI is lazy, cancels stale media, gives a usable fallback on failed trail/image/audio and keeps RTL',async()=>{
  const saved={document:globalThis.document,Audio:globalThis.Audio,Image:globalThis.Image,fetch:globalThis.fetch};
  const nodes=new Map();
  const node=()=>({hidden:true,textContent:'',dataset:{},addEventListener(){},append(){},replaceChildren(){},removeAttribute(){}});
  const element={...node(),querySelector(selector){if(!nodes.has(selector))nodes.set(selector,node());return nodes.get(selector);}};
  globalThis.document={...canvasDocument(),createElement:tag=>tag==='canvas'?canvasDocument().createElement():node()};
  class FakeAudio{paused=true;src='';preload='';addEventListener(){}pause(){this.paused=true;}removeAttribute(){this.src='';}load(){}play(){this.paused=false;return Promise.resolve();}}
  globalThis.Audio=FakeAudio;globalThis.Image=class{set src(value){this.value=value;queueMicrotask(()=>this.onerror());}};
  let requests=0,fail=false;globalThis.fetch=async url=>{requests++;if(fail)throw Error('offline');return {ok:true,json:async()=>String(url).includes('art-trail.json')?data:{}};};
  const scene=new THREE.Scene(),stage={dataset:{}},effects=[];
  const ui=createArtTrailUi({THREE,scene,stage,element,language:'ar',isXr:()=>false,onPlacement(){},onEffect:effect=>effects.push(effect)});
  try{
    assert.equal(requests,0);assert.equal(element.dir,'rtl');
    await ui.show(true);assert.equal(requests,1);assert.ok(stage.dataset.artTrailOpenMs);
    ui.run('START');ui.run('EXPLORE');await new Promise(resolve=>setTimeout(resolve,0));
    assert.match(nodes.get('[data-trail-status]').textContent,/غير متاح/);
    ui.run('BACK');ui.run('CLOSE');assert.deepEqual(effects,['GUIDE']);
    await ui.show(true);assert.equal(requests,2,'Trail data is shared; only one detail manifest was requested');
    assert.equal(scene.children.filter(child=>child.isMesh).length,1,'No new artwork/room GLB is loaded');
    ui.dispose();assert.equal(scene.children.length,0);
    const fallback=createArtTrailUi({THREE,scene,stage,element,language:'fr',isXr:()=>false,onPlacement(){},onEffect:effect=>effects.push(effect)});
    fail=true;await fallback.show(true);assert.match(nodes.get('h2').textContent,/indisponible/);fallback.run('CLOSE');assert.equal(effects.at(-1),'GUIDE');fallback.dispose();
  }finally{Object.assign(globalThis,saved);}
});
