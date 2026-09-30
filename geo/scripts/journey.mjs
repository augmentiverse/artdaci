import {normalizeGeoLanguage} from './geo-core.mjs';

export const JOURNEY_COPY={
  fr:{enter:'Entrer dans le musée',back:'Retour au Louvre',xr:'Vue extérieure en VR',note:'Entrée narrative ARTDACI vers la Salle des États — pas une porte géographique du musée.',loading:'Préparation du passage…',failed:'Passage indisponible. Réessayez ou continuez la visite.',resume:'La scène est prête. Choisissez « Entrer en VR » pour reprendre la visite immersive.',vr:'Entrer en VR',exit:'Quitter la VR',unavailable:'VR indisponible',ready:'Louvre prêt',retry:'Réessayer',overview:'Vue générale'},
  en:{enter:'Enter the museum',back:'Return to the Louvre',xr:'Exterior VR view',note:'ARTDACI narrative entrance to the Salle des États — not a geographic museum doorway.',loading:'Preparing the passage…',failed:'Passage unavailable. Retry or continue your visit.',resume:'The scene is ready. Choose “Enter VR” to resume the immersive visit.',vr:'Enter VR',exit:'Exit VR',unavailable:'VR unavailable',ready:'Louvre ready',retry:'Retry',overview:'General view'},
  ar:{enter:'ادخل المتحف',back:'العودة إلى اللوفر',xr:'المشهد الخارجي بالواقع الافتراضي',note:'مدخل سردي من ARTDACI إلى قاعة الدول، وليس بابًا محددًا جغرافيًا للمتحف.',loading:'جارٍ تجهيز الانتقال…',failed:'الانتقال غير متاح. أعد المحاولة أو تابع الزيارة.',resume:'المشهد جاهز. اختر «دخول الواقع الافتراضي» لاستئناف الزيارة الغامرة.',vr:'دخول الواقع الافتراضي',exit:'الخروج من الواقع الافتراضي',unavailable:'الواقع الافتراضي غير متاح',ready:'اللوفر جاهز',retry:'إعادة المحاولة',overview:'منظر عام'},
};

export function journeyRoute(destination,language,source='remote'){
  if(!['room','remote','louvre-xr'].includes(destination))throw new Error('Invalid journey destination');
  const params=new URLSearchParams({lang:normalizeGeoLanguage(language)});
  if(destination==='room')params.set('from',source==='louvre-xr'?'louvre-xr':'remote');
  else params.set('return','room');
  return `${destination}.html?${params}`;
}
export function returnScene(search){return new URLSearchParams(search).get('from')==='louvre-xr'?'louvre-xr':'remote';}
export function validExteriorView(value){
  return value && [value.theta,value.phi,value.radius,value.fov].every(Number.isFinite)
    && value.phi>=0 && value.phi<=Math.PI && value.radius>0 && value.radius<100000
    && value.fov>=20 && value.fov<=70 ? {...value} : null;
}
export function readJourneyState(storage,key){try{return JSON.parse(storage.getItem('geo-v69-'+key));}catch{return null;}}
export function journeyStorage(){try{return window.sessionStorage;}catch{return null;}}
export function writeJourneyState(storage,key,value){try{storage.setItem('geo-v69-'+key,JSON.stringify(value));}catch{/* Private mode: coherent default view still works. */}}

// Move the tracked head across the floor while respecting the model's front edge.
export function exteriorWalk(head,forward,sideways,forwardAxis,sideAxis,seconds,bounds,speed=1.25){
  const magnitude=Math.max(1,Math.hypot(forwardAxis,sideAxis));
  const distance=speed*Math.max(0,Math.min(seconds,.05))/magnitude;
  const dx=(forward.x*forwardAxis+sideways.x*sideAxis)*distance;
  const dz=(forward.z*forwardAxis+sideways.z*sideAxis)*distance;
  return {x:Math.max(bounds.minX,Math.min(bounds.maxX,head.x+dx)),z:Math.max(bounds.minZ,Math.min(bounds.maxZ,head.z+dz))};
}

// One explicit activation, no redirect on arrival and no GLB prefetch.
export function createPassage({prepare,fade,endSession,release,navigate,onError=()=>{}}){
  let pending=null,departed=false;
  return {get busy(){return !!pending || departed;},go(){
    if(pending || departed)return pending || Promise.resolve(false);
    pending=Promise.resolve().then(async()=>{
      try{await prepare();await fade();await endSession();release();navigate();departed=true;return true;}
      catch(error){onError(error);return false;}
      finally{pending=null;}
    });
    return pending;
  }};
}

