import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import * as THREE from '../vendor/three.module.js';
import {clampPosition,movePosition,pivotRig,snapTurn,readStick,deadZone,validateRoom,roomModelCandidates,loadRoomWithFallback} from '../geo/scripts/room-navigation.mjs';

const config=JSON.parse(await readFile(new URL('../geo/data/salle-des-etats.json',import.meta.url),'utf8'));
test('Room configuration separates generated local positions from geographical claims',()=>{
  assert.deepEqual(validateRoom(config),[]);
  assert.equal(config.artwork.artworkId,'ld01');
  assert.match(config.provenance.placementStatus,/not-surveyed/);
  assert.equal(config.roomId,config.id);
  assert.equal(config.version,'v5');
  assert.equal(config.status,'validated');
  assert.equal(config.validation.hardwareValidated,'Meta Quest 3S');
  assert.equal(config.publication.r2,true);
  const invalid=structuredClone(config);invalid.navigation.entry.x=200;
  assert.ok(validateRoom(invalid).includes('entry outside bounds'));
  invalid.model.localFallback='../outside.glb';assert.ok(validateRoom(invalid).includes('Invalid local fallback room model path'));
});

test('Published V5 and committed V5 fallback use the same verified bytes',async()=>{
  const candidates=roomModelCandidates(config,new URL('../geo/scripts/room-viewer.js',import.meta.url));
  assert.deepEqual(candidates.map(candidate=>candidate.source),['r2','local']);
  assert.equal(candidates[0].url,'https://media.artdaci.com/geo/louvre/rooms/salle-des-etats-v5.glb');
  assert.equal(candidates[1].url,new URL('../geo/assets/salle-des-etats-artdaci-v5-flat.glb',import.meta.url).href);
  const bytes=await readFile(new URL(candidates[1].url));
  assert.equal(bytes.length,config.model.bytes);
  assert.equal(createHash('sha256').update(bytes).digest('hex'),config.model.sha256);
  const invalid=structuredClone(config);invalid.model.remote='http://invalid.example/room.glb';
  assert.ok(validateRoom(invalid).includes('Invalid remote room model URL'));
});

test('Unavailable or invalid R2 V5 falls back exactly once to local V5',async()=>{
  const candidates=roomModelCandidates(config,new URL('../geo/scripts/room-viewer.js',import.meta.url));
  const calls=[],failures=[];
  const selected=await loadRoomWithFallback(candidates,async candidate=>{
    calls.push(candidate.source);
    if(candidate.source==='r2')throw new Error('R2 unavailable or invalid GLB');
    return {scene:'V5'};
  },candidate=>failures.push(candidate.source));
  assert.deepEqual(calls,['r2','local']);
  assert.deepEqual(failures,['r2']);
  assert.equal(selected.candidate.source,'local');
  assert.equal(selected.result.scene,'V5');
  await assert.rejects(loadRoomWithFallback(candidates,async candidate=>{calls.push(candidate.source);throw new Error(candidate.source);}),error=>error instanceof AggregateError && error.errors.length===2);
  assert.deepEqual(calls,['r2','local','r2','local']);
});
test('Walking remains inside the repaired floor and stops before the presentation panel',()=>{
  const b=config.navigation.bounds;
  assert.deepEqual(clampPosition({x:100,z:-100},b),{x:b.maxX,z:b.minZ});
  assert.deepEqual(movePosition({x:0,z:0},0,1,0,1,b),{x:0,z:-1});
  const diagonal=movePosition({x:0,z:0},0,1,1,1,b);
  assert.ok(Math.abs(Math.hypot(diagonal.x,diagonal.z)-1)<1e-9);
  const turned=movePosition({x:0,z:0},Math.PI/2,1,0,1,b);
  assert.ok(Math.abs(turned.x+1)<1e-9);
  assert.ok(b.minZ>config.artwork.position[2]);
});
test('Room links keep the existing GEO and VR routes',async()=>{
  const place=JSON.parse(await readFile(new URL('../geo/data/louvre.json',import.meta.url),'utf8'));
  assert.equal(place.remoteExperience.routes.salleDesEtats,'room.html');
  assert.equal(place.remoteExperience.routes.placeVr,'../gallery-vr.html?room=louvre');
  const html=await readFile(new URL('../geo/room.html',import.meta.url),'utf8');
  for(const lang of ['fr','en','ar'])assert.ok(html.includes(`data-lang="${lang}"`));
});

