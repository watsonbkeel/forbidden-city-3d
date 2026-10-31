import test from 'node:test';import assert from 'node:assert/strict';
import {fixture} from '../../lib/r72-player-fixture.mjs';
import {captureGate} from '../../lib/gate-tower-fixture.mjs';
import {createPhysicalWaypointDriver} from '../../lib/physical-waypoints.mjs';
const c=captureGate(),Z=c.data.position.z,FLOOR=12.3;
// The production gate, its colliders and its real non-rescue support are used.
// Four metres means a fall inside the retained lower shell, not from above the roof.
const routes={north:[[0,7],[0,-11.2]],south:[[0,-7],[0,11.2]],east:[[-18,0],[18,0]],west:[[18,0],[-18,0]]};
for(const [side,local]of Object.entries(routes))for(const fps of [10,60])for(const drop of [false,true])test(`Wumen main ${side} ${drop?'4m internal drop and exit':'floor crossing'} at ${fps}Hz uses actual controller and retained support`,t=>{
 const points=local.map(([x,z])=>[x,z+Z]),f=fixture(t);f.cm.addColliders(c.builder.colliders);f.cm.addWalkables(c.builder.walkables);
 assert.ok(f.cm.walkables.filter(w=>w.type==='box').every(w=>w.rescue===false));
 const start=FLOOR+(drop?4:0);f.controls.setPosition(points[0][0],start+1.7,points[0][1]);f.controls.feetY=start;f.controls.groundY=FLOOR;f.controls.airborne=drop;f.controls.verticalVelocity=0;f.camera.position.y=start+1.7;
 const frames=[],check=()=>{const p=f.player().position;frames.push(p);assert.equal(f.cm.checkCollision(new c.THREE.Vector3(p[0],p[1]+1.7,p[2]),.5),false,JSON.stringify({side,fps,drop,p}));};
 for(let i=0;i<fps*3;i++){f.step(1/fps);check();}assert.ok(Math.abs(f.controls.feetY-FLOOR)<1e-6);
 const driver=createPhysicalWaypointDriver(points);f.controls.moveForward=true;
 for(let i=0;i<fps*30&&!driver.complete;i++){
  const before=[f.camera.position.x,f.camera.position.z],command=driver.command(before,true);f.controls.canSprint=command.canSprint;f.camera.lookAt(command.target[0],f.camera.position.y,command.target[1]);f.camera.updateMatrixWorld(true);f.step(1/fps);check();driver.observe(before,[f.camera.position.x,f.camera.position.z]);
 }
 assert.equal(driver.complete,true);assert.ok(Math.abs(f.controls.feetY-FLOOR)<1e-6);assert.ok(frames.every(p=>p[1]>=FLOOR-1e-6));
});
