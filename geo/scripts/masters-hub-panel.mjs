import {panelButtonAt,layoutHubButtons} from './masters-hub-core.mjs';

export function layoutGuideBubbleButtons(actions,rtl=false,startY=240){
  return actions.map((action,index)=>{const full=index===actions.length-1&&actions.length%2===1,column=rtl?1-index%2:index%2;return {...action,x:full?52:52+column*474,y:startY+Math.floor(index/2)*96,width:full?920:446,height:84};});
}

export function createHubXrPanel(THREE,language,{side='default',bubble=false,showStatus=false}={}){
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=900;
  const ctx=canvas.getContext('2d'),texture=new THREE.CanvasTexture(canvas);texture.encoding=THREE.sRGBEncoding;
  const bubbleSize=1.05;
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(bubble?bubbleSize:1.08,bubble?bubbleSize:.95),new THREE.MeshBasicMaterial({map:texture,transparent:true,depthTest:bubble,depthWrite:false,side:THREE.DoubleSide}));
  mesh.visible=false;mesh.renderOrder=100;const rtl=language==='ar';let view=null,hover=null,buttons=[];
  const lockedPosition=new THREE.Vector3(),lockedQuaternion=new THREE.Quaternion(),lockedOffset=new THREE.Vector3(),parentQuaternion=new THREE.Quaternion();let bodyLocked=false;
  function text(value,x,y,size,color='#f8f1e5',width=920){ctx.font=`${size}px system-ui,sans-serif`;ctx.direction=rtl?'rtl':'ltr';ctx.textAlign=rtl?'right':'left';ctx.fillStyle=color;ctx.fillText(value,rtl?1024-x:x,y,width);}
  function paragraph(value,y){
    const fontSize=bubble?28:30,lineHeight=bubble?36:46,maxLines=bubble?3:6;
    ctx.font=`${fontSize}px system-ui,sans-serif`;let row='',line=0;
    for(const word of String(value).split(/\s+/)){
      const next=row?row+' '+word:word;
      if(ctx.measureText(next).width>920&&row){text(row,52,y+line*lineHeight,fontSize);line++;row=word;if(line===maxLines)return;}else row=next;
    }
    if(row)text(row,52,y+line*lineHeight,fontSize);
  }
  function draw(next){
    view=next;buttons=[];
    const buttonStart=(view.image?344:240)+(bubble&&showStatus&&view.status?40:0);
    if(bubble){const height=buttonStart+32+Math.ceil(view.actions.length/2)*96;if(canvas.height!==height)canvas.height=height;mesh.scale.y=height/1024;}
    ctx.clearRect(0,0,1024,canvas.height);ctx.fillStyle=bubble?'#142231b8':'#17212dcc';ctx.fillRect(0,0,1024,canvas.height);
    ctx.strokeStyle='#d3b67c';ctx.lineWidth=3;ctx.strokeRect(4,4,1016,canvas.height-8);
    if(bubble)text(view.title,52,66,42);else{ text(view.artist,52,62,27,'#ddc592');text(view.title,52,126,44); }
    if(view.image){const s=Math.min(920/view.image.width,(bubble?210:350)/view.image.height);ctx.drawImage(view.image,(1024-view.image.width*s)/2,bubble?106:166,view.image.width*s,view.image.height*s);}
    else paragraph(view.description||'',bubble?118:196);
    if(!bubble)text(view.status||'',52,view.actions.length>4?516:542,25,'#d6cab6');
    else if(showStatus&&view.status)text(view.status,52,buttonStart-14,22,'#ddc592');
    (bubble?layoutGuideBubbleButtons(view.actions,rtl,buttonStart):layoutHubButtons(view.actions,rtl)).forEach(a=>{
      const {x,y,width,height}=a;
      ctx.fillStyle=hover===a.id?'#a5e6e0':'#273b4b';ctx.fillRect(x,y,width,height);
      ctx.strokeStyle=hover===a.id?'#fff':'#ad9566';ctx.lineWidth=hover===a.id?6:2;ctx.strokeRect(x,y,width,height);
      ctx.font='30px system-ui,sans-serif';ctx.textAlign='center';ctx.direction=rtl?'rtl':'ltr';ctx.fillStyle=hover===a.id?'#17212d':'#fff9ed';ctx.fillText(a.label,x+width/2,y+height*.64,width-20);
      buttons.push({id:a.id,x,y,width,height});
    });texture.needsUpdate=true;
  }
  return {mesh,draw,
    place(matrix){this.placeBodyLocked(matrix,{force:true});},
    placeBodyLocked(matrix,{force=false}={}){
      if(bodyLocked&&!force)return;
      lockedQuaternion.setFromRotationMatrix(matrix);
      lockedOffset.set(side==='left'||rtl?-.72:.72,-.1,-1.45).applyQuaternion(lockedQuaternion);
      lockedPosition.setFromMatrixPosition(matrix).add(lockedOffset);
      if(mesh.parent){
        mesh.parent.updateWorldMatrix(true,false);mesh.position.copy(lockedPosition);mesh.parent.worldToLocal(mesh.position);
        mesh.parent.getWorldQuaternion(parentQuaternion);mesh.quaternion.copy(parentQuaternion.invert().multiply(lockedQuaternion));
      }else{mesh.position.copy(lockedPosition);mesh.quaternion.copy(lockedQuaternion);}
      bodyLocked=true;mesh.updateMatrixWorld(true);
    },
    resetFollower(){bodyLocked=false;},
    placeAbove(anchor,matrix,orientation){const viewer=new THREE.Vector3().setFromMatrixPosition(matrix);mesh.position.copy(anchor);mesh.position.y+=.18+(bubble?bubbleSize*mesh.scale.y:.95)/2;if(orientation)mesh.quaternion.copy(orientation);else mesh.rotation.set(0,Math.atan2(viewer.x-anchor.x,viewer.z-anchor.z),0);mesh.updateMatrixWorld(true);},
    hit(ray){if(!mesh.visible)return null;const h=ray.intersectObject(mesh)[0];return h?{distance:h.distance,point:h.point,action:panelButtonAt(buttons,h.uv.x*1024,(1-h.uv.y)*canvas.height)}:null;},
    setHover(id){if(id===hover)return;hover=id;if(view)draw(view);},
    dispose(){mesh.geometry.dispose();mesh.material.dispose();texture.dispose();}
  };
}
