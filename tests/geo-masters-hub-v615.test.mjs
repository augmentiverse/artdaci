import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import * as THREE from '../vendor/three.module.js';
import {MAX_ACTIVE_GUIDES,createArtistGuideEngine,validateArtistGuideConfig} from '../geo/scripts/artist-guide-engine.mjs';
import {createGuideModelHandle} from '../geo/scripts/artist-guide-model.mjs';
import {createArtistGuideUi,guideBubbleScreenPlacement} from '../geo/scripts/artist-guide-ui.mjs';
import {createHubXrPanel,layoutGuideBubbleButtons} from '../geo/scripts/masters-hub-panel.mjs';
import {resolveArtworkCapabilities} from '../geo/scripts/artwork-experience.mjs';
import {HUB_GUIDE_COPY,validateHub,layoutHubButtons,panelButtonAt} from '../geo/scripts/masters-hub-core.mjs';

const root=new URL('../',import.meta.url),json=path=>JSON.parse(readFileSync(new URL(path,root),'utf8'));
const hub=json('geo/data/masters-hub.json'),catalog=json('content/media-manifests/catalog.json');
const guides=['leonardo','vermeer','vangogh','monet'].map(name=>json(`geo/data/guides/${name}-hub-guide.json`));
const leonardo=guides[0],vermeer=guides[1],vangogh=guides[2],monet=guides[3],modelPath=leonardo.model.path,vermeerModelPath=vermeer.model.path,vangoghModelPath=vangogh.model.path,monetModelPath=monet.model.path;
const flush=()=>new Promise(resolve=>setImmediate(resolve));

test('all four artist guides are available with intact validated GLBs and exactly three works each',()=>{
  assert.deepEqual(validateHub(hub,catalog),[]);assert.equal(MAX_ACTIVE_GUIDES,1);
  assert.equal(leonardo.model.status,'available');assert.equal(modelPath,'assets/artists/leonardo-da-vinci/reimagined/models/davinci-standing-c.glb');
  assert.equal(createHash('sha256').update(readFileSync(new URL(modelPath,root))).digest('hex'),'528034c1a7a2cd1d6a3b86ca4cbe250fa9eca95ab793d866630cb59240b8b18f');
  assert.deepEqual(leonardo.works,['ld01','ld06','ld02']);
  assert.equal(vermeer.model.status,'available');assert.equal(vermeerModelPath,'assets/artists/johannes-vermeer/reimagined/models/vermeer_standing.glb');
  assert.equal(createHash('sha256').update(readFileSync(new URL(vermeerModelPath,root))).digest('hex'),'0aec3f317abeb2078330cdab4d6e5b064ff20de0a752d96b8ac4ec85f1e60945');
  assert.deepEqual(vermeer.works,['ve01','ve05','ve02']);
  assert.equal(vangogh.model.status,'available');assert.equal(vangoghModelPath,'assets/artists/vincent-van-gogh/profile/models/standing.glb');
  assert.equal(createHash('sha256').update(readFileSync(new URL(vangoghModelPath,root))).digest('hex'),'e3591f493ad1f6fdc99c56fc2e39d38e5b936deb162ce10acd61f2529fa25e1f');
  assert.deepEqual(vangogh.works,['vg01','vg02','vg03']);
  assert.equal(monet.model.status,'available');assert.equal(monetModelPath,'assets/artists/claude-monet/reimagined/models/claude-monet-standing-c.glb');
  assert.equal(createHash('sha256').update(readFileSync(new URL(monetModelPath,root))).digest('hex'),'4ca1439f849015f4eec70d54013b3ebb5defbacc7894cad65f6fcd4148a2c613');
  assert.deepEqual(monet.works,['mo01','mo03','mo06']);
  for(const guide of guides){const artist=hub.artists.find(item=>item.artistId===guide.artistId);assert.deepEqual(validateArtistGuideConfig(guide,{artist,knownArtworkIds:artist.works.map(work=>work.artworkId)}),[]);}
});

