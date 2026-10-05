import * as THREE from 'three';
import {GLTFLoader} from '../../vendor/GLTFLoader.module.js';
import {DRACOLoader} from '../../vendor/DRACOLoader.module.js';
import {languageFromSearch} from './geo-core.mjs';
import {movePosition,pivotRig,snapTurn,deadZone} from './room-navigation.mjs';
import {HUB_COPY,HUB_LOCAL_AUDIO_COPY,HUB_GUIDE_COPY,validateHub,wallPlacement,readHubSticks,readHubKeyboard,createSelectionGate,firstHubHit} from './masters-hub-core.mjs?v=6-15-13';
import {createHubXrPanel} from './masters-hub-panel.mjs?v=6-15-10';
import {createArtistGuideEngine,validateArtistGuideConfig} from './artist-guide-engine.mjs?v=6-15-5';
import {createArtistGuideUi,guideBubbleScreenPlacement} from './artist-guide-ui.mjs?v=6-15-6';
import {createArtistGuideXrPanel} from './artist-guide-xr-panel.mjs';
import {createGuideModelHandle} from './artist-guide-model.mjs';
import {createGuideQa} from './artist-guide-qa.mjs';
import {createArtworkExperience} from './artwork-experience.mjs';
import {artworkExperiencePresentation} from './artwork-experience-panel.mjs?v=6-15-10';
import {printedNotice,validatePrintedNotices,artworkVisitorPose} from './masters-hub-notices.mjs?v=6-15-10';
import {createHubArchitecture,HUB_EXIT} from './masters-hub-room.mjs';

const lang=languageFromSearch(location.search),copy=HUB_COPY[lang],rootUrl=new URL('../../',import.meta.url);
const hubParams=new URLSearchParams(location.search);
const guideSlugMap={leonardo:'leonardo-guide',vermeer:'vermeer-guide',vangogh:'vangogh-guide','van-gogh':'vangogh-guide',monet:'monet-guide'};
const guideCopy=HUB_GUIDE_COPY[lang],guideQaSlug=hubParams.get('guideQA'),guideQaId=guideSlugMap[guideQaSlug]||null;
const guideDeepLinkSlug=hubParams.get('guide'),guideDeepLinkId=guideSlugMap[guideDeepLinkSlug]||null;
const immersiveCopy={fr:{open:'Expériences immersives',back:'Retour à l’œuvre',ar:'Voir en AR',space:'Space AR',vr:'Explorer en VR'},en:{open:'Immersive experiences',back:'Back to artwork',ar:'View in AR',space:'Space AR',vr:'Explore in VR'},ar:{open:'تجارب غامرة',back:'العودة إلى العمل',ar:'عرض بالواقع المعزز',space:'واقع معزز مكاني',vr:'استكشف بالواقع الافتراضي'}}[lang];
const $=id=>document.getElementById(id),stage=$('hub-stage'),canvas=$('hub-canvas'),panel=$('hub-panel'),audio=$('hub-audio');
document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr';
document.title=`ARTDACI Masters Hub — ${copy.subtitle}`;
document.querySelectorAll('[data-copy]').forEach(el=>el.textContent=copy[el.dataset.copy]);
document.querySelectorAll('[data-label]').forEach(el=>el.setAttribute('aria-label',copy[el.dataset.label]));
document.querySelectorAll('[data-lang]').forEach(el=>{
  const guidePart=guideDeepLinkSlug?`&guide=${encodeURIComponent(guideDeepLinkSlug)}`:'';
  el.href=`masters-hub.html?lang=${el.dataset.lang}${guidePart}`;
  el.setAttribute('aria-current',el.dataset.lang===lang?'page':'false');
});
$('geo-return').textContent=copy.back;
for(const id of ['geo-return','footer-return'])$(id).href=`./?lang=${lang}`;

let config,guideConfigs,scene,renderer,camera,rig,xrPanel,guideXrPanel,guideUi,guideHandle,guideQa,decoder,observer,guideEngine,artworkExperience,exitTarget,disposed=false,ready=false;
let yaw=0,pitch=0,lastTime=0,turnArmed=false,xrEntry=null,guideLoadMs=null,notices=null;
let selected=null,media=null,panelView='menu',mediaStatus='',detailImage=null,detailUrl=null,lastFocus=null,audioCandidateIndex=0;
let imagesLoaded=0,imageFailures=0,firstReadyTime=0,frameCount=0,metricStart=0,lastMetrics=0;
const exhibits=[],targets=[],controllers=[],keys=new Set(),held=new Map(),selection=createSelectionGate(),detailGate=createSelectionGate(),guideCallTargets=new Map(),guideTransforms=new Map();
const pointerRay=new THREE.Raycaster(),xrRay=new THREE.Raycaster(),head=new THREE.Vector3(),look=new THREE.Vector3();
const guideHead=new THREE.Vector3(),guideProjection=new THREE.Vector3(),guideBounds=new THREE.Box3();
let drag=null;

