import * as THREE from 'three';
import {createXiqingSurface} from '../../../controls/XiqingRoofSurface.js';
import {bindChengqianArrival} from '../../../controls/ChengqianArrivalAccess.js';
const FIT='PHOTO_COMPOSITION_MODEL_FIT_NOT_SURVEYED';
const V=(x,y,z)=>new THREE.Vector3(Math.fround(x),Math.fround(y),Math.fround(z));
function assertFrame(f,x,z){if(!f?.isGroup||f.position.x!==x||f.position.y!==0||f.position.z!==z||f.rotation.x!==0||f.rotation.y!==0||f.rotation.z!==0||f.scale.x!==1||f.scale.y!==1||f.scale.z!==1)throw Error('Chengqian arrival frame identity changed');}
function faces(m){m.updateWorldMatrix(true,false);const p=m.geometry.attributes.position,ix=m.geometry.index,out=[];for(let i=0;i<(ix?.count??p.count);i+=3)out.push({source:{mesh:0,triangle:i/3},vertices:[0,1,2].map(j=>{const v=new THREE.Vector3().fromBufferAttribute(p,ix?ix.getX(i+j):i+j).applyMatrix4(m.matrixWorld);return V(v.x,v.y,v.z)})});return out;}
function owner(kit,m,id,surface=false){const source=faces(m),b=new THREE.Box3().setFromPoints(source.flatMap(f=>f.vertices));b.chengqianArrivalSource={id,source:'actual-finished-F32',status:FIT};if(surface)b.xiqingRoofSurface=createXiqingSurface(source,id);kit.colliders.push(b);return b;}
function retainedBox(kit,f,mat,pos,size,label){const a=f.children.filter(m=>m.isMesh&&m.material===kit.lib.material(mat)&&m.position.toArray().every((v,i)=>v===pos[i])&&m.rotation.x===0&&m.rotation.y===0&&m.rotation.z===0&&m.scale.toArray().every(v=>v===1));if(a.length!==1)throw Error('Missing unique Chengqian arrival '+label);const m=a[0],g=m.geometry,p=g.attributes.position,ix=g.index,raw=new THREE.BoxGeometry(...size),canonical=ix?raw:raw.toNonIndexed();const intact=p.count===canonical.attributes.position.count&&p.array.every((v,i)=>v===canonical.attributes.position.array[i])&&(!ix||ix.count===canonical.index.count&&ix.array.every((v,i)=>v===canonical.index.array[i]));if(canonical!==raw)canonical.dispose();raw.dispose();if(!intact)throw Error('Changed actual Chengqian arrival '+label+' faces');return m;}
function solid(kit,f,mat,w,h,d,x,y,z,id){const m=typeof mat==='string'?kit.box(f,mat,w,h,d,x,y,z):kit.mesh(f,new THREE.BoxGeometry(w,h,d),mat,x,y,z);m.userData.role=id;return owner(kit,m,id);}
/** The source only proves a CLOSED front. Necessary plain back is explicitly
 * unknown, with no invented inscription, carving, roof or operable hinges. */
