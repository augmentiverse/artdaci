import * as THREE from 'three';
import { GLTFLoader } from '../../vendor/GLTFLoader.module.js';
import { DRACOLoader } from '../../vendor/DRACOLoader.module.js';
import { languageFromSearch, withLanguage } from './geo-core.mjs';
import { clampPosition, movePosition, pivotRig, snapTurn, readStick, deadZone, validateRoom, roomModelCandidates, loadRoomWithFallback } from './room-navigation.mjs?v=3';
import {validateRoomPoi,resolveRoomPoi,roomPoiAudioCandidates,roomHotspotPosition,interpolateRoomView} from './room-poi.mjs?v=6-4';
import {createRoomXrPanel,controllerRayScale} from './room-xr-panel.mjs?v=6-8-2';
import {GUIDE_COPY,validateRoomGuide,resolveRoomGuide,createRoomGuide} from './room-guide.mjs?v=6-8-3';
import {JOURNEY_COPY,createJourney,createJourneyPortal,returnScene} from './journey.mjs?v=6-9';

const COPY = {
  fr: {title:'Salle des États',back:'← Retour au parcours',badge:'Reconstitution Marble',loading:'Chargement de la salle…',retry:'Réessayer',entry:'Vue générale',mona:'Voir La Joconde',vr:'Entrer en VR',exitVr:'Quitter la VR',vrUnavailable:'VR indisponible',fullscreen:'Plein écran',controls:'Glisser pour regarder · flèches / ZQSD / WASD pour marcher',disclaimer:'Interprétation générée de la salle. Placement de La Joconde ajusté visuellement ; dimensions non relevées sur place.',audio:'La Joconde · récit et audio',failed:'Impossible de charger cette salle. Vous pouvez réessayer ou revenir au parcours GEO.',ready:'Salle prête',forward:'Avancer',backward:'Reculer',left:'Se déplacer à gauche',right:'Se déplacer à droite',xrError:'La session VR n’a pas pu démarrer.',contextLost:'Le contexte 3D a été interrompu. Réessayez pour recharger la page.'},
  en: {title:'Salle des États',back:'← Back to the journey',badge:'Marble reconstruction',loading:'Loading the room…',retry:'Retry',entry:'General view',mona:'See Mona Lisa',vr:'Enter VR',exitVr:'Exit VR',vrUnavailable:'VR unavailable',fullscreen:'Fullscreen',controls:'Drag to look · arrows / WASD / ZQSD to walk',disclaimer:'Generated interpretation of the room. Mona Lisa is visually positioned; dimensions have not been surveyed on site.',audio:'Mona Lisa · story and audio',failed:'This room could not be loaded. Retry or return to the GEO journey.',ready:'Room ready',forward:'Move forward',backward:'Move backward',left:'Move left',right:'Move right',xrError:'The VR session could not start.',contextLost:'The 3D context was interrupted. Retry to reload the page.'},
  ar: {title:'قاعة الدول',back:'العودة إلى الرحلة ←',badge:'إعادة بناء بواسطة Marble',loading:'جارٍ تحميل القاعة…',retry:'إعادة المحاولة',entry:'منظر عام',mona:'شاهد الموناليزا',vr:'الدخول إلى الواقع الافتراضي',exitVr:'مغادرة الواقع الافتراضي',vrUnavailable:'الواقع الافتراضي غير متاح',fullscreen:'ملء الشاشة',controls:'اسحب للنظر · الأسهم أو WASD أو ZQSD للمشي',disclaimer:'تصوّر مولّد للقاعة. ضُبط موضع الموناليزا بصريًا، ولم تُقَس الأبعاد في الموقع.',audio:'الموناليزا · الحكاية والصوت',failed:'تعذر تحميل القاعة. أعد المحاولة أو عد إلى رحلة GEO.',ready:'القاعة جاهزة',forward:'التقدم',backward:'الرجوع',left:'التحرك يسارًا',right:'التحرك يمينًا',xrError:'تعذر بدء جلسة الواقع الافتراضي.',contextLost:'توقف السياق ثلاثي الأبعاد. أعد المحاولة لإعادة تحميل الصفحة.'},
};
Object.assign(COPY.fr,{badge:'Parquet plan · V5',disclaimer:'Reconstitution inspirée des références : parquet sans relief, plafond à corniche, salle allongée. Seule La Joconde est conservée. Dimensions de conception, non mesurées au musée.'});
Object.assign(COPY.en,{badge:'Flat parquet · V5',disclaimer:'Reference-inspired reconstruction: relief-free parquet, decorative ceiling cornice and a longer room. Mona Lisa is the only painting. Design dimensions, not museum measurements.'});
Object.assign(COPY.ar,{badge:'باركيه مستوٍ · V5',disclaimer:'إعادة بناء مستوحاة من الصور: باركيه بلا نتوءات، وسقف بكورنيش زخرفي، وقاعة أطول. الموناليزا هي اللوحة الوحيدة. الأبعاد تصميمية وليست قياسات من المتحف.'});
const lang=languageFromSearch(location.search);
Object.assign(COPY.fr,{turnLeft:'Tourner à gauche',turnRight:'Tourner à droite',turnAround:'Voir derrière',xrControls:'En VR : stick gauche pour marcher · stick droit pour tourner par pas de 45° · viser le sol et presser la gâchette pour se téléporter. Relâcher le stick entre deux rotations. Le regard reste libre à 360°.'});
Object.assign(COPY.en,{turnLeft:'Turn left',turnRight:'Turn right',turnAround:'Look behind',xrControls:'In VR: left stick to walk · right stick to turn in 45° steps · point at the floor and press the trigger to teleport. Release the stick between turns. Head tracking remains free through 360°.'});
Object.assign(COPY.ar,{turnLeft:'استدر يسارًا',turnRight:'استدر يمينًا',turnAround:'انظر خلفك',xrControls:'في الواقع الافتراضي: العصا اليسرى للمشي، واليمنى للدوران بخطوات 45 درجة. وجّه نحو الأرض واضغط الزناد للانتقال. أعد العصا إلى الوسط بين الدورات. حركة الرأس حرة بزاوية 360 درجة.'});
Object.assign(COPY.fr,{fallback:'Le modèle distant est indisponible. Chargement de la copie locale V5…'});
Object.assign(COPY.en,{fallback:'The remote model is unavailable. Loading the local V5 copy…'});
Object.assign(COPY.ar,{fallback:'النموذج البعيد غير متاح. جارٍ تحميل نسخة V5 المحلية…'});
Object.assign(COPY.fr,{discover:'Découvrir l’œuvre',artworkLabel:'Œuvre · ld01',close:'Fermer',audioGroup:'Audio',audioPreparing:'Préparation de l’audio…',audioReady:'Récit audio disponible',audioFallback:'Audio local disponible',audioFailed:'Audio indisponible',play:'Écouter',pause:'Pause',resume:'Reprendre',stop:'Arrêter',approach:'Approcher de l’œuvre',observe:'Observer l’œuvre',explore:'Explorer l’œuvre',returnRoom:'Retour à la salle',vrPoiHint:'Visez le point doré ou les boutons du panneau et pressez la gâchette.'});
Object.assign(COPY.en,{discover:'Discover the artwork',artworkLabel:'Artwork · ld01',close:'Close',audioGroup:'Audio',audioPreparing:'Preparing audio…',audioReady:'Audio story available',audioFallback:'Local audio available',audioFailed:'Audio unavailable',play:'Listen',pause:'Pause',resume:'Resume',stop:'Stop',approach:'Approach the artwork',observe:'Observe the artwork',explore:'Explore the artwork',returnRoom:'Return to the room',vrPoiHint:'Aim at the gold point or panel buttons and press the trigger.'});
Object.assign(COPY.ar,{discover:'اكتشف العمل الفني',artworkLabel:'عمل فني · ld01',close:'إغلاق',audioGroup:'الصوت',audioPreparing:'جارٍ تجهيز الصوت…',audioReady:'الرواية الصوتية متاحة',audioFallback:'الصوت المحلي متاح',audioFailed:'الصوت غير متاح',play:'استمع',pause:'إيقاف مؤقت',resume:'متابعة',stop:'إيقاف',approach:'اقترب من اللوحة',observe:'تأمل اللوحة',explore:'استكشف اللوحة',returnRoom:'العودة إلى القاعة',vrPoiHint:'وجّه المؤشر إلى النقطة الذهبية أو أزرار اللوحة واضغط الزناد.'});
const copy=COPY[lang];
const journey=createJourney({destination:returnScene(location.search),language:lang,getSession:()=>renderer?.xr.getSession(),release:releaseRoom});
const returnLink=document.createElement('a');returnLink.id='journey-return';returnLink.textContent=JOURNEY_COPY[lang].back;
journey.bind(returnLink);document.querySelector('.room-heading').after(returnLink);
const guideCopy=GUIDE_COPY[lang];
document.querySelectorAll('[data-guide]').forEach(el=>{el.textContent=guideCopy[el.dataset.guide];});
document.documentElement.lang=lang;
document.documentElement.dir=lang==='ar'?'rtl':'ltr';
document.title=`ARTDACI GEO — ${copy.title}`;
document.querySelectorAll('[data-copy]').forEach(el=>{el.textContent=copy[el.dataset.copy];});
document.querySelectorAll('[data-lang]').forEach(el=>{el.href=withLanguage('room.html?from='+returnScene(location.search),el.dataset.lang);el.setAttribute('aria-current',el.dataset.lang===lang?'page':'false');});
document.querySelectorAll('[data-move]').forEach(el=>el.setAttribute('aria-label',copy[el.dataset.move]));
document.querySelectorAll('[data-turn]').forEach(el=>{el.setAttribute('aria-label',copy[el.dataset.turn]);el.title=copy[el.dataset.turn];});
document.getElementById('poi-close').setAttribute('aria-label',copy.close);
document.querySelector('.room-poi-audio').setAttribute('aria-label',copy.audioGroup);
document.getElementById('back-link').href=withLanguage('remote.html',lang);
document.getElementById('mona-link').href=withLanguage('remote.html?poi=ld01-mona-lisa',lang);
const canvas=document.getElementById('room-canvas');
canvas.setAttribute('aria-label',copy.title);
const stage=document.getElementById('room-stage');
stage.setAttribute('aria-label',`${copy.title} · 3D`);
document.querySelector('.room-pad').setAttribute('aria-label',lang==='ar'?'التنقل':'Navigation');
const overlay=document.getElementById('room-loading');
const status=document.getElementById('room-status');
const retry=document.getElementById('retry-button');
const xrButton=document.getElementById('xr-button');
const poiPanel=document.getElementById('room-poi-panel');
const poiButton=document.getElementById('poi-button');
const observationControls=document.getElementById('poi-observation-controls');
const poiReturn=document.getElementById('poi-observation-return');
const observationAudio=document.getElementById('poi-observation-audio');
const audioPlay=document.getElementById('poi-audio-play');
const audioStop=document.getElementById('poi-audio-stop');
const audioStatus=document.getElementById('poi-audio-status');
const poiAudio=new Audio();poiAudio.preload='none';
const guideButton=document.getElementById('guide-button');
const guidePanel=document.getElementById('room-guide-panel');
const guideStatus=document.getElementById('guide-status');
let guide,guideConfig,guidePoi,guideOpen=false;
let renderer, camera, rig, scene, room, config, place, poi, decoder, ready=false, yaw=0, pitch=0, contextLost=false;
let xrSupported=false, loading=false, disposed=false;
let poiOpen=false,observing=false,hotspot=null,hotspotHit=null,hotspotHover=false,xrPanel=null,panelNeedsPlacement=false;
let audioCandidates=[],audioCandidateIndex=0,audioGeneration=0,audioPlaybackRequested=false,approachAnimation=null;
const pointerRay=new THREE.Raycaster(),xrRay=new THREE.Raycaster();
const keys=new Set();
const held=new Map();
const controllers=[];
let drag=null;
let lastTime=0;
let observer;
let xrView=null,turnArmed=false,lastDiagnostics=0,frames=0,diagnosticStart=0;
const head=new THREE.Vector3(),look=new THREE.Vector3();
retry.addEventListener('click',()=>{if(contextLost || !renderer || !config) location.reload();else loadRoom();});

