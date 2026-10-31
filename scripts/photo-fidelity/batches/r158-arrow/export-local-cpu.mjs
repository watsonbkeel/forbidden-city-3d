// Diagnostic only: one actual Arrow hall, production textures/UVs and atlas.
// NOT a browser capture and NOT evidence of full visual acceptance.
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import * as THREE from 'three';
import {sha,meshes} from '../../../../tests/lib/r59-arrow-knees-qa.mjs';
import {applyArrowSouthDoorLattice} from '../../../../src/scene/palace/special/ArrowSouthDoorLattice.js';
const mode=process.env.R158_CPU_DIFFERENCE??'lattice';
const nameboard=mode==='nameboard'?await import('../../../../src/scene/palace/special/ArrowSouthNameboard.js'):null;
const require=createRequire(import.meta.url),{createCanvas,loadImage,GlobalFonts}=require(process.env.R158_CANVAS_MODULE??'@napi-rs/canvas');
GlobalFonts.registerFromPath('/usr/share/fonts/opentype/noto/NotoSerifCJK-Regular.ttc','SimSun');
globalThis.document={createElement:()=>createCanvas(1,1),createElementNS:()=>({addEventListener(){},removeEventListener(){}})};
const {fixture}=await import('../../../../tests/lib/r158-arrow-south-lattice-fixture.mjs');
const {TextureLibrary,TEXTURE_SPECS}=await import('../../../../src/utils/TextureLibrary.js');
const out=path.resolve(process.argv[2]??'/tmp/r158-arrow-cpu');fs.mkdirSync(out,{recursive:true});
const views=[{name:'south-secondary-detail',camera:[5.5,4.6,-14.5],target:[5.5,4.5,-6.8],fov:42},{name:'south-wide',camera:[0,2.8,-35],target:[0,6.2,-6.8],fov:55}];
const proof={mode,scope:'ONE ACTUAL LOCAL HALL; CPU NOT BROWSER OR ACCEPTANCE',photographyDate:null,sourceFiles:Object.fromEntries(['src/scene/palace/special/ArrowSouthDoorLattice.js','src/scene/palace/special/EnclosedPavilions.js','src/scene/palace/special/ArrowSouthKnees.js','data/zones/outer-east.json','tests/lib/r158-arrow-south-lattice-fixture.mjs'].map(p=>[p,sha(fs.readFileSync(p))])),views,states:{},limitations:['No production PBR/shadow/postprocess/GPU result.','Reference photograph remains external/private and is not republished.','Direction/colour cue only; intricate pattern, glazing/openwork and exact dimensions remain unresolved.']};
for(const state of['before','after']){
 const lib=new TextureLibrary();lib.manifest=JSON.parse(fs.readFileSync('public/textures/hd/manifest.json'));
 for(const name of Object.keys(TEXTURE_SPECS))for(const kind of['color','normal']){const file=lib.manifest.textures[name]?.[kind];if(!file)continue;const img=await loadImage(path.resolve('public/textures/hd',file)),canvas=createCanvas(img.width,img.height);canvas.getContext('2d').drawImage(img,0,0);const t=lib.configure(new THREE.CanvasTexture(canvas),name,kind);(kind==='color'?lib.colors:lib.normals).set(name,t);}
 const f=fixture(lib);if(mode==='nameboard'||state==='after')applyArrowSouthDoorLattice(f.kit,f.frame,f.item);if(mode==='nameboard'&&state==='after')nameboard.removeArrowUnsupportedCentralNameboard(f.kit,f.frame,f.item);f.kit.buildPlaqueAtlas();f.kit.root.updateMatrixWorld(true);
 const dir=path.join(out,state);fs.mkdirSync(dir,{recursive:true});const mats=[],ids=new Map(),triangles=[];
 function material(m){if(ids.has(m))return ids.get(m);const id=mats.length;let texture=null;if(m.map?.image?.toBuffer){texture=`texture-${id}.png`;fs.writeFileSync(path.join(dir,texture),m.map.image.toBuffer('image/png'));}mats.push({name:m.name,color:m.color?.getHexString()??'ffffff',texture,side:m.side,wrapS:m.map?.wrapS,wrapT:m.map?.wrapT});ids.set(m,id);return id;}
 for(const m of meshes(f.frame)){const p=m.geometry.attributes.position,uv=m.geometry.attributes.uv,idx=m.geometry.index;for(let i=0;i<(idx?.count??p.count);i+=3){const ids=[0,1,2].map(j=>idx?idx.getX(i+j):i+j);triangles.push({v:ids.map(j=>new THREE.Vector3().fromBufferAttribute(p,j).applyMatrix4(m.matrixWorld).sub(new THREE.Vector3(f.item.x,0,f.item.z)).toArray()),uv:uv?ids.map(j=>[uv.getX(j),uv.getY(j)]):null,material:material(m.material)});}}
 const data=JSON.stringify({materials:mats,triangles});fs.writeFileSync(path.join(dir,'geometry.json'),data);proof.states[state]={triangles:triangles.length,meshes:meshes(f.frame).length,materials:mats.length,geometrySha256:sha(data)};
 for(const view of views){const file=path.join(out,`${view.name}-${state}.png`);execFileSync('python',['tests/r49b-plaque-cpu-render.py',dir,file,JSON.stringify(view.camera),JSON.stringify(view.target),String(view.fov)],{stdio:'inherit'});(view.images??={})[state]={file:path.basename(file),sha256:sha(fs.readFileSync(file))};}
 const merged=f.kit.finish();f.kit.dispose(merged);lib.dispose();
}
if(nameboard)proof.sourceFiles['src/scene/palace/special/ArrowSouthNameboard.js']=sha(fs.readFileSync('src/scene/palace/special/ArrowSouthNameboard.js'));
fs.writeFileSync(path.join(out,'proof.json'),JSON.stringify(proof,null,2)+'\n');console.log(JSON.stringify({out,states:proof.states}));
