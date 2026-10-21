import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {cpuDracoLoader} from './lib/cpu-draco.mjs';
import {library} from './lib/inner-palace-fixture.mjs';
import {CourtKit} from '../src/scene/palace/kit.js';
import {CollisionManager} from '../src/utils/Collision.js';
import {PLAYER} from '../src/config/constants.js';
import {resolveRemainingProfile,augmentRemainingHall} from '../src/scene/palace/special/RemainingNingshouHalls.js';
const item=JSON.parse(readFileSync(new URL('../data/zones/ningshou.json',import.meta.url))).items.find(i=>i.name==='皇极殿');
const bytes=readFileSync(new URL('../public/models/interiors/huangji-aligned-0a79ec49e8cd.glb',import.meta.url));
assert.equal(createHash('sha256').update(bytes).digest('hex'),'0a79ec49e8cd442d363fdc6bccf4074d9e214ef3b0f3b56eba618297c1e88cc6');
const gltf=await new GLTFLoader().setDRACOLoader(await cpuDracoLoader()).parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
gltf.scene.position.set(item.x,item.ph,item.z);gltf.scene.updateMatrixWorld(true);
const asset=[];gltf.scene.traverse(m=>{if(m.isMesh)asset.push(m);});
const meshBounds=m=>new THREE.Box3().setFromObject(m);
const serial=b=>({min:b.min.toArray(),max:b.max.toArray()});
function make(){const kit=new CourtKit(library(),'ningshou'),old=kit.hall(item),oldRoof=old.f.children.find(g=>g.name.startsWith('roof_')),oldMeshes=[...old.f.children].filter(m=>m.isMesh),oldColliders=[...kit.colliders],p=resolveRemainingProfile('ningshou',item),built=augmentRemainingHall(kit,item,old,p);kit.buildPlaqueAtlas();built.f.updateMatrixWorld(true);return{kit,...built,p,oldRoof,oldMeshes,oldColliders};}
const find=(root,role)=>{const out=[];root.traverse(m=>{if(m.isMesh&&m.userData.role===role)out.push(m)});return out;};
let report;
test('Huangji original four fallback meshes and single collider survive nine-bay augmentation and merge',()=>{
 const{kit,f,p,oldRoof,oldMeshes,oldColliders}=make();try{const fallback=find(f,'huangji-kit-throne-fallback');assert.equal(fallback.length,4);assert.deepEqual(fallback.map(m=>m.userData.fallbackPart).sort(),['back','dais','screen','seat']);for(const m of fallback){assert.ok(oldMeshes.includes(m));assert.equal(m.userData.noMerge,true);assert.equal(m.userData.catalogId,p.id);assert.ok(kit.owned.includes(m.material));assert.equal(m.visible,true);}
 assert.equal(oldRoof.parent,f);assert.equal(f.userData.structure.actualFacadeBays,9);assert.equal(f.userData.structure.legacyFallbackContract.width,4.648);assert.equal(find(f,'column').length,28);
 const ownedProxy=kit.colliders.filter(b=>b.userData?.role==='huangji-kit-throne-fallback-collider');assert.equal(ownedProxy.length,1);assert.ok(oldColliders.includes(ownedProxy[0]));
 const cm=new CollisionManager();cm.rivers=[];cm.addColliders(kit.colliders);cm.addWalkables(kit.walkables);for(const q of p.portals){assert.equal(cm.checkCollision(new THREE.Vector3(q.worldX,p.ph+PLAYER.HEIGHT,q.worldZ)),false);for(const a of q.approachPoints)assert.ok(Math.abs(cm.getGroundHeight(a.x,a.z,a.feetY,PLAYER.STEP_UP)-a.feetY)<.03);}
 const materials=fallback.map(m=>m.material),disposed=new Map();materials.forEach(m=>m.addEventListener('dispose',()=>disposed.set(m,(disposed.get(m)??0)+1)));const group=kit.finish();assert.equal(find(group,'huangji-kit-throne-fallback').length,4);kit.dispose(group);for(const m of materials)assert.equal(disposed.get(m),1);
 }finally{if(kit.colliders.length)kit.dispose(f);}
});
test('Huangji retained throne collider is inside actual decoded existing GLB proxy and visible dais footprint, not widened by new bays',()=>{
 const{kit,f}=make();try{const old=kit.colliders.find(b=>b.userData?.role==='huangji-kit-throne-fallback-collider'),proxy=meshBounds(asset.find(m=>m.name==='COL_dais')),visible=meshBounds(asset.find(m=>m.name==='dais_low')),walk=meshBounds(asset.find(m=>m.name==='WALK_dais_low'));assert.ok(proxy.clone().expandByScalar(.001).containsBox(old));for(const axis of['x','z']){assert.ok(old.min[axis]>=visible.min[axis]);assert.ok(old.max[axis]<=visible.max[axis]);}assert.ok(Math.abs(old.min.y-visible.min.y)<.001);assert.ok(walk.min.distanceTo(visible.min)<.001&&walk.max.distanceTo(visible.max)<.001);
 const origin=new THREE.Vector3(item.x,item.ph,item.z),local=b=>({min:b.min.clone().sub(origin).toArray(),max:b.max.clone().sub(origin).toArray()});report={assetSHA256:'0a79ec49e8cd442d363fdc6bccf4074d9e214ef3b0f3b56eba618297c1e88cc6',method:'Actual original CourtKit collider and decoded Draco meshes with full hierarchy and placement',oldKitCollider:{world:serial(old),floorRelative:local(old)},existingGLBCOL_dais:{world:serial(proxy),floorRelative:local(proxy)},actualVisibleDaisLow:{world:serial(visible),floorRelative:local(visible)},existingWALK_dais_low:{world:serial(walk),floorRelative:local(walk)},maximumOldBoxOutsideProxyY:old.max.y-proxy.max.y,toleranceMetres:.001,notExactSculptureCollision:true,limitation:'Both the original kit and the existing GLB use a conservative three-metre keepout prism above the non-walkable upper dais. Air above the low visible dais is NOT claimed to be solid sculpture. The retained box introduces no new footprint beyond the already shipped GLB proxy, within 1 mm Draco tolerance.'};
 }finally{kit.dispose(f);}
});
test('Huangji fitted coffer boards do not intersect actual decoded caisson or gold pillar triangles',()=>{
 const{kit,f}=make();try{const boards=find(f,'huangji-fitted-coffer-panel'),boxes=boards.map(meshBounds),minY=Math.min(...boxes.map(b=>b.min.y)),maxY=Math.max(...boxes.map(b=>b.max.y)),tri=new THREE.Triangle();let checked=0;
 for(const m of asset){if(/^(COL_|WALK_)/.test(m.name))continue;const a=m.geometry.attributes.position,idx=m.geometry.index;for(let i=0;i<(idx?.count??a.count);i+=3){tri.a.fromBufferAttribute(a,idx?idx.getX(i):i).applyMatrix4(m.matrixWorld);tri.b.fromBufferAttribute(a,idx?idx.getX(i+1):i+1).applyMatrix4(m.matrixWorld);tri.c.fromBufferAttribute(a,idx?idx.getX(i+2):i+2).applyMatrix4(m.matrixWorld);if(Math.max(tri.a.y,tri.b.y,tri.c.y)<minY||Math.min(tri.a.y,tri.b.y,tri.c.y)>maxY)continue;checked++;for(const b of boxes)assert.equal(b.intersectsTriangle(tri),false,`${m.name} intersects fitted coffer`);}}
 assert.ok(checked>0,'test must actually include overlapping-height asset triangles');assert.ok(boards.length>30);
 }finally{kit.dispose(f);}
});
test.after(()=>{if(process.env.R48_WRITE_ASSET_REPORTS==='1')writeFileSync(new URL('../docs/current-state/r48-remaining/ningshou-huangji-collision-contract.json',import.meta.url),JSON.stringify(report,null,2)+'\n');gltf.scene.traverse(m=>{if(m.isMesh){m.geometry.dispose();if(m.material)m.material.dispose();}});});
