import {wuyingGalleryRoute,wuyingGateToGallery} from './lib/r52-wuying-routes.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import * as THREE from 'three';
import { ZoneBase } from '../src/scene/zones/ZoneBase.js';
import { CollisionManager } from '../src/utils/Collision.js';
import { FirstPersonControls } from '../src/controls/FirstPerson.js';
import { PlaceCatalog } from '../src/ui/PlaceCatalog.js';
import { library } from './lib/inner-palace-fixture.mjs';
import { replayTerrace, traceTerraceGround } from './lib/terrace-walk.mjs';

// Exercise the raw current ZoneBase build, including its real finish/merge.
// world.mjs intentionally discards zone render geometry, so it is not used here.
const configurations = Object.fromEntries(['outer-east', 'outer-west'].map(id => [id,
  JSON.parse(readFileSync(new URL(`../data/zones/${id}.json`, import.meta.url)))]));
const fixtures = new Map();
const caseEvidence = JSON.parse(readFileSync(new URL('./fixtures/r36-wuying-dated-photo-evidence.json', import.meta.url)));
function capture(court) {
  if (fixtures.has(court)) return fixtures.get(court);
  const zoneId = court === 'wenhua' ? 'outer-east' : 'outer-west';
  const config = configurations[zoneId], builder = new ZoneBase(library(), config);
  const sources = config.items.filter(item => item.southCourtProfile?.startsWith(court + '-'));
  assert.equal(sources.length, 3, 'R36 needs distinct front, link and rear source constituents');
  const furnishingCalls = [], cases = [], exhibitMeshes = [], compositions = [];
  const furnish = builder.kit.furnish;
  builder.kit.furnish = function (frame, preset, room) {
    furnishingCalls.push({ x: frame.position.x, z: frame.position.z, preset });
    return furnish.call(this, frame, preset, room);
  };
  const finish = builder.kit.finish;
  builder.kit.finish = function () {
    this.root.updateMatrixWorld(true);
    this.root.traverse(object => {
      if (object.isMesh && ['wenhua-scroll-support', 'wuying-ceramic-form'].includes(object.userData.role)) {
        assert.ok(object.geometry.attributes.position.count > 0);
        exhibitMeshes.push({ role: object.userData.role, box: new THREE.Box3().setFromObject(object),
          vertices: object.geometry.attributes.position.count, observedClass: object.userData.observedClass,
          metadata: structuredClone(object.userData),
          shape: createHash('sha256').update(Buffer.from(object.geometry.attributes.position.array.buffer)).digest('hex') });
      }
      if (['wuying-independent-case','wuying-exhibit-in-exhibit','wenhua-front-island-wall','wenhua-low-horizontal-case',
        'wenhua-circular-screen','wenhua-rear-circular-display'].includes(object.userData.role)) {
        const components=[];object.traverse(mesh=>{if(mesh.isMesh)components.push({role:mesh.userData.role,
          box:new THREE.Box3().setFromObject(mesh),vertices:mesh.geometry.attributes.position.count});});
        compositions.push({role:object.userData.role,metadata:structuredClone(object.userData),
          box:new THREE.Box3().setFromObject(object),components});
      }
      if (object.userData.role !== `${court}-display-case`) return;
      let meshCount = 0;
      object.traverse(mesh => {
        if (!mesh.isMesh) return;
        meshCount++;
        assert.ok(mesh.geometry.attributes.position.count > 0, 'a case is actual geometry, not an empty label');
        for (const attribute of Object.values(mesh.geometry.attributes)) {
          for (const value of attribute.array) assert.ok(Number.isFinite(value));
        }
      });
      assert.ok(meshCount >= 3, 'independent solid frame/base/glass geometry exists');
      cases.push({ box: new THREE.Box3().setFromObject(object), source: object.userData.source,
        sourceDate: object.userData.sourceDate, metadata: structuredClone(object.userData) });
    });
    return finish.call(this);
  };
  const data = builder.build();
  data.group.updateMatrixWorld(true);
  const cm = new CollisionManager();
  cm.addColliders(data.colliders, zoneId);
  cm.addWalkables(data.walkables, zoneId);
  const result = { THREE, cm, builder, data, config, sources, cases, exhibitMeshes, compositions, furnishingCalls };
  fixtures.set(court, result);
  return result;
}

