// A data-driven, room-local guide. Events never move a model or invent a POI.
const LANGUAGES=['fr','en','ar'];
const VIEWS=['welcome','monaLisaIntro','monaMore','aboutLeonardo','postMonaLisa','works','workDetail','trail'];
const ACTIONS=new Set(['START_TOUR','ABOUT_LEONARDO','SEE_MONA_LISA','MONA_MORE','SHOW_WORKS','CONTINUE_TRAIL','REVIEW_MONA','OPEN_PROFILE','BACK']);

export function guideText(value,language){return value?.[language] || value?.fr || value?.en || '';}

export function validateActiveGuideConfig(config,{roomPoiIds=[],knownArtworkIds=[]}={}){
  const errors=[];
  if(config?.schemaVersion!=='1.0' || !config.id || !config.guideId || config.role!=='active-guide')errors.push('Invalid active guide identity');
  for(const key of VIEWS){
    const view=config?.states?.[key];
    if(!view || !Array.isArray(view.actions) || view.actions.some(action=>!ACTIONS.has(action)))errors.push('Invalid guide view: '+key);
    for(const language of LANGUAGES)if(!view?.title?.[language] || !view?.description?.[language])errors.push(`Missing ${language} guide view: ${key}`);
  }
  for(const action of ACTIONS)for(const language of LANGUAGES)if(!config?.actionLabels?.[action]?.[language])errors.push(`Missing ${language} action: ${action}`);
  for(const action of ['CLOSE','RETRY_MODEL'])for(const language of LANGUAGES)if(!config?.actionLabels?.[action]?.[language])errors.push(`Missing ${language} action: ${action}`);
  const works=config?.guideSections?.leonardoWorks;
  if(!Array.isArray(works) || !works.length || new Set(works.map(work=>work.artworkId)).size!==works.length)errors.push('Invalid guide works');
  for(const work of works || []){
    if(!work.artworkId || (knownArtworkIds.length && !knownArtworkIds.includes(work.artworkId)))errors.push('Unknown artwork: '+work.artworkId);
    for(const language of LANGUAGES)if(!work.title?.[language] || !work.statusLabel?.[language])errors.push(`Missing ${language} work: ${work.artworkId}`);
    if(work.action?.type==='roomPoi'){
      if(!roomPoiIds.includes(work.action.targetPoiId) || work.museumStatus!=='on-display-in-current-room')errors.push('Room work has no verified room POI: '+work.artworkId);
    }else if(work.action?.type!=='information' || work.museumStatus==='on-display-in-current-room')errors.push('Unplaced work must be informational: '+work.artworkId);
  }
  if(!works?.some(work=>work.artworkId===config.focusArtworkId && work.action?.type==='roomPoi'))errors.push('Focus artwork must reuse a room POI');
  const trail=config?.guideSections?.artTrail;
  if(!trail || (trail.nextPoiId!==null && typeof trail.nextPoiId!=='string'))errors.push('Invalid Art Trail destination');
  if(config?.links?.leonardoProfile!=='../print-leonardo-tribute.html')errors.push('Guide profile must use the existing Leonardo page');
  if(config?.audio?.status!=='not-available' || LANGUAGES.some(language=>config?.audio?.[language]!==null))errors.push('No Leonardo guide narration is approved');
  return errors;
}

export function createActiveGuideFlow(config,{availablePoiIds=[]}={}){
  let state='notStarted',view=null,visited=false,selectedWorkId=null;
  const history=[];
  const works=config.guideSections.leonardoWorks;
  const focus=works.find(work=>work.artworkId===config.focusArtworkId);
  const snapshot=()=>({state,view,visited,selectedWorkId});
  const show=next=>{if(view)history.push(view);view=next;};
  const openRoomWork=work=>({type:'roomPoi',targetPoiId:work.action.targetPoiId});
  function dispatch(event){
    let effect=null;
    if(event==='LEONARDO_SELECTED' || event==='RETURN_TO_GUIDE'){
      history.length=0;selectedWorkId=null;
      if(state==='notStarted')state='welcomed';
      view=visited?'postMonaLisa':state==='monaLisaIntroduced'?'monaLisaIntro':'welcome';
    }else if(event==='MONA_LISA_OPENED' || event==='MONA_LISA_VISITED'){
      visited=true;state='monaLisaVisited';view=null;history.length=0;selectedWorkId=null;
    }else if(event==='START_TOUR' && view==='welcome'){
      state='monaLisaIntroduced';show('monaLisaIntro');
    }else if(event==='ABOUT_LEONARDO' && view==='welcome')show('aboutLeonardo');
    else if(event==='MONA_MORE' && view==='monaLisaIntro')show('monaMore');
    else if(event==='SHOW_WORKS' && view==='postMonaLisa')show('works');
    else if(event==='CONTINUE_TRAIL' && view==='postMonaLisa'){
      const next=config.guideSections.artTrail.nextPoiId;
      if(next && availablePoiIds.includes(next))effect={type:'roomPoi',targetPoiId:next};
      else{state='trailOffered';show('trail');}
    }else if(event==='SEE_MONA_LISA' && ['monaLisaIntro','monaMore'].includes(view))effect=openRoomWork(focus);
    else if(event==='REVIEW_MONA' && view==='postMonaLisa')effect=openRoomWork(focus);
    else if(event.startsWith('SELECT_WORK:') && view==='works'){
      const work=works.find(item=>item.artworkId===event.slice('SELECT_WORK:'.length));
      if(work?.action.type==='roomPoi')effect=openRoomWork(work);
      else if(work?.action.type==='information'){selectedWorkId=work.artworkId;show('workDetail');}
    }else if(event==='OPEN_PROFILE' && view==='aboutLeonardo')effect={type:'route',path:config.links.leonardoProfile};
    else if(event==='BACK' && view){view=history.pop() || (visited?'postMonaLisa':'welcome');if(view!=='workDetail')selectedWorkId=null;}
    else if(event==='CLOSE'){view=null;history.length=0;selectedWorkId=null;}
    return {...snapshot(),effect};
  }
  function presentation(language){
    if(!view)return null;
    const entry=config.states[view];
    let title=guideText(entry.title,language),description=guideText(entry.description,language);
    let actions=entry.actions.map(id=>({id,label:guideText(config.actionLabels[id],language)}));
    if(view==='works'){
      description+='\n'+works.map(work=>`${guideText(work.title,language)} — ${guideText(work.statusLabel,language)}`).join('\n');
      actions=[...works.map(work=>({id:`SELECT_WORK:${work.artworkId}`,label:guideText(work.title,language)})),...actions];
    }
    if(view==='workDetail'){
      const work=works.find(item=>item.artworkId===selectedWorkId);
      if(work){title=guideText(work.title,language);description=`${guideText(work.statusLabel,language)}. ${description}`;}
    }
    return {key:view,title,description,actions,dir:language==='ar'?'rtl':'ltr',state};
  }
  return {dispatch,presentation,snapshot};
}
