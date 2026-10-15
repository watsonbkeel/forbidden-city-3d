import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

// Reverse only these four exact entry-position hunks before existing historical
// assertions. No AST/whitespace normalization or refreshed historical fixture.
export const V13_ENTRY_MAIN_DELTAS = Object.freeze([
  Object.freeze({
    before: "import { LAYOUT, PERFORMANCE, TELEPORT } from './src/config/constants.js';\n",
    after: "import { LAYOUT, PERFORMANCE, TELEPORT } from './src/config/constants.js';\nimport { INITIAL_VIEW_POSITION } from './src/config/initialView.js';\n",
  }),
  Object.freeze({
    before: '        ZONES.forEach(zone => this.zoneManager.register(zone));\n        const start = LAYOUT.START_POSITION;\n',
    after: '        ZONES.forEach(zone => this.zoneManager.register(zone));\n        const start = INITIAL_VIEW_POSITION;\n',
  }),
  Object.freeze({
    before: '        this.controls = new FirstPersonControls(this.camera, document.body, this.collisionManager);\n        const start = LAYOUT.START_POSITION;\n',
    after: '        this.controls = new FirstPersonControls(this.camera, document.body, this.collisionManager);\n        const start = INITIAL_VIEW_POSITION;\n',
  }),
  Object.freeze({
    before: '      2500\n    );\n  }\n',
    after: '      2500\n    );\n    const start = INITIAL_VIEW_POSITION;\n    this.camera.position.set(start.x, start.y, start.z);\n  }\n',
  }),
]);

export function restoreV10EntryMainBytes(current) {
  let source = current.toString('utf8');
  for (const { before, after } of V13_ENTRY_MAIN_DELTAS) {
    assert.equal(source.split(after).length - 1, 1,
      'Each exact V13 entry replacement must occur exactly once');
    source = source.replace(after, before);
  }
  return Buffer.from(source, 'utf8');
}

export function assertV13EntryMainBytes(current) {
  const restored = restoreV10EntryMainBytes(current);
  assert.equal(createHash('sha256').update(restored).digest('hex'),
    '906a9ee7c4446c92c7ee0d4d0fe920b162edf83814b8ff8d80ef16a0a1726932',
    'Restored main.js must equal exact c07465b V10 bytes');
}
