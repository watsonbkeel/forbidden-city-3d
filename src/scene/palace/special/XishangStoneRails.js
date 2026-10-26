/** Photo-backed solid stone-panel form within the previous two side-rail envelopes.
 * Dimensions and four-panel subdivision are model fits, not surveyed carvings.
 * No front/rear railing, new walkable, or generic rail behavior is introduced. */
export function buildXishangStoneRails(c,{mainW,mainD}) {
  const postWidth=.14,halfThickness=.04,top=.9;
  const solid=(role,w,h,d,x,y,z)=>{
    const mesh=c.box(role,'stone',w,h,d,x,y,z,false);
    // Use actual Float32 box vertices, not a separately rounded ideal box.
    mesh.geometry.computeBoundingBox();const b=mesh.geometry.boundingBox;
    c.kit.col(c.f,x+b.min.x,y+b.min.y,z+b.min.z,x+b.max.x,y+b.max.y,z+b.max.z);
    mesh.userData.sourceFit='OFFICIAL_SOLID_PANEL_FORM_DIMENSIONS_UNSURVEYED';
    return mesh;
  };
  const ends=mainD/2-.035,centers=Array.from({length:5},(_,i)=>-ends+2*ends*i/4);
  for(const sign of[-1,1]){
    const x=sign*mainW/2;
    // The original uninterrupted upper rail prevents a new high-post/low-cap landing seam.
    solid('bamboo-stone-cap',.08,.065,mainD,x,c.p.ph+.88,0);
    for(const z of centers)solid('bamboo-stone-post',halfThickness*2,top,postWidth,x,c.p.ph+top/2,z);
    for(let i=0;i<4;i++){
      const a=centers[i]+postWidth/2,b=centers[i+1]-postWidth/2,z=(a+b)/2,width=b-a;
      solid('bamboo-stone-panel',.056,.74,width,x,c.p.ph+.49,z);
      solid('bamboo-stone-base',.08,.12,width,x,c.p.ph+.06,z);
    }
  }
  return{status:'PHOTO_BACKED_SOLID_PANEL_FORM_MODEL_FIT',sides:2,panelsPerSide:4,postsPerSide:5,outerThickness:.08,topAbovePlatform:.88+Math.fround(.065/2),topPolicy:'RETAINED_CONTINUOUS_UPPER_RAIL_NO_RAISED_POST_STEP',carving:'DETAILED_BAMBOO_RELIEF_NOT_REPRODUCED',scope:'EXISTING_TWO_SIDE_SPANS_ONLY'};
}
