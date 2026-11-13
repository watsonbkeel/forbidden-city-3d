import * as T from 'three';
const PLACE='place-outer-west-6cae88b6a2',PRINCIPAL='dafotang-shakyamuni-historical-fit';
const MATERIALS=['worn_gold','red_lacquer','dark_curls'].map(n=>'dafotang_principal_'+n);
// Existing MODEL_FIT centers, not measured dimensions. Bounds are independently
// derived from each frozen V3 alpha mesh after visible-height normalization and Y pi.
const SPECS=Object.freeze([
 Object.freeze({subjectId:'amitabha',x:223.52,min:[222.8822,1.7,246.4300],max:[224.1698,3.95,246.8335]}),
 Object.freeze({subjectId:'shakyamuni',x:221.9,min:[221.2502,1.7,246.4300],max:[222.5498,3.95,246.8335]}),
 Object.freeze({subjectId:'bhaisajyaguru',x:220.28,min:[219.6302,1.7,246.4300],max:[220.9418,3.95,246.8335]})
]);
const sessions=new WeakMap(),stateOwners=new WeakMap(),require=(v,m)=>{if(!v)throw Error(m);};
const identity=o=>o&&o.quaternion.equals(new T.Quaternion())&&o.scale.equals(new T.Vector3(1,1,1));
const mutable=a=>Array.isArray(a)&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable;
const names=id=>MATERIALS.map(n=>`${n}_original_artwork_${id}_fallback`);
const finiteBox=b=>b?.isBox3&&!b.isEmpty()&&[...b.min.toArray(),...b.max.toArray()].every(Number.isFinite);
// This reports the active factory's technical metadata, not visual acceptance or
// a measured historical profile. Unknown/older outputs remain explicitly unknown.
const activeLotusReport=(meta,id)=>{
 const revision=id==='shakyamuni'?meta.centralRevision:meta.sideRevision;
 const expected=id==='shakyamuni'?'refined-eight-tier-v2':'private-side-eight-tier-v2';
 const ranges=meta.lotusTierVertexRanges;
 const eight=revision===expected&&meta.lotusPetalTiers===8&&Array.isArray(ranges)&&ranges.length===8&&ranges.every((r,i)=>r?.id===i+1);
 return {revision:typeof revision==='string'?revision:null,reportedProceduralTiers:eight?8:null,historicalProfile:'UNVERIFIED'};
};

/** All-subject preparation is atomic and pre-merge only. Permanent square dais,
 * old render builders, photo registry and already-published physics stay untouched.
 * Each subject gets a separate conservative old+new box, not exact old triangles. */
export function prepareOriginalTriadFallback({kit,f,g}={}){
 require(kit?.root?.name==='outer-west'&&f?.parent===kit.root&&identity(kit.root)&&kit.root.position.lengthSq()===0&&identity(f)&&f.position.equals(new T.Vector3(221.9,0,241.1)),'Exact unmerged hall frame required');
 require(g?.id===PLACE&&g.inventory?.status==='UNKNOWN'&&g.historicalPrincipal?.id===PRINCIPAL&&g.triadFit?.id==='dafotang-three-design-figures-v1'&&!g.originalArtworkCentral&&!g.originalArtworkTriad&&Object.isExtensible(g),'Exact unswitched triad record required');
 require(mutable(kit.owned)&&mutable(kit.colliders),'Mutable material/contact owners required');
 let shared;
 const plans=SPECS.map(spec=>{
  const central=spec.subjectId==='shakyamuni';
  const owners=f.children.filter(o=>central?o.userData.dafotangPrincipal===PRINCIPAL:o.userData.dafotangSideFigure?.subjectId===spec.subjectId);
  require(owners.length===1,'One exact original subject group required');
  const meshes=owners[0].children.filter(m=>m.isMesh&&(!central||m.userData.part!=='support'));
  require(meshes.length>0&&meshes.every(m=>!Array.isArray(m.material)&&MATERIALS.includes(m.material.name)&&Object.getOwnPropertyDescriptor(m,'material')?.writable&&(central||m.userData.subjectId===spec.subjectId)),'Exact writable subject materials required');
  const materials=MATERIALS.map(name=>{const set=new Set(meshes.filter(m=>m.material.name===name).map(m=>m.material));require(set.size===1,'One material per subject role required');return [...set][0];});
  require(materials.every(m=>kit.owned.includes(m))&&(!shared||materials.every((m,i)=>m===shared[i])),'Exact shared original material owners required');shared??=materials;
  const key=central?'dafotangPrincipalMesh':'dafotangTriadMesh',ids=new Set(meshes.map(m=>m.uuid)),contacts=kit.colliders.filter(c=>ids.has(c[key]));
  require(contacts.length===meshes.length&&meshes.every(m=>contacts.filter(c=>c[key]===m.uuid).length===1)&&contacts.every(c=>finiteBox(c)&&(central||c.dafotangTriadSubject===spec.subjectId)),'One original contact per subject mesh required');
  const contact=new T.Box3(new T.Vector3(...spec.min),new T.Vector3(...spec.max)).expandByScalar(.0001);for(const c of contacts)contact.union(c);
  contact.dafotangOriginalArtwork=spec.subjectId;contact.conservativeOriginalAndArtwork=true;
  return{spec,meshes,materials,contacts,contact,clones:[],previous:meshes.map(m=>m.material)};
 });
 const oldContacts=[...kit.colliders],ownedLength=kit.owned.length,allocated=[];
 try{
  for(const p of plans)for(let i=0;i<3;i++){const clone=p.materials[i].clone();allocated.push(clone);clone.name=names(p.spec.subjectId)[i];p.clones.push(clone);}
  const removed=new Set(plans.flatMap(p=>p.contacts)),retained=kit.colliders.filter(c=>!removed.has(c));
  const slots={};for(const p of plans){const id=p.spec.subjectId;slots[id]={subjectId:id,status:'FALLBACK_BEFORE_ASSET_LOAD',activeLotus:null,fallbackMaterialNames:names(id),position:[p.spec.x,1.7,246.7],contact:{type:'CONSERVATIVE_SHARED_OLD_AND_NEW_PROXY_NOT_EXACT_RENDER_TRIANGLES',min:p.contact.min.toArray(),max:p.contact.max.toArray()}};}
  const metadata={id:'dafotang-original-triad-artwork-v1',status:'FALLBACK_BEFORE_ASSET_LOAD',historicalPhoto:false,complete:false,defaultEnabled:false,userVisualAcceptance:'PENDING_CENTRAL_SAMPLE_CONFIRMATION',historicalInventory:'UNKNOWN',lotusEightTiers:'NO_ACTIVE_ORIGINAL_RELIEFS',slots};
  for(const p of plans)p.meshes.forEach((m,i)=>{m.material=p.clones[p.materials.indexOf(p.previous[i])];});
  kit.owned.push(...allocated);kit.colliders.splice(0,kit.colliders.length,...retained,...plans.map(p=>p.contact));g.originalArtworkTriad=metadata;
  return{metadata,contacts:plans.map(p=>p.contact),materials:allocated};
 }catch(error){for(const p of plans)p.meshes.forEach((m,i)=>{m.material=p.previous[i];});kit.colliders.splice(0,kit.colliders.length,...oldContacts);kit.owned.length=ownedLength;delete g.originalArtworkTriad;for(const m of allocated)m.dispose();throw error;}
}

