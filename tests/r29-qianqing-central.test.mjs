import {HistoricalR29PalaceBuilder} from './lib/historical-r29-qianqing-fixture.mjs';
import {r32Scene,restorePreR32Navigation} from './lib/r32-scene-retention.mjs';
import {restorePreR30Navigation} from './lib/r30-qianqing-passage-retention.mjs';
import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {createHash}from'node:crypto';import {registerHooks}from'node:module';
registerHooks({load(u,c,n){if(u.endsWith('.json'))return{format:'module',source:'export default '+fs.readFileSync(new URL(u),'utf8'),shortCircuit:true};return n(u,c)}});
const T=await import('three'),{PalaceBuilder}=await import('../src/scene/PalaceBuilder.js'),{PALACE_LAYOUT}=await import('../src/scene/Layout.js'),{library,hash,sceneRows}=await import('./lib/inner-palace-fixture.mjs'),{GLTFLoader}=await import('three/examples/jsm/loaders/GLTFLoader.js'),{InteriorLoader}=await import('../src/scene/interior/InteriorLoader.js'),{CollisionManager}=await import('../src/utils/Collision.js');
const {QIANQING_CENTRAL:P,qianqingCentralFrame,buildQianqingCentralLevel,installQianqingCentral}=await import('../src/scene/palace/QianqingCentralSetting.js');
const {QIANQING_CENTRAL_ART,qianqingCentralMaterial,qianqingCentralUV}=await import('../src/scene/palace/QianqingCentralArt.js');const{validateQianqingAuxiliary}=await import('../src/scene/interior/QianqingAuxiliaryContract.js');
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url)),cfg=JSON.parse(read('data/interiors/qianqing.json')),base=JSON.parse(read('tests/fixtures/r29-qianqing-baseline.json')),scene=new T.Scene(),b=new PalaceBuilder(scene,library());b.buildAll(PALACE_LAYOUT);scene.updateMatrixWorld(true);const group=scene.getObjectByName('后三宫'),lod=scene.getObjectByName('qianqing-central-setting-detail'),f=group.userData.qianqingCentral,mat=qianqingCentralMaterial(b),raw=buildQianqingCentralLevel(mat,f,true),count=g=>(g.index?.count??g.attributes.position.count)/3,near=raw.children;raw.updateMatrixWorld(true);const close=(a,c,e=1e-5)=>assert.ok(Math.abs(a-c)<e,`${a} != ${c}`);
async function asset(){const buf=read('public'+cfg.model);return(await new GLTFLoader().parseAsync(buf.buffer.slice(buf.byteOffset,buf.byteOffset+buf.byteLength),'')).scene;}
function setup(){const s=new T.Scene(),bb=new PalaceBuilder(s,library());bb.buildAll(PALACE_LAYOUT);const cm=new CollisionManager();cm.addColliders(bb.colliders);cm.addWalkables(bb.walkables);return{s,bb,cm,loader:new InteriorLoader(s,cm,{registry:{qianqing:cfg}})};}
const snapshot=cm=>JSON.stringify({c:cm.colliders,w:cm.walkables});

