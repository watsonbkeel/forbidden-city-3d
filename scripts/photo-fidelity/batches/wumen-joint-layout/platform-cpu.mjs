import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import {pathToFileURL} from 'node:url';
import * as T from 'three';
import {captureGate} from '../../../../tests/lib/gate-tower-fixture.mjs';
import {buildWumenJointVisiblePlatform} from './visible-platform.mjs';

// All drawn faces, including every group of a single-material BoxGeometry.
// This is CPU fixture base color, not alpha-texture or GPU rendering.
export function collectActualPlatformTriangles(roots){
 const rows=[];
 for(const root of roots){root.updateWorldMatrix(true,true);root.traverse(m=>{
  if(!m.isMesh)return;
  if(m.isInstancedMesh||m.isSkinnedMesh||m.isBatchedMesh)throw Error('Unsupported mesh execution channel');
  for(let o=m;o;o=o.parent)if(!o.visible)return;
  const g=m.geometry,a=g.attributes,idx=g.index,total=idx?.count??a.position.count;
  if(!a.normal)throw Error('Actual normals required');
  const nm=new T.Matrix3().getNormalMatrix(m.matrixWorld),start=g.drawRange.start,end=Math.min(total,start+g.drawRange.count);
  for(let i=start;i+2<end;i+=3){
   const group=g.groups.find(q=>i>=q.start&&i+2<q.start+q.count);
   const mat=Array.isArray(m.material)?(group?m.material[group.materialIndex]:null):m.material;
   if(!mat?.visible||(mat.transparent&&mat.opacity<=0))continue;
   const ids=[0,1,2].map(k=>idx?idx.getX(i+k):i+k),color=mat.color.toArray();
   rows.push({v:ids.map(j=>new T.Vector3().fromBufferAttribute(a.position,j).applyMatrix4(m.matrixWorld).toArray()),n:ids.map(j=>new T.Vector3().fromBufferAttribute(a.normal,j).applyNormalMatrix(nm).toArray()),c:[color,color,color],side:mat.side,character:false});
  }
 });}
 return rows;
}

if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 const[out,mode]=process.argv.slice(2);
 if(!out||fs.existsSync(out)||!['before','after'].includes(mode))throw Error('New output directory and before/after required');
 const c=captureGate();let candidate;
 try{
  const roots=[];
  if(mode==='after'){candidate=buildWumenJointVisiblePlatform(c);roots.push(candidate.group);}
  else c.group.traverse(o=>{if(o.userData.structure?.id==='axis/wumen-lower-base'||o.name==='wumen-folded-ascent'||o.userData.structure?.id==='axis/wumen-south-three-canopies')roots.push(o);});
  if(mode==='before'&&roots.length!==3)throw Error(`Expected three actual lower/ascent/canopy roots, got ${roots.map(o=>o.name+' '+JSON.stringify(o.userData)).join('\n')}`);
  const triangles=collectActualPlatformTriangles(roots),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
  const proof={accepted:false,mode,scope:'ACTUAL_LOWER_PLATFORM_ASCENT_COMPONENT_CPU_FIXTURE_BASE_COLOR_NOT_WORLD_OR_GPU',coordinateSpace:'WUMEN_COMPONENT_LOCAL_NO_WORLD_ANCHOR_SHIFT',roots:roots.map(o=>({name:o.name,userData:o.userData})),triangles:triangles.length,sourceHashes:{},views:{},limitations:['Before: existing lower platform, old folded ascent and south canopies only; after: engineering U platform, twelve slopes and retained portal details only.','No upper main tower, wing buildings or pavilions: this does not prove column bearing or architectural entry.','No textures or alpha-texture sampling, GPU, runtime lighting or shadows.','Proposed dimensions and heights are engineering fits, not surveyed reconstruction.']};
  for(const p of ['scripts/photo-fidelity/batches/wumen-joint-layout/platform-cpu.mjs','scripts/photo-fidelity/batches/wumen-joint-layout/visible-platform.mjs','scripts/photo-fidelity/batches/wumen-joint-layout/platform-fit.mjs','src/scene/palace/special/WumenLowerBase.js'])proof.sourceHashes[p]=hash(fs.readFileSync(p));
  fs.mkdirSync(out,{recursive:true});
  for(const[name,eye,target,fov]of [['north-overview',[130,105,115],[0,4,-35],47],['court-overview',[0,105,-155],[0,7,-43],55],['east-junction',[-90,39,20],[-60,9,-14],48],['west-junction',[90,39,20],[60,9,-14],48]]){
   const camera=new T.PerspectiveCamera(fov,1.5,.1,500);camera.position.fromArray(eye);camera.lookAt(new T.Vector3().fromArray(target));camera.updateMatrixWorld(true);
   const cam={position:eye,target,fov,aspect:1.5,matrixWorldInverse:camera.matrixWorldInverse.toArray()},label=`wumen-platform-${name}-${mode}`,file=label+'.json.gz';
   fs.writeFileSync(path.join(out,file),zlib.gzipSync(JSON.stringify({label,kind:proof.scope,diagnosticSize:[1200,800],camera:cam,triangles,sourceCharacterInstances:0})));
   proof.views[name]={camera:cam,file,triangles:triangles.length,sha256:hash(fs.readFileSync(path.join(out,file)))};
  }
  fs.writeFileSync(path.join(out,'PROOF.json'),JSON.stringify(proof,null,2)+'\n');
 }finally{candidate?.dispose();c.builder.dispose();}
}
