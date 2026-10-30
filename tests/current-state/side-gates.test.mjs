import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import * as THREE from 'three';
import { CourtKit, FACE } from '../../src/scene/palace/kit.js';
import { ZoneBase } from '../../src/scene/zones/ZoneBase.js';
import { CollisionManager } from '../../src/utils/Collision.js';
import { buildWorld } from '../lib/world.mjs';
const url = new URL('../../src/scene/palace/special/SideGateProfiles.js', import.meta.url);
const profiles = existsSync(url) ? await import(url) : {};
const ctx = new Proxy({}, { get: () => () => ({ data: [] }), set: () => true });
globalThis.document ??= { createElement: () => ({ getContext: () => ctx, width: 0, height: 0 }), createElementNS: () => ({ addEventListener() {}, removeEventListener() {} }) };
const axis = JSON.parse(readFileSync(new URL('../../data/zones/axis-courts.json', import.meta.url)));
const names = ['协和门', '熙和门', '景运门', '隆宗门'];
const ids = ['xiehe', 'xihe', 'jingyun', 'longzong'];
const nodes = (root, role) => { const out = []; root.traverse(o => { if (o.userData.role === role) out.push(o); }); return out; };
function library() {
  const materials = new Map();
  return { materials, material: n => materials.get(n) ?? (materials.set(n, new THREE.MeshStandardMaterial({name:n})), materials.get(n)), tileSize: () => 1, aspect: () => 1 };
}
function fixture(id, rot = FACE.south, open = true) {
  assert.equal(typeof profiles.sideGateGeometry, 'function', 'explicit profile geometry export is required');
  const lib = library(), kit = new CourtKit(lib);
  const opts = {x:0,z:0,rot,gateKind:'five-bay',gateProfile:id,open,plaque:false};
  const g = profiles.sideGateGeometry(opts);
  const width = kit.gate(opts);
  const frame = kit.root.children[0]; frame.updateMatrixWorld(true);
  const cm = new CollisionManager(); cm.rivers=[]; cm.addColliders(kit.colliders); cm.addWalkables(kit.walkables);
  const world = (x,z) => g.toWorld(x,z);
  const blocked = (x,z,y=g.platformY) => {const [wx,wz]=world(x,z); return cm.checkCollision(new THREE.Vector3(wx,y+1.7,wz),0.5);};
  return {kit,lib,g,width,frame,cm,world,blocked};
}
function walk(f, a, b) {
  const aa=f.world(...a), bb=f.world(...b);
  let feet=0, p=new THREE.Vector3(aa[0],1.7,aa[1]);
  const n=Math.ceil(Math.hypot(bb[0]-aa[0],bb[1]-aa[1])/.1);
  for(let i=1;i<=n;i++) {
    const next=new THREE.Vector3(aa[0]+(bb[0]-aa[0])*i/n,p.y,aa[1]+(bb[1]-aa[1])*i/n);
    p=f.cm.getValidPosition(p,next,.5,feet,.6);
    assert.ok(Math.abs(f.cm.lastGroundY-feet)<.1,'ramp/platform height must be continuous, not rescued upward'); feet=f.cm.lastGroundY;
  }
  assert.ok(Math.hypot(p.x-bb[0],p.z-bb[1])<.05,`blocked before ${b}: ${p.toArray()}`);
  assert.ok(Math.abs(feet)<1e-6,'descend to ground');
}

