import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from 'three';
import {PalaceBuilder} from '../../../src/scene/PalaceBuilder.js';
import {library} from '../../lib/inner-palace-fixture.mjs';
import {triangleBodyIntersects} from '../../../src/utils/TriangleSupport.js';
import {mergeByMaterial} from '../../../src/utils/MergeUtils.js';

const path=new URL('../../../src/scene/palace/special/TaiheTerraceInstruments.js',import.meta.url);
const api=fs.existsSync(path)?await import(path):{};
const v=(a)=>new T.Vector3(...a), box=(a,b)=>new T.Box3(v(a),v(b));
function setup(input={y:8,zf:-36.06666666666666}){
 assert.equal(typeof api.buildTaiheTerraceInstruments,'function','source-bound two-instrument builder must exist');
 const b=new PalaceBuilder(new T.Scene(),library()),parent=new T.Group();
 const g=api.buildTaiheTerraceInstruments(b,parent,input);b.addObject(parent);parent.updateMatrixWorld(true);
 return{b,parent,g,close:()=>b.dispose()};
}
test('dedicated source-bound module exists without depending on production PalaceBuilder',()=>{
 assert.equal(typeof api.buildTaiheTerraceInstruments,'function');
 assert.equal(fs.readFileSync(path,'utf8').includes('PalaceBuilder'),false);
});
test('both independent source identities retain original centers and disclose every fitted or hidden scope',()=>{
 const q=setup();try{
  const p=q.g.userData.structure;assert.equal(p.id,'axis/taihe-terrace-instruments');assert.equal(p.entityId,'FC-A478209231');assert.equal(p.accepted,false);
  assert.equal(p.instruments.length,2);assert.deepEqual(p.instruments.map(x=>x.centerX),[-17,17]);
  assert.match(p.instruments[0].source,/1609/);assert.match(p.instruments[1].source,/2536/);
  assert.match(p.dimensionStatus,/FIT_NOT_SURVEY/);assert.equal(p.photographyDate,null);assert.equal(p.hiddenMeasure,'UNMODELED');
  assert.ok(p.unknown.includes('rear carving'));assert.equal(q.b.walkables.length,0,'exact visible triangles, no rescue pads');
 }finally{q.close();}
});
test('source-visible sundial and stone Jialiang shapes replace empty primitives with physical open frames',()=>{
 const q=setup();try{
  const parts=q.g.children, count=(kind,role)=>parts.filter(m=>m.userData.instrument===kind&&m.userData.role===role).length;
  assert.equal(count('sundial','pillar'),2);assert.equal(count('sundial','cross-table'),1);assert.equal(count('sundial','dial'),1);assert.equal(count('sundial','gnomon'),1);
  assert.equal(count('jialiang','post'),4);assert.equal(count('jialiang','lintel'),4);assert.equal(count('jialiang','roof'),1);
  assert.equal(parts.filter(m=>/measure|inscription|dragon/.test(m.name)).length,0,'unseen measure or decorative carving is not invented');
  for(const kind of['sundial','jialiang']){const bounds=new T.Box3();for(const m of parts.filter(x=>x.userData.instrument===kind))bounds.union(new T.Box3().setFromObject(m));
   const center=kind==='sundial'?-17:17;assert.ok(bounds.min.x>=center-.80001&&bounds.max.x<=center+.80001);assert.ok(bounds.min.y>=8-1e-6&&bounds.max.y<=11+1e-6);assert.ok(bounds.min.z>=-35.06666666666666-.80001&&bounds.max.z<=-35.06666666666666+.80001);
  }
 }finally{q.close();}
});
test('sundial photographed twin columns are near the clear gap width, not thin posts around a broad doorway',()=>{
 const q=setup();try{const p=q.g.userData.structure.instruments.find(p=>p.kind==='sundial');
  const pillars=q.g.children.filter(m=>m.userData.instrument==='sundial'&&m.userData.role==='pillar');
  const w=new T.Box3().setFromObject(pillars[0]).getSize(new T.Vector3()).x;
  assert.ok(w/p.clearPillarWidth>=.85&&w/p.clearPillarWidth<=1.2,'own photo pillars and clear gap have similar width, not a 0.4 ratio');
  assert.ok(p.clearPillarWidth/1.4>=.19&&p.clearPillarWidth/1.4<=.27,'gap is around one-quarter of the cross-table width');
 }finally{q.close();}
});
test('Jialiang photographed stone window is bounded by substantial sill and head bands, not an almost open four-post pavilion',()=>{
 const q=setup();try{const p=q.g.userData.structure.instruments.find(p=>p.kind==='jialiang');
  assert.ok(p.clearWindowWidth/1.21>=.45&&p.clearWindowWidth/1.21<=.58,'own source front/side aperture occupies about half its stone wall field, not 75%');
  assert.ok(p.clearWindowHeight/1.2>=.40&&p.clearWindowHeight/1.2<=.55,'own source opening has broad stone above/below, not 90% open');
  assert.equal(q.g.children.filter(m=>m.userData.instrument==='jialiang'&&m.userData.role==='sill').length,4);
 }finally{q.close();}
});
test('all visible parts are closed nondegenerate solids with exact independently translated triangle owners',()=>{
 const q=setup();try{
  assert.equal(q.b.colliders.length,q.g.children.length);
  for(const m of q.g.children){const g=m.geometry,p=g.attributes.position,ix=g.index,edges=new Map(),volume=[];
   const c=q.b.colliders.find(c=>c.triangleSupport.id===m.userData.collisionId);assert.ok(c);assert.ok(c.equals(c.triangleSupport.box));
   let n=0;for(let i=0;i<(ix?.count??p.count);i+=3){const a=[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(p,ix?ix.getX(i+j):i+j));
    assert.ok(new T.Triangle(...a).getArea()>1e-10,m.name);assert.deepEqual(c.triangleSupport.template.triangles[n++].triangle.a.toArray(),a[0].toArray());
    volume.push(a[0].dot(a[1].clone().cross(a[2]))/6);
    for(let j=0;j<3;j++){const key=[a[j],a[(j+1)%3]].map(v=>v.toArray().map(x=>x.toFixed(5)).join(',')).sort().join('/');edges.set(key,(edges.get(key)??0)+1);}
   }
   assert.ok([...edges.values()].every(n=>n===2),`watertight ${m.name}`);assert.ok(volume.reduce((a,b)=>a+b,0)>1e-9,`outward ${m.name}`);
  }
 }finally{q.close();}
});
test('small real probes see air through both frames while stone and normal-size bodies remain physical',()=>{
 const q=setup();try{
  const z=-35.06666666666666,hit=b=>q.b.colliders.some(c=>triangleBodyIntersects(c.triangleSupport,b));
  assert.equal(hit(box([-17.05,8.9,z-.6],[-16.95,9.1,z+.6])),false,'sundial middle is air, no legacy full box');
  assert.equal(hit(box([16.95,9.8,z-.6],[17.05,10,z+.6])),false,'Jialiang window is air, no invented bronze measure');
  assert.equal(hit(box([-17.45,8.9,z-.05],[-17.43,9.1,z+.05])),true,'actual sundial pillar');
  assert.equal(hit(box([17.52,9.8,z+.52],[17.54,10,z+.54])),true,'actual Jialiang corner post');
  assert.equal(hit(box([-17.5,8.5,z-.5],[-16.5,10.2,z+.5])),true,'1m body cannot be waved through .32m hole');
  const ray=new T.Raycaster(v([-17,9,z-1]),v([0,0,1]),0,2);assert.equal(ray.intersectObject(q.g,true).length,0,'visible sundial hole agrees with physical air');
 }finally{q.close();}
});
test('invalid, duplicate and translated host calls preserve atomic ownership and exact offset',()=>{
 assert.equal(typeof api.buildTaiheTerraceInstruments,'function');
 const b=new PalaceBuilder(new T.Scene(),library()),g=new T.Group();
 try{for(const input of[{y:NaN,zf:0},{y:8,zf:Infinity},{y:-1,zf:0},{y:8,zf:0,kind:'other'}]){assert.throws(()=>api.buildTaiheTerraceInstruments(b,g,input));assert.equal(g.children.length,0);assert.equal(b.colliders.length,0);}
  b.ox=11;b.oz=-9;const group=api.buildTaiheTerraceInstruments(b,g,{y:8,zf:-36.06666666666666});const before=b.colliders.length;
  assert.ok(b.colliders.every(c=>c.triangleSupport.offset.equals(v([11,0,-9]))));
  assert.throws(()=>api.buildTaiheTerraceInstruments(b,g,{y:8,zf:-36.06666666666666}));assert.equal(b.colliders.length,before);assert.equal(g.children.length,1);b.addObject(g);
  assert.equal(group.userData.structure.instruments[0].centerX,-17);
 }finally{b.dispose();}
});
test('real material merge preserves visible hits and disposal owns every original and merged resource once',()=>{
 for(let n=0;n<2;n++){const q=setup(),rays=[[-17,8.7,-35.06666666666666,0,-1,0],[17,12,-35.06666666666666,0,-1,0]],cast=g=>{g.updateMatrixWorld(true);return rays.map(a=>new T.Raycaster(v(a.slice(0,3)),v(a.slice(3))).intersectObject(g,true)[0]?.point.toArray());};
  const before=cast(q.g),owned=new Map();q.g.traverse(m=>{if(m.geometry&&!owned.has(m.geometry)){owned.set(m.geometry,0);m.geometry.addEventListener('dispose',()=>owned.set(m.geometry,owned.get(m.geometry)+1));}});
  const merged=mergeByMaterial(q.g,{name:'taihe-instruments-candidate'});q.parent.remove(q.g);q.parent.add(merged);assert.deepEqual(cast(merged),before);assert.ok(merged.children.length<=2);
  merged.traverse(m=>{if(m.geometry&&!owned.has(m.geometry)){owned.set(m.geometry,0);m.geometry.addEventListener('dispose',()=>owned.set(m.geometry,owned.get(m.geometry)+1));}});
  q.close();assert.ok([...owned.values()].every(n=>n===1));
 }
});
