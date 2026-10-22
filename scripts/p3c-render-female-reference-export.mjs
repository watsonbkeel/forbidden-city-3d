/** CPU-only review export. No production state, world build, or old evidence is changed. */
import fs from 'node:fs';
import crypto from 'node:crypto';
import {gzipSync} from 'node:zlib';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const out=process.env.P3C_FEMALE_OUT||'reports/r50-followup/female-reference/candidate06-01';
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const paths=['src/scene/characters/CharacterKit.js','src/scene/characters/CharacterAnimation.js'];
const hashes=Object.fromEntries(paths.map(p=>[p,sha(fs.readFileSync(p))]));
fs.mkdirSync(out,{recursive:true});
for(const name of ['models.json.gz','animation-frames.json.gz','export-manifest.json','CharacterKit-source.js','Animation-source.js','renderer-source.py'])if(fs.existsSync(`${out}/${name}`))throw new Error(`Preserve existing evidence: ${out}/${name}. Select a fresh directory.`);
for(const [source,name] of [[paths[0],'CharacterKit-source.js'],[paths[1],'Animation-source.js']]){const bytes=fs.readFileSync(source);if(sha(bytes)!==hashes[source])throw new Error(`Source changed before snapshot: ${source}`);fs.writeFileSync(`${out}/${name}`,bytes,{flag:'wx'});}
fs.writeFileSync(`${out}/renderer-source.py`,fs.readFileSync('scripts/p3c-render-female-reference.py'),{flag:'wx'});
const {createCharacterGeometry}=await import(pathToFileURL(path.resolve(out,'CharacterKit-source.js')).href);
const {deformCharacterVertex}=await import(pathToFileURL(path.resolve(out,'Animation-source.js')).href);
function exportGeometry(g,state={amplitude:0}) {
 const p=g.attributes.position,n=g.attributes.normal,c=g.attributes.color,positions=[],normals=[];
 for(let i=0;i<p.count;i++) {
  const a={part:g.attributes.characterPart.getX(i),pivot:Array.from(g.attributes.characterPivot.array.slice(i*3,i*3+3)),weight:g.attributes.characterWeight.getX(i),torsoWeight:g.attributes.characterTorsoWeight.getX(i)};
  const v=deformCharacterVertex([p.getX(i),p.getY(i),p.getZ(i)],[n.getX(i),n.getY(i),n.getZ(i)],a,state);positions.push(...v.position);normals.push(...v.normal);
 }
 return {positions,normals,colors:Array.from(c.array),indices:Array.from(g.index.array),metadata:g.userData};
}
const specs=[
 {key:'consort-seated',id:'consort-daily',pose:'seated',options:{seatVariant:'kang-low'},walkSpeed:0},
 {key:'maid-standing',id:'maid-daily',pose:'standing',options:{femalePose:'resting'},walkSpeed:0},
 {key:'maid-walking',id:'maid-daily',pose:'standing',options:{femalePose:'walking'},walkSpeed:.35},
];
const geometries=specs.map(s=>createCharacterGeometry(s.id,s.pose,0,s.options));
const stillState=s=>({time:.8,phase:.35,pose:s.pose,amplitude:s.walkSpeed?.7:0,walkSpeed:s.walkSpeed});
const models=specs.map((s,i)=>({...s,state:stillState(s),mesh:exportGeometry(geometries[i],stillState(s)),fixtures:[]}));
let fixtureProvenance={included:false,reason:'No verified cached kang fixture supplied.'};
const fixturePath=process.env.P3C_FEMALE_FIXTURE||'reports/r50-followup/female-samples/post-refinement/candidate-05/world-seat-models.json';
if(fs.existsSync(fixturePath)){
 const bytes=fs.readFileSync(fixturePath),cache=JSON.parse(bytes),cached=cache.models.find(m=>m.metadata?.actor?.templateId==='consort-daily');
 for(const [p,h]of Object.entries(cache.hashes??{}))if(!p.endsWith('/CharacterKit.js')&&sha(fs.readFileSync(p))!==h)throw new Error(`Cached fixture source changed: ${p}`);
 if(!cached)throw new Error('Cache contains no consort fixture.');
 for(const k of ['bodyHeightMeters','seatVariant','seatPelvis','seatContact','groundContacts'])if(JSON.stringify(cached.metadata.kit[k])!==JSON.stringify(models[0].mesh.metadata[k]))throw new Error(`Cached seated binding invariant changed: ${k}`);
 // Retain the actual kang triangles; omit only large room floor planes for the review backdrop.
 const selected=cached.fixtures.map((mesh,index)=>({mesh,index})).filter(({mesh})=>{
  const y=mesh.positions.filter((_,i)=>i%3===1);return Math.max(...y)>.15;
 });
 models[0].fixtures=selected.map(f=>f.mesh);
 fixtureProvenance={included:true,path:fixturePath,sha256:sha(bytes),sourceHashesVerified:true,originalFixtureIndices:selected.map(f=>f.index),retainedFixtureSha256:sha(Buffer.from(JSON.stringify(models[0].fixtures))),omission:'Only large room floor planes omitted for neutral review backdrop; actual kang triangles unchanged.',binding:'Original cached resolved binding retained; support metadata compared exactly. No fresh world export.'};
}
const evidence={source:'Actual indexed CharacterKit BufferGeometry at original unit scale; unchanged existing CPU deformation. CPU software raster only, not GPU.',hashes,fixtureProvenance,modelScale:1,bodyHeightMeters:1.7,walkingRuntimeIntegration:'not-integrated',notes:['Review lighting and neutral backdrop are offline presentation aids.','No synthesized image, replacement mesh, or historical/appearance acceptance claim.','femalePose=walking is a preview geometry option only; this export does not claim runtime routing or animation integration.']};
const modelBytes=gzipSync(JSON.stringify({models,...evidence}));
const frames=[];
if(process.argv.includes('--animation'))for(let i=0;i<24;i++)frames.push(specs.map((s,j)=>({...s,state:{time:i/24*8,phase:.35,pose:s.pose,amplitude:.7,walkSpeed:s.walkSpeed},mesh:exportGeometry(geometries[j],{time:i/24*8,phase:.35,pose:s.pose,amplitude:.7,walkSpeed:s.walkSpeed}),fixtures:[]})));
for(const [p,h]of Object.entries(hashes))if(sha(fs.readFileSync(p))!==h)throw new Error(`Source changed during export; no evidence written: ${p}`);
fs.writeFileSync(`${out}/models.json.gz`,modelBytes,{flag:'wx'});
if(frames.length)fs.writeFileSync(`${out}/animation-frames.json.gz`,gzipSync(JSON.stringify({frames,...evidence,source:evidence.source+' Root-relative walk cycle only, not world-space route or foot-lock proof.'})),{flag:'wx'});
fs.writeFileSync(`${out}/export-manifest.json`,JSON.stringify({...evidence,exportedFrameCount:frames.length,models:models.map(({key,id,pose,options,state,mesh})=>({key,id,pose,options,state,vertices:mesh.positions.length/3,triangles:mesh.indices.length/3,geometrySha256:sha(Buffer.from(JSON.stringify(mesh)))})),scripts:[...paths,'scripts/p3c-render-female-reference-export.mjs','scripts/p3c-render-female-reference.py'].map(path=>({path,sha256:sha(fs.readFileSync(path))}))},null,2),{flag:'wx'});
for(const g of geometries)g.dispose();
console.log(`Exported 3 original-scale female meshes and ${frames.length} CPU-deformed frames to ${out}`);
