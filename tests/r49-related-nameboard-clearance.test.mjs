import test from'node:test';import assert from'node:assert/strict';import{readFileSync}from'node:fs';import*as T from'three';import'./lib/inner-palace-fixture.mjs';import{realTextureLibrary}from'./lib/r48-real-texture-library.mjs';import{ZoneBase}from'../src/scene/zones/ZoneBase.js';
for(const[zone,name,distances]of[['ningshou','景祺阁',[12,18]],['outer-east','文渊阁',[4,8]],['west-six','养心殿',[4,8]],['west-six','重华宫',[4,8]]])test(`${name}: related nameboard no longer buried in its facade`,()=>{
 const d=JSON.parse(readFileSync(new URL('../data/zones/'+zone+'.json',import.meta.url))),item=d.items.find(i=>i.name===name),lib=realTextureLibrary(),b=new ZoneBase(lib,d);
 try{b.buildHall(item);b.kit.root.updateMatrixWorld(true);const p=b.kit.plaques.find(p=>p.text===name),center=p.mesh.getWorldPosition(new T.Vector3()),h=p.mesh.geometry.parameters.height*p.mesh.scale.y;
 const origins=distances.map(distance=>p.mesh.parent.localToWorld(new T.Vector3(p.mesh.position.x,item.ph+1.7,p.mesh.position.z-distance)));
 const group=b.kit.finish();group.updateMatrixWorld(true);
 for(const o of origins)for(const row of[-.32,0,.32]){const target=center.clone().add(new T.Vector3(0,row*h,0)),delta=target.clone().sub(o);const hit=new T.Raycaster(o,delta.clone().normalize(),0,delta.length()+.025).intersectObject(group,true)[0];assert.equal(hit?.object.material?.name,'kit_plaques',`${name} row ${row}: ${hit?.object.material?.name}`);assert.ok(hit.point.distanceTo(target)<.01,'ray must reach the intended glyph position');}
 }finally{b.kit.dispose(b.kit.root);lib.dispose();}
});
