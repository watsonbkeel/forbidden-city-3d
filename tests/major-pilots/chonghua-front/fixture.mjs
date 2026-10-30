import fs from'node:fs';import{execFileSync}from'node:child_process';import{ZoneBase}from'../../../src/scene/zones/ZoneBase.js';import{library}from'../../lib/inner-palace-fixture.mjs';
export const data=JSON.parse(fs.readFileSync(new URL('../../../data/zones/west-six.json',import.meta.url))),item=data.items.find(i=>i.name==='重华宫');
const base='b1763cba2002d0f8b7f5cb1a4266a4a995338075',ownerPath='src/scene/palace/special/RemainingResidentialHalls.js',zonePath='src/scene/zones/ZoneBase.js';
function sourceURL(path,overrides={}){const url=new URL('../../../'+path,import.meta.url),source=execFileSync('git',['show',base+':'+path],{encoding:'utf8'}).replace(/from\s+(['"])([^'"]+)\1/g,(_,q,s)=>'from '+q+(overrides[s]??(s.startsWith('.')?new URL(s,url).href:import.meta.resolve(s)))+q);return'data:text/javascript;base64,'+Buffer.from(source).toString('base64');}
const ownerURL=sourceURL(ownerPath);export const {ZoneBase:ParentZoneBase}=await import(sourceURL(zonePath,{'../palace/special/RemainingResidentialHalls.js':ownerURL}));
export function make(old=false,lib=library()){const b=new(old?ParentZoneBase:ZoneBase)(lib,data),r=b.buildHall(item);b.kit.root.updateMatrixWorld(true);return{b,kit:b.kit,...r,dispose:()=>b.kit.dispose(b.kit.root)}}
// Capture ordinary sources before the REAL finish. East-six then installs its
// real Yanxi LOD; never stub finish or invent the architecture array it needs.
export function full(old=false,capture=()=>null){const b=new(old?ParentZoneBase:ZoneBase)(library(),data),finish=b.kit.finish.bind(b.kit);let before;b.kit.finish=()=>{b.kit.root.updateMatrixWorld(true);before=capture(b.kit.root);return finish()};const built=b.build();built.group.updateMatrixWorld(true);return{b,built,before,dispose:()=>b.dispose()};}
