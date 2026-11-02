import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import zlib from 'node:zlib';import crypto from 'node:crypto';import{registerHooks}from'node:module';
const base=new URL('../../',import.meta.url).pathname;registerHooks({load(u,c,n){return n(u,u.endsWith('.json')?{...c,importAttributes:{...c.importAttributes,type:'json'}}:c)}});
const{buildR52World}=await import(base+'tests/lib/r52-world.mjs'),{createActualLibrary}=await import(base+'tests/r158-cumulative-1600/library.mjs'),{replayKunning}=await import(base+'tests/lib/kunning-walk.mjs'),{withBoundedQaMocks}=await import(base+'tests/lib/bounded-qa-clock.mjs'),{canCrossPalaceWater}=await import(base+'src/scene/palace/special/SouthWaterSystem.js');
const sha=v=>crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const frozen=JSON.parse(fs.readFileSync(base+'tests/fixtures/r47-r46-auto-routes.json')).find(r=>r.name==='[跨区] 中轴→东六宫景仁宫→宁寿宫皇极殿→回中轴').pts;
const old=[{name:'old-east-first-street-leg',pts:[frozen[1],frozen[2],frozen[1]]},{name:'old-east-second-street-leg',pts:[frozen[8],frozen[9],frozen[8]]}];
assert.deepEqual(old.map(r=>r.pts),[[[-62.4,209.9],[-63.3,297.2],[-62.4,209.9]],[[-120.8,299.2],[-120.8,193.3],[-120.8,299.2]]]);
test('Dunben proposed complete box: true visible/physical/water clearance and two unchanged street legs',async t=>{
 const W=await buildR52World({loadAll:false,initialPosition:{x:-134.5,z:226},createLibrary:createActualLibrary,zoneManagerOptions:{reuseInactive:true}}),T=W.THREE;
 const r={base:'884e089b111e80b51ea2628d02f45b6ce77f7d6a',box:[[-147,0,211],[-122,12,238]],scope:'loadAll:false; explicitly resident east-six/garden/axis-courts plus global production; not streaming/GPU',routes:[],owners:[],supports:[],visibleHits:[],waterBlocked:[],bodyBlocked:[]};
 try{
  W.zoneManager.loadZone('garden');W.zoneManager.loadZone('axis-courts');W.scene.updateMatrixWorld(true);r.loaded=[...W.zoneManager.loaded.keys()];
  const d=W.zoneManager.loaded.get('east-six').data,records=d.group.userData.architecture??[],tops=d.walkables.filter(w=>w.type==='box'&&w.box.min.x>=-147&&w.box.max.x<=-122&&w.box.min.z>=211&&w.box.max.z<=238);assert.equal(records.filter(q=>q.id==='dunben-front-photo-fit').length,1);assert.equal(tops.length,4);assert.ok(tops.every(w=>w.rescue===false));r.normalGuard={records:1,trueTops:4,rescueFalse:true};
  for(const{name,pts}of old)for(const[fps,sprint]of[[30,false],[30,true]])r.routes.push({name,pts,fps,sprint,...withBoundedQaMocks(t,q=>replayKunning(q,W,pts,{startFeet:0,fps,sprint,recordFrames:true}))});
  const previous=JSON.parse(zlib.gunzipSync(fs.readFileSync('/tmp/r160-dunben-1027/scan.json.gz')));assert.deepEqual(r.routes,previous.routes,'old street four full arrays unchanged against pre-Zhaigong baseline');
  r.residentBuildings=['zhaigong-front-photo-fit','chengsu-front-photo-fit','yuqing-front-photo-fit'].map(name=>{const body=W.zoneManager.loaded.get('east-six').builder.kit.root.getObjectByName(name);assert.ok(body,name);return{name,bounds:new T.Box3().setFromObject(body)}});
  r.yuqingRoutes=[];for(const fps of[10,60])for(const sprint of[false,true])r.yuqingRoutes.push({fps,sprint,...withBoundedQaMocks(t,q=>replayKunning(q,W,[[-134.5,239.5],[-134.5,249.8],[-134.5,239.5]],{fps,sprint,startFeet:0,recordFrames:true}))});assert.deepEqual(r.yuqingRoutes,previous.yuqingRoutes);
  r.newRoutes=[];for(const fps of[10,60])for(const sprint of[false,true])r.newRoutes.push({fps,sprint,...withBoundedQaMocks(t,q=>replayKunning(q,W,[[-134.5,210],[-134.5,218.5],[-134.5,210]],{fps,sprint,startFeet:0,recordFrames:true}))});
  const local=JSON.parse(zlib.gunzipSync(fs.readFileSync('/tmp/r160-dunben-1027/local-final.json.gz')));assert.deepEqual(r.newRoutes,local.rows);r.preservation=null;r.routeSummary=[...r.routes,...r.newRoutes].map(q=>({name:q.name,fps:q.fps,sprint:q.sprint,arrived:q.arrived,n:q.frames.length,peak:Math.max(...q.frames.map(f=>Math.abs(f.feet-f.ground)))}));console.log(JSON.stringify({routes:r.routeSummary,preservation:r.preservation,residentBuildings:r.residentBuildings}));assert.ok(r.routes.every(q=>q.arrived));

 }finally{fs.writeFileSync('/tmp/r160-dunben-cumulative-1034/world.json.gz',zlib.gzipSync(JSON.stringify(r)));W.dispose();}
});
