import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import * as THREE from 'three';
import { CourtKit } from '../../src/scene/palace/kit.js';
import { ZoneBase } from '../../src/scene/zones/ZoneBase.js';
const url=new URL('../../src/scene/palace/special/QinanProfile.js',import.meta.url);
const api=existsSync(url)?await import(url):{};
const ctx=new Proxy({},{get:()=>()=>({data:[]}),set:()=>true});
globalThis.document??={createElement:()=>({getContext:()=>ctx,width:0,height:0}),createElementNS:()=>({addEventListener(){},removeEventListener(){}})};
const garden=JSON.parse(readFileSync(new URL('../../data/zones/garden.json',import.meta.url)));
const item=garden.items.find(i=>i.name==='钦安殿'&&i.kind==='hall');
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-5,`${a} != ${b}`);
export function library(){const materials=new Map();return {materials,material:n=>materials.get(n)??(materials.set(n,new THREE.MeshStandardMaterial({name:n})),materials.get(n)),tileSize:()=>1,aspect:()=>1};}
function geometry(change={},source){assert.equal(typeof api.qinanGeometry,'function','Qinan has a dedicated evidence-bounded profile');return api.qinanGeometry({...item,...change},source);}
const nodes=(root,role)=>{const out=[];root.traverse(o=>{if(o.userData.role===role)out.push(o);});return out;};
function fixture(){const lib=library(),kit=new CourtKit(lib),g=geometry(),built=kit.hall({...item,plaque:false});kit.root.updateMatrixWorld(true);return {lib,kit,g,built,root:built.f};}
test('Qinan dispatch is dedicated, unequal five-bay, no generic roof, throne or north-through flags',()=>{
 assert.equal(item.structure,'qinan-hall');assert.equal(item.qinanProfile,'qinan');
 for(const key of ['w','d','ph','pad','colH','roof','layers','bays','throne','backDoor','enter'])assert.equal(item[key],undefined,key);
 const g=geometry();assert.deepEqual(g.mainBody.columnFootGrid.baysX,[4.03,4.15,4.71,4.15,4.03]);assert.deepEqual(g.mainBody.columnFootGrid.baysZ,[1.65,7.34,1.65]);
 near(g.mainBody.columnFootGrid.width,21.07);near(g.mainBody.columnFootGrid.depth,10.64);assert.equal(g.mainBody.perimeterColumns.length,16);
 near(g.upperColumnHeadGrid.width,17.6325);near(g.roofBoard.width,14.3);near(g.roofBoard.depth,4.1);assert.notEqual(g.upperColumnHeadGrid.width,g.roofBoard.width);
 assert.equal(g.mainBody.interiorGoldenColumns.status,'AXIS_MAPPING_UNRESOLVED_OMITTED');assert.equal(g.mainBody.interiorGoldenColumns.expectedCount,4);
 assert.equal(g.navigation.mode,'exterior-view');assert.equal(g.navigation.terraceRouteAccepted,false);assert.equal(g.navigation.interiorRouteAccepted,false);assert.equal(g.portals.length,0);
});
test('profile provenance keeps column-base datum separate from floor and source periods',()=>{
 const g=geometry();near(g.datum.floorY,1.5);near(g.datum.columnBaseTopY,1.62);near(g.levels.eaveColumnTop,1.62+4.29);near(g.levels.boardTop,1.62+10.596);
 assert.equal(api.QINAN_PROFILE.mainBody.columnFootGrid.status,'DIRECT_MEASURED');assert.equal(api.QINAN_PROFILE.roofBoard.status,'SOURCE_DERIVED');assert.equal(api.QINAN_PROFILE.roofSkinApproximation.status,'PROVISIONAL');
 assert.equal(api.QINAN_PROFILE.southAnnex.plan.status,'SOURCE_DERIVED');assert.equal(api.QINAN_PROFILE.southAnnex.heights.status,'PROVISIONAL');assert.equal(api.QINAN_PROFILE.currentConditionAccepted,false);
 assert.ok(Object.isFrozen(api.QINAN_PROFILE.mainBody.columnFootGrid.baysX));assert.match(api.QINAN_PROFILE.sources.S2.period,/1943/);
});
test('bad transform, missing annex and generic overrides fail before any geometry registration',()=>{
 for(const change of [{structure:'generic'},{qinanProfile:'x'},{x:1},{z:NaN},{rot:'bad'},{rot:Math.PI/2},{w:24.1},{throne:true},{enter:true},{backDoor:true}]){
  const kit=new CourtKit(library());assert.throws(()=>kit.hall({...item,...change}),/Qinan|qinan|profile|Unsupported/);assert.equal(kit.root.children.length,0);
 }
 const missing=structuredClone(api.QINAN_PROFILE);delete missing.southAnnex;assert.throws(()=>geometry({},missing),/annex|profile/i);
 const malformed=structuredClone(api.QINAN_PROFILE);malformed.roofBoard.width=Infinity;assert.throws(()=>geometry({},malformed),/finite|profile|dimension/i);
});
test('actual assembly owns the low annex, closed north wall and no generic room or furniture',()=>{
 const f=fixture();assert.equal(nodes(f.root,'qinan-main-column').length,16);assert.equal(nodes(f.root,'qinan-annex-column').length,6);assert.equal(nodes(f.root,'qinan-north-wall').length,1);
 assert.equal(nodes(f.root,'qinan-annex-front-panel').length,5);assert.equal(f.kit.rooms.length,0);assert.equal(f.root.userData.structure.id,'garden/qinan');assert.equal(f.root.userData.structure.eaveCount,2);
 assert.equal(f.kit.walkables.every(s=>s.rescue===false&&s.supportId.startsWith('qinan-')),true);
 const zone=new ZoneBase(library(),{id:'garden',items:[item]});const data=zone.build();assert.equal(data.group.userData.architecture[0].profileId,api.QINAN_PROFILE.profileId);assert.equal(data.rooms.length,0);zone.dispose();
});

