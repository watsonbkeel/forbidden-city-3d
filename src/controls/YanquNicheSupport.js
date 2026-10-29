// Retained Yanqu platform only. This is model-coordinate evidence, not survey.
export const YANQU_NICHE_FLOOR=Object.freeze({minX:-248.3,maxX:-237.5,minZ:431.6,maxZ:446.6,height:.5});
export const YANQU_NICHE_REGION=Object.freeze({minX:-242.2,maxX:-239.15,minZ:436.5,maxZ:441.7});
export function cloneYanquNicheFloor(input,id,region){
 if(id!=='yanqu-photo-niche'||Object.keys(YANQU_NICHE_REGION).some(k=>region[k]!==YANQU_NICHE_REGION[k])||Object.keys(YANQU_NICHE_FLOOR).some(k=>input?.[k]!==YANQU_NICHE_FLOOR[k]))throw Error('Yanqu niche requires its exact retained floor and bounded model placement');
 return Object.freeze({...YANQU_NICHE_FLOOR});
}
export function registeredYanquNicheFloor(source,scope,x,z,radius){
 if(scope.kind!=='yanqu-photo-niche'||!scope.floor||x+radius<scope.minX||x-radius>scope.maxX||z+radius<scope.minZ||z-radius>scope.maxZ)return null;
 const f=scope.floor;if(x+radius<f.minX||x-radius>f.maxX||z+radius<f.minZ||z-radius>f.maxZ)return null;
 const owner=source.walkables?.find(w=>w.type==='box'&&w.box.min.x===f.minX&&w.box.max.x===f.maxX&&w.box.min.z===f.minZ&&w.box.max.z===f.maxZ&&w.box.min.y===f.height&&w.box.max.y===f.height);
 return owner?{height:f.height,owner,source:'existing-yanqu-platform-floor',regionId:scope.id}:null;
}
