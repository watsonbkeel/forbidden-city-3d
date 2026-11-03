import test from 'node:test';
import assert from 'node:assert/strict';
import {TourFrameScheduler} from '../../src/render/TourFrameScheduler.js';
function fixture(onError) {
 let id=0;const pending=new Map(),all=[],listeners=new Set(),doc={hidden:false,addEventListener:(k,f)=>listeners.add(f),removeEventListener:(k,f)=>listeners.delete(f)};
 const failure=new Error('injected frame failure');let frames=0,fail=true;
 const loop=new TourFrameScheduler({document:doc,request:fn=>{all.push(fn);pending.set(++id,fn);return id;},cancel:i=>pending.delete(i),now:()=>100,onError,onFrame(){frames++;if(fail)throw failure;}});
 return {loop,pending,all,listeners,doc,failure,frames:()=>frames,setFail:v=>fail=v,tick(){const q=[...pending.values()];pending.clear();q.forEach(fn=>fn(100));},visible(value){doc.hidden=!value;for(const fn of [...listeners])fn();}};
}
test('uncaught frame error reports once, enters terminal failure and cannot restart through modes, visibility or stale RAF',()=>{
 const errors=[],f=fixture(e=>errors.push(e));f.loop.start();assert.doesNotThrow(()=>f.tick());assert.deepEqual(errors,[f.failure]);
 assert.equal(f.loop.failed,true);assert.equal(f.loop.running,false);assert.equal(f.loop.pending,null);assert.equal(f.pending.size,0);assert.equal(f.listeners.size,0);
 f.setFail(false);for(let i=0;i<20;i++){f.loop.start();f.loop.setMode(i%2?'eco':'smooth');f.visible(false);f.visible(true);for(const cb of f.all)cb(200);}
 assert.equal(f.frames(),1);assert.equal(errors.length,1);assert.equal(f.pending.size,0);f.loop.dispose();f.loop.dispose();
});
test('failure callback throwing still leaves a terminal stopped loop, not an automatic retry',()=>{
 const callbackError=new Error('reporter failure'),f=fixture(()=>{throw callbackError;});f.loop.start();assert.throws(()=>f.tick(),e=>e===callbackError);
 assert.equal(f.loop.failed,true);assert.equal(f.loop.running,false);assert.equal(f.pending.size,0);f.loop.start();assert.equal(f.pending.size,0);f.loop.dispose();
});
test('default error reporting preserves the exception while terminal state prevents revival',()=>{
 const f=fixture();f.loop.start();assert.throws(()=>f.tick(),e=>e===f.failure);assert.equal(f.loop.failed,true);assert.equal(f.loop.running,false);f.visible(false);f.visible(true);assert.equal(f.pending.size,0);f.loop.dispose();
});
test('dispose during a successful frame prevents any later RAF without reporting an error',()=>{
 let queued,reported=0,canceled=0;const loop=new TourFrameScheduler({document:{hidden:false,addEventListener(){},removeEventListener(){}},request:fn=>{queued=fn;return 1;},cancel:()=>canceled++,onFrame:()=>loop.dispose(),onError:()=>reported++});
 loop.start();const cb=queued;queued=null;cb(0);assert.equal(queued,null);assert.equal(reported,0);assert.equal(loop.disposed,true);
});
