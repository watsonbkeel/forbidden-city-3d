/** Explicit opt-in test driver for physical stair contacts. This never changes
 * production controller speeds, collision, rescue, or the original route driver.
 * New fast routes use sprint on straight runs and walk within2m of a corner/end.
 */
export const PHYSICAL_WAYPOINT_DRIVER = 'physical-crossing-v1';
export function createPhysicalWaypointDriver(points) {
  let index=1;
  const crossings=[];
  let brakingFrames=0;
  return {
    get index(){return index;},
    get complete(){return index>=points.length;},
    get diagnostics(){return {crossings:[...crossings],brakingFrames,endpointSettleSeconds:2};},
    command(position,sprint){
      let aim=index;
      while(aim+1<points.length) {
        const ax=points[aim][0]-points[aim-1][0],az=points[aim][1]-points[aim-1][1];
        const bx=points[aim+1][0]-points[aim][0],bz=points[aim+1][1]-points[aim][1];
        if((ax*bx+az*bz)/(Math.hypot(ax,az)*Math.hypot(bx,bz))<.999999)break;
        aim++;
      }
      const target=points[aim],canSprint=sprint&&Math.hypot(target[0]-position[0],target[1]-position[1])>2;
      if(sprint&&!canSprint)brakingFrames++;
      return {target,canSprint};
    },
    observe(before,after){
      let advanced=0;
      while(index<points.length) {
        const q=points[index],prev=points[index-1],lx=q[0]-prev[0],lz=q[1]-prev[1],len=Math.hypot(lx,lz),ux=lx/len,uz=lz/len;
        const a=(before[0]-q[0])*ux+(before[1]-q[1])*uz,b=(after[0]-q[0])*ux+(after[1]-q[1])*uz;
        const fraction=Math.max(0,Math.min(1,-a/(b-a))),hit=[before[0]+(after[0]-before[0])*fraction,before[1]+(after[1]-before[1])*fraction];
        const distance=Math.hypot(hit[0]-q[0],hit[1]-q[1]);
        if(!(a<=.01&&b>=-.01&&distance<.6))break;
        crossings.push({index,point:[...q],hit,lateralDistance:distance});
        index++;advanced++;
        // A frame can cross several collinear contacts, never a later turn.
        if(index<points.length) {
          const nx=points[index][0]-q[0],nz=points[index][1]-q[1];
          if((nx*ux+nz*uz)/Math.hypot(nx,nz)<.999999)break;
        }
      }
      return advanced;
    },
  };
}
