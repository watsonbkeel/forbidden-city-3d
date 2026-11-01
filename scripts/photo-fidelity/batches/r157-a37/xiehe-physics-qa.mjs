// Read-only parent-source comparison and output relocation; no assertion changes.
import fs from 'node:fs';import path from 'node:path';import{execFileSync}from'node:child_process';import{registerHooks,syncBuiltinESMExports}from'node:module';import{fileURLToPath}from'node:url';
const parent=process.env.PARENT_CONTROL==='1',sourcePath=fileURLToPath(new URL('../../../../src/controls/FirstPerson.js',import.meta.url));
const source=parent?execFileSync('git',['show','4d614c22:src/controls/FirstPerson.js'],{encoding:'utf8'}):null;
if(parent)registerHooks({load(u,c,next){return u===new URL('../../../../src/controls/FirstPerson.js',import.meta.url).href?{format:'module',source,shortCircuit:true}:next(u,c);}});
const read=fs.readFileSync,write=fs.writeFileSync;
fs.readFileSync=function(file,options){const p=file instanceof URL?fileURLToPath(file):typeof file==='string'?path.resolve(file):null;if(parent&&p===sourcePath){const encoding=typeof options==='string'?options:options?.encoding;return encoding?Buffer.from(source).toString(encoding):Buffer.from(source);}return read.call(this,file,options);};
const prefix=path.resolve('reports/r87-bridge2-triangle-contact')+path.sep;
fs.writeFileSync=function(file,...args){const p=file instanceof URL?fileURLToPath(file):typeof file==='string'?path.resolve(file):null;if(p?.startsWith(prefix)){const target=path.resolve('../r157-resume-20261030-evidence',`physics-${parent?'parent':'candidate'}`,path.relative(path.resolve('reports'),p));fs.mkdirSync(path.dirname(target),{recursive:true});return write.call(this,target,...args);}return write.call(this,file,...args);};syncBuiltinESMExports();
