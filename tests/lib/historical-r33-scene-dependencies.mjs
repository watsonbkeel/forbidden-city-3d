import {r35Source, independentR34Source} from './r35-source-retention.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {registerHooks} from 'node:module';
import {r34Scene} from './r34-scene-retention.mjs';

const root = new URL('../../', import.meta.url);
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const contexts = new Map();
let serial = 0;

// Independent baseline modules come from Git blobs recorded in the immutable
// scene registry, never from the restoration helper under test. Retained source
// files are checked against their independently recorded R33 hashes as loaded.
export function historicalR33ModuleURL(path, overrides = {}) {
  for (const [name, row] of Object.entries(overrides)) {
    assert.ok(Object.hasOwn(r34Scene.retainedSources, name) || Object.hasOwn(r34Scene.baselineSources, name), 'known historical override path');
    assert.equal(sha(Buffer.from(row.utf8)), row.sha256, 'independent earlier epoch source: ' + name);
  }
  const key = String(++serial);
  contexts.set(key, overrides);
  const url = new URL(path, root); url.searchParams.set('r33FrozenScene', key);
  return url.href;
}
function contextFor(url) {
  const parsed = new URL(url), key = parsed.searchParams.get('r33FrozenScene');
  if (!key || !contexts.has(key) || !url.startsWith(root.href)) return null;
  parsed.search = '';
  const path = parsed.href.slice(root.href.length);
  if (!/^(src|data)\//.test(path)) return null;
  return {path, parsed, key, overrides: contexts.get(key)};
}
registerHooks({
  resolve(specifier, context, next) {
    const parent = context.parentURL && contextFor(context.parentURL);
    if (parent && specifier.startsWith('.')) {
      const target = new URL(specifier, parent.parsed);
      if (target.href.startsWith(root.href) && /^(src|data)\//.test(target.href.slice(root.href.length))) {
        target.searchParams.set('r33FrozenScene', parent.key);
        return next(target.href, context);
      }
    }
    return next(specifier, context);
  },
  load(url, context, next) {
    const frozen = contextFor(url);
    if (!frozen) return next(url, context);
    const {path, parsed, overrides} = frozen;
    const row = overrides[path] ?? r34Scene.baselineSources[path];
    const bytes = row ? Buffer.from(row.utf8) : Object.hasOwn(r35Source.files, path) ? independentR34Source(path) : fs.readFileSync(parsed);
    const expected = row?.sha256 ?? r34Scene.retainedSources[path];
    assert.ok(expected, 'registered independent R33 source: ' + path);
    assert.equal(sha(bytes), expected, 'independent frozen R33 source: ' + path);
    return {format: 'module', source: path.endsWith('.json') ? 'export default ' + bytes : bytes.toString(), shortCircuit: true};
  }
});
