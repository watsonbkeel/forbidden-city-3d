// QA consuming one supplied world. The analytic separation export is read-only;
// the physical export performs production support queries and updates matrices.
// Neither constructs a scene/System/adapter or steps an animation clock.
import * as THREE from 'three';
import { R56_STAFF_IDS } from './r56-staff-clearance.mjs';
import { isDeepStrictEqual } from 'node:util';
import { CharacterWorldAdapter } from '../../src/scene/characters/CharacterWorldAdapter.js';
import baseline from '../fixtures/r56-r55-provenance.json' with { type: 'json' };

export const R57_STAFF_IDS = Object.freeze(['yangxing-eunuch-01','yangxing-eunuch-02','leshou-maid-01','leshou-eunuch-01','jingfu-eunuch-01','chonghua-maid-01','chonghua-eunuch-01']);
const requiredIds = Object.freeze([...baseline.records.actors.map(a => a.id), ...R56_STAFF_IDS, ...R57_STAFF_IDS]);
const staffIds = new Set(R57_STAFF_IDS), threshold = 1.3;
const vector = p => Array.isArray(p) && p.length === 3 && p.every(v => Number.isFinite(v) && Math.abs(v) <= Number.MAX_SAFE_INTEGER);
const clamp = n => Math.max(0, Math.min(1, n));
const cross = (x, z, X, Z) => x * Z - z * X;

/** Exact continuous 2-D line-segment minimization (ordinary IEEE-754 arithmetic).
 * Intersecting segments have zero clearance. Otherwise a minimum occurs at an
 * endpoint projected onto the other segment. Degenerate segments are points.
 * Inputs are world [x,y,z]; witnesses are horizontal [x,z]. No time/phase/priority.
 */
export function closestHorizontalSegments(a, b, c, d) {
  if (![a, b, c, d].every(vector)) throw new TypeError('Segment endpoints must be finite, safely representable [x,y,z] vectors');
  const ax = b[0] - a[0], az = b[2] - a[2], bx = d[0] - c[0], bz = d[2] - c[2];
  const aa = ax * ax + az * az, bb = bx * bx + bz * bz, denominator = cross(ax, az, bx, bz);
  const witness = (t, u) => {
    const pointA = [a[0] + t * ax, a[2] + t * az], pointB = [c[0] + u * bx, c[2] + u * bz];
    return { distanceMeters: Math.hypot(pointA[0] - pointB[0], pointA[1] - pointB[1]), t, u, pointA, pointB };
  };
  if (denominator !== 0) {
    const dx = c[0] - a[0], dz = c[2] - a[2];
    const t = cross(dx, dz, bx, bz) / denominator, u = cross(dx, dz, ax, az) / denominator;
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) return { ...witness(t, u), distanceMeters: 0 };
  }
  const onA = p => aa ? clamp(((p[0] - a[0]) * ax + (p[2] - a[2]) * az) / aa) : 0;
  const onB = p => bb ? clamp(((p[0] - c[0]) * bx + (p[2] - c[2]) * bz) / bb) : 0;
  return [witness(0, onB(a)), witness(1, onB(b)), witness(onA(c), 0), witness(onA(d), 1)]
    .reduce((best, candidate) => candidate.distanceMeters < best.distanceMeters ? candidate : best);
}

// Mirror getGeneration's format without calling it: getGeneration registers
// previously unseen objects, and getRevision may invalidate caches. This read
// only consults already assigned identities. Unknown/new groups fail closed until
// the caller resolves fresh production bindings; missing loaded zones also fail.
function currentGenerationReadOnly(adapter, zoneRef) {
  const objectId = object => !object || typeof object !== 'object' ? 'none' : adapter.objectIds.get(object);
  const root = zoneRef === 'static' ? adapter.scene : adapter.zoneManager?.loaded?.get(zoneRef)?.data?.group;
  if (!root || typeof root !== 'object') return null;
  const rootId = objectId(root);
  if (rootId === undefined) return null;
  const interiors = [];
  for (const hall of adapter.interiors?.halls?.values?.() ?? []) {
    const groupId = objectId(hall.group);
    if (groupId === undefined) return null;
    interiors.push(`${hall.id}:${hall.state}:${hall.token}:${groupId}`);
  }
  return `${adapter.generation}:${zoneRef}:${rootId}:${interiors.join('|')}`;
}

