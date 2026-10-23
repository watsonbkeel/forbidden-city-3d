import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {axisFirewallBaseline} from './r58-axis-firewalls/baseline.mjs';
import {createTaiheEastFirewallProfile} from '../src/scene/palace/special/AxisFirewallProfiles.js';
import {buildTaiheEastFirewall} from '../src/scene/palace/special/AxisFirewalls.js';
import {PalaceBuilder} from '../src/scene/PalaceBuilder.js';
const inverse=await import('./r58-axis-firewalls/baseline-inverse.mjs').catch(()=>({}));
function install(W){const profile=createTaiheEastFirewallProfile({hall:W.builderData.halls[0],rect:W.builderData.rects[0],...W.builderData.options,linkWall:W.axis.items[13]});return buildTaiheEastFirewall(W.builder,W.scene.children[0],profile);}
const counts=W=>[W.scene.children[0].children.length,W.builder.colliders.length,W.builder.walkables.length,W.builder.ownedMaterials.length];
test('frozen pre-hook fixture verifies full geometry and both physical registries, not only bounds',()=>{
 const W=axisFirewallBaseline();assert.equal(W.inverseDelta?.frozenBaselineVerified,true);assert.equal(W.fullGeometryHash,'50fce1db91b0443e82a3fa775fc64c1b97507858ea55aa6d276fb185251d06fc');assert.equal(W.geometryHash,'74373988d8df7dadf19164381953d4782c234dcb5da4eeadb7f96949fe4e4d83');
});
test('exact installed wall inverse restores the frozen fixture and audits only 15 meshes, 6 colliders and 3 owned cap materials',()=>{
 assert.equal(typeof inverse.restoreFrozenAxisFirewallBaseline,'function');const W=axisFirewallBaseline(),before=counts(W),prior=[...W.builder.colliders];install(W);
 const audit=inverse.restoreFrozenAxisFirewallBaseline(W);assert.equal(audit.status,'REMOVED_VERIFIED_R58_EAST');assert.equal(audit.removed.meshes,15);assert.equal(audit.removed.colliders.length,6);assert.equal(audit.removed.ownedMaterials.length,3);assert.deepEqual(counts(W),before);assert.deepEqual(W.builder.colliders,prior);assert.equal(audit.after.fullGeometryHash,W.fullGeometryHash);assert.doesNotThrow(()=>install(W));
});
for(const sabotage of ['group-vertex','missing-collider','duplicate-collider','extra-child','unrelated-vertex'])test(`inverse refuses ${sabotage} before mutating the supplied fixture`,()=>{
 assert.equal(typeof inverse.restoreFrozenAxisFirewallBaseline,'function');const W=axisFirewallBaseline(),g=install(W);
 if(sabotage==='group-vertex')g.children[0].geometry.attributes.position.setX(0,g.children[0].geometry.attributes.position.getX(0)+.01);
 if(sabotage==='missing-collider')W.builder.colliders.pop();
 if(sabotage==='duplicate-collider')W.builder.colliders.push(W.builder.colliders.at(-1).clone());
 if(sabotage==='extra-child')g.add(new THREE.Mesh(new THREE.BoxGeometry(.01,.01,.01),new THREE.MeshStandardMaterial()));
 if(sabotage==='unrelated-vertex'){const mesh=W.scene.children[0].children.find(c=>c.isMesh),a=mesh.geometry.attributes.position;a.setX(0,a.getX(0)+.01);}
 const before=counts(W);assert.throws(()=>inverse.restoreFrozenAxisFirewallBaseline(W),/baseline|firewall|collider|geometry|frozen/i);assert.deepEqual(counts(W),before);assert.equal(g.parent,W.scene.children[0]);
});
test('baseline handles the production hook without disabling duplicate installation protection',()=>{
 assert.equal(typeof inverse.restoreFrozenAxisFirewallBaseline,'function');const prior=PalaceBuilder.prototype.buildComplex;
 PalaceBuilder.prototype.buildComplex=function(...args){const result=prior.apply(this,args);const g=this.scene.children.find(o=>o.name==='三台');if(g&&!g.getObjectByName('taihe-east-stepped-firewall')){
  // A test-only simulation of the exact integrator hook. Its retained controls
  // are independently frozen rather than obtained from a replacement scene.
  const hall=args[0].find(h=>h.name==='太和殿'),lh=8/3,setback=lh*1.6+1.2;
  const profile=createTaiheEastFirewallProfile({hall,rect:{hw:65-2*setback,z0:-54+2*setback,z1:23.5},layers:3,lh,setback,linkWall:{kind:'wall',from:[-65.5,-12.2],to:[-106.47,-12.2],h:7,gaps:[{at:-77,gate:'中左门'}]}});buildTaiheEastFirewall(this,g,profile);
 }return result;};
 try{const W=axisFirewallBaseline();assert.equal(W.inverseDelta.status,'REMOVED_VERIFIED_R58_EAST');assert.equal(W.scene.getObjectByName('taihe-east-stepped-firewall'),undefined);install(W);assert.throws(()=>install(W),/already installed/);}
 finally{PalaceBuilder.prototype.buildComplex=prior;}
});

test('explicit inverse is forbidden on an ordinary live-world-shaped object without the QA fixture marker',()=>{
 const W=axisFirewallBaseline(),g=install(W);delete W.qaAxisFirewallBaseline;const before=counts(W);
 assert.throws(()=>inverse.restoreFrozenAxisFirewallBaseline(W),/Only the explicit QA baseline/);assert.deepEqual(counts(W),before);assert.equal(g.parent,W.scene.children[0]);
});
test('ghost colliders without the exact firewall group cannot be silently included in the frozen baseline',()=>{
 const W=axisFirewallBaseline(),g=install(W);g.removeFromParent();const before=counts(W);
 assert.throws(()=>inverse.restoreFrozenAxisFirewallBaseline(W),/Frozen.*mismatch/);assert.deepEqual(counts(W),before);
});
