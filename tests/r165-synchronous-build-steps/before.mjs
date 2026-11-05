import fs from 'node:fs';
let s=fs.readFileSync(new URL('./frozen/ZoneBase.5030.js',import.meta.url),'utf8');
s=s.replace(/from\s*(['"])([^'"]+)\1/g,(_,q,p)=>'from '+JSON.stringify(p==='three'?new URL('../../node_modules/three/build/three.module.js',import.meta.url).href:p.startsWith('.')?new URL(p,new URL('../../src/scene/zones/ZoneBase.js',import.meta.url)).href:p));
export const {ZoneBase:BeforeZone}=await import('data:text/javascript;base64,'+Buffer.from(s).toString('base64'));