/**
 * @param {{registry: object, adapter: CharacterWorldAdapter,
 *   resolvedBindings: Array<{actor: object, binding: object, revision?: string}>}} input
 * Pass [...system.manager.states.values()] and system.world, after all108 bindings
 * are ready. Actor identity, adapter registry, cached binding identity, saved
 * revision when supplied, current complete zone/interior generation, path identity/
 * specification, and support references are
 * checked before geometry. Invalid input returns no partial or misleading pass.
 *
 * Each moving role contributes EVERY full validated path segment, even a guard
 * follower whose current phase traverses less. This deliberately conservative
 * envelope cannot hide crossing routes using clocks, LOD, schedule or priority.
 * Seat and surface roles contribute a zero-length segment at binding.position.
 */
export function evaluateR57StaffClearance({ registry, adapter, resolvedBindings } = {}) {
  const errors = [], report = {
    pass: false, status: 'invalid-bindings', method: 'phase-independent analytic horizontal swept centerline',
    minimumSeparationMeters: threshold, staffActorIds: [...R57_STAFF_IDS], actorsChecked: 0,
    pairsChecked: 0, segmentPairsChecked: 0, minimumPair: null, minimumByStaff: {}, violations: [], errors
  };
  if (!(adapter instanceof CharacterWorldAdapter)) errors.push('A real, already-used CharacterWorldAdapter is required');
  if (adapter?.disposed) errors.push('Adapter is disposed');
  if (adapter?.registry !== registry) errors.push('Adapter registry identity differs from supplied registry');
  if (!Array.isArray(registry?.actors) || registry.actors.length !== 108) errors.push('Registry must contain exactly108 actors');
  if (!Array.isArray(resolvedBindings) || resolvedBindings.length !== 108) errors.push('Exactly108 resolved binding entries are required');
  if (errors.length) return report;
  const actors = new Map(), entries = new Map();
  for (const actor of registry.actors) {
    if (!requiredIds.includes(actor?.id)) errors.push(`Unknown registry actor: ${actor?.id}`);
    if (actors.has(actor?.id)) errors.push(`Duplicate registry actor: ${actor?.id}`);
    if (actor?.required !== true) errors.push(`Required actor demoted: ${actor?.id}`);
    actors.set(actor?.id, actor);
  }
  for (const entry of resolvedBindings) {
    const id = entry?.actor?.id;
    if (!actors.has(id)) errors.push(`Unknown binding actor: ${id}`);
    if (entries.has(id)) errors.push(`Duplicate binding actor: ${id}`);
    entries.set(id, entry);
  }
  const curves = new Map(), generations = new Map();
  for (const id of requiredIds) {
    const actor = actors.get(id), entry = entries.get(id), binding = entry?.binding;
    if (!actor || !entry) { errors.push(`Missing actor/binding: ${id}`); continue; }
    if (entry.actor !== actor) errors.push(`Wrong actor identity: ${id}`);
    if (binding?.status !== 'ready') { errors.push(`Binding not ready: ${id} (${binding?.status ?? 'missing'}: ${binding?.reason ?? ''})`); continue; }
    const cached = adapter.cache.get(id);
    if (cached?.result !== binding) errors.push(`Wrong/stale binding identity in adapter cache: ${id}`);
    if (entry.revision !== undefined && (typeof entry.revision !== 'string' || !cached?.key?.startsWith(`${id}:${entry.revision}:`))) errors.push(`Binding revision differs: ${id}`);
    if (!generations.has(actor.zoneRef)) generations.set(actor.zoneRef, currentGenerationReadOnly(adapter, actor.zoneRef));
    const generation = generations.get(actor.zoneRef), epoch = adapter.physicalEpochs.get(id) ?? 0;
    if (generation === null || !cached?.key?.startsWith(`${id}:${generation}:physical=${epoch}:`)) errors.push(`Stale or unresolved current zone/interior generation: ${id}`);
    if (!vector(binding.position) || !Number.isFinite(binding.rotationYRad)) errors.push(`Invalid resolved transform: ${id}`);
    if (binding.zoneRef !== actor.zoneRef) errors.push(`Wrong binding zone: ${id}`);
    const placement = actor.placement;
    if (placement?.mode === 'path') {
      const declared = registry.paths?.find(p => p.id === placement.pathRef), path = binding.path;
      if (!declared || adapter.maps.paths.get(placement.pathRef) !== declared || path?.id !== placement.pathRef || path?.status !== 'ready' || adapter.pathCache.get(placement.pathRef)?.result !== path) {
        errors.push(`Wrong/unready path identity: ${id}`); continue;
      }
      if (Object.entries(declared).some(([key, value]) => !isDeepStrictEqual(path[key], value))) errors.push(`Path specification differs: ${id}`);
      if (!Array.isArray(path.points) || path.points.length < 2 || path.points.length !== declared.pointsLocalMeters?.length || !path.points.every(vector) || !isDeepStrictEqual(path.pointsMeters, path.points)) {
        errors.push(`Invalid/inconsistent resolved path points: ${id}`); continue;
      }
      if (binding.support?.kind !== 'validated-path' || binding.support?.surfaceRef !== placement.surfaceRef || path.surfaceRef !== placement.surfaceRef || path.zoneRef !== actor.zoneRef) errors.push(`Wrong path support identity: ${id}`);
      if (!isDeepStrictEqual(binding.position, path.points[0])) errors.push(`Binding does not start at its resolved path: ${id}`);
      if (generation === null || path.validationGeneration !== generation) errors.push(`Stale path generation: ${id}`);
      curves.set(id, path.points.slice(1).map((to, i) => [path.points[i], to]));
    } else if (placement?.mode === 'surface' || placement?.mode === 'seat') {
      const supportKey = placement.mode === 'seat' ? 'seatRef' : 'surfaceRef';
      if (binding.path !== undefined || binding.support?.[supportKey] !== placement[supportKey]) errors.push(`Wrong stationary support identity: ${id}`);
      if (placement.mode === 'surface' && (binding.support?.status !== 'ready' || !vector(binding.support.position) || !isDeepStrictEqual(binding.position, binding.support.position))) errors.push(`Invalid/not-ready surface support or detached center: ${id}`);
      if (placement.mode === 'seat' && binding.support?.kind !== 'seat') errors.push(`Wrong seat support identity: ${id}`);
      curves.set(id, [[binding.position, binding.position]]);
    } else errors.push(`Unsupported placement mode: ${id}`);
  }
  if (errors.length) return report;
  report.actorsChecked = requiredIds.length;
  for (let i = 0; i < requiredIds.length; i++) for (let j = i + 1; j < requiredIds.length; j++) {
    const a = requiredIds[i], b = requiredIds[j];
    if (!staffIds.has(a) && !staffIds.has(b)) continue;
    let nearest = null;
    const A = curves.get(a), B = curves.get(b);
    for (let ai = 0; ai < A.length; ai++) for (let bi = 0; bi < B.length; bi++) {
      const result = closestHorizontalSegments(...A[ai], ...B[bi]); report.segmentPairsChecked++;
      if (!nearest || result.distanceMeters < nearest.distanceMeters) nearest = {
        actorIds: [a, b], pathRefs: [actors.get(a).placement.pathRef ?? null, actors.get(b).placement.pathRef ?? null],
        segmentIndices: [ai, bi], distanceMeters: result.distanceMeters,
        closestPointsXZ: [result.pointA, result.pointB], segmentParameters: [result.t, result.u]
      };
    }
    report.pairsChecked++;
    if (!report.minimumPair || nearest.distanceMeters < report.minimumPair.distanceMeters) report.minimumPair = nearest;
    for (const id of [a, b]) if (staffIds.has(id) && (!report.minimumByStaff[id] || nearest.distanceMeters < report.minimumByStaff[id].distanceMeters)) report.minimumByStaff[id] = nearest;
    if (nearest.distanceMeters < threshold) report.violations.push(nearest);
  }
  report.pass = report.violations.length === 0;
  report.status = report.pass ? 'clear' : 'insufficient-clearance';
  return report;
}

