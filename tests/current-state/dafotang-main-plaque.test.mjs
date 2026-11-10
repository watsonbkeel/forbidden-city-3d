// R259 component/synthetic contracts only. No actual hall/Kit/finish/World/GPU.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import * as T from 'three';
import * as api from '../../src/scene/palace/special/DafotangMainPlaque.js';
const near=(a,b)=>assert.ok(Math.abs(a-b)<2e-6,`${a} != ${b}`);
test('R259 readable single-front main plaque obeys source TOTAL envelope and south-view UVs',()=>{
 assert.equal(typeof api.createDafotangMainPlaque,'function','R259_MAIN_PLAQUE_NOT_IMPLEMENTED');
 assert.equal(typeof api.buildDafotangMainPlaque,'function','R259_MAIN_PLAQUE_INSTALLER_NOT_IMPLEMENTED');
 const texture=new T.Texture(),body=new T.MeshStandardMaterial(),front=new T.MeshStandardMaterial({map:texture,side:T.FrontSide});
 let out;const events={geometry:0,material:0,texture:0};
 for(const m of[body,front])m.addEventListener('dispose',()=>events.material++);
 texture.addEventListener('dispose',()=>events.texture++);
 try{
  out=api.createDafotangMainPlaque({materials:{body,front}});
  assert.equal(out.meshes.length,2);assert.equal(new Set(out.meshes.map(m=>m.geometry)).size,2);
  const b=new T.Box3().setFromObject(out.group),size=b.getSize(new T.Vector3()),center=b.getCenter(new T.Vector3());
  near(size.x,3.865);near(size.y,1.44);near(size.z,.045);
  near(center.x,0);near(center.y,7.25);near(center.z,4.4);
  near(b.min.y,6.53);near(b.max.y,7.97);near(b.min.z,4.3775);near(b.max.z,4.4225);
  assert.equal(out.meshes.reduce((n,m)=>n+(m.geometry.index?.count??m.geometry.attributes.position.count)/3,0),14);
  for(const m of out.meshes){assert.equal(m.userData.noMerge,true);m.geometry.addEventListener('dispose',()=>events.geometry++);}
  const glyph=out.meshes.find(m=>m.material===front),reverse=out.meshes.find(m=>m.material===body);
  assert.ok(glyph&&reverse);assert.equal(body.map,null);assert.equal(front.side,T.FrontSide);
  out.group.updateMatrixWorld(true);const positions=glyph.geometry.attributes.position,uv=glyph.geometry.attributes.uv;
  for(let i=0;i<positions.count;i++){
   const p=new T.Vector3().fromBufferAttribute(positions,i).applyMatrix4(glyph.matrixWorld);
   // Pixel-left u=0 must be viewer-left/local +X after south-facing rotation.
   if(uv.getX(i)===0)near(p.x,1.9325);
   if(uv.getX(i)===1)near(p.x,-1.9325);
   near(p.z,4.3775);
  }
  const n=new T.Vector3(0,0,1).transformDirection(glyph.matrixWorld);near(n.z,-1);
  assert.equal(out.metadata.text,'萬壽無疆');assert.equal(out.metadata.visualLeftToRight,'疆無壽萬');
  assert.equal(out.metadata.mount.status,'MODEL_FIT_NOT_SURVEY');
  out.dispose();out.dispose();assert.deepEqual(events,{geometry:2,material:0,texture:0});
 }finally{out?.dispose();body.dispose();front.dispose();texture.dispose();}
});
const PLACE='place-outer-west-6cae88b6a2',ID='dafotang-main-plaque-modern-semantic-fit-v1';
const IMP="import {buildDafotangMainPlaque} from './DafotangMainPlaque.js';\n";
const CALL="  if(p.key==='dafotang')buildDafotangMainPlaque(c);\n";
const sha=raw=>createHash('sha256').update(raw).digest('hex');
function fixture(){
 const root=new T.Group();root.name='outer-west';const f=new T.Group();f.position.set(221.9,0,241.1);root.add(f);
 const old=new T.MeshStandardMaterial({name:'borrowed-old'}),oldMeshes=[];
 const g={id:PLACE,w:45.7,d:16.2,y:.9,h:7.84,bays:7,front:-8.1,rear:8.1,inventory:{status:'UNKNOWN'},historicalPrincipal:{id:'dafotang-shakyamuni-historical-fit'},historicLayout:{id:'dafotang-historic-spatial-fit-v1'},eastCabinetsFit:{id:'dafotang-east-cabinets-source-fit-v1'}};
 const kit={root,owned:[old],ownedTextures:[],colliders:[new T.Box3(new T.Vector3(220,0,240),new T.Vector3(224,.9,244))],walkables:[{old:true}],rooms:[{name:'old room'}]};
 const box=(role,w,h,d,x,y,z,parent=f)=>{const m=new T.Mesh(new T.BoxGeometry(w,h,d),old);m.position.set(x,y,z);m.name=role;m.userData.role=role;parent.add(m);oldMeshes.push(m);return m;};
 const shrine=new T.Group();shrine.name=g.historicLayout.id;shrine.userData.dafotangHistoricLayout=g.historicLayout;f.add(shrine);
 const top=box('upper-front-entablature',5,.22,.28,0,6.34,4.55,shrine);top.userData.dafotangLayoutRole='upper-front-entablature';
 box('dafotang-plain-ceiling',45.7,.08,16.2,0,8.24,0);
 for(let k=1;k<7;k++)box('dafotang-transverse-ceiling-frame',.2,.26,16.2,-22.85+k*45.7/7,8.04,0);
 for(const z of[-2.7,2.7])box('dafotang-longitudinal-ceiling-frame',45.7,.24,.18,0,8.02,z);
 root.updateMatrixWorld(true);
 const c={kit,f,g,p:{id:PLACE,key:'dafotang',zone:'outer-west'},oldMeshes};
 c.dispose=()=>{root.traverse(m=>m.geometry?.dispose());kit.owned.forEach(m=>m.dispose());kit.ownedTextures?.forEach(t=>t.dispose());};return c;
}
function controlledLoader(){const calls=[];return{calls,load(url,onLoad,onProgress,onError){calls.push({url,onLoad,onError});return{};}};}
const image=()=>({width:768,height:286,complete:true});
function watch(out){const counts=new Map();for(const r of[...out.meshes.map(m=>m.geometry),...new Set(out.meshes.map(m=>m.material)),out.texture]){counts.set(r,0);r.addEventListener('dispose',()=>counts.set(r,counts.get(r)+1));}return counts;}
const allReleased=counts=>assert.ok([...counts.values()].every(n=>n===1),JSON.stringify([...counts.values()]));
function snap(c){return{children:[...c.f.children],owned:[...c.kit.owned],textures:[...c.kit.ownedTextures],colliders:[...c.kit.colliders],walks:c.kit.walkables,rooms:c.kit.rooms,metadata:Object.getOwnPropertyDescriptor(c.g,'mainPlaqueFit'),bounds:c.oldMeshes.map(m=>m.geometry.boundingBox),matrixValues:c.oldMeshes.map(m=>m.matrixWorld.toArray()),contactDigest:sha(JSON.stringify(c.kit.colliders.map(b=>[b.min.toArray(),b.max.toArray()]))),oldMeshDigest:sha(JSON.stringify(c.oldMeshes.map(m=>[...m.geometry.attributes.position.array,m.position.toArray(),m.material.uuid,m.material.visible]))) };}
function unchanged(c,s,children=true){if(children)assert.deepEqual(c.f.children,s.children);assert.deepEqual(c.kit.owned,s.owned);assert.deepEqual(c.kit.ownedTextures,s.textures);assert.deepEqual(c.kit.colliders,s.colliders);assert.equal(c.kit.walkables,s.walks);assert.equal(c.kit.rooms,s.rooms);assert.equal(snap(c).oldMeshDigest,s.oldMeshDigest);assert.deepEqual(c.oldMeshes.map(m=>m.geometry.boundingBox),s.bounds);assert.deepEqual(c.oldMeshes.map(m=>m.matrixWorld.toArray()),s.matrixValues);assert.equal(snap(c).contactDigest,s.contactDigest);}
// This is ONLY the existing merge keep branch's reparenting, not Kit.finish.
function keepMove(c,out){c.kit.root.updateMatrixWorld(true);const result=new T.Group();for(const m of out.meshes){assert.equal(m.userData.noMerge,true);const world=m.matrixWorld.clone();m.removeFromParent();world.decompose(m.position,m.quaternion,m.scale);result.add(m);}return result;}

