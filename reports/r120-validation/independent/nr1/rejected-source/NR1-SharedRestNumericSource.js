/** Private routine source checks. Object.freeze is SHALLOW: every referenced
 * descendant is still visited, including mutable triangle normals and buffers.
 * Only the original own-enumerable data contract is observed; no global cache.
 * Frozen data-field invariants guarantee stable keys/values/references. This is
 * not a generic Proxy detector and does not preserve arbitrary trap side effects. */
function frozenOwnData(object,keys,values){
 if(values.some(([,value])=>Number.isNaN(value)))return false; // old === rejects NaN
 try{return Object.isFrozen(object)&&keys.every(key=>{const d=Object.getOwnPropertyDescriptor(object,key);return d&&Object.hasOwn(d,'value')&&d.writable===false&&d.configurable===false;});}
 catch{return false;} // unusual descriptors retain the complete original check
}
export function captureNumericSource(root){
 const rows=[];
 const visit=object=>{
  const keys=Object.keys(object),values=[],references=[];
  for(const key of keys){const value=object[key];if(value&&typeof value==='object'){references.push([key,value]);if(key!=='mesh')visit(value);}else values.push([key,value]);}
  const immutable=frozenOwnData(object,keys,values);
  // A root guard always remains, even for a completely immutable source.
  if(!immutable||object===root)rows.push({object:new WeakRef(object),immutable,count:keys.length,values:immutable?[]:values,refs:immutable?[]:references.map(([key,value])=>[key,new WeakRef(value)])});
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
