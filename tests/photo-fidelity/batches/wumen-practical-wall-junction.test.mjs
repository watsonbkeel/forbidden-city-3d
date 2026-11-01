import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {captureGate} from '../../lib/wumen-practical-fixture.mjs';
import {installWumenPracticalAssembly} from '../../../src/scene/palace/special/WumenPracticalAssembly.js';
import {CollisionManager} from '../../../src/utils/Collision.js';
import {Enclosure} from '../../../src/scene/Enclosure.js';
import {WUMEN_PRACTICAL_FIT as FIT} from '../../../src/scene/palace/special/WumenPracticalFit.js';
const url=new URL('../../../src/scene/palace/special/WumenPracticalWallJunction.js',import.meta.url);
test('actual south enclosure wall has no ten-metre masonry through practical ascent corridors',async()=>{
 assert.ok(fs.existsSync(url),'practical ascents require matching visible south-wall recess, not collider-only pass');
 const {installWumenPracticalWallJunction}=await import(url),c=captureGate(),parent=new c.THREE.Group(),wall=new Enclosure(new c.THREE.Scene(),c.lib);
 const original=wall.addWallSegment;wall.addWallSegment=function(p,s,...rest){if(!installWumenPracticalWallJunction(this,p,s))original.call(this,p,s,...rest);};wall.buildOuterWalls(parent);parent.updateMatrixWorld(true);
 installWumenPracticalAssembly(c.builder,c.group,c.data,{colliderStart:0,walkableStart:0});const cm=new CollisionManager();cm.addColliders([...c.builder.colliders,...wall.colliders]);
 assert.equal(parent.children.filter(o=>o.userData.r157WumenWallJunction).length,2);
 for(const r of FIT.platform.recesses){const z0=Math.max(r.minZ,-5.4),z1=Math.min(r.maxZ,3.2);if(z0>=z1)continue;const x=(r.minX+r.maxX)/2,z=(z0+z1)/2-419.6,ray=new c.THREE.Raycaster(new c.THREE.Vector3(x,20,z),new c.THREE.Vector3(0,-1,0));assert.equal(ray.intersectObject(parent,true).length,0,'wall crosses '+r.id);assert.equal(wall.colliders.some(b=>b.containsPoint(new c.THREE.Vector3(x,1,z))),false,'stale wall proxy '+r.id);assert.equal(cm.checkCollision(new c.THREE.Vector3(x,1.7,z),.3),true,'closed slope masonry must fill cut wall footprint '+r.id);}
 for(const sign of[-1,1])assert.equal(cm.checkCollision(new c.THREE.Vector3(sign*95,8,-420.7),.3),true,'adjacent ten-metre wall must remain solid beside ascent');
 for(const sign of[-1,1]){const x=sign*110,z=-420.7,ray=new c.THREE.Raycaster(new c.THREE.Vector3(x,20,z),new c.THREE.Vector3(0,-1,0));assert.ok(ray.intersectObject(parent,true).length>0,'distant wall remains');assert.ok(wall.colliders.some(b=>b.containsPoint(new c.THREE.Vector3(x,1,z))),'distant wall proxy remains');}
 const untouched=new c.THREE.Group(),before=wall.colliders.length;assert.equal(installWumenPracticalWallJunction(wall,untouched,{x1:60,x2:300,z:99,h:10,t:8.6,brickH:1.5,wumenCapFit:{side:1}}),false);assert.equal(untouched.children.length,0);assert.equal(wall.colliders.length,before);
});

test('south city wall does not redraw hidden brick faces inside the already solid red Wumen platform',()=>{
 const c=captureGate(),wall=new Enclosure(new c.THREE.Scene(),c.lib),parent=new c.THREE.Group();wall.buildOuterWalls(parent);parent.updateMatrixWorld(true);
 const e=FIT.platform.envelope,platform=new c.THREE.Box3(new c.THREE.Vector3(-e.halfWidth,0,e.mainSouth-419.6),new c.THREE.Vector3(e.halfWidth,e.top,e.north-419.6)),overlaps=[];
 for(const group of parent.children.filter(o=>o.userData.r157WumenWallJunction))group.traverse(o=>{if(!o.isMesh||!['wall-base','wall-body'].includes(o.name))return;const overlap=new c.THREE.Box3().setFromObject(o).intersect(platform),size=overlap.getSize(new c.THREE.Vector3());if(size.x*size.y*size.z>.001)overlaps.push({side:group.name,part:o.name,volume:size.x*size.y*size.z});});
 assert.deepEqual(overlaps,[],'remove redundant hidden city-wall cells rather than leave large coplanar red/grey wall patches');
 installWumenPracticalAssembly(c.builder,c.group,c.data,{colliderStart:0,walkableStart:0});const cm=new CollisionManager();cm.addColliders([...c.builder.colliders,...wall.colliders]);for(const sign of[-1,1])assert.equal(cm.checkCollision(new c.THREE.Vector3(sign*62,6.7,-419.6),.3),true,'the existing full-height platform still owns the solid interface');
});