test('Eight released stick turns complete 360 degrees with no forced forward orientation',()=>{
  let armed=false,yaw=0;
  assert.equal(snapTurn(1,armed).angle,0); // Entering VR with a held stick must not turn.
  for(let i=0;i<8;i++){
    armed=snapTurn(0,armed).armed;
    const next=snapTurn(1,armed,config.navigation.snapDegrees*Math.PI/180);
    yaw+=next.angle;armed=next.armed;
    for(let frame=0;frame<90;frame++)assert.equal(snapTurn(1,armed).angle,0);
    if(i===3)assert.ok(Math.abs(yaw+Math.PI)<1e-9); // Rear view.
  }
  assert.ok(Math.abs(yaw+2*Math.PI)<1e-9);
  assert.ok(snapTurn(-1,true).angle>0);
  assert.equal(snapTurn(.65,true).angle,0);
});

test('Head-centred rotation preserves a non-zero room-scale offset, including near walls',()=>{
  const head={x:2.3,z:-5.9};let rig={x:1.6,z:-4.7};
  const start={...rig},radius=Math.hypot(rig.x-head.x,rig.z-head.z);
  for(let i=0;i<8;i++){
    rig=pivotRig(rig,head,Math.PI/4);
    assert.ok(Math.abs(Math.hypot(rig.x-head.x,rig.z-head.z)-radius)<1e-9);
    // Rotating the original head-to-rig offset yields the same world head.
    const angle=(i+1)*Math.PI/4,x=head.x-start.x,z=head.z-start.z;
    assert.ok(Math.abs(rig.x+Math.cos(angle)*x+Math.sin(angle)*z-head.x)<1e-9);
    assert.ok(Math.abs(rig.z-Math.sin(angle)*x+Math.cos(angle)*z-head.z)<1e-9);
  }
  assert.ok(Math.abs(rig.x-start.x)<1e-9 && Math.abs(rig.z-start.z)<1e-9);
});

test('Quest xr-standard thumbsticks, dead zones and invalid/disconnected inputs are handled',()=>{
  assert.deepEqual(readStick({gamepad:{mapping:'xr-standard',axes:[0,0,.8,-.5]}}),{x:.8,y:-.5});
  assert.deepEqual(readStick({gamepad:{mapping:'xr-standard',axes:[-.9,.6]}}),{x:-.9,y:.6});
  assert.deepEqual(readStick(null),{x:0,y:0});
  assert.deepEqual(readStick({gamepad:{mapping:'',axes:[1,1]}}),{x:0,y:0});
  assert.deepEqual(readStick({gamepad:{mapping:'xr-standard',axes:[NaN,undefined]}}),{x:0,y:0});
  assert.equal(deadZone(.19),0);assert.equal(deadZone(-.2),0);
  assert.equal(deadZone(1),1);assert.equal(deadZone(-1),-1);
});

test('XR walking follows the head through rear-facing headings and bounds the head rather than the rig',()=>{
  const b=config.navigation.bounds;
  for(const yaw of [0,Math.PI/2,Math.PI,3*Math.PI/2,2*Math.PI]){
    const result=movePosition({x:0,z:0},yaw,1,0,config.navigation.xrSpeed,b);
    assert.ok(Math.abs(Math.hypot(result.x,result.z)-1.1)<1e-9);
  }
  const behind=movePosition({x:0,z:0},Math.PI,1,0,1,b);
  assert.ok(behind.z>.999);
  const head={x:2.5,z:-6.2},rig={x:1.5,z:-5.2};
  const next=movePosition(head,0,1,1,100,b);
  const translatedRig={x:rig.x+next.x-head.x,z:rig.z+next.z-head.z};
  assert.ok(Math.abs(translatedRig.x+1-b.maxX)<1e-9);
  assert.ok(Math.abs(translatedRig.z-1-b.minZ)<1e-9);
});

