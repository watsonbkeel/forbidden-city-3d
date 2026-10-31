import * as THREE from 'three';
import {applyBandUV} from '../../../utils/GeometryUV.js';

const profiles={
 24:{id:'lijingxuan',name:'储秀宫后殿',canonicalName:'丽景轩',canonicalId:'FC-A7ECBBD837',x:94.5,z:450.2,fields:3,split:3.57,photo:'https://img.dpm.org.cn/Uploads/Picture/dc/18008%5B1024%5D.jpg',sha256:'0fc63393392cd835e23399eca305affb73eedd16ce38ce36fc62314e767ebc74'},
 47:{id:'tongdaotang',name:'咸福宫后殿',canonicalName:'同道堂',canonicalId:'FC-0B25381D42',x:149.3,z:449.8,fields:2,split:3.03,photo:'https://img.dpm.org.cn/Uploads/Picture/dc/18015%5B1024%5D.jpg',sha256:'c7e93e5dc4f186007c74d2f65a1cf5b3de4743c4f099e6ddda1a037218dda090'},
};
const near=(a,b)=>Number.isFinite(a)&&Math.abs(a-b)<1e-7;
const unit=new THREE.Vector3(1,1,1);
const identity=o=>o?.visible&&o.matrixAutoUpdate&&o.position.lengthSq()===0&&!o.rotation.x&&!o.rotation.y&&!o.rotation.z&&o.scale.equals(unit);
const bay=26.2/5,width=bay-.68,floor=.45,height=(6.08-6.08*.12)*.8,z=-6.45;
const centers=[0,1,3,4].map(i=>-13.1+(i+.5)*bay);
// The sole existing metadata write must be possible before any source mesh is
// removed. Reject sealed records and accessor/prototype interception as well as
// an existing marker; never invoke an externally supplied setter after mutation.
function canAddWindowMetadata(record){
 if(!Object.isExtensible(record))return false;
 for(let o=record;o;o=Object.getPrototypeOf(o))if(Object.getOwnPropertyDescriptor(o,'westRearSouthWindows'))return false;
 return true;
}
function sameGeometry(a,b){
 if(!a||a.index||Object.keys(a.attributes).sort().join()!=='normal,position,uv'||Object.keys(a.morphAttributes).length||a.drawRange.start!==0||a.drawRange.count!==Infinity||JSON.stringify(a.groups)!==JSON.stringify(b.groups))return false;
 return Object.entries(b.attributes).every(([k,v])=>{const x=a.attributes[k];return x&&!x.isInterleavedBufferAttribute&&!x.normalized&&x.itemSize===v.itemSize&&x.array.constructor===v.array.constructor&&x.array.length===v.array.length&&x.array.every((n,i)=>n===v.array[i]);});
}
// Planar union of the frame and rectangular lattice. This removes coincident
// crossing faces rather than stacking hundreds of overlapping bar boxes.
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

// A single perforated sheet with clipped, disjoint diamond holes. The fitted
// diagonal rhythm is visible geometry, not a texture, and has no crossing faces.
function diagonalLattice(a,b,lo,hi){
 const shape=new THREE.Shape();shape.moveTo(a,lo);shape.lineTo(b,lo);shape.lineTo(b,hi);shape.lineTo(a,hi);shape.closePath();
 const clip=(poly,axis,limit,sign)=>{const out=[];for(let i=0;i<poly.length;i++){const p=poly[i],q=poly[(i+1)%poly.length],dp=sign*(p[axis]-limit),dq=sign*(q[axis]-limit);if(dp>=0)out.push(p);if((dp>=0)!==(dq>=0)){const t=dp/(dp-dq);out.push([p[0]+t*(q[0]-p[0]),p[1]+t*(q[1]-p[1])]);}}return out;};
 const spacing=.35,radius=.151,edge=.027;
 for(let row=-1;row<Math.ceil((hi-lo)/(spacing/2))+1;row++)for(let col=-1;col<Math.ceil((b-a)/spacing)+1;col++){
  const x=a+col*spacing+(row%2?spacing/2:0),y=lo+row*spacing/2;
  let poly=[[x-radius,y],[x,y+radius],[x+radius,y],[x,y-radius]];
  for(const [axis,limit,sign]of[[0,a+edge,1],[0,b-edge,-1],[1,lo+edge,1],[1,hi-edge,-1]])poly=clip(poly,axis,limit,sign);
  if(poly.length<3)continue;
  const area=Math.abs(poly.reduce((s,p,i)=>{const q=poly[(i+1)%poly.length];return s+p[0]*q[1]-q[0]*p[1];},0))/2;if(area<.0002)continue;
  const hole=new THREE.Path();hole.moveTo(...poly[0]);poly.slice(1).forEach(p=>hole.lineTo(...p));hole.closePath();shape.holes.push(hole);
 }
 return new THREE.ExtrudeGeometry(shape,{depth:.035,bevelEnabled:false,curveSegments:1,steps:1}).translate(0,0,z-.06);
}

