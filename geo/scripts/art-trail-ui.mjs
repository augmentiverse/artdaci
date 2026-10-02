import {createActiveGuideXrPanel} from './active-guide-xr-panel.mjs?v=6-10';
import {createArtTrailFlow,validateArtTrail,TRAIL_COPY,trailAudioUrl} from './art-trail.mjs?v=6-11-1';
import {projectAssetUrl} from './geo-core.mjs';

// Reuse the validated compact geometry/UV targets; isolate the action namespace.
export function createArtTrailXrPanel(THREE,lang){
  const base=createActiveGuideXrPanel(THREE,lang);
  let artworkImage=null,hover=null,detail=false,description='';
  function composite(){
    if(!detail)return;
    const texture=base.mesh.material.map,ctx=texture.image.getContext('2d');
    ctx.clearRect(30,200,960,270);ctx.fillStyle='#101b24b3';ctx.fillRect(30,200,960,270);
    ctx.direction=lang==='ar'?'rtl':'ltr';ctx.textAlign=lang==='ar'?'right':'left';ctx.fillStyle='#eee5d8';ctx.font='28px system-ui, sans-serif';
    let row=0,line='';
    for(const word of description.split(/\s+/)){
      const next=line?line+' '+word:word;
      if(ctx.measureText(next).width>550&&line){ctx.fillText(line,lang==='ar'?610:48,240+row++*43);line=word;}else line=next;
    }
    if(line)ctx.fillText(line,lang==='ar'?610:48,240+row*43);
    if(!artworkImage){texture.needsUpdate=true;return;}
    const scale=Math.min(250/artworkImage.width,245/artworkImage.height);
    const width=artworkImage.width*scale,height=artworkImage.height*scale;
    ctx.drawImage(artworkImage,820-width/2,210,width,height);texture.needsUpdate=true;
  }
  return {...base,
    draw(view,options){artworkImage=options.image||null;detail=options.detail===true;description=view.description;base.draw(view,options);composite();},
    hit(ray){const hit=base.hit(ray);return hit?{...hit,action:hit.action?.replace('guide-v610:','trail:')||null}:null;},
    setHover(action){const next=action?.startsWith('trail:')?action:null;if(next===hover)return;hover=next;base.setHover(next?.replace('trail:','guide-v610:'));composite();}
  };
}