test('exact historical R31/R30 reversal retains R28 navigation, passage registrations and frozen other palace groups',()=>{assert.equal(hash((()=>{const n=restorePreR30Navigation({colliders:b.colliders,walkables:b.walkables});return{c:n.colliders,w:n.walkables};})()),base.navigation);assert.equal(restorePreR30Navigation({colliders:b.colliders,walkables:b.walkables}).colliders.length,2489);const historicalR31=restorePreR32Navigation({colliders:b.colliders,walkables:b.walkables});assert.equal(historicalR31.colliders.length,2503);assert.equal(historicalR31.walkables.length,120);const historicalScene=new T.Scene(),historicalBuilder=new HistoricalR29PalaceBuilder(historicalScene,library());try{historicalBuilder.buildAll(PALACE_LAYOUT);historicalScene.updateMatrixWorld(true);const historicalLOD=historicalScene.getObjectByName('qianqing-central-setting-detail');assert.deepEqual(historicalLOD.levels.map(l=>l.object.children.reduce((n,o)=>n+count(o.geometry),0)),[1986,192]);const rows=sceneRows(historicalScene);for(const[k,v]of Object.entries(base.groups))if(k!=='后三宫')assert.deepEqual(rows[k],v);}finally{historicalBuilder.dispose();}assert.match(f.dimensionStatus,/NOT_SURVEY/);assert.equal(f.tz,322);});
test('registered fixed plan rejects unsupported dimensions or a second installation',()=>{for(const delta of[{H:8},{y:2},{ztb0:318},{thW:9},{x0:1},{ztb1:326}])assert.throws(()=>qianqingCentralFrame({...f,...delta}),/Unregistered/);assert.throws(()=>installQianqingCentral(b,group),/unique/);});
test('five staggered screen panels, open crowns, separate rear frame and three five-step flights',()=>{const panels=near.filter(o=>o.name.startsWith('qianqing-five-screen-panel-'));assert.equal(panels.length,5);assert.deepEqual(panels.map(o=>o.geometry.parameters.height),[2.55,2.95,3.3,2.95,2.55]);assert.equal(near.filter(o=>o.name.startsWith('qianqing-open-carved-crest-')).length,5);assert.equal(near.filter(o=>o.name.startsWith('qianqing-three-stairs-')).length,15);const plaque=raw.getObjectByName('qianqing-zhengdaguangming-plaque'),frame=raw.getObjectByName('qianqing-red-rear-frame');assert.ok(frame.position.z>Math.max(...panels.map(o=>o.position.z)));assert.ok(plaque.position.z>panels[2].position.z);assert.equal(P.plaque.leftToRight,'明光大正');});
test('all visible near/far vertices stay in the inherited XZ exclusion and below the ceiling',()=>{for(const fine of[true,false]){const r=buildQianqingCentralLevel(mat,f,fine);r.updateMatrixWorld(true);r.traverse(o=>{if(!o.isMesh)return;const a=o.geometry.attributes.position,v=new T.Vector3();for(let i=0;i<a.count;i++){v.fromBufferAttribute(a,i).applyMatrix4(o.matrixWorld);assert.ok(v.toArray().every(Number.isFinite));assert.ok(v.x>=f.bounds.minX-1e-5&&v.x<=f.bounds.maxX+1e-5,o.name+' X');assert.ok(v.z+f.tz>=f.bounds.minZ-1e-5&&v.z+f.tz<=f.bounds.maxZ+1e-5,o.name+' Z');assert.ok(v.y>=-1e-5&&v.y<f.H-.05,o.name+' Y');}});}});
test('railing posts rest on modelled stepped cheeks and have connected sloping handrails',()=>{const posts=near.filter(o=>o.name==='qianqing-stair-rail-post'),cheeks=near.filter(o=>o.name==='qianqing-stair-cheek');assert.equal(posts.length,12);assert.equal(cheeks.length,20);assert.equal(near.filter(o=>o.name==='qianqing-stair-rail').length,8);for(const post of posts){const box=new T.Box3().setFromObject(post),z=post.position.z;if(z>f.ztb0-f.tz){close(box.min.y,.7);continue;}const supports=cheeks.map(o=>new T.Box3().setFromObject(o)).filter(x=>post.position.x>=x.min.x&&post.position.x<=x.max.x&&z>=x.min.z&&z<=x.max.z);assert.equal(supports.length,1);close(box.min.y,supports[0].max.y);}});
test('private atlas uses sRGB, correct word order/aspect and plain backs; does not mutate other gold',()=>{assert.equal(QIANQING_CENTRAL_ART.width,1024);assert.equal(QIANQING_CENTRAL_ART.height,512);assert.equal(mat.map.colorSpace,T.SRGBColorSpace);assert.notEqual(mat,b._own.get('gold'));assert.equal(b._own.get('gold').metalness,.85);const p=raw.getObjectByName('qianqing-zhengdaguangming-plaque'),uv=p.geometry.attributes.uv,n=p.geometry.attributes.normal;for(let i=0;i<uv.count;i++){const cell=Math.floor(uv.getX(i)*4)+4*Math.floor((1-uv.getY(i))*2);assert.equal(cell,n.getZ(i)<-.9?3:5);}const text=read('src/scene/palace/QianqingCentralArt.js').toString();assert.ok(text.includes("[...'明光大正']"));assert.ok(text.includes('c.scale(1.25/3.8,1)'));assert.throws(()=>qianqingCentralUV(new T.BoxGeometry(),9));});
// Current R32 tests below use the actual implementation and exported GLB.
// The exact old LODs remain asserted above on the independently rebuilt R29
// scene, and the complete old scene remains bound by the historical tests.
test('current R32 near/far LOD budgets match the frozen resident graph and only one private batch is visible',()=>{
 assert.deepEqual(lod.levels.map(l=>l.object.children.length),[1,1]);
 const expected=[2048,268],meshes=lod.levels.map(l=>l.object.children[0]);
 assert.deepEqual(meshes.map(m=>count(m.geometry)),expected);
 const registered=r32Scene.graph.changes.flatMap(change=>change.after);
 for(const[i,mesh]of meshes.entries()){
  const matches=registered.filter(node=>node.name===mesh.name);
  assert.equal(matches.length,1);assert.equal(matches[0].triangles,expected[i]);
 }
 assert.equal(lod.userData.displayRevision,'r32-photo-relative-main-scene');
 for(const[d,near]of[[5,true],[180,false],[5,true]]){
  const c=new T.PerspectiveCamera();c.position.copy(lod.position).add(new T.Vector3(d,0,0));c.updateMatrixWorld(true);lod.update(c);
  assert.equal(lod.levels[0].object.visible,near);assert.equal(lod.levels[1].object.visible,!near);
 }
 assert.equal(hash((()=>{const n=restorePreR30Navigation({colliders:b.colliders,walkables:b.walkables});return{c:n.colliders,w:n.walkables};})()),base.navigation);
});
test('current R32 auxiliary geometry is bound to exact GLB/source bytes and its own budget; prior assets remain intact',async()=>{
 const sha=value=>createHash('sha256').update(value).digest('hex');
 assert.equal(sha(read('public/models/interiors/qianqing.glb')),'5fea568395a4474dbfd77fed158e9d2bbfa0959e5f5cd268ecab7e523f0861bf');
 assert.equal(sha(read('public/models/interiors/qianqing-r31.glb')),'76b14ddf270ba1a6c1d0109b47c7c99f441af49b469c908f5af41d93697d3d5d');
 assert.equal(cfg.asset.sha256,'6e55cd07c32e01343d0b25da259317017b2bc13b0564347d0861db9c2dae5bfa');
 assert.equal(sha(read('public'+cfg.model)),cfg.asset.sha256);
 assert.equal(sha(read('assets-src/interiors/build_qianqing_auxiliary.py')),cfg.asset.sourceSHA256);
 assert.deepEqual([cfg.asset.renderableTriangles,cfg.asset.visibleMeshes],[6512,4]);
 assert.deepEqual(validateQianqingAuxiliary(await asset(),cfg,scene),{tris:6512,meshes:4,colliders:12,walkables:15});
});
for(const mutation of['missing-contract','wrong-source','old-proxy','missing-step','moved-post','missing-core','extra-geometry','same-count-wrong-geometry','wrong-visible-transform'])test('current R32 auxiliary rejects '+mutation+' before registration',async()=>{
 const s=setup(),r=await asset(),before=snapshot(s.cm);
 try{
  assert.deepEqual(validateQianqingAuxiliary(r,cfg,s.s),{tris:6512,meshes:4,colliders:12,walkables:15},'the unmodified current asset must be accepted first');
  if(mutation==='missing-contract')r.remove(r.getObjectByName('QIANQING_AUXILIARY_CONTRACT'));
  if(mutation==='wrong-source')r.getObjectByName('QIANQING_AUXILIARY_CONTRACT').userData.sourceSHA256='0'.repeat(64);
  if(mutation==='old-proxy')r.getObjectByName('COL_qianqing_rail_post_0_0').name='COL_step_side_1';
  if(mutation==='missing-step')r.remove(r.getObjectByName('WALK_qianqing_step_1_0'));
  if(mutation==='moved-post')r.getObjectByName('COL_qianqing_rail_post_0_0').position.z+=.3;
  if(mutation==='missing-core')s.s.getObjectByName('qianqing-central-setting-detail').removeFromParent();
  if(mutation==='extra-geometry')r.add(new T.Mesh(new T.BoxGeometry(),new T.MeshBasicMaterial()));
  if(mutation==='same-count-wrong-geometry'||mutation==='wrong-visible-transform'){
   const inventory=()=>{const rows=[];r.traverse(o=>{if(o.isMesh&&!/^(COL_|WALK_)/.test(o.name))rows.push([o.name,o.geometry.attributes.position.count,o.geometry.index?.count??null]);});return rows;};
   const original=inventory(),name=mutation==='same-count-wrong-geometry'?'merged_red_lacquer':'floor_tiles',mesh=r.getObjectByName(name);
   assert.ok(mesh?.isMesh,'mutation must target an actual current visible mesh: '+name);
   if(mutation==='same-count-wrong-geometry'){const a=mesh.geometry.attributes.position;a.setY(0,a.getY(0)+.25);}
   else mesh.position.y+=.25;
   assert.deepEqual(inventory(),original,'visible mesh, vertex and index counts stay unchanged');
   assert.throws(()=>validateQianqingAuxiliary(r,cfg,s.s),/exact visible geometry identity mismatch/);
  }
  s.loader.gltf.load=(_u,ok)=>ok({scene:r});
  assert.equal(await s.loader.load('qianqing'),false);assert.equal(snapshot(s.cm),before);assert.equal(s.s.getObjectByName('interior:qianqing'),undefined);
 }finally{s.loader.dispose();s.bb.dispose();}
});
test('current R32 auxiliary loads/fades/unloads/reloads without hiding, duplicating or disposing permanent core',async()=>{const s=setup(),before=snapshot(s.cm),core=s.s.getObjectByName('qianqing-central-setting-detail'),residentColliders=s.cm.colliders.length,residentWalkables=s.cm.walkables.length;const historicalR31=restorePreR32Navigation({colliders:s.bb.colliders,walkables:s.bb.walkables});assert.equal(historicalR31.colliders.length,2503);assert.equal(historicalR31.walkables.length,120);let disposed=0;core.levels[0].object.children[0].geometry.addEventListener('dispose',()=>disposed++);for(let i=0;i<2;i++){const r=await asset();s.loader.gltf.load=(_u,ok)=>ok({scene:r});assert.equal(await s.loader.load('qianqing'),true);assert.equal(s.cm.colliders.length,residentColliders+12);assert.equal(s.cm.walkables.length,residentWalkables+15);assert.equal(s.s.getObjectByName('qianqing-central-setting-detail'),core);s.loader.update({x:0,z:316.8},performance.now()+500);assert.equal(s.loader.halls.get('qianqing').fade,null);s.loader.unload('qianqing');assert.equal(snapshot(s.cm),before);assert.equal(disposed,0);}s.loader.dispose();s.bb.dispose();assert.equal(disposed,1);});
test('late callback and post-attachment failure dispose only the optional layer',async()=>{const s=setup(),before=snapshot(s.cm);let cb;s.loader.gltf.load=(_u,ok)=>cb=ok;const pending=s.loader.load('qianqing');s.loader.unload('qianqing');cb({scene:await asset()});assert.equal(await pending,false);assert.equal(snapshot(s.cm),before);const add=s.s.add;s.s.add=function(o){add.call(this,o);if(o.name==='interior:qianqing')throw Error('test attachment failure');return this};s.loader.gltf.load=(_u,ok)=>ok({scene:null});const r=await asset();s.loader.gltf.load=(_u,ok)=>ok({scene:r});assert.equal(await s.loader.load('qianqing'),false);assert.equal(snapshot(s.cm),before);assert.equal(s.s.getObjectByName('interior:qianqing'),undefined);s.s.add=add;s.loader.dispose();s.bb.dispose();});

