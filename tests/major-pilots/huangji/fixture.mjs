import fs from 'node:fs';import {CourtKit} from '../../../src/scene/palace/kit.js';import {library} from '../../lib/inner-palace-fixture.mjs';import {resolveRemainingProfile,augmentRemainingHall} from '../../../src/scene/palace/special/RemainingNingshouHalls.js';
const item=JSON.parse(fs.readFileSync('data/zones/ningshou.json')).items.find(q=>q.name==='皇极殿');
export function make(enabled=true){const kit=new CourtKit(library(),'ningshou');kit.huangjiSouthFront=enabled;const p=resolveRemainingProfile('ningshou',item);return{kit,p,...augmentRemainingHall(kit,item,kit.hall(item),p)}}
