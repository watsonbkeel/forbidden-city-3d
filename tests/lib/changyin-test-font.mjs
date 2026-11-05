// CPU test prerequisite only. This font is never imported by product/browser code.
// The renamed OFL subset is explicitly aliased to the first existing product
// font choice; this does not claim that its outlines are STKaiti calligraphy.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { GlobalFonts } from '@napi-rs/canvas';

export const changyinFontURL = new URL('../fonts/changyin/ForbiddenCityTestCJK-Regular.otf', import.meta.url);
export const changyinFontSHA256 = 'fbad0a8d2bd81170a66ef7a1094548fcd250a2034b60581fa193d6d717af1c24';

export function validateChangyinFont(bytes) {
  assert.equal(createHash('sha256').update(bytes).digest('hex'), changyinFontSHA256,
    'Pinned Changyin test font changed or lost required glyph coverage; see tests/fonts/changyin/README.md');
  return bytes;
}

const bytes = validateChangyinFont(readFileSync(changyinFontURL));
assert.ok(GlobalFonts.register(bytes, 'STKaiti'), 'Could not register the pinned Changyin CPU test font');
