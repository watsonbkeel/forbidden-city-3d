// Exact bounded successor proof. Original cc1cf52 reports are immutable inputs.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {createCharacterGeometry} from '../src/scene/characters/CharacterKit.js';
import {characterGeometryOptionsFor} from '../src/scene/characters/CharacterGeometryOptions.js';
import {CHARACTER_REGISTRY as registry} from '../data/characters/index.js';
const source='src/scene/characters/CharacterKit.js',frozen='cc1cf52dcba99135101e6ef0a9702b7f3047e230';
const root=new URL('../',import.meta.url),sha=b=>createHash('sha256').update(b).digest('hex'),git=(...a)=>execFileSync('git',a,{cwd:root});
export function verifyR51Lod2Source(){
 const before=git('show',frozen+':'+source).toString(),after=fs.readFileSync(new URL(source,root),'utf8');
 assert.equal(sha(before),'cc311f8fdaa912538fdfffebd66b7fa2c5de7f2c7063ffbc5bf462bc3f5edc6c');
 const oldToken='yield* b.loft([{x,y:y+.024,rx:.064,rz:.134,z:z+.025}',newToken='yield* b.loft([{x,y:lod===2?y:y+.024,rx:.064,rz:.134,z:z+.025}';
 assert.equal(before.split(oldToken).length-1,1,'one exact old shoe bottom ring');assert.equal(after,before.replace(oldToken,newToken),'only the specifically approved LOD2 bottom-ring expression may change');
 return{frozenCommit:frozen,sourcePath:source,beforeSha256:sha(before),afterSha256:sha(after),oldToken,newToken,exactOneTokenReplacement:true};
}
const attributes=g=>Object.fromEntries(Object.entries(g.attributes).sort(([a],[b])=>a.localeCompare(b)).map(([name,a])=>[name,{itemSize:a.itemSize,normalized:a.normalized,count:a.count,arrayType:a.array.constructor.name,sha256:sha(Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength))}]));
export async function proveR51Lod2Inheritance(){
 const sourceProof=verifyR51Lod2Source(),oldSource=git('show',frozen+':'+source).toString();
 const oldModule=await import('data:text/javascript;base64,'+Buffer.from(oldSource.replace("from 'three'",`from '${import.meta.resolve('three')}'`)).toString('base64'));
 const rows=[];for(const actor of registry.actors)for(const lod of [0,1,2]){
  const options=characterGeometryOptionsFor(actor),old=oldModule.createCharacterGeometry(actor.templateId,actor.behavior.basePose,lod,options),now=createCharacterGeometry(actor.templateId,actor.behavior.basePose,lod,options);
  try{assert.deepEqual(now.userData,old.userData,'all metadata including support/seat contacts '+actor.id+'/'+lod);assert.deepEqual(now.index.array,old.index.array,'all LOD exact topology '+actor.id+'/'+lod);assert.deepEqual(now.groups,old.groups);assert.deepEqual(now.drawRange,old.drawRange);const before=attributes(old),after=attributes(now);if(lod<2){assert.deepEqual(after,before,'all LOD0/1 attribute bytes '+actor.id+'/'+lod);assert.deepEqual(now.boundingBox,old.boundingBox);assert.deepEqual(now.boundingSphere,old.boundingSphere);}else{for(const name of Object.keys(before).filter(n=>!['position','normal'].includes(n)))assert.deepEqual(after[name],before[name],'LOD2 nonspatial attributes '+actor.id);}
   rows.push({actorId:actor.id,templateId:actor.templateId,pose:actor.behavior.basePose,options,lod,triangles:now.index.count/3,indexSha256:sha(Buffer.from(now.index.array.buffer,now.index.array.byteOffset,now.index.array.byteLength)),metadataSha256:sha(JSON.stringify(now.userData)),metadataUnchanged:true,topologyUnchanged:true,allAttributeBytesUnchanged:lod<2,beforeAttributes:before,afterAttributes:after});
  }finally{old.dispose();now.dispose();}
 }
 const frozenFiles=git('ls-tree','-r','--name-only',frozen,'reports/r51-unified').toString().trim().split('\n'),preservedArtifacts={};for(const p of frozenFiles){const current=fs.readFileSync(new URL(p,root)),old=git('show',frozen+':'+p);assert.deepEqual(current,old,'immutable prior world evidence '+p);preservedArtifacts[p]=sha(current);}
 const preservePaths=['data/characters/world-source-freeze.json','data/characters/actors.json','data/characters/paths.json','src/scene/characters/CharacterAnimation.js','src/scene/characters/CharacterBehavior.js','src/scene/characters/CharacterGeometryOptions.js','src/scene/characters/PatrolController.js'];const inheritedSources={};for(const p of preservePaths){const b=fs.readFileSync(new URL(p,root));assert.deepEqual(b,git('show',frozen+':'+p),'unchanged sightline/deformation/physics input '+p);inheritedSources[p]=sha(b);}
 const freeze=JSON.parse(fs.readFileSync(new URL('data/characters/world-source-freeze.json',root)));for(const f of freeze.files)assert.equal(sha(fs.readFileSync(new URL(f.path,root))),f.sha256,'actual frozen world '+f.path);
 return{ok:true,kind:'Exact-source and geometry-byte bounded successor proof. NOT a fresh 57-body or 684-sightline run; NOT GPU, pixel review or a claim that every actual foot is flush with every surface.',sourceProof,activeWorldManifestSha256:sha(fs.readFileSync(new URL('data/characters/world-source-freeze.json',root))),worldSourceFiles:freeze.files.length,requiredActors:registry.actors.filter(a=>a.required).length,geometryCases:rows.length,lod01ByteIdenticalCases:rows.filter(r=>r.lod<2).length,allLodMetadataAndTopologyUnchanged:true,rows,preservedArtifacts,inheritedSources,conclusion:'The previously frozen LOD0 684 sightline records are inherited only because every roster LOD0 geometry attribute/index byte, metadata, motion/options input and all 185 architecture sources remain unchanged. The 57 player-body/2 canopy results are inherited through byte-identical world physics/architecture, not rerun. The separate after-lod2 binding capture verifies current Kit inputs freshly. LOD2 actual world foot/surface residuals are audited separately.'};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){const report=await proveR51Lod2Inheritance();fs.writeFileSync(new URL('reports/r51-unified/world-lod2-inheritance.json',root),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({...report,rows:undefined,preservedArtifacts:undefined,inheritedSources:undefined},null,2));}
