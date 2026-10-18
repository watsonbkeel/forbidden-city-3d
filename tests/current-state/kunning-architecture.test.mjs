import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import * as THREE from 'three';
import { PalaceBuilder } from '../../src/scene/PalaceBuilder.js';
import { PALACE_LAYOUT } from '../../src/scene/Layout.js';
import { CollisionManager } from '../../src/utils/Collision.js';
import { PLAYER } from '../../src/config/constants.js';

const url = new URL('../../src/scene/palace/special/KunningProfile.js', import.meta.url);
const adapter = existsSync(url) ? await import(url) : null;
const profileURL = new URL('../../data/architecture/kunning.json', import.meta.url);
const profile = existsSync(profileURL) ? JSON.parse(readFileSync(profileURL, 'utf8')) : null;
const ctx = new Proxy({}, { get: () => () => ({ data: [] }), set: () => true });
globalThis.document ??= { createElement: () => ({ getContext: () => ctx, width: 0, height: 0 }) };
const data = PALACE_LAYOUT.find(h => h.name === '坤宁宫');
const floorY = 2.16, z0 = data.position.z, doorX = -5.111111111111111;
let cached;
function fixture() {
  if (cached) return cached;
  const mats = new Map();
  const library = { material: n => mats.get(n) ?? (mats.set(n, new THREE.MeshStandardMaterial({ name:n })), mats.get(n)), tileSize: () => 1, aspect: () => 1 };
  const scene = new THREE.Scene(), builder = new PalaceBuilder(scene, library);
  const group = new THREE.Group();
  builder.buildHall(group, data, floorY);
  builder.walkBox(-23, z0-10, 23, z0+10, floorY);
  const object = builder.finish(group); scene.updateMatrixWorld(true);
  const cm = new CollisionManager(); cm.addColliders(builder.colliders); cm.addWalkables(builder.walkables);
  return cached = {builder, object, scene, cm};
}
function rays(x, z, y = 0.8, dir = 1) {
  const ray = new THREE.Raycaster(new THREE.Vector3(x, floorY+y, z0+z), new THREE.Vector3(0,0,dir), 0, 2.5);
  return ray.intersectObject(fixture().object, true);
}
function blocked(x,z) { return fixture().cm.checkCollision(new THREE.Vector3(x, floorY+PLAYER.HEIGHT,z0+z),.5); }

