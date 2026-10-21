// Independent final-pair layer. Prior 25-stage JSON and first21 helper are immutable.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {CourtKit,FACE} from '../src/scene/palace/kit.js';
import {buildWenyuanPavilion} from '../src/scene/palace/special/WenyuanPavilion.js';
import {buildYudeBath} from '../src/scene/palace/special/YudeBath.js';
import {buildSouthCourtHall} from '../src/scene/palace/special/SouthCourtHalls.js';
import {buildBaoyunStorehouse} from '../src/scene/palace/special/BaoyunStorehouse.js';
import {library} from './lib/inner-palace-fixture.mjs';
export const PRIOR_25_SHA='b7d318a374e8249b272ddada2dcf5feb6ce9b59772f1dc1c9ab2e7d34e6e4be4';
export const hashSource=v=>createHash('sha256').update(v).digest('hex');
export const hashValue=v=>hashSource(JSON.stringify(v));
export const FIRST25_FIELDS=['geometry','meshes','triangles','colliders','walkables','rooms','regions','map','profileNavigation','builtNavigation','builtMetadata'];
export function withFirst25Hall(api,row,inspect){
  const kit=new CourtKit(library(),row.zone),p=api.resolveRemainingProfile(row.zone,row.baselineItem);
  assert.ok(p,'exact enabled identity');
  const builders={wenyuan:buildWenyuanPavilion,yude:buildYudeBath,wuying:buildSouthCourtHall,jingsi:buildSouthCourtHall,zhujing:buildSouthCourtHall,baoyun:buildBaoyunStorehouse};
  try{
    const item=row.baselineItem,base=()=>builders[p.key]?builders[p.key](kit,item):kit.hall({...item,rot:typeof item.rot==='string'?FACE[item.rot]:item.rot});
    const built=p.mode==='replace'?api.buildRemainingHall(kit,item,p):api.augmentRemainingHall(kit,item,base(),p);
    kit.buildPlaqueAtlas();kit.root.updateMatrixWorld(true);return inspect({kit,built,profile:p});
  }finally{kit.dispose(kit.root);}
}
export function first25Signature(row,api){return withFirst25Hall(api,row,({kit,built:b,profile:p})=>{
  const h=createHash('sha256');let meshes=0,triangles=0;
  b.f.traverse(m=>{if(!m.isMesh)return;meshes++;const g=m.geometry;triangles+=(g.index?.count??g.attributes.position.count)/3;
    h.update(JSON.stringify({name:m.name,matrix:m.matrixWorld.elements,material:(Array.isArray(m.material)?m.material:[m.material]).map(v=>({name:v.name,color:v.color?.getHex(),side:v.side,transparent:v.transparent,opacity:v.opacity})),index:g.index?Array.from(g.index.array):null,attributes:Object.fromEntries(Object.entries(g.attributes).map(([key,a])=>[key,Array.from(a.array)]))}));});
  return{geometry:h.digest('hex'),meshes,triangles,colliders:hashValue(kit.colliders),walkables:hashValue(kit.walkables),rooms:hashValue(kit.rooms),regions:hashValue(kit.regions),map:hashValue(kit.mapItems),profileNavigation:hashValue(p.navigation),builtNavigation:hashValue(b.g.navigation??null),builtMetadata:hashValue(b.g)};
});}
const SOURCE_IDS=['paired-profile-evidence','paired-ready-gate','paired-private-builders','paired-dispatch','zhujing-circular-display-proxies'];
const readyBefore="export const READY_OUTER_KEYS = Object.freeze(['baoxiang','jiyun','ciyin','cining','dafotang','shouan','nanxun','hanqing','yanshou','yude','wenyuan','yanchun','wuying','jingsi','baoyun','zhujing','benren','jiyi','hengshou',...RECORDS.filter(p=>p.key.startsWith('sansuo-')).map(p=>p.key)]);";
const dispatchBefore="  if(profile.key==='baoyun')return augmentBaoyunFacade(kit,item,built,profile);";
const dispatchAfter=dispatchBefore+"\n  if(['ningdao','huanzhang'].includes(profile.key))return augmentPairedModernDisplay(kit,item,built,profile);";
const builderAnchor='export function augmentRemainingHall(kit,item,built,profile) {';
export function applySourceEdits(source,changes,{inverse=false}={}){
  let out=source;
  for(const change of inverse?[...changes].reverse():changes)for(const edit of inverse?[...change.edits].reverse():change.edits){
    assert.equal(hashSource(edit.before),edit.beforeSourceSha256,change.id+' before edit hash');assert.equal(hashSource(edit.after),edit.afterSourceSha256,change.id+' after edit hash');
    const from=inverse?edit.after:edit.before,to=inverse?edit.before:edit.after;
    assert.equal(out.split(from).length-1,1,change.id+' exact edit must occur once');out=out.replace(from,to);
  }
  return out;
}
export function revertFinalPairExtension(source,stage){
  assert.equal(stage.schemaVersion,1);assert.equal(stage.id,'final-pair-and-zhujing-proxy-extension');
  assert.equal(stage.fromModuleSha256,PRIOR_25_SHA,'final layer must start at fixed b7 stage');
  assert.equal(hashSource(source),stage.toModuleSha256,'reviewed final-layer source SHA');
  assert.deepEqual(stage.sourceChanges.map(c=>c.id),SOURCE_IDS);assert.deepEqual(stage.sourceChanges.map(c=>c.edits.length),[2,1,1,1,2]);
  const[profiles,ready,builders,dispatch,proxy]=stage.sourceChanges;
  for(const[index,edit]of profiles.edits.entries()){
    const b=JSON.parse(edit.before.trim().replace(/,$/,'')),a=JSON.parse(edit.after.trim().replace(/,$/,''));
    assert.equal(b.key,['ningdao','huanzhang'][index]);assert.equal(a.evidenceStatus,'OWN_2021_PANORAMA_LAYOUT_WITH_FITTED_METRICS');assert.equal(a.unknown.length,1);
    const{evidenceStatus:be,unknown:bu,...restB}=b,{evidenceStatus:ae,unknown:au,...restA}=a;assert.deepEqual(restA,restB,'profile coordinates and identity cannot be changed');
  }
  assert.equal(ready.edits[0].before,readyBefore);assert.equal(ready.edits[0].after,readyBefore.replace("'hengshou',","'hengshou','ningdao','huanzhang',"));
  assert.equal(builders.edits[0].before,builderAnchor);
  assert.ok(builders.edits[0].after.startsWith('\n// Standalone merge candidate.'));
  assert.ok(builders.edits[0].after.endsWith('\n\n'+builderAnchor),'exact final-pair insertion anchor');
  assert.deepEqual([...builders.edits[0].after.matchAll(/^function (\w+)\(/gm)].map(m=>m[1]),['pairedTriangleIds','pairedSelectTriangles','pairedReverseUnderboard','pairedBoundary','pairedGeometryBuilder','pairedEdgeGeometry','pairedProfileSolid','pairedPaintedBoxGeometry','augmentPairedExposedRoof','augmentPairedModernDisplay']);
  assert.equal((builders.edits[0].after.match(/^export /gm)??[]).length,1);
  assert.equal(dispatch.edits[0].before,dispatchBefore);assert.equal(dispatch.edits[0].after,dispatchAfter);
  const metadataBefore='display:built.display??built.f.userData.structure.display,accessProxies,openDoorPose:';
  const proxyAnchor='  const accessProxies=retainOpenedLeafAndPostProxies(kit,f);\n  return finishAugment(kit,item,built,p,{'+metadataBefore;
  assert.equal(proxy.edits[0].before,proxyAnchor);assert.ok(proxy.edits[0].after.endsWith(proxyAnchor));
  assert.equal(proxy.edits[1].before,metadataBefore);assert.equal(proxy.edits[1].after,metadataBefore.replace('accessProxies,','accessProxies,circularDisplayProxies,'));
  assert.equal((proxy.edits[0].after.match(/visibleComponentProxy\(kit,f,/g)??[]).length,2,'only retained rim and light thin proxies');
  const restored=applySourceEdits(source,stage.sourceChanges,{inverse:true});
  assert.equal(hashSource(restored),PRIOR_25_SHA,'inverse must restore complete approved b7 source');return restored;
}
