import {runWidthPredecessor} from '../../lib/wumen-side-portal-historical-runner.mjs';
import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {captureRightLeaf,retainedSignature} from '../../lib/wumen-right-leaf-fixture.mjs';
const baseline=JSON.parse(fs.readFileSync(new URL('../../fixtures/r157-wumen-right-leaf/retained-be395.json',import.meta.url)));
function groups(c){const a=[];c.group.traverse(o=>{if(o.userData.wumenRightLeafStuds)a.push(o);});return a;}
test('real buildGate adds only right side+1 outer leaf visible-site studs',()=>{
 for(const open of [true,false]){const c=captureRightLeaf(open);try{
  const a=groups(c);assert.equal(a.length,1);const g=a[0];assert.equal(g.children.length,69);const hinge=g.parent,leaf=hinge.children.find(o=>o.userData.wumenLowerPart==='door-solid');assert(leaf);assert.deepEqual(g.position.toArray(),leaf.position.toArray());
  const frame=hinge.parent;assert.equal(frame.name,'wumen-lower-door/west-yemen');assert(hinge.position.x>0);assert.equal(frame.rotation.y,Math.PI/2);assert.equal(hinge.rotation.y,open?Math.PI/2:0);
  assert.deepEqual(g.userData.wumenRightLeafStuds.absentSites,[[7,8],[8,8]]);assert.deepEqual(g.userData.wumenRightLeafStuds.unobservedSites,[[9,1]]);
  const sites=g.children.map(o=>o.userData.site.join(','));assert.equal(new Set(sites).size,69);for(const x of ['7,8','8,8','9,1'])assert(!sites.includes(x));assert(sites.includes('8,7'));
  for(const m of g.children){assert(m.isMesh);assert.equal(m.visible,true);assert.equal(m.material.visible,true);assert.equal(m.material.transparent,false);assert(m.position.z<=-.11);assert(m.position.x>-.89&&m.position.x<.89);assert(m.position.y>-2.6&&m.position.y<2.6);assert(m.geometry.attributes.position.count>20);}
 }finally{c.builder.dispose();}}
});
test('historical full-gate retained-record contract before main-width registration remains exact',()=>runWidthPredecessor(new URL('./wumen-right-leaf-retention.before-width.historical.mjs',import.meta.url)));
test('retained gate oracle rejects old leaf vertex or physics drift',()=>{
 const c=captureRightLeaf();try{const old=retainedSignature(c),leaf=c.group.getObjectByName('wumen-lower-door/east-yemen').children[0].children[0],a=leaf.geometry.attributes.position,x=a.getX(0);a.setX(0,x+.1);assert.notDeepEqual(retainedSignature(c),old);a.setX(0,x);c.builder.colliders[0].min.x+=.1;assert.notDeepEqual(retainedSignature(c),old);}finally{c.builder.dispose();}
});
test('actual cap axes keep photo-left ordering, outward hemisphere and omitted-site locations in both poses',()=>{
 for(const open of [true,false]){const c=captureRightLeaf(open);try{const T=c.THREE,g=groups(c)[0],leaf=g.parent.children.find(o=>o.userData.wumenLowerPart==='door-solid'),w=leaf.geometry.parameters.width,h=leaf.geometry.parameters.height;
  const seen=new Set();for(const m of g.children){const [r,col]=m.userData.site,u=.065+(col-1)*.875/7,v=.035+(r-1)*.935/8;assert(Math.abs(m.position.x-(.5-u)*w)<1e-12);assert(Math.abs(m.position.y-(.5-v)*h)<1e-12);assert.equal(m.position.z,-.11);assert.equal(m.rotation.x,-Math.PI/2);assert.deepEqual(m.scale.toArray(),[w*.0275,.015,w*.0275]);const key=r+','+col;assert(!seen.has(key));seen.add(key);
   const a=m.geometry.attributes.position;m.updateMatrix();for(let i=0;i<a.count;i++){const p=new T.Vector3().fromBufferAttribute(a,i).applyMatrix4(m.matrix);assert(p.z<=-.11+1e-7&&p.z>=-.125-1e-7);assert(Math.abs(p.x)<w/2&&Math.abs(p.y)<h/2);}}
  const n=new T.Vector3(0,0,-1).transformDirection(g.matrixWorld);assert(n.distanceTo(new T.Vector3(open?0:-1,0,open?1:0))<1e-8);
 }finally{c.builder.dispose();}}
});
test('real buildGate lifecycle disposes shared cap geometry and owned material exactly once',()=>{
 const c=captureRightLeaf();const g=groups(c)[0],geo=g.children[0].geometry,mat=g.children[0].material;let a=0,b=0;geo.addEventListener('dispose',()=>a++);mat.addEventListener('dispose',()=>b++);assert(g.children.every(o=>o.geometry===geo&&o.material===mat));c.builder.ownedObjects.add(c.group);c.builder.dispose();c.builder.dispose();assert.deepEqual([a,b],[1,1]);
});
test('new helper refuses duplicate or wrong physical leaf before allocations',async()=>{
 const {attachWumenRightLeafStuds:attach}=await import('../../../src/scene/palace/special/WumenRightLeafStuds.js');const c=captureRightLeaf();try{const g=groups(c)[0],leaf=g.parent.children.find(o=>o.userData.wumenLowerPart==='door-solid'),args={portalId:'west-yemen',side:1,width:leaf.geometry.parameters.width,height:leaf.geometry.parameters.height},before=[c.builder.ownedMaterials.length,g.parent.children.length];assert.throws(()=>attach(c.builder,leaf,args),/already/);assert.throws(()=>attach(c.builder,leaf,{...args,width:NaN}),/required/);assert.equal(attach(c.builder,leaf,{...args,portalId:'east-yemen'}),null);assert.deepEqual([c.builder.ownedMaterials.length,g.parent.children.length],before);}finally{c.builder.dispose();}
});
test('every actual cap triangle has finite nonzero area and an outward normal; geometry is not a flat decal',()=>{
 const c=captureRightLeaf();try{const T=c.THREE,g=groups(c)[0],m=g.children[0],a=m.geometry.attributes,idx=m.geometry.index,nm=new T.Matrix3().getNormalMatrix(m.matrix);let area=0,zmin=Infinity,zmax=-Infinity;
  for(let i=0;i<a.position.count;i++){const p=new T.Vector3().fromBufferAttribute(a.position,i).applyMatrix4(m.matrix),n=new T.Vector3().fromBufferAttribute(a.normal,i).applyNormalMatrix(nm);assert([p.x,p.y,p.z,n.x,n.y,n.z].every(Number.isFinite));assert(n.z<=1e-6);zmin=Math.min(zmin,p.z);zmax=Math.max(zmax,p.z);}
  for(let i=0;i<idx.count;i+=3){const p=[0,1,2].map(k=>new T.Vector3().fromBufferAttribute(a.position,idx.getX(i+k)).applyMatrix4(m.matrix)),cross=p[1].clone().sub(p[0]).cross(p[2].clone().sub(p[0]));assert(cross.length()>1e-12);area+=cross.length()/2;assert(cross.z<=1e-10);}
  assert(area>0);assert(Math.abs(zmin+.125)<1e-6);assert(Math.abs(zmax+.11)<1e-6);assert(zmax-zmin>.0149);
 }finally{c.builder.dispose();}
});
test('canonical finish keeps actual merged cap triangles and bounded evidence identity',async()=>{
 const {PalaceBuilder}=await import('../../../src/scene/PalaceBuilder.js'),{realTextureLibrary}=await import('../../lib/r48-real-texture-library.mjs');
 for(const open of [true,false]){const c=captureRightLeaf(open),lib=realTextureLibrary(),scene=new c.THREE.Scene(),b=new PalaceBuilder(scene,lib);try{b.buildGate({...c.data,lowerDoorsOpen:open});const root=scene.children.find(o=>o.name==='午门');assert(root);const matches=root.children.filter(o=>o.material?.name==='wumen_right_yemen_stud_gold_fit');assert.equal(matches.length,1);const merged=matches[0],expected=[];for(const cap of groups(c)[0].children){const geo=cap.geometry.toNonIndexed();geo.applyMatrix4(cap.matrixWorld);expected.push(...geo.attributes.position.array);geo.dispose();}assert.deepEqual(Array.from(merged.geometry.attributes.position.array),expected);assert.equal(merged.geometry.attributes.position.count,69*132*3);const meta=root.userData.architecture.find(o=>o.id==='axis/wumen-lower/west-yemen/visible-studs');assert(meta);assert.equal(meta.visibleSiteCount,69);assert.deepEqual(meta.absentSites,[[7,8],[8,8]]);assert.equal(b.colliders.length,452);assert.equal(b.walkables.length,16);
 }finally{b.dispose();lib.dispose();c.builder.dispose();}}
});
test('shared face verifier rejects group visibility/scale, column flip, dropped visible and invented absent site',async()=>{
 const {verifyStudFace}=await import('../../lib/wumen-right-leaf-fixture.mjs');const c=captureRightLeaf();try{const g=groups(c)[0],leaf=g.parent.children.find(o=>o.userData.wumenLowerPart==='door-solid');verifyStudFace(c);
  g.visible=false;assert.throws(()=>verifyStudFace(c));g.visible=true;g.scale.x=2;assert.throws(()=>verifyStudFace(c));g.scale.x=1;
  const cap=g.children[0],x=cap.position.x;cap.position.x=-x;assert.throws(()=>verifyStudFace(c));cap.position.x=x;
  const keep=g.children.find(o=>o.userData.site.join(',')==='8,7'),idx=g.children.indexOf(keep);g.remove(keep);assert.throws(()=>verifyStudFace(c));g.add(keep);g.children.splice(g.children.indexOf(keep),1);g.children.splice(idx,0,keep);
  const clone=cap.clone();clone.userData={site:[7,8]};g.add(clone);assert.throws(()=>verifyStudFace(c));g.remove(clone);
  for(const angle of [0,Math.PI/4,Math.PI/2]){g.parent.rotation.y=angle;verifyStudFace(c);c.group.updateMatrixWorld(true);const delta=new c.THREE.Matrix4().copy(leaf.matrixWorld).invert().multiply(g.matrixWorld);assert(delta.elements.every((v,i)=>Math.abs(v-(i%5===0?1:0))<1e-12));}
 }finally{c.builder.dispose();}
});
test('cap equator physically touches the unchanged wood face without a hidden air gap',()=>{
 const c=captureRightLeaf();try{const g=groups(c)[0],leaf=g.parent.children.find(o=>o.userData.wumenLowerPart==='door-solid'),face=-leaf.geometry.parameters.depth/2;for(const m of g.children)assert.equal(m.position.z,face);}finally{c.builder.dispose();}
});
