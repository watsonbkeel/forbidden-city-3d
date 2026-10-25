// Run serially: ALL=1 node tests/r89-performance-benchmark.mjs "$PWD" output.json
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
const root=process.argv[2],out=process.argv[3],imp=p=>import(pathToFileURL(`${root}/${p}`));
const {buildR52World}=await imp('tests/lib/r52-world.mjs');
const {CharacterSystem}=await imp('src/scene/characters/CharacterSystem.js');
const {default:registry}=await imp('data/characters/index.js');
const {CollisionManager}=await imp('src/utils/Collision.js');
const {canCrossOuterMoat,canTraverseOuterMoat}=await imp('src/scene/palace/special/OuterMoat.js');
const {performance}=await import('node:perf_hooks');
const all=process.env.ALL==='1';const buildAt=performance.now();
const oldlog=console.log;console.log=()=>{};
const W=await buildR52World({loadAll:all,initialPosition:{x:108.6,z:277.5}});console.log=oldlog;
for(let i=0;i<10&&!all;i++)W.zoneManager.update({x:108.6,z:277.5});
const {THREE}=W; const camera=new THREE.PerspectiveCamera(65,16/9,.1,2000);camera.position.set(108.6,3,277.5);camera.lookAt(108.6,3,278);camera.updateMatrixWorld();
let player={position:[108.6,0,277.5],radius:.5,height:1.7};
const s=new CharacterSystem({scene:W.scene,camera,collisionManager:W.cm,zoneManager:W.zoneManager,registry,documentObject:null,getPlayerState:()=>player});
const states=[...s.manager.states.values()];
for(const st of states){if(!s.world.isZoneReady(st.actor.zoneRef))continue;st.binding=s.world.resolve(st.actor,s.metricsFor(st.actor));if(st.binding.status!=='ready'){st.error=st.binding.reason;st.binding=null;continue;}st.revision=s.world.getRevision(st.actor);st.asyncResolved=true;if(st.actor.placement.mode==='path')st.patrol=s.manager.patrolFactory(st.actor,st.binding);st.interactionSample=st.patrol?.sample(50,st.actor.behavior.followerIndex??0)??{position:st.binding.position,rotationYRad:st.binding.rotationYRad};}
const bound=states.filter(st=>st.binding);const counts={};let capture=false;
const originals={};for(const method of ['_buildGrid','queryBox','getGroundHeight','supportHeight','supportContact','checkCollision','checkDynamicCollision','getValidPosition','checkRiverCrossing']){originals[method]=CollisionManager.prototype[method];CollisionManager.prototype[method]=function(...args){if(capture)counts[method]=(counts[method]??0)+1;return originals[method].apply(this,args);};}
const stats=a=>{a.sort((a,b)=>a-b);return{n:a.length,p50:a[Math.floor((a.length-1)*.5)],p95:a[Math.floor((a.length-1)*.95)],p99:a[Math.floor((a.length-1)*.99)],worst:a.at(-1)};};
function bench(name,fn,{prepare=()=>{},n=600,warm=100}={}){for(let i=0;i<warm;i++){prepare(i);fn(i);}for(const k of Object.keys(counts))delete counts[k];const a=[];capture=true;for(let i=0;i<n;i++){prepare(i);const at=performance.now();fn(i);a.push(performance.now()-at);}capture=false;const r={name,milliseconds:stats(a),callsPerSample:Object.fromEntries(Object.entries(counts).map(([k,v])=>[k,v/n]))};console.log(JSON.stringify(r));return r;}
const results=[]; W.cm.queryBox(qPlaceholder()); function qPlaceholder(){return new THREE.Box3(new THREE.Vector3(108.3,-1,277.2),new THREE.Vector3(108.9,10,277.8));}
s.manager.routines.update(bound,.1,{minutesOfDay:1260});
const snapshots=bound.map(st=>({st,actor:st.actor,dayActor:st.dayActor,routine:st.routine,routineSample:st.routineSample?structuredClone(st.routineSample):undefined,index:st.routine?.index,phase:st.routine?.phase,points:st.routine?.points}));
const reset=()=>{for(const p of snapshots){Object.assign(p.st,{actor:p.actor,dayActor:p.dayActor,routine:p.routine,routineSample:p.routineSample?structuredClone(p.routineSample):undefined});if(p.routine)Object.assign(p.routine,{index:p.index,phase:p.phase,points:p.points});}};
const productionCheck=CollisionManager.prototype.checkRiverCrossing;
const oldSourcePath=new URL('./fixtures/r89/south-water-r88.js.txt',import.meta.url);
let oldSource=fs.readFileSync(oldSourcePath,'utf8');
const origin=pathToFileURL(`${root}/src/scene/palace/special/SouthWaterSystem.js`);
oldSource=oldSource.replace(/from ['"](\.[^'"]+)['"]/g,(_m,p)=>'from '+JSON.stringify(new URL(p,origin).href)).replace("from 'three'",'from '+JSON.stringify(import.meta.resolve('three')));
const frozen=await import('data:text/javascript;base64,'+Buffer.from(oldSource).toString('base64'));
const oldCheck=function(position,radius,from=null){return this.rivers.every(r=>frozen.canCrossPalaceWater(r,position,radius))&&this.moats.every(m=>from?canTraverseOuterMoat(m,from,position,radius):canCrossOuterMoat(m,position,radius));};
for(const dt of[1/60,.1])for(const [label,fn] of [['frozen R88 water narrow phase',oldCheck],['R89 production bounds',productionCheck]]){
 CollisionManager.prototype.checkRiverCrossing=fn;
 results.push(bench(`${label} night routine dt=${dt}`,()=>s.manager.routines.update(bound,dt,{minutesOfDay:1260}),{prepare:reset,n:1200,warm:200}));
}
CollisionManager.prototype.checkRiverCrossing=productionCheck;
const report={scope:'Paired Node CPU benchmark, same world and R89 routines, changing only old versus new water function; no GPU/device/FPS conclusion.',loadAll:all,registered:states.length,bound:bound.length,results};
fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');s.dispose();W.dispose();
