import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {originalItem,actualItem,api,fixture,columns,meshes,rows,hash,nav,dependent,triangles} from './lib/r62-fengxian-rear-fixture.mjs';
import {replayTerrace} from './lib/terrace-walk.mjs';
const localWidth=m=>{m.geometry.computeBoundingBox();return m.geometry.boundingBox.max.x-m.geometry.boundingBox.min.x;};
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-6,`${a} != ${b}`);

test('official nine-bay rear hall replaces the actual default fifteen-bay column grid: 32 -> 20 eave columns',()=>{
 assert.deepEqual(actualItem,originalItem);const before=fixture(false),after=fixture();try{assert.equal(columns(before).length,32);assert.equal(columns(after).length,20);assert.equal(after.frame.userData.structure.eaveCount,1);assert.equal(after.frame.userData.structure.bays,9);assert.equal(after.frame.userData.structure.objectId,'AUX-BF1091B523A8');assert.equal(after.frame.userData.structure.accepted,false);}finally{before.dispose();after.dispose();}
});

test('only exact unchanged east-six item 54 may enter the profile; malformed original declarations fail before allocations',()=>{
 assert.equal(typeof api.resolveFengxianRearProfile,'function');const f=fixture(false);try{
 for(const key of Object.keys(originalItem)){const bad={...originalItem,[key]:typeof originalItem[key]==='number'?originalItem[key]+.01:'other'};const n=f.kit.root.children.length;assert.throws(()=>api.buildFengxianRearHall(f.kit,bad,54),/Fengxian rear/);assert.equal(f.kit.root.children.length,n);}
 for(const patch of[{bays:9},{name:'奉先后殿'},{layers:2},{interior:'empty'},{rot:0},{throne:false},{x:NaN}])assert.throws(()=>api.resolveFengxianRearProfile('east-six',{...originalItem,...patch},54),/Fengxian rear/);
 for(const key of Object.keys(originalItem)){const bad={...originalItem};delete bad[key];assert.throws(()=>api.resolveFengxianRearProfile('east-six',bad,54),/Fengxian rear/);}
 assert.equal(api.resolveFengxianRearProfile('east-six',originalItem,53),null);assert.equal(api.resolveFengxianRearProfile('outer-east',originalItem,54),null);assert.equal(api.buildFengxianRearHall(f.kit,originalItem,53),null);
 }finally{f.dispose();}
});

test('roof, platform envelope, side/rear walls, generic interior and map/room registrations remain exact, not falsely restored',()=>{
 const a=fixture(false),b=fixture();try{
 const stable=f=>rows({traverse(fn){f.frame.traverse(m=>{if(m===f.frame||!dependent(m))fn(m);});}});
 assert.equal(hash(stable(a)),hash(stable(b)));assert.deepEqual(b.kit.rooms,a.kit.rooms);assert.deepEqual(b.kit.mapItems,a.kit.mapItems);assert.deepEqual(b.kit.regions,a.kit.regions);
 assert.equal(b.kit.rooms.length,1);assert.equal(b.kit.rooms[0].kind,'hall');assert.equal(b.kit.rooms[0].name,null);assert.ok(meshes(b.frame).some(m=>m.material.name.startsWith('kit_furn_')),'legacy generic inventory retained, not relabelled as source inventory');
 const p=b.frame.userData.structure;assert.equal(p.interiorStatus,'EXISTING_GENERIC_INTERIOR_UNVERIFIED');assert.equal(p.dimensionsStatus,'RETAINED_MODEL_ENVELOPE_NOT_SURVEYED');assert.equal(p.baySpacingStatus,'EQUAL_SUBDIVISION_PROVISIONAL');assert.equal(p.photographyDate,null);assert.ok(p.unknowns.includes('rear-hall nine-room layout and shrine inventory'));
 }finally{a.dispose();b.dispose();}
});

test('bay-dependent column radii, closed south panels, folded entrance leaves, threshold and stairs change explicitly',()=>{
 const a=fixture(false),b=fixture();try{
 const summary=f=>({columns:columns(f).length,r:columns(f)[0].geometry.parameters.radiusTop,closed:f.frame.children.filter(m=>m.material?.name==='lattice_doors_material'&&m.rotation.y===0),leaves:f.frame.children.filter(m=>m.material?.name==='lattice_doors_material'&&m.rotation.y!==0),stairs:f.frame.children.filter(m=>m.isMesh&&m.position.z<-11)});
 const x=summary(a),y=summary(b);near(x.r,.2408);near(y.r,.34);assert.equal(x.closed.length,14);assert.equal(y.closed.length,8);near(localWidth(x.closed[0]),2.9584);near(localWidth(y.closed[0]),5.053333333333334);assert.equal(y.leaves.length,2);near(localWidth(x.leaves[0]),.8944);near(localWidth(y.leaves[0]),1.4906666666666668);assert.ok(y.stairs.length);near(localWidth(x.stairs[0]),3.612);near(localWidth(y.stairs[0]),4.6);
 for(const m of meshes(b.frame).filter(dependent))for(const [a,b,c] of triangles(m)){assert.ok([...a.toArray(),...b.toArray(),...c.toArray()].every(Number.isFinite));assert.ok(b.clone().sub(a).cross(c.clone().sub(a)).lengthSq()>1e-14,'no zero-area changed triangle');}
 }finally{a.dispose();b.dispose();}
});

