import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { readHistoricalSource, validateHistoricalSourceRegistry } from './lib/historical-sources.mjs';
const raw = readFileSync(new URL('./fixtures/historical-sources.json', import.meta.url));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');

test('portable registry retains all16 exact historical commit/path/blob/byte records', () => {
  const entries = validateHistoricalSourceRegistry(raw);
  assert.equal(entries.size, 16);
  for (const record of JSON.parse(raw).entries) {
    const bytes = readHistoricalSource(record.commit, record.path);
    assert.equal(bytes.length, record.bytes); assert.equal(sha(bytes), record.sha256);
    assert.equal(createHash('sha1').update(Buffer.from(`blob ${bytes.length}\0`)).update(bytes).digest('hex'), record.gitBlob);
  }
  assert.equal(sha(readHistoricalSource('3d196a60ead843fcc029a7fcd406374f9b699fc8', 'src/controls/FirstPerson.js')), '26e909aa08b568adc551cfe3c08506ad4745cd46a26ad8189c610df0dca8e994');
});

test('unknown commit or path fails without Git, network or current-source fallback', () => {
  assert.throws(() => readHistoricalSource('0000000000000000000000000000000000000000', 'main.js'), /Unknown historical source/);
  assert.throws(() => readHistoricalSource('35914d6c2bc16dbb9fd7245d6384195ece5e125d', 'src/scene/Environment.js'), /Unknown historical source/);
  assert.throws(() => readHistoricalSource('main', 'main.js'), /Unknown historical source/);
});

test('mutated source and recomputed per-entry digest cannot bless a new baseline', () => {
  const data = JSON.parse(raw); data.entries[0].utf8 += '\n';
  data.entries[0].bytes = Buffer.byteLength(data.entries[0].utf8);
  data.entries[0].sha256 = sha(Buffer.from(data.entries[0].utf8));
  assert.throws(() => validateHistoricalSourceRegistry(Buffer.from(JSON.stringify(data))), /immutable historical registry/);
  assert.throws(() => validateHistoricalSourceRegistry(Buffer.concat([raw, Buffer.from('\n')])), /immutable historical registry/);
});

test('returned byte buffers cannot mutate the cached historical source', () => {
  const commit = '35914d6c2bc16dbb9fd7245d6384195ece5e125d', path = 'main.js';
  const first = readHistoricalSource(commit, path), original = Buffer.from(first); first.fill(0);
  assert.deepEqual(readHistoricalSource(commit, path), original);
});
