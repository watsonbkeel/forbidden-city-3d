import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {readVerifiedChunkedGzip} from '../../../../tests/lib/r157-verified-chunked-gzip.mjs';
const directory=fs.realpathSync(fileURLToPath(new URL('./',import.meta.url)));
const pinFile=path.join(directory,'ARCHIVE-PINS.json'),stat=fs.lstatSync(pinFile);
if(!stat.isFile()||stat.isSymbolicLink()||fs.realpathSync(pinFile)!==pinFile)throw Error('Nonregular evidence pins');
const pinBytes=fs.readFileSync(pinFile);
if(createHash('sha256').update(pinBytes).digest('hex')!=='39ea5b6b7b12f8e5f7fdd96b7d19af346962b93aa5572d848a57c8c577d199f8')throw Error('Evidence transport pin mismatch');
const freeze=o=>{if(o&&typeof o==='object'){for(const v of Object.values(o))freeze(v);Object.freeze(o);}return o;};
const pins=freeze(JSON.parse(pinBytes));
// Canonical pins remain private. Returned buffers are fresh, never identity inputs.
export function readArtifact(id){
 if(typeof id!=='string')throw Error('Unknown evidence artifact');
 const key=Object.hasOwn(pins.artifacts,id)?id:Object.hasOwn(pins.logicalAliases,id)?pins.logicalAliases[id]:null;
 if(key===null)throw Error('Unknown evidence artifact');
 const pin=pins.artifacts[key],compressed=readVerifiedChunkedGzip(path.join(directory,pin.relativeGzip),pin);
 const raw=gunzipSync(compressed,{maxOutputLength:pin.uncompressedBytes+1});
 if(raw.length!==pin.uncompressedBytes||createHash('sha256').update(raw).digest('hex')!==pin.uncompressedSHA256)throw Error('Evidence raw identity mismatch');
 return raw;
}