export function createJourney({destination,language,source='remote',getSession=()=>null,release=()=>{},saveState=()=>{},storage=journeyStorage()}){
  const copy=JOURNEY_COPY[language],href=journeyRoute(destination,language,source);
  const cover=document.createElement('div');cover.className='journey-cover';cover.hidden=true;cover.setAttribute('role','status');
  cover.textContent=copy.loading;document.body.append(cover);
  const notice=document.createElement('p');notice.className='journey-notice';notice.setAttribute('role','status');
  (document.querySelector('.room-main') || document.querySelector('.geo-shell') || document.body).append(notice);
  let fadingAt=null,wasVr=false;
  const passage=createPassage({
    prepare:async()=>{
      notice.textContent=copy.loading;
      const response=await fetch(href,{method:'HEAD',cache:'no-store',signal:AbortSignal.timeout(6000)});
      if(!response.ok)throw new Error('Destination HTTP '+response.status);
      wasVr=Boolean(getSession());saveState();
      writeJourneyState(storage,'passage',{destination,started:Date.now(),wasVr});
    },
    fade:()=>new Promise(resolve=>{
      fadingAt=performance.now();cover.hidden=false;
      // CSS and the XR render loop share the same short stationary fade.
      cover.classList.add('is-active');setTimeout(resolve,260);
    }),
    endSession:async()=>{const session=getSession();if(session)await session.end();},
    release,
    navigate:()=>location.assign(href),
    onError:error=>{fadingAt=null;cover.hidden=true;cover.classList.remove('is-active');notice.textContent=copy.failed;console.warn('GEO passage:',error);},
  });
  return {href,go:()=>passage.go(),get busy(){return passage.busy;},get fadeOpacity(){return fadingAt===null?0:Math.min(1,(performance.now()-fadingAt)/220);},
    bind(link){link.href=href;link.addEventListener('click',event=>{if(event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)return;event.preventDefault();passage.go();});},
    ready(element){
      const previous=readJourneyState(storage,'passage');
      const ownScene=location.pathname.split('/').pop().replace('.html','');
      if(previous?.destination===ownScene && Number.isFinite(previous.started) && Date.now()-previous.started<120000){
        element.dataset.passageMs=String(Date.now()-previous.started);
        if(previous.wasVr)notice.textContent=copy.resume;else notice.textContent='';
        writeJourneyState(storage,'lastMeasurement',{destination:ownScene,milliseconds:Date.now()-previous.started});
        writeJourneyState(storage,'passage',null);
      }
    },
    dispose(){cover.remove();notice.remove();},
  };
}

// A separate narrative control; does not alter artwork/guide hit regions.
export function createJourneyPortal(THREE,{scene,label,language,position,journey}){
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=160;
  const ctx=canvas.getContext('2d'),texture=new THREE.CanvasTexture(canvas);texture.encoding=THREE.sRGBEncoding;
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(.75,.1171875),new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide,transparent:true}));
  mesh.name='ARTDACI_narrative_passage';mesh.position.copy(position);mesh.visible=false;scene.add(mesh);
  const veil=new THREE.Mesh(new THREE.SphereGeometry(.3,16,12),new THREE.MeshBasicMaterial({color:0x000000,side:THREE.BackSide,transparent:true,depthTest:false,depthWrite:false,opacity:0}));
  veil.frustumCulled=false;veil.renderOrder=10000;veil.visible=false;scene.add(veil);
  let hover=false;
  function draw(){ctx.clearRect(0,0,1024,160);ctx.fillStyle=hover?'#8de2ed':'#211c17ee';ctx.fillRect(0,0,1024,160);ctx.strokeStyle='#e2c58f';ctx.lineWidth=5;ctx.strokeRect(3,3,1018,154);ctx.fillStyle=hover?'#21190e':'#fff6e8';ctx.textAlign='center';ctx.direction=language==='ar'?'rtl':'ltr';ctx.font='600 52px system-ui';ctx.fillText(label,512,99,970);texture.needsUpdate=true;}
  draw();
  return {mesh,
    hit(ray){if(!mesh.visible || journey.busy)return null;mesh.updateMatrixWorld(true);const hit=ray.intersectObject(mesh,false)[0];return hit?{kind:'panel',action:'journey',distance:hit.distance,point:hit.point}:null;},
    setHover(value){if(hover===value)return;hover=value;draw();},
    update(cameraMatrix,isVr){mesh.visible=isVr;veil.visible=isVr && journey.fadeOpacity>0;veil.material.opacity=journey.fadeOpacity;veil.position.setFromMatrixPosition(cameraMatrix);},
    dispose(){scene.remove(mesh,veil);texture.dispose();mesh.geometry.dispose();mesh.material.dispose();veil.geometry.dispose();veil.material.dispose();},
  };
}
