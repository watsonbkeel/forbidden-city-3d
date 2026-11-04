import fs from'node:fs';
const origin=new URL('../../src/scene/palace/special/RemainingNingshouHalls.js',import.meta.url),source=fs.readFileSync(new URL('./frozen/RemainingNingshouHalls.ee19.js',import.meta.url),'utf8');
const located=source.replace(/from\s*(['"])([^'"]+)\1/g,(_,q,p)=>'from '+JSON.stringify(p.startsWith('.')?new URL(p,origin).href:import.meta.resolve(p)));
export const beforeAPI=await import('data:text/javascript;base64,'+Buffer.from(located).toString('base64'));
