// Direct component/subassembly tests only. No actual hall, renderer or build.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import * as T from 'three';
import {buildDafotangHistoricLayout} from '../../src/scene/palace/special/DafotangHistoricLayout.js';
import {buildDafotangUpperCentralBand} from '../../src/scene/palace/special/DafotangUpperCentralBand.js';
const url=new URL('../../src/scene/palace/special/DafotangUpperWestBand.js',import.meta.url);
const hash=v=>createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
const near=(a,b)=>assert.ok(Math.abs(a-b)<2e-6,`${a} != ${b}`);
const POINTS=[[560,340],[602,335],[640,346],[674,351],[686,344],[710,352],[736,350],[755,344],[785,336],[800,340],[815,337]];
const OFFSET=[221.9,0,241.1],LAYOUT='dafotang-historic-spatial-fit-v1',ID='dafotang-upper-west-band-partial-fit-v1';
async function api(){assert.ok(fs.existsSync(url),'R268_WEST_COMPONENT_MISSING');return import(url);}
function fixture(){
 const root=new T.Group();root.name='outer-west';const f=new T.Group();f.position.set(...OFFSET);root.add(f);
 const kit={root,colliders:[],owned:[],walkables:[],rooms:[]};
 const g={id:'place-outer-west-6cae88b6a2',w:45.7,d:16.2,y:.9,front:-8.1,rear:8.1,inventory:{status:'UNKNOWN'},historicalPrincipal:{id:'dafotang-shakyamuni-historical-fit',supportDimensions:[2.2,.8,1.8]}};
 const principal=new T.Group();principal.userData.dafotangPrincipal=g.historicalPrincipal.id;f.add(principal);
 const material=new T.MeshStandardMaterial({name:'dafotang_principal_fitted_support'});kit.owned.push(material);
 for(const[role,w,h,d,y]of[['support-foot',2.2,.16,1.8,.98],['support-waist',1.9,.46,1.52,1.29],['support-top',2.12,.18,1.72,1.61]]){const m=new T.Mesh(new T.BoxGeometry(w,h,d).translate(0,y,5.6),material);m.name=g.historicalPrincipal.id+'/'+role;principal.add(m);root.updateMatrixWorld(true);kit.colliders.push(new T.Box3().setFromObject(m));}
 const c={kit,f,g,p:{id:g.id,key:'dafotang',zone:'outer-west'}};const layout=buildDafotangHistoricLayout(c);g.mainPlaqueFit={id:'dafotang-main-plaque-modern-semantic-fit-v1'};const central=buildDafotangUpperCentralBand(c);
 return {...c,layout,central,close(){central.dispose();root.traverse(m=>m.geometry?.dispose());for(const m of kit.owned)m.dispose();root.clear();}};
}
const leafValue=m=>hash({name:m.name,data:m.userData,attributes:Object.fromEntries(Object.entries(m.geometry.attributes).map(([k,a])=>[k,Array.from(a.array)])),index:Array.from(m.geometry.index.array),position:m.position.toArray(),quaternion:m.quaternion.toArray(),scale:m.scale.toArray(),material:m.material.toJSON()});
const contactValue=c=>hash({box:[c.min.toArray(),c.max.toArray()],id:c.triangleSupport?.id,offset:c.triangleSupport?.offset.toArray(),triangles:c.triangleSupport?.template.triangles.map(q=>[q.triangle.a.toArray(),q.triangle.b.toArray(),q.triangle.c.toArray(),q.normal.toArray(),q.box.min.toArray(),q.box.max.toArray()])});
function snapshot(c){return {children:[...c.f.children],leaves:[...c.layout.frame.children,c.central.mesh],values:[...c.layout.frame.children,c.central.mesh].map(leafValue),contacts:[...c.kit.colliders],contactValues:c.kit.colliders.map(contactValue),owned:[...c.kit.owned],meta:hash(c.g)};}
function retained(c,s,installed){assert.deepEqual([...c.layout.frame.children,c.central.mesh],s.leaves);assert.deepEqual(s.leaves.map(leafValue),s.values);assert.deepEqual(c.kit.colliders.slice(0,s.contacts.length),s.contacts);assert.deepEqual(s.contacts.map(contactValue),s.contactValues);assert.deepEqual(c.kit.owned,s.owned);assert.deepEqual(c.f.children.slice(0,s.children.length),s.children);const g={...c.g};if(installed)delete g.upperWestBandFit;assert.equal(hash(g),s.meta);assert.deepEqual(c.kit.walkables,[]);assert.deepEqual(c.kit.rooms,[]);}
function triangles(g){const p=g.attributes.position;return Array.from({length:g.index.count/3},(_,i)=>new T.Triangle(...[0,1,2].map(k=>new T.Vector3().fromBufferAttribute(p,g.index.getX(i*3+k)))));}

