import test from 'node:test';
import assert from 'node:assert/strict';
import {TourFrameScheduler} from '../../src/render/TourFrameScheduler.js';

// The old diagnostic proved running=true with no pending frame. Recovery now
// terminates that failed loop; this injection still is not a Chuxiu reproduction.
test('injected uncaught frame error terminates future RAFs and cannot restart',()=>{
 let id=0;const queue=new Map(),doc={hidden:false,addEventListener(){},removeEventListener(){}};
 const error=new Error('diagnostic injection, NOT a reproduced Chuxiu root cause');
 const scheduler=new TourFrameScheduler({document:doc,request:cb=>{queue.set(++id,cb);return id;},cancel:id=>queue.delete(id),now:()=>0,onFrame(){throw error;}});
 scheduler.start();const cb=queue.values().next().value;queue.clear();
 assert.throws(()=>cb(0),e=>e===error);assert.equal(queue.size,0);assert.equal(scheduler.pending,null);assert.equal(scheduler.running,false);assert.equal(scheduler.failed,true);
 scheduler.start();assert.equal(queue.size,0);
 scheduler.dispose();
});
