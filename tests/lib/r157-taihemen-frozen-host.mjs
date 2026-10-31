import fs from 'node:fs';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';
const sourceURL=new URL('../../src/scene/PalaceBuilder.js',import.meta.url);
export const frozenTaihemenHostSource=fs.readFileSync(new URL('../fixtures/r157-taihemen-integration/PalaceBuilder-5d8c713e.txt',import.meta.url),'utf8');
assert.equal(createHash('sha256').update(frozenTaihemenHostSource).digest('hex'),'cbd9617a4ad474f611253dfc02503ce85711f3cb6ce370bfc24983f80eae3fab','independently frozen pre-integration local host');
export async function frozenTaihemenHost(candidateURL=null){
 let source=frozenTaihemenHostSource.replace(/from\s+(['"])([^'"]+)\1/g,(_,q,id)=>`from ${q}${id==='three'?import.meta.resolve('three'):new URL(id,sourceURL).href}${q}`);
 if(candidateURL){const old=new URL('./palace/TaihemenSouthApproach.js',sourceURL).href;assert.equal(source.split(old).length-1,1,'one explicit historical source-approach import');source=source.replace(old,candidateURL.href);}
 return (await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'))).PalaceBuilder;
}
export const FrozenTaihemenHost=await frozenTaihemenHost();
