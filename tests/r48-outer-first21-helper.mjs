import {createHash} from 'node:crypto';
import {CourtKit,FACE} from '../src/scene/palace/kit.js';
import {buildWenyuanPavilion} from '../src/scene/palace/special/WenyuanPavilion.js';
import {buildYudeBath} from '../src/scene/palace/special/YudeBath.js';
import {buildSouthCourtHall} from '../src/scene/palace/special/SouthCourtHalls.js';
import {buildBaoyunStorehouse} from '../src/scene/palace/special/BaoyunStorehouse.js';
import {library} from './lib/inner-palace-fixture.mjs';
import * as currentApi from '../src/scene/palace/special/RemainingOuterHalls.js';
export function first21Signature(row,api=currentApi){
 const kit=new CourtKit(library(),row.zone),p=api.resolveRemainingProfile(row.zone,row.baselineItem),builders={wenyuan:buildWenyuanPavilion,yude:buildYudeBath,wuying:buildSouthCourtHall,jingsi:buildSouthCourtHall,baoyun:buildBaoyunStorehouse};
 try{const base=()=>builders[p.key]?builders[p.key](kit,row.baselineItem):kit.hall({...row.baselineItem,rot:typeof row.baselineItem.rot==='string'?FACE[row.baselineItem.rot]:row.baselineItem.rot});const b=p.mode==='replace'?api.buildRemainingHall(kit,row.baselineItem,p):api.augmentRemainingHall(kit,row.baselineItem,base(),p);kit.buildPlaqueAtlas();kit.root.updateMatrixWorld(true);
 const h=createHash('sha256');let meshes=0,triangles=0;b.f.traverse(m=>{if(!m.isMesh)return;meshes++;const g=m.geometry;triangles+=(g.index?.count??g.attributes.position.count)/3;h.update(JSON.stringify({name:m.name,matrix:m.matrixWorld.elements,material:(Array.isArray(m.material)?m.material:[m.material]).map(v=>({name:v.name,color:v.color?.getHex(),side:v.side,transparent:v.transparent,opacity:v.opacity})),index:g.index?Array.from(g.index.array):null,attributes:Object.fromEntries(Object.entries(g.attributes).map(([key,a])=>[key,Array.from(a.array)]))}));});const hash=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');return{geometry:h.digest('hex'),meshes,triangles,colliders:hash(kit.colliders),walkables:hash(kit.walkables),rooms:hash(kit.rooms),regions:hash(kit.regions),map:hash(kit.mapItems),profileNavigation:hash(p.navigation),builtNavigation:hash(b.g.navigation??null),builtMetadata:hash(b.g)};
 }finally{kit.dispose(kit.root)}
}

