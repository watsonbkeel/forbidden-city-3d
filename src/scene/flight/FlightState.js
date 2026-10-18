/** Arcade sightseeing state. Metres/seconds, NOT aviation simulation. */
export const FLIGHT_RULES=Object.freeze({radius:5.7,maximumAltitude:180,cruiseAltitude:100,speed:24,verticalSpeed:9,yawSpeed:1.2,idleMs:300000});
export const HELICOPTER_HOME=Object.freeze({x:18,y:0,z:-494});
export const TOUR_ROUTE=Object.freeze([
  {name:'午门',x:0,z:-390},{name:'三大殿',x:0,z:120},{name:'后三宫',x:0,z:390},
  {name:'御花园',x:0,z:505},{name:'东北角楼',x:-390,z:575},
  {name:'东侧宫墙',x:-395,z:-385},{name:'午门外',x:18,z:-494},
]);
export const LANDING_CHOICES=Object.freeze([
  {id:'wumen',name:'午门外虚拟停靠点',x:18,z:-494},
  {id:'taihe-court',name:'太和殿前开阔区',x:35,z:-155},
  {id:'qianqing-square',name:'乾清门前开阔区',x:25,z:245},
]);
const finite=p=>p&&[p.x,p.y,p.z].every(Number.isFinite);
const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
export class FlightState {
  constructor(envelope,{home=HELICOPTER_HOME,rules=FLIGHT_RULES}={}) {
    this.envelope=envelope;this.rules={...rules};this.home={...home};
    if(!finite(home)||!envelope.safeGround(home.x,home.z,rules.radius))throw Error('Helicopter home does not have verified virtual clearance');
    this.position={...home};this.yaw=0;this.occupied=false;this.mode='parked';this.path=[];
    this.lastUnoccupiedAt=null;this.speed=0;this.rpm=0;this.blocked=false;this.status='午门外待登机';
  }
  get grounded(){return this.position.y<=.015&&this.envelope.safeGround(this.position.x,this.position.z,this.rules.radius);}
  board(){if(this.occupied||!this.grounded)return false;this.occupied=true;this.mode='manual';this.lastUnoccupiedAt=null;this.status='自由驾驶：升高后前进';return true;}
  exit(now){if(!this.occupied||!this.grounded||this.speed>.1)return false;this.occupied=false;this.mode='parked';this.path=[];this.lastUnoccupiedAt=now;this.status='无人停靠，5分钟后回午门';return true;}
  takeOver(){if(!this.occupied)return false;this.path=[];this.mode='manual';this.status='已接管自由驾驶';return true;}
  hover(){if(!this.occupied)return false;this.takeOver();this.status='悬停，使用方向和升降继续飞行';return true;}
  startTour(){
    if(!this.occupied)return false;
    const y=Math.max(this.rules.cruiseAltitude,this.position.y);
    this.path=[{x:this.position.x,z:this.position.z,y,name:'升至巡航高度'},...TOUR_ROUTE.map(p=>({...p,y})),{...this.home,name:'返回午门降落'}];
    this.mode='auto';this.status='自动观光，方向/升降输入随时接管';return true;
  }
  landAt(point){
    if(!this.occupied||!point||!this.envelope.safeGround(point.x,point.z,this.rules.radius))return false;
    const y=Math.max(this.rules.cruiseAltitude,this.position.y);
    this.path=[{x:this.position.x,z:this.position.z,y,name:'安全抬升'}, {x:point.x,z:point.z,y,name:'飞往停靠点'}, {x:point.x,z:point.z,y:0,name:'垂直降落'}];
    this.mode='auto';this.status='前往虚拟停靠点，可随时手动接管';return true;
  }
  update(dt,now,input={},canRecycle=true) {
    if(!Number.isFinite(dt)||dt<0||!Number.isFinite(now))throw Error('Invalid flight clock');
    dt=Math.min(dt,.1);this.blocked=false;this.speed=0;
    if(!this.occupied){
      this.rpm=Math.max(0,this.rpm-dt*.5);
      if(this.lastUnoccupiedAt!==null&&now-this.lastUnoccupiedAt>=this.rules.idleMs&&canRecycle){
        this.position={...this.home};this.yaw=0;this.lastUnoccupiedAt=null;this.mode='parked';this.status='已回午门外';return 'recycled';
      }
      return null;
    }
    this.rpm=Math.min(1,this.rpm+dt*.7);
    const axis=k=>Math.max(-1,Math.min(1,Number.isFinite(input[k])?input[k]:0));
    let forward=axis('forward'),right=axis('right'),vertical=axis('vertical'),yaw=axis('yaw');
    if(forward||right||vertical||yaw){if(this.mode==='auto')this.takeOver();}
    let next={...this.position},completedAuto=false;
    if(this.mode==='auto'&&this.path.length){
      const p=this.path[0],dx=p.x-next.x,dz=p.z-next.z,dy=p.y-next.y,h=Math.hypot(dx,dz);
      const d=Math.min(h,this.rules.speed*dt),v=Math.sign(dy)*Math.min(Math.abs(dy),this.rules.verticalSpeed*dt);
      if(h>1e-6){next.x+=dx/h*d;next.z+=dz/h*d;const desired=Math.atan2(dx,dz),delta=wrap(desired-this.yaw);this.yaw+=Math.sign(delta)*Math.min(Math.abs(delta),this.rules.yawSpeed*dt);}
      next.y+=v;
      this.status=`自动观光 · ${p.name}`;
      if(Math.hypot(next.x-p.x,next.y-p.y,next.z-p.z)<.015)this.path.shift();
      if(!this.path.length){this.mode='manual';completedAuto=true;}
    } else {
      this.yaw=wrap(this.yaw+yaw*this.rules.yawSpeed*dt);
      const n=Math.hypot(forward,right);if(n>1){forward/=n;right/=n;}
      // Skids do not slide through the ground. Raise at least half a metre first.
      if(this.position.y<.5){forward=0;right=0;}
      const speed=this.rules.speed;
      next.x+=(Math.sin(this.yaw)*forward-Math.cos(this.yaw)*right)*speed*dt;
      next.z+=(Math.cos(this.yaw)*forward+Math.sin(this.yaw)*right)*speed*dt;
      next.y=Math.max(0,Math.min(this.rules.maximumAltitude,next.y+vertical*this.rules.verticalSpeed*dt));
    }
    const move=this.envelope.move(this.position,next,this.rules.radius,this.rules.maximumAltitude);
    this.speed=dt?Math.hypot(move.position.x-this.position.x,move.position.y-this.position.y,move.position.z-this.position.z)/dt:0;
    this.position=move.position;this.blocked=move.blocked;
    if(completedAuto&&!move.blocked)this.status=this.grounded?'已降落，可下机':'航程完成，悬停';
    if(move.blocked){this.path=[];this.mode='manual';this.status='净空不足，已停止；请升高或转向';}
    return null;
  }
}
