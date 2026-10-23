// Actual geometry export for CPU diagnostics. No browser/WebGL evaluation.
import {readFileSync,writeFileSync} from 'node:fs';
import * as THREE from 'three';
import {CourtKit} from '../../src/scene/palace/kit.js';
import {library} from '../lib/inner-palace-fixture.mjs';
import {augmentRemainingHall,resolveRemainingProfile} from '../../src/scene/palace/special/RemainingResidentialHalls.js';
import {YANGXIN_WEST_ROOM_PLAN as plan} from '../../src/scene/palace/special/YangxinWestWarmRooms.js';
import {actualYangxinRoot} from './glb-fixture.mjs';
const item=JSON.parse(readFileSync(new URL('../../docs/current-state/r48-remaining/residential-scope.json',import.meta.url))).find(r=>r.name==='养心殿').baselineItem;
const kit=new CourtKit(library(),'west-six'),b=kit.hall(item);augmentRemainingHall(kit,item,b,resolveRemainingProfile('west-six',item));const glb=await actualYangxinRoot();glb.position.set(0,item.ph,0);b.f.add(glb);kit.root.updateWorldMatrix(true,true);
const triangles=[],boxes=[];const origin=new THREE.Vector3(item.x,0,item.z);
b.f.traverse(m=>{if(!m.isMesh||!m.material||!m.visible||/^(COL_|WALK_)/.test(m.name))return;const white=m.material.name?.startsWith('r53-'),color=white?`#${m.material.color.getHexString()}`:'#b6b4ad';const p=m.geometry.attributes.position,idx=m.geometry.index,n=idx?.count??p.count;for(let i=0;i<n;i+=3){const v=[0,1,2].map(j=>new THREE.Vector3().fromBufferAttribute(p,idx?idx.getX(i+j):i+j).applyMatrix4(m.matrixWorld).sub(origin).toArray());triangles.push({v,color,side:m.material.side,name:m.name,white});}if(white){const box=new THREE.Box3().setFromObject(m).translate(origin.clone().negate());boxes.push({name:m.name,min:box.min.toArray(),max:box.max.toArray()});}});
writeFileSync(process.argv[2]??'/tmp/r53-yangxin-geometry.json',JSON.stringify({triangles,boxes,plan,item,counts:{meshes:boxes.length,colliders:kit.colliders.length,walkables:kit.walkables.length,whiteTriangles:triangles.filter(t=>t.white).length}}));
