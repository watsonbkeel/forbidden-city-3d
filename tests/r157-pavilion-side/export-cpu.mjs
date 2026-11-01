// Actual current component triangles, flat category palette; not GPU/photo acceptance.
import fs from'node:fs';import zlib from'node:zlib';import * as T from'three';import{ZoneBase}from'../../src/scene/zones/ZoneBase.js';
const ctx=new Proxy({},{get:()=>()=>({data:[]}),set:()=>true});globalThis.document={createElement:()=>({getContext:()=>ctx,width:0,height:0}),createElementNS:()=>({addEventListener(){},removeEventListener(){}})};
const data=JSON.parse(fs.readFileSync(new URL('../../data/zones/axis-courts.json',import.meta.url))),out=process.argv[2];fs.mkdirSync(out,{recursive:true});
const palette={roof_tile:'#c49a42',kit_ridge:'#bc9c53',wood_column:'#8b3023',wall_red:'#a34b37',wall_brick:'#71695b',stone_slab:'#90897e',marble:'#d1c9b8',rafters:'#514631',caihua_beam:'#3e665a',dougong_band:'#4f6651',door_studded:'#872e20',sumeru_band:'#bdb5a6'};
for(const state of['before','after']){
 const materials=new Map(),lib={material:n=>{if(!materials.has(n))materials.set(n,new T.MeshStandardMaterial({name:n}));return materials.get(n);},tileSize:()=>1,aspect:()=>1};const z=new ZoneBase(lib,data);for(const i of [24,25]) { if(state==='after')z.buildHall(data.items[i]);else z.kit.hall({...data.items[i],sideGalleryConnections:undefined}); }
 // Neighbour objects are constructed unmodified to expose overlap in the view.
 for(const i of[28,29,34,35])z.buildCorridor(data.items[i]);
 z.kit.root.updateMatrixWorld(true);const triangles=[];z.kit.root.traverse(m=>{if(!m.isMesh||!m.material||!m.visible)return;const a=m.geometry.attributes.position,idx=m.geometry.index;for(let i=0;i<(idx?.count??a.count);i+=3)triangles.push({v:[0,1,2].map(k=>new T.Vector3().fromBufferAttribute(a,idx?idx.getX(i+k):i+k).applyMatrix4(m.matrixWorld).toArray()),color:palette[m.material.name]??'#807354',side:m.material.side});});
 for(const [view,eye,target]of[['hongyi',[65,28,-105],[101,7,-110]],['tiren',[-60,28,-105],[-99,7,-109]],['hongyi-north',[84,12,-57],[101,1.5,-69]],['tiren-south',[-75,12,-165],[-98,1.5,-150]]]){const c=new T.PerspectiveCamera(60,16/9,.03,200);c.position.fromArray(eye);c.lookAt(...target);c.updateMatrixWorld(true);fs.writeFileSync(`${out}/${state}-${view}.json.gz`,zlib.gzipSync(JSON.stringify({state,view,camera:{eye,target,fov:60,width:1120,height:630,matrixWorldInverse:c.matrixWorldInverse.toArray()},triangles})));}
 z.kit.dispose();for(const m of materials.values())m.dispose();
}
