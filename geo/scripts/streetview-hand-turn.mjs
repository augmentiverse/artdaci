/**
 * ARTDACI Museum XR — bounded hand pinch-turn state machine.
 * Pure helper; no browser, XR, or Three.js dependency.
 * Pinch thumb+index, then move the joined fingers horizontally to yaw.
 * Values are expressed in meters in the WebXR reference space.
 */
export const PINCH_START_METRES=0.030;
export const PINCH_RELEASE_METRES=0.050;
export const MAX_TRACKING_JUMP_METRES=0.065;
export const YAW_RADIANS_PER_METRE=3.5;

export function advancePinchTurn(state,sample){
  const previous=state&&state.active===true&&Number.isFinite(state.x)
    ?state:{active:false,x:null};
  if(!sample||!Number.isFinite(sample.distance)||!Number.isFinite(sample.x))
    return {active:false,x:null,yaw:0};
  if(!previous.active){
    return sample.distance<=PINCH_START_METRES
      ?{active:true,x:sample.x,yaw:0}
      :{active:false,x:null,yaw:0};
  }
  if(sample.distance>=PINCH_RELEASE_METRES)return {active:false,x:null,yaw:0};
  const dx=sample.x-previous.x;
  // Ignore jumps when the headset loses and re-acquires finger tracking.
  const yaw=Math.abs(dx)>MAX_TRACKING_JUMP_METRES?0:
    Math.max(-0.16,Math.min(0.16,-dx*YAW_RADIANS_PER_METRE));
  return {active:true,x:sample.x,yaw};
}
