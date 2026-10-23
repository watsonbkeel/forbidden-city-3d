// Bounded components only. The predecessor commit is the immutable oracle.
import fs from 'node:fs';
import {ZoneBase} from '../../src/scene/zones/ZoneBase.js';
import {library} from './inner-palace-fixture.mjs';
import {hash,meshRow,boxRow,snapshot} from './r58-gallery-fixture.mjs';
export {hash,meshRow,boxRow};
export const baselineCommit='c9189e4';
export const axisPath='data/zones/garden.json';
export const baselineText=path=>path===axisPath?fs.readFileSync(new URL('../fixtures/r61-d/garden-c9189e4.json',import.meta.url),'utf8'):path==='src/scene/palace/GalleryInventoryPolicy.js'?fs.readFileSync(new URL('../fixtures/r61-d/gallery-policy-c9189e4.js.txt',import.meta.url),'utf8'):fs.readFileSync(new URL('../../'+path,import.meta.url),'utf8');
export const baselineAxis=JSON.parse(baselineText(axisPath));
export const axis=JSON.parse(fs.readFileSync(new URL('../../'+axisPath,import.meta.url)));
export const targets=Object.freeze({14:'RI-87DE2E82FDF5',15:'RI-09B73001F108',16:'RI-DB7D7CFB0AFA',17:'RI-12444A85424A',18:'RI-A8363464C20C',19:'RI-9C4D84C0C18E',20:'RI-772B9B8AB63B',21:'RI-92BFC7DA5CB0',22:'RI-97F7F553A006',23:'RI-2B882BEB407A',24:'RI-C112A7BE8A39',25:'RI-AEB68F800423'});
export const allIndices=Object.keys(targets).map(Number);
export const policy=i=>({mode:'unknown-inventory',target:`garden/items/${i}`,runtimeInventoryId:targets[i]});
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
  function capture(build,index){itemIndex=index;roomIndex=0;props=[];const offsets={colliders:z.kit.colliders.length,walkables:z.kit.walkables.length,rooms:z.kit.rooms.length,maps:z.kit.mapItems.length,regions:z.kit.regions.length};build();return{index,...snapshot(z,z.kit.root.children.at(-1),offsets,props)}}
  for(const i of indices)rows.push(capture(()=>z.buildCorridor(json.items[i]),i));
  for(const [i,build]of[()=>z.kit.corridor(220,180,220,230,'x-'),()=>z.kit.hall({x:180,z:200,w:18,d:12,name:'Unrelated control hall',plaque:false,interior:'hall'})].entries())controls.push(capture(build,`control${i}`));
  return{z,rows,controls,calls,nextRandom:Array.from({length:12},()=>Math.random())};
 }finally{Math.random=saved;}
}
