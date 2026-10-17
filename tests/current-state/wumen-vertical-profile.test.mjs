import test from 'node:test';
import assert from 'node:assert/strict';
import {captureGate} from '../lib/gate-tower-fixture.mjs';
import {wumenTowerGeometry} from '../../src/scene/palace/special/GateTowerProfiles.js';
const c=captureGate(),roof=c.group.getObjectByName('roof_wudian'),plaque=c.group.getObjectByName('wumen-south-gate-name-plaque');
const near=(actual,expected,message,tolerance=1e-6)=>assert.ok(Math.abs(actual-expected)<=tolerance,`${message}: ${actual} vs ${expected}`);
test('reviewed Wumen lower body and registered central eave replace the old 13m body',()=>{
 const p=wumenTowerGeometry();near(p.height,6.960213793103446,'body');near(p.wallH,6.124988137931032,'wall');near(p.beamH,.8352256551724134,'beam');
 near(roof.userData.eaveY,20.00114942528736,'lower eave');assert.equal(p.openings[0].height,5.2);near(p.wallH-p.openings[0].height,.9249881379310319,'door headroom');
});
test('Wumen plaque uses the reviewed 3 percent panel ratio and fixed one-metre stand-off',()=>{
 const d=plaque.userData.gatePlaque.dimensions;
 near(d.innerWidth/54.506,.03,'blue panel / nominal upper wall',1e-12);near(d.width,2.9730545454545454,'outer width');near(d.height,3.3033939393939393,'outer height');
 near(plaque.position.y,23.47933751306165,'center Y');near(plaque.position.z,-10.728,'back Z');near(plaque.userData.gatePlaque.mount.wallStandOff,1,'stand-off');
});

