import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {PalaceBuilder} from '../src/scene/PalaceBuilder.js';
import {PALACE_LAYOUT} from '../src/scene/Layout.js';
import {library,hash,sceneRows} from './lib/inner-palace-fixture.mjs';
import {QIANQING_FRONT_ENCLOSURE as P,qianqingFrontMaterial,qianqingFrontBox,buildQianqingFrontWindow} from '../src/scene/palace/QianqingFrontEnclosure.js';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-5,`${a} != ${b}`);
const data=PALACE_LAYOUT.find(x=>x.name==='乾清宫');
const b=new PalaceBuilder(new THREE.Scene(),library()),g=new THREE.Group();b.buildHall(g,data,2.16,{heightReferenceY:7});g.updateMatrixWorld(true);
const faces=g.children.filter(m=>m.userData.qianqingFrontEnclosure);
const width=data.dimensions.width,depth=data.dimensions.depth,bayW=width/9;
const H=THREE.MathUtils.clamp((data.dimensions.height-7)*.38,5,11),r=THREE.MathUtils.clamp(bayW*.08,.3,.6),doorH=(H-THREE.MathUtils.clamp(H*.12,.6,1.4))*.8;

test('only the source-supported seven central front bays receive dedicated enclosure',()=>{
 assert.deepEqual(P.doorBays,[3,4,5]);assert.deepEqual(P.windowBays,[1,2,6,7]);assert.deepEqual(P.unresolvedPassageBays,[0,8]);
 assert.equal(faces.length,14);
 assert.deepEqual([...new Set(faces.filter(m=>m.userData.qianqingFrontEnclosure.kind==='leaf').map(m=>m.userData.qianqingFrontEnclosure.bay))],[3,4,5]);
 for(const kind of['base','window'])assert.deepEqual(faces.filter(m=>m.userData.qianqingFrontEnclosure.kind===kind).map(m=>m.userData.qianqingFrontEnclosure.bay),[1,2,6,7]);
 assert.ok(faces.every(m=>m.position.z<data.position.z));
 assert.match(P.status,/ESTIMATED/);assert.match(P.access,/VIRTUAL/);
});

test('four raised walls join their windows without a crack or changed existing collision envelope',()=>{
 for(const base of faces.filter(m=>m.userData.qianqingFrontEnclosure.kind==='base')){
  const win=faces.find(m=>m.userData.qianqingFrontEnclosure.kind==='window'&&m.position.x===base.position.x);
  const lo=new THREE.Box3().setFromObject(base),hi=new THREE.Box3().setFromObject(win),zf=data.position.z-depth/2;
  near(lo.min.y,2.16);near(lo.max.y,hi.min.y);near(hi.max.y,2.16+doorH);near((lo.max.y-lo.min.y)/doorH,.24);
  near(lo.min.x,hi.min.x);near(lo.max.x,hi.max.x);near(lo.min.z,zf-.15);near(lo.max.z,zf+.15);
  assert.ok(lo.min.z>=zf-.25&&lo.max.z<=zf+.25);assert.ok(lo.min.z<hi.min.z&&lo.max.z>hi.max.z);
  assert.equal(base.geometry.index.count/3,12);assert.equal(win.geometry.index.count/3,12);
 }
});

test('all six folded virtual leaf dimensions and transforms remain the inherited values',()=>{
 const leaves=faces.filter(m=>m.userData.qianqingFrontEnclosure.kind==='leaf');assert.equal(leaves.length,6);
 for(const bay of P.doorBays){const pair=leaves.filter(m=>m.userData.qianqingFrontEnclosure.bay===bay),xc=data.position.x-width/2+(bay+.5)*bayW;
  for(const[i,side]of[-1,1].entries()){
   const m=pair[i];near(m.geometry.parameters.width,bayW*.25);near(m.geometry.parameters.height,doorH);near(m.geometry.parameters.depth,.12);
   near(m.position.x,xc+side*(bayW/2-r-.1));near(m.position.y,2.16+doorH/2);near(m.position.z,data.position.z-depth/2+bayW*.13+.2);near(m.rotation.y,Math.PI/2);
  }
 }
});

