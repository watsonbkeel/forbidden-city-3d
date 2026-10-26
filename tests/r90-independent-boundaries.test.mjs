import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {pathToFileURL} from 'node:url';
const R=new URL('../',import.meta.url);const mod=p=>import(new URL(p,R));
const {buildR52World}=await mod('tests/lib/r52-world.mjs');const{replayTerrace}=await mod('tests/lib/terrace-walk.mjs');
test('independent R90 near-jamb backward/sprint paths, map landing and repeated garden lifecycle',async t=>{
 const W=await buildR52World({loadAll:true}),rows=[];let teleport;
 try{
  const{Teleport}=await mod('src/ui/Teleport.js');const{Minimap}=await mod('src/ui/Minimap.js');teleport=new Teleport({},W.zoneManager,W.cm);
  for(let cycle=0;cycle<3;cycle++){
   if(cycle){W.zoneManager.unloadZone('garden');W.zoneManager.loadZone('garden');}
   const items=W.zoneManager.getMapItems(),g=items.filter(x=>x.name==='顺贞门');assert.equal(g.length,1);assert.equal(g[0].w,20.6);assert.equal(g[0].d,3.5);
   assert.equal(Minimap.prototype.canTravelToPlace.call({items,labels:[{name:'顺贞门'}],hasTeleportTarget:n=>teleport.targets.has(n)},'顺贞门'),true);
   for(const name of['顺贞门','神武门']){const p=teleport.resolveLanding(name);assert.ok(p,`${name} landing cycle${cycle}`);assert.equal(W.cm.checkCollision(new W.THREE.Vector3(p.x,1.7,p.z),.5),false);rows.push({cycle,name,landing:p});}
   const coll=W.cm.colliders.filter(c=>c.tag==='garden');const count=coll.length;rows.push({cycle,colliderCount:count});if(cycle)assert.equal(count,rows.find(x=>x.cycle===0&&x.colliderCount)?.colliderCount);
  }
  for(const[x,w]of[[-6.6,3.6],[.5,5],[7.6,3.6]])for(const sign of[-1,1])for(const fps of[10,60]){
   const lane=x+sign*(w/2-1),points=[[lane,515.5],[lane,521.2],[lane,515.5]],r=replayTerrace(t,W,points,{fps,sprint:true,backward:true});assert.ok(r.arrived,`backward near jamb ${lane} ${fps}`);assert.equal(r.maxFeet,0);rows.push({lane,fps,arrived:r.arrived});
  }
  // Wall-interface seams and all six piers stay physically closed from both sides.
  for(const x of[-9.8,-3.4,4.4,10.8])for(const eps of[-1e-5,0,1e-5])for(const z of[517,518.3,519.5])assert.equal(W.cm.checkCollision(new W.THREE.Vector3(x+eps,1.7,z),.05),true,`masonry seam ${x},${z}`);
  fs.writeFileSync(new URL('../reports/r90-north-connections/independent-review/boundaries-portable.json',import.meta.url),JSON.stringify(rows,null,2));
 }finally{teleport?.dispose();W.dispose();}
});
