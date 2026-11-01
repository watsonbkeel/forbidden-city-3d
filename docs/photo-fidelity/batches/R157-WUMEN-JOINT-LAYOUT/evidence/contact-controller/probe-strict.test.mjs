// Private diagnostic draft; not a production or World acceptance test.
import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {pathToFileURL} from 'node:url';
const root=process.cwd()+'/',load=p=>import(pathToFileURL(root+p));
const T=await load('node_modules/three/build/three.module.js');
const {fixture}=await load('tests/lib/r72-player-fixture.mjs');
const {buildWumenAscentContactRig}=await load('scripts/photo-fidelity/batches/wumen-joint-layout/ascent-contact.mjs');
const results=[];
for(const side of ['east','west'])for(const reverse of [false,true])for(const fps of [10,60])for(const sprint of [false,true])test(`CONTACT_RIG_ONLY ${side} ${reverse?'down':'up'} ${fps}Hz ${sprint?'run':'walk'}`,t=>{
 const material=new T.MeshStandardMaterial(),r=buildWumenAscentContactRig(material);t.after(()=>{r.dispose();material.dispose();});
 const selected=r.pieces.filter(p=>p.mesh.name.startsWith(side+'/'));
 const start=selected[0].walkable,end=selected.at(-1).walkable;
 const first=[(start.minX+start.maxX)/2,start.maxZ+1],last=[(end.minX+end.maxX)/2,(end.minZ+end.maxZ)/2];
 const points=[first,...r.seams.filter(s=>s.from.startsWith(side+'/')).map(s=>s.points[0].map((n,i)=>(n+s.points[1][i])/2)),last];if(reverse)points.reverse();
 const f=fixture(t,{position:[points[0][0],reverse?12.3:0,points[0][1]]});
 for(const p of r.pieces){f.cm.addColliders(p.colliders);f.cm.addWalkable(p.walkable);}
 f.controls.feetY=reverse?12.3:0;f.controls.groundY=f.controls.feetY;f.controls.airborne=false;f.controls.verticalVelocity=0;f.controls.moveForward=true;f.controls.canSprint=sprint;
 const frames=[];let target=1,bodyHits=0,unsupported=0,maxFootError=0;
 for(let i=0;i<fps*45&&target<points.length;i++){
  const [tx,tz]=points[target],before=f.player().position;
  f.camera.lookAt(tx,f.camera.position.y,tz);f.camera.updateMatrixWorld(true);f.step(1/fps);
  const p=f.player().position;const hit=f.cm.checkCollision(new T.Vector3(p[0],p[1]+1.7,p[2]),.5);bodyHits+=Number(hit);
  const providers=r.pieces.filter(q=>p[0]>=q.walkable.minX&&p[0]<=q.walkable.maxX&&p[2]>=q.walkable.minZ&&p[2]<=q.walkable.maxZ);
  const actual=providers.map(q=>{const w=q.walkable;return w.y0+(w.y1-w.y0)*((w.axis==='x'?p[0]:p[2])-w.a0)/(w.a1-w.a0);});
  if(providers.length)maxFootError=Math.max(maxFootError,Math.min(...actual.map(y=>Math.abs(p[1]-y))));else if(p[1]>.01)unsupported++;
  frames.push({i,target,position:p,bodyHit:hit,providers:providers.map(q=>q.mesh.name),airborne:f.controls.airborne});
  const dist=Math.hypot(tx-p[0],tz-p[2]);const crossed=(tx-before[0])*(tx-p[0])+(tz-before[2])*(tz-p[2])<=0;
  if(dist<.12||crossed)target++;
 }
 const result={side,reverse,fps,sprint,arrived:target===points.length,bodyHits,unsupported,maxFootError,end:f.player().position,frames};results.push(result);
 assert.ok(maxFootError<=.005,`actual authored plane contact error ${maxFootError}`);assert.equal(unsupported,0,'no elevated frame over absent surface');assert.equal(bodyHits,0,'ordinary raw body collision');assert.equal(result.arrived,true,JSON.stringify({...result,frames:frames.length}));
});
test.after(()=>{if(process.env.CONTACT_PROBE_RESULT)fs.writeFileSync(process.env.CONTACT_PROBE_RESULT,JSON.stringify({scope:'PRIVATE_CONTACT_RIG_ONLY_NOT_ARCHITECTURE_ACCEPTANCE',results})+'\n',{flag:'wx'});});
