// Bounded model-fit circulation. Includes the unchanged nearby tree and a
// .6 m source-ground handoff; not a measured historical paving boundary.
export const SISHEN_REGION=Object.freeze({minX:22.3,maxX:36,minZ:457.1,maxZ:471.1});
export function validateSishenScope(input,box,region){
 const lo=[Math.fround(30.3-Math.fround(1.2)),0,Math.fround(468.8-Math.fround(.2))],hi=[Math.fround(30.3+Math.fround(1.2)),Math.fround(.48),Math.fround(468.8+Math.fround(.2))];
 if(input.id!=='sishen'||input.groundY!==undefined||Object.keys(SISHEN_REGION).some(k=>region[k]!==SISHEN_REGION[k])||box.min.toArray().some((v,i)=>v!==lo[i])||box.max.toArray().some((v,i)=>v!==hi[i]))throw new TypeError('Sishen requires its exact visible north step and bounded source domain');
}
