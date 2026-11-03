const centralId=/^three-halls\/central-stone:baohe-(?:plinth|north-[123])$/;
const innerId=/^three-halls\/baohe-(?:individual-north-plinth|north-separated-approaches:[123]):inner:-?1$/;
const sameSlope=(a,b)=>a?.axis==='z'&&b?.axis==='z'
  &&['a0','a1','y0','y1','minZ','maxZ'].every(k=>Math.abs(a[k]-b[k])<1e-8);

/** A body may straddle the real seam between Baohe's stone and an inner stair.
 * Share only their cross-axis clearance, not their support records or heights.
 * The caller still validates the complete authored assembly, path coverage and
 * swept body collision. Outer stairs and every other contact retain old rules.
 */
export function centralStoneCrossBounds(active,ramps) {
  const central=ramps.find(r=>centralId.test(r.bPrincipalStairId)&&sameSlope(active,r));
  if(!central||!(active===central||innerId.test(active.bPrincipalStairId)))return null;
  const rows=ramps.filter(r=>(r===central||innerId.test(r.bPrincipalStairId))&&sameSlope(central,r));
  let lo=central.minX,hi=central.maxX;
  for(const r of rows)if(r.minX<=hi+1e-8&&r.maxX>=lo-1e-8){lo=Math.min(lo,r.minX);hi=Math.max(hi,r.maxX);}
  return active.minX>=lo-1e-8&&active.maxX<=hi+1e-8?[lo,hi]:null;
}
