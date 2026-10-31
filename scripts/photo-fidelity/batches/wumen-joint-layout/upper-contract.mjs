import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {isDeepStrictEqual} from 'node:util';
// Offline immutable proposal only. No runtime module imports or installs it.
const bytes=readFileSync(new URL('./upper-contract.json',import.meta.url));
const hash=b=>createHash('sha256').update(b).digest('hex');
if(hash(bytes)!=='a4cf1263ae9a8cac38a4e0002458bc8cf413b6426cb59bad9c56575c1227e4b2')throw Error('upper reassembly contract byte pin mismatch');
const freeze=o=>{if(o&&typeof o==='object'){Object.values(o).forEach(freeze);Object.freeze(o);}return o;};
const canonical=freeze(JSON.parse(bytes));
export function createUpperReassemblyContract(){return canonical;}
export function validateUpperReassemblyContract(input){if(!isDeepStrictEqual(input,canonical))throw Error('upper reassembly contract differs from frozen numeric proposal');return true;}
