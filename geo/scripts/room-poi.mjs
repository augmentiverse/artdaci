import {localize, projectAssetUrl, withLanguage} from './geo-core.mjs';
import {resolveManifestMedia} from '../../scripts/artwork-media-manifest-core.mjs';

export function validateRoomPoi(room, place) {
  const errors=[];
  const points=room?.pointsOfInterest;
  if(!Array.isArray(points) || !points.length) return ['Room requires at least one artwork point of interest'];
  if(new Set(points.map(point=>point.id)).size!==points.length) errors.push('Room point of interest ids must be unique');
  for(const item of points){
    const label=item?.id || 'unnamed';
    const linked=place?.pointsOfInterest?.find(point=>point.id===item?.contentRef);
    const content=place?.contents?.find(entry=>entry.artworkId===item?.artworkId);
    if(!item?.id || item?.type!=='artwork' || !/^[a-z]{2}\d{2}$/.test(item?.artworkId || '') || linked?.artworkId!==item.artworkId || !content) errors.push(`Invalid linked artwork point of interest: ${label}`);
    if(item?.anchor?.coordinateSpace!=='generated-room-local-y-up' || !item?.anchor?.targetNode || !/not-surveyed/.test(item.anchor.calibrationStatus || '') || !Array.isArray(item.anchor.offset) || item.anchor.offset.length!==3 || !item.anchor.offset.every(Number.isFinite)) errors.push('Invalid room-local artwork anchor');
    if(!item?.observationView || !room?.navigation?.[item.observationView]) errors.push('Invalid artwork observation view');
    for(const language of ['fr','en','ar']) {
      if(!linked?.content?.title?.[language] || !linked?.content?.artist?.[language] || !linked?.content?.description?.[language] || !content?.media?.audio?.[language]?.localFallback) errors.push(`Missing ${label} ${language} content`);
    }
    const routeId=linked?.actions?.find(action=>action.type==='route')?.routeId;
    if(linked?.content?.audio?.contentArtworkId!==item?.artworkId || !place?.remoteExperience?.routes?.[routeId]) errors.push(`Missing ${label} audio or VR route`);
  }
  return errors;
}

export function resolveRoomPoi(room, place, language, id=room?.pointsOfInterest?.[0]?.id) {
  const errors=validateRoomPoi(room,place);
  if(errors.length) throw new Error(errors.join('; '));
  const entry=room.pointsOfInterest.find(item=>item.id===id);
  if(!entry) throw new Error(`Unknown room point of interest: ${id}`);
  const point=place.pointsOfInterest.find(item=>item.id===entry.contentRef);
  const content=place.contents.find(item=>item.artworkId===entry.artworkId);
  const routeId=point.actions.find(action=>action.type==='route').routeId;
  return {
    entry,
    title:localize(point.content.title,language),
    artist:localize(point.content.artist,language),
    description:localize(point.content.description,language),
    audio:content.media.audio[language],
    manifestUrl:place.mediaResolver.canonicalManifestUrl,
    artworkUrl:withLanguage(place.remoteExperience.routes[routeId],language),
  };
}

export function roomPoiAudioCandidates(poi,manifest,language,moduleUrl) {
  const candidates=[];
  if(manifest) {
    try {
      const remote=resolveManifestMedia(manifest,poi.audio.manifestKey,language);
      if(remote && new URL(remote).protocol==='https:') candidates.push({source:'r2',url:remote});
    } catch { /* A malformed or unavailable manifest leaves the local copy usable. */ }
  }
  candidates.push({source:'local',url:projectAssetUrl(poi.audio.localFallback,moduleUrl)});
  return candidates;
}

export function roomHotspotPosition(center,offset) {
  if(![center.x,center.y,center.z,...offset].every(Number.isFinite)) throw new TypeError('Finite model-local hotspot coordinates required');
  return {x:center.x+offset[0],y:center.y+offset[1],z:center.z+offset[2]};
}

export function interpolateRoomView(from,to,progress) {
  const t=Math.max(0,Math.min(1,progress));
  const eased=t*t*(3-2*t);
  const delta=((to.yaw-from.yaw+Math.PI)%(Math.PI*2)+Math.PI*2)%(Math.PI*2)-Math.PI;
  return {x:from.x+(to.x-from.x)*eased,z:from.z+(to.z-from.z)*eased,yaw:from.yaw+delta*eased};
}
