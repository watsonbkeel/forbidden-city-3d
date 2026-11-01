// Actual Three.js component geometry, optionally from the explicit integration
// patch candidate. No World build or browser/GPU evidence is produced here.
import fs from 'node:fs';import {gzipSync} from 'node:zlib';import {execFileSync} from 'node:child_process';import * as T from 'three';
import {PALACE_LAYOUT} from '../../../../src/scene/Layout.js';import {TEXTURE_SPECS} from '../../../../src/utils/TextureLibrary.js';import {library} from '../../../../tests/lib/inner-palace-fixture.mjs';
const {PalaceBuilder}=await import(process.env.HALLS_INTEGRATION_BUILDER??new URL('../../../../src/scene/PalaceBuilder.js',import.meta.url));
const out=process.argv[2],mode=process.argv[3]??'production';if(!out)throw Error('Usage: node baohe-west-practical-cpu.mjs EVIDENCE_DIRECTORY [label]');fs.mkdirSync(out,{recursive:true});
const lib=library(),material=lib.material;lib.material=(name,params={})=>material(name,{color:TEXTURE_SPECS[name]?.fallback??'#b6afa1',...params});
const scene=new T.Scene(),builder=new PalaceBuilder(scene,lib);builder.finish=g=>{g.userData.architecture=[];builder.addObject(g);return g;};
builder.buildAll(PALACE_LAYOUT.filter(h=>['太和殿','中和殿','保和殿'].includes(h.name)));scene.updateMatrixWorld(true);
try{const region=new T.Box3(new T.Vector3(23,0,91),new T.Vector3(67,27,179)),triangles=[];
scene.traverse(m=>{if(!m.isMesh||!new T.Box3().setFromObject(m).intersectsBox(region))return;const g=m.geometry,a=g.attributes.position,n=g.attributes.normal,ix=g.index,nm=new T.Matrix3().getNormalMatrix(m.matrixWorld);for(let i=0;i<(ix?.count??a.count);i+=3){const ids=[0,1,2].map(k=>ix?ix.getX(i+k):i+k),vs=ids.map(j=>new T.Vector3().fromBufferAttribute(a,j).applyMatrix4(m.matrixWorld));if(!new T.Box3().setFromPoints(vs).intersectsBox(region))continue;triangles.push({v:vs.map(v=>v.toArray()),n:ids.map(j=>new T.Vector3().fromBufferAttribute(n,j).applyMatrix3(nm).normalize().toArray()),c:ids.map(()=>m.material.color.toArray()),side:m.material.side,character:false});}});
for(const[name,eye,target]of[['south',[80,27,87],[44,6,124]],['north',[80,26,173],[44,6,130]],['door',[43,10,112],[39,9.7,123]]]){
 const camera=new T.PerspectiveCamera(name==='door'?50:55,960/540,.03,250);camera.position.set(...eye);camera.lookAt(...target);camera.updateMatrixWorld(true);const file=`${out}/${mode}-baohe-west-${name}.json.gz`;
 fs.writeFileSync(file,gzipSync(JSON.stringify({label:`Baohe west ${mode} ${name}`,camera:{position:camera.position.toArray(),matrixWorldInverse:camera.matrixWorldInverse.toArray(),fov:camera.fov},triangles,sourceCharacterInstances:0})));
 execFileSync('python',['scripts/r101-plaque/render-cpu.py',file,file.replace('.json.gz','.png')],{stdio:'inherit'});
}
}finally{builder.dispose();}
