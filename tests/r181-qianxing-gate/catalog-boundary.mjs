// Comparison-only public R179 view. No runtime catalog, UI or navigation data
// is filtered. Every current/old record is proved before omitting the sole E45.
import assert from 'node:assert/strict';
import {PlaceCatalog} from '../../src/ui/PlaceCatalog.js';
import {SupplementalPlaceCatalog} from '../../src/ui/SupplementalPlaceCatalog.js';
import {actualPhysicalInputs,projectE45} from './prior-source.mjs';
const physical=actualPhysicalInputs(process.cwd()),prior=projectE45(physical);
const raw=JSON.parse(physical.get('data/places/supplemental.json').bytes),oldRaw=JSON.parse(prior.get('data/places/supplemental.json').bytes);
assert.deepEqual(raw.records.slice(0,-1),oldRaw.records);assert.equal(oldRaw.records.length,128);assert.equal(raw.records.length,129);
const row=raw.records.at(-1);assert.equal(row.id,'supp-fc-e8cc6a03c1');assert.equal(row.sourceObjectId,'FC-E8CC6A03C1');assert.equal(row.parentObjectId,null);assert.equal(row.structureId,'qianxing-glazed-gate-fit');assert.equal(row.classification,'supplemental-directory-only');assert.equal(row.travel,'none');assert.equal(row.mapBinding,null);
assert.equal(raw.supplementalDirectoryCardCount,oldRaw.supplementalDirectoryCardCount+1);assert.equal(raw.candidateCardDenominator,oldRaw.candidateCardDenominator+1);assert.equal(raw.supplementalMapCardCount,oldRaw.supplementalMapCardCount);
// Construct both expectations from verified bytes, never from mutable default
// imports or current objects. This also preserves the R179 live-drift oracle.
const original=new PlaceCatalog(JSON.parse(prior.get('data/places/zh-CN.json').bytes)).places;
const additional=new SupplementalPlaceCatalog(raw).places,oldAdditional=new SupplementalPlaceCatalog(oldRaw).places;
const expected=[...original,...additional],expectedOld=[...original,...oldAdditional];
assert.equal(original.length,164);assert.equal(expected.length,293);assert.equal(expectedOld.length,292);
export function catalogBeforeE45(catalog){
 for(const [name,expectedRows] of [['places',original],['supplementalPlaces',additional],['allPlaces',expected]]){assert.equal(catalog[name].length,expectedRows.length,name+' complete occurrence count');assert.deepEqual(catalog[name].map(p=>p.id),expectedRows.map(p=>p.id),name+' complete ordered identities');}
 assert.deepEqual(catalog.places,original,'complete original164');assert.deepEqual(catalog.supplementalPlaces,additional,'complete current supplemental records');assert.deepEqual(catalog.allPlaces,expected,'all293 current identities/content/order/occurrences');
 const added=catalog.allPlaces.filter(p=>p.id===row.id);assert.equal(added.length,1);assert.equal(added[0],catalog.allPlaces.at(-1));assert.equal(added[0].modelExperience.navigationMode,'information-only');assert.equal(added[0].modelExperience.teleportTargetName,null);
 const allPlaces=catalog.allPlaces.slice(0,-1),supplementalPlaces=catalog.supplementalPlaces.slice(0,-1);assert.deepEqual(allPlaces,expectedOld);assert.deepEqual(supplementalPlaces,oldAdditional);
 return{places:catalog.places,supplementalPlaces,allPlaces,get:id=>allPlaces.find(p=>p.id===id)??null};
}
