import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {registerHooks} from 'node:module';
import {SupplementalPlaceCatalog} from '../../src/ui/SupplementalPlaceCatalog.js';
const BASE='16e9e8224c1a4e3b0ed6b47793d5566ef05aeec2';
const ID='yuqing-south-entry',CARD='supp-fc-e8cc6a03c1',SOURCE='FC-E8CC6A03C1';
const PDF='https://wwj.beijing.gov.cn/bjww/resource/cms/article/bjww_362762/744041239/2026061517055186218.pdf';
const oldIds=['axis-courts','east-six','west-six','ningshou','outer-east','outer-west','garden'];
const prior=p=>JSON.parse(execFileSync('git',['show',BASE+':'+p],{maxBuffer:2**22}));
const raw=()=>JSON.parse(fs.readFileSync(new URL('../../data/places/supplemental.json',import.meta.url)));
const hook=registerHooks({load(url,context,next){return next(url,url.endsWith('.json')?{...context,importAttributes:{...context.importAttributes,type:'json'}}:context);}});
let ZONES;try{({ZONES}=await import('../../data/zones/index.js'));}finally{hook.deregister();}
test('unique eighth registered Qianxing host preserves all seven public configurations except two declared neighbor appends',()=>{
 assert.deepEqual(ZONES.map(z=>z.id),[...oldIds,ID]);
 for(let i=0;i<7;i++){const old=prior('data/zones/'+oldIds[i]+'.json');if(['axis-courts','east-six'].includes(old.id))old.neighbors.push(ID);assert.deepEqual(ZONES[i],old,old.id+' complete public configuration');}
 const z=ZONES[7];assert.deepEqual(z,{id:ID,name:'前星门与毓庆宫南入口',bounds:{x0:-145,x1:-130.25,z0:184,z1:205},neighbors:['east-six','axis-courts'],items:[]});
 const overlap=(a,b)=>Math.min(a.x1,b.x1)>Math.max(a.x0,b.x0)&&Math.min(a.z1,b.z1)>Math.max(a.z0,b.z0);
 assert.ok(ZONES.slice(0,7).every(old=>!overlap(z.bounds,old.bounds)),'no positive-area takeover of old host');
 const find=(x,y)=>ZONES.find(q=>q.bounds.x0<=x&&x<=q.bounds.x1&&q.bounds.z0<=y&&y<=q.bounds.z1)?.id??null;
 assert.equal(find(-134.5,193),ID);assert.equal(find(-134.5,204.999),ID);assert.equal(find(-134.5,205),'east-six');assert.equal(find(-134.5,207),'east-six');
});
test('only the independent information-only E45 identity is appended to all public supplemental records',()=>{
 const old=prior('data/places/supplemental.json'),current=raw();const found=current.records.filter(r=>r.id===CARD);assert.equal(found.length,1,'one new named E45 card');
 assert.deepEqual(current.records.slice(0,-1),old.records,'all old records and ordering survive');const row=current.records.at(-1);assert.equal(row,found[0]);assert.equal(row.sourceObjectId,SOURCE);assert.equal(row.name,'前星门');assert.equal(row.nameEn,'Qianxing Gate');assert.equal(row.zoneId,ID);assert.equal(row.structureId,'qianxing-glazed-gate-fit');assert.equal(row.classification,'supplemental-directory-only');assert.equal(row.mapBinding,null);assert.equal(row.travel,'none');
 assert.equal(current.supplementalMapCardCount,old.supplementalMapCardCount);assert.equal(current.supplementalDirectoryCardCount,old.supplementalDirectoryCardCount+1);assert.equal(current.candidateCardDenominator,old.candidateCardDenominator+1);assert.equal(current.records.filter(r=>r.classification==='supplemental-directory-only').length,current.supplementalDirectoryCardCount);
 const catalog=new SupplementalPlaceCatalog(current),p=catalog.get(CARD);assert.equal(p.modelExperience.navigationMode,'information-only');assert.equal(p.modelExperience.teleportTargetName,null);assert.equal(catalog.sourcesFor(p).some(s=>s.publisher==='北京市文物局'&&s.url===PDF+'#page=55'),true);
});
function sourceFixture(url=PDF+'#page=55',publisher='北京市文物局'){
 const row=structuredClone(prior('data/places/supplemental.json').records.find(r=>r.mapBinding===null));Object.assign(row,{id:CARD,name:'前星门',displayName:'前星门',nameEn:'Qianxing Gate',sourceObjectId:SOURCE,zoneId:ID,structureId:'qianxing-glazed-gate-fit',pinyin:['qian xing men','qianxingmen']});
 row.sources=[{id:'e45-beijing-wenbo-2025',title:'周莎：紫禁城毓庆宫藏书考',titleEn:'Zhou Sha: Study of the Yuqing Palace Book Collection',publisher,url}];row.summary.sourceIds=['e45-beijing-wenbo-2025'];return{schemaVersion:1,records:[row]};
}
test('the exact Beijing heritage authority PDF is admitted under its real publisher, both whole PDF and page55',()=>{
 for(const url of[PDF,PDF+'#page=55'])assert.doesNotThrow(()=>new SupplementalPlaceCatalog(sourceFixture(url)));
});
test('the single non-DPM source exception cannot admit spoofed publisher, domain, query or another page or PDF',()=>{
 for(const[url,publisher]of[[PDF,'故宫博物院'],[PDF.replace('wwj.beijing.gov.cn','example.org'),'北京市文物局'],[PDF.replace('gov.cn/','gov.cn:443/'),'北京市文物局'],[PDF.replace('/bjww/resource/','/bjww/./resource/'),'北京市文物局'],[PDF+'?download=1','北京市文物局'],[PDF+'#page=56','北京市文物局'],[PDF.replace('2026061517055186218','another'),'北京市文物局'],[PDF.replace('https:','http:'),'北京市文物局']])assert.throws(()=>new SupplementalPlaceCatalog(sourceFixture(url,publisher)),/source/i);
 assert.doesNotThrow(()=>new SupplementalPlaceCatalog(prior('data/places/supplemental.json')),'unchanged public DPM sources still work');
});
