import fs from 'node:fs';
import * as T from 'three';
import '../lib/inner-palace-fixture.mjs';
import {createActualLibrary} from '../r158-cumulative-1600/library.mjs';
import {CourtKit} from '../../src/scene/palace/kit.js';
import {ZoneBase} from '../../src/scene/zones/ZoneBase.js';
import {buildChongjingHall} from '../../src/scene/palace/special/ChongjingHall.js';
import {rawSnapshot,hash} from '../r164-three-entry-navigation/snapshot.mjs';
export const path='src/scene/palace/special/ChongjingHall.js';
const origin=new URL('../../'+path,import.meta.url);
export function sourceURL(source,base,overrides={}){return 'data:text/javascript;base64,'+Buffer.from(source.replace(/from\s*(['"])([^'"]+)\1/g,(_,q,p)=>'from '+JSON.stringify(overrides[p]??(p==='three'?import.meta.resolve(p):p.startsWith('.')?new URL(p,base).href:p)))).toString('base64')}
const beforeURL=sourceURL(fs.readFileSync(new URL('./frozen/ChongjingHall.97af.js',import.meta.url),'utf8'),origin);
export const {buildChongjingHall:beforeChongjing}=await import(beforeURL);
const zoneOrigin=new URL('../../src/scene/zones/ZoneBase.js',import.meta.url);
export const {ZoneBase:BeforeZone}=await import(sourceURL(fs.readFileSync(zoneOrigin,'utf8'),zoneOrigin,{'../palace/special/ChongjingHall.js':beforeURL}));
export {ZoneBase,buildChongjingHall,rawSnapshot,hash,T};
export function fixture({before=false}={}){const data=JSON.parse(fs.readFileSync(new URL('../../data/zones/west-six.json',import.meta.url))),{library,dispose}=createActualLibrary(),kit=new CourtKit(library,'west-six');return{kit,data,run:()=> (before?beforeChongjing:buildChongjingHall)(kit,data),snapshot:()=>({geometry:rawSnapshot(kit.root),colliders:hash(kit.colliders),walkables:hash(kit.walkables),maps:hash(kit.mapItems),rooms:hash(kit.rooms),regions:hash(kit.regions),meta:hash(kit.root.children.map(x=>x.userData))}),dispose(){kit.dispose(kit.root);dispose()}}}
export function countTransient(run){const getArea=T.Triangle.prototype.getArea,map=Array.prototype.map,seen=new Set();let areaCalls=0,roundArrays=0;T.Triangle.prototype.getArea=function(...args){areaCalls++;seen.add(this);return getArea.apply(this,args)};Array.prototype.map=function(...args){if(args[0]===Math.fround)roundArrays++;return map.apply(this,args)};try{return {value:run(),counts:()=>({areaCalls,triangles:seen.size,roundArrays})}}finally{T.Triangle.prototype.getArea=getArea;Array.prototype.map=map}}
