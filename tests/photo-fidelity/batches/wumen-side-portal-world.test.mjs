import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {buildR52World} from '../../lib/r52-world.mjs';import {captureGate} from '../../lib/gate-tower-fixture.mjs';
import {verifyPortalFaces,portalFaceGroups} from '../../lib/wumen-side-portal-fixture.mjs';
import {taiheWorldPhysics} from '../../lib/r157-taihe-world-retention.mjs';import {physicalNonmutationFingerprint} from '../../lib/r159-physical-nonmutation-fingerprint.mjs';
import {wumenWidthThenJiaotaiPriorComparison} from '../../lib/wumen-main-width-world-comparison.mjs';import {wuying55PhysicsView} from '../../lib/r158-wuying-55-physics-view.mjs';
import {replayKunning} from '../../lib/kunning-walk.mjs';import {digest} from '../../lib/wumen-right-leaf-fixture.mjs';
test('unmodified World keeps both side-portal finish identities, exact merged face geometry and all five raw controller passages',async t=>{
 const c=captureGate(),expected=new Map();verifyPortalFaces(c);c.group.updateMatrixWorld(true);const Z=c.data.position.z;
 for(const g of portalFaceGroups(c))for(const m of g.children){const geo=m.geometry.toNonIndexed();geo.applyMatrix4(m.matrixWorld);const rows=expected.get(m.material.name)??[];rows.push(...geo.attributes.position.array);expected.set(m.material.name,rows);geo.dispose();}c.builder.dispose();
 const W=await buildR52World();try{global.gc?.();const roots=[];W.scene.traverse(o=>{if(o.name==='午门')roots.push(o);});assert.equal(roots.length,1);const root=roots[0];let vertices=0;
 const verify=()=>{for(let o=root;o;o=o.parent)assert.equal(o.visible,true);let count=0;for(const[name,rows]of expected){const meshes=root.children.filter(o=>o.material?.name===name);assert.equal(meshes.length,1);const m=meshes[0];assert.equal(m.visible,true);assert.equal(m.material.visible,true);assert.equal(m.material.side,0);assert.ok(!m.material.transparent||m.material.opacity>0);assert.equal(digest(Array.from(m.geometry.attributes.position.array)),digest(rows));count+=m.geometry.attributes.position.count;}return count;};vertices=verify();assert.equal(vertices,32*12*3);
 const m=root.children.find(o=>expected.has(o.material?.name));m.visible=false;assert.throws(verify);m.visible=true;const a=m.geometry.attributes.position,x=a.getX(0);a.setX(0,x+.1);assert.throws(verify);a.setX(0,x);verify();
 const identities=root.userData.architecture.filter(o=>o.id?.endsWith('/exterior-front-finish'));assert.equal(identities.length,2);assert.deepEqual(identities.map(o=>o.portalId).sort(),['east-yemen','west-yemen']);for(const r of identities){assert.equal(r.panelCount,11);assert.equal(r.inscription,'UNRECONSTRUCTED_NO_GLYPHS');}
 const raw=taiheWorldPhysics(W),fingerprint=physicalNonmutationFingerprint(raw);assert.equal(raw.rows.length,30882);assert.equal(raw.walkables.length,1365);
 const prior=wuying55PhysicsView(wumenWidthThenJiaotaiPriorComparison(W,raw).physics);assert.equal(prior.rows.length,30876,'all prior physical hashes including non-target rows preserved');
 const paths=[[-14.5,0,14.5].map(x=>({id:`central/${x}`,p:[[x,Z-15.3],[x,Z+20.6]]})),[-1,1].map(s=>({id:`lateral/${s}`,p:[[s*38.6,Z-16.5],[s*48,Z-16.5],[s*48,Z+20.6]]}))].flat(),routes=[];
 for(const fps of[10,60])for(const sprint of[false,true])for(const reverse of[false,true])for(const route of paths){let r;try{r=replayKunning(t,W,reverse?[...route.p].reverse():route.p,{startFeet:0,fps,sprint,recordFrames:true});}finally{t.mock.restoreAll();}
  assert.equal(r.arrived,true,JSON.stringify({id:route.id,fps,sprint,reverse,end:r.end}));assert.ok(r.frames.length>0);for(const f of r.frames){assert.equal(W.cm.checkCollision(new W.THREE.Vector3(f.x,f.feet+1.7,f.z),.5),false,'actual full body');assert.ok(Math.abs(f.feet)<1e-5,'retained ground route');}
  routes.push({id:route.id,fps,sprint,reverse,arrived:r.arrived,frames:r.frames.length,end:r.end});global.gc?.();
 }
 assert.equal(physicalNonmutationFingerprint(taiheWorldPhysics(W)),fingerprint);
 const result={scope:'ACTUAL_WORLD_NO_INSTALLER_INJECTION_RAW_FIVE_PORTALS',sourceTriangles:384,worldColliders:raw.rows.length,worldSupports:raw.walkables.length,priorPhysicalHashesExact:true,routes,accepted:false,wholeObjectCompleted:false};
 if(process.env.WUMEN_SIDE_PORTAL_WORLD_OUT)fs.writeFileSync(process.env.WUMEN_SIDE_PORTAL_WORLD_OUT,JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(result));
 }finally{W.dispose();}
});