test('independent west source and one XY scale preserve a limited, unknown-depth fit',async()=>{
 const mod=await api(),material=new T.MeshStandardMaterial(),out=mod.createDafotangUpperWestBand({material});try{
 const m=out.metadata,p=out.mesh.geometry.attributes.position,s=1.62/343;
 assert.deepEqual(m.sourcePoints,POINTS);assert.equal(m.evidenceCount,1);assert.deepEqual(m.omittedCoarsePointIds,['W10']);assert.match(m.interpolationStatus,/MODEL_FIT/);assert.match(m.localExtremaStatus,/NOT_HISTORICAL/);
 near(m.scaleXY,s);assert.deepEqual(m.sourceAxisPixels,[516,859]);assert.equal(m.sourceReferenceY,316);assert.deepEqual(m.sourceCutPixels,[560,815]);
 const anchors=POINTS.filter((_,i)=>i!==9);
 for(const [x,y]of anchors){const mx=2.43-s*(x-516),my=6.23-s*(y-316),ys=[];for(let i=0;i<p.count;i++)if(Math.abs(p.getX(i)-mx)<2e-6)ys.push(p.getY(i));near(Math.min(...ys),my);}
 // Every sampled lower point stays in its independently traced interval range.
 for(let i=0;i<p.count;i++){if(Math.abs(p.getY(i)-6.23)<2e-6)continue;const sx=516+(2.43-p.getX(i))/s,sy=316+(6.23-p.getY(i))/s;const j=anchors.findIndex((a,k)=>k<anchors.length-1&&sx>=a[0]-.001&&sx<=anchors[k+1][0]+.001);assert.ok(j>=0);assert.ok(sy>=Math.min(anchors[j][1],anchors[j+1][1])-.001&&sy<=Math.max(anchors[j][1],anchors[j+1][1])+.001);}
 assert.equal(m.mount.status,'MODEL_FIT_NOT_SURVEY');assert.equal(m.historicalDepth,null);assert.equal(m.historicalEndpoints,null);assert.equal(m.wholeHeightRegistered,false);assert.equal(m.complete,false);assert.equal(m.visualAcceptance,'PENDING_ACTUAL_WEST_HALL_VIEWS');assert.equal(m.newWalkables,0);assert.equal(m.newRooms,0);assert.equal(m.upperVisitorAccess,false);assert.equal(m.newReligiousFigures,0);assert.match(m.endTreatment,/ENGINEERING_CUTS/);
 near(2.43-(2.43-s*44)-.06,.1478134110787172);assert.ok(m.unmodeled.includes('historical depth, backs and joinery'));
 }finally{out.dispose();material.dispose();}
});

