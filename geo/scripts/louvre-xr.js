import * as THREE from '../../vendor/three.module.js';
import {GLTFLoader} from '../../vendor/GLTFLoader.module.js';
import {DRACOLoader} from '../../vendor/DRACOLoader.module.js';
import {languageFromSearch,withLanguage,modelVariantCandidates,modelCandidateUrl} from './geo-core.mjs';
import {controllerRayScale} from './room-xr-panel.mjs?v=6-8-2';
import {readStick,deadZone,pivotRig,snapTurn} from './room-navigation.mjs?v=3';
import {JOURNEY_COPY,createJourney,createJourneyPortal,readJourneyState,writeJourneyState,validExteriorView,journeyStorage,exteriorWalk} from './journey.mjs?v=6-9-2';

const language=languageFromSearch(location.search),copy=JOURNEY_COPY[language];
document.documentElement.lang=language;document.documentElement.dir=language==='ar'?'rtl':'ltr';
const stage=document.getElementById('exterior-stage'),canvas=document.getElementById('room-canvas'),status=document.getElementById('exterior-status');
const vrButton=document.getElementById('exterior-vr'),retry=document.getElementById('exterior-retry');
document.getElementById('journey-note').textContent=copy.note;
document.getElementById('museum-enter').textContent=copy.enter;
document.getElementById('remote-back').href=withLanguage('remote.html',language);
document.getElementById('exterior-reset').textContent=copy.overview;retry.textContent=copy.retry;
const renderer=new THREE.WebGLRenderer({canvas,antialias:true});renderer.outputEncoding=THREE.sRGBEncoding;
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.xr.enabled=true;renderer.xr.setReferenceSpaceType('local-floor');
const scene=new THREE.Scene();scene.background=new THREE.Color('#24282e');
const camera=new THREE.PerspectiveCamera(50,1,.05,100),rig=new THREE.Group();rig.position.z=6;rig.add(camera);scene.add(rig);
scene.add(new THREE.HemisphereLight(0xffffff,0x555566,1.3));const sun=new THREE.DirectionalLight(0xffffff,1);sun.position.set(3,8,4);scene.add(sun);
const decoder=new DRACOLoader().setDecoderPath(new URL('../../vendor/draco/',import.meta.url).href).setWorkerLimit(2);
const loader=new GLTFLoader().setDRACOLoader(decoder),ray=new THREE.Raycaster();
let model=null,disposed=false,loading=false,ready=false,supported=false,drag=null,lastFrameTime=0,turnArmed=false;
const walkBounds={minX:-8,maxX:8,minZ:1.5,maxZ:12};
const storage=journeyStorage(),stored=validExteriorView(readJourneyState(storage,'xr-view'));
let view=stored || {theta:0,phi:1.15,radius:9,fov:50};
function disposeModel(root){const geometries=new Set(),materials=new Set(),textures=new Set();root?.traverse(node=>{if(node.geometry)geometries.add(node.geometry);for(const material of [node.material].flat().filter(Boolean)){materials.add(material);for(const value of Object.values(material))if(value?.isTexture)textures.add(value);}});textures.forEach(x=>x.dispose());materials.forEach(x=>x.dispose());geometries.forEach(x=>x.dispose());}
const journey=createJourney({destination:'room',source:'louvre-xr',language,getSession:()=>renderer.xr.getSession(),release,saveState:()=>writeJourneyState(storage,'xr-view',view)});
journey.bind(document.getElementById('museum-enter'));
const portal=createJourneyPortal(THREE,{scene,label:copy.enter,language,position:new THREE.Vector3(1.55,.75,3.3),journey});
const controllers=[];
for(let i=0;i<2;i++){
  const controller=renderer.xr.getController(i);rig.add(controller);
  const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3(0,0,-5)]),new THREE.LineBasicMaterial({color:0xe7c78d}));controller.add(line);
  const cursor=new THREE.Mesh(new THREE.SphereGeometry(.014,12,8),new THREE.MeshBasicMaterial({color:0x8de2ed,depthTest:false}));cursor.visible=false;scene.add(cursor);
  controller.userData.active=false;
  controller.addEventListener('connected',event=>{controller.userData.active=true;controller.userData.source=event.data;turnArmed=false;});
  controller.addEventListener('disconnected',()=>{controller.userData.active=false;controller.userData.source=null;line.visible=false;cursor.visible=false;turnArmed=false;});
  controller.addEventListener('select',()=>{if(renderer.xr.getSession()?.visibilityState==='visible' && hitController(controller))journey.go();});
  controllers.push({controller,line,cursor});
}
function hitController(controller){scene.updateMatrixWorld(true);ray.set(controller.getWorldPosition(new THREE.Vector3()),new THREE.Vector3(0,0,-1).transformDirection(controller.matrixWorld));return portal.hit(ray);}
function resize(){if(renderer.xr.isPresenting)return;renderer.setSize(stage.clientWidth,stage.clientHeight,false);camera.aspect=stage.clientWidth/stage.clientHeight;camera.updateProjectionMatrix();}
const observer=new ResizeObserver(resize);observer.observe(stage);
function navigateExterior(dt,frame){
  const session=renderer.xr.getSession();
  if(!session || session.visibilityState!=='visible' || !frame?.getViewerPose(renderer.xr.getReferenceSpace())){turnArmed=false;return;}
  rig.updateMatrixWorld(true);
  const trackedHead=renderer.xr.getCamera(camera);
  trackedHead.updateMatrixWorld(true);
  const head=new THREE.Vector3().setFromMatrixPosition(trackedHead.matrixWorld);
  const left=controllers.find(item=>item.controller.userData.source?.handedness==='left');
  const right=controllers.find(item=>item.controller.userData.source?.handedness==='right');
  const stick=readStick(left?.controller.userData.source);
  const forwardAxis=-deadZone(stick.y),sideAxis=deadZone(stick.x);
  let pivotHead=head;
  if(forwardAxis || sideAxis){
    const forward=new THREE.Vector3(0,0,-1).transformDirection(trackedHead.matrixWorld);
    forward.y=0;forward.normalize();
    const sideways=new THREE.Vector3(-forward.z,0,forward.x);
    const next=exteriorWalk(head,forward,sideways,forwardAxis,sideAxis,dt,walkBounds);
    rig.position.x+=next.x-head.x;rig.position.z+=next.z-head.z;
    pivotHead=new THREE.Vector3(next.x,head.y,next.z);
    rig.updateMatrixWorld(true);
  }
  const turn=snapTurn(readStick(right?.controller.userData.source).x,turnArmed,Math.PI/4);
  turnArmed=turn.armed;
  if(turn.angle){
    const pivot=pivotRig(rig.position,pivotHead,turn.angle);
    rig.position.x=pivot.x;rig.position.z=pivot.z;rig.rotation.y+=turn.angle;
  }
  stage.dataset.xrPosition=JSON.stringify({x:rig.position.x,z:rig.position.z,yaw:rig.rotation.y});
}
function frame(time,xrFrame){
  const dt=Math.min(.05,Math.max(0,(time-lastFrameTime)/1000));lastFrameTime=time;
  if(renderer.xr.isPresenting && ready && !journey.busy)navigateExterior(dt,xrFrame);
  if(!renderer.xr.isPresenting){rig.position.set(0,0,0);camera.position.setFromSphericalCoords(view.radius/Math.min(1,camera.aspect),view.phi,view.theta).add(new THREE.Vector3(0,0,-3));camera.lookAt(0,0,-3);}
  scene.updateMatrixWorld(true);portal.update(renderer.xr.isPresenting?renderer.xr.getCamera(camera).matrixWorld:camera.matrixWorld,renderer.xr.isPresenting);
  let hovered=false;
  for(const {controller,line,cursor} of controllers){line.visible=renderer.xr.isPresenting && controller.userData.active;const hit=line.visible?hitController(controller):null;line.scale.z=controllerRayScale(hit);cursor.visible=!!hit;if(hit){cursor.position.copy(hit.point);hovered=true;}}
  portal.setHover(hovered);renderer.render(scene,camera);
}
renderer.setAnimationLoop(frame);
renderer.xr.addEventListener('sessionstart',()=>{drag=null;turnArmed=false;lastFrameTime=0;rig.position.set(0,0,6);rig.rotation.y=0;camera.position.set(0,0,0);camera.rotation.set(0,0,0);vrButton.textContent=copy.exit;});
renderer.xr.addEventListener('sessionend',()=>{turnArmed=false;vrButton.textContent=copy.vr;resize();});
vrButton.addEventListener('click',async()=>{try{const session=renderer.xr.getSession();if(session){await session.end();return;}const next=await navigator.xr.requestSession('immersive-vr',{requiredFeatures:['local-floor']});try{await renderer.xr.setSession(next);}catch(error){await next.end();throw error;}}catch{status.textContent=copy.failed;}});
navigator.xr?.isSessionSupported('immersive-vr').then(value=>{supported=value;vrButton.textContent=value?copy.vr:copy.unavailable;vrButton.disabled=!value || !ready;}).catch(()=>{vrButton.textContent=copy.unavailable;});
if(!navigator.xr)vrButton.textContent=copy.unavailable;
canvas.addEventListener('pointerdown',event=>{if(renderer.xr.isPresenting)return;drag={id:event.pointerId,x:event.clientX,y:event.clientY};canvas.setPointerCapture(event.pointerId);});
canvas.addEventListener('pointermove',event=>{if(drag?.id!==event.pointerId)return;view.theta-=(event.clientX-drag.x)*.006;view.phi=Math.max(.2,Math.min(1.5,view.phi+(event.clientY-drag.y)*.006));drag.x=event.clientX;drag.y=event.clientY;});
for(const type of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(type,()=>{drag=null;});
canvas.addEventListener('wheel',event=>{event.preventDefault();view.radius=Math.max(6,Math.min(18,view.radius+event.deltaY*.01));},{passive:false});
document.getElementById('exterior-reset').addEventListener('click',()=>{view={theta:0,phi:1.15,radius:9,fov:50};});
canvas.addEventListener('webglcontextlost',()=>{status.textContent=copy.failed;});
async function load(){
  if(loading || disposed)return;loading=true;status.textContent=copy.loading;retry.hidden=true;const started=performance.now();
  try{
    const response=await fetch(new URL('../data/louvre.json',import.meta.url));if(!response.ok)throw new Error('Louvre data HTTP '+response.status);
    const place=await response.json(),definition=place.remoteExperience.models.find(x=>x.id==='louvre-building');
    // This Three.js revision has no KTX2 loader. Reuse the published WebP compatibility variant; never copy or recompress it.
    const candidates=modelVariantCandidates(definition,'quest-webp');let loaded,lastError;
    for(const candidate of candidates){try{loaded=await loader.loadAsync(modelCandidateUrl(candidate,import.meta.url));stage.dataset.variant=candidate.id;break;}catch(error){lastError=error;}}
    if(!loaded)throw lastError;if(disposed){disposeModel(loaded.scene);return;}
    model=loaded.scene;const box=new THREE.Box3().setFromObject(model),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());
    const scale=8/Math.max(size.x,size.y,size.z);model.scale.multiplyScalar(scale);model.position.set(-center.x*scale,-box.min.y*scale,-3-center.z*scale);scene.add(model);
    const displayedBounds=new THREE.Box3().setFromObject(model);
    walkBounds.minZ=Math.min(5.5,Math.max(1.5,displayedBounds.max.z+1));
    stage.dataset.walkMinZ=String(walkBounds.minZ);
    ready=true;stage.dataset.modelCount='1';stage.dataset.state='ready';stage.dataset.loadMs=String(Math.round(performance.now()-started));vrButton.disabled=!supported;status.textContent=copy.ready;journey.ready(stage);
  }catch(error){if(!disposed){stage.dataset.state='error';status.textContent=copy.failed;retry.hidden=false;console.warn('GEO exterior:',error);}}
  finally{loading=false;}
}
retry.addEventListener('click',load);load();
function release(){if(disposed)return;disposed=true;renderer.setAnimationLoop(null);observer.disconnect();portal.dispose();disposeModel(scene);model=null;decoder.dispose();renderer.dispose();stage.dataset.modelCount='0';}
window.addEventListener('pagehide',()=>{renderer.xr.getSession()?.end().catch(()=>{});release();});
window.addEventListener('pageshow',event=>{if(event.persisted)location.reload();});
