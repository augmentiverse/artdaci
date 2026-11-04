import * as THREE from 'three';
import {bearingVector} from './streetview-xr-core.mjs';
const params=new URLSearchParams(location.search);
const lang=['en','fr','ar'].includes(params.get('lang'))?params.get('lang'):'fr';
const labels={
fr:{title:'ARTDACI Museum XR',intro:'Exploration WebXR expérimentale. Les visites originales restent disponibles.',start:'Chercher une salle intérieure',demo:'Tester Street View 360° (extérieur possible)',demoReady:'Panorama de démonstration près du musée : il ne représente pas une salle d’exposition vérifiée.',retry:'Google refuse une tuile : essai avec une résolution inférieure…',lowerQuality:' (qualité réduite pour compatibilité)',quality:'Qualité',hd:'Haute définition · 4K',standard:'Standard · 2K',loading:'Chargement des tuiles',controls:'Faites glisser la vue pour regarder autour de vous ; utilisez la molette pour zoomer. En VR, tournez la tête ou utilisez le joystick droit.',hdError:'Tuiles haute définition indisponibles pour cette vue. La résolution 2K ne répond pas au niveau de qualité demandé.',imageKind:'Pour voir les œuvres dans leurs salles, utilisez la visite officielle. Le mode Street View 360° est une expérience expérimentale de proximité, parfois extérieure, et ne reproduit pas la salle du tableau.',enter:'Entrer en VR',exit:'Quitter la VR',reset:'Recentrer',official:'Visite officielle',disabled:'Preview privée : choisissez un mode et chargez un panorama.',empty:'Aucun panorama intérieur équivalent confirmé. La visite officielle reste accessible.',ready:'Panorama disponible : exploration possible.',nearby:'Vue intérieure à proximité, salle et œuvre non vérifiées.',nearestOutdoor:'Google Maps Tiles propose une vue extérieure, pas une vue intérieure vérifiable.',error:'Accès indisponible ou limite atteinte.',bad:'Authentification Vercel requise pour accéder à cette Preview.',next:'Panorama voisin',credit:'Crédits de panorama',note:'Les panoramas Google Arts & Culture et Map Tiles ne sont pas nécessairement identiques.'},
en:{title:'ARTDACI Museum XR',intro:'Experimental WebXR museum exploration. Official tours remain available.',start:'Find indoor museum view',demo:'Try Street View 360° (may be outdoors)',demoReady:'360° demo near the museum — not verified as an exhibition room.',retry:'Google rejected an image tile; trying a lower resolution…',lowerQuality:' (lower resolution for compatibility)',quality:'Quality',hd:'High definition · 4K',standard:'Standard · 2K',loading:'Loading tiles',controls:'Drag to look around, scroll to zoom. In VR turn your head or use the right thumbstick.',hdError:'High-definition tiles are unavailable for this panorama. The 2K image does not meet the requested quality.',imageKind:'Use the official visit to see artworks inside the museum. Street View 360° here is a nearby experimental view, sometimes outdoors, and is not necessarily the artwork’s room.',enter:'Enter VR',exit:'Exit VR',reset:'Recenter',official:'Official tour',disabled:'Private Preview: choose a mode and load a panorama.',empty:'No matching indoor panorama confirmed. Official tour is still accessible.',ready:'Panorama available. Immersive exploration is ready.',nearby:'Nearby indoor view; exhibition room and artwork not verified.',nearestOutdoor:'Maps Tiles offers outdoor imagery here, not a verified indoor view.',error:'Unavailable or daily limit reached.',bad:'Vercel authentication is required to access this Preview.',next:'Adjacent panorama',credit:'Panorama credits',note:'Google Arts & Culture and Maps Tiles panoramas may be different.'},
ar:{title:'ARTDACI Museum XR',intro:'استكشاف متاحف تجريبي عبر WebXR. الجولات الرسمية متاحة.',start:'البحث عن مشهد داخلي',demo:'تجربة ستريت فيو 360° (قد يكون خارجياً)',demoReady:'عرض تجريبي قريب من المتحف؛ ليس قاعة عرض موثّقة.',retry:'تعذّر تحميل صورة؛ ستتم تجربة دقة أقل…',lowerQuality:' (دقة منخفضة للتوافق)',quality:'الجودة',hd:'دقة عالية · 4K',standard:'عادي · 2K',loading:'تحميل الصور',controls:'اسحب لتغيير اتجاه النظر، واستخدم عجلة الفأرة للتقريب. في VR أدر رأسك أو استعمل عصا التحكم اليمنى.',hdError:'الصور عالية الدقة غير متاحة لهذا المشهد. جودة 2K لا تلبي مستوى الجودة المطلوب.',imageKind:'لرؤية الأعمال داخل قاعات المتحف استخدم الجولة الرسمية. هنا تجربة بانورامية قريبة قد تكون خارجية ولا تمثل بالضرورة قاعة اللوحة.',enter:'الدخول إلى VR',exit:'الخروج من VR',reset:'إعادة التوجيه',official:'الجولة الرسمية',disabled:'معاينة خاصة: اختر وضعاً وحمّل المشهد.',empty:'لا يوجد مشهد داخلي مطابق مؤكد. الجولة الرسمية متاحة.',ready:'المشهد متاح للاستكشاف.',nearby:'مشهد داخلي قريب؛ لم يتم التحقق من القاعة أو اللوحة.',nearestOutdoor:'خرائط جوجل تعرض مشهداً خارجياً، وليس مشهداً داخلياً موثّقاً.',error:'الخدمة غير متاحة أو تجاوزت الحد اليومي.',bad:'تتطلب المعاينة الخاصة مصادقة Vercel.',next:'مشهد مجاور',credit:'حقوق الصورة',note:'قد تختلف مشاهد Google Arts & Culture عن Maps Tiles.'}
};
const t=labels[lang],$=id=>document.getElementById(id);
document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr';
$('title').textContent=t.title;$('intro').textContent=t.intro;
$('start').textContent=t.start;$('demo').textContent=t.demo;$('enter-vr').textContent=t.enter;$('reset').textContent=t.reset;
$('controls-help').textContent=t.controls;
$('quality-label').textContent=t.quality;$('quality').options[0].textContent=t.hd;$('quality').options[1].textContent=t.standard;$('image-kind').textContent=t.imageKind;
$('disclaimer').textContent=t.note;$('official').textContent=t.official;$('back').href='index.html?lang='+lang;
document.querySelectorAll('[data-lang]').forEach(a=>{const query=new URLSearchParams(location.search);query.set('lang',a.dataset.lang);a.href='?'+query;if(a.dataset.lang===lang)a.setAttribute('aria-current','page')});
const museumId=params.get('museum')||'national-gallery-london';
const museumsToTry=[
 {id:'national-gallery-london',label:'National Gallery · London'},
 {id:'vermeer-girl-with-a-pearl-earring',label:'Mauritshuis · Girl with a Pearl Earring'},
 {id:'view-of-delft',label:'Mauritshuis · View of Delft'},
 {id:'vermeer-milkmaid',label:'Rijksmuseum · The Milkmaid'},
 {id:'van-gogh',label:'Musée d’Orsay · Van Gogh'}
];
$('alternatives-title').textContent=lang==='fr'?'Autres panoramas à essayer (disponibilité non garantie)':lang==='ar'?'مناظر أخرى للتجربة (التوفر غير مضمون)':'Other panoramas to try (availability not guaranteed)';
for(const item of museumsToTry){
 const link=document.createElement('a');
 link.href='?'+new URLSearchParams({lang,museum:item.id});
 link.textContent=item.label;
 if(item.id===museumId)link.setAttribute('aria-current','page');
 $('museum-list').append(link);
}
const source=params.get('source');
if(source){try{const u=new URL(source);if(u.protocol==='https:'&&u.hostname==='artsandculture.google.com'&&u.pathname.startsWith('/streetview/')){$('official').href=u.href;$('official').hidden=false}}catch{}}
let ticket='',currentMeta=null,sphere=null,loading=false;
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
addEventListener('resize',size);size();
// Street View-style controls for the non-XR canvas: mouse, touch, trackpad,
// keyboard, and wheel. In headset, WebXR tracks head orientation natively.
let drag=null,lookPitch=0;
canvas.style.touchAction='none';
canvas.addEventListener('pointerdown',event=>{
 if(renderer.xr.isPresenting)return;
 drag={id:event.pointerId,x:event.clientX,y:event.clientY};
 canvas.setPointerCapture?.(event.pointerId);
});
canvas.addEventListener('pointermove',event=>{
 if(!drag||drag.id!==event.pointerId||renderer.xr.isPresenting)return;
 const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
 drag.x=event.clientX;drag.y=event.clientY;
 rig.rotation.y-=dx*0.004;
 lookPitch=THREE.MathUtils.clamp(lookPitch-dy*0.004,-Math.PI*0.47,Math.PI*0.47);
 camera.rotation.x=lookPitch;
});
function stopDrag(event){if(drag&&drag.id===event.pointerId)drag=null}
canvas.addEventListener('pointerup',stopDrag);
canvas.addEventListener('pointercancel',stopDrag);
canvas.addEventListener('lostpointercapture',()=>{drag=null});
canvas.addEventListener('wheel',event=>{
 if(renderer.xr.isPresenting)return;
 event.preventDefault();
 camera.fov=THREE.MathUtils.clamp(camera.fov+Math.sign(event.deltaY)*3,45,100);
 camera.updateProjectionMatrix();
},{passive:false});
addEventListener('keydown',event=>{
 if(renderer.xr.isPresenting||event.altKey||event.ctrlKey||event.metaKey||
    /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName||''))return;
 const delta=event.shiftKey?0.20:0.09;
 if(event.key==='ArrowLeft')rig.rotation.y+=delta;
 else if(event.key==='ArrowRight')rig.rotation.y-=delta;
 else if(event.key==='ArrowUp')lookPitch=THREE.MathUtils.clamp(lookPitch+delta,-1.47,1.47);
 else if(event.key==='ArrowDown')lookPitch=THREE.MathUtils.clamp(lookPitch-delta,-1.47,1.47);
 else return;
 camera.rotation.x=lookPitch;event.preventDefault();
});
const renderClock=new THREE.Clock();
renderer.setAnimationLoop(()=>{
 const dt=Math.min(renderClock.getDelta(),0.05);
 const session=renderer.xr.getSession();
 if(session){
  // Quest thumbstick provides seated snap-free horizontal turn; head tracking
  // always remains the primary direction of view.
  const right=[...session.inputSources].find(x=>x.handedness==='right'&&x.gamepad);
  const axes=right?.gamepad?.axes||[];
  const axis=axes.length>=3?axes[2]:(axes[0]||0);
  if(Math.abs(axis)>0.24)rig.rotation.y-=axis*dt*1.4;
 }
 renderer.render(scene,camera);
});
function message(s){$('status').textContent=s}
async function request(data,blob=false){
 const response=await fetch('../api/museum-xr',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...data,museumId}),cache:'no-store'});
 if(response.headers.get('content-type')?.includes('text/html')){const error=new Error('Vercel login required');error.status=401;throw error}
 if(!response.ok){let detail='';try{const data=await response.json();detail=String(data.code||data.stage||data.error||'').slice(0,100); if(data.nearestType)detail+=' · '+String(data.nearestType).slice(0,40)}catch{}const error=new Error('HTTP '+response.status);error.status=response.status;error.detail=detail;throw error}
 return blob?createImageBitmap(await response.blob()):response.json();
}
function clearHotspots(){for(const o of [...hotspots.children]){hotspots.remove(o);o.geometry.dispose();o.material.dispose()}$('links').replaceChildren()}
function addHotspots(metadata){clearHotspots();for(const item of metadata.links||[]){if(!item.panoId||!Number.isFinite(item.heading))continue;const position=bearingVector(item.heading,3);const mesh=new THREE.Mesh(new THREE.SphereGeometry(.15,14,10),new THREE.MeshBasicMaterial({color:'#e4bd7c'}));mesh.position.set(position.x,-.7,position.z);mesh.userData.panoId=item.panoId;hotspots.add(mesh);const button=document.createElement('button');button.className='secondary';button.textContent=t.next+' · '+Math.round(item.heading)+'°';button.addEventListener('click',()=>loadNeighbor(item.panoId).catch(reportError));$('links').append(button)}}
async function showPanorama(result){
 let resolved=result,dim=result.dimension,target=null;
 if(!result.metadata?.copyright||!dim||!result.ticket)throw Error('Invalid gateway metadata');
 // At most 32 tiles at zoom 3; concurrency two balances load speed and
 // Google quota. If a tile fails, we retry with successively lower resolution.
 for(let attempt=0;attempt<4;attempt++){
   dim=resolved.dimension;
   const candidate=document.createElement('canvas');
   candidate.width=dim.width;candidate.height=dim.height;
   const ctx=candidate.getContext('2d');
   try{
     if(!ctx)throw Error('Canvas 2D unavailable');
     const positions=[];
     for(let y=0;y<dim.rows;y++)for(let x=0;x<dim.columns;x++)positions.push([x,y]);
     let index=0,completed=0,firstError=null;
     const worker=async()=>{
       while(index<positions.length&&!firstError){
         const [x,y]=positions[index++];
         try{
           const bitmap=await request({action:'tile',ticket:resolved.ticket,x,y,zoom:dim.zoom},true);
           try{ctx.drawImage(bitmap,x*dim.tileWidth,y*dim.tileHeight)}finally{bitmap.close()}
           completed++;
           if(completed%4===0||completed===positions.length)
             message(t.loading+' '+completed+'/'+positions.length+' · '+dim.width+'×'+dim.height+' px');
         }catch(error){firstError=error;return}
       }
     };
     await Promise.all([worker(),worker()]);
     if(firstError)throw firstError;
     target=candidate;break;
   }catch(error){
     // In the 4K test, do not silently convert failures into a blurry 2K view.
     if($('quality').value==='hd'&&dim.zoom===3)throw Object.assign(error,{hdUnavailable:true});
     if(![400,500,502,503,504].includes(error.status)||dim.zoom===0||attempt===3)throw error;
     message(t.retry);
     resolved=await request({action:'rescale',ticket:resolved.ticket,zoom:dim.zoom-1});
   }
 }
 if(!target)throw Error('Panorama unavailable');
 const meta=resolved.metadata;
 const texture=new THREE.CanvasTexture(target);texture.colorSpace=THREE.SRGBColorSpace||undefined;
 const next=new THREE.Mesh(new THREE.SphereGeometry(40,64,32),new THREE.MeshBasicMaterial({map:texture,side:THREE.BackSide}));
 next.rotation.y=THREE.MathUtils.degToRad(-Number(meta.heading||0));
 if(sphere){scene.remove(sphere);sphere.geometry.dispose();sphere.material.map.dispose();sphere.material.dispose()}
 sphere=next;scene.add(sphere);ticket=resolved.ticket;currentMeta=meta;
 $('attribution').replaceChildren(document.createTextNode(meta.copyright));
 if(meta.reportProblemLink){const a=document.createElement('a');a.href=meta.reportProblemLink;a.textContent=' · Report Street View image';a.target='_blank';a.rel='noopener noreferrer';$('attribution').append(a)}
 drawCredits(meta.copyright);
 if(meta.imageryType==='indoor')addHotspots(meta);else clearHotspots();
 message((resolved.selectionMode==='location-demo-unverified'?t.demoReady:resolved.selectionMode==='nearby-unverified'?t.nearby:t.ready)+' · '+dim.width+' × '+dim.height+' px'+(dim.zoom<2?t.lowerQuality:''));
 $('enter-vr').disabled=!Boolean(await navigator.xr?.isSessionSupported?.('immersive-vr').catch(()=>false));
}
async function loadNeighbor(panoId){if(loading)return;loading=true;try{const data=await request({action:'neighbor',ticket,panoId});await showPanorama(data)}finally{loading=false}}
function reportError(error){console.warn('Museum XR preview:',error.message);
 if(error.hdUnavailable){message(t.hdError+(error.status?' · HTTP '+error.status:'')+(error.detail?' · '+error.detail:''));return}const empty=error.status===404&&error.detail?.includes('nearest-outdoor')?t.nearestOutdoor:t.empty;message((error.status===401||error.status===403?t.bad:error.status===404?empty:error.status===503?t.disabled:t.error)+(error.status?' · HTTP '+error.status:'')+(error.detail?' · '+error.detail:''))}
