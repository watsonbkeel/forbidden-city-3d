import fs from 'node:fs';
import assert from 'node:assert/strict';
import {mock} from 'node:test';
import {registerHooks} from 'node:module';
import {triangleOpenIntersection} from '../r96-emperor-independent/clip-oracle.mjs';
const hook=registerHooks({load(u,c,n){return n(u,u.endsWith('.json')?{...c,importAttributes:{...c.importAttributes,type:'json'}}:c)}});
const {compoundFixture}=await import('../r115-palace-group-cumulative/tests/lib/r63-west-rear-compound-fixture.mjs');
const {replayTerrace}=await import('../r115-palace-group-cumulative/tests/lib/terrace-walk.mjs');
const W=compoundFixture(true);hook.deregister();
const THREE=W.THREE,t={mock};
const oldPoints=[[110.5,440],[110.5,442.5],[94.5,442.5],[94.5,448.7],[97.5,448.7],[91.5,448.7],[94.5,448.7],[94.5,442.5],[110.5,442.5],[110.5,440],[110.5,442.5],[94.5,442.5],[94.5,448.7],[94.5,442.5],[110.5,442.5],[110.5,440]];
// The supplied route's first doorway arrival is retained. Visit the same west
// room via its real lower side opening, then both source-backed curved openings,
// and return through the unchanged main entrance to the same court endpoint.
const points=[[110.5,440],[110.5,442.5],[94.5,442.5],[94.5,448.7],[94.5,446.3],[98.55,446.3],[98.37,453.8],[101.11,453.8],[101.11,451.4],[98.55,451.4],[98.55,446.3],[94.5,446.3],[94.5,448.7],[91.5,448.7],[94.5,448.7],[94.5,442.5],[110.5,442.5],[110.5,440]];
const triangles=[];W.scene.updateMatrixWorld(true);W.scene.traverse(m=>{if(!m.isMesh||!m.material.name?.startsWith('lijing_')||m.material.name==='lijing_rug')return;const p=m.geometry.attributes.position,idx=m.geometry.index;for(let i=0;i<(idx?.count??p.count);i+=3){const v=[0,1,2].map(j=>new THREE.Vector3().fromBufferAttribute(p,idx?idx.getX(i+j):i+j).applyMatrix4(m.matrixWorld));triangles.push({v,b:new THREE.Box3().setFromPoints(v),material:m.material.name,tri:i/3})}});
function body(x,z,feet=.45){return new THREE.Box3(new THREE.Vector3(x-.5,feet,z-.5),new THREE.Vector3(x+.5,feet+1.7,z+.5))}
function hits(b){return triangles.filter(tr=>tr.b.intersectsBox(b)&&triangleOpenIntersection(tr.v,b).penetrates).map(({material,tri})=>({material,tri}))}
const src=W.builder.kit.root;src.updateMatrixWorld(true);const blockers=[];src.traverse(m=>{if(!m.isMesh||!['entry-side-wall','long-console','console-leg'].includes(m.name))return;m.geometry.computeBoundingBox();const b=m.geometry.boundingBox.clone().applyMatrix4(m.matrixWorld);blockers.push({role:m.name,min:b.min.toArray(),max:b.max.toArray()})});
const target=body(97.5,448.7),targetHits=hits(target),rows=[];
for(const route of ['original','legal-room-entry'])for(const fps of[10,60])for(const backward of[false,true])for(const sprint of[false,true]){
 const r=replayTerrace(t,W,route==='original'?oldPoints:points,{fps,backward,sprint,recordFrames:true});
 let contactFrames=0,first=null;for(let i=0;i<r.frames.length;i++){const p=r.frames[i];if(p.x<96||p.x>104||p.z<444||p.z>455)continue;const h=hits(body(p.x,p.z,p.feet));if(h.length){contactFrames++;first??={frame:i,pose:p,hits:h.slice(0,8)}}}
 const endPhysical=r.frames.at(-1); rows.push({route,fps,backward,sprint,...r,finishedRoomPenetrationFrames:contactFrames,firstFinishedRoomPenetration:first,endPhysical});
}
const out={scope:'Same frozen R63 original route replayed without editing original test/assertions, and separate lawful existing-opening route. Not a blanket legacy-test waiver.',triangles:triangles.length,oldPoints,legalRoomPoints:points,sourceBlockers:blockers,oldTarget:{x:97.5,z:448.7,feet:.45,finishedTriangleHits:targetHits},rows};
fs.writeFileSync('r115-scope-independent/r63-room-route-diagnostic-2016.json',JSON.stringify(out));
console.log(JSON.stringify({triangles:triangles.length,sourceBlockers:blockers,targetHitCount:targetHits.length,rows:rows.map(({frames,driver,...r})=>r)},null,2));
assert.equal(triangles.length,1548);assert.ok(targetHits.length>0);assert.ok(rows.filter(r=>r.route==='original').every(r=>!r.arrived&&r.stuckAt[0]===97.5&&r.stuckAt[1]===448.7&&r.finishedRoomPenetrationFrames===0));assert.ok(rows.filter(r=>r.route==='legal-room-entry').every(r=>r.arrived&&Math.abs(r.end[2])<1e-6&&r.finishedRoomPenetrationFrames===0));W.dispose();