test('four records explicitly dispatch independent five-bay profiles and preserve their anchors',()=>{
  const anchors=[[-106.47,-300.3,'east'],[110.7,-301.1,'west'],[-106.47,174.1,'east'],[110.7,173.7,'west']];
  names.forEach((name,i)=>{const item=axis.items.find(o=>o.name===name);assert.equal(item.gateKind,'five-bay');assert.equal(item.gateProfile,ids[i]);assert.deepEqual([item.x,item.z,item.rot],anchors[i]);});
});
for(const id of ids) {
  test(`${id}: five timber bays, three portals, end windows and no full-depth masonry piers`,()=>{
    const {frame,g,blocked}=fixture(id);
    assert.equal(g.bayWidths.length,5); assert.equal(g.portals.length,3);
    assert.equal(nodes(frame,'gate-window').length,id==='xiehe'?2:4);
    if(id==='xiehe')assert.equal(nodes(frame,'xiehe-east-end-wall').length,2);
    assert.equal(nodes(frame,'gate-column').length>=18,true);
    for(const p of g.portals) for(const z of [-g.depth/2,0,g.depth/2]) assert.equal(blocked(p.centerX,z),false);
    for(const x of [g.bayCenters[0],g.bayCenters[4]]) for(const z of [-g.depth/2,g.depth/2]) assert.equal(blocked(x,z),true);
    const between=g.columnXs[2]; assert.equal(blocked(between,-g.depth*.38),false,'front shared vestibule must not become a masonry tunnel');
    assert.equal(nodes(frame,'side-gate-roof').length,1); assert.equal(frame.userData.structure.eaveCount,1);
    assert.equal(frame.userData.structure.dimensions.status,'provisional');
  });
  test(`${id}: all three actual geometric clearances and door-leaf collisions survive merging`,()=>{
    const f=fixture(id); const {g,kit,frame,blocked}=f;
    for(const leaf of nodes(frame,'gate-door-leaf')) assert.equal(blocked(leaf.position.x,leaf.position.z),true);
    const merged=kit.finish(); merged.updateMatrixWorld(true);
    for(const p of g.portals) for(const sign of [-1,1]) {
      const ray=new THREE.Raycaster(new THREE.Vector3(p.centerX,g.platformY+1.2,sign*(g.depth/2+1)),new THREE.Vector3(0,0,-sign));
      ray.far=g.depth+2;
      assert.equal(ray.intersectObject(merged,true).length,0,'visual aperture must match collision aperture');
    }
    assert.equal(merged.userData.architecture[0].portalCount,3);
    assert.equal(merged.userData.architecture[0].profile,id);
    kit.dispose(merged);
  });
  test(`${id}: three doors close independently of the persistent openings`,()=>{
    const f=fixture(id,0,false); for(const p of f.g.portals) assert.equal(f.blocked(p.centerX,f.g.doorZ),true);
    assert.equal(nodes(f.frame,'gate-door-leaf').length,6);
  });
  test(`${id}: all portals and both ramps walk continuously in all four cardinal orientations`,()=>{
    for(const rot of Object.values(FACE)) {
      const f=fixture(id,rot);const front=f.g.ramps[0].zToe-1,rear=f.g.ramps[1].zToe+1;
      for(const x of f.g.portalCenters) {walk(f,[x,front],[x,rear]);walk(f,[x,rear],[x,front]);}
    }
  });
  test(`${id}: real ramp solids match exact tapered walk boundaries at all cardinal rotations`,()=>{
    for(const rot of Object.values(FACE)) {
      const f=fixture(id,rot);
      assert.equal(nodes(f.frame,'gate-ramp-solid').length,2);
      // Exact ramp outlines are independent of later real rail-top support.
      // Keep the old 3cm-outside boundary assertion on the actual walkables.
      const rampOnly=new CollisionManager();rampOnly.rivers=[];rampOnly.addWalkables(f.kit.walkables);
      for(const ramp of f.g.ramps) for(const t of [.1,.5,.9]) {
        const z=ramp.zTop+(ramp.zToe-ramp.zTop)*t;
        const left=ramp.leftTop+(ramp.leftToe-ramp.leftTop)*t,right=ramp.rightTop+(ramp.rightToe-ramp.rightTop)*t;
        // Straddle the boundary by 10 micrometres; exact rotated endpoints
        // inherit sub-ulp matrix/broadphase rounding, not a widened ramp.
        const rampY=ramp.yTop*(1-t);
        for(const [x,expected] of [[left-.03,0],[right+.03,0],[left-1e-5,0],[right+1e-5,0],[left+1e-5,rampY],[right-1e-5,rampY],[(left+right)/2,rampY]]) {
          const [wx,wz]=f.world(x,z);assert.ok(Math.abs(rampOnly.getGroundHeight(wx,wz,f.g.platformY)-expected)<1e-6,'outside flared wing is never phantom walkable');
          const actual=f.cm.getGroundHeight(wx,wz,f.g.platformY);
          if(actual>expected+1e-6){
            const contact=f.cm.supportContact(wx,wz,f.g.platformY+.6);
            assert.ok(id==='xiehe'&&ramp.side==='front'&&contact?.instanceId.startsWith('xiehe-east-rail:'),'outside ramp support requires its actual visible east rail');
            assert.ok(Math.abs(actual-contact.height)<1e-6&&Math.hypot(wx-contact.witness.x,wz-contact.witness.z)<=.300001,'positive height has an exact foot witness, not a rail bounding-box top');
          }else assert.ok(Math.abs(actual-expected)<1e-6);
        }
        for(const offset of[.441,.7])for(const x of[left-offset,right+offset]){
          const [wx,wz]=f.world(x,z);assert.equal(f.cm.getGroundHeight(wx,wz,f.g.platformY),0,'beyond both the actual rail and foot disk remains ground');
        }
        const [wx,wz]=f.world((left+right)/2,z);
        const ray=new THREE.Raycaster(new THREE.Vector3(wx,10,wz),new THREE.Vector3(0,-1,0));
        const hit=ray.intersectObjects(nodes(f.frame,'gate-ramp-solid'))[0];
        assert.ok(hit);assert.ok(Math.abs(hit.point.y-ramp.yTop*(1-t))<1e-5);
      }
    }
  });
}

