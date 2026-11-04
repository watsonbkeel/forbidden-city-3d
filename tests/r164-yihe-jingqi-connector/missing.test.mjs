import test from'node:test';import assert from'node:assert/strict';import fs from'node:fs';
test('production NingShou installs the sourced Yihe to Jingqi connector once',()=>{const s=fs.readFileSync(new URL('../../src/scene/zones/ZoneBase.js',import.meta.url),'utf8');assert.equal((s.match(/buildYiheJingqiConnector\(this.kit,this.zoneJson\)/g)??[]).length,1)});
