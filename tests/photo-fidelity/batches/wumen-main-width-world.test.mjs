import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {buildR52World} from '../../lib/r52-world.mjs';import {captureGate,meshFingerprint} from '../../lib/gate-tower-fixture.mjs';import {PalaceBuilder} from '../../../src/scene/PalaceBuilder.js';
import {renderStateHash} from '../../lib/r157-wumen-main-signature.mjs';import {verifyWidthContract} from '../../lib/wumen-side-portal-prior-comparison.mjs';
import {taiheWorldPhysics} from '../../lib/r157-taihe-world-retention.mjs';import {physicalNonmutationFingerprint} from '../../lib/r159-physical-nonmutation-fingerprint.mjs';
import {wumenMainWidthPriorComparison,wumenWidthThenJiaotaiPriorComparison} from '../../lib/wumen-main-width-world-comparison.mjs';import {wuying55PhysicsView} from '../../lib/r158-wuying-55-physics-view.mjs';import {replayKunning} from '../../lib/kunning-walk.mjs';
const before=JSON.parse(fs.readFileSync(new URL('../../fixtures/r157-wumen-main-width/before-411214.json',import.meta.url))).snapshot;
test('actual unmodified World builds reviewed Wumen width geometry, preserves all other prior physics and uses raw controller contact',async t=>{
 const c=captureGate();verifyWidthContract(c,before);const merged=PalaceBuilder.prototype.finish.call(c.builder,c.group),expected={geometry:meshFingerprint(merged),render:renderStateHash(merged)},Z=c.data.position.z;c.builder.dispose();
 const W=await buildR52World();try{global.gc?.();const roots=[];W.scene.traverse(o=>{if(o.name==='午门')roots.push(o);});assert.equal(roots.length,1);const root=roots[0];
 const verify=()=>{for(let p=root;p;p=p.parent)assert.equal(p.visible,true);assert.equal(meshFingerprint(root),expected.geometry,'actual canonical World mesh matches independently contract-checked live component');assert.equal(renderStateHash(root),expected.render);};verify();root.visible=false;assert.throws(verify);root.visible=true;const mesh=root.children.find(o=>o.isMesh),a=mesh.geometry.attributes.position,x=a.getX(0);a.setX(0,x+.1);assert.throws(verify);a.setX(0,x);verify();
 const raw=taiheWorldPhysics(W),fingerprint=physicalNonmutationFingerprint(raw),first=wumenMainWidthPriorComparison(W,raw);assert.equal(first.restoredIndices.length,88);assert.equal(first.world.cm.checkCollision,undefined);assert.equal(first.world.cm.constructor,W.cm.constructor);assert.notEqual(first.physics.rows,raw.rows);
 const compose=(w,p)=>wuying55PhysicsView(wumenWidthThenJiaotaiPriorComparison(w,p).physics);const prior=compose(W,raw);assert.equal(prior.rows.length,30876);
 const i=first.restoredIndices[0],other=raw.rows.findIndex((_,j)=>!first.restoredIndices.includes(j));
 for(const patch of[{tag:'forged'},{triangleSupport:{}},{overhead:{}},{xiqingRoofSurface:{}},{duixiuTerrain:true},{furnitureMotionScope:{}},{min:[raw.rows[i].min[0]+.01,...raw.rows[i].min.slice(1)]}])assert.throws(()=>compose(W,{...raw,rows:raw.rows.map((r,j)=>j===i?{...r,...patch}:r)}));
 assert.throws(()=>compose({...W,cm:{...W.cm,colliders:W.cm.colliders.map((r,j)=>j===i?{...r,mesh:r.mesh.clone()}:r)}},raw));
 assert.throws(()=>compose(W,{...raw,rows:raw.rows.map((r,j)=>j===other?{...r,min:[r.min[0]+.01,...r.min.slice(1)]}:r)}),/non-target/);
 const routes=[],oldX=60.05/18,newX=(60.05/9.43)*1.43/2,radius=(60.05/9*.06)*1.05;
 for(const fps of[10,60])for(const side of[-1,1])for(const sprint of[false,true])for(const mode of['new-axis-blocked','old-axis-clear','near-edge-clear']){
  const x=side*(mode==='old-axis-clear'?oldX:mode==='near-edge-clear'?newX+.5+radius+.025:newX);let r;
  try{r=replayKunning(t,W,[[x,Z+11.2],[x,Z+14.5]],{startFeet:12.3,fps,sprint,recordFrames:true});}finally{t.mock.restoreAll();}
  assert.equal(r.arrived,mode!=='new-axis-blocked',`${mode} ${fps} ${side} ${sprint}`);assert.ok(r.frames.length>0);for(const f of r.frames){assert.equal(W.cm.checkCollision(new W.THREE.Vector3(f.x,f.feet+1.7,f.z),.5),false,'raw complete body contact');assert.ok(Math.abs(f.feet-12.3)<1e-6);}
  routes.push({mode,fps,side,sprint,arrived:r.arrived,frames:r.frames.length,end:r.end});
 }
 assert.equal(physicalNonmutationFingerprint(taiheWorldPhysics(W)),fingerprint,'actual full manager unchanged by all comparisons/probes');
 const result={scope:'ACTUAL_CANONICAL_WORLD_NO_INSTALLER_INJECTION',colliders:raw.rows.length,supports:raw.walkables.length,reviewedChangedRows:88,allOtherPriorPhysicsExact:true,geometryOracle:'current independently bounded component, not external photo gold',routes,accepted:false,wholeObjectCompleted:false};
 if(process.env.WUMEN_WIDTH_WORLD_OUT)fs.writeFileSync(process.env.WUMEN_WIDTH_WORLD_OUT,JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(result));
 }finally{W.dispose();}
});
