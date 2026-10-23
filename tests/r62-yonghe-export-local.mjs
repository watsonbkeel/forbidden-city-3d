// Only one actual local production hall, never a full world/browser build.
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import {gzipSync} from 'node:zlib';
import * as THREE from 'three';
const require=createRequire(import.meta.url);
const {createCanvas,loadImage,GlobalFonts}=require(process.env.R62_CANVAS_MODULE??'/tmp/r49-cpu-canvas/node_modules/@napi-rs/canvas');
GlobalFonts.registerFromPath('/usr/share/fonts/opentype/noto/NotoSerifCJK-Regular.ttc','SimSun');
globalThis.document={createElement:()=>createCanvas(1,1),createElementNS:()=>({addEventListener(){},removeEventListener(){}})};
const {fixture,meshes,sha,snapshot,audit,item}=await import('./lib/r62-yonghe-knees-qa.mjs');
const {TextureLibrary,TEXTURE_SPECS}=await import('../src/utils/TextureLibrary.js');
const state=process.argv[2]??'before',out=path.resolve('reports/r62-yonghe-canopy-knees'),temp=fs.mkdtempSync('/tmp/r62-yonghe-cpu-');fs.mkdirSync(out,{recursive:true});
const lib=new TextureLibrary();lib.manifest=JSON.parse(fs.readFileSync('public/textures/hd/manifest.json'));
for(const name of Object.keys(TEXTURE_SPECS))for(const kind of ['color','normal']){
 const file=lib.manifest.textures[name]?.[kind];if(!file)continue;
 const img=await loadImage(path.resolve('public/textures/hd',file)),canvas=createCanvas(img.width,img.height);canvas.getContext('2d').drawImage(img,0,0);
 const texture=lib.configure(new THREE.CanvasTexture(canvas),name,kind);(kind==='color'?lib.colors:lib.normals).set(name,texture);
}
const f=fixture(lib);if(state==='after'){const {buildYongheCanopyKnees}=await import('../src/scene/palace/special/YongheCanopyKnees.js');buildYongheCanopyKnees(f.kit,f.frame,item);}
f.kit.buildPlaqueAtlas();f.frame.updateMatrixWorld(true);
const materials=[],ids=new Map(),triangles=[];
function mid(m){if(ids.has(m))return ids.get(m);const id=materials.length;let texture=null;if(m.map?.image?.toBuffer){texture=`texture-${id}.png`;fs.writeFileSync(path.join(temp,texture),m.map.image.toBuffer('image/png'));}materials.push({name:m.name,color:m.color.getHexString(),texture,wrapS:m.map?.wrapS,wrapT:m.map?.wrapT,side:m.side});ids.set(m,id);return id;}
for(const m of meshes(f.frame)){const g=m.geometry,p=g.attributes.position,uv=g.attributes.uv,idx=g.index;for(let i=0;i<(idx?.count??p.count);i+=3){const v=[0,1,2].map(j=>idx?idx.getX(i+j):i+j);triangles.push({role:m.userData.role??m.name,v:v.map(j=>new THREE.Vector3().fromBufferAttribute(p,j).applyMatrix4(m.matrixWorld).sub(new THREE.Vector3(item.x,0,item.z)).toArray()),uv:uv?v.map(j=>[uv.getX(j),uv.getY(j)]):null,material:mid(m.material)});}}
const payload=JSON.stringify({name:'永和宫',state,materials,triangles,boundary:'ACTUAL LOCAL GEOMETRY AND PRODUCTION ALBEDO/UV; NOT GPU OR VISUAL ACCEPTANCE'});fs.writeFileSync(path.join(temp,'geometry.json'),payload);fs.writeFileSync(path.join(out,`${state}-geometry.json.gz`),gzipSync(payload));
const views=[{name:'front-canopy',camera:[0,2.3,-19],target:[0,6,-8.2],fov:70},{name:'east-junction-detail',camera:[-5.6,4.7,-11.8],target:[-2.4,6.25,-8.2],fov:52}];
for(const v of views){const file=path.join(out,`${v.name}-${state}.png`);execFileSync('python',['tests/r49b-plaque-cpu-render.py',temp,file,JSON.stringify(v.camera),JSON.stringify(v.target),String(v.fov)],{stdio:'inherit'});v.path=path.relative(process.cwd(),file);v.sha256=sha(fs.readFileSync(file));}
const sourceFiles=['tests/fixtures/r62-yonghe/EastResidentialFacades.R61.js.txt','tests/lib/r62-yonghe-knees-qa.mjs','tests/r62-yonghe-export-local.mjs','src/scene/palace/special/EastResidentialFacades.js','data/zones/east-six.json','src/scene/zones/ZoneBase.js','public/textures/hd/manifest.json'];if(state==='after')sourceFiles.push('src/scene/palace/special/YongheCanopyKnees.js');
const proof={state,baselineHead:'6b396800b6a03582aebf513fcef4966e9f5d0db3',scope:'FROZEN R61 ORIGINAL BUILDER PLUS OPTIONAL HELPER; ONE LOCAL HALL; SOURCE-HASH-BOUND CPU DIAGNOSTIC, NOT BROWSER ACCEPTANCE',sourceFiles:Object.fromEntries(sourceFiles.map(p=>[p,sha(fs.readFileSync(p))])),triangles:triangles.length,geometrySha256:sha(payload),retainedSnapshot:snapshot(f),qa:audit(f),views,limitations:['CPU actual albedo and UV only, not production WebGL PBR, normal mapping, dynamic shadow, tone mapping or performance.','Official reference photographs remain outside repository/public/package.','Photo date and carving subjects unknown. All new contour dimensions and color are reversible model FIT, not surveyed.']};
fs.writeFileSync(path.join(out,`${state}-proof.json`),JSON.stringify(proof,null,2)+'\n');console.log(JSON.stringify({state,triangles:triangles.length,qa:proof.qa,geometrySha256:proof.geometrySha256},null,2));f.dispose();lib.dispose();
