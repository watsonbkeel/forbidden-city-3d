import fs from'node:fs';
function located(file,origin,replace={}){return fs.readFileSync(new URL(file,import.meta.url),'utf8').replace(/^(import[^\n]*?from)\s*(['"])([^'"]+)\2/gm,(_,pre,q,p)=>pre+' '+JSON.stringify(replace[p]??(p.startsWith('.')?new URL(p,origin).href:import.meta.resolve(p))))}
const data=s=>'data:text/javascript;base64,'+Buffer.from(s).toString('base64');
const frontURL=data(located('./frozen/CuishangSouthFront.f638.js',new URL('../../src/scene/palace/special/CuishangSouthFront.js',import.meta.url)));
export const beforeURL=data(located('./frozen/RemainingNingshouHalls.f638.js',new URL('../../src/scene/palace/special/RemainingNingshouHalls.js',import.meta.url),{'./CuishangSouthFront.js':frontURL}));
export const beforeAPI=await import(beforeURL);
const zone=data(located('./frozen/ZoneBase.f638.js',new URL('../../src/scene/zones/ZoneBase.js',import.meta.url),{'../palace/special/RemainingNingshouHalls.js':beforeURL}));
export const{ZoneBase:BeforeZone}=await import(zone);