for (const court of ['wenhua', 'wuying']) {
  test(`R36 ${court}: real merged zone preserves each display and one room/region/map identity per named hall`, () => {
    const { data, sources, cases, furnishingCalls } = capture(court);
    const catalog = new PlaceCatalog();
    assert.ok(cases.length >= 12, 'front, rear and connector contain real display equipment');
    for (const source of sources) {
      const ownCalls = furnishingCalls.filter(call => call.x === source.x && call.z === source.z);
      assert.ok(ownCalls.every(call => call.preset === 'empty'), 'new halls cannot also run old palace-front/hall/throne furniture');
      if (!source.name) continue;
      const rooms = data.rooms.filter(room => room.name === source.name);
      assert.equal(rooms.length, 1, `${source.name}: one real registered room`);
      assert.equal(rooms[0].kind, `${court}-gallery`);
      const room = rooms[0];
      // A named compound region may legitimately share the hall's public name
      // (the retained Wuying courtyard does). Only the exact hall interior
      // rectangle must be registered once; do not erase that larger region.
      assert.equal(data.regions.filter(region => region.name === source.name &&
        Math.abs(region.minX - room.min.x) < 1e-7 && Math.abs(region.maxX - room.max.x) < 1e-7 &&
        Math.abs(region.minZ - room.min.z) < 1e-7 && Math.abs(region.maxZ - room.max.z) < 1e-7).length, 1,
      `${source.name}: generic temporary room must not leave a duplicate location region`);
      const items = data.mapItems.filter(item => item.name === source.name);
      assert.equal(items.length, 1, `${source.name}: one public footprint`);
      assert.equal(catalog.forMapItem(items[0], data.mapItems)?.name, source.name,
        'actual built map footprint, not only raw source name, binds to the preserved card');
    }
    for (const entry of cases) {
      const box = entry.box, center = box.getCenter(new THREE.Vector3());
      const containingRooms = data.rooms.filter(room => room.kind === `${court}-gallery` &&
        box.min.x >= room.min.x - .01 && box.max.x <= room.max.x + .01 &&
        box.min.z >= room.min.z - .01 && box.max.z <= room.max.z + .01 &&
        box.min.y >= room.floorY - .01 && box.max.y <= room.max.y + .01);
      assert.equal(containingRooms.length, 1, 'display must be inside one actual registered gallery, not outdoors or through the ceiling');
      assert.ok(['www.dpm.org.cn','ggzlquanjing.dpm.org.cn'].includes(new URL(entry.source).hostname));
      assert.equal(entry.sourceDate,court==='wenhua'?'2026-09':'2021-05','dated reference period is not an invented photography day');
      assert.equal(entry.metadata.photographyDate,null);
      assert.equal(entry.metadata.newsPublicationDate,court==='wenhua'?'2026-08-31':'2021-04-30');
      assert.equal(entry.metadata.panoramaPackageDate,court==='wenhua'?'2026-09-11':'2021-05-17');
      assert.equal(entry.metadata.actualPeriod,court==='wenhua'?'2026_09_FIRST_PERIOD_STRUCTURE__SECOND_PERIOD_OBJECTS_UNVERIFIED':'2021_OPENING_PANORAMA_NOT_2026_INVENTORY');
      const hits = new THREE.Raycaster(new THREE.Vector3(center.x, box.max.y + .03, center.z),
        new THREE.Vector3(0, -1, 0), 0, .1).intersectObject(data.group, true);
      assert.ok(hits.some(hit => Math.abs(hit.point.y - box.max.y) < .015 &&
        hit.object.material.name.startsWith(`${court}_display_`)),
      'the final merged runtime still contains the captured case top, rather than metadata only');
    }
  });

  for (const fps of [10, 60]) for (const sprint of [false, true]) {
    test(`R36 ${court}: gate/front/link/rear round trip starts once on real ground at ${fps}Hz sprint=${sprint}`, t => {
      const fixture = capture(court), { config, sources, cm } = fixture;
      const gate = config.items.find(item => item.name === (court === 'wenhua' ? '文华门' : '武英门'));
      const front = sources.find(item => item.southCourtProfile.endsWith('-front'));
      const rear = sources.find(item => item.southCourtProfile.endsWith('-rear'));
      const link = sources.find(item => item.southCourtProfile.endsWith('-connector'));
      const entryZ = front.z - front.d / 2;
      // Dated official panoramas show new central obstructions, not an axial
      // empty hall: walk around the front exhibit, use the front round doorway,
      // and skirt Wenhua's non-passable rear circular display on its west side.
      const side = court === 'wenhua' ? 11 : 5;
      const go = court === 'wuying' ? [[gate.x, gate.z - 14], ...wuyingGateToGallery(gate, front), [link.x, link.z], [rear.x, rear.z - 5], [rear.x, rear.z - .5]] : [[gate.x, gate.z - 14], [gate.x, gate.z + 14], [front.x, gate.z + 14],
        [front.x, entryZ - front.pad - front.ph * 1.6 - 1], [front.x, front.z - 6.3],
        [front.x + side, front.z - 6.3], [front.x + side, front.z + 5.7], [front.x, front.z + 5.7],
        [link.x, link.z], [rear.x, rear.z - 5.0],
        ...(court === 'wenhua' ? [[rear.x + 2.3, rear.z - 5.0], [rear.x + 2.3, rear.z - .5]] : []),
        [rear.x, rear.z - .5]];
      const points = [...go, ...go.slice(0, -1).reverse()];
      const placed = t.mock.method(FirstPersonControls.prototype, 'setPosition');
      const trace = traceTerraceGround(cm, { flights: [] });
      let result;
      try { result = replayTerrace(t, fixture, points, { fps, sprint, recordFrames: true }); }
      finally { trace.restore(); }
      assert.equal(placed.mock.callCount(), 1, 'no per-leg teleports or elevated spawns');
      assert.equal(result.startFeet, 0);
      assert.equal(result.arrived, true, JSON.stringify({ stuckAt: result.stuckAt, end: result.end }));
      assert.equal(result.end[2], 0);
      assert.equal(result.driver.crossings.length, points.length - 1);
      assert.equal(trace.samples.some(sample => ['rescue', 'unverified'].includes(sample.source)), false);
      for (const source of sources) {
        const frames = result.frames.filter(frame => Math.abs(frame.x - source.x) < .7 &&
          frame.z > source.z - source.d / 2 + 1 && frame.z < source.z + source.d / 2 - 1);
        assert.ok(frames.length > 0, source.southCourtProfile + ' actual floor visited');
        assert.ok(frames.every(frame => frame.ground >= source.ph - .01 && frame.feet >= source.ph - .2),
          source.southCourtProfile + ' never traversed under the rendered floor');
      }
      assert.ok(result.frames.every(frame => frame.feet >= 0 && frame.feet < 3 &&
        [frame.x, frame.z, frame.feet, frame.ground].every(Number.isFinite)));
    });
  }
}

