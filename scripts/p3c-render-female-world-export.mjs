import fs from 'node:fs';
import crypto from 'node:crypto';
import * as THREE from 'three';
import {buildCharacterWorld} from '../tests/p3c-world-fixture.mjs';
import {CHARACTER_REGISTRY} from '../data/characters/index.js';
import {createCharacterGeometry} from '../src/scene/characters/CharacterKit.js';
const out=process.env.P3C_FEMALE_OUT||'reports/r50-followup/female-samples';fs.mkdirSync(out,{recursive:true});
if(fs.existsSync(`${out}/manifest.json`)){
 const original=JSON.parse(fs.readFileSync(`${out}/manifest.json`));
 for(const entry of original.unchangedProductionSources??[])if(crypto.createHash('sha256').update(fs.readFileSync(entry.path)).digest('hex')!==entry.sha256)throw new Error('Preserved pre-refinement evidence: use P3C_FEMALE_OUT with a fresh output directory after source changes.');
}
const W=await buildCharacterWorld();W.scene.updateMatrixWorld(true);
const seatActors=CHARACTER_REGISTRY.actors.filter(a=>a.placement.mode==='seat' && a.templateId==='consort-daily');
const models=[],bindings=[];
function visible(o){for(let p=o;p;p=p.parent)if(!p.visible)return false;return !o.name?.startsWith('COL_')&&!o.name?.startsWith('WALK_');}
function meshData(g,matrix,materials,crop=null){
 const p=g.attributes.position;if(!p)return null;if(!g.attributes.normal)g.computeVertexNormals();
 const n=g.attributes.normal,col=g.attributes.color,normalMatrix=new THREE.Matrix3().getNormalMatrix(matrix),indices=g.index?.array??Array.from({length:p.count},(_,i)=>i),groups=g.groups;
 const ps=Array.from({length:p.count},(_,i)=>new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(matrix)),ns=Array.from({length:p.count},(_,i)=>new THREE.Vector3().fromBufferAttribute(n,i).applyMatrix3(normalMatrix).normalize());
 const positions=[],normals=[],colors=[],outIndices=[];
 for(let ti=0;ti<indices.length;ti+=3){const a=ps[indices[ti]],b=ps[indices[ti+1]],c=ps[indices[ti+2]];if(crop){const bb=new THREE.Box3().setFromPoints([a,b,c]);if(!bb.intersectsBox(crop))continue;}
 const group=groups.find(g=>ti>=g.start&&ti<g.start+g.count),mat=Array.isArray(materials)?materials[group?.materialIndex??0]:materials;
 if(mat?.visible===false||mat?.opacity<.1)continue;
 const baseColor=mat?.color??new THREE.Color(0x9e927e);
 for(let k=0;k<3;k++){const vi=indices[ti+k],pp=ps[vi],nn=ns[vi],cc=baseColor.clone();if(col&&mat?.vertexColors)cc.multiply(new THREE.Color().fromBufferAttribute(col,vi));outIndices.push(positions.length/3);positions.push(pp.x,pp.y,pp.z);normals.push(nn.x,nn.y,nn.z);colors.push(cc.r,cc.g,cc.b);}
 }
 return outIndices.length?{positions,normals,colors,indices:outIndices}:null;
}
for(const actor of seatActors){
 const g=createCharacterGeometry(actor.templateId,'seated',0,{seatVariant:actor.behavior.seatVariant});
 const binding=W.adapter.resolve(actor,g.userData);if(binding.status!=='ready')throw new Error(`${actor.id}: ${binding.status}: ${binding.reason}`);
 const actorMatrix=new THREE.Matrix4().compose(new THREE.Vector3(...binding.position),new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),binding.rotationYRad),new THREE.Vector3(1,1,1)),inverse=actorMatrix.clone().invert();
 const crop=new THREE.Box3(new THREE.Vector3(-1.65,-.25,-1.25),new THREE.Vector3(1.65,2.65,1.50));
 const fixtures=[],sources=[];
 W.scene.traverse(o=>{
  if(!o.isMesh||!visible(o))return;
  const matrices=[];if(o.isInstancedMesh){for(let i=0;i<o.count;i++){const im=new THREE.Matrix4();o.getMatrixAt(i,im);matrices.push(new THREE.Matrix4().multiplyMatrices(o.matrixWorld,im));}}
  else matrices.push(o.matrixWorld);
  o.geometry.computeBoundingBox();
  for(let ii=0;ii<matrices.length;ii++){
   const m=new THREE.Matrix4().multiplyMatrices(inverse,matrices[ii]);const bb=o.geometry.boundingBox.clone().applyMatrix4(m);if(!bb.intersectsBox(crop))continue;
   const data=meshData(o.geometry,m,o.material,crop);if(data){fixtures.push(data);sources.push({meshName:o.name,instance:o.isInstancedMesh?ii:null,material:Array.isArray(o.material)?o.material.map(m=>m.name):o.material?.name,triangles:data.indices.length/3,sourceBoundsLocal:{min:bb.min.toArray(),max:bb.max.toArray()}});}
  }
 });
 const mesh=meshData(g,new THREE.Matrix4(),new THREE.MeshBasicMaterial({vertexColors:true,color:0xffffff}));
 models.push({id:actor.id,pose:actor.id.startsWith('taihe')?'TAIHE / ACTUAL THRONE':'CHUXIU / ACTUAL KANG',mesh,fixtures,metadata:{actor,binding,kit:g.userData,cropBox:{min:crop.min.toArray(),max:crop.max.toArray()},sources}});
 bindings.push({actorId:actor.id,binding,kit:g.userData,sourceMeshCount:fixtures.length,sourceTriangles:sources.reduce((n,s)=>n+s.triangles,0)});
}
const hashes=Object.fromEntries(['src/scene/characters/CharacterKit.js','src/scene/palace/special/TaiheCore.js','src/scene/palace/special/ChuxiuHall.js','data/characters/seats.json'].map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')]));
fs.writeFileSync(`${out}/world-seat-models.json`,JSON.stringify({evidence:'Actual current palace scene triangles and adapter-resolved actors; locally cropped; material colors only; CPU lighting/shadows not runtime proof',hashes,models}));
fs.writeFileSync(`${out}/world-seat-bindings.json`,JSON.stringify({evidence:'Actual mesh CPU placement inspection',hashes,bindings},null,2));
console.log(JSON.stringify(bindings.map(b=>({actor:b.actorId,root:b.binding.position,rotationYRad:b.binding.rotationYRad,meshes:b.sourceMeshCount,triangles:b.sourceTriangles,pose:b.kit.seatVariant})),null,2));
