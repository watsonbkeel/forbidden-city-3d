// Read-only local HTTP + byte/hash verification of the existing production build.
// No publishing, credentials or external network request.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {verifyBuildSource} from '../build-identity.mjs';
const root=process.cwd(),build=verifyBuildSource({root,expectedBase:'/gugong/'}),files=[];
const sha=b=>createHash('sha256').update(b).digest('hex');
function visit(dir,rel=''){for(const q of fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))){const r=path.posix.join(rel,q.name),full=path.join(dir,q.name);if(q.isDirectory())visit(full,r);else{assert.ok(q.isFile(),'only regular dist files');const bytes=fs.readFileSync(full);files.push({path:r,bytes:bytes.length,sha256:sha(bytes)});}}}
visit(path.join(root,'dist'));assert.equal(files.length,137,'retained exact build file count');
const byUrl=new Map(files.map(f=>[build.base+f.path.split('/').map(encodeURIComponent).join('/'),f.path]));
const server=http.createServer((req,res)=>{const file=byUrl.get(req.url);if(!file){res.writeHead(404);res.end();return;}res.writeHead(200);res.end(fs.readFileSync(path.join(root,'dist',file)));});
await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
try{const origin='http://127.0.0.1:'+server.address().port;for(const f of files){const res=await fetch(origin+build.base+f.path.split('/').map(encodeURIComponent).join('/'));assert.equal(res.status,200,f.path);const bytes=Buffer.from(await res.arrayBuffer());assert.equal(bytes.length,f.bytes,f.path+' bytes');assert.equal(sha(bytes),f.sha256,f.path+' sha');}assert.equal((await fetch(origin+build.base+'__missing_local_check__')).status,404);console.log(JSON.stringify({scope:'LOCAL_EXISTING_DIST_HTTP_BYTES_HASH_NOT_DEPLOYMENT',build,filesVerified:files.length,totalBytes:files.reduce((n,f)=>n+f.bytes,0),allHttp200:true,allBytesSHA256Exact:true,unknownPath404:true,files},null,2));}finally{await new Promise(resolve=>server.close(resolve));}
