/** Existing registered main/annex plinth floors, restricted to two new seat
 * contacts. No new world collider, walkable, height map or global step rule. */
export const CHENGRUI_SEAT_FLOORS=Object.freeze([
 Object.freeze({minX:53.5-4.2,maxX:53.5+4.2,minZ:498.5-4.2,maxZ:498.5+4.2,height:.9}),
 Object.freeze({minX:53.5-4.2,maxX:53.5+4.2,minZ:498.5-6.6,maxZ:498.5-4.2,height:.5}),
]);
export function cloneChengruiSeatFloors(input,id,region){
 const sign=id==='chengrui-south-seat-east'?-1:id==='chengrui-south-seat-west'?1:0;
 const expected={minX:53.5+sign*2.6-1.4,maxX:53.5+sign*2.6+1.4,minZ:498.5-5.6,maxZ:498.5-2.7};
 if(!sign||!Array.isArray(input)||input.length!==2||Object.keys(expected).some(k=>region[k]!==expected[k])||CHENGRUI_SEAT_FLOORS.some((f,i)=>Object.keys(f).some(k=>input[i]?.[k]!==f[k])))throw new TypeError('Chengrui seats require exact original two-plinth floors and bounded seat-only region');
 return Object.freeze(CHENGRUI_SEAT_FLOORS.map(f=>Object.freeze({...f})));
}
export function registeredChengruiSeatFloor(source,scope,x,z,radius){
 if(scope.kind!=='chengrui-south-seats'||!scope.floor)return null;
 const local=x+radius>=scope.minX&&x-radius<=scope.maxX&&z+radius>=scope.minZ&&z-radius<=scope.maxZ;if(!local)return null;const r=radius;
 let best=null;for(const f of scope.floor){if(x+r<f.minX||x-r>f.maxX||z+r<f.minZ||z-r>f.maxZ)continue;
  // Every query rechecks live original support; removing/replacing it cannot
  // leave a cached synthetic floor or extend it beyond its real plinth.
  const owner=source.walkables?.find(w=>w.type==='box'&&w.box.min.x===f.minX&&w.box.max.x===f.maxX&&w.box.min.z===f.minZ&&w.box.max.z===f.maxZ&&w.box.min.y===f.height&&w.box.max.y===f.height);
  if(owner&&(!best||f.height>best.height))best={height:f.height,owner,source:'existing-chengrui-plinth-floor',regionId:scope.id};
 }return best;
}
