import test from 'node:test';import assert from 'node:assert/strict';
import {fixture} from '../../lib/r72-player-fixture.mjs';import {captureGate} from '../../lib/gate-tower-fixture.mjs';
const c=captureGate(),FLOOR=12.3,oldX=60.05/18,newX=(60.05/9.43)*1.43/2,radius=(60.05/9*.06)*1.05;
for(const fps of [10,60])for(const side of [-1,1])for(const sprint of [false,true])for(const mode of ['new-axis-blocked','old-axis-clear','near-edge-clear'])test(`Wumen width ${mode} side${side} ${fps}Hz ${sprint?'run':'walk'} uses real controller and raw colliders`,t=>{
 const f=fixture(t);f.cm.addColliders(c.builder.colliders);f.cm.addWalkables(c.builder.walkables);
 const x=side*(mode==='old-axis-clear'?oldX:mode==='near-edge-clear'?newX+.5+radius+.025:newX),z=c.data.position.z+11.2;
 f.controls.setPosition(x,FLOOR+1.7,z);f.controls.feetY=FLOOR;f.controls.groundY=FLOOR;f.controls.airborne=false;f.controls.verticalVelocity=0;
 f.camera.lookAt(x,FLOOR+1.7,z+10);f.camera.updateMatrixWorld(true);f.controls.moveForward=true;f.controls.canSprint=sprint;let frames=0;
 for(let i=0;i<fps*3&&f.camera.position.z<z+3.3;i++){
  f.step(1/fps);frames++;const p=f.player().position;
  assert.equal(f.cm.checkCollision(new c.THREE.Vector3(p[0],p[1]+1.7,p[2]),.5),false,`body overlap ${mode} frame${i}`);
  assert.ok(Math.abs(p[1]-FLOOR)<1e-6,'actual retained platform contact');
 }
 assert.ok(frames>0);assert.ok(Math.abs(f.camera.position.x-x)<1e-6);
 if(mode==='new-axis-blocked')assert.ok(f.camera.position.z<c.data.position.z+12.5,'new actual shaft blocks travel');
 else assert.ok(f.camera.position.z>=z+3.3,'released old axis / tangent route reaches target');
});
