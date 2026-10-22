#!/usr/bin/env node
/** Exact binary transport, not a geometry/test fixture format. Default: read-only verification. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sha=b=>createHash('sha256').update(b).digest('hex');
const blob=b=>createHash('sha1').update(`blob ${b.length}\0`).update(b).digest('hex');
const fail=message=>{throw new Error(message);};
function relative(p) {
 if(typeof p!=='string'||!p||p.includes('\\')||p.includes('\0')||p.includes(':')||p.split('/').some(s=>!s||s==='.'||s==='..')||path.isAbsolute(p))fail(`Unsafe relative path: ${p}`);
 return p;
}
function noSymlinks(p) {
 const absolute=path.resolve(p),parsed=path.parse(absolute);let cur=parsed.root;
 for(const segment of absolute.slice(parsed.root.length).split(path.sep).filter(Boolean)) {
  cur=path.join(cur,segment);
  try{if(fs.lstatSync(cur).isSymbolicLink())fail(`Symlink rejected: ${cur}`);}catch(error){if(error.code!=='ENOENT')throw error;}
 }
}
function integer(n,min=0){return Number.isSafeInteger(n)&&n>=min;}
export function verifyTransport(indexPath,{compareSourceCommit=false,restoreDir}={}) {
 noSymlinks(indexPath);
 const index=JSON.parse(fs.readFileSync(indexPath,'utf8')),base=path.dirname(path.resolve(indexPath));
 if(index.format!=='p3c-motion-binary-transport-v1'||index.maxPartBytes!==120000||!/^[a-f0-9]{40}$/.test(index.sourceCommit)||!Array.isArray(index.files)||!index.files.length)fail('Invalid transport manifest');
 const outputs=new Set(),usedParts=new Set(),ids=new Set(),verified=[];
 for(const entry of index.files) {
  relative(entry.sourcePath);
  if(!/^[a-z0-9-]+$/.test(entry.id)||ids.has(entry.id)||entry.sourceCommit!==index.sourceCommit||outputs.has(entry.sourcePath)||!integer(entry.bytes,1)||!/^[a-f0-9]{64}$/.test(entry.sha256)||!/^[a-f0-9]{40}$/.test(entry.gitBlobSha)||!Array.isArray(entry.parts)||!entry.parts.length)fail(`Invalid file record: ${entry.sourcePath}`);
  outputs.add(entry.sourcePath);ids.add(entry.id);let offset=0;const buffers=[];
  for(const [i,part] of entry.parts.entries()) {
   relative(part.path);
   if(part.index!==i||part.offset!==offset||!integer(part.bytes,1)||part.bytes>120000||!/^[a-f0-9]{64}$/.test(part.sha256)||usedParts.has(part.path)||part.path!==`parts/${entry.id}.part-${String(i).padStart(5,'0')}.bin`)fail(`Invalid or reordered part: ${part.path}`);
   usedParts.add(part.path);const source=path.resolve(base,part.path);noSymlinks(source);
   if(!fs.lstatSync(source).isFile())fail(`Part is not a file: ${part.path}`);
   const bytes=fs.readFileSync(source);
   if(bytes.length!==part.bytes||sha(bytes)!==part.sha256)fail(`Corrupt part: ${part.path}`);
   buffers.push(bytes);offset+=bytes.length;
  }
  const bytes=Buffer.concat(buffers);
  if(offset!==entry.bytes||sha(bytes)!==entry.sha256||blob(bytes)!==entry.gitBlobSha)fail(`Whole-file verification failed: ${entry.sourcePath}`);
  if(compareSourceCommit) {
   const original=execFileSync('git',['show',`${entry.sourceCommit}:${entry.sourcePath}`],{cwd:repo,maxBuffer:Math.max(16*1024*1024,entry.bytes+1024)});
   if(!bytes.equals(original))fail(`Source commit bytes differ: ${entry.sourcePath}`);
  }
  verified.push({entry,bytes});
 }
 // Reject output file/directory collisions before any write.
 for(const output of outputs)for(const other of outputs)if(other!==output&&other.startsWith(output+'/'))fail('Overlapping output paths');
 if(restoreDir!==undefined) {
  const destination=path.resolve(restoreDir);noSymlinks(destination);
  try{fs.lstatSync(destination);fail('Restore destination already exists');}catch(error){if(error.code!=='ENOENT')throw error;}
  if(!fs.statSync(path.dirname(destination)).isDirectory())fail('Restore parent must already exist');
  // All files, paths, and optional source comparisons have passed before first write.
  fs.mkdirSync(destination);
  for(const {entry,bytes} of verified) {
   const target=path.join(destination,entry.sourcePath);fs.mkdirSync(path.dirname(target),{recursive:true});
   fs.writeFileSync(target,bytes,{flag:'wx'});
  }
 }
 return {format:index.format,sourceCommit:index.sourceCommit,files:verified.map(({entry})=>({sourcePath:entry.sourcePath,bytes:entry.bytes,sha256:entry.sha256,gitBlobSha:entry.gitBlobSha,parts:entry.parts.length,sourceBytesEqual:compareSourceCommit?true:null})),totalBytes:verified.reduce((n,{bytes})=>n+bytes.length,0),restored:restoreDir!==undefined};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
 try{
  let indexPath=path.join(repo,'reports/r50-joint/transport-motion/index.json'),compareSourceCommit=false,restoreDir;
  const seen=new Set();
  for(let i=2;i<process.argv.length;i++) {
   const flag=process.argv[i];if(seen.has(flag))fail(`Duplicate option: ${flag}`);seen.add(flag);
   if(flag==='--compare-source-commit')compareSourceCommit=true;
   else if(flag==='--index'||flag==='--restore-dir'){
    const value=process.argv[++i];if(!value||value.startsWith('--'))fail(`Missing value: ${flag}`);
    if(flag==='--index')indexPath=value;else restoreDir=value;
   }else fail(`Unknown option: ${flag}`);
  }
  console.log(JSON.stringify(verifyTransport(indexPath,{compareSourceCommit,restoreDir}),null,2));
 }catch(error){console.error(`Motion transport verification failed: ${error.message}`);process.exitCode=1;}
}
