import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import { ZoneBase } from '../src/scene/zones/ZoneBase.js';
const data = JSON.parse(fs.readFileSync(new URL('../data/zones/ningshou.json',import.meta.url)));
const ctx = new Proxy({}, {get:()=>()=>({data:[]}),set:()=>true});
globalThis.document ??= {createElement:()=>({getContext:()=>ctx,width:0,height:0}),createElementNS:()=>({addEventListener(){},removeEventListener(){}})};
function capture() {
 const mats=new Map(), library={material(n){if(!mats.has(n))mats.set(n,new THREE.MeshStandardMaterial({name:n}));return mats.get(n);},tileSize:()=>1,aspect:()=>1};
 const z=new ZoneBase(library,{...data,items:data.items.filter(i=>i.kind==='gate'||i.kind==='wall')});
 const gates=new Map(),walls=[];
 z.buildGate=function(i){const n=this.kit.colliders.length;const out=ZoneBase.prototype.buildGate.call(this,i);gates.set(i.name,this.kit.colliders.slice(n));return out;};
 z.buildWall=function(i){const n=this.kit.colliders.length;ZoneBase.prototype.buildWall.call(this,i);walls.push({item:i,colliders:this.kit.colliders.slice(n)});};
 z.kit.finish=()=>z.kit.root;z.build();return{z,gates,walls};
}
const result=capture();
test('all named Ningshou perimeter openings physically meet both gate jambs',()=>{
 for(const {item,colliders} of result.walls)for(const gap of item.gaps??[]){
  if(!gap.gate)continue;
  const g=data.items.find(v=>v.name===gap.gate),axis=Math.abs(item.to[0]-item.from[0])>=Math.abs(item.to[1]-item.from[1])?'x':'z';
  const width=result.z.gateWidths.get(g.name),center=g[axis];
  for(const sign of [-1,1]){
   const boundary=center+sign*width/2;
   const candidates=result.gates.get(g.name).filter(b=>b.min[axis]<=boundary+1e-8&&b.max[axis]>=boundary-1e-8);
   const jamb=candidates.find(b=>colliders.some(w=>w.clone().expandByScalar(1e-8).intersectsBox(b)));
   assert.ok(jamb,`${g.name} has ${sign} solid jamb`);
   assert.ok(colliders.some(w=>w.clone().expandByScalar(1e-8).intersectsBox(jamb)),`${g.name} jamb ${sign} is detached from its perimeter wall`);
  }
 }
});
test('existing named anchors stay fixed while the approximate east perimeter is reconciled',()=>{
 for(const [name,x,z] of [['敛禧门',-354,136.8],['保泰门',-353.8,336.5],['履顺门',-233.4,255],['蹈和门',-233.5,304.3],['贞顺门',-272.3,518.9]]){
  const g=data.items.find(v=>v.name===name);assert.deepEqual([g.x,g.z],[x,z]);
 }
 const e=result.walls.find(w=>w.item.gaps?.some(g=>g.gate==='敛禧门')).item;
 assert.equal(e.from[0],e.to[0]);
 assert.ok(e.gaps.some(g=>g.gate==='保泰门'),'the two gates share one straight wall');
});