test('Kunning authoritative profile and adapter exist', () => {
  assert.ok(profile, 'authoritative shared JSON required');
  assert.equal(typeof adapter?.bindKunningProfile, 'function');
});
test('final production triangles close south center and north legacy openings', () => {
  assert.ok(rays(0,-8.5).length, 'south central sill is visible real geometry');
  assert.ok(rays(0,6.5).length, 'north center enclosure is visible real geometry');
  assert.ok(rays(4.7,6.5).length, 'legacy x4.7 rear is closed');
  assert.equal(blocked(0,-7.5),true); assert.equal(blocked(0,7.5),true); assert.equal(blocked(4.7,7.5),true);
});
test('real east-first-secondary doorway and three radius0.5 body tracks remain open', () => {
  for (const x of [doorX-.78,doorX,doorX+.78]) {
    assert.equal(rays(x,-8.5,1.6).length,0, `real mesh doorway at ${x}`);
    for (let z=-8.7;z<=-5.7;z+=.1) assert.equal(blocked(x,z),false,`body-clear ${x},${z}`);
  }
});
test('door is narrower than a full bay; jambs, adjacent sill windows and folded leaves are solid', () => {
  for (const x of [doorX-1.7,doorX+1.7,-10.2222222222,0]) {
    assert.ok(rays(x,-8.5).length,`real enclosure ${x}`);
    assert.equal(blocked(x,-7.5),true,`body enclosure ${x}`);
  }
  for (const x of [doorX-1.47,doorX+1.47]) {
    assert.ok(rays(x,-8.5,1.6).length,`open plank leaf ${x}`);
    assert.equal(blocked(x,-6.8),true);
  }
});
test('recessed south porch and both separate end passages are physically clear', () => {
  for(let x=-20.444;x<=20.444;x+=.2) assert.equal(blocked(x,-8.75),false,`south porch ${x}`);
  for(const x of [-20.444444444,20.444444444]) for(let z=-8.75;z<=8.75;z+=.2) assert.equal(blocked(x,z),false,`end passage ${x},${z}`);
  for(let x=-20.444;x<=20.444;x+=.2) assert.equal(blocked(x,8.75),false,`north porch ${x}`);
  assert.equal(blocked(-23,0),true); assert.equal(blocked(23,0),true);
  assert.equal(blocked(-17.88888889,0),true); assert.equal(blocked(17.88888889,0),true);
});
const profileTest = (name, fn) => test(name,{skip:!profile||!adapter},fn);
profileTest('shared semantic profile counts include passages and retain inherited frame and uncertainty', () => {
  assert.equal(profile.outerBays.length,9); assert.equal(profile.roomBayIds.length,7);
  assert.deepEqual(profile.outerBays.filter(b=>b.role==='passage').map(b=>b.outerIndex),[0,8]);
  assert.deepEqual(['warm','ritual','storage'].map(role=>profile.outerBays.filter(b=>b.role===role).length),[2,4,1]);
  const door=profile.portals.find(p=>p.id==='south-east-first-secondary');
  assert.equal(door.outerBayId,profile.outerBays[3].id); assert.equal(profile.roomBayIds.indexOf(door.outerBayId),2);
  assert.equal(profile.outerBays[4].south,'window'); assert.equal(profile.frameExpectation.floorY,floorY);
  assert.deepEqual(profile.frameExpectation,{x:0,z:386.1,rot:0,floorY});
  assert.equal(profile.modelEnvelope.provenance,'inherited-provisional');
  assert.ok(profile.provenance.unknowns.includes('complete-reduced-column-map'));
});
profileTest('bay lookup supports explicit nonuniform coordinates without re-deriving width/9', () => {
  const changed=structuredClone(profile); changed.outerXLines=[-23,-19,-14,-8,-3,3,8,14,19,23];
  const bay=adapter.kunningBay(changed.outerBays[3].id,changed);
  assert.deepEqual([bay.minX,bay.maxX,bay.centerX],[-8,-3,-5.5]);
  assert.equal(adapter.kunningBay(changed.outerBays[0].id,changed).role,'passage');
});
profileTest('profile identity is a canonical SHA256 shared by both asset consumers', () => {
  const canonical = value => value && typeof value==='object' ? Array.isArray(value) ? value.map(canonical) : Object.fromEntries(Object.keys(value).sort().map(k=>[k,canonical(value[k])])) : value;
  const copy=structuredClone(profile); delete copy.profileHash;
  const hash=createHash('sha256').update(JSON.stringify(canonical(copy))).digest('hex');
  assert.equal(profile.profileHash,hash);
});
profileTest('builder preserves parent offsets, shares world transform once, and retains fixed-open portal metadata', () => {
  const record=fixture().object.userData.architecture.find(r=>r.id==='kunninggong');
  assert.equal(record.profileHash,profile.profileHash);
  assert.equal(record.portals.find(p=>p.id==='south-east-first-secondary').state,'fixed-open-provisional');
  assert.equal(fixture().builder.ox,0); assert.equal(fixture().builder.oz,0);
  assert.throws(()=>adapter.bindKunningProfile({...data, position:{...data.position,z:z0+1}},floorY),/frame/i);
  assert.throws(()=>adapter.bindKunningProfile(data,floorY+.1),/floor/i);
});

