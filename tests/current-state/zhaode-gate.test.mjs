import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { replayR34ZhaodeV6Geometry } from '../lib/r34-zhaode-v6-native.mjs';
import * as THREE from 'three';
import { CourtKit, FACE } from '../../src/scene/palace/kit.js';
import { ZoneBase } from '../../src/scene/zones/ZoneBase.js';
import { CollisionManager } from '../../src/utils/Collision.js';
const url=new URL('../../src/scene/palace/special/ZhaodeGateProfile.js',import.meta.url);
const api=existsSync(url)?await import(url):{};
const ctx=new Proxy({},{get:()=>()=>({data:[]}),set:()=>true});
globalThis.document??={createElement:()=>({getContext:()=>ctx,width:0,height:0}),createElementNS:()=>({addEventListener(){},removeEventListener(){}})};
const axis=JSON.parse(readFileSync(new URL('../../data/zones/axis-courts.json',import.meta.url)));
const item=axis.items.find(i=>i.name==='昭德门');
const close=(a,b,msg)=>assert.ok(Math.abs(a-b)<1e-5,msg??`${a} != ${b}`);
function library(){const materials=new Map();return {materials,material:n=>materials.get(n)??(materials.set(n,new THREE.MeshStandardMaterial({name:n})),materials.get(n)),tileSize:()=>1,aspect:()=>1};}
function geom(opts={}){assert.equal(typeof api.zhaodeGateGeometry,'function','dedicated three-core-bay profile is required');return api.zhaodeGateGeometry({x:0,z:0,gateProfile:'zhaode',gateKind:'three-bay',...opts});}
const nodes=(root,role)=>{const out=[];root.traverse(o=>{if(o.userData.role===role)out.push(o);});return out;};
function fixture(opts={}){const lib=library(),kit=new CourtKit(lib),g=geom(opts);const width=kit.gate({x:0,z:0,gateProfile:'zhaode',gateKind:'three-bay',open:true,plaque:false,...opts});const frame=kit.root.children[0];frame.updateMatrixWorld(true);const cm=new CollisionManager();cm.rivers=[];cm.addColliders(kit.colliders);cm.addWalkables(kit.walkables);const blocked=(x,z,y=g.platformY)=>{const [wx,wz]=g.toWorld(x,z);return cm.checkCollision(new THREE.Vector3(wx,y+1.7,wz),.5);};return {lib,kit,g,width,frame,cm,blocked};}
function ray(root,from,to,far=100){const r=new THREE.Raycaster(new THREE.Vector3(...from),new THREE.Vector3(...to));r.far=far;return r.intersectObject(root,true);}

