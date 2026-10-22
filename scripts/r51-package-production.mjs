import fs from 'node:fs';import path from 'node:path';import {createHash} from 'node:crypto';import {execFileSync} from 'node:child_process';
const output=process.argv[2];if(!output)throw Error('Usage: node scripts/r51-package-production.mjs /absolute/new/package-directory');
if(!path.isAbsolute(output)||fs.existsSync(output))throw Error('Destination must be a new absolute directory; no existing package is overwritten.');
const sha=b=>createHash('sha256').update(b).digest('hex');
const files=[];function visit(dir,relative=''){for(const item of fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))){const rel=path.posix.join(relative,item.name),full=path.join(dir,item.name);if(item.isDirectory())visit(full,rel);else if(item.isFile())files.push({path:rel,bytes:fs.statSync(full).size,sha256:sha(fs.readFileSync(full))});else throw Error('Unexpected non-regular build entry: '+rel);}}
visit('dist');if(!files.some(f=>f.path==='index.html'))throw Error('Build the production app first.');
fs.mkdirSync(output);fs.cpSync('dist',path.join(output,'dist'),{recursive:true});
for(const name of ['start.mjs','README.txt'])fs.copyFileSync('release/r51/'+name,path.join(output,name));
const metadata={release:'R51',kind:'prebuilt production package; no deployment',sourceCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),files:files.map(f=>({...f,path:'dist/'+f.path}))};
for(const name of ['start.mjs','README.txt']){const b=fs.readFileSync(path.join(output,name));metadata.files.push({path:name,bytes:b.length,sha256:sha(b)});}
fs.writeFileSync(path.join(output,'SHA256SUMS.json'),JSON.stringify(metadata,null,2)+'\n');
console.log(JSON.stringify({output,files:metadata.files.length,totalBytes:metadata.files.reduce((n,f)=>n+f.bytes,0),manifestSha256:sha(fs.readFileSync(path.join(output,'SHA256SUMS.json')))},null,2));
