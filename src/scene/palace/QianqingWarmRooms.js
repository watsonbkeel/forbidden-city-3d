import {qianqingFrontageGrid} from './QianqingFrontageGrid.js';
import {qianqingDepthGrid} from './QianqingDepthGrid.js';
/** Closed simplified timber partitions, not a reconstructed furnishing scheme.
 * Exact panel subdivisions, thickness and closed poses are model choices.
 * No invented access, furniture or stair to the historically described xianlou.
 */
export function buildQianqingWarmRooms(b,g,{x0,z0,y,w,d,H,beamH}) {
  if(g.userData.qianqingWarmRooms)throw Error('Duplicate Qianqing warm-room boundaries');
  const f=qianqingFrontageGrid(w),depth=qianqingDepthGrid(d),h=H-beamH,t=.24;
  if([x0,z0,y,H,beamH].some(v=>!Number.isFinite(v))||h<=1.4)throw Error('Invalid Qianqing warm-room frame');
  const metadata={id:'qianqing-paired-warm-room-boundaries-r34',rooms:2,status:f.status,
    thickness:t,innerX:[f.openLeft,f.openRight],south:z0+depth.frontDoorZ,north:z0+depth.rearDoorZ,
    pose:'CLOSED_VIRTUAL_BOUNDARY_NOT_VERIFIED_PHOTOGRAPHED_POSE',
    scope:'Simplified timber boundaries only; no recreated private-room interior or xianlou access'};
  const panel=b.ownMat('qianqing_warm_room_panel',{color:0x653b2d,roughness:.86,metalness:.01});
  const inset=b.ownMat('qianqing_warm_room_inset',{color:0x352b25,roughness:.91,metalness:0});
  for(const xLocal of metadata.innerX){
    const x=x0+xLocal,sign=Math.sign(xLocal),stations=depth.z.slice(1,5).map(z=>z0+z);
    for(let k=0;k<stations.length-1;k++){
      const a=stations[k],c=stations[k+1],span=c-a;
      const mesh=b.box(g,panel,t,h,span,x,y+h/2,(a+c)/2);
      mesh.userData.qianqingWarmRoom={kind:'boundary-panel',sign,interval:k,status:f.status};
      // Shallow, opaque inset fields face the central hall. They suggest timber
      // infill without falsely copying a particular historical lattice pattern.
      const face=x-sign*(t/2+.012),clear=span-.30;
      b.box(g,inset,.025,h-1.35,clear,face,y+1.1+(h-1.35)/2,(a+c)/2);
      b.libBox(g,'wood_column',.30,.12,span,x,y+1.04,(a+c)/2,'box');
      for(const z of[a+.075,c-.075])b.libBox(g,'wood_column',.30,h,.15,x,y+h/2,z,'box');
    }
    b.libBox(g,'caihua_beam',.38,beamH,metadata.north-metadata.south,x,y+H-beamH/2,(metadata.south+metadata.north)/2,'band');
    b.col(x-t/2,y,metadata.south,x+t/2,y+H,metadata.north);
  }
  g.userData.qianqingWarmRooms=metadata;
  return metadata;
}
