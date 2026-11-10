// R224 reviewed successor: cold ZoneBase constructor and precise rollback scope.
// Two explicit light scopes only. Microgeometry uses inert pixels, no document,
// font, native canvas or Xianan gate. DOM is declared rectangles/no-op drawing.
// Neither scope proves four roles, real eight zones, routes, World or GPU.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const mode=process.env.R223_LIGHT_SCOPE;
assert.ok(['micro','dom'].includes(mode),'Explicit R223_LIGHT_SCOPE is required');
const ID='supp-fc-9cb03d7316';
if(mode==='micro'){
 assert.equal(typeof document,'undefined','No native canvas or font substitution');
 // This fixture's public root is ZoneBase itself, not a warmed direct-kit test.
 // No other product import or fixture is evaluated before this cold import.
 const {ZoneBase}=await import('../../src/scene/zones/ZoneBase.js');
 assert.equal(typeof ZoneBase,'function','Cold public ZoneBase import must complete');
 const [{createActualLibrary},T,{buildHuiyaoLou}]=await Promise.all([
  import('../r158-cumulative-1600/library.mjs'),import('three'),import('../../src/scene/palace/special/HuiyaoLou.js')]);
 const zone=JSON.parse(fs.readFileSync('data/zones/outer-west.json'));
 const meshes=o=>{const a=[];o.traverse(m=>{if(m.isMesh)a.push(m);});return a;};
 const fixture=({retainedFrames=false}={})=>{
  const r=createActualLibrary();let builder,finished=null,disposed=false;
  try{
   builder=new ZoneBase(r.library,zone);const kit=builder.kit;
   if(retainedFrames)kit.frame(10,10).name='retained-before-wall';
   kit.wall(178.6,520,245,520);
   if(retainedFrames)kit.frame(20,20).name='retained-after-wall';
   return{builder,kit,finish(){assert.equal(finished,null);finished=kit.finish();return finished;},dispose(){if(disposed)return;disposed=true;kit.dispose(finished??kit.root);r.dispose();}};
  }catch(error){builder?.kit.dispose(finished??builder.kit.root);r.dispose();throw error;}
 };
 test('micro: actual H17 geometry has three matching non-rescue stone tops and visible collision owners',()=>{
  const f=fixture();try{
   const old=f.kit.root.children[0],oldCollider=f.kit.colliders[0],r=buildHuiyaoLou(f.kit,zone);
   assert.equal(r.meta.sourceObjectId,'FC-9CB03D7316');assert.equal(r.meta.bays,7);assert.equal(r.meta.exteriorStoreys,2);assert.equal(r.meta.upperAccess,'NO_STAIR_NO_UPPER_DESTINATION');assert.equal(r.meta.roofHistoricalColor,'UNKNOWN');
   assert.equal(r.replacedWall,old);assert.equal(r.replacedCollider,oldCollider);assert.equal(old.parent,null);assert.ok(!f.kit.colliders.includes(oldCollider));
   assert.equal(f.kit.rooms.length,0);assert.equal(f.kit.mapItems.length,0);assert.equal(f.kit.walkables.length,3);
   f.kit.root.updateWorldMatrix(true,true);const stone=meshes(r.frame).filter(m=>m.userData.huiyaoStone);assert.equal(stone.length,3);
   for(const m of meshes(f.kit.root)){
    const owners=f.kit.colliders.filter(c=>c.huiyaoMesh===m.uuid);assert.equal(owners.length,1,m.name);
    if(m.userData.huiyaoStone){const b=new T.Box3().setFromObject(m),w=f.kit.walkables.find(w=>w.huiyaoStone===m.uuid);assert.equal(w.rescue,false);assert.deepEqual(owners[0].min,b.min);assert.deepEqual(owners[0].max,b.max);assert.equal(w.box.min.y,b.max.y);assert.equal(w.box.max.y,b.max.y);}
    else assert.ok(owners[0].triangleSupport?.template?.triangles.length>0,m.name);
   }
   const walls=f.kit.root.children.filter(x=>x.userData.huiyaoCourtFit);assert.equal(walls.length,3);assert.equal(walls[0].position.z,529);
   for(const wall of walls)assert.ok(new T.Box3().setFromObject(wall).max.z<=529.9);
   const a=new T.Box3().setFromObject(walls[0]);for(const wall of walls.slice(1))assert.ok(a.intersectsBox(new T.Box3().setFromObject(wall)),'north wall and each side closure touch');
  }finally{f.dispose();}
 });
 test('micro: wrong host/bounds/source wall and repeat invocation reject without changing owners',()=>{
  for(const mode of ['bounds','wall','duplicate']){const f=fixture();try{
   const q=structuredClone(zone);if(mode==='bounds')q.bounds.z1=526.5;if(mode==='wall')f.kit.root.children[0].position.z+=.01;if(mode==='duplicate')buildHuiyaoLou(f.kit,q);
   const children=[...f.kit.root.children],cs=[...f.kit.colliders],ws=[...f.kit.walkables];assert.throws(()=>buildHuiyaoLou(f.kit,q),/Exact|Original/);assert.deepEqual(f.kit.root.children,children);assert.deepEqual(f.kit.colliders,cs);assert.deepEqual(f.kit.walkables,ws);
  }finally{f.dispose();}}
  const f=fixture();try{assert.equal(buildHuiyaoLou(f.kit,{id:'west-six'}),false);}finally{f.dispose();}
 });
 test('micro: current kit merge preserves H17 metadata and natural dispose releases final owned geometry/materials',()=>{
  const f=fixture();let disposed=false;try{
   buildHuiyaoLou(f.kit,zone);const g=f.finish();assert.equal(g.userData.architecture.filter(x=>x.sourceObjectId==='FC-9CB03D7316').length,1);
   const resources=new Set([...meshes(g).map(m=>m.geometry),...f.kit.owned]);assert.ok(resources.size>4);const counts=new Map([...resources].map(x=>[x,0]));for(const x of resources)x.addEventListener('dispose',()=>counts.set(x,counts.get(x)+1));
   f.dispose();disposed=true;for(const n of counts.values())assert.equal(n,1);
  }finally{if(!disposed)f.dispose();}
 });
 test('micro: transfer failure never detaches unrelated frames and restores exact owners/order/resources',()=>{
  const f=fixture({retainedFrames:true});let originalPush;
  try{
   const kit=f.kit,root=kit.root,children=root.children,oldChildren=[...children],retained=oldChildren.filter(x=>x.name.startsWith('retained-'));
   assert.equal(retained.length,2);const oldWall=oldChildren[1];assert.equal(oldWall.position.z,520);
   kit.colliders.push(new T.Box3(new T.Vector3(1,0,1),new T.Vector3(2,1,2)));
   kit.walkables.push({type:'box',box:new T.Box3(new T.Vector3(1,1,1),new T.Vector3(2,1,2)),rescue:false});
   kit.rooms.push({id:'retained-room'});kit.mapItems.push({id:'retained-map'});kit.regions.push({id:'retained-region'});
   const streams=Object.fromEntries(['colliders','walkables','owned','rooms','mapItems','regions'].map(k=>[k,{array:kit[k],entries:[...kit[k]]}]));
   const boxes=kit.colliders.map(c=>[c,c.min.clone(),c.max.clone()]),oldTransforms=retained.map(x=>[x,x.position.clone(),x.quaternion.toArray(),x.quaternion,x.quaternion._onChangeCallback,x.scale.clone()]);
   let unrelatedRemovals=0,oldGeometryDisposals=0;for(const x of retained)x.addEventListener('removed',()=>unrelatedRemovals++);
   for(const x of meshes(oldWall))x.geometry.addEventListener('dispose',()=>oldGeometryDisposals++);
   const disposed=new Map();let injections=0;
   originalPush=Object.getOwnPropertyDescriptor(kit.owned,'push');
   kit.owned.push=function(...items){
    injections++;const resources=new Set(items);for(const x of root.children.filter(x=>!oldChildren.includes(x)))for(const m of meshes(x))resources.add(m.geometry);
    for(const x of resources){disposed.set(x,0);x.addEventListener('dispose',()=>disposed.set(x,disposed.get(x)+1));}
    Array.prototype.push.call(this,items[0]);throw Error('R224_CONTROLLED_TRANSFER_FAILURE');
   };
   assert.throws(()=>buildHuiyaoLou(kit,zone),/R224_CONTROLLED_TRANSFER_FAILURE/);
   if(originalPush)Object.defineProperty(kit.owned,'push',originalPush);else delete kit.owned.push;
   assert.equal(injections,1);assert.equal(unrelatedRemovals,0,'unrelated source frames must have zero removed events');
   assert.equal(root.children,children);assert.deepEqual(root.children,oldChildren);for(const x of oldChildren)assert.equal(x.parent,root);
   for(const[k,v]of Object.entries(streams)){assert.equal(kit[k],v.array,k+' array identity');assert.deepEqual(kit[k],v.entries,k+' original order');v.entries.forEach((x,i)=>assert.equal(kit[k][i],x,k+' entry identity'));}
   for(const[c,min,max]of boxes){assert.deepEqual(c.min,min);assert.deepEqual(c.max,max);}
   for(const[x,p,q,owner,callback,s]of oldTransforms){assert.deepEqual(x.position,p);assert.deepEqual(x.quaternion.toArray(),q);assert.equal(x.quaternion,owner);assert.equal(x.quaternion._onChangeCallback,callback);assert.deepEqual(x.scale,s);}
   assert.equal(oldGeometryDisposals,0);assert.ok(disposed.size>30);for(const n of disposed.values())assert.equal(n,1);
   assert.ok(!root.children.some(x=>x.userData.structure?.sourceObjectId==='FC-9CB03D7316'));
  }finally{if(originalPush)Object.defineProperty(f.kit.owned,'push',originalPush);else delete f.kit.owned.push;f.dispose();}
 });

}else{
 const [{setupMap},{localeStore},{TourPlaceCatalog}]=await Promise.all([import('../lib/map-fixture.mjs'),import('../../src/i18n/LocaleStore.js'),import('../../src/ui/TourPlaceCatalog.js')]);
 const expected=JSON.parse(fs.readFileSync('data/places/supplemental.json')).records.find(x=>x.id===ID);assert.ok(expected);
 for(const mobile of [false,true])test(`DOM ${mobile?'touch':'desktop'}: H17 bilingual/pinyin identity and sources remain information-only`,async t=>{
  const s=await setupMap(t,{mobile});t.after(()=>localeStore.setLocale('zh-CN'));s.map.toggle();const p=new TourPlaceCatalog().get(ID);assert.equal(p.sourceObjectId,'FC-9CB03D7316');assert.equal(p.modelExperience.navigationMode,'information-only');assert.equal(p.modelExperience.teleportTargetName,null);
  s.map.hasTeleportTarget=()=>true;const fake={name:'慧曜楼',kind:'hall',x:190.5,z:523.6,w:18,d:4.4};s.map.items=[...s.map.items,fake];assert.equal(s.map.placeCatalog.forMapItem(fake,s.map.items),null);
  const input=s.map.container.querySelector('#place-search');
  for(const lang of ['zh-CN','en','zh-CN','en']){localeStore.setLocale(lang);for(const query of ['慧曜楼','Huiyao Tower','hui yao lou','huiyaolou']){
   input.value=query;s.dispatch(input,'input');const buttons=s.map.supplementalPlaceList.querySelectorAll('button').filter(b=>!b.hidden&&b.getAttribute('data-place-id')===ID);assert.equal(buttons.length,1,query);buttons[0].click();
   const panel=s.map.placePanel.element;assert.equal(s.map.selectedPlaceId,ID);assert.equal(panel.querySelector('#place-title').textContent,lang==='en'?'Huiyao Tower':'慧曜楼');assert.equal(panel.querySelector('#place-travel'),null);assert.deepEqual(s.teleports,[]);
   for(const key of ['summary','evidenceNote','modelNote'])assert.ok(panel.textContent.includes(expected[key][lang==='en'?'en':'zh']));
   for(const source of expected.sources){const a=panel.querySelectorAll('a').find(x=>x.getAttribute('href')===source.url);assert.ok(a);assert.equal(a.getAttribute('target'),'_blank');assert.match(a.getAttribute('rel'),/noopener/);}
   if(lang==='en')assert.doesNotMatch(panel.textContent,/[\u3400-\u9fff]|English text unavailable|undefined/);
   s.map.placeBack.click();s.map.resumePlace.click();assert.equal(s.map.selectedPlaceId,ID);s.map.backToMap();
  }}
  input.value='';s.dispatch(input,'input');assert.equal(s.map.supplementalPlaceList.querySelectorAll('button').filter(b=>!b.hidden).length,133);assert.equal(s.map.showPlace(ID),true);s.map.closeButton.click();s.map.toggle();assert.equal(s.map.showPlace(ID),true);s.map.clearPlaceSelection();assert.equal(s.map.selectedPlaceId,null);assert.deepEqual(s.teleports,[]);
 });
}