test('R259 two Vite bases load once and reveal the same kept leaves only after decoded success',()=>{
 for(const baseURL of['/gugong/','/forbidden-city-3d/']){const c=fixture(),before=snap(c),loader=controlledLoader();let out;
  try{out=api.buildDafotangMainPlaque(c,{imageLoader:loader,baseURL});const counts=watch(out);
   assert.equal(loader.calls.length,1);assert.equal(loader.calls[0].url,baseURL+'textures/dafotang/wanshou-wujiang-modern-tc-r259.png');
   assert.equal(out.state.status,'loading');assert.ok(out.meshes.every(m=>!m.visible&&!m.material.visible));assert.equal(c.kit.owned.length,before.owned.length+2);assert.deepEqual(c.kit.ownedTextures,[out.texture]);assert.deepEqual(c.kit.colliders,before.colliders);
   assert.equal(c.g.mainPlaqueFit,out.metadata);assert.equal('state'in out.metadata,false);assert.equal('assetState'in out.metadata,false);
   const cloned=structuredClone(out.metadata),kept=keepMove(c,out),decoded=image();loader.calls[0].onLoad(decoded);
   assert.equal(out.state.status,'ready');assert.ok(out.meshes.every(m=>m.visible&&m.material.visible&&m.parent===kept));assert.equal(out.texture.image,decoded);assert.equal(out.texture.colorSpace,T.SRGBColorSpace);assert.equal(out.texture.flipY,true);assert.equal(cloned.runtimeStateLocation,'RETAINED_MESH_AND_MATERIAL_USER_DATA');
   assert.throws(()=>api.buildDafotangMainPlaque(c,{imageLoader:loader,baseURL}),/duplicate|once|already/i);assert.equal(loader.calls.length,1);
   // Match host order: geometry traverse, owned materials, owned textures.
   kept.traverse(m=>m.geometry?.dispose());c.kit.owned.forEach(m=>m.dispose());c.kit.ownedTextures.forEach(t=>t.dispose());
   assert.equal(out.state.status,'disposed');out.dispose();out.dispose();allReleased(counts);assert.ok(out.meshes.every(m=>m.parent===null&&!m.visible&&!m.material.visible));
   assert.equal(snap(c).oldMeshDigest,before.oldMeshDigest);assert.equal(c.kit.walkables,before.walks);assert.equal(c.kit.rooms,before.rooms);
  }finally{out?.dispose();c.dispose();}
 }
});
test('R259 failed image and wrong decoded size never show even a blank board; late onLoad cannot resurrect',()=>{
 for(const fail of[row=>row.onError(Error('network')),row=>row.onLoad({width:1,height:1,complete:true}),row=>row.onLoad({width:768,height:286,complete:false}),row=>row.onLoad({get naturalWidth(){throw Error('dimension getter');},height:286,complete:true})]){
  const c=fixture(),loader=controlledLoader();let out;
  try{out=api.buildDafotangMainPlaque(c,{imageLoader:loader,baseURL:'/gugong/'});const counts=watch(out);fail(loader.calls[0]);assert.equal(out.state.status,'failed');assert.ok(out.meshes.every(m=>!m.visible&&!m.material.visible));assert.equal(out.texture.image,null);
   out.dispose();out.dispose();let closed=0;loader.calls[0].onLoad({...image(),close(){closed++;}});assert.equal(closed,1);assert.equal(out.state.status,'disposed');assert.equal(out.texture.image,null);assert.ok(out.meshes.every(m=>m.parent===null&&!m.visible));allReleased(counts);
  }finally{out?.dispose();c.dispose();}
 }
});
test('R259 manual disposal before response releases owners once and ignores late error/success',()=>{
 const c=fixture(),before=snap(c),loader=controlledLoader();let out;
 try{out=api.buildDafotangMainPlaque(c,{imageLoader:loader,baseURL:'/gugong/'});const counts=watch(out);out.dispose();out.dispose();allReleased(counts);unchanged(c,before);assert.equal(out.state.status,'disposed');loader.calls[0].onError(Error('late'));let closed=0;loader.calls[0].onLoad({...image(),close(){closed++;}});assert.equal(closed,1);assert.equal(out.state.status,'disposed');assert.equal(out.texture.image,null);allReleased(counts);
 }finally{out?.dispose();c.dispose();}
});
test('R259 exact transformed/obstructed/missing-beam/readonly/duplicate hosts reject before external load',()=>{
 for(const change of[c=>c.f.position.x++,c=>c.kit.root.scale.x=2,c=>c.g.w++,c=>c.oldMeshes[0].position.y+=.5,c=>c.oldMeshes[0].position.x+=.1,c=>c.oldMeshes[0].position.z+=.1,c=>c.f.children.find(o=>o.name===c.g.historicLayout.id).position.x+=.1,c=>c.f.children.find(o=>o.name===c.g.historicLayout.id).position.z+=.1,c=>c.oldMeshes.find(m=>m.name==='dafotang-longitudinal-ceiling-frame').position.z=4.4,c=>c.oldMeshes.find(m=>m.name==='dafotang-plain-ceiling').name='missing',c=>Object.defineProperty(c.g,'mainPlaqueFit',{value:undefined,writable:false})]){
  const c=fixture(),loader=controlledLoader();try{change(c);c.kit.root.updateMatrixWorld(true);const before=snap(c);assert.throws(()=>api.buildDafotangMainPlaque(c,{imageLoader:loader,baseURL:'/gugong/'}));assert.equal(loader.calls.length,0);unchanged(c,before);assert.deepEqual(Object.getOwnPropertyDescriptor(c.g,'mainPlaqueFit'),before.metadata);}finally{c.dispose();}
 }
});
test('R259 publication and synchronous request exceptions roll back every old reference and allocated owner',()=>{
 for(const point of['add','owned','load']){const c=fixture(),before=snap(c),loader=controlledLoader(),originalAdd=c.f.add,originalPush=c.kit.owned.push,addDescriptor=Object.getOwnPropertyDescriptor(c.f,'add'),pushDescriptor=Object.getOwnPropertyDescriptor(c.kit.owned,'push');const restoreMethods=()=>{if(addDescriptor)Object.defineProperty(c.f,'add',addDescriptor);else delete c.f.add;if(pushDescriptor)Object.defineProperty(c.kit.owned,'push',pushDescriptor);else delete c.kit.owned.push;};const events={geometry:0,material:0,texture:0},seen={geometry:new Set(),material:new Set(),texture:new Set()};
  const prototypes=[['geometry',T.BufferGeometry.prototype],['material',T.Material.prototype],['texture',T.Texture.prototype]],saved=[];
  for(const[k,p]of prototypes){const old=p.dispose;saved.push([p,old]);p.dispose=function(){assert.ok(!seen[k].has(this));seen[k].add(this);events[k]++;return old.call(this);};}
  if(point==='add')c.f.add=function(...xs){originalAdd.apply(this,xs);throw Error('R259 injected add');};
  if(point==='owned')c.kit.owned.push=function(...xs){originalPush.apply(this,xs);throw Error('R259 injected owned');};
  if(point==='load')loader.load=()=>{throw Error('R259 injected load');};
  try{assert.throws(()=>api.buildDafotangMainPlaque(c,{imageLoader:loader,baseURL:'/gugong/'}),/R259 injected/);restoreMethods();unchanged(c,before);assert.deepEqual(Object.getOwnPropertyDescriptor(c.g,'mainPlaqueFit'),before.metadata);assert.deepEqual(events,{geometry:2,material:2,texture:1});}
  finally{restoreMethods();for(const[p,old]of saved)p.dispose=old;c.dispose();}
 }
});
test('R259 actual host function bytes call the real builder after beams, before retained roof/exterior plaque',()=>{
 const host=fs.readFileSync(new URL('../../src/scene/palace/special/RemainingOuterHalls.js',import.meta.url),'utf8');
 assert.equal(host.split(IMP).length,2);assert.equal(host.split(CALL).length,2);assert.equal(sha(host.replace(IMP,'').replace(CALL,'')),'f18e33a0f1b6b37c081a8d856444c4766db385f2fcb7109c6190589945025662');
 const start=host.indexOf('function buildCeremonialHall(kit,item,p) {'),end=host.indexOf('\nfunction buildCiningModernDisplay',start);assert.ok(start>=0&&end>start);const actual=host.slice(start,end);
 const c=fixture(),loader=controlledLoader(),events=[];let out;const noop=()=>{};
 c.box=(role)=>events.push(role);c.wallX=c.wallZ=c.face=c.partition=c.register=noop;c.item={name:'大佛堂'};c.kit.dafotangFrontFit=false;c.kit.roof=()=>events.push('roof');c.kit.plaque=(...args)=>{events.push('exterior');assert.equal(args[1],'大佛堂');near(args[4],-8.42);assert.deepEqual(args.slice(5),[1.2,1.9]);};
 const deps={base:()=>c,columns:noop,buildCiningFrontFit:noop,buildDafotangFrontFit:noop,buildCiningModernDisplay:noop,retainLegacyFurniture:noop,buildDafotangMainBuddha:noop,buildDafotangHistoricLayout:noop,buildDafotangTriad:noop,buildDafotangWeituo:noop,buildDafotangWoodPagodas:noop,registerDafotangPhotoSlots:noop,buildDafotangEastCabinets:noop,plainCeiling:()=>events.push('ceiling'),addHallBearingRing:()=>events.push('bearing'),buildDafotangMainPlaque:ctx=>{assert.equal(ctx,c);events.push('main');out=api.buildDafotangMainPlaque(ctx,{imageLoader:loader,baseURL:'/gugong/'});},finish:ctx=>ctx};
 try{const fn=new Function('deps','const {'+Object.keys(deps).join(',')+'}=deps;'+actual+';return buildCeremonialHall;')(deps);assert.equal(fn(c.kit,c.item,c.p),c);assert.equal(events.filter(x=>x==='main').length,1);assert.ok(events.indexOf('main')>events.lastIndexOf('dafotang-longitudinal-ceiling-frame'));assert.deepEqual(events.slice(-4),['bearing','main','roof','exterior']);assert.equal(loader.calls.length,1);
 }finally{out?.dispose();c.dispose();}
 const png=fs.readFileSync(new URL('../../public/textures/dafotang/wanshou-wujiang-modern-tc-r259.png',import.meta.url));assert.equal(png.length,11151);assert.equal(sha(png),'8b814c7439788f2eb0f4bedbe08f7e674de18120d0bb4f1d38e1175943f8e70e');const license=fs.readFileSync(new URL('../../public/textures/dafotang/wanshou-wujiang-modern-tc-r259.SOURCE-LICENSE.txt',import.meta.url));assert.equal(sha(license),'0eb3f5c26fc702117dc11b64f2e5d5bc1dbef27ec0476dbe7eb4f091c287bac9');
});

// Any owned geometry can be disposed before the host material phase. Its
// event must terminate loading without mutating an in-progress traversal.
test('R259 one early geometry disposal blocks late reveal and leaves siblings for exactly-once cleanup',()=>{
 const c=fixture(),loader=controlledLoader();let out;
 try{out=api.buildDafotangMainPlaque(c,{imageLoader:loader,baseURL:'/gugong/'});const counts=watch(out),parents=out.meshes.map(m=>m.parent),children=[...out.group.children];
  out.meshes[0].geometry.dispose();assert.equal(out.state.status,'disposed');assert.deepEqual(out.group.children,children);assert.deepEqual(out.meshes.map(m=>m.parent),parents);assert.ok(out.meshes.every(m=>!m.visible&&!m.material.visible));
  let closed=0;loader.calls[0].onLoad({...image(),close(){closed++;}});assert.equal(closed,1);assert.equal(out.state.status,'disposed');assert.equal(out.texture.image,null);assert.ok(out.meshes.every(m=>!m.visible));
  out.dispose();out.dispose();allReleased(counts);assert.ok(out.meshes.every(m=>m.parent===null));
 }finally{out?.dispose();c.dispose();}
});
