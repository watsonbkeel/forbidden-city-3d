// Save the whole original replay before any consumer assertion; no scene/query work.
import fs from 'node:fs';import crypto from 'node:crypto';import {serializeTrace} from './native-ground-trace.mjs';
export function persistNativeReplay(directory,index,descriptor,q,observation){
 const file='NATIVE-TRACE-'+String(index).padStart(3,'0')+'.json',bytes=JSON.stringify({descriptor,replay:serializeTrace(q),frameIndices:q.frames.map((_,index)=>index),frameCount:q.frames.length,frameSHA256:crypto.createHash('sha256').update(JSON.stringify(q.frames)).digest('hex'),observation:{proof:observation.proof,rows:serializeTrace(observation.rows)}},null,2)+'\n';
 fs.writeFileSync(new URL(file,directory),bytes,{flag:'wx'});return{path:file,bytes:Buffer.byteLength(bytes),sha256:crypto.createHash('sha256').update(bytes).digest('hex')};
}
