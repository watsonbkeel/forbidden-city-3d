// Real production world/adapter, unchanged default 1ms budget. CPU submission only.
import fs from 'node:fs';import{createHash}from'node:crypto';import{sourceFingerprint}from'../build-identity.mjs';import path from 'node:path';import {pathToFileURL} from 'node:url';import {registerHooks} from 'node:module';
const root=path.resolve(process.argv[2]??'.'),out=process.argv[3];if(!out||fs.existsSync(out))throw Error('new output path required');
registerHooks({load(u,c,n){return n(u,u.endsWith('.json')?{...c,importAttributes:{...c.importAttributes,type:'json'}}:c);}});
const imp=p=>import(pathToFileURL(path.join(root,p)).href);
const [{buildWorld},{CharacterSystem},{FirstPersonControls},{Teleport},T]=await Promise.all(['scripts/r118/world.mjs','src/scene/characters/CharacterSystem.js','src/controls/FirstPerson.js','src/ui/Teleport.js','node_modules/three/build/three.module.js'].map(imp));
const W=await buildWorld({loadAll:false,initialPosition:{x:0,z:-494}}),camera=new T.PerspectiveCamera(75,16/9,.1,5000),controls=new FirstPersonControls(camera,document.body,W.cm),teleport=new Teleport(controls,W.zoneManager,W.cm);
controls.setPosition(0,1.7,-494);const s=new CharacterSystem({scene:W.scene,camera,collisionManager:W.cm,zoneManager:W.zoneManager,documentObject:null,getViewState:()=>({mode:'ground',position:camera.position})});
const before=sourceFingerprint(root),driverSha256=createHash('sha256').update(fs.readFileSync(new URL(import.meta.url))).digest('hex'),lifecycle=process.argv[4]==='lifecycle',limit=lifecycle?2700:1800;const rows=[],firstSubmitted={},firstBinding={},samples=[],start=performance.now();let point;
try{
 for(let frame=0;frame<limit;frame++){
  if(lifecycle&&frame===1800){teleport.go('午门');camera.lookAt(0,2,-480);camera.updateMatrixWorld(true);}
  if(frame===30||lifecycle&&frame===2100){point=teleport.go('储秀宫');if(!point)throw Error('teleport missing');const g=teleport.geometryFor('储秀宫');camera.lookAt(g.cx,2,g.cz);camera.updateMatrixWorld(true);}
  const t=performance.now();s.update(1/60,{quality:'low',viewportHeight:720,beijingTime:{minutesOfDay:720}});samples.push(performance.now()-t);await Promise.resolve();
  for(const [id,state]of s.manager.states)if(state.binding?.status==='ready'&&firstBinding[id]===undefined)firstBinding[id]=frame;
  for(const actor of s.renderer.submittedActors??[])if(firstSubmitted[actor.id]===undefined)firstSubmitted[actor.id]={frame,position:actor.position,lod:actor.lod};
  if(frame%30===0||frame===limit-1)rows.push({frame,active:s.world.work.active?.key,pending:s.world.work.jobs.size,stats:s.statusSnapshot(),resident:[...s.manager.residency.states].filter(([,v])=>v.display).map(([id,v])=>({id,...v})),submitted:(s.renderer.submittedActors??[]).map(a=>a.id)});
  if(s.lastFailure)throw Error(s.lastFailure);
 }
 const after=sourceFingerprint(root);if(before!==after)throw Error('runtime/build inputs changed during run');samples.sort((a,b)=>a-b);fs.writeFileSync(out,JSON.stringify({root,sourceBefore:before,sourceAfter:after,driverSha256,limit,lifecycle,scope:'CPU real world real adapter, default 1ms. simulated 60Hz frames, NOT wall-paced/browser/GPU.',point,camera:camera.position,elapsedMs:performance.now()-start,firstBinding,firstSubmitted,samples:{p50:samples[Math.floor(limit*.5)],p95:samples[Math.floor(limit*.95)],p99:samples[Math.floor(limit*.99)],max:samples.at(-1)},rows,snapshot:s.snapshot()},null,2));
}finally{s.dispose();teleport.dispose();controls.dispose();W.dispose();}
