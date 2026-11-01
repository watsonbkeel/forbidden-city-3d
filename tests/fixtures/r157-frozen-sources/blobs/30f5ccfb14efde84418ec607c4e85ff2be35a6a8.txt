/** Main-tower horizontal reconstruction only. Diagram registration is not a
 * survey; the existing equally divided transverse grid is deliberately retained.
 * Reference photos/PDFs remain external and are never runtime assets. */
export function wumenMainGrid({width,depth,bays,wallAxisZ,enclosureWidth}) {
  const xAxes=Array.from({length:bays+1},(_,i)=>-width/2+i/bays*width);
  const innerAxis=3.2;
  const depthAxes=[-depth/2,-wallAxisZ,-innerAxis,innerAxis,wallAxisZ,depth/2];
  const facadeBays=[];
  for(const [side,sign] of [['north',1],['south',-1]])for(let i=0;i<bays;i++){
    facadeBays.push({id:`wumen-main-${side}-bay-${i+1}`,side,sign,index:i,
      minX:Math.max(-enclosureWidth/2,xAxes[i]),maxX:Math.min(enclosureWidth/2,xAxes[i+1]),
      open:i===4,leafCount:'UNKNOWN',type:'LATTICE_FAMILY_PHOTO_SUPPORTED_EXACT_DOOR_WINDOW_TYPE_UNKNOWN',
      operation:i===4?'RETAINED_CENTRAL_ARCHITECTURAL_PREVIEW':'CLOSED_UNVERIFIED'});
  }
  return {xAxes,depthAxes,facadeBays,metadata:{
    depthBays:5,depthAxes,widthBaySpacing:'RETAINED_EQUAL_DIVISION_NOT_SURVEYED',
    status:'SIX_DEPTH_AXES_SOURCE_REGISTERED_NOT_SURVEYED',completeTimberFrame:false,
    enclosureColumnVisibility:'OCCLUDED_BY_RETAINED_WALL_THICKNESS_NOT_FULL_VISUAL_RECONSTRUCTION',
    omitted:'Concealed intermediate gable columns and full-height timber/joinery are not reconstructed.',
    innerAxis:{value:innerAxis,modelUncertainty:.3,endpoints:'centre axis to inner main-column axis',
      registration:'2005 p114 section: outer axes ~67/501 and inner axes ~229/340 in the private section crop; 434 px registered to 25 m gives ~3.20 m. p124 plan and 2021 plan confirm six-row topology.',
      sources:['https://img.dpm.org.cn/Uploads/pdf/4884/T00114_00.pdf','https://img.dpm.org.cn/Uploads/pdf/4884/T00124_00.pdf','https://www.dpm.org.cn/Uploads/File/2021/11/23/u619c5a27422d3.pdf']},
    facade:{sources:['https://img.dpm.org.cn/Uploads/Picture/2019/12/31/s5e0aaffe2cc85.jpg','https://img.dpm.org.cn/Uploads/Picture/2019/12/31/s5e0ad0346e8b3.jpg'],
      adoption:'Nine independently framed bays per face; retained central preview doors only. Exact leaf counts, door/window distinction and current opening state remain unknown.',
      bayNumbering:'increasing model X (geographic east to west)',frameInset:.12,status:'PHOTO_BOUNDED_BAY_DIVISION_NOT_LEAF_RECONSTRUCTION'},
  }};
}
