import fs from 'node:fs';
import assert from 'node:assert/strict';
process.env.REPO_ROOT='/tmp/time-flight-main-exact';
await import('/tmp/time-flight-runtime/browser/capture.mjs');
assert.equal(process.exitCode??0,0,'capture execution failed');
const report=JSON.parse(fs.readFileSync(process.env.EVIDENCE_DIR+'/result.json','utf8'));
assert.equal(report.captureComplete,true);assert.equal(report.cases.length,2);assert.equal(report.errors.length,0);
for(const c of report.cases){assert.equal(c.states.length,3);for(const s of c.states){assert.equal(s.mapOpen,false);assert.equal(s.mobile,true);assert.ok(fs.statSync(process.env.EVIDENCE_DIR+'/'+s.file).size>0);}}
// Capture completion is not a finding of a bug or product acceptance.
