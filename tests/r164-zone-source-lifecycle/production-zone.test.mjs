import fs from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
registerHooks({load(u,c,n){return n(u,u.endsWith('.json')?{...c,importAttributes:{...c.importAttributes,type:'json'}}:c)}});
await import('../lib/inner-palace-fixture.mjs');
const T=await import('three'),{ZoneBase}=await import('../../src/scene/zones/ZoneBase.js'),{ZoneManager}=await import('../../src/scene/zones/ZoneManager.js'),{CollisionManager}=await import('../../src/utils/Collision.js'),{Teleport}=await import('../../src/ui/Teleport.js'),{createActualLibrary}=await import('../r158-cumulative-1600/library.mjs'),{setBuildingDetailQuality}=await import('../../src/render/BuildingDetailQuality.js');
const id=process.env.ZONE_ID??'east-six',quality=process.env.QUALITY??'high',zone=JSON.parse(fs.readFileSync(new URL('../../data/zones/'+id+'.json',import.meta.url)));
const positions={'east-six':[-182.3,253.3],garden:[1.1,422.7],'outer-east':[-352,-331],'outer-west':[300.9,-217.7]};
const snapshot=d=>JSON.stringify({colliders:d.colliders,walkables:d.walkables,mapItems:d.mapItems,rooms:d.rooms,regions:d.regions});
test(`actual ${id}/${quality} source ownership survives repeated inactive admission, real Teleport and failed-copy cleanup`,()=>{
 const {library,dispose}=createActualLibrary();setBuildingDetailQuality(library,quality);globalThis.window={location:{search:''}};
 const z=new ZoneManager({reuseInactive:true}),scene=new T.Scene(),cm=new CollisionManager();cm.rivers=[];z.scene=scene;z.library=library;z.collisionManager=cm;z.prebuilt=new Map();z.silhouettes=new Map();z.register(zone);z.currentId=id;
 const b=new ZoneBase(library,zone),d=b.build(),sig=snapshot(d),counts=[d.colliders.length,d.walkables.length];z.allMapItems=d.mapItems;
 z.prebuilt.set(id,{builder:b,data:d,config:z.zones.get(id),detailQuality:z.detailQualityFor(id)});const silhouette=new T.Group();scene.add(silhouette);z.silhouettes.set(id,silhouette);
 // Larger test admission only for other zones: exercise their source retention
 // independently of their legitimate rejection by the production32MiB budget.
 if(id!=='east-six')z.inactiveCache.maxBytes=1024*1024*1024;
 const create=document.createElement,body=document.body;document.createElement=tag=>tag==='canvas'?create(tag):({style:{},setAttribute(){},remove(){}});document.body={appendChild(){}};
 const camera=new T.PerspectiveCamera(),controls={camera,getPosition:()=>camera.position,getFeetY:()=>camera.position.y-1.7,teleportTo(x,z,lx,lz){camera.position.set(x,cm.getGroundHeight(x,z,Infinity)+1.7,z);camera.lookAt(lx,camera.position.y,lz)}};
 const teleport=new Teleport(controls,z,cm),target=id==='east-six'?'奉先殿':null;let before,cycles=[];
 try{
  z.loadZone(id);const entry=z.loaded.get(id);assert.deepEqual([cm.colliders.length,cm.walkables.length],counts);
  if(target){before=teleport.go(target);assert.ok(before);assert.equal(before.fallback,false)}
  for(let i=0;i<3;i++){
   z.unloadZone(id);assert.equal(z.loaded.size,0);assert.deepEqual([cm.colliders.length,cm.walkables.length],[0,0]);assert.equal(d.group.parent,null);assert.equal(silhouette.visible,true);assert.ok(z.inactiveCache.entries.has(id),'actual source must fit selected budget');
   if(target){assert.deepEqual(teleport.go(target),before,teleport.lastFailure?.error?.stack)}else assert.doesNotThrow(()=>z.loadZone(id));
   assert.equal(z.loaded.get(id),entry);assert.equal(z.inactiveCache.entries.size,0);assert.equal(z.inactiveCache.bytes,0);assert.equal(d.group.parent,scene);assert.equal(silhouette.visible,false);assert.deepEqual([cm.colliders.length,cm.walkables.length],counts);assert.equal(snapshot(d),sig);cycles.push({cycle:i,retainedRootChildren:b.kit.root.children.length,cost:entry.cost.accountedBytes});
  }
  z.unloadZone(id);const [x,zz]=positions[id],host=b.kit.root.children.find(f=>f.position.x===x&&f.position.z===zz);assert.ok(host,'private actual source branch retained');host.position.x+=1;
  assert.throws(()=>z.loadZone(id));assert.equal(z.loaded.size,0);assert.equal(z.inactiveCache.entries.size,0);assert.equal(z.prebuilt.size,0);assert.deepEqual([cm.colliders.length,cm.walkables.length],[0,0],'failed admission must remove partial physics');assert.equal(d.group.parent,null);assert.equal(silhouette.visible,true);
  assert.doesNotThrow(()=>z.loadZone(id),'explicit retry rebuilds rather than duplicating retained triangle owners');assert.deepEqual([cm.colliders.length,cm.walkables.length],counts);if(target)assert.deepEqual(teleport.go(target),before);z.unloadZone(id,{retain:false});assert.deepEqual([cm.colliders.length,cm.walkables.length],[0,0]);
  console.log(JSON.stringify({id,quality,counts,cycles,scope:'ACTUAL_SINGLE_ZONE_NOT_WORLD_OR_GPU',rssKiB:process.resourceUsage().maxRSS}));
 }finally{teleport.dispose();document.createElement=create;document.body=body;for(const e of z.loaded.values()){e.data.group.removeFromParent();e.builder.dispose()}z.loaded.clear();z.inactiveCache.clear();for(const e of z.prebuilt.values())e.builder.dispose();z.prebuilt.clear();b.dispose();dispose()}
});
