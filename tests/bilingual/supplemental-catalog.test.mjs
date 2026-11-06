import test from 'node:test';import assert from 'node:assert/strict';
const module=await import('../../src/ui/SupplementalPlaceCatalog.js').catch(()=>({}));
const sample=()=>({schemaVersion:1,records:[{id:'supp-example',name:'示例亭',displayName:'示例亭',nameEn:'Example Pavilion',pinyin:['shi li ting'],zoneId:'garden',sourceObjectId:'FC-EXAMPLE',parentObjectId:null,structureId:'example-pavilion',classification:'supplemental-map-attraction',mapBinding:{kind:'hall',name:'示例亭',x:5,z:6,w:7,d:8,structure:'example-pavilion'},travel:'existing-target-only',summary:{zh:'测试用介绍。',en:'Test description.',sourceIds:['official-example']},functionTag:{zh:'景点',en:'Place'},evidenceNote:{zh:'这是测试数据。',en:'This is test data.'},modelNote:{zh:'只使用已有观览点。',en:'Use only an existing viewpoint.'},siteAccess:{status:'not-verified',zh:'现场开放未核实。',en:'Current site access is unverified.'},sources:[{id:'official-example',title:'示例',titleEn:'Example',publisher:'故宫博物院',url:'https://www.dpm.org.cn/explore/building/236466.html',reviewType:'reused-official-source-attribution',reviewedAt:null}]}]});
const create=input=>{assert.equal(typeof module.SupplementalPlaceCatalog,'function','supplemental catalog exists');return new module.SupplementalPlaceCatalog(input);};
test('supplemental bindings require exact projection and source identity, not a similar name',()=>{
 const data=sample(),c=create(data),p=c.get('supp-example'),item={...data.records[0].mapBinding};assert.equal(p.name,'示例亭');assert.equal(c.forMapItem(item,[item]),p);
 for(const delta of [{x:5.1},{w:7.1},{structure:'other'},{kind:'gate'},{name:'别处'}])assert.equal(c.forMapItem({...item,...delta},[{...item,...delta}]),null);
 assert.equal(c.forMapItem({...item},[item,{...item}]),null,'duplicated exact map identity is ambiguous');
 assert.deepEqual(c.sourcesFor(p).map(s=>s.id),['official-example']);assert.equal(p.modelExperience.teleportTargetName,'示例亭');
});
test('directory-only descriptions cannot offer travel even if a same-named target exists elsewhere',()=>{
 const d=sample();d.records[0].mapBinding=null;d.records[0].travel='none';d.records[0].classification='supplemental-directory-only';const c=create(d),p=c.get('supp-example');
 assert.equal(p.modelExperience.navigationMode,'information-only');assert.equal(p.modelExperience.teleportTargetName,null);assert.equal(c.forMapItem(sample().records[0].mapBinding,[sample().records[0].mapBinding]),null);
});
test('duplicate IDs, insecure sources, missing bilingual fields and forged map keys fail',()=>{
 for(const mutate of [d=>d.records.push(structuredClone(d.records[0])),d=>d.records[0].summary.en='',d=>d.records[0].summary.en='中文冒译',d=>d.records[0].summary.sourceIds=['missing'],d=>d.records[0].sources[0].url='https://evil.example/a',d=>d.records[0].mapBinding.x=NaN,d=>d.records[0].mapBinding.teleportTarget='invented',d=>{d.records[0].mapBinding=null;d.records[0].travel='existing-target-only';}]){const data=sample();mutate(data);assert.throws(()=>create(data));}
});
test('two map keys sharing a display name keep separate IDs and destinations',()=>{
 const d=sample(),second=structuredClone(d.records[0]);second.id='supp-example-second';second.name='示例亭第二体';second.displayName='示例亭';second.mapBinding.name=second.name;second.mapBinding.x=15;second.structureId='example-second';second.mapBinding.structure=second.structureId;d.records.push(second);const c=create(d);
 assert.notEqual(c.get('supp-example'),c.get(second.id));assert.equal(c.get(second.id).modelExperience.teleportTargetName,second.name);
});
test('ID-less runtime projections require an explicit source declaration exception and still match uniquely',()=>{
 const d=sample(),r=d.records[0];delete r.mapBinding.structure;assert.throws(()=>create(d));r.bindingMode='exact-source-projection-no-runtime-id';assert.throws(()=>create(d));r.sourcePaths=['src/scene/palace/special/Example.js'];const c=create(d),item={...r.mapBinding};assert.equal(c.forMapItem(item,[item]).id,r.id);
 for(const key of ['x','z','w','d']){const bad={...item,[key]:item[key]+.01};assert.equal(c.forMapItem(bad,[bad]),null);}
 assert.equal(c.forMapItem(item,[item,{...item}]),null);
});
test('real profile/source map metadata is checked, while conflicting citation identities fail',()=>{
 const d=sample(),r=d.records[0];delete r.mapBinding.structure;Object.assign(r.mapBinding,{profile:'example-profile',source:r.sources[0].url,wholeObjectAccepted:false});const c=create(d),item={...r.mapBinding};assert.equal(c.forMapItem(item,[item]).id,r.id);for(const delta of [{profile:'different'},{source:'https://www.dpm.org.cn/other'},{wholeObjectAccepted:true}])assert.equal(c.forMapItem({...item,...delta},[{...item,...delta}]),null);
 const extra=structuredClone(r);extra.id='supp-other';extra.mapBinding=null;extra.travel='none';extra.classification='supplemental-directory-only';extra.sources[0].title='错置来源名称';d.records.push(extra);assert.throws(()=>create(d),/source identity/);
});
test('PDF page fragments are preserved as source references; arbitrary fragments and query URLs are rejected',()=>{
 const data=sample();data.records[0].sources[0].url='https://www.dpm.org.cn/Uploads/File/example.pdf#page=3';assert.doesNotThrow(()=>create(data));
 for(const url of ['https://www.dpm.org.cn/example.html#page=3','https://www.dpm.org.cn/example.pdf#anything','https://www.dpm.org.cn/example.pdf?token=x']){data.records[0].sources[0].url=url;assert.throws(()=>create(data));}
});
