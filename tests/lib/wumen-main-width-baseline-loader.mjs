// Exact three-file predecessor for this bounded change, NOT an arbitrary full
// historical closure. All other production files must match the baseline freeze.
import {registerHooks} from 'node:module';import fs from 'node:fs';import crypto from 'node:crypto';import {fileURLToPath} from 'node:url';
const before=JSON.parse(fs.readFileSync(new URL('../fixtures/r157-wumen-main-width/before-411214.json',import.meta.url)));
const map=new Map(Object.entries(before.sourceHashes).map(([path,sha])=>{
 const url=new URL('../../'+path,import.meta.url).href,name=path.split('/').at(-1).replace('.js','.baseline.txt'),source=fs.readFileSync(new URL('../fixtures/r157-wumen-main-width/'+name,import.meta.url),'utf8');
 if(crypto.createHash('sha256').update(source).digest('hex')!==sha)throw Error('Width baseline source hash mismatch '+path);return[url,source];
}));
registerHooks({load(url,context,nextLoad){return map.has(url)?{format:'module',source:map.get(url),shortCircuit:true}:nextLoad(url,context);}});
