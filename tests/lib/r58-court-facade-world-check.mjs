// Read-only consumer of an EXISTING W. Never creates a world, changes sources,
// registers collisions or alters geometry. Parent owns cumulative integration.
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {sideGateGeometry} from '../../src/scene/palace/special/SideGateProfiles.js';
import {pavilionGeometry} from '../../src/scene/palace/special/PavilionProfiles.js';
import {solidMaterialNameAt} from '../../src/render/SolidMaterialBatch.js';
const xiheItem={gateProfile:'xihe',x:110.7,z:-301.1,rot:'west'};
const tirenItem={pavilionProfile:'tiren',x:-98.4,z:-109.3,rot:'west',enter:true};
function records(W,profile){assert.ok(W.scene&&W.cm);W.scene.updateMatrixWorld(true);const found=[];W.scene.traverse(o=>{for(const r of [o.userData.structure,o.userData.pavilion,...(o.userData.architecture??[])])if(r?.profile===profile)found.push(r);});assert.equal(found.length,1,`${profile}: exactly one actual assembly`);return found[0];}
function ray(W,g,point,direction,far){const [x,z]=g.toWorld(point[0],point[2]),d=new THREE.Vector3(...direction).applyAxisAngle(new THREE.Vector3(0,1,0),g.rot);return new THREE.Raycaster(new THREE.Vector3(x,point[1],z),d,0,far).intersectObject(W.scene,true);}
function eye(W,g,x,z,feetGuess){const [wx,wz]=g.toWorld(x,z),feet=W.cm.getGroundHeight(wx,wz,feetGuess),y=feet+1.7;assert.equal(W.cm.checkCollision(new THREE.Vector3(wx,y,wz),.5),false,'eye is ground-supported and body is collision-free');return[x,y,z];}
export function assertXiheCorbelsInWorld(W,item=xiheItem){
 const g=sideGateGeometry(item),record=records(W,'xihe');assert.equal(record.portalCount,3);const probes=[];
 for(const bay of [1,2,3])for(const direction of [1,-1]){
  const x=g.columnXs[direction===1?bay:bay+1]+direction*(.18+.35),target=[x,g.platformY+g.columnH-.655-.28,g.depth/2+.24],origin=eye(W,g,x,g.depth/2+4,g.platformY),delta=new THREE.Vector3(...target).sub(new THREE.Vector3(...origin));
  const hit=ray(W,g,origin,delta.clone().normalize().toArray(),delta.length()+.03)[0];assert.ok(hit,'six actual knees must be present after merge');const [wx,wz]=g.toWorld(target[0],target[2]);assert.ok(hit.point.distanceTo(new THREE.Vector3(wx,target[1],wz))<.06);assert.match(solidMaterialNameAt(hit.object,hit.faceIndex),/caihua_beam/);probes.push({bay,direction,eye:origin,target,hit:hit.point.toArray()});
 }
 for(const p of g.portals)for(const dx of [-.8,0,.8])assert.equal(ray(W,g,[p.centerX+dx,g.platformY+1.7,-g.depth/2-1],[0,0,1],g.depth+2).length,0,'rendered route-head aperture stays hollow');
 return{scope:'ACTUAL_MERGED_TRIANGLES_NOT_BROWSER_ACCEPTANCE',objectId:'FC-06B1BADE77',probes,portalHeadRays:9};
}
export function assertTirenLeavesInWorld(W,item=tirenItem){
 const g=pavilionGeometry(item),record=records(W,'tiren'),lo=g.lower;assert.equal(record.openings.upperFrontLeaves,28);const probes=[];
 for(const bay of [1,2,3,5,6,7])for(const side of [-1,1]){
  const cx=(lo.columnXs[bay]+lo.columnXs[bay+1])/2,x=cx+side*.08,origin=eye(W,g,x,lo.front-2,g.platform.y),hit=ray(W,g,origin,[0,0,1],2.1)[0];assert.ok(hit);assert.ok(Math.abs(hit.distance-1.9)<.002,'each separately framed meeting stile exists, rather than only the former thin center bar');assert.match(solidMaterialNameAt(hit.object,hit.faceIndex),/wood_column/);probes.push({bay,side,eye:origin,hit:hit.point.toArray()});
 }
 for(const x of [-1,0,1])assert.equal(ray(W,g,[x,lo.floorY+1.7,lo.front-1],[0,0,1],3).length,0,'original central doorway remains open');
 return{scope:'ACTUAL_MERGED_TRIANGLES_NOT_BROWSER_ACCEPTANCE',objectId:'FC-8C6502DA44',probes,doorHeadRays:3};
}

export function assertCourtRouteHeadClearance(W,result){assert.equal(result.arrived,true,JSON.stringify(result.end));let samples=0,min=Infinity;for(let i=0;i<result.frames.length;i+=4){const f=result.frames[i],p=new THREE.Vector3(f.x,f.ground+1.7,f.z);assert.equal(W.cm.checkCollision(p,.5),false);const ray=new THREE.Raycaster(p,new THREE.Vector3(0,1,0),0,40),hit=ray.intersectObject(W.scene,true)[0];if(hit)min=Math.min(min,hit.distance);if(hit)assert.ok(hit.distance>.25,'rendered head clearance above actual route');samples++;}return{samples,minOverheadDistance:min};}
