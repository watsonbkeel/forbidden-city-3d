// Preserve inherited historical reports while running original tests unchanged.
// Only synchronous report writes are redirected; reads and all runtime modules are untouched.
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';import {syncBuiltinESMExports} from 'node:module';
const write=fs.writeFileSync.bind(fs),root=process.cwd(),reports=path.join(root,'reports')+path.sep,target=path.join(root,'reports/r115-validation/generated-targeted');
fs.writeFileSync=function(p,...args){const name=p instanceof URL?fileURLToPath(p):typeof p==='string'?path.resolve(p):null;if(name?.startsWith(reports)&&!name.startsWith(path.join(root,'reports/r115-validation')+path.sep)){const out=path.join(target,path.relative(path.join(root,'reports'),name));fs.mkdirSync(path.dirname(out),{recursive:true});return write(out,...args);}return write(p,...args);};syncBuiltinESMExports();
