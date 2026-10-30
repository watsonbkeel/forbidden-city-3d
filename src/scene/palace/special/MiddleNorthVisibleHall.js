import * as T from 'three';
// Geometry algorithms are shared in shape with Xiehe; no Xiehe dimensions or
// historical member count is reused. Each roof is sampled from its own tile mesh.
const EPS=1e-6;
const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
function split(poly,axis,bound,sign){
 const inside=[],outside=[];
 for(let i=0;i<poly.length;i++){
  const a=poly[i],b=poly[(i+1)%poly.length],da=(a[axis]-bound)*sign,db=(b[axis]-bound)*sign;
  (da>=0?inside:outside).push(a);
  if((da>=0)!==(db>=0)){const p=mix(a,b,da/(da-db));inside.push(p);outside.push(p);}
 }
 return{inside,outside};
}
function clip(poly,bounds,keepInside){
 let pending=poly;const outside=[];
 for(const[axis,bound,sign]of[[0,bounds[0],1],[0,bounds[1],-1],[2,bounds[2],1],[2,bounds[3],-1]]){
  if(!pending.length)break;const parts=split(pending,axis,bound,sign);if(parts.outside.length>=3)outside.push(parts.outside);pending=parts.inside;
 }
 return keepInside?(pending.length>=3?[pending]:[]):outside;
}
function vertices(g,i){return [0,1,2].map(k=>{const j=i+k;return[...new T.Vector3().fromBufferAttribute(g.attributes.position,j).toArray(),...new T.Vector3().fromBufferAttribute(g.attributes.normal,j).toArray(),g.attributes.uv.getX(j),g.attributes.uv.getY(j)];});}
function emit(poly,out,reverse=false,lower=0){
 for(let i=1;i<poly.length-1;i++){
  const tri=reverse?[poly[0],poly[i+1],poly[i]]:[poly[0],poly[i],poly[i+1]];
  if(new T.Triangle(...tri.map(p=>new T.Vector3(...p.slice(0,3)))).getArea()<1e-9)continue;
  for(const p of tri){out.p.push(p[0],p[1]-lower,p[2]);out.n.push(...p.slice(3,6).map(v=>reverse?-v:v));out.uv.push(p[6],p[7]);}
 }
}
const buffers=()=>({p:[],n:[],uv:[]});
function geometry(a){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(a.p,3));g.setAttribute('normal',new T.Float32BufferAttribute(a.n,3));g.setAttribute('uv',new T.Float32BufferAttribute(a.uv,2));return g;}
function surfaceY(triangles,x,z){
 let result=-Infinity;
 for(const v of triangles){const[a,b,c]=v,den=(b[2]-c[2])*(a[0]-c[0])+(c[0]-b[0])*(a[2]-c[2]);if(Math.abs(den)<1e-9)continue;
  const u=((b[2]-c[2])*(x-c[0])+(c[0]-b[0])*(z-c[2]))/den,w=((c[2]-a[2])*(x-c[0])+(a[0]-c[0])*(z-c[2]))/den,t=1-u-w;
  if(Math.min(u,w,t)>=-EPS)result=Math.max(result,u*a[1]+w*b[1]+t*c[1]);
 }
 if(!Number.isFinite(result))throw Error('Middle north visible timber left retained tile surface');return result;
}
// One continuous eight-sided curved member, not eight individually capped
// cylinders. Same fitted stations/radius, no hidden caps at internal joins.
function curvedRafter(points,radius){
 const positions=[],uv=[],indices=[],radial=8,n=points.length;
 const tangent=i=>points[Math.min(n-1,i+1)].clone().sub(points[Math.max(0,i-1)]).normalize();
 for(let i=0;i<n;i++){const cross=new T.Vector3().crossVectors(tangent(i),new T.Vector3(1,0,0));for(let j=0;j<radial;j++){const a=j*Math.PI*2/radial,p=points[i].clone().add(new T.Vector3(radius*Math.cos(a),0,0)).addScaledVector(cross,radius*Math.sin(a));positions.push(...p.toArray());uv.push(j/radial,i/(n-1));}}
 for(let i=0;i<n-1;i++)for(let j=0;j<radial;j++){const a=i*radial+j,b=i*radial+(j+1)%radial,c=a+radial,d=b+radial;indices.push(a,b,c,b,d,c);}
 for(const end of[0,n-1]){const center=positions.length/3;positions.push(...points[end].toArray());uv.push(.5,.5);const ring=positions.length/3;for(let j=0;j<radial;j++){const at=(end*radial+j)*3;positions.push(...positions.slice(at,at+3));uv.push(.5+.5*Math.cos(j*Math.PI*2/radial),.5+.5*Math.sin(j*Math.PI*2/radial));}for(let j=0;j<radial;j++){const a=ring+j,b=ring+(j+1)%radial;indices.push(...(end===0?[center,b,a]:[center,a,b]));}}
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geometry.setIndex(indices);geometry.computeVertexNormals();return geometry;
}
const RECORDS={12:{name:'中左门',x:-77,id:'FC-DFB682AF14',group:25,image:'zhongzuo-north-near-u.jpg'},14:{name:'中右门',x:80,id:'FC-85E0528ECA',group:19,image:'zhongyou-north-u.jpg'}};
const area=p=>Math.abs(p.reduce((s,a,i)=>{const b=p[(i+1)%p.length];return s+a[0]*b[2]-b[0]*a[2]},0))/2;
function overlap(a,b){
 let p=a;const signed=b.reduce((s,v,i)=>s+v[0]*b[(i+1)%b.length][2]-b[(i+1)%b.length][0]*v[2],0),sign=Math.sign(signed);
 for(let j=0;j<b.length&&p.length;j++){const u=b[j],v=b[(j+1)%b.length],d=q=>sign*((v[0]-u[0])*(q[2]-u[2])-(v[2]-u[2])*(q[0]-u[0])),out=[];for(let i=0;i<p.length;i++){const q=p[i],r=p[(i+1)%p.length],dq=d(q),dr=d(r);if(dq>=0)out.push(q);if((dq>=0)!==(dr>=0))out.push(mix(q,r,dq/(dq-dr)));}p=out;}
 return p.length>=3?area(p):0;
}
/** Own-source bounded north central porch only. Dimensions and member spacing
 * are engineering fits. No hidden joints, side-bay timber or purlin census. */
