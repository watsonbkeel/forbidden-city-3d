import test from 'node:test';
import assert from 'node:assert/strict';
import {Raycaster, Vector3} from 'three';
import {PLAYER} from '../../src/config/constants.js';
import {fixture as fanhua} from '../r164-fanhua-stair-contact/fixture.mjs';
import {fixture as player} from '../lib/r72-player-fixture.mjs';

for (const fps of [10, 60]) {
  test(`Fanhua's visible south lintel stops an ordinary upward jump at ${fps}Hz`, t => {
    const a = fanhua(), cleanup = [() => a.dispose()];
    const p = player({after: fn => cleanup.push(fn)});
    const c = new p.controls.constructor(p.camera.clone(), p.controls.domElement, a.cm);
    cleanup.push(() => c.dispose());
    // The fixture restores window; close our controller before that happens.
    t.after(() => {for (const close of cleanup.reverse()) close();});
    const tick = () => {p.step(1/fps); c.update();};
    const x = -340, z = 507.85;
    a.f.updateWorldMatrix(true, true);
    const lintel = new Raycaster(new Vector3(x, 2, z), new Vector3(0, 1, 0)).intersectObject(a.f, true)
      .find(h => h.object.userData.role === 'fanhua-south-door-lintel');
    assert.ok(lintel && Math.abs(lintel.point.y-3.15) < .00001, 'the existing visible lintel remains');
    const lowerFace = lintel.point.y;

    function jumpAt(zz, feet) {
      c.setPosition(x, feet+PLAYER.HEIGHT, zz);
      for (let n=0; n<fps; n++) tick();
      assert.ok(Math.abs(c.feetY-feet) < .00001, 'unmodified floor or stair launch support');
      c.jump();
      let peak = -Infinity, overlaps = 0;
      for (let n=0; n<fps*3; n++) {
        tick();
        const eye = new Vector3(c.camera.position.x, c.feetY+PLAYER.HEIGHT, c.camera.position.z);
        peak = Math.max(peak, eye.y);
        if (a.cm.checkCollision(eye, .5)) overlaps++;
      }
      assert.ok(Math.abs(c.feetY-feet) < .00001, 'player returns to original support');
      assert.equal(c.airborne, false, 'real controller lands');
      return {peak, overlaps};
    }

    const under = jumpAt(z, .5);
    assert.ok(under.peak <= lowerFace + .00001, `player eye ${under.peak} crossed lintel underside ${lowerFace}`);
    assert.ok(under.peak > 3.1, 'jump reaches the lintel rather than being disabled');
    assert.equal(under.overlaps, 0);
    const outside = jumpAt(505.55, .4);
    assert.ok(outside.peak > 3.55, 'ordinary jump is not curtailed in front of the door');
    assert.equal(outside.overlaps, 0);
  });
}
