// A .6m witnessed-ground handoff outside visible paving prevents the legacy
// .5m ground query from lifting smaller kinematic bodies before actual contact.
export const WEST_WELL_REGION=Object.freeze({minX:33.7,maxX:46,minZ:457.7,maxZ:468.3});
export function validateWestWellScope(input,box,region){
 const lo=[Math.fround(38.3+Math.fround(-1.7)),0,Math.fround(463.7+Math.fround(-1.7))],hi=[Math.fround(38.3+Math.fround(1.7)),Math.fround(.18),Math.fround(463.7+Math.fround(1.7))];
 if(input.id!=='west-well'||input.groundY!==undefined||Object.keys(WEST_WELL_REGION).some(k=>region[k]!==WEST_WELL_REGION[k])||box.min.toArray().some((v,i)=>v!==lo[i])||box.max.toArray().some((v,i)=>v!==hi[i]))throw new TypeError('West well requires its exact visible platform and bounded source domain');
}
