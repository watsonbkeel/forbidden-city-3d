// Same actual bounded builder/actual S, unchanged camera and palette per pair.
// Before excludes only the 60 new stool faces, after exact retained-byte check.
import fs from 'node:fs';
import zlib from 'node:zlib';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {fixture,snapshot,meshes,dispose,loadS,item,prefix,hash} from '../../tests/lib/r63-qinzheng-footstool-fixture.mjs';
import {QINZHENG_FOOTSTOOL_VIEWS,assertQinzhengFootstoolInWorld} from '../../tests/lib/r63-qinzheng-footstool-world-check.mjs';
const out='reports/r63-qinzheng-footstool/evidence';fs.mkdirSync(out,{recursive:true});
const baseline=JSON.parse(fs.readFileSync('tests/fixtures/r63-qinzheng-footstool-baseline.json'));
const proof={scope:'BOUNDED_ACTUAL_B_AND_ACTUAL_DECODED_S_CPU_DIAGNOSTICS_NOT_BROWSER_ACCEPTANCE',baseline:baseline.baseline,photo:'https://img.dpm.org.cn/Uploads/image/2026/04/30/2-stivNCrFc313.jpg',photographyDate:null,sourcePhotoRedistributed:false,beforeMethod:'Only added R63 stool triangles excluded; all remaining builder geometry/material/collision/support hashes equal the recorded pre-hook baseline.',states:{},cameras:{},views:[]};
const palette={wood_column:0x8c2d22,caihua_beam:0x357e80,dougong_band:0x335d62,wall_red:0x89382e,wall_brick:0x827c70,stone_slab:0xb4afa0,marble:0xc4bca5,roof_tile:0xcb9828,rafters:0x82573a,kit_lacquer:0x75251f,kit_plaques:0x172c63,sumeru_band:0xb8ad94,lattice_doors:0x88632e,kit_floor_flat:0x403d36};
for(const layer of['B','S']){
 const w=fixture();assert.deepEqual(snapshot(w),baseline.retained);if(layer==='S')await loadS(w);proof.states[layer]={retained:snapshot(w),all:snapshot(w,{retained:false}),consumer:assertQinzhengFootstoolInWorld(w,{layer})};
 const all=[];
 for(const m of meshes(w.scene)){if(!m.visible||!m.material||/^(COL_|WALK_)/.test(m.name))continue;let hidden=false;for(let p=m.parent;p;p=p.parent)if(!p.visible)hidden=true;if(hidden)continue;const a=m.geometry.attributes,ix=m.geometry.index,nm=new THREE.Matrix3().getNormalMatrix(m.matrixWorld),name=m.material.name,owned=name.startsWith('r53-')||name.startsWith('r63-'),color=owned||layer==='S'&&!Object.hasOwn(palette,name)?m.material.color.toArray():new THREE.Color(palette[name]??0x93866d).toArray();
  for(let k=0;k<(ix?.count??a.position.count);k+=3){const ids=[0,1,2].map(j=>ix?ix.getX(k+j):k+j);all.push({v:ids.map(j=>new THREE.Vector3().fromBufferAttribute(a.position,j).applyMatrix4(m.matrixWorld).toArray()),n:ids.map(j=>new THREE.Vector3().fromBufferAttribute(a.normal,j).applyNormalMatrix(nm).toArray()),c:[color,color,color],side:m.material.side,stool:m.userData.role?.startsWith(prefix)??false});}
 }
 for(const state of['before','after']){const triangles=state==='before'?all.filter(t=>!t.stool):all;for(const v of QINZHENG_FOOTSTOOL_VIEWS){const p=a=>new THREE.Vector3(...a).add(new THREE.Vector3(item.x,0,item.z)),camera=new THREE.PerspectiveCamera(v.fov,960/540,.03,200);camera.position.copy(p(v.eye));camera.lookAt(p(v.target));camera.updateMatrixWorld(true);const data={position:camera.position.toArray(),target:p(v.target).toArray(),fov:v.fov,matrixWorldInverse:camera.matrixWorldInverse.toArray(),localEye:v.eye,localTarget:v.target};if(proof.cameras[v.name])assert.deepEqual(proof.cameras[v.name],data);else proof.cameras[v.name]=data;const label=`qinzheng-${layer}-${v.name}-${state}`;fs.writeFileSync(`${out}/${label}.json.gz`,zlib.gzipSync(JSON.stringify({label,camera:data,triangles})));proof.views.push({label,triangles:triangles.length,geometrySHA256:hash(triangles)});}}
 dispose(w);
}
proof.delta={meshes:5,triangles:60,colliders:5,nonRescueSupports:1};fs.writeFileSync(`${out}/proof.json`,JSON.stringify(proof,null,2)+'\n');console.log(JSON.stringify(proof.states,null,2));
