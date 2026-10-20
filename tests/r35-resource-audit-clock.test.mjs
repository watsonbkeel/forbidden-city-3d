import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const sceneTime = '2026-10-20T04:00:00.000Z'; // Beijing noon, not the machine clock.

function audit(t, time) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'r35-resource-clock-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const output = path.join(directory, 'receipt.json');
  const run = spawnSync(process.execPath, ['tools/r34-resource-budgets.mjs', output], {
    cwd: root, encoding: 'utf8', timeout: 180000,
    env: { ...process.env, RESOURCE_BUDGET_SCENE_TIME: time },
  });
  return { ...run, output };
}

test('resource audit pins scene time while retaining real observation timestamps', t => {
  const before = Date.now(), run = audit(t, sceneTime), after = Date.now();
  assert.equal(run.status, 0, run.stderr);
  const report = JSON.parse(fs.readFileSync(run.output, 'utf8'));
  assert.equal(report.sceneClock?.mode, 'fixed-preview');
  assert.equal(report.sceneClock?.sceneTimeUTC, sceneTime);
  const started = Date.parse(report.sceneClock.observedStartedAtUTC);
  const finished = Date.parse(report.sceneClock.observedFinishedAtUTC);
  assert.ok(started >= before && finished <= after && finished >= started, 'observation time is never replaced by scene time');
  assert.equal(report.permanent.environmentGeometry.visibleMeshes, 5, 'daytime overlay is hidden even when the audit runs at night');
  assert.equal(report.permanent.environmentGeometry.visibleTriangles, 2300);
  assert.equal(Object.keys(report.sourceIdentities).length, 188);
  for (const row of Object.values(report.lifecycle)) {
    assert.equal(row.equalBeforeAfter, true);
    const textures = row.ownedTextureDisposal;
    assert.equal(textures.events, textures.uniqueTextures);
    assert.equal(textures.min, textures.uniqueTextures ? 1 : 0);
    assert.equal(textures.max, textures.uniqueTextures ? 1 : 0);
  }
  assert.equal(report.lifecycle.ningshou.ownedTextureDisposal.uniqueTextures, 2, 'full zone owns its photo and plaque atlas');
  for (const row of Object.values(report.optional)) assert.equal(row.reloadNavigationRestored, true);
});

test('resource audit rejects an invalid explicit scene clock before writing a receipt', t => {
  const run = audit(t, 'not-a-date');
  assert.notEqual(run.status, 0);
  assert.match(run.stderr, /RESOURCE_BUDGET_SCENE_TIME/);
  assert.equal(fs.existsSync(run.output), false);
});
