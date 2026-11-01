// Actual merged geometry only: source-conditioned cameras, no browser/GPU claim.
import * as T from 'three';
import fs from 'node:fs';
import {gzipSync} from 'node:zlib';
import {execFileSync} from 'node:child_process';
import {registerHooks} from 'node:module';
import '../../../../tests/lib/inner-palace-fixture.mjs';
import {realTextureLibrary} from '../../../../tests/lib/r48-real-texture-library.mjs';
const mode=process.env.MIDDLE_RIGHT_MODE??'candidate',parent='d70a4a02',out='../r157-resume-20261030-evidence/zhongyou-whole-closure';
if(!['parent','candidate'].includes(mode))throw Error('Invalid mode');
if(mode==='parent')registerHooks({load(url,context,next){for(const path of['src/scene/zones/ZoneBase.js','src/scene/RoofBuilder.js'])if(url.endsWith('/'+path))return{format:'module',source:execFileSync('git',['show',`${parent}:${path}`],{encoding:'utf8'}),shortCircuit:true};return next(url,context);}});
const {ZoneBase}=await import('../../../../src/scene/zones/ZoneBase.js');
const data=JSON.parse(mode==='parent'?execFileSync('git',['show',`${parent}:data/zones/axis-courts.json`],{encoding:'utf8'}):fs.readFileSync('data/zones/axis-courts.json','utf8'));
const lib=realTextureLibrary(),zone=new ZoneBase(lib,data),item=data.items[14];
zone.gateWidths.set(item.name,zone.buildGate(item));zone.buildWall(data.items[15]);
const stats=root=>{let meshes=0,triangles=0,bytes=0;const gs=new Set();root.traverse(m=>{if(m.isMesh){meshes++;triangles+=(m.geometry.index?.count??m.geometry.attributes.position.count)/3;gs.add(m.geometry);}});for(const g of gs){for(const a of Object.values(g.attributes))bytes+=a.array.byteLength;if(g.index)bytes+=g.index.array.byteLength;}return{meshes,triangles,bytes,uniqueGeometries:gs.size};};
const source=stats(zone.kit.root),scene=zone.kit.finish();
fs.writeFileSync(`${out}/middle-right-${mode}-${process.env.CPU_TAG??'initial'}-cost.json`,JSON.stringify({scope:'Actual gate plus attached item15 wall; CPU geometry/buffers, NOT GPU draw calls',source,merged:stats(scene),colliders:zone.kit.colliders.length,triangleOwners:zone.kit.colliders.filter(c=>c.triangleSupport).length,walkables:zone.kit.walkables.length},null,2)+'\n');scene.updateMatrixWorld(true);const triangles=[];
scene.traverse(m=>{if(!m.isMesh)return;const g=m.geometry,p=g.attributes.position,n=g.attributes.normal,nm=new T.Matrix3().getNormalMatrix(m.matrixWorld);for(let i=0;i<(g.index?.count??p.count);i+=3){const ids=[0,1,2].map(k=>g.index?g.index.getX(i+k):i+k);triangles.push({v:ids.map(j=>new T.Vector3().fromBufferAttribute(p,j).applyMatrix4(m.matrixWorld).toArray()),n:ids.map(j=>new T.Vector3().fromBufferAttribute(n,j).applyMatrix3(nm).normalize().toArray()),c:ids.map(()=>m.material.color.toArray()),side:m.material.side,character:false});}});
const geometryFile=`middle-right-${mode}${process.env.CPU_TAG?`-${process.env.CPU_TAG}`:''}-geometry.json.gz`;fs.writeFileSync(`${out}/${geometryFile}`,gzipSync(JSON.stringify(triangles)));
const views=[['south-source',[80,.6194,item.z-24.3265],[80,.6194,item.z],90],['north-source',[80,1.8595,item.z+16.3636],[80+.1,1.8595,item.z-9],90],['north-inside',[80,4.3,item.z+2.8],[80,5.5,item.z-4],80],['south-oblique',[96,16,item.z-35],[80,4,item.z-4],55],['north-oblique',[64,14,item.z+30],[80,4,item.z+2],55]];
if(process.env.CPU_IMAGES!=='0')for(const[name,position,target,fov]of views){const camera=new T.PerspectiveCamera(fov,1,.03,200);camera.position.fromArray(position);camera.lookAt(...target);camera.updateMatrixWorld(true);const file=`${out}/middle-right-${mode}${process.env.CPU_TAG?`-${process.env.CPU_TAG}`:''}-${name}.json.gz`;fs.writeFileSync(file,gzipSync(JSON.stringify({label:`Middle-right ${mode} ${name}`,diagnosticSize:[640,640],geometryRef:geometryFile,camera:{position,matrixWorldInverse:camera.matrixWorldInverse.toArray(),fov},sourceCharacterInstances:0})));execFileSync('python',['scripts/r101-plaque/render-cpu.py',file,file.replace('.json.gz','.png')],{stdio:'inherit'});}
zone.kit.dispose(scene);lib.dispose();
