import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import { CourtKit } from '../../src/scene/palace/kit.js';
import { ZoneBase } from '../../src/scene/zones/ZoneBase.js';
import { CollisionManager } from '../../src/utils/Collision.js';
import { walkStraight } from '../lib/world.mjs';

const profiles = await import('../../src/scene/palace/special/PavilionProfiles.js').catch(e => {
  if (e.code === 'ERR_MODULE_NOT_FOUND') return {};
  throw e;
});
const assembler = await import('../../src/scene/palace/special/SurveyedPavilion.js').catch(e => {
  if (e.code === 'ERR_MODULE_NOT_FOUND') return {};
  throw e;
});
const nodes = (group, role) => { const found=[]; group.traverse(o=>{if(o.userData.role===role)found.push(o);}); return found; };
const near=(a,b,message='')=>assert.ok(Math.abs(a-b)<2e-5, `${message}: ${a} ≠ ${b}`);
const items={hongyi:{pavilionProfile:'hongyi',x:102.1,z:-110.4,rot:'east'},tiren:{pavilionProfile:'tiren',x:-98.4,z:-109.3,rot:'west'}};
function geometry(key, extra={}) {
  assert.equal(typeof profiles.pavilionGeometry,'function','an independent pavilion geometry helper is required');
  return profiles.pavilionGeometry({...items[key],...extra});
}
function fixture(key,extra={}) {
  assert.equal(typeof assembler.buildSurveyedPavilion,'function','a reusable measured assembly is required');
  const materials=new Map();
  const lib=new Proxy({material:n=>materials.get(n)??(materials.set(n,new THREE.MeshStandardMaterial({name:n})),materials.get(n)),tileSize:()=>1,aspect:()=>1},{get:(t,k)=>k in t?t[k]:()=>null});
  const kit=new CourtKit(lib), g=geometry(key), built=assembler.buildSurveyedPavilion(kit,{...items[key],enter:true,plaque:false,...extra});
  built.f.updateMatrixWorld(true);
  const cm=new CollisionManager(); cm.rivers=[]; cm.addColliders(kit.colliders); cm.addWalkables(kit.walkables);
  const world=p=>new THREE.Vector3(p.x,p.y,p.z).applyMatrix4(built.f.matrixWorld);
  const blocked=(x,y,z)=>cm.checkCollision(world({x,y:y+1.7,z}),.5);
  return {kit,lib,built,g,cm,world,blocked};
}

// Production mutations that these fail: returning shared/equal bay grids;
// replacing the nine-interval shell with 7/9 width; erasing front/rear offsets.
test('independent lower and upper centerline chains retain source asymmetry and separate shells',()=>{
  const h=geometry('hongyi'),t=geometry('tiren');
  assert.deepEqual(h.lower.intervals,[4.32,4.768,4.768,4.768,6.432,4.768,4.768,4.768,4.32]);
  assert.deepEqual(t.lower.intervals,[4.32,4.768,4.768,4.768,6.464,4.768,4.768,4.768,4.32]);
  near(h.lower.width,43.680);near(t.lower.width,43.712);near(h.lower.depth,16.704);near(t.lower.depth,16.736);
  near(h.upper.front.width,39.420);near(h.upper.rear.width,39.520);
  near(t.upper.front.width,39.684);near(t.upper.rear.width,39.680);
  near(t.upper.front.u[0],-19.844);near(t.upper.front.u.at(-1),19.840);
  near(h.upper.front.z,-6.220);near(h.upper.rear.z,6.208);
  near(h.gallery.front.z,-7.628);near(h.gallery.rear.z,7.616);
  for(const g of [h,t]) {
    assert.equal(g.upper.front.intervals.length,9);assert.equal(g.upper.front.openingBays.length,7);
    assert.equal(g.gallery.supports.length,24);
    assert.ok(g.deck.width>g.gallery.rear.width);assert.ok(g.roof.width>g.deck.width);
    assert.ok(g.upper.front.width>g.lower.width*7/9+4);
  }
  assert.equal(h.measurements.upper.front_outer_support_width,undefined);
  assert.equal(h.assumptions.frontOuterSupportWidth.status,'PROVISIONAL_NOT_SURVEYED');
  assert.equal(h.assumptions.waistFrontWidth.status,'PROVISIONAL_SOURCE_CONFLICT');
  assert.equal(t.assumptions.terraceY.status,'PROVISIONAL_NOT_SURVEYED');
  assert.equal(h.terraceCentralSpot.status,'DIMENSIONED');
});

