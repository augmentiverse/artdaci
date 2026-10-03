import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import * as THREE from '../vendor/three.module.js';
import {createArtistGuideEngine,validateArtistGuideConfig,MAX_ACTIVE_GUIDES,GUIDE_EVENTS} from '../geo/scripts/artist-guide-engine.mjs';
import {createArtistGuideXrPanel} from '../geo/scripts/artist-guide-xr-panel.mjs';
import {createArtistGuideUi} from '../geo/scripts/artist-guide-ui.mjs';
import {createResourceSlot} from '../geo/scripts/experience-resource-slot.mjs';
import {CAPABILITY_NAMES,CAPABILITY_STATES,MAX_ACTIVE_ARTWORK_MODELS,resolveArtworkCapabilities,createArtworkExperience} from '../geo/scripts/artwork-experience.mjs';
import {artworkExperienceActions,artworkExperiencePresentation} from '../geo/scripts/artwork-experience-panel.mjs';
import {HUB_COPY,HUB_LOCAL_AUDIO_COPY,firstHubHit} from '../geo/scripts/masters-hub-core.mjs';

const root=new URL('../',import.meta.url),json=path=>JSON.parse(readFileSync(new URL(path,root),'utf8'));
const hub=json('geo/data/masters-hub.json'),catalog=json('content/media-manifests/catalog.json');
const names=['leonardo','vermeer','vangogh','monet'];
const configs=names.map(name=>json(`geo/data/guides/${name}-hub-guide.json`));
const works=hub.artists.flatMap(artist=>artist.works.map(work=>({artist,work,entry:catalog.artworks.find(entry=>entry.id===work.artworkId)})));
const manifest=id=>json(`content/media-manifests/artworks/${id}/manifest.json`);
const flush=()=>new Promise(resolve=>setImmediate(resolve));

test('four guide configurations keep the twelve unchanged Hub works and translate all views',()=>{
  assert.equal(MAX_ACTIVE_GUIDES,1);assert.equal(configs.length,4);
  for(const artist of hub.artists){
    const config=configs.find(item=>item.artistId===artist.artistId);
    assert.deepEqual(validateArtistGuideConfig(config,{artist,knownArtworkIds:artist.works.map(work=>work.artworkId)}),[]);
    assert.equal(config.model.status,artist.artistId==='ld'?'available':'reserved');
    if(artist.artistId!=='ld')assert.equal(config.model.path,null);
    assert.deepEqual(config.works,artist.works.map(work=>work.artworkId));
    assert.ok(Object.values(config.transform).every(value=>artist.artistId==='ld'?Number.isFinite(value):value===null));
    for(const language of ['fr','en','ar'])assert.ok(config.content[language].welcome.title&&config.content[language].about.description);
  }
  assert.deepEqual(configs.find(config=>config.artistId==='ve').guideId,'vermeer-guide');
  assert.equal(existsSync(new URL('assets/artists/johannes-vermeer/reimagined/models/vermeer_standing.glb',root)),false);
  const engine=readFileSync(new URL('geo/scripts/artist-guide-engine.mjs',root),'utf8');
  assert.doesNotMatch(engine,/Leonardo|Mona Lisa|Vermeer|Van Gogh|Monet|MONA_LISA_VISITED/i);
});

test('guide engine provides welcome, about, work order, previous/next, return and stable generic events',async()=>{
  const events=[],engine=createArtistGuideEngine({configs,onEvent:event=>events.push(event),workTitle:(id,lang)=>works.find(item=>item.work.artworkId===id).work.title[lang]});
  assert.equal(engine.snapshot().guidesLoaded,0);
  for(const config of configs){
    await engine.loadGuide(config.guideId);assert.equal(engine.snapshot().phase,'ready');assert.equal(engine.snapshot().guidesLoaded,0);
    for(const language of ['fr','en','ar']){const view=engine.presentation(language);assert.equal(view.title,config.content[language].welcome.title);assert.equal(view.dir,language==='ar'?'rtl':'ltr');}
    engine.dispatch('ARTIST_ABOUT');assert.equal(engine.presentation('fr').view,'about');
    engine.dispatch('BACK_TO_GUIDE');engine.dispatch('DISCOVER_WORKS');
    assert.deepEqual(engine.presentation('en').actions.slice(0,3).map(action=>action.id),config.works.map(id=>`ARTWORK_SELECTED:${id}`));
    engine.dispatch('ARTWORK_SELECTED',{artworkId:config.works[0]});engine.dispatch('ARTWORK_OPENED');
    engine.dispatch('ARTWORK_NEXT');assert.equal(engine.snapshot().artworkId,config.works[1]);
    engine.dispatch('ARTWORK_PREVIOUS');assert.equal(engine.snapshot().artworkId,config.works[0]);
    engine.dispatch('ARTWORK_CLOSED');assert.equal(engine.presentation('fr').view,'works');
    engine.unloadGuide();assert.equal(engine.snapshot().phase,'closed');
  }
  assert.ok(['GUIDE_REQUESTED','GUIDE_READY','GUIDE_CLOSED','ARTIST_ABOUT','ARTWORK_SELECTED','ARTWORK_OPENED','ARTWORK_NEXT','ARTWORK_PREVIOUS','ARTWORK_CLOSED'].every(id=>events.some(event=>event.type===id)&&GUIDE_EVENTS.includes(id)));
  engine.dispose();
});

