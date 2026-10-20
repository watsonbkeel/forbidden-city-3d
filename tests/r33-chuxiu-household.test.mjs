import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import * as THREE from 'three';
import { CourtKit } from '../src/scene/palace/kit.js';
import { ZoneBase } from '../src/scene/zones/ZoneBase.js';
import { CollisionManager } from '../src/utils/Collision.js';
import { FlightEnvelope, createPalaceFlightEnvelope } from '../src/scene/flight/FlightEnvelope.js';
const url=new URL('../src/scene/palace/special/ChuxiuHall.js',import.meta.url);
const api=existsSync(url)?await import(url):{};
const west=JSON.parse(readFileSync(new URL('../data/zones/west-six.json',import.meta.url)));
const item=west.items.find(i=>i.name==='储秀宫'&&i.kind==='hall');
const ctx=new Proxy({},{get:()=>()=>({data:[]}),set:()=>true});
globalThis.document??={createElement:()=>({getContext:()=>ctx,width:0,height:0})};
function library(){const mats=new Map();return{tileSize:()=>1,aspect:()=>1,material(n){if(!mats.has(n))mats.set(n,new THREE.MeshStandardMaterial({name:n}));return mats.get(n);}};}
const nodes=(root,role)=>{const a=[];root.traverse(o=>{if(o.userData.role===role)a.push(o);});return a;};
function fixture(){assert.equal(typeof api.buildChuxiuHall,'function');const kit=new CourtKit(library(),'west-six');const built=api.buildChuxiuHall(kit,item);kit.root.updateMatrixWorld(true);const cm=new CollisionManager();cm.rivers=[];cm.addColliders(kit.colliders);cm.addWalkables(kit.walkables);return{kit,cm,...built};}
function walk(cm,from,to,feet=item.ph){let p=new THREE.Vector3(item.x+from[0],feet+1.7,item.z+from[1]);const goal=new THREE.Vector3(item.x+to[0],feet+1.7,item.z+to[1]);const delta=goal.clone().sub(p);const n=Math.ceil(delta.length()/.08),step=delta.clone().multiplyScalar(1/n);for(let k=0;k<n;k++){const next=p.clone().add(step);p.copy(cm.getValidPosition(p,next,.5,p.y-1.7,.6));}assert.ok(Math.hypot(p.x-goal.x,p.z-goal.z)<.15,`blocked ${from} -> ${to}: ${p.toArray()}`);}
test('Chuxiu single-building profile reaches the actual zone builder and replaces the generic room once',()=>{const {kit,f,g}=fixture();assert.equal(item.structure,'chuxiu-household');assert.equal(g.dimensionStatus,'official-topology-model-fit');assert.equal(kit.rooms.length,5);assert.deepEqual(kit.rooms.map(r=>r.name),['储秀宫·东梢间','储秀宫·东次间','储秀宫·明间','储秀宫·西次间','储秀宫·西梢间暖阁']);assert.equal(kit.mapItems.length,1);assert.equal(kit.mapItems[0].name,'储秀宫');assert.equal(kit.rooms.some(r=>r.kind==='throne'),false);assert.equal(nodes(f,'chuxiu-five-screen-panel').length,5);assert.ok(nodes(f,'chuxiu-attested-plaque').some(p=>p.userData.text==='大圆宝镜'));const z=new ZoneBase(library(),west);z.buildHall(item);assert.equal(z.kit.rooms.length,5);assert.ok(z.kit.root.children[0].userData.structure.id==='west-six/chuxiu-household');});
test('four boundaries preserve east-to-west identity, central apertures, and west rear warm compartment',()=>{const {g,f}=fixture();assert.deepEqual(g.partitions.map(p=>p.identity),['grape-openwork','bamboo-glass','magnolia-glass','longevity-glass']);assert.ok(g.partitions.every((p,i)=>i===0||p.x>g.partitions[i-1].x));assert.ok(g.warmAlcove.x>0&&g.warmAlcove.z>0);assert.ok(nodes(f,'chuxiu-warm-alcove').length);assert.equal(g.partitions[1].leafCount,8);assert.equal(g.partitions[2].leafCount,8);assert.ok(g.porch.depth>0);assert.ok(nodes(f,'chuxiu-window-glass').length>0);assert.ok(nodes(f,'chuxiu-window-lattice').length>0);});
test('real CollisionManager traverses the entrance, all four partition apertures, and porch in both directions',()=>{const {cm,g}=fixture();walk(cm,[0,-9],[0,g.passageZ],0);for(const [a,b]of[[[-11,g.passageZ],[11,g.passageZ]],[[11,g.passageZ],[-11,g.passageZ]],[[-10,g.porch.centerZ],[10,g.porch.centerZ]],[[10,g.porch.centerZ],[-10,g.porch.centerZ]]])walk(cm,a,b);for(const p of g.partitions){assert.equal(cm.checkCollision(new THREE.Vector3(item.x+p.x,item.ph+1.7,item.z+g.passageZ),.5),false);assert.equal(cm.checkCollision(new THREE.Vector3(item.x+p.x,item.ph+1.7,item.z+p.solidProbeZ),.3),true);}for(const r of cm.walkables)assert.ok(r.type==='box'||r.type==='ramp');});
test('every registered door and safe spawn corresponds to real unblocked geometry',()=>{const{kit,cm}=fixture();for(const r of kit.rooms){assert.ok(r.doors.length);for(const p of [...r.doors,...r.spawns])assert.equal(cm.checkCollision(new THREE.Vector3(p.x,r.floorY+1.7,p.z),.45),false,`${r.name}: ${JSON.stringify(p)}`);}});
const signature=m=>JSON.stringify({type:m.geometry?.type,p:m.position.toArray(),r:m.rotation.toArray(),s:m.scale.toArray(),mat:m.material?.name,attrs:Object.fromEntries(Object.entries(m.geometry?.attributes??{}).map(([k,v])=>[k,[...v.array]])),index:m.geometry?.index?[...m.geometry.index.array]:null});
test('retained five-bay columns, roof, platform, stairs and walkables exactly match the original generic shell',()=>{const{kit,f}=fixture(),base=new CourtKit(library(),'baseline');const{structure,chuxiuProfile,...old}=item;const{f:bf}=base.hall({...old,throne:false,interior:'empty'});const pick=root=>{const a=[];root.traverse(o=>{if(o.isMesh&&(o.geometry?.type==='CylinderGeometry'||['stone_slab','wall_brick'].includes(o.material?.name)||o.material?.name?.includes('roof')||o.material?.name==='kit_ridge'))a.push(signature(o));});return a.sort();};assert.deepEqual(pick(f),pick(bf));assert.deepEqual(kit.walkables,base.walkables);});
test('actual merged geometry keeps the flight envelope safe in loaded and prebuilt zone paths',()=>{const{kit,f}=fixture();const base=new CourtKit(library());const{structure,chuxiuProfile,...old}=item;base.hall({...old,throne:false,interior:'empty'});const before=new FlightEnvelope().addRoot(base.root);const merged=kit.finish(),empty=new THREE.Group();const data={group:merged};for(const loaded of[true,false]){const grid=createPalaceFlightEnvelope({palaceBuilder:{ownedObjects:[]},enclosure:{group:empty},garden:{group:empty},zoneManager:{zones:new Map([['west-six',{}]]),loaded:new Map(loaded?[['west-six',{data}]]:[]),prebuilt:new Map(loaded?[]:[['west-six',{data}]])},layout:[]});for(let x=-15;x<=15;x+=2)for(let z=-9;z<=9;z+=2)assert.equal(grid.sample(item.x+x,item.z+z).height,before.sample(item.x+x,item.z+z).height);assert.equal(grid.safeGround(item.x,item.z,2),false);assert.equal(grid.isSafe({x:item.x,y:2,z:item.z},2),false);}assert.equal(merged.userData.architecture[0].id,'west-six/chuxiu-household');kit.dispose(merged);});
test('full source geometry is finite with an explicit incremental triangle/material budget',()=>{const{f,g}=fixture();let triangles=0;const mats=new Set();f.traverse(o=>{if(!o.isMesh)return;triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;mats.add(o.material);for(const a of Object.values(o.geometry.attributes))assert.ok([...a.array].every(Number.isFinite));});assert.equal(g.budget.totalTriangles,triangles);assert.ok(g.budget.addedTriangles<=16000,JSON.stringify(g.budget));assert.ok(g.budget.addedMeshes<=1100,JSON.stringify(g.budget));assert.ok(mats.size<=24);});
test('malformed or transplanted profiles reject before adding a shell',()=>{for(const change of[{name:'储秀宫后殿'},{chuxiuProfile:'surveyed'},{x:95},{rot:'east'},{open:true},{backDoor:true},{roomBays:1},{bays:6}]){const kit=new CourtKit(library());assert.throws(()=>api.buildChuxiuHall(kit,{...item,...change}),/Chuxiu/);assert.equal(kit.root.children.length,0);assert.equal(kit.rooms.length,0);}const z=new ZoneBase(library(),{id:'east-six'});assert.throws(()=>z.buildHall(item),/west-six/);assert.equal(z.kit.root.children.length,0);});
test('native inscription textures and all private materials dispose with the owning zone',()=>{const {kit}=fixture();const counts=new Map();for(const m of kit.owned){counts.set(m,0);m.addEventListener('dispose',()=>counts.set(m,counts.get(m)+1));if(m.map&&m.name.startsWith('chuxiu_')){counts.set(m.map,0);m.map.addEventListener('dispose',()=>counts.set(m.map,counts.get(m.map)+1));}}const merged=kit.finish();kit.dispose(merged);for(const[n,count]of counts)assert.equal(count,1,n.name??'texture');assert.equal(kit.colliders.length,0);assert.equal(kit.walkables.length,0);});

