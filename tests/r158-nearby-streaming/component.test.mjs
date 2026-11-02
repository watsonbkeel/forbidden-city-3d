import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from 'three';
import {ZoneManager} from '../../src/scene/zones/ZoneManager.js';
import {CollisionManager} from '../../src/utils/Collision.js';
const load=id=>JSON.parse(fs.readFileSync(new URL('../../data/zones/'+id+'.json',import.meta.url)));
const actual=['outer-east','axis-courts','ningshou','east-six','outer-west','garden'].map(load);
const zone=(id,x,neighbors=[])=>({id,name:id,bounds:{x0:x,x1:x+10,z0:-5,z1:5},neighbors,items:[]});
// Small real geometry only replaces expensive palace construction. The actual
// manager, cache, silhouettes, scene membership and collision registration run.
function fixture({zones=actual,position={x:-145,z:-300.3},search=''}={}){
 const oldWindow=globalThis.window;globalThis.window={location:{search}};
 const shared=new T.MeshStandardMaterial({name:'roof_tile'}),lib={owns:o=>o===shared},builds=[],released=[],events=[];
 class Builder{
  constructor(lib,config){this.config=config;this.geos=[];}
  build(){const id=this.config.id;builds.push(id);const b=this.config.bounds,x=(b.x0+b.x1)/2,z=(b.z0+b.z1)/2,group=new T.Group(),geo=new T.BoxGeometry(2,2,2);this.geos.push(geo);group.name=id;group.add(new T.Mesh(geo,shared));group.position.set(x,1,z);this.group=group;return{group,colliders:[new T.Box3(new T.Vector3(x-1,0,z-1),new T.Vector3(x+1,2,z+1))],walkables:[],regions:[],rooms:[],mapItems:[{kind:'hall',name:id,x,z,w:2,d:2}]};}
  dispose(){released.push(this.config.id);this.geos.forEach(g=>g.dispose());this.group.removeFromParent();}
 }
 const m=new ZoneManager({reuseInactive:true}),cm=new CollisionManager(),scene=new T.Scene();for(const q of zones)m.register(q,Builder);m.onLoad=id=>events.push('load:'+id);m.onUnload=id=>events.push('unload:'+id);m.init(scene,lib,cm,position);
 return{m,cm,scene,builds,released,events,dispose(){m.dispose();shared.dispose();globalThis.window=oldWindow}};
}
test('cold OE never queues 419m Ninghou just because of adjacency; near axis still queues and has a silhouette',()=>{
 const s=fixture();try{assert.deepEqual(s.m.getLoadedIds(),['outer-east']);assert.deepEqual(s.m.buildQueue.map(q=>q.zoneId),['axis-courts']);assert.ok(s.m.prebuilt.has('ningshou'));assert.equal(s.m.silhouettes.get('ningshou').visible,true);assert.equal(s.m.silhouettes.get('ningshou').parent,s.scene);assert.equal(s.cm.colliders.some(q=>q.tag==='ningshou'),false);assert.equal(s.builds.filter(id=>id==='ningshou').length,1,'initial prebuild retained, not removed');}finally{s.dispose()}
});
test('entering a current zone loads that destination, not its distant neighbor; unload/return cache and lifecycle survive',()=>{
 const s=fixture({zones:[zone('a',0),zone('b',200,['far']),zone('far',600)],position:{x:5,z:0}});try{const first=s.m.loaded.get('a');s.m.update({x:205,z:0});assert.equal(s.m.getCurrentId(),'b');assert.deepEqual(s.m.getLoadedIds(),['b']);assert.equal(s.cm.colliders[0].tag,'b');assert.equal(s.m.loaded.get('b').data.group.parent,s.scene);assert.equal(s.m.silhouettes.get('a').visible,true);assert.equal(s.m.silhouettes.get('b').visible,false);assert.equal(s.m.silhouettes.get('far').visible,true);s.m.update({x:5,z:0});assert.equal(s.m.loaded.get('a'),first);assert.equal(s.builds.filter(id=>id==='a').length,1);assert.deepEqual(s.events,['load:a','unload:a','load:b','load:a','unload:b']);}finally{s.dispose()}
});
test('existing <=40m spatial prefetch includes a non-neighbor exactly40 but not40.001; init neighbor boundary matches',()=>{
 const s=fixture({zones:[zone('a',0,['at40','outside']),zone('at40',45),zone('outside',45.001),zone('nonneighbor',-45)],position:{x:5,z:0}});try{assert.deepEqual(s.m.buildQueue.map(q=>q.zoneId),['at40']);s.m.update({x:5,z:0});assert.deepEqual(new Set(s.m.getLoadedIds()),new Set(['a','at40','nonneighbor']));assert.equal(s.m.loaded.has('outside'),false);}finally{s.dispose()}
});
test('repeated nearby updates never duplicate queued or registered owners and crossed OE/axis current survives the gap',()=>{
 const s=fixture();try{for(const p of[{x:-145,z:-300.3},{x:-131,z:-300.3},{x:-129.9,z:-300.3},{x:-129.9,z:-300.3},{x:-132.1,z:-300.3}]){s.m.update(p);assert.equal(new Set(s.m.buildQueue.map(q=>q.zoneId)).size,s.m.buildQueue.length);assert.deepEqual(new Set(s.m.getLoadedIds()),new Set(['outer-east','axis-courts']));assert.equal(s.cm.colliders.length,2);}assert.equal(s.m.getCurrentId(),'outer-east');assert.equal(s.events.filter(x=>x==='load:axis-courts').length,1);assert.equal(s.m.prebuilt.has('ningshou'),true);}finally{s.dispose()}
});
test('explicit teleport ensureLoadedAt still synchronously registers all declared neighbors, even419m distant',()=>{
 const s=fixture();try{assert.equal(s.m.ensureLoadedAt(-145,-300.3),'outer-east');assert.deepEqual(new Set(s.m.getLoadedIds()),new Set(['outer-east','axis-courts','ningshou']));assert.equal(s.cm.colliders.filter(q=>q.tag==='ningshou').length,1);assert.equal(s.m.loaded.get('ningshou').data.group.parent,s.scene);assert.equal(s.m.silhouettes.get('ningshou').visible,false);assert.equal(s.m.buildQueue.length,0);s.m.ensureLoadedAt(-145,-300.3);assert.equal(s.cm.colliders.length,3);}finally{s.dispose()}
});
test('loadAll remains all-resident: updates at any point do not unload far solids or expose near silhouettes',()=>{
 const s=fixture({search:'?zones=all'});try{assert.equal(s.m.loadAll,true);assert.equal(s.m.loaded.size,6);assert.equal(s.cm.colliders.length,6);s.m.update({x:10000,z:10000});assert.equal(s.m.loaded.size,6);assert.equal(s.cm.colliders.length,6);assert.ok([...s.m.silhouettes.values()].every(q=>!q.visible));assert.equal(s.m.buildQueue.length,0);}finally{s.dispose()}
});
