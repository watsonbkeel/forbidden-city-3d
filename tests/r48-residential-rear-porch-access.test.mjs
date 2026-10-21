import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {CourtKit} from '../src/scene/palace/kit.js';
import {library} from './lib/inner-palace-fixture.mjs';
import {CollisionManager} from '../src/utils/Collision.js';
import {replayTerrace,traceTerraceGround} from './lib/terrace-walk.mjs';
import {resolveRemainingProfile,buildRemainingHall} from '../src/scene/palace/special/RemainingResidentialHalls.js';
const rows=JSON.parse(readFileSync(new URL('../docs/current-state/r48-remaining/residential-scope.json',import.meta.url)));
function fixture(name){const row=rows.find(r=>r.name===name),item=row.baselineItem,p=resolveRemainingProfile(row.zone,item),kit=new CourtKit(library(),row.zone),built=buildRemainingHall(kit,item,p);kit.root.updateMatrixWorld(true);const cm=new CollisionManager();cm.rivers=[];cm.addColliders(kit.colliders);cm.addWalkables(kit.walkables);return{item,p,kit,cm,...built};}
for(const name of ['太极殿','翊坤宫后殿']){
 test(`R48 ${name} both real-radius rear-porch exits retain at least 0.40m centerline tolerance`,()=>{const{item,p,cm}=fixture(name);for(const s of[-1,1]){const clear=[];for(let z=item.z+item.d/2-p.rearInset;z<item.z+item.d/2;z+=.005)if(!cm.checkCollision(new THREE.Vector3(item.x+s*item.w/2,item.ph+1.7,z)))clear.push(z);assert.ok(clear.length>80,`${clear.length} clear samples at default player radius`);assert.ok(clear.at(-1)-clear[0]>.40);}});
 for(const fps of[10,60])for(const sprint of[false,true])for(const backward of[false,true])test(`R48 ${name} four lateral exit directions at ${fps} Hz sprint=${sprint} backward=${backward}`,t=>{const{item,p,cm}=fixture(name),z=item.z+item.d/2-p.rearInset/2,a=[item.x-item.w/2-2,z],b=[item.x+item.w/2+2,z],trace=traceTerraceGround(cm,{flights:[]});try{const r=replayTerrace(t,{cm,THREE},[a,b,a,b,a],{fps,sprint,backward});assert.equal(r.arrived,true,JSON.stringify(r));assert.equal(trace.samples.some(s=>s.source==='rescue'),false);}finally{trace.restore();}});
}
test('R48 Taiji two explicit visitor-access stairs provide visible treads beneath their real ramps',()=>{const{item,p,f,kit}=fixture('太极殿'),groups=f.children.filter(o=>o.userData.role==='r48-residential-rear-porch-access-step'),ray=new THREE.Raycaster();assert.equal(groups.length,2);for(const g of groups){assert.match(g.userData.purpose,/NOT_ATTESTED_HISTORIC_STAIR/);const side=g.userData.side,edge=item.x+side*(item.w+2*item.pad)/2,z=item.z+item.d/2-p.rearInset/2;for(let k=0;k<4;k++){const x=edge+side*(k+.5)*.24;ray.set(new THREE.Vector3(x,3,z),new THREE.Vector3(0,-1,0));const hit=ray.intersectObject(g,true)[0];assert.ok(hit);assert.ok(Math.abs(hit.point.y-(.6-(k+1)*.12))<1e-5);const ramp=kit.walkables.find(w=>w.type==='ramp'&&w.axis==='x'&&x>=w.minX&&x<=w.maxX&&z>=w.minZ&&z<=w.maxZ);assert.ok(ramp);const y=ramp.y0+(ramp.y1-ramp.y0)*(x-ramp.a0)/(ramp.a1-ramp.a0);assert.ok(Math.abs(y-hit.point.y)<.05);}}});

import {ZoneBase} from '../src/scene/zones/ZoneBase.js';
import {augmentRemainingHall} from '../src/scene/palace/special/RemainingResidentialHalls.js';
const west=JSON.parse(readFileSync(new URL('../data/zones/west-six.json',import.meta.url)));
class TestZone extends ZoneBase{buildHall(item){const p=resolveRemainingProfile('west-six',item);if(p?.mode==='replace')return buildRemainingHall(this.kit,item,p);const built=super.buildHall(item);if(p?.mode==='augment'&&!built.f.userData.r48ResidentialAugmented)return augmentRemainingHall(this.kit,item,built,p);return built;}}
for(const name of['太极殿','翊坤宫后殿'])for(const fps of[10,60])for(const sprint of[false,true])for(const backward of[false,true])test(`R48 whole WestSix ${name} rear-porch access ${fps} Hz sprint=${sprint} backward=${backward}`,t=>{const zone=new TestZone(library(),west),built=zone.build(),item=west.items.find(i=>i.name===name),p=resolveRemainingProfile('west-six',item),cm=new CollisionManager();cm.rivers=[];cm.addColliders(built.colliders);cm.addWalkables(built.walkables);const z=item.z+item.d/2-p.rearInset/2,a=[item.x-item.w/2-2,z],b=[item.x+item.w/2+2,z],trace=traceTerraceGround(cm,{flights:[]});try{const r=replayTerrace(t,{cm,THREE},[a,b,a],{fps,sprint,backward});assert.equal(r.arrived,true,JSON.stringify(r));assert.equal(trace.samples.some(s=>s.source==='rescue'),false);}finally{trace.restore();zone.dispose();}});
