// One local hall only, with actual production materials/UVs/texture pixels.
// No world construction, browser launch, permission escalation, or official
// image redistribution. Uses the existing R49B CPU raster as a diagnostic.
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import {gzipSync} from 'node:zlib';
import * as THREE from 'three';
import {sha,meshes,arrowKneeSnapshot,auditArrowSouthKnees} from '../../tests/lib/r59-arrow-knees-qa.mjs';
import {arrowBaselineSource} from '../../tests/lib/r59-arrow-baseline.mjs';
const require=createRequire(import.meta.url);
const {createCanvas,loadImage,GlobalFonts}=require(process.env.R59_CANVAS_MODULE??'/tmp/r49-cpu-canvas/node_modules/@napi-rs/canvas');
GlobalFonts.registerFromPath('/usr/share/fonts/opentype/noto/NotoSerifCJK-Regular.ttc','SimSun');
globalThis.document={createElement:()=>createCanvas(1,1),createElementNS:()=>({addEventListener(){},removeEventListener(){}})};
const {TextureLibrary,TEXTURE_SPECS}=await import('../../src/utils/TextureLibrary.js');
const {CourtKit}=await import('../../src/scene/palace/kit.js');
const {buildEnclosedPavilion}=await import('../../src/scene/palace/special/EnclosedPavilions.js');
const {buildArrowSouthKnees}=await import('../../src/scene/palace/special/ArrowSouthKnees.js');
const baselineHead='2b983ae82e50e23fd55bbe0845942a0a3855f8dd',source='src/scene/palace/special/EnclosedPavilions.js',newSource='src/scene/palace/special/ArrowSouthKnees.js';
let original=arrowBaselineSource();
original=original.replace(/from\s+(['"])([^'"]+)\1/g,(_,q,id)=>`from ${q}${id==='three'?import.meta.resolve('three'):new URL(id,new URL('../../'+source,import.meta.url)).href}${q}`);
const baselineModule=await import('data:text/javascript;base64,'+Buffer.from(original).toString('base64'));
const out=path.resolve(process.argv[2]??'reports/r59-arrow-south-knees/cpu'),temporary=fs.mkdtempSync('/tmp/r59-arrow-cpu-');fs.mkdirSync(out,{recursive:true});
const data=JSON.parse(fs.readFileSync('data/zones/outer-east.json')),item=data.items.find(i=>i.name==='箭亭');
async function localFixture(builder,add){
 const lib=new TextureLibrary();lib.manifest=JSON.parse(fs.readFileSync('public/textures/hd/manifest.json'));
 for(const name of Object.keys(TEXTURE_SPECS))for(const kind of ['color','normal']){
  const entry=lib.manifest.textures[name],file=entry?.[kind];if(!file)continue;
  const img=await loadImage(path.resolve('public/textures/hd',file));const canvas=createCanvas(img.width,img.height);canvas.getContext('2d').drawImage(img,0,0);
  const t=lib.configure(new THREE.CanvasTexture(canvas),name,kind);(kind==='color'?lib.colors:lib.normals).set(name,t);
 }
 const kit=new CourtKit(lib),{f:frame}=builder(kit,item);
 if(add&&!meshes(frame).some(m=>m.userData.role==='arrow-south-central-knee'))buildArrowSouthKnees(kit,frame,item);
 // Production atlas creation is included for both states; no fake blank signs.
 kit.buildPlaqueAtlas();frame.updateMatrixWorld(true);return{kit,frame,lib};
}
function exportGeometry(f,state){
 const dir=path.join(temporary,state);fs.mkdirSync(dir);const materials=[],materialIds=new Map(),triangles=[];
 function mid(m){if(materialIds.has(m))return materialIds.get(m);const id=materials.length;let texture=null;if(m.map?.image?.toBuffer){texture=`texture-${id}.png`;fs.writeFileSync(path.join(dir,texture),m.map.image.toBuffer('image/png'));}
  materials.push({name:m.name,color:m.color?.getHexString()??'ffffff',texture,wrapS:m.map?.wrapS,wrapT:m.map?.wrapT,side:m.side,opacity:m.opacity??1,roughness:m.roughness,metalness:m.metalness,normalMapPresent:!!m.normalMap});materialIds.set(m,id);return id;
 }
 for(const m of meshes(f.frame)){const g=m.geometry,p=g.attributes.position,uv=g.attributes.uv,idx=g.index;
  for(let i=0;i<(idx?.count??p.count);i+=3){const ids=[0,1,2].map(j=>idx?idx.getX(i+j):i+j);triangles.push({role:m.userData.role??m.name,v:ids.map(j=>new THREE.Vector3().fromBufferAttribute(p,j).applyMatrix4(m.matrixWorld).sub(new THREE.Vector3(item.x,0,item.z)).toArray()),uv:uv?ids.map(j=>[uv.getX(j),uv.getY(j)]):null,material:mid(m.material)});}
 }
 const payload=JSON.stringify({name:'箭亭',state,materials,triangles,boundary:'ACTUAL LOCAL PRODUCTION GEOMETRY/ALBEDO/UV; CPU NOT BROWSER OR VISUAL ACCEPTANCE'});
 fs.writeFileSync(path.join(dir,'geometry.json'),payload);fs.writeFileSync(path.join(out,`${state}-geometry.json.gz`),gzipSync(payload));
 return{dir,triangles:triangles.length,materials:materials.length,geometrySha256:sha(payload)};
}
const before=await localFixture(baselineModule.buildEnclosedPavilion,false),after=await localFixture(buildEnclosedPavilion,true),beforeSnapshot=arrowKneeSnapshot(before),afterSnapshot=arrowKneeSnapshot(after);
if(JSON.stringify(beforeSnapshot)!==JSON.stringify(afterSnapshot))throw Error('Actual material/UV baseline differs outside the new knees');
const evidence={kind:'CPU ACTUAL PRODUCTION ALBEDO/UV; NOT BROWSER/GPU/ACCEPTED',baselineHead,head:process.env.R59_CAPTURE_HEAD??null,captureBinding:'Explicit source hashes below bind the capture; optional R59_CAPTURE_HEAD is only caller-supplied metadata. Baseline source is the SHA-checked repository fixture, with no local Git object requirement.',sourceFiles:Object.fromEntries([source,newSource,'data/zones/outer-east.json','public/textures/hd/manifest.json'].map(p=>[p,sha(fs.readFileSync(p))])),retainedActualMaterialSnapshot:beforeSnapshot,qa:auditArrowSouthKnees({...after,baseline:beforeSnapshot}),state:{},views:[
 {name:'south-wide',camera:[0,1.7,-35],target:[0,6.9,-8.8],fov:55,positionStatus:'COURTYARD_GROUND_EYE'},
 {name:'central-front',camera:[0,2.6,-16],target:[0,8.1,-8.8],fov:50,positionStatus:'PLATFORM_EYE_HEIGHT_LOCAL_DETAIL_DIAGNOSTIC'},
 {name:'central-oblique',camera:[7,5.8,-14],target:[1.4,8.2,-8.8],fov:40,positionStatus:'ELEVATED_DETAIL_DIAGNOSTIC_NOT_WALKABLE_CAMERA'},
 ],limitations:['CPU z-buffer uses actual mesh albedo and UVs but not production WebGL normal mapping, PBR, shadows, tone mapping, postprocessing or GPU performance.','Current main/Pages/credentials unchanged. No official photograph included.','Reference capture date unknown. Gray paint and depth are fitted, not measured.']};
for(const[state,f]of[['before',before],['after',after]]){
 const exported=exportGeometry(f,state);evidence.state[state]={triangles:exported.triangles,materials:exported.materials,geometrySha256:exported.geometrySha256};
 for(const v of evidence.views){const file=path.join(out,`${v.name}-${state}.png`);execFileSync('python',['tests/r49b-plaque-cpu-render.py',exported.dir,file,JSON.stringify(v.camera),JSON.stringify(v.target),String(v.fov)],{stdio:'inherit'});(v.images??={})[state]={path:path.relative(process.cwd(),file),sha256:sha(fs.readFileSync(file))};}
 const finished=f.kit.finish();f.kit.dispose(finished);f.lib.dispose();
}
fs.writeFileSync(path.join(out,'proof.json'),JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify({out,temporary,state:evidence.state,retainedExact:evidence.qa.retainedExact,sourceFiles:evidence.sourceFiles},null,2));