test('invalid profiles, datum overrides, and non-cardinal transforms fail explicitly',()=>{
  geometry('hongyi');
  assert.throws(()=>profiles.pavilionGeometry({pavilionProfile:'invented'}),/profile/i);
  assert.throws(()=>geometry('tiren',{rot:.3}),/cardinal/i);
  assert.throws(()=>geometry('tiren',{rot:'invented'}),/rotation/i);
  assert.throws(()=>geometry('tiren',{x:NaN}),/position/i);
  assert.throws(()=>geometry('tiren',{interiorFloorWorldY:NaN}),/datum/i);
});

for(const key of ['hongyi','tiren']) {
  test(`${key}: generated floor, eave and ridge vertices honor independent survey references`,()=>{
    const {built,g}=fixture(key),root=built.f;
    const floor=nodes(root,'storey-floor');assert.equal(floor.length,2);
    for(const [i,y] of [g.elevations.interior_floor,g.elevations.upper_floor].entries()) {
      floor[i].geometry.computeBoundingBox();near(floor[i].position.y+floor[i].geometry.boundingBox.max.y,y,'physical floor');
    }
    const skirt=nodes(root,'skirt-slope');assert.equal(skirt.length,4);
    const middle=skirt[0].geometry.getAttribute('position');
    const edge=[]; for(let i=0;i<middle.count;i++) if(Math.abs(middle.getZ(i)-g.lowerRoof.front)<1e-5)edge.push([middle.getX(i),middle.getY(i)]);
    assert.ok(edge.length>2);near(edge.sort((a,b)=>Math.abs(a[0])-Math.abs(b[0]))[0][1],g.elevations.lower_eave,'actual lower eave midpoint');
    const roof=nodes(root,'upper-hip-roof')[0];near(roof.userData.eaveY,g.elevations.upper_eave,'roof eave metadata');
    const roofVertices=[];roof.traverse(o=>{if(!o.isMesh||o.material.name!=='roof_tile')return;const p=o.geometry.getAttribute('position');for(let i=0;i<p.count;i++)roofVertices.push(new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(o.matrix).add(roof.position));});
    assert.ok(roofVertices.length>0);
    const origin=new THREE.Vector3(0,g.elevations.ridge+5,g.roof.centerZ).applyMatrix4(root.matrixWorld);
    const ridgeHit=new THREE.Raycaster(origin,new THREE.Vector3(0,-1,0)).intersectObject(roof,true)[0];
    assert.ok(ridgeHit);near(ridgeHit.point.y,g.elevations.ridge,'actual central main-ridge cap crest');
    const tilePeak=Math.max(...roofVertices.map(p=>p.y));near(tilePeak,g.roof.tilePeakY,'tile meeting surface below measured crest');
    assert.ok(tilePeak<g.elevations.ridge-.4,'tile peak must not be substituted for cap crest');
    const eave=roofVertices.filter(p=>Math.abs(p.x)<1e-5&&Math.abs(p.z-g.roof.front)<1e-5);assert.ok(eave.length);near(Math.max(...eave.map(p=>p.y)),g.elevations.upper_eave,'actual upper eave midpoint');
    assert.equal(roof.userData.ridgeReferenceObject,'central-main-ridge-cap-crest');
    assert.equal(roof.userData.ornamentFidelity,'LOW_DETAIL_CHIWEN_OMITTED');
    assert.equal(root.userData.pavilion.dimensions.currentCondition2026Accepted,false);
  });

  test(`${key}: nine lower bays, seven upper openings with closed ends, and physical rear enclosure`,()=>{
    const {built,g,blocked,kit}=fixture(key);
    assert.deepEqual(nodes(built.f,'lower-front-bay').map(o=>o.userData.kind),['brick','window','window','window','door','window','window','window','brick']);
    assert.equal(nodes(built.f,'upper-front-bay').length,7);assert.equal(nodes(built.f,'upper-lattice-leaf').length,28);
    assert.equal(nodes(built.f,'upper-closed-end-bay').length,2);assert.equal(nodes(built.f,'upper-wood-rear').length,1);
    assert.equal(nodes(built.f,'balcony-eave-support').length,24);
    const actual=nodes(built.f,'balcony-eave-support').map(o=>[o.position.x,o.position.z]);
    g.gallery.supports.forEach(p=>assert.ok(actual.some(([x,z])=>Math.abs(x-p.x)<1e-8&&Math.abs(z-p.z)<1e-8)));
    assert.ok(nodes(built.f,'waist-short-column').length>=20);assert.ok(nodes(built.f,'waist-principal-continuation').length>=20);
    assert.equal(blocked(0,g.lower.floorY,g.lower.front),false);
    assert.equal(blocked(0,g.lower.floorY,g.lower.rear),true);
    assert.equal(blocked(0,g.upper.floorY,g.upper.rear.z),true);
    assert.equal(nodes(built.f,'balcony-deck').length,4);
    assert.ok(nodes(built.f,'balcony-deck').every(o=>o.material===kit.floorMat),'gallery uses the shared square-brick paving, not an exposed timber or stone-slab deck');
    assert.equal(nodes(built.f,'gallery-hanging-fascia').length,4);
    for(const p of nodes(built.f,'gallery-hanging-fascia')) {p.geometry.computeBoundingBox();assert.ok(p.position.y+p.geometry.boundingBox.max.y<g.upper.floorY);}
  });

  test(`${key}: both real 32-step flights reach the single lower room and exclude the royal strip`,()=>{
    const {built,g,kit,cm,blocked}=fixture(key);
    for(const side of ['frontLeft','frontRight']) {
      const a=g.approaches[side];assert.equal(nodes(built.f,'front-stair-tread').filter(n=>n.userData.side===side).length,32);
      let feet=0;
      for(let i=1;i<a.worldPoints.length;i++) {
        const p=a.worldPoints[i-1],q=a.worldPoints[i];
        const r=walkStraight({THREE,cm},[p.x,p.z],[q.x,q.z],{feet0:feet});assert.ok(r.total-r.reached<=.051,`${side} ${p.kind}→${q.kind} ${JSON.stringify(r)}`);feet=r.feet;
      }
      near(feet,g.lower.floorY);near(a.points.find(p=>p.kind==='stairTop').y,g.platform.y);
    }
    const strip=g.royalStrip;const from=g.toWorld(0,strip.zToe-2),to=g.toWorld(0,strip.zTop+2);
    const crossing=walkStraight({THREE,cm},from,to,{feet0:0});assert.ok(crossing.reached<crossing.total-5,'royal strip has no playable ramp');
    assert.equal(kit.rooms.length,1);near(kit.rooms[0].floorY,g.lower.floorY);assert.equal(kit.rooms[0].doors.length,1);
    assert.equal(kit.rooms.some(r=>r.floorY===g.upper.floorY),false);
    assert.ok(kit.walkables.filter(w=>w.type==='box'&&w.box.max.y>=g.upper.floorY-.001).every(w=>w.rescue===false));
    assert.ok(g.sideConnections.every(s=>s.neighborConnection==='DEFERRED_ELEVATION_UNRESOLVED'));
  });
}

