// Proposed read-only production subset. Not imported/executed before review.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {cleanupResources} from './cleanup-resources.mjs';
import {ZoneBase} from "../../src/scene/zones/ZoneBase.js";
import {ciningGateGeometry} from "../../src/scene/palace/special/CiningGate.js";
import {buildYuhuaGe} from "../../src/scene/palace/special/YuhuaGe.js";
import {buildYuhuaEastLou} from "../../src/scene/palace/special/YuhuaEastLou.js";
import {buildYuhuaWestLou} from "../../src/scene/palace/special/YuhuaWestLou.js";
export function constructSubset(library){
 const outerZone=JSON.parse(fs.readFileSync(new URL("../../data/zones/outer-west.json",import.meta.url)));
 const westZone=JSON.parse(fs.readFileSync(new URL("../../data/zones/west-six.json",import.meta.url)));
 const builders=[],calls=[],gateWidths=[];
 const blockFull=b=>{b.build=()=>{throw Error('Full zone build forbidden in H37 subset');};b.kit.finish=()=>{throw Error('finish/hook sequence forbidden in H37 subset');};return b;};
 try{
  const outer=blockFull(new ZoneBase(library,outerZone));builders.push(outer);
  // The south gate is remote at155.7. Its public pure validator is the same
  // width source used by buildCiningGate; do not construct that remote hall.
  const cining=ciningGateGeometry(outerZone.items[22],outerZone.id);
  outer.gateWidths.set(outerZone.items[22].name,cining.width);
  gateWidths.push({zone:'outer-west',item:22,name:outerZone.items[22].name,width:cining.width,source:'ciningGateGeometry public pure validation; same width returned by buildCiningGate',gateBodyGenerated:false});
  outer.buildCourtWalls(outerZone.items[23]);calls.push(['outer-west','buildCourtWalls',23]);
  for(const i of[26,27,28]){assert.equal(outerZone.items[i].kind,'hall');outer.buildHall(outerZone.items[i]);calls.push(['outer-west','buildHall',i]);}
  const west=blockFull(new ZoneBase(library,westZone));builders.push(west);
  assert.equal(westZone.items[28].name,'太极门');
  const width=west.buildGate(westZone.items[28]);west.gateWidths.set(westZone.items[28].name,width);
  calls.push(['west-six','buildGate',28]);gateWidths.push({zone:'west-six',item:28,name:westZone.items[28].name,width,source:'actual ZoneBase.buildGate return',gateBodyGenerated:true});
  west.buildCourtWalls(westZone.items[29]);calls.push(['west-six','buildCourtWalls',29]);
  const built=west.buildHall(westZone.items[33]);calls.push(['west-six','buildHall',33]);
  assert.ok(built?.f,'R63 production return frame required');
  // All inventory/source semantics are produced by buildHall's real finish
  // branch, not a hand-copied CourtKit.hall or renamed anonymous frame.
  const r63Frame=built.f;
  const yuhua=buildYuhuaGe(outer.kit,outerZone);calls.push(['outer-west','buildYuhuaGe','named-hook-function-only']);
  buildYuhuaEastLou(outer.kit,outerZone);calls.push(['outer-west','buildYuhuaEastLou','named-hook-function-only']);
  buildYuhuaWestLou(outer.kit,outerZone);calls.push(['outer-west','buildYuhuaWestLou','named-hook-function-only']);
  assert.ok(!calls.some(([z,m,i])=>z==='west-six'&&i===3));
  const forbidden=[];for(const b of builders)b.kit.root.traverse(m=>{const s=m.userData.structure;if(s&&(/tishun-south-beam|yanxi-rear-ear-hall|yangxin-companion/.test(String(s.id))||s.sourceObjectId==='FC-784C20C066'))forbidden.push(s.id);});
  assert.deepEqual(forbidden,[]);
  return {builders,kits:builders.map(b=>b.kit),outerZone,westZone,yuhua,r63Frame,calls,gateWidths,
   dispose(options){return cleanupResources(builders,library,options);}};
 }catch(e){try{e.subsetCleanup=cleanupResources(builders,library);}catch(q){e.subsetCleanup={success:false,error:q.message};}throw e;}
}
