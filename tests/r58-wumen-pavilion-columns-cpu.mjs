// Small actual Wumen fragment capture with production albedo. Not browser QA.
import * as THREE from 'three';
import {createRequire} from 'node:module';
import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {TextureLibrary,TEXTURE_SPECS} from '../src/utils/TextureLibrary.js';
import {PalaceBuilder} from '../src/scene/PalaceBuilder.js';
import {buildHallBody} from '../src/scene/HallKit.js';
import {PALACE_LAYOUT} from '../src/scene/Layout.js';
import {CollisionManager} from '../src/utils/Collision.js';
import {assertWumenNortheastColumnsInWorld} from './lib/r58-wumen-pavilion-world-check.mjs';
import * as api from '../src/scene/palace/special/WumenPavilionColumns.js';
import {pavilionBody,rawGeometry,TARGET} from './lib/r58-wumen-pavilion-fixture.mjs';
const require=createRequire(import.meta.url),{createCanvas,loadImage,GlobalFonts}=require(process.env.R58_CANVAS_MODULE??'/tmp/r49-cpu-canvas/node_modules/@napi-rs/canvas');
GlobalFonts.registerFromPath('/usr/share/fonts/opentype/noto/NotoSerifCJK-Regular.ttc','SimSun');
globalThis.document={createElement:()=>createCanvas(1,1),createElementNS:()=>({addEventListener(){},removeEventListener(){}})};
const out=path.resolve(process.argv[2]??'/tmp/r58-wumen-pavilion-cpu');mkdirSync(out,{recursive:true});
const lib=new TextureLibrary();
for(const key of Object.keys(TEXTURE_SPECS)){
 const img=await loadImage(path.resolve('public/textures/hd',key+'.webp')),canvas=createCanvas(img.width,img.height);canvas.getContext('2d').drawImage(img,0,0);
 const t=new THREE.CanvasTexture(canvas);lib.configure(t,key,'color');lib.colors.set(key,t);
}
const data=PALACE_LAYOUT.find(x=>x.name==='午门'),builder=new PalaceBuilder(new THREE.Scene(),lib);let group;
builder.finish=g=>{group=g;g.updateMatrixWorld(true);return g;};builder.buildWumen(data);
let body=pavilionBody(group,data);
if(body.userData.structure?.id===TARGET){const source=buildHallBody(lib,{width:11,depth:11,height:7.5,bays:3,facade:'lattice'}),i=group.children.indexOf(body);source.position.copy(body.position);group.remove(body);group.add(source);group.children.splice(group.children.indexOf(source),1);group.children.splice(i,0,source);body=source;}
const files=['src/scene/palace/special/WumenPavilionColumns.js','src/scene/PalaceBuilder.js','src/scene/HallKit.js','tests/r58-wumen-pavilion-columns-cpu.mjs'];
const binding=Object.fromEntries(files.map(f=>[f,createHash('sha256').update(readFileSync(f)).digest('hex')]));
const scope=new THREE.Box3(new THREE.Vector3(-62,11.9,-22),new THREE.Vector3(-33,38,6));
const counts=[];
for(const stage of ['before','after']){
 if(stage==='after')api.refineWumenPavilionNorthColumns(body,{instanceId:TARGET});group.updateMatrixWorld(true);
 const dir=path.join(out,stage);mkdirSync(dir,{recursive:true});const triangles=[],materials=[],mids=new Map();
 const mid=m=>{if(mids.has(m))return mids.get(m);const id=materials.length;let texture=null;if(m.map?.image?.toBuffer){texture=`texture-${id}.png`;writeFileSync(path.join(dir,texture),m.map.image.toBuffer('image/png'));}materials.push({name:m.name,color:m.color?.getHexString()??'ffffff',texture,wrapS:m.map?.wrapS,wrapT:m.map?.wrapT,side:m.side,opacity:m.opacity??1});mids.set(m,id);return id;};
 group.traverse(m=>{if(!m.isMesh||!new THREE.Box3().setFromObject(m).intersectsBox(scope))return;
  const g=m.geometry,p=g.attributes.position,uv=g.attributes.uv,idx=g.index;
  for(let i=0;i<(idx?.count??p.count);i+=3){const ids=[0,1,2].map(k=>idx?idx.getX(i+k):i+k),mat=Array.isArray(m.material)?m.material[g.groups.find(q=>i>=q.start&&i<q.start+q.count)?.materialIndex??0]:m.material;
   triangles.push({v:ids.map(j=>new THREE.Vector3().fromBufferAttribute(p,j).applyMatrix4(m.matrixWorld).toArray()),uv:uv?ids.map(j=>[uv.getX(j),uv.getY(j)]):null,material:mid(mat),role:m.name||mat.name});
  }
 });
 writeFileSync(path.join(dir,'geometry.json'),JSON.stringify({stage,materials,triangles,binding,scope:'Actual Wumen meshes intersecting northeast pavilion context bounds; no source imagery or hypothetical geometry.',boundary:'CPU_PRODUCTION_TRIANGLES_WITH_ACTUAL_ALBEDO__NOT_BROWSER_ACCEPTANCE'}));
 writeFileSync(path.join(out,`${stage}-body-raw.json`),JSON.stringify(rawGeometry(body))+'\n');
 counts.push({stage,triangles:triangles.length,materials:materials.length});console.log(JSON.stringify(counts.at(-1)));
}
writeFileSync(path.join(out,'capture.json'),JSON.stringify({binding,counts,scopeBounds:{min:scope.min.toArray(),max:scope.max.toArray()},views:{north:{camera:[-47.7,17,22],target:[-47.7,18,-6],fov:48},northeast:{camera:[-67,18,16],target:[-47.7,18,-6],fov:48}},width:1200,height:900,renderer:'tests/r49b-plaque-cpu-render.py',quality:'HD production albedo; CPU fixed diagnostic light; source photographs used only for private separate inspection',browserAcceptance:false},null,2)+'\n');

const cm=new CollisionManager();cm.addColliders(builder.colliders);cm.addWalkables(builder.walkables);const merged=PalaceBuilder.prototype.finish.call(builder,group);builder.scene.updateMatrixWorld(true);writeFileSync(path.join(out,'production-material-consumer.json'),JSON.stringify(assertWumenNortheastColumnsInWorld({scene:builder.scene,cm}),null,2)+'\n');console.log('Actual production-material merged consumer passed');
