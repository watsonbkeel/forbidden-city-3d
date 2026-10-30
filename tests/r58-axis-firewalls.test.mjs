import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {CollisionManager} from '../src/utils/Collision.js';
import {axisFirewallBaseline} from './r58-axis-firewalls/baseline.mjs';
import {walkStraight} from './lib/world.mjs';
import {hash} from './lib/inner-palace-fixture.mjs';
const profiles=await import('../src/scene/palace/special/AxisFirewallProfiles.js').catch(()=>({}));
const builders=await import('../src/scene/palace/special/AxisFirewalls.js').catch(()=>({}));
function fixture(){
 assert.equal(typeof profiles.createTaiheEastFirewallProfile,'function','source-bound Taihe east firewall profile is missing');
 assert.equal(typeof builders.buildTaiheEastFirewall,'function','source-bound Taihe east firewall builder is missing');
 const W=axisFirewallBaseline(),hall=W.builderData.halls.find(h=>h.name==='太和殿');
 const profile=profiles.createTaiheEastFirewallProfile({hall,rect:W.builderData.rects[0],...W.builderData.options,linkWall:W.axis.items[13]});
 const prior={colliders:W.builder.colliders.map(b=>({min:b.min.toArray(),max:b.max.toArray()})),walkables:W.builder.walkables.map(w=>w.type==='box'?{type:'box',min:w.box.min.toArray(),max:w.box.max.toArray()}:w),children:[...W.scene.children[0].children]};
 const group=builders.buildTaiheEastFirewall(W.builder,W.scene.children[0],profile);
 const cm=new CollisionManager();cm.addColliders([...W.builder.colliders,...W.kit.colliders]);cm.addWalkables([...W.builder.walkables,...W.kit.walkables]);
 W.scene.updateMatrixWorld(true);return{...W,profile,group,cm,THREE,prior};
}
test('Taihe binds only the source-visible east wall and derives all levels from retained terrace controls',()=>{
 const W=fixture(),p=W.profile;
 assert.equal(p.objectId,'FC-1ABC6622CB');assert.equal(p.side,'east');assert.equal(p.status,'VERIFY_PENDING');assert.equal(p.dimensionStatus,'PHOTO_FIT_WITH_INHERITED_CONTROLS');
 assert.equal(p.z,-12.2);assert.equal(p.terminalJoin.x,-65.5);assert.equal(p.spans.length,4);assert.equal(p.terraceTiers.length,3);
 assert.deepEqual(p.terraceTiers.map(s=>s.topY),[7,7+8/3,7+16/3]);assert.equal(p.passage.floorY,8);
 assert.ok(p.passage.centerX< -40&&p.passage.centerX> -46);assert.equal(p.passage.clearWidth,2.8);assert.equal(p.passage.clearHeight,3);
 assert.ok(p.remaining.includes('west-side-unreviewed'));assert.ok(p.remaining.includes('exact-metric-survey-unknown'));
 assert.throws(()=>profiles.createTaiheEastFirewallProfile({...W.builderData.options,hall:W.builderData.halls[0],rect:W.builderData.rects[0],linkWall:W.axis.items[15]}),/east/);
});
test('Taihe upper-wall door is a real gap in rendered masonry, with solid sides and no threshold obstruction',()=>{
 const W=fixture(),p=W.profile,ray=(x,y)=>new THREE.Raycaster(new THREE.Vector3(x,y,p.z-3),new THREE.Vector3(0,0,1),0,6).intersectObject(W.group,true);
 assert.equal(ray(p.passage.centerX,p.passage.floorY+1).length,0);
 assert.ok(ray(p.passage.centerX-p.passage.clearWidth/2-.7,p.passage.floorY+1).length>0);
 assert.ok(ray(p.passage.centerX,p.passage.floorY+p.passage.clearHeight+.3).length>0);
 assert.equal(W.group.children.filter(m=>m.material?.name==='lattice_doors').length,0,'masonry is not a timber gallery');
 for(const m of W.group.children.filter(m=>['wood_column','caihua_beam'].includes(m.material?.name)))assert.match(m.userData.firewallPart,/^taihe-(door|south)/,'only the independently sourced door receives timber');
});
test('actual CollisionManager crosses the wall door both ways but rejects adjacent solid masonry',()=>{
 const W=fixture(),p=W.profile;
 for(const direction of [-1,1]){
 const r=walkStraight(W,[p.passage.centerX,p.z+direction*4],[p.passage.centerX,p.z-direction*4],{feet0:8});assert.equal(r.reached,r.total,JSON.stringify(r));assert.equal(r.feet,8);
 const solid=walkStraight(W,[p.passage.centerX-3,p.z+direction*4],[p.passage.centerX-3,p.z-direction*4],{feet0:8});assert.ok(solid.reached<solid.total,JSON.stringify(solid));
 }
});
test('all retained platform, step, rail, collider and walkable records survive exactly without added west walls',()=>{
 const W=fixture(),before=W.prior;
 assert.deepEqual(W.builder.colliders.slice(0,before.colliders.length).map(b=>({min:b.min.toArray(),max:b.max.toArray()})),before.colliders);
 assert.deepEqual(W.builder.walkables.map(w=>w.type==='box'?{type:'box',min:w.box.min.toArray(),max:w.box.max.toArray()}:w),before.walkables);
 assert.deepEqual(W.scene.children[0].children.filter(c=>c!==W.group),before.children);
 const bbox=new THREE.Box3().setFromObject(W.group);assert.ok(bbox.max.x< -30);assert.ok(bbox.min.z>-14&&bbox.max.z< -10);
 assert.equal(W.builder.terraceProfiles[0].centerZ,58);assert.equal(W.builder.terraceProfiles[0].flights.length,6);
});
test('body geometry is finite, nondegenerate and closed; repeated installation is rejected before mutation',()=>{
 const W=fixture();W.group.traverse(m=>{if(!m.isMesh)return;for(const a of Object.values(m.geometry.attributes))assert.ok([...a.array].every(Number.isFinite));
 if(m.userData.firewallPart!=='masonry')return;
 const a=m.geometry.attributes.position,idx=m.geometry.index,edges=new Map();let volume=0;
 for(let i=0;i<(idx?.count??a.count);i+=3){const v=[0,1,2].map(j=>new THREE.Vector3().fromBufferAttribute(a,idx?idx.getX(i+j):i+j));assert.ok(new THREE.Vector3().subVectors(v[1],v[0]).cross(new THREE.Vector3().subVectors(v[2],v[0])).length()>1e-8);volume+=v[0].dot(new THREE.Vector3().crossVectors(v[1],v[2]))/6;for(let j=0;j<3;j++){const key=[v[j],v[(j+1)%3]].map(v=>v.toArray().map(n=>n.toFixed(6)).join(',')).sort().join('|');edges.set(key,(edges.get(key)??0)+1);}}
 assert.ok(volume>0);assert.ok([...edges.values()].every(n=>n===2));});
 const before=hash({n:W.builder.colliders.length,m:W.group.children.length});assert.throws(()=>builders.buildTaiheEastFirewall(W.builder,W.scene.children[0],W.profile),/already/);assert.equal(hash({n:W.builder.colliders.length,m:W.group.children.length}),before);
});

