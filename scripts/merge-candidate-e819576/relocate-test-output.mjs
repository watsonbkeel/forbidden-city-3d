// Only relocate report writes; never change source, imports, reads or assertions.
import fs from 'node:fs';
import path from 'node:path';
import {syncBuiltinESMExports} from 'node:module';
const root=process.cwd(),prefix=path.join(root,'reports')+path.sep;
const output=path.join(root,'reports/merge-candidate-e819576/suite-output');
const write=fs.writeFileSync;
fs.writeFileSync=function(file,...args){
 const absolute=typeof file==='string'?path.resolve(file):file instanceof URL?file.pathname:null;
 if(absolute?.startsWith(prefix)&&!absolute.startsWith(output+path.sep)){
   const destination=path.join(output,path.relative(root,absolute));
   fs.mkdirSync(path.dirname(destination),{recursive:true});
   return write.call(this,destination,...args);
 }
 return write.call(this,file,...args);
};
syncBuiltinESMExports();
