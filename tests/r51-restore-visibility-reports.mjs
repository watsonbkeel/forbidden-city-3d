import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { gunzipSync } from 'node:zlib';
import assert from 'node:assert/strict';

const sha = data => createHash('sha256').update(data).digest('hex');
const index = JSON.parse(readFileSync(new URL('../reports/r51-visibility/archived-reports.json', import.meta.url)));
for (const item of index.reports) {
  const archive = readFileSync(new URL('../' + item.archive, import.meta.url));
  assert.equal(archive.length, item.archiveBytes);
  assert.equal(sha(archive), item.archiveSha256);
  const original = gunzipSync(archive);
  assert.equal(original.length, item.sourceBytes);
  assert.equal(sha(original), item.sourceSha256);
  JSON.parse(original.toString('utf8'));
  if (process.argv.includes('--restore')) {
    const target = new URL('../' + item.source, import.meta.url);
    if (existsSync(target)) assert.equal(sha(readFileSync(target)), item.sourceSha256, 'Refusing to overwrite different evidence');
    else writeFileSync(target, original, { flag: 'wx' });
  }
  console.log(`${item.source}: verified ${item.sourceBytes} original bytes`);
}
