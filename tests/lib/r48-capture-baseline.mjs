// Baseline capture is intentionally invoked before any R48 production edits.
import {readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {ZoneBase} from '../../src/scene/zones/ZoneBase.js';
import {library} from './inner-palace-fixture.mjs';
import {hallSignature} from './r40-hall-signature.mjs';
const root=new URL('../../',import.meta.url),read=p=>JSON.parse(readFileSync(new URL(p,root))),sort=v=>Array.isArray(v)?v.map(sort):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,sort(v[k])])):v;
const out={baseline:'d37cf4de2a87f6deffff4e57e20c22f7a2dd779c',halls:{},ledger:{}};
for(const file of readdirSync(new URL('data/zones/',root)).filter(x=>x.endsWith('.json'))){const d=read('data/zones/'+file);for(const[i,item]of d.items.entries()){if(item.kind!=='hall')continue;const b=new ZoneBase(library(),d);try{b.buildHall(item);out.halls[d.id+'/'+i]={name:item.name??null,...hallSignature(b.kit)};}finally{b.kit.dispose(b.kit.root);}}}
for(const b of read('data/architecture/building-fidelity.json').buildings)out.ledger[b.id]=createHash('sha256').update(JSON.stringify(sort(b))).digest('hex');
writeFileSync(new URL('tests/fixtures/r48-r47-baseline.json',root),JSON.stringify(out,null,2)+'\n');
console.log('R47 baseline captured:',Object.keys(out.halls).length,'halls,',Object.keys(out.ledger).length,'identities');
