import {HUB_COPY} from './masters-hub-core.mjs?v=6-15-10';

const usable=capability=>['available','local-fallback'].includes(capability?.status);
// V6.14 keeps the V6.13 visible action set. Other verified capabilities are
// recorded by the resolver but have no visible control until an approved UI exists.
export function artworkExperienceActions(capabilities,language,playing=false){
  const copy=HUB_COPY[language];
  return [
    {id:'about',label:copy.about},
    ...(usable(capabilities?.image)?[{id:'image',label:copy.image}]:[]),
    ...(usable(capabilities?.audio)?[{id:'audio',label:playing?copy.pause:copy.audio}]:[]),
    ...(usable(capabilities?.museum)?[{id:'museum',label:copy.museum}]:[]),
    {id:'return',label:copy.return}
  ];
}
export function artworkExperiencePresentation({artist,work,language,view='menu',status='',capabilities,playing=false,image=null,printedNotice=null}){
  const copy=HUB_COPY[language];
  const actions=artworkExperienceActions(capabilities,language,playing);
  if(printedNotice)actions.splice(actions.length-1,0,{id:'printed',label:printedNotice.label,href:printedNotice.href});
  actions.splice(actions.length-1,0,{id:'goto-artwork',label:copy.goToArtwork});
  return {artist:artist.name[language],title:work.title[language],description:view==='about'?(printedNotice?.description||work.description[language]):view==='image'?'':copy.choose,status,image,actions,dir:language==='ar'?'rtl':'ltr'};
}
