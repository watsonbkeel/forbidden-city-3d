import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createR157FrozenSourceReader} from '../../../lib/r157-frozen-source-reader.mjs';
const commit='c9b25a712e286877f2abbc88f4522add3fc0caea';
test('Wenyuan historical two-file parent remains pinned, not substituted from live source',()=>{
 const reader=createR157FrozenSourceReader(process.cwd(),commit);
 assert.deepEqual([...reader.paths].sort(),['src/scene/palace/special/SouthWaterSystem.js','src/utils/Collision.js']);
 for(const p of reader.paths){const s=reader.read(p);assert.ok(!s.includes("from './WenyuanPondBridgeRails.js'"));assert.ok(!s.includes('canRecoverInwardFromWenyuanRail'));assert.equal(createHash('sha256').update(s).digest('hex'),{"src/scene/palace/special/SouthWaterSystem.js": "8fa6d3b9e6ddfc831b74f1af755552ee4974b492a7d13fa7b85da880b91adecb", "src/utils/Collision.js": "f466426f69dee9a5562c293d40a1cb19c811b145e3d37b37a9864172ea9ce8b7"}[p]);}
 assert.throws(()=>reader.read('src/scene/Layout.js'),/outside frozen/);
});
