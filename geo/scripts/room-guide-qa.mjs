// Local preview only. No persistence, no file write and no automatic calibration.
const TEXT={
  fr:{title:'Réglage local de Léonard',note:'Aperçu uniquement : rechargez pour retrouver la proposition initiale. X et Z sont des coordonnées de la salle ; Y désigne les pieds.',apply:'Appliquer à l’aperçu',view:'Voir le guide',copy:'Copier le JSON',copied:'JSON copié.',manual:'Sélectionnez le JSON pour le copier.',invalid:'Position refusée : gardez le guide sur le côté et près du sol.',rotation:'Rotation Y (degrés)',scale:'Échelle'},
  en:{title:'Local Leonardo placement',note:'Preview only: reload to restore the proposal. X and Z are room coordinates; Y marks the feet.',apply:'Apply preview',view:'View the guide',copy:'Copy JSON',copied:'JSON copied.',manual:'Select the JSON to copy it.',invalid:'Invalid position: keep the guide beside the central route and near the floor.',rotation:'Y rotation (degrees)',scale:'Scale'},
  ar:{title:'ضبط ليوناردو محليًا',note:'معاينة فقط: أعد التحميل لاستعادة الوضع المقترح. X وZ إحداثيات القاعة، وY ارتفاع القدمين.',apply:'تطبيق المعاينة',view:'شاهد الدليل',copy:'نسخ JSON',copied:'تم نسخ JSON.',manual:'حدد JSON لنسخه.',invalid:'موضع غير صالح: أبقِ الدليل جانب المسار وقريبًا من الأرض.',rotation:'الدوران Y بالدرجات',scale:'المقياس'},
};

export function attachGuideQa({guide,room,language,onPreview,onView}) {
  if(!['localhost','127.0.0.1','[::1]'].includes(location.hostname))return;
  const t=TEXT[language],panel=document.createElement('section');
  panel.className='room-guide-qa';panel.setAttribute('aria-label',t.title);
  const heading=document.createElement('h2');heading.textContent=t.title;
  const note=document.createElement('p');note.textContent=t.note;
  const form=document.createElement('form'),fields=new Map();
  const initial=guide.placement;
  const values={x:initial.position.x,y:initial.position.y,z:initial.position.z,rotationY:initial.rotationY*180/Math.PI,scale:initial.scale};
  for(const key of Object.keys(values)){
    const label=document.createElement('label'),input=document.createElement('input');
    label.textContent=key==='rotationY'?t.rotation:key==='scale'?t.scale:key.toUpperCase();
    input.type='number';input.name=key;input.required=true;input.step=key==='rotationY'?'1':'0.01';input.value=String(values[key]);
    label.append(input);form.append(label);fields.set(key,input);
  }
  const apply=document.createElement('button');apply.type='submit';apply.textContent=t.apply;form.append(apply);
  const view=document.createElement('button');view.type='button';view.textContent=t.view;
  const copy=document.createElement('button');copy.type='button';copy.textContent=t.copy;
  const output=document.createElement('textarea');output.readOnly=true;output.rows=12;output.dir='ltr';output.setAttribute('aria-label','Placement JSON');
  const status=document.createElement('p');status.setAttribute('role','status');
  const exportPreview=()=>{output.value=JSON.stringify({id:'leonardo-guide',placement:guide.placement},null,2);};
  exportPreview();
  form.addEventListener('submit',event=>{
    event.preventDefault();
    const placement=guide.placement;
    placement.position={x:Number(fields.get('x').value),y:Number(fields.get('y').value),z:Number(fields.get('z').value)};
    placement.rotationY=Number(fields.get('rotationY').value)*Math.PI/180;
    placement.scale=Number(fields.get('scale').value);
    try{guide.applyPlacement(placement);exportPreview();status.textContent='';onPreview();}
    catch{status.textContent=t.invalid;}
  });
  view.addEventListener('click',()=>{
    const p=guide.placement.position;
    onView({x:p.x,z:Math.min(p.z+3,room.navigation.bounds.maxZ),yaw:0});onPreview();
  });
  copy.addEventListener('click',async()=>{
    try{await navigator.clipboard.writeText(output.value);status.textContent=t.copied;}
    catch{output.focus();output.select();status.textContent=t.manual;}
  });
  panel.append(heading,note,form,view,copy,output,status);
  document.querySelector('.room-main').append(panel);
}