function showError(message,error) {
  ready=false;
  stage.dataset.state='error';
  overlay.hidden=false;
  status.textContent=message;
  retry.hidden=false;
  if(error) console.error('GEO room:',error);
}

function setView(view) {
  if(!config || !rig) return;
  approachAnimation=null;
  if(renderer.xr.isPresenting){xrView=view;return;}
  const point=clampPosition(view,config.navigation.bounds);
  rig.rotation.set(0,0,0);
  rig.position.set(point.x,0,point.z);
  camera.position.set(0,config.navigation.floorHeight+config.navigation.eyeHeight,0);
  yaw=view.yaw;
  pitch=0;
  camera.rotation.set(0,yaw,0,'YXZ');
  stage.dataset.view=JSON.stringify({x:point.x,z:point.z,yaw});
}

function createHotspot() {
  if(hotspot){scene.remove(hotspot);disposeModel(hotspot);}
  const artwork=room.getObjectByName(poi.entry.anchor.targetNode);
  const center=new THREE.Box3().setFromObject(artwork).getCenter(new THREE.Vector3());
  const position=roomHotspotPosition(center,poi.entry.anchor.offset);
  hotspot=new THREE.Group();hotspot.position.set(position.x,position.y,position.z);
  const ring=new THREE.Mesh(new THREE.RingGeometry(.075,.12,40),new THREE.MeshBasicMaterial({color:0xe6bd77,side:THREE.DoubleSide,depthTest:false}));
  ring.renderOrder=4;hotspot.add(ring);hotspot.userData.ring=ring;
  const dot=new THREE.Mesh(new THREE.CircleGeometry(.035,32),new THREE.MeshBasicMaterial({color:0xfff5df,side:THREE.DoubleSide,depthTest:false}));
  dot.position.z=.003;dot.renderOrder=5;hotspot.add(dot);
  hotspotHit=new THREE.Mesh(new THREE.CircleGeometry(.30,32),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide}));
  hotspotHit.position.z=.008;hotspot.add(hotspotHit);scene.add(hotspot);
  updateHotspot();
}

