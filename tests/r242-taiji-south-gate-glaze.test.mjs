import assert from 'node:assert/strict';
import {test} from 'node:test';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {createCanvas} from '@napi-rs/canvas';
import * as T from 'three';
import {ZoneBase} from '../src/scene/zones/ZoneBase.js';
import {resolveCourtWallContract} from '../src/scene/zones/CourtWallContract.js';
import {createActualLibrary} from './r158-cumulative-1600/library.mjs';
const hash=a=>createHash('sha256').update(Buffer.from(a.buffer,a.byteOffset,a.byteLength)).digest('hex');
const zone=JSON.parse(fs.readFileSync(new URL('../data/zones/west-six.json',import.meta.url)));
const KEY='r242_taiji_south_green_registers_fit';
const geometry=root=>{const out=[];root.traverse(o=>{if(o.isMesh)out.push({p:o.position.toArray(),r:o.rotation.toArray(),s:o.scale.toArray(),index:o.geometry.index===null?null:hash(o.geometry.index.array),attrs:Object.fromEntries(Object.entries(o.geometry.attributes).map(([k,a])=>[k,hash(a.array)]))});});return out;};
function triangles(root,bake=true,includeMaterial=false){
 root.updateMatrixWorld(true);const out=[],inverse=new T.Matrix4().copy(root.matrixWorld).invert();
 const identity=new T.Matrix4();
 if(!bake)assert.deepEqual(root.matrix.elements,identity.elements,'finished root identity');
 root.traverse(o=>{if(!o.isMesh)return;
  let g=o.geometry;
  if(bake){const matrix=new T.Matrix4().multiplyMatrices(inverse,o.matrixWorld);g=g.index?g.toNonIndexed():g.clone();g.applyMatrix4(matrix);
   if(matrix.determinant()<0)for(const attr of Object.values(g.attributes))for(let i=0;i<attr.count;i+=3)for(let k=0;k<attr.itemSize;k++){const a=(i+1)*attr.itemSize+k,b=(i+2)*attr.itemSize+k;[attr.array[a],attr.array[b]]=[attr.array[b],attr.array[a]];}
  }else{assert.deepEqual(o.matrix.elements,identity.elements,'finished mesh identity');assert.equal(o.parent,root);assert.equal(g.index,null);}
  try{assert.equal(g.attributes.position.count%3,0);for(let i=0;i<g.attributes.position.count;i+=3){const bytes=[];for(let j=0;j<3;j++)for(const key of ['position','normal','uv']){const a=g.attributes[key];assert.ok(a.array instanceof Float32Array);bytes.push(Buffer.from(a.array.buffer,a.array.byteOffset+(i+j)*a.itemSize*4,a.itemSize*4));}out.push((includeMaterial?o.material.uuid+'|':'')+Buffer.concat(bytes).toString('hex'));}}
  finally{if(bake)g.dispose();}
 });return out.sort();
}
function sameTriangles(actual,expected,message){
 const digest=a=>createHash('sha256').update(a.join('\n')).digest('hex');
 const i=actual.findIndex((x,n)=>x!==expected[n]);
 assert.ok(actual.length===expected.length&&i===-1,`${message}; counts=${actual.length}/${expected.length}; hashes=${digest(actual)}/${digest(expected)}; first=${i}; actual=${actual[i]??'-'}; expected=${expected[i]??'-'}`);
}
const counts=items=>{const m=new Map([...new Set(items)].map(x=>[x,0]));for(const x of m.keys())x.addEventListener('dispose',()=>m.set(x,m.get(x)+1));return m;};
const resources=root=>{const a=[];root.traverse(o=>{if(o.geometry)a.push(o.geometry)});return a;};
function fixture(){const a=createActualLibrary(),z=structuredClone(zone),b=new ZoneBase(a.library,z);return {a,z,b,k:b.kit};}

