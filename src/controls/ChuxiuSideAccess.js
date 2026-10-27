import {createXiqingSurface} from './XiqingRoofSurface.js';
import * as THREE from 'three';
import {CHUXIU_MAIN_Z,chuxiuShiftedZ} from '../scene/palace/special/ChuxiuRearCourtFrame.js';
/** Two original ordinary side-wall owners, only the front platform turn.
 * Existing visible platform/floor ownership only; no new geometry or solver math. */
export const CHUXIU_SIDE_IDS=Object.freeze(['chuxiu-east-side-turn','chuxiu-west-side-turn']);
export function registerChuxiuSideAccess(kit,zone){
 if(zone.id!=='west-six'||!zone.items?.[25]?.positionFit)return;
 const main=zone.items[23];if(main.name!=='储秀宫'||main.x!==94.8||main.z!==CHUXIU_MAIN_Z||main.w!==27.1||main.d!==13.8||main.ph!==.6)throw Error('Chuxiu side interface main source mismatch');
 const targets=[{id:CHUXIU_SIDE_IDS[0],x0:80.89999999999999,x1:81.6,lo:79.3,hi:82},{id:CHUXIU_SIDE_IDS[1],x0:108,x1:108.7,lo:107.6,hi:110.3}];
 const rows=targets.map(t=>{const matches=kit.colliders.filter(b=>b.isBox3&&b.min.x===t.x0&&b.max.x===t.x1&&b.min.z===chuxiuShiftedZ(429.3)&&b.max.z===chuxiuShiftedZ(441.2)&&b.min.y===.6000000000000001&&b.max.y===6.5136);if(matches.length!==1||matches[0].furnitureMotionScope)throw Error('Chuxiu side interface exact owner mismatch');return{...t,b:matches[0]}});
 // R123 side-to-rear circulation consumes the original visible platform.
 // Its double proxy is lower/narrower than finished F32 faces. Register only
 // those two existing closed boxes, without altering their rendered geometry.
 const frames=kit.root.children.filter(f=>f.userData.structure?.id==='west-six/chuxiu-household');if(frames.length!==1)throw Error('Missing actual Chuxiu frame');
 const f=frames[0],specs=[['wall_brick',.3,[28.7,.6,15.4]],['stone_slab',.6-.03,[28.82,.08,15.52]]];
 const platform=specs.map(([key,y,size])=>{const a=f.children.filter(m=>m.isMesh&&m.material===kit.lib.material(key)&&m.position.x===0&&m.position.y===y&&m.position.z===0&&m.rotation.x===0&&m.rotation.y===0&&m.rotation.z===0&&m.scale.x===1&&m.scale.y===1&&m.scale.z===1);if(a.length!==1)throw Error('Missing unique Chuxiu platform source');const m=a[0];m.geometry.computeBoundingBox();if(!m.geometry.boundingBox.min.toArray().every((v,i)=>v===-Math.fround(size[i]/2))||!m.geometry.boundingBox.max.toArray().every((v,i)=>v===Math.fround(size[i]/2)))throw Error('Chuxiu platform geometry changed');m.updateWorldMatrix(true,false);const p=m.geometry.attributes.position,points=[];for(let i=0;i<p.count;i++){const v=new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(m.matrixWorld);points.push(v.set(Math.fround(v.x),Math.fround(v.y),Math.fround(v.z)));}const b=new THREE.Box3().setFromPoints(points);b.chuxiuRetainedPlatform={source:'existing-visible-main-platform',material:key,itemIndex:23};return b;});
 // The original visible hall floor is a two-triangle OPEN sheet at .62,
 // not the stone slab top .61. Reuse the bounded actual-surface solver.
 const floors=f.children.filter(m=>m.isMesh&&m.material===kit.floorMat&&m.position.x===0&&m.position.z===0&&m.position.y===.62);
 if(floors.length!==1)throw Error('Chuxiu actual floor missing');
 const floor=floors[0],p=floor.geometry.attributes.position,ix=floor.geometry.index;
 const canonical=new THREE.PlaneGeometry(27.1,13.8);canonical.rotateX(-Math.PI/2);
 const intact=p.count===4&&ix?.count===6&&p.array.every((v,i)=>v===canonical.attributes.position.array[i])&&ix.array.every((v,i)=>v===canonical.index.array[i]);canonical.dispose();
 if(!intact)throw Error('Chuxiu actual floor faces changed');
 floor.updateWorldMatrix(true,false);const faces=[];
 for(let i=0;i<6;i+=3)faces.push({source:{mesh:0,triangle:i/3},vertices:[0,1,2].map(j=>{const v=new THREE.Vector3().fromBufferAttribute(p,ix.getX(i+j)).applyMatrix4(floor.matrixWorld);return v.set(Math.fround(v.x),Math.fround(v.y),Math.fround(v.z));})});
 const surface=createXiqingSurface(faces,'chuxiu-main-floor'),floorOwner=surface.box.clone();floorOwner.xiqingRoofSurface=surface;
 kit.colliders.push(...platform,floorOwner);
 for(const t of rows)t.b.furnitureMotionScope={kind:'chuxiu-side-access',id:t.id,groundY:0,minOffsetX:t.lo-t.b.min.x,maxOffsetX:t.hi-t.b.min.x,minOffsetZ:chuxiuShiftedZ(427.8)-t.b.min.z,maxOffsetZ:437.7-t.b.min.z};
}