test('All room languages include turning, rear view and XR instructions',async()=>{
  const source=await readFile(new URL('../geo/scripts/room-viewer.js',import.meta.url),'utf8');
  for(const lang of ['fr','en','ar']){
    const labels=[...source.matchAll(new RegExp(`Object.assign\\(COPY\\.${lang},\\{([^\\n]+)\\}\\);`,'g'))].map(m=>m[1]).join(',');
    assert.ok(labels,lang);
    for(const key of ['turnLeft','turnRight','turnAround','xrControls'])assert.match(labels,new RegExp(`${key}:'[^']+`));
  }
  const invalid=structuredClone(config);invalid.navigation.snapDegrees=0;
  assert.ok(validateRoom(invalid).includes('Invalid XR comfort settings'));
});

test('Reference room keeps only ld01, a chevron parquet and the permitted architectural elements',async()=>{
  const buffer=await readFile(new URL(`../geo/${config.model.localFallback}`,import.meta.url));
  const gltf=JSON.parse(buffer.subarray(20,20+buffer.readUInt32LE(12)).toString());
  assert.ok(buffer.length<3000000,'Reference room must stay below 3 MB');
  assert.ok(gltf.nodes.some(n=>n.name==='ARTDACI_ld01_Mona_Lisa' && n.extras.artworkId==='ld01'));
  const architecture=['Ceiling_reference','Cornice_reference','Cornice_dentils','Mona_display_recess','Mona_display_top_panel','Mona_display_trim','Mona_panel_wings','Mona_partition','Mona_partition_lower_band','Mona_partition_plinth','Mona_stone_portal_header','Mona_stone_portal_left','Mona_stone_portal_right','Mona_top_lighting','Mona_wood_rail','Mona_wood_shelf','Parquet_flat','Skylight_grid','Skylight_reference','Skylight_surround','Stone_skirting','Wall_front_reference','Wall_left_reference','Wall_panel_joints','Wall_rear_reference','Wall_right_reference'];
  assert.deepEqual(gltf.nodes.map(n=>n.name).sort(),[...architecture,'ARTDACI_ld01_Mona_Lisa'].sort(),'No original room atlas, lateral paintings, cases, statues or clutter');
  for(const name of architecture){
    const primitive=gltf.meshes.find(m=>m.name===name)?.primitives[0];
    assert.ok(primitive,name);if(name!=='Parquet_flat')assert.ok('COLOR_0' in primitive.attributes);
    assert.ok(gltf.materials[primitive.material].extensions.KHR_materials_unlit);
  }
  assert.equal(gltf.images.length,3,'Only oak, blue fabric and the existing Mona Lisa image');
  const floor=gltf.meshes.find(m=>m.name==='Parquet_flat').primitives[0];
  assert.ok(gltf.materials[floor.material].pbrMetallicRoughness.baseColorTexture);
  assert.ok(floor.attributes.TEXCOORD_0!==undefined);
  assert.ok(!gltf.extensionsRequired?.includes('KHR_draco_mesh_compression'),'Small geometry needs no decoder');
  const triangles=gltf.meshes.reduce((n,m)=>n+m.primitives.reduce((a,p)=>a+gltf.accessors[p.indices].count/3,0),0);
  assert.ok(triangles<12000);
});

test('Web renderer receives actual wall shading in COLOR_0 while the floor uses a baked flat albedo',async()=>{
  const raw=await readFile(new URL(`../geo/${config.model.localFallback}`,import.meta.url));
  const size=raw.readUInt32LE(12),g=JSON.parse(raw.subarray(20,20+size).toString());
  for(const name of ['Wall_left_reference']){
    const p=g.meshes.find(m=>m.name===name).primitives[0];
    assert.equal(p.attributes.COLOR_1,undefined);
    const a=g.accessors[p.attributes.COLOR_0],v=g.bufferViews[a.bufferView];
    assert.equal(a.componentType,5123);assert.equal(a.normalized,true);
    const values=new Set();
    for(let i=0;i<a.count;i++)values.add(raw.readUInt16LE(28+size+(v.byteOffset||0)+(a.byteOffset||0)+i*(v.byteStride||8)));
    assert.ok(values.size>5,`${name}: preserve visible shading in Three.js`);
  }
});

