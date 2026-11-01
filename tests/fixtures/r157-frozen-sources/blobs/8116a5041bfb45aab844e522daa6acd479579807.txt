import * as THREE from 'three';

/** Reversible engineering passage, not a measured bridge or restoration.
 * World -X is east. All water consumers derive from this profile. */
export const OUTER_MOAT_DRY_HALF_WIDTH = 100;
const profileCache = new WeakMap();
export function outerMoatProfile(item) {
  if (item?.type !== 'moat') throw new Error('Expected the explicit moat layout item');
  const {x,z,y}=item.position,{width,depth,riverWidth:w}=item.dimensions;
  if (![x,z,y,width,depth,w].every(Number.isFinite)||w<=0||width<=2*w||depth<=2*w) throw new Error('Invalid outer moat profile');
  const key=[x,z,y,width,depth,w,OUTER_MOAT_DRY_HALF_WIDTH].join('|');
  const cached=profileCache.get(item);if(cached?.key===key)return cached.profile;
  const x0=x-width/2,x1=x+width/2,z0=z-depth/2,z1=z+depth/2,ix0=x0+w,ix1=x1-w,iz0=z0+w,iz1=z1-w,c=OUTER_MOAT_DRY_HALF_WIDTH;
  if(ix0>=-c||ix1<=c)throw new Error('Moat does not leave room for the engineering passage');
  const contour=[[x0,z0],[x0,z1],[x1,z1],[x1,z0],[c,z0],[c,iz0],[ix1,iz0],[ix1,iz1],[ix0,iz1],[ix0,iz0],[-c,iz0],[-c,z0]];
  const profile = {
    status:'MODEL_FIT_NOT_SURVEYED',south:'TWO_ARMS_WITH_ENGINEERING_DRY_PASSAGE',dryHalfWidth:c,waterY:y,bedY:y-1,bankTopY:0,
    strips:[{id:'north',minX:x0,maxX:x1,minZ:iz1,maxZ:z1},{id:'east',minX:x0,maxX:ix0,minZ:z0,maxZ:iz1},{id:'west',minX:ix1,maxX:x1,minZ:z0,maxZ:iz1},
      {id:'south-east',minX:ix0,maxX:-c,minZ:z0,maxZ:iz0},{id:'south-west',minX:c,maxX:ix1,minZ:z0,maxZ:iz0}],
    contour,banks:contour.map(([x,z],i)=>{const [bx,bz]=contour[(i+1)%contour.length];return[{x,z},{x:bx,z:bz}];}),
  };
  profileCache.set(item,{key,profile});return profile;
}
/** Circle-vs-water footprint; touching water is unsafe. Target validation uses this predicate; ordinary movement additionally uses
 * the exact segment sweep below. */
export function canCrossOuterMoat(item,position,radius=.5) {
  const {x,z}=position??{};
  if(![x,z,radius].every(Number.isFinite)||radius<0)throw new Error('Finite moat position and nonnegative radius required');
  return outerMoatProfile(item).strips.every(s=>{
    const dx=Math.max(s.minX-x,0,x-s.maxX),dz=Math.max(s.minZ-z,0,z-s.maxZ);
    return Math.hypot(dx,dz)>radius+1e-9;
  });
}
/** Exact swept circle-vs-axis-aligned-water rectangle distance, avoiding
 * corner clipping between short endpoint-safe movement substeps. */
export function canTraverseOuterMoat(item,from,to,radius=.5) {
  const ax=from?.x,az=from?.z,bx=to?.x,bz=to?.z;
  if(![ax,az,bx,bz,radius].every(Number.isFinite)||radius<0)throw new Error('Finite moat segment and nonnegative radius required');
  const dx=bx-ax,dz=bz-az,length2=dx*dx+dz*dz;
  const pointDistance=(x,z,s)=>Math.hypot(Math.max(s.minX-x,0,x-s.maxX),Math.max(s.minZ-z,0,z-s.maxZ));
  return outerMoatProfile(item).strips.every(s=>{
    // Slab intersection catches segment interiors passing through a rectangle.
    let lo=0,hi=1,intersects=true;
    for(const [a,d,min,max]of[[ax,dx,s.minX,s.maxX],[az,dz,s.minZ,s.maxZ]]) {
      if(Math.abs(d)<1e-15){if(a<min||a>max){intersects=false;break;}}
      else {const u=(min-a)/d,v=(max-a)/d;lo=Math.max(lo,Math.min(u,v));hi=Math.min(hi,Math.max(u,v));if(lo>hi){intersects=false;break;}}
    }
    if(intersects)return false;
    let distance=Math.min(pointDistance(ax,az,s),pointDistance(bx,bz,s));
    for(const [x,z]of[[s.minX,s.minZ],[s.minX,s.maxZ],[s.maxX,s.minZ],[s.maxX,s.maxZ]]) {
      const t=length2?Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/length2)):0;
      distance=Math.min(distance,Math.hypot(x-ax-t*dx,z-az-t*dz));
    }
    return distance>radius+1e-9;
  });
}
export function outerMoatGroundPath(item) {
  const hole=new THREE.Path();
  for(const [i,[x,z]] of outerMoatProfile(item).contour.entries())hole[i?'lineTo':'moveTo'](x,-z);
  hole.closePath();return hole;
}
export function buildOuterMoat(library,item) {
  const p=outerMoatProfile(item),group=new THREE.Group();group.name='outer-moat-five-segments';group.userData.outerMoat=p;
  const waterMaterial=new THREE.MeshStandardMaterial({color:0x547f86,roughness:.34,metalness:.08});
  const stone=library.material('stone_slab',{roughness:.95,metalness:0});
  const bankMaterial=stone.clone();bankMaterial.side=THREE.DoubleSide;
  for(const strip of p.strips) {
    for(const [kind,y,material]of[['water',p.waterY,waterMaterial],['bed',p.bedY,stone]]) {
      const geometry=new THREE.PlaneGeometry(strip.maxX-strip.minX,strip.maxZ-strip.minZ);geometry.rotateX(-Math.PI/2);
      const mesh=new THREE.Mesh(geometry,material);mesh.name=`moat-${kind}:${strip.id}`;mesh.position.set((strip.minX+strip.maxX)/2,y,(strip.minZ+strip.maxZ)/2);mesh.receiveShadow=true;
      if(kind==='water')mesh.userData.isWater=true;group.add(mesh);
    }
  }
  for(const [i,[a,b]]of p.banks.entries()) {
    // Separate axis-aligned faces avoid a diagonal bounding box over dry land.
    const length=Math.hypot(b.x-a.x,b.z-a.z),geometry=new THREE.PlaneGeometry(length,p.bankTopY-p.bedY);
    const mesh=new THREE.Mesh(geometry,bankMaterial);mesh.name=`moat-bank:${i}`;mesh.position.set((a.x+b.x)/2,(p.bankTopY+p.bedY)/2,(a.z+b.z)/2);
    mesh.rotation.y=-Math.atan2(b.z-a.z,b.x-a.x);mesh.receiveShadow=true;
    group.add(mesh);
  }
  return group;
}