// Reviewed source-only plan coordinates, not a synthetic support implementation.
// No floor, world, adapter, CharacterSystem or renderer is constructed here.
export const R57_SITES = Object.freeze([
 {key:'yangxing',building:'养性殿',zoneRef:'ningshou',origin:[-293.8,0,386.3],bounds:[-14,14,-23,-16],observer:[-293.8,1.7,361.3],includes:['养性门','衍祺门','养性殿','畅音阁','阅是楼','古华轩','禊赏亭'],actors:[{id:'yangxing-eunuch-01',local:[[-12,0,-20]]},{id:'yangxing-eunuch-02',local:[[12,0,-21],[12,0,-17.5]]}]},
 {key:'leshou',building:'乐寿堂',zoneRef:'ningshou',origin:[-293.4,0,435.3],bounds:[-14,14,-24,-17],observer:[-293.4,1.7,405],includes:['养性殿','乐寿堂','寻沿书屋','遂初堂','庆寿堂','延趣楼'],actors:[{id:'leshou-maid-01',local:[[-12,0,-21]]},{id:'leshou-eunuch-01',local:[[12,0,-22],[12,0,-18.5]]}]},
 {key:'jingfu',building:'景福宫',zoneRef:'ningshou',origin:[-338.5,0,492.2],bounds:[-7,-3,-24,-20],observer:[-338.5,1.7,462],includes:['景福宫','颐和轩','景祺阁','庆寿堂','梵华楼','佛日楼'],actors:[{id:'jingfu-eunuch-01',local:[[-5,0,-22]]}]},
 {key:'chonghua',building:'重华宫',zoneRef:'west-six',origin:[118.9,0,498.3],bounds:[-12,12,-23,-16],observer:[118.9,1.7,469],includes:['重华门','重华宫'],actors:[{id:'chonghua-maid-01',local:[[-10,0,-20]]},{id:'chonghua-eunuch-01',local:[[10,0,-21],[10,0,-17.5]]}]},
]);
const siteFor = id => R57_SITES.find(s=>s.actors.some(a=>a.id===id));
const worldPoints = (site,id) => site.actors.find(a=>a.id===id).local.map(p=>p.map((v,i)=>v+site.origin[i]));
const approxPoints = (a,b) => Array.isArray(a)&&a.length===b.length&&a.every((p,i)=>vector(p)&&p.every((v,j)=>Math.abs(v-b[i][j])<1e-7));
const visible = mesh => {for(let p=mesh;p;p=p.parent)if(!p.visible||p.userData?.characterLayer||p.userData?.isCharacter||p.userData?.characterBatch)return false;return true;};

