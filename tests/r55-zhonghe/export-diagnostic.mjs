import fs from 'node:fs';
import path from 'node:path';
import * as THREE from 'three';
import {gzipSync,gunzipSync} from 'node:zlib';
import {zhongheFragment,ZHONGHE_CAMERAS,geometrySignature,hash} from '../lib/r55-zhonghe-fragment.mjs';
import {exportProductionView} from '../lib/r51-production-raster.mjs';
const out=process.argv[2];if(!out)throw Error('Output directory required');fs.mkdirSync(out,{recursive:true});
const {scene,shell,group,builder}=zhongheFragment({plinth:true});
for(const c of ZHONGHE_CAMERAS){const camera=new THREE.PerspectiveCamera(c.fov,16/9,.03,100);camera.position.fromArray(c.position);camera.lookAt(...c.target);camera.updateMatrixWorld(true);
 const dest=path.join(out,c.id+'.json.gz');exportProductionView({scene,camera,characters:{manager:{simulationSeconds:0}}},dest,{far:32});
 const d=JSON.parse(gunzipSync(fs.readFileSync(dest)));delete d.characterSourceHashes;delete d.simulationSeconds;d.diagnosticSize=[1120,630];d.kind='Actual unmerged Zhonghe hall and plinth geometry, unchanged production world coordinates. CPU geometry / base-color diagnostic, not browser or texture acceptance.';fs.writeFileSync(dest,gzipSync(JSON.stringify(d)));}
const meshes=[];group.traverse(m=>{if(m.isMesh){const b=new THREE.Box3().setFromObject(m);meshes.push({name:m.name,displayId:m.userData.zhongheDisplayId??null,min:b.min.toArray(),max:b.max.toArray(),triangles:(m.geometry.index?.count??m.geometry.attributes.position.count)/3});}});
const p=shell.userData.structure.displaySetting;
fs.writeFileSync(path.join(out,'geometry-and-navigation.json'),JSON.stringify({geometryHash:geometrySignature(group),physicalHash:hash({colliders:builder.colliders.map(b=>({min:b.min.toArray(),max:b.max.toArray()})),walkables:builder.walkables.map(w=>w.type==='box'?{type:w.type,min:w.box.min.toArray(),max:w.box.max.toArray(),rescue:w.rescue??true}:w)}),display:p??null,structure:shell.userData.structure,meshes,colliders:builder.colliders.map(b=>({min:b.min.toArray(),max:b.max.toArray()})),walkables:builder.walkables.map(w=>w.type==='box'?{type:w.type,min:w.box.min.toArray(),max:w.box.max.toArray(),rescue:w.rescue??true}:w),stats:{meshes:meshes.length,triangles:meshes.reduce((s,m)=>s+m.triangles,0),materials:builder.ownedMaterials.length,colliders:builder.colliders.length,walkables:builder.walkables.length}},null,2)+'\n');
console.log(out);
