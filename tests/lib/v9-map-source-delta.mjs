import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import delta from '../fixtures/v9-map-source-delta.json' with { type: 'json' };
import { expectedV9FirstPersonBytes } from './v9-input-source-delta.mjs';

// A finite second delta applied to the frozen input component, never a source
// normalizer or replacement historical baseline. Full exact context is retained.
export const V9_MAP_SOURCE_DELTA = delta;
export function applyV9MapSourceDelta(path, frozen) {
  const record = delta.files[path];
  assert.ok(record, `No approved V9 map delta for ${path}`);
  let source = frozen.toString('utf8');
  for (const { before } of record.hunks) {
    assert.equal(source.split(before).length - 1, 1, 'V9 map exact context must occur once');
  }
  assert.equal(createHash('sha256').update(frozen).digest('hex'), record.frozenSHA256,
    'V9 map delta accepts only unchanged frozen input-component bytes');
  for (const { before, after } of record.hunks) source = source.replace(before, after);
  return Buffer.from(source, 'utf8');
}
export function expectedV9MapFirstPersonBytes(historical) {
  return applyV9MapSourceDelta('src/controls/FirstPerson.js', expectedV9FirstPersonBytes(historical));
}
export function assertV9MapFirstPersonBytes(historical, current) {
  assert.deepEqual(current, expectedV9MapFirstPersonBytes(historical),
    'FirstPerson must equal historical bytes plus the frozen input and finite map deltas');
}
export const V9_JOYSTICK_INPUT_INSERTIONS = Object.freeze([
  {anchor: '    this.touchId = null;\n\n    this.maxRadius',
   addition: '    // 每次认领都是新会话；touch.identifier 可复用，不能用它识别连续按住。\n    this.sessionGeneration = 0;\n'},
  {anchor: '    this.touchId = touch.identifier;\n', addition: '    this.sessionGeneration++;\n'},
]);
export function expectedV9JoystickBytes(historical) {
  let source = historical.toString('utf8');
  for (const {anchor} of V9_JOYSTICK_INPUT_INSERTIONS) {
    assert.equal(source.split(anchor).length - 1, 1, 'Joystick input exact context must occur once');
  }
  assert.equal(createHash('sha256').update(historical).digest('hex'),
    'b3ee5efb2c5f02430e14bb05f303293d54a47ed7e711613e2412be394c231c5b',
    'Joystick input delta accepts only unchanged historical V8 bytes');
  const [first, second] = V9_JOYSTICK_INPUT_INSERTIONS;
  source = source.replace(first.anchor, '    this.touchId = null;\n' + first.addition + '\n    this.maxRadius');
  source = source.replace(second.anchor, second.anchor + second.addition);
  return Buffer.from(source, 'utf8');
}
export function assertV9MapJoystickBytes(historical, current) {
  assert.deepEqual(current, applyV9MapSourceDelta('src/controls/VirtualJoystick.js', expectedV9JoystickBytes(historical)),
    'VirtualJoystick must equal frozen input-component bytes plus its finite map delta');
}

export function assertV9MapMainBytes(historical, current) {
  assert.deepEqual(current, applyV9MapSourceDelta('main.js', historical),
    'main.js must equal pinned historical bytes plus the finite V9 map wiring delta');
}
