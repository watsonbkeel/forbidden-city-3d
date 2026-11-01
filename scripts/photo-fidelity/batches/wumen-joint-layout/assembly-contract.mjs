import {readFileSync,readdirSync,lstatSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {isDeepStrictEqual} from 'node:util';
const sha=b=>createHash('sha256').update(b).digest('hex');
const bytes=readFileSync(new URL('./assembly-contract.json',import.meta.url));
if(sha(bytes)!=='24cba162d28a8bbca9aa5308594ef937e00a51eef1b5099f43285b8022e21ca5')throw Error('assembly contract byte identity differs');
const freeze=o=>{if(o&&typeof o==='object'){Object.values(o).forEach(freeze);Object.freeze(o);}return o;};
const canonical=freeze(JSON.parse(bytes));
const root=new URL('../../../../',import.meta.url);
function sourceFiles(p){if(!lstatSync(new URL(p,root)).isDirectory()||lstatSync(new URL(p,root)).isSymbolicLink())throw Error('assembly contract source directory differs');return readdirSync(new URL(p,root),{withFileTypes:true}).flatMap(e=>{const n=p+'/'+e.name;if(e.isSymbolicLink())throw Error('assembly contract source symlink');return e.isDirectory()?sourceFiles(n):[n];});}
export function createWumenAssemblyContract(){return canonical;}
/** Read-only exact Task1 input closure, not a geometry or route certificate. */
export function verifyAssemblyInputs(input){
 if(!isDeepStrictEqual(input,canonical))throw Error('assembly contract differs from fixed roles/frames/source/uncertainty');
 const actual=[...sourceFiles('src'),...sourceFiles('data')].sort();
 if(!isDeepStrictEqual(actual,Object.keys(canonical.sourceSHA256)))throw Error('assembly contract source set differs');
 for(const [p,expected]of Object.entries({...canonical.sourceSHA256,...canonical.inputSHA256})){
  const file=new URL(p,root);if(!lstatSync(file).isFile()||lstatSync(file).isSymbolicLink()||sha(readFileSync(file))!==expected)throw Error('assembly contract input source differs: '+p);
 }
 return true;
}
