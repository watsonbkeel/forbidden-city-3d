import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {ZoneBase} from '../../src/scene/zones/ZoneBase.js';import {library} from '../lib/inner-palace-fixture.mjs';
import {chuxiuCourtyardGeometry} from '../../src/scene/palace/special/ChuxiuCourtyard.js';
const zone=JSON.parse(fs.readFileSync(new URL('../../data/zones/west-six.json',import.meta.url)));
test('R113 two fitted front wings preserve scale and create a bounded rear circulation gap',()=>{
 for(const i of[25,26]){const a=zone.items[i];assert.equal(a.z,422);assert.equal(a.w,11.2);assert.equal(a.d,7.04);assert.equal(a.positionFit.previousZ,423.1);assert.equal(a.positionFit.deltaZ,-1.1)}
 const z=new ZoneBase(library(),zone);for(const i of[25,26]){const r=z.buildHall(zone.items[i]);assert.equal(r.f.position.z,422);assert.equal(r.f.userData.westUnknownAnnexInventory.removedMeshes,6)}
 const g=chuxiuCourtyardGeometry(zone);assert.equal(g.routes.entries[1][0][1],422);assert.equal(g.routes.entries[2][0][1],422);
 assert.equal(zone.items[23].z,434.3);assert.equal(zone.items[24].z,450.2);z.kit.dispose(z.kit.root);
});
