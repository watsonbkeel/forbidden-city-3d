import fs from 'node:fs';
function moduleURL(file, original, overrides={}){let text=fs.readFileSync(new URL('./frozen/'+file,import.meta.url),'utf8');text=text.replace(/from\s*(['"])([^'"]+)\1/g,(_,q,spec)=>{const target=overrides[spec]??(spec==='three'?new URL('../../node_modules/three/build/three.module.js',import.meta.url).href:spec.startsWith('.')?new URL(spec,new URL('../../'+original,import.meta.url)).href:spec);return 'from '+JSON.stringify(target)});return 'data:text/javascript;base64,'+Buffer.from(text).toString('base64')}
const kit=moduleURL('kit.js','src/scene/palace/kit.js'),zone=moduleURL('ZoneBase.js','src/scene/zones/ZoneBase.js',{'../palace/kit.js':kit});
export const {ZoneManager:BeforeManager}=await import(moduleURL('ZoneManager.js','src/scene/zones/ZoneManager.js',{'./ZoneBase.js':zone}));
export const {ZoneBase:BeforeZone}=await import(zone);
