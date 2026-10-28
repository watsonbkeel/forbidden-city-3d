/** Only the two new transverse link contact domains can consult this existing
 * live raised platform. No new floor, support box or platform-wide dispatcher. */
export const WUMEN_LINK_FLOOR=Object.freeze({minX:-60,maxX:60,minZ:-419.6-13.3,maxZ:-419.6+18.6,height:12.3});
export function wumenLinkRegion(id){const sign=id==='wumen-transverse-link-east'?-1:id==='wumen-transverse-link-west'?1:0;if(!sign)throw TypeError('Known Wumen link required');return{minX:sign<0?-43.4:28.4,maxX:sign<0?-28.4:43.4,minZ:-419.6-11.05,maxZ:-419.6+.05};}
export function cloneWumenLinkFloor(input,id,region){const r=wumenLinkRegion(id),f=WUMEN_LINK_FLOOR;if(!input||Object.keys(f).some(k=>input[k]!==f[k])||Object.keys(r).some(k=>Math.abs(region[k]-r[k])>1e-10))throw TypeError('Exact Wumen original floor and bounded link region required');return Object.freeze({...f});}
export function registeredWumenLinkFloor(source,scope,x,z,radius){if(![x,z,radius].every(Number.isFinite)||radius<=0)return null;if(scope.kind!=='wumen-transverse-links'||!scope.floor||x+radius<scope.minX||x-radius>scope.maxX||z+radius<scope.minZ||z-radius>scope.maxZ)return null;const f=scope.floor;if(x-radius<f.minX||x+radius>f.maxX||z-radius<f.minZ||z+radius>f.maxZ)return null;const owner=source.walkables?.find(w=>w.type==='box'&&w.rescue===false&&w.box.min.x===f.minX&&w.box.max.x===f.maxX&&w.box.min.z===f.minZ&&w.box.max.z===f.maxZ&&w.box.min.y===f.height&&w.box.max.y===f.height);return owner?{height:f.height,owner,source:'existing-wumen-link-platform-floor',regionId:scope.id}:null;}
/** One real CollisionManager horizontal subdivision leaving the new domain.
 * This is not an outside-domain query or enlarged scope: the source footprint
 * must still touch the registered domain, and the target must just exit it. */
export function registeredWumenLinkExitFloor(source,scope,from,to,radius){
 if(![from?.x,from?.y,from?.z,to?.x,to?.y,to?.z,radius].every(Number.isFinite)||radius<=0)return null;
 const local=(x,z)=>x+radius>=scope.minX&&x-radius<=scope.maxX&&z+radius>=scope.minZ&&z-radius<=scope.maxZ;
 if(scope.kind!=='wumen-transverse-links'||!local(from.x,from.z)||local(to.x,to.z)||Math.hypot(to.x-from.x,to.z-from.z)>radius*.5+1e-10)return null;
 const hit=registeredWumenLinkFloor(source,scope,from.x,from.z,radius),f=scope.floor;
 if(!hit||to.x-radius<f.minX||to.x+radius>f.maxX||to.z-radius<f.minZ||to.z+radius>f.maxZ)return null;
 return{...hit,source:'existing-wumen-link-platform-exit'};
}
