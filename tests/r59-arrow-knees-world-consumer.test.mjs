import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import {ZoneBase} from '../src/scene/zones/ZoneBase.js';
import {CollisionManager} from '../src/utils/Collision.js';
import {library} from './lib/inner-palace-fixture.mjs';
import {buildArrowSouthKnees} from '../src/scene/palace/special/ArrowSouthKnees.js';
const url=new URL('./lib/r59-arrow-knees-world-check.mjs',import.meta.url),api=fs.existsSync(url)?await import(url):{};
function localMerged(){
 const data=JSON.parse(fs.readFileSync(new URL('../data/zones/outer-east.json',import.meta.url))),item=data.items.find(i=>i.name==='箭亭'),b=new ZoneBase(library(),data),{f}=b.buildHall(item);
 if(!f.children.some(m=>m.userData.role==='arrow-south-central-knee'))buildArrowSouthKnees(b.kit,f,item);
 const scene=new THREE.Scene(),merged=b.kit.finish(),cm=new CollisionManager();scene.add(merged);cm.rivers=[];cm.addColliders(b.kit.colliders);cm.addWalkables(b.kit.walkables);scene.updateMatrixWorld(true);
 return{scene,cm,kit:b.kit,merged,dispose:()=>b.kit.dispose(merged)};
}
test('already-merged local Arrow has two real 44-triangle knees, true column/beam contact, and unchanged supported routes',()=>{
 assert.equal(typeof api.assertArrowSouthKneesInWorld,'function','already-built W consumer must exist');const W=localMerged();try{const r=api.assertArrowSouthKneesInWorld(W);assert.equal(r.triangles,88);assert.equal(r.halves.length,2);assert.ok(r.halves.every(h=>h.triangles===44&&h.closed));assert.ok(Math.abs(r.bounds.min[1]-7.91)<1e-4);assert.equal(r.contacts.length,2);assert.ok(r.routeChecks>=14);assert.equal(r.browserAcceptance,false);if(process.env.R59_WORLD_CONSUMER_REPORT)fs.writeFileSync(process.env.R59_WORLD_CONSUMER_REPORT,JSON.stringify({...r,fixture:'ONE LOCAL ARROW HALL AFTER REAL kit.finish; NOT FULL WORLD'},null,2)+'\n');}finally{W.dispose();}
});
test('removing the actual added merged bucket fails, without relying on discarded component roles',()=>{
 assert.equal(typeof api.assertArrowSouthKneesInWorld,'function');const W=localMerged();try{const bucket=W.merged.children.find(m=>m.material?.name==='arrow_south_knee_gray_fit');assert.ok(bucket);assert.equal(bucket.userData.role,undefined);W.merged.remove(bucket);assert.throws(()=>api.assertArrowSouthKneesInWorld(W),/knee.*88|88.*knee/i);W.merged.add(bucket);}finally{W.dispose();}
});
test('moving the bucket or removing its real red beam/column host fails the merged geometry audit',()=>{
 assert.equal(typeof api.assertArrowSouthKneesInWorld,'function');const W=localMerged();try{const knee=W.merged.children.find(m=>m.material?.name==='arrow_south_knee_gray_fit');knee.position.y+=.3;assert.throws(()=>api.assertArrowSouthKneesInWorld(W),/bound|lowest|height/i);knee.position.y-=.3;const host=W.merged.children.find(m=>m.material?.name==='arrow_red_fit');W.merged.remove(host);assert.throws(()=>api.assertArrowSouthKneesInWorld(W),/column|beam|contact/i);W.merged.add(host);}finally{W.dispose();}
});
test('an injected floor-route collider is detected rather than reported as unchanged passage',()=>{
 assert.equal(typeof api.assertArrowSouthKneesInWorld,'function');const W=localMerged();try{W.cm.addCollider(new THREE.Box3(new THREE.Vector3(-155.1,.9,69.6),new THREE.Vector3(-154.3,4,70.4)));assert.throws(()=>api.assertArrowSouthKneesInWorld(W),/route|collision|passage/i);}finally{W.dispose();}
});