test('small oriented watertight solid uses plain partial caps and matches the beam underside',async()=>{
 const mod=await api(),material=new T.MeshStandardMaterial(),out=mod.createDafotangUpperWestBand({material});try{
 const g=out.mesh.geometry,p=g.attributes.position,ts=triangles(g),edges=new Map(),vertices=new Set(),faces=new Set();let volume=0,topArea=0;
 assert.equal(ts.length,292);assert.equal(p.count,584);assert.equal(g.index.count,876);for(const a of Object.values(g.attributes))assert.ok(a.array.every(Number.isFinite));
 for(const [ti,t]of ts.entries()){assert.ok(t.getArea()>1e-12);const vs=[t.a,t.b,t.c],ks=vs.map(v=>v.toArray().join(',')),n=t.getNormal(new T.Vector3());const face=ks.slice().sort().join('|');assert.ok(!faces.has(face));faces.add(face);ks.forEach(k=>vertices.add(k));for(let i=0;i<3;i++){const a=ks[i],b=ks[(i+1)%3],k=[a,b].sort().join('|');if(!edges.has(k))edges.set(k,[]);edges.get(k).push(a<b?1:-1);const stored=new T.Vector3().fromBufferAttribute(g.attributes.normal,g.index.getX(ti*3+i));assert.ok(stored.dot(n)>.999999);}volume+=t.a.dot(t.b.clone().cross(t.c))/6;
 if(vs.every(v=>v.y===Math.fround(6.23))){near(n.y,1);topArea+=t.getArea();}else if(vs.every(v=>v.z===Math.fround(4.44)))near(n.z,-1);else if(vs.every(v=>v.z===Math.fround(4.52)))near(n.z,1);else if(vs.every(v=>v.x===Math.fround(2.43-44*1.62/343)))near(n.x,1);else if(vs.every(v=>v.x===Math.fround(2.43-299*1.62/343)))near(n.x,-1);else assert.ok(n.y<0);
 }
 const adjacency=new Map([...vertices].map(v=>[v,[]]));for(const [key,signs]of edges){assert.equal(signs.length,2);assert.equal(signs[0]+signs[1],0);const[a,b]=key.split('|');adjacency.get(a).push(b);adjacency.get(b).push(a);}const todo=[[...vertices][0]],seen=new Set(todo);while(todo.length)for(const next of adjacency.get(todo.pop()))if(!seen.has(next)){seen.add(next);todo.push(next);}assert.equal(seen.size,vertices.size);assert.equal(vertices.size-edges.size+ts.length,2);assert.ok(volume>0);near(topArea,255*1.62/343*.08);
 const b=new T.Box3().setFromBufferAttribute(p);near(b.min.x,1.0178134110787174);near(b.max.x,2.222186588921283);near(b.min.y,6.23-36*1.62/343);near(b.max.y,6.23);near(b.min.z,4.44);near(b.max.z,4.52);
 for(let i=0;i<p.count;i++)if(p.getY(i)===Math.fround(6.23))assert.ok(p.getX(i)>-2.5&&p.getX(i)<2.5&&p.getZ(i)>4.41&&p.getZ(i)<4.69);
 console.log('R268_GEOMETRY '+JSON.stringify({triangles:ts.length,vertices:p.count,indices:g.index.count,attributeAndIndexBytes:Object.values(g.attributes).reduce((n,a)=>n+a.array.byteLength,0)+g.index.array.byteLength,volume,bounds:[b.min.toArray(),b.max.toArray()]}));
 }finally{out.dispose();material.dispose();}
});

