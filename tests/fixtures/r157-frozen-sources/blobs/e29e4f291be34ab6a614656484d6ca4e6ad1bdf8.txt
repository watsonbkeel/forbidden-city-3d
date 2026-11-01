import * as THREE from 'three';
import {createXiqingSurface} from '../../../controls/XiqingRoofSurface.js';
import {buildStuddedDoor} from '../../HallKit.js';
import {buildWallCap} from '../../RoofBuilder.js';
const SOURCE='https://www.dpm.org.cn/explore/building/236479.html';
const PHOTO='https://img.dpm.org.cn/Uploads/Picture/2020/04/17/s5e99830b66756.jpg';
const STATUS='MODEL_FIT_NOT_SURVEYED';
const tag=(o,role)=>{o.name='r104-xiqing-'+role;o.userData.xiqingRole=role;return o;};
export function xiqingGeometry(item,zoneId,itemIndex){
 if(zoneId!=='ningshou'||itemIndex!==0||!item||item.kind!=='gate'||item.name!=='锡庆门'||item.x!==-233.2||item.z!==135.5||item.rot!=='west'||item.style!=='triple'||item.gateKind!=='three-wall-portals'||item.gateProfile!=='xiqing'||item.open!==true||['w','h','d','t','roof','layers','eaveCount','brackets'].some(k=>item[k]!==undefined))throw Error('Xiqing requires its exact reviewed single instance and playable-open profile');
 const portals=[{id:'south',x:-7,width:2.8,pierWidth:1,height:4,bodyTop:5.1},{id:'middle',x:0,width:3.6,pierWidth:1.4,height:4.4,bodyTop:5.5},{id:'north',x:7,width:2.8,pierWidth:1,height:4,bodyTop:5.1}].map(p=>({...p,bodyWidth:p.width+2*p.pierWidth,worldZ:item.z+p.x}));
 return{id:'ningshou/xiqing-three-gates',profile:'xiqing',name:item.name,x:item.x,z:item.z,rot:-Math.PI/2,gateKind:'three-wall-portals',portalCount:3,storeys:1,eaveCount:1,roofForm:'wudian',depth:2.8,width:18.8,wallHeight:7,wallThickness:1,portals,wallGaps:portals.map(p=>({at:p.worldZ,w:p.bodyWidth})),status:STATUS,source:SOURCE,photo:PHOTO,photographyDate:null,openState:'PLAYABLE_OPEN_NOT_MUSEUM_PERMISSION',unknown:['rear ornament','jiangcha grade and dimensions','door-god and lamp inventory'],stablePlaceId:'place-ningshou-77f449d2fe'};
}
/** Exact target wall only: retain the two existing unrelated gaps and three real openings. */
export function xiqingWallGaps(item,geometry,gateWidths){
 const same=(a,b)=>Array.isArray(a)&&a.length===b.length&&a.every((n,i)=>n===b[i]);
 if(!geometry||geometry.profile!=='xiqing'||!same(item.from,[-233.2,118])||!same(item.to,[-233.2,520])||item.h!==7||(item.t!==undefined&&item.t!==1)||!Array.isArray(item.gaps)||item.gaps.length!==3||item.gaps.some((g,i)=>g.gate!==['锡庆门','履顺门','蹈和门'][i]||g.at!==[135.5,255,304.3][i]||Object.keys(g).some(k=>!['gate','at'].includes(k))))throw Error('Xiqing requires its exact retained adjacent wall interface');
 const widths=['履顺门','蹈和门'].map(n=>gateWidths.get(n));if(widths.some(w=>!Number.isFinite(w)||w<=0))throw Error('Unbuilt Xiqing neighboring gate');
 return [...geometry.wallGaps.map(g=>({...g})),{at:255,w:widths[0]},{at:304.3,w:widths[1]}];
}
/** Replace the original front face with coplanar material fields, not floating
 * boxes. All field endpoints derive from the same Float32 box boundary. */