for(const fps of[10,60])test(`normal existing south entry roundtrip at ${fps}Hz preserves actual support and collision safety`,t=>{
 const f=fixture();try{const x=originalItem.x,z=originalItem.z,go=[[x,z-15],[x,z-12],[x,z-10.6],[x,z-7]];const r=replayTerrace(t,f,[...go,...go.slice(0,-1).reverse()],{fps,recordFrames:true});assert.equal(r.arrived,true,JSON.stringify({stuckAt:r.stuckAt,end:r.end}));assert.equal(r.startFeet,0);assert.ok(r.maxFeet>=.9);assert.ok(Math.abs(r.end[2])<.01);for(const p of r.frames)assert.equal(f.cm.checkCollision(new THREE.Vector3(p.x,p.ground+1.7,p.z),.5),false);}finally{f.dispose();}
});

test('merged world consumer verifies real grid, matching colliders and support without building or replacing a world',async t=>{
 const url=new URL('./lib/r62-fengxian-rear-world-check.mjs',import.meta.url);const {existsSync}=await import('node:fs');assert.ok(existsSync(url),'existing-world-only consumer required');const {assertFengxianRearInWorld,replayFengxianRearInWorld}=await import(url);const f=fixture();try{
 f.merged=f.kit.finish();f.merged.updateMatrixWorld(true);const before=hash(rows(f.merged)),physical=hash(nav(f.kit));const result=assertFengxianRearInWorld({scene:f.merged,cm:f.cm});assert.equal(result.columns,20);assert.equal(result.closedPanels,8);assert.equal(result.accepted,false);for(const fps of[10,60])assert.equal(replayFengxianRearInWorld(t,{scene:f.merged,cm:f.cm},{fps}).arrived,true);assert.equal(hash(rows(f.merged)),before);assert.equal(hash(nav(f.kit)),physical);
 const bad=fixture(false);try{bad.frame.userData.structure={...f.merged.userData.architecture[0]};bad.merged=bad.kit.finish();bad.merged.updateMatrixWorld(true);assert.throws(()=>assertFengxianRearInWorld({scene:bad.merged,cm:bad.cm}),'metadata on old fifteen-bay geometry must not pass');}finally{bad.dispose();}
 }finally{f.dispose();}
});

test('all altered support widths remain inside real stair treads and preserve the inherited ramp-versus-step approximation',()=>{
 const a=fixture(false),b=fixture();try{assert.equal(b.kit.walkables.length,2);assert.deepEqual(b.kit.walkables[0],a.kit.walkables[0]);const ramp=b.kit.walkables[1],old=a.kit.walkables[1];assert.equal(ramp.type,'ramp');near(ramp.maxX-ramp.minX,4.6);near(old.maxX-old.minX,3.612);for(const k of['minZ','maxZ','a0','a1','y0','y1','axis'])assert.equal(ramp[k],old[k]);
 for(const m of b.frame.children.filter(m=>m.material?.name==='marble_material'&&m.rotation.x===0)){const box=new THREE.Box3().setFromObject(m),x=(box.min.x+box.max.x)/2,z=(box.min.z+box.max.z)/2;near(box.max.x-box.min.x,4.6);const hits=new THREE.Raycaster(new THREE.Vector3(x,box.max.y+.01,z),new THREE.Vector3(0,-1,0),0,.02).intersectObject(b.frame,true);assert.ok(hits.length);near(hits[0].point.y,box.max.y);const support=b.cm.getGroundHeight(x,z,1);assert.ok(Math.abs(support-box.max.y)<=.054,'retained ramp is not mislabeled as exact mesh tread height');}
 }finally{a.dispose();b.dispose();}
});

test('whole-model numerical audit preserves exactly twenty legacy roof degenerates and adds none in the changed geometry',()=>{
 const a=fixture(false),b=fixture();try{const audit=f=>meshes(f.frame).flatMap(m=>triangles(m).flatMap((tri,i)=>{assert.ok(tri.flatMap(v=>v.toArray()).every(Number.isFinite));return tri[1].clone().sub(tri[0]).cross(tri[2].clone().sub(tri[0])).lengthSq()<=1e-14?[{name:m.name,material:m.material.name,index:i,vertices:tri.map(v=>v.toArray())}]:[]}));const before=audit(a),after=audit(b);assert.equal(before.length,20);assert.deepEqual(after,before);assert.ok(after.every(x=>x.material==='roof_tile_material'));}finally{a.dispose();b.dispose();}
});
