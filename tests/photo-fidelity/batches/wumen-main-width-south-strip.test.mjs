import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {fixture} from '../../lib/r72-player-fixture.mjs';
import {captureGate} from '../../lib/gate-tower-fixture.mjs';
import {expectedWidthRows} from '../../lib/wumen-main-width-contract.mjs';
const c=captureGate(),FLOOR=12.3,newX=60.05/9.43*1.43/2,oldX=60.05/18;
const before=JSON.parse(fs.readFileSync(new URL('../../fixtures/r157-wumen-main-width/before-411214.json',import.meta.url))).snapshot;
const expected=expectedWidthRows(before),results=[];
for(const fps of [10,60])for(const side of [-1,1])for(const sprint of [false,true])test(`Wumen south outer strip raw controller meets shifted column side${side} ${fps}Hz ${sprint?'run':'walk'}`,t=>{
 const row=expected.find(r=>r.part==='outer-column'&&Math.abs(r.position[0]-side*newX)<1e-9&&r.position[2]===-12.5);assert.ok(row);
 const xs=row.geometry.attributes.position.array.filter((_,i)=>i%3===0).map(x=>side*(row.position[0]+x));const contact=Math.min(...xs)-.5;
 const f=fixture(t),z=c.data.position.z-12.3;f.cm.addColliders(c.builder.colliders);f.cm.addWalkables(c.builder.walkables);
 f.controls.setPosition(0,FLOOR+1.7,z);f.controls.feetY=FLOOR;f.controls.groundY=FLOOR;f.controls.airborne=false;f.controls.verticalVelocity=0;
 f.camera.lookAt(side*10,FLOOR+1.7,z);f.camera.updateMatrixWorld(true);f.controls.moveForward=true;f.controls.canSprint=sprint;
 let frames=0;
 for(let i=0;i<fps*3;i++){f.step(1/fps);frames++;const p=f.player().position;assert.equal(f.cm.checkCollision(new c.THREE.Vector3(p[0],p[1]+1.7,p[2]),.5),false,'full raw body must not overlap');assert.ok(Math.abs(p[1]-FLOOR)<1e-6);assert.ok(Math.abs(p[2]-z)<1e-6,'no sideways escape');}
 const end=side*f.player().position[0];assert.ok(end>3.05,'the old less-than-3m threshold is no longer the contact position');assert.ok(end<=contact+.025&&end>=contact-.26,JSON.stringify({end,contact}));
 assert.equal(f.cm.checkCollision(new c.THREE.Vector3(side*oldX,FLOOR+1.7,z),.5),false,'old axis is clear');assert.equal(f.cm.checkCollision(new c.THREE.Vector3(side*newX,FLOOR+1.7,z),.5),true,'new actual south column remains solid');
 results.push({fps,side,sprint,frames,end,expectedContact:contact,feet:f.player().position[1]});
});
test.after(()=>{if(process.env.WUMEN_SOUTH_STRIP_RESULT)fs.writeFileSync(process.env.WUMEN_SOUTH_STRIP_RESULT,JSON.stringify({scope:'COMPONENT_RAW_CONTROLLER_NOT_WORLD',results},null,2)+'\n',{flag:'wx'});c.builder.dispose();});