/** Continuous conservative body envelope against ACTUAL visible triangles.
 * Box3 SAT is the narrow phase, not an authored or mesh-bound collision result.
 * The box encloses the whole radius-1m vertical capsule sweep from a to b.
 * All approved routes are axis aligned. No spacing gap can hide a thin wall.
 * Geometry is checked two-sided, conservatively including back faces. */
export function visibleTriangleSweep(scene,a,b,{radius=1,height=2.4,bottom=.03}={}) {
 if(!scene?.isScene||![a,b].every(vector)||![radius,height,bottom].every(Number.isFinite)||radius<=0||bottom<0||height<=bottom)throw new TypeError('Actual scene, finite endpoints and positive body dimensions required');
 scene.updateMatrixWorld(true);
 const box=new THREE.Box3(new THREE.Vector3(Math.min(a[0],b[0])-radius,Math.min(a[1],b[1])+bottom,Math.min(a[2],b[2])-radius),new THREE.Vector3(Math.max(a[0],b[0])+radius,Math.max(a[1],b[1])+height,Math.max(a[2],b[2])+radius));
 const triangle=new THREE.Triangle(),normal=new THREE.Vector3(),hitPoint=new THREE.Vector3(),up=new THREE.Vector3(0,1,0),hits=[];let meshes=0,triangles=0;
 function inspectInstance(mesh,matrix,instanceIndex){
  const g=mesh.geometry,p=g.attributes.position,meshBox=g.boundingBox.clone().applyMatrix4(matrix);
  if(!meshBox.intersectsBox(box))return;
  meshes++;
  const probes=[a,b].map(p=>new THREE.Vector3(p[0],p[1]+height/2,p[2])).filter(p=>meshBox.containsPoint(p)).map(origin=>({ray:new THREE.Ray(origin,up),distance:Infinity,exit:false,triangle:null}));
  const index=g.index,groups=Array.isArray(mesh.material)?g.groups:[{start:0,count:index?.count??p.count,materialIndex:null}];
  for(const group of groups){const material=group.materialIndex===null?mesh.material:mesh.material[group.materialIndex];if(!material||material.visible===false)continue;
   const start=Math.max(group.start,g.drawRange.start),end=Math.min(index?.count??p.count,group.start+group.count,g.drawRange.start+g.drawRange.count);
   for(let k=start;k+2<end;k+=3){for(const [j,v]of[triangle.a,triangle.b,triangle.c].entries())mesh.getVertexPosition(index?index.getX(k+j):k+j,v).applyMatrix4(matrix);triangles++;
    if(box.intersectsTriangle(triangle)){hits.push({kind:'triangle-intersection',meshName:mesh.name,instanceIndex,material:material.name,triangle:k/3,vertices:[triangle.a.toArray(),triangle.b.toArray(),triangle.c.toArray()]});return;}
    // Boundary-free body boxes can nevertheless be wholly inside a closed solid.
    // A nearest upward crossing facing +Y is an exit, so the origin is occupied.
    // This deliberately errs toward rejection for nonclosed upward-facing sheets.
    for(const probe of probes)if(probe.ray.intersectTriangle(triangle.a,triangle.b,triangle.c,false,hitPoint)){const distance=hitPoint.y-probe.ray.origin.y;if(distance>1e-7&&distance<probe.distance){triangle.getNormal(normal);probe.distance=distance;probe.exit=normal.y>1e-7;probe.triangle=k/3;probe.material=material.name;}}
   }
  }
  for(const probe of probes)if(probe.exit)hits.push({kind:'inside-visible-solid',meshName:mesh.name,instanceIndex,material:probe.material,triangle:probe.triangle,origin:probe.ray.origin.toArray(),exitDistanceMeters:probe.distance});
 }
 scene.traverse(mesh=>{
  if(!mesh.isMesh||!visible(mesh)||mesh.name?.startsWith('COL_')||mesh.name?.startsWith('WALK_'))return;
  const g=mesh.geometry;if(!g?.attributes?.position)return;
  if(!g.boundingBox)g.computeBoundingBox();
  if(mesh.isInstancedMesh){const instance=new THREE.Matrix4(),matrix=new THREE.Matrix4();for(let i=0;i<mesh.count;i++){mesh.getMatrixAt(i,instance);matrix.multiplyMatrices(mesh.matrixWorld,instance);inspectInstance(mesh,matrix,i);}}
  else inspectInstance(mesh,mesh.matrixWorld,null);
 });
 return{pass:hits.length===0,method:'continuous enclosing-prism versus actual visible triangles (SAT) plus upward-exit containment, not mesh AABBs',radiusMeters:radius,heightMeters:height,bottomMeters:bottom,meshesNarrowTested:meshes,trianglesTested:triangles,hits};
}