test('source records dispatch independently and metadata survives batching without owning shared materials',()=>{
  const json=JSON.parse(fs.readFileSync(new URL('../../data/zones/axis-courts.json',import.meta.url)));
  const records=json.items.filter(i=>['弘义阁','体仁阁'].includes(i.name));assert.equal(records.length,2);
  assert.deepEqual(records.map(i=>i.pavilionProfile).sort(),['hongyi','tiren']);
  const {kit,lib}=fixture('hongyi');const z=new ZoneBase(lib,{id:'test',items:[]});records.forEach(i=>z.buildHall(i));
  assert.equal(z.kit.rooms.length,2);
  const shared=[...new Set([...z.kit.root.children].flatMap(o=>{const m=[];o.traverse(p=>{if(p.isMesh)m.push(p.material);});return m;}))].filter(m=>m.name==='roof_tile');
  let disposed=0;shared.forEach(m=>m.addEventListener('dispose',()=>disposed++));
  const finished=z.kit.finish();assert.equal(finished.userData.architecture.length,2);
  assert.deepEqual(finished.userData.architecture.map(a=>a.profile).sort(),['hongyi','tiren']);assert.equal(disposed,0);
  assert.ok(finished.children.length<30,'shared-material batching must not add per-pavilion draw calls');
});

