import test from 'node:test';
import assert from 'node:assert/strict';
import {TourFrameScheduler} from '../../src/render/TourFrameScheduler.js';

test('diagnostic: an injected uncaught frame error stops future RAFs without setting running false',()=>{
 let id=0;const queue=new Map(),doc={hidden:false,addEventListener(){},removeEventListener(){}};
 const error=new Error('diagnostic injection, NOT a reproduced Chuxiu root cause');
 const scheduler=new TourFrameScheduler({document:doc,request:cb=>{queue.set(++id,cb);return id;},cancel:id=>queue.delete(id),now:()=>0,onFrame(){throw error;}});
 scheduler.start();const cb=queue.values().next().value;queue.clear();
 assert.throws(()=>cb(0),e=>e===error);assert.equal(queue.size,0);assert.equal(scheduler.pending,null);assert.equal(scheduler.running,true);
 scheduler.dispose();
});
