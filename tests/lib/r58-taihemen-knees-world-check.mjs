// Pure consumer of the parent's already-built W. Never imports a builder,
// creates geometry/collision/support, starts a browser or reconstructs W.
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {PLAYER} from '../../src/config/constants.js';
const MATERIAL='taihemen-south-knee-teal';
const BODY_RADIUS=.5; // FirstPersonControls uses this collision radius, not a PLAYER field.
export const TAIHEMEN_KNEE_VIEWS=Object.freeze([
 {id:'south-front-knees',eye:[0,5.14,-270],target:[0,10,-224.47],fov:47},
 {id:'south-oblique-knees',eye:[26,5.14,-251],target:[5,10.1,-224.47],fov:48},
 {id:'south-close-knees',eye:[9,5.14,-239],target:[5.34,9.8,-224.47],fov:38},
]);
function visible(hit){for(let o=hit.object;o;o=o.parent)if(!o.visible)return false;const m=hit.object.material;return !Array.isArray(m)&&m.visible!==false&&(!m.transparent||m.opacity>0);}
export function assertTaihemenSouthKneesInWorld(W){
 assert.ok(W?.scene&&W?.cm,'Pass existing W.scene and W.cm; no world is built');
 const root=W.scene.getObjectByName('太和门');assert.ok(root,'Taihemen must exist');
 root.updateWorldMatrix(true,true); // Refresh derived transforms on a fresh, not-yet-rendered W.
 const records=(root.userData.architecture??[]).filter(r=>r.id==='axis/taihemen-south-knees');
 assert.equal(records.length,1,'exactly one south knees structure');const p=records[0].profile;
 assert.equal(p.entityId,'FC-B3B12CF397');assert.equal(p.accepted,false);assert.deepEqual(p.bays,[1,2,3,4,5,6,7]);
 const ox=root.position.x,oz=root.position.z,eave=oz+p.eaveZ;
 const rays=(from,dir,max,material)=>new THREE.Raycaster(new THREE.Vector3(...from),new THREE.Vector3(...dir),0,max).intersectObject(root,true).filter(h=>visible(h)&&h.object.material.name===material);
 const probes=[];
 for(const bay of p.bays)for(const inward of [1,-1]){
  const columnX=ox+p.x0-48.06/2+(bay+(inward===1?0:1))*p.bayW;
  const rootX=columnX+inward*(p.rootInset+.02),midX=columnX+inward*(p.rootInset+p.reach*.5);
  const y=p.topY-p.drop*.3;
  const front=rays([midX,y,eave-.8],[0,0,1],1.6,MATERIAL)[0];
  const back=rays([midX,y,eave+.8],[0,0,-1],1.6,MATERIAL)[0];
  assert.ok(front&&back,`rendered two-sided solid knee missing bay ${bay}/${inward}`);
  assert.ok(Math.abs(front.point.z-(eave-p.depth/2))<1e-4&&Math.abs(back.point.z-(eave+p.depth/2))<1e-4,'actual depth mismatch');
  const top=rays([midX,p.topY+.12,eave],[0,-1,0],.25,MATERIAL)[0];
  assert.ok(top&&Math.abs(top.point.y-p.topY)<1e-4,'actual knee top missing');
  // The knee top is strictly within the existing beam's front/back surfaces.
  const beamFront=rays([midX,p.topY-.01,eave-.8],[0,0,1],1.6,'caihua_beam')[0];
  const beamBack=rays([midX,p.topY-.01,eave+.8],[0,0,-1],1.6,'caihua_beam')[0];
  assert.ok(beamFront&&beamBack&&beamFront.point.z<front.point.z&&beamBack.point.z>back.point.z,'no actual retained beam attachment');
  // Actual knee triangles and column mantle at a common high root station.
  const rootY=p.topY-p.drop*.7;
  assert.ok(rays([rootX,rootY,eave-.8],[0,0,1],1.6,MATERIAL).length,'knee root geometry missing');
  const left=rays([columnX-1,rootY,eave],[1,0,0],2,'wood_column')[0];
  const right=rays([columnX+1,rootY,eave],[-1,0,0],2,'wood_column')[0];
  assert.ok(left&&right&&left.point.x<rootX&&right.point.x>rootX,'no actual retained column attachment');
  probes.push({bay,inward,front:front.point.toArray(),back:back.point.toArray(),beamContact:true,columnContact:true});
 }
 const knees=[];root.traverse(m=>{if(m.isMesh&&m.material.name===MATERIAL)knees.push(m);});assert.equal(knees.length,1,'production merge should emit one added material mesh');
 let triangles=0,minY=Infinity,maxY=-Infinity;const box=new THREE.Box3();
 for(const m of knees){const a=m.geometry.attributes.position,idx=m.geometry.index;triangles+=(idx?.count??a.count)/3;
  for(let i=0;i<(idx?.count??a.count);i+=3){const v=[0,1,2].map(k=>new THREE.Vector3().fromBufferAttribute(a,idx?idx.getX(i+k):i+k).applyMatrix4(m.matrixWorld));
   assert.ok(v.every(q=>q.toArray().every(Number.isFinite)));assert.ok(new THREE.Vector3().crossVectors(v[1].clone().sub(v[0]),v[2].clone().sub(v[0])).length()>1e-8,'zero-area production knee face');
   for(const q of v){box.expandByPoint(q);minY=Math.min(minY,q.y);maxY=Math.max(maxY,q.y);}
  }
 }
 assert.equal(triangles,1008,'fourteen complete low-poly halves');
 const floorY=3.44,jumpHeadY=floorY+PLAYER.HEIGHT+PLAYER.JUMP_VELOCITY**2/(2*PLAYER.GRAVITY)+BODY_RADIUS;
 assert.ok(minY>jumpHeadY,'legal head/jump envelope intersects knee');
 const clearance=[];
 for(const bay of p.bays){const x=ox+p.x0-48.06/2+(bay+.5)*p.bayW;
  for(const y of [floorY+PLAYER.HEIGHT,jumpHeadY])assert.equal(rays([x,y,eave-.8],[0,0,1],1.6,MATERIAL).length,0,'open porch obstructed');
  assert.equal(W.cm.checkCollision(new THREE.Vector3(x,floorY+PLAYER.HEIGHT,eave),BODY_RADIUS),false,'phantom new collision');
  assert.ok(Math.abs(W.cm.getGroundHeight(x,eave,floorY,.03)-floorY)<1e-8,'original floor support missing');clearance.push({bay,x});
 }
 return {entityId:p.entityId,halfCount:14,triangles,mergedAddedMeshes:1,probes,openBayChecks:clearance.length,bounds:{min:box.min.toArray(),max:box.max.toArray()},
  floorY,jumpHeadY,minimumJumpHeadGap:minY-jumpHeadY,colliderDelta:0,supportDelta:0,
  deltaBasis:'Producer adds none; exact before/after registration equality belongs to component retention report.',browserAcceptance:false,status:'VERIFY_PENDING_BROWSER'};
}
