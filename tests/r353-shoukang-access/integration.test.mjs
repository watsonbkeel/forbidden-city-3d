import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const source=fs.readFileSync(new URL('../zone-lint.cjs',import.meta.url),'utf8');
test('exact Shoukang front contract preserves gate/rear/world and old blocker reporting',()=>{
 assert.ok(source.includes("'lib/shoukang-current-access.mjs'"),'actual same-world contract required');
 assert.match(source,/h\.zone === 'outer-west' && h\.item === W\.zones\.find\(z => z\.json\.id === 'outer-west'\)\?\.json\.items\[47\] && h\.item\.structure === 'shoukang-front-hall' && side === -1/);
 assert.ok(source.includes('SHOUKANG_CURRENT_ACCESS_JSON'));
 const hook=source.indexOf('const current = await shoukangAccess()'),scan=source.lastIndexOf('const who = blockersIn',hook);assert.ok(scan>source.indexOf("for (const [side, label] of faces)"));
 assert.ok(source.includes('if (g.backDoor) faces.push([1'));assert.ok(source.includes('const r = L.reachFrom(W, st, [g.x, g.z], GATE_POCKET_R + g.half'));assert.ok(source.includes('if (clear < GATE_SCAN)'));assert.ok(source.includes('if (who.length) warn(`${where} 原门前范围仍有其他构件'));
});
