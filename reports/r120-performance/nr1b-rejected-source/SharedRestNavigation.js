import {captureNumericSource as numericProof,numericSourceCurrent as numericCurrent} from './SharedRestNumericSource.js';
import {SharedRestSurfaces} from './SharedRestSurfaces.js';
import {zoneVisibilityIsManaged} from '../../render/OcclusionByWall.js';
import * as THREE from 'three';
import {CollisionManager} from '../../utils/Collision.js';
import {CharacterWorldAdapter} from './CharacterWorldAdapter.js';
import {characterContactMetrics} from './CharacterKit.js';
import {resolveChuxiuSharedRest,SHARED_REST_IDS} from './SharedRestSlots.js';
import emperorRoute from '../../../data/characters/emperor-night-route.json' with {type:'json'};
import routes from '../../../data/characters/night-routes.json' with {type:'json'};
export const SHARED_REST_PATHS=new Map([[SHARED_REST_IDS[0],emperorRoute.points],[SHARED_REST_IDS[1],routes.paths.find(p=>p.bedId==='chuxiu-northwest-canopy').points]]);
const numeric=o=>JSON.stringify(Object.fromEntries(Object.entries(o).filter(([key])=>key!=='mesh')));
const proof=(root,shallow=false)=>{const nodes=new Set();if(shallow)nodes.add(root);else root.traverse(o=>nodes.add(o));for(let p=root.parent;p;p=p.parent)nodes.add(p);return [...nodes].map(o=>({object:new WeakRef(o),parent:o.parent?new WeakRef(o.parent):null,visible:o.visible,managedLOD:o.parent?.isLOD?o.parent.levels.findIndex(level=>level.object===o):-1,lodDistance:o.parent?.isLOD?o.parent.levels.find(level=>level.object===o)?.distance:null,children:o===root||o.isMesh?o.children.map(c=>c.uuid):null,transform:[...o.position.toArray(),...o.quaternion.toArray(),...o.scale.toArray()],geometry:o.geometry?new WeakRef(o.geometry):null,position:o.geometry?.attributes.position?new WeakRef(o.geometry.attributes.position):null,version:o.geometry?.attributes.position?.version,positionArray:o.geometry?.attributes.position?.array?new WeakRef(o.geometry.attributes.position.array):null,positionShape:o.geometry?.attributes.position?[o.geometry.attributes.position.count,o.geometry.attributes.position.itemSize]:null,index:o.geometry?.index?new WeakRef(o.geometry.index):null,indexVersion:o.geometry?.index?.version,indexArray:o.geometry?.index?.array?new WeakRef(o.geometry.index.array):null,indexShape:o.geometry?.index?[o.geometry.index.count,o.geometry.index.itemSize]:null,draw:o.geometry?[o.geometry.drawRange.start,o.geometry.drawRange.count]:null,material:o.material?new WeakRef(o.material):null,materialState:o.material?[o.material.visible,o.material.side,o.material.opacity]:null}));};
const proofCurrent=rows=>rows.every(r=>{const o=r.object.deref();if(!o||o.parent!==(r.parent?.deref()??null))return false;if(r.managedLOD>=0){const level=o.parent?.levels?.[r.managedLOD];if(level?.object!==o||level.distance!==r.lodDistance)return false;}else if(o.visible!==r.visible&&!zoneVisibilityIsManaged(o))return false;const t=r.transform;if(o.position.x!==t[0]||o.position.y!==t[1]||o.position.z!==t[2]||o.quaternion.x!==t[3]||o.quaternion.y!==t[4]||o.quaternion.z!==t[5]||o.quaternion.w!==t[6]||o.scale.x!==t[7]||o.scale.y!==t[8]||o.scale.z!==t[9])return false;if(r.children&&(o.children.length!==r.children.length||o.children.some((c,i)=>c.uuid!==r.children[i])))return false;if(r.geometry&&(o.geometry!==r.geometry.deref()||o.geometry.attributes.position!==r.position?.deref()||o.geometry.attributes.position?.version!==r.version||o.geometry.attributes.position?.array!==r.positionArray?.deref()||o.geometry.attributes.position?.count!==r.positionShape?.[0]||o.geometry.attributes.position?.itemSize!==r.positionShape?.[1]||o.geometry.index!==(r.index?.deref()??null)||o.geometry.index?.version!==r.indexVersion||o.geometry.index?.array!==r.indexArray?.deref()||o.geometry.index?.count!==r.indexShape?.[0]||o.geometry.index?.itemSize!==r.indexShape?.[1]||o.geometry.drawRange.start!==r.draw[0]||o.geometry.drawRange.count!==r.draw[1]))return false;return !r.material||(o.material===r.material.deref()&&o.material.visible===r.materialState[0]&&o.material.side===r.materialState[1]&&o.material.opacity===r.materialState[2]);});
/** The two authored routes own a numeric corridor, never player collision or
 * remote render resources. Normal ZoneManager unload is the only transition
 * authorizing offline use; changed/detached live sources fail closed. */
