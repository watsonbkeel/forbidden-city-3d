import fs from 'node:fs';import path from 'node:path';
import {readIdentity,assertIdentity,assertAncestors,readRegular,sha256,requireThat as ok} from '../bilingual-ui/common.mjs';
import {ALLOWLIST} from './evidence.mjs';import {LIMITS} from './contract.mjs';
const identity=readIdentity(),root=process.env.EVIDENCE_DIR;ok(root&&path.isAbsolute(root),'Exact evidence root required');assertAncestors(root);
const allowed=['source-validation.json','tool-contract.json','diagnostic/collection.json','diagnostic/CHECKSUMS.sha256',...ALLOWLIST.map(p=>'diagnostic/'+p)];
const manifest=[],missing=[];let total=0;
for(const rel of allowed){try{const bytes=readRegular(path.join(root,rel),rel.endsWith('.png')?LIMITS.evidenceBytes:rel.endsWith('.log')?LIMITS.logBytes:LIMITS.recordBytes);total+=bytes.length;ok(total<=LIMITS.evidenceBytes-16384,'Final artifact budget exceeded');manifest.push({path:rel,bytes:bytes.length,sha256:sha256(bytes)});}catch(e){if(e.code==='ENOENT')missing.push(rel);else throw e;}}
const dirs=new Set(['',...allowed.flatMap(p=>{const a=p.split('/');a.pop();return a.map((_,i)=>a.slice(0,i+1).join('/'));})]);
for(const rel of dirs){try{const p=path.join(root,rel);assertAncestors(p);ok(fs.lstatSync(p).isDirectory(),'Artifact ancestor not directory');for(const name of fs.readdirSync(p)){const child=rel?rel+'/'+name:name;ok(allowed.includes(child)||dirs.has(child),'Unknown artifact path');}}catch(e){if(e.code!=='ENOENT')throw e;}}
const outcomes={schema:1,identity,diagnosticOnly:true,releaseAcceptance:false,validation:process.env.DIAGNOSTIC_OUTCOME,collection:process.env.COLLECTION_OUTCOME,manifest,missing,totalBytes:total};
const bytes=Buffer.from(JSON.stringify(outcomes,null,2)+'\n');ok(bytes.length<16384&&total+bytes.length<=LIMITS.evidenceBytes,'Artifact manifest budget exceeded');fs.writeFileSync(path.join(root,'artifact-manifest.json'),bytes,{flag:'wx',mode:0o600});
fs.writeFileSync(path.join(root,'CHECKSUMS.sha256'),[...manifest,{path:'artifact-manifest.json',sha256:sha256(bytes)}].map(r=>r.sha256+'  '+r.path).join('\n')+'\n',{flag:'wx',mode:0o600});
