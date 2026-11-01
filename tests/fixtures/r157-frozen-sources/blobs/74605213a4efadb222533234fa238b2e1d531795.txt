import * as T from 'three';
import {createXiqingSurface} from '../../../controls/XiqingRoofSurface.js';
import {EAST_WELL_REGION,validateEastWellScope} from '../../../controls/EastWellSupport.js';
const SOURCE='https://www.dpm.org.cn/explore/building/236530.html';
export function eastWellGeometry(zone){
 if(zone?.id!=='garden'||zone.eastWellProfile!=='east-well-source-fit')throw Error('East well exact named garden profile required');
 return {id:'east-well',name:'御花园东井亭',x:-48.4,z:459.8,columnSpan:1.94,columnHeight:2.43,columnDiameter:.28,roofCenter:'OPEN_SKY',wholeObjectAccepted:false,source:SOURCE,columnSource:'https://img.dpm.org.cn/Uploads/pdf/2206/T00024_00.pdf',photo:'https://img.dpm.org.cn/Uploads/Picture/dc/3980.jpg',precision:'SOURCE_DIMENSIONS_WITH_PHOTO_RELATIONSHIP_FIT_NOT_SURVEY',placementUncertaintyMetres:1,unverified:['hidden rail closure and entry','plain cover outline','platform and roof dimensions','fine stone carving and floral painting','GPU visual/performance'],groundFit:'LOCAL_DOUBLE_BYPASS_NOT_HISTORIC_PATH_ASSERTION'};
}
// Eight individually closed trapezoidal prisms, not an eight-sided pyramid.
// The inner boundary is a true opening at every roof level.
function sectorGeometry(a,b,r0,r1,y0,y1,t,part='all'){
 const v=[];for(const dy of[0,-t])for(const[r,y,angle]of[[r0,y0,a],[r1,y1,a],[r1,y1,b],[r0,y0,b]])v.push([Math.cos(angle)*r,y+dy,Math.sin(angle)*r]);
 const faces=[[0,3,2,1],[4,5,6,7],[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7]],p=[],uv=[];
 for(const [index,face]of faces.entries()){if(part==='soffit'?index!==1:part==='exterior'?index===1:false)continue;for(const i of[0,1,2,0,2,3]){p.push(...v[face[i]]);uv.push(v[face[i]][0],v[face[i]][2]);}}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.computeVertexNormals();return g;
}
export function buildEastWellPavilion(kit,zone){
 const g=eastWellGeometry(zone),f=kit.frame(g.x,g.z,0);f.name=g.name;f.userData.structure=g;f.userData.eastWell=g;
 const boxes=[],curves=[];
 const tag=(m,role)=>{m.name='east-well-'+role;Object.assign(m.userData,{eastWellRole:role,source:SOURCE,precision:g.precision});return m;};
 const beamMaterial=new T.MeshStandardMaterial({color:0x61755d,roughness:.85});beamMaterial.name='east-well-simplified-Su-paint';kit.owned.push(beamMaterial);
 const mat=key=>key==='beam-fit'?beamMaterial:kit.lib.material(key);
 const bottom=(geo,h)=>{const p=geo.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,Math.max(0,Math.min(h,p.getY(i)+h/2)));return geo;};
 const box=(role,w,h,d,x,y,z,key='wood_column',walk=false)=>{const m=tag(kit.mesh(f,bottom(new T.BoxGeometry(w,h,d),h),mat(key),x,y,z),role);boxes.push(m);m.userData.eastWellWalkable=walk;return m;};
 const curve=(role,geo,x,y,z,key)=>{const m=tag(kit.mesh(f,geo,mat(key),x,y,z),role);curves.push(m);return m;};
 box('platform',3.4,.18,3.4,0,0,0,'stone_slab',true);
 // Physical paving is visible box geometry, not an invisible ground rescue.
 for(const [w,d,x,z]of[[8,2.3,0,-2.85],[8,2.3,0,2.85],[2.3,3.4,-2.85,0],[2.3,3.4,2.85,0]])box('bypass-paving',w,.04,d,x,0,z,'pebble_path',true);
 for(const x of[-.97,.97])for(const z of[-.97,.97]){
  curve('column-base',bottom(new T.CylinderGeometry(.23,.29,.2,12),.2),x,.18,z,'marble');
  curve('column',bottom(new T.CylinderGeometry(.14,.14,2.43,16),2.43),x,.38,z,'wood_column');
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
 // Source gives a stone-covered well, not a surveyed cover shape. This neutral
 // square slab is an explicitly unverified proxy, without invented depth/water.
 box('covered-well',.84,.18,.84,0,.18,0,'stone_slab',true);
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
  curve('roof-soffit',sectorGeometry(a,b,.62,2.3,3.62,2.96,.12,'soffit'),0,0,0,'wood_column');
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
  const p=m.geometry.attributes.position,b=new T.Box3();for(let i=0;i<p.count;i++)b.expandByPoint(point(m,p,i));b.eastWell={kind:'visible-box',index,role:m.userData.eastWellRole};m.userData.eastWellBox=index;kit.colliders.push(b);
  if(m.userData.eastWellWalkable){const floor=b.clone();floor.min.y=floor.max.y;kit.walkables.push({type:'box',box:floor,rescue:false});}
 }
 for(const [index,m]of curves.entries()){
  const p=m.geometry.attributes.position,ix=m.geometry.index,faces=[];for(let i=0;i<(ix?.count??p.count);i+=3){const vertices=[0,1,2].map(k=>point(m,p,ix?ix.getX(i+k):i+k));faces.push({source:{mesh:0,triangle:i/3},vertices});}
  const id='east-well-surface-'+index,surface=createXiqingSurface(faces,id),b=surface.box.clone();b.xiqingRoofSurface=surface;b.eastWell={kind:'visible-surface',index,role:m.userData.eastWellRole};m.userData.eastWellSurface=id;kit.colliders.push(b);
 }
 const anchor=kit.colliders.find(b=>b.eastWell?.role==='platform'),scope={kind:'east-well',id:'east-well',minOffsetX:EAST_WELL_REGION.minX-anchor.min.x,maxOffsetX:EAST_WELL_REGION.maxX-anchor.min.x,minOffsetZ:EAST_WELL_REGION.minZ-anchor.min.z,maxOffsetZ:EAST_WELL_REGION.maxZ-anchor.min.z};validateEastWellScope(scope,anchor,EAST_WELL_REGION);anchor.furnitureMotionScope=scope;
 kit.mapRect(f,'hall',g.name,4.6,4.6,{profile:'east-well-source-fit',source:SOURCE,wholeObjectAccepted:false});return{frame:f,geometry:g};
}
