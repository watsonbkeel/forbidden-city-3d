import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {southernRoutes} from './south-routes.mjs';
import {buildR52World} from '../lib/r52-world.mjs';import {createActualLibrary} from '../r158-cumulative-1600/library.mjs';import {replayKunning} from '../lib/kunning-walk.mjs';import {withBoundedQaMocks} from '../lib/bounded-qa-clock.mjs';
test('current be5393 World: proposed Neige footprint is clear and inherited southern approaches remain usable',async t=>{
 const w=await buildR52World({loadAll:false,initialPosition:{x:-161,z:-365},createLibrary:createActualLibrary});
 const report={base:'be5393cb62',scope:'BASELINE ONLY — no Neige implementation installed',rows:[]};
 try{
  const box=new w.THREE.Box3(new w.THREE.Vector3(-176,.04,-386),new w.THREE.Vector3(-146,11,-357));
  report.occupants=w.cm.queryBox(box).filter(c=>c.box.intersectsBox(box)).map(c=>({bounds:{min:c.box.min.toArray(),max:c.box.max.toArray()},zone:c.zoneId??c.zone??null}));
  assert.equal(report.occupants.length,0,'proposed bound must not intersect an existing solid');
  report.water=[];for(let x=-176;x<=-146;x+=2)for(let z=-386;z<=-357;z+=2){const ok=w.cm.checkRiverCrossing(new w.THREE.Vector3(x,1.72,z),.5,null,.02);if(!ok)report.water.push([x,z]);}assert.equal(report.water.length,0);
  const routes=southernRoutes().filter(r=>['协和门→文华门→文华殿内','协和门→东华门→出宫'].includes(r.name));
  assert.equal(routes.length,2);
  for(const r of routes)for(const fps of[10,60])for(const sprint of[false,true]){const row={route:r.name,fps,sprint,...withBoundedQaMocks(t,c=>replayKunning(c,w,r.pts,{fps,sprint,startFeet:0}))};report.rows.push(row);}
  assert.deepEqual(report.rows.filter(r=>!r.arrived).map(({frames,...r})=>r),[],'original-route diagnostic: failure remains a baseline failure, not Neige regression');
 }finally{fs.writeFileSync(process.env.EVIDENCE_OUT??'/tmp/r158-neige-baseline-world.json',JSON.stringify(report,null,2));w.dispose();}
});
