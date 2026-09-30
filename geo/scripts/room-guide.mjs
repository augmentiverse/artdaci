import {localize,projectAssetUrl} from './geo-core.mjs';

export const GUIDE_COPY={
  fr:{meet:'Rencontrer Léonard',label:'Guide virtuel',seeMona:'Voir La Joconde',close:'Fermer',returnVisit:'Retour à la visite',loading:'Léonard arrive…',ready:'Sélectionnez Léonard pour poursuivre la visite.',failed:'Le modèle est indisponible. La visite reste accessible.',retry:'Réessayer',hint:'Visez un bouton et pressez la gâchette.'},
  en:{meet:'Meet Leonardo',label:'Virtual guide',seeMona:'See Mona Lisa',close:'Close',returnVisit:'Return to the visit',loading:'Leonardo is arriving…',ready:'Select Leonardo to continue your visit.',failed:'The model is unavailable. You can still continue the visit.',retry:'Retry',hint:'Aim at a button and press the trigger.'},
  ar:{meet:'قابل ليوناردو',label:'دليل افتراضي',seeMona:'شاهد الموناليزا',close:'إغلاق',returnVisit:'العودة إلى الزيارة',loading:'ليوناردو قادم…',ready:'اختر ليوناردو لمتابعة الزيارة.',failed:'النموذج غير متاح. يمكنك متابعة الزيارة.',retry:'إعادة المحاولة',hint:'وجّه المؤشر إلى زر واضغط الزناد.'},
};

export function validateGuidePlacement(placement,room) {
  const p=placement?.position,b=room?.navigation?.bounds;
  if(!p || !b || ![p.x,p.y,p.z,placement.rotationY,placement.scale].every(Number.isFinite))return ['Invalid guide transform'];
  const errors=[];
  if(placement.scale<.5 || placement.scale>1.3)errors.push('Guide scale must remain between 0.5 and 1.3');
  if(p.x<b.minX+.6 || p.x>b.maxX-.6 || p.z<b.minZ+1 || p.z>b.maxZ-1 || Math.abs(p.x)<2)errors.push('Guide must stay beside the central route and away from the walls');
  if(p.y<room.navigation.floorHeight || p.y>room.navigation.floorHeight+.3)errors.push('Guide feet must stay near the floor');
  return errors;
}

export function validateRoomGuide(guide,room) {
  const errors=validateGuidePlacement(guide?.placement,room);
  if(guide?.id!=='leonardo-guide' || guide?.type!=='character' || guide?.artistId!=='leonardo-da-vinci' || guide?.roomId!==room?.id)errors.push('Invalid room character');
  if(guide?.model?.path!=='assets/artists/leonardo-da-vinci/reimagined/models/davinci-standing-c.glb' || guide.model.loading!=='on-selection')errors.push('Guide must reuse the on-demand Leonardo model');
  if(guide?.placement?.coordinateSpace!=='generated-room-local-y-up' || guide.placement.origin!=='feet-centered' || !guide.placement.status?.includes('not-surveyed'))errors.push('Guide position is a local design proposal');
  const view=guide?.observationView,b=room?.navigation?.bounds;
  if(!view || ![view.x,view.z,view.yaw].every(Number.isFinite) || view.x<b.minX || view.x>b.maxX || view.z<b.minZ || view.z>b.maxZ)errors.push('Invalid guide observation view');
  const zone=guide?.interaction;
  if(zone?.shape!=='box' || ![zone.width,zone.height,zone.depth].every(n=>Number.isFinite(n) && n>0 && n<=2.5))errors.push('Invalid guide interaction zone');
  if(guide?.action?.targetPoiId!=='ld01-mona-lisa' || guide.action.observationView!=='artworkView' || !room?.pointsOfInterest?.some(p=>p.id===guide.action.targetPoiId))errors.push('Guide must link the existing Mona Lisa point');
  for(const language of ['fr','en','ar']){
    if(!guide?.content?.title?.[language] || !guide?.content?.role?.[language] || !guide?.content?.description?.[language])errors.push('Missing guide language: '+language);
    if(guide?.content?.audio?.[language]!==null)errors.push('No approved Leonardo narration is configured');
  }
  return errors;
}

export function resolveRoomGuide(guide,language) {
  return {type:'character',title:localize(guide.content.title,language),artist:localize(guide.content.role,language),description:localize(guide.content.description,language)};
}

