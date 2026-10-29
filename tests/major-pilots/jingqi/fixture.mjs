import fs from 'node:fs';import {CourtKit} from '../../../src/scene/palace/kit.js';import {library} from '../../lib/inner-palace-fixture.mjs';import {resolveRemainingProfile,buildRemainingHall} from '../../../src/scene/palace/special/RemainingNingshouHalls.js';
const items=JSON.parse(fs.readFileSync('data/zones/ningshou.json')).items;
export function make(enabled=true,name='景祺阁'){const item=items.find(q=>q.name===name),kit=new CourtKit(library(),'ningshou');kit.jingqiSouthGallery=enabled;const p=resolveRemainingProfile('ningshou',item);return{kit,p,...buildRemainingHall(kit,item,p)}}