test('generic guide loads once, releases, and reloads without keeping an obsolete instance',async()=>{
  const handles=[],disposed=[],mounted=[];
  const engine=createArtistGuideEngine({configs:guides,loadModel:async descriptor=>{const handle={path:descriptor.path,id:handles.length+1};handles.push(handle);return handle;},onModelReady:handle=>mounted.push(handle.id),disposeModel:handle=>disposed.push(handle.id)});
  assert.equal(engine.snapshot().guidesLoaded,0);
  await engine.loadGuide('leonardo-guide');assert.equal(engine.snapshot().guidesLoaded,1);
  assert.deepEqual(mounted,[1]);assert.deepEqual(handles.map(h=>h.path),[modelPath]);
  engine.unloadGuide();assert.equal(engine.snapshot().guidesLoaded,0);assert.deepEqual(disposed,[1]);
  await engine.loadGuide('leonardo-guide');assert.equal(engine.snapshot().guidesLoaded,1);assert.deepEqual(mounted,[1,2]);
  await engine.switchGuide('vermeer-guide');assert.equal(engine.snapshot().guidesLoaded,1);assert.equal(engine.snapshot().guideId,'vermeer-guide');assert.deepEqual(handles.map(h=>h.path),[modelPath,modelPath,vermeerModelPath]);
  await engine.switchGuide('vangogh-guide');assert.equal(engine.snapshot().guidesLoaded,1);assert.equal(engine.snapshot().guideId,'vangogh-guide');assert.deepEqual(handles.map(h=>h.path),[modelPath,modelPath,vermeerModelPath,vangoghModelPath]);
  await engine.switchGuide('monet-guide');assert.equal(engine.snapshot().guidesLoaded,1);assert.equal(engine.snapshot().guideId,'monet-guide');assert.deepEqual(handles.map(h=>h.path),[modelPath,modelPath,vermeerModelPath,vangoghModelPath,monetModelPath]);
  engine.dispose();assert.deepEqual(disposed,[1,2,3,4,5]);
});

test('late cancelled Leonardo load is disposed and never mounted',async()=>{
  let finish;const mounted=[],disposed=[];
  const engine=createArtistGuideEngine({configs:guides,loadModel:()=>new Promise(resolve=>finish=resolve),onModelReady:handle=>mounted.push(handle),disposeModel:handle=>disposed.push(handle)});
  const pending=engine.loadGuide('leonardo-guide');await flush();engine.unloadGuide();
  const obsolete={id:'late'};finish(obsolete);await pending;
  assert.equal(engine.snapshot().guidesLoaded,0);assert.deepEqual(mounted,[]);assert.deepEqual(disposed,[obsolete]);engine.dispose();
});

test('runtime guide uses the exact user-selected QA transform and a light raycast proxy',()=>{
  assert.deepEqual(leonardo.transform,{positionX:5.85,positionY:0.04,positionZ:-7.7,scale:0.92,rotationY:-0.82,groundOffset:0,centerOffsetX:0,centerOffsetZ:0});
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(.73,1.899,.65),new THREE.MeshBasicMaterial()),handle=createGuideModelHandle(THREE,mesh),scene=new THREE.Scene();
  handle.apply(leonardo.transform);handle.mount(scene);
  const bounds=new THREE.Box3().setFromObject(mesh),height=bounds.max.y-bounds.min.y;
  assert.ok(Math.abs(bounds.min.y-.04)<.01);assert.ok(height>=1.73&&height<=1.76);
  assert.equal(handle.proxy.geometry.attributes.position.count,24);
  const center=handle.proxy.getWorldPosition(new THREE.Vector3());
  assert.ok(Math.abs(handle.headPosition().y-bounds.max.y)<.001);
  for(const x of [-.2,.2]){const origin=new THREE.Vector3(center.x+x,center.y,center.z+2),ray=new THREE.Raycaster(origin,new THREE.Vector3(0,0,-1));assert.ok(ray.intersectObject(handle.proxy).length);}
  handle.dispose();assert.equal(scene.children.includes(handle.root),false);
});

