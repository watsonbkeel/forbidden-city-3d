// Target-local synchronous rollback. Restore authoritative state before invoking
// disposal listeners, then attempt every private cleanup even if one listener fails.
// Never dispose pre-existing geometry or borrowed library materials.
export function withTaihemenCandidateTransaction(builder,parent,p,run){
 const children=new Set(parent.children),oldData={...parent.userData},colliders=builder.colliders.length,walkables=builder.walkables.length,owned=builder.ownedMaterials.length,cache=new Map(builder._own),fields=p.fixtures?.map(f=>[f,{...f}])??[];
 try{return run();}catch(error){
  const geometry=new Set(),added=[...parent.children].filter(child=>!children.has(child)),materials=new Set(builder.ownedMaterials.slice(owned)),cleanupErrors=[];
  for(const child of added)child.traverse(m=>{if(m.isMesh)geometry.add(m.geometry);});
  // Disposal is an external event boundary. No uncommitted collision, support,
  // material-cache or profile state may remain observable when it is invoked.
  builder.colliders.length=colliders;builder.walkables.length=walkables;builder.ownedMaterials.length=owned;builder._own.clear();for(const[k,v]of cache)builder._own.set(k,v);
  for(const[f,before]of fields){for(const k of Object.keys(f))delete f[k];Object.assign(f,before);}for(const k of Object.keys(parent.userData))delete parent.userData[k];Object.assign(parent.userData,oldData);
  const attempt=fn=>{try{fn();}catch(e){cleanupErrors.push(e);}};
  for(const child of added)attempt(()=>child.removeFromParent());
  for(const g of geometry)attempt(()=>g.dispose());
  for(const m of materials)attempt(()=>m.dispose());
  if(cleanupErrors.length)throw new AggregateError([error,...cleanupErrors],error?.message??'Taihemen construction failed',{cause:error});
  throw error;
 }
}
