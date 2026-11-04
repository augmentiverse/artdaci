import * as THREE from 'three';
import {bearingVector} from './streetview-xr-core.mjs';
const params=new URLSearchParams(location.search);
const lang=['en','fr','ar'].includes(params.get('lang'))?params.get('lang'):'fr';
const labels={
fr:{title:'ARTDACI Museum XR',intro:'Exploration WebXR expérimentale. Les visites originales restent disponibles.',start:'Chercher une salle intérieure',demo:'Tester Street View 360° (extérieur possible)',demoReady:'Panorama de démonstration près du musée : il ne représente pas une salle d’exposition vérifiée.',retry:'Google refuse une tuile : essai avec une résolution inférieure…',lowerQuality:' (qualité réduite pour compatibilité)',quality:'Qualité',hd:'Haute définition · qualité selon la source',standard:'Standard · qualité réduite',loading:'Chargement des tuiles',controls:'Faites glisser la vue pour regarder autour de vous ; utilisez la molette pour zoomer. En VR, tournez la tête ou utilisez le joystick droit.',hdError:'Tuiles haute définition indisponibles pour cette vue. La résolution 2K ne répond pas au niveau de qualité demandé.',imageKind:'Pour voir les œuvres dans leurs salles, utilisez la visite officielle. Le mode Street View 360° est une expérience expérimentale de proximité, parfois extérieure, et ne reproduit pas la salle du tableau.',enter:'Entrer en VR',exit:'Quitter la VR',reset:'Recentrer',official:'Visite officielle',disabled:'Preview privée : choisissez un mode et chargez un panorama.',empty:'Aucun panorama intérieur équivalent confirmé. La visite officielle reste accessible.',ready:'Panorama disponible : exploration possible.',nearby:'Vue intérieure à proximité, salle et œuvre non vérifiées.',nearestOutdoor:'Google Maps Tiles propose une vue extérieure, pas une vue intérieure vérifiable.',error:'Accès indisponible ou limite atteinte.',bad:'Authentification Vercel requise pour accéder à cette Preview.',next:'Vue voisine',zoomIn:'Zoom +',zoomOut:'Zoom −',moreViews:'Sélectionnez une direction pour passer à une vue voisine (dans un rayon limité autour du musée).',outside:'Cette direction quitte la zone autorisée du pilote.',credit:'Crédits de panorama',note:'Les panoramas Google Arts & Culture et Map Tiles ne sont pas nécessairement identiques.'},
en:{title:'ARTDACI Museum XR',intro:'Experimental WebXR museum exploration. Official tours remain available.',start:'Find indoor museum view',demo:'Try Street View 360° (may be outdoors)',demoReady:'360° demo near the museum — not verified as an exhibition room.',retry:'Google rejected an image tile; trying a lower resolution…',lowerQuality:' (lower resolution for compatibility)',quality:'Quality',hd:'High definition · source-dependent',standard:'Standard · reduced quality',loading:'Loading tiles',controls:'Drag to look around, scroll to zoom. In VR turn your head or use the right thumbstick.',hdError:'High-definition tiles are unavailable for this panorama. The 2K image does not meet the requested quality.',imageKind:'Use the official visit to see artworks inside the museum. Street View 360° here is a nearby experimental view, sometimes outdoors, and is not necessarily the artwork’s room.',enter:'Enter VR',exit:'Exit VR',reset:'Recenter',official:'Official tour',disabled:'Private Preview: choose a mode and load a panorama.',empty:'No matching indoor panorama confirmed. Official tour is still accessible.',ready:'Panorama available. Immersive exploration is ready.',nearby:'Nearby indoor view; exhibition room and artwork not verified.',nearestOutdoor:'Maps Tiles offers outdoor imagery here, not a verified indoor view.',error:'Unavailable or daily limit reached.',bad:'Vercel authentication is required to access this Preview.',next:'Nearby view',zoomIn:'Zoom in',zoomOut:'Zoom out',moreViews:'Choose an arrow to travel to an adjacent view within the limited museum vicinity.',outside:'This direction is beyond the allowed pilot area.',credit:'Panorama credits',note:'Google Arts & Culture and Maps Tiles panoramas may be different.'},
ar:{title:'ARTDACI Museum XR',intro:'استكشاف متاحف تجريبي عبر WebXR. الجولات الرسمية متاحة.',start:'البحث عن مشهد داخلي',demo:'تجربة ستريت فيو 360° (قد يكون خارجياً)',demoReady:'عرض تجريبي قريب من المتحف؛ ليس قاعة عرض موثّقة.',retry:'تعذّر تحميل صورة؛ ستتم تجربة دقة أقل…',lowerQuality:' (دقة منخفضة للتوافق)',quality:'الجودة',hd:'دقة عالية · حسب المصدر',standard:'عادي · جودة مخفضة',loading:'تحميل الصور',controls:'اسحب لتغيير اتجاه النظر، واستخدم عجلة الفأرة للتقريب. في VR أدر رأسك أو استعمل عصا التحكم اليمنى.',hdError:'الصور عالية الدقة غير متاحة لهذا المشهد. جودة 2K لا تلبي مستوى الجودة المطلوب.',imageKind:'لرؤية الأعمال داخل قاعات المتحف استخدم الجولة الرسمية. هنا تجربة بانورامية قريبة قد تكون خارجية ولا تمثل بالضرورة قاعة اللوحة.',enter:'الدخول إلى VR',exit:'الخروج من VR',reset:'إعادة التوجيه',official:'الجولة الرسمية',disabled:'معاينة خاصة: اختر وضعاً وحمّل المشهد.',empty:'لا يوجد مشهد داخلي مطابق مؤكد. الجولة الرسمية متاحة.',ready:'المشهد متاح للاستكشاف.',nearby:'مشهد داخلي قريب؛ لم يتم التحقق من القاعة أو اللوحة.',nearestOutdoor:'خرائط جوجل تعرض مشهداً خارجياً، وليس مشهداً داخلياً موثّقاً.',error:'الخدمة غير متاحة أو تجاوزت الحد اليومي.',bad:'تتطلب المعاينة الخاصة مصادقة Vercel.',next:'مشهد مجاور',zoomIn:'تقريب +',zoomOut:'إبعاد −',moreViews:'اختر سهماً للانتقال إلى مشهد قريب ضمن نطاق المتحف التجريبي.',outside:'هذا الاتجاه خارج نطاق النسخة التجريبية.',credit:'حقوق الصورة',note:'قد تختلف مشاهد Google Arts & Culture عن Maps Tiles.'}
};
const t=labels[lang],$=id=>document.getElementById(id);
document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr';
$('title').textContent=t.title;$('intro').textContent=t.intro;
$('start').textContent=t.start;$('demo').textContent=t.demo;$('zoom-in').textContent=t.zoomIn;$('zoom-out').textContent=t.zoomOut;$('links-help').textContent=t.moreViews;$('enter-vr').textContent=t.enter;$('reset').textContent=t.reset;
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
// Quest Touch controller target-ray spaces: visible lasers and hover highlights
// clarify when the trigger can activate a nearby panorama. A gaze fallback and
// A/X button navigation assist make hotspots usable without pixel-perfect aim.
const raycaster=new THREE.Raycaster();
const tempOrigin=new THREE.Vector3(),tempDirection=new THREE.Vector3();
const tempQuaternion=new THREE.Quaternion(),rayOrigins=new THREE.Vector3();
const controllerRays=[],buttonStates=new Map();
let lastXRSelection=0,neighborCycleIndex=0,toastUntil=0;
const toastCanvas=document.createElement('canvas');toastCanvas.width=1024;toastCanvas.height=180;
const toastCtx=toastCanvas.getContext('2d');
const toastTexture=new THREE.CanvasTexture(toastCanvas);
const toastPanel=new THREE.Mesh(new THREE.PlaneGeometry(1.9,.34),new THREE.MeshBasicMaterial({
  map:toastTexture,transparent:true,depthTest:false,side:THREE.DoubleSide
}));
toastPanel.visible=false;toastPanel.renderOrder=25;scene.add(toastPanel);
function vrNotice(value){
 if(!renderer.xr.isPresenting||!toastCtx)return;
 const str=String(value||'').slice(0,110);
 toastCtx.clearRect(0,0,1024,180);
 toastCtx.fillStyle='rgba(8,20,31,0.94)';toastCtx.fillRect(0,0,1024,180);
 toastCtx.strokeStyle='#e4bd7c';toastCtx.lineWidth=5;toastCtx.strokeRect(4,4,1016,172);
 toastCtx.font='38px system-ui';toastCtx.fillStyle='#fff';
 // Two short lines ensure the text remains readable in Quest optics.
 const tokens=str.split(/\s+/),lines=[''];
 for(const token of tokens){const idx=lines.length-1;
  if(toastCtx.measureText(lines[idx]+' '+token).width>890&&lines.length<2)lines.push(token);
  else lines[idx]+=(lines[idx]?' ':'')+token;
 }
 for(let n=0;n<lines.length;n++)toastCtx.fillText(lines[n].slice(0,55),32,68+n*60);
 toastTexture.needsUpdate=true;toastPanel.visible=true;toastUntil=performance.now()+3600;
}
function controllerHit(controller){
 controller.updateWorldMatrix(true,false);
 const origin=controller.getWorldPosition(tempOrigin);
 const dir=tempDirection.set(0,0,-1).transformDirection(controller.matrixWorld);
 raycaster.set(origin,dir);
 return raycaster.intersectObjects(hotspots.children,false)[0]||null;
}
function gazeHit(){
 const headset=renderer.xr.getCamera();
 if(!headset)return null;
 headset.updateWorldMatrix(true,false);
 const origin=headset.getWorldPosition(tempOrigin);
 const dir=tempDirection.set(0,0,-1).applyQuaternion(headset.getWorldQuaternion(tempQuaternion));
 raycaster.set(origin,dir);
 return raycaster.intersectObjects(hotspots.children,false)[0]||null;
}
function activateXRHotspot(controller){
 if(loading||!renderer.xr.isPresenting||performance.now()-lastXRSelection<500)return;
 scene.updateMatrixWorld(true);
 const selected=controllerHit(controller)||gazeHit();
 if(!selected?.object?.userData?.panoId){vrNotice(t.aim);return}
 lastXRSelection=performance.now();
 vrNotice(t.opening);
 loadNeighbor(selected.object.userData.panoId).then(()=>vrNotice(t.arrived)).catch(reportError);
}
const laserGeometry=new THREE.BufferGeometry().setFromPoints([
 new THREE.Vector3(0,0,0),new THREE.Vector3(0,0,-1)
]);
for(let i=0;i<2;i++){
 const controller=renderer.xr.getController(i);
 const laser=new THREE.Line(laserGeometry,new THREE.LineBasicMaterial({
   color:0xb5e7ff,transparent:true,opacity:.8,depthTest:false
 }));
 laser.renderOrder=15;laser.visible=false;laser.scale.z=4;controller.add(laser);
 const info={controller,laser,connected:false};
 controller.addEventListener('connected',()=>{info.connected=true});
 controller.addEventListener('disconnected',()=>{info.connected=false;laser.visible=false});
 // Touch controllers generally produce selectstart + select; the debounce
 // prevents two transitions for one squeeze.
 controller.addEventListener('selectstart',()=>activateXRHotspot(controller));
 controller.addEventListener('select',()=>activateXRHotspot(controller));
 rig.add(controller);controllerRays.push(info);
}
function activateNextXRNeighbor(){
 if(loading||!currentMeta?.links?.length||performance.now()-lastXRSelection<500)return;
 const options=currentMeta.links.filter(item=>typeof item.panoId==='string'&&Number.isFinite(item.heading)).slice(0,8);
 if(!options.length)return;
 lastXRSelection=performance.now();
 const chosen=options[neighborCycleIndex++%options.length];
 vrNotice(t.opening);
 loadNeighbor(chosen.panoId).then(()=>vrNotice(t.arrived)).catch(reportError);
}
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
 const head=session?renderer.xr.getCamera():camera;
 // Position nearby panorama markers at eye level rather than world-floor
 // level, which otherwise makes a controller ray miss in a seated Quest.
 head.getWorldPosition(rayOrigins);
 hotspots.position.copy(rayOrigins);hotspots.position.y-=0.13;
 if(session){
  // Quest thumbstick provides seated snap-free turning; head tracking remains
  // the natural way to look up/down and around.
  const right=[...session.inputSources].find(x=>x.handedness==='right'&&x.gamepad);
  const axes=right?.gamepad?.axes||[];
  const axis=axes.length>=3?axes[2]:(axes[0]||0);
  if(Math.abs(axis)>0.24)rig.rotation.y-=axis*dt*1.4;
 }
 scene.updateMatrixWorld(true);
 const hovering=new Set();
 for(const {controller,laser,connected} of controllerRays){
   laser.visible=Boolean(session&&connected);
   if(!laser.visible)continue;
   const hit=controllerHit(controller);
   laser.material.color.setHex(hit?0x65ffe1:0xb5e7ff);
   laser.scale.z=hit?Math.min(hit.distance,4.0):4.0;
   if(hit)hovering.add(hit.object);
 }
 if(session){
   const lookedAt=gazeHit();if(lookedAt)hovering.add(lookedAt.object);
   // A/X on Quest Touch is a robust alternative when a small target cannot
   // be selected by ray; it cycles through Google-linked panorama directions.
   for(const [index,source] of [...session.inputSources].entries()){
    const button=Boolean(source.gamepad?.buttons?.[4]?.pressed);
    const key=source.handedness||String(index);
    if(button&&!buttonStates.get(key))activateNextXRNeighbor();
    buttonStates.set(key,button);
   }
   toastPanel.visible=toastUntil>performance.now();
   if(toastPanel.visible){
     head.getWorldPosition(tempOrigin);
     head.getWorldQuaternion(tempQuaternion);
     toastPanel.position.copy(tempOrigin).add(new THREE.Vector3(0,-.26,-1.4).applyQuaternion(tempQuaternion));
     toastPanel.quaternion.copy(tempQuaternion);
   }
 }else{toastPanel.visible=false;buttonStates.clear()}
 for(const target of hotspots.children){
   const active=hovering.has(target);
   target.material.color.setHex(active?0x65ffe1:0xe4bd7c);
   target.scale.setScalar(active?1.20:1);
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
function addHotspots(metadata){
 clearHotspots();neighborCycleIndex=0;
 // Only links supplied by Google metadata can be selected, never arbitrary IDs.
 const labels=['N','NE','E','SE','S','SW','W','NW'];
 for(const item of (metadata.links||[]).slice(0,8)){
  if(!item.panoId||!Number.isFinite(item.heading))continue;
  const position=bearingVector(item.heading,3);
  const mesh=new THREE.Mesh(new THREE.SphereGeometry(.34,20,16),new THREE.MeshBasicMaterial({color:'#e4bd7c'}));
  mesh.position.set(position.x,0,position.z);
  mesh.userData.panoId=item.panoId;
  hotspots.add(mesh);
  const direction=labels[Math.round((((item.heading%360)+360)%360)/45)%8];
  const button=document.createElement('button');
  button.className='secondary';
  button.textContent=t.next+' · '+direction+' ('+Math.round(item.heading)+'°)';
  button.title=String(item.text||'').slice(0,80);
  button.addEventListener('click',()=>loadNeighbor(item.panoId).catch(reportError));
  $('links').append(button);
 }
 $('links-help').hidden=hotspots.children.length===0;
}
async function showPanorama(result){
 let resolved=result,dim=result.dimension,target=null;
 if(!result.metadata?.copyright||!dim||!result.ticket)throw Error('Invalid gateway metadata');
 // Up to 28 tiles at zoom 3 for a 13,312px source; only two simultaneous
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
 addHotspots(meta); // outdoor demo may link to safe neighboring Street View scenes
 message((resolved.selectionMode==='location-demo-unverified'?t.demoReady:resolved.selectionMode==='nearby-unverified'?t.nearby:t.ready)+' · '+dim.width+' × '+dim.height+' px'+(dim.zoom<2?t.lowerQuality:''));
 $('enter-vr').disabled=!Boolean(await navigator.xr?.isSessionSupported?.('immersive-vr').catch(()=>false));
}
async function loadNeighbor(panoId){if(loading)return;loading=true;try{const data=await request({action:'neighbor',ticket,panoId});await showPanorama(data)}finally{loading=false}}
function reportError(error){console.warn('Museum XR preview:',error.message);
 if(renderer.xr.isPresenting)vrNotice(error.status===403?t.outside:t.loadFailed);
 if(error.status===403&&error.detail?.startsWith('NEIGHBOR_')){message(t.outside);return}
 if(error.hdUnavailable){message(t.hdError+(error.status?' · HTTP '+error.status:'')+(error.detail?' · '+error.detail:''));return}const empty=error.status===404&&error.detail?.includes('nearest-outdoor')?t.nearestOutdoor:t.empty;message((error.status===401?t.bad:error.status===404?empty:error.status===503?t.disabled:t.error)+(error.status?' · HTTP '+error.status:'')+(error.detail?' · '+error.detail:''))}
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
function setDesktopZoom(step){
 if(renderer.xr.isPresenting)return; // headset WebXR controls its own projection
 camera.fov=THREE.MathUtils.clamp(camera.fov+step,40,100);
 camera.updateProjectionMatrix();
}
$('zoom-in').addEventListener('click',()=>setDesktopZoom(-8));
$('zoom-out').addEventListener('click',()=>setDesktopZoom(8));
$('reset').addEventListener('click',()=>{rig.rotation.set(0,0,0);camera.rotation.set(0,0,0);lookPitch=0;camera.fov=75;camera.updateProjectionMatrix()});
$('preview-note').textContent=lang==='fr'?'Preview privée protégée par Vercel. Aucun code supplémentaire nécessaire.':lang==='ar'?'معاينة خاصة محمية بواسطة Vercel، دون رمز وصول إضافي.':'Private Preview protected by Vercel. No additional access code required.';
message(t.disabled);
