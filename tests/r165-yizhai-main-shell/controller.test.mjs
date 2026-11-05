import test from'node:test';import assert from'node:assert/strict';import{fixture,collision}from'./fixture.mjs';import{CollisionManager}from'../../src/utils/Collision.js';import{porchRoutes}from'./route-runner.mjs';

test('two offset entrances, two galleries and retained west route walk/run both ways; closed door/window negative controls remain real',t=>{const f=fixture();try{const r=porchRoutes(t,collision(f));assert.equal(r.stairs.length,24);assert.equal(r.galleries.length,24);assert.equal(r.bypass.length,24);assert.equal(r.blocked.length,16)}finally{f.dispose()}});
