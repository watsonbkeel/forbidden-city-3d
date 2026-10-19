import {restorePreR12InnerSource} from '../lib/r12-inner-source-retention.mjs';
import {restorePreWumenVerticalSource} from '../lib/wumen-vertical-source-delta.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {PLAQUE_VISIBILITY_DELTA as delta,restoreRejectedPlaqueSource} from '../lib/v11-plaque-visibility-source-delta.mjs';
import {restoreV13GroundDoorSource} from '../lib/v14-ground-door-source-delta.mjs';
const current=restorePreWumenVerticalSource(delta.path,fs.readFileSync(new URL('../../'+delta.path,import.meta.url)));
test('one finite Wumen mounting delta restores exact rejected V11 source; unrelated plaques stay exact',()=>{assert.notDeepEqual(restoreRejectedPlaqueSource(current),current);});
for(const kind of ['missing','duplicated','modified','unrelated-byte'])test(`visibility source guard rejects ${kind}`,()=>{
 const mutated=kind==='unrelated-byte'?Buffer.concat([current,Buffer.from('\n')]):Buffer.from(current.toString().replace(delta.after,kind==='missing'?'':kind==='duplicated'?delta.after+delta.after:delta.after+'\n// changed'));
 assert.throws(()=>restoreRejectedPlaqueSource(mutated));
});
// Protected surrounding runtime is byte-identical to rejected V11. Existing
// historical V10 guards and retained-geometry hashes remain independently active.
const unchanged={
 'src/scene/RoofBuilder.js':'0f486cbf623f4fd85487e4f4dd925ffc956e4e1d598acf1200ae8f3deaf398de',
 'src/scene/PalaceBuilder.js':'dfddcea43a70e4d28383c8c420e2f29f274cf4afbb588e9dcc163b80638bd18e',
 'src/config/constants.js':'464eabc753a393b325c17de3a7ee1e49dc746d9fdf95ef8f7e1ed5a5c1efe439',
};
for(const [path,sha]of Object.entries(unchanged))test(`${path}: no roof/builder/camera-constant edit in the visibility fix after exact V14 leaf normalization`,()=>{
 const raw=restorePreWumenVerticalSource(path,restorePreR12InnerSource(path,fs.readFileSync(new URL('../../'+path,import.meta.url))));
 const retained=path==='src/scene/PalaceBuilder.js'?restoreV13GroundDoorSource(raw):raw;
 assert.equal(createHash('sha256').update(retained).digest('hex'),sha);
});
