import fs from 'node:fs';
import {createHash} from 'node:crypto';
export * from '../lib/r59-wenhua-gate-window-fixture.mjs';
import {fixture,api} from '../lib/r59-wenhua-gate-window-fixture.mjs';
const source=fs.readFileSync(new URL('./before.js.txt',import.meta.url),'utf8');
export const beforeSHA=createHash('sha256').update(source).digest('hex');
if(beforeSHA!=='869cddf6f1454e4e7e2feb0f37723649dc903380c793bb39ba7fe34172519be5')throw Error('Frozen 856421 baseline changed');
const old=await import('data:text/javascript;base64,'+Buffer.from(source.replace("from 'three'",`from '${import.meta.resolve('three')}'`)).toString('base64'));
export function built(state='after'){const f=fixture();(state==='before'?old:api).applyWenhuaGateSouthWindows(f.kit,f.frame);return f;}