test('recessed frontage closes every inter-bay strip rather than exposing the rear wall',()=>{
 const {f,g}=fixture();
 for(const part of g.partitions)for(const dx of[-.2,.2])for(const height of[.3,1.7,3.9])for(const direction of[-1,1]){
  const ray=new THREE.Raycaster(new THREE.Vector3(item.x+part.x+dx,item.ph+height,item.z+g.front-direction*.5),new THREE.Vector3(0,0,direction),0,1);
  const hits=ray.intersectObject(f,true);
  assert.ok(hits.length,`unclosed facade: x=${part.x+dx}, height=${height}, direction=${direction}`);
  assert.ok(Math.abs(hits[0].point.z-item.z-g.front)<.2,'closure belongs at the recessed facade');
 }
 for(const x of[-1,0,1]){
  const ray=new THREE.Raycaster(new THREE.Vector3(item.x+x,item.ph+1.7,item.z+g.front-.5),new THREE.Vector3(0,0,1),0,1);
  assert.equal(ray.intersectObject(f,true).length,0,'intended central entrance remains open');
 }
});
test('frontage closure collision matches the filled strips without blocking the central entry',()=>{
 const {cm,g}=fixture();
 for(const part of g.partitions)for(const dx of[-.2,.2])assert.equal(cm.checkCollision(new THREE.Vector3(item.x+part.x+dx,item.ph+1.7,item.z+g.front),.03),true,'visible strip requires matching collision');
 for(const x of[-1,0,1])assert.equal(cm.checkCollision(new THREE.Vector3(item.x+x,item.ph+1.7,item.z+g.front),.45),false,'central doorway remains walkable');
 walk(cm,[0,g.front-.7],[0,g.front+.7]);
});
