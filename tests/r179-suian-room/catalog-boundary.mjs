// Test-only view for historical card-count assertions. It never changes the
// live catalog, UI selection, directory records or runtime navigation behavior.
import assert from 'node:assert/strict';
import {PlaceCatalog} from '../../src/ui/PlaceCatalog.js';
import {SupplementalPlaceCatalog} from '../../src/ui/SupplementalPlaceCatalog.js';
import {actualPhysicalInputs,projectF47} from './prior-source.mjs';
import {physicalInputs as r179Inputs} from '../r181-qianxing-gate/prior-source.mjs';
const physical=r179Inputs(process.cwd());
// This verifies every actual runtime byte/mode and the exact four F47 inverse
// deltas against public R177 before using any historical comparison view.
const prior=projectF47(physical);
const raw=JSON.parse(physical.get('data/places/supplemental.json').bytes);
const oldRaw=JSON.parse(prior.get('data/places/supplemental.json').bytes);
assert.deepEqual(raw.records.slice(0,-1),oldRaw.records);
const row=raw.records.at(-1);
assert.equal(row.id,'supp-fc-8e4e75bf02');assert.equal(row.sourceObjectId,'FC-8E4E75BF02');
assert.equal(row.parentObjectId,'FC-17D883BCE6');assert.equal(row.structureId,'yangxin-suian-room');
assert.equal(row.classification,'supplemental-directory-only');assert.equal(row.mapBinding,null);assert.equal(row.travel,'none');
// Parse the verified public source bytes instead of PlaceCatalog's default
// imported data: live catalogs retain references to that import, so cloning
// the current objects after they drift would silently poison this oracle.
const originalInput=JSON.parse(prior.get('data/places/zh-CN.json').bytes);
const original=new PlaceCatalog(originalInput).places;
const additional=new SupplementalPlaceCatalog(raw).places;
const oldAdditional=new SupplementalPlaceCatalog(oldRaw).places;
const expected=[...original,...additional],expectedOld=[...original,...oldAdditional];
assert.equal(original.length,164);assert.equal(expectedOld.length,291);assert.equal(expected.length,292);
export function catalogBeforeF47(catalog){
 assert.deepEqual(catalog.places,original,'all original164 records unchanged');
 assert.deepEqual(catalog.supplementalPlaces,additional,'complete actual supplemental directory');
 assert.deepEqual(catalog.allPlaces,expected,'all current records, contents, order and occurrences');
 const added=catalog.allPlaces.filter(p=>p.id===row.id);assert.equal(added.length,1);
 assert.equal(added[0],catalog.allPlaces.at(-1));assert.equal(added[0].sourceObjectId,row.sourceObjectId);
 assert.equal(added[0].modelExperience.navigationMode,'information-only');assert.equal(added[0].modelExperience.teleportTargetName,null);
 // Preserve actual object references so older tests' exact named exclusions
 // still describe their own additions; only this proved final F47 is omitted.
 const result=catalog.allPlaces.slice(0,-1);assert.deepEqual(result,expectedOld);return result;
}
