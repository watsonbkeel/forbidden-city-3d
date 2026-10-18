import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {PalaceBuilder} from '../src/scene/PalaceBuilder.js';
import {PALACE_LAYOUT} from '../src/scene/Layout.js';
import {library,hash,sceneRows} from './lib/inner-palace-fixture.mjs';
import {BAOHE_FRONT_ENCLOSURE as P,baoheFrontBox,baoheFrontMaterial,buildBaoheClosedFront} from '../src/scene/palace/BaoheFrontEnclosure.js';
import baseline from './fixtures/r22-baohe-scene-delta.json' with {type:'json'};
import nav from './fixtures/r22-baohe-navigation-delta.json' with {type:'json'};
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-5,`${a} != ${b}`);
const tris=g=>(g.index?.count??g.attributes.position.count)/3;
const data=structuredClone(PALACE_LAYOUT.find(h=>h.name==='保和殿'));
const b=new PalaceBuilder(new THREE.Scene(),library()),g=new THREE.Group();
b.buildHall(g,data,9,{heightReferenceY:10});g.updateMatrixWorld(true);
const faces=g.children.filter(m=>m.userData.baoheFrontEnclosure);

test('only the outer four front bays have raised solid bases and window infill',()=>{
 assert.deepEqual(P.outerWindowBays,[0,1,7,8]);assert.deepEqual(P.closedDoorBays,[2,6]);
 assert.equal(faces.length,22);
 for(const kind of ['base','window'])assert.equal(faces.filter(m=>m.userData.baoheFrontEnclosure.kind===kind).length,4);
 assert.equal(faces.filter(m=>m.userData.baoheFrontEnclosure.kind==='closed').length,2);
 assert.equal(faces.filter(m=>m.userData.baoheFrontEnclosure.kind==='leaf').length,12);
 assert.ok(faces.every(m=>Math.abs(m.position.z-(data.position.z-8.3))<2));
 for(const base of faces.filter(m=>m.userData.baoheFrontEnclosure.kind==='base')){
  const win=faces.find(m=>m.userData.baoheFrontEnclosure.kind==='window'&&m.position.x===base.position.x);
  const lo=new THREE.Box3().setFromObject(base),hi=new THREE.Box3().setFromObject(win);
  near(lo.min.y,9);near(lo.max.y,hi.min.y);near(lo.getSize(new THREE.Vector3()).y/(hi.max.y-9),.22);
  near(lo.min.x,hi.min.x);near(lo.max.x,hi.max.x);assert.ok(lo.min.z<hi.min.z&&lo.max.z>hi.max.z);
  assert.ok(lo.min.z>=data.position.z-8.3-.25&&lo.max.z<=data.position.z-8.3+.25);
 }
 assert.match(P.status,/NOT_SURVEY/);
});

test('only completely concealed bottom triangles are omitted, leaving every side and top intact',()=>{
 for(const m of faces){
  assert.equal(tris(m.geometry),10);const p=m.geometry.attributes.position,idx=m.geometry.index;
  for(let i=0;i<idx.count;i+=3){
   const ys=[0,1,2].map(j=>p.getY(idx.getX(i+j)));assert.ok(!ys.every(y=>Math.abs(y+m.geometry.parameters.height/2)<1e-6));
  }
  const bound=new THREE.Box3().setFromObject(m);
  if(m.userData.baoheFrontEnclosure.kind==='window')assert.ok(faces.some(x=>x.userData.baoheFrontEnclosure.kind==='base'&&x.position.x===m.position.x));
  else assert.ok(bound.min.y<9.03);
  assert.equal(m.castShadow,true);assert.equal(m.receiveShadow,true);
 }
 const trial=new THREE.Group(),full=baoheFrontBox(b,trial,{kind:'leaf',w:1,h:2,d:.1,x:0,y:1,z:0});assert.equal(tris(full.geometry),12);
});

test('private atlas cells do not bleed into adjacent fields and no old gold facade texture survives at the front',()=>{
 const cells={leaf:0,closed:1,window:2,base:3};
 for(const m of faces){
  assert.equal(m.material.name,'baohe_front_enclosure');const cell=cells[m.userData.baoheFrontEnclosure.kind],a=m.geometry.attributes.uv;
  for(let i=0;i<a.count;i++)assert.ok(a.getX(i)>cell/4&&a.getX(i)<(cell+1)/4);
 }
 assert.equal(g.children.filter(m=>m.material?.name==='lattice_doors'&&m.position.z<data.position.z).length,0);
 assert.ok(g.children.filter(m=>m.material?.name==='lattice_doors'&&m.position.z>data.position.z).length>0);
});

test('current front changes preserve the complete R22 navigation registration',()=>{
 const s=new THREE.Scene(),builder=new PalaceBuilder(s,library());builder.buildAll(PALACE_LAYOUT);
 try{
  assert.equal(hash({colliders:builder.colliders,walkables:builder.walkables}),nav.afterSHA256);
  assert.equal(builder.colliders.length,2487);assert.equal(builder.walkables.length,120);
  const rows=sceneRows(s);for(const[name,row]of Object.entries(baseline.unchanged))assert.deepEqual(rows[name],row);
  assert.equal(rows['三台'].triangles-baseline.after.triangles,4);assert.equal(rows['三台'].meshes-baseline.after.meshes,1);
 }finally{builder.dispose();}
});

test('atlas has red framing, dark infill and gray base without modifying shared gold or lighting',()=>{
 const old=globalThis.document,ops=[],ctx=new Proxy({},{get:(o,k)=>k in o?o[k]:(...args)=>ops.push({k,args,color:o.fillStyle}),set:(o,k,v)=>(o[k]=v,true)});
 try{
  globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>ctx})};
  const builder=new PalaceBuilder(new THREE.Scene(),library()),gold=builder.ownMat('gold',{color:0xc9a13b,metalness:.85,roughness:.3}),before=gold.toJSON();
  const mat=baoheFrontMaterial(builder);assert.equal(mat,baoheFrontMaterial(builder));assert.equal(mat.map.image.width,1024);assert.equal(mat.map.image.height,512);assert.equal(mat.map.colorSpace,THREE.SRGBColorSpace);
  assert.ok(ops.some(o=>o.color==='#263a35'));assert.ok(ops.some(o=>o.color==='#72241e'));assert.ok(ops.some(o=>o.color==='#666b67'));assert.deepEqual(gold.toJSON(),before);assert.equal(mat.emissive.getHex(),0);
  let n=0;mat.map.addEventListener('dispose',()=>n++);builder.dispose();mat.dispose();assert.equal(n,1);
 }finally{globalThis.document=old;}
});

test('unregistered bay and invalid geometry cannot silently close an open passage',()=>{
 const a={bay:0,xc:0,zf:0,y:9,height:5.0832,width:4};
 for(const bay of [-1,3,4,5,9])assert.throws(()=>buildBaoheClosedFront(b,new THREE.Group(),{...a,bay}));
 assert.throws(()=>buildBaoheClosedFront(b,new THREE.Group(),{...a,height:NaN}));
 assert.throws(()=>baoheFrontBox(b,new THREE.Group(),{kind:'unknown',w:1,h:1,d:1,x:0,y:0,z:0}));
});
