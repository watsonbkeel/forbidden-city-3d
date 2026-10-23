// Actual bounded Jingren rear hall. Immutable R61 ZoneBase source + dedicated helper only.
// Flat palette CPU diagnostics, not browser, texture or historical acceptance.
import fs from 'node:fs';
import zlib from 'node:zlib';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {fixture,api,meshes,snapshot,physical,hash,world,dispose} from './lib/r62-jingren-rear-window-fixture.mjs';
import {JINGREN_REAR_WINDOW_VIEWS,assertJingrenRearWindowsInWorld} from './lib/r62-jingren-rear-window-world-check.mjs';
const out='reports/r62-jingren-rear-windows/evidence';fs.mkdirSync(out,{recursive:true});
const files=['src/scene/palace/special/JingrenRearWindows.js','tests/lib/r62-jingren-rear-window-fixture.mjs','tests/lib/r62-jingren-rear-window-world-check.mjs','tests/r62-jingren-rear-window-export-cpu.mjs'];
const proof={baseline:'6b396800b6a03582aebf513fcef4966e9f5d0db3',scope:'ACTUAL_BOUNDED_PRODUCTION_HALL_CPU_TRIANGLES_NOT_BROWSER_ACCEPTANCE',status:'VERIFY_PENDING',sourcePhotos:[{url:'https://img.dpm.org.cn/Uploads/Picture/2020/04/20/s5e9d16b8c46ab.jpg',sha256:'7f20d6d67c50e8cc52599d5327eb682d72a88822891c33d45ea9ab1ab2a7ff8d'},{url:'https://img.dpm.org.cn/Uploads/Picture/2020/04/20/s5e9d16b8c7345.jpg',sha256:'8ef05cc459518b644185a6048077265e923ab9420b88cf205288e1e795791a55'}],photographyDate:null,sourcePhotoRedistributed:false,states:{},cameras:{},sourceHashes:Object.fromEntries(files.map(f=>[f,hash(fs.readFileSync(f,'utf8'))]))};
const palette={wood_column:0x8c2d22,caihua_beam:0x357e80,dougong_band:0x335d62,wall_red:0x89382e,wall_brick:0x827c70,stone_slab:0xb4afa0,marble:0xc4bca5,roof_tile:0xcb9828,rafters:0x82573a,kit_lacquer:0x75251f,kit_plaques:0x172c63,sumeru_band:0xb8ad94,lattice_doors:0x88632e};
for(const [state,candidate]of[['before',false],['after',true]]){
 const f=fixture();if(candidate)assert.equal(api.applyJingrenRearWindows(f.kit,f.frame,f.item),true);proof.states[state]={...snapshot(f),physicalCounts:Object.fromEntries(Object.entries(physical(f.kit)).map(([k,v])=>[k,v.length]))};
 const W=world(f),rows=[];
 for(const m of meshes(W.scene)){
  const a=m.geometry.attributes,ix=m.geometry.index,nm=new THREE.Matrix3().getNormalMatrix(m.matrixWorld),name=m.material.name.replace(/_material$/,''),color=name.startsWith('jingren_')?m.material.color.toArray():new THREE.Color(palette[name]??0x93866d).toArray();
  for(let k=0;k<(ix?.count??a.position.count);k+=3){const ids=[0,1,2].map(j=>ix?ix.getX(k+j):k+j);rows.push({v:ids.map(j=>new THREE.Vector3().fromBufferAttribute(a.position,j).applyMatrix4(m.matrixWorld).toArray()),n:ids.map(j=>new THREE.Vector3().fromBufferAttribute(a.normal,j).applyNormalMatrix(nm).toArray()),c:[color,color,color],side:m.material.side});}
 }
 proof.states[state].merged={triangles:rows.length,meshes:meshes(W.scene).length,geometrySHA256:hash(rows)};
 if(candidate)proof.worldConsumer=assertJingrenRearWindowsInWorld(W);
 for(const v of JINGREN_REAR_WINDOW_VIEWS){const p=a=>new THREE.Vector3(...a).add(f.frame.position),camera=new THREE.PerspectiveCamera(v.fov,960/540,.03,200);camera.position.copy(p(v.eye));camera.lookAt(p(v.target));camera.updateMatrixWorld(true);const data={position:camera.position.toArray(),target:p(v.target).toArray(),fov:v.fov,matrixWorldInverse:camera.matrixWorldInverse.toArray(),localEye:v.eye,localTarget:v.target};if(proof.cameras[v.name])assert.deepEqual(proof.cameras[v.name],data);else proof.cameras[v.name]=data;const label=`jingren-${v.name}-${state}`;fs.writeFileSync(`${out}/${label}.json.gz`,zlib.gzipSync(JSON.stringify({label,camera:data,triangles:rows})));}
 dispose(f);
}
for(const key of['retained','physics'])assert.equal(proof.states.before[key],proof.states.after[key]);proof.delta={triangles:proof.states.after.merged.triangles-proof.states.before.merged.triangles,meshes:proof.states.after.merged.meshes-proof.states.before.merged.meshes};fs.writeFileSync(`${out}/proof.json`,JSON.stringify(proof,null,2)+'\n');console.log(JSON.stringify({delta:proof.delta,retained:proof.states.after.retained,physics:proof.states.after.physics,contacts:proof.worldConsumer.triangleContacts.length},null,2));
