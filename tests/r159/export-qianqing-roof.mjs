// Actual production roof buffers; lightweight CPU geometry diagnostic only.
// Usage: node tests/r159/export-qianqing-roof.mjs <external-evidence-directory>
import fs from 'node:fs';
import path from 'node:path';
import {gzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import * as T from 'three';
import {buildRoof} from '../../src/scene/RoofBuilder.js';
import {library,release,triangles as triangleCount} from '../lib/r58-hall-beast-fixture.mjs';
const out=path.resolve(process.argv[2]);fs.mkdirSync(out,{recursive:true});
const sourceHash=Object.fromEntries(['src/scene/RoofBuilder.js','src/scene/palace/special/HallWalkingBeasts.js','src/scene/palace/special/QianqingWalkingBeasts.js','src/scene/palace/special/QianqingBeastSeat.js'].map(p=>[p,createHash('sha256').update(fs.readFileSync(p)).digest('hex')]));
const costs=[];
for(const mode of['before','candidate']){
  const roof=buildRoof(library(),{type:'wudian',width:46.6,depth:25.6,layers:2,baseY:9.38,brackets:true,sides:4,...(mode==='candidate'?{walkingBeastProfile:'qianqing'}:{})});
  roof.updateMatrixWorld(true);const rows=[];let bytes=0;
  roof.traverse(m=>{if(!m.isMesh)return;const g=m.geometry,p=g.attributes.position,n=g.attributes.normal,ix=g.index,nm=new T.Matrix3().getNormalMatrix(m.matrixWorld);
    bytes+=Object.values(g.attributes).reduce((s,a)=>s+a.array.byteLength,0)+(g.index?.array.byteLength??0);
    for(let i=0;i<(ix?.count??p.count);i+=3){const ids=[0,1,2].map(k=>ix?.getX(i+k)??i+k);rows.push({v:ids.map(j=>new T.Vector3().fromBufferAttribute(p,j).applyMatrix4(m.matrixWorld).toArray()),n:ids.map(j=>new T.Vector3().fromBufferAttribute(n,j).applyMatrix3(nm).normalize().toArray()),c:ids.map(()=>m.material.color.toArray()),side:m.material.side,character:false});}
  });
  costs.push({mode,triangles:triangleCount(roof),meshes:roof.children.length,attributeBytes:bytes,sourceHash});
  const camera=new T.PerspectiveCamera(45,960/540,.03,200);camera.position.set(-41,18,-20);camera.lookAt(-22,14,-10);camera.updateMatrixWorld(true);
  fs.writeFileSync(path.join(out,mode+'.json.gz'),gzipSync(JSON.stringify({label:'Qianqing '+mode+' SW roof-count diagnostic',diagnosticSize:[960,540],camera:{position:camera.position.toArray(),matrixWorldInverse:camera.matrixWorldInverse.toArray(),fov:45},triangles:rows,sourceCharacterInstances:0})));
  release(roof);
}
fs.writeFileSync(path.join(out,'cost.json'),JSON.stringify(costs,null,2)+'\n');
