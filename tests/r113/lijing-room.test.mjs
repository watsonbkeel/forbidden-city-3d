import test from'node:test';import assert from'node:assert/strict';import fs from'node:fs';import{ZoneBase}from'../../src/scene/zones/ZoneBase.js';import{library}from'../lib/inner-palace-fixture.mjs';
const zone=JSON.parse(fs.readFileSync(new URL('../../data/zones/west-six.json',import.meta.url)));
test('R113 actual Lijing retains shell and supplies the whole source-guided west-room group',()=>{
 const z=new ZoneBase(library(),zone),b=z.buildHall(zone.items[24]),g=b.f.getObjectByName('lijing-west-room');assert.ok(g,'complete west room missing');
 for(const role of['paired-curved-openings','central-mirror','side-cabinet','long-console','white-tablecloth','dining-chair','room-rug'])assert.ok(g.getObjectByName(role),role);
 assert.equal(g.userData.orientationStatus,'REVERSIBLE_MODEL_FIT_NOT_SURVEY');assert.equal(g.userData.legacyRemovedMeshes,8);assert.equal(b.f.position.x,94.5);assert.equal(b.f.position.z,450.2);assert.equal(z.kit.rooms[0].doors[0].x,94.5);assert.equal(z.kit.rooms[0].doors[0].z,443.75);
 z.kit.dispose(z.kit.root);
});

test('R113 invalid live source floor rejects before deleting the original generic group',async()=>{
 const{applyLijingWestRoom}=await import('../../src/scene/palace/special/LijingWestRoom.js');const z=new ZoneBase(library(),zone),b=z.buildHallBaseline(zone.items[24]);z.kit.walkables=[];const children=[...b.f.children],colliders=[...z.kit.colliders];assert.throws(()=>applyLijingWestRoom(z.kit,'west-six',24,zone.items[24],b));assert.deepEqual(b.f.children.map(m=>m.id),children.map(m=>m.id));assert.equal(z.kit.colliders.length,colliders.length);assert.ok(z.kit.colliders.every((b,i)=>b===colliders[i]));z.kit.dispose(z.kit.root);
});
