/** R57 actual Huangji bytes and production loader in one small hall fragment.
 * Not a full-world, ZoneManager, character-binding, network, texture, or GPU test. */
import test, {after} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {registerHooks} from 'node:module';
import * as THREE from 'three';
import {CourtKit} from '../src/scene/palace/kit.js';
import {CollisionManager} from '../src/utils/Collision.js';
import {resolveRemainingProfile, augmentRemainingHall} from '../src/scene/palace/special/RemainingNingshouHalls.js';
import {library} from './lib/inner-palace-fixture.mjs';
import {actualKunningRoot} from './lib/r55-kunning-asset.mjs';
import {actualHuangjiRoot, auditHuangjiLoadedInWorld, resetHuangjiAuditBaseline, huangjiRootSignature} from './lib/r57-huangji-streaming.mjs';
const hook = registerHooks({load(url, context, next) { return next(url, url.endsWith('.json') ? {...context, importAttributes:{...context.importAttributes,type:'json'}} : context); }});
const {InteriorLoader} = await import('../src/scene/interior/InteriorLoader.js');
hook.deregister();
const cfg = JSON.parse(fs.readFileSync(new URL('../data/interiors/huangji.json', import.meta.url)));
const item = JSON.parse(fs.readFileSync(new URL('../data/zones/ningshou.json', import.meta.url))).items.find(i => i.name === '皇极殿');
const kit = new CourtKit(library(), 'r57-huangji-fragment');
augmentRemainingHall(kit, item, kit.hall(item), resolveRemainingProfile('ningshou', item));
kit.buildPlaqueAtlas();
const scene = new THREE.Scene(), group = kit.finish(), cm = new CollisionManager();
scene.add(group); scene.updateMatrixWorld(true); cm.rivers = [];
cm.addColliders(kit.colliders, 'r57-real-B-huangji'); cm.addWalkables(kit.walkables, 'r57-real-B-huangji');
const W = {scene, cm, THREE}, interiors = new InteriorLoader(scene, cm, {registry:{huangji:cfg}}), evidence = [];
const audit = async layer => { const result = await auditHuangjiLoadedInWorld(W, {interiors, layer}); evidence.push(result); return result; };
function deliver(root) { interiors.gltf.load = (url, ok) => { assert.equal(url, cfg.model, 'exact production URL, no catch-all mapping'); ok({scene:root}); }; }
function disposeWatch(root) { const counts = new Map(); root.traverse(o => { if (o.isMesh) for (const r of [o.geometry, ...[].concat(o.material)]) if (!counts.has(r)) { counts.set(r,0); r.addEventListener('dispose', () => counts.set(r,counts.get(r)+1)); }}); return () => assert.ok([...counts.values()].every(n => n === 1), 'all independent loaded resources disposed exactly once'); }
async function rejected(root) { deliver(root); const restore = console.warn; console.warn = () => {}; try { assert.equal(await interiors.load('huangji'), false); } finally { console.warn = restore; } await audit('B'); interiors.unload('huangji'); }

test('exact configured Draco bytes retain source hierarchy, normals, floor vertex colors and PBR materials', async () => {
 const b = fs.readFileSync(new URL('../public'+cfg.model, import.meta.url));
 assert.equal(createHash('sha256').update(b).digest('hex'), '0a79ec49e8cd442d363fdc6bccf4074d9e214ef3b0f3b56eba618297c1e88cc6');
 const raw = JSON.parse(b.toString('utf8',20,20+b.readUInt32LE(12))), root = await actualHuangjiRoot();
 assert.ok(root?.isObject3D, 'must return decoded scene, not label or null');
 assert.equal(root.children.length, raw.nodes.length); assert.deepEqual(root.children.map(n=>n.name),raw.nodes.map(n=>n.name));
 assert.equal(raw.images?.length??0,0); assert.equal(raw.textures?.length??0,0);
 for (let i=0;i<raw.nodes.length;i++) { const n=raw.nodes[i], o=root.children[i]; assert.deepEqual(o.position.toArray(), n.translation??[0,0,0]); assert.ok(o.geometry.attributes.normal); }
 const floor=root.getObjectByName('floor_tiles'); assert.equal(floor.material.vertexColors,true); assert.equal(floor.geometry.attributes.color.count,12320);
 assert.equal(root.getObjectByName('merged_mirror_pearl').material.metalness,1, 'glTF default metallic factor is preserved');
 const second=await actualHuangjiRoot(); assert.equal(huangjiRootSignature(root),huangjiRootSignature(second));
 assert.notEqual(root.children[0].geometry,second.children[0].geometry); assert.notEqual(root.children[0].material,second.children[0].material);
 for (const r of [root,second]) { const resources=new Set(); r.traverse(o=>{if(o.isMesh){resources.add(o.geometry);[].concat(o.material).forEach(m=>resources.add(m));}}); resources.forEach(x=>x.dispose()); }
});