test('explicit role accounting stays within the old full hall and does not count alternative LOD twice',()=>{
 const {root}=fixture(),r=root.userData.structure.roleBudget;
 assert.ok(r.triangleInstances<=3382,`local full hall ${r.triangleInstances} > old3382`);
 near(Object.values(r.roles).reduce((n,r)=>n+r.triangleInstances,0),r.triangleInstances);assert.equal(r.oldAlternativeSilhouetteTriangles,800);assert.match(r.comparison,/alternative/);
});
test('roof has a separate wooden board, truncated top tile cover and visible non-floating bracket aprons',()=>{
 const {g,root}=fixture();assert.equal(nodes(root,'qinan-wood-roof-board').length,1);assert.equal(nodes(root,'qinan-flat-roof-cover').length,1);
 const board=nodes(root,'qinan-wood-roof-board')[0];board.geometry.computeBoundingBox();near(board.position.y+board.geometry.boundingBox.min.y,g.levels.boardUnderside);near(board.position.y+board.geometry.boundingBox.max.y,g.levels.boardTop);
 assert.equal(nodes(root,'qinan-perimeter-ridge').length,4);assert.equal(nodes(root,'qinan-finial').length,1);assert.equal(nodes(root,'qinan-bracket-apron').length,8);
 for(const role of ['qinan-lower-roof-tile','qinan-upper-roof-tile','qinan-annex-roof-tile','qinan-flat-roof-cover'])for(const m of nodes(root,role)){assert.equal(m.material.name,'roof_tile');assert.equal(m.userData.walkable,false);assert.ok(m.castShadow);}
});

