import * as T from 'three';
const PLACE='place-outer-west-6cae88b6a2',PRINCIPAL='dafotang-shakyamuni-historical-fit';
const ORIGINAL=['worn_gold','red_lacquer','dark_curls'].map(n=>'dafotang_principal_'+n);
const NAMES=ORIGINAL.map(n=>n+'_original_artwork_central_fallback');
const sessions=new WeakMap(),stateOwners=new WeakMap();
const require=(v,m)=>{if(!v)throw Error(m);};
const identity=o=>o&&o.quaternion.equals(new T.Quaternion())&&o.scale.equals(new T.Vector3(1,1,1));
/** Must run after all old hall builders, before material merge and collider publication.
 * Three additional fallback material buckets isolate the center; side figures are untouched.
 * The conservative fixed contact is shared by old fallback and the new center, not exact triangles.
 */
export function prepareCentralFallback({kit,f,g}={}){
 require(kit?.root?.name==='outer-west'&&f?.parent===kit.root&&identity(kit.root)&&kit.root.position.lengthSq()===0&&identity(f)&&f.position.equals(new T.Vector3(221.9,0,241.1)),'Exact unmerged hall frame required');
 require(g?.id===PLACE&&g.inventory?.status==='UNKNOWN'&&g.historicalPrincipal?.id===PRINCIPAL&&g.triadFit?.id==='dafotang-three-design-figures-v1'&&!g.originalArtworkCentral,'Exact unswitched triad record required');
 const principals=f.children.filter(o=>o.userData.dafotangPrincipal===PRINCIPAL);require(principals.length===1,'One original central figure required');
 const meshes=principals[0].children.filter(m=>m.isMesh&&m.userData.part!=='support');require(meshes.length>0&&meshes.every(m=>!Array.isArray(m.material)&&ORIGINAL.includes(m.material.name)),'Central materials must remain identifiable');
 const oldMaterials=ORIGINAL.map(name=>{const found=new Set(meshes.filter(m=>m.material.name===name).map(m=>m.material));require(found.size===1,'One material owner per fallback role required');return [...found][0];});
 require(Array.isArray(kit.owned)&&oldMaterials.every(m=>kit.owned.includes(m))&&Array.isArray(kit.colliders),'Exact material/contact owners required');
 const ids=new Set(meshes.map(m=>m.uuid)),contacts=kit.colliders.filter(c=>ids.has(c.dafotangPrincipalMesh));
 require(contacts.length===meshes.length&&meshes.every(m=>contacts.filter(c=>c.dafotangPrincipalMesh===m.uuid).length===1),'Every central part needs one original contact');
 // Enclose the old visual AND the new fixed normalized art envelope. Fallback does
 // not pretend to restore the removed triangle contact semantics after publication.
 const contact=new T.Box3(new T.Vector3(221.1,1.7,246.3),new T.Vector3(222.7,3.95,247.0));
 for(const c of contacts){require(c.isBox3&&!c.isEmpty()&&[...c.min.toArray(),...c.max.toArray()].every(Number.isFinite),'Finite old contacts required');contact.union(c);}
 contact.dafotangOriginalArtwork='central';contact.conservativeOriginalAndArtwork=true;
 const clones=[];const before={materials:meshes.map(m=>m.material),contacts:[...kit.colliders],ownedLength:kit.owned.length};
 try{
  for(let i=0;i<oldMaterials.length;i++){const m=oldMaterials[i].clone();m.name=NAMES[i];clones.push(m);}
  const oldSet=new Set(contacts);const retained=kit.colliders.filter(c=>!oldSet.has(c));
  for(let i=0;i<meshes.length;i++)meshes[i].material=clones[oldMaterials.indexOf(before.materials[i])];
  kit.owned.push(...clones);kit.colliders.splice(0,kit.colliders.length,...retained,contact);
  g.originalArtworkCentral={id:'dafotang-original-central-artwork-v1',status:'FALLBACK_BEFORE_ASSET_LOAD',historicalPhoto:false,complete:false,sideFigures:'UNCHANGED_OLD_DESIGN_FIT',fallbackMaterialNames:[...NAMES],contact:{type:'CONSERVATIVE_SHARED_OLD_AND_NEW_PROXY_NOT_EXACT_RENDER_TRIANGLES',min:contact.min.toArray(),max:contact.max.toArray()},lotusEightTiers:'NOT_VERIFIED_HIGH_V1_SEAT',historicalInventory:'UNKNOWN'};
  return{contact,materials:clones,metadata:g.originalArtworkCentral};
 }catch(e){meshes.forEach((m,i)=>m.material=before.materials[i]);kit.colliders.splice(0,kit.colliders.length,...before.contacts);kit.owned.length=before.ownedLength;delete g.originalArtworkCentral;for(const m of clones)m.dispose();throw e;}
}
/** Real merged-group lifecycle. Caller owns loading policy; it must hash local original
 * assets and return an owned relief only. No photograph registry or camera-facing card.
 */
