import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
export const LOCK_SHA256='e89d1c2e5f46fcd8571433e059f23b26463d9c0f317d78c09636190ab2d21b5c';
export const CHROME='/opt/google/chrome/chrome';
export function requireThat(ok,message){if(!ok)throw new Error(message);}
export const sha256=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
export function readIdentity(env=process.env){const identity={eventSha:env.GITHUB_SHA,runId:env.GITHUB_RUN_ID,runAttempt:env.GITHUB_RUN_ATTEMPT,repository:env.GITHUB_REPOSITORY,ref:env.GITHUB_REF};validateIdentity(identity);return identity;}
export function validateIdentity(i){requireThat(i&&Object.values(i).every(x=>typeof x==='string'&&x.trim()===x&&x.length>0),'Invalid run identity');requireThat(/^[a-f0-9]{40}$/.test(i.eventSha)&&/^\d+$/.test(i.runId)&&/^[1-9]\d*$/.test(i.runAttempt)&&i.repository==='watsonbkeel/forbidden-city-3d'&&typeof i.ref==='string'&&i.ref.startsWith('refs/'),'Invalid event identity');return i;}
export function assertIdentity(actual,expected){validateIdentity(actual);validateIdentity(expected);for(const key of ['eventSha','runId','runAttempt','repository','ref'])requireThat(actual[key]===expected[key],`Identity mismatch: ${key}`);}
export function safeRelative(p){requireThat(typeof p==='string'&&p.length>0&&!p.includes('\\')&&!p.includes('\0')&&!path.isAbsolute(p)&&p.split('/').every(x=>x&&x!=='.'&&x!=='..'),'Unsafe relative path');return p;}
export function assertAncestors(p,includeLeaf=true){requireThat(path.isAbsolute(p)&&path.normalize(p)===p,'Path must be absolute and normalized');const parts=p.split('/').filter(Boolean);let cur='/';for(let n=0;n<parts.length-(includeLeaf?0:1);n++){cur=path.join(cur,parts[n]);const st=fs.lstatSync(cur);requireThat(!st.isSymbolicLink(),'Symlink rejected: '+cur);if(n<parts.length-1)requireThat(st.isDirectory(),'Non-directory ancestor: '+cur);}return p;}
export function readRegular(p,maxBytes=32*1024*1024){assertAncestors(p);const fd=openRegular(p,maxBytes);try{const st=fs.fstatSync(fd);requireThat(st.isFile()&&st.size<=maxBytes,'Not a bounded regular file: '+p);const bytes=fs.readFileSync(fd);const after=fs.fstatSync(fd);requireThat(after.size===st.size&&after.mtimeMs===st.mtimeMs&&bytes.length===st.size,'File changed while reading');return bytes;}finally{fs.closeSync(fd);}}
export const readJSON=p=>JSON.parse(readRegular(p).toString('utf8'));
export function writeJSON(p,value){assertAncestors(p,false);fs.writeFileSync(p,JSON.stringify(value,null,2)+'\n',{flag:'wx',mode:0o600});}
export function readInputs(repo,inputsPath){assertAncestors(repo);requireThat(fs.statSync(repo).isDirectory(),'Missing repo');const bytes=readRegular(path.resolve(inputsPath));const doc=JSON.parse(bytes);requireThat(doc.schema===1&&Array.isArray(doc.files)&&doc.files.length>0,'Invalid input manifest');const seen=new Set();for(const f of doc.files){safeRelative(f.path);requireThat(!seen.has(f.path),'Duplicate input');seen.add(f.path);requireThat(['100644','100755'].includes(f.mode)&&Number.isSafeInteger(f.bytes)&&f.bytes>=0&&/^[a-f0-9]{64}$/.test(f.sha256),'Invalid input metadata');const full=path.join(repo,f.path),data=readRegular(full,64*1024*1024),mode=fs.lstatSync(full).mode&0o777;requireThat(mode===(f.mode==='100755'?0o755:0o644)&&data.length===f.bytes&&sha256(data)===f.sha256,'Input mismatch: '+f.path);}return {files:doc.files,sha256:sha256(bytes)};}
export function parseArgs(argv,names){requireThat(argv.length===names.length*2,'Unexpected arguments');const out={};for(let n=0;n<argv.length;n+=2){requireThat(names.includes(argv[n])&&!Object.hasOwn(out,argv[n])&&argv[n+1],'Unknown/duplicate argument');out[argv[n]]=argv[n+1];}return out;}
export function isMain(url){return process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(url);}
export function failCLI(error){console.error(error.message);process.exitCode=1;}
export function hashRegularFile(p, maxBytes=512*1024*1024) {
  assertAncestors(p);
  const fd=openRegular(p,maxBytes);
  try {
    const before=fs.fstatSync(fd);
    requireThat(before.isFile()&&before.size<=maxBytes,'Not a bounded regular file');
    const hash=crypto.createHash('sha256'), chunk=Buffer.alloc(64*1024);
    let total=0, count;
    while((count=fs.readSync(fd,chunk,0,chunk.length,null))>0) {
      total+=count;
      requireThat(total<=maxBytes,'File exceeds hash limit');
      hash.update(chunk.subarray(0,count));
    }
    const after=fs.fstatSync(fd);
    requireThat(total===before.size&&after.size===before.size&&after.mtimeMs===before.mtimeMs,'File changed while hashing');
    return {bytes:total,sha256:hash.digest('hex')};
  } finally { fs.closeSync(fd); }
}

