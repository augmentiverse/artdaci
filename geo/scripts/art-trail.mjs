import {localize,projectAssetUrl} from './geo-core.mjs';
import {resolveManifestMedia} from '../../scripts/artwork-media-manifest-core.mjs';

export const TRAIL_SESSION_KEY='artdaci-geo-v611-louvre';
export const DISPLAY_STATUSES=['on-display','not-currently-displayed','collection-only','location-unverified'];
export const TRAIL_CATEGORIES=['museum-trail','collection'];
const languages=['fr','en','ar'];
export const TRAIL_COPY={
  fr:{START:'Commencer / reprendre',PREVIOUS:'Précédent',NEXT:'Suivant',MENU:'Vue du parcours',BACK:'Retour à l’étape',CLOSE:'Retour à Léonard',GUIDE:'Retour à Léonard',ROOM:'Retour à la salle',EXTERIOR:'Louvre extérieur',MONA:'Voir La Joconde',EXPLORE:'Explorer dans ARTDACI',AUDIO:'Écouter',PAUSE:'Pause',loading:'Ouverture du parcours…',failed:'Parcours indisponible. Réessayez depuis Léonard.',imageFailed:'Image indisponible',audioFailed:'Audio indisponible',audioLoading:'Préparation de l’audio…',done:'Parcours terminé',doneText:'Vous avez atteint la dernière étape. Revenez au guide ou explorez les étapes précédentes.',visited:'étapes visitées',step:'Étape',nextDiscovery:'Prochaine étape',museumAction:'Continuer le parcours dans le Louvre',collectionAction:'Découvrir mes autres œuvres au Louvre',room:'Salle',level:'Niveau',checked:'Vérifié le',statuses:{'on-display':'Exposée actuellement','not-currently-displayed':'Collection du Louvre — actuellement non exposée','collection-only':'Collection du Louvre — exposition non confirmée','location-unverified':'Localisation non vérifiée'}},
  en:{START:'Start / resume',PREVIOUS:'Previous',NEXT:'Next',MENU:'Trail overview',BACK:'Back to the stop',CLOSE:'Back to Leonardo',GUIDE:'Back to Leonardo',ROOM:'Back to the room',EXTERIOR:'Louvre exterior',MONA:'See Mona Lisa',EXPLORE:'Explore in ARTDACI',AUDIO:'Listen',PAUSE:'Pause',loading:'Opening the trail…',failed:'Trail unavailable. Retry from Leonardo.',imageFailed:'Image unavailable',audioFailed:'Audio unavailable',audioLoading:'Preparing audio…',done:'Trail completed',doneText:'You reached the last stop. Return to the guide or explore previous stops.',visited:'stops visited',step:'Stop',nextDiscovery:'Next stop',museumAction:'Continue the Louvre museum trail',collectionAction:'Discover my other works at the Louvre',room:'Room',level:'Level',checked:'Verified on',statuses:{'on-display':'Currently on display','not-currently-displayed':'Louvre collection — not currently on display','collection-only':'Louvre collection — display unconfirmed','location-unverified':'Location unverified'}},
  ar:{START:'ابدأ / تابع',PREVIOUS:'السابق',NEXT:'التالي',MENU:'نظرة عامة على المسار',BACK:'العودة إلى المحطة',CLOSE:'العودة إلى ليوناردو',GUIDE:'العودة إلى ليوناردو',ROOM:'العودة إلى القاعة',EXTERIOR:'اللوفر الخارجي',MONA:'شاهد الموناليزا',EXPLORE:'استكشف في ARTDACI',AUDIO:'استمع',PAUSE:'إيقاف مؤقت',loading:'جارٍ فتح المسار…',failed:'المسار غير متاح. أعد المحاولة من ليوناردو.',imageFailed:'الصورة غير متاحة',audioFailed:'الصوت غير متاح',audioLoading:'جارٍ إعداد الصوت…',done:'اكتمل المسار',doneText:'وصلت إلى المحطة الأخيرة. عد إلى الدليل أو استكشف المحطات السابقة.',visited:'محطات تمت زيارتها',step:'المحطة',nextDiscovery:'المحطة التالية',museumAction:'تابع المسار داخل متحف اللوفر',collectionAction:'اكتشف أعمالي الأخرى في اللوفر',room:'القاعة',level:'الطابق',checked:'تاريخ التحقق',statuses:{'on-display':'معروضة حاليًا','not-currently-displayed':'من مجموعة اللوفر — غير معروضة حاليًا','collection-only':'مجموعة اللوفر — العرض غير مؤكد','location-unverified':'الموقع غير مؤكد'}}
};

