import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import * as T from 'three';
import {CourtKit} from '../../../src/scene/palace/kit.js';import {CollisionManager} from '../../../src/utils/Collision.js';import {library} from '../../lib/inner-palace-fixture.mjs';import {walkStraight} from '../../lib/world.mjs';
const url=new URL('../../../src/scene/palace/BaoheLinkedGalleries.js',import.meta.url),axis=JSON.parse(fs.readFileSync(new URL('../../../data/zones/axis-courts.json',import.meta.url)));
for(const index of[31,37])test(`Baohe gallery ${index} has a real continuous front veranda through independently identified arched firewalls`,async()=>{
 assert.ok(fs.existsSync(url),'generic closed-room partitions do not reproduce Baohe linked galleries');const{buildBaoheLinkedGallery}=await import(url),kit=new CourtKit(library(),'axis-courts');
 try{const f=buildBaoheLinkedGallery(kit,axis.items[index],index);f.updateMatrixWorld(true);const p=f.userData.structure;assert.equal(p.segmentCount,6);assert.equal(p.firewalls.length,7);assert.equal(p.exactSegmentLocationsSurveyed,false);assert.equal(p.inventory,'UNKNOWN_NOT_BUILT');
  assert.equal(kit.root.children.length,1);const cm=new CollisionManager();cm.rivers=[];cm.addColliders(kit.colliders);cm.addWalkables(kit.walkables);
  const point=(x,y,z)=>new T.Vector3(x,y,z).applyMatrix4(f.matrixWorld),a=point(-p.length/2-.2,p.floorY,p.verandaCenter),b=point(p.length/2+.2,p.floorY,p.verandaCenter);
  for(const step of[.4,.8])for(const[u,v]of[[a,b],[b,a]]){const r=walkStraight({THREE:T,cm},[u.x,u.z],[v.x,v.z],{step,feet0:p.floorY});assert.ok(r.reached>r.total-.3,JSON.stringify(r));}
  for(const wall of p.firewalls){const inside=point(wall.x,p.floorY+1.7,p.verandaCenter),solid=point(wall.x,p.floorY+1.7,1.1);assert.equal(cm.checkCollision(inside,.5),false);assert.equal(cm.checkCollision(solid,.5),true);}
  const roles=[];f.traverse(m=>{if(m.isMesh)roles.push(m.userData.baoheGalleryPart);});assert.ok(roles.includes('stone-arch-ring'));assert.ok(roles.includes('red-firewall'));assert.equal(roles.filter(r=>r==='front-column').length,40);
  const archMeshes=[];f.traverse(m=>{if(m.isMesh&&['stone-arch-ring','red-firewall'].includes(m.userData.baoheGalleryPart))archMeshes.push(m);});
  const origin=point(p.firewalls[1].x,p.floorY+2.4,p.verandaCenter),hits=new T.Raycaster(origin,new T.Vector3(0,1,0),0,1).intersectObjects(archMeshes),stone=hits.find(h=>h.object.userData.baoheGalleryPart==='stone-arch-ring'),red=hits.find(h=>h.object.userData.baoheGalleryPart==='red-firewall');
  assert.ok(stone&&red);assert.ok(red.distance-stone.distance>.15,'stone intrados must not be coplanar with a duplicate red wall surface');
 }finally{kit.dispose(kit.root);}
});
test('wrong gallery index or furniture identity is rejected before mutation',async()=>{const{buildBaoheLinkedGallery}=await import(url),kit=new CourtKit(library(),'axis-courts');try{assert.throws(()=>buildBaoheLinkedGallery(kit,axis.items[28],28),/Baohe/);assert.equal(kit.root.children.length,0);}finally{kit.dispose(kit.root);}});