/** Pure bounded post-builder opt-in. Call after buildHallBaseline has assigned
 * rearHall/structure and updateWorldMatrix(true,true), with the source itemIndex.
 * Only the four validated south closed-bay panels are replaced. No roof,
 * columns, central leaves, generic interior, map, room or physics is changed.
 */
export function applyWestRearSouthWindows(kit,frame,item,itemIndex){
 const p=profiles[itemIndex],g=frame?.userData.structure,r=frame?.userData.rearHall;
 if(!p)return false;
 const expected={kind:'hall',name:p.name,x:p.x,z:p.z,w:26.2,d:12.9,pad:.6,ph:.45,colH:6.08,roof:'gable',bays:5,rearHallProfile:p.id,map:'hall'};
 if(!item||Object.entries(expected).some(([k,v])=>item[k]!==v)||Object.keys(item).some(k=>!(k in expected))||!g||g.id!==`west-six/${p.id}`||g.profile!==p.id||g.name!==p.name||g.canonicalName!==p.canonicalName||g.storeys!==1||g.eaveCount!==1||!canAddWindowMetadata(g)||r?.id!==p.id||r.canonicalName!==p.canonicalName||['x','z','w','d'].some(k=>g[k]!==item[k]||r[k]!==item[k])||frame.parent!==kit?.root||kit.root.name!=='west-six'||!frame.visible||!frame.matrixAutoUpdate||!near(frame.position.x,item.x)||frame.position.y!==0||!near(frame.position.z,item.z)||frame.rotation.x||frame.rotation.y||frame.rotation.z||!frame.scale.equals(unit))return false;
 let scene=kit.root;for(let q=kit.root;q;q=q.parent){if(!identity(q))return false;scene=q;}
 const translation=new THREE.Matrix4().makeTranslation(item.x,0,item.z);
 if(!frame.matrix.equals(translation)||!frame.matrixWorld.equals(translation))return false;
 const all=[];scene.traverse(m=>{if(m.isMesh)all.push(m);});
 const material=kit.lib.material('lattice_doors'),tile=kit.lib.tileSize('lattice_doors');if(!Number.isFinite(tile)||tile<=0)return false;
 const reference=applyBandUV(new THREE.BoxGeometry(width,height,.14),tile),targets=[];
 for(const cx of centers){
  const matches=frame.children.filter(m=>m.isMesh&&near(m.position.x,cx)&&near(m.position.y,floor+height/2)&&near(m.position.z,z));
  if(matches.length!==1){reference.dispose();return false;}
  const m=matches[0],local=new THREE.Matrix4().makeTranslation(cx,floor+height/2,z),global=translation.clone().multiply(local),collider={min:[item.x+cx-bay/2,floor,item.z+z-.25],max:[item.x+cx+bay/2,floor+3,item.z+z+.25]};
  if(m.isInstancedMesh||m.isSkinnedMesh||m.material!==material||!m.visible||!m.castShadow||!m.receiveShadow||!m.matrixAutoUpdate||m.rotation.x||m.rotation.y||m.rotation.z||!m.scale.equals(unit)||!m.matrix.equals(local)||!m.matrixWorld.equals(global)||!sameGeometry(m.geometry,reference)||all.some(o=>o!==m&&o.geometry===m.geometry)||kit.colliders.filter(b=>['min','max'].every(k=>collider[k].every((n,i)=>near(b[k].getComponent(i),n)))).length!==1){reference.dispose();return false;}
  targets.push(m);
 }
 reference.dispose();
 const meta={itemIndex,canonicalId:p.canonicalId,canonicalName:p.canonicalName,windowCount:4,fieldsPerBay:p.fields,photo:p.photo,photoSHA256:p.sha256,photographyDate:null,status:'VERIFY_PENDING',accepted:false,scope:'EXACT_FOUR_SOUTH_CLOSED_BAYS_ONLY',dimensionStatus:'REVERSIBLE_PHOTO_FIT_NOT_SURVEYED',patternStatus:p.id==='tongdaotang'?'UPPER_RECTANGULAR_LATTICE_AND_LOWER_RECTANGULAR_GLAZED_SUBDIVISION':'SHORT_UPPER_DIAGONAL_LATTICE_AND_LARGE_LOWER_GLAZED_FIELDS',materialStatus:'OPAQUE_DARK_GLAZING_SURROGATE; EXACT_GLASS_TRANSMISSION_AND_BACKING_UNKNOWN',unknown:'Dimensions, fine lattice repeat, joins, paint, glazing properties and reverse remain unmeasured. Temporary access barriers and closed central doors in source photographs are intentionally not copied.',sillHeight:.9,splitY:p.split,southPlane:z,windowCenters:centers,windowWidth:width,windowTop:floor+height,collisions:'ORIGINAL_FOUR_CLOSED_BAY_COLLIDERS_UNCHANGED'};
 const owned=(name,color,roughness=.88)=>{const m=new THREE.MeshStandardMaterial({name:`west_rear_${p.id}_${name}`,color,roughness,metalness:0});kit.owned.push(m);return m;};
 const red=owned('frame',0x8b3028),stone=owned('sill',0x9d9b8e),dark=owned('upper_recess',0x242d29),glass=owned('glazing_fit',0x263e3d,.34),grille=p.id==='lijingxuan'?owned('diagonal_lattice',0x796e4b):null;
 for(let index=0;index<4;index++){
  const cx=centers[index],group=new THREE.Group();group.name=`${p.id}-south-sill-window`;group.userData.westRearSouthWindow={windowIndex:index,centerX:cx,...meta};frame.add(group);
  const mesh=(geo,mat,role)=>{const m=kit.mesh(group,geo,mat,0,0,0);m.name=`${p.id}-south-${role}`;m.userData.westRearSouthWindow={role,windowIndex:index,dimensionStatus:meta.dimensionStatus};return m;};
  const box=(a,b,c,d,e,f,mat,role)=>mesh(new THREE.BoxGeometry(b-a,d-c,f-e).translate((a+b)/2,(c+d)/2,(e+f)/2),mat,role);
  const x0=cx-width/2,x1=cx+width/2,bottom=floor+meta.sillHeight,top=floor+height,split=p.split,t=.10,leafW=(width-2*t)/p.fields;
  box(x0,x1,floor,bottom,z-.07,z+.07,stone,'masonry-sill');
  const rects=[[x0,x0+t,bottom,top],[x1-t,x1,bottom,top],[x0+t,x1-t,bottom,bottom+t],[x0+t,x1-t,top-t,top],[x0+t,x1-t,split-.055,split+.055]];
  for(let k=1;k<p.fields;k++){const x=x0+t+k*leafW;rects.push([x-.055,x+.055,bottom+t,top-t]);}
  for(let k=0;k<p.fields;k++){
   const a=x0+t+k*leafW+(k?.055:0),b=x0+t+(k+1)*leafW-(k<p.fields-1?.055:0),lo=split+.055,hi=top-t,low=bottom+t,high=split-.055;
   box(a,b,low,high,z-.015,z+.025,glass,'lower-glazed-field');
   box(a,b,lo,hi,z-.015,z+.025,dark,'upper-recess');
   if(p.id==='lijingxuan')mesh(diagonalLattice(a,b,lo,hi),grille,'upper-diagonal-lattice');
   else{
    // Only the large nested rectangular rhythm is interpreted. All counts are
    // fitted; tiny joints, carving, inscriptions and paint are not invented.
    const s=.032,cell=(b-a)/3;
    for(let j=0;j<3;j++){
     const left=a+j*cell+.065,right=a+(j+1)*cell-.065,bot=lo+.10+(j===1?.07:0),up=hi-.10-(j===1?.07:0);
     rects.push([left,left+s,bot,up],[right-s,right,bot,up],[left,right,bot,bot+s],[left,right,up-s,up]);
     rects.push([left+.10,left+.10+s,bot+.16,up-.16],[right-.10-s,right-.10,bot+.16,up-.16],[left+.10,right-.10,bot+.16,bot+.16+s],[left+.10,right-.10,up-.16-s,up-.16]);
    }
    for(const fraction of[.25,.5,.75]){const y=lo+(hi-lo)*fraction;rects.push([a,b,y-.014,y+.014]);}
    // Lower central rectangle and small peripheral bars reflect the visible
    // subdivision, not a fully claimed ornamental/joinery reconstruction.
    const left=a+(b-a)*.25,right=a+(b-a)*.75,bot=low+(high-low)*.23,up=low+(high-low)*.77;
    rects.push([left-.022,left+.022,low,high],[right-.022,right+.022,low,high],[a,b,bot-.022,bot+.022],[a,b,up-.022,up+.022]);
    for(const q of[.12,.88]){const x=a+(b-a)*q;rects.push([x-.017,x+.017,low,bot],[x-.017,x+.017,up,high]);}
   }
  }
  mesh(stripUnion(rects,z-.065,z-.025),red,'frame-and-rectangular-lattice');
 }
 for(const m of targets){m.removeFromParent();m.geometry.dispose();}
 g.westRearSouthWindows=meta;
 return true;
}