test('current R32 loaded side loops use real clearance outside the permanent incense guards and retain the blocked core',async()=>{const{buildWorld,walkStraight}=await import('./lib/world.mjs'),w=await buildWorld(),root=await asset(),floor=w.cm.getGroundHeight(cfg.frame.x,cfg.frame.z,0,999);close(floor,2.16);root.position.set(cfg.frame.x,floor,cfg.frame.z);root.updateMatrixWorld(true);root.traverse(o=>{if(!o.isMesh)return;const box=new T.Box3().setFromObject(o);if(o.name.startsWith('COL_'))w.cm.addCollider(box,'interior:qianqing');if(o.name.startsWith('WALK_'))w.cm.addWalkable({type:'box',box,rescue:false},'interior:qianqing');});const outcomes=[];
 // The old x=±5.6 segment now meets a permanent floor-side incense guard.
 // Keep that obstruction checked; the legal lane is outside it at ±6.45.
 for(const sign of[-1,1]){const oldLane=walkStraight(w,[sign*5.6,313.7],[sign*5.6,331],{feet0:2.16,step:.05});close(oldLane.reached,2.25,.051);const pts=[[0,301],[0,313.7],[sign*6.45,313.7],[sign*6.45,331],[0,331]],route=[...pts,...pts.slice(0,-1).reverse()];let feet=2;for(let i=1;i<route.length;i++){const r=walkStraight(w,route[i-1],route[i],{feet0:feet,step:.05});assert.ok(r.reached>=r.total-.1,JSON.stringify({sign,i,r}));feet=r.feet;outcomes.push({sign,i,reached:r.reached,total:r.total});}}
 const blocked=walkStraight(w,[0,315],[0,322],{feet0:2.16,step:.05});assert.ok(blocked.reached<1.1,'display core must remain excluded');assert.ok(outcomes.length===16);
});

