import * as THREE from 'three';
import {parseMuseumLink,validateIndoorPanorama,tileGrid,bearingVector} from './streetview-xr-core.mjs';

// A Google Maps Platform browser key must be explicitly configured and HTTP-referrer restricted.
// Never treat an Arts & Culture sv_pid as a Map Tiles panoId.
const GOOGLE_MAP_TILES_KEY = ''; // Configure only after enabling billing and reviewing Maps Platform policy.
const API='https://tile.googleapis.com/v1';
const params=new URLSearchParams(location.search);
const language=['fr','en','ar'].includes(params.get('lang'))?params.get('lang'):'fr';
const i18n={
 fr:{title:'Musées en réalité virtuelle',intro:'Explorez une vue panoramique du musée dans votre casque. La visite officielle reste disponible.',enter:'Entrer en VR',exit:'Quitter la VR',reset:'Recentrer',official:'Visite officielle ↗',unsupported:'Ce navigateur ne prend pas en charge WebXR immersif.',notConfigured:'Le module panoramique Google n’est pas encore activé. Utilisez la visite officielle ; aucune image Google n’est copiée.',notAvailable:'Aucun panorama intérieur Google Maps Tiles correspondant n’est disponible à cet endroit. Ouvrez la visite officielle.',loading:'Recherche du panorama autorisé…',ready:'Panorama chargé. Vous pouvez entrer en VR ou sélectionner une direction.',fail:'Le panorama est indisponible. La visite officielle reste accessible.',next:'Vers : ',disclaimer:'Les liens Arts & Culture ne garantissent pas la disponibilité d’un panorama dans l’API Maps Tiles, ni l’accrochage actuel des œuvres.'},
 en:{title:'Museums in virtual reality',intro:'Explore museum panoramas in your headset. The official tour remains available.',enter:'Enter VR',exit:'Exit VR',reset:'Recenter',official:'Official tour ↗',unsupported:'This browser does not support immersive WebXR.',notConfigured:'Google panorama access has not been enabled yet. Use the official tour; no Google imagery is copied.',notAvailable:'No matching indoor Google Maps Tiles panorama is available here. Use the official tour.',loading:'Looking for an authorized panorama…',ready:'Panorama loaded. Enter VR or select a direction.',fail:'The panorama is unavailable. The official tour remains available.',next:'Go to: ',disclaimer:'Arts & Culture links do not guarantee availability in Maps Tiles or that the painting is currently on display.'},
 ar:{title:'المتاحف في الواقع الافتراضي',intro:'استكشف المناظر البانورامية للمتاحف بواسطة نظارة الواقع الافتراضي، مع إمكانية فتح الجولة الرسمية.',enter:'الدخول إلى VR',exit:'الخروج من VR',reset:'إعادة التوجيه',official:'الجولة الرسمية ↗',unsupported:'هذا المتصفح لا يدعم WebXR الغامر.',notConfigured:'لم يتم تفعيل الوصول إلى صور Google بعد. يمكنك فتح الجولة الرسمية دون نسخ الصور.',notAvailable:'لا تتوفر بانوراما داخلية مطابقة عبر Google Maps Tiles لهذا الموقع.',loading:'جار البحث عن بانوراما مصرح بها…',ready:'تم تحميل البانوراما. يمكنك الدخول إلى الواقع الافتراضي.',fail:'البانوراما غير متاحة. يمكن فتح الجولة الرسمية.',next:'انتقال إلى: ',disclaimer:'لا تضمن روابط Arts & Culture توافر المشهد في Maps Tiles أو موقع اللوحة الحالي.'}
};
const t=i18n[language],$=id=>document.getElementById(id);
document.documentElement.lang=language;document.documentElement.dir=language==='ar'?'rtl':'ltr';
$('title').textContent=t.title;$('intro').textContent=t.intro;$('enter-vr').textContent=t.enter;$('reset').textContent=t.reset;$('disclaimer').textContent=t.disclaimer;$('official').textContent=t.official;
$('back').href='index.html?lang='+language;
document.querySelectorAll('[data-lang]').forEach(a=>{const q=new URLSearchParams(location.search);q.set('lang',a.dataset.lang);a.href='?'+q.toString();if(a.dataset.lang===language)a.setAttribute('aria-current','page')});
const canvas=$('xr-canvas');const renderer=new THREE.WebGLRenderer({canvas,antialias:true});
renderer.xr.enabled=true;renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
const scene=new THREE.Scene();scene.background=new THREE.Color(0x172b38);
const camera=new THREE.PerspectiveCamera(75,1,.01,100);
const rig=new THREE.Group();rig.add(camera);scene.add(rig);
const raycaster=new THREE.Raycaster();
const controllers=[renderer.xr.getController(0),renderer.xr.getController(1)];
controllers.forEach(controller=>{rig.add(controller);controller.addEventListener('select',()=>{const hit=hitTest(controller);if(hit?.userData?.panoId)loadPanorama(hit.userData.panoId).catch(handleError);})});
const hotspotGroup=new THREE.Group();scene.add(hotspotGroup);
let sphere=null, session=null, currentMetadata=null, busy=false, ticket=0;
function status(message){$('status').textContent=message;}
function resize(){const box=canvas.getBoundingClientRect();const w=Math.max(1,Math.round(box.width)),h=Math.max(1,Math.round(box.height));renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
window.addEventListener('resize',resize);resize();
renderer.setAnimationLoop(()=>renderer.render(scene,camera));
const target=parseMuseumLink(params.get('source')||'');
if(target){$('official').href=target.source;$('official').hidden=false;}
else $('official').hidden=true;
const marker=new THREE.Vector3();
function hitTest(controller){controller.updateWorldMatrix(true,false);raycaster.set(controller.getWorldPosition(marker),new THREE.Vector3(0,0,-1).transformDirection(controller.matrixWorld));return raycaster.intersectObjects(hotspotGroup.children)[0]?.object}
function clearHotspots(){for(const child of [...hotspotGroup.children]){hotspotGroup.remove(child);child.geometry.dispose();child.material.dispose()}$('links').replaceChildren()}
function addHotspots(metadata){clearHotspots();for(const link of (metadata.links||[]).slice(0,12)){if(!link.panoId||!Number.isFinite(Number(link.heading)))continue;const v=bearingVector(Number(link.heading));const mesh=new THREE.Mesh(new THREE.SphereGeometry(.14,14,10),new THREE.MeshBasicMaterial({color:0xe9c990}));mesh.position.set(v.x,-.7,v.z);mesh.userData.panoId=link.panoId;hotspotGroup.add(mesh);
const button=document.createElement('button');button.className='secondary';button.textContent=t.next+(link.text||Math.round(Number(link.heading))+'°');button.addEventListener('click',()=>loadPanorama(link.panoId).catch(handleError));$('links').append(button);}}
function endpoint(path,extra={}){const url=new URL(API+path);url.searchParams.set('session',session);url.searchParams.set('key',GOOGLE_MAP_TILES_KEY);for(const [key,value] of Object.entries(extra))url.searchParams.set(key,String(value));return url.toString()}
async function requestJson(url){const response=await fetch(url,{cache:'no-store'});if(!response.ok)throw Error('Google Maps Tiles: HTTP '+response.status);return response.json()}
async function createSession(){const response=await fetch(API+'/createSession?key='+encodeURIComponent(GOOGLE_MAP_TILES_KEY),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mapType:'streetview',language:language==='ar'?'ar':'en-US',region:'US'})});if(!response.ok)throw Error('Google Maps Tiles session HTTP '+response.status);const data=await response.json();if(!data.session)throw Error('Missing session');return data.session}
async function loadTile(url){const response=await fetch(url,{cache:'no-store'});if(!response.ok)throw Error('Tile HTTP '+response.status);const blob=await response.blob();return createImageBitmap(blob)}
async function loadPanorama(panoId){if(busy)return;busy=true;const attempt=++ticket;status(t.loading);$('enter-vr').disabled=true;try{
 const metadata=await requestJson(endpoint('/streetview/metadata',{panoId}));
 if(target && !validateIndoorPanorama(metadata,target,35).ok) {status(t.notAvailable);return}
 if(metadata.imageryType!=='indoor') {status(t.notAvailable);return}
 const grid=tileGrid(metadata,2);
 const surface=document.createElement('canvas');surface.width=grid.outputWidth;surface.height=grid.outputHeight;const context=surface.getContext('2d');
 // Request only a bounded number of tiles; no file persistence or redistribution.
 const coordinates=[];for(let y=0;y<grid.rows;y++)for(let x=0;x<grid.columns;x++)coordinates.push({x,y});
 for(let i=0;i<coordinates.length;i+=4){const batch=coordinates.slice(i,i+4);await Promise.all(batch.map(async({x,y})=>{
  const bitmap=await loadTile(endpoint('/streetview/tiles/'+grid.level+'/'+x+'/'+y,{panoId:metadata.panoId}));
  context.drawImage(bitmap,x*grid.tileWidth,y*grid.tileHeight);bitmap.close();
 }))}
 if(attempt!==ticket)return;
 const texture=new THREE.CanvasTexture(surface);texture.colorSpace=THREE.SRGBColorSpace||undefined;
 const nextSphere=new THREE.Mesh(new THREE.SphereGeometry(40,64,32),new THREE.MeshBasicMaterial({map:texture,side:THREE.BackSide}));
 // Street View tiles use their own panorama heading; use metadata to align azimuth as far as possible.
 nextSphere.rotation.y=THREE.MathUtils.degToRad(-Number(metadata.heading||0));
 if(sphere){scene.remove(sphere);sphere.geometry.dispose();sphere.material.map.dispose();sphere.material.dispose()}
 sphere=nextSphere;scene.add(sphere);currentMetadata=metadata;
 $('attribution').replaceChildren();
 const credit=document.createElement('span');credit.textContent=metadata.copyright||'© Google Street View';$('attribution').append(credit);
 if(metadata.reportProblemLink){const report=new URL(metadata.reportProblemLink);if(report.protocol==='https:'){const a=document.createElement('a');a.href=report.href;a.target='_blank';a.rel='noopener noreferrer';a.textContent=language==='fr'?'Signaler un problème avec cette image':language==='ar'?'الإبلاغ عن مشكلة في هذه الصورة':'Report a problem with this image';$('attribution').append(a)}}
 addHotspots(metadata);$('enter-vr').disabled=!await navigator.xr?.isSessionSupported?.('immersive-vr');status(t.ready);
 }finally{busy=false}}
