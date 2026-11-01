import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import {fixture,axis} from '../r157-pavilion-side/fixture.mjs';
import {pavilionGeometry} from '../../src/scene/palace/special/PavilionProfiles.js';
import {sideConnectionTargets,connectionPlan} from '../../src/scene/palace/special/PavilionSideConnections.js';
import {replayKunning} from '../lib/kunning-walk.mjs';
import {withBoundedQaMocks} from '../lib/bounded-qa-clock.mjs';
test('both pavilions keep original front and four U-link controller routes after visual-only ornaments', t => {
  const {z,cm}=fixture(), w={THREE,cm}, rows=[];
  try {
    for(const item of axis.items.filter(i=>['tiren','hongyi'].includes(i.pavilionProfile))) {
      const g=pavilionGeometry(item), paths=[];
      for(const target of sideConnectionTargets(axis,item)) {
        const plan=connectionPlan(g,g.sideConnections.find(s=>s.direction===target.direction),target);
        paths.push({name:plan.id,points:plan.route.map(p=>[p[0],p[2]]),feet:plan.route[0][1]});
      }
      paths.push({name:g.profile+'/front',points:g.approaches.frontRight.worldPoints.map(p=>[p.x,p.z]),feet:0});
      for(const path of paths)for(const fps of[10,60])for(const sprint of[false,true]) {
        const p=path.points;
        rows.push({name:path.name,fps,sprint,...withBoundedQaMocks(t,c=>replayKunning(c,w,[...p,...p.slice(0,-1).reverse()],{fps,sprint,startFeet:path.feet,recordFrames:true}))});
      }
    }
    if(process.env.EVIDENCE_OUT)fs.writeFileSync(process.env.EVIDENCE_OUT,JSON.stringify({scope:'actual limited component/FirstPerson; not full World or GPU',rows}));
    assert.equal(rows.length,24);
    for(const r of rows) {
      assert.ok(r.arrived,JSON.stringify({name:r.name,fps:r.fps,sprint:r.sprint,end:r.end}));
      assert.ok(r.frames.every(f=>Math.abs(f.feet-f.ground)<=.3),r.name);
    }
    console.log(JSON.stringify({routes:rows.length,frames:rows.reduce((n,r)=>n+r.frames.length,0),peak:Math.max(...rows.flatMap(r=>r.frames.map(f=>Math.abs(f.feet-f.ground))))}));
  } finally { z.kit.dispose(z.kit.root); }
});
