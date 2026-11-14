// CPU QA ownership only. Uses actual owner disposal; no private lifecycle flags.
export function createWorldCleanup({cm,owners,library,restore}){
 let attempted=false,failed=false,completed=[];
 return function dispose(primary){
  if(attempted){if(primary)throw primary;if(failed)throw Error('world cleanup already failed');return [...completed];}
  attempted=true;const errors=primary?[primary]:[];
  const attempt=(label,fn)=>{try{fn();completed.push(label);}catch(error){errors.push(error);}};
  attempt('cm',()=>cm.clear());
  for(const {label,value}of owners)attempt(label,()=>value.dispose());
  attempt('library',()=>library.dispose());attempt('globals',restore);
  failed=errors.length>0;if(errors.length===1&&errors[0]===primary)throw primary;
  if(errors.length)throw new AggregateError(errors,'Finished QA world validation/cleanup failed');
  return [...completed];
 };
}
export function installCpuDocument(createCanvas){
 if(globalThis.document!==undefined)throw Error('real finish refuses existing document');
 const previous={document:Object.getOwnPropertyDescriptor(globalThis,'document'),fetch:Object.getOwnPropertyDescriptor(globalThis,'fetch')};
 const stats={canvases:0,imageElements:0,fetches:0};let restored=false;
 globalThis.document={createElement(tag){if(tag!=='canvas')throw Error('only actual canvas supported');stats.canvases++;return createCanvas(1,1);},createElementNS(ns,tag){if(tag!=='img')throw Error('only unloaded img placeholder supported');stats.imageElements++;return{addEventListener(){},removeEventListener(){}};}};
 globalThis.fetch=()=>{stats.fetches++;throw Error('unexpected network in offline real-finish QA');};
 return{stats,restore(){if(restored)return;restored=true;for(const key of['document','fetch']){if(previous[key])Object.defineProperty(globalThis,key,previous[key]);else delete globalThis[key];}}};
}
