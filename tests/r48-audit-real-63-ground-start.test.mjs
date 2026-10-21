// Independent all-63 ground-start check: original driver thresholds, controller and route objects.
import test from 'node:test';import assert from 'node:assert/strict';import {writeFileSync} from 'node:fs';
import {buildWorld} from './lib/world.mjs';import {buildAutoRoutes} from './lib/auto-routes.mjs';
import {FirstPersonControls} from '../src/controls/FirstPerson.js';import {PLAYER} from '../src/config/constants.js';import {replayTerrace} from './lib/terrace-walk.mjs';
const W=await buildWorld({realMaterials:true}), routes=buildAutoRoutes(W,W.zones.map(z=>z.json)).filter(r=>r.gateProfile!=='zhaode'), results=[];
function replay(t, world, pts, fps, sprint, backward=false) {
  const noop = () => {};
  const doc = { ...globalThis.document, addEventListener: noop, removeEventListener: noop, exitPointerLock: noop };
  const oldDoc = globalThis.document, oldWindow = globalThis.window;
  globalThis.document = doc;
  globalThis.window = { addEventListener: noop, removeEventListener: noop };
  let time = 0;
  const clock = t.mock.method(performance, 'now', () => time);
  const camera = new world.THREE.PerspectiveCamera();
  const controls = new FirstPersonControls(camera, { ownerDocument: doc, addEventListener: noop, removeEventListener: noop }, world.cm);
  controls.controls.isLocked = true;
  controls.setPosition(pts[0][0], PLAYER.HEIGHT, pts[0][1]);
  controls.moveForward = !backward;controls.moveBackward=backward;
  controls.canSprint = sprint;
  const terraces = world.cm.walkables.filter(w => w.type === 'box' && w.rescue !== false && w.box.max.y >= 1).map(w => w.box);
  let fellUnder = null;
  try {
    for (let k = 1; k < pts.length; k++) {
      const [x, z] = pts[k];
      const limit = Math.ceil(Math.hypot(x - camera.position.x, z - camera.position.z) / 2 * fps) + fps * 4;
      let stuck = 0, last = [camera.position.x, camera.position.z], reached = false;
      for (let frame = 0; frame < limit; frame++) {
        time += 1000 / fps;
        camera.lookAt(backward?2*camera.position.x-x:x,camera.position.y,backward?2*camera.position.z-z:z);
        controls.update();
        const p = camera.position;
        if (!fellUnder && controls.verticalVelocity === 0 && terraces.some(b => p.x > b.min.x + 1 && p.x < b.max.x - 1 && p.z > b.min.z + 1 && p.z < b.max.z - 1 && controls.feetY < b.max.y - 1.2)) {
          fellUnder = [p.x, p.z, controls.feetY];
        }
        if (Math.hypot(p.x - x, p.z - z) < 0.8) { reached = true; break; }
        if (frame % fps === 0 && frame > 0) {
          if (Math.hypot(p.x - last[0], p.z - last[1]) < 0.3) stuck++; else stuck = 0;
          last = [p.x, p.z];
          if (stuck >= 2) break;
        }
      }
      if (!reached) return { arrived: false, stuckAt: pts[k], end: [camera.position.x, camera.position.z, controls.feetY], fellUnder };
    }
    return { arrived: true, fellUnder };
  } finally {
    controls.dispose();
    clock.mock.restore();
    globalThis.document = oldDoc;
    globalThis.window = oldWindow;
  }
}

for(const fps of [10,60])for(const sprint of [false,true])for(const backward of [false,true])test(`AUDIT 63 actual-material whole-world routes start at ground, fps=${fps}, sprint=${sprint}, backward=${backward}`,t=>{assert.equal(routes.length,63);const failures=[];for(const route of routes){const r=route.waypointDriver==='physical-crossing-v1'?replayTerrace(t,W,route.pts,{fps,sprint,backward}):replay(t,W,route.pts,fps,sprint,backward);const row={name:route.name,fps,sprint,backward,...r};results.push(row);if(!r.arrived||r.fellUnder)failures.push(row);}assert.deepEqual(failures,[]);});
test.after(()=>process.env.R48_WRITE_AUDIT_REPORTS==='1'&&writeFileSync(new URL('../docs/current-state/r48-remaining/independent-real-materials/58b0431-ground-start-63.json',import.meta.url),JSON.stringify(results,null,2)));
