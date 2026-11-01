import{FirstPersonControls}from'../../src/controls/FirstPerson.js';import{PLAYER}from'../../src/config/constants.js';
import test from'node:test';import assert from'node:assert/strict';import fs from'node:fs';import{buildR52World}from'../lib/r52-world.mjs';import{replayKunning}from'../lib/kunning-walk.mjs';
test('actual World: both supported folded ascents up/down, gate tunnels retained, brick guards stop exits',async t=>{
 const w=await buildR52World(),rows=[],negative=[];const xy=(x,z)=>[-365.8+x,-257+z];
 try{
 const path=[[10,15],[10,37],[10,40],[2.5,40],[2.5,14],[6,14],[6,-14],[2.5,-14],[2.5,-40],[10,-40],[10,-37],[10,-15]].map(p=>xy(...p));
 for(const fps of[10,60])for(const sprint of[false,true])for(const reverse of[false,true]){const r=replayKunning(t,w,reverse?[...path].reverse():path,{fps,sprint,startFeet:0,recordFrames:true});rows.push({kind:'both-ascents',fps,sprint,reverse,...r});}
 for(const z of[-8.4,0,8.4])for(const reverse of[false,true]){const path=[xy(-12,z),xy(12,z)];rows.push({kind:'original-tunnel',z,reverse,...replayKunning(t,w,reverse?path.reverse():path,{fps:60,startFeet:0,recordFrames:true})});}
 for(const s of[-1,1])for(const which of['slope-side','turn-end']){const path=which==='slope-side'?[[2.5,s*26],[-4,s*26]]:[[6,s*40],[6,s*46]],feet=which==='slope-side'?6.975:4.65;negative.push({s,which,...replayKunning(t,w,path.map(p=>xy(...p)),{fps:10,sprint:true,startFeet:feet,recordFrames:true})});}
 const jumps=[];
 for(const fps of[10,60]){
  const oldDoc=globalThis.document,oldWindow=globalThis.window,noop=()=>{},doc={...oldDoc,addEventListener:noop,removeEventListener:noop,exitPointerLock:noop};globalThis.document=doc;globalThis.window={addEventListener:noop,removeEventListener:noop};let now=0;const clock=t.mock.method(performance,'now',()=>now),camera=new w.THREE.PerspectiveCamera(),c=new FirstPersonControls(camera,{ownerDocument:doc,addEventListener:noop,removeEventListener:noop},w.cm);
  try{c.controls.isLocked=true;c.setPosition(-355.8,2.325+PLAYER.HEIGHT,-230);c.jump();let peak=c.feetY,airFrames=0;for(let i=0;i<fps*3;i++){now+=1000/fps;c.update();peak=Math.max(peak,c.feetY);if(c.airborne)airFrames++;}jumps.push({fps,peak,airFrames,endFeet:c.feetY,endGround:c.groundY});assert.ok(peak>3.3&&airFrames>0,'local contact must not swallow jump');assert.ok(Math.abs(c.feetY-c.groundY)<.3&&c.airborne===false,'native gravity lands on real slope');}finally{c.dispose();clock.mock.restore();globalThis.document=oldDoc;globalThis.window=oldWindow;}
 }
 const failures=rows.filter(r=>!r.arrived).map(({frames,...r})=>r);
 if(process.env.EVIDENCE_OUT)fs.writeFileSync(process.env.EVIDENCE_OUT,JSON.stringify({scope:'ACTUAL_CPU_WORLD_UNMODIFIED_CONTROLLER_NO_GPU',rows,negative,jumps,failures}));
 assert.deepEqual(failures,[]);for(const r of rows){assert.ok(r.frames.every(f=>[f.x,f.z,f.feet,f.ground].every(Number.isFinite)));assert.ok(r.minFeet>-.01);if(r.kind==='both-ascents'){assert.ok(r.maxFeet>=9.29);assert.ok(r.frames.every(f=>Math.abs(f.feet-f.ground)<=.3),'ground contact exceeds practical0.3m');}else assert.ok(r.maxFeet<.3,'tunnels never rescued to upper platform');}
 for(const r of negative){assert.equal(r.arrived,false,r.which);assert.ok(r.minFeet>=4.6,'no fall from guard');}
 assert.equal(w.cm.checkCollision(new w.THREE.Vector3(-365.8,11,-257),.5),true,'existing tower remains solid at upper level');
 console.log(JSON.stringify({routes:rows.length,arrived:rows.filter(r=>r.arrived).length,negative:negative.length,frames:rows.reduce((s,r)=>s+r.frames.length,0)}));
 }finally{w.dispose();}
});
