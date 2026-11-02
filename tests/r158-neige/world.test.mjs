import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {CourtKit} from '../../src/scene/palace/kit.js';import {buildNeigeCourt} from '../../src/scene/palace/special/NeigeCourt.js';
import {buildR52World} from '../lib/r52-world.mjs';import {createActualLibrary} from '../r158-cumulative-1600/library.mjs';import {replayKunning} from '../lib/kunning-walk.mjs';import {withBoundedQaMocks} from '../lib/bounded-qa-clock.mjs';import {southernRoutes} from './south-routes.mjs';import {PLAYER} from '../../src/config/constants.js';
const zone=JSON.parse(fs.readFileSync(new URL('../../data/zones/outer-east.json',import.meta.url)));
// Only QA's before-finish hook installs the isolated candidate. Production
// ZoneBase, ZoneManager, actual TextureLibrary and controller remain unchanged.
test('candidate in normal World: 8 existing-road round trips; original route diagnostics match exact baseline; no pre-existing entity changed',async t=>{
 assert.ok(process.env.BASELINE_REPORT,'Run baseline-world.test.mjs with EVIDENCE_OUT first; retain its diagnostic failures.');
 const baseline=JSON.parse(fs.readFileSync(process.env.BASELINE_REPORT)),original=CourtKit.prototype.finish;let hookCalls=0,mutation=null;
 CourtKit.prototype.finish=function(...args){if(this.root.name==='outer-east'){
  hookCalls++;const fields=['colliders','walkables','rooms','mapItems','owned'],before=Object.fromEntries(fields.map(k=>[k,[...this[k]]]));const children=[...this.root.children];
  const candidate=buildNeigeCourt(this,zone);
  for(const k of fields)for(let i=0;i<before[k].length;i++)assert.equal(this[k][i],before[k][i],k+' identity');for(let i=0;i<children.length;i++)assert.equal(this.root.children[i],children[i],'old child');
  assert.equal(this.walkables.length,before.walkables.length);assert.equal(this.rooms.length,before.rooms.length);assert.equal(this.root.children.length,children.length+1);
  mutation={before:Object.fromEntries(fields.map(k=>[k,before[k].length])),after:Object.fromEntries(fields.map(k=>[k,this[k].length])),triangleOwners:candidate.meta.triangleOwners};
 }return original.apply(this,args);};
 let w;const report={scope:'ACTUAL_CPU_WORLD_QA_BEFORE_FINISH_HOOK_NOT_PRODUCTION_HOOK_OR_GPU',rows:[],inherited:[]};
 try{
  w=await buildR52World({loadAll:false,initialPosition:{x:-161,z:-365},createLibrary:createActualLibrary});CourtKit.prototype.finish=original;
  assert.equal(hookCalls,1);report.mutation=mutation;assert.equal(w.mapItems.filter(x=>x.name==='内阁大堂').length,1);
  const entry=w.zoneManager.loaded.get('outer-east')??w.zoneManager.prebuilt.get('outer-east');assert.equal(entry.data.group.userData.architecture.filter(x=>x.id==='neige-main-court').length,1);
  const points=[[-132.72,-300.3],[-140,-300.3],[-140,-388],[-161,-388],[-161,-383],[-161,-380],[-161,-375],[-161,-371.5],[-161,-370.1],[-161,-367],[-161,-364],[-161,-367],[-161,-370.1],[-161,-371.5],[-161,-375],[-161,-380],[-161,-383],[-161,-388],[-140,-388],[-140,-300.3],[-132.72,-300.3]];
  for(const fps of[10,60])for(const sprint of[false,true])for(const backward of[false,true]){
   const r=withBoundedQaMocks(t,c=>replayKunning(c,w,points,{fps,sprint,backward,startFeet:0,recordFrames:true}));report.rows.push({fps,sprint,backward,...r});assert.equal(r.arrived,true,JSON.stringify({...r,frames:undefined}));assert.ok(r.maxFeet<.03&&r.minFeet>-.01);
   for(const p of r.frames){assert.ok(Math.abs(p.feet-p.ground)<.03);assert.equal(w.cm.checkCollision(new w.THREE.Vector3(p.x,p.feet+PLAYER.HEIGHT+.025,p.z),.5),false,'body penetrated visible solid');}
  }
  for(const r of southernRoutes())for(const fps of[10,60])for(const sprint of[false,true]){
   const actual={route:r.name,fps,sprint,...withBoundedQaMocks(t,c=>replayKunning(c,w,r.pts,{fps,sprint,startFeet:0}))};report.inherited.push(actual);
   const old=baseline.rows.find(x=>x.route===r.name&&x.fps===fps&&x.sprint===sprint);assert.ok(old,'complete baseline row');assert.equal(actual.arrived,old.arrived,'existing diagnostic outcome changed');assert.deepEqual(actual.stuckAt,old.stuckAt);for(let i=0;i<3;i++)assert.ok(Math.abs(actual.end[i]-old.end[i])<1e-7,'existing endpoint changed');
  }
  report.summary={newArrived:report.rows.filter(r=>r.arrived).length,newTotal:report.rows.length,inheritedArrived:report.inherited.filter(r=>r.arrived).length,inheritedTotal:report.inherited.length,inheritedIdentical:true};console.log(JSON.stringify(report.summary));
 }finally{CourtKit.prototype.finish=original;fs.writeFileSync(process.env.EVIDENCE_OUT??'/tmp/r158-neige-candidate-world.json',JSON.stringify(report,null,2));w?.dispose();}
});
