import test from'node:test';import*as T from'three';import{fixture,collision}from'./fixture.mjs';import{stairRoutes}from'./route-runner.mjs';
test('both upper entries and courtyard returns work at10/60/144Hz walking/running, actual sides block',t=>{const f=fixture();try{stairRoutes(t,T,collision(f))}finally{f.dispose()}});