export function applyChengqianGateArrival(kit,f,item,zone,index){
 if(zone.id!=='east-six'||index!==7||item.kind!=='gate'||item.name!=='承乾门'||item.x!==-93.3||item.z!==360.2||item.rot!==undefined||item.w!==undefined||item.gateProfile!==undefined)throw Error('Chengqian gate arrival identity mismatch');assertFrame(f,-93.3,360.2);
 if(f.userData.chengqianArrivalBound)throw Error('Duplicate Chengqian arrival identity');
 const slab=retainedBox(kit,f,'stone_slab',[0,.05,0],[6.6,.1,3.3],'gate slab');
 f.userData.chengqianArrivalBound=true;
 bindChengqianArrival(owner(kit,slab,'chengqian-gate-slab'),'chengqian-gate-arrival');
 const s=kit.frame(-93.3,364.3);s.userData.structure={id:'east-six/chengqian-north-timber-screen',state:'CLOSED_NOT_OPERABLE',status:FIT,back:'UNKNOWN_PLAIN_CLOSED_SOLID',upper:'VISIBLE_TIMBER_CLOSING_BAND_ONLY_NO_ROOF',sourcePanorama:3746};
 const wood=new THREE.MeshStandardMaterial({name:'chengqian_screen_red_timber',color:0x87352c,roughness:.84}),edge=new THREE.MeshStandardMaterial({name:'chengqian_screen_frame_red',color:0x682b24,roughness:.82});kit.owned.push(wood,edge);
 const base=solid(kit,s,'stone_slab',4.4,.22,1,0,.11,0,'chengqian-north-screen-stone');bindChengqianArrival(base,'chengqian-screen-bypass');
 solid(kit,s,wood,4,2.82,.20,0,1.63,.04,'chengqian-north-screen-closed-core');
 // Source-attested rectangular field hierarchy, not a tracing of fine carving.
 // Frame fronts stay at -.14; backs end at +.12 inside the core +.14,
 // avoiding differently coloured coincident external back faces.
 for(const x of[-1.9,1.9])solid(kit,s,edge,.2,2.82,.26,x,1.63,-.01,'chengqian-north-screen-post-'+x);
 for(const y of[.32,2.94])solid(kit,s,edge,3.8,.2,.26,0,y,-.01,'chengqian-north-screen-rail-'+y);
 for(const x of[-1.27,1.27])solid(kit,s,edge,.08,2.42,.26,x,1.63,-.01,'chengqian-north-screen-field-side-'+x);
 for(const y of[.86,2.40])solid(kit,s,edge,3.6,.075,.26,0,y,-.01,'chengqian-north-screen-field-bar-'+y);
 solid(kit,s,wood,2.42,1.43,.08,0,1.63,-.10,'chengqian-north-screen-central-field');
 for(const y of[.59,2.67])solid(kit,s,wood,2.42,.35,.06,0,y,-.09,'chengqian-north-screen-horizontal-field-'+y);
 for(const x of[-1.57,1.57])solid(kit,s,wood,.43,1.43,.06,x,1.63,-.09,'chengqian-north-screen-vertical-field-'+x);
 solid(kit,s,edge,4,.13,.28,0,3.105,0,'chengqian-north-screen-upper-band');
 solid(kit,s,wood,4,.08,.28,0,3.21,0,'chengqian-north-screen-top-close');
}
function cheek(kit,f,x0,x1,z0,z1,top,id){
 const p=[V(x0,0,z0),V(x1,0,z0),V(x0,0,z1),V(x1,0,z1),V(x0,top,z1),V(x1,top,z1)],center=p.reduce((a,v)=>a.add(v),new THREE.Vector3()).divideScalar(6),ix=[[0,2,3],[0,3,1],[0,4,2],[1,3,5],[2,4,5],[2,5,3],[0,1,5],[0,5,4]],positions=[];
 for(const q of ix){const [a,b,c]=q.map(i=>p[i]),n=new THREE.Vector3().subVectors(b,a).cross(new THREE.Vector3().subVectors(c,a)),mid=a.clone().add(b).add(c).multiplyScalar(1/3).sub(center);if(n.dot(mid)<0)[q[1],q[2]]=[q[2],q[1]];for(const i of q)positions.push(...p[i].toArray());}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(positions.flatMap((_,i)=>i%3===0?[positions[i],positions[i+2]]:[]),2));g.computeVertexNormals();const m=kit.mesh(f,g,kit.lib.material('stone_slab'),0,0,0);m.userData.role=id;return owner(kit,m,id,true);
}
export function applyChengqianRearArrival(kit,f,item,zone,index){
 if(zone.id!=='east-six'||index!==10||item.kind!=='hall'||item.x!==-93||item.z!==403.9||item.w!==24||item.d!==9.6||item.ph!==.45||item.pad!==.6||item.bays!==5||item.rearHallProfile!=='chengqian-rear'||item.rot!==undefined)throw Error('Chengqian rear arrival identity mismatch');assertFrame(f,-93,403.9);
 if(f.userData.chengqianArrivalBound)throw Error('Duplicate Chengqian arrival identity');
 const cap=retainedBox(kit,f,'stone_slab',[0,.45-.03,0],[25.32,.08,10.92],'rear cap');
 const threshold=f.children.filter(m=>m.isMesh&&m.material===kit.lib.material('wood_column')&&m.position.x===0&&m.position.y===.56&&m.position.z===-4.8);if(threshold.length!==1)throw Error('Chengqian rear threshold identity missing');
 // Its width follows the existing photographed five-bay model, not new fit.
 const r=THREE.MathUtils.clamp((24/5)*.07,.2,.34);retainedBox(kit,f,'wood_column',[0,.56,-4.8],[24/5-2*r,.22,.3],'rear threshold');
 const floors=f.children.filter(m=>m.isMesh&&m.material===kit.floorMat&&m.position.x===0&&m.position.y===.45+.02&&m.position.z===0);if(floors.length!==1)throw Error('Chengqian rear floor identity missing');const floor=floors[0],canonical=new THREE.PlaneGeometry(24,9.6);canonical.rotateX(-Math.PI/2);const p=floor.geometry.attributes.position,ix=floor.geometry.index,intact=p.count===4&&ix?.count===6&&p.array.every((v,i)=>v===canonical.attributes.position.array[i])&&ix.array.every((v,i)=>v===canonical.index.array[i]);canonical.dispose();if(!intact)throw Error('Chengqian rear actual floor faces changed');
 // All source checks precede registration or geometry additions.
 f.userData.chengqianArrivalBound=true;
 const b=owner(kit,cap,'chengqian-rear-cap');bindChengqianArrival(b,'chengqian-rear-arrival',.85);owner(kit,threshold[0],'chengqian-rear-threshold');owner(kit,floor,'chengqian-rear-floor',true);
 const stairs=kit.frame(0,0),zf=397.72,zm=398.08,zb=b.min.z;stairs.userData.structure={id:'east-six/chengqian-rear-arrival-stair',status:FIT,source:'official rear front and oblique photos',treadCount:'TWO_MODEL_FIT_NOT_SURVEYED'};
 for(const [i,z0,z1,top]of[[0,zf,zm,.15],[1,zm,zb,.30]]){const step=solid(kit,stairs,'stone_slab',4.4,top,z1-z0,-93,top/2,(z0+z1)/2,'chengqian-rear-step-'+i);kit.walkables.push({type:'box',box:new THREE.Box3(new THREE.Vector3(step.min.x,step.max.y,step.min.z),step.max.clone())});}
 cheek(kit,stairs,-95.48,-95.2,zf,zb,b.max.y,'chengqian-rear-cheek-east');cheek(kit,stairs,-90.8,-90.52,zf,zb,b.max.y,'chengqian-rear-cheek-west');
}
