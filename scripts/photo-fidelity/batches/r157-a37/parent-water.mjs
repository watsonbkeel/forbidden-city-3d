// Read-only exact safe-parent module; no checkout or mutation of live sources.
import{execFileSync}from'node:child_process';
const url=new URL('../../../../src/scene/palace/special/SouthWaterSystem.js',import.meta.url),source=execFileSync('git',['show','e14c61911844e7aa6ce7c0251e64fd0ad61e67f4:src/scene/palace/special/SouthWaterSystem.js'],{encoding:'utf8'}),absolute=source.replace(/(from\s+['"])(\.[^'"]+)(['"])/g,(_,a,s,b)=>a+new URL(s,url).href+b).replace("from 'three'","from '"+import.meta.resolve('three')+"'");
export const parentWater=await import('data:text/javascript;base64,'+Buffer.from(absolute).toString('base64'));