test('all physical stair and deck supports match visible surfaces, retain IDs and cannot rescue from ground',async()=>{
 const { CollisionManager }=await import('../../src/utils/Collision.js');const {g,root,kit}=fixture();const cm=new CollisionManager();cm.rivers=[];cm.addColliders(kit.colliders);cm.addWalkables(kit.walkables);
 assert.equal(new Set(g.supports.map(s=>s.supportId)).size,g.supports.length);assert.equal(g.supports.length,22);assert.equal(g.supports.some(s=>/roof|north-ramp|south-ramp/.test(s.supportId)),false);
 for(const s of [...g.slabs,...g.steps]){const x=(s.minX+s.maxX)/2,z=(s.minZ+s.maxZ)/2,[wx,wz]=g.toWorld(x,z);const hits=new THREE.Raycaster(new THREE.Vector3(wx,20,wz),new THREE.Vector3(0,-1,0)).intersectObject(root,true).filter(h=>h.object.userData.supportId===s.supportId);
  assert.ok(hits.length,s.supportId);near(Math.max(...hits.map(h=>h.point.y)),s.topY);near(cm.getGroundHeight(wx,wz,s.topY),s.topY);
  const w=kit.walkables.find(w=>w.supportId===s.supportId);assert.equal(w.rescue,false);near(w.box.min.x,g.x+s.minX);near(w.box.max.z,g.z+s.maxZ);
 }
 near(cm.getGroundHeight(g.x,g.z,0),0);near(cm.getGroundHeight(g.x,g.z,g.datum.floorY),g.datum.floorY);
 assert.ok(cm.checkCollision(new THREE.Vector3(0,g.datum.floorY+1.7,g.z+g.mainBody.columnFootGrid.zs.at(-1)),.5),'visible continuous north wall blocks old through-exit');
 assert.ok(cm.checkCollision(new THREE.Vector3(0,g.datum.floorY+1.7,g.z+g.southAnnex.frontZ),.5),'visible preview panels own their obstruction');
});
test('finite geometry, bounds and alternative silhouette contain both real roof volumes',async()=>{
 const {buildSilhouette}=await import('../../src/render/SilhouetteBuilder.js');const {g,root,kit}=fixture();
 root.traverse(o=>{if(!o.isMesh)return;for(const a of Object.values(o.geometry.attributes))assert.ok([...a.array].every(Number.isFinite),o.name);assert.ok(o.userData.role);});
 const bounds=new THREE.Box3().setFromObject(root);assert.ok([...bounds.min.toArray(),...bounds.max.toArray()].every(Number.isFinite));assert.ok(bounds.min.z<g.z+g.southAnnex.frontZ);assert.ok(bounds.max.y>g.levels.boardTop);
 const tileTriangles=Object.entries(root.userData.structure.roleBudget.roles).filter(([role])=>/roof-tile|flat-roof-cover/.test(role)).reduce((n,[,r])=>n+r.triangleInstances,0);
 const merged=kit.finish(),sil=buildSilhouette(merged);assert.ok(sil);near((sil.geometry.index?.count??sil.geometry.attributes.position.count)/3,tileTriangles);
 const ray=(x,z)=>new THREE.Raycaster(new THREE.Vector3(x,30,z),new THREE.Vector3(0,-1,0)).intersectObject(sil,true);sil.material.side=THREE.DoubleSide;sil.updateMatrixWorld(true);
 assert.ok(ray(0,g.z-10).length,'low annex tile remains in alternative silhouette');assert.ok(ray(0,g.z).length,'actual truncated top cover remains');assert.ok(ray(0,g.z+5).length,'main upper roof remains');
 sil.geometry.dispose();sil.material.dispose();kit.dispose(merged);
});
test('source geometries, merged geometries and owned materials dispose once; library resources remain shared',()=>{
 const {lib,kit,root}=fixture(),counts=new Map(),watch=r=>{counts.set(r,0);r.addEventListener('dispose',()=>counts.set(r,counts.get(r)+1));};
 const sources=new Set();root.traverse(o=>{if(o.geometry)sources.add(o.geometry);});sources.forEach(watch);const libraryCounts=new Map();for(const m of lib.materials.values()){libraryCounts.set(m,0);m.addEventListener('dispose',()=>libraryCounts.set(m,libraryCounts.get(m)+1));}
 const merged=kit.finish();assert.ok([...sources].every(r=>counts.get(r)===1));const mergedResources=[];merged.traverse(o=>{if(o.geometry)mergedResources.push(o.geometry);});mergedResources.push(...kit.owned,...(kit.ownedTextures??[]));mergedResources.forEach(watch);kit.dispose(merged);
 assert.ok(mergedResources.every(r=>counts.get(r)===1));assert.ok([...libraryCounts.values()].every(n=>n===0));assert.equal(kit.colliders.length,0);assert.equal(kit.walkables.length,0);
});
test('actual ZoneManager three-cycle lifecycle preserves deterministic metadata and zone ownership',async()=>{
 globalThis.window??={location:{search:''}};const {ZoneManager}=await import('../../src/scene/zones/ZoneManager.js');const {CollisionManager}=await import('../../src/utils/Collision.js');
 const lib=library(),scene=new THREE.Scene(),cm=new CollisionManager(),manager=new ZoneManager(),staticBox=new THREE.Box3(new THREE.Vector3(30,0,470),new THREE.Vector3(31,2,471));cm.rivers=[];cm.addCollider(staticBox,'static-garden-fixture');
 manager.register({id:'garden',name:'Qinan lifecycle fixture',bounds:{x0:-40,x1:40,z0:450,z1:520},neighbors:[],items:[item]});manager.init(scene,lib,cm,{x:18,z:477});
 const first=structuredClone(manager.loaded.get('garden').data.group.userData.architecture),map=structuredClone(manager.getMapItems());let colliderCount,supportCount;
 for(let cycle=0;cycle<3;cycle++){
  const loaded=manager.loaded.get('garden');assert.deepEqual(loaded.data.group.userData.architecture,first);assert.deepEqual(loaded.data.mapItems,map);assert.equal(loaded.data.rooms.length,0);
  colliderCount??=cm.colliders.filter(c=>c.tag==='garden').length;supportCount??=cm.walkables.filter(s=>s.tag==='garden').length;assert.equal(cm.colliders.filter(c=>c.tag==='garden').length,colliderCount);assert.equal(cm.walkables.filter(s=>s.tag==='garden').length,supportCount);assert.equal(manager.silhouettes.get('garden').visible,false);
  const counts=new Map(),resources=new Set([...loaded.builder.kit.owned,...(loaded.builder.kit.ownedTextures??[])]);loaded.data.group.traverse(o=>{if(o.geometry)resources.add(o.geometry);});for(const r of resources){counts.set(r,0);r.addEventListener('dispose',()=>counts.set(r,counts.get(r)+1));}
  manager.unloadZone('garden');assert.equal(cm.colliders.filter(c=>c.tag==='garden').length,0);assert.equal(cm.walkables.filter(s=>s.tag==='garden').length,0);assert.equal(cm.colliders.filter(c=>c.tag==='static-garden-fixture').length,1);assert.equal(manager.silhouettes.get('garden').visible,true);assert.ok([...counts.values()].every(n=>n===1));if(cycle<2)manager.loadZone('garden');
 }
 manager.dispose();
});

