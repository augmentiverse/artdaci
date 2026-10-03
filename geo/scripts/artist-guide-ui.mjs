// The component is prepared for activation in a later version; V6.14 does not mount it.
export function createArtistGuideUi({element,engine,language,onArtwork=()=>{},onClose=()=>{}}){
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
      const button=document.createElement('button');button.type='button';button.dataset.action=action.id;button.textContent=action.label;
      button.addEventListener('click',()=>activate(action.id));actions.append(button);
    }
    element.append(heading,description,actions);
    return view;
  }
  function activate(action){
    if(action==='CLOSE'){engine.unloadGuide();visible=false;onClose();return render();}
    if(action.startsWith('ARTWORK_SELECTED:')){
      const artworkId=action.slice('ARTWORK_SELECTED:'.length);
      engine.dispatch('ARTWORK_SELECTED',{artworkId});onArtwork(artworkId);
    }else engine.dispatch(action==='ABOUT_ARTIST'?'ARTIST_ABOUT':action);
    return render();
  }
  return {show(){visible=true;return render();},hide(){visible=false;element.hidden=true;},activate,render,get visible(){return visible;}};
}
