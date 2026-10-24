import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {CourtKit} from '../../../src/scene/palace/kit.js';
import {library} from '../inner-palace-fixture.mjs';
const root=new URL('../../../',import.meta.url),base='aa5793395a16fbd870ce758174a5f9438f3bc423';
export async function frozenFixture(name,lib=library()){
 const residential=name==='重华宫',zone=residential?'west-six':'outer-west',path='src/scene/palace/special/'+(residential?'RemainingResidentialHalls':'RemainingOuterHalls')+'.js';
 const bytes=execFileSync('git',['show',base+':'+path]);let source=bytes.toString();source=source.replace(/from\s*(['"])([^'"]+)\1/g,(_m,q,p)=>'from '+q+(p==='three'?new URL('node_modules/three/build/three.module.js',root).href:new URL(p,new URL(path,root)).href)+q);
 const api=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64')),item=JSON.parse(readFileSync(new URL('data/zones/'+zone+'.json',root))).items.find(i=>i.kind==='hall'&&i.name===name),kit=new CourtKit(lib,zone),p=api.resolveRemainingProfile(zone,item),b=api.buildRemainingHall(kit,item,p);kit.root.updateMatrixWorld(true);return{kit,item,p,...b,dispose:()=>kit.dispose(kit.root),baselineCommit:base};
}
