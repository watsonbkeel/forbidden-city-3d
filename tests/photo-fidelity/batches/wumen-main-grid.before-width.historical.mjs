import test from 'node:test';
import assert from 'node:assert/strict';
import {wumenTowerGeometry} from '../../../src/scene/palace/special/GateTowerProfiles.js';
import {buildGateTowerShell} from '../../../src/scene/palace/special/GateTowerShell.js';
import {captureGate} from '../../lib/gate-tower-fixture.mjs';
const {THREE,lib}=captureGate();
test('Wumen has six source-bounded depth axes, not the four-row legacy placeholder',()=>{
 const p=wumenTowerGeometry();
 assert.deepEqual([...new Set(p.columns.map(c=>c.z))].sort((a,b)=>a-b),[-12.5,-9.6,-3.2,3.2,9.6,12.5]);
 assert.equal(p.columns.length,52);
 assert.equal(p.metadata.horizontalGrid.depthBays,5);
 assert.equal(p.metadata.horizontalGrid.completeTimberFrame,false);
 assert.equal(p.metadata.horizontalGrid.widthBaySpacing,'RETAINED_EQUAL_DIVISION_NOT_SURVEYED');
 for(const c of p.columns.filter(c=>c.kind==='interior-column'))assert.ok(p.xAxes.slice(1,-1).includes(c.x));
});
test('Wumen renders nine independently identified facade bays on each side, with only its retained central preview opening',()=>{
 const p=wumenTowerGeometry(),body=buildGateTowerShell(lib,p);
 for(const side of ['south','north']){
  assert.ok(Array.isArray(p.facadeBays),'independent facade bays are missing');
  assert.equal(p.facadeBays.filter(b=>b.side===side).length,9);
  const tagged=body.children.filter(m=>m.userData.facadeBayId?.startsWith(`wumen-main-${side}-`));
  assert.equal(new Set(tagged.map(m=>m.userData.facadeBayId)).size,9);
  assert.equal(p.facadeBays.filter(b=>b.side===side&&b.open).length,1);
  for(const b of p.facadeBays.filter(b=>b.side===side))assert.equal(b.leafCount,'UNKNOWN');
 }
 assert.equal(body.children.filter(m=>m.userData.gatePart==='open-lattice-leaf').length,4);
 assert.equal(p.metadata.interior.fixedDecoration,'UNKNOWN_NOT_RECONSTRUCTED');
 assert.equal(p.metadata.interior.temporaryExhibitionReproduced,false);
});
test('Wumen every individual noncentral bay remains visibly closed while the existing central doors remain open',()=>{
 const p=wumenTowerGeometry(),body=buildGateTowerShell(lib,p);body.updateMatrixWorld(true);
 for(const sign of [-1,1])for(let i=0;i<9;i++){
  const x=(i-4)*p.width/9;
  const ray=new THREE.Raycaster(new THREE.Vector3(x,1,sign*11.2),new THREE.Vector3(0,0,-sign),0,22.4);
  assert.equal(ray.intersectObject(body,true).length>0,i!==4,`side ${sign} bay ${i+1}`);
 }
});

import fs from 'node:fs';
test('the visitor-facing source note discloses incomplete timber frame and unverified interior',()=>{
 const ui=fs.readFileSync(new URL('../../../src/ui/SettingsMenu.js',import.meta.url),'utf8');
 assert.match(ui,/id="wumen-main-grid-note"/);assert.match(ui,/六条纵深柱轴/);assert.match(ui,/完整木构架/);assert.match(ui,/室内固定装修仍未知/);
});

test('the six-axis topology does not claim enclosure columns are fully exposed through retained walls',()=>{
 const p=wumenTowerGeometry();assert.equal(p.metadata.horizontalGrid.enclosureColumnVisibility,'OCCLUDED_BY_RETAINED_WALL_THICKNESS_NOT_FULL_VISUAL_RECONSTRUCTION');
 for(const c of p.columns.filter(c=>Math.abs(c.z)===p.enclosure.wallAxisZ))assert.ok(c.bottomRadius<p.T/2);
});
