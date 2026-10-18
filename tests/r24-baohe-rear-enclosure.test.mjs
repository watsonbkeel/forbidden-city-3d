import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {PalaceBuilder} from '../src/scene/PalaceBuilder.js';
import {HistoricalR23PalaceBuilder as R23Builder} from './lib/historical-r23-baohe-fixture.mjs';
import {PALACE_LAYOUT} from '../src/scene/Layout.js';
import {library,hash,sceneRows,hallSurfaces} from './lib/inner-palace-fixture.mjs';
import {buildBaoheRearEnclosure,BAOHE_REAR_ENCLOSURE as P} from '../src/scene/palace/BaoheRearEnclosure.js';
import nav from './fixtures/r22-baohe-navigation-delta.json' with {type:'json'};
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-5,`${a} != ${b}`);
const data=PALACE_LAYOUT.find(h=>h.name==='保和殿');
function hall(Builder,name='保和殿'){const b=new Builder(new THREE.Scene(),library()),g=new THREE.Group();b.buildHall(g,PALACE_LAYOUT.find(h=>h.name===name),9,{heightReferenceY:10});g.updateMatrixWorld(true);return{b,g};}
const before=hall(R23Builder),after=hall(PalaceBuilder);
const tris=g=>g.children.reduce((n,m)=>n+(m.isMesh?(m.geometry.index?.count??m.geometry.attributes.position.count)/3:0),0);
function identity(mesh){const s=new THREE.Scene(),g=new THREE.Group();g.name='selected';g.add(mesh.clone());s.add(g);return sceneRows(s).selected;}

test('rear has two continuous solid wings around exactly the retained central span',()=>{
 const walls=after.g.children.filter(m=>m.userData.baoheRearEnclosure);assert.equal(walls.length,2);assert.deepEqual(P.solidBays,[0,1,2,6,7,8]);
 for(const wall of walls){const box=new THREE.Box3().setFromObject(wall),positive=wall.position.x>0;near(box.min.x,positive?9.15:-24.85);near(box.max.x,positive?24.85:-9.15);near(box.min.y,9);near(box.max.y,15.3536);near(box.min.z,133.5);near(box.max.z,134.5);assert.equal(wall.material.name,'wall_red');assert.equal(wall.castShadow,true);assert.equal(wall.receiveShadow,true);assert.match(wall.userData.baoheRearEnclosure.status,/NOT_SURVEY/);}
 const lattice=after.g.children.filter(m=>m.material?.name==='lattice_doors');assert.equal(lattice.length,6,'only inherited central rear folded leaves remain');assert.ok(lattice.every(m=>Math.abs(m.position.x)<9.15));
});
test('tapered intermediate rear post bases stay fully inside each solid wing without visible slivers',()=>{
 const walls=after.g.children.filter(m=>m.userData.baoheRearEnclosure);
 for(const post of after.g.children.filter(m=>m.userData.baoheColumn?.k===5&&[1,2,7,8].includes(m.userData.baoheColumn.i))){
  const pb=new THREE.Box3().setFromObject(post),wall=walls.find(m=>Math.sign(m.position.x)===Math.sign(post.position.x)),wb=new THREE.Box3().setFromObject(wall);
  assert.ok(pb.min.x>wb.min.x&&pb.max.x<wb.max.x);assert.ok(pb.min.z>wb.min.z+.02&&pb.max.z<wb.max.z-.02,'at least2cm geometric cover for retained post taper');
 }
});
test('current change preserves every front face, six rear leaves, roof and other unselected hall parts',()=>{
 const isOldWing=m=>m.material?.name==='lattice_doors'&&Math.abs(m.position.x)>9.15&&Math.abs(m.position.z-134)<.01;
 const isUpper=m=>m.material?.name==='wall_red'&&Math.abs(m.position.z-134)<.01&&Math.abs(m.position.y-14.7186)<.001;
 const aa=before.g.children.filter(m=>!isOldWing(m)&&!isUpper(m));const bb=after.g.children.filter(m=>!m.userData.baoheRearEnclosure&&!isUpper(m));
 assert.equal(before.g.children.filter(isOldWing).length,6);assert.equal(before.g.children.filter(isUpper).length,1);assert.equal(after.g.children.filter(isUpper).length,1);assert.equal(aa.length,bb.length);
 for(let i=0;i<aa.length;i++)assert.deepEqual(identity(aa[i]),identity(bb[i]),`retained hall child ${i}`);
 assert.equal(tris(after.g)-tris(before.g),-48);
});
test('all navigation and seven other whole scene groups remain identical to R23',()=>{
 const build=Builder=>{const s=new THREE.Scene(),b=new Builder(s,library());b.buildAll(PALACE_LAYOUT);return{b,s,rows:sceneRows(s)}};const a=build(R23Builder),c=build(PalaceBuilder);
 try{assert.equal(hash({colliders:c.b.colliders,walkables:c.b.walkables}),nav.afterSHA256);assert.equal(JSON.stringify(c.b.colliders),JSON.stringify(a.b.colliders));assert.equal(JSON.stringify(c.b.walkables),JSON.stringify(a.b.walkables));
 for(const[name,row]of Object.entries(a.rows))if(name!=='三台')assert.deepEqual(c.rows[name],row,name);assert.equal(c.rows['三台'].triangles-a.rows['三台'].triangles,-48);assert.equal(c.rows['三台'].meshes,a.rows['三台'].meshes);
 }finally{a.b.dispose();c.b.dispose();}
});
test('Taihe and Qianqing complete unmerged hall surfaces remain unchanged',()=>{
 for(const name of ['太和殿','乾清宫']){const a=hall(R23Builder,name),c=hall(PalaceBuilder,name);try{assert.deepEqual(hallSurfaces(a.g,9),hallSurfaces(c.g,9));}finally{a.b.dispose();c.b.dispose();}}
});
test('wing dimensions are validated before drawing and helper never changes navigation or creates material',()=>{
 const b=new PalaceBuilder(new THREE.Scene(),library()),g=new THREE.Group(),args={x0:0,zf:134,y:9,w:49.7,height:6.354,openLeft:-9.15,openRight:9.15};
 const beforeNav=hash({colliders:b.colliders,walkables:b.walkables});buildBaoheRearEnclosure(b,g,args);assert.equal(beforeNav,hash({colliders:b.colliders,walkables:b.walkables}));assert.equal(g.children[0].material,g.children[1].material);
 for(const change of [{w:0},{height:NaN},{openLeft:-24.85},{openRight:24.85},{openRight:-10},{zf:Infinity}])assert.throws(()=>buildBaoheRearEnclosure(b,new THREE.Group(),{...args,...change}));b.dispose();
});