// CPU evaluation of the exact emitted RGB block; not GLSL compilation/rendering.
// Missing, widened or shifted trims must fail at separately named sample points.
function trimContract(mat){
 const shader={vertexShader:T.ShaderLib.standard.vertexShader,fragmentShader:T.ShaderLib.standard.fragmentShader};mat.onBeforeCompile(shader);
 const oldFront='n.z < -0.999 && abs(p.z - 303.1) < 0.0001 && p.x >= 136.3 && p.x <= 142.7 && p.y >= 4.65 && p.y <= 5.4';
 const green=new T.Color('#3f7657').toArray().map(v=>v.toFixed(10)).join(', '),yellow=new T.Color('#c59b3c').toArray().map(v=>v.toFixed(10)).join(', ');
 const start='#include <color_fragment>\nvec3 p = vR242WorldPosition;\nvec3 n = normalize(vR242WorldNormal);\nbool r242Front = '+oldFront+';\n';
 const oldBody=`if (r242Front) {\n  if (p.y < 4.95) diffuseColor.rgb = vec3(${green});\n  else if (p.y < 5.03) diffuseColor.rgb = vec3(${yellow});\n  else diffuseColor.rgb = vec3(${green});\n}`;
 const original=T.ShaderLib.standard.fragmentShader,marker='#include <color_fragment>';
 assert.equal(original.split(marker).length,2);
 const [prefix,suffix]=original.split(marker),text=shader.fragmentShader;
 const varying='\nvarying vec3 vR242WorldPosition;\nvarying vec3 vR242WorldNormal;';
 const expectedPrefix=prefix.replace('#include <common>','#include <common>'+varying);
 assert.ok(text.startsWith(expectedPrefix)&&text.endsWith(suffix),'known standard shader envelope only');
 const block=text.slice(expectedPrefix.length,text.length-suffix.length);
 let expr=null,bottomExpr=null;
 if(block===start+oldBody){ /* precisely recognized old block, not arbitrary fallback */ }
 else {
  assert.ok(block.startsWith(start),'retained front selector');
  const rest=block.slice(start.length),m=rest.match(/^bool r251Trim = ([^;\n]+);\n/);
  assert.ok(m,'one supported trim selector declaration');expr=m[1];
  assert.match(expr,/^[pnxyzabs0-9. ()<>=!&|+-]+$/,'bounded scalar selector syntax');
  const trimBody=oldBody+` else if (r251Trim) {\n  diffuseColor.rgb = vec3(${yellow});\n}`;
  if(rest===m[0]+trimBody){ /* precisely recognized pre-bottom block for behavioral RED */ }
  else {
   const b=rest.slice(m[0].length).match(/^bool r263Bottom = ([^;\n]+);\n/);
   assert.ok(b,'one supported bottom selector declaration');bottomExpr=b[1];
   assert.match(bottomExpr,/^[pnxyzabs0-9. ()<>=!&|+-]+$/,'bounded scalar bottom selector syntax');
   assert.equal(rest,m[0]+b[0]+trimBody+` else if (r263Bottom) {\n  diffuseColor.rgb = vec3(${yellow});\n}`,'old bands and trims first, then actual bottom yellow assignment only');
  }
 }
 const front=Function('p','n','abs','return '+oldFront),trim=expr===null?null:Function('p','n','abs','return '+expr),bottom=bottomExpr===null?null:Function('p','n','abs','return '+bottomExpr);
 const rgb=(x,y=2.8,z=303.1,nz=-1)=>{const p={x,y,z},n={z:nz};return front(p,n,Math.abs)?(y<4.95?'green':y<5.03?'yellow':'green'):trim&&trim(p,n,Math.abs)?'yellow':bottom&&bottom(p,n,Math.abs)?'yellow':'source';};
 const named=[['left-outer',136.38],['left-inner',137.62],['right-inner',141.38],['right-outer',142.62]];
 const actual=named.map(([name,x])=>({name,result:rgb(x)})),expected=named.map(([name])=>({name,result:'yellow'}));
 assert.deepEqual(actual,expected,'four independently named missing yellow trims (not program version)');
 assert.notEqual(expr,null,'new selector required after behavioral RED');
 for(const [lo,hi]of [[136.3,136.46],[137.54,137.7],[141.3,141.46],[142.54,142.7]]){
  const x=(lo+hi)/2;
  for(const y of [1,2.8,4.64999])assert.equal(rgb(x,y),'yellow');
  for(const xx of [lo,hi])assert.equal(rgb(xx),'yellow');
  for(const xx of [lo-.00001,hi+.00001])assert.equal(rgb(xx),'source');
  for(const y of [.99999])assert.equal(rgb(x,y),'source');
  assert.equal(trim({x,y:4.65,z:303.1},{z:-1},Math.abs),false);
  assert.equal(rgb(x,4.65),'green','horizontal band wins at junction');
  for(const [z,nz]of [[303.101,-1],[305.9,1],[303.1,0]])assert.equal(rgb(x,2.8,z,nz),'source');
 }
 for(const x of [137,139.5,142])assert.equal(rgb(x),'source');
 assert.deepEqual(mat.userData.taijiSouthGateGlaze.verticalTrim,{status:'photo-fit-not-surveyed',width:.16,y:[1,4.65],upperExclusive:true,x:[[136.3,136.46],[137.54,137.7],[141.3,141.46],[142.54,142.7]]});
 // Missing either bottom band must fail through the actual emitted color block,
 // before metadata/cache checks. Literal samples avoid deriving expected bounds.
 assert.deepEqual([{name:'left-bottom',result:rgb(137,1.05)},{name:'right-bottom',result:rgb(142,1.05)}],[{name:'left-bottom',result:'yellow'},{name:'right-bottom',result:'yellow'}],'two independently named bottom interiors must be yellow, not source red');
 assert.notEqual(bottomExpr,null,'bottom selector required after behavioral RED');
 const bottomAt=(x,y=1.05,z=303.1,nz=-1)=>bottom({x,y,z},{z:nz},Math.abs);
 for(const [lo,hi,mid]of [[136.3,137.7,137],[141.3,142.7,142]]){
  for(const x of [lo,mid,hi])for(const y of [1,1.05,1.09999]){
   assert.equal(bottomAt(x,y),true,`bottom selector includes ${x},${y}`);
   assert.equal(rgb(x,y),'yellow',`bottom color at ${x},${y}`);
  }
  for(const x of [lo-.00001,hi+.00001]){
   assert.equal(bottomAt(x),false,'bottom x epsilon outside');assert.equal(rgb(x,1.05),'source');
  }
  for(const y of [.99999,1.10,1.10001,2.8,4.65,5])assert.equal(bottomAt(mid,y),false,'bottom y outside');
  for(const y of [.99999,1.10,1.10001,2.8])assert.equal(rgb(mid,y),'source','stone foot and red panel remain unchanged');
  for(const x of [lo,hi])assert.equal(rgb(x,.99999),'source','no yellow below the pier');
  for(const [z,nz]of [[303.1-.00011,-1],[303.1+.00011,-1],[305.9,-1],[305.9,1],[303.1,0],[303.1,1],[303.1,-.999],[303.1,-.99899]]){
   assert.equal(bottomAt(mid,1.05,z,nz),false);assert.equal(rgb(mid,1.05,z,nz),'source','off-plane, back and side unchanged');
  }
  for(const z of [303.1-.00009,303.1+.00009])assert.equal(bottomAt(mid,1.05,z),true,'same existing front-plane tolerance');
  assert.equal(bottomAt(mid,1.05,303.1,-.99901),true,'same existing south-normal threshold');
 }
 for(const x of [137.70001,139.5,141.29999])for(const y of [1,1.05,1.09999]){
  assert.equal(bottomAt(x,y),false);assert.equal(rgb(x,y),'source','central opening never becomes a yellow threshold');
 }
 for(const x of [136.46,137.54,141.46,142.54])for(const dx of [-.00001,0,.00001])assert.equal(rgb(x+dx,1.05),'yellow','bottom meets each vertical trim without a gap');
 for(const x of [137,139.5,142])for(const [y,want]of [[4.65,'green'],[4.94999,'green'],[4.95,'yellow'],[5,'yellow'],[5.03,'green'],[5.4,'green']])assert.equal(rgb(x,y),want,'original horizontal color assignments retained');
 assert.deepEqual(mat.userData.taijiSouthGateGlaze.bottomTrim,{status:'photo-fit-not-surveyed',height:.10,y:[1,1.10],upperExclusive:true,x:[[136.3,137.7],[141.3,142.7]]});
}

