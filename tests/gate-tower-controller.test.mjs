import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {buildWorld} from './lib/world.mjs';import {replayGateTower} from './lib/gate-tower-walk.mjs';import {LAYOUT} from '../src/config/constants.js';
const W=await buildWorld();
const cases=[];
function add(gate,name,points,startFeet,endFeet=startFeet){const z=gate==='wumen'?LAYOUT.WUMEN_Z:LAYOUT.SHENWU_Z;cases.push({gate,name,points:points.map(([x,lz])=>[x,lz+z]),startFeet,endFeet});}
add('wumen','veranda-loop',[[35,11.2],[35,-11.2],[-35,-11.2],[-35,11.2],[35,11.2]],12.3);
add('wumen','both-central-doors',[[0,-11.2],[0,0],[0,11.2],[0,0],[0,-11.2]],12.3);
for(const s of [-1,1])add('wumen',`ramp-${s}-roundtrip`,[[s*86,15.5],[s*59,15.5],[s*35,15.5],[0,15.5],[0,0],[0,15.5],[s*35,15.5],[s*59,15.5],[s*86,15.5]],0);
add('shenwu','veranda-loop',[[-19.5,-7.65],[19.5,-7.65],[19.5,7.65],[-19.5,7.65],[-19.5,-7.65]],10.3);
add('shenwu','outer-loop',[[-23.5,-11.2],[23.5,-11.2],[23.5,11.2],[-23.5,11.2],[-23.5,-11.2]],10.3);
for(const x of [-8.19625,0,8.19625])add('shenwu',`north-south-doors-${x}`,[[x,-7.65],[x,0],[x,7.65],[x,0],[x,-7.65]],10.3);
add('shenwu','east-west-board-doors',[[-23.5,0],[0,0],[23.5,0],[0,0],[-23.5,0]],10.3);
for(const s of [-1,1])add('shenwu',`ramp-${s}-roundtrip`,[[s*47,-10.73],[s*23.5,-10.73],[s*23.5,-11.2],[0,-11.2],[0,0],[0,-11.2],[s*23.5,-11.2],[s*23.5,-10.73],[s*47,-10.73]],0);
for(const c of cases)for(const fps of [60,10])for(const sprint of [false,true])for(const backward of [false,true])test(`gate ${c.gate} ${c.name}: ${fps}Hz sprint=${sprint} backward=${backward}, no rescue`,t=>{
 const r=replayGateTower(t,W,c.points,{startFeet:c.startFeet,fps,sprint,backward});
 if(process.env.GATE_TOWER_EVIDENCE_DIR){fs.mkdirSync(process.env.GATE_TOWER_EVIDENCE_DIR,{recursive:true});fs.writeFileSync(`${process.env.GATE_TOWER_EVIDENCE_DIR}/${c.gate}-${c.name}-${fps}-${sprint}-${backward}.json`,JSON.stringify(r,null,2)+'\n');}
 const compact={...r,frames:undefined,supportQueries:undefined,logicalBodyCollisionFrames:r.logicalBodyCollisionFrames.slice(0,2),cameraFeetCollisionFrames:r.cameraFeetCollisionFrames.length};
 assert.equal(r.arrived,true,JSON.stringify(compact));assert.equal(r.startFeet,c.startFeet);assert.ok(Math.abs(r.end[2]-c.endFeet)<.03,JSON.stringify(compact));
 assert.equal(r.logicalBodyCollisionFrames.length,0,JSON.stringify(compact));assert.equal(r.bodyRadius,.5);
 assert.ok(r.supportQueries.every(q=>q.source!=='rescue'&&q.source!=='unverified'));
 assert.equal(r.driver.crossings.length,c.points.length-1);
 if(c.startFeet>0){assert.ok(r.frames.every(f=>Math.abs(f.ground-c.startFeet)<1e-7));assert.equal(r.cameraFeetCollisionFrames.length,0);}
 else{assert.ok(r.maxFeet>=(c.gate==='wumen'?12.29:10.29));assert.ok(r.supportQueries.some(q=>q.source==='other-ramp'));assert.ok(r.supportQueries.some(q=>q.source==='box'));}
});
