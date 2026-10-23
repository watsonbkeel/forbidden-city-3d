// Actual bounded production gate, before/after the explicit new helper only.
// CPU flat palette diagnostic. No world construction and no source-photo pixels.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import zlib from 'node:zlib';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {fixture,meshes,target,triangles,snapshot,hash,physical,api,dispose} from '../../tests/lib/r59-wenhua-gate-window-fixture.mjs';
import {WENHUA_GATE_WINDOW_VIEWS,assertWenhuaGateSouthWindowInWorld} from '../../tests/lib/r59-wenhua-gate-window-world-check.mjs';
const out='reports/r59-wenhua-gate-window/evidence';fs.mkdirSync(out,{recursive:true});
const files=['src/scene/palace/special/WenhuaGateSouthWindows.js','src/scene/palace/special/SouthCourtGates.js','tests/lib/r59-wenhua-gate-window-fixture.mjs','tests/lib/r59-wenhua-gate-window-world-check.mjs','scripts/r59-wenhua-gate-window/export-cpu.mjs'];
const proof={objectId:'FC-5652FA389B',status:'VERIFY_PENDING',scope:'ACTUAL_ISOLATED_PRODUCTION_GATE_MERGED_TRIANGLES_CPU_ONLY_NOT_BROWSER_OR_VISUAL_ACCEPTANCE',
 baselineHead:'2b983ae82e50e23fd55bbe0845942a0a3855f8dd',captureHead:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
 sourceImage:{url:'https://img.dpm.org.cn/Uploads/Picture/2020/07/03/s5efefc7fb9a3d.jpg',sha256:'16c83fbc77280e5e5057df8bb77e48f345820eb6747f7ce822336e4569a6f6fb',photographyDate:null,redistributed:false},
 states:{},cameras:{},sourceHashes:Object.fromEntries(files.map(f=>[f,createHash('sha256').update(fs.readFileSync(f)).digest('hex')]))};
const palette={wood_column:0x8c2d22,caihua_beam:0x357e80,dougong_band:0x335d62,wall_red:0x89382e,wall_brick:0x827c70,stone_slab:0xb4afa0,marble:0xc4bca5,roof_tile:0xcb9828,rafters:0x82573a,kit_lacquer:0x75251f,kit_plaques:0x172c63,sumeru_band:0xb8ad94};
for(const [state,candidate]of [['before',false],['after',true]]){
 const f=fixture();
 if(!candidate)proof.baselineTarget={position:target(f).position.toArray(),material:target(f).material.name,southSkin:triangles(target(f),(ids,a)=>ids.every(k=>a.normal.getZ(k)<-.999))};
 if(candidate)assert.equal(api.applyWenhuaGateSouthWindows(f.kit,f.frame),true);
 proof.states[state]={...snapshot(f),physicalCounts:Object.fromEntries(Object.entries(physical(f.kit)).map(([k,v])=>[k,v.length]))};
 f.merged=f.kit.finish();f.merged.updateMatrixWorld(true);
 const rows=[];
 for(const m of meshes(f.merged)){
  const a=m.geometry.attributes,ix=m.geometry.index,nm=new THREE.Matrix3().getNormalMatrix(m.matrixWorld),name=m.material.name.replace(/_material$/,''),color=name.startsWith('wenhua_gate_')?m.material.color.toArray():new THREE.Color(palette[name]??0x93866d).toArray();
  for(let k=0;k<(ix?.count??a.position.count);k+=3){const ids=[0,1,2].map(j=>ix?ix.getX(k+j):k+j);rows.push({v:ids.map(j=>new THREE.Vector3().fromBufferAttribute(a.position,j).applyMatrix4(m.matrixWorld).toArray()),n:ids.map(j=>new THREE.Vector3().fromBufferAttribute(a.normal,j).applyNormalMatrix(nm).toArray()),c:[color,color,color],side:m.material.side});}
 }
 proof.states[state].merged={triangles:rows.length,meshes:meshes(f.merged).length,geometrySHA256:hash(rows)};
 if(candidate)proof.pureWorldConsumer=assertWenhuaGateSouthWindowInWorld({scene:f.merged,cm:f.cm});
 for(const v of WENHUA_GATE_WINDOW_VIEWS){
  const world=p=>new THREE.Vector3(...p).add(f.frame.position),camera=new THREE.PerspectiveCamera(v.fov,960/540,.03,200);camera.position.copy(world(v.eye));camera.lookAt(world(v.target));camera.updateMatrixWorld(true);
  const data={position:camera.position.toArray(),target:world(v.target).toArray(),fov:v.fov,matrixWorldInverse:camera.matrixWorldInverse.toArray(),localEye:v.eye,localTarget:v.target};
  if(proof.cameras[v.name])assert.deepEqual(proof.cameras[v.name],data);else proof.cameras[v.name]=data;
  const label=`wenhua-${v.name}-${state}`;fs.writeFileSync(`${out}/${label}.json.gz`,zlib.gzipSync(JSON.stringify({label,kind:proof.scope,camera:data,triangles:rows})));
 }
 dispose(f);
}
for(const key of ['nonTarget','otherFiveFaces','physics'])assert.equal(proof.states.before[key],proof.states.after[key],key+' must stay exact');
proof.delta={triangles:proof.states.after.merged.triangles-proof.states.before.merged.triangles,mergedMeshes:proof.states.after.merged.meshes-proof.states.before.merged.meshes};
fs.writeFileSync(`${out}/proof.json`,JSON.stringify(proof,null,2)+'\n');console.log(JSON.stringify({delta:proof.delta,retainedHashes:Object.fromEntries(['nonTarget','otherFiveFaces','physics'].map(k=>[k,proof.states.after[k]])),baselineSouthTriangles:proof.baselineTarget.southSkin.length,consumer:proof.pureWorldConsumer},null,2));
