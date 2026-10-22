import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
export async function withDepthScene(root,row,fn){
 const imp=p=>import(pathToFileURL(root+'/'+p));
 await imp('tests/lib/inner-palace-fixture.mjs');
 const T=await imp('node_modules/three/build/three.module.js');
 const {realTextureLibrary}=await imp('tests/lib/r48-real-texture-library.mjs');
 const {ZoneBase}=await imp('src/scene/zones/ZoneBase.js');
 const data=JSON.parse(readFileSync(root+'/data/zones/'+row.zone+'.json')),item=data.items.find(i=>i.name===row.name),lib=realTextureLibrary(),zone=new ZoneBase(lib,data);
 try{const raw=row.kind==='gate'?zone.buildGate(item):zone.buildHall(item);zone.kit.buildPlaqueAtlas();zone.kit.root.updateMatrixWorld(true);const plaque=zone.kit.plaques.find(p=>p.text===row.name),built=raw?.f?raw:{f:plaque.mesh.parent};return await fn({T,zone,item,built,plaque});}finally{zone.dispose();lib.dispose();}
}
export async function depthSnapshot(root,row){return withDepthScene(root,row,({zone,built,plaque})=>{
 const rows=[],nonPlaque=[];built.f.traverse(m=>{if(!m.isMesh)return;const g=m.geometry,record={matrix:m.matrixWorld.elements,geometry:g.type,index:g.index?Array.from(g.index.array):null,attributes:Object.fromEntries(Object.entries(g.attributes).map(([k,a])=>[k,Array.from(a.array)])),material:(Array.isArray(m.material)?m.material:[m.material]).map(v=>({name:v.name,color:v.color?.getHex(),opacity:v.opacity,transparent:v.transparent,side:v.side})),castShadow:m.castShadow,receiveShadow:m.receiveShadow};rows.push(record);if(m!==plaque?.mesh&&m!==plaque?.frame)nonPlaque.push(record);});
 const pose=m=>({position:m.position.toArray(),rotation:m.rotation.toArray(),scale:m.scale.toArray(),geometry:m.geometry.parameters});
 return{...row,meshes:rows.length,wholeGeometryHash:hash(rows),nonPlaqueGeometryHash:hash(nonPlaque),colliders:hash(zone.kit.colliders),walkables:hash(zone.kit.walkables),rooms:hash(zone.kit.rooms),regions:hash(zone.kit.regions),mapItems:hash(zone.kit.mapItems),face:plaque?pose(plaque.mesh):null,frame:plaque?pose(plaque.frame):null};
 });}