test('a late obsolete guide load is disposed, while the new guide remains the only active one',async()=>{
  const pending=new Map(),disposed=[],closed=[],events=[];
  const available=configs.slice(0,2).map(config=>({...config,model:{status:'available',path:'mock/model.glb'}}));
  const engine=createArtistGuideEngine({configs:available,loadModel:(_,context)=>new Promise(resolve=>pending.set(context.id,resolve)),disposeModel:handle=>disposed.push(handle.id),onCloseMedia:()=>closed.push(true),onEvent:event=>events.push(event)});
  const first=engine.loadGuide(available[0].guideId);await flush();
  const second=engine.switchGuide(available[1].guideId);await flush();
  pending.get(available[1].guideId)({id:available[1].guideId});await second;
  pending.get(available[0].guideId)({id:available[0].guideId});await first;
  assert.equal(engine.snapshot().guideId,available[1].guideId);assert.equal(engine.snapshot().guidesLoaded,1);
  assert.deepEqual(disposed,[available[0].guideId]);assert.ok(closed.length>=2);
  assert.equal(events.filter(event=>event.type==='GUIDE_READY').length,1);
  engine.unloadGuide();assert.equal(engine.snapshot().guidesLoaded,0);assert.ok(disposed.includes(available[1].guideId));engine.dispose();
});

test('resource slot releases owned geometries, materials and textures exactly once',async()=>{
  const calls={geometry:0,material:0,texture:0};
  const texture={isTexture:true,dispose(){calls.texture++}},material={map:texture,normalMap:texture,dispose(){calls.material++}},geometry={dispose(){calls.geometry++}};
  const slot=createResourceSlot({load:async()=>({owned:true,object:{traverse:fn=>{fn({geometry,material});fn({geometry,material});}}})});
  await slot.select('first',{url:'mock'});await slot.select('second',{url:'mock'});
  assert.deepEqual(calls,{geometry:1,material:1,texture:1});assert.equal(slot.snapshot().activeCount,1);
  slot.dispose();assert.deepEqual(calls,{geometry:2,material:2,texture:2});
});

test('the twelve capability maps use canonical manifests and exact-language overview audio',()=>{
  assert.equal(MAX_ACTIVE_ARTWORK_MODELS,1);assert.equal(works.length,12);
  for(const {entry,work} of works){
    assert.equal(entry.id,work.artworkId);
    for(const language of ['fr','en','ar']){
      const caps=resolveArtworkCapabilities({entry,work,manifest:manifest(entry.id),language});
      assert.deepEqual(Object.keys(caps),CAPABILITY_NAMES);
      assert.ok(Object.values(caps).every(value=>CAPABILITY_STATES.includes(value.status)));
      assert.equal(caps.info.status,'available');
      assert.ok(['available','local-fallback'].includes(caps.image.status));
      assert.equal(caps.audio.status,work.artworkId==='vg02'&&language==='ar'?'local-fallback':'available');
      if(caps.audio.status==='local-fallback')assert.equal(caps.audio.url,work.audioPresentation[language].path);
      else if(caps.audio.url)assert.match(caps.audio.url,new RegExp(`/audio/${language}/overview\\.mp3$`));
      assert.equal(caps.museum.status,work.museumId?'available':'missing');
    }
  }
});

