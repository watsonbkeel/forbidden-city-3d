// Actual bounded production halls, immutable f87342d source + helper only.
// CPU triangle diagnostics, not browser rendering or historical acceptance.
import fs from 'node:fs';
import zlib from 'node:zlib';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {fixture,api,meshes,snapshot,physical,hash,world,dispose} from '../../tests/lib/r63-west-rear-south-window-fixture.mjs';
import {WEST_REAR_SOUTH_WINDOW_VIEWS,assertWestRearSouthWindowsInWorld} from '../../tests/lib/r63-west-rear-windows-world-check.mjs';
const out='reports/r63-west-rear-south-windows/evidence';fs.mkdirSync(out,{recursive:true});
const files=['src/scene/palace/special/WestRearSouthWindows.js','tests/lib/r63-west-rear-south-window-fixture.mjs','tests/lib/r63-west-rear-windows-world-check.mjs','scripts/r63-west-rear-south-windows/export-cpu.mjs'];
const proof={baseline:'f87342d7e1506713df4a6877943eb377e8299593',scope:'ACTUAL_BOUNDED_PRODUCTION_HALLS_CPU_TRIANGLES_NOT_BROWSER_ACCEPTANCE',status:'VERIFY_PENDING',sourcePhotos:[{url:'https://img.dpm.org.cn/Uploads/Picture/dc/18015%5B1024%5D.jpg',sha256:'c7e93e5dc4f186007c74d2f65a1cf5b3de4743c4f099e6ddda1a037218dda090'},{url:'https://img.dpm.org.cn/Uploads/Picture/dc/18008%5B1024%5D.jpg',sha256:'0fc63393392cd835e23399eca305affb73eedd16ce38ce36fc62314e767ebc74'}],photographyDate:null,sourcePhotoRedistributed:false,targets:{},sourceHashes:Object.fromEntries(files.map(f=>[f,hash(fs.readFileSync(f,'utf8'))]))};
const palette={wood_column:0x8c2d22,caihua_beam:0x357e80,dougong_band:0x335d62,wall_red:0x89382e,wall_brick:0x827c70,stone_slab:0xb4afa0,marble:0xc4bca5,roof_tile:0xcb9828,rafters:0x82573a,kit_lacquer:0x75251f,kit_plaques:0x172c63,sumeru_band:0xb8ad94,lattice_doors:0x88632e};
for(const index of[24,47]){
 const target=proof.targets[index]={states:{},cameras:{}};
 for(const[state,candidate]of[['before',false],['after',true]]){
  const f=fixture(index);target.name=f.item.rearHallProfile;if(candidate)assert.equal(api.applyWestRearSouthWindows(f.kit,f.frame,f.item,index),true);f.frame.updateMatrixWorld(true);
  target.states[state]={...snapshot(f),physicalCounts:Object.fromEntries(Object.entries(physical(f.kit)).map(([k,v])=>[k,v.length]))};
  const W=world(f),rows=[];
  for(const m of meshes(W.scene)){
   const a=m.geometry.attributes,ix=m.geometry.index,nm=new THREE.Matrix3().getNormalMatrix(m.matrixWorld),name=m.material.name.replace(/_material$/,''),color=name.startsWith('west_rear_')?m.material.color.toArray():new THREE.Color(palette[name]??0x93866d).toArray();
   for(let k=0;k<(ix?.count??a.position.count);k+=3){const ids=[0,1,2].map(j=>ix?ix.getX(k+j):k+j);rows.push({v:ids.map(j=>new THREE.Vector3().fromBufferAttribute(a.position,j).applyMatrix4(m.matrixWorld).toArray()),n:ids.map(j=>new THREE.Vector3().fromBufferAttribute(a.normal,j).applyNormalMatrix(nm).toArray()),c:[color,color,color],side:m.material.side});}
  }
  target.states[state].merged={triangles:rows.length,meshes:meshes(W.scene).length,geometrySHA256:hash(rows)};
  if(candidate)target.worldConsumer=assertWestRearSouthWindowsInWorld(W,index);
  for(const v of WEST_REAR_SOUTH_WINDOW_VIEWS){
   const p=a=>new THREE.Vector3(...a).add(f.frame.position),camera=new THREE.PerspectiveCamera(v.fov,960/540,.03,200);camera.position.copy(p(v.eye));camera.lookAt(p(v.target));camera.updateMatrixWorld(true);
   const data={position:camera.position.toArray(),target:p(v.target).toArray(),fov:v.fov,matrixWorldInverse:camera.matrixWorldInverse.toArray(),localEye:v.eye,localTarget:v.target};
   if(target.cameras[v.name])assert.deepEqual(target.cameras[v.name],data);else target.cameras[v.name]=data;
   const label=`${target.name}-${v.name}-${state}`;fs.writeFileSync(`${out}/${label}.json.gz`,zlib.gzipSync(JSON.stringify({label,camera:data,triangles:rows})));
  }
  dispose(f);
 }
 for(const key of['retained','physics'])assert.equal(target.states.before[key],target.states.after[key]);
 target.delta={triangles:target.states.after.merged.triangles-target.states.before.merged.triangles,meshes:target.states.after.merged.meshes-target.states.before.merged.meshes};
}
fs.writeFileSync(`${out}/proof.json`,JSON.stringify(proof,null,2)+'\n');console.log(JSON.stringify(Object.fromEntries(Object.entries(proof.targets).map(([i,t])=>[i,{delta:t.delta,retained:t.states.after.retained,physics:t.states.after.physics,contacts:t.worldConsumer.triangleContacts.length}])),null,2));
