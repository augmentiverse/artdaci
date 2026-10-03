import {disposeOwnedResource} from './experience-resource-slot.mjs';

// The GLB is owned by this handle. The decorative Hub and its textures are not.
export function createGuideModelHandle(THREE,model){
  const bounds=new THREE.Box3().setFromObject(model);
  if(bounds.isEmpty()||!Number.isFinite(bounds.min.y))throw new Error('Empty guide model');
  const size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
  const root=new THREE.Group();root.name='ARTDACI_Artist_Guide';root.add(model);
  const proxy=new THREE.Mesh(new THREE.BoxGeometry(Math.max(.6,size.x),size.y,Math.max(.5,size.z)),new THREE.MeshBasicMaterial({visible:false}));
  proxy.name='ARTDACI_Guide_Target';proxy.userData.guide=true;root.add(proxy);
  const marker=new THREE.Mesh(new THREE.RingGeometry(.32,.35,24),new THREE.MeshBasicMaterial({color:0xc5a971,side:THREE.DoubleSide}));
  marker.rotation.x=-Math.PI/2;marker.position.y=.015;root.add(marker);
  let mounted=false;
  return {root,model,proxy,size,sourceBounds:{min:bounds.min.toArray(),max:bounds.max.toArray()},mounted:false,
    apply(transform){
      for(const key of ['positionX','positionY','positionZ','rotationY','scale','groundOffset','centerOffsetX','centerOffsetZ'])if(!Number.isFinite(transform?.[key]))throw new TypeError(`Invalid guide transform: ${key}`);
      if(transform.scale<=0||transform.scale>3)throw new RangeError('Invalid guide scale');
      model.position.set(-center.x+transform.centerOffsetX,-bounds.min.y+transform.groundOffset,-center.z+transform.centerOffsetZ);
      proxy.position.set(transform.centerOffsetX,size.y/2+transform.groundOffset,transform.centerOffsetZ);
      root.position.set(transform.positionX,transform.positionY,transform.positionZ);
      root.rotation.y=transform.rotationY;root.scale.setScalar(transform.scale);root.updateMatrixWorld(true);
    },
    mount(scene){if(!mounted){scene.add(root);mounted=true;this.mounted=true;}},
    setHover(active){marker.material.color.set(active?0x9de2dd:0xc5a971);},
    dispose(){if(mounted){root.parent?.remove(root);mounted=false;this.mounted=false;}disposeOwnedResource({owned:true,object:model});proxy.geometry.dispose();proxy.material.dispose();marker.geometry.dispose();marker.material.dispose();}
  };
}