function updateHotspot() {
  if(!hotspot)return;
  const active=poiOpen,hover=hotspotHover;
  hotspot.userData.ring.material.color.set(active?0x75d6e8:hover?0xffffff:0xe6bd77);
  hotspot.scale.setScalar(active?1.2:hover?1.13:1);
  canvas.style.cursor=hover?'pointer':drag?'grabbing':'grab';
}

function hitArtwork(raycaster) {
  if(!hotspotHit || !room)return null;
  const markerHit=raycaster.intersectObject(hotspotHit,false)[0];
  if(markerHit)return markerHit;
  const artwork=room.getObjectByName(poi.entry.anchor.targetNode);
  return artwork?raycaster.intersectObject(artwork,true)[0] || null:null;
}

function pointerHitsArtwork(event) {
  const bounds=canvas.getBoundingClientRect();
  if(!bounds.width || !bounds.height)return false;
  rig.updateMatrixWorld(true);
  pointerRay.setFromCamera(new THREE.Vector2((event.clientX-bounds.left)/bounds.width*2-1,-((event.clientY-bounds.top)/bounds.height*2-1)),camera);
  return Boolean(hitArtwork(pointerRay));
}

function audioLabel() {
  if(!audioCandidates.length)return copy.audioPreparing;
  return audioCandidates[audioCandidateIndex]?.source==='local'?copy.audioFallback:copy.audioReady;
}

function audioActionLabel() {return poiAudio.paused?(poiAudio.currentTime?copy.resume:copy.play):copy.pause;}

function updateAudioUi() {
  const available=audioCandidates.length>0 && audioCandidateIndex<audioCandidates.length;
  audioPlay.disabled=!available;audioStop.disabled=!available || (poiAudio.paused && !poiAudio.currentTime);
  audioPlay.textContent=audioActionLabel();
  observationAudio.disabled=!available;observationAudio.textContent=audioActionLabel();
  document.getElementById('poi-audio-label').textContent=audioLabel();
  if(poiOpen)xrPanel?.draw(copy,poi,{observing,audioLabel:audioLabel(),audioActionLabel:audioActionLabel()});
}

function stopAudio(clearSource=false) {
  audioPlaybackRequested=false;
  poiAudio.pause();
  try{poiAudio.currentTime=0;}catch{ /* An unloaded stream has no seekable time. */ }
  if(clearSource){audioGeneration++;audioCandidates=[];audioCandidateIndex=0;poiAudio.removeAttribute('src');poiAudio.load();audioStatus.textContent='';}
  updateAudioUi();
}

async function prepareAudio() {
  const generation=++audioGeneration;
  audioCandidates=[];audioCandidateIndex=0;audioStatus.textContent='';updateAudioUi();
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),4500);
  let manifest=null;
  try{
    const response=await fetch(poi.manifestUrl,{signal:controller.signal});
    if(response.ok)manifest=await response.json();
  }catch{ /* Offline and CORS failures use the already available local audio. */ }
  finally{clearTimeout(timeout);}
  if(generation!==audioGeneration || !poiOpen || disposed)return;
  audioCandidates=roomPoiAudioCandidates(poi,manifest,lang,import.meta.url);
  audioCandidateIndex=0;
  poiAudio.src=audioCandidates[0].url;
  audioStatus.textContent='';updateAudioUi();
}