test('vg02 Arabic remains an explicit local audio fallback in the opened artwork panel',async()=>{
  const experience=createArtworkExperience({catalog,artists:hub.artists,language:'ar',rootUrl:root,fetchImpl:async()=>({ok:true,json:async()=>manifest('vg02')})});
  const opened=await experience.open('vg02');
  assert.equal(opened.capabilities.audio.status,'local-fallback');
  assert.equal(opened.media.audio,'geo/media/vg02/van-gogh-bedroom-ar.mp3');
  assert.deepEqual(opened.media.audioCandidates,[{status:'local-fallback',url:opened.media.audio}]);
  assert.ok(artworkExperienceActions(opened.capabilities,'ar').some(action=>action.id==='audio'));
  assert.match(HUB_LOCAL_AUDIO_COPY.ar,/محلي/);
  assert.equal(manifest('vg02').media.audio.overview.ar,undefined);
  experience.dispose();
});

test('unavailable, planned, invalid and unsupported media never create active buttons',()=>{
  const {entry,work}=works[0],m=structuredClone(manifest(entry.id));
  m.media.audio.overview.fr.available=false;m.media.audio.overview.fr.migrationStatus='planned';
  m.media.images[work.imagePresentation?.manifestKey||'main'].available=false;m.media.images[work.imagePresentation?.manifestKey||'main'].migrationStatus='planned';
  m.media.models['main-v2'].available=false;m.media.models['main-v2'].migrationStatus='planned';
  m.media.videos.main.available=false;m.media.videos.main.migrationStatus='planned';
  let caps=resolveArtworkCapabilities({entry,work,manifest:m,language:'fr'});
  assert.equal(caps.audio.status,'planned');assert.equal(caps.image.status,'local-fallback');assert.equal(caps.model3d.status,'planned');assert.equal(caps.video.status,'planned');
  assert.equal(artworkExperienceActions(caps,'fr').some(action=>action.id==='audio'),false);
  m.media.audio.overview.fr.available=true;m.media.audio.overview.fr.mimeType='text/html';
  caps=resolveArtworkCapabilities({entry,work,manifest:m,language:'fr'});assert.equal(caps.audio.status,'unsupported');
  delete m.media.audio.overview.fr;caps=resolveArtworkCapabilities({entry,work,manifest:m,language:'fr'});assert.equal(caps.audio.status,'missing');
  assert.deepEqual(artworkExperienceActions(caps,'fr').map(action=>action.id),['about','image','museum','return']);
});

test('AR, Space and VR URLs derive only from the existing immersive resolver',()=>{
  const supported=new Set(['ld01','ve01','vg01','vg02']);
  for(const {entry,work} of works){const caps=resolveArtworkCapabilities({entry,work,manifest:manifest(entry.id),language:'ar'});
    for(const kind of ['ar','space','vr']){assert.equal(caps[kind].status,supported.has(entry.id)?'available':'unsupported');if(caps[kind].url){assert.match(caps[kind].url,/&lang=ar$/);assert.ok(caps[kind].url.includes(`../${{ar:'ar.html',space:'space.html',vr:'vr.html'}[kind]}?painting=`));}}
  }
});

test('museum action uses only verified gallery routes and states a virtual gallery',()=>{
  for(const language of ['fr','en','ar']){
    const {entry,work}=works[0],caps=resolveArtworkCapabilities({entry,work,manifest:manifest(entry.id),language});
    assert.equal(caps.museum.url,`../gallery-vr.html?room=museums&museum=louvre&lang=${language}`);
    assert.equal(artworkExperienceActions(caps,language).find(action=>action.id==='museum').label,HUB_COPY[language].museum);
    assert.ok(HUB_COPY[language].museumNote);
  }
});

test('artwork engine fetches manifests only on selection and caches a verified result',async()=>{
  let calls=0;const engine=createArtworkExperience({catalog,artists:hub.artists,language:'en',rootUrl:root,fetchImpl:async url=>{calls++;return {ok:true,json:async()=>manifest(url.match(/artworks\/([^/]+)/)[1])}}});
  assert.equal(calls,0);assert.equal(engine.snapshot().artworkModelsLoaded,0);
  const first=await engine.open('ld01');assert.equal(first.capabilities.audio.status,'available');assert.equal(calls,1);
  await engine.open('ld06');await engine.open('ld01');assert.equal(calls,2);
  engine.dispose();
});

test('aborted manifest responses cannot reopen a closed or different artwork',async()=>{
  const pending=new Map(),engine=createArtworkExperience({catalog,artists:hub.artists,language:'fr',rootUrl:root,fetchImpl:url=>new Promise(resolve=>pending.set(url.match(/artworks\/([^/]+)/)[1],resolve))});
  const old=engine.open('ve01');await flush();const next=engine.open('mo03');await flush();
  pending.get('mo03')({ok:true,json:async()=>manifest('mo03')});await next;
  pending.get('ve01')({ok:true,json:async()=>manifest('ve01')});await old;
  assert.equal(engine.snapshot().artworkId,'mo03');
  const token=engine.beginMediaRequest();engine.close();assert.equal(token.current(),false);assert.equal(engine.snapshot().phase,'closed');engine.dispose();
});

