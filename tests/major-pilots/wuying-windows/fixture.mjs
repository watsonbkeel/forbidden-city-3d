import{applyWuyingSouthWindows}from'../../../src/scene/palace/special/WuyingSouthWindows.js';
import fs from'node:fs';import{execFileSync}from'node:child_process';import{ZoneBase}from'../../../src/scene/zones/ZoneBase.js';import{library}from'../../lib/inner-palace-fixture.mjs';
export const data=JSON.parse(fs.readFileSync(new URL('../../../data/zones/outer-west.json',import.meta.url))),item=data.items.find(i=>i.name==='武英殿');
const base='f89260c551b8a234b55c7d3653fd5cc6ea1b1358',ownerPath='src/scene/palace/special/RemainingOuterHalls.js',zonePath='src/scene/zones/ZoneBase.js';
function sourceURL(path,overrides={}){const url=new URL('../../../'+path,import.meta.url),source=execFileSync('git',['show',base+':'+path],{encoding:'utf8'}).replace(/from\s+(['"])([^'"]+)\1/g,(_,q,s)=>'from '+q+(overrides[s]??(s.startsWith('.')?new URL(s,url).href:import.meta.resolve(s)))+q);return'data:text/javascript;base64,'+Buffer.from(source).toString('base64');}
const ownerURL=sourceURL(ownerPath);export const {ZoneBase:ParentZoneBase}=await import(sourceURL(zonePath,{'../palace/special/RemainingOuterHalls.js':ownerURL}));
export function make(old=false,lib=library()){const b=new(old?ParentZoneBase:ZoneBase)(lib,data),r=b.buildHall(item);if(!old)applyWuyingSouthWindows(b.kit,r.f);b.kit.root.updateMatrixWorld(true);return{b,kit:b.kit,...r,dispose:()=>b.kit.dispose(b.kit.root)}}
// Capture ordinary outer-west sources immediately before the REAL merge.
// Keep the actual production finish and its resource lifecycle intact.
export function full(old=false,capture=()=>null){const b=new(old?ParentZoneBase:ZoneBase)(library(),data),finish=b.kit.finish.bind(b.kit);let before;b.kit.finish=()=>{b.kit.root.updateMatrixWorld(true);before=capture(b.kit.root);return finish()};const built=b.build();built.group.updateMatrixWorld(true);return{b,built,before,dispose:()=>b.dispose()};}
