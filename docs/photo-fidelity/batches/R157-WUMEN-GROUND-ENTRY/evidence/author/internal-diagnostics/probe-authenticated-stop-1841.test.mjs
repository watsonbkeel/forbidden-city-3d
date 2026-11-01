// New bounded interior-chain diagnostic: excludes the unresolved entry/exit zero-ground segment. Original full16 RED files are unchanged. Not World/architecture acceptance.
import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {pathToFileURL} from 'node:url';
const root=process.cwd()+'/',load=p=>import(pathToFileURL(root+p));
const T=await load('node_modules/three/build/three.module.js');
const {fixture}=await load('tests/lib/r72-player-fixture.mjs');
const {buildWumenAscentContactRig}=await load('scripts/photo-fidelity/batches/wumen-joint-layout/ascent-contact.mjs');
const {registerWumenJointAscentOwners}=await load('src/controls/WumenJointAscentContact.js');
const {footprintCovered}=await load('src/controls/WumenJointAscentCoverage.js');
const results=[];
for(const side of ['east','west'])for(const reverse of [false,true])for(const fps of [10,60])for(const sprint of [false,true])test(`AUTHENTICATED_FOLDED_INTERIOR_STOP ${side} ${reverse?'down':'up'} ${fps}Hz ${sprint?'run':'walk'}`,t=>{
 const material=new T.MeshStandardMaterial(),r=buildWumenAscentContactRig(material);t.after(()=>{r.dispose();material.dispose();});
 const selected=r.pieces.filter(p=>p.mesh.name.startsWith(side+'/'));
 const start=selected[0].walkable,end=selected.at(-1).walkable;
 const first=[(start.minX+start.maxX)/2,start.maxZ+1],last=[(end.minX+end.maxX)/2,(end.minZ+end.maxZ)/2];
 const chain=r.seams.filter(s=>s.from.startsWith(side+'/'));const points=[];for(let k=0;k<selected.length;k++){const w=selected[k].walkable;points.push([(w.minX+w.maxX)/2,(w.minZ+w.maxZ)/2]);if(chain[k])points.push(chain[k].points[0].map((n,i)=>(n+chain[k].points[1][i])/2));}if(reverse)points.reverse();
 const initial=reverse?end:start,ix=points[0][0],iz=points[0][1],iy=initial.y0+(initial.y1-initial.y0)*((initial.axis==='x'?ix:iz)-initial.a0)/(initial.a1-initial.a0);
 const f=fixture(t,{position:[ix,iy,iz]});
 for(const p of r.pieces){f.cm.addColliders(p.colliders);f.cm.addWalkable(p.walkable);}
 const binding=registerWumenJointAscentOwners(f.cm,r.pieces);t.after(()=>binding.dispose());
 f.controls.feetY=iy;f.controls.groundY=f.controls.feetY;f.controls.airborne=false;f.controls.verticalVelocity=0;f.controls.moveForward=true;f.controls.canSprint=sprint;
 const frames=[];let target=1,bodyHits=0,unsupported=0,maxFootError=0,footprintMissing=0,onSupportMissing=0,airFrames=0,maxGroundError=0,maxVerticalSpeed=0,stableFrames=0,stopped=false;
 for(let i=0;i<fps*45&&!stopped;i++){
  const [tx,tz]=points[target],before=f.player().position;
  const final=target===points.length-1,distanceBefore=Math.hypot(tx-before[0],tz-before[2]),brakingTravel=Math.hypot(f.controls.velocity.x,f.controls.velocity.z)*(1/fps)/(Math.exp(10/fps)-1);
  f.controls.moveForward=!final||distanceBefore>Math.max(.12,brakingTravel+.08);
  f.camera.lookAt(tx,f.camera.position.y,tz);f.camera.updateMatrixWorld(true);f.step(1/fps);
  const p=f.player().position;const hit=f.cm.checkCollision(new T.Vector3(p[0],p[1]+1.7,p[2]),.5);bodyHits+=Number(hit);
  const providers=r.pieces.filter(q=>p[0]>=q.walkable.minX&&p[0]<=q.walkable.maxX&&p[2]>=q.walkable.minZ&&p[2]<=q.walkable.maxZ);
  const actual=providers.map(q=>{const w=q.walkable;return w.y0+(w.y1-w.y0)*((w.axis==='x'?p[0]:p[2])-w.a0)/(w.a1-w.a0);});
  if(providers.length)maxFootError=Math.max(maxFootError,Math.min(...actual.map(y=>Math.abs(p[1]-y))));else if(p[1]>.01)unsupported++;
  const footprint=footprintCovered(selected.map(q=>q.walkable),p[0],p[2],.5);footprintMissing+=Number(!footprint);onSupportMissing+=Number(!f.controls.onSupport);airFrames+=Number(f.controls.airborne);maxGroundError=Math.max(maxGroundError,Math.abs(f.controls.groundY-p[1]));maxVerticalSpeed=Math.max(maxVerticalSpeed,Math.abs(f.controls.verticalVelocity));
  const dist=Math.hypot(tx-p[0],tz-p[2]),atRest=final&&dist<=.12&&f.controls.velocity.length()===0&&f.controls.motion.speed===0&&!f.controls.airborne&&f.controls.onSupport&&f.controls.verticalVelocity===0&&Math.hypot(p[0]-before[0],p[2]-before[2])<=1e-9;stableFrames=atRest?stableFrames+1:0;stopped=stableFrames>=fps;
  frames.push({i,target,phase:final?'ARRIVAL_STOP':'TRANSIT',position:p,bodyHit:hit,providers:providers.map(q=>q.mesh.name),airborne:f.controls.airborne,onSupport:f.controls.onSupport,groundY:f.controls.groundY,verticalVelocity:f.controls.verticalVelocity,velocity:f.controls.velocity.toArray(),motionSpeed:f.controls.motion.speed,footprint,inputForward:f.controls.moveForward,inputSprint:sprint,distance:dist,stableFrames});
  const crossed=(tx-before[0])*(tx-p[0])+(tz-before[2])*(tz-p[2])<=0;
  if(!final&&(dist<.12||crossed))target++;
 }
 const result={side,reverse,fps,sprint,arrived:stopped,stableFrames,finalDistance:Math.hypot(points.at(-1)[0]-f.player().position[0],points.at(-1)[1]-f.player().position[2]),footprintMissing,onSupportMissing,airFrames,maxGroundError,maxVerticalSpeed,bodyHits,unsupported,maxFootError,end:f.player().position,frames};results.push(result);
 assert.equal(footprintMissing,0,'full .5 footprint each frame');assert.equal(onSupportMissing,0,'actual onSupport each frame');assert.equal(airFrames,0,'no airborne frame');assert.ok(maxGroundError<=1e-9);assert.equal(maxVerticalSpeed,0);
 assert.ok(maxFootError<=1e-9,`actual authored plane contact error ${maxFootError}`);assert.equal(unsupported,0,'no elevated frame over absent surface');assert.equal(bodyHits,0,'ordinary raw body collision');assert.equal(result.arrived,true,JSON.stringify({...result,frames:frames.length}));
});
test.after(()=>{if(process.env.CONTACT_PROBE_RESULT)fs.writeFileSync(process.env.CONTACT_PROBE_RESULT,JSON.stringify({scope:'AUTHENTICATED_FOLDED_INTERIOR_STOP_NOT_GROUND_ENTRY_OR_ARCHITECTURE',results})+'\n',{flag:'wx'});});
