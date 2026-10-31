import {createR157FrozenSourceReader} from './r157-frozen-source-reader.mjs';
import {registerHooks} from 'node:module';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
// Isolated committed candidate, not a selective hybrid of old/new dependencies.
const root=process.cwd(),commit='ebd5d0494bc2eedcd8983dcb7669d4c7e8f121d2';
const frozen=createR157FrozenSourceReader(root,commit),names=new Set(frozen.paths);
const cache=new Map();
registerHooks({load(url,context,next){
 if(!url.startsWith('file:'))return next(url,context);
 const name=path.relative(root,fileURLToPath(url)).split(path.sep).join('/');
 if(!/^(src|data)\//.test(name)||!(/\.(m?js|json)$/.test(name)))return next(url,context);
 if(!names.has(name))throw Error(`Non-reference production dependency in Wumen main isolation: ${name}`);
 if(!cache.has(name))cache.set(name,frozen.read(name));
 return {format:name.endsWith('.json')?'json':'module',source:cache.get(name),shortCircuit:true};
}});
