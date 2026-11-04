import * as THREE from 'three';
import {bearingVector} from './streetview-xr-core.mjs';
const params=new URLSearchParams(location.search);
const lang=['en','fr','ar'].includes(params.get('lang'))?params.get('lang'):'fr';
const labels={
fr:{title:'ARTDACI Museum XR',intro:'Exploration WebXR expérimentale. Les visites originales restent disponibles.',pilot:'Accès pilote',start:'Charger le panorama',enter:'Entrer en VR',exit:'Quitter la VR',reset:'Recentrer',official:'Visite officielle',disabled:'Pilote privé : entrez le code d’accès et chargez un panorama.',empty:'Aucun panorama intérieur équivalent confirmé. La visite officielle reste accessible.',ready:'Panorama disponible : exploration possible.',error:'Accès indisponible ou limite atteinte.',bad:'Accès pilote refusé.',next:'Panorama voisin',credit:'Crédits de panorama',note:'Les panoramas Google Arts & Culture et Map Tiles ne sont pas nécessairement identiques.'},
en:{title:'ARTDACI Museum XR',intro:'Experimental WebXR museum exploration. Official tours remain available.',pilot:'Pilot access',start:'Load panorama',enter:'Enter VR',exit:'Exit VR',reset:'Recenter',official:'Official tour',disabled:'Private pilot: enter the access code to load a panorama.',empty:'No matching indoor panorama confirmed. Official tour is still accessible.',ready:'Panorama available. Immersive exploration is ready.',error:'Unavailable or daily limit reached.',bad:'Pilot access denied.',next:'Adjacent panorama',credit:'Panorama credits',note:'Google Arts & Culture and Maps Tiles panoramas may be different.'},
ar:{title:'ARTDACI Museum XR',intro:'استكشاف متاحف تجريبي عبر WebXR. الجولات الرسمية متاحة.',pilot:'الدخول التجريبي',start:'تحميل المشهد',enter:'الدخول إلى VR',exit:'الخروج من VR',reset:'إعادة التوجيه',official:'الجولة الرسمية',disabled:'نسخة تجريبية خاصة: أدخل رمز الوصول لتحميل المشهد.',empty:'لا يوجد مشهد داخلي مطابق مؤكد. الجولة الرسمية متاحة.',ready:'المشهد متاح للاستكشاف.',error:'الخدمة غير متاحة أو تجاوزت الحد اليومي.',bad:'الدخول التجريبي مرفوض.',next:'مشهد مجاور',credit:'حقوق الصورة',note:'قد تختلف مشاهد Google Arts & Culture عن Maps Tiles.'}
};
const t=labels[lang],$=id=>document.getElementById(id);
document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr';
$('title').textContent=t.title;$('intro').textContent=t.intro;
$('start').textContent=t.start;$('enter-vr').textContent=t.enter;$('reset').textContent=t.reset;$('key-label').textContent=t.pilot;
$('disclaimer').textContent=t.note;$('official').textContent=t.official;$('back').href='index.html?lang='+lang;
document.querySelectorAll('[data-lang]').forEach(a=>{const query=new URLSearchParams(location.search);query.set('lang',a.dataset.lang);a.href='?'+query;if(a.dataset.lang===lang)a.setAttribute('aria-current','page')});
const museumId=params.get('museum')||'national-gallery-london';
const source=params.get('source');
if(source){try{const u=new URL(source);if(u.protocol==='https:'&&u.hostname==='artsandculture.google.com'&&u.pathname.startsWith('/streetview/')){$('official').href=u.href;$('official').hidden=false}}catch{}}
let pilotToken='',ticket='',currentMeta=null,sphere=null,loading=false;
const canvas=$('xr-canvas'),renderer=new THREE.WebGLRenderer({canvas,antialias:true});
renderer.xr.enabled=true;renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
const scene=new THREE.Scene();scene.background=new THREE.Color(0x152634);
const camera=new THREE.PerspectiveCamera(75,1,.05,100),rig=new THREE.Group();rig.add(camera);scene.add(rig);
const hotspots=new THREE.Group();scene.add(hotspots);
const creditSurface=document.createElement('canvas');creditSurface.width=1024;creditSurface.height=256;
const creditTexture=new THREE.CanvasTexture(creditSurface);
const creditPlane=new THREE.Mesh(new THREE.PlaneGeometry(2.5,.625),new THREE.MeshBasicMaterial({map:creditTexture,transparent:true,depthTest:false}));
creditPlane.position.set(0,-1.2,-2.4);creditPlane.renderOrder=10;rig.add(creditPlane);
const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector3();
for(let i=0;i<2;i++){const controller=renderer.xr.getController(i);rig.add(controller);controller.addEventListener('select',()=>{controller.updateWorldMatrix(true,false);raycaster.set(controller.getWorldPosition(pointer),new THREE.Vector3(0,0,-1).transformDirection(controller.matrixWorld));const hit=raycaster.intersectObjects(hotspots.children)[0];if(hit?.object.userData.panoId)loadNeighbor(hit.object.userData.panoId).catch(reportError)})}
function drawCredits(text){const context=creditSurface.getContext('2d');context.clearRect(0,0,1024,256);context.fillStyle='rgba(8,18,27,0.88)';context.fillRect(0,0,1024,256);context.fillStyle='#fff';context.font='32px system-ui';const chunks=String(text||'© Google Street View').match(/.{1,58}/g)||[];chunks.slice(0,3).forEach((line,i)=>context.fillText(line,30,55+i*49));context.font='25px system-ui';context.fillText('Google Street View · ARTDACI Museum XR',30,220);creditTexture.needsUpdate=true}
drawCredits('© Google Street View');
function size(){const b=canvas.getBoundingClientRect();renderer.setSize(Math.round(b.width),Math.round(b.height),false);camera.aspect=b.width/Math.max(1,b.height);camera.updateProjectionMatrix()}
addEventListener('resize',size);size();renderer.setAnimationLoop(()=>renderer.render(scene,camera));
function message(s){$('status').textContent=s}
async function request(data,blob=false){
 const response=await fetch('../api/museum-xr',{method:'POST',headers:{'Content-Type':'application/json','X-Museum-XR-Preview':pilotToken},body:JSON.stringify({...data,museumId}),cache:'no-store'});
 if(!response.ok){let detail='';try{const data=await response.json();detail=String(data.stage||data.error||'').slice(0,100)}catch{}const error=new Error('HTTP '+response.status);error.status=response.status;error.detail=detail;throw error}
 return blob?createImageBitmap(await response.blob()):response.json();
}
function clearHotspots(){for(const o of [...hotspots.children]){hotspots.remove(o);o.geometry.dispose();o.material.dispose()}$('links').replaceChildren()}
function addHotspots(metadata){clearHotspots();for(const item of metadata.links||[]){if(!item.panoId||!Number.isFinite(item.heading))continue;const position=bearingVector(item.heading,3);const mesh=new THREE.Mesh(new THREE.SphereGeometry(.15,14,10),new THREE.MeshBasicMaterial({color:'#e4bd7c'}));mesh.position.set(position.x,-.7,position.z);mesh.userData.panoId=item.panoId;hotspots.add(mesh);const button=document.createElement('button');button.className='secondary';button.textContent=t.next+' · '+Math.round(item.heading)+'°';button.addEventListener('click',()=>loadNeighbor(item.panoId).catch(reportError));$('links').append(button)}}
async function showPanorama(result){
 const meta=result.metadata,dim=result.dimension;
 if(!meta?.copyright||!dim||!result.ticket)throw Error('Invalid gateway metadata');
 const target=document.createElement('canvas');target.width=dim.width;target.height=dim.height;
 const ctx=target.getContext('2d');
 // Serial, bounded requests protect the quota and Quest memory budget.
 for(let y=0;y<dim.rows;y++)for(let x=0;x<dim.columns;x++){const bitmap=await request({action:'tile',ticket:result.ticket,x,y,zoom:dim.zoom},true);ctx.drawImage(bitmap,x*dim.tileWidth,y*dim.tileHeight);bitmap.close()}
 const texture=new THREE.CanvasTexture(target);texture.colorSpace=THREE.SRGBColorSpace||undefined;
 const next=new THREE.Mesh(new THREE.SphereGeometry(40,64,32),new THREE.MeshBasicMaterial({map:texture,side:THREE.BackSide}));
 next.rotation.y=THREE.MathUtils.degToRad(-Number(meta.heading||0));
 if(sphere){scene.remove(sphere);sphere.geometry.dispose();sphere.material.map.dispose();sphere.material.dispose()}
 sphere=next;scene.add(sphere);ticket=result.ticket;currentMeta=meta;
 $('attribution').replaceChildren(document.createTextNode(meta.copyright));
 if(meta.reportProblemLink){const a=document.createElement('a');a.href=meta.reportProblemLink;a.textContent=' · Report Street View image';a.target='_blank';a.rel='noopener noreferrer';$('attribution').append(a)}
 drawCredits(meta.copyright);addHotspots(meta);message(t.ready);
 $('enter-vr').disabled=!Boolean(await navigator.xr?.isSessionSupported?.('immersive-vr').catch(()=>false));
}
async function loadNeighbor(panoId){if(loading)return;loading=true;try{const data=await request({action:'neighbor',ticket,panoId});await showPanorama(data)}finally{loading=false}}
function reportError(error){console.warn('Museum XR preview:',error.message);message((error.status===401?t.bad:error.status===404?t.empty:error.status===503?t.disabled:t.error)+(error.status?' · HTTP '+error.status:'')+(error.detail?' · '+error.detail:''))}
$('start').addEventListener('click',async()=>{if(loading)return;loading=true;pilotToken=$('pilot-token').value.trim();$('pilot-token').value='';if(!pilotToken){message(t.bad);loading=false;return}
 try{const catalog=await request({action:'catalog'});const entry=catalog.museums.find(m=>m.id===museumId);if(!entry){message(t.empty);return}
 $('official').href=entry.source;$('official').hidden=false;const response=await request({action:'start'});await showPanorama(response)}catch(e){reportError(e)}finally{loading=false}});
$('enter-vr').addEventListener('click',async()=>{try{const session=renderer.xr.getSession();if(session){await session.end();return}await renderer.xr.setSession(await navigator.xr.requestSession('immersive-vr',{optionalFeatures:['local-floor']}))}catch(e){reportError(e)}});
renderer.xr.addEventListener('sessionstart',()=>{$('enter-vr').textContent=t.exit});
renderer.xr.addEventListener('sessionend',()=>{$('enter-vr').textContent=t.enter});
$('reset').addEventListener('click',()=>{rig.rotation.set(0,0,0);camera.rotation.set(0,0,0)});
message(t.disabled);
