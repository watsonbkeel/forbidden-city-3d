import '../../../../tests/lib/inner-palace-fixture.mjs';
import fs from 'node:fs';import {execFileSync} from 'node:child_process';import {gzipSync} from 'node:zlib';import * as T from 'three';
import {PalaceBuilder} from '../../../../src/scene/PalaceBuilder.js';import {PALACE_LAYOUT} from '../../../../src/scene/Layout.js';
import {realTextureLibrary} from '../../../../tests/lib/r48-real-texture-library.mjs';import {TEXTURE_SPECS} from '../../../../src/utils/TextureLibrary.js';
const root=new URL('../../../../',import.meta.url),out=process.argv[2]??'../r157-wumen-wings-evidence';fs.mkdirSync(out,{recursive:true});
let source=execFileSync('git',['show','d70a4a02:src/scene/PalaceBuilder.js'],{encoding:'utf8'});const url=new URL('src/scene/PalaceBuilder.js',root);source=source.replace(/from\s*(['"])([^'"]+)\1/g,(_,q,id)=>`from ${q}${id==='three'?import.meta.resolve('three'):new URL(id,url).href}${q}`);
const {PalaceBuilder:Parent}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const counts=g=>{let meshes=0,triangles=0;const gs=new Set(),ms=new Set();g.traverse(m=>{if(!m.isMesh)return;meshes++;triangles+=(m.geometry.index?.count??m.geometry.attributes.position.count)/3;gs.add(m.geometry);for(const material of(Array.isArray(m.material)?m.material:[m.material]))ms.add(material);});let geometryBytes=0;for(const g of gs){for(const a of Object.values(g.attributes))geometryBytes+=a.array.byteLength;if(g.index)geometryBytes+=g.index.array.byteLength;}return{meshes,triangles,geometries:gs.size,materials:ms.size,geometryBytes,instancedInstances:0};};
const rows=[];
for(const [mode,Builder]of [['baseline',Parent],['candidate',PalaceBuilder]]){
 const lib=realTextureLibrary(),scene=new T.Scene(),b=new Builder(scene,lib);let raw;b.finish=g=>{raw=g;g.updateMatrixWorld(true);return g;};b.buildGate(PALACE_LAYOUT.find(v=>v.name==='午门'));const before=counts(raw);
 for(const [side,end,face]of [['east','south'],['west','south'],['west','north'],['east','south','outward'],['west','south','outward'],['east','north','outward'],['west','north','outward']]){
  const sign=side==='east'?-1:1,triangles=[];
  const body=raw.children.find(g=>Math.abs(g.position.x-sign*47.7)<1e-7&&Math.abs(g.position.z-(end==='south'?-56.4:-6))<1e-7&&g.userData.topY===7.5);
  body.traverse(m=>{if(!m.isMesh)return;const g=m.geometry,p=g.attributes.position,n=g.attributes.normal,nm=new T.Matrix3().getNormalMatrix(m.matrixWorld);for(let i=0;i<(g.index?.count??p.count);i+=3){const ids=[0,1,2].map(k=>g.index?g.index.getX(i+k):i+k);triangles.push({v:ids.map(j=>new T.Vector3().fromBufferAttribute(p,j).applyMatrix4(m.matrixWorld).toArray()),n:ids.map(j=>new T.Vector3().fromBufferAttribute(n,j).applyMatrix3(nm).normalize().toArray()),c:ids.map(()=>new T.Color(TEXTURE_SPECS[m.material.name.replace(/_material$/,'')]?.fallback??m.material.color).toArray()),side:m.material.side,character:false});}});
  const camera=new T.PerspectiveCamera(42,960/540,.03,120);if(face==='outward'){camera.position.set(sign*70,18,end==='south'?-56.4:-6);camera.lookAt(sign*53,16,end==='south'?-56.4:-6);}else{camera.position.set(sign*47.7,18,end==='south'?-78:16);camera.lookAt(sign*47.7,16,end==='south'?-60:-2);}camera.updateMatrixWorld(true);
  const file=`${out}/${side}-${end}${face?'-'+face:''}-${mode}.json.gz`;fs.writeFileSync(file,gzipSync(JSON.stringify({label:`${side} ${end} ${face??'front'} pavilion body ${mode}; CPU base colors NOT GPU/photo texture`,camera:{position:camera.position.toArray(),matrixWorldInverse:camera.matrixWorldInverse.toArray(),fov:42},triangles,sourceCharacterInstances:0})));
  execFileSync('python',['scripts/r101-plaque/render-cpu.py',file,file.replace('.json.gz','.png')]);
 }
 const merged=PalaceBuilder.prototype.finish.call(b,raw);rows.push({mode,raw:before,merged:counts(merged),runtimeColliders:b.colliders.length,walkables:b.walkables.length});b.dispose();lib.dispose();
}
const report={scope:'WHOLE_WUMEN construction/merge deterministic resource counts; seven isolated PAVILION BODY CPU color views (SE/SW south, NW north, four outward sides)',limits:'No GPU, drawcalls, browser, frame, loading or whole-object acceptance. Raw geometry buffers shared, not GPU InstancedMesh.',baseline:'d70a4a02',rows};fs.writeFileSync(`${out}/cost.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
