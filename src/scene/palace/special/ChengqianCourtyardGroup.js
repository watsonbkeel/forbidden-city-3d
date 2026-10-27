import * as THREE from 'three';
import {createXiqingSurface} from '../../../controls/XiqingRoofSurface.js';
const FIT='REVERSIBLE_MODEL_FIT_NOT_SURVEYED';
export const CHENGQIAN_COURT_ID='chengqian-west-court-access';
export function chengqianWingHardGable(zone,index,item){
 if(zone!=='east-six'||![11,12].includes(index))return false;
 const x=index===11?-110.08:-77.12,rot=index===11?'west':'east',z=index===11?370.6:367.1;
 if(item.x!==x||item.z!==z||item.rot!==rot||item.w!==11.2||item.d!==7.04||item.ph!==.45||item.pad!==.5||item.roof!=='gable'||item.brackets!==false)throw Error('Chengqian fitted front-wing identity changed');return true;
}
/** Only the root-approved west wing fit maps to its frozen inventory identity.
 * Other fields still undergo the original complete declaration comparison. */
export function chengqianWestWingOriginalDeclaration(item,index){
 if(index!==12||item.x!==-77.12||item.z!==367.1||item.rot!=='east'||item.w!==11.2||item.d!==7.04||item.ph!==.45||item.pad!==.5)throw Error('Chengqian west-wing fitted identity mismatch');
 return {...item,z:370.6};
}
function box(kit,f,mat,x0,y0,z0,x1,y1,z1,name){
 const m=kit.box(f,mat,x1-x0,y1-y0,z1-z0,(x0+x1)/2,(y0+y1)/2,(z0+z1)/2);m.name=name;m.updateWorldMatrix(true,false);const p=m.geometry.attributes.position,points=[];for(let i=0;i<p.count;i++){const v=new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(m.matrixWorld);points.push(v.set(Math.fround(v.x),Math.fround(v.y),Math.fround(v.z)));}const b=new THREE.Box3().setFromPoints(points);kit.colliders.push(b);return {m,b};
}
function roof(kit,f){
 // Closed eight-triangle gable prism: deliberately simplified source-type
 // silhouette, not an invented curved-tile survey or a flat collision stand-in.
 const v=[[-78.4,3.05,379.3],[-78.4,3.05,380.7],[-78.4,3.70,380],[-73.6,3.05,379.3],[-73.6,3.05,380.7],[-73.6,3.70,380]],faces=[[0,1,2],[3,5,4],[0,3,4],[0,4,1],[0,2,5],[0,5,3],[1,4,5],[1,5,2]],center=new THREE.Vector3(-76,3.26,380),positions=[],uv=[];
 for(let ids of faces){let ps=ids.map(i=>new THREE.Vector3(...v[i])),n=new THREE.Vector3().subVectors(ps[1],ps[0]).cross(new THREE.Vector3().subVectors(ps[2],ps[0])),c=ps.reduce((s,p)=>s.add(p),new THREE.Vector3()).multiplyScalar(1/3);if(n.dot(c.sub(center))<0){ps=[ps[0],ps[2],ps[1]];n.negate();}for(const p of ps){positions.push(...p.toArray());uv.push(...(Math.abs(n.x)>Math.abs(n.y)?[p.z,p.y]:[p.x,p.z]));}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();const m=new THREE.Mesh(g,kit.lib.material('roof_tile'));m.name='chengqian-west-court-gable-cap';m.castShadow=m.receiveShadow=true;f.add(m);m.updateWorldMatrix(true,false);
 const p=g.attributes.position,source=[];for(let i=0;i<p.count;i+=3)source.push({source:{mesh:0,triangle:i/3},vertices:[0,1,2].map(j=>new THREE.Vector3().fromBufferAttribute(p,i+j))});const surface=createXiqingSurface(source,'chengqian-west-court-roof'),owner=surface.box.clone();owner.xiqingRoofSurface=surface;kit.colliders.push(owner);
 box(kit,f,'roof_tile',-78.42,3.70,379.94,-73.58,3.80,380.06,'chengqian-west-court-ridge');return surface;
}
function retainedWingPlatform(kit){
 const frames=kit.root.children.filter(f=>f.position.x===-77.12&&f.position.z===367.1&&f.rotation.y===Math.PI/2);if(frames.length!==1)throw Error('Missing actual fitted west wing frame');const f=frames[0],specs=[['wall_brick',.225,[6.1,.225,4.02]],['stone_slab',.45-.03,[6.16,.04,4.08]]],meshes=specs.map(([mat,y,half])=>{const rows=f.children.filter(m=>m.isMesh&&m.material===kit.lib.material(mat)&&m.position.x===0&&m.position.y===y&&m.position.z===0&&m.rotation.x===0&&m.rotation.y===0&&m.rotation.z===0);if(rows.length!==1)throw Error('Missing retained west wing platform source');const m=rows[0];m.geometry.computeBoundingBox();if(!m.geometry.boundingBox.min.toArray().every((v,k)=>v===-Math.fround(half[k]))||!m.geometry.boundingBox.max.toArray().every((v,k)=>v===Math.fround(half[k])))throw Error('West wing platform geometry changed');return m;});
 const walk=kit.walkables.filter(w=>w.type==='box'&&w.box?.min.x===-81.14&&w.box.max.x===-73.10000000000001&&w.box.min.z===361&&w.box.max.z===373.20000000000005&&w.box.max.y===.45);if(walk.length!==1)throw Error('Retained west wing walkable source changed');
 return meshes.map(m=>{m.updateWorldMatrix(true,false);const p=m.geometry.attributes.position,points=[];for(let i=0;i<p.count;i++){const v=new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(m.matrixWorld);points.push(v.set(Math.fround(v.x),Math.fround(v.y),Math.fround(v.z)));}const b=new THREE.Box3().setFromPoints(points);b.chengqianRetainedWingPlatform={source:'existing-visible-west-wing-platform',itemIndex:12};return b;});
}
export function buildChengqianCourtyardGroup(kit,zone){
 if(zone.id!=='east-six')return;const item=zone.items[9];if(item?.name!=='承乾宫'||item.x!==-93.6||item.z!==381.8||item.w!==27.7||item.d!==14.5||item.pad!==.8||item.ph!==.6)throw Error('Chengqian courtyard identity mismatch');
 const frames=kit.root.children.filter(f=>f.userData?.structure?.id==='east-six/r48-chengqian-front');if(frames.length!==1)throw Error('Missing unique retained Chengqian frame');const frame=frames[0];if(frame.userData.chengqianCourtyardGroup)throw Error('Duplicate Chengqian group');
 const ramps=kit.walkables.filter(w=>w.type==='ramp'&&w.axis==='z'&&w.a0===373.75&&w.a1===372.79&&w.minX===-95.89999999999999&&w.maxX===-91.3&&w.y0===.6&&w.y1===0),owners=kit.colliders.filter(b=>b.isBox3&&b.min.x===-108.19999999999999&&b.max.x===-79&&b.min.z===373.8&&b.max.z===389.8&&b.min.y===0&&b.max.y===.6);
 const expected=[[0,.24,-8.17,0],[0,.18,-8.41,0],[0,.12,-8.65,0],[0,.06,-8.89,0],[-2.5,.35,-8.530000000000001,-Math.atan2(.6,.96)],[2.5,.35,-8.530000000000001,-Math.atan2(.6,.96)]];
 const steps=expected.map(([x,y,z,rx])=>{const a=frame.children.filter(m=>m.isMesh&&m.material===kit.lib.material('marble')&&m.position.x===x&&m.position.y===y&&m.position.z===z&&m.rotation.x===rx&&m.rotation.y===0&&m.rotation.z===0);if(a.length!==1)throw Error('Missing exact original stair primitive');return a[0]});
 for(let i=0;i<steps.length;i++){const g=steps[i].geometry;g.computeBoundingBox();const half=i<4?[Math.fround(2.3),Math.fround([.24,.18,.12,.06][i]),Math.fround(.12)]:[Math.fround(.2),Math.fround(.15),Math.fround(Math.hypot(.96,.6)/2)];if(!g.boundingBox.min.toArray().every((v,k)=>v===-half[k])||!g.boundingBox.max.toArray().every((v,k)=>v===half[k]))throw Error('Original stair geometry bounds changed');}
 if(ramps.length!==1||owners.length!==1||new Set(steps).size!==6)throw Error('Original single platform/ramp source mismatch');
 const wingBodies=retainedWingPlatform(kit);
 // R118 registers the original visible wooden threshold, not a new door or
 // invisible lip. Exact item/frame/material/local geometry identity fails closed.
 const wing=kit.root.children.find(f=>f.position.x===-77.12&&f.position.z===367.1&&f.rotation.y===Math.PI/2);
 const thresholds=wing?.children.filter(m=>m.isMesh&&m.material===kit.lib.material('wood_column')&&m.position.x===0&&m.position.y===.56&&m.position.z===-3.52&&m.rotation.x===0&&m.rotation.y===0&&m.rotation.z===0)??[];
 if(thresholds.length!==1)throw Error('Missing unique retained Chengqian threshold');
 const threshold=thresholds[0];threshold.updateWorldMatrix(true,false);const tp=threshold.geometry.attributes.position,tpoints=[];
 for(let i=0;i<tp.count;i++){const v=new THREE.Vector3().fromBufferAttribute(tp,i).applyMatrix4(threshold.matrixWorld);tpoints.push(v.set(Math.fround(v.x),Math.fround(v.y),Math.fround(v.z)));}
 const thresholdBox=new THREE.Box3().setFromPoints(tpoints);
 if(!thresholdBox.min.toArray().every((v,i)=>v===[-80.79000091552734,.44999998807907104,365.4946594238281][i])||!thresholdBox.max.toArray().every((v,i)=>v===[-80.48999786376953,.6700000166893005,368.705322265625][i]))throw Error('Retained Chengqian threshold geometry changed');
 thresholdBox.chengqianThreshold={source:'existing-visible-west-wing-wood-threshold',itemIndex:12};
 // All retained source checks above precede the first mutation.
 const wb=wingBodies[0];wb.furnitureMotionScope={kind:'chengqian-court-access',id:'chengqian-west-wing-entry',groundY:0,environmentGroundHandoff:true,minOffsetX:-83-wb.min.x,maxOffsetX:-79-wb.min.x,minOffsetZ:365.8-wb.min.z,maxOffsetZ:368.4-wb.min.z};
 kit.colliders.push(...wingBodies,thresholdBox);
 for(const m of steps)m.position.z-=1.6;const ramp=ramps[0];for(const key of['minZ','maxZ','a0','a1'])ramp[key]-=1.6;
 const terrace=new THREE.Group();terrace.name='chengqian-central-moon-terrace';terrace.userData={status:FIT,width:23,projection:1.6,source:'https://www.dpm.org.cn/explore/building/236438.html',image:'s5e980b05dbe20.jpg',originalMainPlatformRetained:true};kit.root.add(terrace);
 const brick=box(kit,terrace,'wall_brick',-105.1,0,372.15,-82.1,.6,373.75,'chengqian-moon-terrace-brick');
 // The original brick extends to373.75 but its collider begins373.8. This
 // .05 overlap of old visible brick joins existing engineering bodies, not air.
 brick.b.max.z=owners[0].min.z;
 box(kit,terrace,'stone_slab',-105.16,.53,372.15,-82.04,.61,373.69,'chengqian-moon-terrace-slab');kit.walkBox(terrace,-105.1,372.15,-82.1,373.75,.6);
 const gate=new THREE.Group();gate.name='chengqian-west-court-gate';gate.userData={status:FIT,openingWidth:2,orientation:'WEST_INFERRED_FROM_SOUTH_FACING_OFFICIAL_PHOTO_NOT_COMPASS_METADATA',source:'https://www.dpm.org.cn/explore/building/236438.html',limits:'One fitted side gate only; low-face gable cap, not detailed surveyed tilework or historical open-state.'};kit.root.add(gate);
 const wall=box(kit,gate,'wall_brick',-79.75,0,379.72,-77,.6,380.28,'chengqian-court-wall-west-base');box(kit,gate,'wall_red',-79.75,.6,379.72,-77,2.9,380.28,'chengqian-court-wall-west');box(kit,gate,'wall_brick',-75,0,379.72,-73.16,.6,380.28,'chengqian-court-wall-east-base');box(kit,gate,'wall_red',-75,.6,379.72,-73.16,2.9,380.28,'chengqian-court-wall-east');box(kit,gate,'wood_column',-77,2.45,379.62,-75,3.05,380.38,'chengqian-court-header');
 for(const x of[-77.16,-75])box(kit,gate,'wood_column',x,0,379.62,x+.16,3.05,380.38,'chengqian-court-jamb');
 roof(kit,gate);wall.b.furnitureMotionScope={kind:'chengqian-court-access',id:CHENGQIAN_COURT_ID,groundY:0,environmentGroundHandoff:true,minOffsetX:-81-wall.b.min.x,maxOffsetX:-72.8-wall.b.min.x,minOffsetZ:372.5-wall.b.min.z,maxOffsetZ:383-wall.b.min.z};
 frame.userData.chengqianCourtyardGroup={status:FIT,terraceWidth:23,terraceProjection:1.6,stairMovedZ:-1.6,sideGate:'west-only',source:'https://www.dpm.org.cn/explore/building/236438.html'};
 kit.mapItems.push({kind:'gate',name:'承乾宫西侧院间门',x:-76,z:380,w:2,d:.76,rot:0,sourceStatus:FIT,stableId:CHENGQIAN_COURT_ID});return{terrace,gate};
}
export function bindChengqianTerraceDomain(kit,zone){if(zone.id!=='east-six')return;const owners=kit.colliders.filter(b=>b.furnitureMotionScope?.id==='chengqian-front-stair');if(owners.length!==1)throw Error('Missing retained R109 source owner');const b=owners[0],s=b.furnitureMotionScope;if(s.ramp.maxZ!==372.15||s.ramp.minZ!==371.19||b.min.z!==373.8)throw Error('New terrace/ramp generation mismatch');s.maxOffsetZ=374.55-b.min.z;s.environmentGroundHandoff=true;}
