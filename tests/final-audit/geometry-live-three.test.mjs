import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import * as THREE from 'three';
import {CollisionManager} from '../../src/utils/Collision.js';
import {ZoneBase} from '../../src/scene/zones/ZoneBase.js';
import {fixture as facade,roles,geometryHealth} from '../lib/r58-court-facade-fixture.mjs';
const url=new URL('../../src/scene/palace/special/ZhaodeGateProfile.js',import.meta.url);
const api=existsSync(url)?await import(url):{};
const ctx=new Proxy({},{get:()=>()=>({data:[]}),set:()=>true});
globalThis.document??={createElement:()=>({getContext:()=>ctx,width:0,height:0}),createElementNS:()=>({addEventListener(){},removeEventListener(){}})};
const axis=JSON.parse(readFileSync(new URL('../../data/zones/axis-courts.json',import.meta.url)));
const item=axis.items.find(i=>i.name==='昭德门');
const close=(a,b,msg)=>assert.ok(Math.abs(a-b)<1e-5,msg??`${a} != ${b}`);
function library(){const materials=new Map();return {materials,material:n=>materials.get(n)??(materials.set(n,new THREE.MeshStandardMaterial({name:n})),materials.get(n)),tileSize:()=>1,aspect:()=>1};}
function geom(opts={}){assert.equal(typeof api.zhaodeGateGeometry,'function','dedicated three-core-bay profile is required');return api.zhaodeGateGeometry({x:0,z:0,gateProfile:'zhaode',gateKind:'three-bay',...opts});}
const nodes=(root,role)=>{const out=[];root.traverse(o=>{if(o.userData.role===role)out.push(o);});return out;};
function ray(root,from,to,far=100){const r=new THREE.Raycaster(new THREE.Vector3(...from),new THREE.Vector3(...to));r.far=far;return r.intersectObject(root,true);}
test('only the two explicit corridor ends resolve to the profile envelope and remain closed',()=>{
 const joins=axis.items.filter(i=>i.gateJoin?.gate===item.name);assert.equal(joins.length,2);assert.deepEqual(joins.map(i=>i.facing),['z-','z-']);const zone=new ZoneBase(library(),{id:'joins',items:[item,...joins]});zone.kit.finish=()=>zone.kit.root;const built=zone.build();built.group.updateMatrixWorld(true);close(zone.gateWidths.get('昭德门'),24.4);const g=geom(item);
 assert.deepEqual(joins[0].from,[-105.97,-217.3]);assert.deepEqual(joins[1].to,[-26.5,-217.3]);
 const corridorFrames=zone.kit.root.children.filter(o=>o.userData.gateJoin);assert.equal(corridorFrames.length,2);
 for(const f of corridorFrames){const join=g.joins[f.userData.gateJoin.side];close(f.userData.gateJoin.boundary[0],join.world[0]);close(f.userData.gateJoin.boundary[1],-217.3);const bounds=new THREE.Box3().setFromObject(f);assert.ok(f.userData.gateJoin.provisional);if(join.side==='left')assert.ok(bounds.max.x<=join.world[0]+.071);else assert.ok(bounds.min.x>=join.world[0]-.071);}
 const cm=new CollisionManager();cm.rivers=[];cm.addColliders(built.colliders);cm.addWalkables(built.walkables);
 for(const side of [-1,1])for(const z of [-5.2,-3.1,-1,0])for(const feet of [0,.45,3.216]){const wx=g.x+side*12.1,wz=g.z+z;assert.equal(cm.checkCollision(new THREE.Vector3(wx,feet+1.7,wz),.5),true,'closed wing interface cannot be entered');assert.ok(ray(built.group,[g.x+side*14,feet+1.2,wz],[-side,0,0],5).length,'closed cap must have visible wall');}
 const gateFrame=zone.kit.root.children.find(f=>f.userData.gateGeometry);for(const rail of nodes(gateFrame,'zhaode-railing')){const b=new THREE.Box3().setFromObject(rail);for(const cap of nodes(gateFrame,'zhaode-wing-cap')){const c=new THREE.Box3().setFromObject(cap);const overlap=b.clone().intersect(c).getSize(new THREE.Vector3());assert.ok(Math.min(overlap.x,overlap.y,overlap.z)<1e-5,'rails cannot penetrate closed wing caps');}}
});

test('Xihe: six physical rear corbels and finite nondegenerate triangles before pruning, after pruning and after actual merge',()=>{
 let pre;const f=facade('xihe',{},null,k=>{const map=k.mapRect.bind(k);k.mapRect=(...args)=>{pre=geometryHealth(args[0]);return map(...args)};});
 const c=roles(f.frame,'xihe-courtyard-corbel');assert.equal(c.length,6);assert.deepEqual(c.map(m=>m.userData.bay),[1,1,2,2,3,3]);for(const m of c)assert.ok(geometryHealth(m).triangles>12);
 const post=geometryHealth(f.frame);assert.ok(pre.triangles>post.triangles);const merged=geometryHealth(f.kit.finish());assert.equal(merged.triangles,post.triangles);
});
test('Tiren: six windows with paired physical sash bars, in all and only the six side bays',()=>{
 const f=facade('tiren'),windows=roles(f.frame,'lower-window');assert.deepEqual(windows.map(o=>o.userData.bay),[1,2,3,5,6,7]);
 for(const w of windows){const leaves=roles(w,'lower-window-leaf');assert.equal(leaves.length,2);for(const l of leaves){const bars=roles(l,'lower-window-leaf-bar');assert.equal(bars.length,6);for(const m of bars){assert.ok(m.isMesh);assert.ok(geometryHealth(m).triangles>0);}}}
 assert.equal(roles(f.frame,'lower-window-bar').length,0);
});
