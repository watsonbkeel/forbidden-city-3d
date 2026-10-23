import fs from 'node:fs';import {execFileSync} from 'node:child_process';import {pathToFileURL} from 'node:url';import {createHash} from 'node:crypto';import * as THREE from 'three';
import {CHARACTER_REGISTRY} from '../../data/characters/index.js';
import {getBeijingDayCycle} from '../../src/scene/sky/BeijingDayCycle.js';
import {CharacterManager as Current} from '../../src/scene/characters/CharacterManager.js';
const base='6a2803b9238a2f3f2225a2bc45a4084b1fbfe0d0',raw=execFileSync('git',['show',base+':src/scene/characters/CharacterManager.js'],{encoding:'utf8'}),directory=pathToFileURL(process.cwd()+'/src/scene/characters/');
// Original frozen implementation, changing only ES import resolution for this
// temporary data URL. Shared LOD ordering and registry bytes are retained.
const source=raw.replace(/from '(\.\/[^']+)'/g,(_,p)=>`from '${new URL(p,directory).href}'`),{CharacterManager:Old}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const camera=new THREE.PerspectiveCamera(80,1,.1,2000);camera.position.set(0,1.7,8);camera.lookAt(0,1,0);camera.updateMatrixWorld();
function sample(Manager,daylight){const m=new Manager({registry:CHARACTER_REGISTRY,contentEnabled:true,adapter:{resolve:()=>({status:'ready',position:[0,0,0],rotationYRad:0})},renderer:{render:()=>({}),clear(){},dispose(){}}});for(let i=0;i<30;i++)m.update(.1,{camera,daylight});const out={timeEligible:[...m.states.values()].filter(s=>s.activeSchedule).length,submitted:m.stats.visible};m.dispose();return out;}
const rows=[];for(const time of['17:24:47','17:24:48','17:25:00','17:26:00','23:59:59']){const daylight=getBeijingDayCycle(new Date('2026-10-23T'+time+'+08:00')).lighting.daylight;rows.push({beijing:'2026-10-23T'+time,daylight,R64:sample(Old,daylight),R65:sample(Current,daylight)});}
fs.writeFileSync('reports/r65-character-experience/SUNSET-ROOT-CAUSE.json',JSON.stringify({base,baselineManagerSha256:createHash('sha256').update(raw).digest('hex'),baselineImportResolutionOnly:true,rows,boundary:'Lightweight shared-position reproduction of time eligibility; actual108 per-location scene visibility is separate. Submitted limit is64, not108 simultaneous.'},null,2)+'\n');console.log(JSON.stringify(rows));
