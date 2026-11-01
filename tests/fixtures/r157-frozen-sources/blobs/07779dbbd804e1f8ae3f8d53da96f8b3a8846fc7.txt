// Model circulation fit, not a surveyed historic path. Preserve the original
// sampling beds/paths so the existing 34 procedural trees cannot be reseeded.
export const EAST_WELL_GROUND_CUT=Object.freeze([-52.4,-44.4,455.8,463.8]);
export function clipEastWellBedRectangle(rect){
 if(!Array.isArray(rect)||rect.length!==4||!rect.every(Number.isFinite)||rect[0]>=rect[1]||rect[2]>=rect[3])throw Error('Finite positive garden rectangle required');
 const[a,b,c,d]=rect,[A,B,C,D]=EAST_WELL_GROUND_CUT,l=Math.max(a,A),h=Math.min(b,B),s=Math.max(c,C),n=Math.min(d,D);
 if(l>=h||s>=n)return[rect];
 return[[a,l,c,d],[h,b,c,d],[l,h,c,s],[l,h,n,d]].filter(([x0,x1,z0,z1])=>x1-x0>1e-9&&z1-z0>1e-9);
}
