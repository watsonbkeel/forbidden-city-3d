import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import * as T from 'three';
import {PalaceBuilder} from '../../../src/scene/PalaceBuilder.js';
import {PALACE_LAYOUT} from '../../../src/scene/Layout.js';
import {library} from '../../lib/inner-palace-fixture.mjs';
const moduleURL=new URL('../../../scripts/photo-fidelity/batches/r157-taihemen/hypothesis/TaihemenSouthCeiling.js',import.meta.url);
const api=existsSync(moduleURL)?await import(moduleURL.href):{};
// WITHDRAWN CANDIDATE DIAGNOSTICS ONLY: application code never imports it.
let candidateClass;
async function hypotheticalBuilder(){
 if(candidateClass)return candidateClass;
 const encURL=new URL('../../../src/scene/palace/special/TaihemenEnclosure.js',import.meta.url),builderURL=new URL('../../../src/scene/PalaceBuilder.js',import.meta.url);
 let src=readFileSync(encURL,'utf8');assert.ok(!src.includes('buildTaihemenSouthCeiling'),'withdrawn candidate must have no production hook');
 const knee='  buildTaihemenSouthKnees(builder, group, {x0,z0,y,w,d,H,beamH,r});';
 src=`import {buildTaihemenSouthCeiling} from '${moduleURL.href}';\n`+src.replace(knee,knee+'\n  buildTaihemenSouthCeiling(builder, group, {x0,z0,y,w,d,H,beamH,r});');
 const absolute=(s,u)=>s.replace(/from '([^']+)'/g,(_,p)=>`from '${p==='three'?import.meta.resolve('three'):new URL(p,u).href}'`),dataURL=s=>'data:text/javascript;base64,'+Buffer.from(s).toString('base64');
 const hEnc=dataURL(absolute(src,encURL));candidateClass=(await import(dataURL(absolute(readFileSync(builderURL,'utf8'),builderURL).replace(new URL('./palace/special/TaihemenEnclosure.js',builderURL).href,hEnc)))).PalaceBuilder;
 return candidateClass;
}

const input={x0:0,z0:0,y:3.44,w:48.06,d:20.54,H:7.7368,beamH:.928416,r:.4272};
const meshes=g=>{const out=[];g.traverse(m=>{if(m.isMesh)out.push(m);});return out;};
function fixture(){
 assert.equal(typeof api.buildTaihemenSouthCeiling,'function','missing own-source Taihemen south porch ceiling');
 const b=new PalaceBuilder(new T.Scene(),library()),g=new T.Group();b.ownedObjects.add(g);
 return {b,g,p:api.buildTaihemenSouthCeiling(b,g,input)};
}
const hit=(g,x,z)=>new T.Raycaster(new T.Vector3(x,input.y+2,z),new T.Vector3(0,1,0),0,10).intersectObject(g,true)[0];
const digest=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
function triangles(root,{withoutCeiling=false}={}){root.updateMatrixWorld(true);const out=[];root.traverse(m=>{
 if(!m.isMesh||(withoutCeiling&&m.material.name?.startsWith('taihemen-south-ceiling-')))return;
 const p=m.geometry.attributes.position,ix=m.geometry.index;
 for(let i=0;i<(ix?.count??p.count);i+=3){const ids=[0,1,2].map(k=>ix?ix.getX(i+k):i+k);out.push({materials:(Array.isArray(m.material)?m.material:[m.material]).map(k=>({name:k.name,color:k.color?.getHex()??null,side:k.side})),groups:m.geometry.groups,
  points:ids.map(j=>new T.Vector3().fromBufferAttribute(p,j).applyMatrix4(m.matrixWorld).toArray()),
  attrs:ids.map(j=>Object.fromEntries(Object.entries(m.geometry.attributes).map(([k,a])=>[k,Array.from(a.array.subarray(j*a.itemSize,(j+1)*a.itemSize))])))});}
 });return out;}

test('Taihemen declaration agrees with its already-rendered double-eave xieshan, not another hall',()=>{
 const data=PALACE_LAYOUT.find(x=>x.name==='太和门');
 assert.equal(data.features.roofType,'xieshan');assert.equal(data.features.roofLayers,2);
});

