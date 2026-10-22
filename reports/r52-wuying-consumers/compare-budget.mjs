import {readFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
const paths=process.argv.slice(2);
const ctx=new Proxy({},{get:()=>()=>({data:[]}),set:()=>true});
globalThis.document={createElement:()=>({getContext:()=>ctx,width:0,height:0})};
const rows=[];
for(const root of paths){
 const {ZoneBase}=await import(pathToFileURL(root+'/src/scene/zones/ZoneBase.js'));
 const THREE=await import(pathToFileURL(root+'/node_modules/three/build/three.module.js'));
 for(const court of['wenhua','wuying']){
  const data=JSON.parse(readFileSync(root+'/data/zones/'+(court==='wenhua'?'outer-east':'outer-west')+'.json'));
  const materials=new Map(),lib={tileSize:()=>1,aspect:()=>1,material(n){if(!materials.has(n))materials.set(n,new THREE.MeshStandardMaterial({name:n}));return materials.get(n);}};
  const builder=new ZoneBase(lib,data);for(const item of data.items.filter(i=>i.southCourtProfile?.startsWith(court)))builder.buildHall(item);
  builder.kit.root.updateMatrixWorld(true);
  let triangles=0,meshes=0,moonTriangles=0,refinedVesselTriangles=0;
  builder.kit.root.traverse(n=>{if(!n.isMesh)return;const count=(n.geometry.index?.count??n.geometry.attributes.position.count)/3;triangles+=count;meshes++;if(n.userData.wuyingMoonTerrace)moonTriangles+=count;if(n.userData.refinement==='R52_FRONT_PHOTO_FORM')refinedVesselTriangles+=count;});
  rows.push({root,court,triangles,meshes,moonTriangles,refinedVesselTriangles,original150kAssertion:triangles<150000,originalStructureAssertion:builder.kit.root.children.every(f=>f.userData.structure?.dimensionStatus==='OFFICIAL_TOPOLOGY_REVERSIBLE_MODEL_FIT'),rootChildren:builder.kit.root.children.map(f=>({type:f.type,name:f.name,dimensionStatus:f.userData.structure?.dimensionStatus??null,children:f.children.length}))});
  builder.kit.dispose(builder.kit.root);
 }
}
console.log(JSON.stringify(rows,null,2));
