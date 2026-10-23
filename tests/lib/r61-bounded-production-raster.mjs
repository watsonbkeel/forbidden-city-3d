// QA-only bounded serialization successor. The legacy exporter stays frozen.
// Export only actual production scene triangles and submitted instance streams.
// No calibration actors, replacement scenery, substituted positions or scales.
import fs from 'node:fs';
import os from 'node:os';
import pathModule from 'node:path';
import {gzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import * as THREE from 'three';
import {deformCharacterVertex} from '../../src/scene/characters/CharacterAnimation.js';

export function exportProductionViewBounded(app,path,{far=180}={}){
 const tmp=fs.mkdtempSync(pathModule.join(os.tmpdir(),'r61-raster-')),spool=pathModule.join(tmp,'triangles.json'),fd=fs.openSync(spool,'wx');let triangleCount=0,output=null;
 try {
 const scene=app.scene,camera=app.camera;scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);
 const projection=new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse),frustum=new THREE.Frustum().setFromProjectionMatrix(projection);
 const meshes=[],box=new THREE.Box3(),world=new THREE.Matrix4(),instance=new THREE.Matrix4(),position=new THREE.Vector3(),normal=new THREE.Vector3(),normalMatrix=new THREE.Matrix3();
 let sourceInstances=0,sourceMeshes=0;
 scene.traverse(mesh=>{
  if(!mesh.isMesh||!mesh.geometry||mesh.name.startsWith('COL_')||mesh.name.startsWith('WALK_'))return;
  for(let o=mesh;o;o=o.parent)if(!o.visible)return;
  const g=mesh.geometry,a=g.attributes;if(!a.position)return;if(!g.boundingBox)g.computeBoundingBox();
  const count=mesh.isInstancedMesh?mesh.count:1;
  for(let ii=0;ii<count;ii++){
   if(mesh.isInstancedMesh){mesh.getMatrixAt(ii,instance);world.multiplyMatrices(mesh.matrixWorld,instance);}else world.copy(mesh.matrixWorld);
   box.copy(g.boundingBox).applyMatrix4(world);if(!frustum.intersectsBox(box)||box.distanceToPoint(camera.position)>far)continue;
   const character=mesh.userData.characterBatch===true;
   if(character&&(a.characterVisibility?.getX(ii)??1)<=0)continue;
   normalMatrix.getNormalMatrix(world);
   const animation=character?{phase:a.characterAnim.getX(ii),amplitude:a.characterAnim.getY(ii),walkSpeed:a.characterAnim.getZ(ii),poseIndex:a.characterAnim.getW(ii)}:null;
   // Keep only one triangle's transformed vertices; merged far vertices are never retained.
   function vertex(vi){
    position.fromBufferAttribute(a.position,vi);normal.set(0,1,0);if(a.normal)normal.fromBufferAttribute(a.normal,vi);
    if(character){const d=deformCharacterVertex(position.toArray(),normal.toArray(),{part:a.characterPart.getX(vi),pivot:[a.characterPivot.getX(vi),a.characterPivot.getY(vi),a.characterPivot.getZ(vi)],weight:a.characterWeight.getX(vi),torsoWeight:a.characterTorsoWeight.getX(vi)},{...animation,time:app.characters.manager.simulationSeconds});position.fromArray(d.position);normal.fromArray(d.normal);}
    position.applyMatrix4(world);normal.applyMatrix3(normalMatrix).normalize();return {v:position.toArray(),n:normal.toArray(),c:a.color?[a.color.getX(vi),a.color.getY(vi),a.color.getZ(vi)]:[1,1,1]};
   }
   const start=Number.isFinite(g.drawRange.start)?g.drawRange.start:0,end=Math.min(g.index?.count??a.position.count,start+g.drawRange.count);let kept=0;
   for(let ti=start;ti+2<end;ti+=3){
    const ids=[0,1,2].map(k=>g.index?g.index.getX(ti+k):ti+k),vertices=ids.map(vertex),v=vertices.map(p=>p.v);
    const depths=v.map(p=>new THREE.Vector3(...p).applyMatrix4(camera.matrixWorldInverse).z*-1);
    if(depths.every(d=>d<.03)||depths.every(d=>d>far))continue;
    const clip=v.map(p=>new THREE.Vector3(...p).applyMatrix4(projection));if([0,1].some(axis=>{const key=axis?'y':'x';return clip.every(p=>p[key]<-1)||clip.every(p=>p[key]>1)}))continue;
    const group=g.groups.find(gr=>ti>=gr.start&&ti<gr.start+gr.count),mat=Array.isArray(mesh.material)?mesh.material[group?.materialIndex??0]:mesh.material;
    if(!mat||mat.visible===false||mat.opacity<.1)continue;
    const tint=mat.color??new THREE.Color(1,1,1),c=vertices.map(p=>{const color=mat.vertexColors?p.c:[1,1,1];return[color[0]*tint.r,color[1]*tint.g,color[2]*tint.b]});
    fs.writeSync(fd,(triangleCount?',':'')+JSON.stringify({v,c,n:vertices.map(p=>p.n),side:mat.side,character}));triangleCount++;kept++;
   }
   if(kept){meshes.push({name:mesh.name,instance:mesh.isInstancedMesh?ii:null,character,triangles:kept});sourceMeshes++;if(character)sourceInstances++;}
  }
 });
 const characterSourceHashes=Object.fromEntries(['CharacterKit.js','CharacterAnimation.js','CharacterRenderer.js'].map(name=>[name,createHash('sha256').update(fs.readFileSync(`src/scene/characters/${name}`)).digest('hex')]));
 const report={kind:'Actual production main scene and actual CharacterRenderer instance buffers; perspective CPU raster input. Material base/vertex colors only; no textures, GPU lighting, shader dithering, browser rendering or historical sign-off.',characterSourceHashes,camera:{position:camera.position.toArray(),quaternion:camera.quaternion.toArray(),fov:camera.fov,aspect:camera.aspect,matrixWorldInverse:camera.matrixWorldInverse.toArray(),projectionMatrix:camera.projectionMatrix.toArray(),exportFar:far},sourceMeshes,sourceCharacterInstances:sourceInstances,simulationSeconds:app.characters.manager.simulationSeconds,meshes};
 fs.closeSync(fd);
 // Concatenated gzip members decode to exactly the old JSON byte stream. No base64,
 // truncation, numeric rounding, changed culling, or duplicate uncompressed artifact.
 output=path+'.tmp-'+pathModule.basename(tmp);let input=null,dest=null;
 try {input=fs.openSync(spool,'r');dest=fs.openSync(output,'wx');fs.writeSync(dest,gzipSync(JSON.stringify(report).slice(0,-1)+',"triangles":['));const buffer=Buffer.allocUnsafe(65536);let n;while((n=fs.readSync(input,buffer,0,buffer.length,null)))fs.writeSync(dest,gzipSync(buffer.subarray(0,n)));fs.writeSync(dest,gzipSync(']}'));}
 finally {if(input!==null)fs.closeSync(input);if(dest!==null)fs.closeSync(dest);}
 fs.renameSync(output,path);
 return {path,sourceMeshes,sourceCharacterInstances:sourceInstances,triangles:triangleCount,camera:report.camera};
 }finally {try {fs.closeSync(fd);}catch(e){if(e.code!=='EBADF')throw e;}if(output&&fs.existsSync(output))fs.unlinkSync(output);fs.rmSync(tmp,{recursive:true,force:true});}
}
