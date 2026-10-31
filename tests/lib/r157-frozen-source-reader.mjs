import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {R157_FROZEN_SOURCE_PINS,R157_FROZEN_SOURCE_ALIASES} from './r157-frozen-source-pins.mjs';
const digest=(algorithm,bytes)=>createHash(algorithm).update(bytes).digest('hex');
const objectId=(type,bytes)=>digest('sha1',Buffer.concat([Buffer.from(`${type} ${bytes.length}\0`),bytes]));
const fail=message=>{throw Error(`R157 frozen source: ${message}`);};
const validPath=p=>typeof p==='string'&&/^(src|data)\/(?:[A-Za-z0-9_.-]+\/)*[A-Za-z0-9_.-]+\.(?:[mc]?js|json|md)$/.test(p)&&!p.split('/').some(v=>v==='.'||v==='..');
export function createR157FrozenSourceReader(root,commit){
 if(!Object.hasOwn(R157_FROZEN_SOURCE_PINS,commit))fail('unknown original commit');
 root=fs.realpathSync(root);
 const git=(args,options={})=>execFileSync('git',args,{cwd:root,stdio:['pipe','pipe','pipe'],...options});
 if(fs.realpathSync(git(['rev-parse','--show-toplevel'],{encoding:'utf8'}).trim())!==root)fail('must run at repository root');
 const base=path.join(root,'tests/fixtures/r157-frozen-sources');
 const readLocal=p=>{const real=fs.realpathSync(p);if(real!==p||!real.startsWith(base+path.sep))fail('snapshot symlink/path escape');return fs.readFileSync(real);};
 const bytes=readLocal(path.join(base,`${commit}.json`));
 if(digest('sha256',bytes)!==R157_FROZEN_SOURCE_PINS[commit])fail('manifest checksum mismatch');
 const m=JSON.parse(bytes);if(m.format!==1||m.originalCommit!==commit||JSON.stringify(m.scope)!=='["src/","data/"]')fail('manifest identity mismatch');
 const original=Buffer.from(m.originalCommitObjectBase64,'base64');
 if(objectId('commit',original)!==commit||original.toString('utf8').split('\n')[0]!==`tree ${m.originalRootTree}`)fail('original commit object mismatch');
 const trees=new Map();
 for(const [sha,encoded] of Object.entries(m.treesBase64)){
  const b=Buffer.from(encoded,'base64');if(objectId('tree',b)!==sha)fail('original tree object mismatch');
  const entries=new Map();let at=0;
  while(at<b.length){const sp=b.indexOf(32,at),nul=b.indexOf(0,sp+1);if(sp<at||nul<sp||nul+21>b.length)fail('invalid tree');const mode=b.toString('utf8',at,sp),name=b.toString('utf8',sp+1,nul),id=b.subarray(nul+1,nul+21).toString('hex');if(entries.has(name))fail('duplicate original tree path');entries.set(name,{mode,id});at=nul+21;}
  trees.set(sha,entries);
 }
 const originalBlob=p=>{let tree=m.originalRootTree;const parts=p.split('/');for(let i=0;i<parts.length;i++){const e=trees.get(tree)?.get(parts[i]);if(!e)fail('path absent from original tree');if(i===parts.length-1){if(e.mode!=='100644')fail('nonregular source');return e.id;}if(e.mode!=='40000')fail('nondirectory source ancestor');tree=e.id;}};
 for(const [p,r] of Object.entries(m.files)){if(!validPath(p)||originalBlob(p)!==r.gitBlobSha||!/^[a-f0-9]{64}$/.test(r.sha256)||!Number.isSafeInteger(r.bytes)||r.bytes<0)fail('invalid source mapping');}
 const existence=git(['cat-file','--batch-check'],{input:commit+'\n',encoding:'utf8'}).trim();
 const missing=existence===`${commit} missing`;
 if(!missing&&!new RegExp(`^${commit} commit [0-9]+$`).test(existence))fail('unexpected original object type');
 const mode=missing?'verified-snapshot':'original-git-object';const cache=new Map();
 return Object.freeze({mode,originalCommit:commit,paths:Object.freeze(Object.keys(m.files)),read(p){
  if(!validPath(p)||!Object.hasOwn(m.files,p))fail('path is outside frozen source manifest');
  if(!cache.has(p)){
   const r=m.files[p];const b=missing?readLocal(path.join(base,'blobs',r.gitBlobSha+'.txt')):git(['show',`${commit}:${p}`]);
   if(b.length!==r.bytes||objectId('blob',b)!==r.gitBlobSha||digest('sha256',b)!==r.sha256)fail('source byte identity mismatch: '+p);
   cache.set(p,new TextDecoder('utf-8',{fatal:true}).decode(b));
  }
  return cache.get(p);
 }});
}

export function readR157FrozenParent(alias,p){
 if(!Object.hasOwn(R157_FROZEN_SOURCE_ALIASES,alias))fail('unknown historical parent alias');
 return createR157FrozenSourceReader(process.cwd(),R157_FROZEN_SOURCE_ALIASES[alias]).read(p);
}
