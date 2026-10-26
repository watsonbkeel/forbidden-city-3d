import * as THREE from 'three';
import {buildingDetailQuality} from '../../../render/BuildingDetailQuality.js';
import {applyBandUV} from '../../../utils/GeometryUV.js';
const status='REVERSIBLE_PHOTO_FIT_NOT_SURVEYED';
function materials(kit){
 const owned=(name,color)=>{let m=kit.owned.find(m=>m.name===name);if(!m){m=new THREE.MeshStandardMaterial({name,color,roughness:.85,transparent:false,opacity:1,depthWrite:true});kit.owned.push(m);}return m;};
 return{wood:owned('r103-chengqian-red-grid',0x8e3027),back:owned('r103-chengqian-closed-backing',0x555f5b),glass:owned('r103-chengqian-opaque-glazing-fit',0xa6b7b1),stone:owned('r103-chengqian-grey-sill',0x797d78)};
}
function rectangle(a,b,c,d){const s=new THREE.Shape();s.moveTo(a,c);s.lineTo(b,c);s.lineTo(b,d);s.lineTo(a,d);s.closePath();return s;}
function hole(shape,points){const p=new THREE.Path();p.moveTo(...points[0]);points.slice(1).forEach(q=>p.lineTo(...q));p.closePath();shape.holes.push(p);}
function rectGrid(a,b,c,d,nx,ny,z0,z1){
 const s=rectangle(a,b,c,d),bar=.043,dx=(b-a)/nx,dy=(d-c)/ny;
 for(let y=0;y<ny;y++)for(let x=0;x<nx;x++){const lo=a+x*dx+bar/2,hi=a+(x+1)*dx-bar/2,bot=c+y*dy+bar/2,top=c+(y+1)*dy-bar/2;hole(s,[[lo,bot],[lo,top],[hi,top],[hi,bot]]);}
 return new THREE.ExtrudeGeometry(s,{depth:z1-z0,bevelEnabled:false,curveSegments:1,steps:1}).translate(0,0,z0);
}
// Earcut may emit cap triangles that become exactly collinear in the final
// Float32 buffer. Remove only strictly zero-area primitives, never move a
// vertex or discard a positive-area face. Retain source indices for audit.
function omitExactZeroTriangles(g){
 const p=g.attributes.position,keep=[],removed=[];
 for(let i=0;i<p.count;i+=3){
  const ax=p.getX(i+1)-p.getX(i),ay=p.getY(i+1)-p.getY(i),az=p.getZ(i+1)-p.getZ(i),bx=p.getX(i+2)-p.getX(i),by=p.getY(i+2)-p.getY(i),bz=p.getZ(i+2)-p.getZ(i);
  if(ay*bz-az*by===0&&az*bx-ax*bz===0&&ax*by-ay*bx===0)removed.push(i/3);else keep.push(i,i+1,i+2);
 }
 if(!removed.length)return g;
 const out=new THREE.BufferGeometry();
 for(const[name,a]of Object.entries(g.attributes)){const data=new a.array.constructor(keep.length*a.itemSize);keep.forEach((j,k)=>{for(let n=0;n<a.itemSize;n++)data[k*a.itemSize+n]=a.array[j*a.itemSize+n];});out.setAttribute(name,new THREE.BufferAttribute(data,a.itemSize,a.normalized));}
 out.userData.omittedExactZeroTriangles=removed;g.dispose();return out;
}
function diamonds(a,b,c,d,z0,z1,low=false){
 const s=rectangle(a,b,c,d),step=low?.675:.45,r=low?.288:.192,edge=.0375;
 const clip=(p,axis,v,sign)=>{const out=[];for(let i=0;i<p.length;i++){const x=p[i],y=p[(i+1)%p.length],dx=sign*(x[axis]-v),dy=sign*(y[axis]-v);if(dx>=0)out.push(x);if((dx>=0)!==(dy>=0)){const t=dx/(dx-dy);out.push([x[0]+t*(y[0]-x[0]),x[1]+t*(y[1]-x[1])]);}}return out;};
 for(let row=-1;row<Math.ceil((d-c)/(step/2))+1;row++)for(let col=-1;col<Math.ceil((b-a)/step)+1;col++){
  const x=a+col*step+(row%2?step/2:0),y=c+row*step/2;let p=[[x-r,y],[x,y+r],[x+r,y],[x,y-r]];
  for(const[axis,v,sign]of[[0,a+edge,1],[0,b-edge,-1],[1,c+edge,1],[1,d-edge,-1]])p=clip(p,axis,v,sign);
  if(p.length<3)continue;const area=Math.abs(p.reduce((n,q,i)=>{const next=p[(i+1)%p.length];return n+q[0]*next[1]-next[0]*q[1];},0))/2;if(area<.0002)continue;hole(s,p);
 }
 const geometry=new THREE.ExtrudeGeometry(s,{depth:z1-z0,bevelEnabled:false,curveSegments:1,steps:1}).translate(0,0,z0);
 return low?omitExactZeroTriangles(geometry):geometry;
}
function boundedBox(a,b,c,d,e,f){
 const g=new THREE.BoxGeometry(1,1,1),p=g.attributes.position;for(let i=0;i<p.count;i++)p.setXYZ(i,p.getX(i)<0?a:b,p.getY(i)<0?c:d,p.getZ(i)<0?e:f);p.needsUpdate=true;g.computeBoundingBox();g.computeBoundingSphere();return g;
}
function mesh(kit,g,geometry,material,role){const m=kit.mesh(g,geometry,material,0,0,0);m.name='r103-chengqian-'+role;m.userData.chengqianWindowRole=role;return m;}
function group(index,kind){const g=new THREE.Group();g.name='r103-chengqian-'+kind+'-south-window';g.userData.chengqianSouthWindow={windowIndex:index,kind,status,photographyDate:null,scope:'ORIGINAL_CLOSED_SOUTH_WINDOW_ONLY',pattern:'SCHEMATIC_REPEAT_COUNTS_NOT_MEASURED',backing:'OPAQUE_PRIVACY_AND_ORIGINAL_COLLISION_RETAINED'};return g;}

