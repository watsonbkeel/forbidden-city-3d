import * as T from 'three';
import {createRoofSection} from './roof-section-evaluator.mjs';
import {createUpperReassemblyContract} from './upper-contract.mjs';
import {createWumenJointProfile} from './profile.mjs';
// Offline ten-layer surfaces, not a roof installer or physical-support provider.
export function buildRoofSectionSurfaces(section,materials){
 const q=createRoofSection(section?.instanceId,section?.layer,section?.mode);
 for(const name of ['tile','soffit','fascia'])if(!materials?.[name]?.isMaterial)throw Error('roof surfaces require borrowed materials');
 const sizes=Object.fromEntries(['tile','soffit','fascia'].map(k=>[k,materials.tileSizes?.[k]??1]));
 for(const size of Object.values(sizes))if(!Number.isFinite(size)||size<=0)throw Error('roof surfaces invalid tileSize');
 const instance=createUpperReassemblyContract().roofKnots.instances.find(i=>i.id===q.instanceId),r=q.recipe;
 const group=new T.Group();group.name=`OFFLINE-ROOF/${q.instanceId}/${q.layer}`;
 let x,z;if(instance.kind==='pavilion'){[x,z]=instance.parentPositionXZ;}else{const w=createWumenJointProfile().wings.find(w=>w.id===q.instanceId);if(!w)throw Error('roof wing reference missing');x=(Math.min(...w.referenceX)+Math.max(...w.referenceX))/2;z=(w.referenceZ[0]+w.referenceZ.at(-1))/2;group.rotation.y=Math.PI/2;}
 group.position.set(x,q.layer==='single'?12.3:0,z);
 group.userData={scope:'OFFLINE_ENGINEERING_LAYER_NO_INSTALLATION_OR_SUPPORT',accepted:false,runtimeInstalled:false,routeAccepted:false,coordinateSpace:'WUMEN_COMPONENT_PARENT_FRAME_NOT_CITY'};
 const owned=[];let disposed=false;
 const dispose=()=>{if(disposed)return;disposed=true;const errors=[];for(const g of owned){try{g.dispose();}catch(e){errors.push(e);}}if(errors.length)throw new AggregateError(errors,'roof geometry retirement failures');};
 const audit={accepted:false,runtimeInstalled:false,routeAccepted:false,colliderCount:0,walkableCount:0,mode:q.mode,layer:q.layer,instanceId:q.instanceId,tileSizes:sizes,removedStructuralTriangles:[],meshes:[],parentPosition:group.position.toArray(),parentRotation:group.rotation.toArray(),bearing:'REFERENCE_PLANE_ONLY_NO_ACTUAL_FAN_OR_BEAM',openBoundaries:'DECLARED_PARTIAL_TILE_SOFFIT_FASCIA_NOT_WATERTIGHT_ROOF'};
 try{
 for(let face=0;face<4;face++)for(const kind of ['tile','soffit','fascia']){
  const ts=kind==='fascia'?[0,1]:q.sampleT(kind),ss=Array.from({length:r.sampleCounts.nU+1},(_,j)=>(1-Math.cos(Math.PI*j/r.sampleCounts.nU))/2);
  const params=[],positions=[],uvs=[];
  for(const row of ts)for(const s of ss){const t=kind==='fascia'?1:row,a=kind==='fascia'?row:null,p=q.point(face,t,s);if(kind==='soffit')p[1]-=r.thickness;if(kind==='fascia')p[1]+=a?-r.thickness*1.5:.03;const uv=kind==='fascia'?q.fasciaUV(face,s,a,sizes[kind]):q.uv(face,t,s,sizes[kind]);params.push({t,s,a});positions.push(p);uvs.push(uv);}
  const converted=positions.map(p=>p.map(Math.fround));if(converted.some(p=>p.some(v=>!Number.isFinite(v)))||uvs.some(uv=>uv.some(v=>!Number.isFinite(Math.fround(v)))))throw Error('roof surface Float32 attributes not finite');
  const end=q.ring(1),A=end[face],B=end[(face+1)%4],reference=kind==='tile'?new T.Vector3(0,1,0):kind==='soffit'?new T.Vector3(0,-1,0):new T.Vector3(B[1]-A[1],0,A[0]-B[0]);
  const indices=[];
  function triangle(a,b,c,row,col,half){
   const verts=[a,b,c].map(j=>new T.Vector3(...converted[j])),cross=new T.Vector3().crossVectors(verts[1].clone().sub(verts[0]),verts[2].clone().sub(verts[0]));
   if(!cross.lengthSq()){
    const pairDuplicate=[a,b,c].some((u,j,arr)=>arr.slice(j+1).some(v=>positions[u].every((n,k)=>n===positions[v][k])&&params[u].t===0&&params[v].t===0));
    if(kind!=='tile'||q.layer==='lower'||!pairDuplicate)throw Error('roof unexpected collapsed Float32 triangle');
    audit.removedStructuralTriangles.push({kind,face,row,col,half,reason:'ANALYTIC_T0_APEX_OR_RIDGE_DUPLICATE'});return;
   }
   if(!Number.isFinite(cross.lengthSq()))throw Error('roof nonfinite triangle');
   if(cross.dot(reference)<0)[b,c]=[c,b];indices.push(a,b,c);
  }
  const width=ss.length;for(let row=0;row<ts.length-1;row++)for(let col=0;col<width-1;col++){const a=row*width+col,b=(row+1)*width+col;triangle(a,a+1,b,row,col,0);triangle(a+1,b+1,b,row,col,1);}
  const used=[...new Set(indices)].sort((a,b)=>a-b),remap=new Map(used.map((j,k)=>[j,k]));
  const g=new T.BufferGeometry();owned.push(g);
  g.setAttribute('position',new T.Float32BufferAttribute(used.flatMap(j=>positions[j]),3));
  g.setAttribute('uv',new T.Float32BufferAttribute(used.flatMap(j=>uvs[j]),2));g.setIndex(indices.map(j=>remap.get(j)));g.computeVertexNormals();g.computeBoundingBox();
  const normal=g.attributes.normal;for(let j=0;j<normal.count;j++){const len=Math.hypot(normal.getX(j),normal.getY(j),normal.getZ(j));if(!Number.isFinite(len)||len===0)throw Error('roof nonfinite or zero vertex normal');}
  g.userData.section={kind,face,parameters:used.map(j=>params[j]),sampleT:[...ts],sampleS:[...ss],thickness:r.thickness};
  const m=new T.Mesh(g,materials[kind]);m.name=`${kind}/${face}`;group.add(m);
  const prior=createRoofSection(q.instanceId,q.layer,'predecessor');let maxDerivedYDelta=0;for(const j of used){const {t,s}=params[j];maxDerivedYDelta=Math.max(maxDerivedYDelta,Math.abs(q.point(face,t,s)[1]-prior.point(face,t,s)[1]));}
  audit.meshes.push({name:m.name,vertices:g.attributes.position.count,triangles:g.index.count/3,bounds:{min:g.boundingBox.min.toArray(),max:g.boundingBox.max.toArray()},maxDoubleLiftYDeltaFromOldParameterSection:maxDerivedYDelta,baseAnchors:r.anchors});
 }
 group.updateMatrixWorld(true);return{group,audit,dispose};
 }catch(error){try{dispose();}catch(cleanup){if(error instanceof Error)Object.defineProperty(error,'cleanupErrors',{value:cleanup.errors,configurable:true});}throw error;}
}
