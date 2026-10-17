import test from 'node:test';import assert from 'node:assert/strict';
import {wumenTowerGeometry,shenwuTowerGeometry} from '../../src/scene/palace/special/GateTowerProfiles.js';
import {GATE_TOWER_MEASUREMENTS as M} from '../../src/scene/palace/special/GateTowerMeasurements.js';
import {buildGateTowerShell} from '../../src/scene/palace/special/GateTowerShell.js';
import {captureGate} from '../lib/gate-tower-fixture.mjs';import {CollisionManager} from '../../src/utils/Collision.js';import {walkStraight} from '../lib/world.mjs';
const {THREE,lib}=captureGate();
test('Shenwu preserves the independent raw chains, pooled assembly and drawn outline reference endpoints',()=>{
 assert.deepEqual(M.shenwu.rawColumnFootMm,{frontWtoE:[2850,6500,6650,9740,6630,6490,2880],rearWtoE:[2840,6495,6650,9770,6620,6505,2830],westDepth:[2820,12250,2890],eastDepth:[2840,12285,2840]});
 const p=shenwuTowerGeometry();assert.deepEqual(p.intervals,[2.8488,6.4975,6.6375,9.755,6.6375,6.4975,2.8488]);assert.ok(Math.abs(p.intervals.reduce((a,b)=>a+b,0)-p.width)<1e-9);
 assert.deepEqual(p.xAxes,[-20.8613,-18.0125,-11.515,-4.8775,4.8775,11.515,18.0125,20.8613]);
 assert.deepEqual(M.shenwu.localOutlineMm.widthOffsets,[970,970]);assert.deepEqual(M.shenwu.localOutlineMm.depthOffsets,[1055,1055]);
 assert.ok(Math.abs(p.width+2*p.localOutline.modelOffsets.x-p.localOutline.width)<1e-9);assert.ok(Math.abs(p.depth+2*p.localOutline.modelOffsets.z-p.localOutline.depth)<1e-9);
 assert.equal(M.shenwu.nominalCityPlatformM.status,'PROVISIONAL_TOP_BOUNDARY_INTERPRETATION');assert.equal(p.metadata.publicAccess.status,'NOT_VERIFIED');
 assert.ok(p.metadata.verticalGeometry.status.includes('DEFERRED'));
});
test('Wumen provisional registration is explicit and bounded, with no invented extra door bays',()=>{
 const p=wumenTowerGeometry();assert.equal(p.enclosure.wallAxisZ,9.6);assert.ok(Math.abs(p.enclosure.outerZ-10.05)<1e-9);assert.equal(p.openings.length,2);assert.equal(p.metadata.gallerySource.modelUncertainty,.3);assert.equal(p.metadata.otherBayOperation,'CLOSED_UNVERIFIED');
 for(const value of [NaN,Infinity,-2,2.599,3.201,'2.9',null])assert.throws(()=>wumenTowerGeometry({gallerySetback:value}));
 assert.throws(()=>buildGateTowerShell(lib,{id:'axis/unknown'}),/Unsupported/);
});
for(const setback of [2.6,2.9,3.2])test(`Wumen fixed body retains a connected inner veranda at setback ${setback}m`,()=>{
 const p=wumenTowerGeometry({gallerySetback:setback}),body=buildGateTowerShell(lib,p),cm=new CollisionManager();cm.addColliders(body.userData.colliders,'tower');
 cm.addWalkable({type:'box',rescue:false,box:new THREE.Box3(new THREE.Vector3(-60,0,-13.3),new THREE.Vector3(60,0,18.6))});
 const z=(p.enclosure.outerZ+p.veneer.thickness+12.5-p.columns.at(-1).bottomRadius)/2;
 const pts=[[35,z],[35,-z],[-35,-z],[-35,z],[35,z]];
 for(let i=1;i<pts.length;i++){const r=walkStraight({cm,THREE},pts[i-1],pts[i],{feet0:0,step:.05});assert.ok(Math.hypot(r.end[0]-pts[i][0],r.end[1]-pts[i][1])<.08,JSON.stringify(r));}
});
for(const [name,profile] of [['Wumen',wumenTowerGeometry()],['Shenwu',shenwuTowerGeometry()]])test(`${name} every body-height obstacle collider equals its visible mesh bounds`,()=>{
 const body=buildGateTowerShell(lib,profile);body.updateMatrixWorld(true);
 const parts=new Set(['gable-wall','facade-wall','closed-lattice-panel','open-lattice-leaf','open-board-leaf','outer-column','interior-column','local-hall-balustrade']);
 const obstacles=body.children.filter(m=>parts.has(m.userData.gatePart));assert.equal(obstacles.length,body.userData.colliders.length);
 for(const m of obstacles){const b=new THREE.Box3().setFromObject(m);b.min.y=Math.max(0,b.min.y);b.max.y=Math.min(3,b.max.y);assert.ok(body.userData.colliders.some(c=>c.equals(b)),`${m.userData.gatePart} missing actual bounds`);}
 for(const m of body.children.filter(m=>m.isMesh)){assert.ok([...m.geometry.attributes.position.array].every(Number.isFinite));assert.ok([...m.geometry.attributes.uv.array].every(Number.isFinite));if(['closed-lattice-panel','interior-floor','threshold'].includes(m.userData.gatePart))assert.equal(m.castShadow,false);}
});