test('Reference reconstruction preserves the exact Mona Lisa image and replaces the old parquet',async()=>{
  async function images(model){
    const raw=await readFile(new URL(`../geo/${model}`,import.meta.url));
    const jsonLength=raw.readUInt32LE(12),gltf=JSON.parse(raw.subarray(20,20+jsonLength).toString());
    return Object.fromEntries(gltf.materials.filter(m=>m.pbrMetallicRoughness?.baseColorTexture).map(m=>{
      const image=gltf.images[gltf.textures[m.pbrMetallicRoughness.baseColorTexture.index].source];
      const view=gltf.bufferViews[image.bufferView],start=28+jsonLength+(view.byteOffset||0);
      return [m.name,raw.subarray(start,start+view.byteLength)];
    }));
  }
  const after=await images(config.model.localFallback);
  assert.equal(Object.keys(after).length,3);
  assert.equal(createHash('sha256').update(after.Mona_Lisa_user_supplied_image).digest('hex'),'723a68335163a1ed1474a101e777e56e9336370cd87420a9b27c613025ea539a');
  assert.equal(after.Parquet_repaired_from_existing_floor,undefined);
  assert.equal(after.Chevron_oak_unlit,undefined);
  assert.ok(after.Parquet_flat_unlit && after.Blue_wall_fabric_unlit);
});

test('Clean room positions remain finite, Y-up and compatible with existing walking and artwork views',async()=>{
  const raw=await readFile(new URL(`../geo/${config.model.localFallback}`,import.meta.url));
  const size=raw.readUInt32LE(12),gltf=JSON.parse(raw.subarray(20,20+size).toString());
  for(const node of gltf.nodes){
    for(const key of ['matrix','translation','rotation','scale'])assert.equal(node[key],undefined,'No moved origin or hidden transforms');
    for(const p of gltf.meshes[node.mesh].primitives){
      const a=gltf.accessors[p.attributes.POSITION],v=gltf.bufferViews[a.bufferView];
      assert.equal(a.componentType,5126);
      for(let i=0;i<a.count;i++)for(let axis=0;axis<3;axis++){
        const pos=raw.readFloatLE(28+size+(v.byteOffset||0)+(a.byteOffset||0)+i*(v.byteStride||12)+axis*4);
        assert.ok(Number.isFinite(pos),node.name);
      }
    }
  }
  const boundsOf=name=>gltf.accessors[gltf.meshes[gltf.nodes.find(n=>n.name===name).mesh].primitives[0].attributes.POSITION];
  const floor=boundsOf('Parquet_flat'),b=config.navigation.bounds;
  assert.ok(floor.min[0]<b.minX && floor.max[0]>b.maxX && floor.min[2]<b.minZ && floor.max[2]>b.maxZ);
  assert.ok(Math.abs(floor.min[1]-config.navigation.floorHeight)<1e-6);
  const art=boundsOf('ARTDACI_ld01_Mona_Lisa');
  for(let axis=0;axis<3;axis++)assert.ok(Math.abs((art.min[axis]+art.max[axis])/2-config.artwork.position[axis])<1e-5);
  assert.equal(config.provenance.architectureStatus,'reconstructed-not-surveyed');
  assert.ok(floor.max[0]-floor.min[0]>11.9 && floor.max[2]-floor.min[2]>23.9,'Real expanded geometry, not a camera FOV change');
  assert.match(config.provenance.dimensions.status,/not-surveyed/);
  assert.ok(b.maxX>5 && b.maxZ>12 && b.minZ<-8);
  assert.ok(b.minZ>-9.27,'Navigation stops in front of the new shelf');
});

test('V5 floor is exactly one flat quad with upward normals and no relief material',async()=>{
  const raw=await readFile(new URL(`../geo/${config.model.localFallback}`,import.meta.url));
  const size=raw.readUInt32LE(12),g=JSON.parse(raw.subarray(20,20+size).toString());
  const p=g.meshes.find(m=>m.name==='Parquet_flat').primitives[0],pos=g.accessors[p.attributes.POSITION];
  assert.equal(pos.count,4);assert.equal(g.accessors[p.indices].count,6);
  assert.equal(pos.min[1],pos.max[1]);assert.ok(Math.abs(pos.min[1]-.1)<1e-7);
  const normal=g.accessors[p.attributes.NORMAL],v=g.bufferViews[normal.bufferView];
  for(let i=0;i<normal.count;i++)for(let axis=0;axis<3;axis++){
    const value=raw.readFloatLE(28+size+(v.byteOffset||0)+(normal.byteOffset||0)+i*(v.byteStride||12)+axis*4);
    assert.equal(value,axis===1?1:0);
  }
  const m=g.materials[p.material];assert.ok(m.extensions.KHR_materials_unlit);
  assert.equal(m.normalTexture,undefined);assert.equal(m.occlusionTexture,undefined);
  assert.equal(p.attributes.COLOR_0,undefined,'No independent per-board shading in the final floor');
  assert.equal(config.provenance.floorMode,'single-plane-no-relief');
  assert.ok(Math.abs(pos.max[0]-pos.min[0]-12.1)<1e-5);
  assert.ok(Math.abs(pos.max[2]-pos.min[2]-28.8)<1e-5);
  assert.equal(config.navigation.bounds.maxZ,17.3);
});

