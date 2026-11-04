import fs from'node:fs';
const stepOrigin=new URL('../../src/scene/palace/special/SuichuSouthSteps.js',import.meta.url),stepSource=fs.readFileSync(new URL('./frozen/SuichuSouthSteps.1f6.js',import.meta.url),'utf8');
const stepLocated=stepSource.replace(/from\s*(['"])([^'"]+)\1/g,(_,q,p)=>'from '+JSON.stringify(p.startsWith('.')?new URL(p,stepOrigin).href:import.meta.resolve(p)));
export const stepURL='data:text/javascript;base64,'+Buffer.from(stepLocated).toString('base64');
const origin=new URL('../../src/scene/palace/special/RemainingNingshouHalls.js',import.meta.url),source=fs.readFileSync(new URL('./frozen/RemainingNingshouHalls.1f6.js',import.meta.url),'utf8');
const located=source.replace(/from\s*(['"])([^'"]+)\1/g,(_,q,p)=>'from '+JSON.stringify(p.endsWith('/SuichuSouthSteps.js')?stepURL:p.startsWith('.')?new URL(p,origin).href:import.meta.resolve(p)));
export const beforeURL='data:text/javascript;base64,'+Buffer.from(located).toString('base64');
export const beforeAPI=await import(beforeURL);

const zoneOrigin=new URL('../../src/scene/zones/ZoneBase.js',import.meta.url),zoneSource=fs.readFileSync(new URL('./frozen/ZoneBase.1f6.js',import.meta.url),'utf8');
const zoneLocated=zoneSource.replace(/^(import[^\n]*?from)\s*(['"])([^'"]+)\2/gm,(_,pre,q,p)=>pre+' '+JSON.stringify(p.endsWith('/RemainingNingshouHalls.js')?beforeURL:p.startsWith('.')?new URL(p,zoneOrigin).href:import.meta.resolve(p)));
export const{ZoneBase:BeforeZone}=await import('data:text/javascript;base64,'+Buffer.from(zoneLocated).toString('base64'));
