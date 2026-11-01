import {fixture,world,dispose,THREE} from './fixture.mjs';
const {furnitureScope,furnitureContact,furnitureBodySweep}=await import('../../../../src/controls/FurnitureMotion.js');
const f=fixture(true);world(f,true);const x=f.g.x,z=f.g.z+13.35,point=new THREE.Vector3(x,0,z),ground=f.cm.getGroundHeight(x,z,0),contact=furnitureContact(f.cm,x,z,2,.5),feet=new THREE.Vector3(x,ground,z);
process.stdout.write(JSON.stringify({kind:'REAL_GATE_WITH_PRODUCTION_HOOKS_PRESENT_BEFORE_MUTATION',scope:furnitureScope(f.cm,point,point,.5),ground,fullFootHeight:contact.surface.height,groundPoseClear:!furnitureBodySweep(f.cm,feet,feet,.5)}));dispose(f);