test('XR frame navigation integrates tracked pose, repeated turns, movement and focus loss',async()=>{
  const source=await readFile(new URL('../geo/scripts/room-viewer.js',import.meta.url),'utf8');
  const rig=new THREE.Group();rig.position.set(0,.1,6.5);
  const pose=new THREE.Matrix4().makeTranslation(.4,1.6,-.3);
  const xrCamera={matrixWorld:new THREE.Matrix4()};
  const session={visibilityState:'visible',inputSources:[
    {handedness:'left',gamepad:{mapping:'xr-standard',axes:[0,0,0,0]}},
    {handedness:'right',gamepad:{mapping:'xr-standard',axes:[0,0,0,0]}}
  ]};
  const renderer={xr:{getSession:()=>session,getReferenceSpace:()=>({}),getCamera:()=>{
    rig.updateMatrixWorld(true);xrCamera.matrixWorld.multiplyMatrices(rig.matrixWorld,pose);return xrCamera;
  }}};
  const state=vm.createContext({rig,renderer,config,camera:{},head:new THREE.Vector3(),look:new THREE.Vector3(),yaw:0,turnArmed:false,xrView:config.navigation.entry,pivotRig,clampPosition,movePosition,snapTurn,readStick,deadZone});
  // Exercise the actual frame handler with a tracked matrix, not a second
  // implementation. This does not emulate a headset display or a WebXR device.
  vm.runInContext(source.slice(source.indexOf('function turnRig('),source.indexOf('function render(')),state);
  const frame={getViewerPose:()=>({})};
  const worldHead=()=>new THREE.Vector3().setFromMatrixPosition(renderer.xr.getCamera().matrixWorld);
  state.navigateXr(.05,frame);
  const start=worldHead();assert.ok(Math.abs(start.x)<1e-9 && Math.abs(start.z-config.navigation.entry.z)<1e-9);
  for(let i=0;i<8;i++){
    session.inputSources[1].gamepad.axes[2]=0;state.navigateXr(.05,frame);
    session.inputSources[1].gamepad.axes[2]=1;state.navigateXr(.05,frame);
    const angle=rig.rotation.y;
    for(let f=0;f<30;f++)state.navigateXr(.05,frame);
    assert.equal(rig.rotation.y,angle);assert.ok(worldHead().distanceTo(start)<1e-8);
  }
  assert.ok(Math.abs(rig.rotation.y+2*Math.PI)<1e-8);
  session.inputSources[0].gamepad.axes[3]=-1;state.navigateXr(.05,frame);
  assert.ok(Math.abs(worldHead().z-(config.navigation.entry.z-.055))<1e-8);
  const stopped=rig.position.clone();session.visibilityState='visible-blurred';state.navigateXr(.05,frame);
  assert.ok(rig.position.equals(stopped));assert.equal(state.turnArmed,false);
  session.visibilityState='visible';session.inputSources[0].gamepad.axes[3]=0;
  const before=rig.rotation.y;state.navigateXr(.05,frame);assert.equal(rig.rotation.y,before);
  state.xrView=config.navigation.artworkView;state.navigateXr(.05,frame);
  assert.ok(Math.abs(worldHead().z-config.navigation.artworkView.z)<1e-8);assert.ok(Math.abs(worldHead().y-1.7)<1e-8);
  // Physical tracking remains untouched: an extra sideways head motion is not
  // cancelled by an artificial clamp when no stick motion is requested.
  pose.elements[12]+=.2;state.navigateXr(.05,frame);
  assert.ok(Math.abs(worldHead().x-.2)<1e-8);
});
