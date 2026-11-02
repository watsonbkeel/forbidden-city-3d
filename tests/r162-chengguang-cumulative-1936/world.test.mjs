import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import zlib from 'node:zlib';import crypto from 'node:crypto';import{registerHooks}from'node:module';
const base=new URL('../../',import.meta.url).pathname;registerHooks({load(u,c,n){return n(u,u.endsWith('.json')?{...c,importAttributes:{...c.importAttributes,type:'json'}}:c)}});
const{buildR52World}=await import(base+'tests/lib/r52-world.mjs'),{createActualLibrary}=await import(base+'tests/r158-cumulative-1600/library.mjs'),{replayKunning}=await import(base+'tests/lib/kunning-walk.mjs'),{withBoundedQaMocks}=await import(base+'tests/lib/bounded-qa-clock.mjs'),{canCrossPalaceWater}=await import(base+'src/scene/palace/special/SouthWaterSystem.js');
const Geo=await import(base+'node_modules/three/build/three.module.js');
const plans=[{name:'current-layout-west-x17-north-lane',pts:[[17,507],[17,515],[17,507]]},{name:'current-layout-northwest-crosspath',pts:[[20,509.3],[45,509.3],[20,509.3]]}];
test('candidate normal landscape with one approved curb cut plus normal Chengguang gate; original four paths and real new approach',async t=>{
const W=await buildR52World({loadAll:false,initialPosition:{x:.5,z:513},createLibrary:createActualLibrary,zoneManagerOptions:{reuseInactive:true}}),T=W.THREE,r={base:'6eb1e1c9',scope:'actual resources; garden/west-six/axis-courts + global resident; normal unique gate hook, one expressly approved program-curb foot cut; all other GardenBuilder streams protected; not full-streaming/GPU',routes:[],newRoutes:[],negative:[],starts:[]};
try{
for(const z of['garden','west-six','axis-courts'])W.zoneManager.loadZone(z);W.scene.updateMatrixWorld(true);r.loaded=[...W.zoneManager.loaded.keys()];
const zone=W.zoneManager.loaded.get('garden').data,group=zone.group,records=group.userData.architecture.filter(q=>q.sourceObjectId==='FC-A3B03BAB65');assert.equal(records.length,1);
const inBox=b=>b.min.x>=-2.00001&&b.max.x<=3.00001&&b.min.z>=511.59999&&b.max.z<=514.40001&&b.max.y<=5.20001;
const owners=zone.colliders.filter(q=>inBox(q.box||q));assert.equal(owners.length,15);
const tops=zone.walkables.filter(q=>q.type==='box'&&inBox(q.box));assert.equal(tops.length,1);assert.ok(tops.every(q=>q.rescue===false&&q.box.max.y<=.06001));r.normalGuard={records:1,owners:15,falseTops:1};

for(const route of plans)for(const sprint of[false,true])r.routes.push({...route,fps:30,sprint,...withBoundedQaMocks(t,q=>replayKunning(q,W,route.pts,{startFeet:0,fps:30,sprint,recordFrames:true}))});
const old=JSON.parse(zlib.gunzipSync(fs.readFileSync('/tmp/r162-chengguang-1927/scan.json.gz')));assert.deepEqual(r.routes,old.routes.slice(0,4),'original four complete route arrays/end unchanged');
const pts=[[.5,509.3],[.5,515.2],[.5,509.3]];r.starts.push({point:pts[0],blocked:W.cm.checkCollision(new T.Vector3(.5,1.7,509.3),.5)});assert.equal(r.starts[0].blocked,false);
r.necessary30=[];for(const sprint of[false,true])r.necessary30.push({name:'fixed-chengguang-south-north-passage',pts,fps:30,sprint,...withBoundedQaMocks(t,q=>replayKunning(q,W,pts,{fps:30,sprint,startFeet:0,recordFrames:true}))});assert.ok(r.necessary30.every(q=>q.arrived));r.necessary30ChangedByNewRealPlatform=true;
const inside=[[.5,509.3],[.5,515.2],[.5,509.3]];for(const fps of[10,60])for(const sprint of[false,true])r.newRoutes.push({fps,sprint,...withBoundedQaMocks(t,q=>replayKunning(q,W,inside,{fps,sprint,startFeet:0,recordFrames:true}))});
for(const pts of[[[1.95,510],[1.95,513]],[[1.63,515.2],[1.63,513.6]]])r.negative.push(withBoundedQaMocks(t,q=>replayKunning(q,W,pts,{fps:60,sprint:true,startFeet:0,recordFrames:true})));
const local=JSON.parse(zlib.gunzipSync(fs.readFileSync('/tmp/r162-chengguang-1927/local.json.gz')));assert.deepEqual(r.newRoutes,local.rows,'all actual new rows including end equal local');assert.deepEqual(r.negative,local.negative,'jamb/open-leaf negatives entire objects same');
r.endChecks=r.newRoutes.map(q=>({end:q.end,blocked:W.cm.checkCollision(new T.Vector3(q.end[0],q.end[2]+1.7,q.end[1]),.5)}));r.preservation=null;
r.summary=r.newRoutes.map(q=>({fps:q.fps,sprint:q.sprint,arrived:q.arrived,n:q.frames.length,peak:Math.max(...q.frames.map(f=>Math.abs(f.feet-f.ground)))}));console.log(JSON.stringify({summary:r.summary,negative:r.negative.map(q=>q.arrived),preservation:r.preservation,endChecks:r.endChecks}));assert.ok(r.newRoutes.every(q=>q.arrived));assert.ok(r.summary.every(q=>q.peak<=.300001));assert.ok(r.negative.every(q=>!q.arrived));assert.ok(r.endChecks.every(q=>!q.blocked));
}finally{fs.writeFileSync('/tmp/r162-chengguang-cumulative-1936/world.json.gz',zlib.gzipSync(JSON.stringify(r)));W.dispose()}
});
