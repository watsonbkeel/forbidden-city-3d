import * as THREE from 'three';
import {applyBoxUV} from '../../../utils/GeometryUV.js';
import {createXiqingSurface} from '../../../controls/XiqingRoofSurface.js';
import {WENHUA_GATE_APPROACH_IDS,WENHUA_GATE_APPROACH_REGION,WENHUA_GATE_APPROACH_ANCHOR} from '../../../controls/WenhuaGateApproachSupport.js';
const near=(a,b)=>Number.isFinite(a)&&Math.abs(a-b)<2e-6;
const fail=()=>{throw Error('Wenhua gate approaches retained source drift');};
const plain=m=>m.visible&&!m.rotation.x&&!m.rotation.y&&!m.rotation.z&&m.scale.equals(new THREE.Vector3(1,1,1));
function boxShape(m,w,h,d){
 const a=m.geometry?.attributes,p=a?.position,n=a?.normal;
 if(m.geometry.index||p?.count!==36||n?.count!==36||Object.keys(a).sort().join()!=='normal,position,uv'||Object.keys(m.geometry.morphAttributes).length||m.geometry.drawRange.start||m.geometry.drawRange.count!==Infinity)return false;
 const planes=new Map();
 for(let i=0;i<36;i+=3){const ids=[i,i+1,i+2],v=ids.map(k=>new THREE.Vector3().fromBufferAttribute(p,k)),normal=v[1].clone().sub(v[0]).cross(v[2].clone().sub(v[0])).normalize();if(normal.lengthSq()<.9)return false;
  for(const k of ids){const xyz=[p.getX(k),p.getY(k),p.getZ(k)],nn=new THREE.Vector3().fromBufferAttribute(n,k);if(xyz.some((v,j)=>!near(Math.abs(v),[w,h,d][j]/2))||nn.dot(normal)<.999999)return false;}
  const key=normal.toArray().map(x=>Math.round(x)).join();planes.set(key,(planes.get(key)??0)+1);
 }
 return planes.size===6&&[...planes.values()].every(n=>n===2);
}
/** Reversible photo fit of both actual approaches, not a complete gate audit.
 * Only six retained generic stair groups and six ramp proxies are replaced.
 * Source cap triangles are borrowed for exact contact, not re-rendered. */
