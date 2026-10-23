// QA consumer only. Uses an already constructed W; never constructs a world,
// loads assets, changes production registrations or alters controller physics.
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {zhenduGateGeometry} from '../../src/scene/palace/special/ZhenduGateProfile.js';
import {PLAYER} from '../../src/config/constants.js';
import {bindProfileSupports,traceProfileSupports,profileSupportReport} from './profile-support-trace.mjs';
import {replayTerrace} from './terrace-walk.mjs';
const near=(a,b)=>Math.abs(a-b)<1e-5;
const contactNames=['frontGround','frontToe','frontTop','portalFront','portalRear','rearTop','rearToe','rearGround'];

function existingProfile(W){
 assert.ok(W.scene&&W.cm,'existing scene and collision manager are required');W.scene.updateMatrixWorld(true);
 const rows=[];W.scene.traverse(o=>{if(o.userData.structure?.objectId==='FC-9252CFFDAB')rows.push(o.userData.structure);rows.push(...(o.userData.architecture??[]).filter(r=>r.objectId==='FC-9252CFFDAB'));});
 assert.equal(rows.length,1,'exactly one actual Zhendu assembly must exist');
 const s=rows[0],p=zhenduGateGeometry({gateProfile:'zhendu',gateKind:'three-bay',x:s.x,z:s.z,rot:s.rot});
 assert.equal(s.profile,'zhendu');assert.equal(s.portalCount,1);assert.equal(s.coreBayCount,3);assert.equal(s.acceptance.accepted,false);assert.equal(s.acceptance.exterior,'VERIFY_PENDING');
 assert.deepEqual(s.supports,p.supports,'actual builder metadata uses the same profile');return {p,s};
}
function ray(W,p,[x,y,z],direction,far){const [wx,wz]=p.toWorld(x,z),d=new THREE.Vector3(...direction).applyAxisAngle(new THREE.Vector3(0,1,0),p.rot),r=new THREE.Raycaster(new THREE.Vector3(wx,y,wz),d);r.far=far;return r.intersectObject(W.scene,true);}

export function assertZhenduInWorld(W){
 const {p,s}=existingProfile(W),identities=bindProfileSupports(W.cm,p);
 assert.equal(identities.size,3);assert.equal([...identities].find(([,id])=>id===p.platform.supportId)[0].rescue,false);
 assert.equal(W.cm.getGroundHeight(p.x,p.z,0),0,'no rescue through solid raised deck');
 for(const r of p.ramps)for(const t of [.2,.5,.8]){
  const z=r.zTop+(r.zToe-r.zTop)*t,y=r.yTop*(1-t),[x,wz]=p.toWorld(0,z),hit=ray(W,p,[0,y+1,z],[0,-1,0],2)[0];
  assert.ok(hit,`${r.side}: real ramp triangles required`);assert.ok(near(hit.point.y,y),'real sloping triangles agree with profile');assert.ok(near(W.cm.getGroundHeight(x,wz,y+.02),y),'selected ground agrees with real slope');
 }
 const deck=ray(W,p,[0,p.platform.topY+1,0],[0,-1,0],2)[0];assert.ok(deck&&near(deck.point.y,p.platform.topY),'real deck and support agree');
 const underside=ray(W,p,[0,-.5,0],[0,1,0],1)[0];assert.ok(underside&&near(underside.point.y,0),'raised deck has a solid underside');
 if(s.openState==='playable-open')for(const x of [-1.3,0,1.3]){
  assert.equal(ray(W,p,[x,p.platform.topY+1.5,-8],[0,0,1],16).length,0,'aperture must remain physically hollow');
  for(const z of [-8,-3,0,3,8]){const [wx,wz]=p.toWorld(x,z);assert.equal(W.cm.checkCollision(new THREE.Vector3(wx,p.platform.topY+PLAYER.HEIGHT,wz),.5),false,'body clearance');}
 }
 return {scope:'ACTUAL_LOCAL_GEOMETRY_AND_SUPPORT_NOT_VISUAL_ACCEPTANCE',objectId:p.objectId,supportCount:identities.size,platformY:p.platform.topY,
  acceptance:s.acceptance,unknowns:s.unknowns,joins:p.joins,profile:p};
}

export function replayZhenduRoute(t,W,{from='front',offset=0,fps=60,sprint=false,backward=false}={}){
 assert.ok(['front','rear'].includes(from),'route origin must be front or rear');const {profile:p}=assertZhenduInWorld(W);
 let go=contactNames.map(k=>p.toWorld(p.routeContacts[k][0]+offset,p.routeContacts[k][1]));if(from==='rear')go.reverse();const points=[...go,...go.slice(0,-1).reverse()];
 const trace=traceProfileSupports(W.cm,bindProfileSupports(W.cm,p));let result;
 try{result=replayTerrace(t,{...W,THREE:W.THREE??THREE},points,{fps,sprint,backward,recordFrames:true});}finally{trace.restore();}
 const support=profileSupportReport(trace.samples,p,from);assert.equal(support.valid,true,support.failures.join('; '));assert.equal(result.arrived,true,JSON.stringify({stuckAt:result.stuckAt,end:result.end}));assert.equal(result.startFeet,0);
 for(const f of result.frames){assert.ok(Number.isFinite(f.feet)&&f.feet>=-1e-7);assert.equal(W.cm.checkCollision(new THREE.Vector3(f.x,f.ground+PLAYER.HEIGHT,f.z),.5),false,'real controller body clears actual registered solids');}
 assert.ok(near(result.end[2],0),'ordinary braking settles on ground');return {...result,support};
}