test('R36 south interiors are actual distinct equipment/composition, not mirrored geometry with different labels', () => {
  const east = capture('wenhua'), west = capture('wuying');
  assert.ok(east.exhibitMeshes.filter(mesh => mesh.role === 'wenhua-scroll-support').length >= 4,
    'photographed narrow pale support tables must have real mesh geometry');
  assert.equal(east.exhibitMeshes.some(mesh => mesh.role === 'wuying-ceramic-form'), false);
  assert.equal(west.exhibitMeshes.some(mesh => mesh.role === 'wenhua-scroll-support'), false);
  const ceramics = west.exhibitMeshes.filter(mesh => mesh.role === 'wuying-ceramic-form');
  const independent = west.compositions.filter(item => item.role === 'wuying-independent-case');
  assert.equal(independent.length, 16, 'the official opening panorama establishes sixteen distinct cases');
  assert.equal(ceramics.length, 16, 'each verified case has one observed form, not random hall-wide furniture');
  assert.ok(new Set(ceramics.map(mesh => mesh.shape)).size >= 12, 'distinct photographed silhouettes must not become one replicated bottle');
  for (const evidence of caseEvidence.cases) {
    const form = ceramics.filter(mesh => mesh.metadata.scene === evidence.scene);
    const cabinet = independent.filter(item => item.metadata.scene === evidence.scene);
    assert.equal(form.length,1,evidence.scene);assert.equal(cabinet.length,1,evidence.scene);
    assert.equal(form[0].metadata.source,evidence.photoFront);
    assert.equal(cabinet[0].metadata.source,evidence.photoFront);
    assert.equal(form[0].metadata.objectIdentity,evidence.objectIdentity,'unidentified vessels cannot gain invented collection identities');
    assert.equal(cabinet[0].metadata.relativePosition,evidence.relativePosition);
    const roomPart=evidence.part==='rear'?'rear':'front';
    const source=west.sources.find(source=>source.southCourtProfile===`wuying-${roomPart}`),box=cabinet[0].box;
    assert.ok(box.min.x>source.x-source.w/2&&box.max.x<source.x+source.w/2&&
      box.min.z>source.z-source.d/2&&box.max.z<source.z+source.d/2,evidence.scene+' remains in its evidenced hall');
    assert.ok(box.containsBox(form[0].box),evidence.scene+' actual vessel lies inside its own real glass cabinet');
    assert.ok(form[0].vertices>24);
  }
  const localShape = fixture => fixture.sources.map(source => ({
    part: source.southCourtProfile.split('-').at(-1), w: source.w, d: source.d,
    relativeZ: source.z - fixture.sources.find(item => item.southCourtProfile.endsWith('-front')).z,
  })).sort((a, b) => a.part.localeCompare(b.part));
  assert.notDeepEqual(localShape(east), localShape(west), 'world position/name changes alone cannot satisfy architectural asymmetry');
});

