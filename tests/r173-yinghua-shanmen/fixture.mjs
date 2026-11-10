import fs from 'node:fs';
import {fixture,T} from '../r163-yinghua-stele/fixture.mjs';
import {buildYinghuaShanmen} from '../../src/scene/palace/special/YinghuaShanmen.js';
import {buildYinghuaGate} from '../../src/scene/palace/special/YinghuaGate.js';
import {buildYinghuaWestEarCourtWalls} from '../../src/scene/palace/special/YinghuaWestEarHall.js';
import {buildYinghuaStelePavilion} from '../../src/scene/palace/special/YinghuaStelePavilion.js';
import {CollisionManager} from '../../src/utils/Collision.js';
export {T};
export const zone=JSON.parse(fs.readFileSync(new URL('../../data/zones/outer-west.json',import.meta.url)));
export function topologyFixture(){const f=fixture();try{
 const h39=buildYinghuaShanmen(f.kit,zone);buildYinghuaGate(f.kit,zone.items[41]);buildYinghuaWestEarCourtWalls(f.kit,zone.items[42],'outer-west',h39.width);buildYinghuaStelePavilion(f.kit,zone);
 // The existing Shouan north wall bounds the retained cross-street south side.
 f.kit.wall(256.02,450,297.78,450);
 f.kit.root.updateMatrixWorld(true);const cm=new CollisionManager();cm.addColliders(f.kit.colliders);cm.addWalkables(f.kit.walkables);
 return{...f,h39,cm,THREE:T};
 }catch(e){f.dispose();throw e;}}
