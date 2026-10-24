import * as THREE from 'three';

/** Inherited model rectangle, not a surveyed riverbank. World -X is east.
 * The south strip is deliberately absent: its old rectangle covers the spawn.
 * Do not invent a bridge or shift the city to make that rectangle renderable. */
export function outerMoatProfile(item) {
  if (item?.type !== 'moat') throw new Error('Expected the explicit moat layout item');
  const {x,z,y}=item.position,{width,depth,riverWidth:w}=item.dimensions;
  if (![x,z,y,width,depth,w].every(Number.isFinite)||w<=0||width<=2*w||depth<=2*w) throw new Error('Invalid outer moat profile');
  const x0=x-width/2,x1=x+width/2,z0=z-depth/2,z1=z+depth/2,ix0=x0+w,ix1=x1-w,iz1=z1-w;
  const point=(x,z)=>({x,z});
  return {
    status:'MODEL_FIT_NOT_SURVEYED',south:'PENDING_NO_BRIDGE_OR_SPAWN_RELOCATION',waterY:y,bedY:y-1,bankTopY:0,
    strips:[{id:'north',minX:x0,maxX:x1,minZ:iz1,maxZ:z1},{id:'east',minX:x0,maxX:ix0,minZ:z0,maxZ:iz1},{id:'west',minX:ix1,maxX:x1,minZ:z0,maxZ:iz1}],
    contour:[[x0,z0],[x0,z1],[x1,z1],[x1,z0],[ix1,z0],[ix1,iz1],[ix0,iz1],[ix0,z0]],
    banks:[[point(x0,z0),point(x0,z1)],[point(x0,z1),point(x1,z1)],[point(x1,z1),point(x1,z0)],
      [point(ix0,z0),point(ix0,iz1)],[point(ix0,iz1),point(ix1,iz1)],[point(ix1,iz1),point(ix1,z0)]],
  };
}
export function outerMoatGroundPath(item) {
  const hole=new THREE.Path();
  for(const [i,[x,z]] of outerMoatProfile(item).contour.entries())hole[i?'lineTo':'moveTo'](x,-z);
  hole.closePath();return hole;
}
export function buildOuterMoat(library,item) {
  const p=outerMoatProfile(item),group=new THREE.Group();group.name='outer-moat-three-sides';group.userData.outerMoat=p;
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
