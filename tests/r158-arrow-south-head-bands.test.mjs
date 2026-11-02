import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fixture,item,THREE,rows,physical,target,triangles,sha} from './lib/r158-arrow-head-fixture.mjs';
import {CollisionManager} from '../src/utils/Collision.js';
import {replayTerrace} from './lib/terrace-walk.mjs';
import {ZoneBase} from '../src/scene/zones/ZoneBase.js';
import {createActualLibrary} from './r158-cumulative-1600/library.mjs';
const url=new URL('../src/scene/palace/special/ArrowSouthHeadBands.js',import.meta.url),api=fs.existsSync(url)?await import(url):{};
const added=m=>m.userData.role==='arrow-south-head-painted-face';
function apply(f){assert.equal(typeof api.applyArrowSouthHeadBands,'function','source-bounded south painted-band finalizer is implemented');return api.applyArrowSouthHeadBands(f.kit,f.frame,f.item);}
const fronts=(ids,a)=>ids.every(i=>a.normal.getZ(i)<-.999);

test('central three south head faces and matching outer beam acquire bounded grey-blue divisions, not a whole-building material tint',()=>{
 const f=fixture();try{const old=f.frame.children.filter(target);assert.equal(old.length,4);const keep=rows(f.frame,new Set(old)),p=physical(f.kit),backs=old.map(m=>sha(triangles(m,(ids,a)=>!fronts(ids,a))));const result=apply(f);
 assert.equal(result.sourceFaceCount,4);assert.equal(result.wholeObjectAccepted,false);assert.equal(result.photographyDate,null);assert.equal(physical(f.kit),p);
 const meshes=f.frame.children.filter(added);assert.equal(meshes.length,2);assert.equal(rows(f.frame,new Set([...old,...meshes])),keep);
 for(let i=0;i<old.length;i++)assert.equal(sha(triangles(old[i],(ids,a)=>!fronts(ids,a))),backs[i],'all ten non-front triangles and UV/normals retained');
 assert.ok(meshes.every(m=>m.material.map===null&&m.material.transparent===false&&m.material.opacity===1&&m.material.emissive.getHex()===0));
 assert.deepEqual(new Set(meshes.map(m=>m.material.name)),new Set(['arrow_south_head_grey_blue_fit','arrow_south_head_deep_blue_fit']));
 let area=0;for(const m of meshes){const p=m.geometry.attributes.position,n=m.geometry.attributes.normal,idx=m.geometry.index;for(let i=0;i<(idx?.count??p.count);i+=3){const vs=[0,1,2].map(k=>new THREE.Vector3().fromBufferAttribute(p,idx?idx.getX(i+k):i+k));area+=vs[1].clone().sub(vs[0]).cross(vs[2].clone().sub(vs[0])).length()/2;for(const v of vs){assert.ok(v.x>=-8.250001&&v.x<=8.250001);assert.ok(Math.abs(v.z+6.92)<1e-6||Math.abs(v.z+8.975)<1e-6);assert.ok(v.y>=5.499999&&v.y<=8.900001);}for(let k=0;k<3;k++)assert.ok(n.getZ(idx?idx.getX(i+k):i+k)<-.999);}}
 assert.ok(Math.abs(area-54.45)<1e-4,'exact existing four-plane area; no gaps or overlapping skins');
 }finally{f.dispose();}
});

test('identity, transformed hosts, missing sources and changed actual vertices reject without changing the scene or allocations',()=>{
 assert.equal(typeof api.applyArrowSouthHeadBands,'function');for(const mutate of[f=>{f.item={...item,name:'临溪亭'};},f=>{f.frame.position.x+=.1;},f=>{f.frame.rotation.y=.1;},f=>{f.frame.children.find(target).removeFromParent();},f=>{const g=f.frame.children.find(target).geometry;g.attributes.position.setX(0,g.attributes.position.getX(0)+.01);},f=>{f.frame.children.find(target).material.color.setHex(0xffffff);}]){
  const f=fixture();try{mutate(f);const before=rows(f.frame),p=physical(f.kit),count=f.kit.owned.length;assert.throws(()=>apply(f),/Arrow south head/);assert.equal(rows(f.frame),before);assert.equal(physical(f.kit),p);assert.equal(f.kit.owned.length,count);}finally{f.dispose();}
 }
 const f=fixture();try{apply(f);const before=rows(f.frame),p=physical(f.kit),count=f.kit.owned.length;assert.throws(()=>apply(f),/already/);assert.equal(rows(f.frame),before);assert.equal(physical(f.kit),p);assert.equal(f.kit.owned.length,count);}finally{f.dispose();}
});

