import test from 'node:test';
import assert from 'node:assert/strict';
import {T,fixture,candidate,baseline,beam} from './fixture.mjs';
import {assertCurrentSource,priorR264LayoutSource,readPinnedFixture,loadPinnedLayout,SOURCE_PATH,sha256} from './source-view.mjs';
import {projectR264LayoutSnapshot,assertCurrentLayoutSupport,snapshotLegacyMesh} from './snapshot-view.mjs';
import * as snapshotView from './snapshot-view.mjs';
const source=assertCurrentSource(),old=readPinnedFixture('r264-layout.js.txt').toString('utf8');
test('immutable old source is distinct and exact inverse preserves original b4a836 bytes',()=>{assert.notEqual(source,old);assert.equal(sha256(priorR264LayoutSource(source,SOURCE_PATH)),sha256(old));assert.equal(sha256(old),'b4a8363eaa7f74fa11638aeeef5f660dcb45bb1268117a75d633035209c2cfeb');});
for(const[name,s,p]of[['unknown source',source+'\n',SOURCE_PATH],['old as current',old,SOURCE_PATH],['second product path',source,'src/second.js'],['missing helper',source.replace('function createLowerFrontEntablatureGeometry(){','function missing(){'),SOURCE_PATH],['duplicate call',source.replace("add('lower-front-entablature',createLowerFrontEntablatureGeometry());","add('lower-front-entablature',createLowerFrontEntablatureGeometry());add('lower-front-entablature',createLowerFrontEntablatureGeometry());"),SOURCE_PATH],['missing metadata',source.replace("columnInset:.08,",''),SOURCE_PATH]])test('source inverse rejects '+name,()=>assert.throws(()=>priorR264LayoutSource(s,p)));
test('baseline loader rejects unknown mode and arbitrary fixture path',async()=>{await assert.rejects(()=>loadPinnedLayout('current'));assert.throws(()=>readPinnedFixture('../pins.json'));});
async function pair(fn){const a=fixture(),b=fixture();let original=[];try{a.context.out=baseline.buildDafotangHistoricLayout(a.context);b.context.out=(await candidate()).buildDafotangHistoricLayout(b.context);original=[...a.context.out.frame.children,...b.context.out.frame.children];return fn(b.context,a.context);}finally{for(const m of original)if(!a.context.kit.root.getObjectById(m.id)&&!b.context.kit.root.getObjectById(m.id))m.geometry.dispose();a.dispose();b.dispose();}}
function state(h){return sha256(JSON.stringify({children:h.f.children.map(m=>m.uuid),frame:h.out.frame.children.map(m=>({uuid:m.uuid,parent:m.parent?.uuid,mesh:snapshotLegacyMesh(m),box:m.geometry.boundingBox?.toArray?.()??[m.geometry.boundingBox?.min.toArray(),m.geometry.boundingBox?.max.toArray()]})),contacts:h.kit.colliders.map(o=>({uuid:o.dafotangLayoutMesh,role:o.dafotangLayoutRole,box:[o.min.toArray(),o.max.toArray()],support:o.triangleSupport&&{id:o.triangleSupport.id,offset:o.triangleSupport.offset.toArray(),box:[o.triangleSupport.box.min.toArray(),o.triangleSupport.box.max.toArray()],rows:o.triangleSupport.template.triangles.map(q=>[q.triangle.a.toArray(),q.triangle.b.toArray(),q.triangle.c.toArray(),q.normal.toArray(),q.box.min.toArray(),q.box.max.toArray()])}}))}));}
test('validated single-beam view preserves all 85 historical rows without changing live owners',()=>pair((now,prior)=>{const before=[state(now),state(prior)];assertCurrentLayoutSupport(now);const rows=projectR264LayoutSnapshot(now,prior);assert.equal(sha256(JSON.stringify(rows)),sha256(JSON.stringify(prior.out.frame.children.map(snapshotLegacyMesh))));assert.equal(rows.length,85);assert.equal(beam(prior.out).geometry.attributes.position.count,24);assert.equal(beam(prior.out).geometry.index.count,36);assert.equal(beam(now.out).geometry.attributes.position.count,3240);assert.equal(beam(now.out).geometry.index.count,4860);assert.deepEqual([state(now),state(prior)],before);assert.throws(()=>rows[6].attributes.position.array[0]++);assert.throws(()=>rows.pop());assert.deepEqual([state(now),state(prior)],before);}));
const mutate=[
 ['root manual matrix',h=>{h.kit.root.matrixAutoUpdate=false;h.kit.root.matrix.makeTranslation(40,0,0);}],
 ['host manual matrix',h=>{h.f.matrixAutoUpdate=false;h.f.matrix.makeTranslation(40,0,0);}],
 ['frame manual matrix',h=>{h.out.frame.matrixAutoUpdate=false;h.out.frame.matrix.makeTranslation(40,0,0);}],
 ['root world cache',h=>h.kit.root.matrixWorld.makeTranslation(40,0,0)],
 ['frame world cache',h=>h.out.frame.matrixWorld.makeTranslation(40,0,0)],
 ['beam sphere',h=>beam(h.out).geometry.boundingSphere=new T.Sphere(new T.Vector3(10000,10000,10000),0)],
 ['other sphere',h=>h.out.frame.children[0].geometry.boundingSphere=new T.Sphere(new T.Vector3(10000,10000,10000),0)],
 ['absent beam',h=>{const m=beam(h.out);h.out.frame.remove(m);}],
 ['duplicate beam',h=>h.out.frame.children.push(beam(h.out))],
 ['unknown role',h=>beam(h.out).userData.dafotangLayoutRole='unknown'],
 ['owner order',h=>[h.out.frame.children[0],h.out.frame.children[1]]=[h.out.frame.children[1],h.out.frame.children[0]]],
 ['other position',h=>h.out.frame.children[0].geometry.attributes.position.array[0]+=.01],
 ['other index',h=>h.out.frame.children[0].geometry.index.array[0]++],
 ['other normal',h=>h.out.frame.children[0].geometry.attributes.normal.array[0]+=.01],
 ['other transform',h=>h.out.frame.children[0].position.x=.1],
 ['other material',h=>h.out.frame.children[0].material.roughness=.123],
 ['other support',h=>h.out.contacts[0].triangleSupport.template.triangles[0].normal.x+=.01],
 ['beam vertex',h=>beam(h.out).geometry.attributes.position.array[0]+=.01],
 ['beam index',h=>beam(h.out).geometry.index.array[0]++],
 ['beam normal',h=>beam(h.out).geometry.attributes.normal.array[0]+=.01],
 ['beam UV',h=>beam(h.out).geometry.attributes.uv.array[0]+=.01],
 ['beam bounding box',h=>beam(h.out).geometry.boundingBox.min.y-=.1],
 ['beam draw range',h=>beam(h.out).geometry.setDrawRange(3,4860)],
 ['beam material',h=>beam(h.out).material.metalness=.123],
 ['beam transform',h=>beam(h.out).position.x=.1],
 ['hidden beam',h=>beam(h.out).visible=false],
 ['hidden ancestor',h=>h.f.visible=false],
 ['detached frame',h=>h.f.remove(h.out.frame)],
 ['detached beam parent',h=>beam(h.out).parent=null],
 ['support offset',h=>h.out.contacts[6].triangleSupport.offset.x+=.1],
 ['support triangle',h=>h.out.contacts[6].triangleSupport.template.triangles[0].triangle.a.x+=.1],
 ['support normal',h=>h.out.contacts[6].triangleSupport.template.triangles[0].normal.x+=.1],
 ['support triangle box',h=>h.out.contacts[6].triangleSupport.template.triangles[0].box.min.y-=.1],
 ['support world box',h=>h.out.contacts[6].triangleSupport.box.min.y-=.1],
 ['collider world box',h=>h.out.contacts[6].min.y-=.1],
 ['stale old-box support',(h,b)=>{h.out.contacts[6].triangleSupport=b.out.contacts[6].triangleSupport;}],
 ['duplicate collider',h=>h.kit.colliders.push(h.out.contacts[6])],
 ['absent collider',h=>h.kit.colliders.splice(h.kit.colliders.indexOf(h.out.contacts[6]),1)],
 ['wrong owner UUID',h=>h.out.contacts[6].dafotangLayoutMesh='wrong'],
 ['wrong support ID',h=>h.out.contacts[6].triangleSupport.id='wrong'],
 ['changed old beam',(h,b)=>beam(b.out).geometry.attributes.position.array[0]+=.1]
];
for(const[name,change]of mutate)test('projection rejects '+name+' and does not mutate inputs',()=>pair((now,prior)=>{change(now,prior);const before=[state(now),state(prior)];assert.throws(()=>projectR264LayoutSnapshot(now,prior));assert.deepEqual([state(now),state(prior)],before);}));
// Two miniature geometries exercise both owner contexts without a hall construction.
for(const role of ['lower-front-entablature','other-layout-owner']) test('cached sphere rejects invalid non-null values: '+role,()=>{
 const geometry=new T.BoxGeometry(1,2,3); geometry.name=role;
 try {
  assert.equal(typeof snapshotView.assertCachedSphere,'function','cached sphere validator must exist');
  for(const invalid of [false,undefined,0,NaN,'']){
   geometry.boundingSphere=invalid;
   assert.throws(()=>snapshotView.assertCachedSphere(geometry),`reject ${String(invalid)}`);
  }
  geometry.boundingSphere=null; assert.doesNotThrow(()=>snapshotView.assertCachedSphere(geometry));
  geometry.computeBoundingSphere(); assert.doesNotThrow(()=>snapshotView.assertCachedSphere(geometry));
 } finally {geometry.dispose();}
});
process.on('exit',()=>console.log('RESOURCE_USAGE',JSON.stringify({usage:process.resourceUsage(),memory:process.memoryUsage()})));
