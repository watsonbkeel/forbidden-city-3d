import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

// Exact source transport for archived/connector-published checkouts without the
// original local Git objects. This does not replace any assertion baseline or
// allow a current-source fallback. Registry entries record
// all16 original commit:path blobs; the whole registry is pinned as well.
const REGISTRY_SHA256 = '2b6ac47c5e2b2668cf94032c4136767be141b701573b91960aad1c6618d28937';
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
export function validateHistoricalSourceRegistry(raw) {
  assert.equal(sha(raw), REGISTRY_SHA256, 'Only the immutable historical registry is accepted');
  const data = JSON.parse(raw); assert.equal(data.schema, 1); assert.equal(data.entries.length, 16);
  const entries = new Map();
  for (const record of data.entries) {
    const key = `${record.commit}:${record.path}`, bytes = Buffer.from(record.utf8, 'utf8');
    assert.equal(entries.has(key), false, 'Historical reference must be unique');
    assert.equal(bytes.length, record.bytes); assert.equal(sha(bytes), record.sha256);
    assert.equal(createHash('sha1').update(Buffer.from(`blob ${bytes.length}\0`)).update(bytes).digest('hex'), record.gitBlob);
    entries.set(key, bytes);
  }
  return entries;
}
const entries = validateHistoricalSourceRegistry(readFileSync(new URL('../fixtures/historical-sources.json', import.meta.url)));
export function readHistoricalSource(commit, path) {
  const key = `${commit}:${path}`; assert.ok(entries.has(key), `Unknown historical source: ${key}`);
  return Buffer.from(entries.get(key));
}
