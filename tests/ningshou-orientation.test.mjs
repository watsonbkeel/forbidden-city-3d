import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const data = JSON.parse(fs.readFileSync(new URL('../data/zones/ningshou.json', import.meta.url)));
// Wang Zilin, Palace Museum Journal 2011, printed125/PDF4. Cardinal
// descriptions determine facing; they do not calibrate our model coordinates.
for (const [name, rot] of [['保泰门','east'],['履顺门','west'],['敛禧门','east'],['蹈和门','west']]) {
  test(`${name} preserves the documented cardinal facing ${rot}`, () => {
    assert.equal(data.items.find(v => v.name === name).rot, rot);
  });
}
