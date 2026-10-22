import * as THREE from 'three';
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
/** Read-only facade over the current, unmodified building/zone/interior world. */
export class CharacterWorldAdapter{
 constructor({scene,collisionManager,zoneManager=null,interiors=null,registry=CHARACTER_REGISTRY,layout=PALACE_LAYOUT,zones=ZONES}={}){
  this.scene=scene;this.cm=collisionManager;this.zoneManager=zoneManager;this.interiors=interiors;this.registry=registry;this.layout=layout;this.zones=zones;this.maps={};for(const key of ['anchors','surfaces','seats','paths'])this.maps[key]=new Map((registry[key]??[]).map(v=>[v.id,v]));
  this.cache=new Map();this.pathCache=new Map();this.objectIds=new WeakMap();this.nextId=1;this.generation=0;this.raycaster=new THREE.Raycaster();this.raycaster.ray.direction.set(0,-1,0);this.meshCache=null;this.colliderCache=null;this.stats={supportQueries:0,cacheHits:0,pathChecks:0,meshIndexBuilds:0,broadPhaseCandidates:0,raycastMeshTests:0,colliderIndexBuilds:0,colliderCandidates:0};this.disposed=false;
 }
 _id(o){if(!o||typeof o!=='object')return'none';if(!this.objectIds.has(o))this.objectIds.set(o,this.nextId++);return this.objectIds.get(o);}
 getGeneration(zoneRef='static'){
  const zone=this.zoneManager?.loaded?.get(zoneRef),interior=[...(this.interiors?.halls?.values?.()??[])].map(h=>`${h.id}:${h.state}:${h.token}:${this._id(h.group)}`).join('|');
  return `${this.generation}:${zoneRef}:${zoneRef==='static'?this._id(this.scene):this._id(zone?.data?.group)}:${interior}`;
 }
 getRevision(actor){return this.getGeneration(actor?.zoneRef??'static');}
 invalidate(){this.generation++;this.cache.clear();this.pathCache.clear();this.meshCache=null;this.colliderCache=null;}
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
 _meshList(){
  const token=this.getGeneration('static')+':'+[...(this.zoneManager?.loaded?.entries?.()??[])].map(([id,e])=>id+'='+this._id(e.data?.group)).join(',')+':'+(this.scene?.children??[]).map(o=>this._id(o)).join(',');if(this.meshCache?.token===token)return this.meshCache.meshes;
  this.scene?.updateMatrixWorld(true);
  const meshes=[],buckets=new Map(),globals=[],cellSize=32;
  this.scene?.traverse(o=>{
   if(!o.isMesh||o.isInstancedMesh||o.name?.startsWith('COL_')||o.name?.startsWith('WALK_')||!hasVisibleAncestors(o)||!o.geometry)return;
   if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();
   const box=o.geometry.boundingBox?.clone().applyMatrix4(o.matrixWorld);if(!box)return;
   meshes.push(o);const entry={mesh:o,box};
   const x0=Math.floor(box.min.x/cellSize),x1=Math.floor(box.max.x/cellSize),z0=Math.floor(box.min.z/cellSize),z1=Math.floor(box.max.z/cellSize);
   if((x1-x0+1)*(z1-z0+1)>64){globals.push(entry);return;}
   for(let x=x0;x<=x1;x++)for(let z=z0;z<=z1;z++){const key=`${x}:${z}`;let bucket=buckets.get(key);if(!bucket)buckets.set(key,bucket=[]);bucket.push(entry);}
  });
  this.stats.meshIndexBuilds++;
  this.meshCache={token,meshes,buckets,globals,cellSize};return meshes;
 }
 /** A short, layer-bounded ray. A roof or an unbound global ground can never win. */
 supportAt(position,expectedY,tolerance=.03,{zoneRef='static',renderedOnly=false}={}){
  this.stats.supportQueries++;if(!finiteVector(position)||!Number.isFinite(expectedY))return error('Invalid support query');
  const [x,,z]=position;
  if(!renderedOnly){for(const w of this.cm?.walkables??[]){if(w.tag&&zoneRef!=='static'&&w.tag!==zoneRef)continue;let y=null;
    if(w.type==='box'&&x>=w.box.min.x-1e-8&&x<=w.box.max.x+1e-8&&z>=w.box.min.z-1e-8&&z<=w.box.max.z+1e-8)y=w.box.max.y;
    else if(w.type==='ramp'&&x>=w.minX&&x<=w.maxX&&z>=w.minZ&&z<=w.maxZ){const a=w.axis==='x'?x:z,t=Math.max(0,Math.min(1,(a-w.a0)/(w.a1-w.a0)));if(w.crossMin0!==undefined){const cross=w.axis==='x'?z:x;if(cross<w.crossMin0+(w.crossMin1-w.crossMin0)*t||cross>w.crossMax0+(w.crossMax1-w.crossMax0)*t)continue;}y=w.y0+(w.y1-w.y0)*t;}
    if(y!==null&&Math.abs(y-expectedY)<=tolerance+1e-7)return ready({position:[x,y,z],heightMeters:y,kind:'registered-walkable',tag:w.tag??null});
  }}
  if(!this.scene)return pending('Scene support is not available');
  this.raycaster.ray.origin.set(x,expectedY+tolerance+.01,z);this.raycaster.near=0;this.raycaster.far=2*tolerance+.02;
  this._meshList();const {buckets,globals,cellSize}=this.meshCache;
  const entries=[...(buckets.get(`${Math.floor(x/cellSize)}:${Math.floor(z/cellSize)}`)??[]),...globals];this.stats.broadPhaseCandidates+=entries.length;
  const candidates=entries.filter(({box})=>x>=box.min.x-1e-6&&x<=box.max.x+1e-6&&z>=box.min.z-1e-6&&z<=box.max.z+1e-6&&box.max.y>=expectedY-tolerance&&box.min.y<=expectedY+tolerance).map(entry=>entry.mesh);
  // Probe the cheapest real geometry first. An exact declared-layer hit is
  // already a complete bounded support proof; do not raycast every large
  // merged palace mesh after it. Without an exact hit retain the nearest
  // valid downward intersection, as the full raycaster does.
  candidates.sort((a,b)=>(a.geometry.index?.count??a.geometry.attributes.position.count)-(b.geometry.index?.count??b.geometry.attributes.position.count));
  let best=null;for(const mesh of candidates){this.stats.raycastMeshTests++;const hits=this.raycaster.intersectObject(mesh,false);for(const h of hits){if(Math.abs(h.point.y-expectedY)>tolerance+1e-7||!hasVisibleAncestors(h.object))continue;const n=h.face?.normal?.clone().transformDirection(h.object.matrixWorld);if(n&&n.y<.5)continue;if(!best||h.distance<best.distance)best=h;if(Math.abs(h.point.y-expectedY)<1e-6){best=h;break;}}if(best&&Math.abs(best.point.y-expectedY)<1e-6)break;}
  if(best)return ready({position:[x,best.point.y,z],heightMeters:best.point.y,kind:'rendered-geometry',meshName:best.object.name,materialName:best.object.material?.name??null,meshId:this._id(best.object)});
  return pending(`No actual support at (${x.toFixed(3)}, ${expectedY.toFixed(3)}, ${z.toFixed(3)}) within ${tolerance} m`);
 }
 _surfaceAt(surfaceRef,worldPosition,radius=0){
  const s=this.maps.surfaces.get(surfaceRef);if(!s)return error(`Unknown surface: ${surfaceRef}`);const a=this.resolveAnchor(s.anchorRef);if(a.status!=='ready')return a;const p=localPoint(a,worldPosition),b=s.localBoundsMeters;
  if(!b||p[0]-radius<b[0]-1e-7||p[0]+radius>b[1]+1e-7||p[2]-radius<b[2]-1e-7||p[2]+radius>b[3]+1e-7)return error(`Body footprint leaves bound surface: ${surfaceRef}`);
  const expected=a.position[1]+s.expectedHeightMeters,result=this.supportAt(worldPosition,expected,s.heightToleranceMeters,{zoneRef:s.zoneRef,renderedOnly:s.kind==='ground'});if(result.status!=='ready')return result;
  for(const [dx,dz]of radius?[[radius,0],[-radius,0],[0,radius],[0,-radius]]:[]){const q=this.supportAt([worldPosition[0]+dx,expected,worldPosition[2]+dz],expected,s.heightToleranceMeters,{zoneRef:s.zoneRef,renderedOnly:s.kind==='ground'});if(q.status!=='ready')return error(`Unsupported footprint edge on ${surfaceRef}: ${q.reason}`);}
  return ready({...result,surfaceRef,source:s.source});
 }
 /** Seat-only occupancy probe against actual triangles, not merged-mesh boxes.
  *  From a point inside a closed solid, the nearest upward crossing exits it
  *  (normal +Y). From free space the first crossing enters (normal -Y).
  *  Material side is never changed. The bounded 2 m reach covers the retained
  *  throne/kang furniture; it is not a general replacement for player physics. */
 _insideSeatFurniture(position){
  this._meshList();const {buckets,globals,cellSize}=this.meshCache;
  const entries=[...(buckets.get(`${Math.floor(position[0]/cellSize)}:${Math.floor(position[2]/cellSize)}`)??[]),...globals];
  const origin=new THREE.Vector3(...position),up=new THREE.Vector3(0,1,0),a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3(),hit=new THREE.Vector3(),normal=new THREE.Vector3(),edge=new THREE.Vector3();
  for(const {mesh,box}of entries){
   if(!box.containsPoint(origin)||!hasVisibleAncestors(mesh))continue;
   const inverse=new THREE.Matrix4().copy(mesh.matrixWorld).invert(),normalMatrix=new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld),ray=new THREE.Ray(origin.clone().applyMatrix4(inverse),up.clone().transformDirection(inverse));
   const positions=mesh.geometry.attributes.position,indices=mesh.geometry.index,start=mesh.geometry.drawRange.start??0,end=Math.min(indices?.count??positions.count,start+(mesh.geometry.drawRange.count??Infinity));let nearest=Infinity,exit=false;
   for(let i=start;i+2<end;i+=3){
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
  for(const site of HELICOPTER_CLEARANCES){const dx=b[0]-a[0],dz=b[2]-a[2],n=dx*dx+dz*dz,t=n?Math.max(0,Math.min(1,((site.x-a[0])*dx+(site.z-a[2])*dz)/n)):0;if(Math.hypot(a[0]+t*dx-site.x,a[2]+t*dz-site.z)<FLIGHT_RULES.radius+1+radius)return `Helicopter parking/disembark clearance at (${site.x}, ${site.z})`;}return null;
 }
 _forbidden(p,radius=0){const helicopter=this._forbiddenSegment(p,p,radius);if(helicopter)return helicopter;const cut=YANXI_RUIN_GROUND_CUTOUT;if(p[0]+radius>=cut.x-cut.w/2&&p[0]-radius<=cut.x+cut.w/2&&p[2]+radius>=cut.z-cut.d/2&&p[2]-radius<=cut.z+cut.d/2)return'Yanxi water-palace exclusion';
  if(this.cm?.checkBoundary&&!this.cm.checkBoundary({x:p[0],y:p[1],z:p[2]},radius))return'World boundary';
  if(this.cm?.checkRiverCrossing&&!this.cm.checkRiverCrossing({x:p[0],y:p[1],z:p[2]},radius))return'Water or unverified bridge crossing';return null;
 }
 _colliderCandidates(a,b,radius){
  const colliders=this.cm?.colliders??[],token=this.getGeneration('static')+':'+[...(this.zoneManager?.loaded?.entries?.()??[])].map(([id,e])=>id+'='+this._id(e.data?.group)).join(',')+':'+this._id(colliders)+':'+colliders.length;
  if(this.colliderCache?.token!==token){
   const cellSize=32,buckets=new Map(),globals=[];
   for(const c of colliders){const box=c.box??c;if(!box?.min||!box?.max)continue;const x0=Math.floor(box.min.x/cellSize),x1=Math.floor(box.max.x/cellSize),z0=Math.floor(box.min.z/cellSize),z1=Math.floor(box.max.z/cellSize);if((x1-x0+1)*(z1-z0+1)>64){globals.push(c);continue;}for(let x=x0;x<=x1;x++)for(let z=z0;z<=z1;z++){const k=`${x}:${z}`;let list=buckets.get(k);if(!list)buckets.set(k,list=[]);list.push(c);}}
   this.colliderCache={token,cellSize,buckets,globals};this.stats.colliderIndexBuilds++;
  }
  const {cellSize,buckets,globals}=this.colliderCache,result=new Set(globals),x0=Math.floor((Math.min(a[0],b[0])-radius)/cellSize),x1=Math.floor((Math.max(a[0],b[0])+radius)/cellSize),z0=Math.floor((Math.min(a[2],b[2])-radius)/cellSize),z1=Math.floor((Math.max(a[2],b[2])+radius)/cellSize);
  for(let x=x0;x<=x1;x++)for(let z=z0;z<=z1;z++)for(const c of buckets.get(`${x}:${z}`)??[])result.add(c);
  this.stats.colliderCandidates+=result.size;return result;
 }
 _blockedSegment(a,b,radius,height=1.7){
  const bottom=Math.min(a[1],b[1])+.35,top=Math.max(a[1],b[1])+height;
  for(const c of this._colliderCandidates(a,b,radius)){const box=c.box??c;if(!box?.min||box.max.y<=bottom+1e-7||box.min.y>=top-1e-7)continue;
   let lo=0,hi=1;for(const axis of [0,2]){const key=axis===0?'x':'z',d=b[axis]-a[axis],min=box.min[key]-radius,max=box.max[key]+radius;if(Math.abs(d)<1e-12){if(a[axis]<min||a[axis]>max){lo=2;break;}}else{let t0=(min-a[axis])/d,t1=(max-a[axis])/d;if(t0>t1)[t0,t1]=[t1,t0];lo=Math.max(lo,t0);hi=Math.min(hi,t1);if(lo>hi)break;}}
   if(lo<=hi&&lo<=1&&hi>=0)return{tag:c.tag??null,box:{min:box.min.toArray?.()??box.min,max:box.max.toArray?.()??box.max}};
  }return null;
 }
 resolve(actor,metrics={}){
  if(this.disposed)return error('Adapter disposed');if(!actor?.id||!actor.placement)return error('Invalid actor');if(!this.isZoneReady(actor.zoneRef))return pending(`Waiting for zone ${actor.zoneRef}`,{zoneRef:actor.zoneRef});
  const key=`${actor.id}:${this.getGeneration(actor.zoneRef)}:${JSON.stringify(metrics)}:${JSON.stringify(actor.placement)}`;if(this.cache.get(actor.id)?.key===key){this.stats.cacheHits++;return this.cache.get(actor.id).result;}
  const p=actor.placement;let r;
  if(p.mode==='seat')r=this._resolveSeat(actor,metrics);
  else if(p.mode==='path'){const path=this.validatePath(p.pathRef);r=path.status==='ready'?ready({position:[...path.points[0]],rotationYRad:Math.atan2(path.points[1][0]-path.points[0][0],path.points[1][2]-path.points[0][2]),path,support:{surfaceRef:p.surfaceRef,kind:'validated-path'},zoneRef:actor.zoneRef}):path;}
  else if(p.mode==='surface'){
   const a=this.resolveAnchor(p.anchorRef);if(a.status!=='ready')r=a;else if(!finiteVector(p.offsetMeters)||!finiteVector(p.forwardLocal)||Math.hypot(p.forwardLocal[0],p.forwardLocal[2])<1e-9)r=error('Invalid placement transform');else{const pos=point(a,p.offsetMeters),s=this._surfaceAt(p.surfaceRef,pos,.4);if(s.status!=='ready')r=s;else{const blocked=this._blockedSegment(s.position,s.position,.4);const f=this._forbidden(s.position,.4);r=blocked?error(`Static actor ${actor.id} intersects building`,{collision:blocked}):f?error(f):ready({position:s.position,rotationYRad:facing(p.forwardLocal,a.rotationYRad),zoneRef:actor.zoneRef,support:s});}}
  }else r=error(`Invalid placement mode: ${p.mode}`);
  // Pending support can become ready without a zone event (e.g. a static scene
  // building finishes); never cache a negative result as if it were permanent.
  if(r.status==='ready')this.cache.set(actor.id,{key,result:r});else this.cache.delete(actor.id);return r;
 }
 _resolveSeat(actor,metrics){
  const p=actor.placement,s=this.maps.seats.get(p.seatRef);if(!s)return error(`Unknown seat: ${p.seatRef}`);const a=this.resolveAnchor(s.anchorRef);if(a.status!=='ready')return a;
  if(!metrics.seatPelvis||!metrics.seatContact||!(metrics.footContacts??metrics.groundContacts)?.length)return pending(`Waiting for verified Kit seat metrics: ${s.id}`);
  const seatPosition=point(a,s.localSeatContactMeters??s.localPelvisMeters),surface=this.supportAt(seatPosition,seatPosition[1],.03,{zoneRef:s.zoneRef,renderedOnly:true});if(surface.status!=='ready')return pending(`Seat not physically ready: ${s.id}. ${surface.reason}`);
  const b=s.seatBoundsLocalMeters,lp=s.localSeatContactMeters??s.localPelvisMeters,half=s.seatContactHalfExtentsMeters??[.185,.175];if(lp[0]-half[0]<b[0]||lp[0]+half[0]>b[1]||lp[2]-half[1]<b[2]||lp[2]+half[1]>b[3])return error(`Seat footprint outside its physical seat: ${s.id}`);
  for(const [dx,dz]of [[-half[0],-half[1]],[-half[0],half[1]],[half[0],-half[1]],[half[0],half[1]]]){const edge=point(a,[lp[0]+dx,lp[1],lp[2]+dz]),hit=this.supportAt(edge,edge[1],.03,{zoneRef:s.zoneRef,renderedOnly:true});if(hit.status!=='ready')return pending(`Full seated hip support not physically ready: ${s.id}`);}
  const feet=[];for(const local of s.footSupport.localContactsMeters){const fp=point(a,local),f=this.supportAt(fp,fp[1],s.footSupport.heightToleranceMeters??.03,{zoneRef:s.zoneRef,renderedOnly:true});if(f.status!=='ready')return pending(`Foot support not ready: ${s.id}. ${f.reason}`);feet.push(f);}
  const rotationYRad=facing(s.forwardLocal,a.rotationYRad),pelvis=metrics.seatPelvis??[0,.57,-.04],contact=metrics.seatContact??[pelvis[0],pelvis[1]-.08,pelvis[2]];
  if(!finiteVector(pelvis)||!finiteVector(contact))return error('Invalid seat geometry metrics');
  // seatPosition is the actual cloth/seat contact, not the pelvis center.
  const contactOffset=point({position:[0,0,0],rotationYRad},contact),position=surface.position.map((v,i)=>v-contactOffset[i]);
  const pelvisPosition=point({position,rotationYRad},pelvis),footContacts=metrics.footContacts??metrics.groundContacts;
  if(s.localSeatContactMeters&&Math.hypot(...pelvisPosition.map((v,i)=>v-point(a,s.localPelvisMeters)[i]))>(s.maxPelvisClearanceMeters??.02))return error(`Pelvis misses the declared seat binding: ${s.id}`);
  const support={kind:'seat',seatRef:s.id,source:s.geometrySource,seatContactPosition:surface.position,pelvisPosition,footSupports:feet,poseFit:'verified-kit-contact-metrics',requiredSeatDropMeters:surface.position[1]-feet[0].position[1],seatBoundsLocalMeters:b};
  if(footContacts){const matched=new Set();for(let i=0;i<footContacts.length;i++){const actual=point({position,rotationYRad},footContacts[i]),target=feet.findIndex((f,j)=>!matched.has(j)&&Math.hypot(actual[0]-f.position[0],actual[2]-f.position[2])<=.12&&Math.abs(actual[1]-f.position[1])<=.03);if(target<0)return error(`Seated geometry does not fit actual foot support: ${s.id}`,{support,position,rotationYRad,zoneRef:actor.zoneRef});
    matched.add(target);
    for(const [dx,dz]of [[0,0],[-.065,-.139],[-.065,.139],[.065,-.139],[.065,.139]]){const probe=point({position:actual,rotationYRad},[dx,0,dz]),hit=this.supportAt(probe,actual[1],.03,{zoneRef:s.zoneRef,renderedOnly:true});if(hit.status!=='ready')return error(`Whole shoe lacks support on ${s.id}`,{support,position,rotationYRad,zoneRef:actor.zoneRef});const occupied=this._insideSeatFurniture([probe[0],probe[1]+.04,probe[2]]);if(occupied)return error(`Shoe occupies the inside of real furniture: ${s.id}`,{support,position,rotationYRad,zoneRef:actor.zoneRef,collision:occupied});}
   }}
  return ready({position,rotationYRad,zoneRef:actor.zoneRef,support});
 }
 resolvePath(pathOrId){return this.validatePath(pathOrId);}
 validatePath(pathOrId){
  const p=typeof pathOrId==='string'?this.maps.paths.get(pathOrId):pathOrId;if(!p)return error(`Unknown path: ${String(pathOrId)}`);if(!this.isZoneReady(p.zoneRef))return pending(`Waiting for path zone ${p.zoneRef}`);
  const key=`${p.id}:${this.getGeneration(p.zoneRef)}:${JSON.stringify(p)}`;if(this.pathCache.get(p.id)?.key===key){this.stats.cacheHits++;return this.pathCache.get(p.id).result;}this.pathCache.delete(p.id);this.stats.pathChecks++;
  const a=this.resolveAnchor(p.anchorRef);if(a.status!=='ready')return a;
  if(!Array.isArray(p.pointsLocalMeters)||p.pointsLocalMeters.length<2||p.pointsLocalMeters.some(v=>!finiteVector(v)))return error(`Invalid points for path ${p.id}`);
  const radius=p.radiusMeters+p.safetyMarginMeters,spacing=p.validationSpacingMeters;if(!(radius>0)||!Number.isFinite(radius)||!(spacing>0&&spacing<=.25))return error(`Invalid sweep radius/sample spacing for ${p.id}`);
  const raw=p.pointsLocalMeters.map(v=>point(a,v)),samples=[],points=[];let lengthMeters=0;
  for(let i=0;i<raw.length-1;i++){const from=raw[i],to=raw[i+1],length=Math.hypot(to[0]-from[0],to[2]-from[2]);if(length<=1e-8)return error(`Degenerate segment in ${p.id}`);const steps=Math.ceil(length/spacing);
   for(let k=0;k<=steps;k++){if(i&&k===0)continue;const t=k/steps,x=from[0]+(to[0]-from[0])*t,z=from[2]+(to[2]-from[2])*t,s=this._surfaceAt(p.surfaceRef,[x,0,z],radius);if(s.status!=='ready')return error(`Unsupported path ${p.id}, segment ${i}, sample ${k}: ${s.reason}`);
    const f=this._forbidden(s.position,radius);if(f)return error(`Path ${p.id}: ${f}`);
    const prev=samples.at(-1);if(prev){const noFly=this._forbiddenSegment(prev.position,s.position,radius);if(noFly)return error(`Path ${p.id}: ${noFly}`);if(Math.abs(s.position[1]-prev.position[1])>(PLAYER.STEP_UP??.6))return error(`Unverified step in ${p.id}`);const collision=this._blockedSegment(prev.position,s.position,radius);if(collision)return error(`Swept body hits building on ${p.id}, segment ${i}, sample ${k}`,{collision});lengthMeters+=Math.hypot(...s.position.map((v,j)=>v-prev.position[j]));}else{const collision=this._blockedSegment(s.position,s.position,radius);if(collision)return error(`Blocked path start ${p.id}`,{collision});}
    samples.push({position:s.position,surfaceRef:p.surfaceRef,distanceMeters:lengthMeters});if(k===0&&!i||k===steps)points.push(s.position);
   }
  }
  if(lengthMeters<=0)return error(`Zero-length route ${p.id}`);
  // Radius sweep covers turns as well. The wider end disc is checked explicitly.
  for(const pos of [points[0],points.at(-1)]){const turnRadius=Math.max(radius,p.turningRadiusMeters??radius),edge=this._surfaceAt(p.surfaceRef,pos,turnRadius),collision=this._blockedSegment(pos,pos,turnRadius);if(edge.status!=='ready'||collision)return error(`Insufficient turnaround clearance on ${p.id}`,{collision});}
  const result=ready({...p,points,pointsMeters:points,samples,lengthMeters,sweptRadiusMeters:radius,sampleSpacingMeters:spacing,validationGeneration:this.getGeneration(p.zoneRef)});this.pathCache.set(p.id,{key,result});return result;
 }
 dispose(){if(this.disposed)return;this.disposed=true;this.cache.clear();this.pathCache.clear();this.meshCache=null;this.colliderCache=null;}
}
