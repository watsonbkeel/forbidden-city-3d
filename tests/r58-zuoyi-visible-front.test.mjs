import test from 'node:test';import assert from 'node:assert/strict';
import * as THREE from 'three';
import {component,probe,faces,uvPoint,ray,triangles,goldRuns} from './lib/r58-zuoyi-visible-fixture.mjs';
import {library,gate,binding,hash,textureHash} from './lib/r58-zuoyi-door-fixture.mjs';
import {applyZuoyiDoorFront} from '../src/scene/palace/special/ZuoyiDoorFront.js';
const sorted=rows=>rows.map(x=>JSON.stringify(x)).sort();

test('both actual submitted passage-facing skins expose all eighteen gold-row samples from a legal eye',async()=>{
 const c=await component(),seen=probe(c);assert.equal(seen.length,2);
 for(const leaf of seen){assert.equal(leaf.legal,true);assert.equal(leaf.rows.length,9);assert.equal(leaf.detectedRuns.length,9);for(const [i,row]of leaf.rows.entries()){assert.equal(row.goldPixel,true,'sample must hit the actual gold stud, not just its mesh');assert.equal(row.visible,true,`leaf z=${leaf.center[2]} row ${i+1} at y=${row.target[1]} hit ${row.material}`);}}
 assert.deepEqual(seen.map(o=>Math.round(o.normal[2])),[-1,1]);c.dispose();
});

test('full nine-row graphic and both complete edge bands fit above the actual retained stone-slab top',async()=>{
 const c=await component(),fs=faces(c.scene);let slabTop=-Infinity;
 c.scene.traverse(m=>{if(m.isMesh&&m.material?.name==='stone_slab_material'){const a=m.geometry.attributes.position;for(let i=0;i<a.count;i++)slabTop=Math.max(slabTop,a.getY(i));}});
 assert.ok(Math.abs(slabTop-.46)<1e-6);
 for(const f of fs){const image=f[0].mesh.material.map.image,runs=goldRuns(image);assert.equal(runs.length,9);
  for(const [a,b]of runs){const point=uvPoint(f,65/762,1-(a+b)/2/image.height);assert.ok(point.y>slabTop+.1,'even the last stud row must not be buried');}
  // Texture content bottom is fitted at y=.47, not clipped off or hidden by the
  // original y=.46 slab. Probe inside the bottom hinge band itself, not metadata.
  const point=uvPoint(f,.5,(.47+.015)/4.4),eye=new THREE.Vector3(-105.045,2.15,-53.1),hit=ray(c.scene,eye,point);
  assert.equal(hit?.object,f[0].mesh);assert.ok(hit.point.distanceTo(point)<.02);
 }
 c.dispose();
});

test('each leaf retains its own original other five faces, transforms, geometry count and physics',async()=>{
 const lib=await library(),c=gate(lib),before=triangles(c.frame,{material:false}),physics=hash([c.kit.colliders,c.kit.walkables,c.kit.rooms,c.kit.mapItems]),poses=c.leaves.map(m=>[m.position.toArray(),m.rotation.toArray(),m.scale.toArray()]);
 const untouched=c.leaves.map((leaf,i)=>triangles(leaf,{world:false}).filter(t=>!t.n.every(n=>n[2]===[1,-1][i]))),oldColor=textureHash(lib.color('door_studded')),oldNormal=textureHash(lib.normal('door_studded'));
 assert.equal(applyZuoyiDoorFront(c.kit,c.frame,binding),true);
 assert.deepEqual(sorted(triangles(c.frame,{material:false})),sorted(before));
 for(const [i,leaf]of c.leaves.entries()){
  const rows=triangles(leaf,{world:false});assert.equal(rows.length,12);
  assert.deepEqual(rows.filter(t=>t.material==='door_studded_material'),untouched[i]);
  assert.equal(rows.filter(t=>t.material==='zuoyi_nine_row_front').length,2);
 }
 assert.deepEqual(c.leaves.map(m=>[m.position.toArray(),m.rotation.toArray(),m.scale.toArray()]),poses);
 assert.equal(hash([c.kit.colliders,c.kit.walkables,c.kit.rooms,c.kit.mapItems]),physics);
 assert.equal(textureHash(lib.color('door_studded')),oldColor);assert.equal(textureHash(lib.normal('door_studded')),oldNormal);
 c.kit.dispose(c.kit.root);lib.dispose();
});

test('visible-fit correction adds no triangles or draws beyond the existing two-skin implementation',async()=>{
 const before=await component({correct:false}),after=await component();
 assert.deepEqual(sorted(triangles(before.scene,{material:false})),sorted(triangles(after.scene,{material:false})));
 assert.equal(after.root.children.length,before.root.children.length+1,'one shared derivative bucket, not per-leaf or per-row draws');
 assert.equal(faces(after.scene).flat().length,4);before.dispose();after.dispose();
});

for(const quality of ['hd','sd'])test(`${quality}: true nine-row fit retains inherited eight-column x positions and aligned normal padding`,async()=>{
 const lib=await library(quality),c=gate(lib),base=lib.material('door_studded'),before=goldRuns(base.map.image,'x',85/1024,[.04,.96]);
 assert.equal(applyZuoyiDoorFront(c.kit,c.frame,binding),true);const mat=c.leaves[0].children[0].material;
 const scale=(1-.47/4.4)*1024/926,after=goldRuns(mat.map.image,'x',85/1024*scale,[.04,.96]);
 assert.equal(before.length,8);assert.equal(after.length,8);for(let i=0;i<8;i++)for(let j=0;j<2;j++)assert.ok(Math.abs(before[i][j]-after[i][j])<=(quality==='sd'?3:1),'gold threshold edge tolerates vertical-filter quantization, not x remapping');
 for(const [texture,pixel]of [[mat.map,[154,31,22,255]],[mat.normalMap,[128,128,255,255]]]){
  const image=texture.image;assert.deepEqual([...image.getContext('2d').getImageData(Math.floor(image.width/2),image.height-1,1,1).data],pixel);
  assert.notEqual(texture.source,texture===mat.map?base.map.source:base.normalMap.source);
 }
 assert.deepEqual(mat.normalScale.toArray(),base.normalScale.toArray());
 c.kit.dispose(c.kit.root);lib.dispose();
 const merged=await component({quality});for(const leaf of probe(merged)){assert.equal(leaf.legal,true);assert.equal(leaf.rows.length,9);assert.ok(leaf.rows.every(r=>r.visible));}merged.dispose();
});
