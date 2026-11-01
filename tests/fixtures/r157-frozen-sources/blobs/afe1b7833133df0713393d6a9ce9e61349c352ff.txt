import {validateShoukangPerimeterScope} from './ShoukangRetainedPerimeterSupport.js';
export const SHOUKANG_ENTRY_REGION=Object.freeze({minX:267.63,maxX:310.77,minZ:189.5,maxZ:198.5});
export function validateShoukangEntryScope(input,box,region){
 if(input.id!=='shoukang-entry')return validateShoukangPerimeterScope(input,box,region);
 const lo=[Math.fround(288.6+Math.fround(-3.3)),0,Math.fround(193.9+Math.fround(-1.65))],hi=[Math.fround(288.6+Math.fround(3.3)),Math.fround(.1),Math.fround(193.9+Math.fround(1.65))];
 if(input.id!=='shoukang-entry'||input.groundY!==undefined||Object.keys(SHOUKANG_ENTRY_REGION).some(k=>region[k]!==SHOUKANG_ENTRY_REGION[k])||box.min.toArray().some((v,i)=>v!==lo[i])||box.max.toArray().some((v,i)=>v!==hi[i]))throw new TypeError('Shoukang entrance requires its exact visible central threshold and bounded source domain');
}
