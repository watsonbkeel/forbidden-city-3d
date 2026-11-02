import fs from 'node:fs';
import '../lib/inner-palace-fixture.mjs';
import {ZoneBase} from '../../src/scene/zones/ZoneBase.js';
import {realTextureLibrary} from '../lib/r48-real-texture-library.mjs';
const data=JSON.parse(fs.readFileSync(new URL('../../data/zones/outer-west.json',import.meta.url)));
const item=data.items.find(i=>i.southCourtProfile==='wuying-front');
export function fixture(lib=realTextureLibrary()){const z=new ZoneBase(lib,data);z.buildGate(data.items.find(i=>i.southGateProfile==='wuying'));z.buildHall(item);z.kit.root.updateMatrixWorld(true);return{lib,z};}
