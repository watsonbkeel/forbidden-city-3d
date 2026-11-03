import fs from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import '../lib/inner-palace-fixture.mjs';
import {ZoneBase} from '../../src/scene/zones/ZoneBase.js';
import {CourtKit} from '../../src/scene/palace/kit.js';
import {CollisionManager} from '../../src/utils/Collision.js';
import {buildBaozhongEastHall} from '../../src/scene/palace/special/BaozhongEastHall.js';
import {createActualLibrary} from '../r158-cumulative-1600/library.mjs';
import {snapshot} from './snapshot.mjs';
import {roofRows,roofHash,subtractRows} from '../r163-west-sidehall-c12/roof-proof.mjs';
import {runRoutes} from './route-runner.mjs';
import {runRoutes as runYude} from '../r163-yude-west/route-runner.mjs';
import {runMiddleEntry} from '../r163-chongjing/middle-entry-runner.mjs';
import {runDiagonals} from './diagonal-runner.mjs';
const baseline=JSON.parse(fs.readFileSync(new URL('./baseline.json',import.meta.url)));
const prefix='r163_baozhong_east_';
test('actual west-six preserves frozen 2c38 objects and roof, native routes, blocking controls and diagonals', t=>{
 const {library,dispose}=createActualLibrary();
 const z=JSON.parse(fs.readFileSync(new URL('../../data/zones/west-six.json',import.meta.url)));
 const builder=new ZoneBase(library,z),single=new CourtKit(library,'west-six');
 let singleGroup;
 try {
  const d=builder.build(),arch=d.group.userData.architecture;
  assert.equal(arch.filter(a=>a.sourceObjectId==='FC-D16E18CADB').length,1);
  assert.equal(arch.filter(a=>a.sourceObjectId==='FC-EDE61DA470').length,1);
  const added=arch.find(a=>a.sourceObjectId==='FC-D16E18CADB');
  assert.equal(added.name,'葆中殿');assert.equal(added.wholeObjectAccepted,false);
  assert.equal(added.newRooms,0);assert.equal(added.newMapItems,0);
  const retained=snapshot(d);assert.deepEqual(retained,baseline.snapshot);
  buildBaozhongEastHall(single,z);singleGroup=single.finish();
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
  const collider=d.colliders.find(c=>!c.triangleSupport?.id?.startsWith('baozhong-east-hall/')&&!c.baozhongEastStoneTop),maxX=collider.max.x;
  collider.max.x+=.01;assert.notDeepEqual(snapshot(d),baseline.snapshot);collider.max.x=maxX;
  const array=oldRoof.geometry.attributes.position.array,first=array[0];array[0]=first+1;
  assert.notDeepEqual(roofHash(subtractRows(roofRows(d.group),newRoof)),baseline.roof);array[0]=first;
  assert.deepEqual(snapshot(d),baseline.snapshot);
  assert.deepEqual(roofHash(subtractRows(roofRows(d.group),newRoof)),baseline.roof);
  const cm=new CollisionManager();cm.rivers=[];cm.addColliders(d.colliders);cm.addWalkables(d.walkables);
  const W={THREE:T,cm};
  const report={scope:'ACTUAL_WEST_SIX_ZONE_ONLY_NOT_WORLD_OR_GPU',remoteBase:baseline.remoteBase,retained,roof,newRoof:newHash,allRoof:allHash,negativeGuards:['old mesh transform','old collider extent','old roof vertex'],own:runRoutes(t,W),yude:runYude(t,W),middleEntry:runMiddleEntry(t,W,{baseline:JSON.parse(fs.readFileSync(new URL('../r163-chongjing/middle-entry-baseline.json',import.meta.url)))}),diagonals:runDiagonals(t,W),poses:[]};
  for(const [x,z,feet] of [[102.35,496.5,.45],[102.35,492.4,.45],[102.35,500.6,.45],[105.7,496.5,0],[94.8,496.5,0]]) {
   assert.ok(Math.abs(cm.getGroundHeight(x,z,feet,.01)-feet)<1e-5);
   assert.equal(cm.checkCollision(new T.Vector3(x,feet+1.7,z),.65),false);
   report.poses.push({x,z,feet,radius:.65,nativeClear:true});
  }
  report.positiveRoutes=report.own.routes.length+report.yude.routes.length+report.middleEntry.length;
  report.negativeRoutes=report.own.negative.length+report.yude.negative.length;
  assert.equal(report.positiveRoutes,48);assert.equal(report.negativeRoutes,16);assert.equal(report.diagonals.length,8);
  report.maxRSSKiB=process.resourceUsage().maxRSS;
  if(process.env.H3_EVIDENCE_DIR) fs.writeFileSync(process.env.H3_EVIDENCE_DIR+'/production-zone.json',JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({retained,roof,newRoof:newHash,positiveRoutes:report.positiveRoutes,negativeRoutes:report.negativeRoutes,maxRSSKiB:report.maxRSSKiB}));
 } finally {builder.dispose();single.dispose(singleGroup??single.root);dispose();}
});