function openPoi() {
  if(!ready)return;
  if(guideOpen)closeGuide();
  if(!poiOpen){poiOpen=true;observing=false;prepareAudio();}
  observing=false;
  poiPanel.hidden=false;
  observationControls.hidden=true;
  hotspotHover=false;updateHotspot();updateAudioUi();
  if(renderer.xr.isPresenting){
    xrPanel.mesh.visible=true;panelNeedsPlacement=true;
  }
  stage.dataset.poi='active';
}

function closePoi() {
  poiOpen=false;observing=false;poiPanel.hidden=true;observationControls.hidden=true;
  if(xrPanel)xrPanel.mesh.visible=false;
  stopAudio(true);updateHotspot();
  stage.dataset.poi='closed';
}

function approachPoi() {
  if(!ready)return;
  const target=config.navigation[poi.entry.observationView];
  if(renderer.xr.isPresenting){setView(target);panelNeedsPlacement=true;return;}
  approachAnimation={from:{x:rig.position.x,z:rig.position.z,yaw},to:target,start:performance.now(),duration:1100};
}

function observePoi() {
  if(!poiOpen)return;
  observing=true;poiPanel.hidden=true;observationControls.hidden=false;
  xrPanel?.draw(copy,poi,{observing:true,audioLabel:audioLabel(),audioActionLabel:audioActionLabel()});
  stage.dataset.poi='observing';
}

function returnToRoom() {closePoi();/* The existing rig pose and room GLB are retained. */}

async function explorePoi() {
  stopAudio(true);
  if(renderer.xr.isPresenting)await renderer.xr.getSession().end();
  location.href=poi.artworkUrl;
}

function runPoiAction(action) {
  if(action==='journey')journey.go();
  else if(action==='guide-mona')showMonaFromGuide();
  else if(action==='guide-return' || action==='guide-close')closeGuide();
  else if(action==='guide-retry')requestGuideModel();
  else if(action==='approach')approachPoi();
  else if(action==='observe')observePoi();
  else if(action==='audio')toggleAudio();
  else if(action==='stop')stopAudio();
  else if(action==='explore')explorePoi().catch(error=>console.warn('GEO artwork route:',error));
  else if(action==='return')returnToRoom();
}

function toggleAudio() {
  if(!audioCandidates.length || audioCandidateIndex>=audioCandidates.length)return;
  if(!poiAudio.paused){audioPlaybackRequested=false;poiAudio.pause();return;}
  audioPlaybackRequested=true;
  poiAudio.play().catch(()=>{audioPlaybackRequested=false;audioStatus.textContent=copy.audioFailed;updateAudioUi();});
}

function disposeModel(model) {
  const geometries=new Set(),materials=new Set(),textures=new Set();
  model?.traverse(o=>{if(o.geometry) geometries.add(o.geometry);for(const mat of [o.material].flat().filter(Boolean)){materials.add(mat);for(const value of Object.values(mat)) if(value?.isTexture) textures.add(value);}});
  geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());
}

function drawGuidePanel() {
  if(!guideOpen)return;
  xrPanel.draw({...copy,artworkLabel:guideCopy.label,returnRoom:guideCopy.returnVisit,retry:guideCopy.retry},
    {...guidePoi,modelFailed:guide.state==='error'},{audioLabel:guideStatus.textContent});
}

function requestGuideModel() {
  guide?.ensure().catch(error=>console.warn('GEO Leonardo:',error));
}

function openGuide() {
  if(!ready || !guide)return;
  if(poiOpen)closePoi();
  guideOpen=true;guidePanel.hidden=false;
  stage.dataset.guidePanel='open';
  xrPanel.setHover(null);
  requestGuideModel();drawGuidePanel();
  if(renderer.xr.isPresenting){xrPanel.mesh.visible=true;panelNeedsPlacement=true;}
}

function closeGuide() {
  if(!guideOpen)return;
  guideOpen=false;guidePanel.hidden=true;
  stage.dataset.guidePanel='closed';
  xrPanel.mesh.visible=false;xrPanel.setHover(null);
}

function showMonaFromGuide() {
  closeGuide();
  openPoi();
  approachPoi();
}

async function initGuide() {
  stage.dataset.guideState='idle';stage.dataset.guideModelCount='0';
  try{
    const response=await fetch(new URL('../data/leonardo-guide.json',import.meta.url),{cache:'no-store'});
    if(!response.ok)throw new Error('Guide configuration HTTP '+response.status);
    guideConfig=await response.json();
    const errors=validateRoomGuide(guideConfig,config);
    if(errors.length)throw new Error(errors.join('; '));
    if(disposed)return;
    guidePoi=resolveRoomGuide(guideConfig,lang);
    document.getElementById('guide-title').textContent=guidePoi.title;
    document.getElementById('guide-role').textContent=guidePoi.artist;
    document.getElementById('guide-description').textContent=guidePoi.description;
    guide=createRoomGuide(THREE,{scene,config:guideConfig,room:config,language:lang,
      loader:new GLTFLoader().setDRACOLoader(decoder),disposeModel,
      onState:(state,details)=>{
        stage.dataset.guideState=state;stage.dataset.guideModelCount=String(details.modelCount);
        if(details.loadMs!==undefined)stage.dataset.guideLoadMs=String(details.loadMs);
        guideStatus.textContent=state==='loading'?guideCopy.loading:state==='error'?guideCopy.failed:guideCopy.ready;
        document.getElementById('guide-retry').hidden=state!=='error';
        drawGuidePanel();
      },
    });
    guideButton.disabled=false;
    guideStatus.textContent=guideCopy.ready;
    guideButton.addEventListener('click',()=>{setView(guideConfig.observationView);openGuide();});
    document.getElementById('guide-close').addEventListener('click',closeGuide);
    document.getElementById('guide-return').addEventListener('click',closeGuide);
    document.getElementById('guide-mona').addEventListener('click',showMonaFromGuide);
    document.getElementById('guide-retry').addEventListener('click',requestGuideModel);
    if(new URLSearchParams(location.search).get('guideQA')==='1' && ['localhost','127.0.0.1','[::1]'].includes(location.hostname)){
      const {attachGuideQa}=await import('./room-guide-qa.mjs?v=6-8');
      if(!disposed)attachGuideQa({guide,room:config,language:lang,onPreview:requestGuideModel,onView:view=>setView(view)});
    }
  }catch(error){
    stage.dataset.guideState='error';guideButton.disabled=true;
    console.warn('GEO optional guide:',error);
  }
}

