import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync as read,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {PALACE_LAYOUT} from '../../src/scene/Layout.js';
const root=new URL('../../',import.meta.url),dir=new URL('data/architecture/ledger-397/',root);
const json=(path,base=dir)=>JSON.parse(read(new URL(path,base),'utf8'));
const m=json('manifest.json'), original=read(new URL('docs/photo-fidelity/MASTER-PROMPT.md',root),'utf8').split(/\r?\n/);
const items=m.items.map(e=>json(e.path));
test('exact independent denominator, filenames and original source rows',()=>{
 assert.equal(items.length,397);assert.equal(new Set(items.map(x=>x.stableId)).size,397);
 assert.equal(new Set(items.map(x=>x.number)).size,397);
 assert.equal(readdirSync(new URL('items/',dir)).length,397);
 const csv=read(new URL('source-mapping-397.csv',dir));
 assert.equal(createHash('sha256').update(csv).digest('hex'),m.mappingCsvSha256);
 for(const [i,x] of items.entries()){
 assert.deepEqual(m.items[i],{number:x.number,stableId:x.stableId,path:'items/'+x.stableId+'.json'});
 const line=Number(x.scopeOrigin.match(/#L(\d+)$/)[1])-1;
 assert.ok(original[line].includes(x.stableId)&&original[line].includes(x.name));
 }
});
test('each model declaration, coordinate and stable-ID mention resolves as labeled',()=>{
 const lines=new Map(),datasets=new Map(),cards=json('data/places/zh-CN.json',root).places,anchors=json('data/anchors.json',root);
 for(const x of items){
 assert.deepEqual(x.referenceAnchor,anchors[x.name]??null);
 for(const id of x.directoryCandidates)assert.ok(cards.some(c=>c.id===id&&(c.name===x.name||c.canonicalName===x.name)));
 for(const a of x.modelCandidates){
 const [path,frag]=a.ref.split('#');if(!datasets.has(path))datasets.set(path,path==='src/scene/Layout.js'?PALACE_LAYOUT:json(path,root).items);
 const v=datasets.get(path)[Number(frag.split('/').at(-1))];assert.ok(v);
 assert.equal(v.name??null,a.declaredName);assert.equal(v.name===x.name,a.nameMatch);
 for(const [k,n] of Object.entries(a.engineeringCoordinates??{}))assert.deepEqual(v[k],n);
 }
 for(const ref of x.sourceMentions){const [p,l]=ref.split(':');if(!lines.has(p))lines.set(p,read(new URL(p,root),'utf8').split(/\r?\n/));const src=lines.get(p);assert.ok(src[Number(l)-1]?.includes(x.stableId)||src.some(line=>line.includes(x.stableId)),ref+' stable ID removed: '+x.stableId);}
 }
});