test('one additive owner preserves original 85 plus central and disposes only its own geometry',async()=>{
 const mod=await api(),c=fixture(),before=snapshot(c);let out;try{out=mod.buildDafotangUpperWestBand(c);retained(c,before,true);assert.equal(c.layout.frame.children.length,85);assert.equal(c.kit.colliders.length,before.contacts.length+1);assert.equal(c.f.children.length,before.children.length+1);assert.equal(out.group.parent,c.f);assert.equal(out.mesh.name,ID+'/west-band');assert.equal(out.mesh.userData.noMerge,true);assert.equal(out.mesh.userData.dafotangUpperWestBandRole,'west-band');assert.equal(out.mesh.material,c.central.mesh.material);assert.equal(out.contact.dafotangUpperWestBandMesh,out.mesh.uuid);assert.equal(out.contact.dafotangLayoutMesh,undefined);assert.equal(c.g.upperWestBandFit,out.metadata);
 const s=out.contact.triangleSupport,ts=triangles(out.mesh.geometry);assert.equal(s.id,out.mesh.name+'/'+out.mesh.uuid);assert.equal(s.template.triangles.length,292);assert.deepEqual(s.offset.toArray(),OFFSET);assert.ok(s.box.equals(out.contact));ts.forEach((t,i)=>{for(const k of['a','b','c'])assert.deepEqual(s.template.triangles[i].triangle[k],t[k]);});assert.ok(out.contact.equals(out.mesh.geometry.boundingBox.clone().translate(new T.Vector3(...OFFSET))));
 assert.throws(()=>mod.buildDafotangUpperWestBand(c),/once only/);let gd=0,md=0;out.mesh.geometry.addEventListener('dispose',()=>gd++);out.mesh.material.addEventListener('dispose',()=>md++);const kept=new T.Group();kept.add(out.mesh);out.mesh.geometry.dispose();out.dispose();out.dispose();assert.equal(gd,1);assert.equal(md,0);assert.equal(out.mesh.parent,null);assert.equal(out.group.parent,null);assert.equal(c.kit.colliders.length,before.contacts.length);assert.equal(c.f.children.length,before.children.length);retained(c,before,false);
 }finally{out?.dispose();c.close();}
});

test('invalid host and failed publication cannot mutate retained owners',async()=>{
 const mod=await api(),c=fixture(),before=snapshot(c);try{
 c.kit.root.scale.x=2;assert.throws(()=>mod.buildDafotangUpperWestBand(c));c.kit.root.scale.x=1;c.central.mesh.position.y=.1;assert.throws(()=>mod.buildDafotangUpperWestBand(c));c.central.mesh.position.y=0;
 const original=c.kit.colliders.push;c.kit.colliders.push=function(...xs){original.apply(this,xs);throw Error('injected publish');};let freed=0;const dispose=T.BufferGeometry.prototype.dispose;T.BufferGeometry.prototype.dispose=function(){freed++;return dispose.call(this);};try{assert.throws(()=>mod.buildDafotangUpperWestBand(c),/injected publish/);}finally{delete c.kit.colliders.push;T.BufferGeometry.prototype.dispose=dispose;}assert.equal(freed,1);assert.equal(c.f.children.length,before.children.length);assert.equal(c.kit.colliders.length,before.contacts.length);retained(c,before,false);
 }finally{c.close();}
});

test('host delta is precisely one import and one call after the unchanged central call',async()=>{
 await api();const host=fs.readFileSync(new URL('../../src/scene/palace/special/RemainingOuterHalls.js',import.meta.url),'utf8');const imp="import {buildDafotangUpperWestBand} from './DafotangUpperWestBand.js';\n",call="  if(p.key==='dafotang')buildDafotangUpperWestBand(c);\n";assert.equal(host.split(imp).length,2);assert.equal(host.split(call).length,2);assert.ok(host.includes("  if(p.key==='dafotang')buildDafotangUpperCentralBand(c);\n"+call+'  kit.roof(c.f,'));assert.equal(hash(host.replace(imp,'').replace(call,'')),'af87d0c921cc84f28c4570f13d37e718f8880eba198b426787cd439f506f5f6f');
});
process.on('exit',()=>console.log('R268_RESOURCE '+JSON.stringify({scope:'COMPONENT_AND_SMALL_RETAINED_LAYOUT_FIXTURE_ONLY',usage:process.resourceUsage(),memory:process.memoryUsage(),limits:{oldMiB:128,semiMiB:8,seconds:30}})));
