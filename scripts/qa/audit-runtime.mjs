// Syntax and static local-edge validation, not execution, a renderer, or a linter.
import vm from 'node:vm';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

if (!vm.SourceTextModule) throw Error('Run node --experimental-vm-modules scripts/qa/audit-runtime.mjs');
const root = fileURLToPath(new URL('../../', import.meta.url));
const counts = { modules: 0, localImports: 0, dataJSON: 0 };
const failures = [];
function walk(dir) {
  return readdirSync(resolve(root, dir), { withFileTypes: true }).flatMap(e => {
    const rel = dir + '/' + e.name;
    return e.isDirectory() ? walk(rel) : [rel];
  });
}
for (const file of ['main.js', 'vite.config.js', ...walk('src'), ...walk('data')]) {
  if (!['.js', '.mjs', '.json'].includes(extname(file))) continue;
  try {
    const absolute = resolve(root, file);
    const source = readFileSync(absolute, 'utf8');
    if (file.endsWith('.json')) { JSON.parse(source); counts.dataJSON++; continue; }
    const m = new vm.SourceTextModule(source, { identifier: file });
    counts.modules++;
    for (const {specifier} of m.moduleRequests) {
      if (!specifier.startsWith('./') && !specifier.startsWith('../')) continue;
      const dependency = resolve(dirname(absolute), specifier);
      if (!existsSync(dependency) || !statSync(dependency).isFile()) throw Error('missing import ' + specifier);
      counts.localImports++;
    }
  } catch (error) { failures.push({ file, error: error.message }); }
}
console.log(JSON.stringify({ ...counts, failures }, null, 2));
if (failures.length) process.exitCode = 1;
