import test from 'node:test';
import assert from 'node:assert/strict';
import {buildR52World} from './lib/r52-world.mjs';
const snapshot=()=>({document:globalThis.document,window:globalThis.window,navigator:Object.getOwnPropertyDescriptor(globalThis,'navigator')});
test('QA library adapter propagates loading error and restores global boundaries before world construction',async()=>{
 const before=snapshot(),failure=new Error('expected asset failure');
 await assert.rejects(buildR52World({createLibrary:async()=>{throw failure;}}),e=>e===failure);
 assert.deepEqual(snapshot(),before);
});
test('QA library adapter fails closed for missing material library and disposes acquired resources',async()=>{
 const before=snapshot();let disposed=0;
 await assert.rejects(buildR52World({createLibrary:async()=>({dispose(){disposed++;}})}),/must return/);
 assert.equal(disposed,1);assert.deepEqual(snapshot(),before);
});
