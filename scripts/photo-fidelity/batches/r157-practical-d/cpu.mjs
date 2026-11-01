// Whole-object production geometry diagnostic: no browser, textures or lighting claim.
import * as T from 'three';
import fs from 'node:fs';
import {gzipSync} from 'node:zlib';
import {execFileSync} from 'node:child_process';
import '../../../../tests/lib/inner-palace-fixture.mjs';
import {realTextureLibrary} from '../../../../tests/lib/r48-real-texture-library.mjs';
import {ZoneBase} from '../../../../src/scene/zones/ZoneBase.js';
const out=process.env.EVIDENCE_OUT;if(!out)throw Error('EVIDENCE_OUT required');fs.mkdirSync(out,{recursive:true});
const data=JSON.parse(fs.readFileSync('data/zones/axis-courts.json'));
const groups=[['xiehe',0,[26,27],[[40,90,-319],[-106,5,-319]],[[-95,5.4,-306],[-101,4.4,-322]]],['xihe',1,[32,33],[[-40,90,-319],[110,5,-319]],[[99.5,5.4,-306],[105.1,4.4,-322]]],...[[12,'zhongzuo'],[16,'houzuo'],[18,'houyou']].map(([i,name])=>[name,i,[],[[data.items[i].x+15,11,data.items[i].z-23],[data.items[i].x,4,data.items[i].z]],[[data.items[i].x-15,11,data.items[i].z+23],[data.items[i].x,4,data.items[i].z]]])];
const manifest=[];
for(const[name,index,galleries,...views]of groups){
 const lib=realTextureLibrary(),zone=new ZoneBase(lib,structuredClone(data));zone.buildGate(zone.zoneJson.items[index]);for(const i of galleries)zone.buildCorridor(zone.zoneJson.items[i]);
 const scene=zone.kit.finish();scene.updateMatrixWorld(true);const triangles=[];let meshes=0;
 scene.traverse(m=>{if(!m.isMesh)return;meshes++;const g=m.geometry,p=g.attributes.position,n=g.attributes.normal,nm=new T.Matrix3().getNormalMatrix(m.matrixWorld);for(let i=0;i<(g.index?.count??p.count);i+=3){const ids=[0,1,2].map(k=>g.index?g.index.getX(i+k):i+k);triangles.push({v:ids.map(j=>new T.Vector3().fromBufferAttribute(p,j).applyMatrix4(m.matrixWorld).toArray()),n:ids.map(j=>new T.Vector3().fromBufferAttribute(n,j).applyMatrix3(nm).normalize().toArray()),c:ids.map(()=>m.material.color.toArray()),side:m.material.side,character:false});}});
 const geometryRef=`${name}-geometry.json.gz`;fs.writeFileSync(`${out}/${geometryRef}`,gzipSync(JSON.stringify(triangles)));
 for(const[i,[position,target]]of views.entries()){const camera=new T.PerspectiveCamera(65,1,.03,300);camera.position.fromArray(position);camera.lookAt(...target);camera.updateMatrixWorld(true);const file=`${out}/${name}-${i}.json.gz`;fs.writeFileSync(file,gzipSync(JSON.stringify({label:`D ${name} ${i} actual complete gate${galleries.length?' and both galleries':''}; CPU only`,diagnosticSize:[640,640],geometryRef,camera:{position,matrixWorldInverse:camera.matrixWorldInverse.toArray(),fov:65},sourceCharacterInstances:0})));execFileSync('python',['scripts/r101-plaque/render-cpu.py',file,file.replace('.json.gz','.png')],{stdio:'inherit'});}
 manifest.push({name,index,galleries,meshes,triangles:triangles.length,colliders:zone.kit.colliders.length,walkables:zone.kit.walkables.length});zone.kit.dispose(scene);lib.dispose();
}
fs.writeFileSync(`${out}/manifest.json`,JSON.stringify({scope:'Complete actual geometry; vertex/base colour CPU only, not GPU/photo-perfect/user acceptance',groups:manifest},null,2));
