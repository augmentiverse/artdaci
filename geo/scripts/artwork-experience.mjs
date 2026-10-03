import {resolveMediaAsset} from '../../scripts/artwork-media-manifest-core.mjs';
import {resolveImmersiveArtworkRoute} from '../../scripts/immersive-routing.js';
import {museumRoute,resolveHubImage,hubImageCandidates,hubAudioCandidates,localHubAudio} from './masters-hub-core.mjs';
import {createResourceSlot} from './experience-resource-slot.mjs';

export const MAX_ACTIVE_ARTWORK_MODELS=1;
export const CAPABILITY_STATES=Object.freeze(['available','local-fallback','planned','missing','unsupported']);
export const CAPABILITY_NAMES=Object.freeze(['info','image','audio','model3d','ar','space','vr','video','museum']);
const LANGUAGES=['fr','en','ar'];
const capability=(status,url=null)=>({status,url});

function assetCapability(manifest,nodes,mimeTypes){
  let planned=false,unsupported=false;
  for(const asset of nodes.filter(Boolean)){
    if(asset.available===false){planned ||= asset.migrationStatus==='planned';continue;}
    if(asset.available!==true)continue;
    if(!mimeTypes.includes(asset.mimeType)){unsupported=true;continue;}
    try{const url=resolveMediaAsset(manifest,asset);if(url)return capability('available',url);}
    catch{unsupported=true;}
  }
  return capability(planned?'planned':unsupported?'unsupported':'missing');
}

export function resolveArtworkCapabilities({entry,work,manifest,language}){
  const lang=LANGUAGES.includes(language)?language:'fr';
  if(!entry||entry.status!=='active'||entry.id!==work?.artworkId)throw new Error('Unrecognised canonical artwork');
  const valid=manifest?.id===entry.id;
  const imageResolved=resolveHubImage(work,manifest);
  const canonicalAudio=valid?assetCapability(manifest,[manifest.media?.audio?.overview?.[lang]?.language===lang?manifest.media.audio.overview[lang]:null],['audio/mpeg','audio/mp4']):capability('missing');
  const audio=canonicalAudio.status==='available'?canonicalAudio:(localHubAudio(work,lang)||canonicalAudio);
  const models=valid?assetCapability(manifest,Object.values(manifest.media?.models||{}),['model/gltf-binary']):capability('missing');
  const video=valid?assetCapability(manifest,Object.values(manifest.media?.videos||{}),['video/mp4','video/webm']):capability('missing');
  const immersive={};
  for(const kind of ['ar','space','vr']){
    const route=resolveImmersiveArtworkRoute(entry.id,kind);
    const page={ar:'ar.html',space:'space.html',vr:'vr.html'}[kind];
    immersive[kind]=route?capability('available',`../${page}?painting=${encodeURIComponent(route.runtimeSlug)}&lang=${lang}`):capability('unsupported');
  }
  const museum=museumRoute(work.museumId,lang);
  return {info:capability('available'),image:imageResolved,audio,model3d:models,...immersive,video,museum:museum?capability('available',museum):capability('missing')};
}

export async function fetchCanonicalArtworkManifest(entry,{rootUrl,fetchImpl=fetch,signal,timeoutMs=5000,onRequest=()=>{}}={}){
  if(!entry?.manifest?.path||!rootUrl)throw new TypeError('Canonical manifest path and root URL are required');
  const path=entry.manifest.path;
  const urls=[new URL(path,'https://media.artdaci.com/'),new URL(`content/media-manifests/${path}`,rootUrl)];
  for(const url of urls){
    if(signal?.aborted)return null;
    const controller=new AbortController(),abort=()=>controller.abort();
    signal?.addEventListener('abort',abort,{once:true});
    if(signal?.aborted)controller.abort();
    const timer=setTimeout(abort,timeoutMs);
    try{
      onRequest(url.href);
      const response=await fetchImpl(url.href,{signal:controller.signal,cache:'no-store'});
      if(response.ok){const manifest=await response.json();if(signal?.aborted)return null;if(manifest.id===entry.id)return manifest;}
    }catch{}finally{clearTimeout(timer);signal?.removeEventListener('abort',abort);}
  }
  return null;
}

export function createArtworkExperience({catalog,artists,language,rootUrl,fetchImpl=fetch,loadModel=async()=>null,disposeModel,onRequest=()=>{},onCloseMedia=()=>{}}={}){
  if(!LANGUAGES.includes(language)||!rootUrl)throw new TypeError('Artwork experience needs a language and root URL');
  const byId=new Map();
  for(const artist of artists||[])for(const work of artist.works||[]){
    const entry=catalog?.artworks?.find(item=>item.id===work.artworkId);
    if(!entry||entry.status!=='active'||entry.artistId!==artist.artistId||byId.has(work.artworkId))throw new Error('Invalid artwork catalog');
    byId.set(work.artworkId,{entry,work,artist});
  }
  const modelSlot=createResourceSlot({load:loadModel,dispose:disposeModel});
  const manifestCache=new Map();let current=null,request=null,mediaRequest=null,revision=0,disposed=false;
  const mediaOf=(record,manifest)=>{
    const capabilities=resolveArtworkCapabilities({...record,manifest,language});
    const candidates=hubImageCandidates(record.work,capabilities.image);
    const audioCandidates=hubAudioCandidates(record.work,manifest,language);
    return {capabilities,audio:audioCandidates[0]?.url||null,audioCandidates,imageCandidates:[...new Set(candidates)],museum:capabilities.museum.url};
  };
  const snapshot=()=>({artworkId:current?.artworkId??null,phase:current?.phase??'closed',media:current?.media??null,capabilities:current?.media?.capabilities??null,manifestAvailable:current?.manifestAvailable??false,artworkModelsLoaded:modelSlot.snapshot().activeCount});
  function close(){
    revision++;request?.abort();mediaRequest?.abort();request=mediaRequest=null;onCloseMedia();modelSlot.clear();current=null;return snapshot();
  }
  async function open(artworkId){
    if(disposed)throw new Error('Artwork experience closed');
    const record=byId.get(artworkId);if(!record)throw new Error('Unknown artwork');
    close();const token=revision;request=new AbortController();
    current={artworkId,phase:'loading',media:mediaOf(record,null)};
    let manifest=manifestCache.get(artworkId);
    if(!manifest){
      manifest=await fetchCanonicalArtworkManifest(record.entry,{rootUrl,fetchImpl,signal:request.signal,onRequest});
      if(manifest&&token===revision&&!disposed)manifestCache.set(artworkId,manifest);
    }
    if(token!==revision||disposed)return null;
    request=null;current.phase='ready';current.manifestAvailable=Boolean(manifest);current.media=mediaOf(record,manifest);
    return snapshot();
  }
  function beginMediaRequest(){
    mediaRequest?.abort();mediaRequest=new AbortController();
    const token=revision,controller=mediaRequest;
    return {signal:controller.signal,current:()=>!disposed&&token===revision&&!controller.signal.aborted};
  }
  async function loadArtworkModel(){
    if(!current||current.phase!=='ready')return null;
    const model=current.media.capabilities.model3d;
    if(model.status!=='available')return null;
    return modelSlot.select(current.artworkId,{url:model.url});
  }
  function unloadArtworkModel(){modelSlot.clear();}
  function dispose(){if(disposed)return;close();modelSlot.dispose();disposed=true;}
  return {open,close,snapshot,beginMediaRequest,loadArtworkModel,unloadArtworkModel,dispose};
}
