/** The connected-courtyard topology is documented, but these inherited wing
 * positions are explicitly estimated. This is a coordinate fit, not a claim
 * that the official Tihe ear-room passages were in the Yikun wing gables. */
export const YIKUN_SIDE_ACCESS_FIT=Object.freeze({
 id:'west-six/yikun-side-access',profile:'yikun-side-access-fit-v1',
 previousWingZ:371.3,wingZ:367.3,setback:4,pavingY:.012,
 eastLaneX:78.8,westLaneX:109.2,frontTurnZ:374.05,rearTurnZ:392.5,
});
const near=(a,b)=>Number.isFinite(a)&&Math.abs(a-b)<1e-7;
export function yikunSideAccessGeometry(zone){
 const p=YIKUN_SIDE_ACCESS_FIT;
 if(zone.id!=='west-six'||zone.yikunAccessProfile!==p.profile)throw Error('Yikun side access requires its explicit west-six fitted profile');
 for(const[x,rot]of[[77.52,'west'],[110.48,'east']]){
  const i=zone.items?.find(i=>i.kind==='hall'&&near(i.x,x)&&near(i.z,p.wingZ));
  const expected={w:11.2,d:7.04,pad:.5,ph:.45,colH:5.44};
  if(!i||i.rot!==rot||i.roof!=='gable'||i.source!=='estimated'||Object.entries(expected).some(([k,v])=>!near(i[k],v))||i.positionFit?.profile!==p.profile||!near(i.positionFit?.previousZ,p.previousWingZ))throw Error('Yikun side access fitted wing mismatch');
 }
 const main=zone.items?.find(i=>i.name==='翊坤宫');
 if(!main||Object.entries({x:94,z:382.5,w:27.1,d:13.8,ph:.6}).some(([k,v])=>!near(main[k],v)))throw Error('Yikun side access retained main-hall mismatch');
 return{...p,positionStatus:'estimated-coordinate-correction',
  sources:['https://www.dpm.org.cn/explore/building/236517.html','https://www.dpm.org.cn/explore/building/236529.html','https://www.dpm.org.cn/explore/building/236486.html'],
  limitations:['Official converted ear-room passages belong to Tihe, not a verified opening in the Yikun main hall or southern wing gables.','The 4 m setback corrects inherited estimated wing coordinates; it is not an officially measured location.','All building dimensions, enclosure surfaces, door apertures, furniture and identities are retained. Paving is a reversible visual fit.'],
 };
}
export function buildYikunSideAccess(kit,zone){
 const g=yikunSideAccessGeometry(zone),f=kit.frame(0,0);f.name='yikun-side-access-fit';f.userData.structure=g;
 // Non-overlapping paved strips stay outside the unchanged main platform and
 // behind the newly fitted wing platform. The Tihe south steps remain exposed.
 const strips=[[77.95,84.85,373.6,374.8],[103.15,110.05,373.6,374.8],[77.95,79.65,374.8,391.65],[108.35,110.05,374.8,391.65],[77.95,110.05,391.65,393.35]];
 for(const[x0,x1,z0,z1]of strips){
  const m=kit.box(f,'stone_slab',x1-x0,g.pavingY,z1-z0,(x0+x1)/2,g.pavingY/2,(z0+z1)/2);
  m.name='yikun-fitted-side-alley-paving';m.userData.role=m.name;
  kit.walkBox(f,x0,z0,x1,z1,g.pavingY);
 }
 g.budget={triangles:60,meshes:5,materials:1,colliders:0,walkables:5};
 return{f,g};
}
