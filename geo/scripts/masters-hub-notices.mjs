const LANGUAGES=['fr','en','ar'];
const COPY={
  fr:{more:'Fiche imprimée · détails',english:'Fiche imprimée · texte EN',other:'Autre autoportrait · 1887'},
  en:{more:'Printed spread · details',english:'Printed spread · English text',other:'Other self-portrait · 1887'},
  ar:{more:'الصفحة المطبوعة · التفاصيل',english:'الصفحة المطبوعة · النص بالإنجليزية',other:'صورة ذاتية أخرى · 1887'}
};
export function validatePrintedNotices(data,ids){
  const errors=[];
  if(data?.schemaVersion!=='1.0'||JSON.stringify(Object.keys(data.artworks||{}).sort())!==JSON.stringify([...ids].sort()))errors.push('Invalid printed notice selection');
  for(const notice of Object.values(data?.artworks||{})){
    if(!/^content\/paintings\/[a-z0-9-]+\.json$/.test(notice.source||'')||!['same-work','other-version'].includes(notice.relation))errors.push('Invalid printed source');
    for(const language of LANGUAGES)if(!notice.summary?.[language]||!LANGUAGES.includes(notice.pageTextLanguages?.[language])||!/^\.\.\/print-[a-z0-9-]+\.html\?[a-z0-9=&%-]+$/.test(notice.routes?.[language]||''))errors.push('Invalid localized printed notice');
  }
  return errors;
}
export function printedNotice(data,id,language){
  const notice=data?.artworks?.[id],lang=LANGUAGES.includes(language)?language:'fr';
  if(!notice)return null;
  return {description:notice.summary[lang],href:notice.routes[lang],label:COPY[lang][notice.relation==='other-version'?'other':notice.pageTextLanguages[lang]!==lang?'english':'more']};
}
// Only calibrated runtime artwork bounds are used; these are not geographic coordinates.
export function artworkTopAnchor(THREE,item,target=new THREE.Vector3()){
  const mesh=item?.mesh;if(!mesh)return null;
  mesh.updateWorldMatrix(true,false);return target.set(0,.5,.06).applyMatrix4(mesh.matrixWorld);
}
// Derive a comfortable visitor pose from the calibrated artwork transform.
// No per-artwork coordinates are stored or invented.
export function artworkVisitorPose(THREE,item,distance=2.15){
  const mesh=item?.mesh;if(!mesh||!Number.isFinite(distance)||distance<=0)return null;
  mesh.updateWorldMatrix(true,false);
  const center=mesh.getWorldPosition(new THREE.Vector3());
  const normal=new THREE.Vector3(0,0,1).applyQuaternion(mesh.getWorldQuaternion(new THREE.Quaternion()));normal.y=0;
  if(normal.lengthSq()<.5)return null;normal.normalize();
  const position=center.clone().addScaledVector(normal,distance);
  const direction=center.clone().sub(position);direction.y=0;direction.normalize();
  return {x:position.x,z:position.z,yaw:Math.atan2(-direction.x,-direction.z)};
}
