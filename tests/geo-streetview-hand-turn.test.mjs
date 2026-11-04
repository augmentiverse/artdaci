import test from 'node:test';
import assert from 'node:assert/strict';
import {advancePinchTurn,PINCH_START_METRES,PINCH_RELEASE_METRES} from '../geo/scripts/streetview-hand-turn.mjs';

test('a pinch starts rotation only after thumb and index are close',()=>{
 const out=advancePinchTurn(null,{distance:0.07,x:0.1});
 assert.equal(out.active,false);
 const began=advancePinchTurn(out,{distance:0.026,x:0.1});
 assert.equal(began.active,true);
 assert.equal(began.yaw,0);
 assert.equal(PINCH_START_METRES,0.03);
});
test('horizontal hand motion smoothly rotates, release stops',()=>{
 let state=advancePinchTurn(null,{distance:0.02,x:0});
 state=advancePinchTurn(state,{distance:0.02,x:0.02});
 assert.ok(state.yaw<0);
 assert.ok(state.yaw>-0.1);
 const release=advancePinchTurn(state,{distance:0.06,x:0.03});
 assert.equal(release.yaw,0);
 assert.equal(release.active,false);
 assert.equal(PINCH_RELEASE_METRES,0.05);
});
test('missing joints or sudden tracking jumps never spin the panorama',()=>{
 let state=advancePinchTurn(null,{distance:0.02,x:0});
 state=advancePinchTurn(state,{distance:0.02,x:0.45});
 assert.equal(state.yaw,0);
 const lost=advancePinchTurn(state,null);
 assert.equal(lost.active,false);
 assert.equal(lost.yaw,0);
 const invalid=advancePinchTurn(state,{distance:NaN,x:0.02});
 assert.equal(invalid.active,false);
});
test('pinch tracking hysteresis avoids flickering around threshold',()=>{
 let state=advancePinchTurn(null,{distance:0.029,x:0});
 state=advancePinchTurn(state,{distance:0.04,x:0.005});
 assert.equal(state.active,true);
 assert.notEqual(state.yaw,0);
 state=advancePinchTurn(state,{distance:0.051,x:0.01});
 assert.equal(state.active,false);
});
