import {tianyiGroundExclusions} from '../palace/special/TianyiGate.js';

// These two old procedural lamps physically intersect Tianyi's photographed
// paired screens. No source establishes lamps here; retain all other ornaments.
export const TIANYI_LEGACY_LANTERN_EXCLUSIONS=Object.freeze([Object.freeze([-3.3,463.1]),Object.freeze([3.3,463.1])]);
export const isTianyiConflictingLegacyLantern=(x,z)=>TIANYI_LEGACY_LANTERN_EXCLUSIONS.some(p=>Math.abs(x-p[0])<1e-8&&Math.abs(z-p[1])<1e-8);

/** Exact 2D rectangle difference. No largest-fragment shortcut: every remaining
 * bed fragment survives; unchanged rectangles are returned without recomputing.
 * Tree sampling continues to consume the original beds, so no random reseeding.
 */
export function clipTianyiBedRectangle(rect){
  if(!Array.isArray(rect)||rect.length!==4||!rect.every(Number.isFinite)||rect[0]>=rect[1]||rect[2]>=rect[3])throw Error('Finite positive garden rectangle required');
  let pieces=[rect];
  for(const [A,B,C,D] of tianyiGroundExclusions())pieces=pieces.flatMap(r=>{
    const[a,b,c,d]=r,l=Math.max(a,A),h=Math.min(b,B),s=Math.max(c,C),n=Math.min(d,D);
    if(l>=h||s>=n)return[r];
    return[[a,l,c,d],[h,b,c,d],[l,h,c,s],[l,h,n,d]].filter(([x0,x1,z0,z1])=>x1-x0>1e-9&&z1-z0>1e-9);
  });
  return pieces;
}
