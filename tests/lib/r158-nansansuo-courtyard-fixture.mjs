// Component source fixture, deliberately not the installed ZoneBase.build path.
// Uses the actual retained item10/11/12..17 dispatch and front-tail adapter, so
// future ordinary-entry gate hooks do not recursively apply this candidate.
import fs from 'node:fs';import {ZoneBase} from '../../src/scene/zones/ZoneBase.js';import {createActualLibrary} from '../r158-cumulative-1600/library.mjs';import {finishNansansuoFrontHalls} from '../../src/scene/palace/special/NansansuoFrontFinalizer.js';
const source=JSON.parse(fs.readFileSync(new URL('../../data/zones/outer-east.json',import.meta.url)));
export function retainedNansansuoFixture(mutate){const d=structuredClone(source),lib=createActualLibrary(),z=new ZoneBase(lib.library,d);z.gateWidths.set(d.items[10].name,z.buildGate(d.items[10]));z.buildCourtWalls(d.items[11]);for(const i of[12,13,14,15,16,17])z.buildHall(d.items[i]);finishNansansuoFrontHalls(z.kit,d);mutate?.(z.kit,d);return{d,z,k:z.kit,dispose(){z.kit.dispose(z.kit.root);lib.dispose()}};}
