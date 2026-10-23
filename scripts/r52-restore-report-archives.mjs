import fs from 'node:fs';
import path from 'node:path';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url)),sha=b=>createHash('sha256').update(b).digest('hex');
const safe=p=>{if(typeof p!=='string'||path.isAbsolute(p)||p.split(/[\\/]/).some(x=>x==='..'||x==='')||!p.startsWith('reports/'))throw Error('Unsafe report path');return p;};
export function restoreReports({destination=null,index=JSON.parse(fs.readFileSync(path.join(root,'reports/r52-transport/ARCHIVES.json'))),read=p=>fs.readFileSync(path.join(root,safe(p)))}={}){
 const verified=[];for(const entry of index.archives){safe(entry.path);const pieces=entry.parts.map(part=>{const b=read(safe(part.path));if(b.length!==part.bytes||sha(b)!==part.sha256)throw Error('Missing or corrupt report part '+part.path);return b;});const packed=Buffer.concat(pieces);if(packed.length!==entry.gzipBytes||sha(packed)!==entry.gzipSha256)throw Error('Wrong part order or concatenation '+entry.path);const raw=entry.encoding==='gzip'?gunzipSync(packed):packed;if(raw.length!==entry.originalBytes||sha(raw)!==entry.originalSha256)throw Error('Restored bytes differ '+entry.path);if(entry.decodedSha256&&sha(gunzipSync(packed))!==entry.decodedSha256)throw Error('Decoded motion rows differ');verified.push({entry,raw});}
 // Validate every input before the first write, and never silently overwrite a
 // different existing report. Passing no destination is verification only.
 if(destination){for(const{entry,raw}of verified){const out=path.resolve(destination,safe(entry.path));if(fs.existsSync(out)&&sha(fs.readFileSync(out))!==sha(raw))throw Error('Refusing different existing file '+entry.path);}for(const{entry,raw}of verified){const out=path.resolve(destination,safe(entry.path));fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,raw);}}
 return verified.map(({entry})=>({path:entry.path,bytes:entry.originalBytes,sha256:entry.originalSha256}));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))console.log(JSON.stringify({verified:restoreReports({destination:process.argv[2]?path.resolve(process.argv[2]):null})},null,2));
