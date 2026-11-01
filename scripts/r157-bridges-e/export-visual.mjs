import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {registerHooks} from 'node:module';
import {fileURLToPath} from 'node:url';
import {gzipSync} from 'node:zlib';
import * as T from 'three';
const stage=process.argv[2]??'after',out=process.argv[3];
if(!['before','after'].includes(stage)||!out)throw Error('Usage: node scripts/r157-bridges-e/export-visual.mjs before|after OUTPUT_DIR');
const root=path.resolve(fileURLToPath(new URL('../..',import.meta.url))),base='2cb15fdece44c98aa60fa35e17668c6b1f0b0951';
const sources=['src/scene/palace/river.js','src/scene/palace/special/InnerJinshui.js'];
if(stage==='before')registerHooks({load(url,context,next){const name=sources.find(p=>url===new URL(p,`file://${root}/`).href);return name?{format:'module',source:execFileSync('git',['show',`${base}:${name}`],{cwd:root,encoding:'utf8'}),shortCircuit:true}:next(url,context);}});
const {PALACE_LAYOUT}=await import('../../src/scene/Layout.js');
const {buildInnerJinshui}=await import('../../src/scene/palace/special/InnerJinshui.js');
const {realTextureLibrary}=await import('../../tests/lib/r48-real-texture-library.mjs');
const library=realTextureLibrary(),water=new T.MeshStandardMaterial({color:0x2e6e68,transparent:true,opacity:.82,side:T.DoubleSide});
const result=buildInnerJinshui(library,PALACE_LAYOUT.find(o=>o.type==='river'),water);result.group.updateMatrixWorld(true);
const triangles=[];
function add(mesh,matrix){
 const g=mesh.geometry,p=g.attributes.position,n=g.attributes.normal,c=g.attributes.color,nm=new T.Matrix3().getNormalMatrix(matrix);
 for(let i=0;i<(g.index?.count??p.count);i+=3){const ids=[0,1,2].map(k=>g.index?g.index.getX(i+k):i+k),gg=g.groups.find(q=>i>=q.start&&i<q.start+q.count),m=Array.isArray(mesh.material)?mesh.material[gg?.materialIndex??0]:mesh.material;if(!m?.visible)continue;const col=m.color??new T.Color(.7,.7,.7);
  triangles.push({v:ids.map(j=>new T.Vector3().fromBufferAttribute(p,j).applyMatrix4(matrix).toArray()),n:ids.map(j=>new T.Vector3().fromBufferAttribute(n,j).applyNormalMatrix(nm).toArray()),c:ids.map(j=>[col.r*(c?c.getX(j):1),col.g*(c?c.getY(j):1),col.b*(c?c.getZ(j):1)]),side:m.side??0,character:false});
 }
}
result.group.traverse(m=>{if(!m.isMesh||!m.visible)return;if(m.isInstancedMesh){const instance=new T.Matrix4();for(let i=0;i<m.count;i++){m.getMatrixAt(i,instance);add(m,new T.Matrix4().multiplyMatrices(m.matrixWorld,instance));}}else add(m,m.matrixWorld);});
fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,`triangles-${stage}.json.gz`),gzipSync(JSON.stringify(triangles)));
for(const[name,eye,target,fov]of[['five-overview',[60,45,-367],[0,-.1,-309],47],['principal',[12,9,-332],[0,.2,-310],52]]){const cam=new T.PerspectiveCamera(fov,960/640,.03,500);cam.position.fromArray(eye);cam.lookAt(...target);cam.updateMatrixWorld(true);fs.writeFileSync(path.join(out,`${name}-${stage}.json.gz`),gzipSync(JSON.stringify({label:`R157 bridge E ${name} ${stage}; actual merged geometry`,diagnosticSize:[960,640],sourceCharacterInstances:0,geometryRef:`triangles-${stage}.json.gz`,camera:{position:eye,target,fov,matrixWorldInverse:cam.matrixWorldInverse.toArray()}})));}
console.log(JSON.stringify({stage,base,triangles:triangles.length,bridgeProfiles:result.profile.bridges.map(({id,x,z,width,length,deck})=>({id,x,z,width,length,crest:Math.max(...deck.map(p=>p.y))})),scope:'actual production five-bridge component, not full World/GPU; no texture acceptance'}));
const geometries=new Set();result.group.traverse(o=>{if(o.geometry)geometries.add(o.geometry);});for(const g of geometries)g.dispose();water.dispose();library.dispose();
