import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import * as THREE from 'three';
import {zhenduFixture} from '../lib/r58-zhendu-fixture.mjs';
import {bindProfileSupports,traceProfileSupports,profileSupportReport} from '../lib/profile-support-trace.mjs';
import {replayTerrace} from '../lib/terrace-walk.mjs';
const url=new URL('../lib/r58-zhendu-world-check.mjs',import.meta.url),api=existsSync(url)?await import(url):{};
const contactNames=['frontGround','frontToe','frontTop','portalFront','portalRear','rearTop','rearToe','rearGround'];
function route(p,from='front',offset=0){let go=contactNames.map(k=>p.toWorld(p.routeContacts[k][0]+offset,p.routeContacts[k][1]));if(from==='rear')go.reverse();return[...go,...go.slice(0,-1).reverse()];}
function inspect(W){assert.equal(typeof api.assertZhenduInWorld,'function','consumer must inspect existing world only');return api.assertZhenduInWorld(W);}

test('consumer finds one existing assembly before and after production merge, verifies actual triangles and owned supports',()=>{
 const W=zhenduFixture();assert.equal(inspect(W).supportCount,3);W.scene.remove(W.kit.root);W.scene.add(W.kit.finish());assert.equal(inspect(W).scope,'ACTUAL_LOCAL_GEOMETRY_AND_SUPPORT_NOT_VISUAL_ACCEPTANCE');
 assert.equal(W.scene.children.length,1,'consumer does not construct or add a world');
});
test('consumer rejects missing, duplicate and shifted actual supports rather than trusting metadata',()=>{
 for(const defect of ['delete','duplicate','shift']){
  const W=zhenduFixture();const r=W.cm.walkables.find(w=>w.type==='ramp');if(defect==='delete')W.cm.walkables.splice(W.cm.walkables.indexOf(r),1);if(defect==='duplicate')W.cm.walkables.push({...r});if(defect==='shift'){r.minX+=30;r.maxX+=30;}
  assert.throws(()=>inspect(W),/registered primitive|support/);
 }
});
for(const from of ['front','rear'])for(const fps of [10,60])for(const sprint of [false,true])for(const backward of [false,true])
test(`real controller crosses Zhendu ${from} ${fps}Hz ${sprint?'sprint':'walk'} ${backward?'backward':'forward'} on own supports`,t=>{
 const W=zhenduFixture();assert.equal(typeof api.replayZhenduRoute,'function','existing-world controller consumer required');const r=api.replayZhenduRoute(t,W,{from,fps,sprint,backward});assert.equal(r.arrived,true);assert.equal(r.support.valid,true);assert.equal(r.startFeet,0);assert.ok(Math.abs(r.end[2])<1e-6);if(sprint)assert.ok(r.maxSpeed>6);
});
test('support substitution can arrive in XY but fails the real primitive provenance test',t=>{
 const W=zhenduFixture(),identities=bindProfileSupports(W.cm,W.p),original=[...identities].find(([,id])=>id==='zhendu-front-ramp')[0];W.cm.walkables.splice(W.cm.walkables.indexOf(original),1,{...original});
 const trace=traceProfileSupports(W.cm,identities);let result;try{result=replayTerrace(t,W,route(W.p),{fps:10,sprint:true});}finally{trace.restore();}
 assert.equal(result.arrived,true);const report=profileSupportReport(trace.samples,W.p);assert.equal(report.valid,false);assert.ok(report.failures.some(s=>/other-ramp/.test(s)));
});
test('solid retaining sides, bay panels, columns and wing caps stop actual body movement',()=>{
 const W=zhenduFixture(),p=W.p;
 const blocked=(a,b,feet)=>{const aa=p.toWorld(...a),bb=p.toWorld(...b),start=new THREE.Vector3(aa[0],feet+1.7,aa[1]),target=new THREE.Vector3(bb[0],feet+1.7,bb[1]);assert.equal(W.cm.checkCollision(start,.5),false,'legal start');const valid=W.cm.getValidPosition(start,target,.5);assert.ok(Math.hypot(valid.x-bb[0],valid.z-bb[1])>.8,'solid body must stop shortcut');};
 for(const sign of [-1,1]){
  blocked([sign*14,4],[sign*10,4],0);blocked([sign*6,p.core.frontZ-2],[sign*6,p.core.frontZ+2],p.platform.topY);
  const j=sign<0?p.joins.left:p.joins.right;for(const feet of [0,.45,p.platform.topY])blocked([j.platformEdge+sign*2,-3.1],[j.platformEdge-sign*2,-3.1],feet);
  blocked([sign*p.core.bayWidths[1]/2,-8],[sign*p.core.bayWidths[1]/2,-5],p.platform.topY);
 }
});