test('independent evidence dimensions and correct courtyard flare directions are retained',()=>{
  const x=fixture('xiehe').g, h=fixture('xihe').g, j=fixture('jingyun').g,l=fixture('longzong').g;
  assert.equal(x.platformY,2.62);assert.equal(h.platformY,2.62);
  for(const g of [x,h]) for(const r of g.ramps) assert.equal(Math.abs(r.zToe-r.zTop),17.75);
  assert.equal(x.ramps[1].rightToe-x.ramps[1].leftToe,29.9);
  assert.ok(x.ramps[1].rightToe>x.ramps[1].rightTop,'east-facing gate local +X is south');
  assert.equal(x.ramps[1].leftToe,x.ramps[1].leftTop);
  assert.notEqual(h.ramps[1].rightToe-h.ramps[1].leftToe,29.9);
  assert.ok(h.ramps[1].leftToe<h.ramps[1].leftTop,'west-facing gate local -X is south');
  assert.equal(h.doorZ,h.ridgeZ); assert.ok(j.doorZ>0&&l.doorZ>0);
  for(const g of [j,l]) {assert.ok(g.platformY<1);assert.equal(g.railings,false);assert.equal(g.depthBays,null);}
  assert.equal(x.ridgeAbovePlatform,11.43);assert.notEqual(h.ridgeAbovePlatform,11.43);
  assert.equal(nodes(fixture('xihe').frame,'gate-side-door').length,1);
  for(const id of ['xiehe','jingyun','longzong'])assert.equal(nodes(fixture(id).frame,'gate-side-door').length,0);
});

test('finite geometry, shared materials, ownership disposal, and complete gate metadata survive CourtKit.finish',()=>{
  const f=fixture('xiehe'), watched=new Map();
  const watch=o=>{watched.set(o,0);o.addEventListener('dispose',()=>watched.set(o,watched.get(o)+1));};
  f.frame.traverse(o=>{if(o.geometry&&!watched.has(o.geometry))watch(o.geometry);});
  const source=[...watched.keys()];for(const m of f.kit.owned)watch(m);
  const shared=[...f.lib.materials.values()];for(const m of shared)watch(m);
  const merged=f.kit.finish();
  for(const o of source)assert.equal(watched.get(o),1,'each source geometry disposed once');
  assert.ok(merged.children.length<=17,'shared material budget: retained 13 plus two vestibule and two visible roof finishes');
  for(const mesh of merged.children){for(const a of Object.values(mesh.geometry.attributes))for(const n of a.array)assert.ok(Number.isFinite(n));watch(mesh.geometry);}
  f.kit.dispose(merged);
  for(const m of shared)assert.equal(watched.get(m),0,'library materials remain owned by library');
  for(const m of f.kit.owned)assert.equal(watched.get(m),1);
  for(const mesh of merged.children)assert.equal(watched.get(mesh.geometry),1);
  assert.equal(merged.userData.architecture[0].ramps.length,2);
  assert.equal(merged.userData.architecture[0].portals.length,3);
});

