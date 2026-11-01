// Dispatch identity only. Every height/contact is still derived from live
// rendered source faces; this file never supplies an inferred floor.
export const WENHUA_GATE_APPROACH_IDS=Object.freeze(['wenhua-gate-approach-south','wenhua-gate-approach-north']);
export const WENHUA_GATE_APPROACH_REGION=Object.freeze({minX:-203.7,maxX:-168.9,minZ:-259,maxZ:-226.8});
export const WENHUA_GATE_APPROACH_ANCHOR=Object.freeze({min:Object.freeze([-187.85,0,-257.2]),max:Object.freeze([-187.55,.94,-256.9])});
export function validateWenhuaGateApproachScope(input,owner,region){
 const expected=WENHUA_GATE_APPROACH_ANCHOR;
 if(input.id!=='wenhua-gate-approaches'||input.groundY!==0||Object.keys(WENHUA_GATE_APPROACH_REGION).some(k=>Math.abs(region[k]-WENHUA_GATE_APPROACH_REGION[k])>1e-10)||owner.min.toArray().some((v,i)=>Math.abs(v-Math.fround(expected.min[i]))>1e-7)||owner.max.toArray().some((v,i)=>Math.abs(v-Math.fround(expected.max[i]))>1e-7))throw new TypeError('Wenhua gate approaches require exact source post and bounded gate instance');
}