function handleError(error){console.warn('ARTDACI Museum XR:',error);status(t.fail)}
$('enter-vr').addEventListener('click',async()=>{try{if(renderer.xr.getSession()){await renderer.xr.getSession().end();return}const next=await navigator.xr.requestSession('immersive-vr',{optionalFeatures:['local-floor']});await renderer.xr.setSession(next)}catch(error){handleError(error)}});
renderer.xr.addEventListener('sessionstart',()=>{$('enter-vr').textContent=t.exit});
renderer.xr.addEventListener('sessionend',()=>{$('enter-vr').textContent=t.enter});
$('reset').addEventListener('click',()=>{rig.rotation.set(0,0,0);camera.rotation.set(0,0,0);if(!renderer.xr.isPresenting)camera.lookAt(0,0,-1)});
if(!navigator.xr)status(t.unsupported);
else status(t.loading);
if(!GOOGLE_MAP_TILES_KEY){$('enter-vr').disabled=true;status(t.notConfigured)}
else if(!target){status(t.notAvailable)}
else (async()=>{try{session=await createSession();const metadata=await requestJson(endpoint('/streetview/metadata',{lat:target.lat,lng:target.lng,radius:20}));if(!validateIndoorPanorama(metadata,target,35).ok){status(t.notAvailable);return}await loadPanorama(metadata.panoId)}catch(error){handleError(error)}})();