test('observed south porch has physical transverse frames and recessed square-ish fields, not only painted plane',()=>{
 const {b,g,p}=fixture();try{
  assert.equal(p.entityId,'FC-B3B12CF397');assert.equal(p.accepted,false);
  assert.deepEqual(p.bays,[1,2,3,4,5,6,7]);assert.equal(p.dimensionStatus,'PHOTO_TOPOLOGY_RETAINED_AXIS_FIT_NOT_SURVEY');
  assert.equal(p.exactPanelCountVerified,false);assert.equal(p.fullHallReconstructed,false);
  assert.equal(meshes(g).filter(m=>m.userData.taihemenSouthCeiling?.role==='primary-frame').length,8);
  assert.equal(meshes(g).filter(m=>m.userData.taihemenSouthCeiling?.role==='field').length,7);
  g.updateMatrixWorld(true);
  const bay=4,x=-input.w/2+(bay+.5)*input.w/9,z=(p.minZ+p.maxZ)/2;
  const field=hit(g,x+p.cellWidth*.2,z+p.cellDepth*.2),grid=hit(g,x+p.cellWidth*.5,z+p.cellDepth*.2),primary=hit(g,-input.w/2+4*input.w/9,z);
  assert.equal(field?.object.material.name,'taihemen-south-ceiling-field');
  assert.ok(grid&&grid.point.y<field.point.y-.06,'real downstand/recess, not metadata or flat color');
  assert.ok(primary&&primary.point.y<grid.point.y-.35,'primary frame remains below secondary coffers');
  for(const m of meshes(g)){
   const box=new T.Box3().setFromObject(m);assert.ok(box.min.z>=p.minZ-1e-5&&box.max.z<=p.maxZ+1e-5);
   assert.ok(box.min.x>=-input.w/2+input.w/9-p.primaryWidth/2-1e-5&&box.max.x<=input.w/2-input.w/9+p.primaryWidth/2+1e-5);
   assert.ok(box.min.y-input.y>4.1,'no floor-level or jump obstruction');
  }
  assert.equal(b.colliders.length,0);assert.equal(b.walkables.length,0);
  assert.ok(p.sources.some(s=>s.url.endsWith('s5e9837bfea847.jpg')));assert.ok(p.sources.every(s=>s.photographyDate===null));
 }finally{b.dispose();}
});

test('ceiling solids are finite closed outward boxes and never manufacture unknown paint motifs',()=>{
 const {b,g}=fixture();try{
  for(const m of meshes(g)){
   const p=m.geometry.attributes.position,ix=m.geometry.index;let volume=0;const edges=new Map();
   assert.ok([...p.array].every(Number.isFinite));
   for(let i=0;i<ix.count;i+=3){const v=[0,1,2].map(k=>new T.Vector3().fromBufferAttribute(p,ix.getX(i+k)));assert.ok(new T.Vector3().crossVectors(v[1].clone().sub(v[0]),v[2].clone().sub(v[0])).length()>1e-9);
    volume+=v[0].dot(new T.Vector3().crossVectors(v[1],v[2]))/6;
    for(let k=0;k<3;k++){const a=v[k].toArray().map(n=>n.toFixed(6)).join(','),c=v[(k+1)%3].toArray().map(n=>n.toFixed(6)).join(','),key=[a,c].sort().join('|');edges.set(key,(edges.get(key)??0)+1);}}
   assert.ok(volume>0);assert.ok([...edges.values()].every(n=>n===2));
  }
  assert.ok(b.ownedMaterials.every(m=>!m.map&&!m.normalMap),'plain simplified color zones, not copied or invented artwork');
 }finally{b.dispose();}
});

test('wrong envelope, missing numbers and head-clearance failures reject before allocations or mutation',()=>{
 assert.equal(typeof api.buildTaihemenSouthCeiling,'function');const b=new PalaceBuilder(new T.Scene(),library()),g=new T.Group();
 try{for(const patch of [{w:48},{d:20},{x0:NaN},{z0:Infinity},{y:NaN},{H:4},{beamH:0},{r:0}]){
  assert.throws(()=>api.buildTaihemenSouthCeiling(b,g,{...input,...patch}),/Taihemen/);
  assert.equal(g.children.length,0);assert.equal(b.ownedMaterials.length,0);assert.equal(b.colliders.length,0);assert.equal(b.walkables.length,0);
 }}finally{b.dispose();}
});

