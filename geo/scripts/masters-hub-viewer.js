import * as THREE from 'three';
import {languageFromSearch} from './geo-core.mjs';
import {movePosition,pivotRig,snapTurn,deadZone} from './room-navigation.mjs';
import {HUB_COPY,validateHub,resolveHubMedia,artworkActions,loadHubManifest,wallPlacement,readHubSticks,createSelectionGate,firstHubHit} from './masters-hub-core.mjs';
import {createHubXrPanel} from './masters-hub-panel.mjs';

const lang=languageFromSearch(location.search),copy=HUB_COPY[lang],rootUrl=new URL('../../',import.meta.url);
const $=id=>document.getElementById(id),stage=$('hub-stage'),canvas=$('hub-canvas'),panel=$('hub-panel'),audio=$('hub-audio');
document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr';
document.title=`ARTDACI Masters Hub — ${copy.subtitle}`;
document.querySelectorAll('[data-copy]').forEach(el=>el.textContent=copy[el.dataset.copy]);
document.querySelectorAll('[data-label]').forEach(el=>el.setAttribute('aria-label',copy[el.dataset.label]));
document.querySelectorAll('[data-lang]').forEach(el=>{el.href=`masters-hub.html?lang=${el.dataset.lang}`;el.setAttribute('aria-current',el.dataset.lang===lang?'page':'false');});
$('geo-return').textContent=copy.back;
for(const id of ['geo-return','footer-return'])$(id).href=`./?lang=${lang}`;

let config,scene,renderer,camera,rig,xrPanel,observer,disposed=false,ready=false;
let yaw=0,pitch=0,lastTime=0,turnArmed=false,xrEntry=null,needsPanelPlacement=false;
let selected=null,media=null,panelView='menu',mediaStatus='',detailImage=null,detailUrl=null,lastFocus=null;
let imagesLoaded=0,imageFailures=0,firstReadyTime=0,frameCount=0,metricStart=0,lastMetrics=0;
const exhibits=[],targets=[],controllers=[],keys=new Set(),held=new Map(),selection=createSelectionGate(),detailGate=createSelectionGate(),manifestCache=new Map();
const pointerRay=new THREE.Raycaster(),xrRay=new THREE.Raycaster(),head=new THREE.Vector3(),look=new THREE.Vector3();
let drag=null;

