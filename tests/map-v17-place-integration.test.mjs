import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import * as THREE from 'three';
import { buildWorld } from './lib/world.mjs';
import { setupMap } from './lib/map-fixture.mjs';
import { ZoneManager } from '../src/scene/zones/ZoneManager.js';
import { INITIAL_VIEW_POSITION } from '../src/config/initialView.js';

// Production zone JSON imports use Vite's JSON handling. Adapt only the import
// attribute for Node, as in the existing Qin'an CPU integration tests.
const hooks = registerHooks({ load(url, context, next) {
  return next(url, url.endsWith('.json')
    ? { ...context, importAttributes: { ...context.importAttributes, type: 'json' } }
    : context);
} });
const { ZONES } = await import('../data/zones/index.js');
const { Teleport } = await import('../src/ui/Teleport.js');
hooks.deregister();

test('All 159 integrated cards use actual seven-zone map records and explicit safe travel', async t => {
  // Build the unchanged permanent scene, then let the real manager build,
  // load/unload and register all seven side zones. Only DOM/canvas, texture
  // fetching and time are fixtures; no browser, server or WebGL is launched.
  const permanent = await buildWorld({ zones: [] });
  const s = await setupMap(t);
  s.window.location = { search: '' };
  s.document.createElementNS = (_namespace, tag) => s.document.createElement(tag);
  s.c.collisionManager = permanent.cm;
  const materials = new Map();
  const library = new Proxy({
    material: name => materials.get(name) ??
      (materials.set(name, new THREE.MeshStandardMaterial({ name })), materials.get(name)),
    tileSize: () => 1, aspect: () => 1,
  }, { get: (object, key) => key in object ? object[key] : () => null });
  const manager = new ZoneManager();
  const scene = new THREE.Scene();
  t.after(() => { if (manager.scene) manager.dispose(); });
  for (const zone of ZONES) manager.register(zone);
  manager.init(scene, library, permanent.cm, INITIAL_VIEW_POSITION);
  permanent.cm.setRegions(manager.getRegions());
  assert.equal(manager.zones.size, 7);
  const teleport = new Teleport(s.c, manager, permanent.cm);
  t.after(() => teleport.dispose());
  const go = t.mock.method(teleport, 'go');
  s.map.items = manager.getMapItems();
  s.map.hasTeleportTarget = name => teleport.targets.has(name);
  s.map.onTeleport = name => teleport.go(name);
  s.map.renderBase();
  const informationButtons = s.map.placeList.querySelectorAll('button');
  assert.equal(informationButtons.length, 159);
  assert.equal(s.map.placeCatalog.places.length, 159);
  for (const [index, place] of s.map.placeCatalog.places.entries()) {
    const name = place.modelExperience.teleportTargetName;
    assert.equal(teleport.targets.has(name), true, `${place.id}: production target exists`);
    const labels = s.map.labels.filter(label => label.placeId === place.id);
    assert.ok(labels.length <= 1, `${place.id}: no ambiguous production map label`);
    if (index < 14) assert.equal(labels.length, 1, `${place.id}: original map label retained`);
    if (labels.length) assert.equal(labels[0].name, name);
    if (place.sceneBinding.kind === 'zone') {
      const items=s.map.items.filter(item=>item.name===name);
      assert.equal(items.length,1,`${place.id}: one real map footprint`);
      assert.equal(s.map.placeCatalog.forMapItem(items[0],s.map.items)?.id,place.id,`${place.id}: real footprint binds even when label is crowded out`);
    }
    s.map.toggle();
    const before = s.c.getPosition().clone(), calls = go.mock.callCount();
    informationButtons[index].click();
    assert.equal(s.map.selectedPlaceId, place.id);
    assert.equal(go.mock.callCount(), calls, `${place.id}: reading never travels`);
    assert.ok(s.c.getPosition().equals(before));
    const travel = s.map.placePanel.element.querySelector('#place-travel');
    assert.ok(travel, `${place.id}: unambiguous explicit travel is available`);
    travel.click();
    assert.equal(go.mock.callCount(), calls + 1, `${place.id}: one explicit travel`);
    const point = go.mock.calls.at(-1).result;
    assert.ok(point, `${place.id}: actual collision-backed landing resolves`);
    assert.equal(point.name, name);
    assert.ok([point.x, point.y, point.z].every(Number.isFinite));
    assert.equal(s.map.visible, false);
    assert.equal(permanent.cm.checkCollision(s.c.getPosition(), .5), false);
    if (place.id === 'qinan') {
      assert.equal(point.mode, 'exterior-view');
      assert.equal(point.viewpointVerified, true);
      assert.equal(point.y, 0);
    }
    t.diagnostic(JSON.stringify({ id: place.id, name, landing: [point.x, point.y, point.z], zone: point.zone, mode: point.mode ?? 'existing-teleport' }));
  }
});
