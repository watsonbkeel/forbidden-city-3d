import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createCharacterGeometry,createCharacterGeometrySteps} from '../src/scene/characters/CharacterKit.js';

const ids=['consort-daily','maid-daily'];
const variants=['standard','raised-footstool','kang-low','throne-front-perch'];
const partVertices=(g,part,filter=()=>true)=>{const p=g.attributes.position,c=g.attributes.color,q=g.attributes.characterPart,arr=[];for(let i=0;i<p.count;i++){const v=[p.getX(i),p.getY(i),p.getZ(i)];if(q.getX(i)===part&&filter(v,[c.getX(i),c.getY(i),c.getZ(i)]))arr.push(v);}return arr;};
const isHair=c=>Math.max(...c)<.035;

test('female hair continuously covers the lower back of the head, not a cutoff cap',()=>{
 for(const id of ids)for(const lod of [0,1,2]){
  const g=createCharacterGeometry(id,'standing',lod);
  const rear=partVertices(g,1,(v,c)=>isHair(c)&&v[1]<1.57&&v[1]>=1.49&&v[2]<-.045);
  assert.ok(rear.length>=3,`${id}/L${lod}: continuous lower occipital hair required`);
  assert.ok(Math.max(...partVertices(g,1,(v,c)=>isHair(c)).map(v=>v[1]))<=1.72,`${id}: avoid unsupported tall cone bun`);
  const mesh=new THREE.Mesh(g,new THREE.MeshBasicMaterial());mesh.updateMatrixWorld();
  for(const y of [1.53,1.55,1.58]){
   const hits=new THREE.Raycaster(new THREE.Vector3(0,y,-.3),new THREE.Vector3(0,0,1)).intersectObject(mesh);
   assert.ok(hits.length,`${id}/L${lod} rear ray ${y}`);
   const face=hits[0].face,c=g.attributes.color;
   assert.ok([face.a,face.b,face.c].every(i=>isHair([c.getX(i),c.getY(i),c.getZ(i)])),`${id}/L${lod} bare rear skull at ${y}`);
  }
  mesh.material.dispose();g.dispose();
 }
});
test('both anonymous women have distinct natural face profiles and bun silhouettes at every LOD',()=>{
 for(const lod of [0,1,2]){
  const gs=ids.map(id=>createCharacterGeometry(id,'standing',lod));
  const faces=gs.map(g=>partVertices(g,1,(v,c)=>c[0]>.3&&c[1]/c[2]<2&&v[1]>1.46&&v[1]<1.62));
  assert.notDeepEqual(faces[0],faces[1],`L${lod}: actual skin geometry must differ, not only ornaments/colors`);
  const buns=gs.map(g=>partVertices(g,1,(v,c)=>isHair(c)&&v[2]<-.085));
  assert.notDeepEqual(buns[0],buns[1],`L${lod}: actual compact bun geometry differs`);
  const arms=gs.map(g=>partVertices(g,2));assert.notDeepEqual(arms[0],arms[1],`L${lod}: distinct practical sleeve silhouette`);
  gs.forEach(g=>g.dispose());
 }
});
test('female revisions preserve adult scale, true seat surfaces, foot contacts and bounded same-source API',()=>{
 for(const id of ids)for(const pose of ['standing','seated','kneeling'])for(const lod of [0,1,2])for(const seatVariant of pose==='seated'?variants:['standard']){
  const g=createCharacterGeometry(id,pose,lod,{seatVariant}),it=createCharacterGeometrySteps(id,pose,lod,{seatVariant});let n;
  do{n=it.next();if(!n.done){assert.ok(n.value.workUnits<=128);assert.ok((n.value.work.vertices??0)<=128);}}while(!n.done);
  const b=n.value;for(const key of Object.keys(g.attributes))assert.deepEqual(g.attributes[key].array,b.attributes[key].array);assert.deepEqual(g.index.array,b.index.array);assert.deepEqual(g.userData,b.userData);
  assert.equal(g.userData.bodyHeightMeters,1.7);assert.equal(g.userData.historyStatus,'interpretive-simplification');
  if(pose==='seated'){
   assert.deepEqual(g.userData.seatPelvis,[0,.57,-.04]);assert.deepEqual(g.userData.seatContact,[0,.49,-.04]);
   const yy=['raised-footstool','throne-front-perch'].includes(seatVariant)?.3:seatVariant==='kang-low'?.04:0,zz=seatVariant==='raised-footstool'?.815:seatVariant==='throne-front-perch'?.58:.535;
   assert.deepEqual(g.userData.groundContacts,[[-.12,yy,zz],[.12,yy,zz]]);
   assert.ok(partVertices(g,0,v=>Math.abs(v[1]-.49)<1e-5).length>=7);
  }
  for(const attr of Object.values(g.attributes))assert.ok([...attr.array].every(Number.isFinite));
  assert.ok(g.userData.triangles<=[12000,1500,600][lod]);
  g.dispose();b.dispose();
 }
});
test('female swept scalp follows the forehead rather than forming a projecting cap brim',()=>{
 for(const id of ids){const g=createCharacterGeometry(id,'standing',0),upperFront=partVertices(g,1,(v,c)=>isHair(c)&&v[1]>1.635&&v[2]>.02);assert.ok(upperFront.every(v=>v[2]<.071),`${id}: scalp must taper with the upper forehead`);g.dispose();}
});
test('hair has no exposed upper-skull bands at oblique angles or between authored rings',()=>{
 for(const id of ids)for(const lod of [0,1,2]){
  const g=createCharacterGeometry(id,'standing',lod),mesh=new THREE.Mesh(g,new THREE.MeshBasicMaterial());mesh.updateMatrixWorld();
  for(const angle of [0,Math.PI/3,Math.PI/2,Math.PI*2/3,Math.PI])for(const y of [1.626,1.635,1.645,1.655,1.675,1.69]){
   const dir=new THREE.Vector3(Math.sin(angle),0,Math.cos(angle)),hits=new THREE.Raycaster(new THREE.Vector3(dir.x*.3,y,dir.z*.3),dir.negate()).intersectObject(mesh);
   assert.ok(hits.length);const face=hits[0].face,c=g.attributes.color;
   assert.ok([face.a,face.b,face.c].every(i=>isHair([c.getX(i),c.getY(i),c.getZ(i)])||c.getY(i)/c.getZ(i)>2),`${id}/L${lod}: scalp exposed at angle ${angle}, y ${y}`);
  }
  mesh.material.dispose();g.dispose();
 }
});
test('female noses are closed volumes readable from either profile, not only flat frontal paint',()=>{
 for(const id of ids){const g=createCharacterGeometry(id),mesh=new THREE.Mesh(g,new THREE.MeshBasicMaterial());mesh.updateMatrixWorld();for(const sign of [-1,1]){const hits=new THREE.Raycaster(new THREE.Vector3(sign*.2,1.54,.087),new THREE.Vector3(-sign,0,0)).intersectObject(mesh);assert.ok(hits.length,`${id}: nose side ${sign} must have a visible surface`);}g.dispose();mesh.material.dispose();}
});
test('female right-lapel border follows the curved cloth without vanishing under long flat chords',()=>{
 for(const id of ids){const g=createCharacterGeometry(id),mesh=new THREE.Mesh(g,new THREE.MeshBasicMaterial());mesh.updateMatrixWorld();const path=[[-.046,1.402],[.065,1.352],[.145,1.288],[.191,1.20]];
  for(let k=0;k<path.length-1;k++)for(const u of [.25,.5,.75]){const x=path[k][0]+(path[k+1][0]-path[k][0])*u,y=path[k][1]+(path[k+1][1]-path[k][1])*u,hits=new THREE.Raycaster(new THREE.Vector3(x,y,.5),new THREE.Vector3(0,0,-1)).intersectObject(mesh);assert.ok(hits.length);const c=g.attributes.color;assert.ok([hits[0].face.a,hits[0].face.b,hits[0].face.c].every(i=>c.getX(i)<.045),`${id} lapel hidden at ${x}/${y}`);}
  g.dispose();mesh.material.dispose();
 }
});
