// ISOLATED counterfactual only. No production module may import this file.
// Parent authorized A to test the retained approach envelope, NOT to claim
// that its demonstrably too-narrow source ratio is an accepted reconstruction.
import assert from'node:assert/strict';
import{taihemenSouthProfile as retainedProfile,buildTaihemenSouthApproach as retainedBuild}from'../../../../../../src/scene/palace/TaihemenSouthApproach.js';
export function taihemenSouthProfile(input){
 const p=retainedProfile(input);if(Math.abs(p.width-11.748)>1e-6||Math.abs(p.halfWidth-25.03)>1e-6)throw Error('Taihemen A needs its retained own envelope,not a new scale');
 const imperialWidth=p.width*.37,groundGapWidth=p.width*.085,flightWidth=p.width*.23;
 const flights=p.flights.map(f=>{const side=Math.sign(f.centerX),centerX=side*(imperialWidth/2+groundGapWidth+flightWidth/2);return{...f,centerX,width:flightWidth,ramp:{...f.ramp,minX:centerX-flightWidth/2+p.cheekWidth,maxX:centerX+flightWidth/2-p.cheekWidth}};});
 return{...p,imperialWidth,groundGapWidth,flights,accepted:false,candidateStatus:'ISOLATED_A_NOT_SOURCE_REGISTERED',furnacesBuilt:0,
  originalFlightCenters:p.flights.map(f=>f.centerX),dimensionStatus:'RETAINED_OUTER_WIDTH_LOCAL_PHOTO_TOPOLOGY_HYPOTHESIS_NOT_SURVEY',
  sourceWidthStatus:'FAILS_FULL_GATE_REGISTRATION_DO_NOT_INTEGRATE',localWidthFractions:{imperial:.37,gapEach:.085,flightEach:.23},
  fullSourceControl:{source:'T-DRAW-06',sourceFile:'drawing-06.jpg',drawingDate:'1941-09',approximatePixels:{columnSpan:[540,1353],threeWayApproachSpan:[796,1099]},observedRatio:303/813,modelRatio:p.width/48.06,allowedRatio:[.35,.41],accepted:false}};
}
export function buildTaihemenSouthApproach(builder,parent,p){
 if(parent?.name!=='太和门'||p?.candidateStatus!=='ISOLATED_A_NOT_SOURCE_REGISTERED'||p.accepted!==false)throw Error('Taihemen A can only build its explicit isolated host');
 return retainedBuild(builder,parent,p);
}
export function assertWholeApproachSourceRatio(W){
 const root=W?.scene?.getObjectByName('太和门'),p=root?.userData.taihemenSouth;assert.ok(p,'Existing Taihemen approach missing');
 const ratio=p.width/48.06;assert.ok(ratio>=.35&&ratio<=.41,`Taihemen whole-approach source ratio unresolved: actual ${ratio},own-plan approximately ${303/813}; retaining A outer width cannot pass`);
 return{ratio,status:'WIDTH_CONTROL_ONLY_NOT_COMPLETE_FACILITIES_ACCEPTANCE'};
}
