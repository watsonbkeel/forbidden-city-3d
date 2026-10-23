// Actual full CourtKit component, existing merge, actual project textures and
// UVs. CPU perspective visibility only, not a browser/GPU/photo acceptance.
import {writeFileSync,mkdirSync,readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';import {gzipSync} from 'node:zlib';
import * as THREE from 'three';
import {component,probe} from './lib/r58-zuoyi-visible-fixture.mjs';
import {triangles,hash,textureHash} from './lib/r58-zuoyi-door-fixture.mjs';
const out='reports/r58-zuoyi-visible',tmp='/tmp/r58-zuoyi-visible-render';mkdirSync(tmp,{recursive:true});mkdirSync(out,{recursive:true});
const frozen=execFileSync('git',['show','62d489a:src/scene/palace/special/ZuoyiDoorFront.js'],{encoding:'utf8'}).replace("from 'three'",`from '${import.meta.resolve('three')}'`);
const {applyZuoyiDoorFront:oldApply}=await import('data:text/javascript;base64,'+Buffer.from(frozen).toString('base64'));
const records=[];
for(const stage of ['old','after']){
 const c=await component(stage==='old'?{apply:oldApply}:{}),maps=[],materials=[],rows=[];
 c.scene.traverse(m=>{if(!m.isMesh)return;const mat=m.material;let mi=materials.indexOf(mat);if(mi<0){mi=materials.length;materials.push(mat);if(mat.map){const file=`${tmp}/${stage}-map-${mi}.png`;writeFileSync(file,mat.map.image.toBuffer('image/png'));maps[mi]={file,flipY:mat.map.flipY,matrix:mat.map.matrix.toArray(),wrapS:mat.map.wrapS,wrapT:mat.map.wrapT};}}
  const g=m.geometry,p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv,idx=g.index,normalMatrix=new THREE.Matrix3().getNormalMatrix(m.matrixWorld);
  for(let i=0;i<(idx?.count??p.count);i+=3){const ids=[0,1,2].map(k=>idx?idx.getX(i+k):i+k);rows.push({v:ids.map(j=>new THREE.Vector3().fromBufferAttribute(p,j).applyMatrix4(m.matrixWorld).toArray()),n:ids.map(j=>new THREE.Vector3().fromBufferAttribute(n,j).applyMatrix3(normalMatrix).normalize().toArray()),uv:ids.map(j=>[uv.getX(j),uv.getY(j)]),mi,side:mat.side});}
 });
 const views=[
  {name:'full-gate-front',eye:[-121,1.7,-53.1],target:[-106.47,3.6,-53.1],fov:65},
  {name:'full-gate-oblique',eye:[-119,1.7,-62],target:[-106.47,3.8,-53.1],fov:65},
  {name:'passage-north',eye:[-105.045,2.15,-53.1],target:[-105.045,2.3,-51.045],fov:102},
  {name:'passage-south',eye:[-105.045,2.15,-53.1],target:[-105.045,2.3,-55.155],fov:102},
 ];
 const viewReports=[];
 for(const view of views){const camera=new THREE.PerspectiveCamera(view.fov,900/650,.03,50);camera.position.fromArray(view.eye);camera.lookAt(...view.target);camera.updateMatrixWorld(true);
  if(view.name.startsWith('full-gate')){let ratio=0;for(const t of rows)for(const p of t.v){const v=new THREE.Vector3(...p).applyMatrix4(camera.matrixWorldInverse);ratio=Math.max(ratio,Math.abs(v.y)/-v.z,Math.abs(v.x)/-v.z/camera.aspect);}camera.fov=view.fov=Math.max(view.fov,Math.ceil(2*Math.atan(ratio/.9)*180/Math.PI));camera.updateProjectionMatrix();}
  const data={scope:'ACTUAL_FULL_COMPONENT_TRIANGLES_UVS_AND_PROJECT_TEXTURES_CPU_NOT_BROWSER',stage,view:view.name,triangles:rows,maps,materials:materials.map(m=>({name:m.name,color:m.color.toArray()})),camera:{position:view.eye,matrixWorldInverse:camera.matrixWorldInverse.toArray(),fov:view.fov}};
  const source=`${tmp}/${stage}-${view.name}.json.gz`;writeFileSync(source,gzipSync(JSON.stringify(data)));
  execFileSync('python',['tests/lib/r58-zuoyi-visible-raster.py',source,`${out}/${stage}-${view.name}.png`],{stdio:'inherit'});
  viewReports.push({...view,legal:!c.cm.checkCollision(camera.position,.5),ground:c.cm.getGroundHeight(view.eye[0],view.eye[2],view.eye[1]-1.7)});
 }
 const mat=materials.find(m=>m.name==='zuoyi_nine_row_front');writeFileSync(`${out}/${stage}-runtime-albedo.png`,mat.map.image.toBuffer('image/png'));writeFileSync(`${out}/${stage}-runtime-normal.png`,mat.normalMap.image.toBuffer('image/png'));
 records.push({stage,triangles:rows.length,mergedMeshes:materials.length,geometrySHA256:hash(triangles(c.scene,{material:false}).map(JSON.stringify).sort()),colorSHA256:textureHash(mat.map),normalSHA256:textureHash(mat.normalMap),views:viewReports,observations:probe(c,{fitted:stage!=='old'})});c.dispose();
}
writeFileSync(`${out}/actual-full-component-diagnostic.json`,JSON.stringify({scope:'ACTUAL_PRODUCTION_MERGED_COMPONENT_REAL_LOCAL_PROJECT_TEXTURES_CPU_ONLY_NOT_BROWSER',officialPixelsIncluded:false,oldImplementationCommit:'62d489a',sourceRowsRemoved:[136/1024,234/1024],displayFitY:[.47,4.4],verticalScaleRelativeRetainedSource:(1-.47/4.4)*1024/926,hardware:'Full inherited hardware retained; positions/proportions are visual fit, not measured photo alignment',horizontal:'Eight inherited columns and unchanged x layout remain unverified against source photograph',records},null,2)+'\n');
console.log(records.map(r=>({stage:r.stage,triangles:r.triangles,meshes:r.mergedMeshes,geometry:r.geometrySHA256,visibleRows:r.observations.map(o=>o.rows.filter(r=>r.visible).length)})));
