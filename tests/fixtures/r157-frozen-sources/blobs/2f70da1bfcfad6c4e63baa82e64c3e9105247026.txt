// Explicit per-library policy; no global scene state and no inference from sd/hd.
const policies=new WeakMap();
const validLibrary=x=>x!==null&&(typeof x==='object'||typeof x==='function');
function policy(library){if(!validLibrary(library))throw new TypeError('Building detail quality needs a library object');let p=policies.get(library);if(!p){p={quality:'high',listeners:new Set()};policies.set(library,p);}return p;}
export function buildingDetailQuality(library){return validLibrary(library)?policies.get(library)?.quality??'high':'high';}
export function setBuildingDetailQuality(library,value){if(value!=='high'&&value!=='low')throw new TypeError('Building detail quality must be high or low');const p=policy(library);if(p.quality===value)return false;p.quality=value;for(const listener of [...p.listeners])listener(value);return true;}
export function onBuildingDetailQuality(library,listener){if(typeof listener!=='function')throw new TypeError('Building detail listener must be a function');if(!validLibrary(library))return()=>{};const p=policy(library);p.listeners.add(listener);return()=>p.listeners.delete(listener);}