test('Vermeer uses a grounded initial transform and the same light raycast proxy',()=>{
  assert.deepEqual(vermeer.transform,{positionX:7.6,positionY:0,positionZ:7.15,scale:1.10,rotationY:-1,groundOffset:0,centerOffsetX:0,centerOffsetZ:0});
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(.555021584,1.545005083,.498468995),new THREE.MeshBasicMaterial()),handle=createGuideModelHandle(THREE,mesh),scene=new THREE.Scene();
  handle.apply(vermeer.transform);handle.mount(scene);
  const bounds=new THREE.Box3().setFromObject(mesh),height=bounds.max.y-bounds.min.y;
  assert.ok(Math.abs(bounds.min.y)<.01);assert.ok(height>=1.69&&height<=1.71);assert.equal(handle.proxy.geometry.attributes.position.count,24);
  handle.dispose();
});

test('Van Gogh starts in the south corner at human scale and uses the same light raycast proxy',()=>{
  assert.deepEqual(vangogh.transform,{positionX:-5.85,positionY:0.04,positionZ:7.7,scale:0.92,rotationY:2.32,groundOffset:0,centerOffsetX:0,centerOffsetZ:0});
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(.644175023,1.897720992,.653738022),new THREE.MeshBasicMaterial()),handle=createGuideModelHandle(THREE,mesh),scene=new THREE.Scene();
  handle.apply(vangogh.transform);handle.mount(scene);
  const bounds=new THREE.Box3().setFromObject(mesh),height=bounds.max.y-bounds.min.y;
  assert.ok(Math.abs(bounds.min.y-.04)<.01);assert.ok(height>=1.74&&height<=1.76);assert.equal(handle.proxy.geometry.attributes.position.count,24);
  handle.dispose();
});

test('Monet starts in the west corner at human scale and uses the same light raycast proxy',()=>{
  assert.deepEqual(monet.transform,{positionX:-7.6,positionY:0.04,positionZ:-7.15,scale:0.92,rotationY:0.88,groundOffset:0,centerOffsetX:0,centerOffsetZ:0});
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(.722892016,1.897716999,.492319003),new THREE.MeshBasicMaterial()),handle=createGuideModelHandle(THREE,mesh),scene=new THREE.Scene();
  handle.apply(monet.transform);handle.mount(scene);
  const bounds=new THREE.Box3().setFromObject(mesh),height=bounds.max.y-bounds.min.y;
  assert.ok(Math.abs(bounds.min.y-.04)<.01);assert.ok(height>=1.74&&height<=1.76);assert.equal(handle.proxy.geometry.attributes.position.count,24);
  handle.dispose();
});

test('all four guide plaques share the midpoint between their two gilded pilasters',()=>{
  const source=readFileSync(new URL('geo/scripts/masters-hub-viewer.js',root),'utf8');
  assert.equal((7.15+9.25)/2,8.2);
  assert.match(source,/artist\.guide\.status==='available'\?8\.2:7\.8/);
  assert.match(source,/artist\.guide\.status==='available'/);assert.match(source,/guideCallTargets\.set\(artist\.guide\.guideId,target\)/);
  assert.match(source,/fillStyle='#fff3d7'/);
  assert.match(source,/strokeStyle='#dbbc75'/);
  assert.match(source,/guideButtonTexture\(labels\.call,false,artist\.zone\.color\)/);
  assert.match(source,/target\.userData\.guideColor=artist\.zone\.color/);
  assert.match(source,/button\.style\.setProperty\('--guide-color',artist\.zone\.color\)/);
});

