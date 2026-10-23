// A pure consumer: pass an already built W. No browser or new world construction.
import assert from 'node:assert/strict';
import * as THREE from 'three';
const materialName=m=>m?.name?.replace(/_material$/,'');
function visible(o){for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;}
export function assertTongdaoRoofInWorld(W){
 assert.ok(W?.scene&&W?.cm,'Pass existing W.scene/W.cm');
 const roots=[];W.scene.traverse(o=>{if(o.name==='west-six'&&o.userData.tongdaoRoof?.id==='west-six/items/47/tongdao-roof')roots.push(o);});
 assert.equal(roots.length,1,'one actual Tongdao correction must survive material merge');
 const root=roots[0],r=root.userData.tongdaoRoof;
 assert.equal(r.roof,'xieshan');assert.equal(r.accepted,false);assert.equal(r.sourceConflictResolved,false);assert.equal(visible(root),true);
 const originalPhysics=JSON.stringify({colliders:W.cm.colliders,walkables:W.cm.walkables});
 W.scene.updateMatrixWorld(true);
 const candidates=[];root.traverse(m=>{if(m.isMesh&&visible(m)&&['roof_tile','wall_red'].includes(materialName(m.material)))candidates.push(m);});
 const probes=[];
 for(const side of[-1,1]){
  probes.push({id:`${side}-lower-hip`,origin:[side*13.6,20,0],direction:[0,-1,0],material:'roof_tile',point:[side*13.6,7.14519,0],normal:[side*.37101,.92863,0]});
  probes.push({id:`${side}-upper-gable`,origin:[side*20,11,0],direction:[-side,0,0],material:'wall_red',point:[side*10.36104,11,0],normal:[side,0,0]});
  probes.push({id:`${side}-front-rear-slope`,origin:[0,20,side*5],direction:[0,-1,0],material:'roof_tile',point:[0,8.32502,side*5],normal:[0,.84077,side*.54140]});
 }
 const offset=new THREE.Vector3(149.3,0,449.8),normalMatrix=new THREE.Matrix3(),hits=[];
 for(const p of probes){
  const origin=new THREE.Vector3().fromArray(p.origin).add(offset),ray=new THREE.Raycaster(origin,new THREE.Vector3().fromArray(p.direction),0,16);
  const hit=ray.intersectObjects(candidates,false)[0];
  assert.ok(hit,`${p.id}: actual roof surface missing`);assert.equal(materialName(hit.object.material),p.material,`${p.id}: wrong first surface`);
  assert.ok(hit.point.distanceTo(new THREE.Vector3().fromArray(p.point).add(offset))<5e-4,`${p.id}: actual surface changed, not the retained fitted form`);
  const normal=hit.face.normal.clone().applyNormalMatrix(normalMatrix.getNormalMatrix(hit.object.matrixWorld));
  assert.ok(normal.distanceTo(new THREE.Vector3().fromArray(p.normal))<5e-4,`${p.id}: wrong surface direction`);
  hits.push({id:p.id,point:hit.point.toArray(),normal:normal.toArray(),material:p.material});
 }
 assert.equal(JSON.stringify({colliders:W.cm.colliders,walkables:W.cm.walkables}),originalPhysics);
 return{id:r.id,scope:'ROOF_FORM_ONLY_CPU_SURFACE_CHECK_NOT_GPU_OR_WHOLE_BUILDING_ACCEPTANCE',surfaceProbes:hits.length,physicsChanged:false,hits};
}