test('actual south gate keeps all triangles and physics while private green registers survive finish',async()=>{
 const oldDoc=globalThis.document,oldFetch=globalThis.fetch;
 globalThis.document={createElement(tag){assert.equal(tag,'canvas');return createCanvas(1,1)}};
 globalThis.fetch=()=>{throw Error('No network in R242 CPU contract')};
 const f=fixture(),base=fixture();let finished=false;
 try{
  const width=f.b.buildGate(f.z.items[28]);const gate=f.k.root.children[0];
  assert.equal(gate.children[1].material.name,KEY,'actual item28 is missing its private two-green-register material');
  const {validateTaijiSouthGateSource,applyTaijiSouthGateGlaze}=await import('../src/scene/palace/special/TaijiSouthGateGlaze.js');
  const w0=base.k.gate({...base.z.items[28]});const original=base.k.root.children[0];
  assert.deepEqual(geometry(gate),geometry(original),'all attributes, indices and transforms retained');
  sameTriangles(triangles(gate),triangles(original),'all original oriented world triangles retained');
  const mat=gate.children[1].material,shared=f.a.library.material('wall_red');
  assert.notEqual(mat,shared);assert.equal(shared.onBeforeCompile,T.Material.prototype.onBeforeCompile);
  assert.deepEqual([1,3,4].map(i=>gate.children[i].material),[mat,mat,mat]);
  assert.equal(f.k.owned.filter(m=>m===mat).length,1);assert.equal(mat.map,shared.map);assert.equal(mat.normalMap,shared.normalMap);
  assert.equal(mat.roughness,shared.roughness);trimContract(mat);assert.equal(mat.customProgramCacheKey(),'r242-taiji-south-green-registers-v3');
  assert.equal(width,6.4);assert.equal(width,w0);
  for(const k of ['colliders','walkables','rooms','regions','mapItems'])assert.deepEqual(f.k[k],base.k[k],k);
  assert.deepEqual(resolveCourtWallContract(f.z.items[29],new Map([['太极门',width]])),resolveCourtWallContract(base.z.items[29],new Map([['太极门',w0]])));
  assert.deepEqual(f.k.plaques,[]);assert.equal(f.k.ownedTextures,undefined);
  assert.equal(f.k.mapItems.length,1);assert.ok(Math.abs(f.k.colliders[1].min.x-f.k.colliders[0].max.x-3.6)<1e-10);
  const shader={vertexShader:T.ShaderLib.standard.vertexShader,fragmentShader:T.ShaderLib.standard.fragmentShader};mat.onBeforeCompile(shader);
  assert.ok(shader.vertexShader.includes('vR242WorldPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;'));
  assert.ok(shader.vertexShader.includes('normalize(mat3(modelMatrix) * objectNormal)'));
  assert.ok(shader.fragmentShader.includes('normalize(vR242WorldNormal)'));
  assert.ok(shader.fragmentShader.indexOf('diffuseColor.rgb =')>shader.fragmentShader.indexOf('#include <color_fragment>'));
  for(const [stage,marker]of [['vertexShader','#include <common>'],['vertexShader','#include <project_vertex>'],['fragmentShader','#include <common>'],['fragmentShader','#include <color_fragment>']])for(const duplicate of [false,true]){
   const bad={vertexShader:T.ShaderLib.standard.vertexShader,fragmentShader:T.ShaderLib.standard.fragmentShader};bad[stage]=bad[stage].replace(marker,duplicate?marker+'\n'+marker:'');const before={...bad};assert.throws(()=>mat.onBeforeCompile(bad),/shader marker/);assert.deepEqual(bad,before);
  }
  const fit=mat.userData.taijiSouthGateGlaze;assert.deepEqual(fit.bands,[[4.65,4.95,'green'],[4.95,5.03,'yellow'],[5.03,5.4,'green']]);
  assert.equal(fit.status,'photo-fit-not-surveyed');
  // Exercise the actual generated selector expression with GLSL vector operations
  // represented by their already-normalized scalar components, not a GPU claim.
  const selector=shader.fragmentShader.match(/bool r242Front = (.*);/)[1];
  const evaluate=(x,y,z,nz)=>Function('p','n','abs','return '+selector)({x,y,z},{z:nz},Math.abs);
  assert.equal(evaluate(139.5,4.8,303.1,-1),true);assert.equal(evaluate(139.5,5.0,303.1,-1),true);assert.equal(evaluate(139.5,5.2,303.1,-1),true);
  for(const q of [[139.5,4.64,303.1,-1],[139.5,5.41,303.1,-1],[139.5,5,305.9,1],[136.2,5,303.1,-1],[139.5,5,303.1,0]])assert.equal(evaluate(...q),false);
  assert.ok(shader.fragmentShader.includes('p.y < 4.95'));assert.ok(shader.fragmentShader.includes('p.y < 5.03'));
  for(const item of [{...f.z.items[28]},{...f.z.items[28],plaque:true}])assert.equal(validateTaijiSouthGateSource(f.z,item),false);
  assert.equal(validateTaijiSouthGateSource({...f.z,id:'other'},f.z.items[28]),false);
  assert.equal(validateTaijiSouthGateSource({...f.z,items:[f.z.items[28]]},f.z.items[28]),false);
  const beforeRoots=f.k.root.children.length,beforeOwned=f.k.owned.length,beforeCol=f.k.colliders.length;
  for(const delta of [{plaque:true},{plaque:undefined},{x:140},{name:'other'},{gateProfile:'other'}]){const old=f.z.items[28];f.z.items[28]={...old,...delta};assert.throws(()=>f.b.buildGate(f.z.items[28]),/source/);f.z.items[28]=old;assert.equal(f.k.root.children.length,beforeRoots);assert.equal(f.k.owned.length,beforeOwned);assert.equal(f.k.colliders.length,beforeCol);}
  assert.throws(()=>applyTaijiSouthGateGlaze(f.k,gate,f.z,f.z.items[28]),/source|component|material/);assert.equal(f.k.owned.length,beforeOwned);
  // Legitimate source exists on postflight failure; decoration allocates nothing.
  const prior=original.children[1].position.x;original.children[1].position.x+=.1;
  const owns=base.k.owned.length;assert.throws(()=>applyTaijiSouthGateGlaze(base.k,original,base.z,base.z.items[28]),/component/);assert.equal(base.k.owned.length,owns);original.children[1].position.x=prior;
  f.k.gate({x:0,z:0,plaque:false,name:'普通门'});assert.equal(f.k.root.children[1].children[1].material,shared);
  const originalTriangles=triangles(f.k.root,true,true),sourceCounts=counts(resources(f.k.root));
  const ownCounts=counts(f.k.owned),libCounts=counts([...f.a.library.materials.values(),...f.a.library.allTextures()]);
  const merged=f.k.finish();f.b.group=merged;finished=true;
  sameTriangles(triangles(merged,false,true),originalTriangles,'finish loses or duplicates no triangle or material identity');
  const privateMesh=merged.children.filter(o=>o.material===mat);assert.equal(privateMesh.length,1);assert.equal(privateMesh[0].geometry.attributes.position.count,108);
  assert.equal(privateMesh[0].material.onBeforeCompile,mat.onBeforeCompile);
  for(const n of sourceCounts.values())assert.equal(n,1);
  const mergedCounts=counts(resources(merged));f.b.dispose();f.b.dispose();
  for(const n of [...ownCounts.values(),...mergedCounts.values()])assert.equal(n,1);
  for(const n of libCounts.values())assert.equal(n,0);
  f.a.dispose();for(const n of libCounts.values())assert.equal(n,1);
  const pre=fixture();try{pre.b.buildGate(pre.z.items[28]);const pc=counts([...pre.k.owned,...resources(pre.k.root)]);pre.b.dispose();pre.b.dispose();for(const n of pc.values())assert.equal(n,1,'prefinish private resource disposed once');}finally{pre.b.dispose();pre.a.dispose();}
  const baseGeo=counts(resources(base.k.root)),baseOwn=counts(base.k.owned);base.b.dispose();base.b.dispose();for(const n of [...baseGeo.values(),...baseOwn.values()])assert.equal(n,1);
 }finally{f.b.dispose();if(!finished)f.a.dispose();base.b.dispose();base.a.dispose();globalThis.document=oldDoc;globalThis.fetch=oldFetch;}
});