const qa=await import('./lib/r58-axis-firewall-qa.mjs').catch(()=>({}));
test('pure supplied-world QA tests rendered doorway, collider body and real 中左门 route without constructing another world',()=>{
 assert.equal(typeof qa.evaluateTaiheEastFirewall,'function','pure integration QA is missing');const W=fixture();const result=qa.evaluateTaiheEastFirewall(W,{profile:W.profile});
 assert.equal(result.pass,true,JSON.stringify(result));assert.equal(result.door.length,2);assert.ok(result.door.every(d=>d.visibleBody.pass&&d.walk.reached===d.walk.total));assert.equal(result.retainedZhongzuo.reached,result.retainedZhongzuo.total);
 const wall=new THREE.Mesh(new THREE.BoxGeometry(.01,2,.01),new THREE.MeshBasicMaterial());wall.position.set(W.profile.passage.centerX,9,W.profile.z);W.scene.add(wall);
 assert.equal(qa.evaluateTaiheEastFirewall(W,{profile:W.profile}).pass,false,'a visible-only obstruction must fail even without a collider');
});

import {FirstPersonControls} from '../src/controls/FirstPerson.js';
for(const fps of [10,60])for(const direction of [-1,1])for(const backward of [false,true])test(`actual FirstPersonControls traverses and returns through the fitted upper door at ${fps}Hz from ${direction}; backward=${backward}`,t=>{
 assert.equal(typeof qa.runTaiheFirewallControllerRoute,'function','real controller route helper is missing');const W=fixture(),oldDoc=globalThis.document,oldWin=globalThis.window,noop=()=>{};
 const doc={...oldDoc,addEventListener:noop,removeEventListener:noop,exitPointerLock:noop};globalThis.document=doc;globalThis.window={addEventListener:noop,removeEventListener:noop};
 let now=0;const clock=t.mock.method(performance,'now',()=>now);
 const camera=new THREE.PerspectiveCamera(),controls=new FirstPersonControls(camera,{ownerDocument:doc,addEventListener:noop,removeEventListener:noop},W.cm);controls.controls.isLocked=true;
 try{const result=qa.runTaiheFirewallControllerRoute({camera,controls,collisionManager:W.cm},W.profile,{fps,direction,sprint:true,backward,tick:ms=>{now+=ms;}});t.diagnostic(JSON.stringify(result));assert.equal(result.arrived,true,JSON.stringify(result));assert.ok(Math.abs(result.startFeet-8)<1e-8);assert.ok(result.minFeet>7.99);assert.ok(result.maxFeet<8.01);}
 finally{controls.dispose();clock.mock.restore();globalThis.document=oldDoc;globalThis.window=oldWin;}
});

