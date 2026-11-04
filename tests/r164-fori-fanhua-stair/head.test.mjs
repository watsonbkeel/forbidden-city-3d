import test from'node:test';import{fixture,collision}from'./fixture.mjs';import{stairHeads}from'./route-runner.mjs';
test('new fitted side heads stop a real jump and allow a return to the real upper floor',()=>{const f=fixture();try{stairHeads(collision(f))}finally{f.dispose()}});
