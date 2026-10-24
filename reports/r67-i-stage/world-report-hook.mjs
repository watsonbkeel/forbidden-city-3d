// QA-only load hook. Redirect only this inherited test's output directory.
// The original test file and every assertion remain unchanged.
import {registerHooks} from 'node:module';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const target=new URL('../../tests/r66-h-world.test.mjs',import.meta.url).href;
registerHooks({load(url,context,next){
  const result=next(url,context);
  if(url!==target)return result;
  const original=typeof result.source==='string'?result.source:Buffer.from(result.source).toString('utf8');
  const before='const out=`reports/r66-h-stage/world-';
  const after='const out=`reports/r67-i-stage/world-';
  assert.equal(original.split(before).length,2,'one exact output-root rewrite');
  const source=original.replace(before,after);
  console.log('R67_OUTPUT_ONLY_ADAPTATION '+JSON.stringify({originalSha256:createHash('sha256').update(original).digest('hex'),executedSha256:createHash('sha256').update(source).digest('hex'),before,after}));
  return {...result,source};
}});
