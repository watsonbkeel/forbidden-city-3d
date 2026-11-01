import * as THREE from 'three';

/**
 * FC-A43B1DAB0B: Hongyi's own 1980[1024].jpg shows six paired lower windows.
 * Only the leaf framing is photo-fitted. The surveyed caller owns the bay
 * dimensions; the existing unresolved lattice spacing is retained, not newly
 * attributed to this photograph. No Tiren dimensions or interior are borrowed.
 * Replace the old frame/grid, keeping its external envelope and all colliders.
 */
export function buildHongyiLowerWindowLeaves(kit, window, {profile,bay,cx,clear,bottom,height,z}, box) {
  if(profile!=='hongyi')return [];
  const leaves=[],gap=.03,stile=.13,rail=.14;
  const outer=clear+.13,leafWidth=(outer-gap)/2;
  for(const side of [-1,1]) {
    const leaf=new THREE.Group();leaf.name='lower-window-leaf';
    leaf.userData={role:leaf.name,bay,side,objectId:'FC-A43B1DAB0B',status:'PHOTO_FIT',sourceImage:'1980[1024].jpg',captureDate:null,
      latticeStatus:'INHERITED_SIMPLIFICATION_NOT_NEWLY_VERIFIED',visualAcceptance:'VERIFY_PENDING'};
    window.add(leaf);leaves.push(leaf);
    const center=cx+side*(gap/2+leafWidth/2),innerWidth=leafWidth-2*stile;
    // Between-stile rails touch at their edges; no full old frame, center bar,
    // or full-width crossbar is hidden behind the new paired meeting stiles.
    for(const edge of [-1,1])box(leaf,'lower-window-leaf-stile','wood_column',stile,height+rail,.2,
      center+edge*(leafWidth-stile)/2,bottom+height/2,z,{edge:edge===-side?'meeting':'outer'});
    for(const y of [bottom,bottom+height])box(leaf,'lower-window-leaf-rail','wood_column',innerWidth,rail,.2,center,y,z);
    // Retain the twelve noncentral old straight-bar X coordinates exactly.
    // Shorten their ends to meet, not intersect, the new leaf rails.
    for(let j=side<0?1:8;j<=(side<0?6:13);j++)box(leaf,'lower-window-leaf-bar','wood_column',.045,height-rail,.08,
      cx-clear/2+j*clear/14,bottom+height/2,z-.04);
    for(const end of [-1,1])for(let j=0;j<3;j++)box(leaf,'lower-window-leaf-crossbar','wood_column',innerWidth,.045,.09,
      center,bottom+height/2+end*(height*.29+j*.1),z-.05);
  }
  return leaves;
}
