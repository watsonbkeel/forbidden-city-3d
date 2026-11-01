// Bounded actual production gate, with the exact proposed shared hooks loaded
// only by the test fixture. Same-camera flat-category CPU evidence, NOT GPU.
import fs from 'node:fs';
import path from 'node:path';
import {gzipSync} from 'node:zlib';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {fixture,world,dispose,meshes,hash,THREE} from '../../../../tests/photo-fidelity/batches/r158-wenhua-gate/fixture.mjs';
const out=path.resolve(process.argv[2]??'../r158-wenhua-gate-evidence/cpu');fs.mkdirSync(out,{recursive:true});
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const views=[['south-whole',[0,6,-34],[0,3.8,0],55],['north-whole',[0,7,36],[0,3.3,1],55],['south-approach',[11,7,-21],[0,1,-10],55],['north-approach',[16,11,28],[0,.8,12],58]];
const colors={wood_column:0x8c2d22,caihua_beam:0x357e80,dougong_band:0x335d62,wall_red:0x89382e,wall_brick:0x827c70,stone_slab:0xb4afa0,marble:0xc4bca5,roof_tile:0xcb9828,rafters:0x82573a,kit_lacquer:0x75251f,kit_plaques:0x172c63,sumeru_band:0xb8ad94,ground_brick:0x77746b};
const proof={kind:'ISOLATED_REAL_PRODUCTION_GATE_SAME_CAMERA_CPU_FLAT_CATEGORY_ONLY_NOT_GPU',parent:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),sourceHashes:Object.fromEntries(['src/scene/palace/special/WenhuaGateApproaches.js','src/controls/WenhuaGateApproachSupport.js','src/scene/palace/special/SouthCourtGates.js','src/controls/XiqingRoofSurface.js','src/controls/FurnitureMotion.js'].map(p=>[p,sha(fs.readFileSync(p))])),views,states:[],captures:[]};
for(const candidate of[false,true]){
 const f=fixture(candidate),mode=candidate?'candidate':'parent';world(f,true);const rows=[];
 for(const m of meshes(f.scene)){const p=m.geometry.attributes.position,n=m.geometry.attributes.normal,ix=m.geometry.index,nm=new THREE.Matrix3().getNormalMatrix(m.matrixWorld),name=m.material.name.replace(/_material$/,''),color=new THREE.Color(colors[name]??0x93866d).toArray();
  for(let k=0;k<(ix?.count??p.count);k+=3){const ids=[0,1,2].map(i=>ix?ix.getX(k+i):k+i);rows.push({v:ids.map(i=>new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(m.matrixWorld).toArray()),n:ids.map(i=>new THREE.Vector3().fromBufferAttribute(n,i).applyNormalMatrix(nm).toArray()),c:[color,color,color],side:m.material.side,character:false});}
 }
 proof.states.push({mode,triangles:rows.length,mergedMeshes:meshes(f.scene).length,colliders:f.kit.colliders.length,walkables:f.kit.walkables.length,geometryHash:hash(rows),meta:f.g.wenhuaGateApproaches??null});
 for(const[name,eye,target,fov]of views){const camera=new THREE.PerspectiveCamera(fov,960/540,.03,150);camera.position.set(f.g.x+eye[0],eye[1],f.g.z+eye[2]);camera.lookAt(f.g.x+target[0],target[1],f.g.z+target[2]);camera.updateMatrixWorld(true);const label=`wenhua-gate-${mode}-${name}`,file=path.join(out,label+'.json.gz');const data={kind:proof.kind,label,diagnosticSize:[960,540],sourceCharacterInstances:0,camera:{position:camera.position.toArray(),matrixWorldInverse:camera.matrixWorldInverse.toArray(),fov,localEye:eye,localTarget:target},triangles:rows};fs.writeFileSync(file,gzipSync(JSON.stringify(data)));const png=file.replace('.json.gz','.png');execFileSync('python',['scripts/r101-plaque/render-cpu.py',file,png],{stdio:'pipe'});proof.captures.push({mode,view:name,file:path.basename(file),png:path.basename(png),camera:data.camera,sha256:sha(fs.readFileSync(png))});}
 dispose(f);
}
fs.writeFileSync(path.join(out,'CPU-PROOF.json'),JSON.stringify(proof,null,2)+'\n');console.log(JSON.stringify(proof.states));
