// Independently registered west edges from the Museum's 1941 Baohe plan.
// Rounded engineering form, not a modern survey or a mirrored east profile.
export const BAOHE_WEST_TERRACE=Object.freeze({
 id:'baohe-west-terrace',side:'west',upperHalfWidth:53.5,
 westEdges:Object.freeze([64.13,58.60,53.50]),outerWallStartX:64.85,
 evidence:'OWN_1941_PLAN_WEST_SETBACKS_AND_RECORDED_OWN_PANORAMA_TOPOLOGY',
});
export function baoheWestTerraceProfile(rects,{layers,lh}){
 if(rects?.length!==3||layers!==3||!Number.isFinite(lh)||Math.abs(lh-8/3)>.001||Math.abs(rects[2].hw-28.85)>.001||![rects[2].z0,rects[2].z1].every(Number.isFinite)||rects[2].z0>=rects[2].z1)throw Error('Baohe west terrace requires retained three-hall controls');
 return {...BAOHE_WEST_TERRACE,westEdges:[...BAOHE_WEST_TERRACE.westEdges],rectIndex:2,
  northZ:rects[2].z1,southZ:rects[2].z0,levels:[lh,2*lh,3*lh],northCentralHalfWidth:rects[2].hw,
  accepted:false,dimensionStatus:'GAME_SCALE_PLAN_FIT_NOT_CURRENT_SURVEY'};
}