test('profileHash is a deterministic SHA256 content digest independent of revision and detects stale parameters',async()=>{
 const {createHash}=await import('node:crypto');const data=structuredClone(api.QINAN_PROFILE);delete data.profileHash;
 const canonical=v=>v&&typeof v==='object'?(Array.isArray(v)?v.map(canonical):Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])]))):v;
 const digest=v=>createHash('sha256').update(JSON.stringify(canonical(v))).digest('hex');
 assert.match(api.QINAN_PROFILE.profileHash,/^[a-f0-9]{64}$/);assert.equal(digest(data),api.QINAN_PROFILE.profileHash);
 data.southAnnex.heights.frontColumnTopRelativeY+=.01;assert.notEqual(digest(data),api.QINAN_PROFILE.profileHash);
});

test('annex roof interfaces and crowned cover meet exactly with no zero-area roof triangles',async()=>{
 const roof=await import('../../src/scene/palace/special/QinanRoof.js');assert.equal(typeof roof.qinanRoofSurfaces,'function');const {g,root}=fixture(),s=roof.qinanRoofSurfaces(g);
 for(const sign of [-1,1])for(let i=0;i<=20;i++){const t=i/20,a=s.annexFront(sign===1?1:0,t),b=s.annexSide(sign,t,1);a.forEach((n,k)=>near(n,b[k]));a.forEach((n,k)=>near(n-(k===1?g.roofSkinApproximation.tileThickness:0),b[k]-(k===1?g.roofSkinApproximation.tileThickness:0)));}
 for(let i=0;i<=20;i++){const t=i/20;for(const p of [s.flatCover(0,t),s.flatCover(1,t),s.flatCover(t,0),s.flatCover(t,1)])near(p[1],g.roofBoard.topY+g.roofSkinApproximation.tileThickness);}
 for(const role of ['qinan-lower-roof-tile','qinan-upper-roof-tile','qinan-annex-roof-tile','qinan-flat-roof-cover','qinan-finial'])for(const m of nodes(root,role)){
  const geo=m.geometry,index=geo.index?.array,pos=geo.attributes.position;for(let i=0;i<(index?.length??pos.count);i+=3){const v=[0,1,2].map(k=>new THREE.Vector3().fromBufferAttribute(pos,index?index[i+k]:i+k));const area=new THREE.Vector3().subVectors(v[1],v[0]).cross(new THREE.Vector3().subVectors(v[2],v[0])).length()/2;assert.ok(Number.isFinite(area)&&area>1e-9,`${role} triangle${i/3} area${area}`);}
 }
});
test('bracket apron triangles face outward and actually bridge the column-head-to-roof interval',()=>{
 const {g,root}=fixture();for(const [width,depth,y] of [[g.mainBody.columnFootGrid.width,g.mainBody.columnFootGrid.depth,g.levels.eaveColumnTop+.5],[g.upperColumnHeadGrid.width,g.upperColumnHeadGrid.depth,g.levels.upperEavePurlinBottom+.3]]){
  for(const [x,z,dx,dz] of [[0,-depth/2-1,0,1],[0,depth/2+1,0,-1],[-width/2-1,0,1,0],[width/2+1,0,-1,0]]){
   const hits=new THREE.Raycaster(new THREE.Vector3(g.x+x,y,g.z+z),new THREE.Vector3(dx,0,dz),0,1.1).intersectObject(root,true).filter(h=>h.object.userData.role==='qinan-bracket-apron');assert.ok(hits.length,`outward apron ray ${x},${z},${y}`);
  }
 }
});

