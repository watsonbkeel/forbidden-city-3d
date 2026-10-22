import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {depthSnapshot,withDepthScene} from './lib/r49d-depth-snapshot.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)).replace(/\/$/,''),baseline=JSON.parse(readFileSync(new URL('../reports/r49e/frozen-baseline-scoped.json',import.meta.url))),ref=baseline.rows.find(r=>r.name==='文渊阁');
const near=(a,b,e=1e-8)=>assert.ok(Math.abs(a-b)<e,`${a} vs ${b}`);
for(const old of baseline.rows)test(old.name+': R49E scoped source-group geometry/access invariants',async()=>{
 const now=await depthSnapshot(root,old);
 for(const k of['meshes','nonPlaqueGeometryHash','colliders','walkables','rooms','regions','mapItems'])assert.deepEqual(now[k],old[k],k);
 if(old.name!=='文渊阁'){assert.deepEqual(now,old);return;}
 for(const part of['face','frame'])for(const k of['geometry','scale'])assert.deepEqual(now[part][k],old[part][k],part+'.'+k);
 assert.notEqual(now.wholeGeometryHash,old.wholeGeometryHash);
});
function volumeHits({T,zone,plaque}){
 zone.kit.root.updateMatrixWorld(true);plaque.frame.geometry.computeBoundingBox();
 const bounds=plaque.frame.geometry.boundingBox.clone().expandByScalar(-1e-5),inv=plaque.frame.matrixWorld.clone().invert(),triangle=new T.Triangle(),out=[];
 zone.kit.root.traverse(m=>{if(!m.isMesh||m===plaque.mesh||m===plaque.frame)return;const g=m.geometry,a=g.attributes.position,idx=g.index,mat=inv.clone().multiply(m.matrixWorld);for(let i=0;i<(idx?.count??a.count);i+=3){for(const[j,k]of['a','b','c'].entries())triangle[k].fromBufferAttribute(a,idx?idx.getX(i+j):i+j).applyMatrix4(mat);if(bounds.intersectsTriangle(triangle))out.push({mesh:m,triangle:i/3});}});return out;
}
test('文渊: entire oriented frame volume remains outside actual structure',()=>withDepthScene(root,ref,s=>assert.equal(volumeHits(s).length,0)));
test('文渊: complete frame and face share one rigid 60 degree pitch, not resized parts',()=>withDepthScene(root,ref,({T,plaque})=>{
 assert.deepEqual(plaque.mesh.position.toArray(),[0,8.79,-8.88]);
 const q=new T.Quaternion().setFromAxisAngle(new T.Vector3(1,0,0),-Math.PI/3),oldFace=new T.Quaternion().setFromEuler(new T.Euler(...ref.face.rotation.slice(0,3),ref.face.rotation[3])),oldFrame=new T.Quaternion().setFromEuler(new T.Euler(...ref.frame.rotation.slice(0,3),ref.frame.rotation[3]));
 near(plaque.mesh.quaternion.angleTo(q.clone().multiply(oldFace)),0);near(plaque.frame.quaternion.angleTo(q.clone().multiply(oldFrame)),0);
 const offset=new T.Vector3(0,0,.06).applyQuaternion(q),actual=plaque.frame.position.clone().sub(plaque.mesh.position);near(actual.distanceTo(offset),0);
 const normal=new T.Vector3().fromBufferAttribute(plaque.mesh.geometry.attributes.normal,0).applyQuaternion(plaque.mesh.quaternion);near(normal.y,-Math.sqrt(3)/2);near(normal.z,-.5);
 const g=plaque.frame.geometry.parameters;near(g.width*plaque.frame.scale.x,.921);near(g.height*plaque.frame.scale.y,1.455);near(g.depth*plaque.frame.scale.z,.1);
}));
test('文渊: all eight frame corners lie outside existing closed beam/window boxes',()=>withDepthScene(root,ref,({T,zone,plaque})=>{
 const b=plaque.frame.geometry.boundingBox??(plaque.frame.geometry.computeBoundingBox(),plaque.frame.geometry.boundingBox),corners=[];for(const x of[b.min.x,b.max.x])for(const y of[b.min.y,b.max.y])for(const z of[b.min.z,b.max.z])corners.push(new T.Vector3(x,y,z).applyMatrix4(plaque.frame.matrixWorld));
 zone.kit.root.traverse(m=>{if(!m.isMesh||m===plaque.mesh||m===plaque.frame||m.geometry.type!=='BoxGeometry')return;m.geometry.computeBoundingBox();const box=m.geometry.boundingBox.clone().expandByScalar(-1e-5),inv=m.matrixWorld.clone().invert();for(const p of corners)assert.ok(!box.containsPoint(p.clone().applyMatrix4(inv)),m.userData.role??m.name);});
}));
test('文渊: all eight frame corners remain below the actual upper-roof envelope',()=>withDepthScene(root,ref,({T,zone,plaque})=>{
 const box=plaque.frame.geometry.boundingBox??(plaque.frame.geometry.computeBoundingBox(),plaque.frame.geometry.boundingBox),direction=new T.Vector3(0,1,0);let minimum=Infinity;
 for(const x of[box.min.x,box.max.x])for(const y of[box.min.y,box.max.y])for(const z of[box.min.z,box.max.z]){
  const point=new T.Vector3(x,y,z).applyMatrix4(plaque.frame.matrixWorld),ray=new T.Ray(point,direction),tri=new T.Triangle(),target=new T.Vector3(),hits=[];
  zone.kit.root.traverse(m=>{if(!m.isMesh||!m.name.startsWith('roof_'))return;const a=m.geometry.attributes.position,idx=m.geometry.index;for(let i=0;i<(idx?.count??a.count);i+=3){for(const[j,k]of['a','b','c'].entries())tri[k].fromBufferAttribute(a,idx?idx.getX(i+j):i+j).applyMatrix4(m.matrixWorld);const hit=ray.intersectTriangle(tri.a,tri.b,tri.c,false,target);if(hit)hits.push({distance:point.distanceTo(hit),normal:tri.getNormal(new T.Vector3())});}});
  hits.sort((a,b)=>a.distance-b.distance);assert.ok(hits.length>0);assert.ok(hits[0].distance>.001);assert.ok(hits[0].normal.y<0,'first roof hit must enter the bottom, not exit a containing roof solid');minimum=Math.min(minimum,hits[0].distance);
 }
 assert.ok(minimum>.01,'at least centimetre-scale vertical roof separation at all corners');
}));
test('文渊: frame bottom near window head is not treated as forced large projection clearance',()=>withDepthScene(root,ref,({T,built,plaque})=>{
 const inv=built.f.matrixWorld.clone().invert(),box=new T.Box3().setFromObject(plaque.frame).applyMatrix4(inv);assert.ok(Math.abs(box.min.y-8.416)<.05);assert.ok(box.max.y<9.30);assert.ok(box.min.z<-9.45);assert.ok(box.max.z<-8.17);
}));
test('文渊: four normal courtyard/front/oblique views read the complete frame; far/under-eave occlusion remains recorded',()=>withDepthScene(root,ref,({T,zone,built,plaque})=>{
 const g=plaque.frame.geometry.parameters;
 for(const [xyz,expected] of[[[0,1.7,-25],25],[[0,2.2,-13],25],[[-4,2.2,-15],25],[[4,2.2,-15],25],[[0,1.7,-30],20],[[0,2.2,-10],22]]){
  const origin=built.f.localToWorld(new T.Vector3(...xyz));let visible=0;
  for(let iy=0;iy<5;iy++)for(let ix=0;ix<5;ix++){
   const point=new T.Vector3(-g.width/2+.015+(g.width-.03)*ix/4,-g.height/2+.015+(g.height-.03)*iy/4,-g.depth/2-.0001).applyMatrix4(plaque.frame.matrixWorld),direction=point.clone().sub(origin),distance=direction.length(),ray=new T.Raycaster(origin,direction.normalize(),0,distance-.001);
   if(!ray.intersectObject(zone.kit.root,true).some(h=>h.object!==plaque.mesh&&h.object!==plaque.frame))visible++;
  }
  assert.equal(visible,expected,JSON.stringify(xyz));
 }
}));
test('文渊: photo provenance and revised diagnosis remain explicit, not a surveyed angle',()=>withDepthScene(root,ref,({plaque})=>{
 const m=plaque.mesh.userData.nameboardMount;assert.equal(m,plaque.frame.userData.nameboardMount);assert.equal(m.pitch.degrees,-60);assert.equal(m.pitch.notASurveyConfidenceInterval,true);assert.equal(m.pitch.pdfPage,9);assert.match(m.pitch.photo,/u625f6d55f09ad\.pdf$/);assert.match(m.pitch.supersedes,/NOT_ESTABLISHED/);assert.match(m.dimensions,/RETAINED_FULL_FRAME_SIZE/);assert.match(m.residual,/EXACT_ANGLE.*UNVERIFIED/);
}));