test('full axis zone cuts each wall and map to the real gate width, with only four adjacent corridor endpoints adjusted',()=>{
  const zone=new ZoneBase(library(),axis);zone.kit.finish=()=>new THREE.Group();const built=zone.build();
  for(const name of names) {
    const item=axis.items.find(o=>o.name===name),g=profiles.sideGateGeometry(item);
    assert.equal(zone.gateWidths.get(name),g.width);
    const m=built.mapItems.find(o=>o.name===name);assert.equal(m.d,g.width);assert.equal(m.w,g.depth);
    const frame=zone.kit.root.children.find(f=>f.userData.structure?.profile===item.gateProfile);
    assert.equal(frame.userData.structure.facing,item.rot);
  }
  const c=axis.items.filter(o=>o.kind==='corridor');assert.equal(c.length,16);
  const xe=profiles.sideGateGeometry(axis.items[0]),xi=profiles.sideGateGeometry(axis.items[1]);
  assert.ok(Math.abs(c[0].to[1]-(axis.items[0].z-xe.width/2-.6))<1e-9);assert.ok(Math.abs(c[1].from[1]-(axis.items[0].z+xe.width/2+.6))<1e-9);
  assert.ok(Math.abs(c[6].to[1]-(axis.items[1].z-xi.width/2-.6))<1e-9);assert.ok(Math.abs(c[7].from[1]-(axis.items[1].z+xi.width/2+.6))<1e-9);
});

test('full scene collision construction retains every three-passage side gate',async()=>{
  const W=await buildWorld();assert.ok(W.cm.colliders.length>0);
  for(const name of names) {
    const item=axis.items.find(o=>o.name===name),g=profiles.sideGateGeometry(item);
    for(const p of g.portals)for(const z of [-g.depth/2,0,g.depth/2]) {
      const [x,wz]=g.toWorld(p.centerX,z);assert.equal(W.cm.checkCollision(new THREE.Vector3(x,g.platformY+1.7,wz),.5),false,`${name}: ${p.centerX},${z}`);
    }
  }
});

test('Xiehe main ridge cap uses the platform datum while the grey base remains an additional 2.62 m',()=>{
  const f=fixture('xiehe');
  const ray=new THREE.Raycaster(new THREE.Vector3(0,30,0),new THREE.Vector3(0,-1,0));
  const hits=ray.intersectObject(nodes(f.frame,'side-gate-roof')[0],true).filter(hit=>hit.object.material===f.kit.ridge);
  assert.ok(hits.length>0);assert.ok(Math.abs(hits[0].point.y-(2.62+11.43))<1e-5);
  assert.equal(f.frame.userData.structure.dimensions.verified.ridgeAbovePlatform,11.43);
});

test('high-gate railings follow flared edges and block sideways exits without closing any passage',()=>{
  for(const id of ['xiehe','xihe']) {
    const f=fixture(id),r=f.g.ramps[1],t=.5,z=(r.zTop+r.zToe)/2;
    for(const edge of ['left','right']) {
      const x=(r[edge+'Top']+r[edge+'Toe'])/2;
      assert.equal(f.blocked(x,z,r.yTop*(1-t)),true);
    }
    assert.ok(nodes(f.frame,'gate-railing-bar').length>=12);
  }
});

test('ramp wedges reject ground-level body penetration and platform sides never rescue visitors upward',()=>{
 for(const id of ['xiehe','xihe'])for(const rot of Object.values(FACE)) {
  const f=fixture(id,rot);
  for(const r of f.g.ramps) {
   const z=r.zTop+(r.zToe-r.zTop)*.4;
   assert.equal(f.blocked(0,z,0),true,'solid under the elevated ramp must block a ground-level body');
  }
  const [cx,cz]=f.world(0,0);assert.equal(f.cm.getGroundHeight(cx,cz,0),0,'a high platform is not a teleport surface');
  const a=f.world(f.g.platformWidth/2+1.5,0),b=f.world(0,0);
  let p=new THREE.Vector3(a[0],1.7,a[1]),feet=0;
  for(let i=0;i<100;i++) {
   const target=new THREE.Vector3(p.x+(b[0]-a[0])/100,p.y,p.z+(b[1]-a[1])/100);
   p=f.cm.getValidPosition(p,target,.5,feet,.6);feet=f.cm.lastGroundY;
   assert.equal(feet,0,'side ingress must not jump to the platform');
  }
  assert.ok(Math.hypot(p.x-b[0],p.z-b[1])>f.g.width/2,'ground-level side entry stops outside');
 }
});