function asset(path){return /^https?:/.test(path)?path:new URL(path,rootUrl).href;}
function stopAudio(){audioCandidateIndex=0;audio.pause();audio.removeAttribute('src');audio.load();}
function clearDetail(){if(detailUrl)URL.revokeObjectURL(detailUrl);detailUrl=null;$('hub-detail').removeAttribute('src');delete $('hub-detail').dataset.source;if(detailImage){detailImage.width=1;detailImage.height=1;}detailImage=null;}
function closePanel(focus=true){
  selection.next();detailGate.next();if(artworkExperience)artworkExperience.close();else stopAudio();clearDetail();selected=null;media=null;panel.hidden=true;stage.dataset.panel='false';
  if(xrPanel){xrPanel.mesh.visible=false;xrPanel.setHover(null);xrPanel.resetFollower();}
  if(focus&&lastFocus?.isConnected)lastFocus.focus({preventScroll:true});
}
function guideLabels(artistId){return guideCopy.artists?.[artistId]||guideCopy;}
function activeGuideConfig(){const id=guideEngine?.snapshot().guideId;return guideConfigs?.find(item=>item.guideId===id)||null;}
function guideState(){return guideEngine?.snapshot().phase||'closed';}
function syncGuideState(){
  const snapshot=guideEngine?.snapshot()||{phase:'closed',guideId:null,guidesLoaded:0},loaded=snapshot.guidesLoaded||0;
  stage.dataset.guideState=snapshot.phase;stage.dataset.guidesLoaded=String(loaded);stage.dataset.activeGuide=snapshot.guideId||'';
  for(const artist of config.artists.filter(item=>item.guide.status==='available')){
    const active=snapshot.guideId===artist.guide.guideId,state=active?snapshot.phase:'closed',labels=guideLabels(artist.artistId),release=active&&(state==='loading'||state==='ready');
    const button=$(`hub-call-${artist.artistId}`),status=$(`hub-guide-status-${artist.artistId}`),target=guideCallTargets.get(artist.guide.guideId);
    if(button){button.textContent=release?labels.release:labels.call;button.setAttribute('aria-pressed',active&&loaded?'true':'false');}
    if(target){target.material.map?.dispose();target.material.map=guideButtonTexture(release?labels.release:labels.call,release,target.userData.guideColor);target.material.needsUpdate=true;}
    if(status)status.textContent=!active?'':state==='loading'?labels.loading:state==='error'?labels.failed:state==='ready'?labels.ready:'';
  }
  if(guideLoadMs!==null)stage.dataset.guideLoadMs=String(guideLoadMs);
}
function renderGuide(){
  const view=guideUi?.render(),artist=config?.artists.find(item=>item.artistId===view?.artistId),labels=guideLabels(view?.artistId);
  if(guideXrPanel){guideXrPanel.drawGuide(view,{artistName:artist?.name[lang]||guideCopy.guide,status:labels.ready});guideXrPanel.mesh.visible=Boolean(view&&renderer?.xr.isPresenting);}
  if(view)positionGuideBubble();
}
function positionGuideBubble(){
  if(!guideUi?.visible||!guideHandle||renderer.xr.isPresenting)return;
  const element=$('hub-guide-panel'),dock=$('hub-guide-dock'),width=stage.clientWidth,height=stage.clientHeight;
  element.style.width=`${Math.min(280,width-20)}px`;rig.updateMatrixWorld(true);
  guideHandle.headPosition(guideHead);guideProjection.copy(guideHead).project(camera);
  let placement=null;
  if(guideProjection.z>-1&&guideProjection.z<1){
    guideBounds.setFromObject(guideHandle.proxy);
    const bounds={left:Infinity,right:-Infinity,top:Infinity,bottom:-Infinity};
    for(const horizontal of [guideBounds.min.x,guideBounds.max.x])for(const vertical of [guideBounds.min.y,guideBounds.max.y])for(const depth of [guideBounds.min.z,guideBounds.max.z]){
      guideProjection.set(horizontal,vertical,depth).project(camera);
      const screenX=(guideProjection.x+1)*width/2,screenY=(1-guideProjection.y)*height/2;
      bounds.left=Math.min(bounds.left,screenX);bounds.right=Math.max(bounds.right,screenX);bounds.top=Math.min(bounds.top,screenY);bounds.bottom=Math.max(bounds.bottom,screenY);
    }
    placement=guideBubbleScreenPlacement(bounds,{width,height,panelWidth:element.offsetWidth,panelHeight:element.offsetHeight});
  }
  if(placement){if(element.parentElement!==stage)stage.append(element);element.style.left=`${placement.left}px`;element.style.top=`${placement.top}px`;element.dataset.placement=placement.placement;}
  else{const moved=element.parentElement!==dock;if(moved)dock.append(element);element.style.left='';element.style.top='';element.dataset.placement='docked';if(moved)element.scrollIntoView({block:'nearest'});}
}
function showGuide(){
  if(guideState()!=='ready')return;
  closePanel(false);guideEngine.dispatch('BACK_TO_GUIDE');guideUi.show();renderGuide();
}
function positionArtworkBubble(){
  if(!selected||panel.hidden||renderer.xr.isPresenting)return;
  const dock=$('hub-artwork-dock'),width=stage.clientWidth;
  panel.style.width=`${Math.min(280,width-20)}px`;rig.updateMatrixWorld(true);
  if(width>=720){if(panel.parentElement!==stage)stage.append(panel);panel.style.left=`${lang==='ar'?12:Math.max(12,width-panel.offsetWidth-12)}px`;panel.style.top='12px';panel.dataset.placement='visitor';}
  else{const moved=panel.parentElement!==dock;if(moved)dock.append(panel);panel.style.left='';panel.style.top='';panel.dataset.placement='docked';if(moved)panel.scrollIntoView({block:'nearest'});}
}
function closeGuide(){
  if(selected&&guideEngine?.snapshot().view==='artwork')closePanel(false);
  guideUi?.hide();guideXrPanel&&(guideXrPanel.mesh.visible=false);
  guideEngine?.unloadGuide();guideLoadMs=null;syncGuideState();
}
async function callGuide(guideId){
  if(!guideEngine||!ready)return;
  const snapshot=guideEngine.snapshot();
  if(snapshot.guideId===guideId&&(snapshot.phase==='loading'||snapshot.phase==='ready')){closeGuide();return;}
  closePanel(false);guideUi?.hide();const start=performance.now();
  const pending=snapshot.guideId&&snapshot.guideId!==guideId?guideEngine.switchGuide(guideId):guideEngine.loadGuide(guideId);syncGuideState();
  try{const result=await pending;if(disposed||result.phase!=='ready')return;
    guideLoadMs=Math.round(performance.now()-start);syncGuideState();guideUi.show();renderGuide();
  }catch(error){if(!disposed){syncGuideState();console.warn('Hub guide unavailable:',error);}}
}
function openGuideArtwork(artworkId){
  const artist=config.artists.find(entry=>entry.artistId===guideEngine.snapshot().artistId),work=artist?.works.find(entry=>entry.artworkId===artworkId);
  if(!work)return;
  if(guideEngine.snapshot().artworkId!==artworkId)guideEngine.dispatch('ARTWORK_SELECTED',{artworkId});
  guideEngine.dispatch('ARTWORK_OPENED');guideUi.hide();guideXrPanel.mesh.visible=false;
  openArtwork({artist,work});
}
function returnToGuide(){
  closePanel(false);guideEngine.dispatch('BACK_TO_GUIDE');guideUi.show();renderGuide();
}
function drawPanel(){
  if(!selected)return;
  const work=selected.work,presentation=artworkExperiencePresentation({artist:selected.artist,work,language:lang,view:panelView,status:mediaStatus,capabilities:media?.capabilities,playing:!audio.paused,image:panelView==='image'?detailImage:null,printedNotice:printedNotice(notices,work.artworkId,lang)});
  const currentGuide=activeGuideConfig();
  if(currentGuide&&guideEngine?.snapshot().view==='artwork'&&guideEngine.snapshot().artworkId===work.artworkId){
    const routes=['ar','space','vr'].filter(kind=>media?.capabilities?.[kind]?.status==='available'&&media.capabilities[kind].url);
    if(panelView==='experiences')presentation.actions=[...routes.map(kind=>({id:kind,label:immersiveCopy[kind]})),{id:'work',label:immersiveCopy.back},{id:'guide-return',label:currentGuide.content[lang].actions.BACK_TO_GUIDE}];
    else presentation.actions=[...presentation.actions.filter(action=>action.id!=='return'),...(routes.length?[{id:'experiences',label:immersiveCopy.open}]:[]),{id:'previous',label:currentGuide.content[lang].actions.PREVIOUS_WORK},{id:'next',label:currentGuide.content[lang].actions.NEXT_WORK},{id:'guide-return',label:currentGuide.content[lang].actions.BACK_TO_GUIDE}];
  }
  const {actions,description}=presentation;
  $('hub-panel-title').textContent=presentation.title;$('hub-panel-artist').textContent=presentation.artist;
  $('hub-panel-description').textContent=description;$('hub-media-status').textContent=mediaStatus;
  $('hub-detail').hidden=panelView!=='image'||!detailUrl;$('hub-detail').alt=presentation.title;
  const focused=document.activeElement?.dataset?.action;
  $('hub-actions').replaceChildren(...actions.map(action=>{const b=document.createElement(action.href?'a':'button');if(action.href)b.href=action.href;else b.type='button';b.dataset.action=action.id;b.textContent=action.label;b.addEventListener('click',event=>{event.preventDefault();runAction(action.id);});return b;}));
  if(focused)$('hub-actions').querySelector(`[data-action="${focused}"]`)?.focus({preventScroll:true});
  panel.hidden=false;stage.dataset.panel='true';
  if(xrPanel){xrPanel.draw(presentation);xrPanel.mesh.visible=Boolean(renderer?.xr.isPresenting);}
  positionArtworkBubble();
}
async function openArtwork(item){
  guideUi?.hide();if(guideXrPanel)guideXrPanel.mesh.visible=false;
  closePanel(false);lastFocus=document.activeElement;selected=item;panelView='menu';mediaStatus=copy.mediaLoading;xrPanel?.resetFollower();
  const pending=artworkExperience.open(item.work.artworkId);
  media=artworkExperience.snapshot().media;const token=selection.next();drawPanel();
  if(!renderer?.xr.isPresenting)$('hub-panel-title').focus({preventScroll:true});
  const result=await pending;
  if(!selection.current(token)||!result)return;
  media=result.media;audioCandidateIndex=0;
  mediaStatus=media.capabilities.audio.status==='local-fallback'?HUB_LOCAL_AUDIO_COPY[lang]:(result.manifestAvailable?'':copy.mediaFailed);
  drawPanel();
}
async function imageCanvas(url,limit){
  return new Promise((resolve,reject)=>{
    const image=new Image();image.crossOrigin='anonymous';let timer=setTimeout(()=>{image.src='';reject(new Error('Image timeout'));},15000);
    image.onerror=()=>{clearTimeout(timer);reject(new Error('Image unavailable'));};
    image.onload=()=>{clearTimeout(timer);try{const s=Math.min(1,limit/Math.max(image.naturalWidth,image.naturalHeight));const c=document.createElement('canvas');c.width=Math.max(1,Math.round(image.naturalWidth*s));c.height=Math.max(1,Math.round(image.naturalHeight*s));c.getContext('2d').drawImage(image,0,0,c.width,c.height);resolve(c);}catch(e){reject(e);}finally{image.src='';}};
    image.src=url;
  });
}
async function showDetail(){
  if(!selected)return;panelView='image';mediaStatus=copy.loading;drawPanel();
  if(detailImage){mediaStatus='';drawPanel();return;}
  const token=detailGate.next(),request=artworkExperience.beginMediaRequest();
  for(const path of media.imageCandidates){
    try{
      const image=await imageCanvas(asset(path),1536);
      if(!detailGate.current(token)||!request.current()){image.width=1;return;}
      const blob=await new Promise(resolve=>image.toBlob(resolve,'image/jpeg',.9));
      if(!detailGate.current(token)||!request.current()){image.width=1;return;}
      if(!blob)throw new Error('Image conversion failed');
      detailImage=image;detailUrl=URL.createObjectURL(blob);$('hub-detail').src=detailUrl;$('hub-detail').dataset.source=path;mediaStatus='';drawPanel();return;
    }catch{}
  }
  if(detailGate.current(token)&&request.current()){mediaStatus=copy.imageFailed;drawPanel();}
}
async function navigate(url){stopAudio();try{await renderer?.xr.getSession()?.end();}catch{}location.assign(url);}
function goToSelectedArtwork(){
  if(!selected)return;
  const item=exhibits.find(entry=>entry.work.artworkId===selected.work.artworkId),pose=artworkVisitorPose(THREE,item);if(!pose)return;
  if(renderer.xr.isPresenting){
    rig.updateMatrixWorld(true);let cam=renderer.xr.getCamera(camera);head.setFromMatrixPosition(cam.matrixWorld);look.set(0,0,-1).transformDirection(cam.matrixWorld);
    const currentYaw=Math.atan2(-look.x,-look.z),delta=Math.atan2(Math.sin(pose.yaw-currentYaw),Math.cos(pose.yaw-currentYaw));turnRig(delta);
    rig.updateMatrixWorld(true);cam=renderer.xr.getCamera(camera);head.setFromMatrixPosition(cam.matrixWorld);rig.position.x+=pose.x-head.x;rig.position.z+=pose.z-head.z;rig.updateMatrixWorld(true);yaw=pose.yaw;xrPanel.resetFollower();
  }else{rig.position.x=pose.x;rig.position.z=pose.z;yaw=pose.yaw;pitch=0;camera.rotation.set(0,yaw,0,'YXZ');canvas.focus({preventScroll:true});}
  stage.dataset.lastArtworkApproach=selected.work.artworkId;
}
async function runAction(action){
  if(!selected)return;
  if(action==='printed'){const notice=printedNotice(notices,selected.work.artworkId,lang);if(notice)await navigate(notice.href);return;}
  if(action==='guide-return'){returnToGuide();return;}
  if(action==='previous'||action==='next'){
    const next=guideEngine.dispatch(action==='previous'?'ARTWORK_PREVIOUS':'ARTWORK_NEXT').artworkId;
    if(next)openGuideArtwork(next);return;
  }
  if(action==='experiences'||action==='work'){panelView=action==='work'?'menu':'experiences';drawPanel();return;}
  if(['ar','space','vr'].includes(action)&&media?.capabilities?.[action]?.status==='available'){
    await navigate(media.capabilities[action].url);return;
  }
  if(action==='return'){closePanel();return;}
  if(action==='goto-artwork'){goToSelectedArtwork();return;}
  if(action==='about'){panelView='about';mediaStatus='';drawPanel();return;}
  if(action==='image'){await showDetail();return;}
  if(action==='audio'&&media.audio){
    if(!audio.paused){audio.pause();return;}
    const playingSelection=selected;
    for(let index=audioCandidateIndex;index<media.audioCandidates.length;index++){
      if(selected!==playingSelection)return;
      const candidate=media.audioCandidates[index];audioCandidateIndex=index;
      const audioUrl=asset(candidate.url);
      if(audio.getAttribute('src')!==audioUrl)audio.src=audioUrl;
      mediaStatus=candidate.status==='local-fallback'?HUB_LOCAL_AUDIO_COPY[lang]:'';drawPanel();
      try{await audio.play();return;}
      catch(error){if(selected!==playingSelection||error.name==='AbortError')return;}
    }
    mediaStatus=copy.audioFailed;drawPanel();return;
  }
  if(action==='museum'&&media.museum)await navigate(media.museum);
}