export function applyWenhuaGateApproaches(kit,frame){
 const g=frame?.userData.structure;if(g?.id!=='south-gate:wenhua'||Object.hasOwn(g,'wenhuaGateApproaches'))return false;
 if(g.profile!=='wenhua'||g.name!=='文华门'||g.x!==-186.3||g.z!==-245.2||g.w!==33.1||g.d!==17||g.ph!==.8||g.colH!==6.5||!g.wenhuaSouthWindow||frame.parent!==kit?.root||!plain(frame)||!frame.position.equals(new THREE.Vector3(g.x,0,g.z))||kit.root.position.lengthSq()||kit.root.rotation.toArray().slice(0,3).some(Boolean)||kit.root.scale.toArray().some(x=>x!==1)||!Object.isExtensible(g)||Object.isFrozen(frame.children)||Object.isFrozen(kit.colliders)||Object.isFrozen(kit.walkables)||'wenhuaGateApproaches' in g)fail();
 const b=6.62,width=5.32,oldRun=1.28,edge=9.3,oldStep=oldRun/5,marble=kit.lib.material('marble'),groups=[],rampIndices=[];
 for(const x of[-b,0,b])for(const sign of[-1,1]){
  const match=frame.children.filter(o=>o.isGroup&&o.position.equals(new THREE.Vector3(x,0,0))&&o.children.length===7&&near(o.children[0]?.position.z,sign*(edge+oldStep/2)));
  if(match.length!==1||!plain(match[0]))fail();const group=match[0];groups.push(group);
  for(let k=0;k<5;k++){const m=group.children[k],top=.8-(k+1)*.8/6;if(!m.isMesh||!plain(m)||m.material!==marble||!near(m.position.x,0)||!near(m.position.y,top/2)||!near(m.position.z,sign*(edge+(k+.5)*oldStep))||!boxShape(m,width,top,oldStep))fail();}
  for(const [i,s]of[-1,1].entries()){const m=group.children[i+5];if(!m?.isMesh||!m.visible||m.material!==marble||!near(m.position.x,s*(width/2+.2))||!near(m.position.y,.45)||!near(m.position.z,sign*(edge+oldRun/2))||!near(m.rotation.x,sign*Math.atan2(.8,oldRun))||m.rotation.y||m.rotation.z||!m.scale.equals(new THREE.Vector3(1,1,1))||!boxShape(m,.4,.3,Math.hypot(oldRun,.8)))fail();}
  const ramps=kit.walkables.map((w,i)=>({w,i})).filter(({w})=>w.type==='ramp'&&w.axis==='z'&&near(w.minX,g.x+x-width/2)&&near(w.maxX,g.x+x+width/2)&&near(w.a0,g.z+sign*edge)&&near(w.a1,g.z+sign*(edge+oldRun))&&w.y0===.8&&w.y1===0);
  if(ramps.length!==1)fail();rampIndices.push(ramps[0].i);
 }
 const old=new Set(groups.flatMap(o=>o.children)),geos=new Set([...old].map(m=>m.geometry));let shared=geos.size!==42;kit.root.traverse(m=>{if(m.isMesh&&!old.has(m)&&geos.has(m.geometry))shared=true;});if(shared)fail();
 const caps=frame.children.filter(m=>m.isMesh&&m.material===kit.lib.material('stone_slab')&&near(m.position.y,.77)&&near(m.position.x,0)&&near(m.position.z,0));if(caps.length!==1||!plain(caps[0])||!boxShape(caps[0],34.8,.08,18.7))fail();
 const stage=new THREE.Group();stage.name='wenhua-gate-two-sided-approaches';const allocated=[],parts=[],sides=new Map(),colliders=[];let committed=false;
 const disposeAll=geometries=>{const errors=[];for(const geometry of new Set(geometries))try{geometry.dispose();}catch(error){errors.push(error);}return errors;};
 const add=(geometry,material,role,side)=>{if(!allocated.includes(geometry))allocated.push(geometry);const m=kit.mesh(stage,geometry,material,0,0,0),id=`wenhua-gate-approach-${parts.length}`;m.name=id+'-'+role;m.userData.wenhuaGateApproach={id,role,side};parts.push(m);sides.set(m,side);return m;};
 // Top quadrilateral has counterclockwise winding seen from above. The volume
 // closes to zero; degenerate toe triangles are omitted, not invented faces.
 const solid=(quad,material,role,side,bottomY=0)=>{const v=[],bottom=quad.map(([x,,z])=>[x,bottomY,z]);const triangle=(a,b,c)=>{const ab=new THREE.Vector3(...b).sub(new THREE.Vector3(...a)),ac=new THREE.Vector3(...c).sub(new THREE.Vector3(...a));if(ab.cross(ac).lengthSq()>1e-16)v.push(...a,...b,...c);};triangle(quad[0],quad[1],quad[2]);triangle(quad[0],quad[2],quad[3]);triangle(bottom[0],bottom[2],bottom[1]);triangle(bottom[0],bottom[3],bottom[2]);for(let i=0;i<4;i++){const j=(i+1)%4;triangle(quad[i],bottom[i],bottom[j]);triangle(quad[i],bottom[j],quad[j]);}const geometry=new THREE.BufferGeometry();allocated.push(geometry);geometry.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geometry.computeVertexNormals();return add(applyBoxUV(geometry,kit.lib.tileSize(material===marble?'marble':'ground_brick')),material,role,side);};
 const slab=(x0,x1,z0,z1,y0,y1,mat,role,side)=>solid([[x0,y0,z0],[x0,y1,z1],[x1,y1,z1],[x1,y0,z0]],mat,role,side);
 const box=(x0,x1,y0,y1,z0,z1,role,side)=>solid([[x0,y1,z0],[x0,y1,z1],[x1,y1,z1],[x1,y1,z0]],marble,role,side,y0);
 try{
  const southTop=-9.35,southToe=-11.91,southHeight=.81,n=10,ds=2.56/n,cw=2.66;
  for(const center of[-b,b])for(let k=0;k<n;k++){const z1=southTop-k*ds,z0=z1-ds,h=southHeight*(n-k)/(n+1);slab(center-width/2,center+width/2,z0,z1,h,h,marble,'south-tread','south');}
  for(const side of[-1,1])for(let k=0;k<n;k++){const z1=southTop-k*ds,z0=z1-ds,h=southHeight*(n-k)/(n+1),a=side<0?-width/2:cw/2,c=side<0?-cw/2:width/2;slab(a,c,z0,z1,h,h,marble,'south-tread','south');}
  slab(-cw/2,cw/2,southToe,southTop,0,southHeight,marble,'south-stone-incline','south');
  for(const center of[-b,0,b])for(const side of[-1,1]){const x=center+side*(width/2+.2);slab(x-.2,x+.2,southToe,southTop,.04,.85,marble,'south-side-stone','south');}
  // The old cap already owns [-9.35,-9.3]; do not add a coplanar join skin.
  const grade=z=>.81*(z-southToe)/(southTop-southToe),railAxis=1.4;
  for(const side of[-1,1]){
   for(const z of[-11.75,-10.63,-9.51]){if(side===-1&&z===-11.75)box(-1.55,-1.25,0,.94,-12,-11.7,'south-plain-post','south');else box(side*railAxis-.15,side*railAxis+.15,0,grade(z)+.94,z-.15,z+.15,'south-plain-post','south');}
   for(const[a,c]of[[-11.6,-10.78],[-10.48,-9.66]]){const q=[[side*railAxis-.1,grade(a)+.25,a],[side*railAxis-.1,grade(c)+.25,c],[side*railAxis+.1,grade(c)+.25,c],[side*railAxis+.1,grade(a)+.25,a]],m=solid(q,marble,'south-sloping-panel','south');const p=m.geometry.attributes.position;for(let i=0;i<p.count;i++)if(p.getY(i)>0)p.setY(i,p.getY(i)+.44);p.needsUpdate=true;m.geometry.computeVertexNormals();}
  }
  for(const z of[-11.75,-9.51])box(-1.25,1.25,grade(z)+.12,grade(z)+.91,z-.1,z+.1,'south-terminal-panel','south');
  const northTop=9.35,northToe=17.35,halfTop=9.93,halfToe=14.8,paving=kit.lib.material('ground_brick');
  slab(-cw/2,cw/2,northTop,northToe,.81,0,marble,'north-central-stone-strip','north');
  for(const side of[-1,1]){
   const q=side<0?[[-halfTop,.81,northTop],[-halfToe,0,northToe],[-cw/2,0,northToe],[-cw/2,.81,northTop]]:[ [cw/2,.81,northTop],[cw/2,0,northToe],[halfToe,0,northToe],[halfTop,.81,northTop] ];solid(q,paving,'north-paved-incline','north');
   const a=side*halfTop,c=side*halfToe;solid([[a-.12,.85,northTop],[c-.12,.04,northToe],[c+.12,.04,northToe],[a+.12,.85,northTop]],marble,'north-flare-border','north');
   for(let k=0;k<n;k++){const z0=northTop+k*ds,z1=z0+ds,h=.81*(n-k)/(n+1),a=halfTop+(halfToe-halfTop)*(z0-northTop)/8,c=halfTop+(halfToe-halfTop)*(z1-northTop)/8,outer=13.24;const q=side<0?[[-outer,h,z0],[-outer,h,z1],[-c,h,z1],[-a,h,z0]]:[[a,h,z0],[c,h,z1],[outer,h,z1],[outer,h,z0]];solid(q,marble,'north-tread','north');}
  }
  // Source-map the precise final Float32 vertices used by ordinary merge.
  frame.add(stage);frame.updateMatrixWorld(true);const anchor=parts.find(m=>m.userData.wenhuaGateApproach.role==='south-plain-post');
  // The lower eastern post is the sole dispatch owner, not an invisible box.
  const expected=WENHUA_GATE_APPROACH_ANCHOR;
  // Its photographed fit is pinned independently of general gate metadata.
  const values=(m)=>{const a=m.geometry.attributes.position,ix=m.geometry.index,v=[];for(let k=0;k<(ix?.count??a.count);k++){const p=new THREE.Vector3().fromBufferAttribute(a,ix?ix.getX(k):k).applyMatrix4(m.matrixWorld);v.push(...p.toArray().map(Math.fround));}return v;};
  const av=values(anchor),ab=new THREE.Box3().setFromPoints(Array.from({length:av.length/3},(_,i)=>new THREE.Vector3(...av.slice(i*3,i*3+3))));
  if(ab.min.toArray().some((v,i)=>Math.abs(v-Math.fround(expected.min[i]))>2e-5)||ab.max.toArray().some((v,i)=>Math.abs(v-Math.fround(expected.max[i]))>2e-5))fail();
  ab.wenhuaGateApproach={id:anchor.userData.wenhuaGateApproach.id,kind:'REAL_PLAIN_POST'};const r=WENHUA_GATE_APPROACH_REGION;ab.furnitureMotionScope={kind:'wenhua-gate-approaches',id:'wenhua-gate-approaches',groundY:0,minOffsetX:r.minX-ab.min.x,maxOffsetX:r.maxX-ab.min.x,minOffsetZ:r.minZ-ab.min.z,maxOffsetZ:r.maxZ-ab.min.z};colliders.push(ab);
  for(const[index,side]of['south','north'].entries()){
   const selected=parts.filter(m=>m!==anchor&&sides.get(m)===side);if(side==='south')selected.push(caps[0]);const faces=[];
   for(const[mesh,m]of selected.entries()){const v=values(m);for(let k=0;k<v.length;k+=9){let vertices=[0,1,2].map(i=>new THREE.Vector3(...v.slice(k+i*3,k+i*3+3)));
    if(m!==caps[0]){faces.push({source:{mesh,triangle:k/9},vertices});continue;}
    // Borrow only the cap's central top, clipped ON its retained triangles.
    // No 34.8 m global surface exception and no new invisible side wall.
    const normal=vertices[1].clone().sub(vertices[0]).cross(vertices[2].clone().sub(vertices[0]));if(normal.y<=0)continue;
    for(const[bound,sign]of[[Math.fround(g.x-10.5),1],[Math.fround(g.x+10.5),-1]]){const next=[];for(let i=0;i<vertices.length;i++){const a=vertices[i],b=vertices[(i+1)%vertices.length],ia=sign*(a.x-bound)>=0,ib=sign*(b.x-bound)>=0;if(ia)next.push(a);if(ia!==ib){const t=(bound-a.x)/(b.x-a.x);next.push(a.clone().lerp(b,t));}}vertices=next;}
    for(let i=1;i+1<vertices.length;i++)faces.push({source:{mesh,triangle:faces.length,retainedOriginalTriangle:k/9,clipFragment:i-1},vertices:[vertices[0],vertices[i],vertices[i+1]]});
   }}
   const surface=createXiqingSurface(faces,WENHUA_GATE_APPROACH_IDS[index]),box=surface.box.clone();box.xiqingRoofSurface=surface;box.wenhuaGateApproach={id:surface.id,sourceMeshes:selected.map(m=>m===caps[0]?'RETAINED_PLATFORM_CAP':m.userData.wenhuaGateApproach.id)};colliders.push(box);
  }
  const metadata={objectId:'FC-5652FA389B',status:'VERIFY_PENDING',accepted:false,scope:'SOUTH_AND_NORTH_APPROACH_ASSEMBLIES_ONLY',dimensionStatus:'REVERSIBLE_PHOTO_FIT_NOT_SURVEY',sources:['https://img.dpm.org.cn/Uploads/Picture/2020/07/03/s5efefc7fb9a3d.jpg','https://img.dpm.org.cn/Uploads/Picture/2020/07/03/s5efefcb74c188.jpg','https://ggzlquanjing.dpm.org.cn/scene/wPIRwsKstn5bVoDoqCG426Sfykpnc2hK/20220207_hyzg/panos/1.tiles/b/l1/01/l1_b_01_01.jpg'],photographyDate:null,stepCountMeaning:'TEN_LEVEL_LOW_POLY_DISCRETIZATION_NOT_PHOTOGRAPH_COUNT',south:{stoneWidth:cw,outerWidth:width,run:2.56,centralRoute:'TWO_STAIR_FLANKS_AROUND_REAL_TERMINAL_STONE_PANELS'},north:{run:8,topWidth:19.86,toeWidth:29.6,flankingStairs:2},remaining:'Fine carved stone profiles, exact dimensions/tread inventory, full gate elevations/room and GPU view not accepted.',addedColliders:3};
  const children=[...frame.children],walkables=[...kit.walkables],originalColliders=[...kit.colliders];
  try{for(const group of groups)frame.remove(group);kit.walkables.splice(0,kit.walkables.length,...walkables.filter((_,i)=>!rampIndices.includes(i)));kit.colliders.push(...colliders);g.wenhuaGateApproaches=metadata;}
  catch(error){frame.children.splice(0,frame.children.length,...children);for(const c of children)c.parent=frame;kit.walkables.splice(0,kit.walkables.length,...walkables);kit.colliders.splice(0,kit.colliders.length,...originalColliders);delete g.wenhuaGateApproaches;throw error;}
  committed=true;
  // Resource retirement happens AFTER the visible/physical commit. A failing
  // listener must not undo the new entrance or stop later retirement attempts.
  const cleanupErrors=disposeAll(geos);metadata.cleanup={status:cleanupErrors.length?'COMMITTED_CLEANUP_FAILED':'RETIRED_SOURCES_RELEASED',attempted:geos.size,failed:cleanupErrors.length};
  if(cleanupErrors.length){const error=new AggregateError(cleanupErrors,'Wenhua gate approaches committed; retired geometry cleanup failed');error.committed=true;error.phase='RETIRED_GEOMETRY_CLEANUP';error.cleanupAttempted=geos.size;throw error;}
  return true;
 }catch(error){
  if(!committed){frame.remove(stage);const cleanupErrors=disposeAll(allocated);if(cleanupErrors.length){const failure=new AggregateError([error,...cleanupErrors],'Wenhua gate approaches failed before commit; generated geometry cleanup failed');failure.committed=false;failure.phase='GENERATED_GEOMETRY_CLEANUP';throw failure;}}
  throw error;
 }
}
