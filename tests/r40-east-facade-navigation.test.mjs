import test from 'node:test';
import assert from 'node:assert/strict';
import{readFileSync}from'node:fs';
import * as THREE from 'three';
import{ZoneBase}from'../src/scene/zones/ZoneBase.js';
import{library}from'./lib/inner-palace-fixture.mjs';
import{CollisionManager}from'../src/utils/Collision.js';
import{replayTerrace,traceTerraceGround}from'./lib/terrace-walk.mjs';
const config=JSON.parse(readFileSync(new URL('../data/zones/east-six.json',import.meta.url)));
function fixture(name,whole=false){const item=config.items.find(i=>i.kind==='hall'&&i.name===name),b=new ZoneBase(library(),config);if(whole)b.build();else b.buildHall(item);b.kit.root.updateMatrixWorld(true);const cm=new CollisionManager();cm.rivers=[];cm.addColliders(b.kit.colliders);cm.addWalkables(b.kit.walkables);return{b,item,cm};}
const routes={
 '永和宫':[[0,-11.3],[0,-7.3],[-7,-7.3],[7,-7.3],[0,-7.3],[0,-2],[0,-11.3],[0,-2],[0,-7.3],[-7,-7.3],[0,-7.3],[0,-11.3]],
 '钟粹宫':[[0,-10.4],[0,-6.6],[-11,-6.6],[11,-6.6],[0,-6.6],[0,-2],[0,-10.4],[0,-2],[0,-6.6],[11,-6.6],[0,-6.6],[0,-10.4]],
 '景仁宫':[[0,-9.8],[0,-2],[4,-2],[4,5.6],[0,5.6],[0,9.3],[0,5.6],[4,5.6],[4,-2],[0,-2],[0,-9.8]],
};
for(const name of Object.keys(routes))for(const fps of[10,60])test(`R40 ${name} actual full-zone controller traverses distinct facade and repeats access at${fps}Hz`,t=>{
 const{b,item,cm}=fixture(name,true),points=routes[name].map(([x,z])=>[item.x+x,item.z+z]),trace=traceTerraceGround(cm,{flights:[]});
 try{const result=replayTerrace(t,{cm,THREE},points,{fps,sprint:false,recordFrames:true});assert.equal(result.arrived,true,JSON.stringify(result));assert.equal(result.startFeet,0);assert.ok(result.maxFeet>=item.ph-.01);assert.equal(trace.samples.some(s=>s.source==='rescue'),false,'no rescue instead of proper fitted stairs');}finally{trace.restore();b.dispose();}
});
for(const name of Object.keys(routes))test(`R40 ${name} owns finite geometry once and retains one source record after merge`,()=>{
 const{b,item,cm}=fixture(name),counts=[];for(const material of b.kit.owned){const c={n:0};material.addEventListener('dispose',()=>c.n++);counts.push(c);}
 for(const r of b.kit.rooms)for(const d of[...r.doors,...r.spawns])assert.equal(cm.checkCollision(new THREE.Vector3(d.x,item.ph+1.7,d.z),.45),false,'actual registered door/spawn must be clear');
 const merged=b.kit.finish(),record=merged.userData.architecture.find(r=>r.profile===item.facadeProfile);assert.ok(record);assert.equal(record.photographyDate,null);assert.match(record.accessStatus,/NOT_HISTORICAL/);
 let tris=0;merged.traverse(o=>{if(!o.isMesh)return;tris+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;for(const a of Object.values(o.geometry.attributes))assert.ok([...a.array].every(Number.isFinite));});assert.ok(tris<100000);
 b.kit.dispose(merged);for(const c of counts)assert.equal(c.n,1);
});