async function startPanorama(action){
 if(loading)return;loading=true;
 try{
  const catalog=await request({action:'catalog'});
  const entry=catalog.museums.find(m=>m.id===museumId);
  if(!entry){message(t.empty);return}
  $('official').href=entry.source;$('official').hidden=false;
  const response=await request({action,quality:$('quality').value});await showPanorama(response);
 }catch(error){reportError(error)}finally{loading=false}
}
request({action:'catalog'}).then(catalog=>{const entry=catalog.museums.find(m=>m.id===museumId);if(entry){$('official').href=entry.source;$('official').hidden=false}}).catch(()=>{});
$('start').addEventListener('click',()=>startPanorama('start'));
$('demo').addEventListener('click',()=>startPanorama('start-exterior'));
$('enter-vr').addEventListener('click',async()=>{try{const session=renderer.xr.getSession();if(session){await session.end();return}await renderer.xr.setSession(await navigator.xr.requestSession('immersive-vr',{optionalFeatures:['local-floor']}))}catch(e){reportError(e)}});
renderer.xr.addEventListener('sessionstart',()=>{$('enter-vr').textContent=t.exit});
renderer.xr.addEventListener('sessionend',()=>{$('enter-vr').textContent=t.enter});
$('reset').addEventListener('click',()=>{rig.rotation.set(0,0,0);camera.rotation.set(0,0,0);lookPitch=0;camera.fov=75;camera.updateProjectionMatrix()});
$('preview-note').textContent=lang==='fr'?'Preview privée protégée par Vercel. Aucun code supplémentaire nécessaire.':lang==='ar'?'معاينة خاصة محمية بواسطة Vercel، دون رمز وصول إضافي.':'Private Preview protected by Vercel. No additional access code required.';
message(t.disabled);
