// Test-output relocation only: preserve old tracked reports and make sparse
// worktree report parents available. No assertion, route or production change.
import fs from'node:fs';import path from'node:path';import{syncBuiltinESMExports}from'node:module';
const paths=[...[10,60].flatMap(fps=>[-231.4,-231.49].map(x=>`reports/r104-xiqing/exterior-legacy-${fps}-${x}.json`)),...['jingqi/high-drop-exit','jingqi/ground-routes','jingqi/stair-routes','changyin/high-drop-exit','changyin/ground-routes','changyin/view-routes','xishang/threshold','xishang/world-exit'].map(p=>`reports/major-pilots/${p}.json`)];
const targets=new Map(paths.map(p=>[path.resolve(p),path.resolve('reports/major-pilots/yangxin-glazed-face/shared-output',p)])),write=fs.writeFileSync;
fs.writeFileSync=function(file,...args){const absolute=typeof file==='string'?path.resolve(file):file instanceof URL?file.pathname:null,destination=targets.get(absolute);if(destination){fs.mkdirSync(path.dirname(destination),{recursive:true});return write.call(this,destination,...args);}return write.call(this,file,...args);};syncBuiltinESMExports();
