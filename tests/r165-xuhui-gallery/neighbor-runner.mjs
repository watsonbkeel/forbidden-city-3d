import assert from'node:assert/strict';
import*as T from'three';
import{replayKunning}from'../lib/kunning-walk.mjs';
import{withBoundedQaMocks}from'../lib/bounded-qa-clock.mjs';
// This old attempted 'bypass' actually crosses a retained visible front bench.
// Keep the exact failing path and original10Hz walk parameters as a negative.
export const INVALID_GUHUA_BENCH_PATH=Object.freeze([[-245.3,378.6],[-245.3,381],[-249.2,381],[-249.2,389]].map(Object.freeze));
export function rejectedGuhuaBenchRoute(t,cm){
 const min=new T.Vector3(-251.17666666666668,.8599999999999999,382.84),max=new T.Vector3(-247.09,.98,383.26),bench=cm.colliders.filter(c=>c.box.min.distanceTo(min)<1e-10&&c.box.max.distanceTo(max)<1e-10);
 assert.equal(bench.length,1,'exact retained visible Guhua seat-top contact');
 const r=withBoundedQaMocks(t,m=>replayKunning(m,{THREE:T,cm},INVALID_GUHUA_BENCH_PATH,{fps:10,startFeet:0}));
 assert.equal(r.arrived,false,'retained bench crossing must stay blocked');assert.deepEqual(r.stuckAt,[-249.2,389]);assert.ok(r.end[1]>382&&r.end[1]<382.4);
 return{contact:{min:min.toArray(),max:max.toArray()},replay:r};
}
export function neighborRoutes(t,cm){
 const rows=[];
 for(const[name,path,startFeet,endFeet=startFeet]of[
  ['east-bypass',[[-245.3,378.6],[-245.3,400]],0],
  ['xishang-to-gallery',[[-239.7,376.5],[-239.7,377.8]],.5],
  ['xishang-east-stone-field',[[-246,371.4],[-242.8,371.4]],0,.7],
  // Use the existing external forecourt and actual central opening, not a
  // passage through the off-centre front bench. Public14/current proof agrees.
  ['guhua-central-front-approach',[[-245.3,378.6],[-245.3,380],[-253.9,380],[-253.9,387.4]],0,.5]
 ])for(const fps of[10,30,60,144])for(const mode of['walk','sprint','backward'])for(const reverse of[false,true]){
  const p=reverse?[...path].reverse():path,r=withBoundedQaMocks(t,m=>replayKunning(m,{THREE:T,cm},p,{fps,sprint:mode==='sprint',backward:mode==='backward',startFeet:reverse?endFeet:startFeet}));
  assert.ok(r.arrived,JSON.stringify({name,fps,mode,reverse,r}));assert.ok(r.minFeet>=-.03&&r.maxFeet<.73);rows.push({name,fps,mode,reverse,...r});
 }
 return rows;
}