export class SharedRestNavigation {
 constructor(world,registry){
  this.world=world;this.registry=registry;this.zm=world.zoneManager;this.status='pending';this.reason='Awaiting prebuilt source';this.seeds=new Map();this.sources=new Map();this.liveCorridorOwners=[];this.ownerLookup=new WeakMap();this.corridorBaselines=new Map();this.staticMeshes=[];this.stats={colliders:0,walkables:0,numericBytesEstimate:0,buildMs:0};
  if(!this.zm?.prebuilt||!world.scene||!world.cm)return;
  const start=performance.now(),cells=new Set(),size=2;
  const mark=p=>{for(let x=-1;x<=1;x++)for(let z=-1;z<=1;z++)cells.add(`${Math.floor(p[0]/size)+x},${Math.floor(p[2]/size)+z}`);};
  for(const points of SHARED_REST_PATHS.values()){mark(points[0]);for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[2]-a[2])/size));for(let j=1;j<=n;j++)mark([a[0]+(b[0]-a[0])*j/n,0,a[2]+(b[2]-a[2])*j/n]);}}
  const cellPoints=[...cells].map(k=>k.split(',').map(Number));
  const relevant=box=>{if(!box?.min)return false;const x0=Math.floor(box.min.x/size),x1=Math.floor(box.max.x/size),z0=Math.floor(box.min.z/size),z1=Math.floor(box.max.z/size);if((x1-x0+1)*(z1-z0+1)<=cells.size){for(let x=x0;x<=x1;x++)for(let z=z0;z<=z1;z++)if(cells.has(`${x},${z}`))return true;}else for(const[x,z]of cellPoints)if(x>=x0&&x<=x1&&z>=z0&&z<=z1)return true;return false;};
  this.relevant=relevant;
  const nav=this.nav=new CollisionManager();nav.colliders=world.cm.colliders.filter(c=>relevant(c.box)).map(c=>({...c,mesh:undefined,box:c.box.clone()}));nav.walkables=world.cm.walkables.filter(w=>relevant(w.box??{min:{x:w.minX,z:w.minZ},max:{x:w.maxX,z:w.maxZ}})).map(w=>({...w,...(w.box?{box:w.box.clone()}:{})}));
  for(const[id,entry]of this.zm.prebuilt){const selected=entry.data.colliders.filter(c=>relevant(c.isBox3?c:new THREE.Box3().setFromObject(c)));nav.addColliders(selected,id);nav.addWalkables(entry.data.walkables.filter(w=>relevant(w.box??{min:{x:w.minX,z:w.minZ},max:{x:w.maxX,z:w.maxZ}})),id);}
  for(const c of nav.colliders)delete c.mesh;
  for(const zone of new Set(nav.colliders.map(c=>c.tag??'static').concat(nav.walkables.map(w=>w.tag??'static'))))this.corridorBaselines.set(zone,numeric({colliders:nav.colliders.filter(c=>(c.tag??'static')===zone),walkables:nav.walkables.filter(w=>(w.tag??'static')===zone)}));
  this.captureOwners();
  const zoneGroups=new Set([...this.zm.loaded.values()].map(e=>e.data.group).concat([...this.zm.silhouettes.values()]));world.scene.traverse(o=>{if(!o.isMesh||!o.geometry)return;for(let p=o;p;p=p.parent)if(zoneGroups.has(p)||p.userData?.characterLayer||p.userData?.isCharacter||p.userData?.nonArchitecturalLighting)return;const box=new THREE.Box3().setFromObject(o);if(box.min.y>=25||box.max.y<-.2||!relevant(box))return;this.staticMeshes.push({object:new WeakRef(o),proof:proof(o),bounds:[box.min.x,box.max.x,box.min.z,box.max.z]});});

  this.surfaces=new SharedRestSurfaces(relevant);for(const row of this.staticMeshes)this.surfaces.add(row.object.deref(),'static');for(const[id,e]of [...this.zm.loaded,...this.zm.prebuilt])this.surfaces.add(e.data.group,id);this.surfaces.index();this.surfaceStats=this.surfaces.stats;
  this.stats={colliders:nav.colliders.length,walkables:nav.walkables.length,numericBytesEstimate:nav.colliders.length*160+nav.walkables.length*96,buildMs:0};
  const entry=this.zm.loaded.get('west-six')??this.zm.prebuilt.get('west-six');
  if(!entry)return;
  const group=entry.data.group,bed=resolveChuxiuSharedRest(group,{allowDetached:this.zm.prebuilt.has('west-six')});if(bed.status!=='ready'){this.reason=bed.reason;return;}
  this.slots=bed.slots;this.bedIdentity=bed.sourceIdentity;this.capture('west-six',group);
  for(const id of SHARED_REST_IDS){const actor=registry.actors.find(a=>a.id===id);let adapter=world,copy;
   if(actor.zoneRef==='west-six'&&!this.zm.loaded.has('west-six')){copy=new THREE.Scene();const clone=group.clone(true);copy.add(clone);copy.updateMatrixWorld(true);adapter=new CharacterWorldAdapter({scene:copy,collisionManager:nav,zoneManager:{loaded:new Map([['west-six',{data:{group:clone}}]])},registry});}
   const binding=adapter.resolve(actor,characterContactMetrics('seated',actor.behavior.seatVariant));if(adapter!==world)adapter.dispose();if(binding.status!=='ready'){this.reason=binding.reason;return;}this.seeds.set(id,JSON.parse(JSON.stringify(binding)));
  }
  this.listener=(event,id,data)=>{if(!this.corridorBaselines.has(id))return;
   if(event==='unload'){this.sources.set(id,this.validate()?{offline:true}:{invalid:true});}
   else if(event==='load'){
    this.sources.set(id,{invalid:true});
    const check=new CollisionManager();check.addColliders(data.colliders.filter(c=>this.relevant(c.isBox3?c:new THREE.Box3().setFromObject(c))),id);check.addWalkables(data.walkables.filter(w=>this.relevant(w.box??{min:{x:w.minX,z:w.minZ},max:{x:w.maxX,z:w.maxZ}})),id);for(const c of check.colliders)delete c.mesh;
    if(numeric({colliders:check.colliders,walkables:check.walkables})!==this.corridorBaselines.get(id)){this.status='error';this.reason='Rebuilt corridor source differs from verified route';return;}
    if(id==='west-six'){const next=resolveChuxiuSharedRest(data.group);if(next.status!=='ready'){this.status='error';this.reason=next.reason;return;}const actor=this.registry.actors.find(a=>a.id===SHARED_REST_IDS[1]),binding=this.world.resolve(actor,characterContactMetrics('seated',actor.behavior.seatVariant));if(binding.status!=='ready'||JSON.stringify(binding.position)!==JSON.stringify(this.seeds.get(actor.id).position)){this.status='error';this.reason='Rebuilt daytime support no longer matches verified route';return;}this.seeds.set(actor.id,JSON.parse(JSON.stringify(binding)));this.slots=next.slots;this.bedIdentity=next.sourceIdentity;}
    if(!this.surfaces.rebind(data.group,id)){this.status='error';this.reason='Rebuilt actual contact surfaces differ';return;}this.capture(id,data.group);this.captureOwners(id);
   }
  };
  for(const id of this.corridorBaselines.keys())if(id!=='static'&&!this.sources.has(id)){const source=this.zm.loaded.get(id)??this.zm.prebuilt.get(id);if(source)this.capture(id,source.data.group);}
  this.zm.lifecycleListeners.add(this.listener);this.status='ready';this.reason=null;this.stats.buildMs=performance.now()-start;
 }
 capture(id,group){const meshes=[];group.updateWorldMatrix(true,true);group.traverse(o=>{if(o.isMesh){const b=new THREE.Box3().setFromObject(o);if(this.relevant(b))meshes.push({bounds:[b.min.x,b.max.x,b.min.z,b.max.z],proof:proof(o)});}});const entry=this.zm.loaded.get(id)??this.zm.prebuilt.get(id);this.sources.set(id,{group:new WeakRef(group),proof:proof(group,true),meshes,colliderCount:entry.data.colliders.length,walkableCount:entry.data.walkables.length});}
 captureOwners(onlyZone=null){
  if(onlyZone)this.liveCorridorOwners=this.liveCorridorOwners.filter(r=>r.zone!==onlyZone);
  const add=(object,kind,zone,mode)=>{if(!onlyZone||zone===onlyZone){const box=object.box??(object.isBox3?object:{min:{x:object.minX,z:object.minZ},max:{x:object.maxX,z:object.maxZ}}),array=mode==='live'?this.world.cm[kind==='collider'?'colliders':'walkables']:this.zm.prebuilt.get(zone).data[kind==='collider'?'colliders':'walkables'],row={object:new WeakRef(object),array:new WeakRef(array),index:array.indexOf(object),kind,zone,mode,proof:numericProof(object),bounds:[box.min.x,box.max.x,box.min.z,box.max.z]};this.liveCorridorOwners.push(row);this.ownerLookup.set(object,row);}};
  for(const c of this.world.cm.colliders)if(this.relevant(c.box))add(c,'collider',c.tag??'static','live');
  for(const w of this.world.cm.walkables)if(this.relevant(w.box??{min:{x:w.minX,z:w.minZ},max:{x:w.maxX,z:w.maxZ}}))add(w,'walkable',w.tag??'static','live');
  for(const[id,e]of this.zm.prebuilt){if(onlyZone&&id!==onlyZone)continue;for(const c of e.data.colliders)if(this.relevant(c.isBox3?c:new THREE.Box3().setFromObject(c)))add(c,'collider',id,'prebuilt');for(const w of e.data.walkables)if(this.relevant(w.box??{min:{x:w.minX,z:w.minZ},max:{x:w.maxX,z:w.maxZ}}))add(w,'walkable',id,'prebuilt');}
  this.reindexOwners();
 }
 reindexOwners(){this.ownerCells=new Map();this.ownerGlobals=[];for(const row of this.liveCorridorOwners){const b=row.bounds,x0=Math.floor(b[0]/8),x1=Math.floor(b[1]/8),z0=Math.floor(b[2]/8),z1=Math.floor(b[3]/8);if((x1-x0+1)*(z1-z0+1)>64){this.ownerGlobals.push(row);continue;}for(let x=x0;x<=x1;x++)for(let z=z0;z<=z1;z++){const key=`${x},${z}`;if(!this.ownerCells.has(key))this.ownerCells.set(key,[]);this.ownerCells.get(key).push(row);}}}
 currentOwners(positions){if(!positions)return this.liveCorridorOwners;const result=new Set(this.ownerGlobals);for(const p of positions)for(let x=Math.floor((p[0]-3)/8);x<=Math.floor((p[0]+3)/8);x++)for(let z=Math.floor((p[2]-3)/8);z<=Math.floor((p[2]+3)/8);z++)for(const row of this.ownerCells.get(`${x},${z}`)??[])result.add(row);return result;}
 validate(positions=null){
  if(!this.slots||this.seeds.size!==2)return false;
  const fail=reason=>{this.status='error';this.reason=reason;return false;};
  // One frame can travel at most 1.2 m, plus the complete standing/sleeping
  // body. Only these currently consumed route supports need scalar checks;
  // future segments are checked before they can become a movement target.
  const nearBounds=(x0,x1,z0,z1)=>{if(!positions)return true;for(const p of positions)if(p[0]+3>=x0&&p[0]-3<=x1&&p[2]+3>=z0&&p[2]-3<=z1)return true;return false;},near=b=>nearBounds(b[0],b[1],b[2],b[3]);
  for(const[id,row]of this.sources){if(row.invalid)return fail('Source changed during ZoneManager lifecycle');if(row.offline)continue;const current=this.zm.loaded.get(id)??this.zm.prebuilt.get(id),group=row.group?.deref(),loaded=this.zm.loaded.has(id);if(!group||current?.data.group!==group||(loaded?group.parent!==this.world.scene:group.parent!==null)||!proofCurrent(row.proof)||current.data.colliders.length!==row.colliderCount||current.data.walkables.length!==row.walkableCount)return fail('Shared-rest source changed or detached outside ZoneManager lifecycle');for(const mesh of row.meshes)if(near(mesh.bounds)&&!proofCurrent(mesh.proof))return fail('Current route render source changed');}

  for(const row of this.currentOwners(positions)){if(this.sources.get(row.zone)?.offline||!near(row.bounds))continue;const object=row.object.deref(),collection=row.mode==='live'?this.world.cm[row.kind==='collider'?'colliders':'walkables']:this.zm.prebuilt.get(row.zone)?.data[row.kind==='collider'?'colliders':'walkables'];if(collection&&collection!==row.array.deref()){row.array=new WeakRef(collection);row.index=collection.indexOf(object);}if(!object||collection?.[row.index]!==object||!numericCurrent(object,row.proof))return fail('Current corridor owner was removed, replaced or changed');}
  // Public CollisionManager add/remove/update invalidates its spatial grid.
  // Query only the imminent swept neighborhood, not every world collider.
  if(positions){for(const p of positions){const box=new THREE.Box3(new THREE.Vector3(p[0]-3,p[1]-3,p[2]-3),new THREE.Vector3(p[0]+3,p[1]+4,p[2]+3));for(const object of this.world.cm.queryBox(box)){const row=this.ownerLookup.get(object);if(!row&&this.relevant(object.box))return fail('New current corridor collider');if(row&&!numericCurrent(object,row.proof))return fail('Changed current corridor collider');}}}
  for(const row of this.staticMeshes){if(positions&&!near(row.bounds))continue;const object=row.object.deref();let attached=false;for(let p=object;p;p=p.parent)if(p===this.world.scene)attached=true;if(!attached||!proofCurrent(row.proof))return fail('Verified static route geometry changed or detached');}
  this.status='ready';this.reason=null;return true;
 }
 surfaceHeight(x,z,feet,radius){if(z<59.1)return -Infinity;const y=this.surfaces.height(x,z,feet,radius,zone=>this.sources.get(zone)?.offline===true);if(Number.isNaN(y)){this.status='error';this.reason='Current actual support vertices changed';}return y;}
 renderable(position){const zone=this.zm?.findZone(position[0],position[2]);return this.status==='ready'&&(!zone||this.zm.loaded.get(zone)?.data.group.visible===true);}
 dispose(){this.surfaces?.dispose();this.zm?.lifecycleListeners?.delete(this.listener);this.sources.clear();this.seeds.clear();this.liveCorridorOwners=[];this.staticMeshes=[];this.corridorBaselines.clear();this.ownerCells?.clear();this.ownerGlobals=[];this.ownerLookup=new WeakMap();this.nav?.clear?.();this.nav=null;this.slots=null;}
}
