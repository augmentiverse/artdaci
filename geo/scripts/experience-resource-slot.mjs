// One owned heavy resource at a time. A late, obsolete load is disposed immediately.
export function disposeOwnedResource(handle){
  if(!handle)return;
  if(typeof handle.dispose==='function'){handle.dispose();return;}
  if(handle.owned!==true||typeof handle.object?.traverse!=='function')throw new TypeError('A loaded resource must supply dispose() or an owned scene object');
  const geometries=new Set(),materials=new Set(),textures=new Set();
  handle.object.traverse(node=>{
    if(node.geometry)geometries.add(node.geometry);
    for(const material of Array.isArray(node.material)?node.material:node.material?[node.material]:[]){
      materials.add(material);
      for(const value of Object.values(material))if(value?.isTexture)textures.add(value);
    }
  });
  for(const texture of textures)texture.dispose();
  for(const material of materials)material.dispose();
  for(const geometry of geometries)geometry.dispose();
}

export function createResourceSlot({load,dispose=disposeOwnedResource}={}){
  if(typeof load!=='function'||typeof dispose!=='function')throw new TypeError('Resource slot requires load and dispose functions');
  let revision=0,controller=null,current=null,currentId=null,closed=false;
  function clear(){
    revision++;controller?.abort();controller=null;
    if(current)dispose(current);
    current=null;currentId=null;
  }
  async function select(id,descriptor){
    if(closed)throw new Error('Resource slot closed');
    clear();
    if(!descriptor)return null;
    const request=revision;controller=new AbortController();const signal=controller.signal;
    let handle;
    try{handle=await load(descriptor,{id,signal});}
    catch(error){if(signal.aborted||request!==revision||closed)return null;controller=null;throw error;}
    if(signal.aborted||request!==revision||closed){if(handle)dispose(handle);return null;}
    controller=null;current=handle??null;currentId=handle?id:null;
    return current;
  }
  return {select,clear,dispose(){if(closed)return;clear();closed=true;},snapshot:()=>({activeId:currentId,activeCount:Number(Boolean(current)),loading:Boolean(controller)})};
}