function openRegular(p,maxBytes) {
  const before=fs.lstatSync(p);
  requireThat(before.isFile()&&before.size<=maxBytes,'Not a bounded regular file: '+p);
  const fd=fs.openSync(p,fs.constants.O_RDONLY|fs.constants.O_NONBLOCK|fs.constants.O_NOFOLLOW);
  try {
    const opened=fs.fstatSync(fd);
    requireThat(opened.isFile()&&opened.size<=maxBytes&&opened.dev===before.dev&&opened.ino===before.ino,'File identity changed while opening');
    return fd;
  } catch(error) { fs.closeSync(fd); throw error; }
}
export function copyRegularFile(source,destination,maxBytes) {
  assertAncestors(source);
  assertAncestors(destination,false);
  const input=openRegular(source,maxBytes);
  let output;
  try {
    const before=fs.fstatSync(input);
    output=fs.openSync(destination,fs.constants.O_WRONLY|fs.constants.O_CREAT|fs.constants.O_EXCL|fs.constants.O_NOFOLLOW|fs.constants.O_NONBLOCK,0o600);
    const hash=crypto.createHash('sha256'),chunk=Buffer.alloc(64*1024);
    let total=0,count;
    while((count=fs.readSync(input,chunk,0,chunk.length,null))>0) {
      total+=count;
      requireThat(total<=maxBytes,'Copy exceeds byte budget');
      hash.update(chunk.subarray(0,count));
      let written=0;
      while(written<count)written+=fs.writeSync(output,chunk,written,count-written);
    }
    const after=fs.fstatSync(input);
    requireThat(total===before.size&&after.size===before.size&&after.mtimeMs===before.mtimeMs,'File changed while copying');
    return {bytes:total,sha256:hash.digest('hex')};
  } catch(error) {
    if(output!==undefined) {
      const created=fs.fstatSync(output),current=fs.lstatSync(destination);
      if(current.dev===created.dev&&current.ino===created.ino)fs.unlinkSync(destination);
    }
    throw error;
  } finally {fs.closeSync(input);if(output!==undefined)fs.closeSync(output);}
}

export function sha256File(p,maxBytes=512*1024*1024){return hashRegularFile(p,maxBytes).sha256;}

// Only the existing RESULT is replaced. A killed writer may leave its fixed
// pending file, which is deliberately outside the evidence collector allowlist.
export function writeResultJSON(destination,value,io=fs){
  requireThat(path.basename(destination)==='RESULT.json','Only RESULT.json publication is allowed');
  assertAncestors(destination);
  const before=io.lstatSync(destination);
  requireThat(before.isFile(),'RESULT must be a regular file');
  const payload=Buffer.from(JSON.stringify(value,null,2)+'\n');
  requireThat(payload.length<=32*1024*1024,'RESULT exceeds ordinary evidence file limit');
  const pending=destination+'.pending';let fd,identity,installed=false;
  try{
    fd=io.openSync(pending,fs.constants.O_WRONLY|fs.constants.O_CREAT|fs.constants.O_EXCL|fs.constants.O_NOFOLLOW,0o600);
    identity=io.fstatSync(fd);
    io.writeFileSync(fd,payload);io.fsyncSync(fd);
    requireThat(io.fstatSync(fd).size===payload.length,'Incomplete RESULT write');
    const current=io.lstatSync(destination);
    requireThat(current.isFile()&&current.dev===before.dev&&current.ino===before.ino,'RESULT identity changed before publication');
    const staged=io.lstatSync(pending);
    requireThat(staged.isFile()&&staged.dev===identity.dev&&staged.ino===identity.ino,'Pending RESULT identity changed');
    io.renameSync(pending,destination);installed=true;
  }finally{
    try{if(fd!==undefined)io.closeSync(fd);}
    finally{if(!installed&&identity){
      let current;try{current=io.lstatSync(pending);}catch(error){if(error.code!=='ENOENT')throw error;}
      if(current&&current.isFile()&&current.dev===identity.dev&&current.ino===identity.ino)io.unlinkSync(pending);
    }}
  }
}
