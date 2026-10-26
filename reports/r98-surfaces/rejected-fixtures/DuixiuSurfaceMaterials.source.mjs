import {buildDuixiuOuterRock} from './DuixiuOuterRock.js';

// R98 opt-in visual trial only. No vertex positions, normals, support or body changes.
export function buildDuixiuSurfaceMaterials(options){
 const b=buildDuixiuOuterRock(options),[cx,,cz]=b.profile.center,f=Math.fround,counts={platformLeft:0,platformRight:0,routeLeft:0,routeRight:0,rear:0};
 for(const g of b.geometries){
  if(g.userData.naturalOwner)continue;
  const p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv,c=g.attributes.color;
  for(let i=0;i<p.count;i+=3){
   if(n.getY(i)!==0)continue;
   const x=p.getX(i),z=p.getZ(i);let region=null;
   const minZ=Math.min(p.getZ(i),p.getZ(i+1),p.getZ(i+2)),maxZ=Math.max(p.getZ(i),p.getZ(i+1),p.getZ(i+2));
   for(const sign of[-1,1])if(n.getX(i)===sign&&p.getX(i+1)===x&&p.getX(i+2)===x){
    if([f(cx+sign*4.5),f(cx+sign*4.6)].includes(x)&&minZ>=f(cz-4.6)&&maxZ<=f(cz+4.6))region=sign<0?'platformLeft':'platformRight';
    if(x===f(cx+sign*11.5)&&minZ>=f(cz-3)&&maxZ<=f(cz+3))region=sign<0?'routeLeft':'routeRight';
   }
   if(n.getZ(i)===1&&p.getZ(i+1)===z&&p.getZ(i+2)===z&&z===f(cz+4.6)&&Math.min(p.getX(i),p.getX(i+1),p.getX(i+2))>=f(cx-4)&&Math.max(p.getX(i),p.getX(i+1),p.getX(i+2))<=f(cx+4))region='rear';
   if(!region)continue;counts[region]++;
   for(let j=i;j<i+3;j++){
    // Larger physical albedo scale; continuous world-coordinate color, not per-cell alternating bands.
    uv.setXY(j,uv.getX(j)*.5,uv.getY(j)*.5);
    const horizontal=n.getZ(i)===1?p.getX(j)-cx:p.getZ(j)-cz,y=p.getY(j),tone=.72+.025*Math.sin(horizontal*.63+y*.21)+.018*Math.cos(horizontal*.19-y*.47);
    c.setXYZ(j,tone,tone*.985,tone*.94);
   }
  }
 }
 b.profile={...b.profile,surfaceMaterials:{status:'ONE_OPT_IN_MATERIAL_TRIAL_NOT_PRODUCTION',counts,triangles:Object.values(counts).reduce((a,b)=>a+b,0),scope:'only selected real vertical retained platform/route/rear faces; silhouette and physics unchanged'}};
 return b;
}
