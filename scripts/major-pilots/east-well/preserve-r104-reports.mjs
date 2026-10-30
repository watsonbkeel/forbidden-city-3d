// Harness-only output relocation. The shared R104 test writes four old, already
// dirty reports unconditionally. Preserve those bytes while running every test
// and assertion unchanged; save this run's equivalent outputs next to its TAP.
import fs from 'node:fs';import path from 'node:path';import {syncBuiltinESMExports} from 'node:module';
const targets=new Set([10,60].flatMap(fps=>[-231.4,-231.49].map(x=>path.resolve(`reports/r104-xiqing/exterior-legacy-${fps}-${x}.json`)))),write=fs.writeFileSync;
fs.writeFileSync=function(file,...args){const absolute=typeof file==='string'?path.resolve(file):file instanceof URL?file.pathname:null;if(targets.has(absolute)){const destination=path.resolve('reports/major-pilots/east-well/shared-r104',path.basename(absolute));fs.mkdirSync(path.dirname(destination),{recursive:true});return write.call(this,destination,...args);}return write.call(this,file,...args);};syncBuiltinESMExports();
