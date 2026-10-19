import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import { ZoneBase } from '../src/scene/zones/ZoneBase.js';
import { buildWorld, walkStraight } from './lib/world.mjs';
import { eastWestCityGateGeometry } from '../src/scene/palace/special/EastWestCityGate.js';
import { Enclosure } from '../src/scene/Enclosure.js';
const ctx=new Proxy({},{get:()=>()=>({data:[]}),set:()=>true});
globalThis.document??={createElement:()=>({getContext:()=>ctx,width:0,height:0}),createElementNS:()=>({addEventListener(){},removeEventListener(){}})};
function capture(file){
 const data=JSON.parse(fs.readFileSync(new URL(`../data/zones/${file}.json`,import.meta.url))),item=data.items.find(i=>i.kind==='cityGate');
 const mats=new Map(),lib={material(n,p={}){const k=n+JSON.stringify(p);if(!mats.has(k))mats.set(k,new THREE.MeshStandardMaterial({name:n,...p}));return mats.get(k);},tileSize:()=>1,aspect:()=>1};
 const z=new ZoneBase(lib,{id:file,items:[item]}),roofs=[];const orig=z.kit.roof.bind(z.kit);z.kit.roof=(f,o,...rest)=>{roofs.push(o);return orig(f,o,...rest);};z.kit.finish=()=>z.kit.root;const result=z.build();result.group.updateMatrixWorld(true);
 const frame=result.group.children[0];return{z,item,frame,roofs,lib};
}
for(const file of ['outer-east','outer-west']){
 test(`${file} has three square exterior passages, internal vaults and a two-eave hipped roof`,()=>{
  const {frame,roofs}=capture(file);
  assert.equal(frame.userData.cityGate?.portalCount,3);
  assert.ok(roofs.some(r=>r.type==='wudian'&&r.layers===2));
  frame.updateMatrixWorld(true);
  for(const x of [-8.4,0,8.4]){
   const from=new THREE.Vector3(x,1.7,-9).applyMatrix4(frame.matrixWorld),dir=new THREE.Vector3(0,0,1).transformDirection(frame.matrixWorld);
   const ray=new THREE.Raycaster(from,dir,0,18);assert.equal(ray.intersectObject(frame,true).length,0,`blocked portal ${x}`);
  }
  const upAt=x=>{const from=new THREE.Vector3(x,2,0).applyMatrix4(frame.matrixWorld);return new THREE.Raycaster(from,new THREE.Vector3(0,1,0)).intersectObject(frame,true)[0]?.point.y;};
  assert.ok(upAt(0)>upAt(2.5)+.3,'actual interior roof must be vaulted, not flat');
 });
 test(`${file} platform intersects the actual enclosure wall, with original anchor retained`,()=>{
  const {z,item,lib,frame}=capture(file),en=new Enclosure(new THREE.Scene(),lib),root=new THREE.Group();en.buildOuterWalls(root);
  const expected=file==='outer-east'?[-365.8,-257]:[360.5,-260.6];assert.deepEqual([item.x,item.z],expected);
  const sideX=file==='outer-east'?-en.wallLines().x:en.wallLines().x;
  const wallAtEnds=en.colliders.filter(b=>b.min.x<=sideX&&b.max.x>=sideX&&[item.z-15,item.z+15].some(v=>v>=b.min.z-1e-8&&v<=b.max.z+1e-8));
  for(const sign of [-1,1]){
   const local=new THREE.Vector3(sign*14.9,1.7,0).applyMatrix4(frame.matrixWorld);
   const jamb=z.kit.colliders.find(b=>b.containsPoint(local));assert.ok(jamb,'outer masonry exists');
   assert.ok(wallAtEnds.some(w=>w.clone().expandByScalar(1e-8).intersectsBox(jamb)),'detached red masonry at enclosure interface');
  }
 });
}

test('profile rejects unknown labels, mismatched orientation and nonfinite anchors',()=>{
 const valid={name:'东华门',x:-365.8,z:-257,rot:'east',cityGateProfile:'east-west'};
 for(const delta of [{name:'猜测门'},{rot:'west'},{x:NaN},{cityGateProfile:'generic'}])assert.throws(()=>eastWestCityGateGeometry({...valid,...delta}),/profile|anchor/);
});
test('all six portals pass the actual controller both ways and masonry remains blocking',async()=>{
 const W=await buildWorld();
 for(const gate of W.gates.filter(g=>g.item.cityGateProfile==='east-west')){
  const p=eastWestCityGateGeometry(gate.item),c=Math.cos(p.rot),s=Math.sin(p.rot);
  const toW=(x,z)=>[p.x+x*c+z*s,p.z-x*s+z*c];
  for(const x of p.portalCenters)for(const sign of [-1,1]){
   const r=walkStraight(W,toW(x,-10*sign),toW(x,10*sign));
   assert.ok(r.reached>=r.total-.1,`${p.name} portal ${x}: ${JSON.stringify(r)}`);
  }
  for(const x of [-13,-4.2,4.2,13]){
   const r=walkStraight(W,toW(x,-10),toW(x,10));assert.ok(r.reached<5,`${p.name} masonry bypass ${x}`);
  }
 }
});
for(const file of ['outer-east','outer-west'])test(`${file} geometry/UVs are finite and plaque clears the inter-eave band`,()=>{
 const {frame,z}=capture(file);z.kit.buildPlaqueAtlas();frame.updateMatrixWorld(true);
 frame.traverse(o=>{if(!o.isMesh)return;for(const name of ['position','normal','uv']){
  const a=o.geometry.getAttribute(name);assert.ok(a,`${o.name}: ${name}`);assert.ok([...a.array].every(Number.isFinite),`${o.name}: nonfinite ${name}`);
 }});
 const m=frame.userData.plaqueMount;assert.ok(m.y-(m.height+.12)/2>m.lowerY);assert.ok(m.y+(m.height+.12)/2<m.upperY);
 const plaque=z.kit.plaques[0].mesh;assert.equal(z.kit.plaques[0].text,file==='outer-east'?'東華門':'西華門');
 const point=new THREE.Vector3(0,m.y,m.z).applyMatrix4(frame.matrixWorld),out=new THREE.Vector3(0,0,-1).transformDirection(frame.matrixWorld);
 const hit=new THREE.Raycaster(point.clone().addScaledVector(out,2),out.clone().negate(),0,2.01).intersectObject(frame,true)[0];assert.equal(hit?.object,plaque,'plaque must face outward with no roof masking its centre');
});