/** Consumes an existing final W/system or an explicitly bounded real fragment.
 * Calls the existing adapter for current support but never constructs a world.
 * The returned success is only for actorIds in THIS scene; no browser/full-world
 * /historical/complete lifecycle acceptance is implied. */
export function evaluateR57PhysicalClearance(W,{system,adapter=system?.world,registry=adapter?.registry,resolvedBindings=system?[...system.manager.states.values()]:null,actorIds=R57_STAFF_IDS}={}) {
 const report={pass:false,status:'invalid-bindings',boundary:'Actual supplied-scene support/colliders/visible triangles only; not browser, full-world, all-actor, streaming or animation acceptance',actorIds:[...actorIds],actors:[],errors:[]};
 if(!(adapter instanceof CharacterWorldAdapter)||adapter.disposed||adapter.scene!==W?.scene||adapter.cm!==W?.cm||adapter.registry!==registry||adapter.zoneManager!==W?.zoneManager){report.errors.push('Existing live matching world/adapter/registry required');return report;}
 if(!Array.isArray(resolvedBindings)||!actorIds.length||new Set(actorIds).size!==actorIds.length||actorIds.some(id=>!R57_STAFF_IDS.includes(id))){report.errors.push('Known nonempty unique R57 actors and real resolved entries required');return report;}
 for(const id of actorIds){
  const actor=registry.actors.find(a=>a.id===id),entry=resolvedBindings.find(s=>s.actor?.id===id),binding=entry?.binding,site=siteFor(id);
  if(!actor||entry?.actor!==actor||actor.required!==true||binding?.status!=='ready'){report.errors.push('Missing actual required ready actor: '+id);continue;}
  // This invokes production physical dependency invalidation, not a copied flag.
  const revision=adapter.getRevision(actor),cached=adapter.cache.get(id),generation=currentGenerationReadOnly(adapter,actor.zoneRef);
  if(cached?.result!==binding||!cached?.key?.startsWith(`${id}:${revision}:`)||generation===null||entry.revision!==undefined&&entry.revision!==revision){report.errors.push('Wrong/stale support generation or identity: '+id);continue;}
  const expected=worldPoints(site,id),points=binding.path?.points??[binding.position],surface=adapter.maps.surfaces.get(actor.placement.surfaceRef),anchor=adapter.maps.anchors.get(surface?.anchorRef);
  if(!approxPoints(points,expected)||actor.zoneRef!==site.zoneRef||binding.zoneRef!==site.zoneRef||!isDeepStrictEqual(surface?.localBoundsMeters,site.bounds)||surface?.kind!=='ground'||surface?.expectedHeightMeters!==0||anchor?.building!==site.building||anchor?.resolver!=='zone-item'){report.errors.push('Placement/surface differs from approved R57 source plan: '+id);continue;}
  if(binding.path&&(binding.path.validationGeneration!==generation||adapter.pathCache.get(actor.placement.pathRef)?.result!==binding.path)){report.errors.push('Wrong/stale route support generation: '+id);continue;}
  const row={id,revision,position:binding.position,pathRef:actor.placement.pathRef??null,supportSamples:[],sweeps:[],pass:true};
  const samples=[];if(points.length===1)samples.push(points[0]);else for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],n=Math.ceil(Math.hypot(...a.map((v,j)=>b[j]-v))/.25);for(let j=i===1?0:1;j<=n;j++)samples.push(a.map((v,k)=>v+(b[k]-v)*j/n));}
  for(const point of samples){const support=adapter._surfaceAt(actor.placement.surfaceRef,point,1),ring=[];
   for(let i=0;i<17;i++){const r=i?1:0,angle=(i-1)*Math.PI/8,p=[point[0]+r*Math.cos(angle),point[1],point[2]+r*Math.sin(angle)],hit=adapter.supportAt(p,0,.001,{zoneRef:actor.zoneRef,renderedOnly:true});ring.push({position:p,status:hit.status,kind:hit.kind,material:hit.materialName,meshId:hit.meshId,heightMeters:hit.heightMeters});if(hit.status!=='ready'||hit.kind!=='rendered-geometry'||hit.materialName!=='ground_brick'||Math.abs(hit.heightMeters)> .001)row.pass=false;}
   if(support.status!=='ready')row.pass=false;row.supportSamples.push({position:point,surfaceStatus:support.status,ring});
  }
  const segments=points.length===1?[[points[0],points[0]]]:points.slice(1).map((p,i)=>[points[i],p]);
  for(const [a,b]of segments){const collider=adapter._blockedSegment(a,b,1,2.4),triangles=visibleTriangleSweep(W.scene,a,b);if(collider||!triangles.pass)row.pass=false;row.sweeps.push({from:a,to:b,collider,triangles});}
  report.actors.push(row);
 }
 report.pass=report.errors.length===0&&report.actors.length===actorIds.length&&report.actors.every(a=>a.pass);report.status=report.errors.length?'invalid-bindings':report.pass?'clear':'blocked-or-unsupported';
 return report;
}
