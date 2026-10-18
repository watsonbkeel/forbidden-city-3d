import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import { taiheGlyphMaterial } from '../src/scene/palace/special/TaiheCore.js';
import { installTaiheGlyphs, isTaiheSharedAtlas } from '../src/scene/interior/TaiheCoreContract.js';
const surfaceURL=new URL('../src/scene/palace/special/TaiheFurnishingSurface.js',import.meta.url);

test('new decorative commands stay inside unused glyph pixels and provide red/gold surface hierarchy',async()=>{
 assert.ok(fs.existsSync(surfaceURL),'missing bounded furnishing artwork');
 const {taiheFurnishingCommands,TAIHE_FURNISHING_TILES}=await import(surfaceURL);
 const commands=taiheFurnishingCommands();
 assert.ok(commands.length>100,'decorative field is substantive, not a flat replacement');
 const colors=new Set(commands.map(c=>c.color));assert.ok(colors.size>=5);
 for(const c of commands){
  const box=c.kind==='rect'?[c.x,c.y,c.x+c.w,c.y+c.h]:[Math.min(...c.points.map(p=>p[0]))-c.width/2,Math.min(...c.points.map(p=>p[1]))-c.width/2,Math.max(...c.points.map(p=>p[0]))+c.width/2,Math.max(...c.points.map(p=>p[1]))+c.width/2];
  assert.ok(box[0]>=160&&box[1]>=384&&box[2]<=1024&&box[3]<=1024,JSON.stringify(c));
 }
 assert.equal(TAIHE_FURNISHING_TILES.atlasSize,1024);
 assert.ok(TAIHE_FURNISHING_TILES.screen.width>=240);assert.ok(TAIHE_FURNISHING_TILES.screen.height>=590);
 assert.deepEqual(taiheFurnishingCommands(),commands,'deterministic original vector motifs');
});

test('existing atlas draws bounded ornament without changing lettering or allocating a second texture',()=>{
 const rects=[],glyphs=[],ctx=new Proxy({fillRect(x,y,w,h){rects.push([x,y,w,h]);},fillText(ch,x,y){glyphs.push([ch,x,y]);}},{get:(o,k)=>o[k]??(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
 const previous=globalThis.document;let canvasCount=0;globalThis.document={createElement:()=>{canvasCount++;return{getContext:()=>ctx,width:0,height:0};}};
 try{const owned=taiheGlyphMaterial();assert.ok(rects.some(r=>r[0]>=160&&r[1]>=384),'new surface art not painted');assert.equal(canvasCount,1);assert.equal(owned.map.image.width,1024);assert.equal(owned.map.image.height,1024);assert.equal(glyphs.slice(0,4).map(g=>g[0]).join(''),'猷绥极建');
  const root=new THREE.Group();root.add(new THREE.Mesh(new THREE.PlaneGeometry(),new THREE.MeshStandardMaterial({name:'taihe_glyph_atlas'})));let disposals=0;owned.map.addEventListener('dispose',()=>disposals++);
  for(let i=0;i<3;i++){installTaiheGlyphs(root,owned.map);assert.equal(root.children[0].material.map,owned.map);assert.ok(isTaiheSharedAtlas(root.children[0].material,owned.map));root.children[0].material.dispose();assert.equal(disposals,0);}
  owned.dispose();owned.dispose();assert.equal(disposals,1);
 }finally{globalThis.document=previous;}
});
