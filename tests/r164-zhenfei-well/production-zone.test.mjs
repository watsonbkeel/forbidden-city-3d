import fs from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import '../lib/inner-palace-fixture.mjs';
import {ZoneBase} from '../../src/scene/zones/ZoneBase.js';
import {CollisionManager} from '../../src/utils/Collision.js';
import {createActualLibrary} from '../r158-cumulative-1600/library.mjs';
import {snapshot} from './snapshot.mjs';
import {roofRows,roofHash} from '../r163-west-sidehall-c12/roof-proof.mjs';
import {runRoutes} from './route-runner.mjs';
const baseline=JSON.parse(fs.readFileSync(new URL('./baseline.json',import.meta.url)));
test('actual NingShou retains main objects and roof, well identity, native routes and blocking controls',t=>{
 const{library,dispose}=createActualLibrary(),z=JSON.parse(fs.readFileSync(new URL('../../data/zones/ningshou.json',import.meta.url))),b=new ZoneBase(library,z);
 try{
  const d=b.build(),arch=d.group.userData.architecture;
  assert.equal(arch.filter(a=>a.sourceObjectId==='FC-EBADA47212').length,1);
  const well=arch.find(a=>a.sourceObjectId==='FC-EBADA47212');assert.equal(well.name,'珍妃井');assert.equal(well.wholeObjectAccepted,false);assert.equal(well.newRooms,0);assert.equal(well.newMapItems,0);
  const retained=snapshot(d),roof=roofHash(roofRows(d.group));assert.deepEqual(retained,baseline.snapshot);assert.deepEqual(roof,baseline.roof);
  const meshes=[];let old,oldRoof;d.group.traverse(m=>{if(!m.isMesh)return;if(m.material.name.startsWith('r164_zhenfei_'))meshes.push(m);else{old??=m;if(/roof_tile|kit_roof/.test(m.material.name))oldRoof??=m;}});assert.equal(meshes.length,2);assert.equal(d.colliders.length,baseline.snapshot.colliderCount+2);assert.equal(d.walkables.length,baseline.snapshot.walkableCount);
  const pos=old.position.x;old.position.x+=.01;assert.notDeepEqual(snapshot(d),baseline.snapshot);old.position.x=pos;
  const c=d.colliders.find(c=>!c.triangleSupport?.id?.startsWith('zhenfei-well/')),max=c.max.x;c.max.x+=.01;assert.notDeepEqual(snapshot(d),baseline.snapshot);c.max.x=max;
  const a=oldRoof.geometry.attributes.position.array,x=a[0];a[0]=x+1;assert.notDeepEqual(roofHash(roofRows(d.group)),baseline.roof);a[0]=x;
  assert.deepEqual(snapshot(d),baseline.snapshot);assert.deepEqual(roofHash(roofRows(d.group)),baseline.roof);
  const cm=new CollisionManager();cm.rivers=[];cm.addColliders(d.colliders);cm.addWalkables(d.walkables);
  const routes=runRoutes(t,{THREE:T,cm});assert.equal(routes.positive.length,48);assert.equal(routes.negative.length,20);
  const impact=cm.resolveTriangleVertical(-278.1,510.6,3,-1,1/30);assert.equal(impact.landed,true);assert.ok(Math.abs(impact.feet-.85)<1e-5);
  for(const[x,z]of[[-279.7,510.6],[-276.5,510.6],[-278.1,509],[-278.1,512.2]]){assert.equal(cm.checkCollision(new T.Vector3(x,1.7,z),.65),false);assert.equal(cm.getGroundHeight(x,z,0,.01),0);}
  const report={scope:'ACTUAL_NINGSHOU_ONLY_NOT_WORLD_OR_GPU',remoteBase:baseline.remoteBase,retained,roof,negativeGuards:['old mesh transform','old collider extent','old roof vertex'],newMeshes:2,newTriangleOwners:2,newTriangles:meshes.reduce((n,m)=>n+(m.geometry.index?.count??m.geometry.attributes.position.count)/3,0),routes,verticalImpact:impact,maxRSSKiB:process.resourceUsage().maxRSS};
  if(process.env.ZHENFEI_EVIDENCE_DIR)fs.writeFileSync(process.env.ZHENFEI_EVIDENCE_DIR+'/production-zone.json',JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({...report,routes:{positive:routes.positive.length,negative:routes.negative.length}}));
 }finally{b.dispose();dispose();}
});
