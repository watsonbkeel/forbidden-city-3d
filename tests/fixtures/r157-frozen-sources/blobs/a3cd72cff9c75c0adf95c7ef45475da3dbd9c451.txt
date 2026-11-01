import * as THREE from 'three';
import {taihemenSouthProfile} from './TaihemenProfile.js';
import {buildTaihemenSouthKnees} from './TaihemenSouthKnees.js';

/** Replaces ONLY the south eave envelope and south threshold in buildHall.
 * Caller must skip the generic south loop including its old two broad AABBs.
 * Does not add/move columns, floor support, roof, nameboard or north geometry.
 */
export function buildTaihemenSouthEnclosure(builder, parent, {x0,z0,y,w,d,H,beamH,r}) {
  const p=taihemenSouthProfile({width:w,depth:d}), bayW=w/p.frontageBays;
  if (![x0,z0,y,H,beamH,r].every(Number.isFinite) || H<=3 || beamH<=0 || beamH>=H/2 || r<=0 || r>=bayW/3)
    throw Error('Taihemen enclosure requires finite retained body dimensions');
  const doorH=(H-beamH)*.8, headerH=H-beamH-doorH;
  const group=new THREE.Group();group.name=p.id;
  group.userData.structure={id:'axis/taihemen-south-open-veranda',entityId:p.entityId,
    stage:'PARTIAL_PHOTO_TOPOLOGY_FIT_VERIFY_PENDING',profile:p};
  buildTaihemenSouthKnees(builder, group, {x0,z0,y,w,d,H,beamH,r});
  parent.add(group);parent.userData.taihemenSouthEnclosure=p;
  const eaveZ=z0+p.southEaveZ, innerZ=z0+p.innerEnclosureZ;
  const add=(role,bay,material,width,height,depth,x,cy,z,solid=false)=>{
    const m=builder.libBox(group,material,width,height,depth,x,cy,z,'band');
    m.name=`${p.id}:${role}${bay===null?'':`:${bay}`}`;
    m.userData.taihemenEnclosure={role,bay};
    if(solid)builder.col(x-width/2,cy-height/2,z-depth/2,x+width/2,cy+height/2,z+depth/2);
    return m;
  };

  // Seven porch mouths are genuinely empty; no folded leaves at this plane.
  for(const bay of p.southClosedBayIndices) {
    const x=x0-w/2+(bay+.5)*bayW;
    add('eave-end-infill',bay,'lattice_doors',bayW-2*r,doorH,.15,x,y+doorH/2,eaveZ,true);
    add('eave-end-header',bay,'wall_red',bayW,headerH,.3,x,y+doorH+headerH/2,eaveZ);
  }
  add('retained-south-eave-beam',null,'caihua_beam',w+.6,beamH,.6,x0,y+H-beamH/2,eaveZ);

  // Visible recession is supported; this inherited row/leaf pattern remains a
  // reversible placeholder. It is not evidence of the real door count/pose.
  for(let bay=0;bay<p.frontageBays;bay++) {
    const x=x0-w/2+(bay+.5)*bayW;
    if(p.retainedInnerOpenBayIndices.includes(bay)) {
      for(const side of [-1,1]) {
        const leafX=x+side*(bayW/2-r-.1), leafZ=innerZ+bayW*.13+.2, leafW=bayW*.25;
        const m=add('inner-retained-open-leaf',bay,'lattice_doors',leafW,doorH,.12,leafX,y+doorH/2,leafZ);
        m.rotation.y=Math.PI/2;
        // Match the actual rotated leaf rather than blocking its open bay.
        builder.col(leafX-.06,y,leafZ-leafW/2,leafX+.06,y+doorH,leafZ+leafW/2);
      }
    } else add('inner-retained-infill',bay,'lattice_doors',bayW-2*r,doorH,.15,x,y+doorH/2,innerZ,true);
  }
  add('inner-retained-header',null,'wall_red',w,headerH,.3,x0,y+doorH+headerH/2,innerZ);
  add('inner-retained-beam',null,'caihua_beam',w+.6,beamH,.6,x0,y+H-beamH/2,innerZ);
  add('inner-threshold',null,'wood_column',3*bayW,.25,.3,x0,y+.125,innerZ);
  return p;
}
