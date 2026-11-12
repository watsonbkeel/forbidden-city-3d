import {LEGACY_BLOCKED_ROUTES} from './view-spec.mjs';
// Retains the original 339-point query spacing and CSV fields. Uses live production CM, no owner removal.
export function queryLegacyBlocked({T,cm,PLAYER}){
 const rows=[];let failures=0;
 for(const [ri,plan]of LEGACY_BLOCKED_ROUTES.entries()){let previous;for(let leg=1;leg<plan.localPoints.length;leg++){const a=plan.localPoints[leg-1],b=plan.localPoints[leg],n=Math.ceil((Math.hypot(b[0]-a[0],b[1]-a[1])-1e-10)/.1);for(let j=leg===1?0:1;j<=n;j++){
 const x=a[0]+(b[0]-a[0])*j/n+221.9,z=a[1]+(b[1]-a[1])*j/n+241.1,ground=cm.getGroundHeight(x,z,.9,PLAYER.STEP_UP,.5),eye=new T.Vector3(x,ground+PLAYER.HEIGHT,z),body=cm.checkCollision(eye,.5),sweep=previous?cm.checkCollision(eye,.5,previous):body,floor=Math.abs(ground-.9)<.03,beyond=ground>.9+PLAYER.STEP_UP+1e-6;
 if(!Number.isFinite(ground)||Math.abs(ground)>9999)throw Error('legacy ground nonfinite/unbounded');if(previous&&Math.hypot(eye.x-previous.x,eye.z-previous.z)>.100000001)throw Error('legacy spacing changed');if(body||sweep||!floor||beyond)failures++;
 rows.push([ri,leg,j,n,x.toFixed(6),eye.y.toFixed(6),z.toFixed(6),ground.toFixed(6),+body,+sweep,+floor,+beyond].join(','));previous=eye;
 }}}
 if(rows.length!==339)throw Error('legacy sample count changed');return{scope:'LEGACY_339_BLOCKED_NEGATIVE_CONTROL_NOT_WALKABLE',samples:rows.length,failures,rows};
}