test('guarded side connections have usable non-rescuing runs and landings, stopping before unresolved neighbors',()=>{
  for(const key of ['hongyi','tiren']) {
    const {g,cm}=fixture(key);
    for(const s of g.sideConnections) {
      const points=[{x:s.xTop-s.sign,y:s.yTop,z:s.zCenter},{x:s.xLanding,y:s.yLanding,z:s.zCenter},{x:s.xLanding+s.sign*.35,y:s.yLanding,z:s.zCenter}];
      for(const route of [points,[...points].reverse()]) {
        let feet=route[0].y;
        for(let i=1;i<route.length;i++) {
          const a=g.toWorld(route[i-1].x,route[i-1].z),b=g.toWorld(route[i].x,route[i].z);
          const r=walkStraight({THREE,cm},a,b,{feet0:feet});assert.ok(r.total-r.reached<.06,`${key} ${s.direction}: ${JSON.stringify(r)}`);feet=r.feet;
        }
        near(feet,route.at(-1).y);
      }
      const land=g.toWorld(s.xLanding+s.sign*.35,s.zCenter),past=g.toWorld(s.xLanding+s.sign*2,s.zCenter);
      const guard=walkStraight({THREE,cm},land,past,{feet0:s.yLanding});assert.ok(guard.total-guard.reached>.7);
      const middle=g.toWorld((s.xTop+s.xLanding)/2,s.zCenter);near(cm.getGroundHeight(...middle,s.yTop,.6),(s.yTop+s.yLanding)/2);
      near(cm.getGroundHeight(...middle,0,.6),0,'no rescue onto detached veranda landing');
    }
  }
});

test('waist short-column endpoint spans evaluate to each independent support grid',()=>{
  for(const key of ['hongyi','tiren']) {
    const {built,g}=fixture(key);const posts=nodes(built.f,'waist-short-column');
    const front=posts.filter(p=>Math.abs(p.position.z+g.waist.depth/2)<1e-8),rear=posts.filter(p=>Math.abs(p.position.z-g.waist.depth/2)<1e-8);
    assert.equal(front.length,10);assert.equal(rear.length,10);
    near(Math.max(...front.map(p=>p.position.x))-Math.min(...front.map(p=>p.position.x)),g.waist.frontWidth);
    near(Math.max(...rear.map(p=>p.position.x))-Math.min(...rear.map(p=>p.position.x)),g.waist.rearWidth);
  }
});

test('lower roof has a supported bracket ring rather than an unsupported eave gap',()=>{
  for(const key of ['hongyi','tiren']) {
    const {built,g}=fixture(key);const bands=nodes(built.f,'lower-eave-bracket-band');
    assert.equal(bands.length,4);
    for(const b of bands){b.geometry.computeBoundingBox();near(b.position.y+b.geometry.boundingBox.min.y,g.lower.columnTop);near(b.position.y+b.geometry.boundingBox.max.y,g.elevations.lower_eave);}
  }
});

test('wall replacements and only four trimmed corridor endpoints match the exact helper boundary',()=>{
  const json=JSON.parse(fs.readFileSync(new URL('../../data/zones/axis-courts.json',import.meta.url)));
  for(const key of ['hongyi','tiren']) {
    const g=geometry(key),wallX=key==='hongyi'?110.7:-106.47,corridorX=key==='hongyi'?107.6:-103.37;
    const wall=json.items.find(i=>i.kind==='wall'&&i.from[0]===wallX&&i.from[1]===-416);
    const gap=wall.gaps.find(gap=>gap.pavilionProfile===key);near(gap.w,g.interface.wallGapWidth);near(gap.at,g.z);
    assert.ok(gap.w<g.lower.width&&gap.w<g.platform.width-15,'no full-terrace breach');
    const south=json.items.find(i=>i.kind==='corridor'&&i.from[0]===corridorX&&i.from[1]===-213.7);
    const north=json.items.find(i=>i.kind==='corridor'&&i.to[0]===corridorX&&i.to[1]===(key==='hongyi'?-59.6:-59.9));
    near(south.to[1],g.z-g.interface.corridorTrimHalfLength);near(north.from[1],g.z+g.interface.corridorTrimHalfLength);
    assert.equal(south.ph,undefined);assert.equal(north.ph,undefined,'neighbors are not silently raised');
    // Rear shell plus retained wall spans must physically enclose the entire seam.
    const {kit,lib}=fixture(key);const zone=new ZoneBase(lib,{id:'seam',items:[]});
    zone.buildHall({...items[key],structure:'surveyed-pavilion',enter:true,plaque:false});
    zone.buildWall({...wall,gaps:[gap]});
    const cm=new CollisionManager();cm.rivers=[];cm.addColliders(zone.kit.colliders);cm.addWalkables(zone.kit.walkables);
    for(const lx of [-g.lower.width/2-.1,-gap.w/2+.1,0,gap.w/2-.1,g.lower.width/2+.1])for(const feet0 of [0,g.platform.y]) {
      const from=g.toWorld(lx,12),to=g.toWorld(lx,g.lower.rear-1.4);
      const r=walkStraight({THREE,cm},from,to,{feet0});assert.ok(r.total-r.reached>.5,`${key} rear seam ${lx}/${feet0}: ${JSON.stringify(r)}`);
    }
  }
});

