import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {createR157FrozenSourceReader} from '../../../lib/r157-frozen-source-reader.mjs';
const root=new URL('../../../../',import.meta.url);
const reader=createR157FrozenSourceReader(new URL(root).pathname,'929e346745b7295ad1aae0caa581e8cdf22723ff');
const path='src/scene/palace/special/WuyingThreeBridgeRails.js';
const encode=s=>'data:text/javascript;base64,'+Buffer.from(s).toString('base64');
const absolute=(s,url)=>s.replace(/(from\s*['"])(\.[^'"]+)(['"])/g,(_,a,x,b)=>a+new URL(x,url).href+b).replace(/from\s*(['"])three\1/g,"from '"+import.meta.resolve('three')+"'");
export const parentRailURL=encode(absolute(reader.read(path),new URL(path,root)));
export const parentRails=await import(parentRailURL);
// Parent 3e9d5c92 uses this exact shared water source and includes the accepted
// Wenyuan rail hook. Only Wuying's original module is frozen for comparison.
const waterURL=new URL('src/scene/palace/special/SouthWaterSystem.js',root),water=fs.readFileSync(waterURL,'utf8');
const blob=s=>createHash('sha1').update(`blob ${Buffer.byteLength(s)}\0`).update(s).digest('hex');
export const parentWaterSourceBlob=blob(water);
// Pin every local dependency in the shared water import closure as well.
// A changed shared helper must not affect BOTH sides and hide a new regression.
const unchanged={
 'src/scene/palace/special/SouthWaterSystem.js':'5d5aca516f788c98680efce2aa0cfc1757031db9',
 'src/utils/MergeUtils.js':'4c64f078bedb8f627e0aff183a496ac37657b965',
 'src/utils/GeometryUV.js':'71e24ad313e878569bd13fca1a8536461c933d8b',
 'src/scene/palace/special/InnerJinshui.js':'4de5b407e51fe74ba0011f51160a743ffc62bbaf',
 'src/scene/palace/river.js':'f13fba3ed826aab035a6128c669488aa386042ed',
 'src/scene/palace/special/InnerJinshuiBridge2Contact.js':'98d92242961e5a420d7c46ffb1babe0ea115ce5f',
 'src/utils/TriangleSupport.js':'a08f0c1c7ad43f21d29d4fbbee177babc0610886',
 'src/scene/palace/special/WenyuanPondBridgeRails.js':'068d87e093a06a46fc1e3b31aeeb4b94b38df911',
};
for(const [name,expected]of Object.entries(unchanged))if(blob(fs.readFileSync(new URL(name,root),'utf8'))!==expected)throw Error('Wuying unchanged parent dependency drift: '+name);
export const parentWater=await import(encode(absolute(water,waterURL).replace(new URL(path,root).href,parentRailURL)));
