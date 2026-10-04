import {createResourceSlot} from './experience-resource-slot.mjs';

export const MAX_ACTIVE_GUIDES=1;
export const GUIDE_EVENTS=Object.freeze(['GUIDE_REQUESTED','GUIDE_READY','GUIDE_CLOSED','ARTIST_ABOUT','ARTWORK_SELECTED','ARTWORK_OPENED','ARTWORK_NEXT','ARTWORK_PREVIOUS','ARTWORK_CLOSED','GUIDE_SWITCH_REQUESTED']);
const LANGUAGES=['fr','en','ar'];
const ACTIONS=['DISCOVER_WORKS','ABOUT_ARTIST','NEXT_WORK','PREVIOUS_WORK','BACK_TO_GUIDE','CLOSE'];

export function validateArtistGuideConfig(config,{artist,knownArtworkIds=[]}={}){
  const errors=[];
  if(config?.schemaVersion!=='1.0'||!config.guideId||!config.artistId)errors.push('Invalid guide identity');
  if(artist&&(config?.artistId!==artist.artistId||config.guideId!==artist.guide?.guideId||JSON.stringify(config.works)!==JSON.stringify(artist.works.map(work=>work.artworkId))))errors.push('Guide does not match Hub artist');
  if(!Array.isArray(config?.works)||config.works.length!==3||new Set(config.works).size!==3||config.works.some(id=>!id||knownArtworkIds.length&&!knownArtworkIds.includes(id)))errors.push('Invalid guide artworks');
  if(!['reserved','available'].includes(config?.model?.status)||config.model.status==='reserved'&&config.model.path!==null||config.model.status==='available'&&!(typeof config.model.path==='string'&&/^[^:/\\]+(?:\/[^:/\\]+)*\.glb$/.test(config.model.path)))errors.push('Invalid guide model status');
  if(config?.transform&&Object.values(config.transform).some(value=>value!==null&&!Number.isFinite(value)))errors.push('Invalid model transform');
  for(const lang of LANGUAGES){
    const entry=config?.content?.[lang];
    for(const view of ['welcome','about','works'])if(!entry?.[view]?.title||!entry?.[view]?.description)errors.push(`Missing ${lang} ${view}`);
    for(const action of ACTIONS)if(!entry?.actions?.[action])errors.push(`Missing ${lang} ${action}`);
    if(config?.profile&&(!entry?.actions?.OPEN_PROFILE||!/^\.\.\/[a-z0-9-]+\.html(?:\?[a-z0-9=&%-]+)?$/.test(config.profile.routes?.[lang]||'')))errors.push(`Invalid ${lang} profile route`);
  }
  return errors;
}

export function createArtistGuideEngine({configs,loadModel=async()=>null,disposeModel,onModelReady=()=>{},onEvent=()=>{},onCloseMedia=()=>{},workTitle=(id)=>id}={}){
  const byId=new Map(configs?.map(config=>[config.guideId,config])||[]);
  if(!byId.size||byId.size!==configs.length||configs.some(config=>validateArtistGuideConfig(config).length))throw new Error('Invalid guide configurations');
  const slot=createResourceSlot({load:loadModel,dispose:disposeModel});
  let active=null,phase='closed',view=null,index=-1,revision=0,disposed=false;
  const emit=(type,detail={})=>onEvent({type,guideId:active?.guideId??null,...detail});
  const snapshot=()=>({guideId:active?.guideId??null,artistId:active?.artistId??null,phase,view,artworkId:index<0?null:active.works[index],guidesLoaded:slot.snapshot().activeCount});
  function close(){
    revision++;onCloseMedia();slot.clear();
    if(active)emit('GUIDE_CLOSED');
    active=null;phase='closed';view=null;index=-1;
    return snapshot();
  }
  async function loadGuide(guideId){
    if(disposed)throw new Error('Guide engine closed');
    const config=byId.get(guideId);if(!config)throw new Error('Unknown guide');
    close();active=config;phase='loading';view='welcome';const request=revision;
    emit('GUIDE_REQUESTED');
    try{
      // Reserved guides have no path and never invoke a model loader.
      const handle=await slot.select(guideId,config.model.status==='available'?config.model:null);
      if(request!==revision)return snapshot();
      if(handle)onModelReady(handle,config);
      phase='ready';emit('GUIDE_READY');return snapshot();
    }catch(error){if(request===revision){slot.clear();phase='error';view=null;}throw error;}
  }
  async function switchGuide(guideId){
    if(!byId.has(guideId))throw new Error('Unknown guide');
    emit('GUIDE_SWITCH_REQUESTED',{nextGuideId:guideId});
    return loadGuide(guideId);
  }
  function dispatch(type,{artworkId}={}){
    if(type==='CLOSE')return close();
    if(phase!=='ready')return snapshot();
    if(type==='DISCOVER_WORKS'){view='works';index=-1;}
    else if(type==='ARTIST_ABOUT'){view='about';emit(type);}
    else if(type==='ARTWORK_SELECTED'&&active.works.includes(artworkId)){view='artwork';index=active.works.indexOf(artworkId);emit(type,{artworkId});}
    else if(type==='ARTWORK_OPENED'&&index>=0)emit(type,{artworkId:active.works[index]});
    else if(type==='ARTWORK_NEXT'&&index>=0){index=(index+1)%active.works.length;emit(type,{artworkId:active.works[index]});}
    else if(type==='ARTWORK_PREVIOUS'&&index>=0){index=(index-1+active.works.length)%active.works.length;emit(type,{artworkId:active.works[index]});}
    else if(type==='ARTWORK_CLOSED'&&index>=0){emit(type,{artworkId:active.works[index]});index=-1;view='works';}
    else if(type==='BACK_TO_GUIDE'){index=-1;view='welcome';}
    return snapshot();
  }
  function presentation(language){
    if(!active||phase!=='ready')return null;
    const lang=LANGUAGES.includes(language)?language:'fr',content=active.content[lang];
    const action=id=>({id,label:content.actions[id]});
    const actions=view==='welcome'?[action('DISCOVER_WORKS'),action('ABOUT_ARTIST')]
      :view==='about'?[...(active.profile?[{...action('OPEN_PROFILE'),href:active.profile.routes[lang]}]:[]),action('BACK_TO_GUIDE')]
      :view==='works'?[...active.works.map(id=>({id:`ARTWORK_SELECTED:${id}`,label:workTitle(id,lang)})),action('BACK_TO_GUIDE')]
      :[action('PREVIOUS_WORK'),action('NEXT_WORK'),action('BACK_TO_GUIDE')];
    actions.push(action('CLOSE'));
    const entry=content[view==='artwork'?'works':view];
    return {guideId:active.guideId,artistId:active.artistId,view,title:view==='artwork'?workTitle(active.works[index],lang):entry.title,description:entry.description,artworkId:index<0?null:active.works[index],actions,dir:lang==='ar'?'rtl':'ltr'};
  }
  function dispose(){if(disposed)return;close();slot.dispose();disposed=true;}
  return {loadGuide,unloadGuide:close,switchGuide,dispatch,presentation,snapshot,dispose};
}