test('official fully panelled ceiling removes the inherited generic caisson in B and S',async()=>{const builder=read('src/scene/PalaceBuilder.js').toString(),generator=read('assets-src/interiors/build_qianqing_auxiliary.py').toString();assert.ok(builder.includes('if (caisson && !qianqing)'));assert.ok(!generator.includes('caisson(cfg,'));const r=await asset();const names=[];r.traverse(o=>{if(o.isMesh)names.push(o.material.name)});assert.ok(!names.includes('caisson_blue'));assert.ok(!names.includes('mirror_pearl'));assert.equal(r.getObjectByName('QIANQING_AUXILIARY_CONTRACT').userData.ceiling,'fully-panelled-no-caisson');});

test('all new S collision and step proxies are contained within the unchanged permanent exclusion',async()=>{const s=setup(),r=await asset(),floor=s.cm.getGroundHeight(cfg.frame.x,cfg.frame.z,0,999);r.position.set(cfg.frame.x,floor,cfg.frame.z);r.updateMatrixWorld(true);const bounds=new T.Box3(new T.Vector3(f.bounds.minX,f.y,f.bounds.minZ),new T.Vector3(f.bounds.maxX,f.y+3,f.bounds.maxZ)),expanded=bounds.clone().expandByScalar(1e-5);let n=0;r.traverse(o=>{if(o.isMesh&&/^(COL_|WALK_)/.test(o.name)){assert.ok(expanded.containsBox(new T.Box3().setFromObject(o)),o.name+' extends existing exclusion');n++;}});assert.equal(n,27);assert.ok(s.cm.colliders.some(c=>c.box.equals(bounds)),'permanent excluded core must exist before S load');s.loader.dispose();s.bb.dispose();});

test('perforated screen crests have no collapsed faces or zero normals',()=>{for(const m of near.filter(o=>o.name.startsWith('qianqing-open-carved-crest-'))){const p=m.geometry.attributes.position,n=m.geometry.attributes.normal;assert.equal(p.count,282);for(let i=0;i<n.count;i++)assert.ok(Math.abs(Math.hypot(n.getX(i),n.getY(i),n.getZ(i))-1)<1e-5);const a=new T.Vector3(),b=new T.Vector3(),c=new T.Vector3();for(let i=0;i<p.count;i+=3){a.fromBufferAttribute(p,i);b.fromBufferAttribute(p,i+1);c.fromBufferAttribute(p,i+2);assert.ok(b.sub(a).cross(c.sub(a)).lengthSq()>1e-14);}}});
