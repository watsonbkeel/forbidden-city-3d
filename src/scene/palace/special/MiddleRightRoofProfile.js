/** Own1665/1623 two-face footprint/column/ridge fit, not a shared roof style. */
export const MIDDLE_RIGHT_ROOF=Object.freeze({objectId:'FC-85E0528ECA',width:16.4,depth:6.4,baseY:7.05,eaveY:7.5,ridgeY:12.1,eaveHalfWidth:9.8,eaveHalfDepth:5.7,ridgeHalfWidth:6.75,thickness:.25,cornerLift:.6,cornerPlan:.1,chiwenHeight:.75,openSoffit:true});
export function middleRightRoofOptions(){return{type:'xieshan',width:16.4,depth:6.4,baseY:7.05,layers:1,brackets:true,middleRightRoof:MIDDLE_RIGHT_ROOF};}
export function validateMiddleRightRoof(opts){
 if(opts.middleRightRoof===undefined)return null;
 const p=MIDDLE_RIGHT_ROOF;
 if(opts.middleRightRoof!==p||opts.type!=='xieshan'||opts.width!==p.width||opts.depth!==p.depth||opts.baseY!==p.baseY||opts.layers!==1||opts.brackets!==true||opts.overhang!==undefined||opts.height!==undefined||opts._lift!==undefined||opts.walkingBeastProfile!==undefined||opts.wumenVerticalProfile!==undefined||opts.baoheInteriorOpening!==undefined||opts.jiaotaiCeilingOpening!==undefined||opts.hardGableEnd!==undefined)throw Error('Middle-right roof requires its exact own single-gate contract');
 return p;
}