test('nonfinite or changed control points fail before a mesh can be generated',()=>{
 const W=fixture(),args={hall:W.builderData.halls[0],rect:W.builderData.rects[0],...W.builderData.options,linkWall:W.axis.items[13]};
 for(const key of ['lh','setback'])for(const n of [NaN,Infinity,-Infinity])assert.throws(()=>profiles.createTaiheEastFirewallProfile({...args,[key]:n}),/Invalid|requires|match/);
 assert.throws(()=>profiles.createTaiheEastFirewallProfile({...args,rect:{...args.rect,hw:34}}),/match|opening/);
});

test('integration actor audit fails closed for missing, empty, duplicate or wrong expected bindings',()=>{
 const W=fixture(),profile=W.profile;
 const entry={actor:{id:'actual-actor'},binding:{status:'ready',position:[-19,0,-80]}};
 assert.equal(qa.evaluateTaiheEastFirewall(W,{profile,expectedActorCount:1}).pass,false);
 assert.equal(qa.evaluateTaiheEastFirewall(W,{profile,resolvedBindings:[]}).pass,false);
 assert.equal(qa.evaluateTaiheEastFirewall(W,{profile,resolvedBindings:[entry,entry],expectedActorCount:2}).pass,false);
 assert.equal(qa.evaluateTaiheEastFirewall(W,{profile,resolvedBindings:[entry],expectedActorIds:['different-actor']}).pass,false);
 assert.equal(qa.evaluateTaiheEastFirewall(W,{profile,resolvedBindings:[entry],expectedActorIds:['actual-actor']}).pass,true);
});

test('builder preflight rejects malformed passage/spans without partial installation or side effects',()=>{
 for(const corrupt of [p=>p.passage.clearWidth=Infinity,p=>p.passage.centerX=0,p=>p.spans[0].floorY=NaN,p=>p.thickness=-1]){
  const W=axisFirewallBaseline(),p=profiles.createTaiheEastFirewallProfile({hall:W.builderData.halls[0],rect:W.builderData.rects[0],...W.builderData.options,linkWall:W.axis.items[13]});corrupt(p);
  const before=[W.builder.colliders.length,W.builder.walkables.length,W.scene.children[0].children.length];assert.throws(()=>builders.buildTaiheEastFirewall(W.builder,W.scene.children[0],p),/Invalid|Malformed|Unsupported/);assert.deepEqual([W.builder.colliders.length,W.builder.walkables.length,W.scene.children[0].children.length],before);
 }
});