test('south-only surfaces survive normal real merge while all source/merged resources are disposed exactly once',()=>{
 const f=fixture(),old=f.frame.children.filter(target).map(m=>m.geometry),watch=new Map(),track=o=>{if(!watch.has(o)){watch.set(o,0);o.addEventListener('dispose',()=>watch.set(o,watch.get(o)+1));}};old.forEach(track);let merged;
 try{apply(f);assert.ok(old.every(g=>watch.get(g)===1));for(const m of f.frame.children.filter(m=>added(m)||target(m))){track(m.geometry);if(added(m))track(m.material);}
 merged=f.kit.finish();const paint=merged.children.filter(m=>m.material?.name.startsWith('arrow_south_head_'));assert.equal(paint.length,2);assert.ok(paint.every(m=>m.geometry.attributes.normal.count>0));for(const m of paint)track(m.geometry);f.kit.dispose(merged);for(const n of watch.values())assert.equal(n,1);
 }finally{if(!merged)f.dispose();}
});

test('allocation and eventful attachment failures restore the exact scene, registrations and source resources',t=>{
 for(const mode of['allocation','attachment']){const f=fixture(),before=rows(f.frame),p=physical(f.kit),owned=[...f.kit.owned],old=f.frame.children.filter(target).map(m=>m.geometry),oldDisposed=new Map(old.map(g=>[g,0]));old.forEach(g=>g.addEventListener('dispose',()=>oldDisposed.set(g,oldDisposed.get(g)+1)));let mock;const staged=new Map();
  try{if(mode==='allocation'){const real=THREE.BufferGeometry.prototype.setAttribute;let count=0;mock=t.mock.method(THREE.BufferGeometry.prototype,'setAttribute',function(...args){if(!staged.has(this)){staged.set(this,0);this.addEventListener('dispose',()=>staged.set(this,staged.get(this)+1));}if(++count===4)throw Error('injected offline allocation failure');return real.apply(this,args);});}
   else{const real=f.frame.add;mock=t.mock.method(f.frame,'add',function(...nodes){real.apply(this,nodes);throw Error('injected after-attachment failure');});}
   assert.throws(()=>apply(f),/injected/);assert.equal(rows(f.frame),before);assert.equal(physical(f.kit),p);assert.deepEqual(f.kit.owned,owned);assert.ok([...oldDisposed.values()].every(n=>n===0));assert.ok([...staged.values()].every(n=>n===1));
  }finally{mock?.mock.restore();f.dispose();}
 }
});

test('frozen metadata, inherited marker setters and source geometry shared by a Line reject before retirement',()=>{
 for(const mode of['frozen','setter','shared']){const f=fixture();try{let called=0;if(mode==='frozen')Object.freeze(f.frame.userData);if(mode==='setter')Object.setPrototypeOf(f.frame.userData,{set arrowSouthHeadBands(v){called++;throw Error('unexpected setter');}});if(mode==='shared'){const line=new THREE.Line(f.frame.children.find(target).geometry,new THREE.LineBasicMaterial());f.kit.root.add(line);}
  const before=rows(f.frame),p=physical(f.kit),count=f.kit.owned.length;assert.throws(()=>apply(f),/Arrow south head/);assert.equal(rows(f.frame),before);assert.equal(physical(f.kit),p);assert.equal(f.kit.owned.length,count);assert.equal(called,0);
 }finally{f.dispose();}}
});

test('post-commit retired-geometry exceptions still attempt all four old resources and disclose committed state',()=>{
 const f=fixture(),old=f.frame.children.filter(target).map(m=>m.geometry),disposed=new Map(old.map(g=>[g,0]));old.forEach((g,i)=>g.addEventListener('dispose',()=>{disposed.set(g,disposed.get(g)+1);if(i===0)throw Error('retired observer failure');}));
 try{assert.throws(()=>apply(f),e=>e.committed===true&&e.cleanupPhase==='RETIRED_GEOMETRY_AFTER_COMMIT');assert.equal(f.frame.children.filter(added).length,2);assert.ok(f.frame.userData.arrowSouthHeadBands);assert.ok([...disposed.values()].every(n=>n===1));assert.throws(()=>apply(f),/already/);
 }finally{f.dispose();}
});

test('actual merged front rays encounter one grey/blue surface at each certified field; missing or moved paint is detected without role metadata',()=>{
 const f=fixture();let merged;try{apply(f);merged=f.kit.finish();merged.updateMatrixWorld(true);const paint=merged.children.filter(m=>m.material?.name.startsWith('arrow_south_head_'));
  function audit(){for(const x of[-5.5,0,5.5])for(const [dx,y,z,name]of[[.3,6.1,-6.92,'grey_blue'],[.31,7.37,-6.92,'deep_blue'],[-2.68,7.27,-6.92,'grey_blue'],[.3,8.69,-8.975,'deep_blue'],[.2,8.88,-8.975,'grey_blue']]){
   const ray=new THREE.Raycaster(new THREE.Vector3(item.x+x+dx,y,item.z-15),new THREE.Vector3(0,0,1));const hits=ray.intersectObjects(paint);assert.equal(hits.length,1,'one actual surface, no hole/duplicate paint');assert.ok(Math.abs(hits[0].point.z-(item.z+z))<1e-5);assert.equal(hits[0].object.material.name,`arrow_south_head_${name}_fit`);
  }}audit();const blue=paint.find(m=>m.material.name.includes('deep_blue')),grey=paint.find(m=>m!==blue);merged.remove(blue);paint.splice(paint.indexOf(blue),1);assert.throws(audit,/one actual surface/);merged.add(blue);paint.push(blue);grey.position.x=.4;grey.updateMatrixWorld(true);assert.throws(audit,/one actual surface/);grey.position.x=0;
 }finally{if(merged)f.kit.dispose(merged);else f.dispose();}
});

