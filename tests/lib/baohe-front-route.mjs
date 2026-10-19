import * as THREE from 'three';
import {PalaceBuilder} from '../../src/scene/PalaceBuilder.js';
import {PALACE_LAYOUT} from '../../src/scene/Layout.js';
import {library} from './inner-palace-fixture.mjs';

/** Test-route placement from the actual visible/collidable front leaves.
 * The driver may declare arrival0.8m before a waypoint. Include that unchanged
 * tolerance as well as the real player radius and a0.25m geometric clearance.
 * No product geometry, collision or driver behavior is changed here. */
export function captureBaoheFrontCrossing() {
  const b=new PalaceBuilder(new THREE.Scene(),library()),g=new THREE.Group();
  try {
    const hall=PALACE_LAYOUT.find(h=>h.name==='保和殿');
    b.buildHall(g,hall,9,{heightReferenceY:10});g.updateMatrixWorld(true);
    const leaves=g.children.filter(m=>m.userData.baoheFrontDoor);
    if(leaves.length!==12)throw Error('Expected all12 registered Baohe front leaves');
    const boxes=leaves.map(m=>new THREE.Box3().setFromObject(m));
    const northmost=Math.max(...boxes.map(box=>box.max.z));
    const playerRadius=.5,arrivalTolerance=.8,clearance=.25;
    const crossZ=Math.ceil((northmost+playerRadius+arrivalTolerance+clearance)*10)/10;
    return {northmost,playerRadius,arrivalTolerance,clearance,crossZ,leafCount:leaves.length};
  } finally {g.traverse(o=>o.geometry?.dispose());b.dispose();}
}
