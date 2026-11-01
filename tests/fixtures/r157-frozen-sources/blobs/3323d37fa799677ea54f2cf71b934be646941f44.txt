import * as THREE from 'three';

/**
 * Tiren's six photographed lower-front window bays, two separate straight-
 * lattice sashes per bay. 1534[1024].jpg, capture date unstated. The survey
 * supplies the bay grid, not these fitted sash sections or lattice spacing.
 * Replace the old window's frame/grid, never layer it behind the new pair.
 * All caller materials, outer bounds, sill, room and collision records survive.
 */
export function buildTirenLowerWindowLeaves(kit, window, {profile,bay,cx,clear,bottom,height,z}, box) {
  if(profile!=='tiren')return [];
  const leaves=[],gap=.03,stile=.13,rail=.14;
  const outer=clear+.13,leafW=(outer-gap)/2;
  for(const side of [-1,1]) {
    const leaf=new THREE.Group();leaf.name='lower-window-leaf';
    leaf.userData={role:leaf.name,bay,side,status:'PHOTO_FIT',sourceImage:'1534[1024].jpg',captureDate:null,visualAcceptance:'VERIFY_PENDING'};
    window.add(leaf);leaves.push(leaf);
    const center=cx+side*(gap/2+leafW/2),innerW=leafW-2*stile;
    // Full-height stiles and between-stile rails meet at edges rather than
    // hiding complete old frames or long lattice bars beneath another layer.
    for(const edge of [-1,1])box(leaf,'lower-window-leaf-stile','wood_column',stile,height+rail,.2,center+edge*(leafW-stile)/2,bottom+height/2,z,{edge:edge===-side?'meeting':'outer'});
    for(const y of [bottom,bottom+height])box(leaf,'lower-window-leaf-rail','wood_column',innerW,rail,.2,center,y,z);
    for(let j=1;j<=6;j++)box(leaf,'lower-window-leaf-bar','wood_column',.045,height-rail,.08,center-innerW/2+j*innerW/7,bottom+height/2,z-.04);
    for(const end of [-1,1])for(let j=0;j<3;j++)box(leaf,'lower-window-leaf-crossbar','wood_column',innerW,.045,.09,center,bottom+height/2+end*(height*.29+j*.1),z-.05);
  }
  return leaves;
}
