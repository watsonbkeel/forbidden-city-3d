import{applyYikunInnerSouthWindows}from'../../../src/scene/palace/special/YikunInnerSouthWindows.js';
import fs from'node:fs';import{execFileSync}from'node:child_process';import{ZoneBase}from'../../../src/scene/zones/ZoneBase.js';import{library}from'../../lib/inner-palace-fixture.mjs';
export const data=JSON.parse(fs.readFileSync(new URL('../../../data/zones/west-six.json',import.meta.url))),item=data.items.find(i=>i.name==='翊坤宫');
const base='3987742a49bf29d8e255df2de515cd658ef412cb',ownerPath='src/scene/palace/special/WestDomesticHalls.js',zonePath='src/scene/zones/ZoneBase.js';
function sourceURL(path,overrides={}){const url=new URL('../../../'+path,import.meta.url),source=execFileSync('git',['show',base+':'+path],{encoding:'utf8'}).replace(/from\s+(['"])([^'"]+)\1/g,(_,q,s)=>'from '+q+(overrides[s]??(s.startsWith('.')?new URL(s,url).href:import.meta.resolve(s)))+q);return'data:text/javascript;base64,'+Buffer.from(source).toString('base64');}
const ownerURL=sourceURL(ownerPath);export const {ZoneBase:ParentZoneBase}=await import(sourceURL(zonePath,{'../palace/special/WestDomesticHalls.js':ownerURL}));
export function make(old=false,lib=library()){const b=new(old?ParentZoneBase:ZoneBase)(lib,data),r=b.buildHall(item);if(!old)applyYikunInnerSouthWindows(b.kit,r.f);b.kit.root.updateMatrixWorld(true);return{b,kit:b.kit,...r,dispose:()=>b.kit.dispose(b.kit.root)}}
// Capture ordinary west-six sources immediately before the REAL merge.
// Keep the actual production finish and its resource lifecycle intact.
export function full(old=false,capture=()=>null){const b=new(old?ParentZoneBase:ZoneBase)(library(),data),finish=b.kit.finish.bind(b.kit);let before;b.kit.finish=()=>{b.kit.root.updateMatrixWorld(true);before=capture(b.kit.root);return finish()};const built=b.build();built.group.updateMatrixWorld(true);return{b,built,before,dispose:()=>b.dispose()};}
