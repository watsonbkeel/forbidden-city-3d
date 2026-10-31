const length=(a,b)=>Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2]);
const positive=v=>Number.isFinite(v)&&v>0;
const angleDelta=(a,b)=>Math.atan2(Math.sin(b-a),Math.cos(b-a));
/** Pure arc-length state: reload/LOD resume on the same caller-owned clock. */
export class PatrolController{
 constructor({path,adapter=null,speedMetersPerSecond=.75,pauseSeconds=3,followerSpacingMeters=1.4,formationSize=path?.formationSize??3}={}){
  if(adapter&&path?.status!=='ready')path=adapter.validatePath(path);
  if(path?.status!=='ready'||!Array.isArray(path.points)||path.points.length<2)throw new Error(path?.reason??'A ready, validated path is required');
  if(!positive(speedMetersPerSecond)||!Number.isFinite(pauseSeconds)||pauseSeconds<0||!positive(followerSpacingMeters))throw new Error('Invalid patrol timing');
  this.path=path;this.points=path.points.map(p=>[...p]);this.cumulative=[0];for(let i=1;i<this.points.length;i++)this.cumulative.push(this.cumulative.at(-1)+length(this.points[i-1],this.points[i]));this.lengthMeters=this.cumulative.at(-1);if(!positive(this.lengthMeters))throw new Error('Nonzero path length required');
  if(!Number.isInteger(formationSize)||formationSize<1)throw new Error('Positive formation size required');this.formationSize=formationSize;this.formationLengthMeters=(formationSize-1)*followerSpacingMeters;if(this.formationLengthMeters>=this.lengthMeters)throw new Error('Route too short for formation');this.speed=speedMetersPerSecond;this.pause=pauseSeconds;this.spacing=followerSpacingMeters;this.travelSeconds=(this.lengthMeters-this.formationLengthMeters)/this.speed;this.cycleSeconds=2*(this.travelSeconds+this.pause);this.disposed=false;
 }
 atDistance(distance){let i=1;const d=Math.max(0,Math.min(this.lengthMeters,distance));while(i<this.cumulative.length-1&&this.cumulative[i]<d)i++;const a=this.points[i-1],b=this.points[i],span=this.cumulative[i]-this.cumulative[i-1],t=span?(d-this.cumulative[i-1])/span:0;return{position:a.map((v,k)=>v+(b[k]-v)*t),rotationYRad:Math.atan2(b[0]-a[0],b[2]-a[2]),segmentIndex:i-1};}
 sample(simulationSeconds,followerIndex=0){
  if(!Number.isFinite(simulationSeconds)||simulationSeconds<0||!Number.isInteger(followerIndex)||followerIndex<0)throw new Error('Finite time and nonnegative follower index required');
  if(followerIndex>=this.formationSize)throw new Error('Follower index exceeds formation size');
  // All members keep their arc-distance ordering while the group turns in
  // place. Return travel swaps the front/back roles, never crosses members or
  // queues delayed followers on the same endpoint. No world-space offsets.
  const t=simulationSeconds%this.cycleSeconds;
  let d,direction=1,moving=true,turn=0,stage='outbound';
  if(t<this.travelSeconds)d=this.formationLengthMeters+t*this.speed;
  else if(t<this.travelSeconds+this.pause){d=this.lengthMeters;moving=false;turn=(t-this.travelSeconds)/Math.max(this.pause,1e-9);stage='far-turn';}
  else if(t<2*this.travelSeconds+this.pause){d=this.lengthMeters-(t-this.travelSeconds-this.pause)*this.speed;direction=-1;stage='return';}
  else {d=this.formationLengthMeters;direction=-1;moving=false;turn=(t-2*this.travelSeconds-this.pause)/Math.max(this.pause,1e-9);stage='near-turn';}
  d-=followerIndex*this.spacing;
  const s=this.atDistance(d);let heading=s.rotationYRad+(direction<0?Math.PI:0);
  if(!moving)heading+=Math.PI*turn;
  // Blend tangent in a narrow validated corner window; position never leaves
  // the polyline. Endpoint turning occurs entirely in the checked end disc.
  if(moving){const look=this.atDistance(Math.max(0,Math.min(this.lengthMeters,d+direction*.22)));const prev=this.atDistance(Math.max(0,Math.min(this.lengthMeters,d-direction*.22)));const tangent=Math.atan2(look.position[0]-prev.position[0],look.position[2]-prev.position[2]);if(Math.hypot(look.position[0]-prev.position[0],look.position[2]-prev.position[2])>1e-8)heading+=angleDelta(heading,tangent);}
  return{status:'ready',pathRef:this.path.id,position:s.position,rotationYRad:heading,distanceMeters:d,direction,moving,speedMetersPerSecond:moving?this.speed:0,speed:moving?this.speed:0,stage,walkPhaseRadians:d/.62*Math.PI*2,simulationSeconds};
 }
 update(simulationSeconds,index=0){return this.disposed?null:this.sample(simulationSeconds,index);}
 dispose(){this.disposed=true;}
}