test('explicit malformed side profiles never fall back to legacy gate geometry',()=>{
 for(const gateProfile of ['',null,false,0,'missing','__proto__','constructor',{}]) {
  const opts={x:0,z:0,gateKind:'five-bay',gateProfile,plaque:false};
  const kit=new CourtKit(library());assert.throws(()=>kit.gate(opts),/profile/i);assert.equal(kit.root.children.length,0);
  const zone=new ZoneBase(library(),{id:'invalid',items:[]});assert.throws(()=>zone.buildGate(opts),/profile/i);assert.equal(zone.kit.root.children.length,0);
  assert.throws(()=>profiles.sideGateGeometry(opts),/profile/i);
 }
 const legacy=new CourtKit(library());assert.equal(legacy.gate({x:0,z:0,w:18,gateKind:'five-bay',gateProfile:undefined,name:''}),18);
});

test('dedicated side gates reject malformed and noncardinal rotations before creating geometry',()=>{
 for(const rot of ['bad','',NaN,Infinity,-Infinity,Math.PI/4,0.01,null,false,{}]) {
  const opts={x:0,z:0,gateKind:'five-bay',gateProfile:'xiehe',rot,plaque:false};
  const kit=new CourtKit(library());assert.throws(()=>kit.gate(opts),/rotation/i);assert.equal(kit.root.children.length,0);
  const zone=new ZoneBase(library(),{id:'invalid',items:[]});assert.throws(()=>zone.buildGate(opts),/rotation/i);assert.equal(zone.kit.root.children.length,0);
  assert.throws(()=>profiles.sideGateGeometry(opts),/rotation/i);
 }
 for(const rot of [...Object.keys(FACE),...Object.values(FACE),2*Math.PI,-2*Math.PI]) {
  const g=profiles.sideGateGeometry({gateProfile:'xiehe',rot});assert.ok(g.toWorld(1,2).every(Number.isFinite));
 }
 const legacy=new ZoneBase(library(),{id:'legacy',items:[]});
 assert.equal(legacy.buildGate({x:0,z:0,w:18,gateKind:'five-bay',name:''}),18);
});

test('cardinal overrides record actual facing separately from the source-facing evidence',()=>{
 for(const [facing,rot] of Object.entries(FACE))for(const id of ['xiehe','xihe']) {
  const f=fixture(id,rot);assert.equal(f.frame.userData.structure.facing,facing);
  assert.equal(f.frame.userData.structure.sourceFacing,id==='xiehe'?'east':'west');
 }
});

test('omitted dedicated transforms agree between profile, CourtKit and ZoneBase defaults',()=>{
 for(const id of ids) {
  const opts={gateKind:'five-bay',gateProfile:id,plaque:false};
  const g=profiles.sideGateGeometry(opts),kit=new CourtKit(library());kit.gate(opts);
  const zone=new ZoneBase(library(),{id:'defaults',items:[]});zone.buildGate(opts);
  for(const root of [kit.root,zone.kit.root]) {
   const f=root.children[0];assert.deepEqual(f.position.toArray(),[0,0,0]);assert.equal(f.rotation.y,g.rot);
   assert.deepEqual(f.userData.structure.portals[0].front,{x:g.toWorld(g.portals[0].centerX,-g.depth/2)[0],y:g.platformY,z:g.toWorld(g.portals[0].centerX,-g.depth/2)[1]});
  }
 }
});

test('dedicated side gates reject nonfinite and nonnumeric placement before creating geometry',()=>{
 for(const key of ['x','z'])for(const value of [NaN,Infinity,-Infinity,'0',null,false,{}]) {
  const opts={x:0,z:0,gateKind:'five-bay',gateProfile:'xiehe',plaque:false,[key]:value};
  assert.throws(()=>profiles.sideGateGeometry(opts),/position/i);
  const kit=new CourtKit(library());assert.throws(()=>kit.gate(opts),/position/i);assert.equal(kit.root.children.length,0);
  const zone=new ZoneBase(library(),{id:'invalid',items:[]});assert.throws(()=>zone.buildGate(opts),/position/i);assert.equal(zone.kit.root.children.length,0);
 }
});
