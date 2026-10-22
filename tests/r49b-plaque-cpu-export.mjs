// Actual production geometry/material/UV export. Offline rasterization is not GPU acceptance.
import {createRequire} from 'node:module';
import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
const require=createRequire(import.meta.url);
const {createCanvas,loadImage,GlobalFonts}=require(process.env.R49_CANVAS_MODULE??'/tmp/r49-cpu-canvas/node_modules/@napi-rs/canvas');
GlobalFonts.registerFromPath('/usr/share/fonts/opentype/noto/NotoSerifCJK-Regular.ttc','SimSun');
globalThis.document={createElement:()=>createCanvas(1,1),createElementNS:()=>({addEventListener(){},removeEventListener(){}})};
const root=path.resolve(process.argv[2]??'.'),zone=process.argv[3]??'east-six',name=process.argv[4]??'永和宫',out=path.resolve(process.argv[5]??'/tmp/r49b-cpu');
mkdirSync(out,{recursive:true});
const imp=p=>import(pathToFileURL(path.join(root,p)));
const THREE=await imp('node_modules/three/build/three.module.js');
const {TextureLibrary,TEXTURE_SPECS}=await imp('src/utils/TextureLibrary.js'),{ZoneBase}=await imp('src/scene/zones/ZoneBase.js');
const lib=new TextureLibrary();
for(const key of Object.keys(TEXTURE_SPECS)){
 const img=await loadImage(path.join(root,'public/textures/hd',key+'.webp'));
 const canvas=createCanvas(img.width,img.height);canvas.getContext('2d').drawImage(img,0,0);
 const t=new THREE.CanvasTexture(canvas);lib.configure(t,key,'color');lib.colors.set(key,t);
}
const data=JSON.parse(readFileSync(path.join(root,'data/zones',zone+'.json'))),item=data.items.find(i=>i.name===name),z=new ZoneBase(lib,data),b=z.buildHall(item);
const plaqueInfo=z.kit.plaques.map(p=>({text:p.text,position:p.mesh.position.toArray(),size:[p.mesh.geometry.parameters.width*p.mesh.scale.x,p.mesh.geometry.parameters.height*p.mesh.scale.y]}));
const scene=process.argv.includes('--unmerged')?(z.kit.buildPlaqueAtlas(),z.kit.root):z.kit.finish();scene.updateMatrixWorld(true);const triangles=[],materials=[],mids=new Map();
function mid(m){if(mids.has(m))return mids.get(m);const id=materials.length;let texture=null;if(m.map?.image?.toBuffer){texture='texture-'+id+'.png';writeFileSync(path.join(out,texture),m.map.image.toBuffer('image/png'));}materials.push({name:m.name,color:m.color?.getHexString()??'ffffff',texture,wrapS:m.map?.wrapS,wrapT:m.map?.wrapT,side:m.side,opacity:m.opacity??1});mids.set(m,id);return id;}
scene.traverse(m=>{if(!m.isMesh||!m.material)return;const g=m.geometry,a=g.attributes.position,uv=g.attributes.uv,index=g.index,n=index?.count??a.count;
 for(let i=0;i<n;i+=3){const ids=[0,1,2].map(j=>index?index.getX(i+j):i+j),mat=Array.isArray(m.material)?m.material[g.groups.find(q=>i>=q.start&&i<q.start+q.count)?.materialIndex??0]:m.material;triangles.push({plaque:z.kit.plaques.flatMap(p=>m===p.mesh?[{text:p.text,part:'face'}]:m===p.frame?[{text:p.text,part:'backing'}]:[])[0]??null,role:m.name||m.userData.role||mat.name,lineage:(()=>{const a=[];let q=m;while(q){a.push(q.name);q=q.parent;}return a;})(),v:ids.map(j=>new THREE.Vector3().fromBufferAttribute(a,j).applyMatrix4(m.matrixWorld).sub(new THREE.Vector3(item.x,0,item.z)).toArray()),uv:uv?ids.map(j=>[uv.getX(j),uv.getY(j)]):null,material:mid(mat)});}
});
writeFileSync(path.join(out,'geometry.json'),JSON.stringify({name,zone,plaqueInfo,materials,triangles,boundary:'CPU_PRODUCTION_TRIANGLES_WITH_ACTUAL_ALBEDO_AND_ATLAS__NOT_WEBGL_OR_BROWSER_ACCEPTANCE'}));
console.log(JSON.stringify({out,name,triangles:triangles.length,materials:materials.length,plaqueInfo}));z.kit.dispose(scene);lib.dispose();
