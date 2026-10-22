import assert from 'node:assert/strict';
import { FlightState, FLIGHT_RULES, HELICOPTER_HOME } from '../../src/scene/flight/FlightState.js';

/** Same-world integration hook. Only FlightState inputs advance the aircraft;
 * there are no position writes, landing setters, reduced radii or UI claims. */
export function verifyWuyingFlightDescent(W, envelope, { fps = 60 } = {}) {
  const front = W.halls.find(h => h.item.southCourtProfile === 'wuying-front').item;
  const target = { x: front.x, z: front.z - 13 };
  const state = new FlightState(envelope), dt = 1 / fps;
  assert.equal(state.rules.radius, FLIGHT_RULES.radius);
  assert.equal(state.rules.radius, 5.7);
  assert.equal(state.board(), true);
  let now = 0, frames = 0, blockedAt = null;
  const phases = [];
  const tick = (input = {}) => {
    const before = { ...state.position };
    now += dt * 1000; frames++;
    state.update(dt, now, input);
    assert.equal(envelope.isSafe(state.position, state.rules.radius, state.rules.maximumAltitude), true, JSON.stringify(state.position));
    assert.ok(Math.hypot(state.position.x - before.x, state.position.z - before.z) <= state.rules.speed * dt + 1e-6);
    assert.ok(Math.abs(state.position.y - before.y) <= state.rules.verticalSpeed * dt + 1e-6);
  };
  const climb = () => {
    const max = Math.ceil(state.rules.cruiseAltitude / state.rules.verticalSpeed * fps) + 2;
    for (let n = 0; state.position.y < state.rules.cruiseAltitude - 1e-7 && n < max; n++) {
      tick({ vertical: Math.min(1, (state.rules.cruiseAltitude - state.position.y) / (state.rules.verticalSpeed * dt)) });
      assert.equal(state.blocked, false, 'continuous climb remains clear');
    }
    assert.ok(Math.abs(state.position.y - state.rules.cruiseAltitude) < 1e-6);
  };
  climb(); phases.push({ phase: 'home-climb', position: { ...state.position } });
  // Yaw remains its real default zero: right input is negative world X.
  const cruiseFrames = Math.ceil(Math.hypot(target.x - state.position.x, target.z - state.position.z) / state.rules.speed * fps) + 4;
  for (let n = 0; Math.hypot(target.x - state.position.x, target.z - state.position.z) > 1e-7 && n < cruiseFrames; n++) {
    const dx = target.x - state.position.x, dz = target.z - state.position.z, distance = Math.hypot(dx, dz);
    const scale = Math.min(1, distance / (state.rules.speed * dt)) / distance;
    tick({ right: -dx * scale, forward: dz * scale });
    assert.equal(state.blocked, false, 'continuous cruise remains clear');
  }
  assert.ok(Math.hypot(target.x - state.position.x, target.z - state.position.z) < 1e-6);
  phases.push({ phase: 'wuying-arrival-above-deck', position: { ...state.position } });
  assert.equal(envelope.safeGround(target.x, target.z, state.rules.radius), false);
  assert.equal(state.landAt(target), false, 'raised terrace is not a legal helicopter ground landing');
  for (let n = 0; n < Math.ceil(state.rules.cruiseAltitude / state.rules.verticalSpeed * fps) + 2; n++) {
    tick({ vertical: -1 });
    if (state.blocked) { blockedAt = { ...state.position }; break; }
  }
  assert.ok(blockedAt, 'actual production descent must meet the real-mesh clearance envelope');
  const minimumY = envelope.minimumY(target.x, target.z, state.rules.radius);
  assert.ok(minimumY > front.ph);
  assert.ok(blockedAt.y >= minimumY - 1e-7);
  assert.equal(state.grounded, false);
  assert.equal(state.exit(now), false, 'airborne/blocked descent never enables dismount');
  phases.push({ phase: 'wuying-descent-blocked', position: blockedAt, minimumY });
  climb();
  assert.equal(state.landAt(HELICOPTER_HOME), true);
  const homeFrames = Math.ceil((Math.hypot(target.x - HELICOPTER_HOME.x, target.z - HELICOPTER_HOME.z) / state.rules.speed + state.rules.cruiseAltitude / state.rules.verticalSpeed + 5) * fps);
  for (let n = 0; (state.mode === 'auto' || !state.grounded) && n < homeFrames; n++) {
    tick(); assert.equal(state.blocked, false, 'positive-control return and real descent stay clear');
  }
  tick();
  assert.equal(state.grounded, true);
  assert.equal(state.position.y, 0);
  assert.ok(Math.hypot(state.position.x - HELICOPTER_HOME.x, state.position.z - HELICOPTER_HOME.z) < 1e-6);
  assert.equal(state.exit(now), true);
  phases.push({ phase: 'home-descended-and-exited', position: { ...state.position } });
  return { fps, frames, radius: state.rules.radius, phases, productionPath: 'FlightState.board/update/landAt/exit', inputMethod: 'programmatic state inputs, not UI or browser events', positionWrites: 0 };
}
