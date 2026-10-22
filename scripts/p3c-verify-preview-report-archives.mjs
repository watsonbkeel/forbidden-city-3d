import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {resolve,relative,sep} from 'node:path';
const root=process.cwd(),sha=b=>createHash('sha256').update(b).digest('hex');
const entries=JSON.parse(readFileSync('reports/r50-dev-preview/report-archives.json','utf8'));
for(const row of entries){
 const path=resolve(root,row.archive);if(relative(root,path).startsWith('..'+sep))throw Error('Archive path escapes checkout');
 const zipped=readFileSync(path);if(zipped.length!==row.archiveBytes||sha(zipped)!==row.archiveSha256)throw Error('Archive checksum mismatch');
 const data=gunzipSync(zipped);if(data.length!==row.originalBytes||sha(data)!==row.originalSha256)throw Error('Restored bytes mismatch');
 // Verification is the default. Explicit restore never overwrites an existing file.
 if(process.argv.includes('--restore')){const target=resolve(root,row.original);if(relative(root,target).startsWith('..'+sep)||existsSync(target))throw Error('Unsafe or existing restore target');writeFileSync(target,data,{flag:'wx'});}
 console.log(`${row.original}: exact ${data.length} bytes, SHA256 ${row.originalSha256}`);
}