test('mock artwork models respect one active slot and dispose on selection change',async()=>{
  const removed=[],engine=createArtworkExperience({catalog,artists:hub.artists,language:'fr',rootUrl:root,fetchImpl:async url=>({ok:true,json:async()=>manifest(url.match(/artworks\/([^/]+)/)[1])}),loadModel:async(_,context)=>({id:context.id}),disposeModel:handle=>removed.push(handle.id)});
  await engine.open('ld01');await engine.loadArtworkModel();assert.equal(engine.snapshot().artworkModelsLoaded,1);
  await engine.open('ve01');assert.equal(engine.snapshot().artworkModelsLoaded,0);await engine.loadArtworkModel();assert.equal(engine.snapshot().artworkModelsLoaded,1);
  assert.deepEqual(removed,['ld01']);engine.unloadArtworkModel();assert.deepEqual(removed,['ld01','ve01']);engine.dispose();
});

test('generic panels localize RTL and keep XR buttons raycastable by both hands',async()=>{
  const previous=globalThis.document,ctx={clearRect(){},fillRect(){},strokeRect(){},fillText(){},drawImage(){},measureText:t=>({width:t.length*12})};
  globalThis.document={createElement:()=>({getContext:()=>ctx})};
  try{for(const language of ['fr','en','ar']){
    const engine=createArtistGuideEngine({configs,workTitle:id=>id});await engine.loadGuide(configs[0].guideId);
    engine.dispatch('DISCOVER_WORKS');const view=engine.presentation(language),panel=createArtistGuideXrPanel(THREE,language);
    assert.equal(view.dir,language==='ar'?'rtl':'ltr');panel.drawGuide(view,{artistName:'Artist'});panel.mesh.visible=true;
    panel.place(new THREE.Matrix4().makeTranslation(0,1.65,0));
    const origin=new THREE.Vector3(0,1.65,0),point=panel.mesh.localToWorld(new THREE.Vector3(0,-.26,0));
    for(const hand of ['left','right']){
      const hit=panel.hit(new THREE.Raycaster(origin,point.clone().sub(origin).normalize()));
      assert.equal(firstHubHit(hit,[{kind:'artwork',distance:4}]).kind,'panel',hand);
      assert.ok(hit.distance<2);panel.setHover(hit.action);
    }
    panel.dispose();engine.dispose();
    const {entry,work,artist}=works[0],caps=resolveArtworkCapabilities({entry,work,manifest:manifest(entry.id),language});
    const artView=artworkExperiencePresentation({artist,work,language,capabilities:caps});assert.equal(artView.dir,view.dir);assert.equal(artView.actions.at(-1).id,'return');
  }}finally{globalThis.document=previous;}
});

test('prepared HTML guide panel uses localized configuration and dynamic buttons',async()=>{
  const previous=globalThis.document,selected=[];
  const element=()=>({hidden:false,dir:'',dataset:{},children:[],listeners:{},append(...children){this.children.push(...children);},replaceChildren(...children){this.children=children;},addEventListener(type,listener){this.listeners[type]=listener;}});
  globalThis.document={createElement:element};
  try{
    const rootElement=element(),engine=createArtistGuideEngine({configs});
    await engine.loadGuide('vermeer-guide');
    const ui=createArtistGuideUi({element:rootElement,engine,language:'ar',onArtwork:id=>selected.push(id)});
    assert.equal(ui.show().dir,'rtl');
    assert.equal(rootElement.hidden,false);
    rootElement.children[2].children.find(button=>button.dataset.action==='DISCOVER_WORKS').listeners.click();
    assert.equal(engine.snapshot().view,'works');
    rootElement.children[2].children.find(button=>button.dataset.action==='ARTWORK_SELECTED:ve01').listeners.click();
    assert.deepEqual(selected,['ve01']);
    assert.equal(engine.snapshot().artworkId,'ve01');
    rootElement.children[2].children.find(button=>button.dataset.action==='CLOSE').listeners.click();
    assert.equal(rootElement.hidden,true);
    assert.equal(engine.snapshot().guidesLoaded,0);
    engine.dispose();
  }finally{globalThis.document=previous;}
});
