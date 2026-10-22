// Read-only source-direction pose hypotheses, not production changes or acceptance.
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
const ROOT=process.argv[2];if(!ROOT)throw Error('Explicit frozen pre-pitch source root required');
const T=await import(ROOT+'/node_modules/three/build/three.module.js');
await import(ROOT+'/tests/lib/inner-palace-fixture.mjs');
const {realTextureLibrary}=await import(ROOT+'/tests/lib/r48-real-texture-library.mjs');
const {ZoneBase}=await import(ROOT+'/src/scene/zones/ZoneBase.js');
const data=JSON.parse(fs.readFileSync(ROOT+'/data/zones/outer-east.json')),item=data.items.find(r=>r.name==='文渊阁'),lib=realTextureLibrary(),zone=new ZoneBase(lib,data);
try{
 const built=zone.buildHall(item);zone.kit.root.position.set(-item.x,0,-item.z);zone.kit.buildPlaqueAtlas();const p=zone.kit.plaques.find(p=>p.text===item.name),mp=p.mesh.position.clone(),fp=p.frame.position.clone(),mq=p.mesh.quaternion.clone(),fq=p.frame.quaternion.clone(),q=new T.Quaternion(),axis=new T.Vector3(1,0,0),rows=[];
 const structural=[];zone.kit.root.updateMatrixWorld(true);zone.kit.root.traverse(m=>{if(m.isMesh&&m!==p.mesh&&m!==p.frame)structural.push(m);});
 for(const degrees of[0,35,40,45,50,55,60,65,70]){
  p.mesh.position.copy(mp);p.frame.position.copy(fp);p.mesh.quaternion.copy(mq);p.frame.quaternion.copy(fq);
  if(degrees){q.setFromAxisAngle(axis,-degrees*Math.PI/180);p.mesh.position.set(0,0,0);p.frame.position.copy(fp).sub(mp).applyQuaternion(q);p.mesh.quaternion.premultiply(q);p.frame.quaternion.premultiply(q);zone.kit.root.updateMatrixWorld(true);const box=new T.Box3().setFromObject(p.frame),delta=new T.Vector3(0,8.431-box.min.y,-8.19-box.max.z);p.mesh.position.add(delta);p.frame.position.add(delta);}
  zone.kit.root.updateMatrixWorld(true);p.frame.geometry.computeBoundingBox();const obb=p.frame.geometry.boundingBox.clone().expandByScalar(-.00001),inv=p.frame.matrixWorld.clone().invert(),tri=new T.Triangle(),hits=[];
  for(const m of structural){const mat=inv.clone().multiply(m.matrixWorld),g=m.geometry,a=g.attributes.position,idx=g.index;let count=0;for(let i=0;i<(idx?.count??a.count);i+=3){for(const[j,k]of['a','b','c'].entries())tri[k].fromBufferAttribute(a,idx?idx.getX(i+j):i+j).applyMatrix4(mat);if(obb.intersectsTriangle(tri))count++;}if(count)hits.push({role:m.userData.role??m.name,triangles:count});}
  const box=new T.Box3().setFromObject(p.frame),w=p.frame.geometry.parameters.width,h=p.frame.geometry.parameters.height,d=p.frame.geometry.parameters.depth;
  const views=[];for(const [name,camera]of[['courtyard',[0,1.7,-25]],['near',[0,2.2,-13]],['left',[-4,2.2,-15]],['right',[4,2.2,-15]],['under-eave',[0,2.2,-10]]]){
   const origin=new T.Vector3(...camera),sample=[];for(let iy=0;iy<5;iy++)for(let ix=0;ix<5;ix++){const v=new T.Vector3(-w/2+.015+(w-.03)*ix/4,-h/2+.015+(h-.03)*iy/4,-d/2-.0001).applyMatrix4(p.frame.matrixWorld),dir=v.clone().sub(origin),dist=dir.length(),ray=new T.Raycaster(origin,dir.normalize(),0,dist-.001),hit=ray.intersectObjects(structural,false)[0];sample.push({grid:[ix,iy],visible:!hit,blocker:hit?.object.userData.role??hit?.object.name??null});}views.push({name,camera,visible:sample.filter(r=>r.visible).length,total:25,blockers:[...new Set(sample.filter(r=>!r.visible).map(r=>r.blocker))]});}
  rows.push({status:'READ_ONLY_MODEL_FIT_PROBE_NOT_ACCEPTED',degrees,face:p.mesh.position.toArray(),frame:p.frame.position.toArray(),bounds:{min:box.min.toArray(),max:box.max.toArray()},hits,views});
 }
 fs.writeFileSync(new URL('./pitch-probes.json',import.meta.url),JSON.stringify(rows,null,2)+'\n');console.log(JSON.stringify(rows,null,2));
}finally{zone.dispose();lib.dispose();}
