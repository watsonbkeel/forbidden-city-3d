import * as THREE from 'three';
import {PalaceBuilder} from '../../src/scene/PalaceBuilder.js';
import {CourtKit} from '../../src/scene/palace/kit.js';
import {PALACE_LAYOUT} from '../../src/scene/Layout.js';
import {CollisionManager} from '../../src/utils/Collision.js';
import {buildSurveyedPavilion} from '../../src/scene/palace/special/SurveyedPavilion.js';
import {library} from './inner-palace-fixture.mjs';
import axis from '../../data/zones/axis-courts.json' with {type:'json'};
export function bPracticalFixture(){
 const scene=new THREE.Scene(),lib=library(),b=new PalaceBuilder(scene,lib),kits=[],groups=[];
 b.buildAll(PALACE_LAYOUT.filter(h=>['太和殿','中和殿','保和殿'].includes(h.name)));groups.push({id:'three-halls',walkables:b.walkables});
 for(const id of['tiren','hongyi']){const kit=new CourtKit(lib),opts=axis.items.find(p=>p.kind==='hall'&&p.pavilionProfile===id);buildSurveyedPavilion(kit,opts);scene.add(kit.finish());kits.push(kit);groups.push({id,walkables:kit.walkables});}
 const cm=new CollisionManager();cm.rivers=[];cm.addColliders(b.colliders);cm.addWalkables(b.walkables);for(const k of kits){cm.addColliders(k.colliders);cm.addWalkables(k.walkables);}scene.updateMatrixWorld(true);
 return{THREE,scene,b,cm,groups,dispose(){b.dispose();for(const k of kits)k.dispose();}};
}
