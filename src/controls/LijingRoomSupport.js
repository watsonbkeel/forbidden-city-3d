/** Exact inherited hall walkable, not new visible or invisible floor geometry. */
export const LIJING_ROOM_ID='lijing-west-secondary-room';
export const LIJING_FLOOR=Object.freeze({minX:80.8,maxX:108.2,minZ:443.15,maxZ:457.25,height:.45});
export function cloneLijingFloor(input,id,region){
 const f=LIJING_FLOOR;if(id!==LIJING_ROOM_ID||!input||Object.keys(f).some(k=>input[k]!==f[k])||region.minX-1<f.minX||region.maxX+1>f.maxX||region.minZ-1<f.minZ||region.maxZ+1>f.maxZ)throw TypeError('Lijing body scope requires its exact existing floor');return Object.freeze({...f});
}
export function registeredLijingFloor(source,scope,x,z,radius){
 if(scope.kind!=='lijing-west-room'||scope.id!==LIJING_ROOM_ID||!scope.floor)return null;const f=scope.floor,local=x+radius>=scope.minX&&x-radius<=scope.maxX&&z+radius>=scope.minZ&&z-radius<=scope.maxZ,r=local?radius:0;
 if(x-r<f.minX||x+r>f.maxX||z-r<f.minZ||z+r>f.maxZ)return null;
 const owner=source.walkables?.find(w=>w.type==='box'&&w.box.min.x===f.minX&&w.box.max.x===f.maxX&&w.box.min.z===f.minZ&&w.box.max.z===f.maxZ&&w.box.min.y===f.height&&w.box.max.y===f.height);
 return owner?{height:f.height,owner,source:'existing-lijing-engineering-floor',regionId:scope.id}:null;
}
export function registerLijingRoomScope(owner,walkables){
 if(!owner?.isBox3||owner.furnitureMotionScope)throw Error('Lijing room owner invalid');
 const region={minX:96.2,maxX:103.2,minZ:444.8,maxZ:453.2},floor=cloneLijingFloor(LIJING_FLOOR,LIJING_ROOM_ID,region);
 if(!registeredLijingFloor({walkables},{...region,kind:'lijing-west-room',id:LIJING_ROOM_ID,floor},99,448,.5))throw Error('Lijing original floor registration missing');
 owner.furnitureMotionScope={kind:'lijing-west-room',id:LIJING_ROOM_ID,floor,minOffsetX:region.minX-owner.min.x,maxOffsetX:region.maxX-owner.min.x,minOffsetZ:region.minZ-owner.min.z,maxOffsetZ:region.maxZ-owner.min.z};
}
