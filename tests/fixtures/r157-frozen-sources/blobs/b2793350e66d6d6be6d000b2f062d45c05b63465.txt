import * as THREE from 'three';
export const JIYUN_RAIL_REGION=Object.freeze({minX:273.8,maxX:275.5,minZ:101.4,maxZ:132});
export const JIYUN_UPPER_FLOOR=Object.freeze({minX:274.20000000000005,maxX:286,minZ:102,maxZ:131.4,height:4.8});
export function validateJiyunRailScope(input,box,region){
 const lo=[273.65000000000003,0,101.4],hi=[286.55,.6,132];
 if(input.id!=='jiyun-upper-front-rail'||input.groundY!==undefined||Object.keys(JIYUN_RAIL_REGION).some(k=>region[k]!==JIYUN_RAIL_REGION[k])||box.min.toArray().some((v,i)=>v!==lo[i])||box.max.toArray().some((v,i)=>v!==hi[i]))throw new TypeError('Jiyun requires exact retained platform and bounded upper front rail domain');
}
/** Live original upper walkable only, not a synthetic sheet or ground fallback.
 * The existing thin floor collision proxy ends at 4.65; the registered visible
 * upper floor datum is 4.8. Lower floors remain on their original solver. */
export function registeredJiyunUpperFloor(source,scope,x,z,radius){
 if(scope.kind!=='jiyun-upper-front-rail'||scope.id!=='jiyun-upper-front-rail'||!Number.isFinite(radius)||radius<=0||radius>.5||Object.keys(JIYUN_RAIL_REGION).some(k=>scope[k]!==JIYUN_RAIL_REGION[k])||x+radius<=scope.minX||x-radius>=scope.maxX||z+radius<=scope.minZ||z-radius>=scope.maxZ)return null;
 const f=JIYUN_UPPER_FLOOR,x0=Math.max(x-radius,f.minX),x1=Math.min(x+radius,f.maxX),z0=Math.max(z-radius,f.minZ),z1=Math.min(z+radius,f.maxZ);if(x0>=x1||z0>=z1)return null;
 const owners=source.walkables?.filter(w=>w.type==='box'&&w.box.min.x===f.minX&&w.box.max.x===f.maxX&&w.box.min.z===f.minZ&&w.box.max.z===f.maxZ&&w.box.min.y===f.height&&w.box.max.y===f.height)??[];
 return owners.length===1?{height:f.height,owner:owners[0],source:'existing-jiyun-upper-floor',regionId:scope.id,witness:new THREE.Vector3((x0+x1)/2,f.height,(z0+z1)/2)}:null;
}
