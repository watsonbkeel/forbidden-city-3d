// QA-only combined R63 Tongdao: frozen real R62 dispatch vs current unmodified
// production dispatch. Existing CPU triangle/albedo raster, never browser claims.
import '../../tests/lib/inner-palace-fixture.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import * as THREE from 'three';
import {Before,config,hash,lineage,verifyLineage,createLocal,output,retainedRows} from '../../tests/fixtures/r63-f-integrated/fixture.mjs';
import {ZoneBase} from '../../src/scene/zones/ZoneBase.js';
import {TextureLibrary,TEXTURE_SPECS} from '../../src/utils/TextureLibrary.js';
import {CollisionManager} from '../../src/utils/Collision.js';
import {assertTongdaoRoofInWorld} from '../../tests/lib/r63-tongdao-roof-world-check.mjs';
import {assertWestRearSouthWindowsInWorld} from '../../tests/lib/r63-west-rear-windows-world-check.mjs';
const {createCanvas,loadImage,GlobalFonts}=createRequire(import.meta.url)('@napi-rs/canvas');
GlobalFonts.registerFromPath('/usr/share/fonts/opentype/noto/NotoSerifCJK-Regular.ttc','SimSun');
globalThis.document={createElement:()=>createCanvas(1,1),createElementNS:()=>({addEventListener(){},removeEventListener(){}})};
const destination=path.resolve('reports/r63-f-stage/combined-preview');fs.mkdirSync(destination,{recursive:true});
const repeat=process.argv.includes('--verify-existing');
const geometryOnly=process.argv.includes('--verify-geometry-only');
const previousProof=geometryOnly?JSON.parse(fs.readFileSync(path.join(destination,'proof.json'))):null;
const views=[{name:'southwest-roof-and-windows',eye:[-25,9,-35],target:[0,6,0],fov:54}];
const proof={scope:'CPU_DIAGNOSTIC_ACTUAL_LOCAL_INTEGRATED_DISPATCH_NOT_BROWSER_GPU_OR_FULL_WORLD_ACCEPTANCE',baselineCommit:lineage.baselineCommit,lineage:verifyLineage(),index:47,name:'同道堂',sourcePhotosCopied:false,sourcePhotoRedistributed:false,imageGenerationUsed:false,cameras:views,states:{},productionSourceHashes:Object.fromEntries(['src/scene/zones/ZoneBase.js','src/scene/palace/special/RemainingResidentialHalls.js','src/scene/palace/special/TongdaoRoof.js','src/scene/palace/special/WestRearSouthWindows.js','src/scene/palace/kit.js','src/scene/RoofBuilder.js','src/utils/TextureLibrary.js','tests/r49b-plaque-cpu-render.py','scripts/r63-f-stage/export-combined.mjs'].map(p=>[p,hash(fs.readFileSync(p))])),limits:'Actual integrated local mesh + HD albedo/UV and plaque atlas. CPU raster omits WebGL normal maps/PBR/shadows/tone mapping. Source photographs are not copied. No historical, browser, full-building, or F55 acceptance.'};
let baselinePhysics,baselineRetained;
for(const [state,Builder] of [['before',Before],['after',ZoneBase]]){
 const temp=fs.mkdtempSync('/tmp/r63-f-combined-'),lib=new TextureLibrary();let f,group;
 try{
  lib.manifest=JSON.parse(fs.readFileSync('public/textures/hd/manifest.json'));
  for(const name of Object.keys(TEXTURE_SPECS))for(const kind of ['color','normal']){
   const file=lib.manifest.textures[name]?.[kind];if(!file)continue;
   const im=await loadImage(path.resolve('public/textures/hd',file)),canvas=createCanvas(im.width,im.height);canvas.getContext('2d').drawImage(im,0,0);
   (kind==='color'?lib.colors:lib.normals).set(name,lib.configure(new THREE.CanvasTexture(canvas),name,kind));
  }
  f=createLocal(Builder,47,lib);const snapshot=output(f),physics={colliders:snapshot.colliders,walkables:snapshot.walkables,rooms:snapshot.rooms,mapItems:snapshot.mapItems,regions:snapshot.regions},retained=retainedRows(f,{baseline:state==='before'});
  if(state==='before'){baselinePhysics=physics;baselineRetained=retained;assert.equal(f.frame.userData.tongdaoRoof,undefined);assert.equal(f.frame.userData.structure.westRearSouthWindows,undefined);}
  else{assert.deepEqual(physics,baselinePhysics);assert.deepEqual(retained,baselineRetained);assert.equal(f.frame.userData.tongdaoRoof?.roof,'xieshan');assert.equal(f.frame.userData.structure.westRearSouthWindows?.windowCount,4);}
  group=f.kit.finish();group.updateMatrixWorld(true);const scene=new THREE.Scene();scene.add(group);const cm=new CollisionManager();cm.rivers=[];cm.addColliders(f.kit.colliders);cm.addWalkables(f.kit.walkables);const W={scene,cm,rooms:f.kit.rooms};
  const consumer=state==='after'?{roof:assertTongdaoRoofInWorld(W),windows:assertWestRearSouthWindowsInWorld(W,47)}:null;
  const materials=[],ids=new Map(),triangles=[];
  function mid(m,colour=null){
   const key=m.uuid+'-'+(colour??'default');if(ids.has(key))return ids.get(key);const id=materials.length;let texture=null;
   if(m.map?.isDataTexture&&m.map.image?.data){
    const im=m.map.image,c=createCanvas(im.width,im.height),ctx=c.getContext('2d'),pixels=ctx.createImageData(im.width,im.height);assert.equal(im.data.length,im.width*im.height*4);
    for(let y=0;y<im.height;y++){const sy=m.map.flipY?y:im.height-1-y;pixels.data.set(im.data.subarray(sy*im.width*4,(sy+1)*im.width*4),y*im.width*4);}ctx.putImageData(pixels,0,0);texture=`texture-${id}.png`;fs.writeFileSync(path.join(temp,texture),c.toBuffer('image/png'));
   }else if(m.map?.image?.toBuffer){texture=`texture-${id}.png`;fs.writeFileSync(path.join(temp,texture),m.map.image.toBuffer('image/png'));}
   materials.push({name:m.name,color:colour??m.color?.getHexString()??'ffffff',texture,wrapS:m.map?.wrapS,wrapT:m.map?.wrapT,side:m.side,opacity:m.opacity??1,normalMapPresent:!!m.normalMap});ids.set(key,id);return id;
  }
  group.traverse(m=>{if(!m.isMesh)return;const a=m.geometry.attributes,p=a.position,ix=m.geometry.index;
   for(let i=0;i<(ix?.count??p.count);i+=3){const js=[0,1,2].map(j=>ix?ix.getX(i+j):i+j);triangles.push({role:m.userData.role??m.name,v:js.map(j=>new THREE.Vector3().fromBufferAttribute(p,j).applyMatrix4(m.matrixWorld).sub(new THREE.Vector3(config.items[47].x,0,config.items[47].z)).toArray()),uv:a.uv?js.map(j=>[a.uv.getX(j),a.uv.getY(j)]):null,material:mid(Array.isArray(m.material)?m.material[m.geometry.groups.find(k=>i>=k.start&&i<k.start+k.count)?.materialIndex]:m.material,a.color?new THREE.Color().fromBufferAttribute(a.color,js[0]).getHexString():null)});}
  });
  const payload=JSON.stringify({name:'Tongdao combined roof + south windows',state,materials,triangles,boundary:proof.scope});fs.writeFileSync(path.join(temp,'geometry.json'),payload);
  if(geometryOnly)assert.equal(hash(payload),previousProof.states[state].geometrySHA256,`${state}: actual combined geometry/material payload must remain byte-identical to captured source`);
  const images=[];
  for(const view of views){
   const filename=`tongdao-${view.name}-${state}.png`,file=path.join(destination,filename),rendered=path.join(temp,filename);
   if(geometryOnly){const prior=previousProof.states[state].images.find(i=>i.path===path.relative(process.cwd(),file));assert.ok(prior);assert.equal(hash(fs.readFileSync(file)),prior.sha256,'Retained CPU capture byte integrity');}
   else execFileSync('python',['tests/r49b-plaque-cpu-render.py',temp,rendered,JSON.stringify(view.eye),JSON.stringify(view.target),String(view.fov)],{stdio:'inherit'});
   if(geometryOnly){}
   else if(fs.existsSync(file)){assert.ok(repeat,'Output exists. Use --verify-existing to regenerate and prove identical pixels.');assert.equal(hash(fs.readFileSync(file)),hash(fs.readFileSync(rendered)),'Regenerated CPU PNG differs from existing capture; do not silently replace evidence');}
   else fs.copyFileSync(rendered,file);
   images.push({path:path.relative(process.cwd(),file),sha256:hash(fs.readFileSync(file)),camera:view});
  }
  proof.states[state]={dispatch:state==='before'?'SHA_CHECKED_FROZEN_R62_ZONEBASE_AND_REMAINING_RESIDENTIAL':'DIRECT_CURRENT_PRODUCTION_ZONEBASE_NO_REHEARSAL_OR_HOOK_REWRITE',triangles:triangles.length,meshes:snapshot.meshRows.length,materials:materials.length,geometrySHA256:hash(payload),physicsSHA256:hash(physics),retainedMeshSHA256:hash(retained),colliders:f.kit.colliders.length,supports:f.kit.walkables.length,roof:state==='after'?f.frame.userData.tongdaoRoof:null,windows:state==='after'?f.frame.userData.structure.westRearSouthWindows:null,consumer,images};
 }finally{if(f)f.dispose(group);else lib.dispose();fs.rmSync(temp,{recursive:true,force:true});}
}
assert.equal(proof.states.after.physicsSHA256,proof.states.before.physicsSHA256);
assert.equal(proof.states.after.retainedMeshSHA256,proof.states.before.retainedMeshSHA256);
proof.delta={triangles:proof.states.after.triangles-proof.states.before.triangles,colliders:0,supports:0};
if(geometryOnly){
 previousProof.postGuardVerification={mode:'ACTUAL_CURRENT_DISPATCH_GEOMETRY_BYTES_AND_EXISTING_PNG_BYTES_RECHECKED_WITHOUT_RERASTERIZATION',productionSourceHashes:proof.productionSourceHashes,states:Object.fromEntries(Object.entries(proof.states).map(([state,row])=>[state,{geometrySHA256:row.geometrySHA256,identicalCapturedGeometry:true,physicsSHA256:row.physicsSHA256,retainedMeshSHA256:row.retainedMeshSHA256,consumer:row.consumer,images:row.images}])),limits:proof.limits};
 fs.writeFileSync(path.join(destination,'proof.json'),JSON.stringify(previousProof,null,2)+'\n');
}else fs.writeFileSync(path.join(destination,'proof.json'),JSON.stringify(proof,null,2)+'\n');
console.log(JSON.stringify({scope:proof.scope,delta:proof.delta,images:Object.values(proof.states).flatMap(s=>s.images.map(i=>i.path))},null,2));
