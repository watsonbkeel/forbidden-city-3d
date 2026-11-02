import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import zlib from 'node:zlib';import crypto from 'node:crypto';import{registerHooks}from'node:module';
const base=new URL('../../',import.meta.url).pathname;registerHooks({load(u,c,n){return n(u,u.endsWith('.json')?{...c,importAttributes:{...c.importAttributes,type:'json'}}:c)}});
const{buildR52World}=await import(base+'tests/lib/r52-world.mjs'),{createActualLibrary}=await import(base+'tests/r158-cumulative-1600/library.mjs'),{replayKunning}=await import(base+'tests/lib/kunning-walk.mjs'),{withBoundedQaMocks}=await import(base+'tests/lib/bounded-qa-clock.mjs'),{canCrossPalaceWater}=await import(base+'src/scene/palace/special/SouthWaterSystem.js');
const Geo=await import(base+'node_modules/three/build/three.module.js');
const plans=[{name:'current-layout-east-x48-north-lane',pts:[[-48,507],[-48,515],[-48,507]]},{name:'current-layout-northeast-crosspath',pts:[[-65,509.3],[-44,509.3],[-65,509.3]]}];
const pts=[[-48,509.3],[-45.2,509.3],[-45.2,514.4],[-45.2,509.3],[-48,509.3]];
const negativePlans=[{pts:[[-45.2,514.4],[-45.2,516.2]],startFeet:.16},{pts:[[-44,511.6],[-44,513.9]],startFeet:0}];
test('unchanged actual landscape and normal Yucui pavilion; old route streams and real entry/return',async t=>{
const W=await buildR52World({loadAll:false,initialPosition:{x:-45.2,z:514.4},createLibrary:createActualLibrary,zoneManagerOptions:{reuseInactive:true}}),T=W.THREE,r={base:'8f687117a6bfdd85989a2cb64657f0c6cb77898c',scope:'actual resources, garden/east-six/west-six/axis-courts+global resident; normal unique hook, no landscape edits; not full-streaming/GPU',routes:[],necessary30:[],newRoutes:[],negative:[],negativeStarts:[]};
try{
 for(const z of['garden','east-six','west-six','axis-courts'])W.zoneManager.loadZone(z);W.scene.updateMatrixWorld(true);r.loaded=[...W.zoneManager.loaded.keys()];
 const zone=W.zoneManager.loaded.get('garden').data,group=zone.group;assert.equal(group.userData.architecture.filter(q=>q.sourceObjectId==='FC-D471A19B37').length,1,'normal installed unique Yucui record');
 const inBox=b=>b.min.x>=-47.50001&&b.max.x<=-42.89999&&b.min.z>=512.09999&&b.max.z<=516.70001&&b.max.y<=4.80001;
 const owners=zone.colliders.filter(q=>inBox(q.box||q));assert.equal(owners.length,26);const tops=zone.walkables.filter(q=>q.type==='box'&&inBox(q.box));assert.equal(tops.length,2);assert.ok(tops.every(q=>q.rescue===false&&q.box.max.y<=.16001));let colored=0;group.traverse(m=>{if(m.isMesh&&m.userData.yucuiTriColor){colored++;assert.equal(m.material.length,3);assert.equal(m.userData.noMerge,true);assert.equal(m.geometry.groups.length,3)}});assert.ok(colored>0);r.normalGuard={records:1,owners:26,falseTops:2,coloredRoofs:colored};

 for(const route of plans)for(const sprint of[false,true])r.routes.push({...route,fps:30,sprint,...withBoundedQaMocks(t,q=>replayKunning(q,W,route.pts,{startFeet:0,fps:30,sprint,recordFrames:true}))});
 const old=JSON.parse(zlib.gunzipSync(fs.readFileSync('/tmp/r162-yucui-1951/baseline.json.gz')));assert.deepEqual(r.routes,old.routes,'all original four route reports including end preserved');
 r.start={point:pts[0],blocked:W.cm.checkCollision(new T.Vector3(-48,1.7,509.3),.5)};assert.equal(r.start.blocked,false);
 for(const sprint of[false,true])r.necessary30.push({name:'fixed-yucui-prebuild-approach',pts,fps:30,sprint,...withBoundedQaMocks(t,q=>replayKunning(q,W,pts,{fps:30,sprint,startFeet:0,recordFrames:true}))});assert.ok(r.necessary30.every(q=>q.arrived));r.necessary30ChangedByNewPlatform=true;
 for(const fps of[10,60])for(const sprint of[false,true])r.newRoutes.push({fps,sprint,...withBoundedQaMocks(t,q=>replayKunning(q,W,pts,{fps,sprint,startFeet:0,recordFrames:true}))});
 for(const plan of negativePlans){const[x,z]=plan.pts[0],blocked=W.cm.checkCollision(new T.Vector3(x,plan.startFeet+1.7,z),.5);r.negativeStarts.push({point:plan.pts[0],feet:plan.startFeet,blocked});assert.equal(blocked,false);r.negative.push(withBoundedQaMocks(t,q=>replayKunning(q,W,plan.pts,{fps:60,sprint:true,startFeet:plan.startFeet,recordFrames:true})));}
 const local=JSON.parse(zlib.gunzipSync(fs.readFileSync('/tmp/r162-yucui-1951/local.json.gz')));assert.deepEqual(r.newRoutes,local.rows,'all new complete reports including end exact local');assert.deepEqual(r.negative,local.negative);assert.deepEqual(r.negativeStarts,local.negativeStarts);
 r.endChecks=r.newRoutes.map(q=>({end:q.end,blocked:W.cm.checkCollision(new T.Vector3(q.end[0],q.end[2]+1.7,q.end[1]),.5)}));r.preservation=null;r.summary=r.newRoutes.map(q=>({fps:q.fps,sprint:q.sprint,arrived:q.arrived,n:q.frames.length,peak:Math.max(...q.frames.map(f=>Math.abs(f.feet-f.ground)))}));
 console.log(JSON.stringify({summary:r.summary,negative:r.negative.map(q=>q.arrived),preservation:r.preservation,endChecks:r.endChecks}));assert.ok(r.newRoutes.every(q=>q.arrived));assert.ok(r.summary.every(q=>q.peak<=.300001));assert.ok(r.negative.every(q=>!q.arrived));assert.ok(r.endChecks.every(q=>!q.blocked));
}finally{fs.writeFileSync('/tmp/r162-yucui-cumulative-2001/world.json.gz',zlib.gzipSync(JSON.stringify(r)));W.dispose()}
});
