export const SHOUAN_ENTRY_REGION=Object.freeze({minX:255.02,maxX:298.78,minZ:357.8,maxZ:370.7});
export function validateShouanEntryScope(input,box,region){
 const lo=[Math.fround(277+Math.fround(-2.3)),0,Math.fround(362+Math.fround(-1.65))],hi=[Math.fround(277+Math.fround(2.3)),Math.fround(.36),Math.fround(362+Math.fround(1.65))];
 if(input.id!=='shouan-entry'||input.groundY!==undefined||Object.keys(SHOUAN_ENTRY_REGION).some(k=>region[k]!==SHOUAN_ENTRY_REGION[k])||box.min.toArray().some((v,i)=>v!==lo[i])||box.max.toArray().some((v,i)=>v!==hi[i]))throw new TypeError('Shouan entrance requires its exact visible central threshold and bounded source domain');
}
