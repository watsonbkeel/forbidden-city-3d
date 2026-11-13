import test from 'node:test';import assert from 'node:assert/strict';
import {loadZoneJsons,gateGeom} from '../lib/world.mjs';
const module=await import('../lib/dedicated-gate-route.mjs').catch(e=>{if(e.code==='ERR_MODULE_NOT_FOUND')return {};throw e;});
const items=loadZoneJsons().find(z=>z.json.id==='outer-west').json.items;
for(const [profile,center,centers]of [['cining-entry',[222.2,155.7],[-25.3/5,0,25.3/5]],['shouan-entry',[277,362],[-8,0,8]]])test(profile+' actual source all portals and both direction samples',()=>{
 assert.equal(typeof module.dedicatedGateRoute,'function','explicit real-profile adapter required');
 const item=items.find(x=>x.gateProfile===profile),g=gateGeom(item),before=JSON.stringify(g.profile);
 assert.equal(g.profile.toWorld,undefined);assert.equal(g.profile.ramps,undefined);
 for(const u of centers){const a=module.dedicatedGateRoute(g,u);assert.deepEqual(a.center,[center[0]+u,center[1]]);assert.deepEqual(a.passage(-1),a.passage(1).toReversed());assert.ok(a.passage(1).every(p=>p[0]===center[0]+u));
  const local=a.passage(1).map(p=>+(p[1]-center[1]).toFixed(3));
  if(profile==='cining-entry'){for(const z of[-5.235,-5.075,-4.915,-4.755,-4.595,0,1.265,4.595])assert.ok(local.includes(z));assert.equal(a.platformY,.45);assert.equal(a.front,5.235);assert.equal(a.rear,4.595);}
  else if(u===0){for(const z of[-2.85,-2.55,-2.25,-1.95,-1.65,0,1.65,1.95,2.25,2.55,2.85,4.3,4.6,4.9,6,7.1,7.4,7.7])assert.ok(local.includes(z));assert.equal(a.platformY,.36);assert.equal(a.rear,7.7);}
  else{assert.deepEqual(local,[-1.3,0,1.3]);assert.equal(a.platformY,.1);assert.equal(a.front,1.3);assert.equal(a.rear,1.3);}
 }
 assert.equal(JSON.stringify(g.profile),before);
 assert.throws(()=>module.dedicatedGateRoute(g,123),/portal/);
});
test('legacy no profile remains generic; unsupported special identity rejects',()=>{assert.equal(typeof module.dedicatedGateRoute,'function');assert.equal(module.dedicatedGateRoute({}),null);const g=gateGeom(items.find(x=>x.gateProfile==='cining-entry'));assert.throws(()=>module.dedicatedGateRoute({...g,profile:{...g.profile,x:0}},0),/identity/);assert.throws(()=>module.dedicatedGateRoute({...g,dir:[1,0]},0),/identity/);});
