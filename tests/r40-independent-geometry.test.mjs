import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {ZoneBase} from '../src/scene/zones/ZoneBase.js';
import {CollisionManager} from '../src/utils/Collision.js';
import {FlightEnvelope} from '../src/scene/flight/FlightEnvelope.js';
import {library} from './lib/inner-palace-fixture.mjs';
const config=JSON.parse(readFileSync(new URL('../data/zones/east-six.json',import.meta.url)));
const find=(f,role)=>{const a=[];f.traverse(o=>{if(o.userData.role===role)a.push(o);});return a;};
function fixture(name,whole=false){const item=config.items.find(i=>i.name===name&&i.kind==='hall'),b=new ZoneBase(library(),config);let f;if(whole){for(const i of config.items)if(i.kind==='hall'){const r=b.buildHall(i);if(i===item)f=r.f;}}else f=b.buildHall(item).f;b.kit.root.updateMatrixWorld(true);const cm=new CollisionManager();cm.rivers=[];cm.addColliders(b.kit.colliders);cm.addWalkables(b.kit.walkables);return {item,b,f,cm};}
const bounds=o=>new THREE.Box3().setFromObject(o);
function ray(root,x,z,y,dir){return new THREE.Raycaster(new THREE.Vector3(x,y,z),new THREE.Vector3(0,dir,0),0,30).intersectObject(root,true);}
test('R40 independent: Yonghe caps meet without coplanar overlap and actual stair/platform surfaces connect',()=>{
 const {b,f,item}=fixture('永和宫'),cap=find(f,'yonghe-canopy-platform-cap')[0],a=bounds(cap);
 const retained=f.children.filter(o=>o.isMesh&&o.material?.name==='stone_slab').map(bounds).find(v=>v.min.x<item.x-item.w/2&&v.max.x>item.x+item.w/2);assert.ok(retained);
 assert.ok(Math.abs(a.max.z-retained.min.z)<1e-5,`extension cap ends ${a.max.z}, retained starts ${retained.min.z}`);assert.ok(Math.abs(a.max.y-retained.max.y)<1e-6);
 const canopy=find(f,'yonghe-open-canopy')[0],edge=item.z+canopy.userData.platformFront,from=edge-item.ph*1.6+.001,to=item.z-item.d/2-.2;let previous=0;
 for(let z=from;z<=to;z+=.025){const hits=ray(f,item.x,z,item.ph+.3,-1);assert.ok(hits.length,`missing physical surface at ${z}`);const y=hits[0].point.y;assert.ok(y>=previous-.001,`stair/platform unexpectedly descends at ${z}`);assert.ok(y-previous<.2,`physical step too large at ${z}`);previous=y;}
 b.kit.dispose(b.kit.root);
});
test('R40 independent: Yonghe real canopy winding, curved underside and walking headroom are coherent',()=>{
 const {b,f,item,cm}=fixture('永和宫'),canopy=find(f,'yonghe-open-canopy')[0];
 for(const [role,sign]of[['yonghe-curved-roof-tiles',1],['yonghe-curved-roof-underside',-1]]){const o=find(f,role)[0],n=o.geometry.attributes.normal,p=o.geometry.attributes.position;let min=Infinity,max=-Infinity;for(let i=0;i<n.count;i++){assert.ok(sign*n.getY(i)>0,role+' must face correct side');min=Math.min(min,p.getY(i));max=Math.max(max,p.getY(i));}assert.ok(max-min>1,'must be curved, not flat');}
 for(const x of[-7,-4,0,4,7])for(const z of[-8,-7.5,-7]){const p=new THREE.Vector3(item.x+x,item.ph+1.7,item.z+z);assert.equal(cm.checkCollision(p,.5),false,`open canopy blocked at ${x},${z}`);const hits=ray(canopy,p.x,p.z,p.y,1);assert.ok(hits.length,`missing visible underside ${x},${z}`);assert.ok(hits[0].distance>2,'canopy headroom');}
 const mainCeiling=find(f,'yonghe-main-paper-ceiling');assert.equal(mainCeiling.length,1);assert.ok(bounds(mainCeiling[0]).min.z>=item.z-item.d/2-1e-5);
 b.kit.dispose(b.kit.root);
});
test('R40 independent: Zhongcui old window plane is clear and moved opaque panels block on their visible plane',()=>{
 const {b,f,item,cm}=fixture('钟粹宫');for(const win of find(f,'east-facade-sill-window')){const box=bounds(win),x=(box.min.x+box.max.x)/2;assert.equal(cm.checkCollision(new THREE.Vector3(x,item.ph+1.7,item.z-item.d/2),.5),false,'no phantom original window collider');assert.equal(cm.checkCollision(new THREE.Vector3(x,item.ph+1.7,(box.min.z+box.max.z)/2),.5),true,'moved window collider follows visible panel');}
 const z=item.z-item.d/2+f.userData.structure.frontEnclosureInset/2;for(let x=item.x-item.w/2+1;x<item.x+item.w/2-1;x+=.1)assert.equal(cm.checkCollision(new THREE.Vector3(x,item.ph+1.7,z),.5),false,'continuous narrow veranda behind original columns');b.kit.dispose(b.kit.root);
});
test('R40 independent: Jingren real rear doorway, landing and courtyard gap remain clear with neighboring halls',()=>{
 const {b,f,item,cm}=fixture('景仁宫',true),door=b.kit.rooms.find(r=>r.name===item.name).doors.find(d=>d.z>item.z);assert.ok(door);for(let z=door.z-.8;z<=door.z+2.6;z+=.1){const feet=cm.getGroundHeight(door.x,z,item.ph);assert.equal(cm.checkCollision(new THREE.Vector3(door.x,feet+1.7,z),.5),false,`rear route collision at ${z}`);}
 const glazing=find(f,'jingren-rear-glazed-fit');assert.equal(glazing.length,4);for(const g of glazing){g.traverse(o=>{if(o.isMesh)assert.notEqual(o.material.name,'lattice_doors');});}
 b.kit.dispose(b.kit.root);
});
test('R40 independent: merged canopy contributes every actual roof vertex to conservative flight envelope',()=>{
 const {b,f}=fixture('永和宫'),vertices=[];for(const role of['yonghe-curved-roof-tiles','yonghe-rounded-bargeboard'])for(const o of find(f,role)){const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++)vertices.push(new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld));}
 const merged=b.kit.finish(),env=new FlightEnvelope().addRoot(merged);assert.ok(vertices.length>100);for(const p of vertices)assert.ok(env.sample(p.x,p.z).height>=p.y-1e-5,'merged flight envelope must contain actual canopy vertex');const record=merged.userData.architecture.find(r=>r.profile==='yonghe-open-baoxia');assert.equal(record.photographyDate,null);assert.match(record.accessStatus,/NOT_HISTORICAL/);b.kit.dispose(merged);
});
test('R40 independent: every non-plaque material retains triangle count and actual vertex bounds through merging',()=>{
 function stats(root){const map=new Map();root.updateMatrixWorld(true);root.traverse(o=>{if(!o.isMesh||!o.material||o.material.name==='kit_plaques')return;const p=o.geometry.attributes.position,s=map.get(o.material)??{count:0,box:new THREE.Box3()};s.count+=o.geometry.index?.count??p.count;for(let i=0;i<p.count;i++){const v=new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld);assert.ok(v.toArray().every(Number.isFinite));s.box.expandByPoint(v);}map.set(o.material,s);});return map;}
 for(const name of['永和宫','钟粹宫','景仁宫']){const{b}=fixture(name),before=stats(b.kit.root),merged=b.kit.finish(),after=stats(merged);assert.equal(after.size,before.size);for(const[m,s]of before){const a=after.get(m);assert.ok(a,m.name);assert.equal(a.count,s.count,m.name);assert.ok(a.box.min.distanceTo(s.box.min)<1e-4,m.name);assert.ok(a.box.max.distanceTo(s.box.max)<1e-4,m.name);}b.kit.dispose(merged);}
});
