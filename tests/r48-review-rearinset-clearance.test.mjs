import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { readFileSync } from 'node:fs';
import { ZoneBase } from '../src/scene/zones/ZoneBase.js';
import { library } from './lib/inner-palace-fixture.mjs';
import { CollisionManager } from '../src/utils/Collision.js';
const data = JSON.parse(readFileSync(new URL('../data/zones/west-six.json', import.meta.url)));
for (const name of ['太极殿', '翊坤宫后殿']) for (const side of [-1, 1]) {
  test(`independent ${name} rear porch side ${side} admits actual 0.5m player radius`, () => {
    const item = data.items.find(i => i.name === name);
    const b = new ZoneBase(library(), data);
    const { f, p } = b.buildHall(item);
    const cm = new CollisionManager();
    cm.rivers = [];
    cm.addColliders(b.kit.colliders);
    cm.addWalkables(b.kit.walkables);
    const inset = f.userData.rearPorchDepthFit;
    assert.ok(Number.isFinite(inset) && inset > 0);
    try {
      const x = item.x + side * item.w / 2;
      const rear = item.z + item.d / 2;
      const clear = [];
      for (let z = rear - inset; z <= rear; z += .005) {
        if (!cm.checkCollision(new THREE.Vector3(x, item.ph + 1.7, z), .5)) clear.push(z);
      }
      assert.ok(clear.length > 0, `${name} side ${side}: no actual player centre fits anywhere along rear porch side aperture`);
    } finally { b.kit.dispose(f); }
  });
}