test('annex front and side enclosure stays visibly closed all the way to the actual roof underside',()=>{
 const {g,root}=fixture(),n=g.southAnnex;
 for(const side of [-1,1])for(const t of [.05,.25,.5,.75,.95]){
  const x=side*n.width/2,z=n.frontZ+(n.rearZ-n.frontZ)*t;
  const hits=new THREE.Raycaster(new THREE.Vector3(g.x+x,0,g.z+z),new THREE.Vector3(0,1,0)).intersectObject(root,true).filter(h=>h.object.userData.role==='qinan-annex-roof-tile');assert.ok(hits.length);const under=Math.min(...hits.map(h=>h.point.y));
  for(const f of [.05,.5,.95]){const y=n.columnTopY+(under-n.columnTopY)*f;const closure=new THREE.Raycaster(new THREE.Vector3(g.x+x+side*.5,y,g.z+z),new THREE.Vector3(-side,0,0),0,.51).intersectObject(root,true).filter(h=>h.object.userData.role==='qinan-annex-enclosure-apron');assert.ok(closure.length,`side${side} t${t} height${y}`);}
 }
 for(const x of [-8,-4,0,4,8]){const z=n.frontZ;const hits=new THREE.Raycaster(new THREE.Vector3(x,0,g.z+z),new THREE.Vector3(0,1,0)).intersectObject(root,true).filter(h=>h.object.userData.role==='qinan-annex-roof-tile');const under=Math.min(...hits.map(h=>h.point.y));const y=(n.columnTopY+under)/2;assert.ok(new THREE.Raycaster(new THREE.Vector3(x,y,g.z+z-.5),new THREE.Vector3(0,0,1),0,.51).intersectObject(root,true).some(h=>h.object.userData.role==='qinan-annex-enclosure-apron'));}
});
test('all actual apron triangle normals point outward; coincident railing corner posts are not duplicated',()=>{
 const {root}=fixture();for(const role of ['qinan-bracket-apron','qinan-annex-enclosure-apron'])for(const mesh of nodes(root,role)){const p=mesh.geometry.attributes.position,out=new THREE.Vector3(...mesh.userData.outward);for(let i=0;i<p.count;i+=3){const [a,b,c]=[0,1,2].map(k=>new THREE.Vector3().fromBufferAttribute(p,i+k));assert.ok(b.sub(a).cross(c.sub(a)).dot(out)>1e-9);}}
 const posts=nodes(root,'qinan-railing-post');assert.equal(new Set(posts.map(m=>`${m.position.x.toFixed(6)},${m.position.z.toFixed(6)}`)).size,posts.length);
});

