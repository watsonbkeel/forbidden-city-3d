import {registerHooks} from 'node:module';
import {execFileSync} from 'node:child_process';
import {fileURLToPath,pathToFileURL} from 'node:url';
import path from 'node:path';
import crypto from 'node:crypto';
import fs from 'node:fs';
export const baseline='5d30c8366c8430f27cb9664b2b64f30e64e87cca';
const root=fileURLToPath(new URL('../../',import.meta.url)),marker='r190FrozenBaseline',sources=new Map();
export const sha=value=>crypto.createHash('sha256').update(value).digest('hex');
const baselineTree='0f75720e7b5e36235105e691fda8e51930c7fa8f';let historyVerified=false;
const unavailable=()=>Object.assign(new Error('Frozen-flow comparison requires Git supporting --no-lazy-fetch and local Git history containing exact '+baseline+' and all referenced blobs; no current-source or network fallback'),{code:'XIANAN_FROZEN_BASELINE_UNAVAILABLE'});
function requireFrozenHistory(){
 if(historyVerified)return;
 try{if(execFileSync('git',['--no-lazy-fetch','rev-parse',baseline+'^{tree}'],{cwd:root,maxBuffer:4096,stdio:['ignore','pipe','pipe']}).toString().trim()!==baselineTree)throw unavailable();}
 catch{throw unavailable()}historyVerified=true;
}
const exact=rel=>{requireFrozenHistory();if(!sources.has(rel)){try{sources.set(rel,execFileSync('git',['--no-lazy-fetch','show',baseline+':'+rel],{cwd:root,maxBuffer:4*1024*1024,stdio:['ignore','pipe','pipe']}));}catch{throw unavailable()}}return sources.get(rel)};
export function verifyFrozenData(rel){const a=fs.readFileSync(path.join(root,rel)),b=exact(rel);if(sha(a)!==sha(b))throw Error('Changed frozen gate data: '+rel);return JSON.parse(a)}
registerHooks({
 resolve(specifier,context,next){
  const result=next(specifier,context);
  if(context.parentURL?.startsWith('file:')&&new URL(context.parentURL).searchParams.get(marker)===baseline&&result.url.startsWith('file:')){
   const u=new URL(result.url),rel=path.relative(root,fileURLToPath(u));
   if(rel.startsWith('src'+path.sep)){u.searchParams.set(marker,baseline);return {...result,url:u.href};}
  }
  return result;
 },
 load(url,context,next){
  if(url.startsWith('file:')){
   const u=new URL(url);if(u.searchParams.get(marker)===baseline){
    const rel=path.relative(root,fileURLToPath(u)).split(path.sep).join('/');
    if(!rel.startsWith('src/')||rel.includes('..')||!rel.endsWith('.js'))throw Error('Unexpected frozen module dependency '+rel);
    return {format:'module',source:exact(rel).toString('utf8'),shortCircuit:true};
   }
  }
  return next(url,context);
 }
});
export async function loadFrozenZoneBase(){requireFrozenHistory();const url=pathToFileURL(path.join(root,'src/scene/zones/ZoneBase.js'));url.searchParams.set(marker,baseline);return (await import(url.href)).ZoneBase;}
export const frozenSourceHashes=()=>Object.fromEntries([...sources].map(([name,bytes])=>[name,sha(bytes)]));
