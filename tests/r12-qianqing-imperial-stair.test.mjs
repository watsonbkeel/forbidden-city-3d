// R49 nameboard textures use the same canvas boundary as other palace fixtures.
import './lib/inner-palace-fixture.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import * as T from 'three';
import {PalaceBuilder} from '../src/scene/PalaceBuilder.js';
import {PALACE_LAYOUT} from '../src/scene/Layout.js';
import {CollisionManager} from '../src/utils/Collision.js';
import {buildQianqingGate} from '../src/scene/palace/special/QianqingGate.js';
import {buildQianqingImperialStair,QIANQING_IMPERIAL_STAIR as P} from '../src/scene/palace/special/QianqingImperialStair.js';
import baseline from './fixtures/r12-qianqing-baseline.json' with {type:'json'};
const mats=new Map(),lib={material:n=>mats.get(n)??(mats.set(n,new T.MeshStandardMaterial({name:n})),mats.get(n)),tileSize:()=>1,aspect:()=>1};
const gate=PALACE_LAYOUT.find(r=>r.name==='乾清门'),b=new PalaceBuilder(new T.Scene(),lib),g=buildQianqingGate(b,gate);g.updateMatrixWorld(true);
const cm=new CollisionManager();cm.addColliders(b.colliders);cm.addWalkables(b.walkables.map(w=>w.type==='box'?{...w,rescue:false}:w));
const bay=gate.dimensions.width/5,width=bay*.76,stone=width*.32,edge=gate.position.z-gate.dimensions.depth/2-1,run=2.4,y=1.5,half=stone/2;
const sha=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const serial=c=>({min:c.min.toArray(),max:c.max.toArray()});
function travel(points,fps,speed,feet=0){let p=new T.Vector3(points[0][0],feet+1.7,points[0][1]);
 for(const [x,z]of points.slice(1)){let n=0;const max=Math.ceil(Math.hypot(x-p.x,z-p.z)/(speed/fps))+10;
  while(Math.hypot(x-p.x,z-p.z)>1e-6&&n++<max){const d=Math.hypot(x-p.x,z-p.z),step=Math.min(speed/fps,d),q=cm.getValidPosition(p,new T.Vector3(p.x+(x-p.x)*step/d,p.y,p.z+(z-p.z)*step/d),.5,p.y-1.7);assert.ok(Math.abs(q.y-p.y)<=step*y/run+1e-6,'height follows physical ramp slope at requested frame stride');assert.ok(Math.abs(q.y-1.7-cm.getGroundHeight(q.x,q.z,q.y-1.7))<1e-6);p=q;}
  assert.ok(Math.hypot(x-p.x,z-p.z)<1e-5,JSON.stringify({goal:[x,z],at:p.toArray()}));
 }return p;}

test('actual gate has four stair ramps; no ramp crosses the central carving',()=>{
 const ramps=b.walkables.filter(w=>w.type==='ramp'&&Math.abs(w.minZ-(edge-run))<1e-6);
 assert.equal(ramps.length,4);assert.equal(ramps.filter(w=>w.minX<0&&w.maxX>0).length,0);
 assert.equal(g.userData.qianqingGate.imperialApproach.currentVisitorAccess,'UNKNOWN');
 assert.equal(g.userData.qianqingGate.imperialApproach.stoneWidth,stone);
 assert.ok(g.userData.qianqingGate.imperialApproach.flankClearWidth>1.45);
});
for(const x of [-bay,-(half+(width/2-.45))/2,(half+(width/2-.45))/2,bay])for(const fps of [60,10])for(const speed of [5,12])
 test(`real stair strip roundtrip with box rescue disabled x${x}/${fps}/${speed}`,()=>{
 const pts=[[x,edge-run-1],[x,edge+.4],[x,edge-run-1]];const p=travel(pts,fps,speed);assert.ok(Math.abs(p.y-1.7)<1e-8);
 });
