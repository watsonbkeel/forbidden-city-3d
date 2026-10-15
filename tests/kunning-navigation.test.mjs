import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
const jsonImports = registerHooks({ load(url, context, next) {
  return next(url, url.endsWith('.json') ? { ...context, importAttributes: { ...context.importAttributes, type: 'json' } } : context);
} });
const { Teleport } = await import('../src/ui/Teleport.js');
jsonImports.deregister();
import { PALACE_LAYOUT } from '../src/scene/Layout.js';
import { KUNNING_PROFILE } from '../src/scene/palace/special/KunningProfile.js';
import { TELEPORT } from '../src/config/constants.js';
const data=PALACE_LAYOUT.find(x=>x.name==='坤宁宫');
function target() {
  const t=Object.create(Teleport.prototype);
  t.targets=new Map([[data.name,{name:data.name,x:data.position.x,z:data.position.z,d:data.dimensions.depth}]]);
  t.zoneManager={getMapItems:()=>[{name:data.name,w:data.dimensions.width,d:data.dimensions.depth}]};
  return t;
}
test('Kunning teleport faces the actual east secondary doorway and retains map center',()=>{
  const g=target().geometryFor('坤宁宫'),door=KUNNING_PROFILE.portals[0].center;
  assert.equal(g.cx,0);assert.equal(g.cz,386.1);
  assert.equal(g.frontX,door[0]);assert.equal(g.frontZ,386.1+door[2]);
  assert.equal(g.entryProfile,KUNNING_PROFILE.profileId);
});
test('Kunning landing originates at shared retained stair approach, not centered doorway search',()=>{
  const t=target(),g=t.geometryFor('坤宁宫'),p=t.candidate(g,TELEPORT.DOOR_DISTANCE,0);
  const n=KUNNING_PROFILE.navigation.points[KUNNING_PROFILE.navigation.teleportApproach];
  assert.equal(p.x,n[0]);assert.equal(p.z,386.1+n[2]);
  assert.equal(p.lookAtX,KUNNING_PROFILE.portals[0].center[0]);
  assert.equal(p.lookAtZ,386.1+KUNNING_PROFILE.portals[0].center[2]);
  assert.ok(g.approachPoints.length>=5);
  assert.equal(g.approachPoints.at(-1).id,'doorInside');
});
test('Kunning refuses an obstructed profile approach instead of searching unrelated lateral landings',()=>{
  const t=target();let calls=0;t.isSafe=()=>{calls++;return false;};
  assert.equal(t.resolveLanding('坤宁宫'),null);assert.equal(calls,1);
});

const { buildWorld } = await import('./lib/world.mjs');
const W = await buildWorld();
test('real Kunning B geometry accepts supported stair-to-door teleport approach',()=>{
  const t=target();t.collisionManager=W.cm;
  const p=t.resolveLanding('坤宁宫');
  assert.ok(p);assert.equal(p.y,5);assert.equal(p.approachVerified,true);
  assert.equal(p.fallback,false);assert.ok(p.walk>15);
});
test('missing actual Kunning south ramp rejects teleport; box rescue cannot bless the landing',()=>{
  const t=target();t.collisionManager=W.cm;const old=W.cm.walkables;
  const affected=old.filter(w=>w.type==='ramp' && w.axis==='z' && w.minZ>=370 && w.maxZ<=376 && w.minX<0 && w.maxX>0 && w.y0===6.9375 && w.y1===5);
  assert.equal(affected.length,1,'identify actual inherited southern plinth ramp');
  W.cm.walkables=old.filter(w=>!affected.includes(w));
  try { assert.equal(t.resolveLanding('坤宁宫'),null); }
  finally {W.cm.walkables=old;}
});
test('a blocked true entrance rejects teleport rather than choosing a false central bay',()=>{
  const t=target();t.collisionManager=W.cm;
  const door=KUNNING_PROFILE.portals[0].center;
  W.cm.addCollider(new W.THREE.Box3(new W.THREE.Vector3(door[0]-1.5,7.1,386.1+door[2]-.2),new W.THREE.Vector3(door[0]+1.5,10,386.1+door[2]+.2)),'test-blocked-kunning');
  try {assert.equal(t.resolveLanding('坤宁宫'),null);}
  finally {W.cm.removeByTag('test-blocked-kunning');}
});

const { execFileSync } = await import('node:child_process');
const { default: baselineFixed } = await import('./fixtures/v5-fixed-routes.json',{with:{type:'json'}});
const fixed=execFileSync(process.execPath,['tests/stepwalk.cjs','60,10','0,1','all'],{env:{...process.env,DUMP:'1'},encoding:'utf8'}).trim().split('\n').map(line=>{const p=line.indexOf('[[');return{name:line.slice(0,p).trim(),pts:JSON.parse(line.slice(p))};});
const routePoints=key=>KUNNING_PROFILE.navigation.routes[key].map(id=>{const [x,,z]=KUNNING_PROFILE.navigation.points[id];return[x+data.position.x,z+data.position.z];});
test('only Kunning entry suffix changes; original Qianqing/Jiaotai approach remains exact',()=>{
 const name='乾清宫→交泰殿→坤宁宫',old=baselineFixed.find(r=>r.name===name).pts,current=fixed.find(r=>r.name===name).pts;
 assert.deepEqual(current,[...old.slice(0,-1),...routePoints('entry')]);
 assert.equal(current.at(-1)[0],KUNNING_PROFILE.portals[0].center[0]);
});
test('Kunning exits through true south doorway and end passage while original garden suffix remains exact',()=>{
 const name='坤宁宫→御花园→神武门',old=baselineFixed.find(r=>r.name===name).pts,current=fixed.find(r=>r.name===name).pts;
 assert.deepEqual(current,[...routePoints('eastBypass'),...old.slice(1)]);
 assert.deepEqual(current[0],fixed.find(r=>r.name==='乾清宫→交泰殿→坤宁宫').pts.at(-1));
 assert.equal(current[1][0],KUNNING_PROFILE.portals[0].center[0]);
});
