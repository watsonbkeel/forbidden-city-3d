import test from 'node:test';import assert from 'node:assert/strict';
import expected from './official-name-expectations.json' with {type:'json'};
import {assertCompleteSourceLinks} from './name-source-assertions.mjs';
const card=expected.find(r=>r.id==='taihe'),history=[{id:'history-example',url:'https://www.dpm.org.cn/explore/building/236465.html'}];
const rows=()=>[{id:'place-source-history-example',href:history[0].url},...card.sources.map(s=>({id:`place-name-source-taihe-${s.id}`,href:s.url}))];
const anchors=values=>values.map(v=>({id:v.id,getAttribute:k=>k==='href'?v.href:null}));
test('complete source-link oracle accepts exact history and independently reviewed naming links only',()=>{const values=anchors(rows());assert.equal(assertCompleteSourceLinks(values,'taihe',history).size,card.sources.length);});
test('source-link oracle rejects forged IDs, changed URLs, other-card IDs, missing fields and unexpected extra or duplicate links',()=>{
 const mutations=[r=>r[1].id='place-name-source-taihe-invented',r=>r[1].href='https://intl.dpm.org.cn/explore.html',r=>r[1].id=r[1].id.replace('-taihe-','-baohe-'),r=>delete r[1].id,r=>delete r[1].href,r=>r.push({id:'place-name-source-taihe-extra',href:r[1].href}),r=>r.push({...r[1]}),r=>r.push({id:'unexpected-history-link',href:history[0].url}),r=>r.splice(1,1)];
 for(const change of mutations){const r=rows();change(r);assert.throws(()=>assertCompleteSourceLinks(anchors(r),'taihe',history));}
 assert.throws(()=>assertCompleteSourceLinks(anchors(rows()),'baohe',history));
});
