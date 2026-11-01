// Actual current component triangles, flat category palette; not GPU/photo acceptance.
import fs from'node:fs';import zlib from'node:zlib';import * as T from'three';const root=process.argv[4]??process.cwd();const{ZoneBase}=await import(root+'/src/scene/zones/ZoneBase.js');
const ctx=new Proxy({},{get:()=>()=>({data:[]}),set:()=>true});globalThis.document={createElement:()=>({getContext:()=>ctx,width:0,height:0}),createElementNS:()=>({addEventListener(){},removeEventListener(){}})};
const data=JSON.parse(fs.readFileSync(root+'/data/zones/axis-courts.json')),out=process.argv[2];fs.mkdirSync(out,{recursive:true});
const palette={roof_tile:'#c49a42',kit_ridge:'#bc9c53',wood_column:'#8b3023',wall_red:'#a34b37',wall_brick:'#71695b',stone_slab:'#90897e',marble:'#d1c9b8',rafters:'#514631',caihua_beam:'#3e665a',dougong_band:'#4f6651',door_studded:'#872e20',sumeru_band:'#bdb5a6'};
for(const state of[process.argv[3]??'current']){
 const materials=new Map(),lib={material:n=>{if(!materials.has(n))materials.set(n,new T.MeshStandardMaterial({name:n}));return materials.get(n);},tileSize:()=>1,aspect:()=>1};const z=new ZoneBase(lib,data);z.gateWidths.set('后左门',z.buildGate(data.items[16]));
 // Neighbour objects are constructed unmodified to expose overlap in the view.
 z.buildWall(data.items[17]);
 z.kit.root.updateMatrixWorld(true);const triangles=[];z.kit.root.traverse(m=>{if(!m.isMesh||!m.material||!m.visible)return;const a=m.geometry.attributes.position,idx=m.geometry.index;for(let i=0;i<(idx?.count??a.count);i+=3)triangles.push({v:[0,1,2].map(k=>new T.Vector3().fromBufferAttribute(a,idx?idx.getX(i+k):i+k).applyMatrix4(m.matrixWorld).toArray()),color:palette[m.material.name]??'#807354',side:m.material.side});});
 for(const [view,eye,target]of[['south',[-60.4,10,90],[-76.4,4,123]],['north',[-93.4,10,153],[-76.4,4,123]]]){const c=new T.PerspectiveCamera(48,16/9,.03,200);c.position.fromArray(eye);c.lookAt(...target);c.updateMatrixWorld(true);fs.writeFileSync(`${out}/${state}-${view}.json.gz`,zlib.gzipSync(JSON.stringify({state,view,camera:{eye,target,fov:48,width:1120,height:630,matrixWorldInverse:c.matrixWorldInverse.toArray()},triangles})));}
 z.kit.dispose();for(const m of materials.values())m.dispose();
}
