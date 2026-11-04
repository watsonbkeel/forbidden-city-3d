import test from'node:test';import assert from'node:assert/strict';import fs from'node:fs';
test('production ZoneBase must add the missing third and fourth Qingshou hall shells exactly once',()=>{const s=fs.readFileSync(new URL('../../src/scene/zones/ZoneBase.js',import.meta.url),'utf8');assert.equal((s.match(/buildQingshouNorthHalls\(this.kit,this.zoneJson\)/g)||[]).length,1)});