function asset(path){return /^https?:/.test(path)?path:new URL(path,rootUrl).href;}
function stopAudio(){audio.pause();audio.removeAttribute('src');audio.load();}
function clearDetail(){if(detailUrl)URL.revokeObjectURL(detailUrl);detailUrl=null;$('hub-detail').removeAttribute('src');if(detailImage){detailImage.width=1;detailImage.height=1;}detailImage=null;}
function closePanel(focus=true){
  selection.next();detailGate.next();stopAudio();clearDetail();selected=null;media=null;panel.hidden=true;stage.dataset.panel='false';
  if(xrPanel){xrPanel.mesh.visible=false;xrPanel.setHover(null);}
  if(focus&&lastFocus?.isConnected)lastFocus.focus({preventScroll:true});
}
function drawPanel(){
  if(!selected)return;
  const work=selected.work,actions=artworkActions(media,lang,!audio.paused);
  const description=panelView==='about'?work.description[lang]:panelView==='museum'?copy.museumNote:panelView==='image'?'':copy.choose;
  $('hub-panel-title').textContent=work.title[lang];$('hub-panel-artist').textContent=selected.artist.name[lang];
  $('hub-panel-description').textContent=description;$('hub-media-status').textContent=mediaStatus;
  $('hub-detail').hidden=panelView!=='image'||!detailUrl;$('hub-detail').alt=work.title[lang];
  const focused=document.activeElement?.dataset?.action;
  $('hub-actions').replaceChildren(...actions.map(action=>{const b=document.createElement('button');b.dataset.action=action.id;b.textContent=action.label;b.addEventListener('click',()=>runAction(action.id));return b;}));
  if(focused)$('hub-actions').querySelector(`[data-action="${focused}"]`)?.focus({preventScroll:true});
  panel.hidden=false;stage.dataset.panel='true';
  if(xrPanel){xrPanel.draw({title:work.title[lang],artist:selected.artist.name[lang],description,image:panelView==='image'?detailImage:null,status:mediaStatus,actions});xrPanel.mesh.visible=Boolean(renderer?.xr.isPresenting);}
}
async function openArtwork(item){
  closePanel(false);lastFocus=document.activeElement;selected=item;panelView='menu';mediaStatus=copy.mediaLoading;
  media=resolveHubMedia(item.work,null,lang);const token=selection.next();drawPanel();needsPanelPlacement=true;
  if(!renderer?.xr.isPresenting)$('hub-panel-title').focus({preventScroll:true});
  if(!manifestCache.has(item.work.artworkId))manifestCache.set(item.work.artworkId,loadHubManifest(item.work.artworkId,{rootUrl}));
  const manifest=await manifestCache.get(item.work.artworkId);
  if(!selection.current(token))return;
  media=resolveHubMedia(item.work,manifest,lang);mediaStatus=manifest?'':copy.mediaFailed;drawPanel();
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
  const token=detailGate.next();
  for(const path of media.imageCandidates){
    try{
      const image=await imageCanvas(asset(path),1536);
      if(!detailGate.current(token)){image.width=1;return;}
      const blob=await new Promise(resolve=>image.toBlob(resolve,'image/jpeg',.9));
      if(!detailGate.current(token)){image.width=1;return;}
      if(!blob)throw new Error('Image conversion failed');
      detailImage=image;detailUrl=URL.createObjectURL(blob);$('hub-detail').src=detailUrl;mediaStatus='';drawPanel();return;
    }catch{}
  }
  if(detailGate.current(token)){mediaStatus=copy.imageFailed;drawPanel();}
}
async function navigate(url){stopAudio();try{await renderer?.xr.getSession()?.end();}catch{}location.assign(url);}
async function runAction(action){
  if(!selected)return;
  if(action==='return'){closePanel();return;}
  if(action==='about'){panelView='about';mediaStatus='';drawPanel();return;}
  if(action==='image'){await showDetail();return;}
  if(action==='audio'&&media.audio){
    if(!audio.paused){audio.pause();return;}
    if(audio.getAttribute('src')!==media.audio)audio.src=media.audio;
    const playingSelection=selected;
    mediaStatus='';try{await audio.play();}catch(error){if(selected===playingSelection&&error.name!=='AbortError'){mediaStatus=copy.audioFailed;drawPanel();}}return;
  }
  if(action==='museum'&&media.museum)await navigate(media.museum);
}

