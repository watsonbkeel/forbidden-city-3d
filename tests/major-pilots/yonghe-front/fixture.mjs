import fs from'node:fs';import{execFileSync}from'node:child_process';import{ZoneBase}from'../../../src/scene/zones/ZoneBase.js';import{library}from'../../lib/inner-palace-fixture.mjs';
export const data=JSON.parse(fs.readFileSync(new URL('../../../data/zones/east-six.json',import.meta.url))),item=data.items.find(i=>i.name==='永和宫');
const base='ddb9bc8781366823e0bf12b7d5d8d5dced26b1b0',ownerPath='src/scene/palace/special/EastResidentialFacades.js',zonePath='src/scene/zones/ZoneBase.js';
function sourceURL(path,overrides={}){const url=new URL('../../../'+path,import.meta.url),source=execFileSync('git',['show',base+':'+path],{encoding:'utf8'}).replace(/from\s+(['"])([^'"]+)\1/g,(_,q,s)=>'from '+q+(overrides[s]??(s.startsWith('.')?new URL(s,url).href:import.meta.resolve(s)))+q);return'data:text/javascript;base64,'+Buffer.from(source).toString('base64');}
const ownerURL=sourceURL(ownerPath);export const {ZoneBase:ParentZoneBase}=await import(sourceURL(zonePath,{'../palace/special/EastResidentialFacades.js':ownerURL}));
export function make(old=false,lib=library()){const b=new(old?ParentZoneBase:ZoneBase)(lib,data),r=b.buildHall(item);b.kit.root.updateMatrixWorld(true);return{b,kit:b.kit,...r,dispose:()=>b.kit.dispose(b.kit.root)}}
// Capture ordinary sources before the REAL finish. East-six then installs its
// real Yanxi LOD; never stub finish or invent the architecture array it needs.
export function full(old=false,capture=()=>null){const b=new(old?ParentZoneBase:ZoneBase)(library(),data),finish=b.kit.finish.bind(b.kit);let before;b.kit.finish=()=>{b.kit.root.updateMatrixWorld(true);before=capture(b.kit.root);return finish()};const built=b.build();built.group.updateMatrixWorld(true);return{b,built,before,dispose:()=>b.dispose()};}