test('pavilion disposal releases all merged geometry and kit-owned resources, never shared textures/materials',()=>{
  const {kit,lib}=fixture('hongyi');const merged=kit.finish();let sharedDisposals=0,ownedDisposals=0,geometryDisposals=0,geometryCount=0;
  for(const name of ['wood_column','roof_tile','marble','stone_slab'])lib.material(name).addEventListener('dispose',()=>sharedDisposals++);
  kit.owned.forEach(m=>m.addEventListener('dispose',()=>ownedDisposals++));
  merged.traverse(o=>{if(o.geometry){geometryCount++;o.geometry.addEventListener('dispose',()=>geometryDisposals++);}});
  kit.dispose(merged);assert.equal(geometryDisposals,geometryCount);assert.equal(ownedDisposals,kit.owned.length);assert.equal(sharedDisposals,0);assert.equal(kit.colliders.length,0);assert.equal(kit.walkables.length,0);
});

test('every waist post bears on connected provisional framing instead of floating above the lower floor',()=>{
  for(const key of ['hongyi','tiren']) {
    const {built,g}=fixture(key,{rot:0,x:0,z:0});const root=built.f;
    root.updateMatrixWorld(true);
    const beamRoles=['waist-lower-transfer-beam','waist-bearing-longitudinal','waist-post-bearing-beam','waist-end-bearing-beam'];
    const beams=beamRoles.flatMap(role=>nodes(root,role));
    const posts=[...nodes(root,'waist-principal-continuation'),...nodes(root,'waist-short-column')];assert.equal(posts.length,44);
    for(const post of posts) {
      post.geometry.computeBoundingBox();const base=post.geometry.boundingBox.min.y+post.position.y;
      const ray=new THREE.Raycaster(new THREE.Vector3(post.position.x,base+.01,post.position.z),new THREE.Vector3(0,-1,0));
      const hits=ray.intersectObjects(beams,false);assert.ok(hits.length&&Math.abs(hits[0].distance-.01)<1e-4,`${key} ${post.userData.role} ${post.position.toArray()} must touch bearing beam at its base`);
    }
    assert.notEqual(g.waist.supportBaseY,g.waist.landingY,'stair-landing mark is not a general short-post base datum');
    assert.equal(g.assumptions.waistBearingFraming.status,'PROVISIONAL_NOT_SURVEYED');
    // Each transverse transfer beam physically intersects both source-level
    // lower perimeter beams; elevated bearing beams meet the continuation posts.
    const lower=nodes(root,'painted-beam').filter(o=>o.position.y<g.lower.columnTop);
    for(const tie of nodes(root,'waist-lower-transfer-beam')) {
      const bounds=new THREE.Box3().setFromObject(tie);
      assert.ok(lower.filter(b=>bounds.intersectsBox(new THREE.Box3().setFromObject(b))).length>=2);
    }
    for(const beam of nodes(root,'waist-bearing-longitudinal')) {
      const bounds=new THREE.Box3().setFromObject(beam);
      assert.ok(nodes(root,'waist-principal-continuation').filter(p=>bounds.intersectsBox(new THREE.Box3().setFromObject(p))).length>=8);
    }
  }
});
