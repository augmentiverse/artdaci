import {panelButtonAt,layoutHubButtons} from './masters-hub-core.mjs';

export function createHubXrPanel(THREE,language,{side='default'}={}){
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=900;
  const ctx=canvas.getContext('2d'),texture=new THREE.CanvasTexture(canvas);texture.encoding=THREE.sRGBEncoding;
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(1.08,.95),new THREE.MeshBasicMaterial({map:texture,transparent:true,depthTest:false,depthWrite:false,side:THREE.DoubleSide}));
  mesh.visible=false;mesh.renderOrder=100;const rtl=language==='ar';let view=null,hover=null,buttons=[];
  function text(value,x,y,size,color='#f8f1e5',width=920){ctx.font=`${size}px system-ui,sans-serif`;ctx.direction=rtl?'rtl':'ltr';ctx.textAlign=rtl?'right':'left';ctx.fillStyle=color;ctx.fillText(value,rtl?1024-x:x,y,width);}
  function paragraph(value,y){
    ctx.font='30px system-ui,sans-serif';let row='',line=0;
    for(const word of String(value).split(/\s+/)){
      const next=row?row+' '+word:word;
      if(ctx.measureText(next).width>920&&row){text(row,52,y+line*46,30);line++;row=word;if(line===6)return;}else row=next;
    }
    if(row)text(row,52,y+line*46,30);
  }
  function draw(next){
    view=next;buttons=[];ctx.clearRect(0,0,1024,900);ctx.fillStyle='#17212dcc';ctx.fillRect(0,0,1024,900);
    ctx.strokeStyle='#d3b67c';ctx.lineWidth=3;ctx.strokeRect(4,4,1016,892);
    text(view.artist,52,62,27,'#ddc592');text(view.title,52,126,44);
    if(view.image){const s=Math.min(920/view.image.width,350/view.image.height);ctx.drawImage(view.image,(1024-view.image.width*s)/2,166,view.image.width*s,view.image.height*s);}
    else paragraph(view.description||'',196);
    text(view.status||'',52,view.actions.length>4?516:542,25,'#d6cab6');
    layoutHubButtons(view.actions,rtl).forEach(a=>{
      const {x,y,width,height}=a;
      ctx.fillStyle=hover===a.id?'#a5e6e0':'#273b4b';ctx.fillRect(x,y,width,height);
      ctx.strokeStyle=hover===a.id?'#fff':'#ad9566';ctx.lineWidth=hover===a.id?6:2;ctx.strokeRect(x,y,width,height);
      ctx.font='30px system-ui,sans-serif';ctx.textAlign='center';ctx.direction=rtl?'rtl':'ltr';ctx.fillStyle=hover===a.id?'#17212d':'#fff9ed';ctx.fillText(a.label,x+width/2,y+height*.64,width-20);
      buttons.push({id:a.id,x,y,width,height});
    });texture.needsUpdate=true;
  }
  return {mesh,draw,
    place(matrix){const q=new THREE.Quaternion().setFromRotationMatrix(matrix);mesh.position.setFromMatrixPosition(matrix).add(new THREE.Vector3(side==='left'?-.67:rtl?-.67:.67,-.18,-1.5).applyQuaternion(q));mesh.quaternion.copy(q);mesh.updateMatrixWorld(true);},
    hit(ray){if(!mesh.visible)return null;const h=ray.intersectObject(mesh)[0];return h?{distance:h.distance,point:h.point,action:panelButtonAt(buttons,h.uv.x*1024,(1-h.uv.y)*900)}:null;},
    setHover(id){if(id===hover)return;hover=id;if(view)draw(view);},
    dispose(){mesh.geometry.dispose();mesh.material.dispose();texture.dispose();}
  };
}
