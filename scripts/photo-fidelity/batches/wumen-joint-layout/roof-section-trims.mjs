import * as T from 'three';
import {createRoofSection} from './roof-section-evaluator.mjs';
import {createUpperReassemblyContract} from './upper-contract.mjs';
import {createWumenJointProfile} from './profile.mjs';
// Offline low-detail trim only. Open boundaries are retained and disclosed.
function controls(q,corner){
 const r=q.recipe,steps=q.layer==='lower'?r.sampleCounts.hipLineSteps:r.sampleCounts.tube,start=q.layer==='upper'?.02:0,points=[];
 for(let j=0;j<=steps;j++){const t=start+(1-start)*(j/steps),p=q.point(corner,t,0);p[1]=q.baseY(t)+r.hr*.6;if(t>r.tw)p[1]+=r.lift.L*((t-r.tw)/(1-r.tw))**1.6;points.push(p);}
 const last=points.at(-1),prev=points.at(-3),dx=last[0]-prev[0],dz=last[2]-prev[2],len=Math.hypot(dx,dz)||1;
 points.push([last[0]+dx/len*r.hr*3,last[1]+r.hr*1.6,last[2]+dz/len*r.hr*3]);return points;
}
const tube=(q,corner)=>new T.TubeGeometry(new T.CatmullRomCurve3(controls(q,corner).map(p=>new T.Vector3(...p))),8,q.recipe.hr,4,false);
export function buildRoofSectionTrims(section,materials){
 const q=createRoofSection(section?.instanceId,section?.layer,section?.mode),r=q.recipe,c=createUpperReassemblyContract(),instance=c.roofKnots.instances.find(i=>i.id===q.instanceId);
 for(const name of ['ridge','gold'])if(!materials?.[name]?.isMaterial)throw Error('roof trim requires borrowed ridge/gold material');
 const owned=[];let disposed=false;const own=g=>{owned.push(g);return g;};
 const dispose=()=>{if(disposed)return;disposed=true;const errors=[];for(const g of owned)try{g.dispose();}catch(e){errors.push(e);}if(errors.length)throw new AggregateError(errors,'roof trim retirement failures');};
 const group=new T.Group();group.name=`OFFLINE-TRIM/${q.instanceId}/${q.layer}`;
 let x,z;if(instance.kind==='pavilion'){[x,z]=instance.parentPositionXZ;}else{const w=createWumenJointProfile().wings.find(w=>w.id===q.instanceId);x=(Math.min(...w.referenceX)+Math.max(...w.referenceX))/2;z=(w.referenceZ[0]+w.referenceZ.at(-1))/2;group.rotation.y=Math.PI/2;}
 group.position.set(x,q.layer==='single'?12.3:0,z);group.userData={scope:'UNINSTALLED_PARTIAL_TRIM_NO_SUPPORT',accepted:false,runtimeInstalled:false,routeAccepted:false};
 const audit={instanceId:q.instanceId,layer:q.layer,mode:q.mode,accepted:false,runtimeInstalled:false,routeAccepted:false,colliderCount:0,walkableCount:0,walkingBeastCount:0,removedPoleTriangles:[],normalization:[],meshes:[],openBoundaries:{hips:'TUBE_ENDS_OPEN',surroundingRidge:q.layer==='lower'?'TOP_AND_BOTTOM_OPEN_ORIGINAL_SIDE_PRISM':null},uvPolicy:'NATIVE_THREE_PARAMETER_UV_EXCEPT_LOWER_PRISM_METRE_TILE1_NOT_PHOTOGRAPHIC',parentPosition:group.position.toArray(),parentRotation:group.rotation.toArray()};
 const add=(g,material,name)=>{const m=new T.Mesh(g,material);m.name=name;group.add(m);return m;};
 try{
 for(let f=0;f<4;f++){
  const g=own(tube(q,f)),m=add(g,materials.ridge,`hip/${f}`);m.userData.controls=controls(q,f);
  const old=tube(createRoofSection(q.instanceId,q.layer,'predecessor'),f);let delta=0;try{for(let j=0;j<g.attributes.position.count;j++)delta=Math.max(delta,Math.abs(g.attributes.position.getY(j)-old.attributes.position.getY(j)));}finally{old.dispose();}m.userData.actualFloat32VertexYDeltaFromOldParameterTube=delta;
 }
 if(q.layer==='lower'){
  const h=instance.lower[q.mode==='proposal'?'newSkirtKnotsInnerBearingEave':'oldSkirtKnotsInnerBearingEave'];const hx=(q.mode==='proposal'?h[0][0]:h[0])+r.hr,hz=(q.mode==='proposal'?h[1][0]:h[0])+r.hr,y0=q.baseY(0)-r.hr,y1=q.baseY(0)+1.8*r.hr;
  const poly=[[-hx,-hz],[hx,-hz],[hx,hz],[-hx,hz]],positions=[],uv=[],indices=[];let per=0;
  for(let f=0;f<4;f++){const a=poly[f],b=poly[(f+1)%4],len=Math.hypot(b[0]-a[0],b[1]-a[1]),start=positions.length/3;positions.push(a[0],y0,a[1],b[0],y0,b[1],b[0],y1,b[1],a[0],y1,a[1]);uv.push(per,y0,per+len,y0,per+len,y1,per,y1);indices.push(start,start+2,start+1,start,start+3,start+2);per+=len;}
  const g=own(new T.BufferGeometry());g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();add(g,materials.ridge,'lower-surrounding-ridge');
 }else if(q.layer==='upper'){
  const f=r.finial,g=own(new T.LatheGeometry(f.profileRH.map(([rad,y])=>new T.Vector2(rad*f.hf*f.radiusScale,y*f.hf)),r.sampleCounts.lathe)),p=g.attributes.position,original=Array.from(g.index.array),index=[];
  for(let j=0;j<original.length;j+=3){const ids=original.slice(j,j+3),v=ids.map(k=>new T.Vector3().fromBufferAttribute(p,k)),area=new T.Vector3().crossVectors(v[1].clone().sub(v[0]),v[2].clone().sub(v[0])).lengthSq();if(area>0){index.push(...ids);continue;}const poles=ids.filter(k=>p.getX(k)===0&&p.getZ(k)===0&&(p.getY(k)===0||p.getY(k)===Math.fround(1.18*f.hf)));if(poles.length<2)throw Error('trim unexpected non-pole collapse');audit.removedPoleTriangles.push({triangle:j/3,indices:ids,reason:'ANALYTIC_LATHE_ENDPOINT_POLE'});}
  const used=[...new Set(index)].sort((a,b)=>a-b),map=new Map(used.map((v,j)=>[v,j]));for(const [name,a]of Object.entries(g.attributes)){const values=used.flatMap(j=>Array.from(a.array.slice(j*a.itemSize,(j+1)*a.itemSize)));g.setAttribute(name,new T.BufferAttribute(new a.array.constructor(values),a.itemSize,a.normalized));}g.setIndex(index.map(k=>map.get(k)));const beforeNormals=Array.from(g.attributes.normal.array);g.normalizeNormals();const afterNormals=Array.from(g.attributes.normal.array);audit.normalization.push({mesh:'finial',policy:'NORMALIZE_RETAINED_NATIVE_DIRECTION_AFTER_POLE_PRUNE',changedComponents:afterNormals.filter((v,j)=>v!==beforeNormals[j]).length,maxComponentDelta:Math.max(...afterNormals.map((v,j)=>Math.abs(v-beforeNormals[j])))});const m=add(g,materials.gold,'finial');m.position.y=f.baseY;
 }else{
  const half=instance.single.ridgeHalf[q.mode==='proposal'?'proposal':'old'],h=r.hr*3.4,w=r.hr*2.2,length=half*2+r.hr*2,y=q.baseY(0)-r.hr;
  const ridge=add(own(new T.BoxGeometry(length,h,w)),materials.ridge,'main-ridge');ridge.position.y=y+h/2;
  const cap=add(own(new T.CylinderGeometry(w*.42,w*.42,length,r.sampleCounts.radial)),materials.ridge,'ridge-cap');cap.rotation.z=Math.PI/2;cap.position.y=y+h;
 }
 for(const m of group.children){const g=m.geometry,p=g.attributes.position,n=g.attributes.normal;for(const a of Object.values(g.attributes))if(!Array.from(a.array).every(Number.isFinite))throw Error('trim attribute not finite');for(let j=0;j<n.count;j++)if(Math.hypot(n.getX(j),n.getY(j),n.getZ(j))===0)throw Error('trim zero normal');const ids=g.index.array;for(let j=0;j<ids.length;j+=3){const v=Array.from(ids.slice(j,j+3),k=>new T.Vector3().fromBufferAttribute(p,k)),cross=new T.Vector3().crossVectors(v[1].clone().sub(v[0]),v[2].clone().sub(v[0]));if(!Number.isFinite(cross.lengthSq())||cross.lengthSq()===0)throw Error('trim unexpected triangle collapse');}g.computeBoundingBox();audit.meshes.push({name:m.name,vertices:p.count,triangles:g.index.count/3,localBounds:{min:g.boundingBox.min.toArray(),max:g.boundingBox.max.toArray()},position:m.position.toArray(),rotation:m.rotation.toArray(),actualFloat32VertexYDeltaFromOldParameterTube:m.userData.actualFloat32VertexYDeltaFromOldParameterTube??null});}
 group.updateMatrixWorld(true);return{group,audit,dispose};
 }catch(error){try{dispose();}catch(cleanup){if(error instanceof Error&&Object.isExtensible(error))Object.defineProperty(error,'cleanupErrors',{value:cleanup.errors});}throw error;}
}
