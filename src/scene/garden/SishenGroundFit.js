import {WEST_WELL_GROUND_CUT} from './WestWellGroundFit.js';
// Local visible circulation fit, never an assertion of historical paving.
// Original sampling paths/beds and random consumption are unchanged.
export const SISHEN_GROUND_CUT=Object.freeze([22.9,35.4,457.7,470.5]);
export const SISHEN_FOOTPRINT_EXCLUSION=Object.freeze([26.974,33.626,460.474,469.8]);
function subtract(rect,cut){const[a,b,c,d]=rect,[A,B,C,D]=cut,l=Math.max(a,A),h=Math.min(b,B),s=Math.max(c,C),n=Math.min(d,D);if(l>=h||s>=n)return[rect];return[[a,l,c,d],[h,b,c,d],[l,h,c,s],[l,h,n,d]].filter(([a,b,c,d])=>b-a>1e-9&&d-c>1e-9);}
export function clipSishenBedRectangle(rect){if(!Array.isArray(rect)||rect.length!==4||!rect.every(Number.isFinite)||rect[0]>=rect[1]||rect[2]>=rect[3])throw Error('Finite positive garden rectangle required');return subtract(rect,SISHEN_GROUND_CUT);}
export function sishenPavingRectangles(){return subtract([...SISHEN_GROUND_CUT],WEST_WELL_GROUND_CUT).flatMap(r=>subtract(r,SISHEN_FOOTPRINT_EXCLUSION));}
