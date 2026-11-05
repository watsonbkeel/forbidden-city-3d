import fs from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';

test('actual complete outer-west preserves public-ad0 geometry, all contact fields and old routes while adding exact K19 and separately pinned K18/L3/H29/H30 exteriors and one closed L11 entry', async t => {
  assert.ok(fs.existsSync(new URL('./production-harness.mjs', import.meta.url)), 'reproducible actual outer-west harness absent');
  const { actualOuterWest } = await import('./production-harness.mjs');
  const fixture = actualOuterWest();
  try {
    const report = fixture.verify(t);
    assert.equal(report.complete, true);
    if (process.env.XUANSHOU_EVIDENCE_DIR) {
      fs.mkdirSync(process.env.XUANSHOU_EVIDENCE_DIR, { recursive: true });
      fs.writeFileSync(process.env.XUANSHOU_EVIDENCE_DIR + '/production-zone.json', JSON.stringify(report, null, 2) + '\n');
    }
    console.log(JSON.stringify(report));
  } finally {
    fixture.dispose();
  }
});