/** Called only after the original front sill, jambs and top/bottom rails exist. */
export function buildChengqianFrontFields(kit,parent,{x,z,width,height,floorY,bayIndex}){
 const low=buildingDetailQuality(kit.lib)==='low',g=group(bayIndex,'front'),m=materials(kit),sill=.95,upper=height-sill,mid=floorY+sill+upper/2;
 const lo=floorY+sill+.1,hi=floorY+height-.1,inner=width-.24,divider=.08,cw=(inner-2*divider)*.60,sw=(inner-2*divider-cw)/2;
 mesh(kit,g,new THREE.BoxGeometry(width-.12,upper-.08,.06).translate(x,mid,z),m.back,'closed-backing');
 mesh(kit,g,rectGrid(x-cw/2,x+cw/2,lo,hi,low?4:6,low?6:8,z-.12,z-.075),m.wood,'wide-rectangular-grille');
 for(const sign of[-1,1]){
  const center=x+sign*(cw/2+divider+sw/2),a=center-sw/2,b=center+sw/2;
  mesh(kit,g,diamonds(a,b,lo,hi,z-.12,z-.075,low),m.wood,(sign<0?'left':'right')+'-diamond-grille');
  const dx=x+sign*(cw/2+divider/2);mesh(kit,g,boundedBox(dx-divider/2,dx+divider/2,lo,hi,z-.12,z-.075),m.wood,'major-field-divider');
 }
 parent.add(g);return g;
}
const expected={kind:'hall',x:-93,z:403.9,w:24,d:9.6,pad:.6,ph:.45,colH:6.08,roof:'gable',bays:5,rearHallProfile:'chengqian-rear',map:'hall'};
const near=(a,b)=>Number.isFinite(a)&&Math.abs(a-b)<1e-7;
function sameGeometry(a,b){if(a.index||Object.keys(a.attributes).sort().join()!==Object.keys(b.attributes).sort().join())return false;return Object.entries(b.attributes).every(([k,v])=>{const x=a.attributes[k];return x.itemSize===v.itemSize&&x.array.constructor===v.array.constructor&&x.array.length===v.array.length&&x.array.every((n,i)=>n===v.array[i]);});}
/** Atomic source-guarded replacement of precisely four original closed bays. */
export function applyChengqianRearSouthWindows(kit,frame,item,itemIndex){
 const g=frame?.userData.structure;
 if(itemIndex!==10||kit?.root.name!=='east-six'||!item||Object.entries(expected).some(([k,v])=>item[k]!==v)||!g||g.id!=='east-six/chengqian-rear'||g.profile!=='chengqian-rear'||!Object.isExtensible(g)||'chengqianSouthWindows'in g||frame.parent!==kit.root||!near(frame.position.x,item.x)||!near(frame.position.z,item.z)||frame.position.y||frame.rotation.x||frame.rotation.y||frame.rotation.z||!frame.scale.equals(new THREE.Vector3(1,1,1)))return false;
 const bay=24/5,width=bay-2*bay*.07,height=(6.08-6.08*.12)*.8,z=-4.8,cy=.45+height/2,centers=[0,1,3,4].map(i=>-12+(i+.5)*bay),tile=kit.lib.tileSize('lattice_doors');if(!Number.isFinite(tile)||tile<=0)return false;
 const ref=applyBandUV(new THREE.BoxGeometry(width,height,.14),tile),targets=[],all=[];kit.root.traverse(m=>{if(m.isMesh)all.push(m);});
 for(const x of centers){const found=frame.children.filter(m=>m.isMesh&&near(m.position.x,x)&&near(m.position.y,cy)&&near(m.position.z,z)&&m.rotation.y===0);if(found.length!==1){ref.dispose();return false;}const m=found[0];if(m.material!==kit.lib.material('lattice_doors')||m.rotation.x||m.rotation.z||!m.visible||!m.scale.equals(new THREE.Vector3(1,1,1))||!sameGeometry(m.geometry,ref)||all.some(o=>o!==m&&o.geometry===m.geometry)){ref.dispose();return false;}targets.push(m);}
 ref.dispose();const low=buildingDetailQuality(kit.lib)==='low',mats=materials(kit),groups=[];
 for(let i=0;i<targets.length;i++){
  const source=targets[i],b=new THREE.Box3().setFromBufferAttribute(source.geometry.attributes.position),a=b.min.x,c=b.max.x,lo=b.min.y,hi=b.max.y,z0=b.min.z,z1=b.max.z,cut=lo+1.05,t=.1,gr=group(i,'rear');gr.position.copy(source.position);
  // All coordinates derive from the original Float32 local solid bounds.
  mesh(kit,gr,boundedBox(a,c,lo,cut,z0,z1),mats.stone,'high-masonry-sill');
  mesh(kit,gr,boundedBox(a+t,c-t,cut+t,hi-t,z1-.05,z1),mats.glass,'opaque-glass-backing');
  for(const[xa,xb,ya,yb]of[[a,a+t,cut,hi],[c-t,c,cut,hi],[a+t,c-t,cut,cut+t],[a+t,c-t,hi-t,hi]])mesh(kit,gr,boundedBox(xa,xb,ya,yb,z0,z1),mats.wood,'outer-window-frame');
  mesh(kit,gr,rectGrid(a+t,c-t,cut+t,hi-t,low?4:6,low?3:4,z0+.005,z0+.045),mats.wood,'large-rectangular-grille');groups.push(gr);
 }
 groups.forEach(gr=>frame.add(gr));for(const m of targets){m.removeFromParent();m.geometry.dispose();}
 g.chengqianSouthWindows={status,windowCount:4,sillHeight:1.05,closedCollision:'ORIGINAL_UNCHANGED',photographyDate:null};return true;
}