test('atlas UVs stay inside their assigned cells and shared gold is not modified',()=>{
 for(const m of faces){const cell={leaf:0,window:1,base:2}[m.userData.qianqingFrontEnclosure.kind],uv=m.geometry.attributes.uv;
  assert.equal(m.material.name,'qianqing_front_enclosure');assert.equal(m.castShadow,true);assert.equal(m.receiveShadow,true);
  for(let i=0;i<uv.count;i++)assert.ok(uv.getX(i)>cell/4&&uv.getX(i)<(cell+1)/4);
 }
 const old=globalThis.document,ops=[],ctx=new Proxy({},{get:(o,k)=>k in o?o[k]:(...args)=>ops.push({k,args,color:o.fillStyle,stroke:o.strokeStyle}),set:(o,k,v)=>(o[k]=v,true)});
 try{globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>ctx})};
  const owner=new PalaceBuilder(new THREE.Scene(),library()),gold=owner.ownMat('gold',{color:0xc9a13b,roughness:.3,metalness:.85}),before=gold.toJSON();
  const mat=qianqingFrontMaterial(owner);assert.equal(mat,qianqingFrontMaterial(owner));assert.equal(mat.map.image.width,1024);assert.equal(mat.map.image.height,512);assert.equal(mat.map.colorSpace,THREE.SRGBColorSpace);assert.equal(mat.emissive.getHex(),0);
  for(const color of['#60302a','#292425','#67645d'])assert.ok(ops.some(o=>o.color===color));assert.ok(ops.some(o=>o.stroke==='#a88a50'));assert.deepEqual(gold.toJSON(),before);
  let disposed=0;mat.map.addEventListener('dispose',()=>disposed++);owner.dispose();mat.dispose();assert.equal(disposed,1);
 }finally{globalThis.document=old;}
});

test('end bays, rear and other halls do not inherit the new classification or atlas',()=>{
 const zf=data.position.z-depth/2,oldPanels=g.children.filter(m=>m.material?.name==='lattice_doors'&&Math.abs(m.position.z-zf)<1e-6);
 assert.equal(oldPanels.length,2,'known unresolved end passage closure remains explicit');
 assert.ok(oldPanels.every(m=>Math.abs(m.position.x-data.position.x)>3*bayW));
 assert.ok(g.children.some(m=>m.material?.name==='lattice_doors'&&m.position.z>data.position.z));
 for(const[name,y,ref]of[['太和殿',9.9375,9.9375],['保和殿',9,10],['中和殿',9.9375,9.9375]]){
  const owner=new PalaceBuilder(new THREE.Scene(),library()),group=new THREE.Group();try{owner.buildHall(group,PALACE_LAYOUT.find(x=>x.name===name),y,{heightReferenceY:ref});assert.ok(group.children.every(m=>!m.userData.qianqingFrontEnclosure));assert.ok(!owner._own.has('qianqing_front_enclosure'));}finally{owner.dispose();}
 }
});

test('complete navigation remains unchanged and total resident increment is counted',()=>{
 const scene=new THREE.Scene(),owner=new PalaceBuilder(scene,library());try{owner.buildAll(PALACE_LAYOUT);
  assert.equal(hash({colliders:owner.colliders,walkables:owner.walkables}),'a1668d4eaf2b4ea21b0ea5a45fb421ef299ff48888d4d23bb1f60396be825853');assert.equal(owner.colliders.length,2487);assert.equal(owner.walkables.length,120);
  const rows=Object.values(sceneRows(scene));assert.equal(rows.reduce((n,r)=>n+r.meshes,0),164);assert.equal(rows.reduce((n,r)=>n+r.triangles,0),188075);
 }finally{owner.dispose();}
});

test('unregistered passage/door window requests, unknown atlas cells and invalid geometry fail closed',()=>{
 const args={bay:1,xc:0,zf:0,y:2.16,height:5,width:4};
 for(const bay of[0,3,4,5,8,1.5,NaN])assert.throws(()=>buildQianqingFrontWindow(b,new THREE.Group(),{...args,bay}),/cannot become/);
 for(const height of[0,-1,NaN,Infinity])assert.throws(()=>buildQianqingFrontWindow(b,new THREE.Group(),{...args,height}),/geometry/);
 for(const kind of['closed','passage','unknown'])assert.throws(()=>qianqingFrontBox(b,new THREE.Group(),{kind,bay:1,w:4,h:5,d:.15,x:0,y:4,z:0}),/Unregistered/);
 assert.throws(()=>qianqingFrontBox(b,new THREE.Group(),{kind:'leaf',bay:1,w:4,h:5,d:.15,x:0,y:4,z:0}),/Unregistered/);
});
