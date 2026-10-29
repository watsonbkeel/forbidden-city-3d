import * as T from 'three';
import {CHANGCHUN_WEST_REGION,validateChangchunWestScope,registeredChangchunWestFloor} from '../../../controls/ChangchunWestSupport.js';
const SOURCE='https://www.dpm.org.cn/explore/building/236436.html',PHOTO='https://img.dpm.org.cn/Uploads/Picture/dc/1456%5B1024%5D.jpg';
/** One photo-bounded western composition. All old host floors, rooms, eastern
 * R54 objects and central furnishings survive; no inferred movable inventory. */
export function applyChangchunWestInterior(kit,item,f){
 if(item.name!=='长春宫'||item.structure!=='west-domestic-hall'||item.domesticProfile!=='changchun-domestic'||item.x!==150.2||item.z!==379.6||item.w!==27.1||item.d!==13.8||item.pad!==.8||item.ph!==.6||item.colH!==6.72||item.bays!==5||item.rot!==undefined||f.parent!==kit.root||f.position.x!==150.2||f.position.y!==0||f.position.z!==379.6||f.rotation.toArray().slice(0,3).some(v=>v!==0)||f.scale.toArray().some(v=>v!==1)||f.userData.changchunWest)throw Error('Changchun western composition requires its unique retained host');
 const boundaryX=-item.w/2+3*(item.w/5),boundary=f.children.filter(g=>g.userData.role==='west-domestic-boundary'&&g.userData.x===boundaryX);if(boundary.length!==1||boundary[0].children.length!==4)throw Error('Changchun west boundary source changed');
 const b=boundary[0];if(b.position.toArray().some(v=>v!==0)||b.rotation.toArray().slice(0,3).some(v=>v!==0)||b.scale.toArray().some(v=>v!==1))throw Error('Changchun west boundary source transform changed');
 const valances=b.children.filter(m=>m.name==='changchun-curtain-valance'),cover=f.children.filter(m=>['changchun-kang-cover-post','changchun-kang-cover-head'].includes(m.name)&&m.position.x>0),kangs=f.children.filter(m=>m.name==='changchun-north-kang'&&m.position.x>0);
 if(valances.length!==1||cover.length!==8||kangs.length!==1)throw Error('Changchun west original composition census changed');
 const boxIndices=new T.BoxGeometry();const canonicalIndices=Array.from(boxIndices.index.array);boxIndices.dispose();
 const completeBox=g=>g?.index?.count===36&&canonicalIndices.every((v,i)=>v===g.index.array[i])&&g.drawRange.start===0&&g.drawRange.count===Infinity&&g.groups.length===6&&g.groups.every((v,i)=>v.start===6*i&&v.count===6&&v.materialIndex===i);
 const expect=(m,w,h,d,x,y,z)=>{const g=new T.BoxGeometry(w,h,d),p=g.attributes.position,q=m.geometry?.attributes.position;const expectedMaterial=m.name==='changchun-curtain-valance'?'changchun-domestic_plain_cloth_fit':'changchun-domestic_timber_fit',owners=kit.owned.filter(v=>v.name===expectedMaterial);const ok=owners.length===1&&m.material===owners[0]&&completeBox(m.geometry)&&m.isMesh&&m.children.length===0&&m.position.equals(new T.Vector3(x,y,z))&&m.rotation.toArray().slice(0,3).every(v=>v===0)&&m.scale.toArray().every(v=>v===1)&&q?.count===p.count&&Array.from(p.array).every((v,i)=>v===q.array[i]);g.dispose();if(!ok)throw Error('Changchun west retained solid changed before mutation');};
 const y=.6,H=4.25,rear=item.d/2-.35,front=-rear,lo=front+.55,hi=rear-.55;
 expect(valances[0],.055,.48,hi-lo,boundaryX,y+H-.44,(lo+hi)/2);
 const originalCX=2*(item.w/5),originalFront=4.6-2.7/2,originalRear=4.6+2.7/2;
 for(const [i,[dx,dz]]of [[-1.85,-1.35],[-1.85,1.35],[1.85,-1.35],[1.85,1.35]].entries())expect(cover[i],.13,3.1,.13,originalCX+dx,y+3.1/2,4.6+dz);
 expect(cover[4],3.7,.22,.16,originalCX,y+3.1-.11,originalFront);expect(cover[5],3.7,.22,.16,originalCX,y+3.1-.11,originalRear);
 expect(cover[6],.16,.22,2.7,originalCX-1.85,y+3.1-.11,4.6);expect(cover[7],.16,.22,2.7,originalCX+1.85,y+3.1-.11,4.6);
 expect(b.children[0],.16,H,.16,boundaryX,y+H/2,lo);expect(b.children[1],.16,H,.16,boundaryX,y+H/2,hi);expect(b.children[2],.18,.24,rear-front,boundaryX,y+H-.12,(front+rear)/2);
 expect(kangs[0],3.7,.5,2.7,2*(item.w/5),y+.25,4.6);
 if(!registeredChangchunWestFloor({walkables:kit.walkables},{...CHANGCHUN_WEST_REGION,kind:'changchun-west-interior',id:'changchun-west-interior'},160,380,.5))throw Error('Changchun inherited unique platform missing');
 const metadata={id:'west-six/changchun-west-visible-composition',source:SOURCE,photo:PHOTO,caption:'长春宫西次间',photographyDate:null,status:'SOURCE_RELATIONSHIP_MODEL_FIT_NOT_SURVEYED',acceptedWholeObject:false,direction:'REAR_KANG_MAPPING_INFERRED_FROM_TEXT_AND_PHOTO_NOT_CAMERA_METADATA',withheld:['exact carving and textile patterns','calligraphy and painting content','unlocated lamps/high display inventories','hidden rear construction','whole-palace interior and present inventory','GPU verification'],newWalkables:0};
 const group=new T.Group();group.name='changchun-west-visible-composition';group.userData={changchunWest:true,...metadata,structure:metadata};// Detached until every final source and scope has validated.

 const mats={};for(const[key,color]of Object.entries({wood:0x292b27,cloth:0x354e52,trim:0xb4a27d,paper:0xc6c3a9})){mats[key]=new T.MeshStandardMaterial({name:'changchun_west_'+key+'_fit',color,roughness:.86});}
 const added=[];try {
 function box(role,w,h,d,x,yy,z,mat='wood'){const m=kit.mesh(group,new T.BoxGeometry(w,h,d),mats[mat],x,yy,z);m.name='changchun-west-'+role;m.userData={role:m.name,changchunWest:true,source:SOURCE,photo:PHOTO,precision:metadata.status};added.push(m);return m;}
 // Retained two posts/head; four plain rectangular registers, not a surveyed
 // panel count or copied text. Actual solid strips do not close the opening.
 for(let i=0;i<4;i++){const zc=-4.5+i*3;box('boundary-register',.05,.45,2.72,boundaryX,4.48,zc,'paper');for(const dy of[-.25,.25])box('boundary-register-rail',.10,.075,2.88,boundaryX-.035,4.48+dy,zc);for(const dz of[-1.4,1.4])box('boundary-register-stile',.10,.5,.075,boundaryX-.035,4.48,zc+dz);for(const dz of[-1.1,1.1]){box('boundary-register-corner',.11,.16,.045,boundaryX-.045,4.48,zc+dz);box('boundary-register-corner',.11,.045,.22,boundaryX-.045,4.48+(dz<0?.08:-.08),zc+dz);}}
 for(let i=0;i<8;i++){const zc=-5.25+i*1.5,bottom=3.65+(i%2)*.06;box('raised-valance',.06,4.16-bottom,1.5,boundaryX-.07,(4.16+bottom)/2,zc,'cloth');box('valance-border',.075,.045,1.5,boundaryX-.11,bottom+.025,zc,'trim');box('valance-border',.075,.035,1.5,boundaryX-.11,4.14,zc,'trim');for(const dz of[-.72,.72])box('valance-edge',.075,4.13-bottom,.035,boundaryX-.11,(4.13+bottom)/2,zc+dz,'trim');}
 // Keep all eight old western posts/heads and the kang. Augment the complete
 // front upper register, one visible side field and bright rear window relation.
 const cx=2*(item.w/5),frontZ=3.25,rearZ=5.95;
 for(let i=0;i<3;i++){const x=cx+(i-1)*1.13;box('kang-register',1.03,.4,.045,x,3.23,frontZ+.025,'paper');for(const dy of[-.24,.24])box('kang-register-rail',1.13,.07,.12,x,3.23+dy,frontZ-.025);for(const dx of(i===0?[-.565,.565]:[.565]))box('kang-register-stile',.07,.48,.12,x+dx,3.23,frontZ-.025);for(const dx of[-.37,.37]){box('kang-register-corner',.045,.14,.13,x+dx,3.23,frontZ-.035);box('kang-register-corner',.18,.045,.13,x+dx,3.23+.07,frontZ-.035);}}
 box('visible-side-field',.045,1.8,2.25,cx+1.78,2.05,4.6,'paper');for(const zz of[3.45,5.75])box('side-field-stile',.1,1.95,.08,cx+1.75,2.05,zz);for(const yy of[1.1,3.0])box('side-field-rail',.1,.08,2.4,cx+1.75,yy,4.6);for(const zz of[3.95,5.25])box('side-field-inner-stile',.11,1.4,.045,cx+1.73,2.05,zz);
 box('window-field',3.2,1.85,.035,cx,2.31,rearZ+.25,'paper');for(const xx of[-1.64,0,1.64])box('window-stile',.065,1.96,.075,cx+xx,2.31,rearZ+.2);for(const yy of[1.33,2.05,3.29])box('window-rail',3.34,.065,.075,cx,yy,rearZ+.2);for(let i=0;i<4;i++){const x=cx+(i-1.5)*.72;box('window-square-lattice',.04,.65,.08,x,2.69,rearZ+.19);for(const yy of[2.39,2.99])box('window-square-lattice',.5,.04,.08,x,yy,rearZ+.19);}
 // All validation precedes the sole original source removal. Its shared cloth
 // material is still used by the untouched eastern curtain and is not disposed.

 kit.root.updateWorldMatrix(true,true);group.updateMatrixWorld(true);const inverse=kit.root.matrixWorld.clone().invert(),point=(m,p,i)=>{const v=new T.Vector3().fromBufferAttribute(p,i).applyMatrix4(new T.Matrix4().multiplyMatrices(inverse,added.includes(m)?new T.Matrix4().multiplyMatrices(f.matrixWorld,m.matrixWorld):m.matrixWorld));v.set(Math.fround(v.x),Math.fround(v.y),Math.fround(v.z));return v.applyMatrix4(kit.root.matrixWorld);};
 const retained=[kangs[0],...cover,...b.children.filter(m=>m!==valances[0])],sources=[...retained,...added];const pending=[];let anchor;
 for(const[index,m]of sources.entries()){const p=m.geometry.attributes.position,points=Array.from({length:p.count},(_,i)=>point(m,p,i));if(new Set(points.map(v=>v.toArray().join(','))).size!==8||['x','y','z'].some(k=>new Set(points.map(v=>v[k])).size!==2)||!completeBox(m.geometry))throw Error('Changchun western source must remain a complete axis-aligned box');const bounds=new T.Box3().setFromPoints(points);bounds.changchunWest={kind:'visible-box',index,role:m.name,retained:index<retained.length};pending.push(bounds);if(index===0)anchor=bounds;}
 const r=CHANGCHUN_WEST_REGION,scope={kind:'changchun-west-interior',id:'changchun-west-interior',minOffsetX:r.minX-anchor.min.x,maxOffsetX:r.maxX-anchor.min.x,minOffsetZ:r.minZ-anchor.min.z,maxOffsetZ:r.maxZ-anchor.min.z};validateChangchunWestScope(scope,anchor,r);anchor.furnitureMotionScope=scope;
 f.add(group);kit.owned.push(...Object.values(mats));kit.colliders.push(...pending);b.remove(valances[0]);valances[0].geometry.dispose();
 group.userData.sourceBoxes=sources.length;group.userData.retainedSourceBoxes=retained.length;f.userData.changchunWest=metadata;return group;
 }catch(error){for(const m of added)m.geometry.dispose();for(const m of Object.values(mats))m.dispose();throw error;}
}
