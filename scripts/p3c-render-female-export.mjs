import fs from 'node:fs';
import crypto from 'node:crypto';
import {gzipSync} from 'node:zlib';
import {createCharacterGeometry} from '../src/scene/characters/CharacterKit.js';
import {deformCharacterVertex} from '../src/scene/characters/CharacterAnimation.js';
const out=process.env.P3C_FEMALE_OUT||'reports/r50-followup/female-samples';fs.mkdirSync(out,{recursive:true});
if(fs.existsSync(`${out}/manifest.json`)){
 const original=JSON.parse(fs.readFileSync(`${out}/manifest.json`));
 for(const entry of original.unchangedProductionSources??[])if(crypto.createHash('sha256').update(fs.readFileSync(entry.path)).digest('hex')!==entry.sha256)throw new Error('Preserved pre-refinement evidence: use P3C_FEMALE_OUT with a fresh output directory after source changes.');
}
function exportGeometry(g,state={amplitude:0}) {
 const p=g.attributes.position,n=g.attributes.normal,c=g.attributes.color,positions=[],normals=[];
 for(let i=0;i<p.count;i++) {
  const a={part:g.attributes.characterPart.getX(i),pivot:Array.from(g.attributes.characterPivot.array.slice(i*3,i*3+3)),weight:g.attributes.characterWeight.getX(i),torsoWeight:g.attributes.characterTorsoWeight.getX(i)};
  const v=deformCharacterVertex([p.getX(i),p.getY(i),p.getZ(i)],[n.getX(i),n.getY(i),n.getZ(i)],a,state);positions.push(...v.position);normals.push(...v.normal);
 }
 return {positions,normals,colors:Array.from(c.array),indices:Array.from(g.index.array),metadata:g.userData};
}
const specs=[['consort-daily','standing'],['maid-daily','standing'],['consort-daily','seated']];
const models=specs.map(([id,pose])=>({id,pose,mesh:exportGeometry(createCharacterGeometry(id,pose,0,{seatVariant:pose==='seated'?'kang-low':'standard'})),fixtures:[]}));
const hashes=Object.fromEntries(['src/scene/characters/CharacterKit.js','src/scene/characters/CharacterAnimation.js'].map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')]));
fs.writeFileSync(`${out}/models.json.gz`,gzipSync(JSON.stringify({models,hashes,source:'Original unit-scale CharacterKit indexed BufferGeometry; CPU software raster only; hairstyle historical gate not passed.'})));
console.log('Exported current unchanged female geometries.');
if(process.argv.includes('--animation')) {
 const frames=[];
 for(let i=0;i<24;i++)frames.push([['consort-daily','seated',0],['maid-daily','standing',0],['maid-daily','standing',.35]].map(([id,pose,speed])=>({id,pose,mesh:exportGeometry(createCharacterGeometry(id,pose,0,{seatVariant:pose==='seated'?'kang-low':'standard'}),{time:i/24*8,pose,phase:.35,amplitude:.7,walkSpeed:speed}),fixtures:[]})));
 fs.writeFileSync(`${out}/animation-frames.json.gz`,gzipSync(JSON.stringify({frames,hashes,source:'Actual CPU deformation reference. Root-relative walking cycle; not a world route or GPU performance proof.'})));
 console.log('Exported 24 female animation frames.');
}
