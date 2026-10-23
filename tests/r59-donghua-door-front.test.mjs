import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {library,gate,sceneFor,probe,faces,passageFaces,uvPoint,ray,triangles,goldRuns,binding,west,hash,textureHash,canvasDOM,loadLocalTextureLibrary} from './lib/r59-donghua-door-fixture.mjs';
import {applyDonghuaCentralDoorFront as apply,isDonghuaCentralDoorTarget as matches} from '../src/scene/palace/special/DonghuaCentralDoorFront.js';
const KEY='donghua_central_nine_row_front',sorted=rows=>rows.map(JSON.stringify).sort();
const physics=c=>hash([c.kit.colliders,c.kit.walkables,c.kit.rooms,c.kit.mapItems,c.kit.regions]);
const close=c=>{c.kit.dispose(c.root??c.kit.root);c.lib?.dispose();};

test('exact binding rejects other zones, ordinals, declarations, anchors and west gate',()=>{
 assert.equal(matches(binding),true);
 for(const b of [{},{...binding,zoneId:'outer-west'},{...binding,itemIndex:20},
  ...Object.entries({name:'西华门',kind:'gate',cityGateProfile:'other',x:-365.81,z:-257.01,rot:Math.PI/2,w:5.5,h:6,t:1,width:30,height:9,depth:15,open:true,gateKind:'three-bay',gateProfile:'east-west'}).map(([k,v])=>({...binding,item:{...binding.item,[k]:v}}))])assert.equal(matches(b),false);
});

test('all actual original vertex attributes, normals, UVs, triangle count, transforms and physics are retained',async()=>{
 const lib=await library(),c=gate(lib),before=triangles(c.frame,{material:false}),beforePhysics=physics(c),poses=c.leaves.map(m=>[m.position.toArray(),m.rotation.toArray(),m.scale.toArray()]);
 const originals=c.leaves.map((m,i)=>({attributes:Object.fromEntries(Object.entries(m.geometry.attributes).map(([k,a])=>[k,[a.itemSize,a.normalized,...a.array]])),five:triangles(m,{world:false}).filter(t=>!t.n.every(n=>n[2]===[1,-1][i]))}));
 const sidePortals=c.frame.children.filter(o=>o.name.startsWith('portal-')&&o!==c.portal).map(p=>hash(triangles(p)));
 assert.equal(apply(c.kit,c.frame,binding),true);
 assert.deepEqual(sorted(triangles(c.frame,{material:false})),sorted(before));assert.equal(physics(c),beforePhysics);
 assert.deepEqual(c.leaves.map(m=>[m.position.toArray(),m.rotation.toArray(),m.scale.toArray()]),poses);
 for(const [i,m]of c.leaves.entries()){
  assert.deepEqual(Object.fromEntries(Object.entries(m.geometry.attributes).map(([k,a])=>[k,[a.itemSize,a.normalized,...a.array]])),originals[i].attributes);
  assert.deepEqual(triangles(m,{world:false}).filter(t=>t.material==='door_studded_material'),originals[i].five);
  assert.deepEqual(Object.fromEntries(Object.entries(m.children[0].geometry.attributes).map(([k,a])=>[k,[a.itemSize,a.normalized,...a.array]])),originals[i].attributes);
  assert.equal(triangles(m).length,12);assert.equal(m.children[0].geometry.index.count,6);assert.equal(m.geometry.index.count,30);
 }
 assert.deepEqual(c.frame.children.filter(o=>o.name.startsWith('portal-')&&o!==c.portal).map(p=>hash(triangles(p))),sidePortals);
 const sceneBeforeRepeat=hash(triangles(c.frame)),sizes=[lib.materials.size,lib.colors.size,lib.normals.size];
 assert.equal(apply(c.kit,c.frame,binding),false);assert.equal(hash(triangles(c.frame)),sceneBeforeRepeat);assert.deepEqual([lib.materials.size,lib.colors.size,lib.normals.size],sizes);
 close({...c,lib});
});

for(const quality of ['hd','sd'])test(`${quality}: actual world-space passage faces and gold pixels are visible before and after finish`,async()=>{
 for(const correct of [false,true]){
  const lib=await library(quality),c=gate(lib);if(correct)assert.equal(apply(c.kit,c.frame,binding),true);
  for(const finish of [false,true]){
   const s=sceneFor(c,{finish}),seen=probe(s,{correct});assert.equal(seen.length,2);
   assert.deepEqual(seen.map(x=>Math.round(x.normal[2])),[-1,1]);
   for(const leaf of seen){assert.equal(leaf.legal,true);assert.equal(leaf.ground,0);assert.equal(leaf.rows.length,correct?9:10);assert.ok(leaf.rows.every(r=>r.goldPixel&&r.visible));}
   if(correct){const fs=passageFaces(s.scene,KEY);for(const f of fs){
    // Explicit lower edge visibility: no borrowed .47m slab mask or padding.
    const target=uvPoint(f,.5,.002),hit=ray(s.scene,new THREE.Vector3(-370.98,1.7,-257),target);
    assert.ok(target.y<.02&&target.y>0);assert.equal(hit?.object,f[0].mesh);assert.ok(hit.point.distanceTo(target)<.02);
   }}
   if(finish)c.root=s.root;
  }
  close({...c,lib});
 }
});

