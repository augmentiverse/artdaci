import {resolveManifestMedia, selectMediaAsset} from '../../scripts/artwork-media-manifest-core.mjs';
import {readStick} from './room-navigation.mjs';

export const HUB_IDS = Object.freeze({ld:['ld01','ld06','ld02'],ve:['ve01','ve05','ve02'],vg:['vg01','vg02','vg03'],mo:['mo01','mo03','mo06']});
export const HUB_LANGUAGES = ['fr','en','ar'];
export const HUB_MUSEUMS = new Set(['louvre','czartoryski','mauritshuis','van-gogh-museum','national-gallery-of-art-washington']);
export const HUB_COPY = {
  fr:{back:'Retour à ARTDACI GEO',subtitle:'Galerie virtuelle ARTDACI',intro:'Quatre peintres, douze œuvres. Explorez librement cette création virtuelle ARTDACI.',fiction:'Galerie imaginée par ARTDACI, indépendante de tout musée réel.',free:'Explorer librement',guide:'Guide bientôt disponible',reserved:'Emplacement du futur guide',vr:'Entrer en VR',exitVr:'Quitter la VR',noVr:'VR indisponible ici',xrError:'Impossible de démarrer la VR. Réessayez.',loading:'Préparation de la galerie…',ready:'Galerie prête',failed:'La galerie ne peut pas être chargée. Revenez à ARTDACI GEO pour réessayer.',controls:'Glisser pour regarder · flèches ↑ ↓ ← → ou WASD / ZQSD pour se déplacer',xrControls:'Stick gauche : marcher · stick droit : tourner · viser le sol et gâchette : téléporter · viser une œuvre : découvrir',forward:'Avancer',backward:'Reculer',left:'À gauche',right:'À droite',turnLeft:'Tourner à gauche',turnRight:'Tourner à droite',about:'À propos',image:'Voir l’image',audio:'Écouter',pause:'Pause',museum:'Galerie musée ARTDACI',goToArtwork:'Aller au tableau',return:'Retour',choose:'Choisissez une action pour découvrir cette œuvre.',mediaLoading:'Vérification des médias…',mediaFailed:'Médias distants indisponibles. Les informations restent accessibles.',imageFailed:'Image indisponible',audioFailed:'Audio indisponible. Vous pouvez réessayer.',museumNote:'Ce lien ouvre une galerie virtuelle ARTDACI du musée ; il ne confirme pas l’exposition actuelle de cette œuvre.',works:'Les douze œuvres',retry:'Réessayer',fullscreen:'Plein écran'},
  en:{back:'Back to ARTDACI GEO',subtitle:'ARTDACI Virtual Gallery',intro:'Four painters, twelve works. Freely explore this virtual creation by ARTDACI.',fiction:'A gallery imagined by ARTDACI, independent of any real museum.',free:'Explore freely',guide:'Guide coming soon',reserved:'Future guide location',vr:'Enter VR',exitVr:'Exit VR',noVr:'VR unavailable here',xrError:'Unable to start VR. Please try again.',loading:'Preparing the gallery…',ready:'Gallery ready',failed:'The gallery could not load. Return to ARTDACI GEO to try again.',controls:'Drag to look · ↑ ↓ ← → arrows or WASD / ZQSD to move',xrControls:'Left stick: walk · right stick: turn · aim at floor and trigger: teleport · aim at artwork: discover',forward:'Forward',backward:'Backward',left:'Left',right:'Right',turnLeft:'Turn left',turnRight:'Turn right',about:'About',image:'View image',audio:'Listen',pause:'Pause',museum:'ARTDACI museum gallery',goToArtwork:'Go to artwork',return:'Back',choose:'Choose an action to discover this artwork.',mediaLoading:'Checking media…',mediaFailed:'Remote media unavailable. Artwork information remains accessible.',imageFailed:'Image unavailable',audioFailed:'Audio unavailable. You can try again.',museumNote:'This link opens an ARTDACI virtual museum gallery; it does not confirm that this work is currently on display.',works:'The twelve artworks',retry:'Retry',fullscreen:'Fullscreen'},
  ar:{back:'العودة إلى ARTDACI GEO',subtitle:'معرض ARTDACI الافتراضي',intro:'أربعة رسامين واثنا عشر عملاً. استكشف بحرية هذا الإبداع الافتراضي من ARTDACI.',fiction:'معرض من تصور ARTDACI، مستقل عن أي متحف حقيقي.',free:'استكشف بحرية',guide:'الدليل متاح قريبًا',reserved:'مكان الدليل المستقبلي',vr:'الدخول إلى الواقع الافتراضي',exitVr:'مغادرة الواقع الافتراضي',noVr:'الواقع الافتراضي غير متاح هنا',xrError:'تعذر بدء الواقع الافتراضي. حاول مجددًا.',loading:'جارٍ تحضير المعرض…',ready:'المعرض جاهز',failed:'تعذر تحميل المعرض. عد إلى ARTDACI GEO للمحاولة مجددًا.',controls:'اسحب للنظر · الأسهم ↑ ↓ ← → أو WASD أو ZQSD للتنقل',xrControls:'العصا اليسرى للمشي واليمنى للدوران. وجّه نحو الأرض واضغط الزناد للانتقال، أو نحو لوحة لاكتشافها.',forward:'تقدم',backward:'تراجع',left:'يسار',right:'يمين',turnLeft:'استدر يسارًا',turnRight:'استدر يمينًا',about:'عن العمل',image:'شاهد الصورة',audio:'استمع',pause:'إيقاف مؤقت',museum:'معرض المتحف في ARTDACI',goToArtwork:'الذهاب إلى اللوحة',return:'العودة',choose:'اختر إجراءً لاكتشاف هذا العمل الفني.',mediaLoading:'جارٍ التحقق من الوسائط…',mediaFailed:'الوسائط البعيدة غير متاحة. تظل معلومات العمل متاحة.',imageFailed:'الصورة غير متاحة',audioFailed:'الصوت غير متاح. يمكنك المحاولة مجددًا.',museumNote:'يفتح الرابط معرضًا افتراضيًا للمتحف في ARTDACI، ولا يؤكد أن هذا العمل معروض حاليًا.',works:'الأعمال الاثنا عشر',retry:'أعد المحاولة',fullscreen:'ملء الشاشة'}
};
export const HUB_LOCAL_AUDIO_COPY=Object.freeze({fr:'Audio local dans la langue choisie',en:'Local audio in the selected language',ar:'صوت محلي باللغة المختارة'});
export const HUB_GUIDE_COPY=Object.freeze({
  fr:{call:'Appeler Leonardo',loading:'Chargement de Leonardo…',ready:'Leonardo est prêt',failed:'Leonardo est indisponible. Réessayez.',release:'Libérer Leonardo',guide:'Guide virtuel',artists:{ld:{call:'Appeler Leonardo',loading:'Chargement de Leonardo…',ready:'Leonardo est prêt',failed:'Leonardo est indisponible. Réessayez.',release:'Libérer Leonardo'},ve:{call:'Appeler Vermeer',loading:'Chargement de Vermeer…',ready:'Vermeer est prêt',failed:'Vermeer est indisponible. Réessayez.',release:'Libérer Vermeer'},vg:{call:'Appeler Van Gogh',loading:'Chargement de Van Gogh…',ready:'Van Gogh est prêt',failed:'Van Gogh est indisponible. Réessayez.',release:'Libérer Van Gogh'},mo:{call:'Appeler Monet',loading:'Chargement de Monet…',ready:'Monet est prêt',failed:'Monet est indisponible. Réessayez.',release:'Libérer Monet'}}},
  en:{call:'Call Leonardo',loading:'Loading Leonardo…',ready:'Leonardo is ready',failed:'Leonardo is unavailable. Try again.',release:'Release Leonardo',guide:'Virtual guide',artists:{ld:{call:'Call Leonardo',loading:'Loading Leonardo…',ready:'Leonardo is ready',failed:'Leonardo is unavailable. Try again.',release:'Release Leonardo'},ve:{call:'Call Vermeer',loading:'Loading Vermeer…',ready:'Vermeer is ready',failed:'Vermeer is unavailable. Try again.',release:'Release Vermeer'},vg:{call:'Call Van Gogh',loading:'Loading Van Gogh…',ready:'Van Gogh is ready',failed:'Van Gogh is unavailable. Try again.',release:'Release Van Gogh'},mo:{call:'Call Monet',loading:'Loading Monet…',ready:'Monet is ready',failed:'Monet is unavailable. Try again.',release:'Release Monet'}}},
  ar:{call:'استدعاء ليوناردو',loading:'جارٍ تحميل ليوناردو…',ready:'ليوناردو جاهز',failed:'ليوناردو غير متاح. حاول مجددًا.',release:'تحرير ليوناردو',guide:'الدليل الافتراضي',artists:{ld:{call:'استدعاء ليوناردو',loading:'جارٍ تحميل ليوناردو…',ready:'ليوناردو جاهز',failed:'ليوناردو غير متاح. حاول مجددًا.',release:'تحرير ليوناردو'},ve:{call:'استدعاء فيرمير',loading:'جارٍ تحميل فيرمير…',ready:'فيرمير جاهز',failed:'فيرمير غير متاح. حاول مجددًا.',release:'تحرير فيرمير'},vg:{call:'استدعاء فان غوخ',loading:'جارٍ تحميل فان غوخ…',ready:'فان غوخ جاهز',failed:'فان غوخ غير متاح. حاول مجددًا.',release:'تحرير فان غوخ'},mo:{call:'استدعاء مونيه',loading:'جارٍ تحميل مونيه…',ready:'مونيه جاهز',failed:'مونيه غير متاح. حاول مجددًا.',release:'تحرير مونيه'}}}
});

