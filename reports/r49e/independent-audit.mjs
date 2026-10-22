import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {withDepthScene} from '/workspace/scratch/02a8023d1a85/r49e-wenyuan-plaque-pitch/tests/lib/r49d-depth-snapshot.mjs';
const root='/workspace/scratch/02a8023d1a85/r49e-wenyuan-plaque-pitch',base='/workspace/scratch/02a8023d1a85/r49d-benren-plaque-depth';
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const row={zone:'outer-east',name:'文渊阁'};
const payload=m=>({geometry:{type:m.geometry.type,index:m.geometry.index?Array.from(m.geometry.index.array):null,attributes:Object.fromEntries(Object.entries(m.geometry.attributes).map(([k,a])=>[k,Array.from(a.array)]))},scale:m.scale.toArray(),material:(Array.isArray(m.material)?m.material:[m.material]).map(v=>({name:v.name,type:v.type,color:v.color?.getHex(),opacity:v.opacity,transparent:v.transparent,side:v.side,depthTest:v.depthTest,depthWrite:v.depthWrite,roughness:v.roughness,metalness:v.metalness,map:v.map?{repeat:v.map.repeat.toArray(),offset:v.map.offset.toArray(),rotation:v.map.rotation,wrapS:v.map.wrapS,wrapT:v.map.wrapT,flipY:v.map.flipY,channel:v.map.channel,colorSpace:v.map.colorSpace}:null})),visible:m.visible,castShadow:m.castShadow,receiveShadow:m.receiveShadow});
const before=await withDepthScene(base,row,({plaque})=>({face:payload(plaque.mesh),frame:payload(plaque.frame),relative:plaque.frame.matrixWorld.clone().invert().multiply(plaque.mesh.matrixWorld).elements}));
const result=await withDepthScene(root,row,({T,zone,built,plaque})=>{
  zone.kit.root.updateMatrixWorld(true);
  assert.deepEqual(payload(plaque.mesh),before.face);assert.deepEqual(payload(plaque.frame),before.frame);
  const relative=plaque.frame.matrixWorld.clone().invert().multiply(plaque.mesh.matrixWorld).elements;
  assert.ok(Math.max(...relative.map((v,i)=>Math.abs(v-before.relative[i])))<1e-10);
  plaque.frame.geometry.computeBoundingBox();const bb=plaque.frame.geometry.boundingBox,invFrame=plaque.frame.matrixWorld.clone().invert(),invHall=built.f.matrixWorld.clone().invert();
  const corners=[];for(const x of[bb.min.x,bb.max.x])for(const y of[bb.min.y,bb.max.y])for(const z of[bb.min.z,bb.max.z])corners.push(new T.Vector3(x,y,z).applyMatrix4(plaque.frame.matrixWorld));
  const structural=[];zone.kit.root.traverse(m=>{if(m.isMesh&&m!==plaque.mesh&&m!==plaque.frame)structural.push(m);});
  const tri=new T.Triangle();let testedTriangles=0,intersections=0;const roofMin=[],insideSolidCorners=[];const cornerMin=Array(8).fill(Infinity);
  for(const m of structural){
    const a=m.geometry.attributes.position,idx=m.geometry.index,invMesh=m.matrixWorld.clone().invert();
    const worldTriangles=[];
    for(let i=0;i<(idx?.count??a.count);i+=3){for(const[j,k]of['a','b','c'].entries())tri[k].fromBufferAttribute(a,idx?idx.getX(i+j):i+j).applyMatrix4(m.matrixWorld);worldTriangles.push(tri.clone());testedTriangles++;if(bb.intersectsTriangle(new T.Triangle(...[tri.a,tri.b,tri.c].map(p=>p.clone().applyMatrix4(invFrame)))))intersections++;for(let c=0;c<corners.length;c++)cornerMin[c]=Math.min(cornerMin[c],tri.closestPointToPoint(corners[c],new T.Vector3()).distanceTo(corners[c]));}
    if(['BoxGeometry','CylinderGeometry','SphereGeometry'].includes(m.geometry.type))for(let c=0;c<corners.length;c++){
      const point=corners[c],ray=new T.Ray(point,new T.Vector3(.818, .397,.415).normalize()),hitDistances=[];
      for(const t of worldTriangles){const h=ray.intersectTriangle(t.a,t.b,t.c,false,new T.Vector3());if(h)hitDistances.push(h.distanceTo(point));}
      hitDistances.sort((a,b)=>a-b);const unique=hitDistances.filter((v,i)=>i===0||Math.abs(v-hitDistances[i-1])>1e-6);
      if(unique.length%2===1)insideSolidCorners.push({c,type:m.geometry.type,name:m.name,material:m.material.name});
    }
  }
  for(const point of corners){const ray=new T.Ray(point,new T.Vector3(0,1,0)),hits=[];for(const m of structural.filter(m=>m.name.startsWith('roof_'))){const a=m.geometry.attributes.position,idx=m.geometry.index;for(let i=0;i<(idx?.count??a.count);i+=3){for(const[j,k]of['a','b','c'].entries())tri[k].fromBufferAttribute(a,idx?idx.getX(i+j):i+j).applyMatrix4(m.matrixWorld);const h=ray.intersectTriangle(tri.a,tri.b,tri.c,false,new T.Vector3());if(h)hits.push({distance:h.distanceTo(point),ny:tri.getNormal(new T.Vector3()).y,name:m.name});}}hits.sort((a,b)=>a.distance-b.distance);roofMin.push(hits[0]);}
  assert.equal(intersections,0);assert.equal(insideSolidCorners.length,0);assert.ok(roofMin.every(h=>h.distance>0.01&&h.ny<0));
  const visibility=[];
  for(const xyz of[[0,1.7,-25],[0,2.2,-13],[-4,2.2,-15],[4,2.2,-15],[0,1.7,-30],[0,2.2,-10]]){
    const origin=built.f.localToWorld(new T.Vector3(...xyz));let visible=0;const blockers={};let total=0;
    // 21 x 21, includes the actual extreme front corners rather than inset samples.
    for(let iy=0;iy<21;iy++)for(let ix=0;ix<21;ix++){
      const point=new T.Vector3(bb.min.x+(bb.max.x-bb.min.x)*ix/20,bb.min.y+(bb.max.y-bb.min.y)*iy/20,bb.min.z-.0001).applyMatrix4(plaque.frame.matrixWorld),dir=point.clone().sub(origin),dist=dir.length();const hit=new T.Raycaster(origin,dir.normalize(),0,dist-.000001).intersectObjects(structural,false)[0];total++;if(!hit)visible++;else{const k=hit.object.name||hit.object.material.name||hit.object.geometry.type;blockers[k]=(blockers[k]??0)+1;}
    }visibility.push({camera:xyz,visible,total,blockers});
  }
  const normal=new T.Vector3().fromBufferAttribute(plaque.mesh.geometry.attributes.normal,0).applyQuaternion(plaque.mesh.quaternion);
  return{identityUnchanged:true,faceGeometryHash:hash(before.face),frameGeometryHash:hash(before.frame),relativeMatrixMaxError:Math.max(...relative.map((v,i)=>Math.abs(v-before.relative[i]))),frameCornersHallLocal:corners.map(p=>p.clone().applyMatrix4(invHall).toArray()),testedTriangles,orientedFrameTriangleIntersections:intersections,insideClosedSolidCorners:insideSolidCorners,roofFirstHits:roofMin,cornerSurfaceDistance:cornerMin,normal:normal.toArray(),visibility};
});
console.log(JSON.stringify(result,null,2));