test('zone-end finalizer ignores unrelated zones, installs one completed Arrow and rejects duplicate hosts without touching historical constructors',()=>{
 assert.equal(typeof api.finishArrowSouthHeadBands,'function');const f=fixture(),zone={id:'outer-east',items:[item]};try{const frame=f.frame;frame.removeFromParent();const p=physical(f.kit),owned=f.kit.owned.length;assert.equal(api.finishArrowSouthHeadBands(f.kit,{id:'garden',items:[]}),false);assert.equal(physical(f.kit),p);assert.equal(f.kit.owned.length,owned);f.kit.root.add(frame);
  const duplicate=new THREE.Group();duplicate.userData.structure={key:'arrow'};f.kit.root.add(duplicate);assert.throws(()=>api.finishArrowSouthHeadBands(f.kit,zone),/Arrow south head.*unique/);assert.equal(f.kit.owned.length,owned);duplicate.removeFromParent();const r=api.finishArrowSouthHeadBands(f.kit,zone);assert.equal(r.sourceFaceCount,4);assert.equal(f.frame.children.filter(added).length,2);
 }finally{f.dispose();}
});

test('zone-end finalizer consumes the real declaration rather than fabricating an expected item; missing/duplicate targets reject',()=>{
 for(const mode of['changed-declaration','duplicate-declaration','missing-frame']){const f=fixture();try{const data={id:'outer-east',items:[{...item}]};if(mode==='changed-declaration')data.items[0].w=30;if(mode==='duplicate-declaration')data.items.push({...item});if(mode==='missing-frame')f.frame.removeFromParent();const before=rows(f.frame),count=f.kit.owned.length;assert.throws(()=>api.finishArrowSouthHeadBands(f.kit,data),/Arrow south head/);assert.equal(rows(f.frame),before);assert.equal(f.kit.owned.length,count);}finally{f.dispose();}}
});

test('normal complete outer-east producer accepts the exact proposed pre-merge finalizer and preserves all registrations',()=>{
 assert.equal(typeof api.finishArrowSouthHeadBands,'function');const data=JSON.parse(fs.readFileSync(new URL('../data/zones/outer-east.json',import.meta.url))),resources=createActualLibrary(),zone=new ZoneBase(resources.library,data),finish=zone.kit.finish;let invoked=0,group;
 zone.kit.finish=function(){const before=physical(this),host=this.root.children.find(f=>f.userData.structure?.key==='arrow');assert.ok(host);if(!host.userData.arrowSouthHeadBands)api.finishArrowSouthHeadBands(this,data);invoked++;assert.equal(physical(this),before);return finish.call(this);};
 try{zone.build();group=zone.group;assert.equal(invoked,1);const record=group.userData.architecture.find(r=>r.id==='outer-east/arrow-enclosed');assert.equal(record.arrowSouthHeadBands.sourceFaceCount,4);assert.equal(record.arrowSouthHeadBands.wholeObjectAccepted,false);assert.equal(group.children.filter(m=>m.material?.name.startsWith('arrow_south_head_')).length,2);
 }finally{if(group)zone.dispose();else zone.kit.dispose(zone.kit.root);resources.dispose();}
});

for(const fps of[10,60])for(const backward of[false,true])test(`unchanged actual doors and both galleries remain traversable ${fps}Hz ${backward?'backward':'forward'}`,t=>{
 const f=fixture();try{const before=physical(f.kit);apply(f);assert.equal(physical(f.kit),before);const cm=new CollisionManager();cm.rivers=[];cm.addColliders(f.kit.colliders);cm.addWalkables(f.kit.walkables);
 const points=[[0,-13],[0,-7.8],[14.65,-7.8],[14.65,7.8],[0,7.8],[0,13],[0,0],[0,-7.8],[-14.65,-7.8],[-14.65,7.8],[0,7.8],[0,-13]].map(([x,z])=>[x+item.x,z+item.z]);const r=replayTerrace(t,{THREE,cm},points,{fps,backward,sprint:true,recordFrames:true});assert.equal(r.arrived,true);assert.ok(r.frames.every(v=>Number.isFinite(v.feet)));
 }finally{f.dispose();}
});
