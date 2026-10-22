import {readFileSync,writeFileSync} from 'node:fs';
import {depthSnapshot} from '../../tests/lib/r49d-depth-snapshot.mjs';
const root=process.argv[2],out=process.argv[3];if(!root||!out)throw Error('explicit frozen root and output required');
const source=readFileSync(root+'/src/scene/palace/special/SourceGuidedNameboardMounts.js','utf8');
const refs=[...source.matchAll(/^ '([^'/]+)\/([^']+)':/gm)].map(m=>({zone:m[1],name:m[2]}));refs.push({zone:'axis-courts',name:'景运门',kind:'gate'});
const rows=[];for(const ref of refs){rows.push(await depthSnapshot(root,ref));console.log(ref.name);}
writeFileSync(out,JSON.stringify({sourceCommit:'50e5fb4d8fee816645b121faf26836a596db9e68',sourceRoot:root,rows},null,2)+'\n');