export function createArtTrailUi({THREE,scene,stage,element,language:lang,isXr,onPlacement,onEffect,storage=null}){
  const copy=TRAIL_COPY[lang],panel=createArtTrailXrPanel(THREE,lang);
  scene.add(panel.mesh);
  const audio=new Audio();audio.preload='none';
  let flow=null,dataRequest=null,open=false,disposed=false,opening=0,mediaToken=0;
  let detailId=null,image=null,imageState='',audioUrl=null,audioState='',request=null;
  const lifecycle=new AbortController();
  const imageEl=element.querySelector('img'),titleEl=element.querySelector('h2');
  const roleEl=element.querySelector('[data-trail-role]'),descriptionEl=element.querySelector('[data-trail-description]');
  const badgeEl=element.querySelector('[data-trail-badge]');
  const statusEl=element.querySelector('[data-trail-status]'),actionsEl=element.querySelector('[data-trail-actions]');
  element.dir=lang==='ar'?'rtl':'ltr';
  element.querySelector('[data-trail-close]').textContent=copy.CLOSE;
  element.querySelector('[data-trail-close]').addEventListener('click',()=>run('CLOSE'));
  const persistDiagnostics=()=>{
    if(flow)stage.dataset.artTrailState=JSON.stringify(flow.snapshot());
    stage.dataset.artTrailResources=JSON.stringify(performance.getEntriesByType('resource')
      .filter(entry=>/art-trail|artworks\/(ld06|ve05)|ferronni|astronomer/i.test(entry.name))
      .map(entry=>({url:entry.name,durationMs:Math.round(entry.duration),transferBytes:entry.transferSize,responseStatus:entry.responseStatus??null})));
  };
  function stopMedia(){
    mediaToken++;request?.abort();request=null;detailId=null;image=null;imageState='';audioUrl=null;audioState='';
    audio.pause();audio.removeAttribute('src');audio.load();imageEl.removeAttribute('src');imageEl.hidden=true;
  }
  function draw(){
    if(!open||disposed)return;
    const view=flow?.presentation(lang)||{title:copy.loading,description:'',role:'',actions:[]};
    const inDetail=flow?.snapshot().mode==='detail';
    const mediaStatus=[imageState,audioState].filter(Boolean).join(' · ');
    const shown={...view,actions:view.actions.map(action=>action.id==='AUDIO'?{...action,label:audio.paused?copy.AUDIO:copy.PAUSE}:action)};
    titleEl.textContent=view.title;roleEl.textContent=view.role;
    badgeEl.textContent=view.statusLabel||'';badgeEl.hidden=!view.statusLabel;
    descriptionEl.textContent=inDetail?view.description.split('\n').slice(0,view.stop.museumLocation?.room?2:1).join('\n'):view.description;
    statusEl.textContent=[view.status,mediaStatus].filter(Boolean).join(' · ');
    imageEl.hidden=!inDetail||!image;
    actionsEl.replaceChildren();
    for(const action of shown.actions){
      const button=document.createElement('button');button.type='button';button.dataset.trailAction=action.id;button.textContent=action.label;
      button.disabled=action.id==='AUDIO'&&!audioUrl;button.addEventListener('click',()=>run(action.id));actionsEl.append(button);
    }
    // Keep detail text away from the thumbnail; the full description remains in HTML.
    const xrView=inDetail?{...shown,description:view.description.split('\n').slice(0,view.stop.museumLocation?.room?2:1).join('\n')}:shown;
    panel.draw(xrView,{kicker:'ARTDACI · ART TRAIL',role:view.role,status:[view.statusLabel,mediaStatus].filter(Boolean).join(' · ')||view.status,closeLabel:copy.CLOSE,image:inDetail?image:null,detail:inDetail});
    panel.mesh.visible=isXr();element.hidden=false;persistDiagnostics();
  }
  async function detailMedia(stop){
    stopMedia();detailId=stop.id;const token=mediaToken;
    imageState='';audioState=copy.audioLoading;draw();
    const artworkImage=new Image();
    artworkImage.onload=()=>{if(disposed||token!==mediaToken)return;image=artworkImage;imageEl.src=artworkImage.src;imageEl.alt=viewTitle(stop);draw();};
    artworkImage.onerror=()=>{if(disposed||token!==mediaToken)return;imageState=copy.imageFailed;draw();};
    artworkImage.src=projectAssetUrl(stop.media.image,import.meta.url);
    const controller=new AbortController();request=controller;const timer=setTimeout(()=>controller.abort(),4500);
    try{
      // The tracked canonical manifest is the offline metadata fallback, without copying media.
      const response=await fetch(projectAssetUrl(stop.media.manifest,import.meta.url),{signal:controller.signal});
      if(!response.ok)throw new Error('Manifest HTTP '+response.status);
      const manifest=await response.json();
      if(disposed||token!==mediaToken)return;
      audioUrl=trailAudioUrl(stop,manifest,lang);audioState=audioUrl?'':copy.audioFailed;
    }catch{if(disposed||token!==mediaToken)return;audioState=copy.audioFailed;}
    finally{clearTimeout(timer);}
    draw();
  }
  const viewTitle=stop=>stop.title[lang];
  async function ensure(){
    if(!dataRequest){
      const controller=new AbortController(),abort=()=>controller.abort();
      lifecycle.signal.addEventListener('abort',abort,{once:true});
      const timer=setTimeout(abort,6000);
      dataRequest=fetch(new URL('../data/louvre-art-trail.json?v=6-11-1',import.meta.url),{signal:controller.signal})
      .then(async response=>{if(!response.ok)throw new Error('Trail HTTP '+response.status);const data=await response.json();const errors=validateArtTrail(data);if(errors.length)throw new Error(errors.join('; '));return data;})
      .catch(error=>{dataRequest=null;throw error;})
      .finally(()=>{clearTimeout(timer);lifecycle.signal.removeEventListener('abort',abort);});
    }
    return dataRequest;
  }
  async function show(monaVisited,category='museum-trail'){
    if(disposed)return;
    const generation=++opening,started=performance.now();open=true;draw();onPlacement();
    try{
      const data=await ensure();if(disposed||generation!==opening||!open)return;
      flow??=createArtTrailFlow(data,{storage,monaVisited});
      if(monaVisited)flow.dispatch('MONA_VISITED');
      flow.dispatch(category==='collection'?'OPEN_COLLECTION':'OPEN_MUSEUM');stopMedia();draw();onPlacement();
      stage.dataset.artTrailOpenMs=String(Math.round(performance.now()-started));
    }catch(error){
      if(disposed||generation!==opening||!open)return;
      titleEl.textContent=copy.failed;descriptionEl.textContent='';statusEl.textContent='';
      panel.draw({title:copy.failed,description:'',actions:[]},{closeLabel:copy.CLOSE});
      panel.mesh.visible=isXr();onPlacement();console.warn('GEO optional trail:',error);
    }
  }
  function hide(){opening++;open=false;flow?.dispatch('HIDE');stopMedia();element.hidden=true;panel.mesh.visible=false;panel.setHover(null);persistDiagnostics();}
  function run(action){
    if(!open||disposed)return;
    if(action==='CLOSE'&&!flow){hide();onEffect('GUIDE');return;}
    if(!flow)return;
    if(action==='AUDIO'){
      if(!audioUrl)return;
      if(!audio.paused)audio.pause();
      else{if(!audio.src)audio.src=audioUrl;audio.play().catch(()=>{if(open){audioState=copy.audioFailed;draw();}});}
      draw();return;
    }
    const result=flow.dispatch(action);
    if(result.effect){hide();onEffect(result.effect);return;}
    if(result.mode==='detail'){
      const stop=flow.presentation(lang).stop;
      if(detailId!==stop.id)detailMedia(stop);
    }else if(detailId)stopMedia();
    draw();
  }
  for(const event of ['play','pause','ended'])audio.addEventListener(event,draw);
  audio.addEventListener('error',()=>{if(open&&detailId){audioUrl=null;audioState=copy.audioFailed;draw();}});
  return {panel,show,hide,run,get open(){return open;},
    syncXr(){if(!open)return;draw();if(isXr())onPlacement();},
    monaVisited(){flow?.dispatch('MONA_VISITED');persistDiagnostics();},
    dispose(){if(disposed)return;hide();disposed=true;lifecycle.abort();scene.remove(panel.mesh);panel.dispose();}
  };
}
