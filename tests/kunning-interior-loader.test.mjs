import assert from 'node:assert/strict';
import { test } from 'node:test';
import { registerHooks } from 'node:module';
import fs from 'node:fs';
// The five unchanged legacy manifests omit JSON attributes; use a test-only bridge.
registerHooks({ load(url, context, next) {
  if (url.endsWith('.json')) return { format: 'module', source: `export default ${fs.readFileSync(new URL(url), 'utf8')}`, shortCircuit: true };
  return next(url, context);
} });
const THREE = await import('three');
const { InteriorLoader } = await import('../src/scene/interior/InteriorLoader.js');
const { INTERIORS } = await import('../src/scene/interior/registry.js');
const { CollisionManager } = await import('../src/utils/Collision.js');

function setup() {
  const scene = new THREE.Scene(), cm = new CollisionManager();
  const base = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial());
  base.name = 'B-permanent'; scene.add(base);
  cm.addCollider(new THREE.Box3(new THREE.Vector3(20, 0, 20), new THREE.Vector3(21, 2, 21)), 'B');
  const loader = new InteriorLoader(scene, cm, { registry: { kunning: INTERIORS.kunning } });
  return { scene, cm, loader, base };
}
function rootWithProxy(name = 'COL_bed') {
  const root = new THREE.Group();
  const proxy = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1)); proxy.name = name;
  proxy.position.set(-15, 0.5, 5); root.add(proxy);
  return root;
}

test('Kunning rejects absent profile metadata before installing any S state', async () => {
  const { loader, scene, cm, base } = setup();
  loader.gltf.load = (_url, ok) => ok({ scene: rootWithProxy() });
  assert.equal(await loader.load('kunning'), false);
  assert.equal(loader.getState('kunning'), 'failed');
  assert.deepEqual(scene.children, [base]);
  assert.equal(cm.colliders.length, 1);
  assert.equal(cm.walkables.length, 0);
  loader.dispose();
});

test('cancellation discards late Kunning scene without touching permanent B', async () => {
  const { loader, scene, cm, base } = setup();
  let deliver;
  loader.gltf.load = (_url, ok) => { deliver = ok; };
  const pending = loader.load('kunning'); loader.unload('kunning');
  deliver({ scene: rootWithProxy() });
  assert.equal(await pending, false);
  assert.equal(loader.getState('kunning'), 'idle');
  assert.deepEqual(scene.children, [base]);
  assert.equal(cm.colliders.length, 1);
  loader.dispose();
});

test('unchanged Cining retains the legacy optional-proxy contract', async () => {
  const scene = new THREE.Scene(), cm = new CollisionManager();
  const loader = new InteriorLoader(scene, cm, { registry: { cining: INTERIORS.cining } });
  loader.gltf.load = (_url, ok) => ok({ scene: rootWithProxy('COL_legacy') });
  assert.equal(await loader.load('cining'), true);
  assert.equal(cm.colliders.length, 1);
  loader.unload('cining'); assert.equal(cm.colliders.length, 0);
  loader.dispose();
});

const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
async function actualRoot() {
  const bytes=fs.readFileSync(new URL(`../public${INTERIORS.kunning.model}`,import.meta.url));
  return (await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'')).scene;
}
function deliver(loader, root) { loader.gltf.load=(_url,ok)=>ok({scene:root}); }

for (const key of ['profileId','profileRevision','profileHash','ownership']) test(`Kunning rejects stale or wrong ${key} without any registered state`, async () => {
  const {loader,scene,cm,base}=setup(); const root=await actualRoot();
  root.getObjectByName('KUNNING_CONTRACT').userData[key]='wrong'; deliver(loader,root);
  assert.equal(await loader.load('kunning'),false);
  assert.deepEqual(scene.children,[base]); assert.equal(cm.colliders.length,1);
  loader.dispose();
});

test('actual GLTFLoader extras roundtrip supports fade, unload and reload with exact proxies', async () => {
  const {loader,scene,cm,base}=setup(); deliver(loader,await actualRoot());
  assert.equal(await loader.load('kunning'),true);
  assert.equal(cm.colliders.length,1+Object.keys(INTERIORS.kunning.furnitureProxies).length);
  const f=INTERIORS.kunning.frame;
  loader.update({x:f.x,z:f.z},performance.now()+500);
  assert.equal(loader.halls.get('kunning').fade,null);
  loader.unload('kunning'); assert.deepEqual(scene.children,[base]);assert.equal(cm.colliders.length,1);
  deliver(loader,await actualRoot());assert.equal(await loader.load('kunning'),true);
  assert.equal(cm.colliders.length,1+Object.keys(INTERIORS.kunning.furnitureProxies).length);
  loader.dispose();assert.deepEqual(scene.children,[base]);assert.equal(cm.colliders.length,1);
});

for (const bad of ['COL_door_backing','WALK_fake_floor']) test(`Kunning rejects forbidden proxy ${bad}`,async()=>{
  const {loader,cm}=setup(); const root=await actualRoot();
  root.getObjectByName('COL_bed').name=bad;deliver(loader,root);
  assert.equal(await loader.load('kunning'),false);assert.equal(cm.colliders.length,1);loader.dispose();
});

test('Kunning rejects actual visible triangles in true doorway even with a valid contract',async()=>{
  const {loader,cm}=setup(); const root=await actualRoot();
  const p=INTERIORS.kunning.protectedVolumes.find(v=>v.id==='south-door-traversal').bounds;
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(0.2,1,0.2),new THREE.MeshBasicMaterial());
  mesh.name='unregistered_backing';mesh.position.set((p.min[0]+p.max[0])/2,1,(p.min[2]+p.max[2])/2);root.add(mesh);deliver(loader,root);
  assert.equal(await loader.load('kunning'),false);assert.equal(cm.colliders.length,1);loader.dispose();
});

test('Kunning rolls back partially registered collisions after an install exception',async()=>{
  const {loader,cm,scene,base}=setup();deliver(loader,await actualRoot());
  cm.addWalkables=()=>{throw new Error('Injected install interruption after colliders');};
  assert.equal(await loader.load('kunning'),false);
  assert.equal(cm.colliders.length,1);assert.equal(cm.walkables.length,0);assert.deepEqual(scene.children,[base]);
  assert.equal(loader.getGroup('kunning'),null);loader.dispose();
});

test('dispose while loading discards late geometry and preserves B',async()=>{
  const {loader,scene,cm,base}=setup();let done;loader.gltf.load=(_u,ok)=>{done=ok;};
  const pending=loader.load('kunning');loader.dispose();done({scene:await actualRoot()});
  assert.equal(await pending,false);assert.deepEqual(scene.children,[base]);assert.equal(cm.colliders.length,1);
});
