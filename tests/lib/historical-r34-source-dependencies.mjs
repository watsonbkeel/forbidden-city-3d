import assert from 'node:assert/strict';
import fs from 'node:fs';
import {registerHooks} from 'node:module';
import {r35Source, independentR34Source, assertR35RetainedSource} from './r35-source-retention.mjs';

const root = new URL('../../', import.meta.url);
const epoch = 'r34FrozenSource';
const token = '2cd8189db462e34a2ffc5573a435db8a0a77cccb';
function registered(path) {
  return /^(src|data)\//.test(path) && (Object.hasOwn(r35Source.files, path) || Object.hasOwn(r35Source.retainedFiles, path));
}
/** Independent R34 execution only. Unmodified imports of the production module
 * are never redirected. The expected historical bytes are Git blob evidence,
 * not the output of any source or scene projection under test. */
export function historicalR34ModuleURL(path) {
  assert.ok(registered(path), 'registered independent R34 module: ' + path);
  const url = new URL(path, root);
  url.searchParams.set(epoch, token);
  return url.href;
}
function contextFor(url) {
  const parsed = new URL(url);
  if (parsed.searchParams.get(epoch) !== token || !url.startsWith(root.href)) return null;
  parsed.search = '';
  const path = parsed.href.slice(root.href.length);
  assert.ok(registered(path), 'registered independent R34 module: ' + path);
  return {path, parsed};
}
registerHooks({
  resolve(specifier, context, next) {
    const parent = context.parentURL && contextFor(context.parentURL);
    if (parent && specifier.startsWith('.')) {
      const target = new URL(specifier, parent.parsed);
      if (target.href.startsWith(root.href)) return next(historicalR34ModuleURL(target.href.slice(root.href.length)), context);
    }
    return next(specifier, context);
  },
  load(url, context, next) {
    const frozen = contextFor(url);
    if (!frozen) return next(url, context);
    const {path, parsed} = frozen;
    const bytes = Object.hasOwn(r35Source.files, path) ? independentR34Source(path) : assertR35RetainedSource(path, fs.readFileSync(parsed));
    return {format: 'module', source: path.endsWith('.json') ? 'export default ' + bytes : bytes.toString(), shortCircuit: true};
  }
});
