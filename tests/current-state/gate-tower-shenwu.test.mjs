import test from 'node:test';
import assert from 'node:assert/strict';
import {captureGate} from '../lib/gate-tower-fixture.mjs';
import {buildWorld,walkStraight} from '../lib/world.mjs';
import {DIMENSIONS,LAYOUT} from '../../src/config/constants.js';
const g=captureGate('神武门'),W=await buildWorld();
const Z=LAYOUT.SHENWU_Z,top=10.3;
function route(points,feet0=top){let cur=[points[0][0],points[0][1]+Z],feet=feet0;for(const p of points.slice(1)){const target=[p[0],p[1]+Z],r=walkStraight(W,cur,target,{feet0:feet,step:.05});assert.ok(Math.hypot(r.end[0]-target[0],r.end[1]-target[1])<.08,JSON.stringify({from:cur,to:target,r}));cur=r.end;feet=r.feet;}return feet;}
test('Shenwu nominal city platform is coherent with layout, visible deck, top support and relocated ramps',()=>{
 assert.equal(DIMENSIONS.SHENWU.width,50.18);assert.equal(DIMENSIONS.SHENWU.depth,26.46);assert.equal(Z,542);
 assert.equal(g.data.dimensions.width,50.18);assert.equal(g.data.dimensions.depth,26.46);
 const platform=g.builder.walkables.find(w=>w.type==='box'&&w.box.max.y===top);assert.ok(platform);
 assert.deepEqual(platform.box.min.toArray(),[-25.09,top,Z-13.23]);assert.deepEqual(platform.box.max.toArray(),[25.09,top,Z+13.23]);assert.equal(platform.rescue,false);
 const ramps=g.builder.walkables.filter(w=>w.type==='ramp');assert.equal(ramps.length,2);
 for(const r of ramps){assert.equal(r.minZ,Z-12.78);assert.equal(r.maxZ,Z-8.68);assert.equal(r.y1,top);assert.ok(Math.abs(Math.abs(r.a1)-25.09)<1e-9);assert.ok(Math.abs(Math.abs(r.a0)-45.69)<1e-9);}
 const decks=g.group.children.filter(m=>m.isMesh&&m.material.name==='stone_slab'&&Math.abs(m.position.y-10.15)<1e-8);assert.equal(decks.length,1);const b=new g.THREE.Box3().setFromObject(decks[0]);assert.ok(Math.abs(b.max.x-25.29)<1e-5);assert.ok(Math.abs(b.max.z-13.43)<1e-5);
});
test('Shenwu has explicit source-sized nonuniform outer grid, two inner rows and cardinal door groups',()=>{
 const structure=g.tower.userData.structure;assert.equal(structure?.id,'axis/shenwu-upper-tower');assert.equal(structure.grid.width,41.7226);assert.equal(structure.grid.depth,17.9651);
 const outer=g.tower.children.filter(m=>m.userData.gatePart==='outer-column');assert.equal(outer.length,20);
 const inner=g.tower.children.filter(m=>m.userData.gatePart==='interior-column');assert.equal(inner.length,12);
 for(const m of outer){assert.equal(m.geometry.parameters.radiusTop,.3275);assert.equal(m.geometry.parameters.radiusBottom,.3275);}for(const m of inner)assert.equal(m.geometry.parameters.radiusTop,.375);
 const leaves=g.tower.children.filter(m=>m.userData.gatePart?.startsWith('open-'));assert.equal(leaves.length,16);
 for(const side of ['north','south'])assert.equal(leaves.filter(m=>m.userData.geographicSide===side&&m.material.name==='lattice_doors').length,6);
 for(const side of ['east','west'])assert.equal(leaves.filter(m=>m.userData.geographicSide===side&&m.material.name==='wood_column').length,2);
 assert.ok(!leaves.some(m=>m.material.name==='door_studded'));
});
test('Shenwu drawn local outline is separate from city base and preserves endpoint adoption policy',()=>{
 const s=g.tower.userData.structure;assert.deepEqual(s?.localOutline?.adoptedSize,[43.68,20.075]);assert.equal(s.localOutline.modelOffsets.x,.9787);assert.equal(s.localOutline.modelOffsets.z,1.05495);
 assert.equal(s.verticalGeometry.status,'FLAT_PREVIEW_RAISED_PLINTH_AND_STAIRS_DEFERRED');assert.equal(s.verticalGeometry.inheritedFloorY,10.3);
 const rails=g.tower.children.filter(m=>m.userData.gatePart==='local-hall-balustrade');assert.equal(rails.length,8);assert.ok(rails.every(m=>m.material.name==='balustrade'));
 for(const rail of rails){assert.equal(rail.material.alphaTest,.5);assert.equal(rail.material.side,g.THREE.DoubleSide);}
});
test('Shenwu fixed body completes four-sided recessed veranda and outer city-platform loop',()=>{
 assert.equal(route([[-19.5,-7.65],[19.5,-7.65],[19.5,7.65],[-19.5,7.65],[-19.5,-7.65]]),top);
 assert.equal(route([[-23.5,-11.2],[23.5,-11.2],[23.5,11.2],[-23.5,11.2],[-23.5,-11.2]]),top);
});
test('Shenwu all six north/south door groups and both board doors are actually traversable',()=>{
 for(const x of [-8.19625,0,8.19625])assert.equal(route([[x,-7.65],[x,0],[x,7.65],[x,0],[x,-7.65]]),top);
 assert.equal(route([[-23.5,0],[0,0],[23.5,0],[0,0],[-23.5,0]]),top);
});
test('Shenwu both real ramps connect ground to outer loop and central south entrance without rescue',()=>{
 for(const s of [-1,1])assert.equal(route([[s*47,-10.73],[s*24,-10.73],[s*23.5,-11.2],[0,-11.2],[0,0]],0),top);
});
test('Shenwu three ground tunnels remain supported at ground; closed bays and inner balustrade remain solid',()=>{
 for(const x of [-13,0,13])assert.equal(route([[x,-15],[x,15]],0),0);
 for(const pts of [[[14,-7.65],[14,0]],[[14,-11.2],[14,-7.65]]]){const r=walkStraight(W,[pts[0][0],Z+pts[0][1]],[pts[1][0],Z+pts[1][1]],{feet0:top,step:.05});assert.ok(r.reached<r.total-1,JSON.stringify(r));}
});

test('Shenwu flanking door bays do not create undocumented extra balustrade gaps',()=>{for(const x of [-8.19625,8.19625])for(const s of [-1,1]){const r=walkStraight(W,[x,Z+s*11.2],[x,Z+s*7.65],{feet0:top,step:.05});assert.ok(r.reached<r.total-1,JSON.stringify(r));}});