for(const rescue of [false,true])test(`central straight crossing is blocked without an artificial tall fence rescue${rescue}`,()=>{
 const c=new CollisionManager();c.addColliders(b.colliders);c.addWalkables(b.walkables.map(w=>w.type==='box'?{...w,rescue}:w));let p=new T.Vector3(0,1.7,edge-run-1);
 for(let i=0;i<100;i++)p=c.getValidPosition(p,new T.Vector3(0,p.y,p.z+.08),.5,p.y-1.7);
 assert.ok(p.z<edge-1,JSON.stringify(p));assert.equal(p.y,1.7);assert.equal(c.getGroundHeight(0,edge-run/2,0,999),0);
});
test('gate front collision is retained; sixteen stone boxes plus eight registered rear connector bounds change',()=>{
 const now=b.colliders.map(serial),added=now.filter(c=>Math.abs(c.min[0]+half)<1e-9&&Math.abs(c.max[0]-half)<1e-9&&c.min[1]===0&&c.max[1]<=1.65+1e-8);
 assert.equal(added.length,16);const retained=now.filter(c=>!added.includes(c));
 assert.equal(retained.length,baseline.colliders.length);
 for(let i=0;i<retained.length;i++)if(i<104||i>111)assert.deepEqual(retained[i],baseline.colliders[i]);
 // Eight rear deck/rail boxes are independently checked by the level/interface regression.
 for(const c of added){assert.ok(c.max[2]-c.min[2]<.151);assert.ok(c.max[1]<=y+.15+1e-9);}
});
test('central ramp splits; one rear causeway widens and extends, all other walkables exact',()=>{
 const serialW=w=>w.type==='box'?{...w,box:{min:w.box.min.toArray(),max:w.box.max.toArray()}}:w;
 const now=b.walkables.map(serialW),isMiddle=w=>w.type==='ramp'&&Math.abs(w.minZ-(edge-run))<1e-6&&w.minX>-bay/2&&w.maxX<bay/2;
 assert.equal(now.filter(isMiddle).length,2);assert.equal(baseline.walkables.filter(isMiddle).length,1);
 const expected=structuredClone(baseline.walkables.filter(w=>!isMiddle(w)));
 const connector=expected.find(w=>w.type==='box'&&w.box.min[0]===-4&&w.box.max[0]===4);assert.ok(connector);
 assert.ok(Math.abs(connector.box.max[2]-292.7)<1e-8);connector.box.min[0]=-5;connector.box.max[0]=5;connector.box.max[2]=297.5;
 assert.deepEqual(now.filter(w=>!isMiddle(w)),expected);
});
test('marble gains116 triangles; only three rear-connector material groups additionally change position',()=>{
 const rows=g.children.filter(m=>m.isMesh).map(m=>({name:m.name,material:m.material.name,matrix:m.matrix.elements,geometry:sha({a:Object.fromEntries(Object.entries(m.geometry.attributes).map(([k,v])=>[k,[v.itemSize,...v.array]])),index:m.geometry.index?[...m.geometry.index.array]:null}),triangles:(m.geometry.index?.count??m.geometry.attributes.position.count)/3}));
 assert.equal(rows.length,baseline.rows.length);
 for(let i=0;i<rows.length;i++)if(rows[i].material==='marble')assert.equal(rows[i].triangles-baseline.rows[i].triangles,116);else if(['sumeru_band','stone_slab','balustrade'].includes(rows[i].material)){assert.equal(rows[i].triangles,baseline.rows[i].triangles);assert.equal(rows[i].material,baseline.rows[i].material);}
 else assert.deepEqual(rows[i],baseline.rows[i]);
});
test('solid stone is closed and nondegenerate; no new material or texture introduced',()=>{
 const b2=new PalaceBuilder(new T.Scene(),lib),g2=new T.Group();buildQianqingImperialStair(b2,g2,{zEdge:0,y1:1.5,run:2.4,width});
 const m=g2.children.find(m=>m.name==='qianqing-central-stone-body'),geo=m.geometry,p=geo.attributes.position,idx=geo.index,edges=new Map();let volume=0;
 for(let i=0;i<(idx?.count??p.count);i+=3){const v=[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(p,idx?idx.getX(i+j):i+j));assert.ok(v[1].clone().sub(v[0]).cross(v[2].clone().sub(v[0])).length()>1e-7);volume+=v[0].dot(v[1].clone().cross(v[2]))/6;for(let j=0;j<3;j++){const k=[v[j],v[(j+1)%3]].map(v=>v.toArray().map(n=>Math.round(n*1e5)).join(',')).sort().join('|');edges.set(k,(edges.get(k)??0)+1);}}
 assert.ok(volume>0);assert.ok([...edges.values()].every(n=>n===2));assert.deepEqual([...new Set(g2.children.map(m=>m.material.name))].sort(),['marble','yulu']);assert.equal(P.stoneFraction,.32);
});
