/** Geometric footprint coverage only: caller must separately authenticate live
 * surface ownership and height continuity. No floor/provider is created here.
 * Uses exact represented boundary events; no gap-bridging tolerance. */
function validate(rects,x,z,r){
 if(!Array.isArray(rects)||rects.length>64||!Array.from(rects).every(q=>q&&['minX','maxX','minZ','maxZ'].every(k=>Number.isFinite(q[k]))&&q.minX<q.maxX&&q.minZ<q.maxZ)||![x,z,r].every(Number.isFinite)||r<=0)throw TypeError('footprint requires finite closed rectangles and positive radius');
 if(![x-r,x+r,z-r,z+r].every(Number.isFinite)||!(x-r<x+r&&z-r<z+r))throw TypeError('footprint bounds overflow');
}
export function footprintCovered(rects,x,z,r){
 validate(rects,x,z,r);const x0=x-r,x1=x+r,z0=z-r,z1=z+r;
 if(rects.some(q=>q.minX<=x0&&q.maxX>=x1&&q.minZ<=z0&&q.maxZ>=z1))return true;
 const clipped=rects.filter(q=>q.minX<x1&&q.maxX>x0&&q.minZ<z1&&q.maxZ>z0);
 const cuts=[...new Set([x0,x1,...clipped.flatMap(q=>[Math.max(x0,q.minX),Math.min(x1,q.maxX)])])].sort((a,b)=>a-b);
 for(let i=1;i<cuts.length;i++){
  const a=cuts[i-1],b=cuts[i];if(a===b)continue;
  // A rectangle covers this entire open strip iff both strip bounds are in it.
  const bands=clipped.filter(q=>q.minX<=a&&q.maxX>=b).map(q=>[Math.max(z0,q.minZ),Math.min(z1,q.maxZ)]).sort((a,b)=>a[0]-b[0]);
  let end=z0;for(const [lo,hi] of bands){if(lo>end)return false;end=Math.max(end,hi);if(end>=z1)break;}if(end<z1)return false;
 }
 return cuts.length>=2;
}
export function pathFootprintCovered(rects,from,to,r){
 if(![from,to].every(p=>Array.isArray(p)&&p.length===2&&Array.from(p).every(Number.isFinite)))throw TypeError('footprint requires finite dense path endpoints');
 validate(rects,...from,r);validate(rects,...to,r);
 if(![to[0]-from[0],to[1]-from[1]].every(Number.isFinite))throw TypeError('footprint path delta overflow');
 if(!footprintCovered(rects,...from,r)||!footprintCovered(rects,...to,r))return false;
 if(rects.some(q=>[from,to].every(([x,z])=>x-r>=q.minX&&x+r<=q.maxX&&z-r>=q.minZ&&z+r<=q.maxZ)))return true;
 const dx=to[0]-from[0],dz=to[1]-from[1],events=[0,1];
 for(const q of rects)for(const [start,d,edges]of[[from[0],dx,[q.minX-r,q.minX+r,q.maxX-r,q.maxX+r]],[from[1],dz,[q.minZ-r,q.minZ+r,q.maxZ-r,q.maxZ+r]]])if(d!==0)for(const edge of edges){const t=(edge-start)/d;if(t>0&&t<1)events.push(t);}
 const ts=[...new Set(events)].sort((a,b)=>a-b);
 const at=t=>footprintCovered(rects,from[0]+dx*t,from[1]+dz*t,r);
 for(let i=0;i<ts.length;i++){if(!at(ts[i]))return false;if(i&& !at(ts[i-1]+(ts[i]-ts[i-1])/2))return false;}
 return true;
}
