// Separate V6.10 canvas: V6.8 Mona Lisa panel geometry and UV targets stay intact.
export function guideButtonAt(buttons,x,y){
  return buttons.find(button=>x>=button.x && x<=button.x+button.width && y>=button.y && y<=button.y+button.height)?.id || null;
}

export function createActiveGuideXrPanel(THREE,language){
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=800;
  const ctx=canvas.getContext('2d');
  const texture=new THREE.CanvasTexture(canvas);texture.encoding=THREE.sRGBEncoding;
  const geometry=new THREE.PlaneGeometry(1.28,1);
  const material=new THREE.MeshBasicMaterial({map:texture,transparent:true,side:THREE.DoubleSide,depthTest:false,depthWrite:false});
  const mesh=new THREE.Mesh(geometry,material);mesh.visible=false;mesh.renderOrder=100;
  const rtl=language==='ar';
  let buttons=[],hover=null,last=null;

  function text(value,x,y,size=30,color='#fff6e8',maxWidth=920){
    ctx.fillStyle=color;ctx.font=`600 ${size}px system-ui, sans-serif`;
    ctx.direction=rtl?'rtl':'ltr';ctx.textAlign=rtl?'right':'left';
    ctx.fillText(value,rtl?1024-x:x,y,maxWidth);
  }
  function lines(value,x,y,maxLines=6){
    ctx.fillStyle='#eee5d8';ctx.font='28px system-ui, sans-serif';
    ctx.direction=rtl?'rtl':'ltr';ctx.textAlign=rtl?'right':'left';
    let row=0;
    for(const paragraph of String(value).split('\n')){
      let line='';
      for(const word of paragraph.split(/\s+/)){
        const next=line?`${line} ${word}`:word;
        if(ctx.measureText(next).width>920 && line){
          ctx.fillText(line,rtl?976:x,y+row*43,920);row++;line=word;
          if(row>=maxLines)return;
        }else line=next;
      }
      if(line){ctx.fillText(line,rtl?976:x,y+row*43,920);row++;}
      if(row>=maxLines)return;
    }
  }
  function button(id,label,x,y,width,height){
    const targeted=id===hover;
    ctx.fillStyle=targeted?'#8de2ed':'#33404a';ctx.fillRect(x,y,width,height);
    ctx.strokeStyle=targeted?'#ffffff':'#e2c58f';ctx.lineWidth=targeted?7:2;ctx.strokeRect(x,y,width,height);
    ctx.fillStyle=targeted?'#21190e':'#fff9ef';ctx.font='600 27px system-ui, sans-serif';
    ctx.direction=rtl?'rtl':'ltr';ctx.textAlign='center';ctx.fillText(label,x+width/2,y+height/2+10,width-18);
    buttons.push({id,x,y,width,height});
  }
  function draw(view,{kicker,role,status='',closeLabel,failed=false,retryLabel=''}={}){
    last={view,options:{kicker,role,status,closeLabel,failed,retryLabel}};
    buttons=[];ctx.clearRect(0,0,1024,800);
    // Keep V6.8's translucent backdrop, physical dimensions and side placement.
    ctx.fillStyle='#101b24b3';ctx.fillRect(0,0,1024,800);
    ctx.strokeStyle='#dfbd83';ctx.lineWidth=4;ctx.strokeRect(6,6,1012,788);
    text(kicker || '',48,63,25,'#eac78e');
    text(view.title,48,132,48);
    text(role || '',48,180,28,'#eac78e');
    lines(view.description,48,238);
    if(status)text(status,48,480,24,'#e9ddc8');
    const actions=[...view.actions.slice(0,3),{id:'CLOSE',label:closeLabel}];
    actions.forEach((action,index)=>button(action.id,action.label,48+(index%2)*472,515+Math.floor(index/2)*94,448,76));
    if(failed)button('RETRY_MODEL',retryLabel,48,710,928,64);
    texture.needsUpdate=true;
  }
  function place(cameraMatrix){
    const position=new THREE.Vector3().setFromMatrixPosition(cameraMatrix);
    const rotation=new THREE.Quaternion().setFromRotationMatrix(cameraMatrix);
    position.add(new THREE.Vector3(0,0,-1.55).applyQuaternion(rotation));
    position.add(new THREE.Vector3(rtl?-.9:.9,-.12,0).applyQuaternion(rotation));
    mesh.scale.setScalar(.82);mesh.position.copy(position);mesh.quaternion.copy(rotation);mesh.updateMatrixWorld(true);
  }
  function hit(raycaster){
    if(!mesh.visible)return null;
    const intersection=raycaster.intersectObject(mesh,false)[0];
    if(!intersection)return null;
    const x=intersection.uv.x*1024,y=(1-intersection.uv.y)*800;
    const action=guideButtonAt(buttons,x,y);
    return {inside:true,action:action?`guide-v610:${action}`:null,distance:intersection.distance,point:intersection.point};
  }
  function setHover(action){
    const next=typeof action==='string' && action.startsWith('guide-v610:')?action.slice('guide-v610:'.length):null;
    if(next===hover)return;
    hover=next;
    if(last)draw(last.view,last.options);
  }
  return {mesh,draw,place,hit,setHover,dispose(){geometry.dispose();material.dispose();texture.dispose();}};
}
