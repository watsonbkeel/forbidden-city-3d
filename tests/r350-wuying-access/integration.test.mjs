import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const source=fs.readFileSync(new URL('../zone-lint.cjs',import.meta.url),'utf8');
test('only exact Wuying north-pocket and front-door consumers use source-bound current access',()=>{
 assert.ok(source.includes("'lib/wuying-current-access.mjs'"),'actual fullworld lint must call the verified current helper');
 assert.match(source,/g\.item\.southGateProfile === 'wuying' && s === 1/);
 assert.match(source,/h\.item\.southCourtProfile === 'wuying-front' && side === -1/);
 assert.ok(source.includes('if (g.backDoor) faces.push([1'));
 assert.ok(source.includes('const r = L.reachFrom(W, st, [g.x, g.z], GATE_POCKET_R + g.half'));
 assert.ok(source.includes('if (clear < GATE_SCAN)'));
});
