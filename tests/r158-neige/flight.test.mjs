import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {blank,install} from './fixture.mjs';import * as api from '../../src/scene/palace/special/NeigeCourt.js';import {FlightEnvelope} from '../../src/scene/flight/FlightEnvelope.js';import {FlightState,FLIGHT_RULES} from '../../src/scene/flight/FlightState.js';import {exerciseFlightTourExit} from '../lib/r66-h/balcony-motion.mjs';import {withBoundedQaMocks} from '../lib/bounded-qa-clock.mjs';
test('local native flight at10/60: real updates from default home stop above roof, airborne exit rejected, open-ground handoff safe',t=>{
 const f=install(blank(),api),rows=[];try{for(const fps of[10,60])withBoundedQaMocks(t,c=>{
  const envelope=new FlightEnvelope().addRoot(f.kit.root),s=new FlightState(envelope),dt=1/fps;let now=0,frames=0;
  const tick=(input={})=>{now+=1000/fps;frames++;s.update(dt,now,input);assert.ok(envelope.isSafe(s.position,FLIGHT_RULES.radius,FLIGHT_RULES.maximumAltitude));};
  assert.equal(s.board(),true);for(let n=0;n<Math.ceil(100/9*fps)+2&&s.position.y<100-1e-7;n++)tick({vertical:Math.min(1,(100-s.position.y)/(9*dt))});
  const target={x:-161,z:-365},limit=Math.ceil(Math.hypot(target.x-s.position.x,target.z-s.position.z)/24*fps)+2;
  for(let n=0;n<limit;n++){const dx=target.x-s.position.x,dz=target.z-s.position.z,d=Math.hypot(dx,dz);if(d<1e-7)break;const q=Math.min(1,d/(24*dt))/d;tick({right:-dx*q,forward:dz*q});}
  assert.ok(Math.hypot(s.position.x-target.x,s.position.z-target.z)<1e-5);assert.equal(s.landAt(target),false);
  for(let n=0;n<Math.ceil(100/9*fps)+2;n++){tick({vertical:-1});if(s.blocked)break;}const blocked=s.blocked;tick();const aboveRoof={...s.position},airExit=exerciseFlightTourExit(c,f,s,envelope);assert.ok(blocked);assert.equal(airExit.exited,false);assert.ok(aboveRoof.y>8.5);
  const landing={x:-140,z:-390};assert.equal(s.landAt(landing),true);for(let n=0;n<fps*40&&(s.mode==='auto'||!s.grounded);n++)tick();tick();assert.equal(s.grounded,true);const groundExit=exerciseFlightTourExit(c,f,s,envelope);assert.equal(groundExit.exited,true);assert.equal(groundExit.feet,0);assert.deepEqual(groundExit.contacts.actualRoles,[]);assert.equal(groundExit.contacts.productionProxy,false);
  rows.push({fps,frames,scope:'LOCAL_ONE_COURT_FLIGHT_ENVELOPE_NOT_WHOLE_WORLD_OR_BROWSER',positionWritesAfterConstructor:0,aboveRoof,blocked,airExit,groundExit});
 });}finally{fs.writeFileSync(process.env.EVIDENCE_OUT??'/tmp/r158-neige-flight.json',JSON.stringify(rows,null,2));f.dispose();}
});