async function loadRoom() {
  if(loading || disposed) return;
  loading=true;ready=false;overlay.hidden=false;retry.hidden=true;
  status.textContent=copy.loading;stage.dataset.state='loading';
  const started=performance.now();
  try {
    const loader=new GLTFLoader().setDRACOLoader(decoder);
    const {candidate,result}=await loadRoomWithFallback(roomModelCandidates(config,import.meta.url),async candidate=>{
      const loaded=await loader.loadAsync(candidate.url,event=>{
        if(event.total) status.textContent=`${copy.loading} ${Math.round(event.loaded/event.total*100)} %`;
      });
      if(!loaded.scene.getObjectByName(config.artwork.nodeName)) {
        disposeModel(loaded.scene);
        throw new Error(`V5 ${candidate.source} model is missing its ld01 artwork node`);
      }
      return loaded;
    },candidate=>{
      if(candidate.source==='r2') status.textContent=copy.fallback;
    });
    if(disposed){disposeModel(result.scene);return;}
    if(room){scene.remove(room);disposeModel(room);}
    room=result.scene;scene.add(room);
    const anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
    room.traverse(o=>{for(const mat of [o.material].flat().filter(Boolean)){
      if(mat.map){mat.map.anisotropy=anisotropy;mat.map.needsUpdate=true;}
    }});
    stage.dataset.anisotropy=String(anisotropy);
    stage.dataset.loadMs=String(Math.round(performance.now()-started));
    stage.dataset.modelSource=candidate.source;
    stage.dataset.artwork=config.artwork.artworkId;
    stage.dataset.state='ready';
    status.textContent=copy.ready;overlay.hidden=true;ready=true;
    document.getElementById('entry-button').disabled=false;
    document.getElementById('mona-button').disabled=false;
    poiButton.disabled=false;
    createHotspot();
    xrButton.disabled=!xrSupported;
    setView(config.navigation.entry);
    journey.ready(stage);
  } catch(error) {showError(copy.failed,error);} finally {loading=false;}
}

async function init() {
  const [roomResponse,placeResponse]=await Promise.all([
    fetch(new URL('../data/salle-des-etats.json',import.meta.url),{cache:'no-store'}),
    fetch(new URL('../data/louvre.json',import.meta.url),{cache:'no-store'}),
  ]);
  if(!roomResponse.ok || !placeResponse.ok) throw new Error(`GEO data HTTP ${roomResponse.status}/${placeResponse.status}`);
  [config,place]=await Promise.all([roomResponse.json(),placeResponse.json()]);
  const errors=validateRoom(config);
  errors.push(...validateRoomPoi(config,place));
  if(errors.length) throw new Error(errors.join('; '));
  poi=resolveRoomPoi(config,place,lang);
  document.getElementById('poi-title').textContent=poi.title;
  document.getElementById('poi-artist').textContent=poi.artist;
  document.getElementById('poi-description').textContent=poi.description;
  document.getElementById('poi-explore').href=poi.artworkUrl;
  document.getElementById('poi-observation-explore').href=poi.artworkUrl;
  xrPanel=createRoomXrPanel(THREE,lang);
  renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false});
  renderer.outputEncoding=THREE.sRGBEncoding;
  renderer.setPixelRatio(Math.min(devicePixelRatio,matchMedia('(pointer: coarse)').matches?1.25:1.5));
  renderer.xr.enabled=true;
  renderer.xr.setReferenceSpaceType('local-floor');
  scene=new THREE.Scene();scene.background=new THREE.Color('#24282e');
  camera=new THREE.PerspectiveCamera(65,1,.05,40);
  rig=new THREE.Group();rig.add(camera);scene.add(rig);
  scene.userData.journey=createJourneyPortal(THREE,{scene,label:JOURNEY_COPY[lang].back,language:lang,position:new THREE.Vector3(-2,1.45,config.navigation.entry.z-2.5),journey});
  scene.add(xrPanel.mesh);
  decoder=new DRACOLoader().setDecoderPath(new URL('../../vendor/draco/',import.meta.url).href).setWorkerLimit(2);
  observer=new ResizeObserver(()=>{
    if(!renderer.xr.isPresenting){renderer.setSize(stage.clientWidth,stage.clientHeight,false);camera.aspect=stage.clientWidth/stage.clientHeight;camera.updateProjectionMatrix();}
    const toolbar=document.querySelector('.room-toolbar');
    stage.style.setProperty('--guide-panel-top',(toolbar.offsetTop+toolbar.offsetHeight+8)+'px');
  });
  observer.observe(stage);
  configureInputs();await configureXr();
  renderer.setAnimationLoop(render);
  await loadRoom();
  if(ready)await initGuide();
}

