import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

// Import dynamically so a missing new module reports an explicit feature
// assertion during the first red run, rather than a test-runner import error.
let dayCycle;
let importError;
try {
  dayCycle = await import('../../src/scene/sky/BeijingDayCycle.js');
} catch (error) {
  importError = error;
}

function api() {
  assert.ok(dayCycle, `Beijing day-cycle module must exist: ${importError?.message}`);
  return dayCycle;
}
function close(actual, expected, tolerance = 1e-12) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} differs from ${expected} by more than ${tolerance}`);
}
function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}
function numericLeaves(value) {
  if (typeof value === 'number') return [value];
  if (Array.isArray(value)) return value.flatMap(numericLeaves);
  if (value && typeof value === 'object') return Object.values(value).flatMap(numericLeaves);
  return [];
}

test('Beijing calendar fields use fixed UTC+8 across local midnight and year rollover', () => {
  const { getBeijingTime, BEIJING_SITE } = api();
  assert.equal(BEIJING_SITE.utcOffsetMinutes, 480);
  assert.equal(BEIJING_SITE.coordinatesAreApproximate, true);
  const before = getBeijingTime(new Date('2025-12-31T15:59:59.999Z'));
  const after = getBeijingTime(new Date('2025-12-31T16:00:00.000Z'));
  assert.deepEqual([before.year, before.month, before.day, before.hour, before.minute, before.second, before.millisecond], [2025, 12, 31, 23, 59, 59, 999]);
  assert.deepEqual([after.year, after.month, after.day, after.hour, after.minute, after.second, after.millisecond], [2026, 1, 1, 0, 0, 0, 0]);
  assert.equal(after.dayOfYear, 1);
  assert.equal(after.dateLabel, '2026-01-01');
  assert.equal(after.timeLabel, '00:00:00');
  assert.equal(after.minutesOfDay, 0);
});

test('Beijing calendar handles leap days and Gregorian century boundaries', () => {
  const { getBeijingTime } = api();
  for (const [date, dayOfYear, daysInYear] of [
    ['2024-02-29T04:00:00Z', 60, 366],
    ['2024-03-01T04:00:00Z', 61, 366],
    ['2025-03-01T04:00:00Z', 60, 365],
    ['2000-03-01T04:00:00Z', 61, 366],
    ['2100-03-01T04:00:00Z', 60, 365],
  ]) {
    const local = getBeijingTime(new Date(date));
    assert.equal(local.dayOfYear, dayOfYear, date);
    assert.equal(local.daysInYear, daysInYear, date);
  }
});

test('output is independent of the host time zone, including DST locales', () => {
  api();
  const moduleUrl = new URL('../../src/scene/sky/BeijingDayCycle.js', import.meta.url).href;
  const source = `import { getBeijingDayCycle } from ${JSON.stringify(moduleUrl)}; console.log(JSON.stringify(getBeijingDayCycle(new Date('2026-03-08T09:59:59.999Z'))));`;
  const outputs = ['UTC', 'America/Los_Angeles', 'Asia/Shanghai', 'Pacific/Auckland'].map(TZ => {
    const result = spawnSync(process.execPath, ['--input-type=module', '-e', source], { env: { ...process.env, TZ }, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    return result.stdout;
  });
  for (const output of outputs) assert.equal(output, outputs[0]);
});

test('compass bearings map to west-positive X, north-positive Z, and up-positive Y', () => {
  const { compassSunDirection } = api();
  for (const [azimuth, elevation, expected] of [
    [0, 0, [0, 0, 1]], [90, 0, [-1, 0, 0]], [180, 0, [0, 0, -1]],
    [270, 0, [1, 0, 0]], [450, 0, [-1, 0, 0]], [-90, 0, [1, 0, 0]],
    [37, 90, [0, 1, 0]], [37, -90, [0, -1, 0]],
  ]) {
    const v = compassSunDirection(azimuth, elevation);
    [v.x, v.y, v.z].forEach((component, i) => close(component, expected[i]));
    close(Math.hypot(v.x, v.y, v.z), 1);
  }
});

test('equinox and solstice near-noon elevations follow Beijing latitude and axial tilt', () => {
  const { calculateBeijingSun, getBeijingDayCycle } = api();
  for (const [date, expectedElevation] of [
    ['2026-03-20T04:15:00Z', 50],
    ['2026-06-21T04:15:00Z', 73.5],
    ['2026-09-23T04:15:00Z', 50],
    ['2026-12-21T04:15:00Z', 26.6],
  ]) {
    const sun = calculateBeijingSun(new Date(date));
    close(sun.elevationDegrees, expectedElevation, 1.2);
    assert.ok(sun.azimuthDegrees > 172 && sun.azimuthDegrees < 188, `${date}: near-noon sun faces south`);
    assert.ok(sun.direction.z < 0 && sun.direction.y > 0);
    assert.equal(getBeijingDayCycle(new Date(date)).phase, 'day');
  }
});

test('summer early morning and winter early morning do not share a fixed 06:00 sunrise', () => {
  const { getBeijingDayCycle } = api();
  const summer = getBeijingDayCycle(new Date('2026-06-20T22:00:00Z'));
  const winter = getBeijingDayCycle(new Date('2026-12-20T22:00:00Z'));
  assert.equal(summer.beijingTime.hour, 6);
  assert.equal(winter.beijingTime.hour, 6);
  assert.ok(summer.sun.elevationDegrees > 5);
  assert.ok(winter.sun.elevationDegrees < -10);
  assert.ok(summer.lighting.sunIntensity > 0);
  assert.equal(winter.lighting.sunIntensity, 0);
  assert.equal(winter.phase, 'night');
});

test('morning and afternoon sun use the east and west half of the model respectively', () => {
  const { calculateBeijingSun } = api();
  const morning = calculateBeijingSun(new Date('2026-03-20T00:00:00Z'));
  const afternoon = calculateBeijingSun(new Date('2026-03-20T08:00:00Z'));
  assert.ok(morning.direction.x < 0 && morning.azimuthDegrees < 180);
  assert.ok(afternoon.direction.x > 0 && afternoon.azimuthDegrees > 180);
});

test('night retains zero sun, darker sky and lower total lighting with R34 readable ambient', () => {
  const { getBeijingDayCycle } = api();
  const day = getBeijingDayCycle(new Date('2026-06-21T04:00:00Z'));
  const night = getBeijingDayCycle(new Date('2026-06-21T16:00:00Z'));
  assert.equal(night.phase, 'night');
  assert.ok(night.sun.elevationDegrees < -20);
  assert.equal(night.lighting.sunIntensity, 0);
  for (const key of ['environmentIntensity', 'daylight']) {
    assert.ok(night.lighting[key] < day.lighting[key], key);
  }
  const total = l => l.sunIntensity + l.hemisphereIntensity + l.fillIntensity;
  assert.ok(total(night.lighting) < total(day.lighting));
  assert.ok(night.lighting.skyTop.reduce((a, b) => a + b) < day.lighting.skyTop.reduce((a, b) => a + b));
});

test('phase labels include separate sunrise and sunset intervals driven by solar elevation', () => {
  const { getBeijingDayCycle } = api();
  const phases = new Map();
  const start = Date.parse('2026-03-19T16:00:00Z');
  for (let minute = 0; minute < 1440; minute += 5) {
    const state = getBeijingDayCycle(new Date(start + minute * 60000));
    phases.set(state.phase, state);
  }
  assert.deepEqual([...phases.keys()].sort(), ['day', 'night', 'sunrise', 'sunset']);
  assert.ok(phases.get('sunrise').sun.hourAngleDegrees < 0);
  assert.ok(phases.get('sunset').sun.hourAngleDegrees > 0);
});

test('solar vectors and all lighting values remain finite and bounded over every hour of leap and common years', () => {
  const { getBeijingDayCycle } = api();
  const colors = ['skyTop', 'skyBottom', 'fogColor', 'sunColor', 'hemisphereSkyColor', 'hemisphereGroundColor', 'fillColor'];
  for (const year of [2024, 2026]) {
    const start = Date.UTC(year, 0, 1);
    const end = Date.UTC(year + 1, 0, 1);
    for (let time = start; time < end; time += 3600000) {
      const state = getBeijingDayCycle(new Date(time));
      for (const value of numericLeaves(state)) assert.ok(Number.isFinite(value), `${year}: non-finite output`);
      close(Math.hypot(...Object.values(state.sun.direction)), 1, 1e-12);
      assert.ok(state.sun.azimuthDegrees >= 0 && state.sun.azimuthDegrees < 360);
      assert.ok(state.sun.elevationDegrees >= -90 && state.sun.elevationDegrees <= 90);
      for (const key of colors) {
        assert.equal(state.lighting[key].length, 3);
        for (const channel of state.lighting[key]) assert.ok(channel >= 0 && channel <= 1, key);
      }
      for (const key of ['sunIntensity', 'hemisphereIntensity', 'fillIntensity', 'environmentIntensity', 'exposure']) {
        assert.ok(state.lighting[key] >= 0 && state.lighting[key] <= 2, key);
      }
      for (const key of ['daylight', 'twilight']) assert.ok(state.lighting[key] >= 0 && state.lighting[key] <= 1, key);
    }
  }
});

test('sky and light outputs stay continuous through a full day and calendar boundaries', () => {
  const { getBeijingDayCycle } = api();
  const dates = ['2026-03-20', '2026-06-21', '2026-12-21', '2024-02-29', '2024-12-31', '2025-12-31'];
  for (const date of dates) {
    const start = Date.parse(`${date}T00:00:00Z`);
    for (let offset = 0; offset <= 86400000; offset += 60000) {
      const a = getBeijingDayCycle(new Date(start + offset - 500));
      const b = getBeijingDayCycle(new Date(start + offset + 500));
      assert.ok(distance(a.sun.direction, b.sun.direction) < 0.0002, `${date} ${offset}: direction discontinuity`);
      const left = numericLeaves(a.lighting);
      const right = numericLeaves(b.lighting);
      left.forEach((value, index) => assert.ok(Math.abs(value - right[index]) < 0.003, `${date} ${offset}: lighting discontinuity`));
    }
  }
});

test('calls are deterministic, do not mutate Date inputs, and return independently owned data', () => {
  const { getBeijingDayCycle } = api();
  const date = new Date('2026-10-18T15:10:00.123Z');
  const before = date.getTime();
  const a = getBeijingDayCycle(date);
  const b = getBeijingDayCycle(date);
  assert.deepEqual(a, b);
  assert.equal(date.getTime(), before);
  a.lighting.skyTop[0] = 999;
  a.sun.direction.x = 999;
  assert.deepEqual(getBeijingDayCycle(date), b);
});

test('invalid dates and non-finite compass input fail explicitly instead of emitting NaN', () => {
  const { getBeijingTime, calculateBeijingSun, compassSunDirection, getBeijingDayCycle } = api();
  for (const fn of [getBeijingTime, calculateBeijingSun, getBeijingDayCycle]) {
    assert.throws(() => fn(new Date(NaN)), RangeError);
    assert.throws(() => fn('2026-10-18T12:00:00Z'), TypeError);
    assert.throws(() => fn(), TypeError);
    assert.throws(() => fn(new Date(8640000000000000)), RangeError);
  }
  for (const args of [[NaN, 0], [0, Infinity], [0, -91], [0, 91]]) {
    assert.throws(() => compassSunDirection(...args), RangeError);
  }
});
