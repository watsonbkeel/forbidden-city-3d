// Two actual SideGate assemblies + production merge, NOT a second world/build.
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {fixture,snapshot,meshRows,hash,physical,roles,geometryHealth,triangles,meshes} from '../../tests/lib/r58-court-facade-fixture.mjs';
import {exportXieheCourtyardViews} from '../../tests/lib/r58-xiehe-courtyard-cpu.mjs';
import {assertXieheCourtyardKneesInWorld} from '../../tests/lib/r58-xiehe-courtyard-world-check.mjs';
const base='c85e770',path='src/scene/palace/special/SideGate.js',url=new URL('../../'+path,import.meta.url);
let source=execFileSync('git',['show',`${base}:${path}`],{encoding:'utf8'});
source=source.replace(/from\s+(['"])([^'"]+)\1/g,(_,q,id)=>`from ${q}${id==='three'?import.meta.resolve('three'):new URL(id,url).href}${q}`);
const {buildSideGate}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const before=fixture('xiehe',{},buildSideGate),after=fixture('xiehe'),out='reports/r58-xiehe-courtyard-knees';fs.mkdirSync(out,{recursive:true});
const proof={scope:'ACTUAL_PRODUCTION_MERGED_SIDEGATE_COMPONENT_ONLY. Not a full world, browser, GPU, texture, current-condition or visual acceptance.',baseCommit:execFileSync('git',['rev-parse',base],{encoding:'utf8'}).trim(),head:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),before:snapshot(before),after:snapshot(after),retainedExact:hash(meshRows(before.frame))===hash(meshRows(after.frame,o=>o.userData.role==='xiehe-courtyard-knee')),physicsExact:hash(physical(before.kit))===hash(physical(after.kit)),addedHealth:roles(after.frame,'xiehe-courtyard-knee').map(geometryHealth),views:[],sourceHashes:{},officialPhotosCopied:false};
for(const [stage,f] of [['before',before],['after',after]]){
 const root=f.kit.finish(),W={scene:root,cm:f.cm};root.updateMatrixWorld(true);
 proof[stage+'Merged']={triangles:triangles(root),meshes:meshes(root).length};
 if(stage==='after')proof.actualMergedKnees=assertXieheCourtyardKneesInWorld(W);
 proof.views.push(...exportXieheCourtyardViews(W,out,stage));
 f.kit.dispose(root);
}
for(const p of [path,'src/scene/palace/special/XieheCourtyardKnees.js','src/scene/palace/special/SideGateExteriorDetails.js'])proof.sourceHashes[p]=createHash('sha256').update(fs.readFileSync(p)).digest('hex');
fs.writeFileSync(`${out}/proof.json`,JSON.stringify(proof,null,2)+'\n');console.log(JSON.stringify({...proof,views:proof.views.map(v=>({path:v.path,triangles:v.triangles}))},null,2));
