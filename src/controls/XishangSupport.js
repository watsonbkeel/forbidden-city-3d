import * as THREE from 'three';
export const XISHANG_REGION=Object.freeze({minX:-246.5,maxX:-234.9,minZ:363.7,maxZ:379.1});
export const XISHANG_FLOORS=Object.freeze([
 Object.freeze({minX:-244.54999999999998,maxX:-236.85,minZ:364.7,maxZ:378.09999999999997,height:.5}),
 Object.freeze({minX:-243.916,maxX:-241.772,minZ:368.20824,maxZ:374.59175999999997,height:.7}),
]);
export function cloneXishangFloors(input,id,region){
 if(id!=='xishang-roof-transom'||!Array.isArray(input)||input.length!==2||Object.keys(XISHANG_REGION).some(k=>region[k]!==XISHANG_REGION[k])||XISHANG_FLOORS.some((f,i)=>Object.keys(f).some(k=>input[i]?.[k]!==f[k])))throw new TypeError('Xishang requires exact retained floor sources and bounded region');
 return Object.freeze(XISHANG_FLOORS.map(f=>Object.freeze({...f})));
}
/** Existing platform and stone-field walkables, never a new channel-filling
 * plane. Full player footprint straddles the retained narrow channel. */
export function registeredXishangFloor(source,scope,x,z,radius){
 if(scope.kind!=='xishang-roof-transom'||scope.id!=='xishang-roof-transom'||!scope.floor||!Number.isFinite(radius)||radius<=0||radius>.5||Object.keys(XISHANG_REGION).some(k=>scope[k]!==XISHANG_REGION[k])||x+radius<=scope.minX||x-radius>=scope.maxX||z+radius<=scope.minZ||z-radius>=scope.maxZ)return null;
 let best=null;for(const f of scope.floor){const x0=Math.max(x-radius,f.minX),x1=Math.min(x+radius,f.maxX),z0=Math.max(z-radius,f.minZ),z1=Math.min(z+radius,f.maxZ);if(x0>=x1||z0>=z1)continue;
 const owners=source.walkables?.filter(w=>w.type==='box'&&w.box.min.x===f.minX&&w.box.max.x===f.maxX&&w.box.min.z===f.minZ&&w.box.max.z===f.maxZ&&w.box.min.y===f.height&&w.box.max.y===f.height)??[];
 if(owners.length===1&&(!best||f.height>best.height))best={height:f.height,owner:owners[0],source:'existing-xishang-retained-floor',regionId:scope.id,witness:new THREE.Vector3((x0+x1)/2,f.height,(z0+z1)/2)};
 }return best;
}