test('R36 Wuying cabinet topology matches independent photo identities, not camera-map coordinates', () => {
  const f=capture('wuying'),items=f.compositions.filter(item=>item.role==='wuying-independent-case');
  const byId=id=>items.find(item=>item.metadata.scene==='scene_'+id).box.getCenter(new THREE.Vector3());
  assert.ok(byId('d111').x<byId('d103').x&&byId('d112').x<byId('d102').x,'negative X is east');
  assert.ok(byId('d111').z<byId('d112').z&&byId('d103').z<byId('d102').z,'front side cases retain north/south order');
  const row=['58','59','60','61','62'].map(byId);
  assert.ok(row.every((point,i)=>!i||point.x>row[i-1].x),'rear five cases run geographic east to west');
  assert.ok(Math.max(...row.map(p=>p.z))-Math.min(...row.map(p=>p.z))<.05,'rear cases are one transverse row');
  for(const ids of [['d107','d108','d109','d110'],['d104','d105','d106']]){
    const line=ids.map(byId);assert.ok(line.every((point,i)=>!i||point.x<line[i-1].x),'exhibit rows run west to east');
    assert.ok(Math.max(...line.map(p=>p.z))-Math.min(...line.map(p=>p.z))<.05);
  }
  assert.ok(byId('d107').z>byId('d104').z,'four northern / three southern cabinets, not the old five-case design');
  const room=f.data.rooms.find(room=>room.name==='武英殿');
  for(const item of items){
    const glass=item.components.find(c=>c.role==='independent-case-glass');
    const pedestal=item.components.find(c=>c.role==='independent-case-plinth');
    assert.ok(glass&&pedestal&&glass.vertices>0&&pedestal.vertices>0,'separate actual glass and internal pale pedestal');
    assert.ok(glass.box.min.y-room.floorY<.15,'photo glass reaches near floor, not a high solid red cabinet base');
    assert.ok(pedestal.box.max.y>glass.box.min.y+.5);
    const center=item.box.getCenter(new THREE.Vector3());
    assert.ok(new THREE.Raycaster(new THREE.Vector3(center.x,item.box.max.y+.03,center.z),new THREE.Vector3(0,-1,0),0,.1)
      .intersectObject(f.data.group,true).some(hit=>Math.abs(hit.point.y-item.box.max.y)<.015),'real final merged cabinet roof survives');
  }
});

test('R36 Wenhua keeps a physically passable front circle and a physically closed rear circular display', () => {
  const f=capture('wenhua'),screens=f.compositions.filter(item=>item.role==='wenhua-circular-screen'),
    displays=f.compositions.filter(item=>item.role==='wenhua-rear-circular-display');
  assert.equal(screens.length,1);assert.equal(displays.length,1);
  assert.ok(f.compositions.some(item=>item.role==='wenhua-front-island-wall'&&item.components.length>0));
  assert.ok(f.compositions.some(item=>item.role==='wenhua-low-horizontal-case'&&item.components.length>0));
  const floor=f.sources.find(source=>source.southCourtProfile==='wenhua-front').ph;
  const front=screens[0].box.getCenter(new THREE.Vector3()),rear=displays[0].box.getCenter(new THREE.Vector3());
  const forward=new THREE.Vector3(0,0,1);
  const ray=(point,box)=>new THREE.Raycaster(new THREE.Vector3(point.x,floor+1.2,box.min.z-.05),forward,0,box.max.z-box.min.z+.1).intersectObject(f.data.group,true);
  assert.equal(ray(front,screens[0].box).length,0,'front circle has actual empty geometry at pedestrian height');
  assert.ok(ray(rear,displays[0].box).length>0,'rear circular display contains actual glass/backing rather than an empty doorway');
  assert.equal(f.cm.checkCollision(new THREE.Vector3(front.x,floor+1.7,front.z),.45),false);
  assert.equal(f.cm.checkCollision(new THREE.Vector3(rear.x,floor+1.7,rear.z),.45),true);
});

