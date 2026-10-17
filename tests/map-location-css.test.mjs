import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../style.css', import.meta.url), 'utf8');
const source = css.slice(css.indexOf('/* Keep the persistent location label clear of closed and compact maps. */'));
const selectors = {
  mobile: 'body:has(#minimap.minimap-touch) #location-panel',
  closed: 'body:not(.map-open):has(#minimap-preview) #location-panel',
  desktop: 'body:has(#minimap[data-compact="true"]) #location-panel',
  touch: 'body:has(#minimap.minimap-touch[data-compact="true"]) #location-panel',
  strip: 'body:has(#minimap.minimap-touch[data-compact="true"][data-compact-collapsed="true"]) #location-panel',
  narrowStrip: 'body:has(#minimap[data-compact="true"][data-compact-collapsed="true"]) #location-panel',
};
function rules(selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return [...source.matchAll(new RegExp(`${escaped}\\s*\\{([^}]+)\\}`, 'g'))].map(match =>
    Object.fromEntries(match[1].replace(/\/\*[\s\S]*?\*\//g, '').split(';').map(item => item.trim()).filter(Boolean).map(item => {
      const colon = item.indexOf(':');
      return [item.slice(0, colon), item.slice(colon + 1).trim()];
    })));
}
function required(selector, index = 0) {
  const rule = rules(selector)[index];
  assert.ok(rule, `missing location/map non-overlap rule: ${selector} [${index}]`);
  return rule;
}
// Numeric contract for the declared CSS expressions only. This is not a layout
// engine: actual cascade, fonts, :has support and hit testing need browser QA.
function pixels(value, { width, left = 0, right = 0, top = 0 } = {}) {
  const safe = { left, right, top, bottom: 0 };
  const expression = value.replace(/!important/g, '')
    .replace(/env\(safe-area-inset-(left|right|top|bottom), 0px\)/g, (_, side) => safe[side])
    .replace(/100vw/g, String(width)).replace(/px/g, '').replace(/calc\(/g, '(')
    .replace(/\b(max|min)\(/g, 'Math.$1(');
  assert.match(expression.replace(/Math\.(max|min)/g, ''), /^[\d.+*/(),\s-]+$/, 'only finite arithmetic is evaluated');
  return Function(`"use strict"; return (${expression});`)();
}

const matrix = [
  { name: '390 portrait closed preview', width: 390, mode: 'closed', mapWidth: 118, mapRight: 16 },
  { name: '320 portrait closed preview', width: 320, mode: 'closed', mapWidth: 118, mapRight: 16 },
  { name: '390 portrait compact', width: 390, mode: 'touch', mapWidth: 220, mapRight: 8 },
  { name: '844 landscape compact', width: 844, mode: 'landscape', mapWidth: 220, mapRight: 164 },
  { name: '520 landscape compact at constrained width', width: 520, mode: 'landscape', mapWidth: 192, mapRight: 164 },
  { name: '844 short landscape centered strip', width: 844, mode: 'strip', mapWidth: 320, mapRight: 262 },
  { name: '520 short landscape constrained strip', width: 520, mode: 'strip', mapWidth: 192, mapRight: 164 },
  { name: '1280 desktop compact', width: 1280, mode: 'desktop', mapWidth: 240, mapRight: 8 },
  { name: '844 landscape compact with safe insets', width: 844, left: 44, right: 44, mode: 'landscape', mapWidth: 220, mapRight: 208 },
];
for (const row of matrix) test(`location CSS arithmetic leaves 12px gap: ${row.name}`, () => {
  const rule = required(selectors[row.mode === 'landscape' ? 'touch' : row.mode], row.mode === 'landscape' ? 1 : 0);
  const labelLeft = 20 + (row.left || 0);
  const labelRight = labelLeft + pixels(rule['max-width'], row);
  const mapLeft = row.width - row.mapRight - row.mapWidth;
  assert.ok(mapLeft - labelRight >= 12 - 1e-9, `${mapLeft - labelRight}px gap`);
  assert.ok(pixels(rule['max-width'], row) >= 130, 'tested side-by-side cases retain a readable label box');
});

test('mobile type intent overrides inline styles without hiding or truncating location text', () => {
  const mobile = required(selectors.mobile);
  assert.equal(mobile['font-size'], '14px !important');
  assert.equal(mobile.padding, '8px 12px !important');
  assert.equal(mobile['overflow-wrap'], 'anywhere');
  assert.equal(pixels(mobile.left, { width: 390, left: 20 }), 40);
  assert.equal(pixels(mobile.top, { width: 390, top: 44 }), 64);
  assert.doesNotMatch(source, /(?:display\s*:\s*none|visibility\s*:\s*hidden|overflow\s*:\s*hidden|text-overflow\s*:\s*ellipsis)/);
  assert.doesNotMatch(source, /#help-panel|opacity|pointer-events/);
});

test('narrow compact fallback uses the actual 236px card ceiling and 92px strip ceiling', () => {
  assert.match(source, /@media \(max-width: 360px\)/);
  const narrow = required(selectors.desktop, 1);
  const strip = required(selectors.narrowStrip);
  for (const top of [0, 44]) {
    const input = { width: 320, top };
    assert.equal(pixels(narrow.top, input) - (8 + top + 236), 12);
    assert.equal(pixels(strip.top, input) - (8 + top + 92), 12);
    assert.equal(pixels(narrow['max-width'], input), 280);
  }
  assert.match(source, /@media \(orientation: landscape\) and \(min-width: 520px\)/);
});
