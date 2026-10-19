import {PalaceBuilder} from '../../src/scene/PalaceBuilder.js';
import {captureTaiheControl,serialMesh,hash} from './taihe-core-fixture.mjs';
export function captureBaoheDepth(name,Base=PalaceBuilder){
 class Tracked extends Base{
  column(...args){super.column(...args);this.recordedColumns??=[];this.recordedColumns.push({mesh:args[0].children.at(-1),box:this.colliders.at(-1)});}
  libBox(...args){const m=super.libBox(...args);this.boxRecords??=[];this.boxRecords.push({material:args[1],size:args.slice(2,5),position:args.slice(5,8),mesh:m});return m;}
  throneArea(g,input){const before=new Set(g.children),n=this.colliders.length;super.throneArea(g,input);this.throneRecord={input,meshes:g.children.filter(m=>!before.has(m)),colliders:this.colliders.slice(n)};}
 }
 const a=captureTaiheControl(name,Tracked),b=a.builder;const cols=b.recordedColumns??[],colset=new Set(cols.map(r=>r.mesh));
 const assembly=m=>{const p=m.geometry?.parameters??{};return m.geometry?.type==='SphereGeometry'&&p.radius===.35||m.geometry?.type==='CylinderGeometry'&&(p.height===.6&&p.radialSegments===8&&p.openEnded===true||p.height===.1&&p.radialSegments===32);};
 const throne=b.throneRecord,ceiling=a.group.children.filter(m=>m.geometry?.type==='PlaneGeometry');const roof=a.group.children.at(-1);const roofMeshes=[];roof?.traverse(m=>{if(m.isMesh)roofMeshes.push(serialMesh(m));});
 const all=[];a.group.traverse(m=>{if(m.isMesh)all.push(serialMesh(m));});
 return {...a,columns:cols,boxes:b.boxRecords??[],throne,assembly,
  summary:{allGeometrySHA256:hash(all),allNavigationSHA256:hash(b.colliders),walkablesSHA256:hash(b.walkables),
   planesSHA256:hash(ceiling.map(m=>serialMesh(m))),roofSHA256:hash(roofMeshes),
   furnitureSHA256:hash(throne?.meshes.filter(m=>!assembly(m)).map(m=>serialMesh(m))??[]),
   throneNavigationSHA256:hash(throne?.colliders??[]),caissonCount:throne?.meshes.filter(assembly).length??0,
   columnCount:cols.length,throneInput:throne?Object.fromEntries(Object.entries(throne.input).filter(([k])=>k!=='caisson')):null}};
}
