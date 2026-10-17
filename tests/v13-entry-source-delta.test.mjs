import test from 'node:test';
import { restorePlaceInfoBytes } from './lib/place-info-source-delta.mjs';
import { restoreLoadingWelcomeBytes } from './lib/loading-welcome-source-delta.mjs';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { V13_ENTRY_MAIN_DELTAS, restoreV10EntryMainBytes, assertV13EntryMainBytes } from './lib/v13-entry-source-delta.mjs';
const current = restorePlaceInfoBytes('main.js', restoreLoadingWelcomeBytes(readFileSync(new URL('../main.js', import.meta.url))));

test('only four exact entry-position hunks restore the unchanged V10 main.js identity', () => {
  assertV13EntryMainBytes(current);
  let reapplied = restoreV10EntryMainBytes(current).toString();
  for (const { before, after } of V13_ENTRY_MAIN_DELTAS) {
    assert.equal(reapplied.split(before).length - 1, 1);
    reapplied = reapplied.replace(before, after);
  }
  assert.equal(reapplied, current.toString());
});
for (const [i, { before, after }] of V13_ENTRY_MAIN_DELTAS.entries()) {
  for (const [label, replacement] of [['omitted', before], ['deleted', ''], ['duplicated', after + after]]) {
    test(`entry delta ${i + 1} rejects ${label} exact replacement`, () => {
      const mutated = current.toString().replace(after, replacement);
      assert.notEqual(mutated, current.toString());
      assert.throws(() => assertV13EntryMainBytes(Buffer.from(mutated)), /exactly once/);
    });
  }
}
for (const [label, before, after] of [
  ['FOV', '      70,', '      71,'],
  ['far plane', '      2500', '      2600'],
  ['north orientation', 'this.controls.lookAt(0, LAYOUT.WUMEN_Z);', 'this.controls.lookAt(1, LAYOUT.WUMEN_Z);'],
  ['sky initialization', 'this.environment.init();', 'this.environment.setupGround();'],
  ['renderer quality', 'this.renderer.setPixelRatio', 'this.renderer.setSize'],
  ['whitespace', '\nclass ForbiddenCityApp {', '\n\nclass ForbiddenCityApp {'],
]) test(`entry source guard rejects unrelated ${label} change`, () => {
  assert.ok(current.includes(before));
  assert.throws(() => assertV13EntryMainBytes(Buffer.from(current.toString().replace(before, after))), /exactly once|must equal/);
});
