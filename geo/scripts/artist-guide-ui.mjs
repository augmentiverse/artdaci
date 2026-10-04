export function guideBubbleScreenPlacement(bounds,{width,height,panelWidth,panelHeight,aboveOnly=false}){
  const gap=14,margin=10,center=(bounds.left+bounds.right)/2;
  if(bounds.right<0||bounds.left>width||bounds.bottom<0||bounds.top>height)return null;
  const clampLeft=value=>Math.max(margin,Math.min(width-panelWidth-margin,value));
  const clampTop=value=>Math.max(margin,Math.min(height-panelHeight-margin,value));
  if(bounds.top-panelHeight-gap>=margin)return {left:clampLeft(center-panelWidth/2),top:bounds.top-panelHeight-gap,placement:'above'};
  if(aboveOnly)return null;
  if(bounds.right+gap+panelWidth<=width-margin)return {left:bounds.right+gap,top:clampTop(bounds.top),placement:'side'};
  if(bounds.left-gap-panelWidth>=margin)return {left:bounds.left-gap-panelWidth,top:clampTop(bounds.top),placement:'side'};
  if(bounds.bottom+gap+panelHeight<=height-margin)return {left:clampLeft(center-panelWidth/2),top:bounds.bottom+gap,placement:'below'};
  return null;
}

export function createArtistGuideUi({element,engine,language,onArtwork=()=>{},onNavigate=()=>{},onClose=()=>{}}){
  if(!element||!engine)throw new TypeError('Guide UI requires an element and engine');
  let visible=false;
  function render(){
    const view=engine.presentation(language);element.hidden=!visible||!view;
    if(element.hidden)return null;
    element.dir=view.dir;
    element.replaceChildren();
    const heading=document.createElement('h2');heading.textContent=view.title;
    const description=document.createElement('p');description.textContent=view.description;
    const actions=document.createElement('div');actions.className='hub-guide-actions';
    for(const action of view.actions){
      const button=document.createElement(action.href?'a':'button');if(action.href)button.href=action.href;else button.type='button';button.dataset.action=action.id;button.textContent=action.label;
      button.addEventListener('click',event=>{event?.preventDefault();activate(action.id);});actions.append(button);
    }
    element.append(heading,description,actions);
    return view;
  }
  function activate(action){
    const link=engine.presentation(language)?.actions.find(item=>item.id===action&&item.href);
    if(link){onNavigate(link.href);return render();}
    if(action==='CLOSE'){engine.unloadGuide();visible=false;onClose();return render();}
    if(action.startsWith('ARTWORK_SELECTED:')){
      const artworkId=action.slice('ARTWORK_SELECTED:'.length);
      engine.dispatch('ARTWORK_SELECTED',{artworkId});onArtwork(artworkId);
    }else engine.dispatch(action==='ABOUT_ARTIST'?'ARTIST_ABOUT':action);
    return render();
  }
  return {show(){visible=true;return render();},hide(){visible=false;element.hidden=true;},activate,render,get visible(){return visible;}};
}
