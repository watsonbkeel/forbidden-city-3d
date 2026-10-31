// Only the pre-R59 local Arrow host is historical. Its existing repository
// fixture is SHA checked by arrowBaselineSource; current CourtKit + unchanged
// knee builder still must satisfy the original exact mesh/physics golden.
// This is NOT a frozen whole-world dependency closure or a live entry test.
import {arrowBaselineSource} from './r59-arrow-baseline.mjs';
const location=new URL('../../src/scene/palace/special/EnclosedPavilions.js',import.meta.url);
const source=arrowBaselineSource().replace(/from\s+(['"])([^'"]+)\1/g,(_,q,id)=>`from ${q}${id==='three'?import.meta.resolve('three'):new URL(id,location).href}${q}`);
export const {buildEnclosedPavilion:buildHistoricalArrowHost}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
