import {build} from 'vite';import fs from 'node:fs';import {createHash} from 'node:crypto';import {createBuildInfo} from '../../build-identity.mjs';
// Compile real entry at all supported bases without writing bundles or copying
// public assets. This is NOT a deployable package or HTTP/browser verification.
const rows=[];
for(const base of['/','/forbidden-city-3d/','/gugong/']){
 const current=createBuildInfo({base}),result=await build({base,publicDir:false,build:{write:false,emptyOutDir:false}}),outputs=(Array.isArray(result)?result:[result]).flatMap(r=>r.output),find=name=>outputs.find(r=>r.fileName===name),info=JSON.parse(find('build-info.json').source),html=String(find('index.html').source);
 if(info.buildId!==current.buildId||info.sourceFingerprint!==current.sourceFingerprint||info.base!==base||!html.includes(info.buildId))throw Error('In-memory build identity mismatch');
 const url=html.match(/<script\b[^>]*src="([^"]+\.js)"/)?.[1];if(!url?.startsWith(base))throw Error('Wrong entry base');const js=find(url.slice(base.length))?.code;if(!js?.includes(info.buildId)||!js.includes(info.sourceFingerprint))throw Error('Missing exact entry identity');
 const files=outputs.map(f=>{const bytes=Buffer.from(f.code??f.source);return{path:f.fileName,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')}});rows.push({base,identity:info,files,bytes:files.reduce((n,f)=>n+f.bytes,0),writtenBundles:false,publicCopied:false,standaloneDeployable:false});
}
fs.writeFileSync('reports/major-pilots/yongshou-front/compile-memory.json',JSON.stringify({scope:'Three-base Vite compile and in-memory HTML/JS/build-info exact identity only; no bundle output, no HTTP/browser/GPU claim',rows},null,2)+'\n');