test('Zhaode is explicitly one raised three-core-bay gate at its unchanged anchor',()=>{
 assert.equal(item.gateProfile,'zhaode');assert.equal(item.gateKind,'three-bay');assert.equal(item.open,true);assert.equal(item.dimensionStatus,'provisional');assert.deepEqual([item.x,item.z],[-62.4,-214.2]);
 const g=geom(item);assert.deepEqual(g.portalCenters,[0]);assert.equal(g.portals.length,1);assert.equal(g.core.bayWidths.length,3);assert.deepEqual(g.core.bayWidths,[4.8,6,4.8]);close(g.building.width,20.128);close(g.building.depth,13.248);close(g.platformY,3.216);close(g.wallGapWidth,24.4);assert.equal(g.rot,0);
 assert.equal(g.ramps[0].zToe,-27);assert.equal(g.ramps[1].zToe,27.5);assert.notEqual(Math.abs(g.ramps[0].zToe-g.ramps[0].zTop),Math.abs(g.ramps[1].zToe-g.ramps[1].zTop));
});
test('documentary, derived, digitized, provisional and unknown dimensions stay separately identified',()=>{
 const g=geom();assert.equal(g.documentary.source,'G04');assert.equal(g.documentary.raw.widthChi,62.9);assert.equal(g.documentary.raw.depthChi,41.4);assert.match(g.documentary.depthMeaning,/front veranda/i);assert.equal(g.documentary.raw.plinthToRidgeChi,40.45);assert.equal(g.documentary.raw.groundToRidgeChi,50.5);close(g.derived.plinthRise,3.216);close(g.derived.printedMetricDifference,3.22);
 assert.equal(g.digitized.source,'G06');assert.equal(g.digitized.explicitBarUnit,false);assert.equal(g.digitized.independentVerticalCalibration,false);assert.equal(g.digitized.northProjection,17.18);assert.equal(g.digitized.southProjection,16.56);assert.equal(g.provisional.status,'engineering-assumptions');assert.ok(g.unknowns.some(s=>/north/i.test(s)));assert.ok(g.unknowns.some(s=>/wing/i.test(s)));assert.notEqual(g.building.width,g.digitized.outerColumnWidth);
 const other=geom();g.core.bayWidths[0]=99;assert.equal(other.core.bayWidths[0],4.8);
});
test('invalid profiles, topology, dimensions and transforms fail before registration',()=>{
 for(const change of [{gateKind:undefined},{gateProfile:'xiehe'},{gateProfile:null},{gateProfile:''},{gateKind:'five-bay'},{x:NaN},{z:Infinity},{x:'1'},{rot:null},{rot:'bad'},{rot:NaN},{rot:Math.PI/4},{rot:.01},{w:0},{h:-1},{t:Infinity}]){
  assert.throws(()=>geom(change),/profile|rotation|position|positive|topology|three-bay|dimension/i);
 }
 for(const rot of [...Object.keys(FACE),...Object.values(FACE),2*Math.PI,-2*Math.PI]){const g=geom({rot,x:7,z:9});assert.ok(g.toWorld(1,2).every(Number.isFinite));const [x,z]=g.toWorld(0,0);close(x,7);close(z,9);}
 const kit=new CourtKit(library());assert.throws(()=>kit.gate({x:0,z:0,gateProfile:'zhaode',gateKind:'five-bay'}),/three-bay|topology/);assert.equal(kit.root.children.length,0);
});
test('the B-only assembly owns closed masonry, one door pair and no fictitious lateral route',()=>{
 const f=fixture();assert.equal(f.width,24.4);assert.equal(f.kit.rooms.length,0);assert.equal(nodes(f.frame,'zhaode-door-leaf').length,2);assert.equal(nodes(f.frame,'zhaode-ramp-solid').length,2);assert.equal(nodes(f.frame,'zhaode-side-panel').length,4);assert.equal(nodes(f.frame,'zhaode-roof').length,1);assert.equal(f.frame.userData.structure.portalCount,1);assert.equal(f.frame.userData.structure.streamLayer,'B');
 for(const x of [-6,6,-9,9])assert.equal(f.blocked(x,f.g.core.frontZ),true);for(const x of [-1.5,0,1.5])for(const z of [-7,-4,0,4,7])assert.equal(f.blocked(x,z),false);
 const deck=f.kit.walkables.find(w=>w.supportId==='zhaode-platform');assert.equal(deck.rescue,false);assert.equal(f.kit.walkables.length,3);assert.equal(f.cm.getGroundHeight(0,0,0),0);close(f.cm.getGroundHeight(0,0,3.216),3.216);
});
test('actual merged triangles keep the central aperture hollow and side panels solid',()=>{
 const f=fixture(),merged=f.kit.finish();merged.updateMatrixWorld(true);
 for(const x of [-1.5,0,1.5])for(const sign of [-1,1])assert.equal(ray(merged,[x,4.5,sign*8],[0,0,-sign],16).length,0);
 for(const x of [-6,6,-9,9])assert.ok(ray(merged,[x,4.5,-8],[0,0,1],8).length>0);
 for(const x of [-11,0,11]){const hit=ray(merged,[x,-1,0],[0,1,0],5)[0];assert.ok(hit,'masonry must have a closed underside');close(hit.point.y,0);}
 assert.ok(ray(merged,[-14,1,-8],[1,0,0],5).length>0,'retaining side is actual geometry');
 assert.equal(merged.userData.architecture[0].portalCount,1);f.kit.dispose(merged);
});
test('both closed ramp wedges match their own exact supports through cardinal transforms',()=>{
 for(const rot of Object.values(FACE)){
  const f=fixture({x:17,z:23,rot});for(const ramp of f.g.ramps)for(const t of [.1,.5,.9]){
   const z=ramp.zTop+(ramp.zToe-ramp.zTop)*t,y=ramp.yTop*(1-t);const [wx,wz]=f.g.toWorld(0,z);
   close(f.cm.getGroundHeight(wx,wz,f.g.platformY),y);const hits=ray(f.frame,[wx,10,wz],[0,-1,0],20).filter(h=>h.object.userData.role==='zhaode-ramp-solid');assert.ok(hits.length);close(hits[0].point.y,y);
   const below=ray(f.frame,[wx,-1,wz],[0,1,0],5).filter(h=>h.object.userData.role==='zhaode-ramp-solid');assert.ok(below.length);close(below[0].point.y,0);
   for(const x of [-5.7,5.7]){const [sx,sz]=f.g.toWorld(x,z);close(f.cm.getGroundHeight(sx,sz,f.g.platformY),0);}
   if(t<.7)assert.equal(f.blocked(0,z,0),true,'ground body cannot enter elevated wedge');
  }
 }
});
test('railing, cheek, column, closed leaves and cap solids block with matching visible geometry',()=>{
 const f=fixture();for(const [x,z,y] of [[-12.2,-8,3.216],[12.2,8,3.216],[-5.1,-18,1.75],[5.1,18,1.8],[-3,-6.624,3.216],[-11,0,3.216],[11,0,3.216]])assert.equal(f.blocked(x,z,y),true,`${x}/${z}`);
 for(const leaf of nodes(f.frame,'zhaode-door-leaf'))assert.equal(f.blocked(leaf.position.x,leaf.position.z),true);
 const shut=fixture({open:false});assert.equal(shut.blocked(0,shut.g.core.frontZ),true);assert.ok(ray(shut.frame,[0,4.5,-8],[0,0,1],8).some(h=>(h.object.userData.role==='zhaode-door-leaf'||h.object.userData.role==='zhaode-door-front'&&h.object.parent.userData.role==='zhaode-door-leaf')));
});
test('ridge datum is documentary while actual roof bounds and ornament maximum are explicit',()=>{
 const f=fixture(),roof=nodes(f.frame,'zhaode-roof')[0];const ridge=ray(roof,[0,30,0],[0,-1,0]).filter(h=>h.object.material===f.kit.ridge);assert.ok(ridge.length);close(ridge[0].point.y,16.16);const box=new THREE.Box3().setFromObject(roof);const info=f.frame.userData.structure.roofBounds;assert.ok(info);close(info.min[0],box.min.x);close(info.max[1],box.max.y);assert.ok(box.min.x<-f.g.building.width/2);assert.ok(f.g.roof.overhang>0);
});
test('only the two explicit corridor ends resolve to the profile envelope and remain closed',()=>{
 // Resolve the same explicit gate owner as ZoneBase.buildCorridor, not all joins in the zone.
 const joins=axis.items.filter(i=>i.gateJoin?.gate===item.name);
 assert.deepEqual(joins.map(i=>[i.gateJoin.side,i.gateJoin.end]),[['left','to'],['right','from']]);
 assert.equal(joins.length,2);assert.deepEqual(joins.map(i=>i.facing),['z-','z-']);const zone=new ZoneBase(library(),{id:'joins',items:[item,...joins]});zone.kit.finish=()=>zone.kit.root;const built=zone.build();built.group.updateMatrixWorld(true);close(zone.gateWidths.get('昭德门'),24.4);const g=geom(item);
 assert.deepEqual(joins[0].from,[-105.97,-217.3]);assert.deepEqual(joins[1].to,[-26.5,-217.3]);
 const corridorFrames=zone.kit.root.children.filter(o=>o.userData.gateJoin);assert.equal(corridorFrames.length,2);
 for(const f of corridorFrames){const join=g.joins[f.userData.gateJoin.side];close(f.userData.gateJoin.boundary[0],join.world[0]);close(f.userData.gateJoin.boundary[1],-217.3);const bounds=new THREE.Box3().setFromObject(f);assert.ok(f.userData.gateJoin.provisional);if(join.side==='left')assert.ok(bounds.max.x<=join.world[0]+.071);else assert.ok(bounds.min.x>=join.world[0]-.071);}
 const cm=new CollisionManager();cm.rivers=[];cm.addColliders(built.colliders);cm.addWalkables(built.walkables);
 for(const side of [-1,1])for(const z of [-5.2,-3.1,-1,0])for(const feet of [0,.45,3.216]){const wx=g.x+side*12.1,wz=g.z+z;assert.equal(cm.checkCollision(new THREE.Vector3(wx,feet+1.7,wz),.5),true,'closed wing interface cannot be entered');assert.ok(ray(built.group,[g.x+side*14,feet+1.2,wz],[-side,0,0],5).length,'closed cap must have visible wall');}
 const gateFrame=zone.kit.root.children.find(f=>f.userData.gateGeometry);for(const rail of nodes(gateFrame,'zhaode-railing')){const b=new THREE.Box3().setFromObject(rail);for(const cap of nodes(gateFrame,'zhaode-wing-cap')){const c=new THREE.Box3().setFromObject(cap);const overlap=b.clone().intersect(c).getSize(new THREE.Vector3());assert.ok(Math.min(overlap.x,overlap.y,overlap.z)<1e-5,'rails cannot penetrate closed wing caps');}}
});
test('bad or unbuilt explicit joins fail closed without generic name or orientation heuristics',()=>{
 geom();const base={kind:'corridor',from:[-105.97,-217.3],to:[-69.2,-217.3],facing:'z-',gateJoin:{gate:'昭德门',side:'left',end:'to'}};
 assert.throws(()=>new ZoneBase(library(),{id:'bad',items:[base]}).build(),/join|gate/i);
 for(const change of [{side:'bogus'},{end:'from'},{gate:'missing'}]){const z=new ZoneBase(library(),{id:'bad',items:[item,{...base,gateJoin:{...base.gateJoin,...change}}]});assert.throws(()=>z.build(),/join|gate|endpoint/i);}
});
test('four old profile gates and fourteen unrelated corridor assemblies are byte-equivalent to delivered V6',replayR34ZhaodeV6Geometry);
test('repeated merged geometry remains finite and disposes only assembly-owned resources',()=>{
 for(let iteration=0;iteration<2;iteration++){
  const f=fixture(),watched=new Map();const watch=o=>{if(watched.has(o))return;watched.set(o,0);o.addEventListener('dispose',()=>watched.set(o,watched.get(o)+1));};f.frame.traverse(o=>{if(o.geometry)watch(o.geometry);});const sources=[...watched.keys()];const shared=[...f.lib.materials.values()];for(const m of [...shared,...f.kit.owned])watch(m);const merged=f.kit.finish();for(const g of sources)assert.equal(watched.get(g),1);for(const mesh of merged.children){watch(mesh.geometry);for(const a of Object.values(mesh.geometry.attributes))for(const value of a.array)assert.ok(Number.isFinite(value));assert.ok(mesh.geometry.attributes.normal);assert.ok(mesh.geometry.attributes.uv);assert.equal(mesh.castShadow,true);}
  f.kit.dispose(merged);for(const mesh of merged.children)assert.equal(watched.get(mesh.geometry),1);for(const m of shared)assert.equal(watched.get(m),0);for(const m of f.kit.owned)assert.equal(watched.get(m),1);
 }
});

