// Source-only independent audit. Does not import or build a production scene.
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../../../../', import.meta.url));
const read = p => readFileSync(path.join(root, p));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const base = '92cf31ec1779d0d6266a2caa6ad1708c379d1500';
const oldPath = 'tests/r49-inherited-world-body.test.mjs';
const newPath = 'tests/r49b-inherited-world-body.test.mjs';
const oldTest = read(oldPath).toString(), newTest = read(newPath).toString();
const git = p => execFileSync('git', ['show', `${base}:${p}`], {cwd:root});
assert.equal(sha(read(oldPath)), sha(git(oldPath)), 'original test remains byte-exact baseline');
const start = 'const deltaBytes=';
const end = 'const inheritedURL=';
const oldGuard = oldTest.slice(oldTest.indexOf(start), oldTest.indexOf(end));
const newGuard = newTest.slice(newTest.indexOf(start), newTest.indexOf(end));
const header = '// R49B supplemental adapter: production scene/body/step assertions below are verbatim R49.\n// Only the source-provenance inverse adds exact reviewed R49B hunks before R49\'s existing inverse.\n';
assert.ok(newTest.startsWith(header));
assert.equal(newTest.slice(header.length).replace(newGuard, oldGuard), oldTest,
  'all text outside added header and source-only guard is byte-exact original');
assert.equal((newTest.match(/originalSupportSource\(/g) ?? []).length, 2,
  'only declaration and hash-check call exist');
const deltaPath = 'tests/fixtures/r49b-support-source-delta.json';
const delta = JSON.parse(read(deltaPath));
const expectedPaths = ['src/scene/palace/kit.js','src/scene/palace/special/SouthCourtGates.js'];
assert.deepEqual(Object.keys(delta).sort(), expectedPaths.slice().sort());
const paths = [];
for (const p of expectedPaths) {
  const d = delta[p], before = read(p).toString();
  assert.equal(sha(before), d.candidateSha256);
  let restored = before;
  for (const h of d.hunks) {
    assert.equal(restored.split(h.after).length - 1, 1);
    restored = restored.replace(h.after, h.before);
  }
  assert.equal(sha(restored), d.r49Sha256);
  assert.equal(restored, git(p).toString(), 'inverse matches actual R49 git bytes, not just fixture claim');
  paths.push({path:p, hunks:d.hunks.length, candidateSha256:sha(before), restoredR49Sha256:sha(restored), matchesR49Git:true});
}
const immutablePath = 'docs/current-state/r48-remaining/independent-final-six/inherited-step-triangles.json';
const inherited = JSON.parse(read(immutablePath));
const allowed = new Set([...Object.keys(inherited.sourceHashes), deltaPath,
  'tests/fixtures/r49-support-source-delta.json', immutablePath]);
// Execute ONLY the literal source guard in a fresh VM. No module loaders,
// eval callback, write API, scene builder or production object is supplied.
const guardEnd = newTest.indexOf('\nconst supportTriangles=');
const guardCode = newTest.slice(newTest.indexOf(start), guardEnd)
  .replaceAll('import.meta.url', JSON.stringify(pathToFileURL(path.join(root,newPath)).href));
function runGuard(overrides = {}) {
  const reads = [];
  new vm.Script(guardCode).runInNewContext({assert,createHash,URL,
    readFileSync(url, encoding) {
      const relative = path.relative(root, fileURLToPath(url));
      assert.ok(allowed.has(relative), 'guard must read only expected evidence/source paths');
      reads.push(relative);
      const bytes = Object.hasOwn(overrides, relative) ? Buffer.from(overrides[relative]) : read(relative);
      return encoding ? bytes.toString(encoding) : bytes;
    }
  }, {timeout:2000});
  return reads;
}
const guardReads = runGuard();
const mutationChecks = [];
for (const p of expectedPaths) {
  let error;
  try { runGuard({[p]: read(p).toString()+'\n'}); } catch(e) {error=e;}
  assert.ok(error && error.message.includes('frozen R49B candidate source'), 'candidate mutation must be rejected');
  mutationChecks.push({path:p,mutation:'append newline in memory only',rejectedBy:'candidate SHA-256'});
}
for (const p of [deltaPath, 'tests/fixtures/r49-support-source-delta.json', immutablePath]) {
  let error;
  try { runGuard({[p]: read(p).toString()+'\n'}); } catch(e) {error=e;}
  assert.ok(error, 'evidence-byte mutation must be rejected');
  mutationChecks.push({path:p,mutation:'append newline in memory only',rejectedBy:'frozen evidence SHA-256'});
}
const unchangedPaths = [oldPath, 'tests/lib/world.mjs', 'tests/lib/auto-routes.mjs',
  'tests/lib/terrace-walk.mjs','tests/lib/physical-waypoints.mjs',
  'tests/lib/r48-real-texture-library.mjs','tests/stepwalk.cjs',
  'src/controls/FirstPerson.js','src/utils/Collision.js',
  'tests/fixtures/r49-support-source-delta.json', immutablePath];
for(const p of unchangedPaths) assert.equal(sha(read(p)),sha(git(p)),p+' unchanged from R49');
const globalReview = JSON.parse(read('reports/r49b/release/independent/r49b-global-independent-review.json'));
const productionHashComparison = Object.entries(globalReview.productionHashes).map(([p,h]) => {
  const currentSha256=sha(read(p)); assert.equal(currentSha256,h,p+' matches independent geometry-reviewed freeze');
  return {path:p,currentSha256,matchesIndependentReview:true};
});
const result = {reviewedAtUTC:new Date().toISOString(),reviewType:'source-only; no world construction or body execution',
  baselineCommit:base,verdict:'SOURCE_GUARD_ADAPTER_ACCEPTED_WITHOUT_BODY_ASSERTION_WEAKENING',
  originalTestSha256:sha(oldTest),supplementalTestSha256:sha(newTest),fixtureSha256:sha(read(deltaPath)),
  originalTestUnchanged:true,allNonGuardTextByteExact:true,paths,guardReads,
  directLiteralGuardExecutionPassed:true,mutationChecks,
  immutableSupports:{sha256:sha(read(immutablePath)),rows:inherited.rows.length,
    triangles:inherited.rows.reduce((n,r)=>n+r.triangles.length,0),sourceHashes:inherited.sourceHashes},
  unchangedPaths,productionHashComparison,
  testRegistration:{routeCount:7,fpsCases:2,sprintCases:2,backwardCases:2,bodyCases:56,negativeSupportCase:1,total:57,runtimeExecutedHere:false},
  limitations:['Does not claim 57 body cases passed; await actual candidate run.',
    'Seven selected routes do not cover all buildings or both changed canopies.',
    'Inverse source hashing is provenance, not geometric equivalence.',
    'Prior bounded canopy CPU geometry review is separate; no GPU or R50 character acceptance.']};
writeFileSync(new URL('./body-guard-adapter-review.json',import.meta.url),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({verdict:result.verdict,exactBodyCode:true,guardExecuted:true,mutationRejections:mutationChecks.length,
  productionHashesMatched:productionHashComparison.length,testsNotRun:57,output:'reports/r49b/release/independent/body-guard-adapter-review.json'}));
