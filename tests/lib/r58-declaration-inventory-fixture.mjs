// Bounded components only. The predecessor commit is the immutable oracle.
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {ZoneBase} from '../../src/scene/zones/ZoneBase.js';
import {library} from './inner-palace-fixture.mjs';
import {hash,meshRow,boxRow,snapshot} from './r58-gallery-fixture.mjs';
export {hash,meshRow,boxRow};
export const baselineCommit='c9a82aaa8316954e80a03aa934cd8e745065322e';
export const baselineText=path=>execFileSync('git',['show',`${baselineCommit}:${path}`],{encoding:'utf8',maxBuffer:8*1024*1024});
export const axisPath='data/zones/axis-courts.json';
export const baselineAxis=JSON.parse(baselineText(axisPath));
export const axis=JSON.parse(fs.readFileSync(new URL('../../'+axisPath,import.meta.url)));
export const targets=Object.freeze({26:'RI-1DCBD55D5B90',27:'RI-BDA7502B3BD6',32:'RI-2555B6BDA0A9',33:'RI-7D8EE589FEA1'});
export const previousIndices=[28,29,30,31,34,35,36,37];
export const allIndices=[26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41];
export const policy=i=>({mode:'unknown-inventory',target:`axis-courts/items/${i}`,runtimeInventoryId:targets[i]});
const moduleURL=(source,base,overrides={})=>'data:text/javascript;base64,'+Buffer.from(source.replace(/from '([^']+)'/g,(_,s)=>`from '${overrides[s]??(s==='three'?import.meta.resolve('three'):new URL(s,base).href)}'`)).toString('base64');
const policyURL=moduleURL(baselineText('src/scene/palace/GalleryInventoryPolicy.js'),new URL('../../src/scene/palace/GalleryInventoryPolicy.js',import.meta.url));
const kitURL=moduleURL(baselineText('src/scene/palace/kit.js'),new URL('../../src/scene/palace/kit.js',import.meta.url),{'./GalleryInventoryPolicy.js':policyURL});
const {CourtKit:BaselineKit}=await import(kitURL);
const {ZoneBase:BaselineZone}=await import(moduleURL(baselineText('src/scene/zones/ZoneBase.js'),new URL('../../src/scene/zones/ZoneBase.js',import.meta.url),{'../palace/kit.js':kitURL}));
{const k=new BaselineKit(library());k.furnish(k.frame(0,0),'empty',{x0:0,x1:3,z0:0,z1:3,y:0,doorX:1,h:3});}
export function assemble({candidate=true,explicit=true,indices=allIndices,seed=4711}={}){
 const json=structuredClone(candidate?axis:baselineAxis);
 if(!explicit)for(const i of Object.keys(targets))delete json.items[i].furnishingPolicy;
 const saved=Math.random;let state=seed>>>0,calls=0;Math.random=()=>{calls++;return((state=(state*1664525+1013904223)>>>0)/4294967296)};
 try{
  const z=new(candidate?ZoneBase:BaselineZone)(library(),json),rows=[],controls=[];let active=null,lastProp=null,itemIndex=-1,roomIndex=0,props=[];
  const mesh=z.kit.mesh.bind(z.kit),col=z.kit.col.bind(z.kit),furnish=z.kit.furnish.bind(z.kit);
  z.kit.mesh=(...args)=>{const m=mesh(...args);if(active){lastProp={id:`${itemIndex}/room/${active.roomIndex}/prop/${active.meshes.length}`,mesh:m,colliders:[]};active.meshes.push(m);active.owners.push(lastProp)}return m};
  z.kit.col=(...args)=>{col(...args);if(active){const c=z.kit.colliders.at(-1);active.colliders.push(c);lastProp.colliders.push(c)}};
  z.kit.furnish=(f,kind,room,...rest)=>{const rec={item:itemIndex,roomIndex:roomIndex++,kind,room,meshes:[],colliders:[],owners:[]};active=rec;const result=furnish(f,kind,room,...rest);active=null;Object.assign(rec,result);props.push(rec);return result};
  for(const i of[8,10])z.gateWidths.set(json.items[i].name,z.buildGate(json.items[i]));
  function capture(build,index){itemIndex=index;roomIndex=0;props=[];const offsets={colliders:z.kit.colliders.length,walkables:z.kit.walkables.length,rooms:z.kit.rooms.length,maps:z.kit.mapItems.length,regions:z.kit.regions.length};build();return{index,...snapshot(z,z.kit.root.children.at(-1),offsets,props)}}
  for(const i of indices)rows.push(capture(()=>z.buildCorridor(json.items[i]),i));
  for(const [i,build]of[()=>z.kit.corridor(220,180,220,230,'x-'),()=>z.kit.hall({x:180,z:200,w:18,d:12,name:'Unrelated control hall',plaque:false,interior:'hall'})].entries())controls.push(capture(build,`control${i}`));
  return{z,rows,controls,calls,nextRandom:Array.from({length:12},()=>Math.random())};
 }finally{Math.random=saved;}
}
