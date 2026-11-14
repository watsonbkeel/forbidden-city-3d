import fs from 'node:fs';
import assert from 'node:assert/strict';
await import('/tmp/minimap-zone-export/export.mjs');
await import('/tmp/minimap-browser-diagnostic/capture.mjs');
assert.equal(process.exitCode??0,0,'capture failed');
const report=JSON.parse(fs.readFileSync(process.env.EVIDENCE_DIR+'/browser-observations.json','utf8'));
assert.equal(report.status,'DIAGNOSTIC_CAPTURE_COMPLETE_NOT_BUG_ACCEPTANCE');
assert.equal(report.states.length,9);assert.equal(report.errors.length,0);

const states=Object.fromEntries(report.states.map(s=>[s.name,s]));
assert.equal(states['01-open-en-k2'].k,2);
for(const key of ['02-full-en-k1','03-full-zh-k1','04-full-en-restored','07-full-reset'])assert.equal(states[key].k,1,key);
assert.equal(states['03-full-zh-k1'].locale,'zh-CN');
assert.equal(states['04-full-en-restored'].locale,'en');
assert.equal(states['08-compact'].compact,true);
assert.equal(states['09-expanded'].compact,false);

assert.equal(states['01-open-en-k2'].moatNotice.hidden,false);
assert.equal(states['01-open-en-k2'].moatNotice.inert,false);
assert.equal(states['08-compact'].moatNotice.hidden,true);
assert.equal(states['08-compact'].moatNotice.inert,true);
assert.equal(states['09-expanded'].moatNotice.hidden,false);
assert.equal(states['09-expanded'].moatNotice.inert,false);
const fact='筒子河五段水面（工程拟合）；南侧中央保留陆地通道，非考证桥梁。飞行禁降沿实际水面保守判定。';
for(const state of report.states)assert.equal(state.moatNotice.text,fact,'factual notice text changed');
