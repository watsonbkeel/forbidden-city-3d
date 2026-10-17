import {restorePreWumenVerticalSource} from '../lib/wumen-vertical-source-delta.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {GATE_PLAQUE_SOURCE_DELTAS,restoreV10GateSource} from '../lib/v12-gate-plaque-source-delta.mjs';
import {restoreV13GroundDoorSource} from '../lib/v14-ground-door-source-delta.mjs';

for(const [path,record] of Object.entries(GATE_PLAQUE_SOURCE_DELTAS)){
  const raw=restorePreWumenVerticalSource(path,fs.readFileSync(new URL(`../../${path}`,import.meta.url)));
  const current=path==='src/scene/PalaceBuilder.js'?restoreV13GroundDoorSource(raw):raw;
  test(`${path}: only exact V12 plaque substitutions and roof-local metadata differ from pinned V10`,()=>{
    const historical=restoreV10GateSource(path,current);
    assert.notDeepEqual(historical,current);
  });
  for(const [index,delta] of record.deltas.entries())for(const kind of ['missing','duplicated','modified'])test(`${path}: source guard rejects ${kind} delta ${index}`,()=>{
    const mutated=current.toString().replace(delta.after,kind==='missing'?'':kind==='duplicated'?delta.after+delta.after:delta.after+'// unauthorized\n');
    assert.throws(()=>restoreV10GateSource(path,Buffer.from(mutated)));
  });
  test(`${path}: source guard rejects any unrelated retained-byte edit`,()=>{
    assert.throws(()=>restoreV10GateSource(path,Buffer.concat([current,Buffer.from('\n')])));
    const changed=current.toString().replace("import * as THREE from 'three';","import * as THREE from 'unapproved-three';");
    assert.throws(()=>restoreV10GateSource(path,Buffer.from(changed)));
  });
}