test('invalid dependent dimensions and degenerate sampling fail in the pure adapter before building',()=>{
 const cases=[p=>p.roofSkinApproximation.slopeSubdivisions=0,p=>p.roofSkinApproximation.edgeSubdivisions=1,p=>p.southAnnex.plan.projection=-1,p=>p.southAnnex.heights.rearRoofRelativeY=1,p=>p.terraceGuide.sideStairWidth=0,p=>p.supportApproximation.stairStepCount=0,p=>p.mainBody.perimeterColumnNodes[1]=[0,0],p=>p.roofBoard.width=100];
 for(const edit of cases){const data=structuredClone(api.QINAN_PROFILE);edit(data);assert.throws(()=>geometry({},data),/Qinan|qinan|profile|positive|dimension|sampling|grid/i);}
});

test('exposed rear ends of annex side hips have real tile-thickness caps',async()=>{
 const {qinanRoofSurfaces}=await import('../../src/scene/palace/special/QinanRoof.js');const {g,root}=fixture(),s=qinanRoofSurfaces(g);
 for(const sign of [-1,1]){const p=s.annexSide(sign,1,.25);const hits=new THREE.Raycaster(new THREE.Vector3(p[0],p[1]-g.roofSkinApproximation.tileThickness/2,g.z+p[2]+.3),new THREE.Vector3(0,0,-1),0,.31).intersectObject(root,true).filter(h=>h.object.userData.role==='qinan-annex-roof-tile');assert.ok(hits.length);}
});

test('an explicitly null rotation is malformed rather than an omitted zero default',()=>{
 const kit=new CourtKit(library());assert.throws(()=>kit.hall({...item,rot:null}),/Qinan|frame|rotation/);assert.equal(kit.root.children.length,0);
 const zone=new ZoneBase(library(),{id:'garden',items:[]});assert.throws(()=>zone.buildHall({...item,rot:null}),/Qinan|frame|rotation/);assert.equal(zone.kit.root.children.length,0);
});

test('both mirrored annex outer eave caps are visible from exterior with FrontSide material',async()=>{
 const {qinanRoofSurfaces}=await import('../../src/scene/palace/special/QinanRoof.js');const {g,root}=fixture(),s=qinanRoofSurfaces(g);
 for(const sign of [-1,1])for(const t of [.25,.5,.75]){
  const p=s.annexSide(sign,t,0),out=new THREE.Vector3(sign,0,0);
  const origin=new THREE.Vector3(g.x+p[0],p[1]-g.roofSkinApproximation.tileThickness/2,g.z+p[2]).addScaledVector(out,.3);
  const hits=new THREE.Raycaster(origin,out.clone().negate(),0,.31).intersectObject(root,true).filter(h=>h.object.userData.role==='qinan-annex-roof-tile');
  assert.ok(hits.length,`annex outer cap sign=${sign}, t=${t}`);near(hits[0].distance,.3);assert.ok(hits[0].face.normal.dot(out)>.999);assert.equal(hits[0].object.material.side,THREE.FrontSide);
 }
});
test('every outer, inner and rear roof cap triangle points away from its own convex patch interior',()=>{
 const {root}=fixture();let caps=0;
 for(const role of ['qinan-lower-roof-tile','qinan-upper-roof-tile','qinan-annex-roof-tile','qinan-flat-roof-cover'])for(const mesh of nodes(root,role)){
  const p=mesh.geometry.attributes.position,center=new THREE.Vector3();for(let i=0;i<p.count;i++)center.add(new THREE.Vector3().fromBufferAttribute(p,i));center.divideScalar(p.count);
  for(let i=0;i<p.count;i+=3){const [a,b,c]=[0,1,2].map(k=>new THREE.Vector3().fromBufferAttribute(p,i+k)),normal=b.clone().sub(a).cross(c.clone().sub(a)).normalize();if(Math.abs(normal.y)>1e-7)continue;
   const faceCenter=a.clone().add(b).add(c).divideScalar(3);assert.ok(normal.dot(faceCenter.sub(center))>1e-5,`${role} cap triangle ${i/3} points into patch`);caps++;
  }
 }
 assert.equal(caps,196,'all actually emitted cap triangles were inspected, including mirrored hip seam and rear ends');
});

