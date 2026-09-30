// Model-local coordinates only; these are not surveyed geographic positions.
export function clampPosition(position, bounds) {
  return {
    x: Math.max(bounds.minX, Math.min(bounds.maxX, position.x)),
    z: Math.max(bounds.minZ, Math.min(bounds.maxZ, position.z)),
  };
}

export function movePosition(position, yaw, forward, sideways, distance, bounds) {
  const magnitude = Math.max(1, Math.hypot(forward, sideways));
  return clampPosition({
    x: position.x + (-Math.sin(yaw) * forward + Math.cos(yaw) * sideways) * distance / magnitude,
    z: position.z + (-Math.cos(yaw) * forward - Math.sin(yaw) * sideways) * distance / magnitude,
  }, bounds);
}

// Move the rig about the tracked head, not about the reference-space origin.
// This preserves a seated/room-scale user's location while turning either way.
export function pivotRig(position, head, angle) {
  const x=position.x-head.x, z=position.z-head.z;
  return {x:head.x+Math.cos(angle)*x+Math.sin(angle)*z,
    z:head.z-Math.sin(angle)*x+Math.cos(angle)*z};
}

export function snapTurn(axis, armed, angle=Math.PI/4) {
  if (!Number.isFinite(axis) || Math.abs(axis)<.25) return {armed:true,angle:0};
  if (armed && Math.abs(axis)>.7) return {armed:false,angle:-Math.sign(axis)*angle};
  return {armed,angle:0};
}

export function readStick(source) {
  if (source?.gamepad?.mapping!=='xr-standard') return {x:0,y:0};
  const axes=source.gamepad.axes;
  const offset=axes.length>=4?2:0;
  const clean=v=>Number.isFinite(v)?Math.max(-1,Math.min(1,v)):0;
  return {x:clean(axes[offset]),y:clean(axes[offset+1])};
}

export function deadZone(value, threshold=.2) {
  return Math.abs(value)<=threshold?0:Math.sign(value)*(Math.abs(value)-threshold)/(1-threshold);
}

export function roomModelCandidates(room, moduleUrl) {
  return [
    {source:'r2',url:room.model.remote},
    {source:'local',url:new URL(`../${room.model.localFallback}`,moduleUrl).href},
  ];
}

export async function loadRoomWithFallback(candidates, load, onFailure=()=>{}) {
  const failures=[];
  for (const candidate of candidates) {
    try { return {candidate,result:await load(candidate)}; }
    catch (error) { failures.push(error);onFailure(candidate,error); }
  }
  throw new AggregateError(failures,'Both V5 room model sources failed');
}

export function validateRoom(room) {
  const errors = [];
  if (room?.roomId !== room?.id || room?.version !== 'v5' || room?.status !== 'validated') errors.push('Invalid validated room identity');
  try {
    const remote=new URL(room?.model?.remote);
    if (remote.protocol!=='https:' || remote.hostname!=='media.artdaci.com' || !/^\/geo\/louvre\/rooms\/[a-z\d-]+\.glb$/i.test(remote.pathname) || remote.search || remote.hash) throw new Error();
  } catch { errors.push('Invalid remote room model URL'); }
  if (!/^assets\/[a-z\d-]+\.glb$/i.test(room?.model?.localFallback || '')) errors.push('Invalid local fallback room model path');
  if (!Number.isInteger(room?.model?.bytes) || room.model.bytes<=0 || !/^[a-f\d]{64}$/i.test(room?.model?.sha256 || '')) errors.push('Invalid room model integrity metadata');
  if (room?.validation?.hardwareValidated!=='Meta Quest 3S' || room?.validation?.architecture!=='visual-reconstruction-not-certified-survey') errors.push('Invalid room validation metadata');
  const nav = room?.navigation;
  if (nav?.coordinateSpace !== 'generated-room-local-y-up') errors.push('Invalid coordinate space');
  const b = nav?.bounds;
  if (!b || !['minX','maxX','minZ','maxZ'].every(k => Number.isFinite(b[k])) || b.minX >= b.maxX || b.minZ >= b.maxZ) errors.push('Invalid navigation bounds');
  for (const key of ['entry','artworkView']) {
    const p = nav?.[key];
    if (!p || !['x','z','yaw'].every(k => Number.isFinite(p[k]))) errors.push(`Invalid ${key}`);
    else if (b && (p.x < b.minX || p.x > b.maxX || p.z < b.minZ || p.z > b.maxZ)) errors.push(`${key} outside bounds`);
  }
  if (!Number.isFinite(nav?.speed) || nav.speed <= 0 || !Number.isFinite(nav?.floorHeight) || !Number.isFinite(nav?.eyeHeight) || nav.eyeHeight <= 0) errors.push('Invalid navigation dimensions');
  if (room?.artwork?.artworkId !== 'ld01') errors.push('Missing ld01 artwork');
  if (!Number.isFinite(nav?.xrSpeed) || nav.xrSpeed<=0 || nav.xrSpeed>2 || !Number.isFinite(nav?.snapDegrees) || nav.snapDegrees<15 || nav.snapDegrees>90) errors.push('Invalid XR comfort settings');
  return errors;
}
