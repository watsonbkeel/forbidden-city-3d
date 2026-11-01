import * as THREE from 'three';
import {applyBandUV} from '../../../utils/GeometryUV.js';

const expected={kind:'hall',x:-93,z:347.4,w:24,d:9.6,pad:.6,ph:.45,colH:6.08,roof:'gable',bays:5,rearHallProfile:'jingren-rear',map:'hall'};
const near=(a,b)=>Number.isFinite(a)&&Math.abs(a-b)<1e-7;
const unit=new THREE.Vector3(1,1,1);
const identity=o=>o?.visible&&o.matrixAutoUpdate&&o.position.lengthSq()===0&&!o.rotation.x&&!o.rotation.y&&!o.rotation.z&&o.scale.equals(unit);
const bay=24/5,width=bay-2*(bay*.07),floor=.45,height=(6.08-6.08*.12)*.8,z=-9.6/2;
const centers=[0,1,3,4].map(i=>-12+(i+.5)*bay);
function sameGeometry(a,b){
 if(!a||a.index||Object.keys(a.attributes).sort().join()!=='normal,position,uv'||Object.keys(a.morphAttributes).length||a.drawRange.start!==0||a.drawRange.count!==Infinity||JSON.stringify(a.groups)!==JSON.stringify(b.groups))return false;
 return Object.entries(b.attributes).every(([k,v])=>{const x=a.attributes[k];return x&&!x.isInterleavedBufferAttribute&&!x.normalized&&x.itemSize===v.itemSize&&x.array.constructor===v.array.constructor&&x.array.length===v.array.length&&x.array.every((n,i)=>n===v.array[i]);});
}
// One planar union of the local orthogonal strips, extruded once. No stacked
// coplanar frame/motif boxes, internal overlap faces, or duplicate front faces.
function stripUnion(rectangles,z0,z1){
 const axes=k=>[...new Set(rectangles.flatMap(r=>[r[k],r[k+1]]).map(v=>+v.toFixed(7)))].sort((a,b)=>a-b),xs=axes(0),ys=axes(2),nx=xs.length-1,ny=ys.length-1;
 const filled=Array.from({length:nx},()=>new Array(ny).fill(false));
 for(let x=0;x<nx;x++)for(let y=0;y<ny;y++){const cx=(xs[x]+xs[x+1])/2,cy=(ys[y]+ys[y+1])/2;filled[x][y]=rectangles.some(([a,b,c,d])=>cx>a-1e-8&&cx<b+1e-8&&cy>c-1e-8&&cy<d+1e-8);}
 const pos=[],normal=[],uv=[],face=(p,n)=>{for(const i of[0,1,2,0,2,3]){pos.push(...p[i]);normal.push(...n);uv.push(p[i][0],p[i][1]);}},at=(x,y)=>filled[x]?.[y]??false,used=Array.from({length:nx},()=>new Array(ny).fill(false));
 for(let y=0;y<ny;y++)for(let x=0;x<nx;x++)if(at(x,y)&&!used[x][y]){let r=x+1,t=y+1;while(r<nx&&at(r,y)&&!used[r][y])r++;while(t<ny&&Array.from({length:r-x},(_,i)=>x+i).every(i=>at(i,t)&&!used[i][t]))t++;for(let i=x;i<r;i++)for(let j=y;j<t;j++)used[i][j]=true;const a=xs[x],b=xs[r],c=ys[y],d=ys[t];face([[a,c,z0],[a,d,z0],[b,d,z0],[b,c,z0]],[0,0,-1]);face([[a,c,z1],[b,c,z1],[b,d,z1],[a,d,z1]],[0,0,1]);}
 for(let x=0;x<=nx;x++)for(const sign of[-1,1]){const exposed=y=>sign<0?at(x,y)&&!at(x-1,y):at(x-1,y)&&!at(x,y);for(let y=0;y<ny;){if(!exposed(y)){y++;continue;}const start=y;while(y<ny&&exposed(y))y++;const a=xs[x],c=ys[start],d=ys[y];if(sign<0)face([[a,c,z0],[a,c,z1],[a,d,z1],[a,d,z0]],[-1,0,0]);else face([[a,c,z0],[a,d,z0],[a,d,z1],[a,c,z1]],[1,0,0]);}}
 for(let y=0;y<=ny;y++)for(const sign of[-1,1]){const exposed=x=>sign<0?at(x,y)&&!at(x,y-1):at(x,y-1)&&!at(x,y);for(let x=0;x<nx;){if(!exposed(x)){x++;continue;}const start=x;while(x<nx&&exposed(x))x++;const a=xs[start],b=xs[x],c=ys[y];if(sign<0)face([[a,c,z0],[b,c,z0],[b,c,z1],[a,c,z1]],[0,-1,0]);else face([[a,c,z0],[a,c,z1],[b,c,z1],[b,c,z0]],[0,1,0]);}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(normal,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeBoundingBox();g.computeBoundingSphere();return g;
}

/** Post-build opt-in for east-six/items/3 only. This is the rear HALL, not
 * the main hall's R40 north glazing or its separate south-window helper.
 * R39 structure/physics and all non-window meshes are left unchanged.
 */
export function applyJingrenRearWindows(kit,frame,item){
 const g=frame?.userData.structure,r=frame?.userData.rearHall;
 if(!item||Object.entries(expected).some(([k,v])=>item[k]!==v)||Object.keys(item).some(k=>!(k in expected))||!g||g.id!=='east-six/jingren-rear'||g.profile!=='jingren-rear'||g.canonicalName!=='景仁宫后殿'||g.storeys!==1||g.eaveCount!==1||g.jingrenRearWindows||r?.id!=='jingren-rear'||['x','z','w','d'].some(k=>g[k]!==item[k]||r[k]!==item[k])||frame.parent!==kit?.root||kit.root.name!=='east-six'||!frame.visible||!frame.matrixAutoUpdate||!near(frame.position.x,item.x)||frame.position.y!==0||!near(frame.position.z,item.z)||frame.rotation.x||frame.rotation.y||frame.rotation.z||!frame.scale.equals(unit))return false;
 let scene=kit.root;for(let p=kit.root;p;p=p.parent){if(!identity(p))return false;scene=p;}
 const translation=new THREE.Matrix4().makeTranslation(item.x,0,item.z);
 if(!frame.matrix.equals(translation)||!frame.matrixWorld.equals(translation))return false;
 const all=[];scene.traverse(m=>{if(m.isMesh)all.push(m);});
 const material=kit.lib.material('lattice_doors'),tile=kit.lib.tileSize('lattice_doors');if(!Number.isFinite(tile)||tile<=0)return false;
 const reference=applyBandUV(new THREE.BoxGeometry(width,height,.14),tile),targets=[];
 for(const cx of centers){
  const matches=frame.children.filter(m=>m.isMesh&&near(m.position.x,cx)&&near(m.position.y,floor+height/2)&&near(m.position.z,z));
  if(matches.length!==1){reference.dispose();return false;}
  const m=matches[0],collider={min:[item.x+cx-bay/2,floor,item.z+z-.25],max:[item.x+cx+bay/2,floor+3,item.z+z+.25]};
  if(m.isInstancedMesh||m.isSkinnedMesh||m.material!==material||!m.visible||!m.castShadow||!m.receiveShadow||!m.matrixAutoUpdate||m.rotation.x||m.rotation.y||m.rotation.z||!m.scale.equals(unit)||!sameGeometry(m.geometry,reference)||all.some(o=>o!==m&&o.geometry===m.geometry)||kit.colliders.filter(b=>['min','max'].every(k=>collider[k].every((n,i)=>near(b[k].getComponent(i),n)))).length!==1){reference.dispose();return false;}
  targets.push(m);
 }
 reference.dispose();
 const meta={windowCount:4,lowerFieldsPerBay:3,source:'https://www.dpm.org.cn/explore/building/236509.html',photos:['https://img.dpm.org.cn/Uploads/Picture/2020/04/20/s5e9d16b8c46ab.jpg','https://img.dpm.org.cn/Uploads/Picture/2020/04/20/s5e9d16b8c7345.jpg'],photographyDate:null,status:'VERIFY_PENDING',accepted:false,scope:'FOUR_REAR_HALL_SOUTH_CLOSED_BAYS_ONLY',dimensionStatus:'REVERSIBLE_PHOTO_FIT_NOT_SURVEYED',patternStatus:'THREE_VERTICAL_FIELDS_WITH_SHORT_UPPER_RECTILINEAR_STEP_RUNS; FINE_REPEAT_AND_JOINERY_UNRESOLVED',materialStatus:'PALE_OPAQUE_LOWER_FIELD_FIT; GLASS_PAPER_BACKING_AND_REVERSE_UNKNOWN',unknown:'Exact dimensions, repeat counts, joinery, historic paint, lower material and reverse elevation remain unknown. No interior or full-E acceptance.',sillHeight:1.0,splitHeight:2.7,southPlane:z,windowCenters:centers,windowWidth:width,windowTop:floor+height,collisions:'R39_CLOSED_WINDOW_COLLIDERS_UNCHANGED'};
 const owned=(name,color)=>{const m=new THREE.MeshStandardMaterial({name,color,roughness:.88,metalness:0});kit.owned.push(m);return m;};
 const red=owned('jingren_rear_red_frame_fit',0x8e3027),stone=owned('jingren_rear_masonry_fit',0x8c8980),pale=owned('jingren_rear_pale_lower_fit',0xb3c4c7),dark=owned('jingren_rear_upper_recess_fit',0x56615b);
 for(let index=0;index<4;index++){
  const cx=centers[index],group=new THREE.Group();group.name='jingren-rear-south-sill-window';group.userData.jingrenRearWindow={windowIndex:index,...meta};frame.add(group);
  const mesh=(geo,mat,role)=>{const m=kit.mesh(group,geo,mat,0,0,0);m.name='jingren-rear-'+role;m.userData.jingrenRearWindow={role,windowIndex:index,dimensionStatus:meta.dimensionStatus};return m;};
  const box=(a,b,c,d,e,f,mat,role)=>mesh(new THREE.BoxGeometry(b-a,d-c,f-e).translate((a+b)/2,(c+d)/2,(e+f)/2),mat,role);
  const x0=cx-width/2,x1=cx+width/2,bottom=floor+meta.sillHeight,top=floor+height,split=floor+meta.splitHeight,t=.10,innerW=width-2*t,leafW=innerW/3;
  box(x0,x1,floor,bottom,z-.18,z+.18,stone,'high-masonry-sill');
  const rects=[[x0,x0+t,bottom,top],[x1-t,x1,bottom,top],[x0+t,x1-t,bottom,bottom+t],[x0+t,x1-t,top-t,top],[x0+t,x1-t,split-.05,split+.05]];
  for(let k=1;k<3;k++){const x=x0+t+k*leafW;rects.push([x-.045,x+.045,bottom+t,top-t]);}
  for(let k=0;k<3;k++){
   const a=x0+t+k*leafW+(k?.045:0),b=x0+t+(k+1)*leafW-(k<2?.045:0),lo=split+.05,hi=top-t;
   box(a,b,bottom+t,split-.05,z-.025,z+.035,pale,'pale-lower-field');
   box(a,b,lo,hi,z-.025,z+.035,dark,'upper-recess');
   // The photographed rear windows have a short upper patterned band over
   // plain pale lower fields. Fit three offset rectangular step runs there;
   // never carry Jingyang-style long straight runs through the lower field.
   const s=.034,span=(b-a-.14)/3;
   for(let j=0;j<3;j++){
    const left=a+.07+j*span+.025,right=left+span-.05,y0=lo+.12+(j===1?.08:0),y1=hi-.12-(j===1?.08:0),step=(right-left)*.42;
    rects.push([left,left+s,y0,y1],[right-s,right,y0+.14,y1-.14],[left,right-step,y0,y0+s],[left+step,right,y1-s,y1],[right-step-s,right-step,y0,y0+.19],[left+step,left+step+s,y1-.19,y1],[left,right-step,y0+.19-s,y0+.19],[left+step,right,y1-.19,y1-.19+s]);
    // A second, offset inner run gives the nested step relationship visible
    // in 05/06, rather than claiming an exact fine repeat count.
    const il=left+.07,ir=right-.07,ib=y0+.23,it=y1-.23,thin=.026;
    rects.push([il,il+thin,ib,it],[ir-thin,ir,ib+.08,it-.08],[il,ir,ib,ib+thin],[il,ir,it-thin,it]);
   }
  }
  mesh(stripUnion(rects,z-.18,z-.04),red,'upper-step-frame');
 }
 for(const m of targets){m.removeFromParent();m.geometry.dispose();}
 g.jingrenRearWindows=meta;
 return true;
}
