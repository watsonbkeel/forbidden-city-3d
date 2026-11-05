import assert from'node:assert/strict';
import*as T from'three';
import{FirstPersonControls}from'../../src/controls/FirstPerson.js';
import{replayKunning}from'../lib/kunning-walk.mjs';
import{withBoundedQaMocks}from'../lib/bounded-qa-clock.mjs';
export function galleryRoutes(t,cm){
 const rows=[];
 for(const fps of[10,30,60,144])for(const mode of['walk','sprint','backward'])for(const offset of[-.3,0,.3])for(const kind of['ascent','descent','round-trip']){
  const up=[[-239.7+offset,377.4],[-239.7+offset,379.8],[-239.7+offset,384],[-240.05,384],[-240.05,391],[-240.05,396]];
  const reverse=kind==='descent',roundTrip=kind==='round-trip',points=roundTrip?[...up,...up.slice(0,-1).reverse()]:reverse?[...up].reverse():up;
  let r,positionInitializations=0;const controllers=new Set(),history=[];
  try{r=withBoundedQaMocks(t,m=>{
   const original=FirstPersonControls.prototype.setPosition;
   m.mock.method(FirstPersonControls.prototype,'setPosition',function(...args){positionInitializations++;controllers.add(this);return original.apply(this,args)});
   const update=FirstPersonControls.prototype.update;
   m.mock.method(FirstPersonControls.prototype,'update',function(...args){const out=update.apply(this,args);controllers.add(this);history.push({time:performance.now()/1000,x:this.camera.position.x-this.bobOffset.x,z:this.camera.position.z-this.bobOffset.z,feet:this.feetY});return out});
   return replayKunning(m,{THREE:T,cm},points,{fps,sprint:mode==='sprint',backward:mode==='backward',startFeet:reverse?2:.5,recordFrames:true});
  })}catch(e){throw new Error(JSON.stringify({fps,mode,offset,kind}),{cause:e})}
  const diagnostic=()=>JSON.stringify({fps,mode,offset,kind,r});
  assert.ok(r.arrived,diagnostic());assert.ok(r.minFeet>=.48&&r.maxFeet<=2.02,diagnostic());
  assert.ok(Math.abs(r.end[2]-(reverse||roundTrip?.5:2))<.03,diagnostic());
  assert.equal(controllers.size,1,'one real controller per whole replay');assert.equal(positionInitializations,1,'only initial low/high spawn, no reset at turn');
  if(!reverse)for(let i=0;i<10;i++){
   const mid=379.8+(i+.5)*.32;
   assert.ok(r.frames.some((f,j)=>j>0&&r.frames[j-1].z<=mid&&f.z>=mid),'swept ascent tread '+i);
   assert.ok(Math.abs(cm.getGroundHeight(-239.7,mid,.5+(i+1)*.15,.05,.05)-(.5+(i+1)*.15))<.0001,'visible tread support '+i);
   if(roundTrip)assert.ok(r.frames.some((f,j)=>j>0&&f.waypoint>=9&&r.frames[j-1].z>=mid&&f.z<=mid),'same-history swept descent tread '+i);
  }
  const turnReached=roundTrip&&r.frames.some(f=>f.waypoint>=6&&f.z>395&&f.feet>1.98),descentTraversed=roundTrip&&history.some(f=>f.time>=r.frames.at(-1).time&&f.z<379.8&&Math.abs(f.feet-.5)<.03),continuousClock=history.every((f,j)=>j===0||Math.abs(f.time-history[j-1].time-1/fps)<1e-9);
  if(roundTrip){assert.ok(turnReached,'actual high-porch turn in this controller history');assert.ok(descentTraversed,'descent settles on low platform in same history '+JSON.stringify({fps,mode,offset,end:r.end}));assert.ok(continuousClock,'no clock reset at high turn')}
  const{frames,...small}=r;rows.push({fps,mode,offset,kind,reverse,controllerCount:controllers.size,positionInitializations,historyFrames:history.length,movingFrames:r.frames.length,settleFrames:history.length-r.frames.length,turnReached,descentTraversed,continuousClock,...small});
 }
 return rows;
}
