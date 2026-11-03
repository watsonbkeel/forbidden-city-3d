import fs from 'node:fs';
import {createCanvas} from '@napi-rs/canvas';
import * as T from 'three';
import {CourtKit} from '../../src/scene/palace/kit.js';
import {createActualLibrary} from '../r158-cumulative-1600/library.mjs';
export {T};
globalThis.document??={createElement:()=>createCanvas(1,1)};
export const zone=JSON.parse(fs.readFileSync(new URL('../../data/zones/outer-west.json',import.meta.url)));
export function fixture(){const r=createActualLibrary(),kit=new CourtKit(r.library,'outer-west');return {kit,lib:r.library,dispose(){for(const k of ['colliders','walkables'])if(Object.isFrozen(kit[k]))kit[k]=[];kit.dispose(kit.root);r.dispose()}};}