export function fitMiddleNorthVisibleHall(kit,frame,{zoneId,itemIndex,item}){
 const record=RECORDS[itemIndex];if(zoneId!=='axis-courts'||!record)return null;
 const fail=reason=>{throw Error('Middle north '+reason)};
 if(!item||item.name!==record.name||item.x!==record.x||item.z!==-12.2||item.style!=='hall'||item.rot!==undefined||item.gateProfile!==undefined)fail('identity changed');
 const roofs=frame.children.filter(m=>m.name==='roof_xieshan');if(roofs.length!==1)fail('roof owner changed');const roof=roofs[0];
 const identity=m=>m.position.lengthSq()===0&&m.quaternion.equals(new T.Quaternion())&&m.scale.equals(new T.Vector3(1,1,1));
 if(!identity(roof)||!Number.isFinite(roof.userData.topY)||!Number.isFinite(roof.userData.eaveY)||roof.userData.topY<=7.25)fail('roof frame changed');
 const caps=[],tiles=[];roof.traverse(m=>{if(m.isMesh&&m.material===kit.lib.material('rafters'))caps.push(m);if(m.isMesh&&m.material===kit.lib.material('roof_tile'))tiles.push(m)});
 if(caps.length!==1||tiles.length!==1)fail('roof mesh owners changed');
 const cap=caps[0],tile=tiles[0],old=cap.geometry;
 for(const m of[cap,tile]){const g=m.geometry;if(m.parent!==roof||!identity(m)||g.index||g.attributes.position.count%3||!g.attributes.normal||!g.attributes.uv||Object.values(g.attributes).some(a=>Array.from(a.array).some(v=>!Number.isFinite(v))))fail('roof geometry changed');}
 const bounds=[-2.35,2.35,.30,3.0],out=buffers(),inner=buffers(),flat=[],triangles=[],patches=[];
 for(let i=0;i<old.attributes.position.count;i+=3){const v=vertices(old,i);if(v.every(p=>Math.abs(p[1]-7.25)<EPS&&p[4]<-.99)){flat.push(v);for(const p of clip(v,bounds,false))emit(p,out);}else emit(v,out);}
 const key=tri=>tri.map(p=>`${p[0]},${p[2]}`).sort().join('|'),hw=Math.fround(6.45),hd=Math.fround(3.45),corners=[[-hw,0,-hd],[hw,0,-hd],[hw,0,hd],[-hw,0,hd]];
 if(flat.length!==4||JSON.stringify(flat.map(key).sort())!==JSON.stringify(corners.map((p,i)=>key([[0,0,0],p,corners[(i+1)%4]])).sort()))fail('retained cap footprint changed');
 for(let i=0;i<tile.geometry.attributes.position.count;i+=3){const v=vertices(tile.geometry,i);triangles.push(v);for(const p of clip(v,bounds,true))if(area(p)>1e-10){patches.push(p);emit(p,inner,true,.15);}}
 // Positive-area complete coverage plus non-overlap proves there is no hole;
 // a few sampled rays alone cannot certify a changed retained tile mesh.
 if(Math.abs(patches.reduce((n,p)=>n+area(p),0)-4.7*2.7)>1e-5)fail('incomplete retained tile coverage');
 for(let i=0;i<patches.length;i++)for(let j=0;j<i;j++)if(overlap(patches[i],patches[j])>1e-7)fail('overlapping retained tile coverage');
 const group=new T.Group();group.name='middle-north-visible-hall';group.userData={role:group.name,objectId:record.id,sourceGroup:record.group,sourceImage:record.image,wholeObjectAccepted:false,scope:'OWN_NORTH_CENTRAL_VISIBLE_TIMBER_ONLY',opening:bounds,dimensionStatus:'INHERITED_UNMEASURED',memberDensity:'ENGINEERING_FIT_NOT_PHOTO_CENSUS',remaining:'Porch depth, side bays, hidden joints, full structure, ramps/rails and real GPU remain unverified'};
 const red=new T.MeshStandardMaterial({color:0x681e16,roughness:.85,name:'middle-north-red-fit'}),paint=kit.lib.material('caihua_beam'),geometries=[];let replacement;
 const add=(geo,mat,role)=>{geometries.push(geo);const m=new T.Mesh(geo,mat);m.name=role;m.userData.role=role;m.castShadow=m.receiveShadow=true;group.add(m);return m;};
 try{
  add(geometry(inner),red,'middle-north-sloped-inner-boards');
  for(let x=-2.17;x<2.18;x+=.27){const points=Array.from({length:13},(_,i)=>{const z=.4+2.5*i/12;return new T.Vector3(x,surfaceY(triangles,x,z)-.255,z)});add(curvedRafter(points,.065),red,'middle-north-red-rafter');}
  // Coarse visible support types only, no invented dougong/tenons.
  for(const z of[.65,2.65]){const y=Math.min(surfaceY(triangles,-2.3,z),surfaceY(triangles,2.3,z))-.55;const m=add(new T.BoxGeometry(4.6,.22,.20),paint,'middle-north-painted-cross-support');m.position.set(0,y,z);}
  for(const x of[-2.12,2.12]){const points=Array.from({length:13},(_,i)=>{const z=.65+2*i/12;return new T.Vector3(x,surfaceY(triangles,x,z)-.45,z)});add(curvedRafter(points,.10),paint,'middle-north-painted-long-support');}
  group.updateMatrixWorld(true);
  // Validate the entire generated envelope, not just rafter centre lines.
  group.traverse(m=>{if(!m.isMesh)return;const p=m.geometry.attributes.position;for(let i=0;i<p.count;i++){const v=new T.Vector3().fromBufferAttribute(p,i).applyMatrix4(m.matrixWorld);if(v.y<=7.25||v.y>=surfaceY(triangles,v.x,v.z)-.025)fail('generated member outside safe roof/headroom envelope '+JSON.stringify({role:m.name,point:v.toArray(),tileY:surfaceY(triangles,v.x,v.z)}));}});
  replacement=geometry(out);
 }catch(error){for(const g of geometries)g.dispose();replacement?.dispose();red.dispose();throw error;}
 cap.geometry=replacement;old.dispose();kit.owned.push(red);frame.add(group);frame.userData.structure={...frame.userData.structure,visibleNorthHall:{...group.userData}};return group;
}
