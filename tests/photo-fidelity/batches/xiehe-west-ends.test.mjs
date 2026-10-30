import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {execFileSync} from 'node:child_process';
import {fixture,roles,geometryHealth,meshRows,hash} from '../../lib/r58-court-facade-fixture.mjs';
const done=h=>{h.kit.dispose(h.kit.root);h.lib.dispose();};
test('Xiehe own north AND south west-hall views produce closed end-room partitions with inset lattice doors',()=>{
 const h=fixture('xiehe');try{
 const groups=roles(h.frame,'xiehe-west-end-partition');assert.equal(groups.length,2);
 assert.deepEqual(groups.map(g=>g.userData.end).sort(),['north','south']);
 for(const group of groups){assert.equal(group.userData.sourceSphere,'2054726937396219918');assert.equal(group.userData.measured,false);
 const leaf=roles(group,'xiehe-west-narrow-door-lower');assert.equal(leaf.length,1);
 const head=roles(group,'xiehe-west-narrow-door-head')[0];head.geometry.computeBoundingBox();leaf[0].geometry.computeBoundingBox();assert.ok(head.geometry.boundingBox.max.y-head.geometry.boundingBox.min.y<=.35,'own photos put narrow door head just below wall/painted beam');
 assert.ok(leaf[0].geometry.boundingBox.max.y-leaf[0].geometry.boundingBox.min.y>2.5,'solid lower half follows own leaf proportion');
 assert.ok(roles(group,'xiehe-west-narrow-door-lattice').length>4);
 assert.equal(roles(group,'xiehe-west-end-side-wall').length,2);
 assert.equal(roles(group,'xiehe-west-narrow-door-head').length,1);
 }
 geometryHealth(h.frame);
 }finally{done(h);}
});
test('Both real closed end doors block bodies while every west vestibule portal remains open at cardinal rotations',()=>{
 for(const rot of[0,Math.PI/2,Math.PI,3*Math.PI/2]){const h=fixture('xiehe',{rot});try{
 const groups=roles(h.frame,'xiehe-west-end-partition');assert.equal(groups.length,2);
 for(const group of groups){const p=group.localToWorld(new T.Vector3(0,h.g.platformY+1.7,1.5));assert.ok(h.cm.checkCollision(p,.3));}
 for(const p of h.g.portals){const[x,z]=h.g.toWorld(p.centerX,2.5);assert.equal(h.cm.checkCollision(new T.Vector3(x,h.g.platformY+1.7,z),.3),false);}
 }finally{done(h);}}
});
test('Other side gates do not inherit Xiehe west partition additions',()=>{for(const profile of['xihe','jingyun','longzong']){const h=fixture(profile);try{assert.equal(roles(h.frame,'xiehe-west-end-partition').length,0);}finally{done(h);}}});
test('Lattice triangles match visible world geometry and do not fill real grille holes after final merge',()=>{
 const h=fixture('xiehe',{x:0,z:0,rot:0});let merged;try{
 const bars=roles(h.frame,'xiehe-west-narrow-door-lattice'),owners=h.kit.colliders.filter(b=>b.triangleSupport?.id.startsWith('xiehe-west-lattice:'));
 assert.equal(owners.length,bars.length);assert.ok(owners.length>12);
 for(let i=0;i<bars.length;i++){
  const m=bars[i],g=m.geometry,p=g.attributes.position,ix=g.index;const expected=[];
  for(let j=0;j<(ix?.count??p.count);j++)expected.push(new T.Vector3().fromBufferAttribute(p,ix?ix.getX(j):j).applyMatrix4(m.matrixWorld));
  const actual=owners[i].triangleSupport.template.triangles.flatMap(t=>[t.triangle.a,t.triangle.b,t.triangle.c]);assert.equal(actual.length,expected.length);
  for(let j=0;j<actual.length;j++)assert.ok(actual[j].distanceTo(expected[j])<1e-5);
 }
 const group=roles(h.frame,'xiehe-west-end-partition')[1],x=group.position.x;
 const probes=[];
 for(let iy=0;iy<12;iy++)for(let iz=0;iz<9;iz++){
  const origin=new T.Vector3(x-.3,h.g.platformY+2.85+iy*.095,1.02+iz*.12),dir=new T.Vector3(1,0,0);
  const hit=new T.Raycaster(origin,dir,0,.6).intersectObject(h.frame,true)[0];probes.push({origin,dir,hit:!!hit});
 }
 assert.ok(probes.filter(p=>!p.hit).length>20,'grille must have real open holes, not a shadow backing pane');
 assert.ok(probes.filter(p=>p.hit).length>10,'grille bars must also remain visible');
 merged=h.kit.finish();merged.updateMatrixWorld(true);
 for(const p of probes)assert.equal(!!new T.Raycaster(p.origin,p.dir,0,.6).intersectObject(merged,true)[0],p.hit,'merge changed grille hole');
 }finally{if(merged)h.kit.dispose(merged);else h.kit.dispose(h.kit.root);h.lib.dispose();}
});

test('West end additions retain roof, primary leaves, columns, walk surfaces and all original physical bounds',async()=>{
 const url=new URL('../../../src/scene/palace/special/SideGate.js',import.meta.url);
 let source=execFileSync('git',['show','6ffd4ebc:src/scene/palace/special/SideGate.js'],{encoding:'utf8'});
 source=source.replace(/from\s+(['"])([^'"]+)\1/g,(_,q,id)=>`from ${q}${id==='three'?import.meta.resolve('three'):new URL(id,url).href}${q}`);
 const{buildSideGate:parent}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
 for(const profile of['xiehe','xihe','jingyun','longzong']){
  const a=fixture(profile,{},parent),b=fixture(profile);try{
   assert.deepEqual(a.kit.walkables,b.kit.walkables);assert.deepEqual(a.kit.mapItems,b.kit.mapItems);
   const materials=root=>{const set=new Set();root.traverse(o=>{if(o.isMesh)set.add(o.material.name)});return [...set].sort();};
   if(profile==='xiehe')assert.deepEqual(materials(a.frame),materials(b.frame),'reuse identical existing ochre/border materials');
   if(profile!=='xiehe'){assert.equal(hash(meshRows(a.frame)),hash(meshRows(b.frame)));assert.deepEqual(a.kit.colliders,b.kit.colliders);continue;}
   for(const role of['side-gate-roof','gate-door-leaf','gate-column','gate-window'])assert.equal(hash(roles(a.frame,role).map(o=>meshRows(o))),hash(roles(b.frame,role).map(o=>meshRows(o))),role);
   const counts=new Map();for(const c of b.kit.colliders){const k=JSON.stringify(c);counts.set(k,(counts.get(k)??0)+1);}
   for(const c of a.kit.colliders){const k=JSON.stringify(c);assert.ok(counts.get(k)>0,'existing collider changed');counts.set(k,counts.get(k)-1);}
  }finally{done(a);done(b);}
 }
});
