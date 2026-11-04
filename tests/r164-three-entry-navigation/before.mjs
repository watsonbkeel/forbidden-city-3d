import{stepURL as suichuBeforeURL}from'../r164-suichu-platform-contact/before.mjs';
import fs from'node:fs';
const origin=new URL('../../src/scene/palace/special/RemainingNingshouHalls.js',import.meta.url),source=fs.readFileSync(new URL('./frozen/RemainingNingshouHalls.d84.js',import.meta.url),'utf8');
const located=source.replace(/from\s*(['"])([^'"]+)\1/g,(_,q,p)=>'from '+JSON.stringify(p.endsWith('/SuichuSouthSteps.js')?suichuBeforeURL:p.startsWith('.')?new URL(p,origin).href:import.meta.resolve(p)));
export const beforeURL='data:text/javascript;base64,'+Buffer.from(located).toString('base64');
export const beforeAPI=await import(beforeURL);

const zoneOrigin=new URL('../../src/scene/zones/ZoneBase.js',import.meta.url),zoneSource=fs.readFileSync(new URL('./frozen/ZoneBase.d84.js',import.meta.url),'utf8');
const zoneLocated=zoneSource.replace(/^(import[^\n]*?from)\s*(['"])([^'"]+)\2/gm,(_,pre,q,p)=>pre+' '+JSON.stringify(p.endsWith('/RemainingNingshouHalls.js')?beforeURL:p.startsWith('.')?new URL(p,zoneOrigin).href:import.meta.resolve(p)));
export const{ZoneBase:BeforeZone}=await import('data:text/javascript;base64,'+Buffer.from(zoneLocated).toString('base64'));
