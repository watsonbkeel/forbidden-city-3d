import fs from 'node:fs';import {createHash} from 'node:crypto';import {registerHooks} from 'node:module';
const root=new URL('../../../fixtures/r158-wenhua-gate-integration/',import.meta.url),manifest=JSON.parse(fs.readFileSync(new URL('controls-493.json',root))),frozen=new Map();
for(const[name,entry]of Object.entries(manifest.entries)){const bytes=fs.readFileSync(new URL(entry.file,root));if(createHash('sha256').update(bytes).digest('hex')!==entry.sha256)throw Error('Frozen493 control digest mismatch');frozen.set(new URL('../../../../src/controls/'+name,import.meta.url).href,bytes.toString('utf8'));}
if(process.env.WENHUA_EXACT_PARENT_CONTROLS==='1')registerHooks({load(url,ctx,next){const r=next(url,ctx);return frozen.has(url)?{...r,source:frozen.get(url)}:r;}});
