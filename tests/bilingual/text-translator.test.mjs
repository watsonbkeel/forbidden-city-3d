import test from 'node:test';import assert from 'node:assert/strict';
const module=await import('../../src/i18n/TextTranslator.js').catch(()=>({}));
const create=options=>{assert.equal(typeof module.createTextTranslator,'function','text translator is implemented');return module.createTextTranslator({messages:{'关闭地图':'Close map','已选择${0}':'Selected ${0}','显示 ${0} / ${1} 个地点':'Showing ${0} / ${1} places','人物已关闭。':'Characters are off.','${0}：${1}':'${0}: ${1}','用途':'Use'},name:source=>source==='太和殿'?'Taihe Hall':null,...options});};
test('exact text and templates translate safe text without interpreting HTML',()=>{
 const t=create();assert.equal(t('关闭地图','en'),'Close map');assert.equal(t('显示 2 / 168 个地点','en'),'Showing 2 / 168 places');assert.equal(t('已选择太和殿','en'),'Selected Taihe Hall');assert.equal(t('关闭地图','zh-CN'),'关闭地图');assert.equal(t('42','en'),'42');assert.equal(t('用途：人物已关闭。','en'),'Use: Characters are off.');
});
test('whitespace normalization retains outer spaces and unknown Chinese is explicit',()=>{
 const missing=[];const t=create({onMissing:s=>missing.push(s)});assert.equal(t('  关闭地图\n','en'),'  Close map\n');assert.equal(t('尚未翻译','en'),'English text unavailable.');assert.deepEqual(missing,['尚未翻译']);
});
test('unmodified model place names can be localized inside existing separators',()=>{
 const t=create();assert.equal(t('太和殿 › 太和殿','en'),'Taihe Hall › Taihe Hall');assert.equal(t('25m · 太和殿','en'),'25m · Taihe Hall');
});
test('bad dictionaries reject omitted, duplicate or added template parameters',()=>{
 assert.equal(typeof module.createTextTranslator,'function');
 for(const value of ['Selected','${0} ${0}','${1}'])assert.throws(()=>module.createTextTranslator({messages:{'已选择${0}':value}}));
});
