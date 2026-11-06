// Call only after construction/R63 execution has stopped. Never instrument
// geometry/materials before the inventory validator runs.
export function cleanupResources(builders,library,{disposeLibrary=false,extraResources=[]}={}){
 const privateSet=new Set(extraResources),librarySet=new Set([
  ...library.materials.values(),...library.colors.values(),...library.normals.values(),
 ]),protectedMaps=new Set();
 for(const b of builders){
  for(const r of[b.kit.root,b.group])r?.traverse?.(o=>{if(o.geometry)privateSet.add(o.geometry);});
  for(const r of[...b.kit.owned,...(b.kit.ownedTextures??[])])privateSet.add(r);
  for(const r of[b.kit.root,b.group])r?.traverse?.(o=>{for(const m of Array.isArray(o.material)?o.material:[o.material])if(m)for(const x of Object.values(m))if(x?.isTexture&&!librarySet.has(x)&&!privateSet.has(x))protectedMaps.add(x);});
 }
 for(const r of librarySet)privateSet.delete(r);
 // Constructor's gold-brick texture is a module cache, not a fixture asset.
 for(const b of builders)if(b.kit.floorMat?.map&&!librarySet.has(b.kit.floorMat.map)&&!privateSet.has(b.kit.floorMat.map))protectedMaps.add(b.kit.floorMat.map);
 const all=new Set([...privateSet,...librarySet,...protectedMaps]),rows=new Map(),errors=[];let phase='builders';
 for(const r of all){
  if(typeof r?.dispose!=='function'||typeof r?.addEventListener!=='function')throw TypeError('Unsupported cleanup resource');
  const row={kind:r.type??r.constructor.name,ownership:privateSet.has(r)?'private':librarySet.has(r)?'library':'protected-module-cache',attempts:0,events:0,phases:[]};rows.set(r,row);
  const listener=()=>{row.events++;row.phases.push(phase);};r.addEventListener('dispose',listener);row.listener=listener;
  if(!protectedMaps.has(r)){
   row.original=r.dispose;row.ownDescriptor=Object.getOwnPropertyDescriptor(r,'dispose');
   r.dispose=function(){if(row.attempts)return;row.attempts++;return row.original.call(this);};
  }
 }
 const attempt=(fn,label)=>{try{fn();}catch(e){errors.push({label,message:e.message});}};
 try{
  for(const[i,b]of builders.entries())attempt(()=>b.dispose(),'builder/'+i);
  const libraryBeforeExplicit=[...librarySet].reduce((n,r)=>n+rows.get(r).events,0);
  if(libraryBeforeExplicit)errors.push({label:'ownership',message:'builder disposed shared library resource'});
  phase='private-fallback';
  for(const r of privateSet)if(rows.get(r).attempts===0)attempt(()=>r.dispose(),'remaining-private');
  if(disposeLibrary){phase='library';attempt(()=>library.dispose(),'library.dispose');phase='library-fallback';for(const r of librarySet)if(rows.get(r).attempts===0)attempt(()=>r.dispose(),'remaining-library');}
  for(const[r,row]of rows){const expected=privateSet.has(r)||disposeLibrary&&librarySet.has(r)?1:0;if(row.events!==expected)errors.push({label:'resource-event-count',message:`${row.ownership}/${row.kind}: expected${expected}, actual${row.events}, attempts${row.attempts}`});}
  return {success:errors.length===0,errors,libraryBeforeExplicit,privateResources:privateSet.size,libraryResources:librarySet.size,protectedModuleTextures:protectedMaps.size,rows:[...rows.values()].map(({listener,original,ownDescriptor,...r})=>r)};
 }finally{
  for(const[r,row]of rows){r.removeEventListener('dispose',row.listener);if(row.original){if(row.ownDescriptor)Object.defineProperty(r,'dispose',row.ownDescriptor);else delete r.dispose;}}
 }
}
