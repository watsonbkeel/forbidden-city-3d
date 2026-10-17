// Isolated real-browser Kunning S lifecycle. Run only one browser QA at a time.
// PORT=5193 tools/run-with-vite.sh node tests/kunning-interior-browser.cjs
const { chromium } = require('playwright');
const { browserExecutablePath } = require('./lib/browser-path.cjs');
const fs = require('node:fs');
const outDir = process.env.KUNNING_EVIDENCE_DIR || '/tmp/kunning-v6-browser';
fs.mkdirSync(outDir, { recursive: true });
(async () => {
 const browser=await chromium.launch({executablePath:browserExecutablePath(),headless:true,args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1280,height:720}});
 const errors=[]; page.on('pageerror',e=>errors.push(e.message));
 await page.goto((process.env.PALACE_URL||'http://127.0.0.1:5173')+'/?zones=all',{waitUntil:'load'});
 await page.waitForFunction(()=>window.__forbiddenCityApp?.controls && document.querySelector('#loading-screen').style.display==='none',null,{timeout:240000});
 await page.evaluate(async()=>{
  const a=window.__forbiddenCityApp;cancelAnimationFrame(a.animationFrame);a.disposed=true;
  a.interiors?.dispose(); // Critical: prevent the application's streaming loader from adding a second S.
  document.querySelector('#welcome-overlay').style.display='none';
  const THREE=await import('/node_modules/three/build/three.module.js');const {InteriorLoader}=await import('/src/scene/interior/InteriorLoader.js');
  const {INTERIORS}=await import('/src/scene/interior/registry.js');
  const {KUNNING_PROFILE:p}=await import('/src/scene/palace/special/KunningProfile.js');
  const {PLAYER}=await import('/src/config/constants.js');
  const cfg=INTERIORS.kunning,L=new InteriorLoader(a.scene,a.collisionManager,{renderer:a.renderer,registry:{kunning:cfg}});
  const cm=a.collisionManager,f=cfg.frame,floor=p.frameExpectation.floorY;
  const permanent=()=>JSON.stringify({c:cm.colliders.filter(c=>c.tag!=='interior:kunning').map(c=>[c.box.min.toArray(),c.box.max.toArray(),c.tag??'']),w:cm.walkables});
  const signature=permanent();
  const world=id=>{const [x,y,z]=p.navigation.points[id];return new THREE.Vector3(f.x+x,floor+y+PLAYER.HEIGHT,f.z+z);};
  function drive(ids,fps,speed){
   let pos=world(ids[0]);const startFeet=pos.y-PLAYER.HEIGHT;
   if(Math.abs(cm.getGroundHeight(pos.x,pos.z,startFeet)-startFeet)>1e-6)throw new Error('Route start unsupported');
   for(const id of ids.slice(1)){
    const goal=world(id),distance=Math.hypot(goal.x-pos.x,goal.z-pos.z),dx=(goal.x-pos.x)/distance,dz=(goal.z-pos.z)/distance;
    for(let i=0;i<Math.ceil(distance/(speed/fps))+3;i++){
     const remain=Math.hypot(goal.x-pos.x,goal.z-pos.z);if(remain<1e-7)break;
     const before=pos.clone(),step=Math.min(speed/fps,remain);
     pos=cm.getValidPosition(pos,new THREE.Vector3(pos.x+dx*step,pos.y,pos.z+dz*step),.5,pos.y-PLAYER.HEIGHT);
     const moved=Math.hypot(pos.x-before.x,pos.z-before.z);
     if(Math.abs(pos.y-before.y)>moved*.65+.101 || pos.y-PLAYER.HEIGHT<5-1e-6 || cm.checkCollision(pos,.5))throw new Error('Route fall/pop/body collision');
    }
    if(Math.hypot(pos.x-goal.x,pos.z-goal.z)>1e-5 || Math.abs(pos.y-goal.y)>1e-6)throw new Error(`Route blocked at ${id}: ${pos.toArray()}`);
   }
   return pos.toArray();
  }
  function probe(label){
   if(permanent()!==signature)throw new Error(`${label}: permanent B collision/support changed`);
   const routes=[];
   for(const [name,ids] of Object.entries(p.navigation.routes))for(const fps of [60,10])for(const speed of [PLAYER.MOVE_SPEED,PLAYER.SPRINT_SPEED])for(const reverse of [false,true]){
    routes.push({name,fps,speed,reverse,end:drive(reverse?[...ids].reverse():ids,fps,speed)});
   }
   // Sample actual enclosure triangles independently of movable furniture in front of them.
   const walls=[];const bObjects=a.scene.children.filter(o=>o.name!=='interior:kunning');
   for(const [id,x,z]of[['south-center',0,p.depthPlanes.southEnclosure],['north-center',0,p.depthPlanes.northEnclosure],['legacy-rear-x4.7',4.7,p.depthPlanes.northEnclosure]]){
    for(const direction of [-1,1]){
     const origin=new THREE.Vector3(f.x+x,floor+.8,f.z+z-direction*1.2);
     const ray=new THREE.Raycaster(origin,new THREE.Vector3(0,0,direction),0,2.4);
     const hit=ray.intersectObjects(bObjects,true)[0];
     if(!hit||Math.abs(hit.point.z-(f.z+z))>.3)throw new Error(`${label}: missing B enclosure triangle ${id}`);
     walls.push({id,direction,z:hit.point.z});
    }
   }
   const count=cm.colliders.filter(c=>c.tag==='interior:kunning').length;
   if(count!==0 && count!==Object.keys(cfg.furnitureProxies).length)throw new Error('Duplicate or partial S proxies');
   return {label,state:L.getState('kunning'),colliders:count,routes,walls};
  }
  window.__kunningQA={a,THREE,InteriorLoader,L,cfg,p,probe,results:[probe('B-only')]};
 });
 async function shots(label){
  const views=await page.evaluate(()=>window.__kunningQA.cfg.views);
  for(let i=0;i<views.length;i++){
   await page.evaluate(v=>{const {a,cfg,p}=window.__kunningQA,f=cfg.frame,y=p.frameExpectation.floorY;a.camera.position.set(f.x+v.eye[0],y+v.eye[1],f.z+v.eye[2]);a.camera.lookAt(f.x+v.look[0],y+v.look[1],f.z+v.look[2]);a.camera.updateMatrixWorld();a.environment.update(a.camera,.016);a.postProcessing.render();},views[i]);
   await page.screenshot({path:`${outDir}/${label}-${i+1}-${views[i].name}.png`});
  }
 }
 await shots('B');
 await page.evaluate(async()=>{const q=window.__kunningQA;if(!await q.L.load('kunning'))throw new Error('Current S failed');q.results.push(q.probe('S-during-fade'));q.L.update(q.cfg.frame,performance.now()+1000);q.results.push(q.probe('S-loaded'));});
 await shots('S');
 const result=await page.evaluate(async()=>{
  const q=window.__kunningQA,{L,cfg,probe}=q;L.unload('kunning');q.results.push(probe('S-unloaded'));
  if(!await L.load('kunning'))throw new Error('Reload failed');q.results.push(probe('S-reloaded'));L.unload('kunning');
  const original=L.gltf.load.bind(L.gltf),originalModel=L.halls.get('kunning').cfg.model;
  for(const [label,path] of [['missing','/models/interiors/__missing_kunning__.glb'],['stale-v5','/models/interiors/kunning.glb']]){
   L.halls.get('kunning').cfg={...cfg,model:path};if(await L.load('kunning'))throw new Error(`${label} accepted`);q.results.push(probe(label));L.unload('kunning');
  }
  L.halls.get('kunning').cfg=cfg;
  L.gltf.load=(url,ok,progress,error)=>original(url,g=>{g.scene.getObjectByName('KUNNING_CONTRACT').userData.profileHash='wrong-profile';ok(g);},progress,error);
  if(await L.load('kunning'))throw new Error('Wrong profile accepted');q.results.push(probe('wrong-profile'));L.unload('kunning');
  let release,ready;const parsed=new Promise(r=>ready=r);
  L.gltf.load=(url,ok,progress,error)=>original(url,g=>{release=()=>ok(g);ready();},progress,error);
  const pending=L.load('kunning');await parsed;L.unload('kunning');release();if(await pending)throw new Error('Cancelled load installed');q.results.push(probe('cancelled-load'));
  L.gltf.load=original;if(!await L.load('kunning'))throw new Error('Recovery reload failed');q.results.push(probe('recovery-reload'));
  const history=L.history.kunning;L.dispose();q.results.push(probe('disposed'));
  return {model:originalModel,profileHash:q.p.profileHash,history,results:q.results};
 });
 fs.writeFileSync(`${outDir}/lifecycle.json`,JSON.stringify({...result,errors},null,2));
 console.log(JSON.stringify({model:result.model,profileHash:result.profileHash,states:result.results.map(r=>({label:r.label,state:r.state,colliders:r.colliders,routeCases:r.routes.length})),history:result.history,errors,outDir},null,2));
 await browser.close();if(errors.length)throw new Error(errors.join('\n'));
})().catch(e=>{console.error(e);process.exit(1);});