test('actual public load/update/unload atomically swaps four real fallbacks and restores exact B registrations', async () => {
 const before=await audit('B'); assert.equal(before.layer,'B');
 const root=await actualHuangjiRoot(), disposed=disposeWatch(root); deliver(root);
 assert.equal(await interiors.load('huangji'),true); interiors.update({x:cfg.frame.x,z:cfg.frame.z},performance.now()+500);
 const loaded=await audit('S'); assert.equal(loaded.renderableTriangles,24024); assert.equal(loaded.colliders,53); assert.equal(loaded.walkables,1);
 assert.equal(loaded.atomicSwap,true); assert.equal(loaded.fadeActive,false); assert.equal(loaded.loadedRootSignature,huangjiRootSignature(root));
 assert.equal(await interiors.load('huangji'),true); await audit('S');
 assert.throws(()=>resetHuangjiAuditBaseline(W), /reset only after S unloaded/);
 interiors.unload('huangji'); await audit('B'); disposed();
});

test('label-only scene and a different real hall asset are rejected without fallback/collision mutations', async () => {
 const fake=new THREE.Group(); fake.name='actual-decoded-huangji';
 await rejected(fake); await rejected(await actualKunningRoot());
});

test('audit rejects same-label same-count altered geometry and changed material semantics', async () => {
 const root=await actualHuangjiRoot(); deliver(root); assert.equal(await interiors.load('huangji'),true); await audit('S');
 const mesh=root.getObjectByName('throne_cushion'), a=mesh.geometry.attributes.position, old=a.getX(0); a.setX(0,old+.0001);
 await assert.rejects(auditHuangjiLoadedInWorld(W,{interiors,layer:'S'}), /actual Huangji hierarchy\/geometry\/materials/);
 a.setX(0,old); const rough=mesh.material.roughness; mesh.material.roughness=rough+.01;
 await assert.rejects(auditHuangjiLoadedInWorld(W,{interiors,layer:'S'}), /actual Huangji hierarchy\/geometry\/materials/);
 mesh.material.roughness=rough; await audit('S'); interiors.unload('huangji'); await audit('B');
});

test('late canceled actual-byte delivery is disposed and cannot replace a newer loaded generation', async () => {
 let late; interiors.gltf.load=(url,ok)=>{assert.equal(url,cfg.model);late=ok;};
 const stale=await actualHuangjiRoot(), disposed=disposeWatch(stale), pending=interiors.load('huangji');
 interiors.unload('huangji'); await audit('B');
 const fresh=await actualHuangjiRoot(); deliver(fresh); assert.equal(await interiors.load('huangji'),true); await audit('S');
 late({scene:stale}); assert.equal(await pending,false); disposed();
 assert.equal(interiors.getGroup('huangji').children[0],fresh); await audit('S');
 interiors.unload('huangji'); await audit('B');
});

test('explicit B audit rejects changed collider/support values and missing fallback identity', async () => {
 const c=cm.colliders[0].box, old=c.min.x; c.min.x+=.01;
 await assert.rejects(auditHuangjiLoadedInWorld(W,{interiors,layer:'B'}), /B collision and support/); c.min.x=old;
 const w=cm.walkables.find(w=>w.type==='box'), top=w.box.max.y; w.box.max.y+=.01;
 await assert.rejects(auditHuangjiLoadedInWorld(W,{interiors,layer:'B'}), /B collision and support/); w.box.max.y=top;
 const fallback=[];scene.traverse(o=>{if(o.userData.role==='huangji-kit-throne-fallback')fallback.push(o);});
 const parent=fallback[0].parent;parent.remove(fallback[0]);
 await assert.rejects(auditHuangjiLoadedInWorld(W,{interiors,layer:'B'}), /fallback/);parent.add(fallback[0]);
 const rough=fallback[0].material.roughness;fallback[0].material.roughness+=.01;
 await assert.rejects(auditHuangjiLoadedInWorld(W,{interiors,layer:'B'}), /fallback geometry\/material semantics/);fallback[0].material.roughness=rough;
 await audit('B'); resetHuangjiAuditBaseline(W); await audit('B');
});

test('production suspension unload and recovery leave no S remnants', async () => {
 deliver(await actualHuangjiRoot()); assert.equal(await interiors.load('huangji'),true); await audit('S');
 interiors.setSuspended(true); await audit('B'); interiors.setSuspended(false);
 deliver(await actualHuangjiRoot()); assert.equal(await interiors.load('huangji'),true); await audit('S');
 interiors.dispose(); await audit('B');
});

after(() => {
 interiors.dispose(); kit.dispose(group);
 if(process.env.R57_WRITE_EVIDENCE==='1') fs.writeFileSync(new URL('../reports/r57-unified/huangji-local/evidence.json',import.meta.url),JSON.stringify({scope:'ONE_REAL_HUANGJI_HALL_FRAGMENT_NOT_FULL_WORLD',baseCommit:'171e819',limitations:['No network delivery','No texture rendering','No GPU rendering','No ZoneManager cold entry/unload/rebind','No character binding assertions'],evidence},null,2)+'\n');
});
