// Uses this checkout's real host, with ONLY our optional integration hook removed.
// No historical Git dependency; still exercises actual CourtKit and merge paths.
import fs from 'node:fs';
import * as THREE from 'three';
import {CourtKit} from '../../src/scene/palace/kit.js';
import {library} from './inner-palace-fixture.mjs';
const url=new URL('../../src/scene/palace/special/EnclosedPavilions.js',import.meta.url);
const source=fs.readFileSync(url,'utf8').replace(/if\(key==='arrow'\)applyArrowSouthDoorLattice\(kit,f,item\);/g,'').replace(/if\(key==='arrow'\)removeArrowUnsupportedCentralNameboard\(kit,f,item\);/g,'');
const resolved=source.replace(/from\s+(['"])([^'"]+)\1/g,(_,q,id)=>`from ${q}${id==='three'?import.meta.resolve('three'):new URL(id,url).href}${q}`);
const {buildEnclosedPavilion}=await import('data:text/javascript;base64,'+Buffer.from(resolved).toString('base64'));
export const item=JSON.parse(fs.readFileSync(new URL('../../data/zones/outer-east.json',import.meta.url))).items.find(x=>x.name==='箭亭');
export function fixture(lib=library()){const kit=new CourtKit(lib),{f:frame}=buildEnclosedPavilion(kit,item);kit.root.updateMatrixWorld(true);return{kit,frame,item,THREE,dispose:()=>kit.dispose(kit.root)};}