test('profile rejects narrow doorway spans, negative hall width, infinite rectangles and incomplete east-wall endpoints',()=>{
 const W=fixture(),args={hall:W.builderData.halls[0],rect:W.builderData.rects[0],...W.builderData.options,linkWall:W.axis.items[13]};
 for(const width of [-1,106.23333333333332])assert.throws(()=>profiles.createTaiheEastFirewallProfile({...args,hall:{...args.hall,dimensions:{...args.hall.dimensions,width}}}),/Invalid|opening/);
 assert.throws(()=>profiles.createTaiheEastFirewallProfile({...args,rect:{...args.rect,z0:-Infinity,z1:Infinity}}),/Invalid/);
 assert.throws(()=>profiles.createTaiheEastFirewallProfile({...args,linkWall:{...args.linkWall,to:[undefined,-12.2]}}),/Invalid/);
});

test('same-world integration QA rejects absent walls, invisible walls and visible-only or collider-only remnants',()=>{
 const absent=axisFirewallBaseline(),profile=profiles.createTaiheEastFirewallProfile({hall:absent.builderData.halls[0],rect:absent.builderData.rects[0],...absent.builderData.options,linkWall:absent.axis.items[13]});
 absent.cm=new CollisionManager();absent.cm.addColliders([...absent.builder.colliders,...absent.kit.colliders]);absent.cm.addWalkables([...absent.builder.walkables,...absent.kit.walkables]);
 assert.equal(qa.evaluateTaiheEastFirewall(absent,{profile}).pass,false,'never-installed baseline must not pass');
 const invisible=fixture();invisible.group.visible=false;assert.equal(qa.evaluateTaiheEastFirewall(invisible,{profile:invisible.profile}).pass,false);
 const colliderOnly=fixture();colliderOnly.group.clear();assert.equal(qa.evaluateTaiheEastFirewall(colliderOnly,{profile:colliderOnly.profile}).pass,false);
 const visibleOnly=fixture();visibleOnly.cm=new CollisionManager();visibleOnly.cm.addColliders([...visibleOnly.builder.colliders.slice(0,visibleOnly.prior.colliders.length),...visibleOnly.kit.colliders]);visibleOnly.cm.addWalkables([...visibleOnly.builder.walkables,...visibleOnly.kit.walkables]);assert.equal(qa.evaluateTaiheEastFirewall(visibleOnly,{profile:visibleOnly.profile}).pass,false);
});

import {mergeByMaterial} from '../src/utils/MergeUtils.js';
test('same-world firewall QA survives the real production material merge and architecture metadata retention',()=>{
 const W=fixture(),original=W.scene.children[0],architecture=[];original.traverse(o=>{if(o.userData.structure?.id)architecture.push(structuredClone(o.userData.structure));});
 const merged=mergeByMaterial(original,{name:original.name,castShadow:true,receiveShadow:true});merged.userData.architecture=architecture;original.removeFromParent();W.scene.add(merged);
 assert.equal(W.scene.getObjectByName(W.profile.id),undefined,'merged production has no dedicated named firewall group');
 const result=qa.evaluateTaiheEastFirewall(W,{profile:W.profile});assert.equal(result.pass,true,JSON.stringify(result));
});

test('installation proof rejects non-rendering materials even when THREE raycast still hits their triangles',()=>{
 const W=fixture();W.group.traverse(m=>{if(m.isMesh){m.material=m.material.clone();m.material.visible=false;}});
 assert.equal(qa.evaluateTaiheEastFirewall(W,{profile:W.profile}).pass,false);
});

import {replayTerrace} from './lib/terrace-walk.mjs';
for(const fps of [10,60])for(const side of [-1,1])test(`same W retains actual waist stair ascent/descent at ${fps}Hz on side ${side}`,t=>{
 const W=fixture(),result=replayTerrace(t,W,[[side*36,58],[side*15.5,58],[side*36,58]],{fps,sprint:true});
 assert.equal(result.arrived,true,JSON.stringify(result));assert.equal(result.startFeet,0);assert.ok(result.maxFeet>=7.99&&result.maxFeet<=8,JSON.stringify(result));assert.ok(Math.abs(result.end[2])<1e-8);
});

test('Baohe candidate 31 retains its 12 actual solid partitions and is not silently converted to a source-unlocated arch',()=>{
 const W=fixture();assert.equal(W.partitions.length,12);assert.ok(W.partitions.every(b=>b.max.y-b.min.y>3));assert.equal(W.scene.getObjectByName('baohe-east-firewall'),undefined);
});