test('withdrawn in-memory candidate retains all old triangles,40 columns,doors,roof,plaque and navigation exactly',async()=>{
 const hook='  buildTaihemenSouthCeiling(builder, group, {x0,z0,y,w,d,H,beamH,r});';
 const enclosureURL=new URL('../../../src/scene/palace/special/TaihemenEnclosure.js',import.meta.url),builderURL=new URL('../../../src/scene/PalaceBuilder.js',import.meta.url);
 const src=readFileSync(enclosureURL,'utf8');assert.equal(src.split(hook).length,1,'no withdrawn production hookup');
 const absolute=(s,u)=>s.replace(/from '([^']+)'/g,(_,p)=>`from '${p==='three'?import.meta.resolve('three'):new URL(p,u).href}'`);
 const dataURL=s=>'data:text/javascript;base64,'+Buffer.from(s).toString('base64');
 const enc=dataURL(absolute(src.replace(hook,''),enclosureURL));
 const bs=absolute(readFileSync(builderURL,'utf8'),builderURL).replace(new URL('./palace/special/TaihemenEnclosure.js',builderURL).href,enc);
 const Old=(await import(dataURL(bs))).PalaceBuilder;
 function make(Base){class Tracked extends Base{column(...a){super.column(...a);(this.columns??=[]).push(a.slice(3));}}
  const b=new Tracked(new T.Scene(),library());b.buildGate(structuredClone(PALACE_LAYOUT.find(x=>x.name==='太和门')));return{b,g:b.scene.getObjectByName('太和门')};}
 const a=make(Old),c=make(await hypotheticalBuilder());try{
  assert.equal(c.b.columns.length,40);assert.deepEqual(c.b.columns,a.b.columns);
  assert.deepEqual(c.b.colliders,a.b.colliders);assert.deepEqual(c.b.walkables,a.b.walkables);
  assert.equal(digest(triangles(c.g,{withoutCeiling:true})),digest(triangles(a.g)),'all pre-existing geometry, normals and UV survive');
  const records=c.g.userData.architecture.filter(x=>x.id==='axis/taihemen-south-ceiling');assert.equal(records.length,1);
  assert.equal(records[0].profile.fullHallReconstructed,false);
  assert.ok(triangles(c.g).length>triangles(a.g).length);
 }finally{a.b.dispose();c.b.dispose();}
});

const consumerURL=new URL('../../lib/r157-taihemen-ceiling-world-check.mjs',import.meta.url);
const consumer=existsSync(consumerURL)?await import(consumerURL.href):{};
async function mergedWorld(){
 const {CollisionManager}=await import('../../../src/utils/Collision.js');
 const scene=new T.Scene(),Builder=await hypotheticalBuilder(),builder=new Builder(scene,library());builder.buildGate(structuredClone(PALACE_LAYOUT.find(x=>x.name==='太和门')));
 const cm=new CollisionManager();cm.addColliders(builder.colliders);cm.addWalkables(builder.walkables);
 return {scene,builder,cm,root:scene.getObjectByName('太和门')};
}
test('pure existing-W ceiling consumer verifies real surfaces and never builds or mutates the supplied world',async()=>{
 assert.equal(typeof consumer.assertTaihemenSouthCeilingInWorld,'function','missing read-only current-world ceiling consumer');
 const W=await mergedWorld();try{
  const before=digest([triangles(W.root),W.builder.colliders,W.builder.walkables]);const result=consumer.assertTaihemenSouthCeilingInWorld(W);
  assert.equal(result.fieldProbes,7);assert.equal(result.primaryFrameProbes,8);assert.equal(result.secondaryFrameProbes,63);assert.ok(result.minimumRecess>.06);
  assert.equal(digest([triangles(W.root),W.builder.colliders,W.builder.walkables]),before);
  assert.throws(()=>consumer.assertTaihemenSouthCeilingInWorld({}),/existing/);
 }finally{W.builder.dispose();}
});
for(const [label,mutate] of [
 ['missing field triangles',W=>W.root.children.find(m=>m.material?.name==='taihemen-south-ceiling-field').removeFromParent()],
 ['hidden frame material',W=>{W.root.children.find(m=>m.material?.name==='taihemen-south-ceiling-frame').material.visible=false;}],
 ['hidden ancestor',W=>{W.root.visible=false;}],
 ['detached transverse frame',W=>{W.root.children.find(m=>m.material?.name==='taihemen-south-ceiling-frame').position.z+=1;}],
])test(`existing-W rejects ${label} despite unchanged metadata`,async()=>{
 assert.equal(typeof consumer.assertTaihemenSouthCeilingInWorld,'function');const W=await mergedWorld();
 try{mutate(W);assert.throws(()=>consumer.assertTaihemenSouthCeilingInWorld(W),/ceiling|frame|field|visible/);}finally{W.builder.dispose();}
});

