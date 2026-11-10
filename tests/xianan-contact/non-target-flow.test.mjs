import {save as saveDiagnostic} from './diagnostics.mjs';
import test from 'node:test';
import {T,assert} from './fixture.mjs';
import {ZoneBase} from '../../src/scene/zones/ZoneBase.js';
import {realTextureLibrary} from '../lib/r48-real-texture-library.mjs';
import {CollisionManager} from '../../src/utils/Collision.js';
import {queryXiananContact} from '../../src/scene/palace/special/XiananContactSources.js';
import {baseline,sha,verifyFrozenData,loadFrozenZoneBase,frozenSourceHashes} from './frozen-flow-loader.mjs';
const FrozenZoneBase=await loadFrozenZoneBase(),report={baseline,status:'running',cases:[]};
const save=()=>saveDiagnostic('NON-TARGET-FLOW-01-RESULT.json',{...report,frozenSourceHashes:frozenSourceHashes()});
function serial(value,seen=new Map()){
 if(value===null||value===undefined||typeof value==='string'||typeof value==='boolean')return value??null;
 if(typeof value==='number')return Object.is(value,-0)?'-0':Number.isFinite(value)?value:String(value);
 if(typeof value==='function')return 'function';
 if(ArrayBuffer.isView(value))return {typed:value.constructor.name,length:value.length,sha256:sha(Buffer.from(value.buffer,value.byteOffset,value.byteLength))};
 if(seen.has(value))return {ref:seen.get(value)};seen.set(value,seen.size);
 if(Array.isArray(value))return value.map(v=>serial(v,seen));
 const result={};for(const key of Object.keys(value).sort())if(!['uuid','id','_listeners'].includes(key))result[key]=serial(value[key],seen);return result;
}
function visual(root){
 root.updateMatrixWorld(true);const rows=[],materials=new Map(),textures=new Map();
 const texture=t=>{if(!textures.has(t))textures.set(t,textures.size);const fields={id:textures.get(t),type:t.constructor.name};for(const k of Object.keys(t).sort())if(!['uuid','id','source','_listeners','userData'].includes(k)){const v=t[k];if(v===null||['number','boolean','string'].includes(typeof v))fields[k]=v;else if(v?.toArray)fields[k]=v.toArray();else if(Array.isArray(v))fields[k]=serial(v);}fields.image={width:t.image?.width??null,height:t.image?.height??null,data:t.image?.data?serial(t.image.data):null};return fields};
 const material=m=>{if(m===null)return null;if(Array.isArray(m))return m.map(material);if(!materials.has(m))materials.set(m,materials.size);const fields={sharingId:materials.get(m)};for(const k of Object.keys(m).sort()){if(['uuid','id','_listeners'].includes(k))continue;const v=m[k];fields[k]=v?.isTexture?texture(v):v?.toArray?v.toArray():serial(v);}return fields};
 const visit=(node,nodePath)=>{
  const row={path:nodePath,type:node.type,name:node.name,visible:node.visible,layers:node.layers.mask,matrixAutoUpdate:node.matrixAutoUpdate,matrixWorldAutoUpdate:node.matrixWorldAutoUpdate,matrix:node.matrix.toArray(),world:node.matrixWorld.toArray(),castShadow:node.castShadow,receiveShadow:node.receiveShadow,userData:serial(node.userData)};
  if(node.isMesh){const g=node.geometry;row.material=material(node.material);row.geometry={attributes:Object.fromEntries(Object.entries(g.attributes).map(([name,a])=>[name,{itemSize:a.itemSize,normalized:a.normalized,count:a.count,array:serial(a.array)}])),index:g.index?serial(g.index.array):null,groups:serial(g.groups),drawRange:serial(g.drawRange),morphAttributes:serial(g.morphAttributes)};}
  rows.push(row);node.children.forEach((child,i)=>visit(child,nodePath+'/'+i));
 };visit(root,'root');return {hash:sha(JSON.stringify(rows)),nodes:rows.length,meshes:rows.filter(r=>r.geometry).length,rows};
}
function build(Builder,data,name){
 const lib=realTextureLibrary(),builder=new Builder(lib,data),scene=new T.Scene();let merged;
 try{
  const item=data.items.find(i=>i.kind==='gate'&&i.name===name);assert.ok(item,'real configured gate '+name);const width=builder.buildGate(item),source=visual(builder.kit.root);
  const physical={colliders:serial(builder.kit.colliders),walkables:serial(builder.kit.walkables),mapItems:serial(builder.kit.mapItems),regions:serial(builder.kit.regions),rooms:serial(builder.kit.rooms)},physicalHash=sha(JSON.stringify(physical));
  let atlasCalls=0;const atlas=builder.kit.buildPlaqueAtlas;builder.kit.buildPlaqueAtlas=function(){atlasCalls++;return atlas.call(this)};merged=builder.kit.finish();assert.equal(atlasCalls,1);scene.add(merged);scene.updateMatrixWorld(true);const finished=visual(merged);
  let unauthorizedScope=null;if(Builder===ZoneBase&&name!=='咸安门'){const cm=new CollisionManager();cm.addColliders(builder.kit.colliders,'non-target');cm.addWalkables(builder.kit.walkables,'non-target');unauthorizedScope=queryXiananContact(cm,new T.Vector3(300.9,0,-245),new T.Vector3(300.9,0,-244.8),.5);assert.equal(unauthorizedScope===null,true,'other real gates receive no Xianan registration');cm.clear();}
  return {width,source,finished,physicalHash,physicalCounts:{colliders:builder.kit.colliders.length,walkables:builder.kit.walkables.length},atlasCalls};
 }finally{builder.kit.dispose(merged??builder.kit.root);merged?.removeFromParent();lib.dispose()}
}
for(const [zone,name] of [['outer-west','咸安门'],['ningshou','宁寿门'],['ningshou','养性门']])test('full source/finished/material/physical streams retain exact frozen baseline for '+name,()=>{
 const data=verifyFrozenData('data/zones/'+zone+'.json'),before=build(FrozenZoneBase,data,name),after=build(ZoneBase,data,name);
 const compact=v=>({width:v.width,sourceHash:v.source.hash,sourceNodes:v.source.nodes,sourceMeshes:v.source.meshes,finishedHash:v.finished.hash,finishedNodes:v.finished.nodes,finishedMeshes:v.finished.meshes,physicalHash:v.physicalHash,physicalCounts:v.physicalCounts,atlasCalls:v.atlasCalls});
 const result={zone,name,baseline:compact(before),candidate:compact(after)};report.cases.push(result);save();
 assert.equal(after.width,before.width);assert.equal(after.physicalHash,before.physicalHash,'complete original descriptor stream');assert.equal(after.source.hash,before.source.hash,'complete source geometry/material/transform stream');assert.equal(after.finished.hash,before.finished.hash,'complete finished geometry/material/transform stream');
 result.passed=true;save();
});
process.on('exit',()=>{report.status=report.cases.length===3&&report.cases.every(c=>c.passed)?'PASS_THREE_REAL_GATE_STREAMS':'FAILED_OR_INCOMPLETE';save()});