function labelTexture(lines,{width=1024,height=192,color='#f1e9db',background='transparent',size=48,secondaryColor=color}={}){
  const c=document.createElement('canvas');c.width=width;c.height=height;const ctx=c.getContext('2d');
  if(background!=='transparent'){ctx.fillStyle=background;ctx.fillRect(0,0,width,height);}
  ctx.textAlign='center';ctx.direction=lang==='ar'?'rtl':'ltr';ctx.fillStyle=color;
  lines.forEach((line,i)=>{ctx.fillStyle=i?secondaryColor:color;ctx.font=`${i?400:600} ${i?size*.55:size}px system-ui,sans-serif`;ctx.fillText(line,width/2,height/(lines.length+1)*(i+1)+size*.3,width-96);});
  const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.generateMipmaps=false;t.minFilter=THREE.LinearFilter;return t;
}
function guideButtonTexture(label,release=false,background='#234552'){
  const c=document.createElement('canvas');c.width=1024;c.height=256;const ctx=c.getContext('2d');
  ctx.fillStyle=release?'#44353a':background;ctx.fillRect(0,0,c.width,c.height);
  ctx.strokeStyle='#dbbc75';ctx.lineWidth=12;ctx.strokeRect(12,12,c.width-24,c.height-24);
  ctx.strokeStyle='#f2dfa9';ctx.lineWidth=2;ctx.strokeRect(29,29,c.width-58,c.height-58);
  ctx.fillStyle='#fff3d7';ctx.textAlign='center';ctx.direction=lang==='ar'?'rtl':'ltr';
  ctx.font='600 76px system-ui,sans-serif';ctx.textBaseline='middle';ctx.fillText(label,c.width/2,c.height/2,c.width-128);
  const texture=new THREE.CanvasTexture(c);texture.encoding=THREE.sRGBEncoding;
  texture.generateMipmaps=true;texture.minFilter=THREE.LinearMipmapLinearFilter;texture.magFilter=THREE.LinearFilter;
  return texture;
}
function board(texture,width,height,position,rotation=0){const m=new THREE.Mesh(new THREE.PlaneGeometry(width,height),new THREE.MeshBasicMaterial({map:texture,transparent:true,side:THREE.DoubleSide}));m.position.copy(position);m.rotation.y=rotation;scene.add(m);return m;}
function wallLabel(lines,width,height,position,rotation,options={}){
  // Real depth offset, not an overlay: the plaque covers mouldings but never renders through artworks.
  const front=position.clone().add(new THREE.Vector3(Math.sin(rotation),0,Math.cos(rotation)).multiplyScalar(.12));
  const plaque=board(labelTexture(lines,{background:'#241f1a',secondaryColor:'#c9b995',...options}),width,height,front,rotation);
  plaque.material.transparent=false;return plaque;
}
function setView(view){
  if(!rig)return;closePanel(false);
  if(renderer.xr.isPresenting){xrEntry=view;return;}
  rig.position.set(view.x,0,view.z);rig.rotation.y=0;camera.position.set(0,config.navigation.eyeHeight,0);yaw=view.yaw;pitch=0;camera.rotation.set(0,yaw,0,'YXZ');
}
function buildShell(){
  scene=new THREE.Scene();scene.background=new THREE.Color(0x3b3028);
  scene.add(new THREE.HemisphereLight(0xfff0d8,0x8a7969,1.05));const light=new THREE.DirectionalLight(0xfff4e3,.5);light.position.set(-4,9,4);scene.add(light);
  scene.add(createHubArchitecture(THREE,{artists:config.artists,maxAnisotropy:renderer.capabilities.getMaxAnisotropy()}));
  for(const artist of config.artists){
    const middle=wallPlacement(artist.zone.wall,1),q=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),middle.yaw);
    wallLabel([artist.name[lang]],6.5,.5,new THREE.Vector3(middle.x,3.78,middle.z),middle.yaw,{width:1560,height:120,size:60});
    const reserve=new THREE.Vector3(artist.guide.status==='available'?8.2:7.8,1.6,0).applyQuaternion(q).add(new THREE.Vector3(middle.x,0,middle.z));
    if(artist.guide.status==='available'){
      const labels=guideLabels(artist.artistId),target=board(guideButtonTexture(labels.call,false,artist.zone.color),1.72,.43,reserve,middle.yaw);
      target.material.transparent=false;target.name=`Hub_${artist.guide.guideId}_Call`;target.userData.guideCall=artist.guide.guideId;
      target.userData.guideColor=artist.zone.color;
      guideCallTargets.set(artist.guide.guideId,target);targets.push(target);
    }else wallLabel([copy.guide,copy.reserved],2.5,.85,reserve,middle.yaw,{width:768,height:256,size:42});
    artist.works.forEach((work,index)=>{
      const p=wallPlacement(artist.zone.wall,index),group=new THREE.Group();group.position.set(p.x,2,p.z);group.rotation.y=p.yaw;scene.add(group);
      // The supplied image already contains its frame and caption: no backing or duplicate label.
      const frame=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-.5,-.5,0),new THREE.Vector3(.5,-.5,0),new THREE.Vector3(.5,.5,0),new THREE.Vector3(-.5,.5,0)]),new THREE.LineBasicMaterial({color:new THREE.Color(0x8de2dd).convertSRGBToLinear()}));frame.position.z=.036;frame.scale.set(2.24,2.04,1);frame.visible=false;group.add(frame);
      const mesh=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,alphaTest:.01}));mesh.position.z=.034;mesh.scale.set(2.22,2.02,1);mesh.visible=false;group.add(mesh);
      const item={artist,work,group,frame,mesh};mesh.userData.item=item;targets.push(mesh);exhibits.push(item);
    });
  }
  exitTarget=board(labelTexture(['ARTDACI GEO',copy.back],{width:768,height:256,size:42,background:'#241f1a'}),HUB_EXIT.width,HUB_EXIT.height,new THREE.Vector3(HUB_EXIT.x,HUB_EXIT.y,HUB_EXIT.z),HUB_EXIT.yaw);exitTarget.name='Hub_GEO_Exit';exitTarget.userData.exit=true;targets.push(exitTarget);
}
async function loadExhibit(item){
  for(const path of [...new Set([item.work.thumbnail,item.work.imageFallback])]){
    try{
      const image=await imageCanvas(asset(path),768);if(disposed)return;
      const ratio=image.width/image.height,h=Math.min(2.1,3.45/ratio),w=h*ratio;
      const texture=new THREE.CanvasTexture(image);texture.encoding=THREE.sRGBEncoding;texture.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
      item.imagePath=path;item.mesh.material.map=texture;item.mesh.material.color.set(0xffffff);item.mesh.material.needsUpdate=true;item.mesh.scale.set(w,h,1);item.mesh.visible=true;item.frame.scale.set(w+.02,h+.02,1);imagesLoaded++;return;
    }catch{}
  }
  imageFailures++;item.mesh.material.map=labelTexture([item.work.title[lang],copy.imageFailed],{width:768,height:512,background:'#293847',size:38});item.mesh.material.needsUpdate=true;item.mesh.visible=true;
}
function configureHtml(){
  for(const artist of config.artists){
    const zone=document.createElement('button');zone.textContent=artist.name[lang];zone.dataset.artist=artist.artistId;zone.style.setProperty('--zone',artist.zone.color);zone.onclick=()=>{setView(artist.zone.view);canvas.focus({preventScroll:true});};$('hub-zones').append(zone);
    const section=document.createElement('section');section.className='hub-artist-list';section.style.setProperty('--zone',artist.zone.color);
    const h=document.createElement('h3');h.textContent=artist.name[lang];section.append(h);
    for(const work of artist.works){const b=document.createElement('button');b.className='hub-work-link';b.dataset.artwork=work.artworkId;b.textContent=work.title[lang];const small=document.createElement('span');small.textContent=work.artworkId.toUpperCase();b.append(small);b.onclick=()=>{setView(artist.zone.view);stage.scrollIntoView({block:'center'});openArtwork({artist,work});};section.append(b);}
    if(artist.guide.status==='available'){
      const labels=guideLabels(artist.artistId),button=document.createElement('button');button.id=`hub-call-${artist.artistId}`;button.className='hub-guide-call';button.style.setProperty('--guide-color',artist.zone.color);button.textContent=labels.call;button.onclick=()=>{stage.scrollIntoView({block:'center'});callGuide(artist.guide.guideId);};section.append(button);
      const status=document.createElement('small');status.id=`hub-guide-status-${artist.artistId}`;status.setAttribute('role','status');section.append(status);
    }else{const note=document.createElement('small');note.textContent=copy.guide;section.append(note);}
    $('hub-works').append(section);
  }
  for(const event of ['play','pause','ended'])audio.addEventListener(event,drawPanel);
  audio.addEventListener('error',()=>{if(selected&&media?.audioCandidates&&audio.getAttribute('src')&&audioCandidateIndex>=media.audioCandidates.length-1){mediaStatus=copy.audioFailed;drawPanel();}});
  window.addEventListener('keydown',e=>{if(e.code==='Escape'){closePanel();return;}if(/^(INPUT|TEXTAREA|SELECT|BUTTON|A)$/.test(e.target.tagName)||renderer?.xr.isPresenting)return;if(['KeyW','KeyA','KeyS','KeyD','KeyZ','KeyQ','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)){e.preventDefault();keys.add(e.code);}});
  window.addEventListener('keyup',e=>keys.delete(e.code));
  const clearInput=()=>{keys.clear();held.clear();drag=null;};window.addEventListener('blur',clearInput);document.addEventListener('visibilitychange',()=>{if(document.hidden){clearInput();audio.pause();}});
  document.querySelectorAll('[data-move]').forEach(b=>{
    b.onpointerdown=e=>{e.preventDefault();b.setPointerCapture(e.pointerId);held.set(e.pointerId,b.dataset.move);};
    for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,e=>held.delete(e.pointerId));
    b.onclick=e=>{if(e.detail===0&&ready){const d=b.dataset.move;const p=movePosition(rig.position,yaw,Number(d==='forward')-Number(d==='backward'),Number(d==='right')-Number(d==='left'),.35,config.navigation.bounds);rig.position.x=p.x;rig.position.z=p.z;}};
  });
  document.querySelectorAll('[data-turn]').forEach(b=>b.onclick=()=>{if(!renderer?.xr.isPresenting)yaw+=b.dataset.turn==='left'?Math.PI/4:-Math.PI/4;});
  $('hub-home').onclick=()=>{setView(config.navigation.entry);canvas.focus({preventScroll:true});};
  $('hub-fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await stage.parentElement.requestFullscreen();}catch{}};
}
function pointerHit(e){const r=canvas.getBoundingClientRect();pointerRay.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),camera);return pointerRay.intersectObjects(targets,false)[0];}
function highlight(items,exitActive=false,guideActive=false,callGuideId=null){for(const item of exhibits)item.frame.visible=items.has(item)&&item.mesh.visible;if(exitTarget)exitTarget.material.color.set(exitActive?0xffd88a:0xffffff);guideHandle?.setHover(guideActive);for(const [guideId,target] of guideCallTargets)target.material.color.set(callGuideId===guideId?0x9de2dd:0xffffff);}
function configurePointer(){
  canvas.onpointerdown=e=>{if(renderer.xr.isPresenting)return;canvas.focus({preventScroll:true});canvas.setPointerCapture(e.pointerId);drag={id:e.pointerId,x:e.clientX,y:e.clientY,distance:0};};
  canvas.onpointermove=e=>{if(renderer.xr.isPresenting)return;if(drag?.id===e.pointerId){const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.distance+=Math.hypot(dx,dy);yaw-=dx*.004;pitch=Math.max(-1.3,Math.min(1.3,pitch-dy*.004));drag.x=e.clientX;drag.y=e.clientY;}else{const hit=pointerHit(e);highlight(new Set(hit?.object.userData.item?[hit.object.userData.item]:[]),Boolean(hit?.object.userData.exit),Boolean(hit?.object.userData.guide),hit?.object.userData.guideCall||null);canvas.style.cursor=hit?'pointer':'grab';}};
  canvas.onpointerup=e=>{if(drag?.id===e.pointerId&&drag.distance<7){const h=pointerHit(e);if(h?.object.userData.guideCall)callGuide(h.object.userData.guideCall);else if(h?.object.userData.guide)showGuide();else if(h?.object.userData.item)openArtwork(h.object.userData.item);else if(h?.object.userData.exit)navigate(`./?lang=${lang}`);}drag=null;};
  canvas.onpointercancel=()=>drag=null;canvas.onlostpointercapture=()=>drag=null;canvas.onpointerleave=()=>highlight(new Set());
}
function controllerTarget(controller){
  const origin=new THREE.Vector3().setFromMatrixPosition(controller.matrixWorld),direction=new THREE.Vector3(0,0,-1).transformDirection(controller.matrixWorld);xrRay.set(origin,direction);
  const panelHit=xrPanel.hit(xrRay),guidePanelHit=guideXrPanel?.hit(xrRay);
  if(guidePanelHit&&(!panelHit||guidePanelHit.distance<panelHit.distance))return {...guidePanelHit,kind:'guide-panel'};
  const objects=xrRay.intersectObjects(targets,false).map(h=>({...h,kind:h.object.userData.guideCall?'guide-call':h.object.userData.guide?'guide':h.object.userData.exit?'exit':'artwork',item:h.object.userData.item,guideId:h.object.userData.guideCall||null}));
  const hit=firstHubHit(panelHit,objects);if(hit)return hit;
  const point=new THREE.Vector3(),plane=new THREE.Plane(new THREE.Vector3(0,1,0),0),b=config.navigation.bounds;
  if(direction.y<-.05&&xrRay.ray.intersectPlane(plane,point)&&point.x>=b.minX&&point.x<=b.maxX&&point.z>=b.minZ&&point.z<=b.maxZ)return {kind:'floor',point,distance:origin.distanceTo(point)};
  return null;
}
function turnRig(angle){const p=pivotRig(rig.position,head,angle);rig.position.x=p.x;rig.position.z=p.z;rig.rotation.y+=angle;rig.updateMatrixWorld(true);}
async function configureXr(){
  const button=$('hub-vr');let supported=false;try{supported=Boolean(await navigator.xr?.isSessionSupported('immersive-vr'));}catch{}
  button.disabled=!supported;button.textContent=supported?copy.vr:copy.noVr;
  for(let i=0;i<2;i++){
    const controller=renderer.xr.getController(i);rig.add(controller);controllers.push(controller);
    const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3(0,0,-1)]),new THREE.LineBasicMaterial({color:0xd6bd86}));line.visible=false;controller.add(line);
    const cursor=new THREE.Mesh(new THREE.SphereGeometry(.014,8,6),new THREE.MeshBasicMaterial({color:0x9de2dd,depthTest:false}));cursor.visible=false;cursor.renderOrder=102;scene.add(cursor);
    const marker=new THREE.Mesh(new THREE.RingGeometry(.13,.18,24),new THREE.MeshBasicMaterial({color:0x9de2dd,side:THREE.DoubleSide}));marker.rotation.x=-Math.PI/2;marker.visible=false;scene.add(marker);
    controller.userData={line,cursor,marker,active:false};
    controller.addEventListener('connected',e=>{controller.userData.active=true;controller.userData.source=e.data;turnArmed=false;});
    controller.addEventListener('disconnected',()=>{controller.userData.active=false;line.visible=cursor.visible=marker.visible=false;turnArmed=false;});
    controller.addEventListener('select',()=>{
      if(!ready||renderer.xr.getSession()?.visibilityState!=='visible')return;rig.updateMatrixWorld(true);const hit=controllerTarget(controller);
      if(hit?.kind==='guide-panel'){if(hit.action){guideUi.activate(hit.action);renderGuide();}return;}
      if(hit?.kind==='panel'){if(hit.action)runAction(hit.action);return;}
      if(hit?.kind==='guide-call'){callGuide(hit.guideId);return;}
      if(hit?.kind==='guide'){showGuide();return;}
      if(hit?.kind==='artwork'){openArtwork(hit.item);return;}
      if(hit?.kind==='exit'){navigate(`./?lang=${lang}`);return;}
      if(hit?.kind==='floor'){head.setFromMatrixPosition(renderer.xr.getCamera(camera).matrixWorld);rig.position.x+=hit.point.x-head.x;rig.position.z+=hit.point.z-head.z;}
    });
  }
  renderer.xr.addEventListener('sessionstart',()=>{keys.clear();held.clear();drag=null;turnArmed=false;xrEntry={x:rig.position.x,z:rig.position.z,yaw};camera.position.set(0,0,0);camera.rotation.set(0,0,0);button.textContent=copy.exitVr;stage.dataset.xr='true';$('hub-guide-dock').hidden=true;$('hub-artwork-dock').hidden=true;xrPanel.resetFollower();if(selected)drawPanel();if(guideUi?.visible)renderGuide();});
  renderer.xr.addEventListener('sessionend',()=>{stage.dataset.xr='false';$('hub-guide-dock').hidden=false;$('hub-artwork-dock').hidden=false;button.textContent=copy.vr;xrEntry=null;turnArmed=false;xrPanel.resetFollower();guideXrPanel.mesh.visible=false;for(const c of controllers)c.userData.line.visible=c.userData.cursor.visible=c.userData.marker.visible=false;setView(config.navigation.entry);resize();});
  button.onclick=async()=>{try{if(renderer.xr.isPresenting){await renderer.xr.getSession().end();return;}const session=await navigator.xr.requestSession('immersive-vr',{requiredFeatures:['local-floor']});try{await renderer.xr.setSession(session);}catch(e){await session.end();throw e;}}catch{button.textContent=copy.xrError;}};
}
function navigateXr(dt,frame){
  const session=renderer.xr.getSession();if(session.visibilityState!=='visible'||!frame?.getViewerPose(renderer.xr.getReferenceSpace())){turnArmed=false;return;}
  rig.updateMatrixWorld(true);let cam=renderer.xr.getCamera(camera);head.setFromMatrixPosition(cam.matrixWorld);look.set(0,0,-1).transformDirection(cam.matrixWorld);
  if(xrEntry){turnRig(xrEntry.yaw-Math.atan2(-look.x,-look.z));rig.position.x+=xrEntry.x-head.x;rig.position.z+=xrEntry.z-head.z;xrEntry=null;}
  const {left,right}=readHubSticks(session.inputSources),turn=snapTurn(right.x,turnArmed);turnArmed=turn.armed;if(turn.angle)turnRig(turn.angle);
  cam=renderer.xr.getCamera(camera);head.setFromMatrixPosition(cam.matrixWorld);look.set(0,0,-1).transformDirection(cam.matrixWorld);if(Math.hypot(look.x,look.z)>.1)yaw=Math.atan2(-look.x,-look.z);
  const forward=-deadZone(left.y),side=deadZone(left.x);
  if(forward||side){const p=movePosition(head,yaw,forward,side,dt*config.navigation.xrSpeed,config.navigation.bounds);rig.position.x+=p.x-head.x;rig.position.z+=p.z-head.z;}
  rig.updateMatrixWorld(true);
  if(selected&&xrPanel.mesh.visible)xrPanel.placeBodyLocked(renderer.xr.getCamera(camera).matrixWorld);
  if(guideUi?.visible&&guideHandle)guideXrPanel.placeAbove(guideHandle.headPosition(guideHead),renderer.xr.getCamera(camera).matrixWorld);
  const hovered=new Set();let panelHover=null,guidePanelHover=null,exitHover=false,guideHover=false,callHover=null;
  for(const c of controllers){const d=c.userData;d.line.visible=d.active;d.cursor.visible=d.marker.visible=false;if(!d.active)continue;const h=controllerTarget(c);d.line.scale.z=h?Math.max(.02,h.distance):5;d.line.material.color.set(h?0x9de2dd:0xd6bd86);if(!h)continue;
    if(h.kind==='floor'){d.marker.position.copy(h.point);d.marker.position.y=.018;d.marker.visible=true;}
    else{d.cursor.visible=true;d.cursor.position.copy(h.point);if(h.kind==='exit')exitHover=true;if(h.kind==='guide')guideHover=true;if(h.kind==='guide-call')callHover=h.guideId;if(h.item)hovered.add(h.item);if(h.kind==='panel'&&h.action)panelHover=h.action;if(h.kind==='guide-panel'&&h.action)guidePanelHover=h.action;}
  }
  highlight(hovered,exitHover,guideHover,callHover);xrPanel.setHover(panelHover);guideXrPanel?.setHover(guidePanelHover);
}
function resize(){if(!renderer||renderer.xr.isPresenting)return;renderer.setSize(stage.clientWidth,stage.clientHeight,false);camera.aspect=stage.clientWidth/stage.clientHeight;camera.updateProjectionMatrix();}
function render(time,frame){
  if(disposed)return;const dt=Math.min(.05,Math.max(0,(time-lastTime)/1000));lastTime=time;
  if(ready&&!renderer.xr.isPresenting&&!document.hidden){
    const h=new Set(held.values()),keyboard=readHubKeyboard(keys);
    const forward=keyboard.forward+Number(h.has('forward'))-Number(h.has('backward'));
    const side=keyboard.side+Number(h.has('right'))-Number(h.has('left'));
    const p=movePosition(rig.position,yaw,forward,side,dt*config.navigation.speed,config.navigation.bounds);rig.position.x=p.x;rig.position.z=p.z;camera.rotation.set(pitch,yaw,0,'YXZ');
  }
  if(ready&&renderer.xr.isPresenting)navigateXr(dt,frame);
  if(ready&&!renderer.xr.isPresenting&&guideUi?.visible)positionGuideBubble();
  if(ready&&!renderer.xr.isPresenting&&selected)positionArtworkBubble();
  if(!document.hidden||renderer.xr.isPresenting)renderer.render(scene,camera);
  frameCount++;
  if(time-lastMetrics>1000){stage.dataset.metrics=JSON.stringify({fps:Math.round(frameCount*1000/Math.max(1,time-metricStart)),calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,textures:renderer.info.memory.textures,imagesLoaded,imageFailures,readyMs:Math.round(firstReadyTime),guidesLoaded:guideEngine?.snapshot().guidesLoaded||0,artworkModelsLoaded:artworkExperience?.snapshot().artworkModelsLoaded||0});stage.dataset.pose=JSON.stringify({x:rig.position.x,z:rig.position.z,yaw,pitch});frameCount=0;metricStart=time;lastMetrics=time;}
}
async function init(){
  const started=performance.now(),guideFiles=['leonardo-hub-guide.json','vermeer-hub-guide.json','vangogh-hub-guide.json','monet-hub-guide.json'];
  const fresh=url=>fetch(url,{cache:'no-store'});
  const [c,k,n,...guideResponses]=await Promise.all([fresh(new URL('../data/masters-hub.json',import.meta.url)),fresh(new URL('content/media-manifests/catalog.json',rootUrl)),fresh(new URL('../data/masters-hub-notices.json',import.meta.url)),...guideFiles.map(file=>fresh(new URL(`../data/guides/${file}`,import.meta.url)))]);
  if(!c.ok||!k.ok||!n.ok||guideResponses.some(response=>!response.ok))throw new Error('Hub configuration unavailable');
  config=await c.json();notices=await n.json();const catalog=await k.json();guideConfigs=await Promise.all(guideResponses.map(response=>response.json()));
  const errors=[...validateHub(config,catalog),...validatePrintedNotices(notices,config.artists.flatMap(artist=>artist.works.map(work=>work.artworkId)))];
  for(const artist of config.artists){const guide=guideConfigs.find(item=>item.guideId===artist.guide.guideId);errors.push(...validateArtistGuideConfig(guide,{artist,knownArtworkIds:artist.works.map(work=>work.artworkId)}));}
  if(errors.length)throw new Error(errors.join('; '));
  for(const guide of guideConfigs)if(guide.model.status==='available')guideTransforms.set(guide.guideId,{...guide.transform});
  artworkExperience=createArtworkExperience({catalog,artists:config.artists,language:lang,rootUrl,onCloseMedia:stopAudio});
  stage.dataset.guidesLoaded='0';stage.dataset.artworkModelsLoaded='0';configureHtml();
  try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false});}catch{$('hub-status').textContent=copy.failed;return;}
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputEncoding=THREE.sRGBEncoding;renderer.xr.enabled=true;renderer.xr.setReferenceSpaceType('local-floor');
  buildShell();camera=new THREE.PerspectiveCamera(65,1,.05,60);rig=new THREE.Group();rig.add(camera);scene.add(rig);setView(config.navigation.entry);
  decoder=new DRACOLoader().setDecoderPath(new URL('../../vendor/draco/',import.meta.url).href).setWorkerLimit(2);
  const loader=new GLTFLoader().setDRACOLoader(decoder);
  guideEngine=createArtistGuideEngine({configs:guideConfigs,
    loadModel:async(descriptor,{id})=>{const gltf=await loader.loadAsync(asset(descriptor.path));const handle=createGuideModelHandle(THREE,gltf.scene);handle.apply(guideTransforms.get(id));return handle;},
    onModelReady:(handle,guide)=>{handle.apply(guideTransforms.get(guide.guideId));handle.proxy.userData.guideId=guide.guideId;handle.mount(scene);guideHandle=handle;targets.push(handle.proxy);},
    disposeModel:handle=>{const index=targets.indexOf(handle.proxy);if(index>=0)targets.splice(index,1);handle.dispose();if(guideHandle===handle)guideHandle=null;},
    onCloseMedia:stopAudio,
    workTitle:(id,language)=>config.artists.flatMap(artist=>artist.works).find(work=>work.artworkId===id)?.title[language]||id
  });
  guideUi=createArtistGuideUi({element:$('hub-guide-panel'),engine:guideEngine,language:lang,onArtwork:openGuideArtwork,onNavigate:navigate,onClose:()=>{guideXrPanel.mesh.visible=false;syncGuideState();}});
  xrPanel=createHubXrPanel(THREE,lang,{bubble:true,showStatus:true});rig.add(xrPanel.mesh);
  guideXrPanel=createArtistGuideXrPanel(THREE,lang);scene.add(guideXrPanel.mesh);
  if(guideQaId){const qaGuide=guideConfigs.find(item=>item.guideId===guideQaId),qaArtist=config.artists.find(item=>item.artistId===qaGuide?.artistId);guideQa=createGuideQa({stage,label:qaArtist?.name[lang]||guideQaSlug,initial:guideTransforms.get(guideQaId),onChange:transform=>{guideTransforms.set(guideQaId,transform);if(guideEngine.snapshot().guideId===guideQaId)guideHandle?.apply(transform);}});}
  syncGuideState();observer=new ResizeObserver(resize);observer.observe(stage);resize();configurePointer();await configureXr();ready=true;renderer.setAnimationLoop(render);
  if(guideDeepLinkId){
    const deepGuide=guideConfigs.find(item=>item.guideId===guideDeepLinkId);
    const deepArtist=config.artists.find(item=>item.artistId===deepGuide?.artistId);
    if(deepArtist){
      setView(deepArtist.zone.view);
      stage.scrollIntoView({block:'center'});
      await callGuide(guideDeepLinkId);
    }
  }
  const queue=[...exhibits];await Promise.all(Array.from({length:3},async()=>{while(queue.length&&!disposed)await loadExhibit(queue.shift());}));
  if(disposed)return;firstReadyTime=performance.now()-started;stage.dataset.ready='true';
  stage.dataset.startupResources=JSON.stringify(performance.getEntriesByType('resource').map(r=>({url:r.name,bytes:r.encodedBodySize})));
  stage.dataset.artworkImages=JSON.stringify(exhibits.map(item=>({id:item.work.artworkId,path:item.imagePath||null})));
  $('hub-status').textContent=copy.ready+(imageFailures?` · ${imageFailures} ${copy.imageFailed}`:'');
}
function dispose(){
  if(disposed)return;disposed=true;ready=false;selection.next();detailGate.next();guideEngine?.dispose();artworkExperience?.dispose();stopAudio();clearDetail();guideQa?.remove();observer?.disconnect();renderer?.setAnimationLoop(null);renderer?.xr.getSession()?.end().catch(()=>{});
  const textures=new Set(),geometries=new Set(),materials=new Set();scene?.traverse(o=>{if(o.geometry)geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:o.material?[o.material]:[]){materials.add(m);if(m.map)textures.add(m.map);}});
  for(const t of textures)t.dispose();for(const g of geometries)g.dispose();for(const m of materials)m.dispose();renderer?.dispose();decoder?.dispose();
}
window.addEventListener('pagehide',dispose);window.addEventListener('pageshow',e=>{if(e.persisted)location.reload();});
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();$('hub-status').textContent=copy.failed;ready=false;});
init().catch(error=>{$('hub-status').textContent=copy.failed;console.error('Masters Hub:',error);});
