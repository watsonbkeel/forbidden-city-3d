import {registerHooks} from 'node:module';import {execFileSync} from 'node:child_process';
const paths=['src/scene/palace/special/HongdeCourt.js'];
const sources=new Map(paths.map(path=>[new URL('../../../'+path,import.meta.url).href,execFileSync('git',['show','3d1fd4956afd878de0058a8d5b0ea1536f13ea9d:'+path],{encoding:'utf8'})]));registerHooks({load(u,c,next){return sources.has(u)?{format:'module',source:sources.get(u),shortCircuit:true}:next(u,c);}});
// Historical fixtures also read then transform these production source files.
// Give those fixtures the same safe-parent bytes as the module loader.
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';import {syncBuiltinESMExports} from 'node:module';
const files=new Map([...sources].map(([url,source])=>[fileURLToPath(url),source])),read=fs.readFileSync;
fs.readFileSync=function(file,options){const name=file instanceof URL?fileURLToPath(file):typeof file==='string'?path.resolve(file):null;if(files.has(name)){const encoding=typeof options==='string'?options:options?.encoding;return encoding?Buffer.from(files.get(name)).toString(encoding):Buffer.from(files.get(name));}return read.call(this,file,options);};syncBuiltinESMExports();
