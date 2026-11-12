// Original generated V2 PNG single-petal interior; never a whole painted pedestal.
export const PETAL_SOURCES=Object.freeze({
 shakyamuni:Object.freeze({width:1024,height:1536,x0:478,y0:1024,x1:547,y1:1063,sha256:'b6e856029b1cc55d3222c866fe8448eddd91db5c6a9eeca7a1b97773ac077b5d'}),
 amitabha:Object.freeze({width:1024,height:1536,x0:480,y0:963,x1:549,y1:997,sha256:'a08421ad1f713b4bddcb2b8680e7b6d65ad8ad0ac6fb59aa513f93c68ce6101f'}),
 bhaisajyaguru:Object.freeze({width:1024,height:1536,x0:470,y0:905,x1:541,y1:936,sha256:'63682ce571b58b79d24bf4bcc1c238bdb9c6f34668ef8a0f5fb9bbe15c3ef50b'})
});
export const PETAL_SOURCE=PETAL_SOURCES.shakyamuni;
// Returns only new UV values. No geometry, texture or material allocation/disposal.
// Pixel-center mapping, original texture flipY convention; caller binds ONLY petal group.
export function preparePetalUV(geometry,subjectId='shakyamuni'){
 if(!Object.hasOwn(PETAL_SOURCES,subjectId))throw Error('allowlisted subject required');
 const p=geometry.attributes.position,old=geometry.attributes.uv,tiers=geometry.userData.tiers;
 if(tiers?.length!==8||old?.count!==p.count)throw Error('eight-tier geometry required');
 const uv=new Float32Array(old.array),r=PETAL_SOURCES[subjectId];
 for(const tier of tiers){if(tier.petals.length!==20)throw Error('twenty petals required');for(const leaf of tier.petals){
  const s=leaf.vertexStart,n=leaf.vertexCount;if(n!==20||s+n>p.count)throw Error('petal range');
  const angle=Math.atan2(p.getX(s),p.getZ(s)/.85),across=i=>p.getX(i)*Math.cos(angle)-p.getZ(i)/.85*Math.sin(angle);
  const values=Array.from({length:n},(_,j)=>across(s+j)),lo=Math.min(...values),hi=Math.max(...values),bottom=p.getY(s),top=p.getY(s+n-1);
  if(!(hi>lo&&top>bottom))throw Error('nondegenerate petal required');
  for(let j=0;j<n;j++){const i=s+j,u=(values[j]-lo)/(hi-lo),v=(p.getY(i)-bottom)/(top-bottom);uv[i*2]=(r.x0+.5+u*(r.x1-r.x0-1))/r.width;uv[i*2+1]=1-(r.y1-.5-v*(r.y1-r.y0-1))/r.height;}
 }}return uv;
}
