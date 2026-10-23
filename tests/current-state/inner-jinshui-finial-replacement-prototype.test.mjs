import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import {finialFixture,replayFinialJump} from '../lib/r58-bridge-contact-probe.mjs';
import {replaceSideShaftTopsLocally} from '../lib/r58-finial-replacement-prototype.mjs';
const out='reports/r58-a-bridge-replacement-prototype';fs.mkdirSync(out,{recursive:true});
for(const fps of [10,60])test(`height-preserving local replacement exposes inherited support gap at ${fps}Hz`,t=>{
 const W=finialFixture(),p=W.g.userData.innerJinshuiSideFinials.placements.find(p=>p.bridgeId==='inner-jinshui:bridge-2'&&p.side===-1&&p.postIndex===0);
 const before=JSON.stringify({c:W.r.colliders,w:W.r.walkables}),shape=replaceSideShaftTopsLocally(W);assert.equal(JSON.stringify({c:W.r.colliders,w:W.r.walkables}),before);
 const result=replayFinialJump(t,W,p,fps);assert.equal(result.end.airborne,false);assert.ok(result.actualCapSurfaceY!==null);assert.ok(result.penetration<-.10,'retained collider now holds feet above the shorter replacement, not true contact');
 fs.writeFileSync(`${out}/jump-${fps}hz.json`,JSON.stringify({shape,...result,conclusion:'INHERITED_SUPPORT_GAP_NOT_CONTACT_ACCEPTANCE'},null,2)+'\n');
});
test('all88 replacement tips preserve old total height while inherited rail envelopes remain measurable',()=>{
 const W=finialFixture(),shape=replaceSideShaftTopsLocally(W),rows=W.g.userData.innerJinshuiSideFinials.placements.map(p=>{
  const hit=new THREE.Raycaster(new THREE.Vector3(p.x,p.y+1,p.z),new THREE.Vector3(0,-1,0),0,2).intersectObject(W.g,true)[0];assert.ok(hit);assert.ok(Math.abs(hit.point.y-p.y)<1e-5);
  const support=W.cm.supportHeight(p.x,p.z,p.y+.5);return{bridgeId:p.bridgeId,side:p.side,postIndex:p.postIndex,actualTip:hit.point.y,oldRailSupport:support,gap:support-hit.point.y};
 });
 assert.equal(rows.length,88);assert.ok(rows.some(r=>r.gap>.1));assert.ok(rows.some(r=>Math.abs(r.gap)<1e-5));
 fs.writeFileSync(`${out}/all88-envelope.json`,JSON.stringify({shape,rows,maxGap:Math.max(...rows.map(r=>r.gap)),minGap:Math.min(...rows.map(r=>r.gap)),contactCountWithin5mm:rows.filter(r=>Math.abs(r.gap)<.005).length},null,2)+'\n');
});

test('prototype only changes retained side-shaft top vertices and cap Y matrices',()=>{
 const W=finialFixture(),meshes=[];W.r.group.traverse(m=>{if(m.isMesh)meshes.push({mesh:m,before:Array.from(m.geometry.attributes.position.array)});});
 const capPositions=Array.from(W.g.children[0].geometry.attributes.position.array),profile=JSON.stringify(W.r.profile),physics=JSON.stringify({c:W.r.colliders,w:W.r.walkables}),matrices=Array.from(W.g.children[0].instanceMatrix.array);
 replaceSideShaftTopsLocally(W);let count=0;
 for(const {mesh,before} of meshes){const after=mesh.geometry.attributes.position.array;for(let i=0;i<before.length;i++)if(before[i]!==after[i]){assert.equal(i%3,1);assert.ok(Math.abs(before[i]-after[i]-.22)<2e-7);count++;}}
 assert.equal(count,88*18);assert.deepEqual(Array.from(W.g.children[0].geometry.attributes.position.array),capPositions);assert.equal(JSON.stringify(W.r.profile),profile);assert.equal(JSON.stringify({c:W.r.colliders,w:W.r.walkables}),physics);
 for(let i=0;i<matrices.length;i++){const difference=matrices[i]-W.g.children[0].instanceMatrix.array[i];assert.ok(Math.abs(difference-(i%16===13?.22:0))<2e-7);}
});
