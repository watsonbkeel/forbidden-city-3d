import {restorePreWumenVerticalSource} from '../lib/wumen-vertical-source-delta.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
const current=restorePreWumenVerticalSource('src/scene/palace/special/GatePlaques.js',fs.readFileSync(new URL('../../src/scene/palace/special/GatePlaques.js',import.meta.url))).toString('utf8');
const before="if(hit?.object.material.name!=='roof_tile')",after="if(hit?.object.material!==builder.library.material('roof_tile'))";
const historicalSHA='76a27f072cbb40897c109bcbebaad654eacf5a7435ad777ec510584c45a0960b';
function restore(text){assert.equal(text.split(after).length-1,1);const restored=text.replace(after,before);assert.equal(createHash('sha256').update(restored).digest('hex'),historicalSHA);return restored;}
test('one exact material-object guard substitution restores immutable 8f74 source bytes',()=>{assert.notEqual(restore(current),current);});
for(const kind of ['missing','duplicated','modified','unrelated-byte'])test(`material identity guard rejects ${kind}`,()=>{
 const changed=kind==='unrelated-byte'?current+'\n':current.replace(after,kind==='missing'?'':kind==='duplicated'?after+after:after+'/* changed */');
 assert.throws(()=>restore(changed));
});
