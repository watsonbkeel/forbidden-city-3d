// Isolated actual Wumen base triangles / production albedo, not a browser render.
import * as THREE from 'three';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {createCanvas,loadImage,GlobalFonts}=require(process.env.R58_CANVAS_MODULE??'/tmp/r49-cpu-canvas/node_modules/@napi-rs/canvas');
import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {TextureLibrary,TEXTURE_SPECS} from '../src/utils/TextureLibrary.js';
import {PalaceBuilder} from '../src/scene/PalaceBuilder.js';
import {PALACE_LAYOUT} from '../src/scene/Layout.js';
import {withWumenNorthPortals,restorePreWumenNorthPortals} from './lib/wumen-north-portal-fixture.mjs';
GlobalFonts.registerFromPath('/usr/share/fonts/opentype/noto/NotoSerifCJK-Regular.ttc','SimSun');
globalThis.document={createElement:()=>createCanvas(1,1),createElementNS:()=>({addEventListener(){},removeEventListener(){}})};
const out=path.resolve(process.argv[2]??'/tmp/r58-wumen-north-cpu');mkdirSync(out,{recursive:true});
const lib=new TextureLibrary();
for(const key of Object.keys(TEXTURE_SPECS)){
 const img=await loadImage(path.resolve('public/textures/hd',key+'.webp')),canvas=createCanvas(img.width,img.height);canvas.getContext('2d').drawImage(img,0,0);
 const t=new THREE.CanvasTexture(canvas);lib.configure(t,key,'color');lib.colors.set(key,t);
}
const data=PALACE_LAYOUT.find(x=>x.name==='午门'),builder=new PalaceBuilder(new THREE.Scene(),lib);let group;
builder.finish=g=>{group=g;g.updateMatrixWorld(true);return g;};builder.buildWumen(data);
const before=restorePreWumenNorthPortals({group,builder,lib,data}),after=withWumenNorthPortals(before);
const files=['src/scene/palace/special/WumenNorthPortal.js','src/scene/PalaceBuilder.js','tests/lib/wumen-north-portal-fixture.mjs'];
const binding=Object.fromEntries(files.map(f=>[f,createHash('sha256').update(readFileSync(f)).digest('hex')]));
for(const [stage,c] of Object.entries({before,after})){
 const dir=path.join(out,stage);mkdirSync(dir,{recursive:true});const triangles=[],materials=[],mids=new Map();
 const mid=m=>{if(mids.has(m))return mids.get(m);const id=materials.length;let texture=null;if(m.map?.image?.toBuffer){texture=`texture-${id}.png`;writeFileSync(path.join(dir,texture),m.map.image.toBuffer('image/png'));}
 materials.push({name:m.name,color:m.color?.getHexString()??'ffffff',texture,wrapS:m.map?.wrapS,wrapT:m.map?.wrapT,side:m.side,opacity:m.opacity??1});mids.set(m,id);return id;};
 c.group.traverse(m=>{if(!m.isMesh||new THREE.Box3().setFromObject(m).min.y>=12.00001)return;
  const g=m.geometry,p=g.attributes.position,uv=g.attributes.uv,idx=g.index;
  for(let i=0;i<(idx?.count??p.count);i+=3){const ids=[0,1,2].map(k=>idx?idx.getX(i+k):i+k),mat=Array.isArray(m.material)?m.material[g.groups.find(q=>i>=q.start&&i<q.start+q.count)?.materialIndex??0]:m.material;
   triangles.push({v:ids.map(j=>new THREE.Vector3().fromBufferAttribute(p,j).applyMatrix4(m.matrixWorld).toArray()),uv:uv?ids.map(j=>[uv.getX(j),uv.getY(j)]):null,material:mid(mat),role:m.name||mat.name});
  }
 });
 writeFileSync(path.join(dir,'geometry.json'),JSON.stringify({stage,materials,triangles,binding,scope:'Only actual Wumen meshes whose lower bound is <= retained 12 m platform; source reference photographs are excluded.',boundary:'CPU_PRODUCTION_TRIANGLES_WITH_ACTUAL_ALBEDO__NOT_BROWSER_ACCEPTANCE'}));
 console.log(JSON.stringify({stage,triangles:triangles.length,materials:materials.length}));
}
writeFileSync(path.join(out,'capture.json'),JSON.stringify({binding,views:{northOblique:{camera:[32,11,80],target:[0,5.2,18.6],fov:43},northCenter:{camera:[0,5.3,38],target:[0,4.4,18.6],fov:42}},width:1200,height:900,renderer:'tests/r49b-plaque-cpu-render.py',quality:'hd production albedo; CPU fixed diagnostic light',browserAcceptance:false},null,2)+'\n');