function labelTexture(lines,{width=1024,height=192,color='#f1e9db',background='transparent',size=48}={}){
  const c=document.createElement('canvas');c.width=width;c.height=height;const ctx=c.getContext('2d');
  if(background!=='transparent'){ctx.fillStyle=background;ctx.fillRect(0,0,width,height);}
  ctx.textAlign='center';ctx.direction=lang==='ar'?'rtl':'ltr';ctx.fillStyle=color;
  lines.forEach((line,i)=>{ctx.font=`${i?size*.55:size}px system-ui,sans-serif`;ctx.fillText(line,width/2,height/(lines.length+1)*(i+1)+size*.3,width-32);});
  const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.generateMipmaps=false;t.minFilter=THREE.LinearFilter;return t;
}
function board(texture,width,height,position,rotation=0){const m=new THREE.Mesh(new THREE.PlaneGeometry(width,height),new THREE.MeshBasicMaterial({map:texture,transparent:true,side:THREE.DoubleSide}));m.position.copy(position);m.rotation.y=rotation;scene.add(m);return m;}
function box(w,h,d,color,x,y,z){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshLambertMaterial({color}));m.position.set(x,y,z);scene.add(m);return m;}
function setView(view){
  if(!rig)return;closePanel(false);
  if(renderer.xr.isPresenting){xrEntry=view;return;}
  rig.position.set(view.x,0,view.z);rig.rotation.y=0;camera.position.set(0,config.navigation.eyeHeight,0);yaw=view.yaw;pitch=0;camera.rotation.set(0,yaw,0,'YXZ');
}
function buildShell(){
  scene=new THREE.Scene();scene.background=new THREE.Color(0x25313d);
  scene.add(new THREE.HemisphereLight(0xfff5dd,0x8a949d,1.05));const light=new THREE.DirectionalLight(0xffffff,.5);light.position.set(-4,9,4);scene.add(light);
  box(20,.16,20,0xd3cdc0,0,-.08,0);
  const walls={north:[20,4.5,.18,0,2.25,-9.92],south:[20,4.5,.18,0,2.25,9.92],east:[.18,4.5,20,9.92,2.25,0],west:[.18,4.5,20,-9.92,2.25,0]};
  for(const artist of config.artists){const [w,h,d,x,y,z]=walls[artist.zone.wall];box(w,h,d,artist.zone.color,x,y,z);}
  // Procedural architecture: no museum reconstruction or external room model.
  box(20,.16,20,0xe9e4d9,0,4.5,0);
  for(const x of [-7,-3.5,0,3.5,7])box(.10,.13,19.8,0xb7af9e,x,4.38,0);
  for(const z of [-6,0,6]){const strip=new THREE.Mesh(new THREE.PlaneGeometry(14,2),new THREE.MeshBasicMaterial({color:0xf4f9f5,side:THREE.DoubleSide}));strip.rotation.x=Math.PI/2;strip.position.set(0,4.39,z);scene.add(strip);}
  const centre=new THREE.Mesh(new THREE.RingGeometry(1.8,1.83,64),new THREE.MeshBasicMaterial({color:0x9a865f,side:THREE.DoubleSide}));centre.rotation.x=-Math.PI/2;centre.position.y=.012;scene.add(centre);
  for(const artist of config.artists){
    const middle=wallPlacement(artist.zone.wall,1),q=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),middle.yaw);
    board(labelTexture([artist.name[lang]],{size:58}),10,.65,new THREE.Vector3(middle.x,3.9,middle.z),middle.yaw);
    const reserve=new THREE.Vector3(7.8,1.6,0).applyQuaternion(q).add(new THREE.Vector3(middle.x,0,middle.z));
    board(labelTexture([copy.guide,copy.reserved],{width:768,height:256,size:42}),2.5,.85,reserve,middle.yaw);
    artist.works.forEach((work,index)=>{
      const p=wallPlacement(artist.zone.wall,index),group=new THREE.Group();group.position.set(p.x,2,p.z);group.rotation.y=p.yaw;scene.add(group);
      const frame=new THREE.Mesh(new THREE.BoxGeometry(1,1,.055),new THREE.MeshBasicMaterial({color:0xc6aa72}));frame.scale.set(2.35,2.15,1);group.add(frame);
      const mesh=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({color:0xe5dfd2}));mesh.position.z=.034;mesh.scale.set(2.22,2.02,1);group.add(mesh);
      const item={artist,work,group,frame,mesh};mesh.userData.item=item;targets.push(mesh);exhibits.push(item);
      board(labelTexture([work.title[lang],work.artworkId.toUpperCase()],{size:40}),3.9,.6,new THREE.Vector3(p.x,.58,p.z),p.yaw);
    });
  }
  const exit=board(labelTexture(['ARTDACI GEO',copy.back],{width:768,height:256,size:42,background:'#17212d'}),1.55,.52,new THREE.Vector3(0,1.3,8.3),Math.PI);exit.userData.exit=true;targets.push(exit);
}
async function loadExhibit(item){
  for(const path of [...new Set([item.work.thumbnail,item.work.imageFallback])]){
    try{
      const image=await imageCanvas(asset(path),768);if(disposed)return;
      const ratio=image.width/image.height,h=Math.min(2.1,3.45/ratio),w=h*ratio;
      const texture=new THREE.CanvasTexture(image);texture.encoding=THREE.sRGBEncoding;texture.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
      item.mesh.material.map=texture;item.mesh.material.color.set(0xffffff);item.mesh.material.needsUpdate=true;item.mesh.scale.set(w,h,1);item.frame.scale.set(w+.13,h+.13,1);imagesLoaded++;return;
    }catch{}
  }
  imageFailures++;item.mesh.material.map=labelTexture([item.work.title[lang],copy.imageFailed],{width:768,height:512,background:'#293847',size:38});item.mesh.material.needsUpdate=true;
}
function configureHtml(){
  for(const artist of config.artists){
    const zone=document.createElement('button');zone.textContent=artist.name[lang];zone.dataset.artist=artist.artistId;zone.style.setProperty('--zone',artist.zone.color);zone.onclick=()=>setView(artist.zone.view);$('hub-zones').append(zone);
    const section=document.createElement('section');section.className='hub-artist-list';section.style.setProperty('--zone',artist.zone.color);
    const h=document.createElement('h3');h.textContent=artist.name[lang];section.append(h);
    for(const work of artist.works){const b=document.createElement('button');b.className='hub-work-link';b.dataset.artwork=work.artworkId;b.textContent=work.title[lang];const small=document.createElement('span');small.textContent=work.artworkId.toUpperCase();b.append(small);b.onclick=()=>{setView(artist.zone.view);stage.scrollIntoView({block:'center'});openArtwork({artist,work});};section.append(b);}
    const note=document.createElement('small');note.textContent=copy.guide;section.append(note);$('hub-works').append(section);
  }
  for(const event of ['play','pause','ended'])audio.addEventListener(event,drawPanel);
  audio.addEventListener('error',()=>{if(selected&&audio.getAttribute('src')){mediaStatus=copy.audioFailed;drawPanel();}});
  window.addEventListener('keydown',e=>{if(e.code==='Escape'){closePanel();return;}if(/INPUT|TEXTAREA|SELECT|BUTTON|A/.test(e.target.tagName)||renderer?.xr.isPresenting)return;if(['KeyW','KeyA','KeyS','KeyD','KeyZ','KeyQ','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)){e.preventDefault();keys.add(e.code);}});
  window.addEventListener('keyup',e=>keys.delete(e.code));
  const clearInput=()=>{keys.clear();held.clear();drag=null;};window.addEventListener('blur',clearInput);document.addEventListener('visibilitychange',()=>{if(document.hidden){clearInput();audio.pause();}});
  document.querySelectorAll('[data-move]').forEach(b=>{
    b.onpointerdown=e=>{e.preventDefault();b.setPointerCapture(e.pointerId);held.set(e.pointerId,b.dataset.move);};
    for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,e=>held.delete(e.pointerId));
    b.onclick=e=>{if(e.detail===0&&ready){const d=b.dataset.move;const p=movePosition(rig.position,yaw,Number(d==='forward')-Number(d==='backward'),Number(d==='right')-Number(d==='left'),.35,config.navigation.bounds);rig.position.x=p.x;rig.position.z=p.z;}};
  });
  document.querySelectorAll('[data-turn]').forEach(b=>b.onclick=()=>{if(!renderer?.xr.isPresenting)yaw+=b.dataset.turn==='left'?Math.PI/4:-Math.PI/4;});
  $('hub-home').onclick=()=>setView(config.navigation.entry);
  $('hub-fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await stage.requestFullscreen();}catch{}};
}
function pointerHit(e){const r=canvas.getBoundingClientRect();pointerRay.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),camera);return pointerRay.intersectObjects(targets,false)[0];}
function highlight(items){for(const item of exhibits)item.frame.material.color.set(items.has(item)?0x8de2dd:0xc6aa72);}
function configurePointer(){
  canvas.onpointerdown=e=>{if(renderer.xr.isPresenting)return;canvas.focus({preventScroll:true});canvas.setPointerCapture(e.pointerId);drag={id:e.pointerId,x:e.clientX,y:e.clientY,distance:0};};
  canvas.onpointermove=e=>{if(renderer.xr.isPresenting)return;if(drag?.id===e.pointerId){const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.distance+=Math.hypot(dx,dy);yaw-=dx*.004;pitch=Math.max(-1.3,Math.min(1.3,pitch-dy*.004));drag.x=e.clientX;drag.y=e.clientY;}else{const hit=pointerHit(e);highlight(new Set(hit?.object.userData.item?[hit.object.userData.item]:[]));canvas.style.cursor=hit?'pointer':'grab';}};
  canvas.onpointerup=e=>{if(drag?.id===e.pointerId&&drag.distance<7){const h=pointerHit(e);if(h?.object.userData.item)openArtwork(h.object.userData.item);else if(h?.object.userData.exit)navigate(`./?lang=${lang}`);}drag=null;};
  canvas.onpointercancel=()=>drag=null;canvas.onlostpointercapture=()=>drag=null;canvas.onpointerleave=()=>highlight(new Set());
}
function controllerTarget(controller){
  const origin=new THREE.Vector3().setFromMatrixPosition(controller.matrixWorld),direction=new THREE.Vector3(0,0,-1).transformDirection(controller.matrixWorld);xrRay.set(origin,direction);
  const panelHit=xrPanel.hit(xrRay),objects=xrRay.intersectObjects(targets,false).map(h=>({...h,kind:h.object.userData.exit?'exit':'artwork',item:h.object.userData.item}));
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
      if(hit?.kind==='panel'){if(hit.action)runAction(hit.action);return;}
      if(hit?.kind==='artwork'){openArtwork(hit.item);return;}
      if(hit?.kind==='exit'){navigate(`./?lang=${lang}`);return;}
      if(hit?.kind==='floor'){head.setFromMatrixPosition(renderer.xr.getCamera(camera).matrixWorld);rig.position.x+=hit.point.x-head.x;rig.position.z+=hit.point.z-head.z;}
    });
  }
  renderer.xr.addEventListener('sessionstart',()=>{keys.clear();held.clear();drag=null;turnArmed=false;xrEntry={x:rig.position.x,z:rig.position.z,yaw};camera.position.set(0,0,0);camera.rotation.set(0,0,0);button.textContent=copy.exitVr;stage.dataset.xr='true';if(selected){drawPanel();needsPanelPlacement=true;}});
  renderer.xr.addEventListener('sessionend',()=>{stage.dataset.xr='false';button.textContent=copy.vr;xrEntry=null;turnArmed=false;for(const c of controllers)c.userData.line.visible=c.userData.cursor.visible=c.userData.marker.visible=false;setView(config.navigation.entry);resize();});
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
  if(needsPanelPlacement&&selected){xrPanel.place(renderer.xr.getCamera(camera).matrixWorld);needsPanelPlacement=false;}
  const hovered=new Set();let panelHover=null;
  for(const c of controllers){const d=c.userData;d.line.visible=d.active;d.cursor.visible=d.marker.visible=false;if(!d.active)continue;const h=controllerTarget(c);d.line.scale.z=h?Math.max(.02,h.distance):5;d.line.material.color.set(h?0x9de2dd:0xd6bd86);if(!h)continue;
    if(h.kind==='floor'){d.marker.position.copy(h.point);d.marker.position.y=.018;d.marker.visible=true;}
    else{d.cursor.visible=true;d.cursor.position.copy(h.point);if(h.item)hovered.add(h.item);if(h.kind==='panel'&&h.action)panelHover=h.action;}
  }
  highlight(hovered);xrPanel.setHover(panelHover);
}
function resize(){if(!renderer||renderer.xr.isPresenting)return;renderer.setSize(stage.clientWidth,stage.clientHeight,false);camera.aspect=stage.clientWidth/stage.clientHeight;camera.updateProjectionMatrix();}
function render(time,frame){
  if(disposed)return;const dt=Math.min(.05,Math.max(0,(time-lastTime)/1000));lastTime=time;
  if(ready&&!renderer.xr.isPresenting&&!document.hidden){
    const h=new Set(held.values()),forward=Number(keys.has('KeyW')||keys.has('KeyZ')||keys.has('ArrowUp')||h.has('forward'))-Number(keys.has('KeyS')||keys.has('ArrowDown')||h.has('backward'));
    const side=Number(keys.has('KeyD')||h.has('right'))-Number(keys.has('KeyA')||keys.has('KeyQ')||h.has('left'));
    yaw+=(Number(keys.has('ArrowLeft'))-Number(keys.has('ArrowRight')))*dt*1.5;const p=movePosition(rig.position,yaw,forward,side,dt*config.navigation.speed,config.navigation.bounds);rig.position.x=p.x;rig.position.z=p.z;camera.rotation.set(pitch,yaw,0,'YXZ');
  }
  if(ready&&renderer.xr.isPresenting)navigateXr(dt,frame);
  if(!document.hidden||renderer.xr.isPresenting)renderer.render(scene,camera);
  frameCount++;
  if(time-lastMetrics>1000){stage.dataset.metrics=JSON.stringify({fps:Math.round(frameCount*1000/Math.max(1,time-metricStart)),calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,textures:renderer.info.memory.textures,imagesLoaded,imageFailures,readyMs:Math.round(firstReadyTime)});stage.dataset.pose=JSON.stringify({x:rig.position.x,z:rig.position.z,yaw,pitch});frameCount=0;metricStart=time;lastMetrics=time;}
}
async function init(){
  const started=performance.now();const [c,k]=await Promise.all([fetch(new URL('../data/masters-hub.json',import.meta.url)),fetch(new URL('content/media-manifests/catalog.json',rootUrl))]);
  if(!c.ok||!k.ok)throw new Error('Hub configuration unavailable');config=await c.json();const errors=validateHub(config,await k.json());if(errors.length)throw new Error(errors.join('; '));configureHtml();
  try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false});}catch{$('hub-status').textContent=copy.failed;return;}
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputEncoding=THREE.sRGBEncoding;renderer.xr.enabled=true;renderer.xr.setReferenceSpaceType('local-floor');
  buildShell();camera=new THREE.PerspectiveCamera(65,1,.05,60);rig=new THREE.Group();rig.add(camera);scene.add(rig);setView(config.navigation.entry);
  xrPanel=createHubXrPanel(THREE,lang);scene.add(xrPanel.mesh);observer=new ResizeObserver(resize);observer.observe(stage);resize();configurePointer();await configureXr();ready=true;renderer.setAnimationLoop(render);
  const queue=[...exhibits];await Promise.all(Array.from({length:3},async()=>{while(queue.length&&!disposed)await loadExhibit(queue.shift());}));
  if(disposed)return;firstReadyTime=performance.now()-started;stage.dataset.ready='true';
  stage.dataset.startupResources=JSON.stringify(performance.getEntriesByType('resource').map(r=>({url:r.name,bytes:r.encodedBodySize})));
  $('hub-status').textContent=copy.ready+(imageFailures?` · ${imageFailures} ${copy.imageFailed}`:'');
}
function dispose(){
  if(disposed)return;disposed=true;ready=false;selection.next();detailGate.next();stopAudio();clearDetail();observer?.disconnect();renderer?.setAnimationLoop(null);renderer?.xr.getSession()?.end().catch(()=>{});
  const textures=new Set(),geometries=new Set(),materials=new Set();scene?.traverse(o=>{if(o.geometry)geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:o.material?[o.material]:[]){materials.add(m);if(m.map)textures.add(m.map);}});
  for(const t of textures)t.dispose();for(const g of geometries)g.dispose();for(const m of materials)m.dispose();renderer?.dispose();
}
window.addEventListener('pagehide',dispose);window.addEventListener('pageshow',e=>{if(e.persisted)location.reload();});
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();$('hub-status').textContent=copy.failed;ready=false;});
init().catch(error=>{$('hub-status').textContent=copy.failed;console.error('Masters Hub:',error);});
