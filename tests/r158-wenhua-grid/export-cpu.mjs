import fs from 'node:fs';import zlib from 'node:zlib';import * as T from 'three';
import {built,meshes,snapshot,dispose,hash} from './fixture.mjs';
const out=process.env.EVIDENCE_OUT;fs.mkdirSync(out,{recursive:true});const proof={};
const palette={wood_column:0x8c2d22,caihua_beam:0x357e80,dougong_band:0x335d62,wall_red:0x89382e,wall_brick:0x827c70,stone_slab:0xb4afa0,marble:0xc4bca5,roof_tile:0xcb9828,rafters:0x82573a,kit_lacquer:0x75251f,kit_plaques:0x172c63,sumeru_band:0xb8ad94};
for(const state of ['before','after']){
 const f=built(state);proof[state]=snapshot(f);f.merged=f.kit.finish();f.merged.updateMatrixWorld(true);const rows=[];
 for(const m of meshes(f.merged)){const a=m.geometry.attributes,ix=m.geometry.index,nm=new T.Matrix3().getNormalMatrix(m.matrixWorld),name=m.material.name.replace(/_material$/,''),color=name.startsWith('wenhua_gate_')?m.material.color.toArray():new T.Color(palette[name]??0x93866d).toArray();
 for(let k=0;k<(ix?.count??a.position.count);k+=3){const ids=[0,1,2].map(j=>ix?ix.getX(k+j):k+j);rows.push({v:ids.map(j=>new T.Vector3().fromBufferAttribute(a.position,j).applyMatrix4(m.matrixWorld).toArray()),n:ids.map(j=>new T.Vector3().fromBufferAttribute(a.normal,j).applyNormalMatrix(nm).toArray()),c:[color,color,color],side:m.material.side});}}
 for(const [view,eye,target,fov]of [['close',[-13.24,4,-12],[-13.24,3.8,0],38],['whole',[0,8,-50],[0,4,0],42]]){
 const world=p=>new T.Vector3(...p).add(f.frame.position),c=new T.PerspectiveCamera(fov,960/540,.03,200);c.position.copy(world(eye));c.lookAt(world(target));c.updateMatrixWorld(true);const camera={position:c.position.toArray(),target:world(target).toArray(),fov,matrixWorldInverse:c.matrixWorldInverse.toArray()};
 fs.writeFileSync(`${out}/${view}-${state}.json.gz`,zlib.gzipSync(JSON.stringify({label:`WENHUA FINE GRID ${view} ${state}`,camera,triangles:rows})));}
 proof[state].mergedTriangles=rows.length;proof[state].mergedSHA=hash(rows);dispose(f);
}fs.writeFileSync(`${out}/proof.json`,JSON.stringify(proof,null,2));console.log(proof);