function paintedBox(w,h,d){
 const box=new THREE.BoxGeometry(w,h,d).toNonIndexed(),p=box.attributes.position,n=box.attributes.normal,uv=box.attributes.uv,ps=[],ns=[],us=[],cs=[],red=new THREE.Color(0xb6533d),green=new THREE.Color(0x3c7165),gold=new THREE.Color(0xc59a32);
 box.computeBoundingBox();const b=box.boundingBox,a=b.min.x,c=b.max.x,lo=b.min.y,hi=b.max.y,z=b.min.z;
 const put=(v,normal,u,color)=>{ps.push(...v);ns.push(...normal);us.push(...u);cs.push(color.r,color.g,color.b);};
 for(let i=0;i<p.count;i++)if(n.getZ(i)!==-1)put([p.getX(i),p.getY(i),p.getZ(i)],[n.getX(i),n.getY(i),n.getZ(i)],[uv.getX(i),uv.getY(i)],red);
 const xs=[a,a+.08,a+.14,c-.14,c-.08,c],ys=[lo,lo+.08,lo+.14,hi-.14,hi-.08,hi];
 for(let y=0;y<5;y++)for(let x=0;x<5;x++){const color=x===0||x===4||y===0||y===4?red:x===1||x===3||y===1||y===3?gold:green;
  const q=[[xs[x],ys[y],z],[xs[x],ys[y+1],z],[xs[x+1],ys[y+1],z],[xs[x+1],ys[y],z]];
  for(const j of[0,1,2,0,2,3])put(q[j],[0,0,-1],[(q[j][0]-a)/(c-a),(q[j][1]-lo)/(hi-lo)],color);
 }
 box.dispose();const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(ps,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(ns,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(us,2));g.setAttribute('color',new THREE.Float32BufferAttribute(cs,3));g.computeBoundingBox();g.computeBoundingSphere();return g;
}
export function buildXiqingGate(kit,item,zoneId,itemIndex){
 const roofs=[],firstCollider=kit.colliders.length,g=xiqingGeometry(item,zoneId,itemIndex),f=kit.frame(g.x,g.z,g.rot);f.name='锡庆门';f.userData.structure=g;f.userData.gateGeometry=g;
 const material=(name,color,roughness)=>{const m=new THREE.MeshStandardMaterial({name,color,roughness});kit.owned.push(m);return m;};
 const painted=material('r104-xiqing-flush-glazed-fields-fit',0xffffff,.55),stone=material('r104-xiqing-white-stone-fit',0xd3cec2,.8);painted.vertexColors=true;
 function block(parent,role,mat,w,h,d,x,y,z,solid=false){const m=typeof mat==='string'?kit.box(parent,mat,w,h,d,x,y,z):kit.mesh(parent,(mat===painted?paintedBox(w,h,d):new THREE.BoxGeometry(w,h,d)),mat,x,y,z);tag(m,role);parent.updateWorldMatrix(true,true);if(solid){const b=new THREE.Box3().setFromObject(m);kit.colliders.push(b);m.userData.xiqingColliderIndex=kit.colliders.length-1;}return m;}
 for(const p of g.portals){
  const tower=tag(new THREE.Group(),'gate-tower');tower.position.x=p.x;tower.userData.portalId=p.id;f.add(tower);tower.updateWorldMatrix(true,true);
  for(const sign of[-1,1]){const x=sign*(p.width/2+p.pierWidth/2);block(tower,'stone-pier-base',stone,p.pierWidth,.75,g.depth,x,.375,0,true);block(tower,'red-pier',painted,p.pierWidth,p.bodyTop-.75,g.depth,x,(p.bodyTop+.75)/2,0,true);

  }
  block(tower,'overdoor-masonry',painted,p.width,p.bodyTop-p.height,g.depth,0,(p.bodyTop+p.height)/2,0,true);
  // The original wall continues behind/above each independent gate roof.
  block(tower,'back-wall-header','wall_red',p.bodyWidth,g.wallHeight-p.bodyTop,g.wallThickness,0,(g.wallHeight+p.bodyTop)/2,0,true);
  const cap=tag(kit.adopt(buildWallCap(kit.lib,{length:p.bodyWidth,thickness:g.wallThickness})),'back-wall-cap');cap.position.y=g.wallHeight;tower.add(cap);
  const roof=tag(kit.roof(tower,{type:'wudian',width:p.bodyWidth,depth:g.depth,overhang:.15,baseY:p.bodyTop,height:.7,brackets:false,detail:'low'}),'hipped-roof');roof.userData.roofForm='wudian';roofs.push({roof,id:p.id});
  for(const s of[-1,1]){const width=p.width/2-.05,leaf=tag(buildStuddedDoor(kit.lib,{width,height:p.height-.1}),'open-door');leaf.rotation.y=Math.PI/2;leaf.position.set(s*(p.width/2+.15),0,g.depth/2+width/2);tower.add(leaf);tower.updateWorldMatrix(true,true);kit.colliders.push(new THREE.Box3().setFromObject(leaf));leaf.userData.xiqingColliderIndex=kit.colliders.length-1;}
 }
 // Preserve the inherited central thin ground decoration, with no new step/support.
 block(f,'retained-central-threshold','stone_slab',6.6,.1,3.3,0,.05,0);
 kit.plaque(f,'锡庆门',0,4.95,-g.depth/2-.13,.72,1.2);
 kit.mapRect(f,'gate','锡庆门',g.width,g.depth,{gateProfile:'xiqing',portalCount:3,dimensionStatus:STATUS});
 // Match the actual CourtKit.finish/MergeUtils pipeline: transform original
 // Float32 vertices to root-local, store Float32, then apply the retained root
 // world matrix. Do not collide against pre-merge doubles or change rendering.
 kit.root.updateMatrixWorld(true);const inverseRoot=new THREE.Matrix4().copy(kit.root.matrixWorld).invert();
 for(const {roof,id} of roofs){const faces=[];let mesh=0;roof.traverse(m=>{if(!m.isMesh)return;const p=m.geometry.attributes.position,index=m.geometry.index,relative=new THREE.Matrix4().multiplyMatrices(inverseRoot,m.matrixWorld);for(let i=0;i<(index?index.count:p.count);i+=3)faces.push({source:{mesh,triangle:i/3},vertices:[0,1,2].map(j=>{const v=new THREE.Vector3().fromBufferAttribute(p,index?index.getX(i+j):i+j).applyMatrix4(relative);v.set(Math.fround(v.x),Math.fround(v.y),Math.fround(v.z));return v.applyMatrix4(kit.root.matrixWorld);})});mesh++;});const surface=createXiqingSurface(faces,'xiqing-roof-'+id),owner=surface.box.clone();owner.xiqingRoofSurface=surface;kit.colliders.push(owner);}
 // Dispatch only: finite actual solid/leaf/roof bounds plus one metre buffer.
 const scopeOwner=kit.colliders[firstCollider],scope=new THREE.Box3();for(const b of kit.colliders.slice(firstCollider))scope.union(b);scope.min.x-=1;scope.max.x+=1;scope.min.z-=1;scope.max.z+=1;
 scopeOwner.furnitureMotionScope={kind:'xiqing-gates',id:'ningshou-xiqing-gates',groundY:0,minOffsetX:scope.min.x-scopeOwner.min.x,maxOffsetX:scope.max.x-scopeOwner.min.x,minOffsetZ:scope.min.z-scopeOwner.min.z,maxOffsetZ:scope.max.z-scopeOwner.min.z};
 return{width:g.width,geometry:g,frame:f};
}
