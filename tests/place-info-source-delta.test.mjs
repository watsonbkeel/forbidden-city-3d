import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PLACE_INFO_DELTAS, restorePlaceInfoBytes } from './lib/place-info-source-delta.mjs';
import { restoreLoadingWelcomeBytes } from './lib/loading-welcome-source-delta.mjs';
for (const [path, delta] of Object.entries(PLACE_INFO_DELTAS)) {
  const raw = readFileSync(new URL(`../${path}`, import.meta.url));
  const current = path === 'main.js' ? restoreLoadingWelcomeBytes(raw) : raw;
  test(`${path} has one exact reversible information-only change`, () => {
    const restored = restorePlaceInfoBytes(path, current).toString();
    assert.equal(restored.split(delta.before).length - 1, 1);
    assert.equal(restored.replace(delta.before, delta.after), current.toString());
  });
  for (const [name, replacement] of [['missing', ''], ['omitted', delta.before], ['duplicate', delta.after + delta.after], ['changed', delta.after + ' ']]) {
    test(`${path} source boundary rejects ${name} place-information hunk`, () => {
      assert.throws(() => restorePlaceInfoBytes(path, Buffer.from(current.toString().replace(delta.after, replacement))), /exactly once|must equal/);
    });
  }
  test(`${path} source boundary rejects unrelated whitespace and handler edits`, () => {
    assert.throws(() => restorePlaceInfoBytes(path, Buffer.concat([current, Buffer.from('\n')])), /must equal/);
    const needle = path === 'main.js' ? 'this.environment.init();' : 'this.hide();';
    assert.ok(current.includes(needle));
    assert.throws(() => restorePlaceInfoBytes(path, Buffer.from(current.toString().replace(needle, ''))), /must equal/);
  });
}
