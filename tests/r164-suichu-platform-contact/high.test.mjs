import test from'node:test';import assert from'node:assert/strict';import{fixture}from'./fixture.mjs';import{BeforeZone}from'./before.mjs';import{highExits}from'./high-runner.mjs';
test('24 lower/roof-height starts fall then walk south without reset, at10/30/60/144Hz',()=>{const f=fixture();try{assert.equal(highExits(f.cm).length,24)}finally{f.dispose()}});
test('same24 high starts also exit in frozen1f6; no changed public high-position policy',()=>{const f=fixture(BeforeZone);try{assert.equal(highExits(f.cm).length,24)}finally{f.dispose()}});
