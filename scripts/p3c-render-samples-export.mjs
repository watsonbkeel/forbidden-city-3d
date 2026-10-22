import fs from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
import * as THREE from 'three';
import { createCharacterGeometry } from '../src/scene/characters/CharacterKit.js';
import { deformCharacterVertex } from '../src/scene/characters/CharacterAnimation.js';
const out=path.resolve('reports/r50/c1-samples');fs.mkdirSync(out,{recursive:true});
function exportGeometry(g,state={amplitude:0}){
 const p=g.attributes.position,n=g.attributes.normal,c=g.attributes.color,positions=[],normals=[];
 for(let i=0;i<p.count;i++){
  const a={part:g.attributes.characterPart?.getX(i)??0,pivot:g.attributes.characterPivot?Array.from(g.attributes.characterPivot.array.slice(i*3,i*3+3)):[0,0,0],weight:g.attributes.characterWeight?.getX(i)??0,torsoWeight:g.attributes.characterTorsoWeight?.getX(i)??0};
  const v=deformCharacterVertex([p.getX(i),p.getY(i),p.getZ(i)],[n.getX(i),n.getY(i),n.getZ(i)],a,state);positions.push(...v.position);normals.push(...v.normal);
 }
 return {positions,normals,colors:Array.from(c.array),indices:Array.from(g.index.array),metadata:g.userData};
}
function fixtureBox(position,size,color){const g=new THREE.BoxGeometry(...size);g.translate(...position);const col=new THREE.Color(color),a=[];for(let i=0;i<g.attributes.position.count;i++)a.push(col.r,col.g,col.b);g.setAttribute('color',new THREE.Float32BufferAttribute(a,3));return exportGeometry(g);}
function chair(){const a=[];a.push(fixtureBox([0,.457,-.05],[.62,.065,.54],0x5c3624));for(const x of [-.26,.26])for(const z of [-.27,.17])a.push(fixtureBox([x,.223,z],[.055,.446,.055],0x573322));a.push(fixtureBox([0,.84,-.29],[.60,.72,.05],0x663d29));a.push(fixtureBox([0,.86,-.255],[.43,.48,.025],0x43291f));a.push(fixtureBox([0,1.20,-.29],[.64,.055,.075],0x815331));return a;}
const samples=[['guard-duty','standing'],['emperor-ceremonial','seated'],['official-ceremonial','kneeling']];
const models=samples.map(([id,pose])=>{const geometry=createCharacterGeometry(id,pose,0);return {id,pose,mesh:exportGeometry(geometry,{pose,amplitude:0}),fixtures:pose==='seated'?chair():[]};});
fs.writeFileSync(path.join(out,'models.json'),JSON.stringify({schemaVersion:1,source:'Actual CharacterKit BufferGeometry; CPU software raster; not browser/WebGL evidence',models}));
const frames=[];for(let i=0;i<24;i++)frames.push(samples.map(([id,pose])=>({id,pose,mesh:exportGeometry(createCharacterGeometry(id,pose,0),{time:i/24*8,pose,phase:0.35,amplitude:1,walkSpeed:pose==='standing'?.75:0}),fixtures:pose==='seated'?chair():[]})));
fs.writeFileSync(path.join(out,'animation-frames.json.gz'),gzipSync(JSON.stringify({source:'CPU deformation uses CharacterAnimation.js, same equations as shader; no browser/WebGL evidence',frames})));
const seatVariants=['standard','raised-footstool','kang-low'].map(variant=>({id:variant==='kang-low'?'consort-daily':'emperor-ceremonial',pose:`seated / ${variant}`,mesh:exportGeometry(createCharacterGeometry(variant==='kang-low'?'consort-daily':'emperor-ceremonial','seated',0,{seatVariant:variant})),fixtures:[...chair(),...(variant==='raised-footstool'?[fixtureBox([0,.15,.815],[.69,.30,.40],0x65402a)]:variant==='kang-low'?[fixtureBox([0,.02,.515],[.75,.04,.65],0x8c8780)]:[])]}));
fs.writeFileSync(path.join(out,'seat-variants.json'),JSON.stringify({models:seatVariants}));
console.log(`Exported ${models.length} actual geometries and ${frames.length} animation frames to ${out}`);
