// One actual isolated production gate. No world, source-photo texture, or browser claim.
import * as THREE from 'three';
import {createRequire} from 'node:module';
import {mkdirSync,writeFileSync,readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {TextureLibrary,TEXTURE_SPECS} from '../src/utils/TextureLibrary.js';
import {CourtKit} from '../src/scene/palace/kit.js';
const require=createRequire(import.meta.url),{createCanvas,loadImage,GlobalFonts}=require(process.env.R58_CANVAS_MODULE??'/tmp/r49-cpu-canvas/node_modules/@napi-rs/canvas');
GlobalFonts.registerFromPath('/usr/share/fonts/opentype/noto/NotoSerifCJK-Regular.ttc','SimSun');
globalThis.document={createElement:()=>createCanvas(1,1),createElementNS:()=>({addEventListener(){},removeEventListener(){}})};
const out=path.resolve(process.argv[2]),stage=process.argv[3]??'after';mkdirSync(out,{recursive:true});
const lib=new TextureLibrary();for(const key of Object.keys(TEXTURE_SPECS)){
 const img=await loadImage(path.resolve('public/textures/hd',key+'.webp')),canvas=createCanvas(img.width,img.height);canvas.getContext('2d').drawImage(img,0,0);
 const t=new THREE.CanvasTexture(canvas);lib.configure(t,key,'color');lib.colors.set(key,t);
}
const kit=new CourtKit(lib);kit.gate({name:'昭德门',x:0,z:0,gateProfile:'zhaode',gateKind:'three-bay',open:true});
const root=kit.finish();root.updateMatrixWorld(true);const triangles=[],materials=[],mids=new Map();
const mid=m=>{if(mids.has(m))return mids.get(m);const id=materials.length;let texture=null,dataTexture=null;
 if(m.map?.isDataTexture)dataTexture={width:m.map.image.width,height:m.map.image.height,data:[...m.map.image.data]};
 else if(m.map?.image?.toBuffer){texture=`texture-${id}.png`;writeFileSync(path.join(out,texture),m.map.image.toBuffer('image/png'));}
 materials.push({name:m.name,color:m.color?.getHexString()??'ffffff',texture,dataTexture,wrapS:m.map?.wrapS,wrapT:m.map?.wrapT,flipY:m.map?.flipY,side:m.side,opacity:m.opacity??1});mids.set(m,id);return id;};
root.traverse(m=>{if(!m.isMesh)return;const g=m.geometry,p=g.attributes.position,uv=g.attributes.uv,idx=g.index;
 for(let i=0;i<(idx?.count??p.count);i+=3){const ids=[0,1,2].map(k=>idx?idx.getX(i+k):i+k);triangles.push({v:ids.map(j=>new THREE.Vector3().fromBufferAttribute(p,j).applyMatrix4(m.matrixWorld).toArray()),uv:uv?ids.map(j=>[uv.getX(j),uv.getY(j)]):null,material:mid(m.material),role:m.name});}
});
const files=['src/scene/palace/special/ZhaodeSouthPanels.js','src/scene/palace/special/ZhaodeGate.js','src/scene/palace/special/ZhaodeGateProfile.js'];
const binding=Object.fromEntries(files.filter(existsSync).map(f=>[f,createHash('sha256').update(readFileSync(f)).digest('hex')]));
writeFileSync(path.join(out,'geometry.json'),JSON.stringify({stage,materials,triangles,binding,head:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),boundary:'ACTUAL_MERGED_PRODUCTION_TRIANGLES_AND_TEXTURES__CPU_ONLY__NOT_BROWSER_ACCEPTANCE'}));
writeFileSync(path.join(out,'capture.json'),JSON.stringify({stage,binding,triangleCount:triangles.length,draws:root.children.length,views:{south:{camera:[0,8.8,-39],target:[0,7.2,-1],fov:40},oblique:{camera:[22,10,-35],target:[0,7,-1],fov:44}},width:1200,height:900,light:'fixed CPU Lambert diagnostic, no cast shadows / PBR / tone mapping',rawOfficialPhotosIncluded:false,browserAcceptance:false},null,2)+'\n');
console.log(JSON.stringify({stage,triangles:triangles.length,draws:root.children.length,binding}));kit.dispose(root);lib.dispose();
