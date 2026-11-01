import fs from 'node:fs';import crypto from 'node:crypto';
const target="file:///workspace/scratch/02a8023d1a85/r157-restored-411214/src/scene/palace/special/WumenLowerBase.js";
const source=fs.readFileSync(new URL('./LowerBase-db1.txt',import.meta.url),'utf8');
if(crypto.createHash('sha256').update(source).digest('hex')!=='7ae6df03668ff6e6a1a655e714922a615985954283681cbb7ac6aa2602b0ec4a')throw Error('bad predecessor');
export async function load(url,context,next){if(url===target)return {format:'module',source,shortCircuit:true};return next(url,context);}
