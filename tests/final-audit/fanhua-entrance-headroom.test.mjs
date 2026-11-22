import test from 'node:test';
import assert from 'node:assert/strict';
import {Raycaster, Vector3} from 'three';
import {PLAYER} from '../../src/config/constants.js';
import {fixture as fanhua} from '../r164-fanhua-stair-contact/fixture.mjs';
import {fixture as player} from '../lib/r72-player-fixture.mjs';

for (const fps of [10, 60]) for (const [z, rayZ, role] of [
  // First position is just outside the overhang: the front of a 1 m-wide
  // player intersects the beam, even though a ray from the centre misses it.
  [506.4, 506.75, 'eave-beam'], [508.6, 508.6, 'upper-floor-slab']
]) test(`Fanhua entrance: a ${fps}Hz jump respects the rendered ${role} at z=${z}`, t => {
  const a=fanhua(), cleanup=[()=>a.dispose()];
  const p=player({after:fn=>cleanup.push(fn)});
  const c=new p.controls.constructor(p.camera.clone(),p.controls.domElement,a.cm);
  cleanup.push(()=>c.dispose()); t.after(()=>{for(const fn of cleanup.reverse())fn();});
  const x=-340;
  a.f.updateWorldMatrix(true,true);
  const ray=new Raycaster(new Vector3(x,2,rayZ),new Vector3(0,1,0));
  const solids=[];a.f.traverse(m=>{if(m.isMesh&&m.userData.role===role)solids.push(m);});
  const hit=ray.intersectObjects(solids,false)[0];assert.equal(hit?.object.userData.role,role);
  const underside=hit.point.y;
  const tick=()=>{p.step(1/fps);c.update();};
  function jump(atZ,feet) {
    c.setPosition(x,feet+PLAYER.HEIGHT,atZ);
    for(let i=0;i<fps;i++)tick();
    assert.ok(Math.abs(c.feetY-feet)<.00001);
    c.jump();let peak=0,overlaps=0;
    for(let i=0;i<fps*3;i++){
      tick();const eye=new Vector3(c.camera.position.x,c.feetY+PLAYER.HEIGHT,c.camera.position.z);
      peak=Math.max(peak,eye.y);if(a.cm.checkCollision(eye,.5))overlaps++;
    }
    assert.ok(!c.airborne&&Math.abs(c.feetY-feet)<.00001);
    return {peak,overlaps};
  }
  const under=jump(z,.5),outside=jump(505.55,.4);
  t.diagnostic(JSON.stringify({z,fps,role,underside,...under,outside}));
  assert.ok(under.peak<=underside+.00001&&under.peak>=underside-.01,'jump reaches but cannot enter the physical underside');
  assert.equal(under.overlaps,0);
  assert.ok(outside.peak>3.55);assert.equal(outside.overlaps,0);
});

test('Fanhua entrance sweeps are exactly the two physical volumes, not a ceiling over the six openings', t=>{
 const a=fanhua();t.after(()=>a.dispose());
 // No head stop may leak a millimetre outside either side of these physical
 // footprints. The head remains free inside every old vertical floor opening.
 const up=(x,z)=>a.cm.limitUpwardFeet(x,z,.5,2.4,.5,PLAYER.HEIGHT);
 const holes=a.p.floorVoids;assert.equal(holes.length,6);
 for(const h of holes){
  const x=a.item.x+h.x,z=a.item.z+h.z;
  assert.equal(up(x,z),2.4,'no new upward stop inside a floor opening');
 }
 assert.equal(up(-340,506.109),2.4,'just beyond the .5m beam contact zone');
 assert.ok(Math.abs(up(-340,506.111)+PLAYER.HEIGHT-3.409)<1e-6,'body footprint, not centre ray, clips eave');
 assert.equal(up(-340,505.55),2.4);
 assert.ok(Math.abs(up(-340,508.6)+PLAYER.HEIGHT-3.669)<1e-6);
 for(const z of [506.4,508.6]){
  assert.equal(a.cm.checkCollision(new Vector3(-340,.5+PLAYER.HEIGHT,z),.5),false,'ordinary standing and walking remain clear below each volume');
  assert.equal(a.cm.limitUpwardFeet(-340,z,4,4.2,.5,PLAYER.HEIGHT),4.2,'a body already above the floor is not pulled down');
 }
 assert.equal(a.p.upperNavigation,'VIEW_ONLY_EXTERNAL_CONNECTION_UNFITTED');
});