import * as THREE from 'three';
import {buildRoof} from '../../src/scene/RoofBuilder.js';
import {buildWumenSouthPlaque} from '../../src/scene/palace/special/GatePlaques.js';
import {WUMEN_VERTICAL_PROFILE as card} from '../../src/scene/palace/special/WumenVerticalProfile.js';
import {baseline,hash,assertUnscopedWumen,unscopedWumen} from '../lib/wumen-vertical-profile-controls.mjs';
import {meshFingerprint,outerColumnSignature} from '../lib/gate-tower-fixture.mjs';
import {renderStateHash} from '../lib/gate-rail-retention.mjs';
const roofOpts={type:'wudian',width:60.65,depth:25.6,baseY:19.260213793103446,layers:2,brackets:true,height:9,wumenVerticalProfile:card};
for(const entry of baseline.genericRoofs)test(`non-opt-in roof stays byte-exact: ${JSON.stringify(entry.opts)}`,()=>{
 const g=buildRoof(c.lib,entry.opts);assert.equal(meshFingerprint(g),entry.geometry);assert.equal(renderStateHash(g),entry.renderState);
 assert.deepEqual({topY:g.userData.topY,eaveY:g.userData.eaveY,band:g.userData.doubleEaveMountingBand??null},entry.metadata);
});
test('all unscoped Wumen geometry, materials, wings, platform and portals stay byte-exact',()=>{assertUnscopedWumen(c);assert.equal(renderStateHash(unscopedWumen(c)),baseline.unscopedRenderState);});
test('Shenwu whole gate remains byte-exact',()=>{const s=captureGate('神武门');assert.equal(meshFingerprint(s.group),baseline.shenwu.geometry);assert.equal(hash({colliders:s.builder.colliders,walkables:s.builder.walkables}),baseline.shenwu.physics);});
test('Wumen floor, thresholds and open leaves stay byte-exact',()=>{
 const actual=c.tower.children.filter(m=>['open-lattice-leaf','threshold','interior-floor'].includes(m.userData.gatePart)).map(m=>({part:m.userData.gatePart,geometry:meshFingerprint(m)}));assert.deepEqual(actual,baseline.protectedBody);
});
test('Wumen column count, plan, radii and horizontal tessellation remain fixed',()=>{
 const actual=outerColumnSignature(c.tower);assert.equal(actual.length,baseline.outerColumns.length);
 actual.forEach((v,i)=>{const b=baseline.outerColumns[i];assert.equal(v.position[0],b.position[0]);assert.equal(v.position[2],b.position[2]);for(const k of Object.keys(b.parameters))if(k!=='height')assert.equal(v.parameters[k],b.parameters[k]);near(v.parameters.height,card.body.wallHeight,'column height');});
});
test('profile opt-in cannot be reused for a different building or silently accept a modified card',()=>{
 for(const delta of [{width:61},{width:NaN},{depth:26},{depth:NaN},{baseY:20},{baseY:undefined},{baseY:NaN},{baseY:Infinity},{height:8},{layers:1},{type:'xieshan'},{brackets:false},{overhang:3},{_lift:1},{wumenVerticalProfile:structuredClone(card)},{_wumenUpper:card.roof}])assert.throws(()=>buildRoof(c.lib,{...roofOpts,...delta}),/Wumen/);
 assert.ok(Object.isFrozen(card)&&Object.isFrozen(card.roof)&&Object.isFrozen(card.plaque));
});
function triangles(root,material){
 root.updateMatrixWorld(true);const out=[];
 root.traverse(m=>{if(!m.isMesh||(material&&m.material!==material))return;const p=m.geometry.attributes.position,idx=m.geometry.index,n=idx?.count??p.count;
  for(let i=0;i<n;i+=3){const v=[0,1,2].map(k=>new THREE.Vector3().fromBufferAttribute(p,idx?idx.getX(i+k):i+k).applyMatrix4(m.matrixWorld));out.push(new THREE.Triangle(...v));}
 });return out;
}
function segmentHitsTriangle(a,b,t){const d=b.clone().sub(a),length=d.length();if(length<1e-12)return false;const hit=new THREE.Ray(a,d.divideScalar(length)).intersectTriangle(t.a,t.b,t.c,false,new THREE.Vector3());return hit&&hit.distanceTo(a)<=length+1e-8;}
function triangleIntersects(a,b){for(const t of [[a,b],[b,a]]){const v=[t[0].a,t[0].b,t[0].c];for(let i=0;i<3;i++)if(segmentHitsTriangle(v[i],v[(i+1)%3],t[1]))return true;}return false;}
function faceNormal(t){return t.getNormal(new THREE.Vector3());}
function uniquePoints(tris){const seen=new Map();for(const t of tris)for(const p of [t.a,t.b,t.c])seen.set(p.toArray().map(v=>v.toFixed(5)).join(','),p);return [...seen.values()];}
for(const detail of ['high','low']){
 const r=buildRoof(c.lib,{...roofOpts,detail}),p=buildWumenSouthPlaque(c.builder,r),rp=card.roof;
 test(`${detail}: the complete plaque silhouette and thickness have no triangle intersections with any roof or band`,()=>{
  const pt=triangles(p),pb=new THREE.Box3().setFromObject(p),possible=triangles(r).filter(t=>pb.intersectsTriangle(t));
  for(const a of pt)for(const b of possible)assert.equal(!!triangleIntersects(a,b),false);
  near(pb.max.y,card.plaque.frameTopY,'frame top');near(pb.min.y,card.plaque.frameBottomY,'frame bottom');near(pb.max.z,card.plaque.backZ,'back');near(pb.min.z,card.plaque.frontZ,'front');
  assert.ok(pb.min.y-p.userData.gatePlaque.mount.lowerY>=.1);assert.ok(rp.upperFasciaBottomY-pb.max.y>=.09999);
 });
 test(`${detail}: all upper bearing/fan and eave/fascia seams meet around four faces and corners`,()=>{
  const raf=triangles(r,c.lib.material('rafters')),under=raf.filter(t=>Math.min(t.a.y,t.b.y,t.c.y)>25.3&&faceNormal(t).y<-.1);
  assert.ok(under.length>100);for(const t of under){assert.ok(t.getArea()>1e-10,'no degenerate annulus/fan triangles');assert.ok(faceNormal(t).y<-.1,'underside normals point down');}
  const points=uniquePoints(under),tol=3e-6;
  for(const sx of [-1,1])for(const sz of [-1,1])assert.ok(points.some(v=>Math.abs(v.x-sx*27.253)<tol&&Math.abs(v.z-sz*9.728)<tol&&Math.abs(v.y-rp.upperBearingSoffitY)<tol),'actual rectangular bearing corner exists');
  // A seam boundary must be shared by at least two triangle fans after welding.
  const edges=new Map(),key=p=>p.toArray().map(v=>v.toFixed(5)).join(',');
  for(const t of under){const v=[t.a,t.b,t.c];for(let i=0;i<3;i++){const a=v[i],b=v[(i+1)%3],k=[key(a),key(b)].sort().join('|');edges.set(k,{count:(edges.get(k)?.count??0)+1,a,b});}}
  for(const {count,a,b} of edges.values())if(count===1){
   // The only external annulus boundary is the outer eave, where the fascia
   // includes the same endpoint positions along its continuous vertical face.
   const interior=Math.max(Math.abs(a.x),Math.abs(b.x))<29.5877&&Math.max(Math.abs(a.z),Math.abs(b.z))<13.0459;
   if(interior){
    // The fan uses one edge while the annulus subdivides that exact line.
    // Verify coverage of both full and subdivided T-junction edges geometrically.
    for(const q of [.1,.3,.5,.7,.9]){const v=a.clone().lerp(b,q);assert.ok(under.filter(t=>t.closestPointToPoint(v,new THREE.Vector3()).distanceTo(v)<3e-5).length>=2,'internal seam has two surface neighbours');}
    continue;
   }
   const fascia=raf.filter(t=>Math.abs(faceNormal(t).y)<1e-5);
   for(const v of [a,b])assert.ok(fascia.some(t=>t.closestPointToPoint(v,new THREE.Vector3()).distanceTo(v)<3e-5),'soffit edge joins fascia surface');
  }
 });
 test(`${detail}: upper soffit stays beneath actual upper tile triangles with nonnegative separation`,()=>{
  const raf=triangles(r,c.lib.material('rafters')),under=raf.filter(t=>Math.min(t.a.y,t.b.y,t.c.y)>25.3&&faceNormal(t).y<-.1),tile=triangles(r,c.lib.material('roof_tile'));
  for(const v of uniquePoints(under)){
   const origin=new THREE.Vector3(v.x,45,v.z),ray=new THREE.Ray(origin,new THREE.Vector3(0,-1,0));let y=-Infinity;
   for(const t of tile){const hit=ray.intersectTriangle(t.a,t.b,t.c,false,new THREE.Vector3());if(hit)y=Math.max(y,hit.y);}
   // At identical eave float coordinates, a boundary point can miss due to
   // separate Float32 triangulation. Move only the CPU probe 0.1mm inward.
   if(!Number.isFinite(y)){origin.x*=1-1e-6;origin.z*=1-1e-6;for(const t of tile){const hit=ray.intersectTriangle(t.a,t.b,t.c,false,new THREE.Vector3());if(hit)y=Math.max(y,hit.y);}}
   assert.ok(y>=v.y-3e-5,`tile/soffit inversion at ${v.toArray()}: tile ${y}`);
  }
 });
 test(`${detail}: actual central tile, band and underside landmarks match frozen datums`,()=>{
  const down=(x,z)=>new THREE.Raycaster(new THREE.Vector3(x,45,z),new THREE.Vector3(0,-1,0)).intersectObject(r,true);
  const tiles=triangles(r,c.lib.material('roof_tile'));near(Math.max(...tiles.flatMap(t=>[t.a.y,t.b.y,t.c.y])),rp.upperTileRidgeY,'tile ridge',3e-6);
  near(r.userData.doubleEaveMountingBand.upperY,rp.upperBearingSoffitY,'bearing');near(r.userData.doubleEaveMountingBand.lowerY,rp.lowerRidgeTopY,'lower ridge');
  const painted=triangles(r,c.lib.material('caihua_beam'));near(Math.min(...painted.flatMap(t=>[t.a.y,t.b.y,t.c.y])),rp.lowerTileInnerY,'lower layered painted extent',3e-6);
  assert.ok(painted.some(t=>[t.a,t.b,t.c].some(v=>Math.abs(v.y-rp.upperWoodTopY)<3e-6)),'399 remains an internal partition');
  assert.ok(r.userData.topY>rp.upperTileRidgeY);assert.equal(r.userData.wumenVerticalProfile.actualOrnamentMaxY,r.userData.topY);
 });
}

import {restoreWumenFootRoundoff,footRoundoff} from '../lib/wumen-vertical-profile-controls.mjs';
import {restorePreWumenAscent} from '../lib/wumen-ascent-retention.mjs';
test('after exact folded-ascent restoration, all old physics retains only the 46 keyed submicrometre foot deltas',()=>{
 const retained=restorePreWumenAscent(c);
 assert.equal(hash({colliders:retained.builder.colliders,walkables:retained.builder.walkables}),footRoundoff.rawAfterPhysics);
 assert.equal(hash({colliders:restoreWumenFootRoundoff(retained.builder.colliders),walkables:retained.builder.walkables}),baseline.physics);
 assert.equal(footRoundoff.rawBeforePhysics,baseline.physics);
 for(const row of footRoundoff.changes)for(const axis of ['x','y','z']){
  const changed=retained.builder.colliders.map(b=>b.clone());changed[row.index].min[axis]+=.000001;
  assert.throws(()=>restoreWumenFootRoundoff(changed));
 }
});
