import fs from 'node:fs';
import {registerHooks} from 'node:module';
import {buildWestWorld} from './west-world.mjs';
import {FirstPersonControls} from '../../src/controls/FirstPerson.js';
import {furnitureBodySweep} from '../../src/controls/FurnitureMotion.js';
import {BatchedBuilder} from '../../src/render/BatchedBuilder.js';
import {CharacterSystem} from '../../src/scene/characters/CharacterSystem.js';
import {chuxiuCourtyardGeometry} from '../../src/scene/palace/special/ChuxiuCourtyard.js';
const hook=registerHooks({load(u,c,n){return n(u,u.endsWith('.json')?{...c,importAttributes:{...c.importAttributes,type:'json'}}:c);}});
const {Teleport}=await import('../../src/ui/Teleport.js');
const {Minimap}=await import('../../src/ui/Minimap.js');
hook.deregister();
const out={base:'ec50ea01',proofBoundary:'Actual west-six production geometry, collision, controls, characters and teleport. Single registered west-six region; other regions/static central axis and browser/WebGL absent. Not fullworld streaming proof.',steps:[],errors:[]};
const save=()=>fs.writeFileSync('reports/chuxiu-freeze/'+(process.env.REPORT_NAME??'cpu-eight-directions')+'.json',JSON.stringify(out,null,2));
console.log('building');
const w=await buildWestWorld();console.log('built');
const camera=new w.THREE.PerspectiveCamera(75,16/9,.1,1600);
const c=new FirstPersonControls(camera,w.dom.document.body,w.cm),tp=new Teleport(c,w.zoneManager,w.cm);
c.headBobEnabled=false;c.setFreeMove(true);
const chars=new CharacterSystem({scene:w.scene,camera,collisionManager:w.cm,zoneManager:w.zoneManager,interiors:null,getPlayerState:()=>({position:[camera.position.x,c.feetY,camera.position.z],radius:.5,height:1.7})});
let frameCount=0;const batch=new BatchedBuilder(w.scene);let map;
const actors=()=>[...chars.manager.states.values()].filter(s=>s.actor.id.startsWith('chuxiu')).map(s=>({id:s.actor.id,binding:s.binding?.status,position:(s.routineSample??s.interactionSample??s.binding)?.position,readiness:s.readiness,error:s.error,activated:s.interactionActivated,pose:s.actor.behavior.basePose}));
async function frame({daylight=1,beijingTime={minutesOfDay:12*60},quality='high'}={}){c.prevTime=performance.now()-1000/60;c.update();w.zoneManager.update(camera.position);chars.update(1/60,{daylight,beijingTime,quality,viewportHeight:720});camera.updateMatrixWorld(true);if(frameCount%30===0){batch.begin();batch.end();}frameCount++;await Promise.resolve();if(chars.lastError)throw Error(chars.lastError);if(!camera.position.toArray().every(Number.isFinite))throw Error('Nonfinite player position');}
const directions=()=>{const from=camera.position.clone(),feet=new w.THREE.Vector3(from.x,c.feetY,from.z);return [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]].map(([x,z])=>{const n=Math.hypot(x,z),to=from.clone().add(new w.THREE.Vector3(.1*x/n,0,.1*z/n)),end=w.cm.getValidPosition(from,to,.5,c.feetY,.6,null,{kind:'player',airborne:c.airborne,feetY:c.feetY}),hit=furnitureBodySweep(w.cm,feet,new w.THREE.Vector3(to.x,c.feetY,to.z));return {direction:[x,z],moved:Math.hypot(end.x-from.x,end.z-from.z),hit:hit?{kind:hit.kind,actorId:hit.actorId,overlap:hit.existingOverlap}:null};});};
const snapshot=label=>({label,frameCount,position:camera.position.toArray(),feet:c.feetY,ground:c.groundY,airborne:c.airborne,loaded:w.zoneManager.getLoadedIds(),chars:chars.statusSnapshot(),chuxiuActors:actors(),directions:directions()});
try{
 const g=chuxiuCourtyardGeometry(w.zones.find(z=>z.json.id==='west-six').json);out.geometry=g;console.log('geometry',g);
 let point=tp.go('储秀宫');out.steps.push({label:'initial teleport',point,...snapshot('arrival')});save();console.log('arrival',point);
 for(let i=0;i<700;i++)await frame();console.log('chars-ready',chars.statusSnapshot());out.steps.push(snapshot('settled'));
 const routes=[[[94.8,414.4],[88,414.4],[88,419],[94.8,420],[101,420],[101,414.4],[94.8,414.4]],[[94,g.southZ],[g.westX,g.southZ],[g.westX,g.northZ],[94.8,g.northZ],[g.eastX,g.northZ],[g.eastX,g.southZ],[94,g.southZ]]];
 for(let repeat=0;repeat<1;repeat++)for(const route of routes)for(const [x,z]of route){c.stop();c.setFreeMove(true);c.lookAt(x,z);c.moveForward=true;let stopped=0,previous=camera.position.clone();for(let i=0;i<1800;i++){if(camera.position.distanceTo(new w.THREE.Vector3(x,camera.position.y,z))<.12)break;await frame();const moved=camera.position.distanceTo(previous);stopped=moved<.00001?stopped+1:0;previous.copy(camera.position);if(stopped>=120)break;c.lookAt(x,z);}c.stop();const row={...snapshot(`repeat ${repeat} toward ${x},${z}`),distance:Math.hypot(camera.position.x-x,camera.position.z-z),stopped};out.steps.push(row);save();console.log('waypoint',row.label,'distance',row.distance.toFixed(3),'blocked',stopped);}
 // Real DOM map handler chain; canvas drawing/layout are a declared CPU stub.
 w.dom.document.createElement=tag=>{const el=w.createElement(tag);el.dataset={};if(tag==='canvas'){const ctx=new Proxy({measureText:t=>({width:String(t).length*6})},{get:(o,k)=>k in o?o[k]:()=>{}});el.getContext=()=>ctx;el.clientWidth=400;el.getBoundingClientRect=()=>({left:0,top:0,width:400,height:400});el.setPointerCapture=()=>{};el.hasPointerCapture=()=>false;el.releasePointerCapture=()=>{};}return el;};
 map=new Minimap({items:w.zoneManager.getMapItems(),hasTeleportTarget:name=>tp.targets.has(name),onTeleport:name=>tp.go(name),onToggle:visible=>{c.setMapOpen(visible);c.setFreeMove(visible);}});
 for(const minutes of [720,1260,1320,360]){for(let i=0;i<360;i++)await frame({daylight:minutes>=1260?.1:1,beijingTime:{minutesOfDay:minutes}});out.steps.push(snapshot('NPC time '+minutes));save();}
 for(const [phase,x,z] of [['approach NPC',100,414],['retreat from NPC',94.8,414]]){c.stop();c.setFreeMove(true);c.lookAt(x,z);c.moveForward=true;for(let i=0;i<240;i++)await frame();c.stop();out.steps.push(snapshot(phase));save();}
 for(const name of ['翊坤宫','储秀宫','长春宫','储秀宫','永寿宫','储秀宫']){const before=snapshot('before');if(!map.visible)map.toggle();map.selectMapLabel({name});const button=map.placePanel.element.querySelector('#place-travel');if(!button)throw Error('Missing real map travel button for '+name);const previous=tp.lastPoint;w.dom.dispatch(button,'pointerdown',{pointerId:1,clientX:10,clientY:10});w.dom.dispatch(button,'pointerup',{pointerId:1,clientX:10,clientY:10});w.dom.dispatch(button,'click',{detail:1});const point=tp.lastPoint;if(point===previous)throw Error('Map click did not reach Teleport.go for '+name);for(let i=0;i<120;i++)await frame();out.steps.push({label:'teleport '+name,before,point,after:snapshot('after')});save();console.log('teleport',name,point);}
 w.zoneManager.loadAll=false;
 for(const retain of [true,false,true]){w.zoneManager.unloadZone('west-six',{retain});const retained=!!w.zoneManager.inactiveCache?.has('west-six',w.zoneManager.zones.get('west-six'),w.zoneManager.detailQualityFor('west-six'));batch.begin();batch.end();w.zoneManager.loadZone('west-six');for(let i=0;i<300;i++)await frame({quality:retain?'high':'low'});const point=tp.go('储秀宫');if(!point)throw Error('Chuxiu travel failed after reload');out.steps.push({...snapshot('reload retain='+retain),requestedRetain:retain,retained,point});save();}
 out.result='No uncaught exception/nonfinite state across tested CPU routes; distinguish blocked waypoints from complete route success.';
}catch(e){out.errors.push(e.stack);process.exitCode=1;console.error('FAIL',e.stack);}finally{out.frameCount=frameCount;out.characterSnapshot=chars.snapshot();save();map?.dispose();batch.dispose();chars.dispose();tp.dispose();c.dispose();w.dispose();}