function configureInputs() {
  poiAudio.addEventListener('play',updateAudioUi);
  poiAudio.addEventListener('pause',updateAudioUi);
  poiAudio.addEventListener('ended',()=>{try{poiAudio.currentTime=0;}catch{}updateAudioUi();});
  poiAudio.addEventListener('error',()=>{
    if(!poiOpen || !audioCandidates.length)return;
    if(audioCandidateIndex+1<audioCandidates.length){
      const resume=audioPlaybackRequested;
      audioCandidateIndex++;
      poiAudio.src=audioCandidates[audioCandidateIndex].url;
      audioStatus.textContent=copy.audioFallback;updateAudioUi();
      if(resume)poiAudio.play().catch(()=>{audioPlaybackRequested=false;audioStatus.textContent=copy.audioFallback;updateAudioUi();});
    }else{audioCandidateIndex=audioCandidates.length;audioStatus.textContent=copy.audioFailed;updateAudioUi();}
  });
  poiButton.addEventListener('click',openPoi);
  document.getElementById('poi-close').addEventListener('click',closePoi);
  document.getElementById('poi-approach').addEventListener('click',approachPoi);
  document.getElementById('poi-observe').addEventListener('click',observePoi);
  document.getElementById('poi-return').addEventListener('click',returnToRoom);
  poiReturn.addEventListener('click',returnToRoom);
  observationAudio.addEventListener('click',toggleAudio);
  document.getElementById('poi-observation-explore').addEventListener('click',()=>stopAudio(true));
  audioPlay.addEventListener('click',toggleAudio);
  audioStop.addEventListener('click',()=>stopAudio());
  document.getElementById('poi-explore').addEventListener('click',()=>stopAudio(true));
  document.querySelectorAll('[data-lang]').forEach(link=>link.addEventListener('click',()=>stopAudio(true)));
  const keySet=new Set(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyW','KeyA','KeyS','KeyD','KeyZ','KeyQ']);
  window.addEventListener('keydown',e=>{
    if(!ready || renderer.xr.isPresenting || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    if(keySet.has(e.code)){e.preventDefault();keys.add(e.code);}
  });
  window.addEventListener('keyup',e=>keys.delete(e.code));
  const clear=()=>{keys.clear();held.clear();drag=null;};
  window.addEventListener('blur',clear);
  document.addEventListener('visibilitychange',()=>{if(document.hidden) clear();});
  canvas.addEventListener('pointerdown',e=>{
    if(!ready || renderer.xr.isPresenting)return;
    if(pointerHitsArtwork(e)){openPoi();return;}
    if(guide?.hit(pointerRay)){openGuide();return;}
    approachAnimation=null;canvas.focus();canvas.setPointerCapture(e.pointerId);drag={id:e.pointerId,x:e.clientX,y:e.clientY};
  });
  canvas.addEventListener('pointermove',e=>{
    if(ready && !drag && !renderer.xr.isPresenting){hotspotHover=pointerHitsArtwork(e);updateHotspot();}
    if(ready && !drag && !renderer.xr.isPresenting){
      const guideHover=Boolean(guide?.hit(pointerRay));guide?.setHover(guideHover);
      if(guideHover)canvas.style.cursor='pointer';
    }
    if(!drag || drag.id!==e.pointerId || renderer.xr.isPresenting) return;
    yaw-=(e.clientX-drag.x)*.0035;
    pitch=Math.max(-1.35,Math.min(1.35,pitch-(e.clientY-drag.y)*.0035));
    drag.x=e.clientX;drag.y=e.clientY;
  });
  ['pointerup','pointercancel','lostpointercapture'].forEach(event=>canvas.addEventListener(event,()=>{drag=null;}));
  canvas.addEventListener('pointerleave',()=>{hotspotHover=false;updateHotspot();guide?.setHover(false);});
  document.querySelectorAll('[data-move]').forEach(button=>{
    button.addEventListener('pointerdown',e=>{e.preventDefault();approachAnimation=null;button.setPointerCapture(e.pointerId);held.set(e.pointerId,button.dataset.move);});
    ['pointerup','pointercancel','lostpointercapture'].forEach(event=>button.addEventListener(event,e=>held.delete(e.pointerId)));
    // Keyboard activation of the visible movement controls makes one small step.
    button.addEventListener('click',e=>{if(e.detail===0) step(button.dataset.move,.3);});
  });
  document.getElementById('entry-button').addEventListener('click',()=>setView(config.navigation.entry));
  document.getElementById('mona-button').addEventListener('click',()=>setView(config.navigation.artworkView));
  document.querySelectorAll('[data-turn]').forEach(button=>button.addEventListener('click',()=>{
    if(!ready || renderer.xr.isPresenting)return;
    approachAnimation=null;
    yaw+=button.dataset.turn==='turnAround'?Math.PI:button.dataset.turn==='turnLeft'?Math.PI/4:-Math.PI/4;
  }));
  document.getElementById('fullscreen-button').addEventListener('click',async()=>{
    try{if(document.fullscreenElement) await document.exitFullscreen();else await stage.requestFullscreen();}catch{ /* Optional browser capability. */ }
  });
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();contextLost=true;showError(copy.contextLost);});
}

function step(direction,distance) {
  if(!ready || renderer.xr.isPresenting)return;
  const pos=movePosition(rig.position,yaw,direction==='forward'?1:direction==='backward'?-1:0,direction==='right'?1:direction==='left'?-1:0,distance,config.navigation.bounds);
  rig.position.x=pos.x;rig.position.z=pos.z;
}

function xrInteractiveHit(controller) {
  const origin=new THREE.Vector3(),direction=new THREE.Vector3();
  controller.getWorldPosition(origin);direction.set(0,0,-1).transformDirection(controller.matrixWorld);
  xrRay.set(origin,direction);
  const panelHit=xrPanel?.hit(xrRay);
  if(panelHit)return {kind:'panel',...panelHit};
  const artworkHit=hitArtwork(xrRay);
  if(artworkHit)return {kind:'artwork',distance:artworkHit.distance,point:artworkHit.point};
  const characterHit=guide?.hit(xrRay);
  if(characterHit)return {kind:'character',distance:characterHit.distance,point:characterHit.point};
  return scene.userData.journey?.hit(xrRay) || null;
}