// Source-only extension gate. It does not generate snapshots or inspect current
// output to decide what is allowed. Four fixed, identity-local edit categories
// are reversed and the entire result must equal the accepted a3baa digest.
import assert from 'node:assert/strict';
const POST_ENTRY_SHA='a3baa8766f7e2df13f98fb53802a5d3332082983d652b540c1599d44fe792f91';
const EXTENSION_IDS=['benren-jiyi-evidence-qualifiers','final-four-ready-gate','final-four-local-builders','final-four-dispatch'];
const sha=value=>createHash('sha256').update(value).digest('hex');
const readyBefore="export const READY_OUTER_KEYS = Object.freeze(['baoxiang','jiyun','ciyin','cining','dafotang','shouan','nanxun','hanqing','yanshou','yude','wenyuan','yanchun','wuying','jingsi','baoyun',...RECORDS.filter(p=>p.key.startsWith('sansuo-')).map(p=>p.key)]);";
const readyAfter=readyBefore.replace("'baoyun',","'baoyun','zhujing','benren','jiyi','hengshou',");
const builderAnchor='export function augmentRemainingHall(kit,item,built,profile) {';
const dispatchBefore="  if(profile.key==='baoyun')return augmentBaoyunFacade(kit,item,built,profile);";
const dispatchAfter=dispatchBefore+"\n  if(profile.key==='zhujing')return augmentZhujingPhotoDetails(kit,item,built,profile);\n  if(['benren','jiyi'].includes(profile.key))return augmentWenhuaCompanionFacade(kit,item,built,profile);\n  if(profile.key==='hengshou')return augmentHengshouPlainGable(kit,item,built,profile);";
export function revertFinalFourExtension(source,stage){
  assert.equal(stage.schemaVersion,1,'reviewed extension schema');
  assert.equal(stage.id,'final-four-source-extension');
  assert.equal(stage.status,'REVIEWED_FIXED_SOURCE_EXTENSION','cannot silently admit a work-in-progress source');
  assert.equal(stage.fromModuleSha256,POST_ENTRY_SHA,'extension starts at approved entry follow-up, not a new arbitrary baseline');
  assert.equal(sha(source),stage.toModuleSha256,'reviewed live source SHA must match');
  assert.deepEqual(stage.sourceChanges.map(c=>c.id),EXTENSION_IDS,'fixed narrow source-change categories');
  assert.deepEqual(stage.sourceChanges.map(c=>c.edits.length),[2,1,1,1]);
  const [qualifiers,ready,builders,dispatch]=stage.sourceChanges;
  assert.deepEqual(qualifiers.edits.map(e=>e.before),[
    '目前官方概述只有东配殿身份，形制/用途布局不足；没有照片前不得称改模完成。',
    '目前官方概述只有西配殿身份，形制/用途布局不足；没有照片前不得称改模完成。',
  ]);
  assert.ok(qualifiers.edits.every(e=>!/[\n\r"]/.test(e.after)&&e.after.length>20),'only profile text values, never executable source');
  assert.equal(ready.edits[0].before,readyBefore);assert.equal(ready.edits[0].after,readyAfter);
  assert.equal(builders.edits[0].before,builderAnchor);
  assert.ok(builders.edits[0].after.startsWith("const HEYI_2022='https://ggzlquanjing.dpm.org.cn/scene/"));
  assert.ok(builders.edits[0].after.endsWith('\n\n'+builderAnchor),'exact insertion anchor must terminate the isolated builder block');
  assert.deepEqual([...builders.edits[0].after.matchAll(/^function (\w+)\(/gm)].map(m=>m[1]),[
    'augmentWenhuaCompanionFacade','augmentZhujingPhotoDetails','augmentHengshouPlainGable',
  ]);
  assert.equal((builders.edits[0].after.match(/^export /gm)??[]).length,1,'no new global exports in isolated builder insertion');
  assert.equal(dispatch.edits[0].before,dispatchBefore);assert.equal(dispatch.edits[0].after,dispatchAfter);
  let restored=source;
  for(const change of [...stage.sourceChanges].reverse())for(const edit of [...change.edits].reverse()){
    assert.equal(sha(edit.before),edit.beforeSourceSha256,change.id+' before edit hash');
    assert.equal(sha(edit.after),edit.afterSourceSha256,change.id+' after edit hash');
    assert.equal(restored.split(edit.after).length-1,1,change.id+' must appear exactly once');
    restored=restored.replace(edit.after,edit.before);
  }
  assert.equal(sha(restored),POST_ENTRY_SHA,'inverse must restore complete approved a3baa source; no shared edit can be hidden');
  return restored;
}
export async function loadOuterApi(source){
  const moduleURL=new URL('../src/scene/palace/special/RemainingOuterHalls.js',import.meta.url);
  const rewritten=source.replace(/from\s*(['"])([^'"]+)\1/g,(_all,quote,name)=>{
    const url=name==='three'?import.meta.resolve('three'):name.startsWith('.')?new URL(name,moduleURL).href:name;
    return 'from '+quote+url+quote;
  });
  return import('data:text/javascript;base64,'+Buffer.from(rewritten).toString('base64'));
}
