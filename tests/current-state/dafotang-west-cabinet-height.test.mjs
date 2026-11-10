// Actual HistoricLayout geometry on a support-only synthetic fixture.
// No real hall/Kit/figure/finish/World/GPU. Does not require private QA files.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import * as T from 'three';
import {buildDafotangHistoricLayout} from '../../src/scene/palace/special/DafotangHistoricLayout.js';
import {triangleBodyIntersects} from '../../src/utils/TriangleSupport.js';
const OFFSET=new T.Vector3(221.9,0,241.1),PLACE='place-outer-west-6cae88b6a2';
const near=(a,b)=>assert.ok(Math.abs(a-b)<2e-6,`${a} != ${b}`);
const sha=s=>createHash('sha256').update(s).digest('hex');
function fixture(){
 const root=new T.Group();root.name='outer-west';const f=new T.Group();f.position.copy(OFFSET);root.add(f);
 const principal=new T.Group();principal.userData.dafotangPrincipal='dafotang-shakyamuni-historical-fit';f.add(principal);
 const material=new T.MeshStandardMaterial({name:'dafotang_principal_fitted_support'}),kit={root,colliders:[],owned:[material],rooms:[],walkables:[]};
 for(const[role,w,h,d,y]of[['support-foot',2.2,.16,1.8,.98],['support-waist',1.9,.46,1.52,1.29],['support-top',2.12,.18,1.72,1.61]]){
  const m=new T.Mesh(new T.BoxGeometry(w,h,d).translate(0,y,5.6),material);m.name='dafotang-shakyamuni-historical-fit/'+role;principal.add(m);
  root.updateMatrixWorld(true);const c=new T.Box3().setFromObject(m);c.dafotangPrincipalMesh=m.uuid;c.dafotangPrincipalRole=role;kit.colliders.push(c);
 }
 const g={id:PLACE,w:45.7,d:16.2,y:.9,front:-8.1,rear:8.1,inventory:{status:'UNKNOWN'},historicalPrincipal:{id:'dafotang-shakyamuni-historical-fit',supportDimensions:[2.2,.8,1.8]}};
 return{kit,f,g,p:{id:PLACE,key:'dafotang'},principal,dispose(){root.traverse(m=>m.geometry?.dispose());for(const m of kit.owned)m.dispose();}};
}
function built(){const h=fixture();try{h.out=buildDafotangHistoricLayout(h);assert.equal(h.out.frame.children.length,85);assert.equal(h.out.contacts.length,85);return h;}catch(e){h.dispose();throw e;}}
function localBox(m){return new T.Box3().setFromObject(m).translate(OFFSET.clone().negate());}
function panels(h){
 const meshes=h.out.frame.children.filter(m=>m.userData.dafotangLayoutRole.startsWith('west-cabinet-'));assert.equal(meshes.length,30);h.kit.root.updateMatrixWorld(true);
 return Array.from({length:6},(_,i)=>{const parts=meshes.slice(i*5,i*5+5);assert.deepEqual(parts.map(m=>m.userData.dafotangLayoutRole),['west-cabinet-unpictured-back','west-cabinet-side-frame','west-cabinet-side-frame','west-cabinet-cross-frame','west-cabinet-cross-frame']);const box=new T.Box3();for(const m of parts)box.union(localBox(m));return{parts,box};});
}
function preservedGeometry(h){
 const digest=meshes=>sha(JSON.stringify(meshes.map(m=>({name:m.name,role:m.userData.dafotangLayoutRole??null,position:m.position.toArray(),quaternion:m.quaternion.toArray(),scale:m.scale.toArray(),visible:m.visible,castShadow:m.castShadow,receiveShadow:m.receiveShadow,material:m.material.name,attributes:Object.fromEntries(Object.entries(m.geometry.attributes).map(([k,a])=>[k,{itemSize:a.itemSize,normalized:a.normalized,array:Array.from(a.array)}])),index:Array.from(m.geometry.index.array),groups:m.geometry.groups}))));
 const nonWest=h.out.frame.children.filter(m=>!m.userData.dafotangLayoutRole.startsWith('west-cabinet-')),supports=h.out.changedPedestals.map(q=>q.mesh);assert.equal(nonWest.length,55);assert.equal(supports.length,3);
 return{nonWestMeshes:55,nonWestSha256:digest(nonWest),replacedPedestalMeshes:3,replacedPedestalsSha256:digest(supports)};
}
// Reverting the height correction would fail these two observed RED assertions.
test('R258 central west inset fields sit at source-guided neck/shoulder band',()=>{
 const h=built();try{for(const i of[1,2,3,4]){const b=panels(h)[i].box;assert.ok(Math.abs(b.min.y-2.875)<2e-6,'R258_CENTRAL_INSET_BOTTOM');near(b.max.y,6.725);assert.ok(b.min.y-1.60>1.274);}}finally{h.dispose();}
});
test('R258 two end west inset fields sit slightly below the central band',()=>{
 const h=built();try{const p=panels(h);for(const i of[0,5]){const b=p[i].box;assert.ok(Math.abs(b.min.y-2.625)<2e-6,'R258_END_INSET_BOTTOM');near(b.max.y,4.875);assert.ok(b.min.y-1.60>1.024);near(p[1].box.min.y-b.min.y,.25);}}finally{h.dispose();}
});
// Horizontal or profile drift, invented inventory, or an elevated beam clash fails.
test('R258 west inset geometry retains its own width depth topology and fitted scope',()=>{
 const h=built();try{const ps=panels(h),zs=[-3.45,-1.97,-.65,.67,1.99,3.47],all=new T.Box3();let tris=0;
 for(let i=0;i<6;i++){const{parts,box}=ps[i],short=i===0||i===5,w=short?1.12:1.25,height=short?2.2:3.8,back=localBox(parts[0]);all.union(box);near(box.min.x,9.46);near(box.max.x,9.5775);near(box.getCenter(new T.Vector3()).z,zs[i]);near(back.max.z-back.min.z,w);near(box.max.z-box.min.z,w+.05);near(back.max.y-back.min.y,height);near(back.min.y,short?2.65:2.90);near(back.max.y,short?4.85:6.70);near(back.min.y-box.min.y,.025);near(box.max.y-back.max.y,.025);
  for(const m of parts){assert.ok(m.visible&&m.castShadow&&m.receiveShadow);assert.equal(m.position.lengthSq(),0);assert.ok(m.quaternion.equals(new T.Quaternion()));assert.ok(m.scale.equals(new T.Vector3(1,1,1)));const p=m.geometry.attributes.position,ix=m.geometry.index;assert.ok([...p.array].every(Number.isFinite));assert.equal(ix.count,36);let volume=0;for(let n=0;n<ix.count;n+=3){const v=[0,1,2].map(k=>new T.Vector3().fromBufferAttribute(p,ix.getX(n+k)));assert.ok(new T.Triangle(...v).getArea()>1e-12);volume+=v[0].dot(v[1].clone().cross(v[2]))/6;tris++;}assert.ok(volume>0);}
 }
 assert.equal(tris,360);assert.equal(new Set(ps.flatMap(p=>p.parts.map(m=>m.geometry))).size,30);near(all.min.z,-4.035);near(all.max.z,4.055);near(all.min.y,2.625);near(all.max.y,6.725);for(const[i,j,gap]of[[0,1,.245],[1,2,.020],[2,3,.020],[3,4,.020],[4,5,.245]])near(ps[j].box.min.z-ps[i].box.max.z,gap);
 // Source envelopes only, not a real-host clearance/attachment acceptance.
 near(45.7/7*1.5-.07-all.max.x,.145357142857);assert.ok(all.min.z-(-4.94)>.904);near(7.975-all.max.z,3.920);near(7.90-all.max.y,1.175);near(8.20-all.max.y,1.475);assert.ok(all.min.y-1.60>1.024);
 assert.equal(h.out.meta.westWallCabinetFrames,6);assert.equal(h.out.meta.westWallFrameScope,'SIX_INSET_DISPLAY_FIELDS__OUTER_CABINET_UNMODELED');assert.equal(h.out.meta.westWallSourceFigure,'2015:printed307:fig23');assert.equal(h.out.meta.newReligiousFigures,0);assert.equal(h.out.meta.newPhotographs,0);assert.equal(h.out.meta.wholeHallInventory,'UNKNOWN');assert.equal(h.out.meta.complete,false);assert.equal(h.out.meta.notEmptyClaim,true);assert.equal(h.g.historicLayout,h.out.meta);assert.equal(h.out.frame.userData.dafotangHistoricLayout,h.out.meta);
 console.log('R258_WEST_GEOMETRY '+JSON.stringify({meshes:30,triangles:tris,actualBounds:[all.min.toArray(),all.max.toArray()],nominalBackingBottoms:[2.90,2.65],actualFrameBottoms:[2.875,2.625],scope:'six inset display fields only; outer cabinet unmodeled'}));
 }finally{h.dispose();}
});
// A stale old-height owner, shifted support offset or duplicate owner fails.
test('R258 all layout owners match actual vertices with only new west high-region contact',()=>{
 const h=built();try{h.kit.root.updateMatrixWorld(true);assert.equal(h.kit.colliders.length,88);
 for(const m of h.out.frame.children){const owners=h.out.contacts.filter(o=>o.dafotangLayoutMesh===m.uuid);assert.equal(owners.length,1);const o=owners[0],s=o.triangleSupport,p=m.geometry.attributes.position,ix=m.geometry.index;assert.equal(o.dafotangLayoutRole,m.userData.dafotangLayoutRole);assert.ok(o.equals(new T.Box3().setFromObject(m)));assert.equal(s.id,m.name+'/'+m.uuid);assert.deepEqual(s.offset.toArray(),OFFSET.toArray());assert.equal(s.template.triangles.length,ix.count/3);for(let i=0;i<s.template.triangles.length;i++)for(const[k,v]of[[0,s.template.triangles[i].triangle.a],[1,s.template.triangles[i].triangle.b],[2,s.template.triangles[i].triangle.c]])assert.ok(v.equals(new T.Vector3().fromBufferAttribute(p,ix.getX(i*3+k))));}
 const body=(x,y,z)=>new T.Box3().setFromCenterAndSize(new T.Vector3(x,y,z).add(OFFSET),new T.Vector3(.006,.006,.006));
 const hit=(x,y,z)=>h.kit.colliders.some(o=>o.triangleSupport&&triangleBodyIntersects(o.triangleSupport,body(x,y,z)));
 for(const z of[-1.97,-.65,.67,1.99]){assert.equal(hit(9.55,2.2,z),false);assert.ok(hit(9.55,6.2,z));assert.ok(hit(9.51,2.90,z));assert.equal(hit(9.3,6.2,z),false);}
 for(const z of[-3.45,3.47]){assert.equal(hit(9.55,2.2,z),false);assert.ok(hit(9.55,4.5,z));assert.ok(hit(9.51,2.65,z));}
 }finally{h.dispose();}
});
// Exact allowed deltas preserve all unrelated bytes and the observed baseline meshes.
test('R258 three explicit west edits reverse to old source and leave all other geometry unchanged',()=>{
 const source=n=>fs.readFileSync(new URL('../../src/scene/palace/special/'+n,import.meta.url),'utf8');let old=source('DafotangHistoricLayout.js');
 const changes=[
  ["westWallCabinetFrames:6,westWallFrameScope:'SIX_INSET_DISPLAY_FIELDS__OUTER_CABINET_UNMODELED',westWallSourceFigure:'2015:printed307:fig23',newReligiousFigures:0","westWallCabinetFrames:6,newReligiousFigures:0"],
  ["  // West(+X), 2015 printed307 fig23: four tall and two shorter inset display fields.\n  // Only these fields/borders are raised; the enclosing long cabinet is unmodeled.\n  // All heights are MODEL_FIT_NOT_SURVEY; no invented small figures or empty claim.","  // West(+X) wall:4 tall center cabinet frames and2 shorter side frames.\n  // No raster images and no fabricated small Buddha reliefs fill these frames."],
  ["  const panels=[[-3.45,1.12,2.2,3.75],[-1.97,1.25,3.8,4.8],[-.65,1.25,3.8,4.8],[.67,1.25,3.8,4.8],[1.99,1.25,3.8,4.8],[3.47,1.12,2.2,3.75]];","  const panels=[[-3.45,1.12,2.2,2.9],[-1.97,1.25,3.8,3.65],[-.65,1.25,3.8,3.65],[.67,1.25,3.8,3.65],[1.99,1.25,3.8,3.65],[3.47,1.12,2.2,2.9]];"]
 ];for(const[after,before]of changes){assert.equal(old.split(after).length,2);old=old.replace(after,before);}assert.equal(sha(old),'10e5c3faae7fcc8f31f365e2a274c719f249d207c9aa4dc3d682ae6e37d03125');
 assert.equal(sha(source('DafotangEastCabinets.js')),'d0c79417b60608596f2947dac116bdd169ef415cb755223bc5dfa54186ca72ff');
 const host=r259PriorHost(source('RemainingOuterHalls.js'));assert.equal(sha(host),'f18e33a0f1b6b37c081a8d856444c4766db385f2fcb7109c6190589945025662');assert.equal((host.match(/buildDafotangHistoricLayout\(c\)/g)||[]).length,1);assert.ok(host.includes('buildDafotangHistoricLayout(c);buildDafotangTriad(c);buildDafotangWeituo(c);buildDafotangWoodPagodas(c);registerDafotangPhotoSlots(c);buildDafotangEastCabinets(c);'));
 const h=built();try{assert.deepEqual(preservedGeometry(h),{nonWestMeshes:55,nonWestSha256:'4a97e77c1fa1c2402bd12f89c9a776c81a91215d7885e79fd6e32280eb9c89e1',replacedPedestalMeshes:3,replacedPedestalsSha256:'a9deb976f914be96f7464c4997610aa5f186e9a0434ccbff6ea689bc879a76f6'});}finally{h.dispose();}
});
// Height-only work must not change installer rejection or old pedestal ownership.
test('R258 retains support courses and rejects duplicate or invalid synthetic host without mutation',()=>{
 const h=fixture();try{const old={children:[...h.f.children],colliders:[...h.kit.colliders],owned:[...h.kit.owned],walks:h.kit.walkables,rooms:h.kit.rooms};h.out=buildDafotangHistoricLayout(h);assert.deepEqual(h.f.children.slice(0,1),old.children);assert.deepEqual(h.kit.owned.slice(0,1),old.owned);assert.equal(h.kit.owned.length,3);assert.equal(h.kit.walkables,old.walks);assert.equal(h.kit.rooms,old.rooms);assert.equal(h.out.changedPedestals.length,3);assert.deepEqual(h.g.historicalPrincipal.supportDimensions,[1.4,.8,1.5]);
  h.kit.root.updateMatrixWorld(true);const support=new T.Box3();for(const q of h.out.changedPedestals){assert.ok(old.colliders.includes(q.oldCollider));assert.equal(h.kit.colliders.includes(q.oldCollider),false);assert.ok(h.kit.colliders.includes(q.newCollider));assert.ok(q.newCollider.equals(new T.Box3().setFromObject(q.mesh)));assert.equal(q.mesh.material,old.owned[0]);support.union(localBox(q.mesh));}near(support.max.x-support.min.x,1.4);near(support.max.y-support.min.y,.8);near(support.max.z-support.min.z,1.5);near(support.min.y,.9);near(support.getCenter(new T.Vector3()).z,5.6);
  const snap={children:[...h.f.children],colliders:[...h.kit.colliders],owned:[...h.kit.owned],metadata:h.g.historicLayout};assert.throws(()=>buildDafotangHistoricLayout(h));assert.deepEqual(h.f.children,snap.children);assert.deepEqual(h.kit.colliders,snap.colliders);assert.deepEqual(h.kit.owned,snap.owned);assert.equal(h.g.historicLayout,snap.metadata);
 }finally{h.dispose();}
 for(const change of[c=>c.g.w++,c=>c.g.inventory.status='KNOWN',c=>c.f.position.x++,c=>c.g.historicalPrincipal.supportDimensions=[3,.8,1.8]]){const c=fixture();try{change(c);const children=[...c.f.children],contacts=[...c.kit.colliders],owned=[...c.kit.owned];assert.throws(()=>buildDafotangHistoricLayout(c));assert.deepEqual(c.f.children,children);assert.deepEqual(c.kit.colliders,contacts);assert.deepEqual(c.kit.owned,owned);assert.equal('historicLayout'in c.g,false);}finally{c.dispose();}}
});

// Explicit R259 additive host compatibility; no original SHA/other assertion changes.
function r259PriorHost(host){const a="import {buildDafotangMainPlaque} from './DafotangMainPlaque.js';\n",b="  if(p.key==='dafotang')buildDafotangMainPlaque(c);\n";assert.equal(host.split(a).length,2);assert.equal(host.split(b).length,2);return host.replace(a,'').replace(b,'');}
