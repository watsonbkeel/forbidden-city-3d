// QA-only diagnostic: retain every inherited world/assertion/ray/view and
// collect unreachable temporary geometry buffers after each complete view.
// Never modify production source or the original test on disk.
import {registerHooks} from 'node:module';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const target=new URL('../../tests/r66-h-world.test.mjs',import.meta.url).href;
registerHooks({load(url,context,next){
  const result=next(url,context);
  if(url!==target)return result;
  const original=typeof result.source==='string'?result.source:Buffer.from(result.source).toString('utf8');
  const edits=[
    {before:'const out=`reports/r66-h-stage/world-',after:'const out=`reports/r67-i-stage/world-'},
    {before:'await proveView(actor,label);if(report.views.length%18===0)',after:'await proveView(actor,label);if(global.gc)global.gc();if(report.views.length%18===0)'}
  ];
  let source=original;
  for(const edit of edits){
    edit.replacementCount=source.split(edit.before).length-1;
    assert.equal(edit.replacementCount,1,'one exact QA adaptation: '+edit.before);
    source=source.replace(edit.before,edit.after);
  }
  console.log('R67_QA_VIEW_GC_ADAPTATION '+JSON.stringify({originalSha256:createHash('sha256').update(original).digest('hex'),executedSha256:createHash('sha256').update(source).digest('hex'),edits}));
  return {...result,source};
}});
