import assert from 'node:assert/strict';
import fs from 'node:fs';
import {r32Source, restorePreR32Source} from './r32-source-retention.mjs';

// Historical builders must execute the frozen dependency, not merely verify
// its old hash and then import the live R32 implementation. This includes the
// Qianqing setting and its private art module, and the shared palace kit.
const root = new URL('../../', import.meta.url);
const modules = new Map();
function historicalModule(path) {
  if (modules.has(path)) return modules.get(path);
  assert.ok(Object.hasOwn(r32Source.files, path), 'registered R32 historical dependency');
  assert.ok(path.endsWith('.js'), 'registered JavaScript historical dependency');
  const url = new URL(path, root);
  const bytes = restorePreR32Source(path, fs.readFileSync(url));
  const source = bytes.toString().replace(/^([ \t]*import\b[^;]*?\bfrom\s*)(['"])([^'"]+)\2/gm,
    (_, prefix, quote, specifier) => `${prefix}'${historicalR31Dependency(specifier, url)}'`);
  const result = 'data:text/javascript;base64,' + Buffer.from(source).toString('base64');
  modules.set(path, result);
  return result;
}

export function historicalR31Dependency(specifier, url) {
  if (specifier === 'three') return import.meta.resolve('three');
  const target = new URL(specifier, url);
  for (const path of Object.keys(r32Source.files)) {
    if (path.endsWith('.js') && target.href === new URL(path, root).href) return historicalModule(path);
  }
  return target.href;
}
