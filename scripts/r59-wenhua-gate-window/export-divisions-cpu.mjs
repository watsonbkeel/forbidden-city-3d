// One same-camera pair for the successor only. No world or source-photo pixels.
import fs from 'node:fs';
import zlib from 'node:zlib';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {fixture,meshes,snapshot,hash,physical,dispose} from '../../tests/lib/r59-wenhua-gate-window-fixture.mjs';
import {coarseFixture,retainedCoarseHash} from '../../tests/lib/r59-wenhua-gate-divisions-fixture.mjs';
const out='reports/r59-wenhua-gate-divisions/evidence';fs.mkdirSync(out,{recursive:true});
const files=['src/scene/palace/special/WenhuaGateSouthWindows.js','tests/r59-wenhua-gate-divisions.test.mjs','tests/lib/r59-wenhua-gate-divisions-fixture.mjs','scripts/r59-wenhua-gate-window/export-divisions-cpu.mjs'];
const proof={objectId:'FC-5652FA389B',status:'VERIFY_PENDING',accepted:false,kind:'ACTUAL_BOUNDED_GATE_CPU_NOT_BROWSER_ACCEPTANCE',
 beforeFixture:JSON.parse(fs.readFileSync('tests/fixtures/r59-wenhua-gate-window/coarse-provenance.json')),sourceHashes:Object.fromEntries(files.map(p=>[p,hash(fs.readFileSync(p,'utf8'))])),
 sourceImage:{url:'https://img.dpm.org.cn/Uploads/Picture/2020/07/03/s5efefc7fb9a3d.jpg',sha256:'16c83fbc77280e5e5057df8bb77e48f345820eb6747f7ce822336e4569a6f6fb',photographyDate:null,redistributed:false},states:{}};
const palette={wood_column:0x8c2d22,caihua_beam:0x357e80,dougong_band:0x335d62,wall_red:0x89382e,wall_brick:0x827c70,stone_slab:0xb4afa0,marble:0xc4bca5,roof_tile:0xcb9828,rafters:0x82573a,kit_lacquer:0x75251f,kit_plaques:0x172c63,sumeru_band:0xb8ad94};
for(const state of ['before','after']){
 const f=state==='before'?coarseFixture():fixture('wenhua',true);
 proof.states[state]={...snapshot(f),retainedCoarse:retainedCoarseHash(f),physicalCounts:Object.fromEntries(Object.entries(physical(f.kit)).map(([k,v])=>[k,v.length]))};
 if(state==='after')proof.fit=f.g.wenhuaSouthWindow.majorDivisions;
 f.merged=f.kit.finish();f.merged.updateMatrixWorld(true);const rows=[];
 for(const m of meshes(f.merged)){
  const a=m.geometry.attributes,ix=m.geometry.index,nm=new THREE.Matrix3().getNormalMatrix(m.matrixWorld),name=m.material.name.replace(/_material$/,''),color=name.startsWith('wenhua_gate_')?m.material.color.toArray():new THREE.Color(palette[name]??0x93866d).toArray();
  for(let k=0;k<(ix?.count??a.position.count);k+=3){const ids=[0,1,2].map(j=>ix?ix.getX(k+j):k+j);rows.push({v:ids.map(j=>new THREE.Vector3().fromBufferAttribute(a.position,j).applyMatrix4(m.matrixWorld).toArray()),n:ids.map(j=>new THREE.Vector3().fromBufferAttribute(a.normal,j).applyNormalMatrix(nm).toArray()),c:[color,color,color],side:m.material.side});}
 }
 proof.states[state].merged={triangles:rows.length,meshes:meshes(f.merged).length,geometrySHA256:hash(rows)};
 const eye=[-13.24,4,-12],target=[-13.24,3.8,0],world=p=>new THREE.Vector3(...p).add(f.frame.position),c=new THREE.PerspectiveCamera(38,960/540,.03,200);c.position.copy(world(eye));c.lookAt(world(target));c.updateMatrixWorld(true);
 const camera={position:c.position.toArray(),target:world(target).toArray(),fov:38,matrixWorldInverse:c.matrixWorldInverse.toArray(),localEye:eye,localTarget:target};
 if(proof.camera)assert.deepEqual(camera,proof.camera);else proof.camera=camera;
 const label=`wenhua-major-divisions-close-${state}`;fs.writeFileSync(`${out}/${label}.json.gz`,zlib.gzipSync(JSON.stringify({label,kind:proof.kind,camera,triangles:rows})));dispose(f);
}
for(const k of ['nonTarget','otherFiveFaces','physics','retainedCoarse'])assert.equal(proof.states.before[k],proof.states.after[k],k);
proof.delta={triangles:proof.states.after.triangles-proof.states.before.triangles,meshes:proof.states.after.meshes-proof.states.before.meshes,mergedMeshes:proof.states.after.merged.meshes-proof.states.before.merged.meshes};
fs.writeFileSync(`${out}/proof.json`,JSON.stringify(proof,null,2)+'\n');console.log(JSON.stringify(proof,null,2));
