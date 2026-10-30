// A .6m witnessed-ground handoff outside visible paving prevents the legacy
// .5m ground query from lifting smaller kinematic bodies before actual contact.
export const EAST_WELL_REGION=Object.freeze({minX:-53,maxX:-43.8,minZ:455.2,maxZ:464.4});
export function validateEastWellScope(input,box,region){
 const lo=[Math.fround(-48.4+Math.fround(-1.7)),0,Math.fround(459.8+Math.fround(-1.7))],hi=[Math.fround(-48.4+Math.fround(1.7)),Math.fround(.18),Math.fround(459.8+Math.fround(1.7))];
 if(input.id!=='east-well'||input.groundY!==undefined||Object.keys(EAST_WELL_REGION).some(k=>region[k]!==EAST_WELL_REGION[k])||box.min.toArray().some((v,i)=>v!==lo[i])||box.max.toArray().some((v,i)=>v!==hi[i]))throw new TypeError('East well requires its exact visible platform and bounded source domain');
}
