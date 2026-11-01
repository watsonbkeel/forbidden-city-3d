import * as T from 'three';
import {sishenPavingRectangles} from '../../garden/SishenGroundFit.js';
import {SISHEN_REGION,validateSishenScope} from '../../../controls/SishenSupport.js';
import {createXiqingSurface} from '../../../controls/XiqingRoofSurface.js';
const SOURCE='https://www.dpm.org.cn/explore/building/236488.html';
export function sishenGeometry(zone){
 if(zone?.id!=='garden'||zone.sishenProfile!=='sishen-source-fit')throw Error('Sishen exact named garden profile required');
 return {id:'sishen',name:'四神祠',x:30.3,z:463.8,annexDirection:'north',wholeObjectAccepted:false,source:SOURCE,precision:'OFFICIAL_PLAN_AND_PHOTO_RELATIONSHIP_MODEL_FIT_NOT_SURVEY',placementUncertaintyMetres:1,platformRadius:3.6,platformHeight:.64,roofRadius:3.8,unverified:['all dimensions and roof curves','concealed rear finishes','exact carved and painted patterns','Manchu plaque lettering','interior inventory and visitor access','GPU and real-device acceptance'],targetState:'CLOSED_SHRINE_WITH_OPEN_NORTH_ANNEX_AND_OUTER_GALLERY'};
}
function meshGeometry(vertices,faces){const p=[],uv=[];for(const face of faces)for(let j=1;j<face.length-1;j++)for(const i of[face[0],face[j],face[j+1]]){p.push(...vertices[i]);uv.push(vertices[i][0],vertices[i][2]);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.computeVertexNormals();return g;}
function prism(points,height){const n=points.length,v=[...points.map(([x,z])=>[x,0,z]),...points.map(([x,z])=>[x,height,z])],faces=[Array.from({length:n},(_,i)=>i),Array.from({length:n},(_,i)=>2*n-1-i)];for(let i=0;i<n;i++){const j=(i+1)%n;faces.push([i,i+n,j+n,j]);}return meshGeometry(v,faces);}
// Individually closed roof panels; seams and physical faces follow rendered F32 geometry.
function mainSector(a,b){const radii=Array.from({length:7},(_,i)=>i===6?3.8:.2+3.6*i/6),v=[];for(const dy of[0,-.14])for(const angle of[a,b])for(const r of radii){const t=r/3.8,y=3.8+2.3*Math.pow(1-t,1.25)+.2*Math.pow(t,8);v.push([Math.cos(angle)*r,y+dy,Math.sin(angle)*r]);}const faces=[];for(let i=0;i<6;i++){faces.push([i,i+1,8+i,7+i],[14+i,21+i,22+i,15+i],[i,14+i,15+i,i+1],[7+i,8+i,22+i,21+i]);}faces.push([0,7,21,14],[6,20,27,13]);return meshGeometry(v,faces.map(f=>[...f].reverse()));}
function annexRoof(){const nx=12,nz=8,v=[];for(const dy of[0,-.14])for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){const x=-1.95+3.9*i/nx,z=2+3.3*j/nz,hip=Math.min(1,(5.3-z)/.7),arch=.72*Math.cos(Math.PI*x/3.9)*hip,y=3.78+arch+.16*Math.pow(Math.abs(x)/1.95,8);v.push([x,y+dy,z]);}const N=(nx+1)*(nz+1),faces=[],at=(i,j)=>j*(nx+1)+i;for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const a=at(i,j),b=at(i+1,j),c=at(i+1,j+1),d=at(i,j+1);faces.push([a,d,c,b],[a+N,b+N,c+N,d+N]);}const edges=[];for(let i=0;i<nx;i++){edges.push([at(i,0),at(i+1,0)],[at(i+1,nz),at(i,nz)]);}for(let j=0;j<nz;j++){edges.push([at(0,j+1),at(0,j)],[at(nx,j),at(nx,j+1)]);}for(const[a,b]of edges)faces.push([a,b,b+N,a+N]);return meshGeometry(v,faces);}
export function buildSishenShrine(kit,zone){
 const g=sishenGeometry(zone);if(kit.root.children.some(n=>n.userData.sishen)||kit.colliders.some(c=>c.sishen))throw Error('Duplicate Sishen assembly');
 const sizes=Object.fromEntries(['owned','colliders','walkables','mapItems'].map(k=>[k,kit[k].length]));let f;
 try{f=kit.frame(g.x,g.z,0);f.name=g.name;f.userData.sishen=g;f.userData.structure=g;
 const mats=Object.fromEntries(['wood_column','roof_tile','stone_slab','wall_brick','caihua_beam'].map(k=>[k,kit.lib.material(k)]));
 for(const[key,color]of[['dark',0x362b27],['green',0x496458],['blue',0x143b7c],['gold',0xc8a154]]){mats[key]=new T.MeshStandardMaterial({name:'sishen-'+key+'-plain-photo-fit',color,roughness:.86});kit.owned.push(mats[key]);}
 const add=(role,geo,key,x=0,y=0,z=0,rot=0)=>{const m=kit.mesh(f,geo,mats[key],x,y,z);m.rotation.y=rot;m.name='sishen-'+role;m.userData={sishenRole:role,source:SOURCE,precision:g.precision};return m;};
 const box=(role,w,h,d,x,y,z,key='wood_column',rot=0)=>{const geo=new T.BoxGeometry(w,h,d),p=geo.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,p.getY(i)>0?h:0);return add(role,geo,key,x,y,z,rot);};
 const points=Array.from({length:8},(_,i)=>{const a=Math.PI/8+i*Math.PI/4;return[3.6*Math.cos(a),3.6*Math.sin(a)]}),Q=3.6*Math.sin(Math.PI/8),N=3.6*Math.cos(Math.PI/8);
 add('octagonal-platform',prism(points,.64),'stone_slab');box('north-annex-platform',2*Q,.64,4.8-N,0,0,(4.8+N)/2,'stone_slab');
 for(let i=0;i<3;i++)box('north-step',2.4,.48-.16*i,.4,0,0,5+.4*i,'stone_slab');
 // Source-visible continuous sloping cheek stones; dimensions remain model fits.
 for(const s of[-1,1]){const points=[[s*1.325-.125,4.8],[s*1.325+.125,4.8],[s*1.325+.125,6],[s*1.325-.125,6]],v=[...points.map(([x,z])=>[x,0,z]),...points.map(([x,z])=>[x,z===4.8?.64:.06,z])],faces=[[0,1,2,3],[7,6,5,4]];for(let i=0;i<4;i++){const j=(i+1)%4;faces.push([i,i+4,j+4,j]);}add('sloping-stair-cheek',meshGeometry(v,faces),'stone_slab');}
 const R=2.7,apothem=R*Math.cos(Math.PI/8),faceWidth=2*R*Math.sin(Math.PI/8),H=3.1,Y=.64;
 function faceBox(role,angle,u,w,h,d,y,key='wood_column',out=0){const rot=Math.PI/2-angle,cx=(apothem+out)*Math.cos(angle)+u*Math.sin(angle),cz=(apothem+out)*Math.sin(angle)-u*Math.cos(angle);return box(role,w,h,d,cx,y,cz,key,rot);}
 for(let i=0;i<8;i++){const a=(i+1)*Math.PI/4,north=i===1;
  if(north){for(let k=0;k<4;k++){const w=(faceWidth-.12)/4,u=-faceWidth/2+.06+(k+.5)*w;faceBox('closed-door-leaf',a,u,w-.015,2.75,.12,Y);for(const t of[-.3,0,.3])faceBox('door-lattice',a,u+t*w,w*.035,1.5,.035,Y+1,'green',.08);for(const yy of[1,1.5,2,2.5])faceBox('door-lattice',a,u,w-.04,.035,.035,Y+yy,'green',.08);}}
  else{faceBox('enclosure-wall',a,0,faceWidth,.85,.2,Y,'wall_brick');faceBox('closed-window-panel',a,0,faceWidth-.12,1.9,.12,Y+.85,'dark');for(const u of[-faceWidth/2,faceWidth/2])faceBox('window-frame',a,u,.12,2.75,.2,Y);for(const yy of[.85,2.75])faceBox('window-frame',a,0,faceWidth,.12,.2,Y+yy);for(let k=1;k<7;k++)faceBox('window-lattice',a,-faceWidth/2+k*faceWidth/7,.045,1.72,.035,Y+.98,'wood_column',.09);for(let k=1;k<6;k++)faceBox('window-lattice',a,0,faceWidth-.14,.045,.035,Y+.9+k*1.8/6,'wood_column',.09);}
  faceBox('enclosure-head',a,0,faceWidth,H-2.75,.22,Y+2.75,'caihua_beam');
 }
 const cols=[];for(let i=0;i<8;i++){const a=Math.PI/8+i*Math.PI/4;cols.push([3.2*Math.cos(a),3.2*Math.sin(a)]);}const X=3.2*Math.sin(Math.PI/8),Z=3.2*Math.cos(Math.PI/8);cols.push([-X,4.6],[X,4.6]);
 for(const[x,z]of cols){add('column-base',new T.CylinderGeometry(.23,.27,.15,12),'stone_slab',x,Y+.075,z);add('column',new T.CylinderGeometry(.14,.16,3.1,12),'wood_column',x,Y+1.55,z);}
 for(let i=0;i<8;i++){const a=(i+1)*Math.PI/4,r=3.2*Math.cos(Math.PI/8),w=2*3.2*Math.sin(Math.PI/8),rot=Math.PI/2-a;box('gallery-beam',w,.28,.22,r*Math.cos(a),3.4,r*Math.sin(a),'caihua_beam',rot);if(i===1)continue;for(const y of[Y+.25,Y+.88])box('gallery-rail',w,.09,.09,r*Math.cos(a),y,r*Math.sin(a),'wood_column',rot);for(let k=1;k<6;k++){const u=-w/2+k*w/6;box('gallery-rail',.06,.6,.06,r*Math.cos(a)+u*Math.sin(a),Y+.28,r*Math.sin(a)-u*Math.cos(a),'green',rot);}}
 for(const s of[-1,1]){box('annex-beam',.22,.28,4.6-Z,s*X,3.4,(Z+4.6)/2,'caihua_beam');for(const y of[Y+.25,Y+.88])box('gallery-rail',.09,.09,4.6-Z,s*X,y,(Z+4.6)/2);for(let k=1;k<5;k++)box('gallery-rail',.06,.6,.06,s*X,Y+.28,Z+k*(4.6-Z)/5,'green');}
 box('annex-front-beam',2*X,.28,.22,0,3.4,4.6,'caihua_beam');
 // Official front photo shows two short rail panels, not an entirely open front.
 for(const sign of[-1,1]){const width=X-.62,cx=sign*(X+.62)/2;for(const y of[Y+.12,Y+.88])box('annex-front-rail',width,.09,.09,cx,y,4.6);box('annex-front-rail',.08,.9,.12,sign*.66,Y,4.6);for(let k=1;k<4;k++)box('annex-front-rail',.045,.65,.045,sign*(.66+k*(X-.66)/4),Y+.21,4.6,'green');}
 add('main-ceiling',prism(points.map(([x,z])=>[x*R/3.6,z*R/3.6]),.12),'green',0,3.62,0);box('annex-ceiling',2*X,.10,4.6-apothem,0,3.62,(4.6+apothem)/2,'green');
 for(let i=0;i<8;i++)add('main-octagonal-roof',mainSector(Math.PI/8+i*Math.PI/4,Math.PI/8+(i+1)*Math.PI/4),'roof_tile');add('north-roll-hip-roof',annexRoof(),'roof_tile');
 add('finial-base',new T.CylinderGeometry(.28,.30,.3,16),'roof_tile',0,6,0);add('finial-crown',new T.SphereGeometry(.26,12,8),'roof_tile',0,6.35,0);
 // Neutral physical plaque shell, no invented Manchu glyphs or exact calligraphy.
 box('plaque-frame',.65,.95,.1,0,2.74,apothem+.18,'wood_column');box('plaque-face',.53,.83,.025,0,2.8,apothem+.245,'blue');
 for(const[a,b,c,d]of sishenPavingRectangles())box('circulation-paving',b-a,.04,d-c,(a+b)/2-g.x,0,(c+d)/2-g.z,'stone_slab');
 // Match the final material-merged Float32 render source, never an enclosing proxy.
 kit.root.updateWorldMatrix(true,true);const inverse=kit.root.matrixWorld.clone().invert();let physicalIndex=0;
 f.traverse(m=>{if(!m.isMesh)return;const index=physicalIndex++,p=m.geometry.attributes.position,ix=m.geometry.index,matrix=new T.Matrix4().multiplyMatrices(inverse,m.matrixWorld);
 const point=i=>{const v=new T.Vector3().fromBufferAttribute(p,i).applyMatrix4(matrix);v.set(Math.fround(v.x),Math.fround(v.y),Math.fround(v.z));return v.applyMatrix4(kit.root.matrixWorld);};
 let b;if(m.geometry.type==='BoxGeometry'&&m.rotation.y===0){b=new T.Box3();for(let i=0;i<p.count;i++)b.expandByPoint(point(i));}
 else{const faces=[];for(let i=0;i<(ix?.count??p.count);i+=3)faces.push({source:{mesh:0,triangle:i/3},vertices:[0,1,2].map(k=>point(ix?ix.getX(i+k):i+k))});const surface=createXiqingSurface(faces,'sishen-surface-'+index);b=surface.box.clone();b.xiqingRoofSurface=surface;}
 b.sishen={index,role:m.userData.sishenRole};m.userData.sishenPhysicalIndex=index;kit.colliders.push(b);
 });
 const anchor=kit.colliders.find(b=>b.sishen?.role==='north-step'),scope={kind:'sishen',id:'sishen',minOffsetX:SISHEN_REGION.minX-anchor.min.x,maxOffsetX:SISHEN_REGION.maxX-anchor.min.x,minOffsetZ:SISHEN_REGION.minZ-anchor.min.z,maxOffsetZ:SISHEN_REGION.maxZ-anchor.min.z};validateSishenScope(scope,anchor,SISHEN_REGION);anchor.furnitureMotionScope=scope;
 f.updateMatrixWorld(true);kit.mapRect(f,'hall',g.name,7.2,9.4,{profile:'sishen-source-fit',source:SOURCE,wholeObjectAccepted:false});return{frame:f,geometry:g};
 }catch(error){const geometries=new Set();f?.traverse(m=>{if(m.geometry)geometries.add(m.geometry)});for(const geo of geometries)geo.dispose();f?.removeFromParent();for(const resource of kit.owned.splice(sizes.owned))resource.dispose();for(const key of['colliders','walkables','mapItems'])kit[key].length=sizes[key];throw error;}
}
