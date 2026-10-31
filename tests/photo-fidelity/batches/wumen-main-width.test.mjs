import test from 'node:test';import assert from 'node:assert/strict';
import {wumenTowerGeometry} from '../../../src/scene/palace/special/GateTowerProfiles.js';
import {GATE_TOWER_MEASUREMENTS} from '../../../src/scene/palace/special/GateTowerMeasurements.js';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-10,`${a} != ${b}`);
test('Wumen main actual common axes fit the reviewed 1.43 centre ratio inside the retained envelope',()=>{
 const p=wumenTowerGeometry(),d=p.xAxes.slice(1).map((x,i)=>x-p.xAxes[i]);assert.equal(d.length,9);near(d[4]/d[0],1.43);near(p.xAxes[0],-30.025);near(p.xAxes[9],30.025);
 for(let i=0;i<10;i++)near(p.xAxes[i],-p.xAxes[9-i]);for(let i=0;i<9;i++)if(i!==4)near(d[i],d[0]);
 assert.equal(p.columns.length,52);for(const c of p.columns)assert.ok(p.xAxes.includes(c.x),'all inner AND outer columns share real axes');
 assert.equal(p.metadata.horizontalGrid.widthBaySpacing,'SIMPLIFIED_SOURCE_RATIO_WITHIN_RETAINED_ENVELOPE_NOT_SURVEYED');
 const r=p.metadata.horizontalGrid.widthRegistration;assert.equal(r.centreToSide,1.43);assert.equal(r.equalSideBaysAreSimplification,true);assert.equal(r.columnAxisTotalSurveyed,false);
 assert.equal(GATE_TOWER_MEASUREMENTS.wumen.grid.status,'OFFICIAL_OVERALL_DIMENSIONS_AXIS_ENDPOINTS_UNSPECIFIED');
});
import fs from 'node:fs';
import {captureGate} from '../../lib/gate-tower-fixture.mjs';
import {verifyWidthContract,expectedWidthAxes} from '../../lib/wumen-side-portal-prior-comparison.mjs';
const before=JSON.parse(fs.readFileSync(new URL('../../fixtures/r157-wumen-main-width/before-411214.json',import.meta.url))).snapshot;
test('actual main shell changes only the 88 authorized geometric parts and 88 actual collider bounds',()=>{const c=captureGate();assert.deepEqual(verifyWidthContract(c,before),{meshCount:105,changedGeometry:88,localColliders:98,changedColliders:88});c.builder.dispose();});
test('bounded width contract rejects target/nontarget visibility geometry UV physical and support drift',()=>{
 for(const mutate of [
 c=>{c.tower.visible=false;},
 c=>{c.tower.layers.set(3);},
 c=>{c.group.renderOrder=2;},
 c=>{c.tower.matrixAutoUpdate=false;},
 c=>{c.tower.children.find(m=>m.userData.gatePart==='interior-column').layers.set(3);},
 c=>{c.tower.children.find(m=>m.userData.gatePart==='outer-column'&&Math.abs(m.position.x)<29).position.x+=.1;},
 c=>{c.tower.children.find(m=>m.userData.gatePart==='facade-wall').visible=false;},
 c=>{const u=c.tower.children.find(m=>m.userData.gatePart==='closed-lattice-panel').geometry.attributes.uv;u.setX(0,u.getX(0)+.1);},
 c=>{c.tower.children.find(m=>m.userData.gatePart==='interior-floor').position.y+=.1;},
 c=>{c.tower.userData.colliders[0].max.x+=.01;},
 c=>{c.builder.walkables.pop();},
 c=>{c.tower.userData.structure.horizontalGrid.widthRegistration.columnAxisTotalSurveyed=true;},
 ]){const c=captureGate();mutate(c);assert.throws(()=>verifyWidthContract(c,before));c.builder.dispose();}
});
test('all nine actual facade midpoint rays retain only the central architectural preview route',()=>{
 const c=captureGate();c.tower.updateMatrixWorld(true);
 for(const sign of [-1,1])for(let i=0;i<9;i++){
  const x=(expectedWidthAxes[i]+expectedWidthAxes[i+1])/2,z=sign*11.2;
  const ray=new c.THREE.Raycaster(c.tower.localToWorld(new c.THREE.Vector3(x,1,z)),new c.THREE.Vector3(0,0,-sign),0,22.4);
  assert.equal(ray.intersectObject(c.tower,true).length>0,i!==4,`side${sign} bay${i+1}`);
 }c.builder.dispose();
});
import {priorWidthComparison} from '../../lib/wumen-side-portal-prior-comparison.mjs';
import {captureRightLeaf,retainedSignature,digest} from '../../lib/wumen-right-leaf-fixture.mjs';
const closed=JSON.parse(fs.readFileSync(new URL('../../fixtures/r157-wumen-main-width/closed-outside-411214.json',import.meta.url)));
const originalGate=JSON.parse(fs.readFileSync(new URL('../../fixtures/r157-wumen-right-leaf/retained-be395.json',import.meta.url)));
test('both real lower-leaf poses keep the original 723 recorded object and physical contract after ONLY authenticated main-width normalization',()=>{
 assert.equal(digest(closed.retained),digest(originalGate.closed),'pinned predecessor closes original unchanged gold');
 for(const open of [true,false]){
  const c=captureRightLeaf(open);c.tower=c.group.children.find(o=>o.userData.structure?.id==='axis/wumen-upper-tower');const state=open?before:{...before,outside:closed.outside};
  const raw=digest(retainedSignature(c)),comparison=priorWidthComparison(c,state);
  try{assert.equal(digest(retainedSignature(comparison.view)),digest(originalGate[open?'open':'closed']),'original recorded geometry/material/metadata/physics/signature fields');assert.equal(digest(retainedSignature(c)),raw,'actual full signature unmodified');assert.equal(comparison.view.builder.checkCollision,undefined);}finally{comparison.dispose();c.builder.dispose();}
 }
});
test('closed-pose non-main metadata and leaf geometry drift cannot be hidden by the main-only comparison',()=>{
 for(const mutate of [c=>{c.group.getObjectByName('wumen-lower-door/east-yemen').userData.forged=true;},c=>{const m=c.group.getObjectByName('wumen-lower-door/east-yemen').children[0].children[0],a=m.geometry.attributes.position;a.setX(0,a.getX(0)+.1);}]){
  const c=captureRightLeaf(false);c.tower=c.group.children.find(o=>o.userData.structure?.id==='axis/wumen-upper-tower');const state={...before,outside:closed.outside};const good=priorWidthComparison(c,state);good.dispose();mutate(c);
  // Either the strict non-target check or the preserved 723-record oracle must reject.
  let rejected=false,view;try{view=priorWidthComparison(c,state);rejected=digest(retainedSignature(view.view))!==digest(originalGate.closed);}catch{rejected=true;}finally{view?.dispose();c.builder.dispose();}assert.equal(rejected,true);
 }
});
