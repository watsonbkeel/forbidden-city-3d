import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import * as THREE from 'three';
import { gateGeom } from './lib/world.mjs';
import { southCourtGateGeometry } from '../src/scene/palace/special/SouthCourtGates.js';
import { ZoneBase } from '../src/scene/zones/ZoneBase.js';
import { CollisionManager } from '../src/utils/Collision.js';
import { FirstPersonControls } from '../src/controls/FirstPerson.js';
import { library } from './lib/inner-palace-fixture.mjs';
import { replayTerrace, traceTerraceGround } from './lib/terrace-walk.mjs';

const gates=['outer-east','outer-west'].map(zone=>{
  const config=JSON.parse(readFileSync(new URL(`../data/zones/${zone}.json`,import.meta.url)));
  return {zone,config,item:config.items.find(item=>item.southGateProfile)};
});

test('R36 helper uses all three real portals and both dedicated gate ramp toes, not the legacy width heuristic',()=>{
  for(const {item} of gates){
    const raw=southCourtGateGeometry(item),g=gateGeom(item);
    assert.ok(g.front>10&&g.rear>10,item.name+' actual deep gate');
    assert.equal(g.front,raw.z-raw.southToe);assert.equal(g.rear,raw.northToe-raw.z);
    assert.equal(g.platformY,raw.ph);assert.deepEqual(g.dir,[0,1]);
    assert.equal(g.profile.portalCenters.length,3);
    assert.deepEqual(g.profile.portalCenters.map(x=>g.profile.toWorld(x,0)),raw.portals.map(p=>[p.x,p.z]));
    const front=g.profile.ramps.find(r=>r.side==='front'),rear=g.profile.ramps.find(r=>r.side==='rear');
    assert.deepEqual(g.profile.toWorld(0,front.zToe),[raw.x,raw.southToe]);
    assert.deepEqual(g.profile.toWorld(0,rear.zToe),[raw.x,raw.northToe]);
    assert.equal(front.zTop,-(raw.d+2*raw.pad)/2);assert.equal(rear.zTop,(raw.d+2*raw.pad)/2);
    const legacy={...item};delete legacy.southGateProfile;
    assert.equal(gateGeom(legacy).half,item.southGateProfile==='wenhua'?5.765:5.8,'explicit opt-in preserves the old non-profile behavior');
  }
});

test('R36 helper rejects malformed explicit southern registration instead of silently returning legacy geometry',()=>{
  const item=gates[0].item;
  assert.throws(()=>gateGeom({...item,southGateProfile:'unknown'}),/South court gate/);
  assert.throws(()=>gateGeom({...item,x:item.x+1}),/South court gate/);
});

test('R36 gate helper leaves the exact R35 no-profile fallback body unchanged',()=>{
  // Narrow preservation proof only. This byte assertion is NOT a geometry or
  // route acceptance test, and does not project old production modules.
  const source=readFileSync(new URL('./lib/world.mjs',import.meta.url),'utf8');
  const start=source.indexOf('  const rot = parseRot(item.rot);',source.indexOf('export function gateGeom'));
  const end=source.indexOf('\n}\n',start);
  assert.equal(createHash('sha256').update(source.slice(start,end)).digest('hex'),
    '5112efcebab30503954ca84bb1670859687f56665678e367182e6cc62279fb9c');
  assert.equal(gateGeom({kind:'gate',x:1,z:2}).half,1.4);
  assert.equal(gateGeom({kind:'gate',x:1,z:2,style:'hall'}).half,4);
  assert.equal(gateGeom({kind:'cityGate',x:1,z:2}).half,7);
});

for(const fps of [10,60])test(`R36 helper-derived three-portal round trips independently enter both real gates from ground at ${fps} Hz`,t=>{
  for(const {zone,config,item} of gates){
    const builder=new ZoneBase(library(),config),data=builder.build(),cm=new CollisionManager();
    cm.addColliders(data.colliders,zone);cm.addWalkables(data.walkables,zone);
    try {
      const g=gateGeom(item),front=g.profile.ramps.find(r=>r.side==='front'),rear=g.profile.ramps.find(r=>r.side==='rear');
      for(const x of g.profile.portalCenters){
        const go=[front.zToe-2,front.zToe,front.zTop,rear.zTop,rear.zToe,rear.zToe+2].map(z=>g.profile.toWorld(x,z));
        const points=[...go,...go.slice(0,-1).reverse()];
        const trace=traceTerraceGround(cm,{flights:[]}),placed=t.mock.method(FirstPersonControls.prototype,'setPosition');let result;
        try {result=replayTerrace(t,{THREE,cm},points,{fps,sprint:true,recordFrames:true});}finally{trace.restore();}
        assert.equal(placed.mock.callCount(),1);placed.mock.restore();assert.equal(result.startFeet,0);
        assert.equal(result.arrived,true,JSON.stringify({name:item.name,x,end:result.end,stuckAt:result.stuckAt}));
        assert.equal(trace.samples.some(p=>['rescue','unverified'].includes(p.source)),false,item.name);
        const middle=result.frames.filter(p=>Math.abs(p.z-g.z)<2);
        assert.ok(middle.length>0&&middle.every(p=>p.ground===g.platformY&&p.feet>=g.platformY-.2),item.name+' uses the actual elevated gate floor');
      }
    }finally{builder.dispose();}
  }
});
