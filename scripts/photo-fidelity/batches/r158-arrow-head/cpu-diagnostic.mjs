// Actual current Arrow source, real project albedo/UV/atlas. CPU diagnostic,
// NOT browser/PBR/shadow/GPU acceptance; no reference photo pixels republished.
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
import {createRequire} from 'node:module';import {execFileSync} from 'node:child_process';
import * as THREE from 'three';
import {applyArrowSouthHeadBands} from '../../../../src/scene/palace/special/ArrowSouthHeadBands.js';
const {createCanvas,loadImage,GlobalFonts}=createRequire(import.meta.url)('@napi-rs/canvas');
GlobalFonts.registerFromPath('/usr/share/fonts/opentype/noto/NotoSerifCJK-Regular.ttc','SimSun');
globalThis.document={createElement:()=>createCanvas(1,1),createElementNS:()=>({addEventListener(){},removeEventListener(){}})};
const {fixture}=await import('../../../../tests/lib/r158-arrow-head-fixture.mjs');
const {TextureLibrary,TEXTURE_SPECS}=await import('../../../../src/utils/TextureLibrary.js');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const out=path.resolve(process.argv[2]??'/tmp/r158-arrow-head-cpu');fs.mkdirSync(out,{recursive:true});
const views=[{name:'south-wide',camera:[0,2.8,-35],target:[0,6.2,-6.8],fov:55},{name:'south-head-detail',camera:[-5.5,7.1,-16],target:[-5.5,7.15,-6.8],fov:42}];
const files=['src/scene/palace/special/ArrowSouthHeadBands.js','src/scene/palace/special/EnclosedPavilions.js','src/scene/palace/special/ArrowSouthDoorLattice.js','src/scene/palace/special/ArrowSouthNameboard.js','data/zones/outer-east.json'];
const proof={sourceCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),sourceHashes:Object.fromEntries(files.map(p=>[p,hash(fs.readFileSync(p))])),scope:'ACTUAL_CURRENT_LOCAL_PRODUCTION_ARROW_SOURCE_WITH_ONLY_NEW_FINALIZER_AFTER_BUILD; CPU_NOT_GPU',views,states:{},limitations:['Plain grey-blue fields are a colour/composition cue, not exact painted motifs or historical pigments.','Source footprint/height and unseen/occluded bays are not corrected.','No production hook installed in this tree.']};
for(const state of['before','after']){
 const lib=new TextureLibrary();lib.manifest=JSON.parse(fs.readFileSync('public/textures/hd/manifest.json'));
 for(const name of Object.keys(TEXTURE_SPECS))for(const kind of['color','normal']){const file=lib.manifest.textures[name]?.[kind];if(!file)continue;const img=await loadImage(path.resolve('public/textures/hd',file)),c=createCanvas(img.width,img.height);c.getContext('2d').drawImage(img,0,0);const t=lib.configure(new THREE.CanvasTexture(c),name,kind);(kind==='color'?lib.colors:lib.normals).set(name,t);}
 const f=fixture(lib);if(state==='after')applyArrowSouthHeadBands(f.kit,f.frame,f.item);f.kit.buildPlaqueAtlas();f.kit.root.updateMatrixWorld(true);
 const dir=path.join(out,state);fs.mkdirSync(dir,{recursive:true});const materials=[],ids=new Map(),triangles=[];
 function material(m){if(ids.has(m))return ids.get(m);const id=materials.length;let texture=null;if(m.map?.image?.toBuffer){texture=`texture-${id}.png`;fs.writeFileSync(path.join(dir,texture),m.map.image.toBuffer('image/png'));}materials.push({name:m.name,color:m.color?.getHexString()??'ffffff',texture,side:m.side,wrapS:m.map?.wrapS,wrapT:m.map?.wrapT});ids.set(m,id);return id;}
 let meshes=0;f.frame.traverse(m=>{if(!m.isMesh)return;meshes++;const p=m.geometry.attributes.position,uv=m.geometry.attributes.uv,idx=m.geometry.index;for(let i=0;i<(idx?.count??p.count);i+=3){const js=[0,1,2].map(k=>idx?idx.getX(i+k):i+k);triangles.push({v:js.map(j=>new THREE.Vector3().fromBufferAttribute(p,j).applyMatrix4(m.matrixWorld).sub(new THREE.Vector3(f.item.x,0,f.item.z)).toArray()),uv:uv?js.map(j=>[uv.getX(j),uv.getY(j)]):null,material:material(m.material)});}});
 const data=JSON.stringify({materials,triangles});fs.writeFileSync(path.join(dir,'geometry.json'),data);proof.states[state]={triangles:triangles.length,meshes,materials:materials.length,geometrySha256:hash(data)};
 for(const v of views){const file=path.join(out,`${v.name}-${state}.png`);execFileSync('python',['tests/r49b-plaque-cpu-render.py',dir,file,JSON.stringify(v.camera),JSON.stringify(v.target),String(v.fov)],{stdio:'inherit'});(v.images??={})[state]={file:path.basename(file),sha256:hash(fs.readFileSync(file))};}
 const merged=f.kit.finish();f.kit.dispose(merged);lib.dispose();
}
fs.writeFileSync(path.join(out,'proof.json'),JSON.stringify(proof,null,2)+'\n');console.log(JSON.stringify({out,states:proof.states}));