export function validateHub(config,catalog){
  const errors=[];
  if(config?.id!=='artdaci-masters-hub'||config?.version!=='6.13'||config?.kind!=='virtual-artdaci-gallery')errors.push('Invalid Hub identity');
  if(config?.artists?.length!==4)errors.push('Expected four artists');
  const seen=new Set();
  for(const artist of config?.artists||[]){
    const expected=HUB_IDS[artist.artistId];
    if(!expected||seen.has(artist.artistId))errors.push('Invalid artist');
    seen.add(artist.artistId);
    if(JSON.stringify(artist.works?.map(w=>w.artworkId))!==JSON.stringify(expected))errors.push('Invalid artwork selection');
    const guideStatus=['ld','ve','vg','mo'].includes(artist.artistId)?'available':'reserved';
    if(artist.guide?.status!==guideStatus||!artist.guide?.guideId||Object.keys(artist.guide).some(k=>!['status','guideId'].includes(k)))errors.push('Invalid guide availability');
    if(!['north','east','south','west'].includes(artist.zone?.wall))errors.push('Invalid zone');
    for(const language of HUB_LANGUAGES)if(!artist.name?.[language]||!config.subtitle?.[language])errors.push('Missing translation');
    for(const work of artist.works||[]){
      const entry=catalog?.artworks?.find(a=>a.id===work.artworkId);
      if(!entry||entry.artistId!==artist.artistId||entry.status!=='active'||entry.manifest?.path!==`artworks/${work.artworkId}/manifest.json`)errors.push('Invalid canonical artwork');
      for(const key of ['thumbnail','imageFallback'])if(!/^(assets|geo\/media)\/[^?#]+\.(webp|png|jpe?g)$/i.test(work[key]||'')||work[key].includes('..'))errors.push('Invalid local image');
      if(work.imagePresentation&&((work.imagePresentation.source!=='hub-local'&&!/^[a-z0-9-]+$/.test(work.imagePresentation.manifestKey||''))||!/^[a-f0-9]{64}$/i.test(work.imagePresentation.sha256||'')||work.thumbnail!==work.imageFallback))errors.push('Invalid pinned image presentation');
      for(const [language,audio] of Object.entries(work.audioPresentation||{}))if(!localHubAudio(work,language)||audio.language!==language)errors.push('Invalid local audio presentation');
      for(const language of HUB_LANGUAGES)if(!work.title?.[language]||!work.description?.[language])errors.push('Missing artwork translation');
      if(work.museumId!==null&&!HUB_MUSEUMS.has(work.museumId))errors.push('Unknown museum route');
    }
  }
  if(new Set(config?.artists?.map(a=>a.zone?.wall)).size!==4)errors.push('Zones must occupy four walls');
  return errors;
}

export function museumRoute(id,language){
  return HUB_MUSEUMS.has(id)?`../gallery-vr.html?room=museums&museum=${id}&lang=${HUB_LANGUAGES.includes(language)?language:'fr'}`:null;
}
export function resolveHubImage(work,manifest){
  // Explicit user-selected Hub image, independent of the global manifest.
  if(work.imagePresentation?.source==='hub-local')return {status:'local-fallback',url:work.imageFallback};
  // A configured presentation is an explicit canonical image variant. Never
  // replace it with main: main may depict a different portrait or crop.
  const selection=work.imagePresentation,key=selection?.manifestKey||'main';
  const asset=manifest?.id===work.artworkId?manifest.media?.images?.[key]:null;
  const identityMatches=!selection||asset?.sha256?.toLowerCase()===selection.sha256.toLowerCase();
  let status=asset?.available===false&&asset.migrationStatus==='planned'?'planned':'missing';
  if(asset?.available===true&&identityMatches){
    if(['image/jpeg','image/png','image/webp'].includes(asset.mimeType)){
      try{const url=resolveManifestMedia(manifest,`images.${key}`);if(url)return {status:'available',url};}catch{status='unsupported';}
    }else status='unsupported';
  }
  return work.imageFallback?{status:'local-fallback',url:work.imageFallback}:{status,url:null};
}
export function resolveHubMedia(work,manifest,language){
  const audioCandidates=hubAudioCandidates(work,manifest,language);
  return {audio:audioCandidates[0]?.url||null,audioCandidates,imageCandidates:hubImageCandidates(work,resolveHubImage(work,manifest)),museum:museumRoute(work.museumId,language)};
}
export function hubAudioCandidates(work,manifest,language){
  const valid=manifest?.id===work.artworkId;
  let audio=null;
  if(valid){
    const key=`audio.overview.${language}`,asset=selectMediaAsset(manifest,key,language);
    // Deliberately exact-language: never substitute defaultLanguage for Arabic.
    if(asset?.available===true&&asset.language===language&&['audio/mpeg','audio/mp4'].includes(asset.mimeType)){
      try{audio=resolveManifestMedia(manifest,key,language);}catch{}
    }
  }
  const local=localHubAudio(work,language);
  return [...(audio?[{status:'available',url:audio}]:[]),...(local?[local]:[])];
}
export function localHubAudio(work,language){
  const audio=work.audioPresentation?.[language];
  if(!HUB_LANGUAGES.includes(language)||audio?.language!==language||!/^[a-f0-9]{64}$/i.test(audio.sha256||''))return null;
  const expected=`geo/media/${work.artworkId}/`;
  if(!audio.path?.startsWith(expected)||!/^geo\/media\/[a-z0-9-]+\/[a-z0-9-]+\.mp3$/.test(audio.path))return null;
  return {status:'local-fallback',url:audio.path};
}
export function readHubKeyboard(keys){
  return {
    forward:Number(keys.has('ArrowUp')||keys.has('KeyW')||keys.has('KeyZ'))-Number(keys.has('ArrowDown')||keys.has('KeyS')),
    side:Number(keys.has('ArrowRight')||keys.has('KeyD'))-Number(keys.has('ArrowLeft')||keys.has('KeyA')||keys.has('KeyQ'))
  };
}
export function hubImageCandidates(work,image){
  // Pinned presentations reuse the exact already displayed local file first.
  // The canonical variant is a byte-verified alternate, never another image.
  return [...new Set((work.imagePresentation?[work.imageFallback,image.url]:[image.url,work.imageFallback]).filter(Boolean))];
}
export function artworkActions(media,language,playing=false){
  const c=HUB_COPY[language];
  return [{id:'about',label:c.about},{id:'image',label:c.image},...(media?.audio?[{id:'audio',label:playing?c.pause:c.audio}]:[]),...(media?.museum?[{id:'museum',label:c.museum}]:[]),{id:'return',label:c.return}];
}
export async function loadHubManifest(artworkId,{fetchImpl=fetch,rootUrl,timeoutMs=5000}={}){
  const urls=[`https://media.artdaci.com/artworks/${artworkId}/manifest.json`,new URL(`content/media-manifests/artworks/${artworkId}/manifest.json`,rootUrl).href];
  for(const url of urls){
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeoutMs);
    try{const response=await fetchImpl(url,{signal:controller.signal,cache:'no-store'});if(!response.ok)continue;const m=await response.json();if(m.id===artworkId)return m;}catch{}finally{clearTimeout(timer);}
  }
  return null;
}
export function wallPlacement(wall,slot){
  const offset=(slot-1)*4.8;
  return {north:{x:offset,z:-9.7,yaw:0},east:{x:9.7,z:offset,yaw:-Math.PI/2},south:{x:-offset,z:9.7,yaw:Math.PI},west:{x:-9.7,z:-offset,yaw:Math.PI/2}}[wall];
}
export function readHubSticks(sources){
  let left={x:0,y:0},right={x:0,y:0};
  for(const source of sources){if(source.handedness==='left')left=readStick(source);if(source.handedness==='right')right=readStick(source);}
  return {left,right};
}
export function createSelectionGate(){
  let revision=0;
  return {next:()=>++revision,current:token=>token===revision};
}
export function panelButtonAt(buttons,x,y){return buttons.find(b=>x>=b.x&&x<=b.x+b.width&&y>=b.y&&y<=b.y+b.height)?.id||null;}
export function layoutHubButtons(actions,rtl=false){
  const dense=actions.length>4;
  return actions.map((action,i)=>{const full=i===actions.length-1,col=rtl?1-i%2:i%2,row=full?Math.ceil(i/2):Math.floor(i/2);return {...action,x:full?52:52+col*474,y:(dense?550:576)+row*(dense?68:99),width:full?920:446,height:dense?60:80};});
}
export function firstHubHit(panelHit,objectHits){
  // A panel surface blocks selection/teleportation even between its buttons.
  return panelHit?{...panelHit,kind:'panel'}:objectHits[0]||null;
}
