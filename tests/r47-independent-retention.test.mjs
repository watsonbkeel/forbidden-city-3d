import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {capture} from './r47-independent-capture.mjs';
const baseline=JSON.parse(readFileSync(new URL('./fixtures/r47-independent-garden-r46.json',import.meta.url)));
test('R47 independent exact actual non-target garden geometry, nav, landscape and tree instances',()=>{
 const {out,b}=capture();try{
  for(const name of ['buildGround','buildPonds','buildOrnaments','buildRockeryAndTop']) assert.deepEqual(out.phases[name],baseline.phases[name],name);
  let retained=0;for(const[key,p]of Object.entries(baseline.pavilions)){if(['-52.5,472.1','54.6,471.4'].includes(key))continue;assert.deepEqual(out.pavilions[key],p,key);retained++;}assert.equal(retained,3);
  assert.deepEqual(out.trees,baseline.trees,'actual instance matrices and geometry');
  assert.deepEqual(out.paths,baseline.paths,'ground paths');assert.deepEqual(out.beds,baseline.beds,'plant beds');
  assert.equal(out.stats.trees,34);assert.equal(out.stats.rockTriangles,baseline.stats.rockTriangles);assert.equal(out.stats.treeTriangles,baseline.stats.treeTriangles);
 }finally{b.dispose();}
});
