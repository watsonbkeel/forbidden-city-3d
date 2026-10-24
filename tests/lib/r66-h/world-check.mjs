// Consumes the one already-built production world. Local bounded builders only
// provide expected actual triangle/physics subsets; they never register in W.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fixture,meshes,THREE} from './fixture.mjs';
import {ritualFixture} from './ritual-fixture.mjs';
import {gateFixture} from './yinghua-gate-fixture.mjs';
import {replayKunning} from '../kunning-walk.mjs';
import {replayYinghuaJump} from './yinghua-motion.mjs';
const sameBox=(a,b)=>['min','max'].every(k=>['x','y','z'].every(ax=>Math.abs(a[k][ax]-b[k][ax])<1e-5));
const vertices=(m,k)=>{const p=m.geometry.attributes.position,ix=m.geometry.index;return [0,1,2].map(j=>new THREE.Vector3().fromBufferAttribute(p,ix?ix.getX(k+j):k+j).applyMatrix4(m.matrixWorld).toArray())};
const tk=v=>v.map(p=>p.map(x=>Math.round(x*1000)).join(',')).sort().join(';');
const center=v=>[0,1,2].map(i=>Math.floor(v.reduce((n,p)=>n+p[i],0)/3*100));
const matches=(a,b)=>a.every(p=>b.some(q=>p.every((v,i)=>Math.abs(v-q[i])<=.00008)));
function triangles(m,fn){const n=m.geometry.index?.count??m.geometry.attributes.position.count;for(let k=0;k<n;k+=3)fn(vertices(m,k));}
export function assertHInWorld(W){
 assert.ok(W.scene&&W.cm&&W.zoneManager);W.scene.updateMatrixWorld(true);const expected=new Map(),rows=[],physics=[];
 const builders=[()=>fixture('重华宫'),()=>fixture('延春阁'),()=>ritualFixture(),()=>gateFixture()];
 for(const make of builders){const w=make();try{
  const selected=meshes(w.f).filter(m=>m.userData.role?.startsWith('r66-'));
  for(const m of selected){const key=m.material?.name??'';if(!expected.has(key))expected.set(key,new Map());triangles(m,v=>expected.get(key).set(tk(v),v));}
  rows.push({name:w.item.name,newMeshes:selected.length});
  if(w.item.name==='英华门')physics.push(...w.kit.colliders);
 }finally{w.dispose()}}
 const wanted=[...expected.values()].reduce((n,s)=>n+s.size,0);assert.ok(wanted>1000);
 const buckets=new Map();for(const[name,points]of expected){const rows=new Map();for(const[key,v]of points){const b=center(v).join(',');if(!rows.has(b))rows.set(b,[]);rows.get(b).push(key);}buckets.set(name,rows);}
 for(const zone of ['west-six','outer-west']){const root=W.zoneManager.loaded.get(zone)?.data.group;assert.ok(root?.parent,'H actual zone attached');root.traverse(m=>{const keys=expected.get(m.material?.name);if(m.isMesh&&keys?.size&&m.visible)triangles(m,v=>{const key=tk(v);if(keys.has(key)&&matches(keys.get(key),v)){keys.delete(key);return;}const c=center(v),b=buckets.get(m.material.name);for(const dx of[-1,0,1])for(const dy of[-1,0,1])for(const dz of[-1,0,1])for(const k of b.get([c[0]+dx,c[1]+dy,c[2]+dz].join(','))??[])if(keys.has(k)&&matches(keys.get(k),v)){keys.delete(k);return;}});});}
 assert.equal([...expected.values()].reduce((n,s)=>n+s.size,0),0,'every bounded new local triangle exists in actual merged production zone '+JSON.stringify([...expected].filter(([,s])=>s.size).map(([name,s])=>({name,missing:s.size,examples:[...s.keys()].slice(0,3)}))));
 for(const b of physics)assert.equal(W.cm.colliders.filter(c=>sameBox(c.box??c,b)).length,1,'one exact H solid proxy');
 const arc=W.cm.colliders.filter(c=>c.overhead?.sourceId==='outer-west/yinghua-arch');assert.equal(arc.length,1);
 assert.equal(W.cm.getGroundHeight(277.2,454.9),.1);
 assert.equal(W.cm.checkCollision(new THREE.Vector3(277.2,1.8,454.9),.5),false);
 const before=JSON.parse(fs.readFileSync(new URL('../../fixtures/r66-h/inventory-before.json',import.meta.url)));
 for(const name of ['重华宫','延春阁']){
  const rooms=W.zoneManager.allRooms.filter(r=>r.name===name||r.name?.startsWith(name+'·'));assert.ok(rooms.length);
  for(const room of rooms){assert.equal(room.inventory.status,'UNKNOWN');assert.equal(room.inventory.knownEmpty,false);assert.equal(room.layout.status,'UNVERIFIED_RETAINED_MODEL_BOUNDS');}
  for(const b of before[name].removedColliders){const box={min:new THREE.Vector3(b.min.x,b.min.y,b.min.z),max:new THREE.Vector3(b.max.x,b.max.y,b.max.z)};assert.equal(W.cm.colliders.some(c=>sameBox(c.box??c,box)),false,'no removed placeholder collision');}
 }
 for(const name of ['重华宫','延春阁','英华殿','英华门'])assert.equal(W.zoneManager.allMapItems.filter(m=>m.name===name).length,1,'retained named map identity '+name);
 return{rows,actualMergedNewTriangles:wanted,uniqueExactNewProxies:physics.length,archCount:arc.length,unknownFurniture:['重华宫','延春阁'],boundary:'Real merged B meshes/physics and UNKNOWN metadata, not WebGL or historic completeness'};
}
export function replayHWorld(t,W,{release=()=>{}}={}){
 const routes={chonghua:[[118.9,487],[118.9,489],[118.9,491.3],[118.9,494],[118.9,496],[118.9,498.3],[118.9,500]],yanchun:[[216,470],[216,472],[216,473.35],[216,476.45]],yinghua:[[254.7,448],[254.7,451.2],[277.2,451.2],[277.2,452.6],[277.2,454.9],[277.2,457],[277.2,459]]},rows=[];
 for(const[name,points]of Object.entries(routes))for(const fps of[10,60])for(const sprint of[false,true])for(const backward of[false,true]){
  const r=replayKunning(t,W,[...points,...points.slice(0,-1).reverse()],{fps,sprint,backward,startFeet:W.cm.getGroundHeight(...points[0]),recordFrames:false});assert.ok(r.arrived,name+' '+JSON.stringify(r));rows.push({name,fps,sprint,backward,...r});release('h-ground-route');
 }
 const jumps=[];for(const fps of[5,10,60])for(const c of[{x:276.3},{x:277.2},{x:278.1},{x:277.2,z:452.3,direction:1,moving:true},{x:277.2,z:457.5,direction:-1,moving:true},{x:277.2,drop:true}]){const r=replayYinghuaJump(t,W,{fps,...c});assert.equal(r.contacts.length,0,JSON.stringify({...r,frames:undefined}));assert.ok(Math.abs(r.end[2]-r.ground)<1e-8);jumps.push({...r,frames:undefined});release('h-arch-jump');}
 return{routes:rows,jumps};
}
