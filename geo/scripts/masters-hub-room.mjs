import {wallPlacement} from './masters-hub-core.mjs';

// Neutral south-east corner, outside every painting bay and facing the room.
export const HUB_EXIT=Object.freeze({x:9.1,y:2.65,z:9.1,yaw:-Math.PI*.75,width:1.6,height:.56});

function parquetCanvas(createCanvas){
  const canvas=createCanvas();canvas.width=canvas.height=512;
  const ctx=canvas.getContext('2d');
  let seed=614;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  // Alternating oak panels, no bevel, gradient, baked shadow or normal map.
  // Every plank is drawn on the same plane, with restrained grain contrast.
  for(let row=0;row<2;row++)for(let col=0;col<2;col++){
    ctx.save();ctx.translate(col*256+128,row*256+128);
    if((row+col)%2)ctx.rotate(Math.PI/2);
    for(let plank=0;plank<8;plank++){
      const tone=Math.floor(random()*15),y=-128+plank*32;
      ctx.fillStyle=`rgb(${114+tone},${76+tone},${43+tone})`;
      ctx.fillRect(-128,y,256,32);
      ctx.fillStyle='rgba(41,24,15,.30)';ctx.fillRect(-128,y,256,1);
      for(let grain=0;grain<32;grain++){
        const gy=y+1+random()*30;
        ctx.strokeStyle=grain%3?'rgba(56,30,13,.10)':'rgba(210,157,92,.10)';
        ctx.lineWidth=.35+random()*.6;ctx.beginPath();ctx.moveTo(-128,gy);
        ctx.bezierCurveTo(-40,gy+random()*2,50,gy-random()*2,128,gy);ctx.stroke();
      }
    }
    ctx.restore();
  }
  return canvas;
}

export function createHubArchitecture(THREE,{artists,maxAnisotropy=1,createCanvas=()=>document.createElement('canvas')}={}){
  const group=new THREE.Group();group.name='ARTDACI_Hub_Royal_Room';
  const boxes=new Map(),unitBox=new THREE.BoxGeometry(1,1,1),dummy=new THREE.Object3D();
  function box(w,h,d,color,x,y,z,yaw=0){
    if(!boxes.has(color))boxes.set(color,[]);
    dummy.position.set(x,y,z);dummy.rotation.set(0,yaw,0);dummy.scale.set(w,h,d);dummy.updateMatrix();
    boxes.get(color).push(dummy.matrix.clone());
  }
  const wood=0x382b25,gold=0xb99a58,trim=0x8b7150;
  const texture=new THREE.CanvasTexture(parquetCanvas(createCanvas));
  texture.encoding=THREE.sRGBEncoding;texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(8,8);
  texture.anisotropy=Math.min(4,maxAnisotropy);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(20,20),new THREE.MeshLambertMaterial({map:texture}));
  floor.name='Hub_flat_parquet';floor.rotation.x=-Math.PI/2;group.add(floor);
  box(20,.16,20,0x766753,0,4.5,0);
  for(const artist of artists){
    const centre=wallPlacement(artist.zone.wall,1),sin=Math.sin(centre.yaw),cos=Math.cos(centre.yaw);
    const wallBox=(w,h,d,color,x,y,z)=>box(w,h,d,color,centre.x+x*cos+z*sin,y,centre.z-x*sin+z*cos,centre.yaw);
    wallBox(20,4.5,.18,artist.zone.color,0,2.25,-.22);
    wallBox(19.8,.86,.10,wood,0,.43,-.06);
    wallBox(19.8,.16,.17,trim,0,.08,-.025);
    wallBox(19.8,.045,.14,gold,0,.89,-.025);
    // Slender pilasters separate bays; nothing is placed in walking space.
    for(const x of [-9.25,-7.15,-2.4,2.4,7.15,9.25]){
      wallBox(.15,3.32,.12,trim,x,2.56,-.04);
      wallBox(.026,3.12,.135,gold,x,2.58,-.025);
      wallBox(.32,.11,.19,gold,x,4.2,-.015);
    }
    wallBox(19.9,.16,.26,trim,0,4.36,.01);
    wallBox(19.9,.045,.29,gold,0,4.27,.015);
    for(let x=-9.5;x<=9.5;x+=.5)wallBox(.12,.065,.12,gold,x,4.22,.01);
    // Uninterrupted dark label band: no moulding crosses the artwork titles.
    wallBox(19.8,.018,.025,trim,0,.21,-.005);
  }
  // Nine recessed ceiling panels, gilded borders and flat rosettes.
  const centres=[];
  for(const x of [-6.4,0,6.4])for(const z of [-6.4,0,6.4]){
    centres.push([x,z]);box(5.85,.055,5.85,0x625849,x,4.386,z);
    for(const side of [-1,1]){
      box(6.0,.10,.10,trim,x,4.33,z+side*3);
      box(.10,.10,6.0,trim,x+side*3,4.33,z);
      box(5.68,.023,.03,gold,x,4.273,z+side*2.84);
      box(.03,.023,5.68,gold,x+side*2.84,4.273,z);
    }
  }
  for(const [color,matrices] of boxes){
    const mesh=new THREE.InstancedMesh(unitBox,new THREE.MeshLambertMaterial({color:new THREE.Color(color).convertSRGBToLinear()}),matrices.length);
    mesh.name='Hub_static_mouldings';matrices.forEach((matrix,i)=>mesh.setMatrixAt(i,matrix));mesh.instanceMatrix.needsUpdate=true;
    mesh.frustumCulled=false;group.add(mesh);
  }
  const ceilingOrnament=(geometry,material,name)=>{
    const mesh=new THREE.InstancedMesh(geometry,material,centres.length);mesh.name=name;
    centres.forEach(([x,z],i)=>{dummy.position.set(x,4.27,z);dummy.rotation.set(Math.PI/2,0,0);dummy.scale.set(1,1,1);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});
    mesh.instanceMatrix.needsUpdate=true;mesh.frustumCulled=false;group.add(mesh);
  };
  ceilingOrnament(new THREE.RingGeometry(.59,.62,48),new THREE.MeshBasicMaterial({color:new THREE.Color(gold).convertSRGBToLinear(),side:THREE.DoubleSide}),'Hub_gilded_ceiling_rings');
  const flower=new THREE.Shape();
  for(let i=0;i<32;i++){const angle=i*Math.PI/16,r=i%2?.20:.40,x=Math.cos(angle)*r,y=Math.sin(angle)*r;if(i)flower.lineTo(x,y);else flower.moveTo(x,y);}flower.closePath();
  ceilingOrnament(new THREE.ShapeGeometry(flower),new THREE.MeshBasicMaterial({color:new THREE.Color(0xcbb173).convertSRGBToLinear(),side:THREE.DoubleSide}),'Hub_gilded_ceiling_rosettes');
  // Warm luminous insets remain a single instanced draw; no shadow maps.
  ceilingOrnament(new THREE.RingGeometry(.68,.73,48),new THREE.MeshBasicMaterial({color:new THREE.Color(0xe2c695).convertSRGBToLinear(),side:THREE.DoubleSide}),'Hub_warm_ceiling_insets');
  group.userData={floorMode:'single-plane-albedo-only',proceduralTextureSize:512,externalDecorRequests:0};
  return group;
}
