// Pure consumer: accepts an already-built caller W and actual InteriorLoader.
// Does not build, add, move, hide, replace or change scene meshes/proxies.
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {solidMaterialNameAt} from '../../src/render/SolidMaterialBatch.js';
import {QINZHENG_FOOTSTOOL as P} from '../../src/scene/palace/special/QinzhengFootstool.js';
import {YANGXIN_WEST_ROOM_PLAN as R53} from '../../src/scene/palace/special/YangxinWestWarmRooms.js';
import {replayTerrace,traceTerraceGround} from './terrace-walk.mjs';
const X=108.6,Z=277.5,local=(x,y,z)=>new THREE.Vector3(X+x,y,Z+z);
const visible=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;};
// Merged Float32 world z near 275 m quantizes by up to 1.53e-5 m.
const close=(a,b)=>Math.abs(a-b)<2e-5;
const expectedBoxes=()=>{
 const a=[[P.x0,P.topY-P.topThickness,P.z0,P.x1,P.topY,P.z1]];
 for(const x of[P.x0+.025,P.x1-.025-P.footWidth])for(const z of[P.z0+.025,P.z1-.025-P.footWidth])a.push([x,P.baseY,z,x+P.footWidth,P.topY-P.topThickness,z+P.footWidth]);
 return a.map(([x,y,z,xx,yy,zz])=>new THREE.Box3(local(x,y,z),local(xx,yy,zz)));
};
const sameBox=(a,b)=>[...a.min.toArray(),...a.max.toArray()].every((v,i)=>close(v,[...b.min.toArray(),...b.max.toArray()][i]));
export const QINZHENG_FOOTSTOOL_VIEWS=[
 {name:'kang-front',eye:[11.6,2.5,-5.1],target:[11.6,1.6,-.7],fov:62},
 {name:'footstool-contact',eye:[10.45,1.35,-3.55],target:[11.6,.74,-2.3],fov:50},
];
export function assertQinzhengFootstoolInWorld(W,{layer='B',interiorLoader=W.loader}={}){
 assert.ok(W?.scene&&W.cm?.checkCollision&&W.cm?.getGroundHeight,'existing W and actual CollisionManager required');
 assert.ok(['B','S'].includes(layer));
 const sGroup=W.scene.getObjectByName('interior:yangxin'),sColliders=W.cm.colliders.filter(c=>c.tag==='interior:yangxin');
 let sMeshes=0,sTriangles=0;
 if(layer==='S'){
  assert.equal(interiorLoader?.halls.get('yangxin')?.group,sGroup,'same real InteriorLoader must own this actual S scene');assert.ok(sGroup);
  sGroup.traverseVisible(m=>{if(m.isMesh&&!/^(COL_|WALK_)/.test(m.name)){sMeshes++;sTriangles+=(m.geometry.index?.count??m.geometry.attributes.position.count)/3;}});
  assert.equal(sMeshes,11);assert.equal(sTriangles,8720);assert.equal(sColliders.length,10);
 }else{assert.equal(sGroup,undefined);assert.equal(sColliders.length,0);}
 W.scene.updateMatrixWorld(true);const triangles=[],sceneMeshes=[];
 W.scene.traverse(m=>{if(!m.isMesh||!visible(m)||!m.geometry?.attributes.position)return;sceneMeshes.push(m);const a=m.geometry.attributes.position,ix=m.geometry.index;for(let k=0;k<(ix?.count??a.count);k+=3){if(solidMaterialNameAt(m,k/3)!==`${P.role}-dark-wood`)continue;const v=[0,1,2].map(j=>new THREE.Vector3().fromBufferAttribute(a,ix?ix.getX(k+j):k+j).applyMatrix4(m.matrixWorld));assert.ok(new THREE.Triangle(...v).getArea()>1e-8,'no degenerate stool triangles');triangles.push(v);}});
 assert.equal(triangles.length,60,'only top plus four feet');const boxes=expectedBoxes(),contacts=[];
 for(const [i,b]of boxes.entries()){
  const contained=triangles.filter(t=>t.every(p=>['x','y','z'].every(axis=>close(p[axis],b.min[axis])||close(p[axis],b.max[axis]))));assert.equal(contained.length,12,`solid box ${i} has closed 12 triangles`);
  const actual=new THREE.Box3().setFromPoints(contained.flat());assert.ok(sameBox(actual,b),'actual triangle bounds');
  assert.equal(W.cm.colliders.filter(c=>sameBox(c.box,b)).length,1,'exact mesh-linked collider');
  if(i){assert.ok(close(b.max.y,boxes[0].min.y),'foot touches underside without floating gap');const center=b.getCenter(new THREE.Vector3()),ray=new THREE.Raycaster(new THREE.Vector3(center.x,.69,center.z),new THREE.Vector3(0,-1,0),0,.1),hits=ray.intersectObjects(sceneMeshes,false).filter(h=>solidMaterialNameAt(h.object,h.faceIndex)!==`${P.role}-dark-wood`);assert.ok(hits.length,'actual retained floor triangles');const floor=hits[0].point.y;assert.ok(close(floor,layer==='B'?.62:.66733700037),'actual B/S floor');assert.ok(b.min.y<=floor+2e-6&&b.max.y>floor,'feet meet B floor or intersect retained S floor, never float');contacts.push({foot:i,baseY:b.min.y,floorY:floor,floorOverlap:floor-b.min.y,undersideY:b.max.y});}
 }
 const support=W.cm.walkables.filter(w=>w.type==='box'&&close(w.box.max.y,P.topY)&&close(w.box.min.x,X+P.x0)&&close(w.box.max.x,X+P.x1)&&close(w.box.min.z,Z+P.z0)&&close(w.box.max.z,Z+P.z1));assert.equal(support.length,1);assert.equal(support[0].rescue,false);
 const ray=new THREE.Raycaster(local(11.6,1,-2.60),new THREE.Vector3(0,-1,0),0,.5),hit=ray.intersectObjects(sceneMeshes,false)[0];assert.equal(solidMaterialNameAt(hit.object,hit.faceIndex),`${P.role}-dark-wood`);assert.ok(close(hit.point.y,P.topY));assert.ok(close(W.cm.getGroundHeight(X+11.6,Z-2.60,.62,.6),hit.point.y),'real support agrees with actual top triangle');
 // At a legal raised step, the stool is below the established step clearance.
 // For an illegally lowered body intersecting the top, actual CM must reject it.
 const illegal=local(11.6,2.02,-2.4);assert.equal(W.cm.checkCollision(illegal,.1),true);assert.ok(W.cm.playerBox.intersectsBox(boxes[0]));assert.ok(W.cm.queryBox(W.cm.playerBox).some(c=>sameBox(c.box,boxes[0])));
 return{scope:'EXISTING_W_ACTUAL_TRIANGLES_COLLISIONS_SUPPORT_NOT_BROWSER_ACCEPTANCE',layer,actualSVisibleMeshes:sMeshes,actualSVisibleTriangles:sTriangles,actualSColliders:sColliders.length,triangles:triangles.length,colliders:boxes.length,supports:support.length,contacts,actualSupportTop:hit.point.y,illegalBodyRejected:true};
}
export function replayQinzhengFootstoolInWorld(t,W,{fps=60,sprint=false,backward=false,route='step'}={}){
 const points=(route==='retained'?[[0,-16],[0,-3],[4.8,-3],[4.8,-.84],...R53.route,...R53.route.slice(0,-1).reverse(),[4.8,-.84],[4.8,-3],[0,-3],[0,-16]]:[[9.9,-2.60],[14,-2.60],[9.9,-2.60]]).map(([x,z])=>[X+x,Z+z]);
 const trace=traceTerraceGround(W.cm,{flights:[]});try{const result=replayTerrace(t,{THREE,cm:W.cm},points,{fps,sprint,backward,recordFrames:true});assert.equal(result.arrived,true,JSON.stringify({...result,frames:undefined}));assert.ok(!trace.samples.some(s=>['rescue','unverified'].includes(s.source)),'no rescue or synthetic support');const stool=trace.samples.filter(s=>close(s.height,P.topY)&&s.x>=X+P.x0&&s.x<=X+P.x1&&s.z>=Z+P.z0&&s.z<=Z+P.z1);if(route==='step'){assert.ok(stool.some(s=>s.height>s.feetIn+.01),'actual ascent');assert.ok(trace.samples.some(s=>close(s.feetIn,P.topY)&&s.height<P.topY-.01),'actual descent');}
 return{fps,sprint,backward,route,arrived:result.arrived,frameCount:result.frames.length,maxSpeed:result.maxSpeed,stoolSupportSamples:stool.length,noRescue:true,finalFeet:result.end[2]};}finally{trace.restore();}
}
