import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {PalaceBuilder} from '../src/scene/PalaceBuilder.js';
import {PALACE_LAYOUT} from '../src/scene/Layout.js';
import {CollisionManager} from '../src/utils/Collision.js';
import {library,hash,serial} from './lib/inner-palace-fixture.mjs';
import {buildWorld,walkStraight} from './lib/world.mjs';
import {BAOHE_FRONT_DOORS as D,baoheFrontDoorLeaves,buildBaoheFrontDoors} from '../src/scene/palace/BaoheFrontDoors.js';
import {BAOHE_COLUMN_COUPLETS as P,buildBaoheColumnCouplets,baoheCoupletMaterial} from '../src/scene/palace/BaoheColumnCouplets.js';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-5,`${a} != ${b}`),tris=m=>(m.geometry.index?.count??m.geometry.attributes.position.count)/3;
const r=49.7/9*.08;

test('each central front assembly has two closed outside leaves and two inner folded leaves',()=>{
 for(const bayWidth of[5.5,7.3]){
  const b=new PalaceBuilder(new THREE.Scene(),library()),g=new THREE.Group();
  const leaves=buildBaoheFrontDoors(b,g,{xc:0,zf:0,y:9,height:5.0832,bayWidth,columnRadius:r});
  assert.equal(leaves.length,4);assert.equal(g.children.length,4);assert.equal(b.colliders.length,4);
  assert.equal(leaves.filter(p=>p.kind==='outer-closed').length,2);assert.equal(leaves.filter(p=>p.kind==='inner-folded').length,2);
  const width=(bayWidth-2*r)/4;assert.ok(width*2-.12>2.18);
  g.updateMatrixWorld(true);
  for(let i=0;i<4;i++){
   const p=leaves[i],box=new THREE.Box3().setFromObject(g.children[i]),col=b.colliders[i];
   for(const key of['min','max'])for(const axis of['x','y','z'])near(box[key][axis],col[key][axis]);
   near(p.width,width);near(p.height,5.0832);assert.equal(tris(g.children[i]),12);
  }
  const cm=new CollisionManager();cm.addColliders(b.colliders);
  assert.equal(cm.checkCollision(new THREE.Vector3(0,10.7,0),.5),false);
  for(const p of leaves)assert.equal(cm.checkCollision(new THREE.Vector3(p.x,10.7,p.z),.5),true);
 }
 assert.match(D.status,/ESTIMATED/);assert.match(D.access,/NOT_MUSEUM/);
});
test('unregistered door dimensions and nonfinite inputs fail closed',()=>{
 const a={xc:0,zf:0,y:9,height:5,bayWidth:5.5,columnRadius:r};
 for(const bad of[{...a,xc:NaN},{...a,height:0},{...a,columnRadius:0},{...a,bayWidth:9},{...a,columnRadius:1}])assert.throws(()=>baoheFrontDoorLeaves(bad));
});
test('couplets bind exact official15-character wording, viewer sides and south-facing atlas halves',()=>{
 assert.equal(P.viewerRight,'祖訓昭垂我後嗣子孫尚克欽承有永');assert.equal(P.viewerLeft,'天心降鑒惟萬方臣庶當思容保無疆');
 for(const s of[P.viewerRight,P.viewerLeft])assert.equal([...s].length,15);
 const b=new PalaceBuilder(new THREE.Scene(),library()),g=new THREE.Group();buildBaoheColumnCouplets(b,g,{x0:0,z0:125,y:9,columnRadius:r});g.updateMatrixWorld(true);
 assert.equal(g.children.length,4);assert.equal(g.children.reduce((n,m)=>n+tris(m),0),28);assert.equal(b.colliders.length,0);assert.equal(b.walkables.length,0);
 const faces=g.children.filter(m=>m.userData.baoheCouplet);
 for(const [j,m]of faces.entries()){
  assert.equal(m.position.x,j?3.65:-3.65);assert.equal(m.userData.baoheCouplet.viewerSide,j?'left':'right');
  near(m.position.y-P.height/2,9.68);near(m.position.z,125+8.2-r*1.05-.09-.001);
  const a=m.geometry.attributes;for(let i=0;i<a.position.count;i++){
   near(a.normal.getZ(i),-1);near(a.uv.getX(i),(-a.position.getX(i)/P.width+.5+j)/2);
   near(a.uv.getY(i),a.position.getY(i)/P.height+.5);
  }
  const ray=new THREE.Raycaster(new THREE.Vector3(m.position.x,12,m.position.z-1),new THREE.Vector3(0,0,1));
  assert.equal(ray.intersectObject(g,true)[0].object,m);
 }
 assert.equal(faces[0].material,faces[1].material);assert.match(P.status,/NOT_SURVEY/);assert.match(P.lettering,/NOT_IMPERIAL/);
});
test('atlas draws yellow fields with black vertical text, stays private and disposes once',()=>{
 const old=globalThis.document,ops=[],ctx=new Proxy({},{get:(o,k)=>k in o?o[k]:(...args)=>ops.push({k,args,color:o.fillStyle}),set:(o,k,v)=>(o[k]=v,true)});
 try{
  globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>ctx})};
  const b=new PalaceBuilder(new THREE.Scene(),library()),gold=b.ownMat('gold',{color:0xc9a13b,metalness:.85,roughness:.3}),before=gold.toJSON();
  const m=baoheCoupletMaterial(b);assert.equal(m,baoheCoupletMaterial(b));assert.equal(m.map.image.width,256);assert.equal(m.map.image.height,2048);assert.equal(m.map.colorSpace,THREE.SRGBColorSpace);
  assert.deepEqual(ops.filter(o=>o.k==='fillText').map(o=>o.args[0]),[...P.viewerRight,...P.viewerLeft]);
  assert.ok(ops.filter(o=>o.k==='fillText').every(o=>o.color==='#201c16'));assert.equal(ops.filter(o=>o.k==='fillRect'&&o.color==='#c8a449').length,2);assert.deepEqual(gold.toJSON(),before);
  let n=0;m.map.addEventListener('dispose',()=>n++);b.dispose();assert.equal(n,1);m.dispose();assert.equal(n,1);
 }finally{globalThis.document=old;}
});
test('all12 actual front leaf bodies have corresponding full-height colliders; rear is untouched',()=>{
 const b=new PalaceBuilder(new THREE.Scene(),library()),g=new THREE.Group(),data=structuredClone(PALACE_LAYOUT.find(h=>h.name==='保和殿'));data.position={x:0,y:0,z:0};b.buildHall(g,data,9,{heightReferenceY:10});
 const leaves=g.children.filter(m=>m.userData.baoheFrontDoor);assert.equal(leaves.length,12);g.updateMatrixWorld(true);
 for(const m of leaves){const box=new THREE.Box3().setFromObject(m);assert.equal(b.colliders.filter(c=>['min','max'].every(k=>['x','y','z'].every(a=>Math.abs(c[k][a]-box[k][a])<1e-5))).length,1);assert.ok(box.max.z<0);}
 const rear=g.children.filter(m=>m.material?.name==='lattice_doors'&&m.rotation.y===Math.PI/2&&m.position.z>0);assert.equal(rear.length,6);assert.ok(rear.every(m=>!m.userData.baoheFrontDoor));
});
const W=await buildWorld();
test('allthree real front openings pass both ways with original player radius; closed panels block',()=>{
 const z=PALACE_LAYOUT.find(h=>h.name==='保和殿').position.z-8.3;
 for(const x of[-6.4,0,6.4])for(const dir of[-1,1]){
  const q=walkStraight(W,[x,z-3*dir],[x,z+3*dir],{feet0:9,step:.025});
  assert.ok(q.reached>=q.total-.051,JSON.stringify({x,dir,...q}));
  assert.ok(Math.abs(q.end[1]-(z+3*dir))<=.051);
 }
 for(const p of baoheFrontDoorLeaves({xc:0,zf:z,y:9,height:5.0832,bayWidth:7.3,columnRadius:r}))assert.equal(W.cm.checkCollision(new THREE.Vector3(p.x,10.7,p.z),.5),true);
});
test('couplet fronts remain inside the existing player exclusion around their physical columns',()=>{
 const z=PALACE_LAYOUT.find(h=>h.name==='保和殿').position.z+8.2-r*1.05-.09-.001;
 for(const x of[-3.65,3.65])for(const dx of[-P.width/2,0,P.width/2])assert.equal(W.cm.checkCollision(new THREE.Vector3(x+dx,10.7,z),.5),true);
});
