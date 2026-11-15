import fs from 'node:fs';
import assert from 'node:assert/strict';
process.env.REPO_ROOT='/tmp/flight-native-main-exact';
await import('/tmp/flight-native-runtime/browser/capture.mjs');
assert.equal(process.exitCode??0,0);
const report=JSON.parse(fs.readFileSync(process.env.EVIDENCE_DIR+'/result.json','utf8'));
assert.equal(report.captureComplete,true);assert.equal(report.cases.length,3);assert.equal(report.errors.length,0);
for(const c of report.cases){assert.equal(c.states.length,1);const s=c.states[0];assert.equal(s.occupied,false);assert.equal(s.focusInsideFlight,false);assert.equal(s.panelHidden,true);assert.equal(s.panelInert,true);assert.equal(s.touchHidden,true);assert.ok(fs.statSync(process.env.EVIDENCE_DIR+'/native-exit-'+c.cycle+'.png').size>0);}
