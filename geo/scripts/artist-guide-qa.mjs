// Opt-in local QA only. This control never persists or rewrites configuration.
export function createGuideQa({stage,initial,onChange}){
  const keys=[['positionX',-8,8.8,.05],['positionY',-.5,.5,.01],['positionZ',-8.8,8,.05],['rotationY',-3.14,3.14,.02],['scale',.5,1.3,.01]];
  const values={...initial},panel=document.createElement('aside');panel.className='hub-guide-qa';
  const title=document.createElement('strong');title.textContent='Leonardo · placement QA';panel.append(title);
  for(const [key,min,max,step] of keys){
    const label=document.createElement('label'),output=document.createElement('output'),slider=document.createElement('input');
    label.textContent=key;slider.type='range';slider.min=min;slider.max=max;slider.step=step;slider.value=String(values[key]);output.textContent=String(values[key]);
    slider.oninput=()=>{values[key]=Number(slider.value);output.textContent=values[key].toFixed(2);onChange({...values});};
    label.append(output,slider);panel.append(label);
  }
  const button=document.createElement('button');button.textContent='Copier le JSON';
  button.onclick=async()=>{await navigator.clipboard.writeText(JSON.stringify(values,null,2));button.textContent='JSON copié';};
  panel.append(button);stage.append(panel);return {values,remove(){panel.remove();}};
}