export function createOriginalCentralSession(group,{load}={}){
 require(group?.isGroup&&group.name==='outer-west'&&identity(group)&&group.position.lengthSq()===0&&typeof load==='function'&&!sessions.has(group),'Exact unclaimed finished original-art host required');
 const records=group.userData.architecture?.filter(r=>r.id===PLACE)??[];require(records.length===1&&records[0].inventory?.status==='UNKNOWN','One unchanged hall record required');
 const state=records[0].originalArtworkCentral;require(state?.id==='dafotang-original-central-artwork-v1'&&JSON.stringify(state.fallbackMaterialNames)===JSON.stringify(NAMES),'Prepared central-only fallback required');
 const old=NAMES.map(name=>{const found=group.children.filter(m=>m.isMesh&&!Array.isArray(m.material)&&m.material.name===name);require(found.length===1,'One merged central bucket required');return found[0];});
 const previous=old.map(m=>m.visible),controller=new AbortController(),ownership={};let disposed=false,output=null;
 const restore=()=>old.forEach((m,i)=>m.visible=previous[i]);
 const disposalErrors=[];
 const finishDisposal=()=>{session.status=disposalErrors.length?'DISPOSED_WITH_ERRORS':'DISPOSED';if(stateOwners.get(state)===ownership)state.status=session.status;};
 const release=(result,detach=true)=>{
  const errors=[],attempt=fn=>{try{fn();}catch(error){errors.push(error);}};
  if(result){if(detach)attempt(()=>result.mesh?.removeFromParent?.());attempt(()=>result.dispose?.());}
  disposalErrors.push(...errors);if(disposed)finishDisposal();return errors;
 };
 const session={status:'LOADING',presentation:null,ready:null,loadError:null,get disposalErrors(){return [...disposalErrors];},dispose(){
  if(disposed)return;disposed=true;
  const retired=output;output=null;session.presentation=null;
  // Restore and relinquish this session before resource/listener callbacks can
  // reenter. A successor must never inherit the retired hidden fallback state.
  for(let i=0;i<old.length;i++){try{old[i].visible=previous[i];}catch(error){disposalErrors.push(error);}}
  finishDisposal();if(sessions.get(group)===session)sessions.delete(group);
  try{controller.abort();}catch(error){disposalErrors.push(error);}
  release(retired);finishDisposal();
  if(disposalErrors.length)throw new AggregateError([...disposalErrors],'Original central session disposal reported errors');
 }};
 sessions.set(group,session);stateOwners.set(state,ownership);state.status='LOADING';
 session.ready=Promise.resolve().then(()=>disposed?null:load({signal:controller.signal})).then(result=>{
  if(disposed){release(result,false);return session;}
  try{
   require(result?.mesh?.isMesh&&typeof result.dispose==='function'&&result.meta?.historicalPhoto===false,'Owned original relief required');
   const geometry=result.mesh.geometry;geometry.computeBoundingBox();const box=geometry.boundingBox,size=box.max.y-box.min.y;require(Number.isFinite(size)&&size>0,'Finite figure height required');
   // Source image margins are not statue height. Normalize actual visible geometry.
   geometry.translate(0,-box.min.y,0);geometry.scale(2.25/size,2.25/size,2.25/size);geometry.computeBoundingBox();geometry.computeBoundingSphere();
   result.mesh.position.set(221.9,1.7,246.7);result.mesh.rotation.set(0,Math.PI,0);result.mesh.receiveShadow=true;result.mesh.updateWorldMatrix(true,true);
   const proxy=new T.Box3(new T.Vector3(...state.contact.min),new T.Vector3(...state.contact.max)).expandByScalar(1e-6);
   require(proxy.containsBox(new T.Box3().setFromObject(result.mesh)),'New relief escaped old/new conservative contact reserve');
   group.add(result.mesh);require(!disposed,'Disposed during original artwork publication');old.forEach(m=>m.visible=false);output=result;session.presentation=result.mesh;session.status=state.status='READY_FOR_HALL_QA';state.display='ORIGINAL_PAINTED_ART_MANUAL_RELIEF_NOT_PHOTOGRAPH';state.actualFigureAndLotusHeight=2.25;state.complete=false;
  }catch(e){
   const errors=release(result);if(!disposed&&stateOwners.get(state)===ownership)restore();
   if(errors.length)throw new AggregateError([e,...errors],'Original central publication and cleanup reported errors');
   throw e;
  }
  return session;
 }).catch(error=>{session.loadError=error;if(!disposed&&stateOwners.get(state)===ownership){session.status=state.status='FALLBACK';state.reason=String(error.message).slice(0,256);restore();}return session;});
 return session;
}