test('FR EN AR and RTL guide actions remain generic and all three work capacities stay truthful',async()=>{
  const engine=createArtistGuideEngine({configs:guides,workTitle:(id,language)=>hub.artists[0].works.find(work=>work.artworkId===id).title[language]});
  await engine.loadGuide('leonardo-guide');
  for(const language of ['fr','en','ar']){
    assert.ok(HUB_GUIDE_COPY[language].artists.ld.call&&HUB_GUIDE_COPY[language].artists.ve.release&&HUB_GUIDE_COPY[language].artists.vg.call&&HUB_GUIDE_COPY[language].artists.mo.release);
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
  for(const pattern of [/createArtistGuideEngine\(/,/createArtistGuideUi\(/,/createArtistGuideXrPanel\(/,/createArtworkExperience\(/,/loadModel:async\(descriptor/,/targets\.push\(handle\.proxy\)/,/kind==='guide'/,/kind==='guide-panel'/,/guideQA/])assert.match(source,pattern);
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

test('both XR controllers identify and activate the Vermeer call plaque',async()=>{
  const source=readFileSync(new URL('geo/scripts/masters-hub-viewer.js',root),'utf8');
  const scene=new THREE.Scene(),rig=new THREE.Group(),camera=new THREE.PerspectiveCamera();scene.add(rig);rig.add(camera);
  const plaque=new THREE.Mesh(new THREE.PlaneGeometry(1.72,.43),new THREE.MeshBasicMaterial({side:THREE.DoubleSide}));plaque.position.set(0,1.4,-2);plaque.userData.guideCall='vermeer-guide';scene.add(plaque);
  const hands=[new THREE.Group(),new THREE.Group()];for(const [index,hand] of hands.entries())hand.position.set(index?.2:-.2,1.4,0);
  const calls=[],renderer={xr:{isPresenting:true,getController:index=>hands[index],getSession:()=>({visibilityState:'visible'}),addEventListener(){}}};
  const state=vm.createContext({THREE,scene,rig,camera,renderer,controllers:[],targets:[plaque],xrRay:new THREE.Raycaster(),xrPanel:{hit:()=>null},guideXrPanel:null,firstHubHit:(_,hits)=>hits[0]||null,config:hub,ready:true,head:new THREE.Vector3(),turnArmed:false,navigator:{xr:{isSessionSupported:async()=>true}},$:()=>({}),copy:{vr:'VR',exitVr:'Exit'},lang:'fr',callGuide:id=>calls.push(id)});
  vm.runInContext(source.slice(source.indexOf('function controllerTarget('),source.indexOf('function navigateXr(')),state);await state.configureXr();scene.updateMatrixWorld(true);
  for(const [index,hand] of hands.entries()){hand.dispatchEvent({type:'connected',data:{handedness:index?'right':'left'}});const hit=state.controllerTarget(hand);assert.equal(hit.kind,'guide-call');assert.equal(hit.guideId,'vermeer-guide');hand.dispatchEvent({type:'select'});}
  assert.deepEqual(calls,['vermeer-guide','vermeer-guide']);
});

test('2D guide bubble avoids the character and docks when the viewport is crowded',()=>{
  const options={width:1280,height:700,panelWidth:280,panelHeight:220};
  assert.equal(guideBubbleScreenPlacement({left:500,right:700,top:400,bottom:650},options).placement,'above');
  const side=guideBubbleScreenPlacement({left:500,right:700,top:40,bottom:650},options);
  assert.equal(side.placement,'side');assert.ok(side.left>700);
  assert.equal(guideBubbleScreenPlacement({left:30,right:350,top:10,bottom:650},{width:390,height:670,panelWidth:280,panelHeight:220}),null);
});

test('Leonardo about reuses printed biography facts and links only to the existing exact-language printed page',async()=>{
  const source=json(leonardo.profile.source);
  assert.equal(source.artist.birthYear,1452);assert.equal(source.artist.deathYear,1519);
  assert.match(source.texts.artistBiography,/Verrocchio/);assert.match(source.artist.bioLong,/anatomy, optics, engineering/);
  const engine=createArtistGuideEngine({configs:guides});await engine.loadGuide('leonardo-guide');
  engine.dispatch('ARTIST_ABOUT');
  for(const language of ['fr','en','ar']){
    const view=engine.presentation(language),link=view.actions.find(action=>action.id==='OPEN_PROFILE');
    assert.match(view.description,/1452–1519/);assert.ok(view.description.length>130);
    assert.equal(link.href,leonardo.profile.routes[language]);assert.ok(link.label);
    const url=new URL(link.href,new URL('geo/masters-hub.html',root));
    assert.equal(url.searchParams.get('lang'),language);
    const page=new URL(url);page.search='';assert.ok(readFileSync(page,'utf8').length);
    assert.equal(view.dir,language==='ar'?'rtl':'ltr');
  }
  const invalid=structuredClone(leonardo);invalid.profile.routes.fr='javascript:alert(1)';
  assert.ok(validateArtistGuideConfig(invalid).includes('Invalid fr profile route'));
  engine.dispatch('BACK_TO_GUIDE');assert.ok(!engine.presentation('fr').actions.some(action=>action.id==='OPEN_PROFILE'));
  engine.dispose();
});

test('Vermeer about reuses the existing printed source and exact-language pages',async()=>{
  const source=json(vermeer.profile.source);
  assert.equal(source.artist.birthYear,1632);assert.equal(source.artist.deathYear,1675);assert.match(source.artist.bioLong,/Delft/);
  const engine=createArtistGuideEngine({configs:guides});await engine.loadGuide('vermeer-guide');engine.dispatch('ARTIST_ABOUT');
  for(const language of ['fr','en','ar']){
    const view=engine.presentation(language),link=view.actions.find(action=>action.id==='OPEN_PROFILE');
    assert.match(view.description,/1632–1675/);assert.ok(view.description.length>170);assert.equal(link.href,vermeer.profile.routes[language]);
    const url=new URL(link.href,new URL('geo/masters-hub.html',root));assert.equal(url.searchParams.get('lang'),language);
    const page=new URL(url);page.search='';assert.ok(readFileSync(page,'utf8').length);assert.equal(view.dir,language==='ar'?'rtl':'ltr');
  }
  engine.dispose();
});

test('Van Gogh about reuses the existing printed source and exact-language pages',async()=>{
  const source=json(vangogh.profile.source);
  assert.equal(source.artist.birthYear,1853);assert.equal(source.artist.deathYear,1890);assert.match(source.artist.bioLong,/Paris/);
  const engine=createArtistGuideEngine({configs:guides});await engine.loadGuide('vangogh-guide');engine.dispatch('ARTIST_ABOUT');
  for(const language of ['fr','en','ar']){
    const view=engine.presentation(language),link=view.actions.find(action=>action.id==='OPEN_PROFILE');
    assert.match(view.description,/1853–1890/);assert.ok(view.description.length>170);assert.equal(link.href,vangogh.profile.routes[language]);
    const url=new URL(link.href,new URL('geo/masters-hub.html',root));assert.equal(url.searchParams.get('lang'),language);
    const page=new URL(url);page.search='';assert.ok(readFileSync(page,'utf8').length);assert.equal(view.dir,language==='ar'?'rtl':'ltr');
  }
  engine.dispose();
});

test('Monet about reuses the existing printed source and exact-language pages',async()=>{
  const source=json(monet.profile.source);
  assert.equal(source.artist.birthDeath,'1840–1926');assert.match(source.texts.historicalContext,/1874/);
  const engine=createArtistGuideEngine({configs:guides});await engine.loadGuide('monet-guide');engine.dispatch('ARTIST_ABOUT');
  for(const language of ['fr','en','ar']){
    const view=engine.presentation(language),link=view.actions.find(action=>action.id==='OPEN_PROFILE');
    assert.match(view.description,/1840–1926/);assert.ok(view.description.length>150);assert.equal(link.href,monet.profile.routes[language]);
    const url=new URL(link.href,new URL('geo/masters-hub.html',root));assert.equal(url.searchParams.get('lang'),language);
    const page=new URL(url);page.search='';assert.ok(readFileSync(page,'utf8').length);assert.equal(view.dir,language==='ar'?'rtl':'ltr');
  }
  engine.dispose();
});

test('guide profile action is a real HTML link and the same navigation callback works for XR without unloading Leonardo',async()=>{
  const previous=globalThis.document;
  const element=tag=>({tag,hidden:false,dataset:{},children:[],listeners:{},append(...items){this.children.push(...items);},replaceChildren(...items){this.children=items;},addEventListener(type,callback){this.listeners[type]=callback;}});
  globalThis.document={createElement:element};
  try{
    for(const language of ['fr','en','ar']){
      const engine=createArtistGuideEngine({configs:guides});await engine.loadGuide('leonardo-guide');engine.dispatch('ARTIST_ABOUT');
      const rootElement=element('section'),opened=[],ui=createArtistGuideUi({element:rootElement,engine,language,onNavigate:url=>opened.push(url)});
      ui.show();const link=rootElement.children[2].children.find(item=>item.dataset.action==='OPEN_PROFILE');
      assert.equal(link.tag,'a');assert.equal(link.href,leonardo.profile.routes[language]);
      let prevented=false;link.listeners.click({preventDefault(){prevented=true;}});assert.equal(prevented,true);
      ui.activate('OPEN_PROFILE');assert.deepEqual(opened,[link.href,link.href]);assert.equal(engine.snapshot().phase,'ready');assert.equal(engine.snapshot().view,'about');
      engine.dispatch('BACK_TO_GUIDE');ui.activate('OPEN_PROFILE');assert.equal(opened.length,2);
      engine.dispose();
    }
  }finally{globalThis.document=previous;}
});

test('compact guide XR bubble stays above the head, with every action raycastable from both hands in FR EN AR',()=>{
  const previous=globalThis.document;
  const ctx={clearRect(){},fillRect(){},strokeRect(){},fillText(){},drawImage(){},measureText:value=>({width:value.length*14})};
  globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>ctx})};
  try{
    for(const language of ['fr','en','ar'])for(const count of [2,3,4,5]){
      const panel=createHubXrPanel(THREE,language,{bubble:true}),actions=Array.from({length:count},(_,i)=>({id:`action-${i}`,label:'Action'}));
      panel.draw({title:'Leonardo',description:'Guide',actions});panel.mesh.visible=true;
      const anchor=new THREE.Vector3(5.85,1.787,-7.7),viewer=new THREE.Vector3(4,1.65,-3),matrix=new THREE.Matrix4().makeTranslation(...viewer.toArray());
      panel.placeAbove(anchor,matrix);
      const bounds=new THREE.Box3().setFromObject(panel.mesh);
      assert.ok(bounds.min.y>=anchor.y+.179);assert.ok(bounds.max.y-bounds.min.y<.7);assert.equal(panel.mesh.material.depthTest,true);
      const height=272+Math.ceil(count/2)*96;
      for(const button of layoutGuideBubbleButtons(actions,language==='ar')){
        const local=new THREE.Vector3(((button.x+button.width/2)/1024-.5)*1.05,(.5-(button.y+button.height/2)/height)*1.05,0);
        const target=panel.mesh.localToWorld(local);
        for(const offset of [-.2,.2]){const origin=viewer.clone();origin.x+=offset;const ray=new THREE.Raycaster(origin,target.clone().sub(origin).normalize());assert.equal(panel.hit(ray)?.action,button.id);}
        panel.setHover(button.id);
      }
      panel.dispose();
    }
  }finally{globalThis.document=previous;}
});
