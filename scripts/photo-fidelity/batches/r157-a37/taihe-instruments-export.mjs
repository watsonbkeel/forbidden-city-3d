// Actual unmerged source geometry, not a GPU screenshot. No source photos or
// downloaded pixels are used. Camera / old object placement is frozen per pair.
import fs from 'node:fs';import path from 'node:path';import zlib from 'node:zlib';import * as T from 'three';
import {PalaceBuilder} from '../../../../src/scene/PalaceBuilder.js';
import {library} from '../../../../tests/lib/inner-palace-fixture.mjs';
import {historicalTerraceOrnaments} from '../../../../tests/lib/r157-taihe-integration-retention.mjs';
import {buildTaiheTerraceInstruments} from '../../../../src/scene/palace/special/TaiheTerraceInstruments.js';
const out=process.argv[2];if(!out)throw Error('explicit private evidence output directory required');fs.mkdirSync(out,{recursive:true});
const b=new PalaceBuilder(new T.Scene(),library()),old=new T.Group(),next=new T.Group(),y=8,zf=-40.06666666666666,z=zf+1;
historicalTerraceOrnaments.call(b,old,{hw:54.06666666666666,z0:zf-3},y);const current=buildTaiheTerraceInstruments(b,next,{y,zf});
for(const[kind,x]of[['sundial',-17],['jialiang',17]])for(const[view,eye]of[['front',[x,y+1.7,z-6]],['quarter',[x+4,y+3.3,z-5]],['rear',[x-4,y+3.3,z+5]]]){
 const camera=new T.PerspectiveCamera(40,960/540,.03,100);camera.position.set(...eye);camera.lookAt(x,y+1.45,z);camera.updateMatrixWorld(true);
 for(const[stage,meshes]of[['before',old.children.filter(m=>m.position.x===x)],['candidate',current.children.filter(m=>m.userData.instrument===kind)]]){
  const triangles=[];for(const m of meshes){m.updateMatrixWorld(true);const g=m.geometry,p=g.attributes.position,n=g.attributes.normal,ix=g.index,normalMatrix=new T.Matrix3().getNormalMatrix(m.matrixWorld),color=m.material.name==='marble'?[.58,.56,.51]:[.17,.14,.095];
   for(let i=0;i<(ix?.count??p.count);i+=3){const ids=[0,1,2].map(k=>ix?ix.getX(i+k):i+k);triangles.push({v:ids.map(k=>new T.Vector3().fromBufferAttribute(p,k).applyMatrix4(m.matrixWorld).toArray()),n:ids.map(k=>new T.Vector3().fromBufferAttribute(n,k).applyMatrix3(normalMatrix).normalize().toArray()),c:[color,color,color],side:0,character:false});}
  }
  const data={kind:'CPU_ONLY_UNTEXTURED_INSTRUMENT_GEOMETRY_NOT_GPU_OR_HISTORICAL_ACCEPTANCE',camera:{position:camera.position.toArray(),matrixWorldInverse:camera.matrixWorldInverse.toArray(),fov:40},triangles,sourceCharacterInstances:0};
  fs.writeFileSync(path.join(out,`${kind}-${view}-${stage}.json.gz`),zlib.gzipSync(JSON.stringify(data)));
 }
}
old.traverse(m=>m.geometry?.dispose());next.traverse(m=>m.geometry?.dispose());b.dispose();
