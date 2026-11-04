import assert from 'node:assert/strict';
import {replayKunning} from '../lib/kunning-walk.mjs';
import {withBoundedQaMocks} from '../lib/bounded-qa-clock.mjs';
const paths=[
 ['gate to viewing side',[[-272.3,524],[-272.3,508.8],[-278.1,508.8]]],
 ['north bypass',[[-282,514],[-272.3,514]]],
 ['west bypass',[[-281,505],[-281,515]]],
 ['east bypass',[[-274.5,505],[-274.5,515]]],
 ['diagonal southwest',[[-282,507],[-280,509],[-280,512.5],[-278.1,514]]],
 ['diagonal northeast',[[-274,515],[-276.2,512.5],[-276.2,508.7],[-278.1,507]]],
];
const blocked=[
 ['well west to east',[[-280.5,510.6],[-275.7,510.6]]],
 ['well east to west',[[-275.7,510.6],[-280.5,510.6]]],
 ['well south to north',[[-278.1,508.2],[-278.1,513]]],
 ['well north to south',[[-278.1,513],[-278.1,508.2]]],
 ['retained north wall',[[-282,517],[-282,523]]],
];
export function runRoutes(t,W){
 const positive=[],negative=[];
 for(const[name,path]of paths)for(const reverse of[false,true])for(const fps of[30,60])for(const sprint of[false,true]){
  const points=reverse?path.toReversed():path;
  const r=withBoundedQaMocks(t,local=>replayKunning(local,W,points,{startFeet:0,fps,sprint,recordFrames:true}));
  assert.equal(r.arrived,true,JSON.stringify({name,reverse,fps,sprint,...r,frames:undefined}));
  assert.ok(r.minFeet>=-1e-5&&r.maxFeet<=.01,JSON.stringify({name,fps,sprint,min:r.minFeet,max:r.maxFeet}));
  const contacts=r.frames.filter(f=>W.cm.checkCollision(new W.THREE.Vector3(f.x,f.feet+1.7,f.z),.5)).length;
  assert.equal(contacts,0,name);positive.push({name,reverse,fps,sprint,...r,frames:undefined,contacts});
 }
 for(const[name,points]of blocked)for(const fps of[30,60])for(const sprint of[false,true]){
  const r=withBoundedQaMocks(t,local=>replayKunning(local,W,points,{startFeet:0,fps,sprint,recordFrames:true}));
  assert.equal(r.arrived,false,JSON.stringify({name,fps,sprint,...r,frames:undefined}));
  assert.ok(r.minFeet>=-1e-5&&r.maxFeet<=.01,name);
  const contacts=r.frames.filter(f=>W.cm.checkCollision(new W.THREE.Vector3(f.x,f.feet+1.7,f.z),.5)).length;
  assert.equal(contacts,0,name);negative.push({name,fps,sprint,...r,frames:undefined,contacts});
 }
 return{positive,negative};
}
