import * as THREE from 'three';
import {CharacterWorkQueue} from './CharacterWorkQueue.js';
const drain=iterator=>{let step;do{step=iterator.next()}while(!step.done);return step.value;};
const unit=(kind,workUnits=1)=>({kind,workUnits,maxWorkUnits:256});
import {PALACE_LAYOUT} from '../Layout.js';
import westSix from '../../../data/zones/west-six.json' with {type:'json'};
const ZONES=[westSix];
import {PLAYER} from '../../config/constants.js';
import {HELICOPTER_HOME,LANDING_CHOICES,FLIGHT_RULES} from '../flight/FlightState.js';
const HELICOPTER_CLEARANCES=[HELICOPTER_HOME,...LANDING_CHOICES].filter((p,i,a)=>a.findIndex(q=>q.x===p.x&&q.z===p.z)===i);
import {CHARACTER_REGISTRY} from '../../../data/characters/index.js';
import {YANXI_RUIN_GROUND_CUTOUT} from '../palace/special/YanxiRuin.js';
const ready=(fields={})=>({status:'ready',...fields});
const pending=(reason,fields={})=>({status:'pending',reason,...fields});
const error=(reason,fields={})=>({status:'error',reason,...fields});
const finiteVector=p=>Array.isArray(p)&&p.length===3&&p.every(Number.isFinite);
const rotations={south:0,north:Math.PI,east:Math.PI/2,west:-Math.PI/2};
const point=(frame,p)=>[frame.position[0]+p[0]*Math.cos(frame.rotationYRad)+p[2]*Math.sin(frame.rotationYRad),frame.position[1]+p[1],frame.position[2]-p[0]*Math.sin(frame.rotationYRad)+p[2]*Math.cos(frame.rotationYRad)];
const localPoint=(frame,p)=>{const x=p[0]-frame.position[0],z=p[2]-frame.position[2],c=Math.cos(frame.rotationYRad),s=Math.sin(frame.rotationYRad);return[x*c-z*s,p[1]-frame.position[1],x*s+z*c];};
const facing=(v,rotation)=>Math.atan2(v[0],v[2])+rotation;
const hasVisibleAncestors=o=>{for(let p=o;p;p=p.parent)if(!p.visible||p.userData?.characterLayer||p.userData?.isCharacter)return false;return true;};
const EMPTY=Object.freeze([]),proof=height=>({owners:new Map(),bounds:new THREE.Box3(),height:height??1.7,overflow:false,stale:false});
const transformValues=o=>[...o.position.toArray(),...o.quaternion.toArray(),...o.scale.toArray()];
const withEvidence=(options,evidence)=>Object.defineProperty(options,'evidence',{value:evidence});
/** Read-only facade over the current, unmodified building/zone/interior world. */
export class CharacterWorldAdapter{
 constructor({scene,collisionManager,zoneManager=null,interiors=null,registry=CHARACTER_REGISTRY,layout=PALACE_LAYOUT,zones=ZONES}={}){
  this.scene=scene;this.cm=collisionManager;this.zoneManager=zoneManager;this.interiors=interiors;this.registry=registry;this.layout=layout;this.zones=zones;this.maps={};for(const key of ['anchors','surfaces','seats','paths'])this.maps[key]=new Map((registry[key]??[]).map(v=>[v.id,v]));
  this.cache=new Map();this.pathCache=new Map();this.physicalProofs=new Map();this.physicalEpochs=new Map();this.objectIds=new WeakMap();this.nextId=1;this.generation=0;this.raycaster=new THREE.Raycaster();this.raycaster.ray.direction.set(0,-1,0);this.meshCache=null;this.colliderCache=null;this.stats={supportQueries:0,cacheHits:0,pathChecks:0,meshIndexBuilds:0,broadPhaseCandidates:0,raycastMeshTests:0,colliderIndexBuilds:0,colliderCandidates:0};this.disposed=false;this.work=new CharacterWorkQueue();
 }
 _meshList(...args){return drain(this._meshListSteps(...args));}
 supportAt(...args){return drain(this._supportAtSteps(...args));}
 _surfaceAt(...args){return drain(this._surfaceAtSteps(...args));}
 _insideSeatFurniture(...args){return drain(this._insideSeatFurnitureSteps(...args));}
 _colliderCandidates(...args){return drain(this._colliderCandidatesSteps(...args));}
 _blockedSegment(...args){return drain(this._blockedSegmentSteps(...args));}
 resolve(...args){return drain(this._resolveSteps(...args));}
 _resolveSeat(...args){return drain(this._resolveSeatSteps(...args));}
 validatePath(...args){return drain(this._validatePathSteps(...args));}
 resolvePath(...args){return this.validatePath(...args);}
 _id(o){if(!o||typeof o!=='object')return'none';if(!this.objectIds.has(o))this.objectIds.set(o,this.nextId++);return this.objectIds.get(o);}
 getGeneration(zoneRef='static'){
  const zone=this.zoneManager?.loaded?.get(zoneRef),interior=[...(this.interiors?.halls?.values?.()??[])].map(h=>`${h.id}:${h.state}:${h.token}:${this._id(h.group)}`).join('|');
  return `${this.generation}:${zoneRef}:${zoneRef==='static'?this._id(this.scene):this._id(zone?.data?.group)}:${interior}`;
 }
 getRevision(actor){
  const physical=this.physicalProofs.get(actor?.id);if(physical&&this._proofChanged(physical,true)){this.physicalProofs.delete(actor.id);this.physicalEpochs.set(actor.id,(this.physicalEpochs.get(actor.id)??0)+1);this.cache.delete(actor.id);if(actor.placement?.pathRef)this.pathCache.delete(actor.placement.pathRef);this.meshCache=null;this.colliderCache=null;}
  const p=actor?.placement??{},seat=this.maps.seats.get(p.seatRef),path=this.maps.paths.get(p.pathRef),surface=this.maps.surfaces.get(path?.surfaceRef??p.surfaceRef);
  // The shipped registry is deeply frozen. Cache only that exact immutable
  // actor/dependency set; injected mutable configurations are re-read each time.
  this.revisionSpecs??=new WeakMap();const saved=this.revisionSpecs.get(actor??{});
  const anchor=this.maps.anchors.get(p.anchorRef??seat?.anchorRef??path?.anchorRef),surfaceAnchor=this.maps.anchors.get(surface?.anchorRef);
  const immutable=this.registry===CHARACTER_REGISTRY&&Object.isFrozen(actor)&&[seat,path,surface,anchor,surfaceAnchor].every(v=>!v||Object.isFrozen(v));
  const generation=this.getGeneration(actor?.zoneRef??'static')+':physical='+(this.physicalEpochs.get(actor?.id)??0);let spec;
  if(immutable&&saved&&saved.seat===seat&&saved.path===path&&saved.surface===surface&&saved.anchor===anchor&&saved.surfaceAnchor===surfaceAnchor){if(saved.generation===generation)return saved.revision;spec=saved.spec;}
  else spec=JSON.stringify([p,actor?.templateId,actor?.behavior?.basePose,actor?.behavior?.seatVariant,surface,seat,path,anchor,surfaceAnchor]);
  const revision=generation+':'+spec;if(immutable)this.revisionSpecs.set(actor,{spec,seat,path,surface,anchor,surfaceAnchor,generation,revision});return revision;
 }
 invalidate(){this.work.cancel('World explicitly invalidated');this.generation++;this.cache.clear();this.pathCache.clear();this.physicalProofs.clear();this.meshCache=null;this.colliderCache=null;}
 beginReadFrame(){this.frameReads={objects:new Map(),geometries:new Map(),scene:null};}
 endReadFrame(){this.frameReads=null;}
 _sceneSignature(scoped=false){if(scoped&&this.frameReads?.scene!==null&&this.frameReads?.scene!==undefined)return this.frameReads.scene;const roots=this.scene?.children??EMPTY;if(roots.length>1024)throw Error('Unsupported scene root count for bounded support evidence');const result=roots.filter(o=>!o.userData?.characterLayer&&!o.userData?.isCharacter).map(o=>this._id(o)).join(',');if(scoped&&this.frameReads)this.frameReads.scene=result;return result;}
 _geometrySignature(mesh){const g=mesh.geometry,m=Array.isArray(mesh.material)?mesh.material:[mesh.material];if(g.groups.length>16||m.length>16)return null;return [g,g.attributes.position,g.attributes.position?.version,g.index,g.index?.version,g.drawRange.start,g.drawRange.count,mesh.material,m.map(v=>v?.side).join(','),JSON.stringify(g.groups)];}
 _captureProof(p){
  if(p.overflow||p.owners.size>16)throw Error('Support dependency count exceeds bounded evidence limit');
  const owners=[...p.owners.values()];if(p.stale||owners.some(o=>this._ownerChanged(o)))return null;
  return {source:p,owners,bounds:p.bounds.clone(),scene:this._sceneSignature(),colliders:this.cm?.colliders??EMPTY,colliderLength:this.cm?.colliders?.length??0,walkables:this.cm?.walkables??EMPTY,walkableLength:this.cm?.walkables?.length??0};
 }
 _captureOwner(mesh){const chain=[];let o=mesh;for(let i=0;o&&i<16;i++,o=o.parent){chain.push({object:o,parent:o.parent,visible:o.visible,children:o.children.length,transform:transformValues(o)});if(o===this.scene)break;}if(chain.at(-1)?.object!==this.scene)throw Error('Support owner is detached or exceeds bounded ancestry');const geometry=this._geometrySignature(mesh);if(!geometry)throw Error('Support material/group count exceeds bounded evidence limit');return {mesh,chain,geometry};}
 _ownerChanged({mesh,chain,geometry},scoped=false){const reads=scoped?this.frameReads:null;let current=reads?.geometries.get(mesh);if(current===undefined){current=this._geometrySignature(mesh);reads?.geometries.set(mesh,current);}if(!current||current.some((v,i)=>v!==geometry[i]))return true;for(const s of chain){const o=s.object;let actual=reads?.objects.get(o);if(!actual){actual={parent:o.parent,visible:o.visible,children:o.children.length,transform:transformValues(o)};reads?.objects.set(o,actual);}if(actual.parent!==s.parent||actual.visible!==s.visible||actual.children!==s.children||actual.transform.some((v,i)=>v!==s.transform[i]))return true;}return false;}
 _recordSupport(p,position,mesh=null,owner=null){if(!p)return;if(mesh){const old=p.owners.get(mesh);if(old&&this._ownerChanged(old)||!owner||this._ownerChanged(owner))p.stale=true;if(!old&&owner)p.owners.set(mesh,owner);if(p.owners.size>16)p.overflow=true;}p.bounds.expandByPoint(new THREE.Vector3(position[0]-.01,position[1]-.04,position[2]-.01));p.bounds.expandByPoint(new THREE.Vector3(position[0]+.01,position[1]+p.height,position[2]+.01));}
 _mergeProof(target,source){if(!target||!source)return;target.bounds.union(source.bounds);for(const [mesh,owner]of source.owners){if(!target.owners.has(mesh))target.owners.set(mesh,owner);else if(this._ownerChanged(target.owners.get(mesh)))target.stale=true;}target.overflow||=source.overflow||target.owners.size>16;target.stale||=source.stale;}
 _proofChanged(p,scoped=false){
  if(p.scene!==this._sceneSignature(scoped))return true;
  for(const owner of p.owners)if(this._ownerChanged(owner,scoped))return true;
  for(const [name,lengthName]of [['colliders','colliderLength'],['walkables','walkableLength']]){const list=this.cm?.[name]??EMPTY,old=p[lengthName];if(list!==p[name]||list.length<old||list.length-old>64)return true;for(let i=old;i<list.length;i++){const v=list[i],box=v.box??(v.min&&v.max?v:null);if(!box||box.intersectsBox(p.bounds))return true;}p[lengthName]=list.length;}
  return false;
 }
 isZoneReady(zoneRef){if(zoneRef==='static')return !!this.scene;return this.zoneManager?.loaded?.has(zoneRef)??this.zoneManager?.getLoadedIds?.().includes(zoneRef)??false;}
 resolveAnchor(id){
  const a=this.maps.anchors.get(id);if(!a)return error(`Unknown anchor: ${id}`);
  if(a.resolver==='world'){if(!finiteVector(a.positionMeters)||!Number.isFinite(a.rotationYRad??0))return error(`Invalid explicit anchor: ${id}`);return ready({id,position:[...a.positionMeters],rotationYRad:a.rotationYRad??0,zoneRef:a.zoneRef,source:a.source});}
  if(a.resolver==='layout'){const b=this.layout.find(v=>v.name===a.building);if(!b)return error(`Missing real Layout building: ${a.building}`);return ready({id,position:[b.position.x,b.position.y,b.position.z],rotationYRad:0,zoneRef:a.zoneRef,source:a.source,building:b});}
  const zone=this.zoneManager?.zones?.get(a.zoneRef)??this.zones.find(z=>z.id===a.zoneRef);if(!zone)return error(`Missing real zone: ${a.zoneRef}`);
  const item=zone.items?.find(v=>v.name===a.building&&(a.resolver==='zone-region'?v.kind==='region':['hall','gate','cityGate'].includes(v.kind)));if(!item)return error(`Missing real zone anchor ${a.zoneRef}/${a.building}`);
  const rot=typeof item.rot==='number'?item.rot:rotations[item.rot??'south'];if(!Number.isFinite(rot))return error(`Invalid building rotation: ${id}`);
  return ready({id,position:a.resolver==='zone-region'?[(item.x0+item.x1)/2,0,(item.z0+item.z1)/2]:[item.x,0,item.z],rotationYRad:rot,zoneRef:a.zoneRef,source:a.source,building:item});
 }
 _workVersion(){return this.getGeneration('static')+':'+[...(this.zoneManager?.loaded?.entries?.()??[])].map(([id,e])=>id+'='+this._id(e.data?.group)).join(',')+':'+(this.scene?.children??[]).map(o=>this._id(o)).join(',')+':'+this._id(this.cm?.colliders)+':'+(this.cm?.colliders?.length??0)+':'+this._id(this.cm?.walkables)+':'+(this.cm?.walkables?.length??0);}
 // Scheduling hint only; physical placement is still fully validated below.
 preparationPriority(actor,camera){
  if(!camera||!Number.isFinite(camera.x)||!Number.isFinite(camera.z))return 0;
  const p=actor?.placement??{},seat=this.maps.seats.get(p.seatRef),path=this.maps.paths.get(p.pathRef);
  const anchor=this.resolveAnchor(p.anchorRef??seat?.anchorRef??path?.anchorRef);
  const local=seat?.localPelvisMeters??path?.pointsLocalMeters?.[0]??p.offsetMeters;
  if(anchor.status!=='ready'||!finiteVector(local))return Infinity;
  const position=point(anchor,local);return (position[0]-camera.x)**2+(position[2]-camera.z)**2;
 }
 request(actor,metricsProvider=()=>({}),{priority=0,yieldAfterReady=false}={}){
  const owner=this,version=this._workVersion(),revision=this.getRevision(actor);
  return this.work.request(actor?.id??'invalid',function*(){
   try{
   if(owner.disposed)return error('Adapter disposed');
   if(!owner.isZoneReady(actor?.zoneRef))return pending(`Waiting for zone ${actor?.zoneRef}`);
   let metrics=metricsProvider(actor);if(metrics?.next)metrics=yield* metrics;
   const result=yield* owner._resolveSteps(actor,metrics);
   if(revision!==owner.getRevision(actor)||version!==owner._workVersion()){owner.cache.delete(actor.id);owner.physicalProofs.delete(actor.id);if(actor.placement?.pathRef)owner.pathCache.delete(actor.placement.pathRef);return pending('Stale character support discarded');}return result;
   }catch(e){owner.meshCache=null;owner.colliderCache=null;owner.cache.delete(actor.id);owner.physicalProofs.delete(actor.id);if(actor.placement?.pathRef)owner.pathCache.delete(actor.placement.pathRef);return error(String(e));}
  },{version,identity:revision,priority,yieldAfterReady,isCurrent:()=>revision===owner.getRevision(actor)});
 }
 advance(options={}){return this.work.advance({...options,version:this._workVersion()});}
 cancelPending(reason){this.work.cancel(reason);}
 *_meshListSteps(){
  const token=this._workVersion();if(this.meshCache?.token===token)return this.meshCache.meshes;
  const meshes=[],buckets=new Map(),globals=[],cellSize=32,stack=this.scene?[{node:this.scene,index:-1}]:[];
  while(stack.length){
   const frame=stack.at(-1),o=frame.node;
   if(frame.index===-1){
    // Equivalent to updateMatrixWorld(true), but one node at a time.
    if(o.matrixAutoUpdate)o.updateMatrix();
    if(o.matrixWorldAutoUpdate){if(o.parent)o.matrixWorld.multiplyMatrices(o.parent.matrixWorld,o.matrix);else o.matrixWorld.copy(o.matrix);}
    o.matrixWorldNeedsUpdate=false;frame.index=0;yield unit('world-matrix-node');
    if(o.isMesh&&!o.isInstancedMesh&&!o.name?.startsWith('COL_')&&!o.name?.startsWith('WALK_')&&hasVisibleAncestors(o)&&o.geometry){
     const g=o.geometry,positions=g.attributes.position;
     if(!g.boundingBox){
      if(Object.keys(g.morphAttributes).length)throw Error('Unverified morph support bounds');
      const localBox=new THREE.Box3(),v=new THREE.Vector3();
      for(let i=0;i<positions.count;i+=256){for(let j=i;j<Math.min(i+256,positions.count);j++)localBox.expandByPoint(v.fromBufferAttribute(positions,j));yield unit('world-bounds-vertices',Math.min(256,positions.count-i));}
      g.boundingBox=localBox;
     }
     const box=g.boundingBox.clone().applyMatrix4(o.matrixWorld),entry={mesh:o,box};meshes.push(o);
     const x0=Math.floor(box.min.x/cellSize),x1=Math.floor(box.max.x/cellSize),z0=Math.floor(box.min.z/cellSize),z1=Math.floor(box.max.z/cellSize);
     if((x1-x0+1)*(z1-z0+1)>64)globals.push(entry);
     else for(let x=x0;x<=x1;x++)for(let z=z0;z<=z1;z++){const key=`${x}:${z}`;let bucket=buckets.get(key);if(!bucket)buckets.set(key,bucket=[]);bucket.push(entry);}
     yield unit('world-mesh-index',64);
    }
   }else if(frame.index<o.children.length)stack.push({node:o.children[frame.index++],index:-1});
   else{stack.pop();yield unit('world-matrix-unwind');}
  }
  this.stats.meshIndexBuilds++;this.meshCache={token,meshes,buckets,globals,cellSize};return meshes;
 }
 *_rayCandidateSteps(mesh,position,expectedY,tolerance,evidence=null){
  const g=mesh.geometry;if(!mesh.layers.test(this.raycaster.layers))return {nearest:null,exact:null};
  const owner=evidence?this._captureOwner(mesh):null;
  // The proxy shares immutable source attributes/index and never changes source
  // drawRange/material/group/side. THREE performs the actual triangle test.
  this.rayProxies??=new WeakMap();let proxy=this.rayProxies.get(mesh);
  if(!proxy){proxy=new THREE.Mesh(new THREE.BufferGeometry(),mesh.material);proxy.getVertexPosition=(index,out)=>mesh.getVertexPosition(index,out);this.rayProxies.set(mesh,proxy);}
  const geometry=proxy.geometry;geometry.attributes=g.attributes;geometry.index=g.index;
  geometry.boundingBox=g.boundingBox;geometry.boundingSphere=g.boundingBox.getBoundingSphere(geometry.boundingSphere??new THREE.Sphere());
  const groups=Array.isArray(mesh.material)?g.groups:[{start:0,count:g.index?.count??g.attributes.position.count,materialIndex:null}];
  let nearest=null,exact=null;
  for(const group of groups){
   const start=Math.max(0,g.drawRange.start,group.start),end=Math.min(g.index?.count??g.attributes.position.count,g.drawRange.start+g.drawRange.count,group.start+group.count);
   yield unit('ray-material-group');
   for(let i=start;i<end;i+=768){
    proxy.material=group.materialIndex===null?mesh.material:mesh.material[group.materialIndex];proxy.matrixWorld.copy(mesh.matrixWorld);geometry.setDrawRange(i,Math.min(768,end-i));
    this.raycaster.ray.origin.set(position[0],expectedY+tolerance+.01,position[2]);this.raycaster.ray.direction.set(0,-1,0);this.raycaster.near=0;this.raycaster.far=2*tolerance+.02;
    const hits=[];proxy.raycast(this.raycaster,hits);
    for(const h of hits){h.object=mesh;if(group.materialIndex!==null&&h.face)h.face.materialIndex=group.materialIndex;if(Math.abs(h.point.y-expectedY)>tolerance+1e-7||!hasVisibleAncestors(mesh))continue;const n=h.face?.normal?.clone().transformDirection(mesh.matrixWorld);if(n&&n.y<.5)continue;if(!nearest||h.distance<nearest.distance)nearest=h;if(Math.abs(h.point.y-expectedY)<1e-6&&(!exact||h.distance<exact.distance))exact=h;}
    yield unit('support-triangles',Math.ceil(Math.min(768,end-i)/3));
   }
  }
  return {nearest,exact,owner};
 }
 /** A short, layer-bounded ray. A roof or an unbound global ground can never win. */
 *_supportAtSteps(position,expectedY,tolerance=.03,{zoneRef='static',renderedOnly=false,evidence=null}={}){
  this.stats.supportQueries++;if(!finiteVector(position)||!Number.isFinite(expectedY))return error('Invalid support query');const [x,,z]=position;
  if(!renderedOnly){let count=0;for(const w of this.cm?.walkables??[]){if(count++%64===0)yield unit('registered-walkables',64);if(w.tag&&zoneRef!=='static'&&w.tag!==zoneRef)continue;let y=null;
   if(w.type==='box'&&x>=w.box.min.x-1e-8&&x<=w.box.max.x+1e-8&&z>=w.box.min.z-1e-8&&z<=w.box.max.z+1e-8)y=w.box.max.y;
   else if(w.type==='ramp'&&x>=w.minX&&x<=w.maxX&&z>=w.minZ&&z<=w.maxZ){const a=w.axis==='x'?x:z,t=Math.max(0,Math.min(1,(a-w.a0)/(w.a1-w.a0)));if(w.crossMin0!==undefined){const cross=w.axis==='x'?z:x;if(cross<w.crossMin0+(w.crossMin1-w.crossMin0)*t||cross>w.crossMax0+(w.crossMax1-w.crossMax0)*t)continue;}y=w.y0+(w.y1-w.y0)*t;}
   if(y!==null&&Math.abs(y-expectedY)<=tolerance+1e-7){this._recordSupport(evidence,[x,y,z]);return ready({position:[x,y,z],heightMeters:y,kind:'registered-walkable',tag:w.tag??null});}
  }}
  if(!this.scene)return pending('Scene support is not available');yield* this._meshListSteps();const {buckets,globals,cellSize}=this.meshCache;
  const heap=[],less=(a,b)=>a.flat>b.flat||a.flat===b.flat&&(a.cost<b.cost||a.cost===b.cost&&a.order<b.order);let order=0;
  // Heap insertion/pop has at most 32 comparisons for a JS array; unlike an
  // unbounded synchronous sort, candidate collection yields every 16 entries.
  for(const entries of [buckets.get(`${Math.floor(x/cellSize)}:${Math.floor(z/cellSize)}`)??[],globals])for(const {mesh,box}of entries){
   this.stats.broadPhaseCandidates++;if(order++%16===0)yield unit('support-candidates',16);
   if(x<box.min.x-1e-6||x>box.max.x+1e-6||z<box.min.z-1e-6||z>box.max.z+1e-6||box.max.y<expectedY-tolerance||box.min.y>expectedY+tolerance)continue;
   // Ordering only: a flat exact-layer box is NOT support. Its real triangles,
   // holes, drawRange and material side still have to pass the bounded ray.
   const item={mesh,flat:Number(Math.abs(box.max.y-box.min.y)<1e-6&&Math.abs(box.max.y-expectedY)<1e-6),cost:mesh.geometry.index?.count??mesh.geometry.attributes.position.count,order};let i=heap.length;heap.push(item);while(i>0){const parent=(i-1)>>1;if(!less(item,heap[parent]))break;heap[i]=heap[parent];i=parent;}heap[i]=item;
  }
  let best=null,bestOwner=null;
  while(heap.length){
   const item=heap[0],last=heap.pop();if(heap.length){let i=0;while(i*2+1<heap.length){let child=i*2+1;if(child+1<heap.length&&less(heap[child+1],heap[child]))child++;if(!less(heap[child],last))break;heap[i]=heap[child];i=child;}heap[i]=last;}
   this.stats.raycastMeshTests++;const hit=yield* this._rayCandidateSteps(item.mesh,position,expectedY,tolerance,evidence);
   if(hit.exact){best=hit.exact;bestOwner=hit.owner;break;}if(hit.nearest&&(!best||hit.nearest.distance<best.distance)){best=hit.nearest;bestOwner=hit.owner;}
  }
  if(best){this._recordSupport(evidence,[x,best.point.y,z],best.object,bestOwner);return ready({position:[x,best.point.y,z],heightMeters:best.point.y,kind:'rendered-geometry',meshName:best.object.name,materialName:best.object.material?.name??null,meshId:this._id(best.object)});}
  return pending(`No actual support at (${x.toFixed(3)}, ${expectedY.toFixed(3)}, ${z.toFixed(3)}) within ${tolerance} m`);
 }
 *_surfaceAtSteps(surfaceRef,worldPosition,radius=0,evidence=null){
  const s=this.maps.surfaces.get(surfaceRef);if(!s)return error(`Unknown surface: ${surfaceRef}`);const a=this.resolveAnchor(s.anchorRef);if(a.status!=='ready')return a;const p=localPoint(a,worldPosition),b=s.localBoundsMeters;
  if(!b||p[0]-radius<b[0]-1e-7||p[0]+radius>b[1]+1e-7||p[2]-radius<b[2]-1e-7||p[2]+radius>b[3]+1e-7)return error(`Body footprint leaves bound surface: ${surfaceRef}`);
  const expected=a.position[1]+s.expectedHeightMeters,result=(yield* this._supportAtSteps(worldPosition,expected,s.heightToleranceMeters,withEvidence({zoneRef:s.zoneRef,renderedOnly:s.kind==='ground'},evidence)));if(result.status!=='ready')return result;
  for(const [dx,dz]of radius?[[radius,0],[-radius,0],[0,radius],[0,-radius]]:[]){const q=(yield* this._supportAtSteps([worldPosition[0]+dx,expected,worldPosition[2]+dz],expected,s.heightToleranceMeters,withEvidence({zoneRef:s.zoneRef,renderedOnly:s.kind==='ground'},evidence)));if(q.status!=='ready')return error(`Unsupported footprint edge on ${surfaceRef}: ${q.reason}`);}
  return ready({...result,surfaceRef,source:s.source});
 }
 /** Seat-only occupancy probe against actual triangles, not merged-mesh boxes.
  *  From a point inside a closed solid, the nearest upward crossing exits it
  *  (normal +Y). From free space the first crossing enters (normal -Y).
  *  Material side is never changed. The bounded 2 m reach covers the retained
  *  throne/kang furniture; it is not a general replacement for player physics. */
 *_insideSeatFurnitureSteps(position){
  (yield* this._meshListSteps());const {buckets,globals,cellSize}=this.meshCache;
  const lists=[buckets.get(`${Math.floor(position[0]/cellSize)}:${Math.floor(position[2]/cellSize)}`)??[],globals];
  const origin=new THREE.Vector3(...position),up=new THREE.Vector3(0,1,0),a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3(),hit=new THREE.Vector3(),normal=new THREE.Vector3(),edge=new THREE.Vector3();
  let entryCount=0;for(const entries of lists)for(const {mesh,box}of entries){
   if(entryCount++%64===0)yield unit('seat-candidates',64);
   if(!box.containsPoint(origin)||!hasVisibleAncestors(mesh))continue;
   const inverse=new THREE.Matrix4().copy(mesh.matrixWorld).invert(),normalMatrix=new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld),ray=new THREE.Ray(origin.clone().applyMatrix4(inverse),up.clone().transformDirection(inverse));
   const positions=mesh.geometry.attributes.position,indices=mesh.geometry.index,start=mesh.geometry.drawRange.start??0,end=Math.min(indices?.count??positions.count,start+(mesh.geometry.drawRange.count??Infinity));let nearest=Infinity,exit=false;
   for(let i=start;i+2<end;i+=3){
    if((i-start)%384===0)yield unit('seat-triangles',128);
    a.fromBufferAttribute(positions,indices?indices.getX(i):i);b.fromBufferAttribute(positions,indices?indices.getX(i+1):i+1);c.fromBufferAttribute(positions,indices?indices.getX(i+2):i+2);
    if(!ray.intersectTriangle(a,b,c,false,hit))continue;hit.applyMatrix4(mesh.matrixWorld);const distance=hit.y-origin.y;
    if(distance<1e-6||distance>2||distance>=nearest)continue;
    normal.subVectors(b,a).cross(edge.subVectors(c,a)).applyMatrix3(normalMatrix).normalize();if(Math.abs(normal.y)<1e-6)continue;
    nearest=distance;exit=normal.y>0;
   }
   if(exit)return{meshName:mesh.name,meshId:this._id(mesh),exitDistanceMeters:nearest};
  }return null;
 }
 _forbiddenSegment(a,b,radius=0){
  if(this.cm?.checkRiverCrossing&&!this.cm.checkRiverCrossing({x:b[0],y:b[1],z:b[2]},radius,{x:a[0],y:a[1],z:a[2]}))return'Water or unverified bridge crossing';
  for(const site of HELICOPTER_CLEARANCES){const dx=b[0]-a[0],dz=b[2]-a[2],n=dx*dx+dz*dz,t=n?Math.max(0,Math.min(1,((site.x-a[0])*dx+(site.z-a[2])*dz)/n)):0;if(Math.hypot(a[0]+t*dx-site.x,a[2]+t*dz-site.z)<FLIGHT_RULES.radius+1+radius)return `Helicopter parking/disembark clearance at (${site.x}, ${site.z})`;}return null;
 }
 _forbidden(p,radius=0){const helicopter=this._forbiddenSegment(p,p,radius);if(helicopter)return helicopter;const cut=YANXI_RUIN_GROUND_CUTOUT;if(p[0]+radius>=cut.x-cut.w/2&&p[0]-radius<=cut.x+cut.w/2&&p[2]+radius>=cut.z-cut.d/2&&p[2]-radius<=cut.z+cut.d/2)return'Yanxi water-palace exclusion';
  if(this.cm?.checkBoundary&&!this.cm.checkBoundary({x:p[0],y:p[1],z:p[2]},radius))return'World boundary';
  if(this.cm?.checkRiverCrossing&&!this.cm.checkRiverCrossing({x:p[0],y:p[1],z:p[2]},radius))return'Water or unverified bridge crossing';return null;
 }
 *_colliderCandidatesSteps(a,b,radius){
  const colliders=this.cm?.colliders??[],token=this._workVersion();
  if(this.colliderCache?.token!==token){
   const cellSize=32,buckets=new Map(),globals=[];let count=0;
   for(const c of colliders){if(count++%32===0)yield unit('collider-index',32);const box=c.box??c;if(!box?.min||!box?.max)continue;const x0=Math.floor(box.min.x/cellSize),x1=Math.floor(box.max.x/cellSize),z0=Math.floor(box.min.z/cellSize),z1=Math.floor(box.max.z/cellSize);if((x1-x0+1)*(z1-z0+1)>64){globals.push(c);continue;}for(let x=x0;x<=x1;x++)for(let z=z0;z<=z1;z++){const k=`${x}:${z}`;let list=buckets.get(k);if(!list)buckets.set(k,list=[]);list.push(c);}}
   this.colliderCache={token,cellSize,buckets,globals};this.stats.colliderIndexBuilds++;
  }
  const {cellSize,buckets,globals}=this.colliderCache,result=new Set(),x0=Math.floor((Math.min(a[0],b[0])-radius)/cellSize),x1=Math.floor((Math.max(a[0],b[0])+radius)/cellSize),z0=Math.floor((Math.min(a[2],b[2])-radius)/cellSize),z1=Math.floor((Math.max(a[2],b[2])+radius)/cellSize);let count=0;
  for(const c of globals){result.add(c);if(++count%64===0)yield unit('collider-candidates',64);}
  for(let x=x0;x<=x1;x++)for(let z=z0;z<=z1;z++){yield unit('collider-cell');for(const c of buckets.get(`${x}:${z}`)??[]){result.add(c);if(++count%64===0)yield unit('collider-candidates',64);}}
  this.stats.colliderCandidates+=result.size;return result;
 }
 *_blockedSegmentSteps(a,b,radius,height=1.7){
  const bottom=Math.min(a[1],b[1])+.35,top=Math.max(a[1],b[1])+height;
  let colliderCount=0;for(const c of (yield* this._colliderCandidatesSteps(a,b,radius))){if(colliderCount++%64===0)yield unit('collider-narrow-phase',64);const box=c.box??c;if(!box?.min||box.max.y<=bottom+1e-7||box.min.y>=top-1e-7)continue;
   let lo=0,hi=1;for(const axis of [0,2]){const key=axis===0?'x':'z',d=b[axis]-a[axis],min=box.min[key]-radius,max=box.max[key]+radius;if(Math.abs(d)<1e-12){if(a[axis]<min||a[axis]>max){lo=2;break;}}else{let t0=(min-a[axis])/d,t1=(max-a[axis])/d;if(t0>t1)[t0,t1]=[t1,t0];lo=Math.max(lo,t0);hi=Math.min(hi,t1);if(lo>hi)break;}}
   if(lo<=hi&&lo<=1&&hi>=0)return{tag:c.tag??null,box:{min:box.min.toArray?.()??box.min,max:box.max.toArray?.()??box.max}};
  }return null;
 }
 *_resolveSteps(actor,metrics={}){
  if(this.disposed)return error('Adapter disposed');if(!actor?.id||!actor.placement)return error('Invalid actor');if(!this.isZoneReady(actor.zoneRef))return pending(`Waiting for zone ${actor.zoneRef}`,{zoneRef:actor.zoneRef});
  const key=`${actor.id}:${this.getRevision(actor)}:${JSON.stringify(metrics)}:${JSON.stringify(actor.placement)}`;if(this.cache.get(actor.id)?.key===key){this.stats.cacheHits++;return this.cache.get(actor.id).result;}
  const p=actor.placement,evidence=proof();let r;
  if(p.mode==='seat')r=(yield* this._resolveSeatSteps(actor,metrics,evidence));
  else if(p.mode==='path'){const path=(yield* this._validatePathSteps(p.pathRef,{pose:actor.behavior?.basePose??'standing',templateId:actor.templateId,bodyRadiusMeters:.4,bodyHeightMeters:1.7,metrics},evidence));r=path.status==='ready'?ready({position:[...path.points[0]],rotationYRad:Math.atan2(path.points[1][0]-path.points[0][0],path.points[1][2]-path.points[0][2]),path,support:{surfaceRef:p.surfaceRef,kind:'validated-path'},zoneRef:actor.zoneRef}):path;}
  else if(p.mode==='surface'){
   const a=this.resolveAnchor(p.anchorRef);if(a.status!=='ready')r=a;else if(!finiteVector(p.offsetMeters)||!finiteVector(p.forwardLocal)||Math.hypot(p.forwardLocal[0],p.forwardLocal[2])<1e-9)r=error('Invalid placement transform');else{const pos=point(a,p.offsetMeters),s=(yield* this._surfaceAtSteps(p.surfaceRef,pos,.4,evidence));if(s.status!=='ready')r=s;else{const blocked=(yield* this._blockedSegmentSteps(s.position,s.position,.4));const f=this._forbidden(s.position,.4);r=blocked?error(`Static actor ${actor.id} intersects building`,{collision:blocked}):f?error(f):ready({position:s.position,rotationYRad:facing(p.forwardLocal,a.rotationYRad),zoneRef:actor.zoneRef,support:s});}}
  }else r=error(`Invalid placement mode: ${p.mode}`);
  // Pending support can become ready without a zone event (e.g. a static scene
  // building finishes); never cache a negative result as if it were permanent.
  if(key!==`${actor.id}:${this.getRevision(actor)}:${JSON.stringify(metrics)}:${JSON.stringify(actor.placement)}`){this.cache.delete(actor.id);return pending('Actor specification changed during binding');}
  if(r.status==='ready'){const captured=this._captureProof(evidence);if(!captured){this.meshCache=null;this.colliderCache=null;this.cache.delete(actor.id);this.physicalProofs.delete(actor.id);if(actor.placement.pathRef)this.pathCache.delete(actor.placement.pathRef);return pending('Physical support changed before binding commit');}this.physicalProofs.set(actor.id,captured);this.cache.set(actor.id,{key,result:r});}else this.cache.delete(actor.id);return r;
 }
 *_resolveSeatSteps(actor,metrics,evidence=null){
  const p=actor.placement,s=this.maps.seats.get(p.seatRef);if(!s)return error(`Unknown seat: ${p.seatRef}`);const a=this.resolveAnchor(s.anchorRef);if(a.status!=='ready')return a;
  if(!metrics.seatPelvis||!metrics.seatContact||!(metrics.footContacts??metrics.groundContacts)?.length)return pending(`Waiting for verified Kit seat metrics: ${s.id}`);
  const seatPosition=point(a,s.localSeatContactMeters??s.localPelvisMeters),surface=(yield* this._supportAtSteps(seatPosition,seatPosition[1],.03,withEvidence({zoneRef:s.zoneRef,renderedOnly:true},evidence)));if(surface.status!=='ready')return pending(`Seat not physically ready: ${s.id}. ${surface.reason}`);
  const b=s.seatBoundsLocalMeters,lp=s.localSeatContactMeters??s.localPelvisMeters,half=s.seatContactHalfExtentsMeters??[.185,.175];if(lp[0]-half[0]<b[0]||lp[0]+half[0]>b[1]||lp[2]-half[1]<b[2]||lp[2]+half[1]>b[3])return error(`Seat footprint outside its physical seat: ${s.id}`);
  for(const [dx,dz]of [[-half[0],-half[1]],[-half[0],half[1]],[half[0],-half[1]],[half[0],half[1]]]){const edge=point(a,[lp[0]+dx,lp[1],lp[2]+dz]),hit=(yield* this._supportAtSteps(edge,edge[1],.03,withEvidence({zoneRef:s.zoneRef,renderedOnly:true},evidence)));if(hit.status!=='ready')return pending(`Full seated hip support not physically ready: ${s.id}`);}
  const feet=[];for(const local of s.footSupport.localContactsMeters){const fp=point(a,local),f=(yield* this._supportAtSteps(fp,fp[1],s.footSupport.heightToleranceMeters??.03,withEvidence({zoneRef:s.zoneRef,renderedOnly:true},evidence)));if(f.status!=='ready')return pending(`Foot support not ready: ${s.id}. ${f.reason}`);feet.push(f);}
  const rotationYRad=facing(s.forwardLocal,a.rotationYRad),pelvis=metrics.seatPelvis??[0,.57,-.04],contact=metrics.seatContact??[pelvis[0],pelvis[1]-.08,pelvis[2]];
  if(!finiteVector(pelvis)||!finiteVector(contact))return error('Invalid seat geometry metrics');
  // seatPosition is the actual cloth/seat contact, not the pelvis center.
  const contactOffset=point({position:[0,0,0],rotationYRad},contact),position=surface.position.map((v,i)=>v-contactOffset[i]);
  const pelvisPosition=point({position,rotationYRad},pelvis),footContacts=metrics.footContacts??metrics.groundContacts;
  if(s.localSeatContactMeters&&Math.hypot(...pelvisPosition.map((v,i)=>v-point(a,s.localPelvisMeters)[i]))>(s.maxPelvisClearanceMeters??.02))return error(`Pelvis misses the declared seat binding: ${s.id}`);
  const support={kind:'seat',seatRef:s.id,source:s.geometrySource,seatContactPosition:surface.position,pelvisPosition,footSupports:feet,poseFit:'verified-kit-contact-metrics',requiredSeatDropMeters:surface.position[1]-feet[0].position[1],seatBoundsLocalMeters:b};
  if(footContacts){const matched=new Set();for(let i=0;i<footContacts.length;i++){const actual=point({position,rotationYRad},footContacts[i]),target=feet.findIndex((f,j)=>!matched.has(j)&&Math.hypot(actual[0]-f.position[0],actual[2]-f.position[2])<=.12&&Math.abs(actual[1]-f.position[1])<=.03);if(target<0)return error(`Seated geometry does not fit actual foot support: ${s.id}`,{support,position,rotationYRad,zoneRef:actor.zoneRef});
    matched.add(target);
    for(const [dx,dz]of [[0,0],[-.065,-.139],[-.065,.139],[.065,-.139],[.065,.139]]){const probe=point({position:actual,rotationYRad},[dx,0,dz]),hit=(yield* this._supportAtSteps(probe,actual[1],.03,withEvidence({zoneRef:s.zoneRef,renderedOnly:true},evidence)));if(hit.status!=='ready')return error(`Whole shoe lacks support on ${s.id}`,{support,position,rotationYRad,zoneRef:actor.zoneRef});const occupied=(yield* this._insideSeatFurnitureSteps([probe[0],probe[1]+.04,probe[2]]));if(occupied)return error(`Shoe occupies the inside of real furniture: ${s.id}`,{support,position,rotationYRad,zoneRef:actor.zoneRef,collision:occupied});}
   }}
  return ready({position,rotationYRad,zoneRef:actor.zoneRef,support});
 }
 *_validatePathSteps(pathOrId,body={},evidence=null){
  const p=typeof pathOrId==='string'?this.maps.paths.get(pathOrId):pathOrId;if(!p)return error(`Unknown path: ${String(pathOrId)}`);if(!this.isZoneReady(p.zoneRef))return pending(`Waiting for path zone ${p.zoneRef}`);
  const currentKey=()=>`${p.id}:${this.getGeneration(p.zoneRef)}:${JSON.stringify(p)}:${JSON.stringify(this.maps.surfaces.get(p.surfaceRef))}:${JSON.stringify(this.maps.anchors.get(p.anchorRef))}:${JSON.stringify(this.maps.anchors.get(this.maps.surfaces.get(p.surfaceRef)?.anchorRef))}:${JSON.stringify(body)}`;
  const key=currentKey(),cached=this.pathCache.get(p.id);if(cached?.key===key&&!this._proofChanged(cached.proof)){this.stats.cacheHits++;this._mergeProof(evidence,cached.proof.source);return cached.result;}if(cached){this.meshCache=null;this.colliderCache=null;}this.pathCache.delete(p.id);this.stats.pathChecks++;
  const a=this.resolveAnchor(p.anchorRef);if(a.status!=='ready')return a;
  if(!Array.isArray(p.pointsLocalMeters)||p.pointsLocalMeters.length<2||p.pointsLocalMeters.some(v=>!finiteVector(v)))return error(`Invalid points for path ${p.id}`);
  const radius=Math.max(p.radiusMeters+p.safetyMarginMeters,body.bodyRadiusMeters??0),height=body.bodyHeightMeters??1.7,spacing=p.validationSpacingMeters;if(!(radius>0)||!Number.isFinite(radius)||!(height>0)||!Number.isFinite(height)||!(spacing>0&&spacing<=.25))return error(`Invalid sweep radius/height/sample spacing for ${p.id}`);
  const pathEvidence=proof(height),raw=p.pointsLocalMeters.map(v=>point(a,v)),samples=[],points=[];let lengthMeters=0;
  for(let i=0;i<raw.length-1;i++){const from=raw[i],to=raw[i+1],length=Math.hypot(to[0]-from[0],to[2]-from[2]);if(length<=1e-8)return error(`Degenerate segment in ${p.id}`);const steps=Math.ceil(length/spacing);
   for(let k=0;k<=steps;k++){if(i&&k===0)continue;const t=k/steps,x=from[0]+(to[0]-from[0])*t,z=from[2]+(to[2]-from[2])*t,s=(yield* this._surfaceAtSteps(p.surfaceRef,[x,0,z],radius,pathEvidence));if(s.status!=='ready')return error(`Unsupported path ${p.id}, segment ${i}, sample ${k}: ${s.reason}`);
    const f=this._forbidden(s.position,radius);if(f)return error(`Path ${p.id}: ${f}`);
    const prev=samples.at(-1);if(prev){const noFly=this._forbiddenSegment(prev.position,s.position,radius);if(noFly)return error(`Path ${p.id}: ${noFly}`);if(Math.abs(s.position[1]-prev.position[1])>(PLAYER.STEP_UP??.6))return error(`Unverified step in ${p.id}`);const collision=(yield* this._blockedSegmentSteps(prev.position,s.position,radius,height));if(collision)return error(`Swept body hits building on ${p.id}, segment ${i}, sample ${k}`,{collision});lengthMeters+=Math.hypot(...s.position.map((v,j)=>v-prev.position[j]));}else{const collision=(yield* this._blockedSegmentSteps(s.position,s.position,radius,height));if(collision)return error(`Blocked path start ${p.id}`,{collision});}
    samples.push({position:s.position,surfaceRef:p.surfaceRef,distanceMeters:lengthMeters});if(k===0&&!i||k===steps)points.push(s.position);
    // All nested support/raycast/cache operations have completed. The path's
    // evidence and sample arrays are generator-local; no partial binding is published.
    yield {...unit('path-sample-checkpoint',1),checkpoint:true};
   }
  }
  if(lengthMeters<=0)return error(`Zero-length route ${p.id}`);
  // Radius sweep covers turns as well. The wider end disc is checked explicitly.
  for(const pos of [points[0],points.at(-1)]){const turnRadius=Math.max(radius,p.turningRadiusMeters??radius),edge=(yield* this._surfaceAtSteps(p.surfaceRef,pos,turnRadius,pathEvidence)),collision=(yield* this._blockedSegmentSteps(pos,pos,turnRadius,height));if(edge.status!=='ready'||collision)return error(`Insufficient turnaround clearance on ${p.id}`,{collision});}
  if(key!==currentKey()){this.pathCache.delete(p.id);return pending('Path specification changed during validation');}
  const result=ready({...p,points,pointsMeters:points,samples,lengthMeters,sweptRadiusMeters:radius,sampleSpacingMeters:spacing,validationGeneration:this.getGeneration(p.zoneRef)});const captured=this._captureProof(pathEvidence);if(!captured){this.meshCache=null;this.colliderCache=null;this.pathCache.delete(p.id);return pending('Physical support changed before path commit');}this.pathCache.set(p.id,{key,result,proof:captured});this._mergeProof(evidence,pathEvidence);return result;
 }
 dispose(){if(this.disposed)return;this.disposed=true;this.work.dispose();this.endReadFrame();this.cache.clear();this.pathCache.clear();this.physicalProofs.clear();this.physicalEpochs.clear();this.meshCache=null;this.colliderCache=null;this.rayProxies=new WeakMap();this.revisionSpecs=new WeakMap();}
}
