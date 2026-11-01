import * as T from 'three';
import {createXiqingSurface} from '../../../controls/XiqingRoofSurface.js';
import {WEST_WELL_REGION,validateWestWellScope} from '../../../controls/WestWellSupport.js';
const SOURCE='https://www.dpm.org.cn/explore/building/236499.html';
export function westWellGeometry(zone){
 if(zone?.id!=='garden'||zone.westWellProfile!=='west-well-source-fit')throw Error('West well exact named garden profile required');
 return {id:'west-well',name:'御花园西井亭',x:38.3,z:463.7,columnSpan:1.94,columnHeight:2.43,columnDiameter:.24,roofCenter:'OPEN_SKY',wholeObjectAccepted:false,source:SOURCE,columnSource:'https://img.dpm.org.cn/Uploads/pdf/2206/T00024_00.pdf',photo:'https://img.dpm.org.cn/Uploads/Picture/dc/3958%5B1024%5D.jpg',precision:'SOURCE_DIMENSIONS_WITH_PHOTO_RELATIONSHIP_FIT_NOT_SURVEY',placementUncertaintyMetres:1,unverified:['hidden rail closure and entry','cover dimensions and underside','drain and crossbeam/pulley dimensions and orientation','column height from shared official paper description','platform and roof dimensions','fine stone carving and bamboo painting','GPU visual/performance'],groundFit:'LOCAL_DOUBLE_BYPASS_NOT_HISTORIC_PATH_ASSERTION'};
}
// Eight individually closed trapezoidal prisms, not an eight-sided pyramid.
// The inner boundary is a true opening at every roof level.
function sectorGeometry(a,b,r0,r1,y0,y1,t,part='all'){
 const v=[];for(const dy of[0,-t])for(const[r,y,angle]of[[r0,y0,a],[r1,y1,a],[r1,y1,b],[r0,y0,b]])v.push([Math.cos(angle)*r,y+dy,Math.sin(angle)*r]);
 const faces=[[0,3,2,1],[4,5,6,7],[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7]],p=[],uv=[];
 for(const [index,face]of faces.entries()){if(part==='soffit'?index!==1:part==='exterior'?index===1:false)continue;for(const i of[0,1,2,0,2,3]){p.push(...v[face[i]]);uv.push(v[face[i]][0],v[face[i]][2]);}}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.computeVertexNormals();return g;
}
export function buildWestWellPavilion(kit,zone){
 const g=westWellGeometry(zone);if(kit.root.children.some(n=>n.userData.westWell)||kit.colliders.some(c=>c.westWell||c.furnitureMotionScope?.kind==='west-well'))throw Error('Duplicate West well assembly');
 const sizes=Object.fromEntries(['owned','colliders','walkables','mapItems'].map(k=>[k,kit[k].length])),shared=new Map(['stone_slab','pebble_path','marble','wood_column','roof_tile'].map(k=>[k,kit.lib.material(k)]));let f;try{f=kit.frame(g.x,g.z,0);f.name=g.name;f.userData.structure=g;f.userData.westWell=g;
 const boxes=[],curves=[];
 const tag=(m,role)=>{m.name='west-well-'+role;Object.assign(m.userData,{westWellRole:role,source:SOURCE,precision:g.precision});return m;};
 const bambooPixels=new Uint8Array(32*32*4);for(let y=0;y<32;y++)for(let x=0;x<32;x++){const node=y%16<2,c=node?[65,66,42]:x<16?[167,145,83]:[78,103,78],i=(y*32+x)*4;bambooPixels.set([...c,255],i);}
 const bambooTexture=new T.DataTexture(bambooPixels,32,32,T.RGBAFormat);bambooTexture.colorSpace=T.SRGBColorSpace;bambooTexture.wrapS=bambooTexture.wrapT=T.RepeatWrapping;bambooTexture.repeat.set(5,3);bambooTexture.needsUpdate=true;kit.owned.push(bambooTexture);
 const bambooMaterial=new T.MeshStandardMaterial({color:0xffffff,map:bambooTexture,roughness:.88});bambooMaterial.name='west-well-photo-bamboo-simplified';bambooMaterial.userData={sourcePhoto:'8018',fit:'SIMPLIFIED_BAMBOO_JOINTS_NOT_EXACT_PAINTING'};kit.owned.push(bambooMaterial);
 const beamMaterial=new T.MeshStandardMaterial({color:0x817d68,roughness:.85});beamMaterial.name='west-well-simplified-bamboo-paint';kit.owned.push(beamMaterial);
 const mat=key=>key==='beam-fit'?beamMaterial:key==='bamboo-fit'?bambooMaterial:shared.get(key);
 const bottom=(geo,h)=>{const p=geo.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,Math.max(0,Math.min(h,p.getY(i)+h/2)));return geo;};
 const box=(role,w,h,d,x,y,z,key='wood_column',walk=false)=>{const m=tag(kit.mesh(f,bottom(new T.BoxGeometry(w,h,d),h),mat(key),x,y,z),role);boxes.push(m);m.userData.westWellWalkable=walk;return m;};
 const curve=(role,geo,x,y,z,key)=>{const m=tag(kit.mesh(f,geo,mat(key),x,y,z),role);curves.push(m);return m;};
 box('platform',3.4,.18,3.4,0,0,0,'stone_slab',true);
 // Physical paving is visible box geometry, not an invisible ground rescue.
 for(const [w,d,x,z]of[[11.1,3.7,1.55,-3.55],[11.1,2.3,1.55,2.85],[2.3,3.4,-2.85,0],[5.4,3.4,4.4,0]])box('bypass-paving',w,.04,d,x,0,z,'pebble_path',true);
 for(const x of[-.97,.97])for(const z of[-.97,.97]){
  curve('column-base',bottom(new T.CylinderGeometry(.23,.29,.2,12),.2),x,.18,z,'marble');
  curve('column',bottom(new T.CylinderGeometry(.12,.12,2.43,16),2.43),x,.38,z,'wood_column');
 }
 // Four 45-degree beams bear directly on the four columns. Four further
 // beams hang OUTSIDE the column square and join their ends into an octagon.
 // Beam depth is a photo fit; do not substitute an unsupported inner diamond.
 const ring=.97*Math.SQRT2,half=1.94-ring;
 for(const side of[-1,1]){
  box('suspended-bearing',2*half,.58,.2,0,2.66,side*ring,'beam-fit');
  box('suspended-bearing',.2,.58,2*half,side*ring,2.66,0,'beam-fit');
 }
 for(const x of[-1,1])for(const z of[-1,1]){
  const beam=box('diagonal-bearing',2*(ring-.97)*Math.SQRT2,.58,.2,x*.97,2.66,z*.97,'beam-fit');beam.rotation.y=x*z*Math.PI/4;
 }
 // 3958 shows a light circular covered well. Dimensions and hidden underside
 // are a neutral fit; no invented deep shaft or water.
 curve('covered-well',bottom(new T.CylinderGeometry(.43,.43,.25,16),.25),0,.18,0,'stone_slab');
 // The source names drains and a crossbeam/pulley; placement and size are fits.
 for(const side of[-1,1])for(const axis of['x','z']){
  box('drain-bed',axis==='x'?1.34:.12,.008,axis==='z'?1.34:.12,axis==='z'?side*.6:0,.18,axis==='x'?side*.6:0,'stone_slab');
  for(const offset of[-.075,.075])box('drain-edge',axis==='x'?1.5:.03,.04,axis==='z'?1.5:.03,axis==='z'?side*.6+offset:0,.18,axis==='x'?side*.6+offset:0,'marble');
 }
 box('water-lift-beam',1.94,.14,.14,0,2.12,0,'wood_column');
 curve('water-lift-wheel',new T.TorusGeometry(.18,.035,6,16),0,1.98,0,'wood_column');
 // Four-side enclosure is supported; historical entrance and hidden elevations
 // remain unverified. Do not enlarge the 1.94m column span for player passage.
 for(const x of[-1.45,1.45])for(const z of[-1.45,1.45]){
  box('rail-post',.18,.75,.18,x,.18,z,'marble');
  curve('rail-post-cap',new T.SphereGeometry(.13,8,6),x,.95,z,'marble');
 }
 for(const side of[-1,1])for(const axis of['x','z']){
  box('rail-base',axis==='x'?2.72:.16,.12,axis==='z'?2.72:.16,axis==='z'?side*1.45:0,.18,axis==='x'?side*1.45:0,'marble');
  box('rail-top',axis==='x'?2.72:.15,.1,axis==='z'?2.72:.15,axis==='z'?side*1.45:0,.8,axis==='x'?side*1.45:0,'marble');
  for(const at of[-.9,-.45,0,.45,.9]){
   // Closed profile ends avoid an open triangle shell.
   const profile=[new T.Vector2(0,0),new T.Vector2(.065,0),new T.Vector2(.13,.08),new T.Vector2(.08,.24),new T.Vector2(.055,.34),new T.Vector2(.13,.48),new T.Vector2(.065,.5),new T.Vector2(0,.5)];
   curve('pipa-rail-fit',new T.LatheGeometry(profile,8),axis==='x'?at:side*1.45,.3,axis==='z'?at:side*1.45,'marble');
  }
 }
 for(let i=0;i<8;i++){
  const a=(i+.5)*Math.PI/4,b=(i+1.5)*Math.PI/4;
  curve('roof-sector',sectorGeometry(a,b,.62,2.3,3.62,2.96,.12,'exterior'),0,0,0,'roof_tile');
  curve('roof-soffit',sectorGeometry(a,b,.62,2.3,3.62,2.96,.12,'soffit'),0,0,0,'bamboo-fit');
  curve('inner-opening-trim',sectorGeometry(a,b,.56,.65,3.63,3.63,.22),0,0,0,'roof_tile');
  const angle=a,x=Math.cos(angle),z=Math.sin(angle),len=Math.hypot(2.3-.62,3.62-2.96);
  const hip=curve('hip',new T.CylinderGeometry(.055,.055,len,8),x*1.46,3.34,z*1.46,'roof_tile');hip.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),new T.Vector3(-x*(2.3-.62),.66,-z*(2.3-.62)).normalize());
  // Four pairs counted by the source; intentionally plain paired silhouettes,
  // not an unsupported detailed animal/dragon carving.
  const phi=(Math.floor(i/2)*2+.5)*Math.PI/4,tangent=(i%2?1:-1)*.07;
  const ornament=box('paired-hip-ornament',.12,.2,.24,Math.cos(phi)*.70-Math.sin(phi)*tangent,3.53,Math.sin(phi)*.70+Math.cos(phi)*tangent,'roof_tile');ornament.userData.fit='COARSE_UNCARVED';
 }
 // Exact final merged Float32 vertices are the sole physical source.
 kit.root.updateWorldMatrix(true,true);const inverse=kit.root.matrixWorld.clone().invert();
 const point=(m,p,i)=>{const v=new T.Vector3().fromBufferAttribute(p,i).applyMatrix4(new T.Matrix4().multiplyMatrices(inverse,m.matrixWorld));v.set(Math.fround(v.x),Math.fround(v.y),Math.fround(v.z));return v.applyMatrix4(kit.root.matrixWorld);};
 for(const [index,m]of boxes.entries()){
  if(m.rotation.y!==0){curves.push(m);continue;}
  const p=m.geometry.attributes.position,b=new T.Box3();for(let i=0;i<p.count;i++)b.expandByPoint(point(m,p,i));b.westWell={kind:'visible-box',index,role:m.userData.westWellRole};m.userData.westWellBox=index;kit.colliders.push(b);
  if(m.userData.westWellWalkable){const floor=b.clone();floor.min.y=floor.max.y;kit.walkables.push({type:'box',box:floor,rescue:false});}
 }
 for(const [index,m]of curves.entries()){
  const p=m.geometry.attributes.position,ix=m.geometry.index,faces=[];for(let i=0;i<(ix?.count??p.count);i+=3){const vertices=[0,1,2].map(k=>point(m,p,ix?ix.getX(i+k):i+k));faces.push({source:{mesh:0,triangle:i/3},vertices});}
  const id='west-well-surface-'+index,surface=createXiqingSurface(faces,id),b=surface.box.clone();b.xiqingRoofSurface=surface;b.westWell={kind:'visible-surface',index,role:m.userData.westWellRole};m.userData.westWellSurface=id;kit.colliders.push(b);
 }
 const anchor=kit.colliders.find(b=>b.westWell?.role==='platform'),scope={kind:'west-well',id:'west-well',minOffsetX:WEST_WELL_REGION.minX-anchor.min.x,maxOffsetX:WEST_WELL_REGION.maxX-anchor.min.x,minOffsetZ:WEST_WELL_REGION.minZ-anchor.min.z,maxOffsetZ:WEST_WELL_REGION.maxZ-anchor.min.z};validateWestWellScope(scope,anchor,WEST_WELL_REGION);anchor.furnitureMotionScope=scope;
 kit.mapRect(f,'hall',g.name,4.6,4.6,{profile:'west-well-source-fit',source:SOURCE,wholeObjectAccepted:false});return{frame:f,geometry:g};
 }catch(error){const geometries=new Set();f?.traverse(m=>{if(m.geometry)geometries.add(m.geometry)});for(const geometry of geometries)geometry.dispose();f?.removeFromParent();for(const resource of kit.owned.splice(sizes.owned))resource.dispose();for(const key of ['colliders','walkables','mapItems'])kit[key].length=sizes[key];throw error;}
}