const uvArea=(uv,i)=>Math.abs((uv.getX(i+1)-uv.getX(i))*(uv.getY(i+2)-uv.getY(i))-(uv.getY(i+1)-uv.getY(i))*(uv.getX(i+2)-uv.getX(i)))/2;
test('all vertical painted apron triangles sample a full-height noncollapsed band on every orientation',()=>{
 const {root}=fixture();let count=0;
 for(const role of ['qinan-bracket-apron','qinan-annex-enclosure-apron'])for(const mesh of nodes(root,role)){
  const {position:p,uv}=mesh.geometry.attributes;assert.equal(mesh.material.name,'caihua_beam');
  assert.equal(Math.min(...Array.from({length:uv.count},(_,i)=>uv.getY(i))),0);assert.equal(Math.max(...Array.from({length:uv.count},(_,i)=>uv.getY(i))),1);
  for(let i=0;i<p.count;i+=3){assert.ok(uvArea(uv,i)>1e-9,`${role} collapsed UV triangle${i/3}`);count++;}
  const byXZ=new Map();for(let i=0;i<p.count;i++){const k=`${p.getX(i)},${p.getZ(i)}`;const prev=byXZ.get(k);if(prev!==undefined)near(uv.getX(i),prev);else byXZ.set(k,uv.getX(i));assert.ok(Number.isFinite(uv.getX(i)));}
 }
 assert.equal(count,196);
});
test('all vertical tile-thickness cap triangles have noncollapsed UVs without changing outward geometry',()=>{
 const {root}=fixture();let count=0;
 for(const role of ['qinan-lower-roof-tile','qinan-upper-roof-tile','qinan-annex-roof-tile','qinan-flat-roof-cover'])for(const mesh of nodes(root,role)){
  const {position:p,uv}=mesh.geometry.attributes;for(let i=0;i<p.count;i+=3){const [a,b,c]=[0,1,2].map(k=>new THREE.Vector3().fromBufferAttribute(p,i+k));const normal=b.sub(a).cross(c.sub(a)).normalize();if(Math.abs(normal.y)>1e-7)continue;assert.ok(uvArea(uv,i)>1e-10,`${role} cap UV triangle${i/3}`);count++;}
 }
 assert.equal(count,196);
});
test('new Qin’an lattice panels and painted beam boxes use full-height band UVs, not cropped box sampling',()=>{
 const {root}=fixture();let count=0;
 root.traverse(m=>{if(!m.isMesh||!['lattice_doors','caihua_beam'].includes(m.material.name)||/apron/.test(m.userData.role))return;const {position:p,normal:n,uv}=m.geometry.attributes;const values=[];for(let i=0;i<p.count;i++)if(Math.abs(n.getY(i))<.1)values.push(uv.getY(i));assert.equal(Math.min(...values),0,m.userData.role);assert.equal(Math.max(...values),1,m.userData.role);count++;});
 assert.equal(count,12,'seven lattice panels and five beam boxes');
});

test('painted apron U uses the library band period continuously along each perimeter',()=>{
 const lib=library();lib.tileSize=n=>n==='caihua_beam'?4:1;
 const kit=new CourtKit(lib),{f:root}=kit.hall({...item,plaque:false});
 for(const meshes of [nodes(root,'qinan-bracket-apron').slice(0,4),nodes(root,'qinan-bracket-apron').slice(4),nodes(root,'qinan-annex-enclosure-apron')]){
  let previous=0;for(const mesh of meshes){const {position:p,uv}=mesh.geometry.attributes;const values=Array.from({length:uv.count},(_,i)=>uv.getX(i));near(Math.min(...values),previous);previous=Math.max(...values);
   const out=mesh.userData.outward,dx=-out[2],dz=out[0],phase=uv.getX(0)*4-p.getX(0)*dx-p.getZ(0)*dz;
   for(let i=0;i<p.count;i++)near(uv.getX(i)*4-p.getX(i)*dx-p.getZ(i)*dz,phase);
  }
 }
});
