import {writeFileSync} from 'node:fs';
import {depthSnapshot} from '../../tests/lib/r49d-depth-snapshot.mjs';
const root=process.argv[2],output=process.argv[3];if(!root||!output)throw Error('Explicit source root and output required');
const rows=[];for(const ref of [{zone:'outer-east',name:'本仁殿'},{zone:'outer-east',name:'集义殿'},{zone:'outer-east',name:'文渊阁'},{zone:'axis-courts',name:'景运门',kind:'gate'}])rows.push(await depthSnapshot(root,ref));
writeFileSync(output,JSON.stringify({sourceCommit:'95db2af664ff9cb6ea405d0ba389ef428dfd7d6c',sourceRoot:root,rows},null,2)+'\n');console.log(rows.map(r=>({name:r.name,meshes:r.meshes,geometry:r.wholeGeometryHash})));
