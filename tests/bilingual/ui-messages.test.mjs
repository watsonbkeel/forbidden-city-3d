import expectedNames from './official-name-expectations.json' with {type:'json'};
import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const m=await import('../../src/i18n/Messages.js').catch(()=>({}));
test('every bundled UI message translates with complete parameters and no Han placeholder',()=>{
 assert.equal(typeof m.translateText,'function','bundled messages exist');
 const data=JSON.parse(readFileSync(new URL('../../data/i18n/ui-en.json',import.meta.url)));
 assert.ok(Object.keys(data.messages).length>400);
 for(const [source,target]of Object.entries(data.messages)){assert.ok(target.trim(),source);assert.doesNotMatch(target,/[\u3400-\u9fff]/u,source);const reviewedName=expectedNames.find(row=>row.chineseName===source&&row.status==='official-display');assert.equal(m.translateText(source,'en'),reviewedName?.displayName??target,source);}
});
test('four bridge facilities translate names, introductions, model limits and source labels',async()=>{
 assert.equal(typeof m.translateText,'function');const {bridgeFacilityInfoFor}=await import('../../src/ui/ModelFidelity.js');
 for(const id of ['FC-D156902D78','FC-B9097C61D8','FC-74F8C30390','FC-17AFD38428']){const f=bridgeFacilityInfoFor(id);for(const text of [f.name,f.intro,f.detail,...f.sources.flatMap(s=>[s.title,s.publisher])]){const out=m.translateText(text,'en');assert.notEqual(out,text);assert.doesNotMatch(out,/unavailable|[\u3400-\u9fff]/u);}}
});
test('dynamic UI stays translated for counts, flight, clock and model evidence',async()=>{
 assert.equal(typeof m.translateText,'function');const samples=['显示 3 / 168 个地点','已选择太和殿','虚拟飞行 · 25m · 御花园','北京时间 12:30 · 白昼','太和殿 › 太和殿'];
 for(const text of samples){const out=m.translateText(text,'en');assert.doesNotMatch(out,/unavailable|[\u3400-\u9fff]/u,text);}
});
test('all current card model-fidelity statements translate their dynamic text',async()=>{
 const {modelFidelityFor}=await import('../../src/ui/ModelFidelity.js');const base=JSON.parse(readFileSync(new URL('../../data/places/zh-CN.json',import.meta.url)));
 for(const p of base.places){const f=modelFidelityFor(p.name,p.id)??modelFidelityFor(p.canonicalName);if(!f)continue;for(const value of [f.short,f.detail])assert.doesNotMatch(m.translateText(value,'en'),/unavailable|[\u3400-\u9fff]/u,p.name);}
});
test('loading material progress translates the exact composed main UI label',()=>{
 const source='加载中... 20%（材质贴图 3/10）';assert.equal(m.translateText(source,'en'),'Loading... 20% (Material textures 3/10)');assert.equal(m.translateText(source,'zh-CN'),source);
});
