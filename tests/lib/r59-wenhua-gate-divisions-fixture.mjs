import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fixture,meshes,row,hash} from './r59-wenhua-gate-window-fixture.mjs';
const bytes=readFileSync(new URL('../fixtures/r59-wenhua-gate-window/WenhuaGateSouthWindows.coarse.js.txt',import.meta.url));
const digest=createHash('sha256').update(bytes).digest('hex');
const provenance=JSON.parse(readFileSync(new URL('../fixtures/r59-wenhua-gate-window/coarse-provenance.json',import.meta.url)));
if(digest!=='7af1a0d7138996d413bc484ffd203b43ba96723623ae9a2775dbfe9a0b31ef6c'||digest!==provenance.sha256)throw Error('Wenhua coarse helper fixture SHA-256 mismatch');
const source=bytes.toString('utf8').replace("from 'three'",`from '${import.meta.resolve('three')}'`);
const coarseAPI=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
export function coarseFixture(){const f=fixture();if(!coarseAPI.applyWenhuaGateSouthWindows(f.kit,f.frame))throw Error('Coarse fixture refused');f.frame.updateMatrixWorld(true);return f;}
export const divisions=f=>meshes(f.frame).filter(m=>m.userData.wenhuaGateSouthWindow?.role==='red-major-division');
export const retainedCoarseHash=f=>hash(meshes(f.frame).filter(m=>m.userData.wenhuaGateSouthWindow?.role!=='red-major-division').map(row));