for(const quality of ['hd','sd'])test(`${quality}: eight x columns and complete edge/ring pixels survive albedo and normal remapping`,async()=>{
 const lib=await library(quality),c=gate(lib),base=lib.material('door_studded');apply(c.kit,c.frame,binding);const mat=c.leaves[0].children[0].material;
 const old=goldRuns(base.map.image,'x',85/1024,[.04,.96]),now=goldRuns(mat.map.image,'x',85/926,[.04,.96]);
 assert.equal(old.length,8);assert.equal(now.length,8);for(let i=0;i<8;i++)for(let j=0;j<2;j++)assert.ok(Math.abs(old[i][j]-now[i][j])<=(quality==='hd'?1:3));
 for(const [src,dst]of [[base.map,mat.map],[base.normalMap,mat.normalMap]]){
  const w=src.image.width,h=src.image.height,cut0=h*136/1024,cut1=h*234/1024;
  // Independent inverse row-center sampling, including fractional SD-normal
  // cuts, verifies the retained data without repeating the canvas splice.
  const sc=src.image.getContext('2d'),dc=dst.image.getContext('2d');
  assert.equal(dst.image.width,w);assert.equal(dst.image.height,h);
  assert.notEqual(dst.source,src.source);assert.notEqual(dst.image,src.image);
  // Full-width content reaches both boundaries and the full ring region.
  // Sample every x along several complete rows, compare original inverse y.
  for(const fy of [.01,.04,.31,.46,.51,.57,.91,.99]){
   const y=Math.floor(fy*h),retainedY=(y+.5)*926/1024,sy=retainedY+(retainedY>=cut0?cut1-cut0:0);
   const sourceRow=sc.getImageData(0,Math.min(h-1,Math.floor(sy)),w,1).data,targetRow=dc.getImageData(0,y,w,1).data;
   let total=0;for(let x=0;x<w;x++){assert.equal(targetRow[x*4+3],255);for(let k=0;k<3;k++)total+=Math.abs(sourceRow[x*4+k]-targetRow[x*4+k]);}
   assert.ok(total/(w*3)<12,`all x pixels retained in ${src.name} row ${fy}, interpolation-only difference`);
  }
  // Albedo and normal use identical normalized y mapping; no flat/red padding.
  const bottom=[...dc.getImageData(Math.floor(w/2),h-1,1,1).data];assert.notDeepEqual(bottom,src===base.map?[154,31,22,255]:[128,128,255,255]);
 }
 assert.equal(c.frame.userData.donghuaCentralDoorFront.visibleGraphicFit.minY,0);
 assert.equal(c.frame.userData.donghuaCentralDoorFront.visibleGraphicFit.verticalScale,1024/926);
 close({...c,lib});
});

test('finish preserves geometry and every non-target portal, rear face and west-gate material',async()=>{
 const lib=await library(),before=gate(lib),after=gate(lib),westItem=west.items.find(i=>i.name==='西华门');
 const {buildEastWestCityGate}=await import('../src/scene/palace/special/EastWestCityGate.js');
 for(const c of [before,after])buildEastWestCityGate(c.kit,westItem);
 assert.equal(apply(after.kit,after.frame,binding),true);
 const bs=sceneFor(before,{finish:true}),as=sceneFor(after,{finish:true});
 assert.deepEqual(sorted(triangles(as.scene,{material:false})),sorted(triangles(bs.scene,{material:false})));
 assert.equal(as.root.children.length,bs.root.children.length+1);
 const changed=triangles(as.scene).filter(t=>t.material===KEY);assert.equal(changed.length,4);
 const changedKeys=new Set(changed.map(t=>JSON.stringify({...t,material:'door_studded_material'})));
 assert.deepEqual(sorted(triangles(as.scene).filter(t=>t.material!==KEY)),sorted(triangles(bs.scene).filter(t=>!changedKeys.has(JSON.stringify(t)))));
 assert.ok(triangles(as.scene).some(t=>t.material==='door_studded_material'&&t.p.every(p=>p[0]>350)),'west door stays on original image');
 close(bs);close(as);lib.dispose();
});

