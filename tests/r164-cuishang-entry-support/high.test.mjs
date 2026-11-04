import test from'node:test';import assert from'node:assert/strict';import{fixture}from'./fixture.mjs';import{highExits}from'./high-runner.mjs';
test('24 real2/10m starts naturally fall then continuously exit south at10/30/60/144Hz',()=>{const f=fixture();try{assert.equal(highExits(f.cm).length,24)}finally{f.dispose()}});