/** One aggregate owner, independently reversible per-subject presentation.
 * Any pending subject keeps LOADING, so ZoneManager's existing cache gate applies. */
export function createOriginalTriadSession(group,{load}={}){
 require(group?.isGroup&&group.name==='outer-west'&&identity(group)&&group.position.lengthSq()===0&&typeof load==='function'&&!sessions.has(group),'Exact unclaimed finished triad host required');
 const records=group.userData.architecture?.filter(r=>r.id===PLACE)??[];require(records.length===1&&records[0].inventory?.status==='UNKNOWN','One unchanged hall record required');
 const state=records[0].originalArtworkTriad;require(state?.id==='dafotang-original-triad-artwork-v1'&&!records[0].originalArtworkCentral,'Prepared original triad fallback required');
 const internals=SPECS.map(spec=>{const meta=state.slots?.[spec.subjectId];require(meta?.subjectId===spec.subjectId&&JSON.stringify(meta.fallbackMaterialNames)===JSON.stringify(names(spec.subjectId))&&JSON.stringify(meta.position)===JSON.stringify([spec.x,1.7,246.7]),'Exact prepared subject identity required');const old=names(spec.subjectId).map(name=>{const found=group.children.filter(m=>m.isMesh&&!Array.isArray(m.material)&&m.material.name===name);require(found.length===1,'One merged subject bucket per material required');return found[0];});const proxy=new T.Box3(new T.Vector3(...meta.contact.min),new T.Vector3(...meta.contact.max));require(finiteBox(proxy),'Finite prepared subject contact required');return{spec,meta,old,previous:old.map(m=>m.visible),proxy,output:null};});
 const controller=new AbortController(),ownership={};let disposed=false;
 const slots=Object.fromEntries(internals.map(p=>[p.spec.subjectId,{status:'LOADING',presentation:null}]));
 const restore=p=>p.old.forEach((m,i)=>{m.visible=p.previous[i];});
 // A throwing owner/listener must not strand unrelated subjects. A failed
 // resource's internal cleanup is not certified; preserve errors explicitly.
 const disposalErrors=[];
 const disposeSlot=(p,out=p.output)=>{
  const errors=[],attempt=fn=>{try{fn();}catch(error){errors.push(error);}};
  p.output=null;
  if(out){attempt(()=>out.mesh?.removeFromParent?.());attempt(()=>out.dispose());}
  attempt(()=>restore(p));
  const slot=slots[p.spec.subjectId];slot.presentation=null;p.meta.activeLotus=null;
  const failed=errors.length>0||slot.status==='DISPOSED_WITH_ERRORS';
  slot.status=p.meta.status=failed?'DISPOSED_WITH_ERRORS':'DISPOSED';
  if(errors.length){disposalErrors.push(...errors);p.meta.reason='Owned output cleanup reported an error';}
 };
 const finishDisposal=()=>{session.status=state.status=disposalErrors.length?'DISPOSED_WITH_ERRORS':'DISPOSED';state.lotusEightTiers='NO_ACTIVE_ORIGINAL_RELIEFS';};
 const session={status:'LOADING',slots,ready:null,get disposalErrors(){return [...disposalErrors];},dispose(){
  if(disposed)return;disposed=true;
  try{controller.abort();}catch(error){disposalErrors.push(error);}
  for(const p of internals)disposeSlot(p);
  finishDisposal();sessions.delete(group);
  if(disposalErrors.length)throw new AggregateError([...disposalErrors],'Original triad disposal reported errors');
 }};
 sessions.set(group,session);stateOwners.set(state,ownership);state.status='LOADING';state.lotusEightTiers='NOT_ALL_ORIGINAL_RELIEFS_READY';for(const p of internals){p.meta.status='LOADING';p.meta.activeLotus=null;}
 const update=()=>{if(disposed)return;const values=Object.values(slots).map(s=>s.status);session.status=state.status=values.includes('LOADING')?'LOADING':values.every(s=>s==='READY_FOR_HALL_QA')?'READY_FOR_HALL_QA':values.some(s=>s==='READY_FOR_HALL_QA')?'PARTIAL_FALLBACK':'FALLBACK';
  state.lotusEightTiers=values.every(s=>s==='READY_FOR_HALL_QA')
   ?internals.every(p=>p.meta.activeLotus?.reportedProceduralTiers===8)
    ?'ALL_ACTIVE_V2_RELIEFS_REPORT_EIGHT_PROCEDURAL_TIERS__HISTORICAL_PROFILE_UNVERIFIED'
    :'ACTIVE_RELIEFS_WITH_UNVERIFIED_OR_MIXED_TIER_METADATA'
   :'NOT_ALL_ORIGINAL_RELIEFS_READY';
 };
 const jobs=internals.map(p=>Promise.resolve().then(()=>disposed?null:load({subjectId:p.spec.subjectId,signal:controller.signal})).then(result=>{
  if(disposed){
   // A late unpublished output belongs only to this retired session. Never
   // restore fallback or rewrite metadata owned by a subsequent admission.
   try{result?.dispose?.();}catch(error){
    disposalErrors.push(error);slots[p.spec.subjectId].status='DISPOSED_WITH_ERRORS';session.status='DISPOSED_WITH_ERRORS';
    if(stateOwners.get(state)===ownership){p.meta.status='DISPOSED_WITH_ERRORS';p.meta.reason='Late owned output cleanup reported an error';state.status='DISPOSED_WITH_ERRORS';}
   }
   return;
  }
  try{
   require(result?.mesh?.isMesh&&!result.mesh.parent&&typeof result.dispose==='function'&&result.meta?.historicalPhoto===false&&result.meta.originalAsset?.subjectId===p.spec.subjectId,'Correct owned original subject relief required');
   const geometry=result.mesh.geometry;geometry.computeBoundingBox();const box=geometry.boundingBox;require(finiteBox(box),'Finite subject geometry required');const height=box.max.y-box.min.y;require(Number.isFinite(height)&&height>0,'Finite visible subject height required');
   geometry.translate(0,-box.min.y,0);geometry.scale(2.25/height,2.25/height,2.25/height);geometry.computeBoundingBox();geometry.computeBoundingSphere();
   result.mesh.position.set(p.spec.x,1.7,246.7);result.mesh.rotation.set(0,Math.PI,0);result.mesh.castShadow=result.mesh.receiveShadow=true;result.mesh.updateWorldMatrix(true,true);
   require(p.proxy.clone().expandByScalar(1e-6).containsBox(new T.Box3().setFromObject(result.mesh)),'Original subject escaped its fixed old/new reserve');
   const activeLotus=activeLotusReport(result.meta,p.spec.subjectId);
   group.add(result.mesh);require(!disposed,'Disposed during original triad publication');p.old.forEach(m=>{m.visible=false;});p.output=result;result.meta.placementAssigned=true;result.meta.runtimeVerification='PLACED_IN_CALLER_HOST_PENDING_RENDER_AND_HALL_ACCEPTANCE';slots[p.spec.subjectId].presentation=result.mesh;slots[p.spec.subjectId].status=p.meta.status='READY_FOR_HALL_QA';p.meta.display='ORIGINAL_PAINTED_ART_MANUAL_RELIEF_NOT_PHOTOGRAPH';p.meta.actualFigureAndLotusHeight=2.25;p.meta.complete=false;p.meta.activeLotus=activeLotus;
  }catch(error){result?.mesh?.removeFromParent?.();result?.dispose?.();restore(p);throw error;}
 }).catch(error=>{if(!disposed){slots[p.spec.subjectId].status=p.meta.status='FALLBACK';p.meta.reason=String(error.message).slice(0,256);restore(p);}}).finally(update));
 session.ready=Promise.all(jobs).then(()=>session);return session;
}
