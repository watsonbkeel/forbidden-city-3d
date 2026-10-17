import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

// Reverse only the deferred welcome condition before older byte-exact guards.
// The published source identity and all historical fixtures remain unchanged.
export const LOADING_WELCOME_DELTA = Object.freeze({
  before: '        if (overlay && !this.controls.controls.isLocked) {\n',
  after: '        if (overlay && !this.controls.controls.isLocked && !this.minimap?.visible && !this.settingsMenu?.visible) {\n',
  baseSha256: '0599f3f6d7ad19cbcff6147ec7ad6bf2407f3b7d6ccd7013e7e4cc85f51fa05f',
});

export function restoreLoadingWelcomeBytes(current) {
  const source = current.toString();
  const { before, after, baseSha256 } = LOADING_WELCOME_DELTA;
  assert.equal(source.split(after).length - 1, 1, 'Exact loading-welcome replacement must occur exactly once');
  const restored = Buffer.from(source.replace(after, before));
  assert.equal(createHash('sha256').update(restored).digest('hex'), baseSha256,
    'Restored main.js must equal exact c86ea400 published bytes');
  return restored;
}
