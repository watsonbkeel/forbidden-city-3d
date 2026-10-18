import {PalaceBuilder} from '../../src/scene/PalaceBuilder.js';
import {captureTaiheControl,serialMesh,hash} from './taihe-core-fixture.mjs';
export function captureColumns(name,Base=PalaceBuilder){
 class Tracked extends Base{
  column(...args){super.column(...args);this.recordedColumns??=[];this.recordedColumns.push({mesh:args[0].children.at(-1),box:this.colliders.at(-1)});}
 }
 const a=captureTaiheControl(name,Tracked),cols=a.builder.recordedColumns??[],set=new Set(cols.map(r=>r.mesh)),boxes=new Set(cols.map(r=>r.box));
 const other=[];a.group.traverse(o=>{if(o.isMesh&&!set.has(o))other.push(serialMesh(o));});
 const columnRows=cols.map(({mesh,box})=>({position:mesh.position.toArray(),geometry:serialMesh(mesh,{material:false}),material:serialMesh(mesh).material,box:JSON.parse(JSON.stringify(box))}));
 return {...a,columns:cols,summary:{columnCount:cols.length,columnsSHA256:hash(columnRows),nonColumnGeometrySHA256:hash(other),nonColumnNavigationSHA256:hash(a.builder.colliders.filter(x=>!boxes.has(x))),walkablesSHA256:hash(a.builder.walkables)}};
}