test('real TextureLibrary material path and builder disposal own the three added materials exactly once',async()=>{
 const {realTextureLibrary}=await import('../../lib/r48-real-texture-library.mjs');
 const scene=new T.Scene(),lib=realTextureLibrary(),Builder=await hypotheticalBuilder(),b=new Builder(scene,lib);
 try{
  b.buildGate(structuredClone(PALACE_LAYOUT.find(x=>x.name==='太和门')));const root=scene.getObjectByName('太和门');
  const added=root.children.filter(m=>m.isMesh&&m.material.name?.startsWith('taihemen-south-ceiling-'));
  assert.equal(added.length,3);const events=[];
  for(const m of added){assert.ok(b.ownedMaterials.includes(m.material));m.geometry.addEventListener('dispose',()=>events.push('geometry:'+m.material.name));m.material.addEventListener('dispose',()=>events.push('material:'+m.material.name));}
  b.dispose();b.dispose();assert.equal(events.length,6);assert.equal(new Set(events).size,6);assert.equal(root.parent,null);
 }finally{b.dispose();lib.dispose();}
});

test('withdrawn in-memory ceiling path never changes another palace root or existing physics registration',async()=>{
 const encURL=new URL('../../../src/scene/palace/special/TaihemenEnclosure.js',import.meta.url),builderURL=new URL('../../../src/scene/PalaceBuilder.js',import.meta.url);
 const hook='  buildTaihemenSouthCeiling(builder, group, {x0,z0,y,w,d,H,beamH,r});',src=readFileSync(encURL,'utf8');
 const absolute=(s,u)=>s.replace(/from '([^']+)'/g,(_,p)=>`from '${p==='three'?import.meta.resolve('three'):new URL(p,u).href}'`),dataURL=s=>'data:text/javascript;base64,'+Buffer.from(s).toString('base64');
 const oldEnc=dataURL(absolute(src.replace(hook,''),encURL));
 const Old=(await import(dataURL(absolute(readFileSync(builderURL,'utf8'),builderURL).replace(new URL('./palace/special/TaihemenEnclosure.js',builderURL).href,oldEnc)))).PalaceBuilder;
 const make=Base=>{const b=new Base(new T.Scene(),library());b.buildAll(PALACE_LAYOUT);return b;};
 const a=make(Old),c=make(await hypotheticalBuilder());try{
  assert.deepEqual(c.scene.children.map(x=>x.name),a.scene.children.map(x=>x.name));
  let checked=0;for(const root of c.scene.children){if(root.name==='太和门')continue;assert.equal(digest(triangles(root)),digest(triangles(a.scene.getObjectByName(root.name))),root.name);checked++;}
  assert.equal(checked,7);assert.deepEqual(c.colliders,a.colliders);assert.deepEqual(c.walkables,a.walkables);
 }finally{a.dispose();c.dispose();}
});

test('existing-W rejects retained trim with all secondary frame triangles removed from actual drawRange',async()=>{
 const W=await mergedWorld();try{
  const m=W.root.children.find(m=>m.material?.name==='taihemen-south-ceiling-frame');
  m.geometry.setDrawRange(0,8*36);
  assert.throws(()=>consumer.assertTaihemenSouthCeilingInWorld(W),/secondary|coffer|frame/);
 }finally{W.builder.dispose();}
});
