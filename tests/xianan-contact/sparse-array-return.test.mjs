import test from 'node:test';
import {T,assert,XiananOnly,zoneData,query,rejectedAdmission,Environment,CollisionManager,realTextureLibrary} from './supplement.fixture.mjs';
import {ZoneManager} from '../../src/scene/zones/ZoneManager.js';

function fixture(hole){
 const previousWindow=globalThis.window;globalThis.window={location:{search:''}};
 const scene=new T.Scene(),lib=realTextureLibrary(),environment=new Environment(scene,null,lib),cm=new CollisionManager();environment.setupGround();
 let mutation=null;
 class GateWithOrdinaryRows extends XiananOnly{
  build(){
   const data=super.build();assert.equal(this.kit.colliders.length,26);assert.equal(this.kit.walkables.length,1);
   const box=new T.Box3(new T.Vector3(100,0,100),new T.Vector3(101,1,101));
   this.kit.colliders.push(box);this.kit.walkables.push({type:'box',box:box.clone(),rescue:false});
   data.colliders=[...this.kit.colliders];data.walkables=[...this.kit.walkables];
   if(hole){const [key,both]=hole,index=data[key].length-1,length=data[key].length;delete data[key][index];if(both)delete this.kit[key][index];mutation={key,length,index,returnedLength:data[key].length,kitLength:this.kit[key].length,returnedOwn:Object.hasOwn(data[key],index),kitOwn:Object.hasOwn(this.kit[key],index)};}
   return data;
  }
 }
 const manager=new ZoneManager({reuseInactive:true});manager.register(zoneData(),GateWithOrdinaryRows);manager.scene=scene;manager.library=lib;manager.collisionManager=cm;manager.prebuilt=new Map();manager.silhouettes=new Map();
 return {scene,cm,manager,get mutation(){return mutation},dispose(){manager.dispose();cm.clear();environment.dispose();lib.dispose();globalThis.window=previousWindow}};
}

test('sparse array control: genuine dense copies retain one gate and ordinary collider/walkable',()=>{
 const f=fixture();try{assert.equal(rejectedAdmission(()=>f.manager.loadZone('outer-west')),false);assert.equal(query(f)?.status,'valid');assert.equal(f.cm.colliders.length,27);assert.equal(f.cm.walkables.length,2);const {builder,data}=f.manager.loaded.get('outer-west');for(const key of ['colliders','walkables'])for(let i=0;i<data[key].length;i++){assert.equal(Object.hasOwn(data[key],i),true);assert.equal(Object.hasOwn(builder.kit[key],i),true);assert.equal(data[key][i]===builder.kit[key][i],true)}}finally{f.dispose()}
});
for(const key of ['colliders','walkables'])for(const both of [false,true])test('sparse array rejects non-target '+key+' hole in '+(both?'both return and kit':'returned copy'),()=>{
 const f=fixture([key,both]);try{
  const denied=rejectedAdmission(()=>f.manager.loadZone('outer-west')),m=f.mutation;assert.ok(m,'actual builder mutation occurred');assert.equal(m.returnedLength,m.length);assert.equal(m.kitLength,m.length);assert.equal(m.returnedOwn,false);assert.equal(m.kitOwn,!both);
  const observed=denied?'rejected':query(f)?.status;assert.equal(denied,true,'same-length sparse output must be denied; observed '+observed);assert.equal(f.manager.loaded.size,0);assert.equal(f.manager.inactiveCache.entries.size,0);
 }finally{f.dispose()}
});
