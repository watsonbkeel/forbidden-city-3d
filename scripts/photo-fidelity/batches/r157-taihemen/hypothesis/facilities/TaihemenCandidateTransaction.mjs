// Candidate-local synchronous rollback. Never touches another root or borrowed
// library material; preserves pre-existing geometry, ownership and profile refs.
export function withTaihemenCandidateTransaction(builder,parent,p,run){
 const children=new Set(parent.children),oldData={...parent.userData},colliders=builder.colliders.length,walkables=builder.walkables.length,owned=builder.ownedMaterials.length,cache=new Map(builder._own),fields=p.fixtures?.map(f=>[f,{...f}])??[];
 try{return run();}catch(error){
  const geometry=new Set();for(const child of[...parent.children])if(!children.has(child)){child.traverse(m=>{if(m.isMesh)geometry.add(m.geometry);});child.removeFromParent();}geometry.forEach(g=>g.dispose());
  for(const m of new Set(builder.ownedMaterials.slice(owned)))m.dispose();builder.ownedMaterials.length=owned;builder._own.clear();for(const[k,v]of cache)builder._own.set(k,v);builder.colliders.length=colliders;builder.walkables.length=walkables;
  for(const[f,before]of fields){for(const k of Object.keys(f))delete f[k];Object.assign(f,before);}for(const k of Object.keys(parent.userData))delete parent.userData[k];Object.assign(parent.userData,oldData);throw error;
 }
}
