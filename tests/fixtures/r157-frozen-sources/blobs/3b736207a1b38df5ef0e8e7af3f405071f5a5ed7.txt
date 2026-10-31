import * as T from 'three';
import {applyBoxUV} from '../../../utils/GeometryUV.js';
const SOURCE='https://www.dpm.org.cn/explore/building/236553.html';
const PHOTO='https://img.dpm.org.cn/Uploads/Picture/2020/04/20/s5e9d4b10ccc6f.jpg';
const near=(a,b)=>Number.isFinite(a)&&Math.abs(a-b)<1e-8;
const unit=new T.Vector3(1,1,1);
const identity=o=>o?.visible&&o.matrixAutoUpdate&&!o.position.lengthSq()&&!o.rotation.x&&!o.rotation.y&&!o.rotation.z&&o.scale.equals(unit);
const reject=()=>{throw Error('Hongde paired window source mismatch');};
function writable(record){if(!Object.isExtensible(record))return false;for(let o=record;o;o=Object.getPrototypeOf(o))if(Object.getOwnPropertyDescriptor(o,'hongdeSillWindows'))return false;return true;}
// Local planar union avoids overlapping bar faces; no shared generator changes.
function stripUnion(rectangles,z0,z1){
 const axes=k=>[...new Set(rectangles.flatMap(r=>[r[k],r[k+1]]).map(v=>+v.toFixed(7)))].sort((a,b)=>a-b),xs=axes(0),ys=axes(2),nx=xs.length-1,ny=ys.length-1;
 const filled=Array.from({length:nx},()=>new Array(ny).fill(false));
 for(let x=0;x<nx;x++)for(let y=0;y<ny;y++){const cx=(xs[x]+xs[x+1])/2,cy=(ys[y]+ys[y+1])/2;filled[x][y]=rectangles.some(([a,b,c,d])=>cx>a-1e-8&&cx<b+1e-8&&cy>c-1e-8&&cy<d+1e-8);}
 const pos=[],normal=[],uv=[],face=(p,n)=>{for(const i of[0,1,2,0,2,3]){pos.push(...p[i]);normal.push(...n);uv.push(p[i][0],p[i][1]);}},at=(x,y)=>filled[x]?.[y]??false,used=Array.from({length:nx},()=>new Array(ny).fill(false));
 for(let y=0;y<ny;y++)for(let x=0;x<nx;x++)if(at(x,y)&&!used[x][y]){let r=x+1,t=y+1;while(r<nx&&at(r,y)&&!used[r][y])r++;while(t<ny&&Array.from({length:r-x},(_,i)=>x+i).every(i=>at(i,t)&&!used[i][t]))t++;for(let i=x;i<r;i++)for(let j=y;j<t;j++)used[i][j]=true;const a=xs[x],b=xs[r],c=ys[y],d=ys[t];face([[a,c,z0],[a,d,z0],[b,d,z0],[b,c,z0]],[0,0,-1]);face([[a,c,z1],[b,c,z1],[b,d,z1],[a,d,z1]],[0,0,1]);}
 for(let x=0;x<=nx;x++)for(const sign of[-1,1]){const exposed=y=>sign<0?at(x,y)&&!at(x-1,y):at(x-1,y)&&!at(x,y);for(let y=0;y<ny;){if(!exposed(y)){y++;continue;}const start=y;while(y<ny&&exposed(y))y++;const a=xs[x],c=ys[start],d=ys[y];if(sign<0)face([[a,c,z0],[a,c,z1],[a,d,z1],[a,d,z0]],[-1,0,0]);else face([[a,c,z0],[a,d,z0],[a,d,z1],[a,c,z1]],[1,0,0]);}}
 for(let y=0;y<=ny;y++)for(const sign of[-1,1]){const exposed=x=>sign<0?at(x,y)&&!at(x,y-1):at(x,y-1)&&!at(x,y);for(let x=0;x<nx;){if(!exposed(x)){x++;continue;}const start=x;while(x<nx&&exposed(x))x++;const a=xs[start],b=xs[x],c=ys[y];if(sign<0)face([[a,c,z0],[b,c,z0],[b,c,z1],[a,c,z1]],[0,-1,0]);else face([[a,c,z0],[a,c,z1],[b,c,z1],[b,c,z0]],[0,1,0]);}}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('normal',new T.Float32BufferAttribute(normal,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.computeBoundingBox();g.computeBoundingSphere();return g;
}


/** Three leaves in EACH side sill window, not the four central door leaves.
 * Existing opaque closed-window envelopes remain; infill material is unknown. */
export function applyHongdeSillWindows(kit,frame,p){
 const g=frame?.userData.structure;
 if(g?.id!=='garden/hongde-exterior')return false;
 if(g.hongdeSillWindows)return false;
 const expected={id:'hongde-exterior-photo-fit-r75',x:37.5,z:326,width:16,bays:3,floorY:.14,facadeZ:-3.6,frontZ:-6.8,rearZ:6.6,columnHeight:4.3,doorWidth:2.8};
 if(Object.entries(expected).some(([k,v])=>p?.[k]!==v)||!writable(g)||frame.parent!==kit.root||kit.root.parent||!identity(kit.root)||!frame.visible||!frame.matrixAutoUpdate||frame.position.x!==p.x||frame.position.y||frame.position.z!==p.z||frame.rotation.x||frame.rotation.y||frame.rotation.z||!frame.scale.equals(unit))reject();
 const width=16/3-.35,height=2.5,cy=.14+2.05,z=-3.6,bottom=cy-height/2,top=cy+height/2;
 const targets=[],ref=applyBoxUV(new T.BoxGeometry(width,height,.18),kit.lib.tileSize('lattice_doors')),meshes=[];kit.root.traverse(m=>{if(m.isMesh)meshes.push(m);});
 try{for(const side of[-1,1]){
  const x=side*16/3,found=frame.children.filter(m=>m.isMesh&&near(m.position.x,x)&&near(m.position.y,cy)&&near(m.position.z,z));if(found.length!==1)reject();const m=found[0],a=m.geometry;
  if(m.material!==kit.lib.material('lattice_doors')||!m.visible||!m.matrixAutoUpdate||m.rotation.x||m.rotation.y||m.rotation.z||!m.scale.equals(unit)||meshes.some(q=>q!==m&&q.geometry===a)||a.index||Object.keys(a.morphAttributes).length||a.drawRange.start||a.drawRange.count!==Infinity||JSON.stringify(a.groups)!==JSON.stringify(ref.groups)||Object.keys(a.attributes).length!==3||Object.entries(ref.attributes).some(([key,b])=>{const v=a.attributes[key];return !v||v.isInterleavedBufferAttribute||v.normalized!==b.normalized||v.itemSize!==b.itemSize||v.count!==b.count||v.array.constructor!==b.array.constructor||v.array.some((n,i)=>n!==b.array[i]);}))reject();
  const lo=[p.x+x-width/2,bottom,p.z+z-.09],hi=[p.x+x+width/2,top,p.z+z+.09];if(kit.colliders.filter(c=>['min','max'].every((k,j)=>(j?hi:lo).every((v,i)=>near(c[k].getComponent(i),v)))).length!==1)reject();targets.push(m);
 }}finally{ref.dispose();}
 const group=new T.Group();group.name='hongde-paired-sill-windows';const geos=[],mats=[],originalChildren=[...frame.children],originalOwned=[...kit.owned];
 try{
  const red=new T.MeshStandardMaterial({name:'hongde_fitted_red_window_frame',color:0x79372f,roughness:.82});mats.push(red);const dark=new T.MeshStandardMaterial({name:'hongde_opaque_infill_lower_material_unknown',color:0x414c49,roughness:.63});mats.push(dark);const light=new T.MeshStandardMaterial({name:'hongde_opaque_infill_upper_material_unknown',color:0x8a8b81,roughness:.63});mats.push(light);
  const add=(geo,mat,side,role,leaf=null,field=null)=>{geos.push(geo);const m=kit.mesh(group,geo,mat,0,0,0);m.userData.hongdeSillWindow={side,role,leaf,field};m.name='hongde-window-'+role;return m;};
  for(const side of[-1,1]){
   const x=side*16/3,a=x-width/2,b=x+width/2,t=.085,split=cy,leafW=(width-2*t)/3;
   for(const field of[0,1])add(new T.BoxGeometry(width,height/2,.12).translate(x,cy+(field?1:-1)*height/4,z+.03),field?light:dark,side,'opaque-infill',null,field);
   const frameRects=[[a,a+t,bottom,top],[b-t,b,bottom,top],[a+t,b-t,bottom,bottom+t],[a+t,b-t,top-t,top],[a+t,b-t,split-t/2,split+t/2]];
   for(let k=1;k<3;k++){const xx=a+t+k*leafW;frameRects.push([xx-t/2,xx+t/2,bottom+t,top-t]);}
   add(stripUnion(frameRects,z-.09,z-.03),red,side,'frame');
   for(let leaf=0;leaf<3;leaf++)for(let field=0;field<2;field++){
    const left=a+t+leaf*leafW-(leaf?t/2:0),right=a+t+(leaf+1)*leafW+(leaf<2?t/2:0),lo=field?split:bottom+t,hi=field?top-t:split,W=right-left,H=hi-lo,s=.029,rects=[];
    // Three nested rectangular turns joined to each other AND their field frame.
    // Counts/proportions are fitted simplification, not measured historic joints.
    for(const [ix,iy]of[[.12,.10],[.29,.16],[.41,.22]]){const l=left+W*ix,r=right-W*ix,d=lo+H*iy,u=hi-H*iy;rects.push([l,l+s,d,u],[r-s,r,d,u],[l,r,d,d+s],[l,r,u-s,u]);}
    // Offset end bridges join all turns to the field frame without a full
    // central cross. Hidden joint endpoints remain a disclosed topology fit.
    const xt=left+W*.46,xb=left+W*.54;
    rects.push([xt-s/2,xt+s/2,hi-H*.22-s,field?hi:hi-t/2],[xb-s/2,xb+s/2,field?lo+t/2:lo,lo+H*.22+s]);
    add(stripUnion(rects,z-.09,z-.03),red,side,'connected-fret',leaf,field);
   }
  }
  frame.add(group);kit.owned.push(...mats);for(const m of targets)frame.remove(m);
  g.hongdeSillWindows={source:SOURCE,photo:PHOTO,photographyDate:null,objectId:'FC-D0970B114A',scope:'TWO_SIDE_SILL_WINDOWS_ONLY',leavesPerWindow:3,fieldsPerLeaf:2,dimensions:'RETAINED_R75_ENVELOPE_NOT_SURVEY',pattern:'CONNECTED_RECTANGULAR_RHYTHM_PHOTO_FIT_NOT_EXACT_CARVING',infill:'OPAQUE_GRAY_SURROGATE_LIGHTER_UPPER_DARKER_LOWER_GLASS_PAPER_AND_TRANSMISSION_UNKNOWN',upperTransoms:'RETAINED_UNMODELED_DETAIL',centralDoor:'RETAINED_VIRTUAL_OPEN_NOT_PHOTOGRAPHED_STATE',wholeObjectAccepted:false};
 }catch(error){T.Object3D.prototype.remove.call(frame,group);for(const m of originalChildren)m.parent=frame;Array.prototype.splice.call(frame.children,0,frame.children.length,...originalChildren);Array.prototype.splice.call(kit.owned,0,kit.owned.length,...originalOwned);delete g.hongdeSillWindows;for(const v of new Set(geos))v.dispose();for(const v of mats)v.dispose();throw error;}
 for(const m of targets)m.geometry.dispose();return true;
}
