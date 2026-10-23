// Narrow real gate geometry only. No world loader, GLB, browser, or screenshots.
import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';
import {gzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import * as THREE from 'three';
import {taihemenFragment,regionTriangles,hash,baselineSource,candidateSource} from './lib/r58-taihemen-fragment.mjs';
import {TAIHEMEN_DIAGNOSTIC_VIEWS,assertTaihemenInWorld} from './lib/r58-taihemen-world-check.mjs';
const out=process.argv[2]??'docs/current-state/r58-taihemen-open-veranda/evidence';mkdirSync(out,{recursive:true});
const palette={roof_tile:'#ba913e',kit_ridge:'#bc9c53',wood_column:'#8b3b28',wall_red:'#a34b37',wall_brick:'#71695b',stone_slab:'#90897e',marble:'#d1c9b8',rafters:'#514631',caihua_beam:'#3e665a',dougong_band:'#4f6651',lattice_doors:'#4c3528',sumeru_band:'#c4bcad',balustrade:'#d2cabb',yulu:'#bcb3a3'};
const files=['src/scene/palace/special/TaihemenProfile.js','src/scene/palace/special/TaihemenEnclosure.js','src/scene/palace/TaihemenSouthApproach.js','src/scene/palace/HallNameboardMount.js','src/scene/RoofBuilder.js','src/scene/PalaceBuilder.js'];
const sourceHashes=Object.fromEntries(files.map(p=>[p,createHash('sha256').update(readFileSync(p)).digest('hex')]));
const report={baselineCommit:'755dd9ac5c6f8a8766c1db3e8e4f8fe17fa142da',sourceHashes,
 baselineBuilderSHA256:hash(baselineSource),candidateBuilderSHA256:hash(candidateSource),
 kind:'ACTUAL_GATE_TRIANGLES_CPU_DIAGNOSTIC_ONLY',status:'VERIFY_PENDING_BROWSER',
 warning:'Actual geometry with a declared flat diagnostic material palette. No production textures, WebGL, runtime shadows, browser screenshot, source pixel match, or visual acceptance.',views:[],states:{}};
for(const [state,candidate] of [['before',false],['after',true]]) {
 const W=taihemenFragment({candidate});W.scene.updateMatrixWorld(true);
 const triangles=[];W.root.traverse(m=>{if(!m.isMesh)return;const a=m.geometry.attributes.position,idx=m.geometry.index,side=m.material.side;
  const color=palette[m.material.name]??`#${m.material.color?.getHexString()??'8b683f'}`;
  for(let i=0;i<(idx?.count??a.count);i+=3)triangles.push({v:[0,1,2].map(k=>new THREE.Vector3().fromBufferAttribute(a,idx?idx.getX(i+k):i+k).applyMatrix4(m.matrixWorld).toArray()),color,side,material:m.material.name});
 });
 const boxes=W.builder.colliders.map(c=>({min:c.min.toArray(),max:c.max.toArray()}));
 const meshCount=W.root.children.filter(c=>c.isMesh).length;
 report.states[state]={triangles:triangles.length,mergedMeshes:meshCount,colliders:boxes.length,walkables:W.builder.walkables.length,
  geometrySHA256:hash(triangles),collidersSHA256:hash(boxes),walkablesSHA256:hash(W.builder.walkables),
  columnsSHA256:hash(W.builder.columns),columnCount:W.builder.columns.length,roofSHA256:hash(W.builder.roofRows),plaqueSHA256:hash(W.builder.plaqueRows),
  northTrianglesSHA256:hash(regionTriangles(W.root,v=>v[2]>=W.data.position.z)),southApproach:W.p,boxes};
 if(candidate)report.existingWorldQA=assertTaihemenInWorld(W);
 for(const view of TAIHEMEN_DIAGNOSTIC_VIEWS) {
  const camera=new THREE.PerspectiveCamera(view.fov,16/9,.03,200);camera.position.fromArray(view.eye);camera.lookAt(...view.target);camera.updateMatrixWorld(true);
  const data={state,view:view.id,kind:report.kind,warning:report.warning,palette,camera:{...view,aspect:16/9,width:1280,height:720,matrixWorldInverse:camera.matrixWorldInverse.toArray(),projectionMatrix:camera.projectionMatrix.toArray()},triangles};
  const path=`${out}/${view.id}-${state}.json.gz`;writeFileSync(path,gzipSync(JSON.stringify(data)));report.views.push({state,view:view.id,path,camera:data.camera,geometrySHA256:hash(triangles)});
 }
 W.builder.dispose();
}
const before=report.states.before,after=report.states.after;
report.delta={triangles:after.triangles-before.triangles,mergedMeshes:after.mergedMeshes-before.mergedMeshes,colliders:after.colliders-before.colliders,walkables:after.walkables-before.walkables};
report.retained=Object.fromEntries(['walkablesSHA256','columnsSHA256','roofSHA256','plaqueSHA256','northTrianglesSHA256'].map(k=>[k,before[k]===after[k]]));
const key=box=>JSON.stringify(box);report.colliderDelta={removed:before.boxes.filter(b=>!after.boxes.some(a=>key(a)===key(b))),added:after.boxes.filter(a=>!before.boxes.some(b=>key(a)===key(b)))};
writeFileSync(`${out}/geometry-summary.json`,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({delta:report.delta,retained:report.retained,existingWorldQA:report.existingWorldQA}));
