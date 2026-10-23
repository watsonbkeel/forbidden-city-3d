// Actual component meshes and HD albedo/UV. Close diagnostic cameras, not a player tour. CPU diagnostic, not WebGL.
import '../../tests/lib/inner-palace-fixture.mjs';
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';import {createRequire} from 'node:module';
import * as THREE from 'three';
import {TextureLibrary,TEXTURE_SPECS} from '../../src/utils/TextureLibrary.js';
import {QinanBefore,GardenBefore,CrossBefore,qinan,pavilion,hash,meshes,physics} from '../../tests/fixtures/r64-g-garden/fixture.mjs';
import {buildQinanHall} from '../../src/scene/palace/special/QinanHall.js';
import {buildBridgeGardenPavilion,bridgeGardenProfile} from '../../src/scene/garden/RemainingGardenPavilions.js';
import {GardenBuilder} from '../../src/scene/GardenBuilder.js';
import {buildCrossGardenPavilion} from '../../src/scene/garden/CrossGardenPavilions.js';
import {buildYujingEnclosure} from '../../src/scene/garden/RemainingGardenPavilions.js';
const {createCanvas,loadImage}=createRequire(import.meta.url)('@napi-rs/canvas');
globalThis.document={createElement:()=>createCanvas(1,1),createElementNS:()=>({addEventListener(){},removeEventListener(){}})};
const dir=process.env.R64_PREVIEW_DIR??'reports/r64-g-stage/small-silhouette-preview';fs.mkdirSync(dir,{recursive:true});
const proof={scope:'ACTUAL_LOCAL_PRODUCTION_GEOMETRY_CPU_ALBEDO_UV_NOT_BROWSER_GPU',sourcePhotographsCopied:false,limitations:'CPU excludes normal mapping, WebGL PBR/shadows/tone mapping; no historical, browser, whole G or physical-phone acceptance.',states:[]};
const tasks=[{name:'千秋亭',views:[{name:'finial',eye:[3,8.6,-5],target:[0,8.4,0],fov:40}]},{name:'御景亭',views:[{name:'south-rail',eye:[1,1.3,-7],target:[0,1.2,0],fov:55}]}];
function component(task,state,lib){const b=new GardenBuilder(new THREE.Scene(),lib),r=new THREE.Group();b.goldMat=b.own(new THREE.MeshStandardMaterial({color:0xd8a83a,metalness:.85,roughness:.32,name:'garden_gold'}));b.group.add(r);const f=task.name==='千秋亭'?(state==='before'?CrossBefore.buildCrossGardenPavilion:buildCrossGardenPavilion)(b,r,{name:'千秋亭',x:54.6,z:471.4}):(state==='before'?GardenBefore.buildYujingEnclosure:buildYujingEnclosure)(b,r,{x:-29.1,z:509.1,y:0});f.updateMatrixWorld(true);return{b,f,dispose:()=>b.dispose()};}
for(const task of tasks.filter(t=>!process.env.R64_PREVIEW_TASK||t.name===process.env.R64_PREVIEW_TASK))for(const state of process.env.R64_PREVIEW_STATE?[process.env.R64_PREVIEW_STATE]:['before','after']){
 const lib=new TextureLibrary();let f;const temp=fs.mkdtempSync('/tmp/r64-local-preview-');
 try{
  lib.manifest=JSON.parse(fs.readFileSync('public/textures/hd/manifest.json'));
  for(const name of Object.keys(TEXTURE_SPECS))for(const kind of ['color','normal']){const filename=lib.manifest.textures[name]?.[kind];if(!filename)continue;const im=await loadImage(path.resolve('public/textures/hd',filename)),c=createCanvas(im.width,im.height);c.getContext('2d').drawImage(im,0,0);(kind==='color'?lib.colors:lib.normals).set(name,lib.configure(new THREE.CanvasTexture(c),name,kind));}
  f=component(task,state,lib);
  const offset=f.f.position.clone(),materials=[],ids=new Map(),triangles=[];
  function mid(m){if(ids.has(m.uuid))return ids.get(m.uuid);const id=materials.length;let texture=null;if(m.map?.image?.toBuffer){texture=`texture-${id}.png`;fs.writeFileSync(path.join(temp,texture),m.map.image.toBuffer('image/png'));}materials.push({name:m.name,color:m.color?.getHexString()??'ffffff',texture,wrapS:m.map?.wrapS,wrapT:m.map?.wrapT,side:m.side,opacity:m.opacity??1});ids.set(m.uuid,id);return id;}
  for(const m of meshes(f.f)){const a=m.geometry.attributes,p=a.position,ix=m.geometry.index;for(let i=0;i<(ix?.count??p.count);i+=3){const js=[0,1,2].map(j=>ix?ix.getX(i+j):i+j);triangles.push({role:m.userData.role??m.name,v:js.map(j=>new THREE.Vector3().fromBufferAttribute(p,j).applyMatrix4(m.matrixWorld).sub(offset).toArray()),uv:a.uv?js.map(j=>[a.uv.getX(j),a.uv.getY(j)]):null,material:mid(Array.isArray(m.material)?m.material[m.geometry.groups.find(k=>i>=k.start&&i<k.start+k.count)?.materialIndex]:m.material)});}}
  const payload=JSON.stringify({name:task.name,state,triangles,materials});fs.writeFileSync(path.join(temp,'geometry.json'),payload);
  const images=[];for(const v of task.views){const output=path.join(dir,`${task.name}-${v.name}-${state}.png`);assert.equal(fs.existsSync(output),false,'Do not overwrite captured evidence');execFileSync('python',['tests/r49b-plaque-cpu-render.py',temp,output,JSON.stringify(v.eye),JSON.stringify(v.target),String(v.fov)],{stdio:'inherit'});images.push({path:output,sha256:hash(fs.readFileSync(output)),camera:v});}
  proof.states.push({name:task.name,state,geometrySHA256:hash(payload),physicsSHA256:hash(physics(f)),triangles:triangles.length,meshes:meshes(f.f).length,images});
 }finally{f?.dispose();lib.dispose();fs.rmSync(temp,{recursive:true,force:true});}
}
for(const task of tasks){const a=proof.states.filter(x=>x.name===task.name);if(a.length===2)assert.equal(a[0].physicsSHA256,a[1].physicsSHA256);}
fs.writeFileSync(path.join(dir,'proof.json'),JSON.stringify(proof,null,2)+'\n');console.log(`Saved ${proof.states.reduce((n,s)=>n+s.images.length,0)} actual CPU images. See proof for each captured state and physics hash.`);
