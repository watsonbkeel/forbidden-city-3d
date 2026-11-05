import test from'node:test';import assert from'node:assert/strict';import*as T from'three';
import{fixture,zone,collision}from'./fixture.mjs';
import{buildGuhuaPavilion}from'../../src/scene/palace/special/GuhuaPavilion.js';
import{buildXuhuiGallery}from'../../src/scene/palace/special/XuhuiGallery.js';
import{neighborRoutes,rejectedGuhuaBenchRoute}from'./neighbor-runner.mjs';
function retainedContext(){const f=fixture();buildGuhuaPavilion(f.kit,zone.items.find(i=>i.name==='古华轩'));return f}
test('real retained Xishang and Guhua fixture:96 low-platform/stone-field/east-bypass/central-opening approaches pass',t=>{const f=retainedContext();try{buildXuhuiGallery(f.kit,zone);assert.equal(neighborRoutes(t,collision(f)).length,96)}finally{f.dispose()}});
test('the original off-centre Guhua bench-crossing stays identically blocked before/after Xuhui, with contact matching its visible seat',t=>{const f=retainedContext();try{let seat;f.kit.root.updateWorldMatrix(true,true);f.kit.root.traverse(m=>{if(m.isMesh&&m.name==='guhua-seat-top'){const b=new T.Box3().setFromObject(m,true);if(Math.abs(b.min.x+251.17666666666668)<1e-5&&Math.abs(b.min.z-382.84)<1e-5)seat=b}});assert.ok(seat);const before=rejectedGuhuaBenchRoute(t,collision(f));assert.ok(seat.min.distanceTo(new T.Vector3(...before.contact.min))<1e-5&&seat.max.distanceTo(new T.Vector3(...before.contact.max))<1e-5,'real visible seat/contact agreement');buildXuhuiGallery(f.kit,zone);const after=rejectedGuhuaBenchRoute(t,collision(f));assert.deepEqual(after,before)}finally{f.dispose()}});
