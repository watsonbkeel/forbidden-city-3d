import test from 'node:test';
import assert from 'node:assert/strict';
import {fixture} from '../r370-main-hall-access/fixture.mjs';
import {captureMainHallSource} from '../lib/main-hall-current-access.mjs';
test('omitting actual Chuxiu side-access hook rejects incomplete source instead of waiving its three finished surface owners',()=>{
 assert.throws(()=>fixture('west-six',true,{sideAccess(){},capture:captureMainHallSource}),/exact complete prefinish source descriptor/);
});
