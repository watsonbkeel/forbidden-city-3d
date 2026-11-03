import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PalaceBuilder}from'../../src/scene/PalaceBuilder.js';
import {retainedHall}from'./retention.mjs';
const baseline=JSON.parse(readFileSync(new URL('./retained-ec50ea01.json',import.meta.url)));
for(const name of['太和殿','保和殿'])test(`${name}: retained actual surfaces, materials, columns, floor, roof and solids match ec50ea01`,()=>{const actual=retainedHall(PalaceBuilder,name),expected={...baseline.halls[name]};if(name==='太和殿')expected.excludedFrontElements++;assert.deepEqual(actual,expected);});
test('all fourteen south door/screen pieces retain geometry, materials, XY and pose under the single porch Z translation',()=>{const actual=retainedHall(PalaceBuilder,'太和殿');assert.equal(actual.frontDoorPanelCount,14);assert.equal(actual.frontDoorPanels,baseline.halls['太和殿'].frontDoorPanels);});