profileTest('nonuniform resolved profile drives real B doorway and barriers rather than an envelope/9 copy', async () => {
  const { buildKunningPalace } = await import('../../src/scene/palace/special/KunningPalace.js');
  const changed=structuredClone(profile), old=profile.outerXLines, next=[-23,-19,-14,-8,-3,3,8,14,19,23];
  const mapX=x=>{
    let i=old.findIndex((v,j)=>j<old.length-1 && x>=v && x<=old[j+1]);
    if(i<0)i=x<old[0]?0:old.length-2;
    return next[i]+(x-old[i])/(old[i+1]-old[i])*(next[i+1]-next[i]);
  };
  // This is a fully resolved test JSON, as a future authoritative nonuniform
  // profile would be. Consumers must use its explicit bounds/positions.
  function remap(value){
    if(!value || typeof value!=='object')return;
    if(value.min && value.max){value.min[0]=mapX(value.min[0]);value.max[0]=mapX(value.max[0]);}
    for(const k of ['position','center'])if(Array.isArray(value[k]))value[k][0]=mapX(value[k][0]);
    for(const [k,v]of Object.entries(value))if(!['min','max','position','center'].includes(k))remap(v);
  }
  remap(changed); changed.outerXLines=next;
  const {builder}=fixture(), group=new THREE.Group(), before=builder.colliders.length;
  buildKunningPalace(builder,group,data,floorY,changed);
  const object=builder.finish(group);object.updateMatrixWorld(true);
  const cm=new CollisionManager();cm.addColliders(builder.colliders.slice(before));
  const portal=changed.portals[0], cx=portal.center[0];
  assert.ok(Math.abs(cx+5.5)<1e-6);
  for(const x of [cx-.7,cx,cx+.7]){
    assert.equal(cm.checkCollision(new THREE.Vector3(x,floorY+PLAYER.HEIGHT,z0-7.5)),false);
    const ray=new THREE.Raycaster(new THREE.Vector3(x,floorY+1.6,z0-8.7),new THREE.Vector3(0,0,1),0,3);
    assert.equal(ray.intersectObject(object,true).length,0);
  }
  assert.equal(cm.checkCollision(new THREE.Vector3(portal.clearBounds.min[0]-.2,floorY+PLAYER.HEIGHT,z0-7.5)),true);
});

profileTest('straight window bars and outward upper flaps survive the final material merge', () => {
  const {object,cm}=fixture();
  for(const w of profile.windows){
    const cx=(w.bounds.min[0]+w.bounds.max[0])/2,cz=(w.bounds.min[2]+w.bounds.max[2])/2;
    assert.ok(rays(cx,-8.5,2.3).length,`${w.id}: actual central vertical bar`);
    assert.equal(cm.checkCollision(new THREE.Vector3(cx,floorY+PLAYER.HEIGHT+1.25,z0+cz)),true,'bars block a raised/jumping body');
    const h=w.bounds.max[1]-w.lowerTop;
    const z=cz-Math.sin(w.flapAngleRadians)*h/2;
    const expectedY=floorY+w.bounds.max[1]-Math.cos(w.flapAngleRadians)*h/2;
    const ray=new THREE.Raycaster(new THREE.Vector3(cx,floorY+5.5,z0+z),new THREE.Vector3(0,-1,0),0,2);
    const hits=ray.intersectObject(object,true);
    assert.ok(hits.some(hit=>Math.abs(hit.point.y-expectedY)<.15),'raised panel is real geometry south of the enclosure');
    assert.ok(z<profile.depthPlanes.southEnclosure-.5);
  }
});

profileTest('inherited provisional post list preserves all V5 positions and radii exactly without claiming a surveyed grid', () => {
  assert.equal(profile.columns.length,40);
  for(let i=0;i<=9;i++)for(let k=0;k<=3;k++){
    const post=profile.columns[i*4+k];
    assert.deepEqual(post.position,[-23+i*(46/9),0,-10+k*(20/3)]);
    assert.equal(post.radius,(46/9)*.08);
    assert.equal(post.height,(26-6.9375)*.38);
    assert.equal(post.provenance,'inherited-provisional');
    assert.equal(z0+post.position[2],z0-10+k*(20/3),'world addition remains identical');
  }
});

profileTest('door jambs close the narrow upper transom-side gaps in actual final triangles', () => {
  for(const id of ['south-door-east-jamb','south-door-west-jamb']){
    const jamb=profile.barriers.find(b=>b.id===id),x=(jamb.bounds.min[0]+jamb.bounds.max[0])/2;
    for(const [z,dir]of[[-8.5,1],[-6.5,-1]]){
      const hits=rays(x,z,4.5,dir);
      assert.ok(hits.some(h=>Math.abs(h.point.z-(z0+profile.depthPlanes.southEnclosure))<.3),`${id} upper join must be solid`);
    }
  }
});
profileTest('recessed south and north room enclosure meets the inherited ceiling, without an open top strip', () => {
  for(const [z,dir]of[[-8.5,1],[-6.5,-1],[6.5,1],[8.5,-1]]){
    const wallZ=z<0?profile.depthPlanes.southEnclosure:profile.depthPlanes.northEnclosure;
    const hits=rays(0,z,6.8,dir);
    assert.ok(hits.some(h=>Math.abs(h.point.z-(z0+wallZ))<.3),'room wall top must close to the ceiling rather than the unrelated eave beam');
  }
});
