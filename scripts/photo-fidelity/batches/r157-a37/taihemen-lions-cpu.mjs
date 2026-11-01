// Component geometry diagnostic only. Not a browser, GPU or current-site survey.
import fs from 'node:fs';import {gzipSync} from 'node:zlib';import {execFileSync} from 'node:child_process';import * as T from 'three';
import {PalaceBuilder} from '../../../../src/scene/PalaceBuilder.js';
import {library} from '../../../../tests/lib/inner-palace-fixture.mjs';
import {TAIHEMEN_BRONZE_LIONS,buildTaihemenBronzeLions} from '../../../../src/scene/palace/TaihemenBronzeLions.js';
const out=process.argv[2];if(!out)throw Error('Usage: node taihemen-lions-cpu.mjs EXTERNAL_EVIDENCE_DIRECTORY');fs.mkdirSync(out,{recursive:true});
const scene=new T.Scene(),lib=library(),builder=new PalaceBuilder(scene,lib),root=new T.Group();root.name='太和门';builder.addObject(root);lib.material('marble').color.set(0xc8c4b5);buildTaihemenBronzeLions(builder,root);scene.updateMatrixWorld(true);
try{const costs=[];
for(const p of TAIHEMEN_BRONZE_LIONS){const lion=root.getObjectByName(p.id),triangles=[];
 lion.traverse(m=>{if(!m.isMesh)return;const g=m.geometry,a=g.attributes.position,n=g.attributes.normal,ix=g.index,nm=new T.Matrix3().getNormalMatrix(m.matrixWorld);for(let i=0;i<(ix?.count??a.count);i+=3){const ids=[0,1,2].map(k=>ix?ix.getX(i+k):i+k);triangles.push({v:ids.map(j=>new T.Vector3().fromBufferAttribute(a,j).applyMatrix4(m.matrixWorld).toArray()),n:ids.map(j=>new T.Vector3().fromBufferAttribute(n,j).applyMatrix3(nm).normalize().toArray()),c:ids.map(()=>m.material.color.toArray()),side:m.material.side,character:false});}});
 costs.push({side:p.side,triangles:triangles.length,colliders:builder.colliders.filter(c=>c.structureId===p.id).length});
 const camera=new T.PerspectiveCamera(42,960/720,.03,100);camera.position.set(p.x+4,3.9,p.z-6.5);camera.lookAt(p.x,2.05,p.z);camera.updateMatrixWorld(true);
 const file=`${out}/taihemen-lion-${p.side}.json.gz`;fs.writeFileSync(file,gzipSync(JSON.stringify({label:`Taihemen ${p.side} bronze lion / ${p.motif}`,diagnosticSize:[960,720],camera:{position:camera.position.toArray(),matrixWorldInverse:camera.matrixWorldInverse.toArray(),fov:42},triangles,sourceCharacterInstances:0})));
 execFileSync('python',['scripts/r101-plaque/render-cpu.py',file,file.replace('.json.gz','.png')],{stdio:'inherit'});
}
fs.writeFileSync(`${out}/taihemen-lions-cost.json`,JSON.stringify(costs,null,2)+'\n');
}finally{builder.dispose();}
