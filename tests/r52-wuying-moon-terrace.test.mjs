import {registerHooks} from 'node:module';
const hook=registerHooks({load(url,context,next){return next(url,url.endsWith('.json')?{...context,importAttributes:{...context.importAttributes,type:'json'}}:context);}});
const {Teleport}=await import('../src/ui/Teleport.js');hook.deregister();
import {wuyingMoonTerraceAccess} from '../src/scene/palace/special/WuyingMoonTerrace.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {ZoneBase} from '../src/scene/zones/ZoneBase.js';
import {CollisionManager} from '../src/utils/Collision.js';
import {PLAYER} from '../src/config/constants.js';
import {library} from './lib/inner-palace-fixture.mjs';
import {replayTerrace,traceTerraceGround} from './lib/terrace-walk.mjs';
const data=JSON.parse(readFileSync(new URL('../data/zones/outer-west.json',import.meta.url)));
const item=data.items.find(i=>i.southCourtProfile==='wuying-front');
function fixture(){const b=new ZoneBase(library(),data);b.buildGate(data.items.find(i=>i.southGateProfile==='wuying'));const hall=b.buildHall(item);b.kit.root.updateMatrixWorld(true);const cm=new CollisionManager();cm.rivers=[];cm.addColliders(b.kit.colliders);cm.addWalkables(b.kit.walkables);return{b,hall,cm};}
const q=fixture(),terrace=q.hall.g.moonTerrace;
// Optional integration mode reuses this suite against actual full-world obstacles.
if(process.env.R52_WUYING_FULL_WORLD==='1'){const {buildWorld}=await import('./lib/world.mjs');q.cm=(await buildWorld()).cm;console.log('Full-world collision fixture built:',q.cm.colliders.length);}
const world=([x,z])=>[x+item.x,z+item.z];
const nodes=role=>{const out=[];q.b.kit.root.traverse(m=>{if(m.userData.role===role)out.push(m)});return out;};
test('Wuying adds source-bound moon terrace topology with two independent stair openings and no north-end invention',()=>{
 assert.ok(terrace,'the omitted moon terrace needs an actual source-bound builder');
 assert.equal(terrace.dimensionStatus,'REVERSIBLE_MODEL_FIT_NOT_SURVEYED');assert.equal(terrace.photographyDate,null);
 assert.deepEqual(terrace.stairs.map(s=>s.side).sort(),['east','west']);
 for(const s of terrace.stairs)assert.match(s.source,s.side==='east'?/w15.tiles/:/02.tiles/);
 assert.equal(terrace.northEnd,'UNMODELED_RETAINED_WEST_MIDDLE_NOT_CLOSED_RING');
 assert.ok(terrace.railSegments.some(s=>s.id==='west-north-return'));
 assert.ok(terrace.railSegments.some(s=>s.id==='east-south-wing'));
 assert.ok(terrace.railSegments.some(s=>s.id==='west-causeway'));
 assert.equal(nodes('wuying-moon-terrace-surface').length,1);
});
test('new rails contain visible openwork rather than continuous high block panels',()=>{
 assert.ok(nodes('wuying-moon-rail-lower-panel').length>10);
 for(const n of nodes('wuying-moon-rail-lower-panel'))assert.ok(n.geometry.boundingBox?.max.y-n.geometry.boundingBox?.min.y<.45||n.userData.panelHeight<.45);
 assert.ok(nodes('wuying-moon-rail-openwork-baluster').length>10);
});
test('all added stair and terrace walkables correspond to actual opaque surfaces without rescue',()=>{
 assert.ok(terrace);
 for(const s of terrace.surfaceSamples){const p=new THREE.Vector3(s.x+item.x,s.y+.05,s.z+item.z),hit=new THREE.Raycaster(p,new THREE.Vector3(0,-1,0),0,.1).intersectObject(q.b.kit.root,true).find(h=>!h.object.material.transparent);assert.ok(hit,JSON.stringify(s));assert.ok(Math.abs(hit.point.y-s.y)<.02,JSON.stringify({sample:s,hit:hit.point.y}));assert.ok(Math.abs(q.cm.getGroundHeight(p.x,p.z,s.y,PLAYER.STEP_UP)-s.y)<.02);}
 for(const w of q.b.kit.walkables.filter(w=>w.wuyingMoonTerrace))assert.equal(w.rescue,false);
});
for(const side of['west','east'])for(const fps of[10,60])for(const sprint of[false,true])for(const backward of[false,true])test(`real capsule climbs ${side}, reaches the hall door, returns by the opposite stair ${fps}/${sprint}/${backward}`,t=>{
 assert.ok(terrace);const a=terrace.stairs.find(s=>s.side===side),b=terrace.stairs.find(s=>s.side!==side),points=[...a.route,[0,-11.8],[0,-7.0],[0,-11.8],...b.route.slice().reverse()].map(world),trace=traceTerraceGround(q.cm,{flights:[]});let r;
 try{r=replayTerrace(t,{THREE,cm:q.cm},points,{fps,sprint,backward,recordFrames:true});}finally{trace.restore();}
 assert.equal(r.arrived,true,JSON.stringify({side,fps,sprint,backward,end:r.end,stuck:r.stuckAt}));assert.equal(r.startFeet,0);assert.ok(r.maxFeet>1.19);assert.ok(r.end[2]<.03);
 assert.equal(trace.samples.filter(s=>s.source==='rescue'||s.source==='unverified').length,0);
 assert.ok(Math.max(...trace.samples.map(s=>s.height-s.feetIn))<=PLAYER.STEP_UP+1e-6);
 for(const fr of r.frames){assert.equal(q.cm.checkCollision(new THREE.Vector3(fr.x,fr.ground+PLAYER.HEIGHT,fr.z)),false,JSON.stringify(fr));}
});
test('raised central route turns south without a cross rail and joins the existing gate',t=>{
 assert.ok(terrace);const a=terrace.stairs[0],path=[...a.route,[0,-19.5],...terrace.causeway.route].map(world),r=replayTerrace(t,{THREE,cm:q.cm},path,{fps:60,recordFrames:true});assert.equal(r.arrived,true,JSON.stringify(r.end));assert.ok(Math.abs(r.end[2]-.8)<.03);
 for(const fr of r.frames)assert.equal(q.cm.checkCollision(new THREE.Vector3(fr.x,fr.ground+PLAYER.HEIGHT,fr.z)),false);
});
test('old generic map destination safely resolves onto the new actual terrace, not beneath it',()=>{
 const t=Object.create(Teleport.prototype);t.targets=new Map([[item.name,item]]);t.collisionManager=q.cm;t.zoneManager={getMapItems:()=>q.b.kit.mapItems};const g=t.geometryFor(item.name),landing=t.landingFor(item.name);assert.equal(t.isSafe(landing,g),true);assert.equal(landing.y,1.2);assert.equal(q.cm.getGroundHeight(landing.x,landing.z,0,PLAYER.STEP_UP),0,'no below-deck support rescues an invalid low spawn');assert.equal(q.cm.checkCollision(new THREE.Vector3(landing.x,PLAYER.HEIGHT,landing.z)),true,'invalid old ground-height spawn is visibly inside a solid, never accepted as safe');
 const p=new THREE.Vector3(landing.x,landing.y+PLAYER.HEIGHT,landing.z),end=q.cm.getValidPosition(p,new THREE.Vector3(item.x,p.y,item.z-item.d/2+.8),.5,landing.y,PLAYER.STEP_UP);assert.ok(end.z>item.z-item.d/2+.7);
});
test('canonical side access is supported by the actual fitted risers and removes only covered centre ramps',()=>{
 assert.ok(terrace.removedCoveredGateRamp);assert.ok(terrace.removedCoveredHallRamp);assert.equal(q.b.kit.walkables.filter(w=>w.type==='ramp'&&Math.abs(w.a0+240.05)<1e-8).length,2,'uncovered lateral gate north stairs retained');
 for(const side of['west','east'])for(const p of wuyingMoonTerraceAccess(item,side).points)assert.ok(Math.abs(q.cm.getGroundHeight(p.x,p.z,p.y,PLAYER.STEP_UP)-p.y)<1e-7,JSON.stringify(p));
});
test('new railing holes are genuine, and all solid new components have local collision coverage',()=>{
 const meshes=[];q.b.kit.root.traverse(m=>{if(m.isMesh&&m.userData.wuyingMoonTerrace)meshes.push(m)});
 for(const m of meshes.filter(m=>!m.userData.role.includes('causeway-surface'))){const bb=new THREE.Box3().setFromObject(m);assert.ok(q.b.kit.colliders.some(c=>c.clone().expandByScalar(1e-6).containsBox(bb)),m.userData.role);}
 const segment=terrace.railSegments.find(s=>s.id==='west-north-return'),n=Math.ceil(Math.hypot(segment.b.x-segment.a.x,segment.b.z-segment.a.z)/1.55),x=segment.a.x+(segment.b.x-segment.a.x)*.25/n,z=segment.a.z;
 const railMeshes=meshes.filter(m=>m.userData.segment===segment.id),ray=yy=>new THREE.Raycaster(new THREE.Vector3(item.x+x,yy,item.z+z-.5),new THREE.Vector3(0,0,1),0,1).intersectObjects(railMeshes,false);
 assert.ok(ray(1.2+.28).length,'lower panel is solid');assert.equal(ray(1.2+.57).length,0,'upper field is a real hole, not a dark painted rectangle');
});
test('near-edge stair routes keep the actual rendered new solids out of the accepted player body',t=>{
 const meshes=[];q.b.kit.root.traverse(m=>{if(!m.isMesh||!m.userData.wuyingMoonTerrace)return;const a=m.geometry.attributes.position,ix=m.geometry.index,tri=[];for(let k=0;k<(ix?.count??a.count);k+=3)tri.push(new THREE.Triangle(...[0,1,2].map(j=>new THREE.Vector3().fromBufferAttribute(a,ix?ix.getX(k+j):k+j).applyMatrix4(m.matrixWorld))));meshes.push({m,bb:new THREE.Box3().setFromObject(m),tri});});
 for(const offset of[-1.25,1.25]){const a=terrace.stairs[0],b=terrace.stairs[1],points=[...a.route.map(([x,z])=>[x,z+offset]),[0,-11.8],...b.route.slice().reverse().map(([x,z])=>[x,z+offset])].map(world),r=replayTerrace(t,{THREE,cm:q.cm},points,{fps:10,sprint:true,recordFrames:true});assert.equal(r.arrived,true,JSON.stringify({offset,end:r.end}));
 for(const fr of r.frames){const body=new THREE.Box3(new THREE.Vector3(fr.x-.499,fr.feet+.351,fr.z-.499),new THREE.Vector3(fr.x+.499,fr.feet+PLAYER.HEIGHT-.051,fr.z+.499));for(const m of meshes)if(body.intersectsBox(m.bb))assert.ok(!m.tri.some(tr=>body.intersectsTriangle(tr)),JSON.stringify({offset,frame:fr,role:m.m.userData.role}));}}
});
test('finial pole has no zero-area faces while its cap, vertex attributes, bounds and physical supports stay unchanged',()=>{
 const reference=new THREE.LatheGeometry([[.07,0],[.12,.04],[.14,.13],[.10,.22],[0,.30]].map(v=>new THREE.Vector2(...v)),10);reference.computeBoundingBox();
 const a=reference.attributes.position,ix=reference.index,expected=[];
 for(let k=0;k<ix.count;k+=3){const ids=[0,1,2].map(j=>ix.getX(k+j)),t=new THREE.Triangle(...ids.map(j=>new THREE.Vector3().fromBufferAttribute(a,j)));if(t.getArea()>0)expected.push(...ids);}
 assert.equal(ix.count-expected.length,30,'ten redundant pole faces only');
 const finials=nodes('wuying-moon-rail-post-finial');assert.ok(finials.length>0);
 for(const m of finials){const g=m.geometry;assert.deepEqual([...g.index.array],expected,'keep every positive-area triangle in original order');for(const key of['position','normal','uv'])assert.deepEqual([...g.attributes[key].array],[...reference.attributes[key].array]);g.computeBoundingBox();assert.deepEqual(g.boundingBox,reference.boundingBox);for(let k=0;k<g.index.count;k+=3){const tr=new THREE.Triangle(...[0,1,2].map(j=>new THREE.Vector3().fromBufferAttribute(g.attributes.position,g.index.getX(k+j))));assert.ok(tr.getArea()>1e-10,'original R48 nondegenerate threshold');}
  const p=m.getWorldPosition(new THREE.Vector3());for(const dx of[-.012,0,.012])assert.ok(new THREE.Raycaster(p.clone().add(new THREE.Vector3(dx,.4,0)),new THREE.Vector3(0,-1,0),0,.25).intersectObject(m,false).length,'pole retains visible closed top');
 }
 const old=JSON.parse(readFileSync(new URL('../docs/current-state/r52-wuying-moon-terrace/surface-collision-delta.json',import.meta.url)));for(const key of['addedColliders','addedWalkables','removedCoveredHallRamp','removedCoveredGateRamp'])assert.deepEqual(terrace[key],old[key],key+' remains exact');
 reference.dispose();
});
test.after(()=>q.b.kit.dispose(q.b.kit.root));