async function configureXr() {
  try{xrSupported=Boolean(await navigator.xr?.isSessionSupported('immersive-vr'));}catch{xrSupported=false;}
  xrButton.textContent=xrSupported?copy.vr:copy.vrUnavailable;
  xrButton.disabled=!xrSupported || !ready;
  const floorPlane=new THREE.Plane(new THREE.Vector3(0,1,0),-config.navigation.floorHeight);
  const ray=new THREE.Ray(),target=new THREE.Vector3(),direction=new THREE.Vector3(),origin=new THREE.Vector3(),pointerOrigin=new THREE.Vector3();
  const marker=new THREE.Mesh(new THREE.RingGeometry(.12,.18,32),new THREE.MeshBasicMaterial({color:0xe7c78d,side:THREE.DoubleSide}));
  marker.rotation.x=-Math.PI/2;marker.visible=false;scene.add(marker);
  for(let i=0;i<2;i++){
    const controller=renderer.xr.getController(i);rig.add(controller);controllers.push(controller);
    const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3(0,0,-5)]),new THREE.LineBasicMaterial({color:0xe7c78d}));controller.add(line);controller.userData.line=line;
    const cursor=new THREE.Mesh(new THREE.SphereGeometry(.014,12,8),new THREE.MeshBasicMaterial({color:0x8de2ed,transparent:true,depthTest:false,depthWrite:false}));
    cursor.renderOrder=101;cursor.visible=false;scene.add(cursor);controller.userData.cursor=cursor;
    controller.userData.active=false;
    controller.addEventListener('connected',e=>{controller.userData.active=true;controller.userData.source=e.data;turnArmed=false;});
    controller.addEventListener('disconnected',()=>{controller.userData.active=false;controller.userData.source=null;controller.userData.cursor.visible=false;turnArmed=false;});
    controller.userData.getTarget=()=>{
      controller.getWorldPosition(origin);direction.set(0,0,-1).transformDirection(controller.matrixWorld);ray.set(origin,direction);
      if(!ray.intersectPlane(floorPlane,target) || direction.y>-.05)return null;
      const b=config.navigation.bounds;
      return target.x>=b.minX && target.x<=b.maxX && target.z>=b.minZ && target.z<=b.maxZ?target.clone():null;
    };
    controller.addEventListener('select',()=>{
      if(!ready || renderer.xr.getSession()?.visibilityState!=='visible')return;
      rig.updateMatrixWorld(true);
      const interactive=xrInteractiveHit(controller);
      if(interactive?.kind==='panel'){
        if(interactive.action)runPoiAction(interactive.action);
        return;
      }
      if(interactive?.kind==='artwork'){openPoi();return;}
      if(interactive?.kind==='character'){openGuide();return;}
      const point=controller.userData.getTarget();if(!point)return;
      rig.updateMatrixWorld(true);
      head.setFromMatrixPosition(renderer.xr.getCamera(camera).matrixWorld);
      rig.position.x+=point.x-head.x;rig.position.z+=point.z-head.z;
    });
  }
  renderer.xr.addEventListener('sessionstart',()=>{
    keys.clear();held.clear();drag=null;turnArmed=false;
    xrView={x:rig.position.x,z:rig.position.z,yaw};
    rig.position.y=config.navigation.floorHeight;
    camera.position.set(0,0,0);camera.rotation.set(0,0,0);
    xrButton.textContent=copy.exitVr;
    stage.dataset.xr='true';
    if(poiOpen){xrPanel.mesh.visible=true;panelNeedsPlacement=true;xrPanel.draw(copy,poi,{observing,audioLabel:audioLabel(),audioActionLabel:audioActionLabel()});}
    if(guideOpen){drawGuidePanel();xrPanel.mesh.visible=true;panelNeedsPlacement=true;}
  });
  renderer.xr.addEventListener('sessionend',()=>{
    xrView=null;turnArmed=false;marker.visible=false;xrButton.textContent=copy.vr;
    stage.dataset.xr='false';xrPanel.mesh.visible=false;xrPanel.setHover(null);hotspotHover=false;updateHotspot();
    guide?.setHover(false);
    for(const controller of controllers){controller.userData.cursor.visible=false;controller.userData.line.scale.z=1;}
    setView(config.navigation.entry);
    renderer.setSize(stage.clientWidth,stage.clientHeight,false);
    camera.aspect=stage.clientWidth/stage.clientHeight;camera.updateProjectionMatrix();
  });
  xrButton.addEventListener('click',async()=>{
    try{
      const active=renderer.xr.isPresenting?renderer.xr.getSession():null;
      if(active){await active.end();return;}
      const session=await navigator.xr.requestSession('immersive-vr',{requiredFeatures:['local-floor']});
      try{await renderer.xr.setSession(session);}catch(error){await session.end();throw error;}
    }catch(error){console.warn(copy.xrError,error);xrButton.textContent=copy.xrError;}
  });
  scene.userData.updateTeleport=()=>{
    marker.visible=false;
    if(!renderer.xr.isPresenting)return;
    let artworkTargeted=false,guideTargeted=false,interactiveTargeted=false,teleportPoint=null,panelHover=null;
    for(const controller of controllers){
      const line=controller.userData.line,cursor=controller.userData.cursor;
      if(!controller.userData.active){cursor.visible=false;line.visible=false;continue;}
      line.visible=true;
      const interactive=xrInteractiveHit(controller);
      line.material.color.set(interactive?0x75d6e8:0xe7c78d);
      line.scale.z=controllerRayScale(interactive);
      cursor.visible=interactive?.kind==='panel';
      if(cursor.visible){
        controller.getWorldPosition(pointerOrigin);
        cursor.position.copy(interactive.point).lerp(pointerOrigin,.008);
        if(interactive.action && (!panelHover || controller.userData.source?.handedness==='right'))panelHover=interactive.action;
      }
      if(interactive)interactiveTargeted=true;
      if(interactive?.kind==='artwork')artworkTargeted=true;
      if(interactive?.kind==='character')guideTargeted=true;
      if(interactive)continue;
      teleportPoint??=controller.userData.getTarget();
    }
    xrPanel.setHover(panelHover);
    scene.userData.journey?.setHover(panelHover==='journey');
    guide?.setHover(guideTargeted);
    if(!interactiveTargeted && teleportPoint){marker.position.copy(teleportPoint);marker.position.y+=.015;marker.visible=true;}
    if(hotspotHover!==artworkTargeted){hotspotHover=artworkTargeted;updateHotspot();}
  };
}

