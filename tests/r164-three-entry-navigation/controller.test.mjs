import test from'node:test';import assert from'node:assert/strict';import*as T from'three';import{fixture,names}from'./fixture.mjs';import{replayKunning}from'../lib/kunning-walk.mjs';import{withBoundedQaMocks}from'../lib/bounded-qa-clock.mjs';
export{routes}from'./route-runner.mjs';import{routes}from'./route-runner.mjs';
for(const name of names)test(name+' real controller follows entry and return at 10/60/144Hz walk/run/backward',t=>{const f=fixture(name);try{assert.equal(routes(t,f.cm,f.t,[name]).length,24)}finally{f.dispose()}});
