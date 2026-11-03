import fs from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import '../lib/inner-palace-fixture.mjs';
import {ZoneBase} from '../../src/scene/zones/ZoneBase.js';
import {CourtKit} from '../../src/scene/palace/kit.js';
import {CollisionManager} from '../../src/utils/Collision.js';
import {buildZhongzhengWestHall} from '../../src/scene/palace/special/ZhongzhengWestHall.js';
import {createActualLibrary} from '../r158-cumulative-1600/library.mjs';
import {snapshot} from './snapshot.mjs';
import {roofRows,roofHash,subtractRows} from './roof-proof.mjs';
import {runRoutes} from './route-runner.mjs';
import {runRoutes as runEast} from '../r163-zhongzheng-east/route-runner.mjs';
import {runRoutes as runXiangyun} from '../r163-xiangyun/route-runner.mjs';
import {runWestSideNeighbors} from './neighbor-runner.mjs';
import {runSideHallNeighbors} from '../r163-zhongzheng-east/neighbor-runner.mjs';
const baseline=JSON.parse(fs.readFileSync(new URL('./baseline.json',import.meta.url)));
const prefix='r163_zhongzheng_west_';
test('actual outer-west production zone preserves frozen c12 objects and roof, 76 routes and 20 blocking controls', t=>{
 const {library,dispose}=createActualLibrary();
 const z=JSON.parse(fs.readFileSync(new URL('../../data/zones/outer-west.json',import.meta.url)));
 const builder=new ZoneBase(library,z),single=new CourtKit(library,'outer-west');
 let singleGroup;
 try {
  const d=builder.build(),arch=d.group.userData.architecture;
  assert.equal(arch.filter(a=>a.sourceObjectId==='FC-77D6708679').length,1);
  assert.equal(arch.filter(a=>a.sourceObjectId==='FC-E5EEAB2373').length,1);
  const added=arch.find(a=>a.sourceObjectId==='FC-77D6708679');
  assert.equal(added.name,'中正殿西配殿');assert.equal(added.wholeObjectAccepted,false);
  assert.equal(added.newRooms,0);assert.equal(added.newMapItems,0);
  const retained=snapshot(d);assert.deepEqual(retained,baseline.snapshot);
  buildZhongzhengWestHall(single,z);singleGroup=single.finish();
  const newRoof=roofRows(singleGroup),allRoof=roofRows(d.group);
  const roof=roofHash(subtractRows(allRoof,newRoof)),newHash=roofHash(newRoof),allHash=roofHash(allRoof);
  assert.ok(newHash.triangles>0);assert.deepEqual(roof,baseline.roof);
  assert.equal(allHash.triangles,baseline.roof.triangles+newHash.triangles);
  // Negative controls exercise the retained-object guard, not just its golden digest.
  let oldMesh,oldRoof;
  d.group.traverse(m=>{if(!m.isMesh||Array.isArray(m.material)||m.material?.name?.startsWith(prefix))return;oldMesh??=m;if(/roof_tile|kit_roof/.test(m.material?.name??''))oldRoof??=m;});
  assert.ok(oldMesh&&oldRoof);
  const pos=oldMesh.position.x;oldMesh.position.x+=.01;
  assert.notDeepEqual(snapshot(d),baseline.snapshot);oldMesh.position.x=pos;
  const collider=d.colliders.find(c=>!c.triangleSupport?.id?.startsWith('zhongzheng-west-hall/')&&!c.zhongzhengWestStoneTop),maxX=collider.max.x;
  collider.max.x+=.01;assert.notDeepEqual(snapshot(d),baseline.snapshot);collider.max.x=maxX;
  const array=oldRoof.geometry.attributes.position.array,first=array[0];array[0]=first+1;
  assert.notDeepEqual(roofHash(subtractRows(roofRows(d.group),newRoof)),baseline.roof);array[0]=first;
  assert.deepEqual(snapshot(d),baseline.snapshot);
  assert.deepEqual(roofHash(subtractRows(roofRows(d.group),newRoof)),baseline.roof);
  const cm=new CollisionManager();cm.rivers=[];cm.addColliders(d.colliders);cm.addWalkables(d.walkables);
  const W={THREE:T,cm};
  const report={scope:'ACTUAL_OUTER_WEST_ZONE_ONLY_NOT_WORLD_OR_GPU',remoteBase:baseline.remoteBase,retained,roof,newRoof:newHash,allRoof:allHash,negativeGuards:['old mesh transform','old collider extent','old roof vertex'],own:runRoutes(t,W),east:runEast(t,W),xiangyun:runXiangyun(t,W),westSideNeighbors:runWestSideNeighbors(t,W),sideHallNeighbors:runSideHallNeighbors(t,W),poses:[]};
  for(const [x,z,feet] of [[234.2,397.5,0],[233.5,391,0],[237.35,397.5,.45],[233.5,404,0],[248,406,0]]) {
   assert.ok(Math.abs(cm.getGroundHeight(x,z,feet,.01)-feet)<1e-5);
   assert.equal(cm.checkCollision(new T.Vector3(x,feet+1.7,z),.65),false);
   report.poses.push({x,z,feet,radius:.65,nativeClear:true});
  }
  report.positiveRoutes=[report.own,report.east,report.xiangyun,report.westSideNeighbors,report.sideHallNeighbors].reduce((n,q)=>n+q.routes.length,0);
  report.negativeRoutes=[report.own,report.east,report.xiangyun].reduce((n,q)=>n+q.negative.length,0);
  assert.equal(report.positiveRoutes,76);assert.equal(report.negativeRoutes,20);
  report.maxRSSKiB=process.resourceUsage().maxRSS;
  if(process.env.H32_EVIDENCE_DIR) fs.writeFileSync(process.env.H32_EVIDENCE_DIR+'/production-zone.json',JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({retained,roof,newRoof:newHash,positiveRoutes:report.positiveRoutes,negativeRoutes:report.negativeRoutes,maxRSSKiB:report.maxRSSKiB}));
 } finally {builder.dispose();single.dispose(singleGroup??single.root);dispose();}
});