function turnRig(angle) {
  const pos=pivotRig(rig.position,head,angle);
  rig.position.x=pos.x;rig.position.z=pos.z;rig.rotation.y+=angle;
  rig.updateMatrixWorld(true);
}

function navigateXr(dt,frame) {
  const session=renderer.xr.getSession();
  if(session.visibilityState!=='visible' || !frame?.getViewerPose(renderer.xr.getReferenceSpace())){turnArmed=false;return;}
  rig.updateMatrixWorld(true);
  let xrCamera=renderer.xr.getCamera(camera);
  // In Three r128 the XR camera has no parent. getWorldPosition() would rebuild
  // its matrix from the local pose and discard the rig transform: read the matrix.
  head.setFromMatrixPosition(xrCamera.matrixWorld);
  look.set(0,0,-1).transformDirection(xrCamera.matrixWorld);
  if(xrView){
    turnRig(xrView.yaw-Math.atan2(-look.x,-look.z));
    const point=clampPosition(xrView,config.navigation.bounds);
    rig.position.x+=point.x-head.x;rig.position.z+=point.z-head.z;
    xrView=null;rig.updateMatrixWorld(true);
    xrCamera=renderer.xr.getCamera(camera);head.setFromMatrixPosition(xrCamera.matrixWorld);
  }
  let left={x:0,y:0},right={x:0,y:0};
  for(const source of session.inputSources){
    if(source.handedness==='left')left=readStick(source);
    if(source.handedness==='right')right=readStick(source);
  }
  const turn=snapTurn(right.x,turnArmed,config.navigation.snapDegrees*Math.PI/180);
  turnArmed=turn.armed;
  if(turn.angle)turnRig(turn.angle);
  xrCamera=renderer.xr.getCamera(camera);
  look.set(0,0,-1).transformDirection(xrCamera.matrixWorld);
  // Looking at the ceiling/floor must not create an unstable heading.
  if(Math.hypot(look.x,look.z)>.1)yaw=Math.atan2(-look.x,-look.z);
  const next=movePosition(head,yaw,-deadZone(left.y),deadZone(left.x),dt*config.navigation.xrSpeed,config.navigation.bounds);
  // Do not clamp a physical room-scale offset until virtual movement is requested.
  if(deadZone(left.x) || deadZone(left.y)){
    rig.position.x+=next.x-head.x;rig.position.z+=next.z-head.z;
  }
  rig.updateMatrixWorld(true);
}

function render(time,frame) {
  if(scene?.userData.journey)scene.userData.journey.update(renderer.xr.isPresenting?renderer.xr.getCamera(camera).matrixWorld:camera.matrixWorld,renderer.xr.isPresenting);
  const dt=Math.min(Math.max((time-lastTime)/1000,0),.05);lastTime=time;
  if(ready && !document.hidden && !renderer.xr.isPresenting){
    const touch=new Set(held.values());
    const forward=Number(keys.has('ArrowUp')||keys.has('KeyW')||keys.has('KeyZ')||touch.has('forward'))-Number(keys.has('ArrowDown')||keys.has('KeyS')||touch.has('backward'));
    const sideways=Number(keys.has('KeyD')||touch.has('right'))-Number(keys.has('KeyA')||keys.has('KeyQ')||touch.has('left'));
    if(forward || sideways || keys.has('ArrowLeft') || keys.has('ArrowRight'))approachAnimation=null;
    yaw+=(Number(keys.has('ArrowLeft'))-Number(keys.has('ArrowRight')))*dt*1.4;
    if(approachAnimation){
      const value=interpolateRoomView(approachAnimation.from,approachAnimation.to,(time-approachAnimation.start)/approachAnimation.duration);
      rig.position.x=value.x;rig.position.z=value.z;yaw=value.yaw;
      if(time>=approachAnimation.start+approachAnimation.duration)approachAnimation=null;
    } else {
      const pos=movePosition(rig.position,yaw,forward,sideways,dt*config.navigation.speed,config.navigation.bounds);
      rig.position.x=pos.x;rig.position.z=pos.z;
    }
    camera.rotation.set(pitch,yaw,0,'YXZ');
  }
  if(ready && renderer.xr.isPresenting)navigateXr(dt,frame);
  if(ready && renderer.xr.isPresenting && panelNeedsPlacement && (poiOpen || guideOpen)){
    rig.updateMatrixWorld(true);
    xrPanel.place(renderer.xr.getCamera(camera).matrixWorld);
    panelNeedsPlacement=false;
  }
  scene.userData.updateTeleport?.();
  if(!document.hidden || renderer.xr.isPresenting)renderer.render(scene,camera);
  frames++;
  if(time-lastDiagnostics>1000){
    stage.dataset.view=JSON.stringify({x:rig.position.x,z:rig.position.z,yaw,pitch,xr:renderer.xr.isPresenting});
    stage.dataset.diagnostics=JSON.stringify({seconds:Math.round(time/1000),fps:Math.round(frames*1000/Math.max(1,time-diagnosticStart)),geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures,triangles:renderer.info.render.triangles,calls:renderer.info.render.calls});
    lastDiagnostics=time;diagnosticStart=time;frames=0;
  }
}

function releaseRoom(){
  if(disposed)return;
  stopAudio(true);disposed=true;ready=false;keys.clear();held.clear();observer?.disconnect();
  renderer?.setAnimationLoop(null);renderer?.xr.getSession()?.end().catch(()=>{});
  guide?.dispose();
  scene?.userData.journey?.dispose();
  disposeModel(scene);decoder?.dispose();renderer?.dispose();
}
window.addEventListener('pagehide',releaseRoom);
window.addEventListener('pageshow',e=>{if(e.persisted)location.reload();});
init().catch(error=>showError(copy.failed,error));
