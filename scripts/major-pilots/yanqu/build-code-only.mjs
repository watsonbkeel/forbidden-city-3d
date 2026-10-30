import {build} from 'vite';import fs from 'node:fs';import path from 'node:path';import {verifyBuildSource} from '../../build-identity.mjs';
// Space-bounded compile validation, deliberately not a standalone deployable
// package. Existing public assets remain at source; none copied or deleted.
const rows=[];
for(const[name,base]of[['root','/'],['pages','/forbidden-city-3d/'],['gugong','/gugong/']]){
 const outDir=path.resolve('../fuwang-south-code-only-'+name);
 await build({base,publicDir:false,build:{outDir,emptyOutDir:false}});
 const identity=verifyBuildSource({dist:outDir,expectedBase:base});
 const files=[];function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())walk(p);else files.push({path:path.relative(outDir,p),bytes:fs.statSync(p).size});}}walk(outDir);
 rows.push({name,identity,publicCopied:false,standaloneDeployable:false,bytes:files.reduce((n,f)=>n+f.bytes,0),files});
}
const publicFiles=[];function visit(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())visit(p);else publicFiles.push({path:p,bytes:fs.statSync(p).size});}}visit('public');
fs.writeFileSync('reports/major-pilots/yanqu/code-only-builds.json',JSON.stringify({scope:'Three-base compilation and exact source identities; existing public asset inventory verified locally but NOT copied. Not standalone deployment packages.',rows,publicInventory:{root:'public',files:publicFiles.length,bytes:publicFiles.reduce((n,f)=>n+f.bytes,0)}},null,2));