test('merged recessed panel heads conservatively seal the unclassified upper strip on both faces',()=>{
 const f=fixture(),merged=f.kit.finish();merged.updateMatrixWorld(true);
 // Regression: previously panels stopped at 8.766 m while their adjacent door
 // heads reached 9.416 m. These slightly descending rays escaped below the
 // outer colonnade beam. Probe actual merged triangles, not collider bounds.
 for(const x of [-9,-5,5,9])for(const y of [8.8,8.9,9.2])for(const sign of [-1,1]){
  const direction=new THREE.Vector3(0,-.03,sign).normalize();
  const hits=ray(merged,[x,y,0],direction.toArray(),20);
  assert.ok(hits.length>0,`upper side-panel sky strip at ${x},${y},${sign}`);
  close(Math.abs(hits[0].point.z),Math.abs(f.g.core.frontZ)-f.g.core.wallThickness/2,'closure must occur at the actual recessed panel, not distant scenery');
  assert.equal(hits[0].object.material,f.lib.material('wall_red'));
 }
 assert.match(f.g.provisional.recessedPanelClosure,/engineering closure/i);
 close(f.g.core.panelHeight,f.g.building.columnH);
 for(const x of [-1.5,0,1.5])assert.equal(ray(merged,[x,4.5,-8],[0,0,1],16).length,0,'closure must not narrow or fill the playable portal');
 close(f.frame.userData.structure.roofBounds.mainRidgeCapY,16.16);
 f.kit.dispose(merged);
});

