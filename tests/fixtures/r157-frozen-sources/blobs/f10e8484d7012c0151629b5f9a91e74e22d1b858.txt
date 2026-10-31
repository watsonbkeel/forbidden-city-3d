import * as T from 'three';

// Own east vestibule views 2054726937421385730 (2-u/f/b). This is a
// bounded visible timber fit, NOT a surveyed or complete seven-purlin frame.
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
 if(!Number.isFinite(result))throw Error('Xiehe visible timber left retained tile surface');return result;
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
export function fitXieheVisibleHall(kit,frame,g,roof){
 if(g.profile!=='xiehe')return null;
 if(g.width!==[5,5.6,6,5.6,5].reduce((a,b)=>a+b,0)||g.depth!==10||g.platformY!==2.62||g.columnH!==6.2)throw Error('Xiehe visible hall retained envelope mismatch');
 const bounds=[g.columnXs[1]+.25,g.columnXs[4]-.25,-g.depth/2+.25,-.25],flatY=g.platformY+g.columnH+.6;
 const all=[];roof.traverse(m=>{if(m.isMesh)all.push(m);});
 const caps=all.filter(m=>m.material===kit.lib.material('rafters')),tiles=all.filter(m=>m.material===kit.lib.material('roof_tile'));
 if(caps.length!==1||tiles.length!==1||caps[0].geometry.index||tiles[0].geometry.index)throw Error('Xiehe retained roof owners mismatch');
 const cap=caps[0],old=cap.geometry,out=buffers(),inner=buffers(),tileTriangles=[],flatTriangles=[];let count=0;
 for(let i=0;i<old.attributes.position.count;i+=3){const v=vertices(old,i),flat=v.every(p=>Math.abs(p[1]-flatY)<EPS&&p[4]<-.99);if(flat){count++;flatTriangles.push(v);for(const p of clip(v,bounds,false))emit(p,out);}else emit(v,out);}
 if(count!==4)throw Error('Xiehe expected exactly four flat ceiling triangles');
 const key=tri=>tri.map(p=>`${p[0]},${p[2]}`).sort().join('|'),hw=Math.fround((g.width+.4)/2),hd=Math.fround((g.depth+.4)/2),corners=[[-hw,0,-hd],[hw,0,-hd],[hw,0,hd],[-hw,0,hd]];
 const expected=corners.map((p,i)=>key([[0,0,0],p,corners[(i+1)%4]])).sort();
 if(JSON.stringify(flatTriangles.map(key).sort())!==JSON.stringify(expected))throw Error('Xiehe retained ceiling footprint mismatch');
 const tg=tiles[0].geometry;for(let i=0;i<tg.attributes.position.count;i+=3){const v=vertices(tg,i);tileTriangles.push(v);for(const p of clip(v,bounds,true))emit(p,inner,true,.15);}
 if(!inner.p.length)throw Error('Xiehe missing actual roof inner skin');
 const group=new T.Group();group.name='xiehe-visible-east-hall-frame';group.userData={role:group.name,status:'PHOTO_FIT_VISIBLE_EAST_ONLY',completeSevenPurlinReconstruction:false,sourceSphere:'2054726937421385730',opening:bounds,unknown:'Hidden joints, full transverse frames, west half and seven-purlin census remain unaccepted'};
 const red=new T.MeshStandardMaterial({color:0x641e16,roughness:.83,name:'xiehe-visible-rafter-red-fit'}),green=new T.MeshStandardMaterial({color:0x2d645a,roughness:.8,name:'xiehe-visible-bearing-green-fit'});
 const owned=[];const add=(geo,mat,role)=>{owned.push(geo);const m=new T.Mesh(geo,mat);m.name=role;m.userData.role=role;m.castShadow=m.receiveShadow=true;group.add(m);return m;};
 const rod=(a,b,r,mat,role)=>{const A=new T.Vector3(...a),B=new T.Vector3(...b),d=B.clone().sub(A),m=add(new T.CylinderGeometry(r,r,d.length(),8),mat,role);m.position.copy(A).add(B).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());};
 let replacement;
 try{
  add(geometry(inner),red,'xiehe-visible-sloped-inner-boards');
  // Follow the REAL existing tile triangles, not a new guessed roof pitch.
  for(let x=bounds[0]+.12;x<bounds[1]-.1;x+=.27){const points=Array.from({length:9},(_,i)=>{const z=bounds[2]+(bounds[3]-bounds[2])*i/8;return new T.Vector3(x,surfaceY(tileTriangles,x,z)-.235,z);});add(curvedRafter(points,.075),red,'xiehe-visible-red-rafter');}
  for(const z of[-4.5,-2.5,-.5])rod([bounds[0],surfaceY(tileTriangles,bounds[0],z)-.44,z],[bounds[1],surfaceY(tileTriangles,bounds[1],z)-.44,z],.13,green,'xiehe-visible-longitudinal-bearing');
  replacement=geometry(out);
 }catch(error){for(const geo of owned)geo.dispose();replacement?.dispose();red.dispose();green.dispose();throw error;}
 // Commit only after validation/allocation succeeds; external roof tiles,
 // navigation and every non-flat ceiling triangle retain their source bytes.
 cap.geometry=replacement;old.dispose();kit.owned.push(red,green);frame.add(group);return group;
}
