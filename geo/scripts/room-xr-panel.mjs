// A small, controller-selectable world-space panel for immersive-vr. The HTML
// panel remains the accessible desktop/mobile interface; no DOM overlay is
// assumed to be visible in a Quest immersive session.
export function controllerRayScale(hit,maxLength=5) {
  return Number.isFinite(hit?.distance) && hit.distance>0
    ? Math.max(.01,Math.min(1,hit.distance/maxLength))
    : 1;
}

export function createRoomXrPanel(THREE,language) {
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=800;
  const ctx=canvas.getContext('2d');
  const texture=new THREE.CanvasTexture(canvas);texture.encoding=THREE.sRGBEncoding;
  const geometry=new THREE.PlaneGeometry(1.28,1);
  const material=new THREE.MeshBasicMaterial({map:texture,transparent:true,side:THREE.DoubleSide,depthTest:false});
  const mesh=new THREE.Mesh(geometry,material);mesh.visible=false;mesh.renderOrder=100;
  let actions=[],hoveredAction=null,lastDraw=null;
  const rightToLeft=language==='ar';

  function text(value,x,y,size=30,color='#fff6e8',maxWidth=900) {
    ctx.fillStyle=color;ctx.font=`600 ${size}px system-ui, sans-serif`;
    ctx.direction=rightToLeft?'rtl':'ltr';ctx.textAlign=rightToLeft?'right':'left';
    ctx.fillText(value,rightToLeft?1024-x:x,y,maxWidth);
  }

  function lines(value,x,y,maxWidth=900,maxLines=4) {
    ctx.fillStyle='#eee5d8';ctx.font='28px system-ui, sans-serif';
    ctx.direction=rightToLeft?'rtl':'ltr';ctx.textAlign=rightToLeft?'right':'left';
    const words=String(value).split(/\s+/);let line='',row=0;
    for(const word of words){
      const next=line?`${line} ${word}`:word;
      if(ctx.measureText(next).width>maxWidth && line){
        ctx.fillText(line,rightToLeft?1024-x:x,y+row*43,maxWidth);row++;line=word;
        if(row>=maxLines) break;
      } else line=next;
    }
    if(row<maxLines && line) ctx.fillText(line,rightToLeft?1024-x:x,y+row*43,maxWidth);
  }

  function button(id,label,x,y,width,height) {
    const targeted=id===hoveredAction;
    ctx.fillStyle=targeted?'#8de2ed':id==='explore'?'#d4af76':'#33404a';
    ctx.fillRect(x,y,width,height);
    ctx.strokeStyle=targeted?'#ffffff':'#e2c58f';ctx.lineWidth=targeted?7:2;ctx.strokeRect(x,y,width,height);
    ctx.fillStyle=targeted || id==='explore'?'#21190e':'#fff9ef';
    ctx.font='600 28px system-ui, sans-serif';ctx.direction=rightToLeft?'rtl':'ltr';
    ctx.textAlign='center';ctx.fillText(label,x+width/2,y+height/2+10,width-18);
    actions.push({id,x,y,width,height});
  }

  function draw(copy,poi,{observing=false,audioLabel='',audioActionLabel=copy.play}) {
    lastDraw={copy,poi,options:{observing,audioLabel,audioActionLabel}};
    actions=[];ctx.clearRect(0,0,1024,800);
    ctx.fillStyle='#101b24ef';ctx.fillRect(0,0,1024,800);
    ctx.strokeStyle='#dfbd83';ctx.lineWidth=8;ctx.strokeRect(6,6,1012,788);
    text(copy.artworkLabel,48,76,25,'#eac78e');
    text(poi.title,48,143,51);
    text(poi.artist,48,192,31,'#eac78e');
    if(observing){
      text(copy.observe,48,288,38);
      text(audioLabel,48,355,26,'#e9ddc8');
      text(copy.vrPoiHint,48,410,24,'#e9ddc8');
      button('audio',audioActionLabel,48,530,296,90);
      button('explore',copy.explore,364,530,296,90);
      button('return',copy.returnRoom,680,530,296,90);
    } else {
      lines(poi.description,48,250,920,4);
      text(audioLabel,48,470,26,'#e9ddc8');
      const buttons=[['approach',copy.approach],['observe',copy.observe],['audio',audioActionLabel],['stop',copy.stop],['explore',copy.explore],['return',copy.returnRoom]];
      buttons.forEach(([id,label],index)=>button(id,label,48+(index%2)*472,510+Math.floor(index/2)*88,448,72));
    }
    texture.needsUpdate=true;
  }

  function place(cameraMatrix) {
    const position=new THREE.Vector3().setFromMatrixPosition(cameraMatrix);
    const rotation=new THREE.Quaternion().setFromRotationMatrix(cameraMatrix);
    position.add(new THREE.Vector3(0,0,-1.55).applyQuaternion(rotation));
    position.add(new THREE.Vector3(.36,-.06,0).applyQuaternion(rotation));
    mesh.position.copy(position);mesh.quaternion.copy(rotation);
    mesh.updateMatrixWorld(true);
  }

  function hit(raycaster) {
    if(!mesh.visible)return null;
    const intersection=raycaster.intersectObject(mesh,false)[0];
    if(!intersection)return null;
    const x=intersection.uv.x*1024,y=(1-intersection.uv.y)*800;
    return {inside:true,action:actions.find(item=>x>=item.x && x<=item.x+item.width && y>=item.y && y<=item.y+item.height)?.id || null,distance:intersection.distance,point:intersection.point};
  }

  function setHover(action) {
    const next=actions.some(item=>item.id===action)?action:null;
    if(next===hoveredAction)return;
    hoveredAction=next;
    if(lastDraw)draw(lastDraw.copy,lastDraw.poi,lastDraw.options);
  }

  return {mesh,draw,place,hit,setHover,dispose(){geometry.dispose();material.dispose();texture.dispose();}};
}
