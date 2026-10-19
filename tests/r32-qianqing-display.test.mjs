import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {registerHooks} from 'node:module';
registerHooks({load(u,c,n){if(u.endsWith('.json'))return{format:'module',source:'export default '+fs.readFileSync(new URL(u),'utf8'),shortCircuit:true};return n(u,c)}});
const T=await import('three'),{PalaceBuilder}=await import('../src/scene/PalaceBuilder.js'),{PALACE_LAYOUT}=await import('../src/scene/Layout.js'),{library}=await import('./lib/inner-palace-fixture.mjs');
const scene=new T.Scene(),builder=new PalaceBuilder(scene,library());builder.buildAll(PALACE_LAYOUT);scene.updateMatrixWorld(true);
function incenseBounds(root,sign){const b=new T.Box3(),v=new T.Vector3();root.traverse(o=>{if(!o.isMesh)return;const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld);if(sign*v.x>4.1)b.expandByPoint(v);}});assert.ok(!b.isEmpty());return b;}
const tris=o=>{let n=0;o.traverse(m=>{if(m.isMesh)n+=(m.geometry.index?.count??m.geometry.attributes.position.count)/3;});return n;};
test('four neutral covered-vessel assemblies replace the unsupported animal silhouettes with real open stands',async()=>{
 const {buildQianqingDisplay}=await import('../src/scene/palace/QianqingDisplay.js');
 const raw=buildQianqingDisplay(builder);raw.updateMatrixWorld(true);
 const items=raw.children.filter(o=>o.name==='qianqing-covered-vessel-on-open-stand');assert.equal(items.length,4);
 assert.equal(raw.userData.objectIdentityVerified,false);
 assert.equal(raw.children.some(o=>/crane|luduan|pedestal/.test(o.name)),false);
 for(const [i,o]of items.entries()){
  assert.equal(o.position.x,[-3.1,-1.9,1.9,3.1][i]);assert.equal(o.position.z,3.5);assert.equal(o.userData.objectIdentityVerified,false);
  const b=new T.Box3().setFromObject(o);assert.ok(Math.abs(b.min.y-.7)<1e-5&&Math.abs(b.max.y-2.35)<1e-5);
  assert.ok(b.min.x>=o.position.x-.461&&b.max.x<=o.position.x+.461);assert.ok(b.min.z>=3.039&&b.max.z<=3.961);assert.ok(tris(o)<=480);
  const ray=new T.Raycaster(new T.Vector3(o.position.x,1.2,2.5),new T.Vector3(0,0,1),0,2);assert.equal(ray.intersectObject(o,true).length,0,'open space through the stand is actual geometry');
  assert.ok(o.children.filter(m=>m.name==='open-stand-support').length===4);
 }
 assert.ok(tris(raw)<=3300);const materials=new Set();raw.traverse(o=>{if(o.isMesh)materials.add(o.material);});assert.ok(materials.size<=4);
});
test('Qianqing incense pavilions and paired display objects exist before optional loading',()=>{
 const root=scene.getObjectByName('qianqing-permanent-display');assert.ok(root,'B state must retain the same six principal display objects');
 assert.equal(root.userData.displayObjects,6);assert.match(root.userData.dimensions,/PHOTO_RELATIVE/);assert.equal(root.userData.photoDateKnown,false);
 assert.equal(root.isLOD,true);assert.ok(tris(root.levels[0].object)<=3300,'near permanent transfer is counted and bounded');assert.ok(tris(root.levels[1].object)<=700,'far geometry is separately counted');assert.ok(tris(root)<=4000,'both resident levels count toward memory');
});
test('two incense pavilions stand outside the dais on the floor, never float on its .7m platform',()=>{
 const root=scene.getObjectByName('qianqing-permanent-display');assert.ok(root,'permanent objects required');
 for(const s of[-1,1]){const b=incenseBounds(root,s);assert.ok(s<0?b.max.x< -4.09:b.min.x>4.09);assert.ok(Math.abs(b.min.y-2.16)<1e-4);assert.ok(b.max.y<3.77);assert.ok(b.min.z>=316.49&&b.max.z<=317.51);}
});
test('new floor-side objects have corresponding permanent collision and leave a real side lane',()=>{
 const root=scene.getObjectByName('qianqing-permanent-display');assert.ok(root);
 for(const s of[-1,1]){const actual=incenseBounds(root,s);assert.ok(builder.colliders.some(b=>b.min.x<=actual.min.x+.01&&b.max.x>=actual.max.x-.01&&b.min.y<=2.16&&b.max.y>=actual.max.y-.01&&b.min.z<=actual.min.z+.01&&b.max.z>=actual.max.z-.01));
 const p=new T.Vector3(s*6.45,3.1,318.1);assert.equal(builder.colliders.some(b=>b.clone().expandByVector(new T.Vector3(.5,0,.5)).containsPoint(p)),false,'one-metre player lane');}
});
test('central scene has a distinct front table and articulated chair rather than a broad blank back slab',()=>{
 const core=scene.getObjectByName('qianqing-central-setting-detail');assert.ok(core);assert.equal(core.userData.displayRevision,'r32-photo-relative-main-scene');
 const shape=core.userData.displaySummary;assert.equal(shape.frontTable,true);assert.equal(shape.chairBack,'articulated-outline');assert.equal(shape.screens,5);assert.equal(shape.stairFlights,3);
});
test('Qianqing boxed ceiling uses private low-contrast material and real shallow grid without a caisson',()=>{
 const g=scene.getObjectByName('qianqing-panelled-ceiling-r32');assert.ok(g);assert.ok(tris(g)>100&&tris(g)<1800);assert.equal(g.userData.caisson,false);assert.match(g.userData.layoutStatus,/PHOTO_RELATIVE/);
 const shared=builder._own.get('ceiling');g.traverse(m=>{if(m.isMesh){assert.notEqual(m.material,shared);assert.ok(m.geometry.attributes.position.array.every(Number.isFinite));}});
});