// Selection is the only trigger. Concurrent requests share one load; a failed
// load is retried only by another explicit selection. Late results are released.
export function createLazyGuide({load,mount,release,onState=()=>{},now=()=>performance.now()}) {
  let state='idle',pending=null,value=null,disposed=false;
  return {
    get state(){return state;},
    ensure(){
      if(disposed)return Promise.resolve(null);
      if(value)return Promise.resolve(value);
      if(pending)return pending;
      const start=now();state='loading';onState(state,{modelCount:0});
      pending=Promise.resolve().then(load).then(model=>{
        if(disposed){release(model);return null;}
        try{mount(model);}catch(error){release(model);throw error;}
        value=model;state='ready';onState(state,{modelCount:1,loadMs:Math.round(now()-start)});
        return model;
      }).catch(error=>{
        if(!disposed){state='error';onState(state,{modelCount:0,error});}
        throw error;
      }).finally(()=>{pending=null;});
      return pending;
    },
    dispose(){
      if(disposed)return;
      disposed=true;state='disposed';
      if(value){release(value);value=null;}
      onState(state,{modelCount:0});
    },
  };
}

export function placeGuideModel(THREE,model) {
  model.updateMatrixWorld(true);
  const box=new THREE.Box3().setFromObject(model);
  if(box.isEmpty() || !Number.isFinite(box.min.y))throw new Error('Empty Leonardo geometry');
  const center=box.getCenter(new THREE.Vector3()),size=box.getSize(new THREE.Vector3());
  model.position.x-=center.x;model.position.y-=box.min.y;model.position.z-=center.z;
  return {sourceBounds:{min:box.min.toArray(),max:box.max.toArray()},size:size.toArray()};
}

export function createRoomGuide(THREE,{scene,config,room,language,loader,disposeModel,onState}) {
  const root=new THREE.Group();root.name='ARTDACI_leonardo-guide';
  const marker=new THREE.Mesh(new THREE.RingGeometry(.18/3,.25/3,32),new THREE.MeshBasicMaterial({color:0x75d6e8,side:THREE.DoubleSide}));
  const markerHit=new THREE.Mesh(new THREE.CircleGeometry(.32,24),new THREE.MeshBasicMaterial({side:THREE.DoubleSide}));
  markerHit.visible=false;
  const proxy=new THREE.Mesh(new THREE.BoxGeometry(config.interaction.width,config.interaction.height,config.interaction.depth),new THREE.MeshBasicMaterial());
  proxy.visible=false;proxy.position.y=config.interaction.height/2;
  const labelCanvas=document.createElement('canvas');labelCanvas.width=512;labelCanvas.height=128;
  const ctx=labelCanvas.getContext('2d');
  ctx.fillStyle='#152833ee';ctx.fillRect(0,0,512,128);
  ctx.fillStyle='#fff4dd';ctx.font='500 45px system-ui';ctx.textAlign='center';ctx.direction=language==='ar'?'rtl':'ltr';
  ctx.fillText(localize(config.content.title,language),256,78,490);
  const texture=new THREE.CanvasTexture(labelCanvas);texture.encoding=THREE.sRGBEncoding;
  const label=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,depthTest:true}));
  label.scale.set(1.15,.29,1);
  root.add(marker,markerHit,proxy,label);scene.add(root);
  let currentPlacement=structuredClone(config.placement),hovered=false;
  function applyPlacement(placement){
    const errors=validateGuidePlacement(placement,room);
    if(errors.length)throw new Error(errors.join('; '));
    currentPlacement=structuredClone(placement);
    const p=placement.position;root.position.set(p.x,p.y,p.z);root.rotation.y=placement.rotationY;root.scale.setScalar(placement.scale);
    root.updateMatrixWorld(true);
  }
  applyPlacement(currentPlacement);
  marker.position.set(0,1.05,.05);markerHit.position.copy(marker.position);label.position.set(0,1.47,0);
  const assetUrl=projectAssetUrl(config.model.path,import.meta.url);
  const lifecycle=createLazyGuide({
    load:()=>loader.loadAsync(assetUrl).then(result=>result.scene),
    mount:model=>{
      const measured=placeGuideModel(THREE,model);
      root.add(model);
      // V5 is unlit. These shadow-free lights illuminate the PBR guide only.
      const ambient=new THREE.HemisphereLight(0xfff6e7,0x807a73,1.0);
      const key=new THREE.DirectionalLight(0xffffff,.65);key.position.set(1,3,2);key.target=root;
      model.add(ambient,key);
      marker.position.y=measured.size[1]+.2;markerHit.position.copy(marker.position);label.position.y=measured.size[1]+.56;
      root.updateMatrixWorld(true);
    },
    release:model=>{root.remove(model);disposeModel(model);},
    onState,
  });
  return {
    ensure:()=>lifecycle.ensure(),
    get state(){return lifecycle.state;},
    get placement(){return structuredClone(currentPlacement);},
    applyPlacement,
    hit(raycaster){
      root.updateMatrixWorld(true);
      const targets=lifecycle.state==='ready'?[markerHit,proxy]:[markerHit];
      return raycaster.intersectObjects(targets,false)[0] || null;
    },
    setHover(value){
      if(value===hovered)return;
      hovered=value;marker.material.color.set(value?0xffffff:0x75d6e8);
    },
    dispose(){lifecycle.dispose();scene.remove(root);disposeModel(root);},
  };
}
