/** Private routine source checks. Object.freeze is SHALLOW: every referenced
 * descendant is still visited, including mutable triangle normals and buffers.
 * Only the original own-enumerable data contract is observed; no global cache.
 * Frozen data-field invariants guarantee stable keys/values/references. This is
 * not a generic Proxy detector and does not preserve arbitrary trap side effects. */
const NO_CHILDREN=Object.freeze([]);
function frozenDataChildren(object,keys){
 try{
  if(!Object.isFrozen(object))return null;
  let children;
  for(const key of keys){
   const d=Object.getOwnPropertyDescriptor(object,key);
   if(!d||!Object.hasOwn(d,'value')||d.writable!==false||d.configurable!==false||Number.isNaN(d.value))return null;
   if(key!=='mesh'&&d.value&&typeof d.value==='object')(children??=[]).push(d.value);
  }
  return children??NO_CHILDREN;
 }catch{return null;}
}
export function captureNumericSource(root){
 const rows=[];
 const visit=object=>{
  const keys=Object.keys(object),children=frozenDataChildren(object,keys);
  if(children){
   // Frozen leaves allocate no unused values/reference arrays. The small
   // children list exists only for frozen containers, never mutable sources.
   for(const child of children)visit(child);
   if(object===root)rows.push({object:new WeakRef(object),immutable:true});
   return;
  }
  const values=[],refs=[];
  for(const key of keys){const value=object[key];if(value&&typeof value==='object'){refs.push([key,new WeakRef(value)]);if(key!=='mesh')visit(value);}else values.push([key,value]);}
  rows.push({object:new WeakRef(object),immutable:false,count:keys.length,values,refs});
 };
 visit(root);return rows;
}
export function numericSourceCurrent(object,rows){
 try{
  if(object!==rows.at(-1)?.object.deref())return false;
  for(const row of rows){const current=row.object.deref();if(!current)return false;if(row.immutable)continue;if(Object.keys(current).length!==row.count)return false;for(const[key,value]of row.values)if(current[key]!==value)return false;for(const[key,reference]of row.refs)if(current[key]!==reference.deref())return false;}
  return true;
 }catch{return false;}
}
