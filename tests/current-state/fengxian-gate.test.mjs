import assert from 'node:assert/strict';
import {after, before, test} from 'node:test';
import * as T from 'three';
import {createCanvas} from '@napi-rs/canvas';
import eastSix from '../../data/zones/east-six.json' with {type:'json'};
import {ZoneBase} from '../../src/scene/zones/ZoneBase.js';
import {CollisionManager} from '../../src/utils/Collision.js';
import {PLAYER} from '../../src/config/constants.js';
import {installCpuDocument} from '../lib/finished-world-lifecycle.mjs';
import {createActualLibrary} from '../r158-cumulative-1600/library.mjs';

const x = -181, z = 203.3, half = 9.75;
let dom, lib, zone, result, gate, cm;
before(() => {
  dom = installCpuDocument(createCanvas);
  lib = createActualLibrary();
  zone = new ZoneBase(lib.library, eastSix);
  const finish = zone.kit.finish.bind(zone.kit);
  zone.kit.finish = () => {
    zone.kit.root.updateMatrixWorld(true);
    gate = zone.kit.root.children.find(f => f.name === '奉先门');
    return finish();
  };
  result = zone.build();
  result.group.updateMatrixWorld(true);
  cm = new CollisionManager();
  cm.addColliders(result.colliders, 'east-six');
  cm.addWalkables(result.walkables, 'east-six');
});
after(() => { try { cm?.clear(); zone?.dispose(); lib?.dispose(); } finally { dom?.restore(); } });

test('east-six ships one E56 glazed three-arch gate, not a shared hall preset', () => {
  const entries = result.group.userData.architecture.filter(r => r.id === 'FC-EF18B2CEC2');
  assert.equal(entries.length, 1, 'E56 must own its live architecture');
  assert.equal(entries[0].dimensionStatus, 'PHOTO_FIT_NOT_SURVEY');
  assert.equal(entries[0].siteAccessVerified, false);
  const arches = gate.children.filter(n => n.userData.fengxianPart === 'arch-vault');
  assert.equal(arches.length, 3);
  const [a, b, c] = arches.map(n => n.userData.aperture);
  assert.ok(b.width > a.width && b.width > c.width);
  assert.ok(b.crownY > a.crownY && b.crownY > c.crownY);
  assert.equal(gate.children.filter(n => n.userData.fengxianPart === 'local-roof').length, 5);
  assert.equal(result.mapItems.filter(r => r.name === '奉先门').length, 1);
  assert.equal(result.mapItems.find(r => r.name === '奉先门').w, half * 2);
});

test('merged masonry has a real curved opening, fitted red leaves and a continuous tall backing wall', () => {
  const at = (dx, y) => new T.Raycaster(new T.Vector3(x + dx, y, z - 6), new T.Vector3(0, 0, 1), 0, 9)
    .intersectObject(result.group, true);
  const p = gate.children.filter(n => n.userData.fengxianPart === 'arch-vault').map(n => n.userData.aperture);
  assert.equal(at(0, 1.7).length, 0, 'existing centre route cannot look through rendered wall');
  assert.equal(at(0, p[1].crownY - 0.12).length, 0, 'crown is physically open below the curve');
  assert.ok(at(p[1].width / 2 - .13, p[1].crownY - .12).length, 'curved shoulder is solid');
  for (const entry of [p[0], p[2]]) assert.ok(at(entry.x, 1.7).length, 'side leaves visible');
  for (const dx of [-half - .02, -half, -half + .02, 0, half - .02, half, half + .02]) {
    assert.ok(at(dx, 5.95).length, 'backing wall must span above portals and join the retained wall');
  }
});

test('centre still walks both ways, side leaves and south-wall seams still block', () => {
  const body = (dx, dz, y=PLAYER.HEIGHT) => new T.Vector3(x + dx, y, z + dz);
  const blocked = pos => cm.checkCollision(pos, .5);
  for (const side of [-1, 1]) {
    for (let i = 0; i <= 60; i++) {
      const dz = side * (-4.5 + i * .15);
      const localY = cm.getGroundHeight(x, z + dz, 0, PLAYER.STEP_UP, .5);
      assert.ok(localY >= 0 && localY <= PLAYER.STEP_UP);
      assert.ok(!blocked(body(0, dz, PLAYER.HEIGHT + localY)), 'clear continuous centre at ' + dz);
    }
  }
  for (const dx of [-half, -5.5, 5.5, half]) assert.ok(blocked(body(dx, 0)), 'blocked side or wall seam: ' + dx);
});