export function validateArtTrail(data){
  const errors=[],ids=new Set(),actions=new Set(['MONA','EXPLORE','GUIDE','ROOM','EXTERIOR']);
  if(data?.schemaVersion!=='1.0'||data.id!=='louvre-art-trail'||data.museum!=='louvre'||!Array.isArray(data.stops)||!data.stops.length)return ['Invalid Louvre trail'];
  for(const category of TRAIL_CATEGORIES)for(const lang of languages)if(!data.categories?.[category]?.title?.[lang]||!data.categories?.[category]?.description?.[lang])errors.push('Missing category translation');
  for(const stop of data.stops){
    if(!stop.id||ids.has(stop.id))errors.push('Duplicate/missing stop');ids.add(stop.id);
    if(!['museum','room','artwork','artist','wing','information'].includes(stop.type))errors.push('Invalid stop type');
    if(![...TRAIL_CATEGORIES,'context'].includes(stop.trailCategory)||typeof stop.spatiallyVisitable!=='boolean')errors.push('Invalid trail category');
    for(const lang of languages)if(!stop.title?.[lang]||!stop.description?.[lang]||(stop.type==='artwork'&&!stop.artist?.[lang]))errors.push('Missing translation: '+stop.id);
    if(!Array.isArray(stop.actions)||stop.actions.some(action=>!actions.has(action)))errors.push('Invalid actions');
    if(stop.spatial?.status!=='not-calibrated'||['x','y','z'].some(axis=>stop.spatial?.position?.[axis]!==null))errors.push('Invented spatial position');
    if(!stop.sources?.length||stop.sources.some(source=>!/^https:\/\/(?:(?:www|collections)\.)?louvre\.fr\//.test(source.url)||!/^\d{4}-\d{2}-\d{2}$/.test(source.checkedOn)))errors.push('Missing official verification');
    if(stop.type==='artwork'){
      if(!['ld01','ld06','ve05'].includes(stop.artworkId)||!stop.artistId||!stop.collection||!stop.inventory||!DISPLAY_STATUSES.includes(stop.displayStatus))errors.push('Invalid Louvre artwork');
      const location=stop.museumLocation;
      if(stop.displayStatus==='on-display'&&(!location?.room||!location?.wing||!Number.isInteger(location.level)||stop.trailCategory!=='museum-trail'||!stop.spatiallyVisitable))errors.push('Missing displayed location');
      if(stop.displayStatus!=='on-display'&&(location!==null||stop.trailCategory!=='collection'||stop.spatiallyVisitable))errors.push('Unverified exhibition location');
      if(stop.artworkId==='ld01'&&(stop.media||stop.actions.join()!=='MONA'))errors.push('Mona must reuse the existing room POI');
      if(stop.artworkId!=='ld01'){
        try{if(!projectAssetUrl(stop.media?.image,import.meta.url)||!projectAssetUrl(stop.media?.manifest,import.meta.url))errors.push('Missing artwork media');}catch{errors.push('Unsafe artwork media');}
        if(!stop.actions.includes('EXPLORE'))errors.push('Missing artwork exploration');
      }
    }else if(stop.trailCategory!=='context'||stop.spatiallyVisitable)errors.push('Context marker in artwork trail');
  }
  for(const category of TRAIL_CATEGORIES)if(!data.stops.some(stop=>stop.trailCategory===category))errors.push('Empty trail category');
  for(const type of ['museum','room'])if(!data.stops.some(stop=>stop.type===type))errors.push('Missing cultural marker');
  for(const artist of ['ld','ve'])if(!data.stops.some(stop=>stop.type==='artist'&&stop.artistId===artist))errors.push('Missing artist marker');
  return errors;
}

export function readTrailSession(storage){try{return JSON.parse(storage?.getItem(TRAIL_SESSION_KEY)||'null');}catch{return null;}}

export function markTrailMonaVisited(storage){
  const saved=readTrailSession(storage)||{};
  const visited=Array.isArray(saved.visited)?saved.visited:[];
  try{storage?.setItem(TRAIL_SESSION_KEY,JSON.stringify({...saved,monaVisited:true,visited:[...new Set([...visited,'ld01-mona-lisa'])]}));}catch{/* In-memory guide context remains available. */}
}

export function createArtTrailFlow(data,{storage=null,monaVisited=false}={}){
  const saved=readTrailSession(storage),validIds=new Set(data.stops.map(stop=>stop.id));
  let currentId=validIds.has(saved?.currentId)?saved.currentId:null;
  const visited=new Set((Array.isArray(saved?.visited)?saved.visited:[]).filter(id=>validIds.has(id)));
  let mona=monaVisited||saved?.monaVisited===true,mode='closed';
  let category=TRAIL_CATEGORIES.includes(saved?.category)?saved.category:'museum-trail';
  const steps=()=>data.stops.filter(stop=>stop.trailCategory===category);
  const snapshot=()=>({mode,category,currentId,visited:[...visited],monaVisited:mona});
  const persist=()=>{try{storage?.setItem(TRAIL_SESSION_KEY,JSON.stringify(snapshot()));}catch{/* Private browsing keeps in-memory state. */}};
  const index=()=>steps().findIndex(stop=>stop.id===currentId);
  function show(i){const entries=steps(),stop=entries[Math.max(0,Math.min(entries.length-1,i))];currentId=stop.id;visited.add(stop.id);mode='stop';}
  function startIndex(){return category==='museum-trail'&&mona?Math.min(1,steps().length-1):0;}
  function dispatch(action){
    let effect=null;
    if(action==='MONA_VISITED'){mona=true;visited.add('ld01-mona-lisa');}
    else if(['OPEN','OPEN_MUSEUM','OPEN_COLLECTION'].includes(action)){
      const next=action==='OPEN_COLLECTION'?'collection':'museum-trail';
      if(category!==next || index()<0)currentId=null;
      category=next;mode='overview';
    }
    else if(action==='CLOSE'){mode='closed';effect='GUIDE';}
    else if(action==='HIDE')mode='closed';
    else if(mode==='overview'&&action==='START')show(index()>=0&&!(category==='museum-trail'&&mona&&index()===0)?index():startIndex());
    else if(action==='MENU'&&mode!=='closed')mode='overview';
    else if(action==='PREVIOUS'&&['stop','complete'].includes(mode)){if(mode==='complete')show(steps().length-1);else if(index()>0)show(index()-1);else mode='overview';}
    else if(action==='NEXT'&&mode==='stop'){if(index()<steps().length-1)show(index()+1);else mode='complete';}
    else if(action==='EXPLORE'&&mode==='stop'&&steps()[index()]?.actions.includes(action))mode='detail';
    else if(action==='BACK'&&mode==='detail')mode='stop';
    else if(action==='MONA'&&mode==='stop'&&steps()[index()]?.artworkId==='ld01'){mona=true;currentId=null;mode='closed';effect='MONA';}
    else if(['GUIDE','ROOM','EXTERIOR'].includes(action)&&mode!=='closed'){mode='closed';effect=action;}
    persist();return {...snapshot(),effect};
  }
  function presentation(lang){
    const copy=TRAIL_COPY[lang],stop=steps()[index()],action=id=>({id,label:copy[id]});
    const count=steps().filter(entry=>visited.has(entry.id)).length,progress=`${count}/${steps().length} ${copy.visited}`;
    if(mode==='closed')return null;
    if(mode==='overview'){
      const next=steps()[index()>=0&&!(category==='museum-trail'&&mona&&index()===0)?index():startIndex()];
      return {title:localize(data.categories[category].title,lang),description:`${localize(data.categories[category].description,lang)}\n${copy.nextDiscovery} : ${localize(next.title,lang)}`,role:progress,category,actions:['START','ROOM','EXTERIOR'].map(action)};
    }
    if(mode==='complete')return {title:copy.done,description:copy.doneText,role:progress,category,actions:['PREVIOUS','MENU','EXTERIOR'].map(action)};
    const location=stop.museumLocation;
    const statusLabel=stop.displayStatus?copy.statuses[stop.displayStatus]:'';
    const address=location?.room?`${copy.room} ${location.room} · ${location.wing} · ${copy.level} ${location.level}`:'';
    const actions=mode==='detail'?['AUDIO','BACK','MENU']:[...stop.actions.slice(0,1),'PREVIOUS',category==='collection'&&index()===steps().length-1?'ROOM':'NEXT'];
    return {title:localize(stop.title,lang),role:localize(stop.artist,lang)||localize(data.title,lang),description:[address,localize(stop.description,lang)].filter(Boolean).join('\n'),statusLabel,status:`${copy.step} ${index()+1}/${steps().length} · ${copy.checked} ${data.verifiedOn}`,stop,category,actions:actions.map(action)};
  }
  persist();return {dispatch,presentation,snapshot};
}

// Resolve the exact active language through the canonical resolver, never another narration.
export function trailAudioUrl(stop,manifest,lang){
  if(manifest?.id!==stop.artworkId)return null;
  const asset=manifest.media?.audio?.overview?.[lang];
  if(asset?.available!==true||asset.migrationStatus!=='published'||asset.mimeType!=='audio/mpeg')return null;
  try{const url=resolveManifestMedia(manifest,'audio.overview',lang);return url?.startsWith('https://media.artdaci.com/artworks/'+stop.artworkId+'/')?url:null;}catch{return null;}
}
