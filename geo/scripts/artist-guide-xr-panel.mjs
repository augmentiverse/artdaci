import {createHubXrPanel} from './masters-hub-panel.mjs';

// Reuse the validated compact translucent Hub canvas and its UV raycast.
export function createArtistGuideXrPanel(THREE,language){
  const panel=createHubXrPanel(THREE,language,{side:'left'});
  return {...panel,drawGuide(view,{artistName='',status=''}={}){
    if(!view){panel.mesh.visible=false;return;}
    panel.draw({artist:artistName,title:view.title,description:view.description,status,actions:view.actions});
  }};
}
