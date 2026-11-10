import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const root=fileURLToPath(new URL('../../',import.meta.url));
export const out=pathToFileURL(path.resolve(process.env.XIANAN_EVIDENCE_DIR||path.join(root,'.tmp/xianan-contact'))+path.sep);
export function save(name,value){
 if(typeof name!=='string'||!name||name==='.'||name==='..'||/[\\/]/.test(name))throw new Error('Diagnostic output requires a local filename');
 fs.mkdirSync(out,{recursive:true});
 fs.writeFileSync(new URL(encodeURIComponent(name),out),JSON.stringify(value,null,2)+'\n');
}