test('R36 actual court walls close every sampled non-gate boundary and meet both dedicated gate ends', () => {
  for(const court of ['wenhua','wuying']){
    const f=capture(court),walls=f.config.items.find(item=>item.kind==='courtWalls'),
      gate=f.config.items.find(item=>item.southGateProfile===court);
    const barriers=f.data.colliders;
    const blocked=(x,z)=>barriers.some(box=>box.containsPoint(new THREE.Vector3(x,2,z)));
    let checked=0;
    for(const side of ['s','n','xmin','xmax']){
      const horizontal=side==='s'||side==='n',lo=horizontal?walls.x0:walls.z0,hi=horizontal?walls.x1:walls.z1;
      const openings=(walls.gates??[]).filter(g=>g.side===side).map(g=>({at:g.at,width:g.w??f.builder.gateWidths.get(g.gate)}));
      for(let along=lo+.2;along<hi;along+=.43){
        if(openings.some(g=>Math.abs(along-g.at)<g.width/2+.15))continue;
        const x=horizontal?along:side==='xmin'?walls.x0:walls.x1,
          z=horizontal?(side==='s'?walls.z0:walls.z1):along;
        assert.equal(blocked(x,z),true,`${court} ${side} wall has an unregistered hole at ${x},${z}`);checked++;
      }
    }
    assert.ok(checked>500);
    // Test both wall-to-gate joints against actual merged rendered geometry,
    // not only a matching AABB or declaration in courtWalls.
    for(const sign of [-1,1])for(const inset of [-.12,.12]){
      const x=gate.x+sign*(gate.w/2+inset),z=gate.z;
      assert.equal(blocked(x,z),true,`${court}: physical wall-to-gate connection`);
      const hits=new THREE.Raycaster(new THREE.Vector3(x,2,z-1),new THREE.Vector3(0,0,1),0,2).intersectObject(f.data.group,true);
      assert.ok(hits.length>0,`${court}: rendered gate end and court wall cannot leave a visible full-height crack`);
    }
    const bay=gate.w/5;
    for(const sign of [-1,1])assert.equal(blocked(gate.x+sign*2*bay,gate.z),true,'outer gate bays remain closed, not five invented portals');
  }
});

test('R36 Wenhua continuous connector displays do not inherit Wuying fire-exit gaps', () => {
  for(const court of ['wenhua','wuying']){
    const f=capture(court),link=f.sources.find(item=>item.southCourtProfile.endsWith('-connector'));
    for(const side of [-1,1]){
      const x=link.x+side*(link.w/2-(court==='wenhua'?.5:.65)-(court==='wenhua'?1.05:.8)/2);
      const point=new THREE.Vector3(x,link.ph+1,link.z);
      const cases=f.cases.filter(item=>item.box.containsPoint(point));
      assert.equal(cases.length,court==='wenhua'?1:0,court+' connector center reflects its own observed equipment, not mirrored generic gaps');
      const hits=new THREE.Raycaster(new THREE.Vector3(x,link.ph+3.8,link.z),new THREE.Vector3(0,-1,0),0,3.9).intersectObject(f.data.group,true);
      const actualCase=hits.some(hit=>hit.object.material.name.startsWith(court+'_display_')&&hit.point.y>link.ph+1);
      assert.equal(actualCase,court==='wenhua','actual merged cabinet surface agrees with the preserved case continuity');
    }
  }
});

for(const fps of [10,60]) test(`R36 Wuying seven-case exhibit remains physically reachable through both photographed side openings at ${fps}Hz`, t => {
  const f=capture('wuying'),front=f.sources.find(i=>i.southCourtProfile==='wuying-front'),{x,z}=front;
  const go=[...wuyingGalleryRoute(front).slice(0,-4),[x,z-5.95],[x+5,z-5.95],
    [x+5,z-1],[x,z-1],[x-5,z-1],[x-5,z-5.95],[x,z-5.95]];
  const points=[...go,...go.slice(0,-1).reverse()];
  const placed=t.mock.method(FirstPersonControls.prototype,'setPosition'),trace=traceTerraceGround(f.cm,{flights:[]});
  let result;
  try{result=replayTerrace(t,f,points,{fps,sprint:true,recordFrames:true});}finally{trace.restore();}
  assert.equal(placed.mock.callCount(),1);placed.mock.restore();
  assert.equal(result.startFeet,0);
  assert.equal(result.arrived,true,JSON.stringify({fps,end:result.end,stuckAt:result.stuckAt}));
  assert.equal(trace.samples.some(p=>['rescue','unverified'].includes(p.source)),false);
  const inside=result.frames.filter(p=>Math.abs(p.x-x)<2.2&&Math.abs(p.z-(z-1))<.3);
  assert.ok(inside.length>0,'not merely a route around an inaccessible seven-case enclosure');
  assert.ok(inside.every(p=>Math.abs(p.feet-front.ph)<.02),'real hall floor supports the exhibit approach');
});

test.after(() => { for (const fixture of fixtures.values()) fixture.builder.dispose(); });
