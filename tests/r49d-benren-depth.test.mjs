import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {depthSnapshot,withDepthScene} from './lib/r49d-depth-snapshot.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)).replace(/\/$/,''),baseline=JSON.parse(readFileSync(new URL('../reports/r49d/frozen-baseline-scoped.json',import.meta.url))),ref=baseline.rows[0];
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} vs ${b}`);
for(const old of baseline.rows)test(old.name+': R49D scoped geometry and access retention',async()=>{
 const now=await depthSnapshot(root,old);
 for(const k of ['meshes','nonPlaqueGeometryHash','colliders','walkables','rooms','regions','mapItems'])assert.deepEqual(now[k],old[k],k);
 // R49E intentionally changes only the Wenyuan registered plaque pose.
 // Keep the actual candidate world and all non-plaque/access comparisons above;
 // the R49E suite separately checks every frame corner, volume and photo pose.
 if(old.name==='文渊阁'){
  for(const part of ['face','frame'])for(const key of ['geometry','scale'])assert.deepEqual(now[part][key],old[part][key]);
  assert.deepEqual(now.face.position,[0,8.79,-8.88]);
  near(now.frame.rotation[0],-Math.PI/3);return;
 }
 if(old.name!=='本仁殿'){assert.deepEqual(now,old);return;}
 for(const part of ['face','frame']){
  assert.deepEqual(now[part].geometry,old[part].geometry);assert.deepEqual(now[part].scale,old[part].scale);assert.deepEqual(now[part].rotation,old[part].rotation);
  assert.deepEqual(now[part].position.slice(0,2),old[part].position.slice(0,2));near(now[part].position[2],old[part].position[2]-.05);
 }
 near(now.frame.position[2]-now.face.position[2],.06);
});
function hits({T,zone,plaque}){zone.kit.root.updateMatrixWorld(true);const box=new T.Box3().setFromObject(plaque.frame).expandByScalar(-1e-5),triangle=new T.Triangle(),out=[];zone.kit.root.traverse(m=>{if(!m.isMesh||m===plaque.frame||m===plaque.mesh)return;const g=m.geometry,a=g.attributes.position,idx=g.index;for(let i=0;i<(idx?.count??a.count);i+=3){for(const[j,k]of['a','b','c'].entries())triangle[k].fromBufferAttribute(a,idx?idx.getX(i+j):i+j).applyMatrix4(m.matrixWorld);if(box.intersectsTriangle(triangle))out.push({mesh:m,triangle:i/3});}});return out;}
test('本仁: full backing has no structural intersections; old depth reproduces three',()=>withDepthScene(root,ref,scene=>{
 assert.equal(hits(scene).length,0);scene.plaque.mesh.position.z+=.05;scene.plaque.frame.position.z+=.05;assert.equal(hits(scene).length,3);
}));
test('本仁: six rearward rays confirm 15 mm frame-to-existing-beam gap',()=>withDepthScene(root,ref,({T,zone,built,plaque})=>{
 const inv=built.f.matrixWorld.clone().invert(),direction=new T.Vector3(0,0,1).transformDirection(built.f.matrixWorld);
 for(const x of[-.2,0,.2])for(const y of[5.55,5.8]){const origin=built.f.localToWorld(new T.Vector3(x,y,plaque.frame.position.z+.05+.000001)),ray=new T.Raycaster(origin,direction,0,.3),hit=ray.intersectObject(zone.kit.root,true).find(h=>h.object!==plaque.mesh&&h.object!==plaque.frame);assert.ok(hit);near(hit.point.clone().applyMatrix4(inv).z,-5.374999994039535);assert.ok(Math.abs(hit.distance-.014999)<1e-6);}
}));
test('本仁: whole-frame front/oblique standing-eye grids remain visible',()=>withDepthScene(root,ref,({T,zone,item,built,plaque})=>{
 const fw=plaque.frame.geometry.parameters.width,fh=plaque.frame.geometry.parameters.height;
 for(const xyz of[[0,item.ph+1.7,-9],[-3,item.ph+1.7,-9],[3,item.ph+1.7,-9],[0,item.ph+1.7,-15],[-1,item.ph+1.7,-7]]){
  const origin=built.f.localToWorld(new T.Vector3(...xyz));let visible=0;
  for(let iy=0;iy<5;iy++)for(let ix=0;ix<5;ix++){
   const local=new T.Vector3(plaque.mesh.position.x-fw/2+.015+(fw-.03)*ix/4,plaque.mesh.position.y-fh/2+.015+(fh-.03)*iy/4,plaque.mesh.position.z+.0099),point=built.f.localToWorld(local),direction=point.clone().sub(origin),distance=direction.length(),ray=new T.Raycaster(origin,direction.normalize(),0,distance-.001);
   if(!ray.intersectObject(zone.kit.root,true).some(h=>h.object!==plaque.mesh&&h.object!==plaque.frame))visible++;
  }
  assert.equal(visible,25,JSON.stringify(xyz));
 }
}));
test('本仁: evidence metadata does not claim verified height, size or support',()=>withDepthScene(root,ref,({plaque})=>{
 const m=plaque.mesh.userData.nameboardMount;assert.equal(m,plaque.frame.userData.nameboardMount);assert.equal(m.mountKind,'beam-front-depth-clearance-only');assert.match(m.source,/e54bd768807a80999b3c22af915df13b\.pdf$/);assert.equal(m.residual,'Y_SIZE_DOORHEAD_PROPORTIONS_AND_HISTORIC_SUPPORT_UNVERIFIED');assert.match(m.dimensions,/ONLY_DEPTH_FITTED_NOT_SURVEYED/);
}));