test('derivatives retain texture/material settings, own independent Sources, reuse only within a library and dispose once',async()=>{
 const lib=await library(),other=await library(),a=gate(lib),b=gate(lib),c=gate(other),base=lib.material('door_studded'),old=[textureHash(base.map),textureHash(base.normalMap)],sizes=[lib.colors.size,lib.normals.size,lib.materials.size];
 for(const q of [a,b,c])assert.equal(apply(q.kit,q.frame,binding),true);
 const mat=a.leaves[0].children[0].material;assert.equal(mat,a.leaves[1].children[0].material);assert.equal(mat,b.leaves[0].children[0].material);assert.notEqual(mat,c.leaves[0].children[0].material);assert.notEqual(mat.map,c.leaves[0].children[0].material.map);
 assert.deepEqual([textureHash(base.map),textureHash(base.normalMap)],old);assert.equal(goldRuns(base.map.image).length,10);
 assert.deepEqual([lib.colors.size,lib.normals.size,lib.materials.size],sizes.map(n=>n+1));
 for(const [derived,original]of [[mat.map,base.map],[mat.normalMap,base.normalMap]]){
  assert.notEqual(derived.source,original.source);for(const k of ['colorSpace','wrapS','wrapT','flipY','anisotropy','magFilter','minFilter','generateMipmaps'])assert.equal(derived[k],original[k]);
  for(const k of ['repeat','offset','center'])assert.deepEqual(derived[k].toArray(),original[k].toArray());
 }
 for(const k of ['roughness','metalness','side','transparent','opacity','alphaTest','depthTest','depthWrite'])assert.equal(mat[k],base[k]);assert.deepEqual(mat.normalScale.toArray(),base.normalScale.toArray());
 const resources=[mat,mat.map,mat.normalMap],disposed=new Map(resources.map(r=>[r,0]));for(const r of resources){assert.equal(lib.owns(r),true);r.addEventListener('dispose',()=>disposed.set(r,disposed.get(r)+1));}
 for(const q of [a,b,c])close(q);assert.deepEqual([...disposed.values()],[0,0,0]);lib.dispose();assert.deepEqual([...disposed.values()],[1,1,1]);other.dispose();assert.equal(lib.colors.size+lib.normals.size+lib.materials.size,0);
});

test('mutated frame, portal or either leaf rejects atomically without adding resources',async()=>{
 const mutations=[c=>c.frame.position.x+=.01,c=>c.frame.rotation.y+=.01,c=>c.frame.scale.x=2,c=>c.frame.userData.structure.id='city-gates/xihua',c=>c.portal.position.x+=.01,c=>c.portal.rotation.y=.1,c=>c.leaves[0].position.y=.01,c=>c.leaves[1].rotation.y=0,c=>c.leaves[1].geometry.parameters.width=3];
 const lib=await library();for(const mutate of mutations){const c=gate(lib);mutate(c);const before=hash(triangles(c.frame)),sizes=[lib.colors.size,lib.normals.size,lib.materials.size];assert.equal(apply(c.kit,c.frame,binding),false);assert.equal(hash(triangles(c.frame)),before);assert.deepEqual([lib.colors.size,lib.normals.size,lib.materials.size],sizes);close(c);}lib.dispose();
});

for(const quality of ['hd','sd'])for(const file of ['door_studded.webp','door_studded_n.webp'])test(`${quality}: real loader failure ${file} preserves originals and records NOT_CORRECTED`,async t=>{
 canvasDOM();const warnings=[];t.mock.method(console,'warn',(...args)=>warnings.push(args[0]));const {library:lib,reads}=await loadLocalTextureLibrary({quality,scope:'door',failFiles:[file]});
 assert.equal(warnings.length,1);assert.ok(reads.some(p=>p.endsWith('/'+file)));const c=gate(lib),before=hash(triangles(c.frame)),base=c.leaves[0].material;
 if(file==='door_studded.webp'){assert.equal(base.map.image.width,64);assert.equal(lib.has('door_studded'),false);}else assert.equal(base.normalMap,null);
 assert.equal(apply(c.kit,c.frame,binding),false);assert.equal(hash(triangles(c.frame)),before);assert.ok(c.leaves.every(m=>m.material===base&&!m.children.length));assert.equal(lib.materials.has(KEY),false);
 const s=sceneFor(c,{finish:true});assert.equal(s.root.userData.donghuaCentralDoorFront.status,'NOT_CORRECTED');assert.equal(s.root.userData.donghuaCentralDoorFront.reason,'SOURCE_UNAVAILABLE');close({...s,lib});
});

test('unloaded procedural fallback and material-only library never pretend to be corrected',async()=>{
 const {TextureLibrary}=await import('../src/utils/TextureLibrary.js');const {library:cpu}=await import('./lib/inner-palace-fixture.mjs');canvasDOM();
 for(const lib of [new TextureLibrary(),cpu()]){const c=gate(lib),base=c.leaves[0].material,before=hash(triangles(c.frame));assert.equal(apply(c.kit,c.frame,binding),false);assert.equal(hash(triangles(c.frame)),before);assert.ok(c.leaves.every(m=>m.material===base&&!m.children.length));assert.equal(c.kit.root.userData.donghuaCentralDoorFront.status,'NOT_CORRECTED');close(c);lib.dispose?.();}
});
