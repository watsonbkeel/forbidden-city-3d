import * as THREE from 'three';
import {meshFingerprint} from './gate-tower-fixture.mjs';
import {buildWumenSouthPortalCanopies} from '../../src/scene/palace/special/WumenSouthPortalCanopies.js';
const options=c=>({openings:[{x:-17.5,w:5},{x:0,w:9},{x:17.5,w:5}],southZ:c.data.dimensions.platformSouth,platformHeight:c.data.dimensions.platformHeight});
/** Exact scoped layer recognition, no changes to input objects or physics. */
export function wumenSouthCanopyStages(input){
 const before={...input,group:input.group.clone(true)},expected=new THREE.Group();
 const canopy=buildWumenSouthPortalCanopies({library:input.lib},expected,options(input));
 const existing=before.group.children.filter(c=>c.name==='wumen-south-three-canopies');
 if(existing.length>1)throw new Error('Duplicate Wumen south canopy layer');
 if(existing.length){
  if(meshFingerprint(existing[0])!==meshFingerprint(canopy)||JSON.stringify(existing[0].userData)!==JSON.stringify(canopy.userData))throw new Error('Unrecognized Wumen south canopy delta');
  before.group.remove(existing[0]);
 }
 const after={...before,group:before.group.clone(true)};after.group.add(canopy);
 before.group.updateMatrixWorld(true);after.group.updateMatrixWorld(true);return {before,after};
}
