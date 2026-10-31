import * as T from 'three';
import fs from 'node:fs';
import path from 'node:path';
import {registerHooks,createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const mode=process.env.WUMEN_MODE??'candidate',tag=process.env.CPU_TAG??'first',base='36908b2c';
if(!['candidate','parent'].includes(mode))throw Error('Explicit CPU stage required');
if(mode==='parent')registerHooks({load(u,c,next){for(const p of['src/scene/PalaceBuilder.js','src/scene/palace/special/GateTowerProfiles.js','src/scene/palace/special/GateTowerShell.js','src/scene/palace/special/WumenTransverseLinks.js'])if(u.endsWith('/'+p))return{format:'module',source:execFileSync('git',['show',base+':'+p],{encoding:'utf8'}),shortCircuit:true};return next(u,c);}});
const {createCanvas,loadImage}=createRequire(import.meta.url)('@napi-rs/canvas');
globalThis.document={createElement:()=>createCanvas(1,1),createElementNS:()=>({addEventListener(){},removeEventListener(){}})};
const {TextureLibrary,TEXTURE_SPECS}=await import('../../../../src/utils/TextureLibrary.js'),{PalaceBuilder}=await import('../../../../src/scene/PalaceBuilder.js'),{PALACE_LAYOUT}=await import('../../../../src/scene/Layout.js');
const lib=new TextureLibrary();for(const key of Object.keys(TEXTURE_SPECS)){const img=await loadImage(path.resolve('public/textures/hd',key+'.webp')),canvas=createCanvas(img.width,img.height);canvas.getContext('2d').drawImage(img,0,0);const tex=new T.CanvasTexture(canvas);lib.configure(tex,key,'color');lib.colors.set(key,tex);}
const out='../audit-wumen-completion-20261031/cpu-'+mode+'-'+tag;fs.mkdirSync(out,{recursive:true});
const scene=new T.Scene(),b=new PalaceBuilder(scene,lib);let sourceStats;
const stats=root=>{let meshes=0,triangles=0,bytes=0;const geos=new Set();root.traverse(m=>{if(m.isMesh){meshes++;triangles+=(m.geometry.index?.count??m.geometry.attributes.position.count)/3;geos.add(m.geometry);}});for(const g of geos){for(const a of Object.values(g.attributes))bytes+=a.array.byteLength;if(g.index)bytes+=g.index.array.byteLength;}return{meshes,triangles,bytes,uniqueGeometries:geos.size};};
b.finish=g=>{sourceStats=stats(g);return PalaceBuilder.prototype.finish.call(b,g);};
try{b.buildGate(PALACE_LAYOUT.find(x=>x.name==='午门'));scene.updateMatrixWorld(true);const materials=[],mids=new Map(),triangles=[];
 const mid=m=>{if(mids.has(m))return mids.get(m);const id=materials.length;let texture=null;if(m.map?.image?.toBuffer){texture='texture-'+id+'.png';fs.writeFileSync(path.join(out,texture),m.map.image.toBuffer('image/png'));}materials.push({name:m.name,color:m.color.getHexString(),texture,wrapS:m.map?.wrapS,wrapT:m.map?.wrapT,side:m.side,opacity:m.opacity});mids.set(m,id);return id;};
 scene.traverse(m=>{if(!m.isMesh)return;const g=m.geometry,p=g.attributes.position,uv=g.attributes.uv,ix=g.index;for(let i=0;i<(ix?.count??p.count);i+=3){const ids=[0,1,2].map(k=>ix?ix.getX(i+k):i+k),mat=Array.isArray(m.material)?m.material[g.groups.find(q=>i>=q.start&&i<q.start+q.count).materialIndex]:m.material;triangles.push({v:ids.map(j=>new T.Vector3().fromBufferAttribute(p,j).applyMatrix4(m.matrixWorld).toArray()),uv:uv?ids.map(j=>[uv.getX(j),uv.getY(j)]):null,material:mid(mat),role:m.name});}});
 fs.writeFileSync(path.join(out,'geometry.json'),JSON.stringify({materials,triangles,scope:'Actual final merged whole Wumen; production albedo, CPU fixed lighting only. Not WebGL/shadow/performance/source acceptance.'}));
 const fits=JSON.parse(fs.readFileSync('../audit-wumen-completion-20261031/lower-camera-fits.json')),views=[];
 for(const side of['north','south']){const fit=fits[side].fixedEyeFamilies[0],size=fits[side].imageSize,camera=new T.PerspectiveCamera(fit.fovDegrees,size[0]/size[1],.03,1000);camera.position.fromArray(fit.positionWorld);camera.quaternion.fromArray(fit.quaternionXYZW);camera.updateMatrixWorld(true);views.push({name:side+'-source-conditioned',label:mode+' '+side+' conditional1.7m camera; not measured',size,position:camera.position.toArray(),matrixWorldInverse:camera.matrixWorldInverse.toArray(),fov:camera.fov,rmsControlPixels:fit.rmsPixels});}
 for(const[side,s]of[['east',-1],['west',1]]){const camera=new T.PerspectiveCamera(65,4/3,.03,500);camera.position.set(s*30,3,-444);camera.lookAt(s*46,3,-435.5);camera.updateMatrixWorld(true);views.push({name:side+'-side-mouth-diagnostic',label:mode+' '+side+' side mouth ENGINEERING VIEW',size:[800,600],position:camera.position.toArray(),matrixWorldInverse:camera.matrixWorldInverse.toArray(),fov:camera.fov});}
 const cost={mode,base,scope:'Whole Wumen CPU scene metrics, not GPU draw calls',source:sourceStats,merged:stats(scene),colliders:b.colliders.length,triangleOwners:b.colliders.filter(c=>c.triangleSupport).length,walkables:b.walkables.length,geometrySHA256:createHash('sha256').update(fs.readFileSync(path.join(out,'geometry.json'))).digest('hex')};fs.writeFileSync(path.join(out,'cost.json'),JSON.stringify(cost,null,2));console.log(JSON.stringify(cost));
 for(const v of views){const f=path.join(out,v.name+'.json');fs.writeFileSync(f,JSON.stringify(v,null,2));if(process.env.CPU_IMAGES!=='0')execFileSync('python',['scripts/photo-fidelity/batches/r157-a37/render-wumen-cpu.py',out,path.join(out,v.name+'.png'),f],{stdio:'inherit'});}
}finally{b.dispose();lib.dispose();}