test('merged ramp and cheek faces have nondegenerate face-oriented stone UVs',()=>{
 const f=fixture(),merged=f.kit.finish();merged.updateMatrixWorld(true);let checked=0;
 for(const mesh of merged.children){if(mesh.material!==f.lib.material('stone_slab'))continue;const {position,uv}=mesh.geometry.attributes,index=mesh.geometry.index,count=index?.count??position.count;
  for(let i=0;i<count;i+=3){const ids=[0,1,2].map(j=>index?index.getX(i+j):i+j);const points=ids.map(id=>new THREE.Vector3().fromBufferAttribute(position,id));
   if(!points.every(p=>Math.abs(p.x)<=5.601&&Math.abs(p.z)>=10.499))continue;
   const area=new THREE.Vector3().subVectors(points[1],points[0]).cross(new THREE.Vector3().subVectors(points[2],points[0])).length()/2;if(area<1e-8)continue;
   const tex=ids.map(id=>new THREE.Vector2().fromBufferAttribute(uv,id));const uvArea=Math.abs((tex[1].x-tex[0].x)*(tex[2].y-tex[0].y)-(tex[1].y-tex[0].y)*(tex[2].x-tex[0].x))/2;
   assert.ok(uvArea>1e-8,`visible stone face has collapsed UV area at ${JSON.stringify(points.map(p=>p.toArray()))}`);checked++;
  }
 }
 assert.ok(checked>=40,'both complete ramp and cheek solids must be inspected');f.kit.dispose(merged);
});

test('merged join retaining faces have one exposed material at every cap and paving height',()=>{
 const f=fixture(),merged=f.kit.finish();merged.updateMatrixWorld(true);
 for(const sign of [-1,1])for(const z of [-6.1,-3.14,.21])for(const y of [.8,2.5,3.18,4.5]){
  const hits=ray(merged,[sign*14,y,z],[-sign,0,0],4).filter(hit=>Math.abs(Math.abs(hit.point.x)-f.g.platform.width/2)<1e-5);
  assert.ok(hits.length>0,'retaining/cap envelope must stay closed');
  const names=[...new Set(hits.map(hit=>hit.object.material.name))];
  assert.equal(names.length,1,`opposite-material coplanar join skins at ${sign}/${y}/${z}: ${names}`);
  assert.equal(names[0],y<3.136?'wall_brick':y<3.216?'stone_slab':'wall_red');
 }
 const deck=ray(merged,[11,10,-8],[0,-1,0],8).filter(hit=>Math.abs(hit.point.y-f.g.platformY)<1e-5);
 assert.ok(deck.length);assert.deepEqual([...new Set(deck.map(hit=>hit.object.material.name))],['stone_slab'],'one exposed paving top, with no coplanar brick skin');
 f.kit.dispose(merged);
});
