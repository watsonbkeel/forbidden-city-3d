import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../../style.css', import.meta.url), 'utf8');
// Source policy only. Real scroll preservation is checked by the unchanged browser contract.
function assertDirectoryAnchorPolicy(source) {
  const declarations = [...source.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .filter(([, , body]) => /overflow-anchor\s*:/.test(body));
  assert.equal(declarations.length, 1, 'One narrowly scoped anchoring policy is required');
  const [, rawSelector, body] = declarations[0];
  const selector = rawSelector.replace(/\/\*[\s\S]*?\*\//g, '').trim();
  assert.equal(selector, '#minimap #place-directory', 'Do not disable anchoring on the map, cards or other lists');
  assert.match(body, /^\s*overflow-anchor\s*:\s*none\s*;\s*$/, 'Only browser anchoring is changed');
}

test('the translated primary directory opts out of automatic scroll anchoring', () => {
  assertDirectoryAnchorPolicy(css);
});

test('directory layout and scrolling remain the existing flex-wrap contract', () => {
  assert.match(css, /#minimap #place-directory,\s*#minimap #bridge-facility-directory\s*\{\s*display: flex; flex-wrap: wrap; gap: 6px; width: 100%;\s*max-height: min\(240px, 36dvh\); overflow-y: auto; overscroll-behavior: contain;\s*touch-action: pan-y;\s*\}/);
});

test('missing, broader, extra and auto anchoring policies are rejected', () => {
  const rule = '#minimap #place-directory { overflow-anchor: none; }';
  assertDirectoryAnchorPolicy(rule);
  for (const bad of ['', rule.replace('#minimap #place-directory', '#minimap'),
    rule.replace('none', 'auto'), rule + '\nbody { overflow-anchor: none; }',
    rule.replace('none;', 'none; scroll-behavior: smooth;')]) {
    assert.throws(() => assertDirectoryAnchorPolicy(bad));
  }
});
