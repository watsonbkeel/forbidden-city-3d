import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {profileGateRoutes} from './lib/auto-routes.mjs';
import {xiqingGeometry} from '../src/scene/palace/special/XiqingGate.js';
test('R104 route fixture derives all three flat Xiqing openings from actual production profile without fictitious ramps',()=>{
 const zone=JSON.parse(fs.readFileSync(new URL('../data/zones/ningshou.json',import.meta.url))),item=zone.items[0],g=xiqingGeometry(item,zone.id,0);
 const routes=profileGateRoutes([{...zone,items:[item]}]);
 assert.equal(routes.length,3);
 for(let i=0;i<3;i++){
  assert.equal(routes[i].portalCenter,g.portals[i].x);
  assert.equal(routes[i].gateProfile,'xiqing');
  assert.deepEqual(routes[i].pts,[-g.depth/2-2,0,g.depth/2+2,0,-g.depth/2-2].map(z=>[g.x+g.portals[i].x*Math.cos(g.rot)+z*Math.sin(g.rot),g.z-g.portals[i].x*Math.sin(g.rot)+z*Math.cos(g.rot)]));
 }
});
