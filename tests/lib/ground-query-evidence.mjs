import {furnitureMotionSource,furnitureLocalColliders,furnitureRegionIndex}from'../../src/controls/FurnitureMotion.js';
const bounds=b=>({min:[b.min.x,b.min.y,b.min.z],max:[b.max.x,b.max.y,b.max.z]});
const plainOwner=(W,c)=>{const o=W.ownerOf?.(c)??{},i=o.item??{};return{zone:o.zone,kind:i.kind,name:i.name,x:i.x,z:i.z,gateProfile:i.gateProfile};};
// Post-failure sampling only. Never changes the ground method or accepted result.
export function groundWithEvidence(W,x,z,feet,stepUp,context={},write=s=>console.error(s)){
 try{return W.cm.getGroundHeight(x,z,feet,stepUp);}
 catch(error){
  const record={query:{x,z,feet,stepUp,maxTop:feet+stepUp,radius:.5},context,error:{name:error?.name,message:error?.message}};
  try{
   const b=new W.THREE.Box3(new W.THREE.Vector3(x-.5,-Infinity,z-.5),new W.THREE.Vector3(x+.5,Infinity,z+.5));
   const source=furnitureMotionSource(W.cm),all=furnitureLocalColliders(W.cm,b).filter(c=>b.intersectsBox(c.box)),bad=all.filter(c=>c.triangleSupport||c.overhead);
   const describe=c=>({sourceIndex:source.colliders.indexOf(c),tag:c.tag,box:bounds(c.box),triangleSupport:!!c.triangleSupport,overhead:!!c.overhead,xiqingRoofSurface:!!c.xiqingRoofSurface,shapeId:c.triangleSupport?.id??c.overhead?.id??c.xiqingRoofSurface?.id,shapeKeys:Object.keys(c.triangleSupport??c.overhead??{}).slice(0,24),mesh:{name:c.mesh?.name,type:c.mesh?.type,role:c.mesh?.userData?.role},owner:plainOwner(W,c)});
   record.overlapCount=all.length;record.unsupportedCount=bad.length;record.unsupportedOwners=bad.slice(0,32).map(describe);record.otherOwners=all.filter(c=>!bad.includes(c)).slice(0,32).map(describe);record.truncated=bad.length>32||all.length-bad.length>32;
   record.regionCandidates=furnitureRegionIndex(W.cm).regions.filter(r=>x>=r.minX-.5&&x<=r.maxX+.5&&z>=r.minZ-.5&&z<=r.maxZ+.5).map(r=>({kind:r.kind,id:r.id,minX:r.minX,maxX:r.maxX,minZ:r.minZ,maxZ:r.maxZ}));
   record.regionMeaning='XZ candidates only; height and dedicated scope conditions not re-evaluated';
  }catch(sampling){record.samplingError=String(sampling);}
  try{write('GROUND_QUERY_FAILURE_JSON '+JSON.stringify(record));}catch{}
  throw error;
 }
}
